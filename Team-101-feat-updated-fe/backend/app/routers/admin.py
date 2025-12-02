from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models
from app.schemas import OrganizationCreate, OrganizationOut, ParticipantCreate, ParticipantOut
from app.security import new_qr_uid
from pydantic import BaseModel
import hashlib

router = APIRouter(prefix="/admin", tags=["admin"])

class AdminUserCreate(BaseModel):
    org_id: int
    email: str
    phone: str | None = None
    password: str
    role: str = "STAFF"

@router.post("/orgs", response_model=OrganizationOut)
def create_org(payload: OrganizationCreate, db: Session = Depends(get_db)):
    org = models.Organization(
        name=payload.name,
        contact_phone=payload.contact_phone,
        contact_email=payload.contact_email,
    )
    db.add(org)
    db.commit()
    db.refresh(org)
    return org

@router.post("/participants", response_model=ParticipantOut)
def create_participant(payload: ParticipantCreate, db: Session = Depends(get_db)):
    org = db.get(models.Organization, payload.org_id)
    if not org:
        raise HTTPException(404, "Organization not found")

    uid = new_qr_uid()
    while db.query(models.Participant).filter_by(qr_uid=uid).first():
        uid = new_qr_uid()

    p = models.Participant(
        org_id=payload.org_id,
        display_name=payload.display_name,
        phone=payload.phone,
        email=payload.email,
        preferred_contact=payload.preferred_contact,
        qr_uid=uid,
        qr_active=True,
        created_by_admin=None,
    )
    db.add(p)
    db.commit()
    db.refresh(p)
    return p

@router.get("/participants/{participant_id}/qr")
def get_participant_qr(participant_id: int, db: Session = Depends(get_db)):
    p = db.get(models.Participant, participant_id)
    if not p:
        raise HTTPException(404, "Participant not found")
    return {
        "participant_id": p.id,
        "qr_uid": p.qr_uid,
        "qr_active": p.qr_active,
        "deep_link": f"/api/v1/lookup/qr/{p.qr_uid}",
    }

@router.post("/users")
def create_admin_user(payload: AdminUserCreate, db: Session = Depends(get_db)):
    # Check if org exists
    org = db.get(models.Organization, payload.org_id)
    if not org:
        raise HTTPException(404, "Organization not found")
    
    # Check if email already exists
    existing = db.query(models.AdminUser).filter_by(email=payload.email).first()
    if existing:
        raise HTTPException(400, "Email already exists")
    
    # Hash password (simple hash for demo)
    password_hash = hashlib.sha256(payload.password.encode()).hexdigest()
    
    admin_user = models.AdminUser(
        org_id=payload.org_id,
        email=payload.email,
        phone=payload.phone,
        password_hash=password_hash,
        role=payload.role
    )
    db.add(admin_user)
    db.commit()
    db.refresh(admin_user)
    
    return {
        "id": admin_user.id,
        "org_id": admin_user.org_id,
        "email": admin_user.email,
        "phone": admin_user.phone,
        "role": admin_user.role,
        "is_active": admin_user.is_active
    }
