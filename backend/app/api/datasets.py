from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
import os
import shutil
import pandas as pd
from datetime import datetime

from ..database.config import get_db
from ..database.models import Dataset
from ..engines.profiling.profiler import run_profiling
from ..engines.anomaly.detector import run_anomaly_detection

router = APIRouter(prefix="/api/datasets", tags=["Datasets"])

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./data/raw")
os.makedirs(UPLOAD_DIR, exist_ok=True)


def analyze_dataset_background(dataset_id: int, db_session_factory):
    """Run profiling + anomaly detection in the background after upload."""
    db = db_session_factory()
    try:
        run_profiling(dataset_id, db)
        run_anomaly_detection(dataset_id, db)
    except Exception as e:
        print(f"[DataDoctor] Background analysis failed for dataset {dataset_id}: {e}")
    finally:
        db.close()


@router.post("/upload")
async def upload_dataset(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    if not file.filename.endswith(('.csv', '.json', '.xlsx')):
        raise HTTPException(status_code=400, detail="Only CSV, JSON, and Excel files are supported.")

    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        if file.filename.endswith('.csv'):
            df = pd.read_csv(file_path)
        elif file.filename.endswith('.json'):
            df = pd.read_json(file_path)
        else:
            df = pd.read_excel(file_path)

        row_count = len(df)
        column_count = len(df.columns)

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse file: {str(e)}")

    db_dataset = Dataset(
        name=file.filename,
        filename=file.filename,
        row_count=row_count,
        column_count=column_count
    )
    db.add(db_dataset)
    db.commit()
    db.refresh(db_dataset)

    # Schedule profiling + anomaly detection in background
    from ..database.config import SessionLocal
    background_tasks.add_task(analyze_dataset_background, db_dataset.id, SessionLocal)

    return {
        "message": "Upload successful. DataDoctor is now profiling and scanning for anomalies in the background.",
        "dataset_id": db_dataset.id,
        "rows": row_count,
        "columns": column_count
    }


@router.get("/")
def list_datasets(db: Session = Depends(get_db)):
    datasets = db.query(Dataset).order_by(Dataset.uploaded_at.desc()).all()
    result = []
    for d in datasets:
        result.append({
            "id": d.id,
            "name": d.name,
            "filename": d.filename,
            "row_count": d.row_count,
            "column_count": d.column_count,
            "status": d.status,
            "uploaded_at": d.uploaded_at.isoformat() if d.uploaded_at else None,
        })
    return result


@router.get("/{dataset_id}")
def get_dataset(dataset_id: int, db: Session = Depends(get_db)):
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found.")
    return {
        "id": dataset.id,
        "name": dataset.name,
        "row_count": dataset.row_count,
        "column_count": dataset.column_count,
        "status": dataset.status,
        "uploaded_at": dataset.uploaded_at.isoformat() if dataset.uploaded_at else None,
    }
