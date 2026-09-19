"""
DataDoctor Anomaly Detection Engine
Uses Z-Score, IQR, and Missing Value analysis to detect data anomalies.
"""
import pandas as pd
import numpy as np
from sqlalchemy.orm import Session
from ...database.models import Anomaly, Dataset, DataProfile
import os


UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./data/raw")
MISSING_THRESHOLD = 20.0    # % missing above this → anomaly
ZSCORE_THRESHOLD = 3.0      # Z-score above this → outlier
OUTLIER_RATE_THRESHOLD = 0.05  # >5% outlier rows → anomaly


def _load_df(filename: str) -> pd.DataFrame:
    path = os.path.join(UPLOAD_DIR, filename)
    if filename.endswith(".csv"):
        return pd.read_csv(path)
    elif filename.endswith(".json"):
        return pd.read_json(path)
    elif filename.endswith(".xlsx"):
        return pd.read_excel(path)
    raise ValueError(f"Unsupported file type: {filename}")


def _severity(score: float) -> str:
    if score >= 0.8:
        return "HIGH"
    if score >= 0.5:
        return "MEDIUM"
    return "LOW"


def run_anomaly_detection(dataset_id: int, db: Session) -> list:
    """
    Run all anomaly detectors on an uploaded dataset.
    Returns the list of Anomaly ORM objects created.
    """
    dataset: Dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise ValueError(f"Dataset {dataset_id} not found.")

    df = _load_df(dataset.filename)
    profiles = db.query(DataProfile).filter(DataProfile.dataset_id == dataset_id).all()

    # Clear existing anomalies for re-runs
    db.query(Anomaly).filter(Anomaly.dataset_id == dataset_id).delete()

    detected = []

    for profile in profiles:
        col = profile.column_name
        series = df[col]

        # ── 1. Missing Value Anomaly ──────────────────────────────────────────
        if profile.missing_percentage and profile.missing_percentage > MISSING_THRESHOLD:
            severity_score = min(profile.missing_percentage / 100, 1.0)
            anomaly = Anomaly(
                dataset_id=dataset_id,
                column_name=col,
                anomaly_type="MISSING_DATA",
                severity=_severity(severity_score),
                description=(
                    f"Column '{col}' has {profile.missing_percentage:.1f}% missing values "
                    f"({profile.missing_count} of {dataset.row_count} rows). "
                    f"Threshold is {MISSING_THRESHOLD}%."
                ),
            )
            db.add(anomaly)
            detected.append(anomaly)

        # ── 2. Z-Score Outlier Detection (numeric only) ───────────────────────
        if pd.api.types.is_numeric_dtype(series):
            numeric = series.dropna()
            if len(numeric) > 10:
                mean, std = numeric.mean(), numeric.std()
                if std > 0:
                    z_scores = np.abs((numeric - mean) / std)
                    outlier_rate = (z_scores > ZSCORE_THRESHOLD).sum() / len(numeric)
                    if outlier_rate > OUTLIER_RATE_THRESHOLD:
                        anomaly = Anomaly(
                            dataset_id=dataset_id,
                            column_name=col,
                            anomaly_type="OUTLIER",
                            severity=_severity(outlier_rate),
                            description=(
                                f"Column '{col}' has {outlier_rate * 100:.1f}% of values "
                                f"with Z-score > {ZSCORE_THRESHOLD} (mean={mean:.2f}, std={std:.2f}). "
                                f"Likely contains outliers or data entry errors."
                            ),
                        )
                        db.add(anomaly)
                        detected.append(anomaly)

                # ── 3. IQR Fence Detection ────────────────────────────────────
                q1, q3 = numeric.quantile(0.25), numeric.quantile(0.75)
                iqr = q3 - q1
                if iqr > 0:
                    lower, upper = q1 - 1.5 * iqr, q3 + 1.5 * iqr
                    iqr_outlier_rate = ((numeric < lower) | (numeric > upper)).sum() / len(numeric)
                    if iqr_outlier_rate > OUTLIER_RATE_THRESHOLD:
                        anomaly = Anomaly(
                            dataset_id=dataset_id,
                            column_name=col,
                            anomaly_type="IQR_OUTLIER",
                            severity=_severity(iqr_outlier_rate),
                            description=(
                                f"Column '{col}' has {iqr_outlier_rate * 100:.1f}% of values "
                                f"outside IQR fence [{lower:.2f}, {upper:.2f}]. "
                                f"Consider investigating extreme values."
                            ),
                        )
                        db.add(anomaly)
                        detected.append(anomaly)

    dataset.status = "DIAGNOSED"
    db.commit()
    return detected
