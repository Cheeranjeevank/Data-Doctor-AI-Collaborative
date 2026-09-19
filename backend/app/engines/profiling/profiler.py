"""
DataDoctor Profiling Engine
Generates per-column statistical profiles from uploaded datasets.
"""
import pandas as pd
from sqlalchemy.orm import Session
from ...database.models import DataProfile, Dataset
import os


UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./data/raw")


def load_dataframe(filename: str) -> pd.DataFrame:
    """Load a dataset file into a Pandas DataFrame."""
    path = os.path.join(UPLOAD_DIR, filename)
    if filename.endswith(".csv"):
        return pd.read_csv(path)
    elif filename.endswith(".json"):
        return pd.read_json(path)
    elif filename.endswith(".xlsx"):
        return pd.read_excel(path)
    raise ValueError(f"Unsupported file type: {filename}")


def run_profiling(dataset_id: int, db: Session) -> None:
    """
    Run the full profiling pipeline on a dataset.
    Computes per-column statistics and saves them to data_profiles table.
    """
    dataset: Dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise ValueError(f"Dataset {dataset_id} not found.")

    df = load_dataframe(dataset.filename)

    # Delete old profiles for this dataset (for re-runs)
    db.query(DataProfile).filter(DataProfile.dataset_id == dataset_id).delete()

    for col in df.columns:
        series = df[col]
        dtype = str(series.dtype)
        missing_count = int(series.isna().sum())
        missing_pct = round((missing_count / len(df)) * 100, 2) if len(df) > 0 else 0.0
        unique_count = int(series.nunique())

        mean_val = median_val = min_val = max_val = None
        if pd.api.types.is_numeric_dtype(series):
            numeric = series.dropna()
            if len(numeric) > 0:
                mean_val = float(numeric.mean())
                median_val = float(numeric.median())
                min_val = float(numeric.min())
                max_val = float(numeric.max())

        profile = DataProfile(
            dataset_id=dataset_id,
            column_name=col,
            data_type=dtype,
            missing_count=missing_count,
            missing_percentage=missing_pct,
            unique_count=unique_count,
            mean_val=mean_val,
            median_val=median_val,
            min_val=min_val,
            max_val=max_val,
        )
        db.add(profile)

    dataset.status = "PROFILED"
    db.commit()
