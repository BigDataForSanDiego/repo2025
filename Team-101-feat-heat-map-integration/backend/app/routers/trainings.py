from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.database import get_db
from app import models
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/trainings", tags=["trainings"])

class TrainingRegister(BaseModel):
    participant_id: int
    training_session_id: int

@router.get("/sessions")
def get_all_training_sessions(db: Session = Depends(get_db)):
    """Get all training sessions"""
    sessions = db.query(models.TrainingSession).all()
    return sessions

class TrainingSessionCreate(BaseModel):
    title: str
    description: str | None = None
    location: str | None = None
    training_date: str

@router.post("/sessions")
def create_training_session(payload: TrainingSessionCreate, db: Session = Depends(get_db)):
    """Create a new training session"""
    session = models.TrainingSession(
        title=payload.title,
        description=payload.description,
        location=payload.location,
        training_date=payload.training_date,
        created_by_admin=None
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

@router.get("/sessions/available/{participant_id}")
def get_available_sessions(participant_id: int, db: Session = Depends(get_db)):
    """Get training sessions that participant hasn't registered for yet"""
    # Get all upcoming sessions
    all_sessions = db.query(models.TrainingSession).filter(
        models.TrainingSession.training_date > datetime.now()
    ).all()
    
    # Get sessions participant is already registered for
    registered_session_ids = db.query(models.TrainingRegistration.training_session_id).filter(
        models.TrainingRegistration.participant_id == participant_id
    ).all()
    registered_ids = [r[0] for r in registered_session_ids]
    
    # Filter out registered sessions
    available = [s for s in all_sessions if s.id not in registered_ids]
    return available

@router.get("/participant/{participant_id}")
def get_participant_trainings(participant_id: int, db: Session = Depends(get_db)):
    """Get all registered trainings for a participant with session details"""
    registrations = db.query(
        models.TrainingRegistration,
        models.TrainingSession
    ).join(
        models.TrainingSession,
        models.TrainingRegistration.training_session_id == models.TrainingSession.id
    ).filter(
        models.TrainingRegistration.participant_id == participant_id
    ).all()
    
    result = []
    for reg, session in registrations:
        result.append({
            "id": reg.id,
            "training_session_id": session.id,
            "title": session.title,
            "description": session.description,
            "location": session.location,
            "training_date": session.training_date,
            "status": reg.status,
            "registered_at": reg.registered_at
        })
    return result

@router.post("/register")
def register_for_training(payload: TrainingRegister, db: Session = Depends(get_db)):
    """Register participant for a training session"""
    # Check if already registered
    existing = db.query(models.TrainingRegistration).filter(
        and_(
            models.TrainingRegistration.participant_id == payload.participant_id,
            models.TrainingRegistration.training_session_id == payload.training_session_id
        )
    ).first()
    
    if existing:
        raise HTTPException(400, "Already registered for this training")
    
    registration = models.TrainingRegistration(
        participant_id=payload.participant_id,
        training_session_id=payload.training_session_id,
        status="REGISTERED"
    )
    db.add(registration)
    db.commit()
    db.refresh(registration)
    return {"success": True, "registration_id": registration.id}