from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db
from pydantic import BaseModel

router = APIRouter(prefix="/reviews", tags=["reviews"])

class ReviewCreate(BaseModel):
    participant_id: int
    employer_id: int
    rating: int
    review_text: str

@router.get("/participant/{participant_id}")
def get_participant_reviews(participant_id: int, db: Session = Depends(get_db)):
    """Get all reviews for a participant"""
    query = text("""
        SELECT r.id, r.participant_id, r.employer_id, r.rating, r.review_text, r.created_at,
               e.company_name as employer_name
        FROM reviews r
        LEFT JOIN employers e ON r.employer_id = e.id
        WHERE r.participant_id = :participant_id
        ORDER BY r.created_at DESC
    """)
    result = db.execute(query, {"participant_id": participant_id})
    reviews = [dict(row._mapping) for row in result]
    return reviews

@router.post("")
def create_review(payload: ReviewCreate, db: Session = Depends(get_db)):
    """Create a new review"""
    if payload.rating < 1 or payload.rating > 5:
        raise HTTPException(400, "Rating must be between 1 and 5")
    
    query = text("""
        INSERT INTO reviews (participant_id, employer_id, rating, review_text)
        VALUES (:participant_id, :employer_id, :rating, :review_text)
    """)
    db.execute(query, {
        "participant_id": payload.participant_id,
        "employer_id": payload.employer_id,
        "rating": payload.rating,
        "review_text": payload.review_text
    })
    db.commit()
    
    return {"success": True, "message": "Review created successfully"}
