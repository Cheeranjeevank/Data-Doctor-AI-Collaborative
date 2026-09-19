from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from ..database.config import get_db
from ..database.models import Anomaly, Dataset

router = APIRouter(prefix="/api/anomalies", tags=["Anomalies"])


@router.get("/")
def list_all_anomalies(db: Session = Depends(get_db)):
    """List all detected anomalies across all datasets."""
    anomalies = db.query(Anomaly).order_by(Anomaly.detected_at.desc()).all()
    result = []
    for a in anomalies:
        dataset = db.query(Dataset).filter(Dataset.id == a.dataset_id).first()
        result.append({
            "id": a.id,
            "dataset_id": a.dataset_id,
            "dataset_name": dataset.name if dataset else "Unknown",
            "column_name": a.column_name,
            "anomaly_type": a.anomaly_type,
            "severity": a.severity,
            "status": a.status,
            "description": a.description,
            "detected_at": a.detected_at.isoformat() if a.detected_at else None,
        })
    return result


@router.get("/{dataset_id}")
def list_anomalies_for_dataset(dataset_id: int, db: Session = Depends(get_db)):
    """List anomalies for a specific dataset."""
    anomalies = db.query(Anomaly).filter(Anomaly.dataset_id == dataset_id).all()
    return anomalies


@router.patch("/{anomaly_id}/resolve")
def resolve_anomaly(anomaly_id: int, db: Session = Depends(get_db)):
    """Mark an anomaly as resolved."""
    anomaly = db.query(Anomaly).filter(Anomaly.id == anomaly_id).first()
    if not anomaly:
        raise HTTPException(status_code=404, detail="Anomaly not found.")
    anomaly.status = "RESOLVED"
    db.commit()
    return {"message": "Anomaly resolved successfully.", "id": anomaly_id}
