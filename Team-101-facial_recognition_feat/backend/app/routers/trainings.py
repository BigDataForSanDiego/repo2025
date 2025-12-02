from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import models
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/trainings", tags=["trainings"])

class TrainingCreate(BaseModel):
    participant_id: int
    title: str
    description: str | None = None
    location: str | None = None
    training_date: str
    status: str = "REGISTERED"

@router.get("/participant/{participant_id}")
def get_participant_trainings(participant_id: int, db: Session = Depends(get_db)):
    """Get all trainings for a participant"""
    trainings = db.query(models.Training).filter_by(participant_id=participant_id).all()
    return trainings

@router.get("/")
def get_all_trainings(db: Session = Depends(get_db)):
    """Get all available trainings"""
    trainings = db.query(models.Training).all()
    return trainings

@router.post("/")
def create_training(payload: TrainingCreate, db: Session = Depends(get_db)):
    """Create a new training"""
    training = models.Training(
        participant_id=payload.participant_id,
        title=payload.title,
        description=payload.description,
        location=payload.location,
        training_date=payload.training_date,
        status=payload.status
    )
    db.add(training)
    db.commit()
    db.refresh(training)
    return training