from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.database import get_db
from app import models
from app.schemas import ParticipantPublic

router = APIRouter(prefix="/lookup", tags=["lookup"])

@router.get("/qr/{qr_uid}", response_model=ParticipantPublic)
def qr_lookup(qr_uid: str, db: Session = Depends(get_db)):
    stmt = select(models.Participant).where(models.Participant.qr_uid == qr_uid)
    p = db.execute(stmt).scalar_one_or_none()
    if not p or not p.qr_active:
        raise HTTPException(status_code=404, detail="QR not found or disabled")

    # write audit row; employer_id unknown here (anonymous)—we can fill it when we add auth
    db.add(models.ProfileView(participant_id=p.id, employer_id=None, via_qr_uid=qr_uid))
    db.commit()

    return ParticipantPublic(
        display_name=p.display_name,
        preferred_contact=p.preferred_contact,
        org_id=p.org_id,
    )
