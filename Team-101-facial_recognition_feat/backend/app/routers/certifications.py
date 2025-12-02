from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import models
from pydantic import BaseModel

router = APIRouter(prefix="/certifications", tags=["certifications"])

class CertificationCreate(BaseModel):
    participant_id: int
    title: str
    issuer: str
    description: str | None = None
    issue_date: str

@router.get("/participant/{participant_id}")
def get_participant_certifications(participant_id: int, db: Session = Depends(get_db)):
    """Get all certifications for a participant"""
    certifications = db.query(models.Certification).filter_by(participant_id=participant_id).all()
    return certifications

@router.get("/")
def get_all_certifications(db: Session = Depends(get_db)):
    """Get all certifications"""
    certifications = db.query(models.Certification).all()
    return certifications

@router.post("/")
def create_certification(payload: CertificationCreate, db: Session = Depends(get_db)):
    """Create a new certification"""
    certification = models.Certification(
        participant_id=payload.participant_id,
        title=payload.title,
        issuer=payload.issuer,
        description=payload.description,
        issue_date=payload.issue_date
    )
    db.add(certification)
    db.commit()
    db.refresh(certification)
    return certification