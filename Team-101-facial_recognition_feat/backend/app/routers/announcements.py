from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import or_
from datetime import datetime
from app.database import get_db
from app import models
from pydantic import BaseModel

router = APIRouter(prefix="/announcements", tags=["announcements"])

class AnnouncementCreate(BaseModel):
    title: str
    content: str
    expiry_date: str | None = None

@router.get("/")
def get_active_announcements(db: Session = Depends(get_db)):
    """Get all active announcements (not expired)"""
    now = datetime.now()
    announcements = db.query(models.Announcement).filter(
        or_(
            models.Announcement.expiry_date.is_(None),
            models.Announcement.expiry_date > now
        )
    ).order_by(models.Announcement.created_at.desc()).all()
    return announcements

@router.get("/all")
def get_all_announcements(db: Session = Depends(get_db)):
    """Get all announcements including expired ones"""
    announcements = db.query(models.Announcement).order_by(models.Announcement.created_at.desc()).all()
    return announcements

@router.post("/")
def create_announcement(payload: AnnouncementCreate, db: Session = Depends(get_db)):
    """Create a new announcement"""
    announcement = models.Announcement(
        title=payload.title,
        content=payload.content,
        expiry_date=payload.expiry_date
    )
    db.add(announcement)
    db.commit()
    db.refresh(announcement)
    return announcement