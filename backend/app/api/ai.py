from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel

from ..database.config import get_db
from ..database.models import Anomaly, Dataset
from ..engines.ai.datadoctor_agent import ask_datadoctor

router = APIRouter(prefix="/api/ai", tags=["AI"])


class ChatRequest(BaseModel):
    dataset_id: int
    question: str


class ChatResponse(BaseModel):
    answer: str
    dataset_name: str


@router.post("/chat", response_model=ChatResponse)
def chat_with_datadoctor(request: ChatRequest, db: Session = Depends(get_db)):
    """
    Ask DataDoctor AI a question about a specific dataset.
    The AI reads the dataset, its profile, and answers using Gemini.
    """
    dataset = db.query(Dataset).filter(Dataset.id == request.dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail=f"Dataset {request.dataset_id} not found.")

    if dataset.status == "UPLOADED":
        raise HTTPException(
            status_code=400,
            detail="Dataset has not been profiled yet. Please wait for profiling to complete."
        )

    try:
        answer = ask_datadoctor(
            dataset_id=request.dataset_id,
            question=request.question,
            db=db,
        )
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI engine error: {str(e)}")

    return ChatResponse(answer=answer, dataset_name=dataset.name)
