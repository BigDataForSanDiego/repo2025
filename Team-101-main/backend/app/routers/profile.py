from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models
from pydantic import BaseModel

router = APIRouter(prefix="/profile", tags=["profile"])

class AdminProfileUpdate(BaseModel):
    email: str | None = None
    phone: str | None = None

class EmployerProfileUpdate(BaseModel):
    company_name: str | None = None
    contact_name: str | None = None
    email: str | None = None
    phone: str | None = None

class ParticipantProfileUpdate(BaseModel):
    display_name: str | None = None
    phone: str | None = None
    email: str | None = None
    preferred_contact: str | None = None
    gender: str | None = None
    veteran_status: bool | None = None
    disability: bool | None = None

@router.get("/admin/{admin_id}")
def get_admin_profile(admin_id: int, db: Session = Depends(get_db)):
    admin = db.get(models.AdminUser, admin_id)
    if not admin:
        raise HTTPException(404, "Admin not found")
    return {
        "id": admin.id,
        "email": admin.email,
        "phone": admin.phone,
        "role": admin.role,
        "org_id": admin.org_id
    }

@router.put("/admin/{admin_id}")
def update_admin_profile(admin_id: int, payload: AdminProfileUpdate, db: Session = Depends(get_db)):
    admin = db.get(models.AdminUser, admin_id)
    if not admin:
        raise HTTPException(404, "Admin not found")
    
    if payload.email:
        existing = db.query(models.AdminUser).filter(
            models.AdminUser.email == payload.email,
            models.AdminUser.id != admin_id
        ).first()
        if existing:
            raise HTTPException(400, "Email already in use")
        admin.email = payload.email
    
    if payload.phone is not None:
        admin.phone = payload.phone
    
    db.commit()
    db.refresh(admin)
    return {
        "id": admin.id,
        "email": admin.email,
        "phone": admin.phone,
        "role": admin.role
    }

@router.get("/employer/{employer_id}")
def get_employer_profile(employer_id: int, db: Session = Depends(get_db)):
    employer = db.get(models.Employer, employer_id)
    if not employer:
        raise HTTPException(404, "Employer not found")
    return {
        "id": employer.id,
        "company_name": employer.company_name,
        "contact_name": employer.contact_name,
        "email": employer.email,
        "phone": employer.phone
    }

@router.put("/employer/{employer_id}")
def update_employer_profile(employer_id: int, payload: EmployerProfileUpdate, db: Session = Depends(get_db)):
    employer = db.get(models.Employer, employer_id)
    if not employer:
        raise HTTPException(404, "Employer not found")
    
    if payload.email:
        existing = db.query(models.Employer).filter(
            models.Employer.email == payload.email,
            models.Employer.id != employer_id
        ).first()
        if existing:
            raise HTTPException(400, "Email already in use")
        employer.email = payload.email
    
    if payload.company_name:
        employer.company_name = payload.company_name
    if payload.contact_name is not None:
        employer.contact_name = payload.contact_name
    if payload.phone is not None:
        employer.phone = payload.phone
    
    db.commit()
    db.refresh(employer)
    return {
        "id": employer.id,
        "company_name": employer.company_name,
        "contact_name": employer.contact_name,
        "email": employer.email,
        "phone": employer.phone
    }

@router.get("/participant/{participant_id}")
def get_participant_profile(participant_id: int, db: Session = Depends(get_db)):
    participant = db.get(models.Participant, participant_id)
    if not participant:
        raise HTTPException(404, "Participant not found")
    return participant

@router.put("/participant/{participant_id}")
def update_participant_profile(participant_id: int, payload: ParticipantProfileUpdate, db: Session = Depends(get_db)):
    participant = db.get(models.Participant, participant_id)
    if not participant:
        raise HTTPException(404, "Participant not found")
    
    if payload.display_name:
        participant.display_name = payload.display_name
    if payload.phone is not None:
        participant.phone = payload.phone
    if payload.email is not None:
        participant.email = payload.email
    if payload.preferred_contact:
        participant.preferred_contact = payload.preferred_contact
    if payload.gender:
        participant.gender = payload.gender
    if payload.veteran_status is not None:
        participant.veteran_status = payload.veteran_status
    if payload.disability is not None:
        participant.disability = payload.disability
    
    db.commit()
    db.refresh(participant)
    return participant
