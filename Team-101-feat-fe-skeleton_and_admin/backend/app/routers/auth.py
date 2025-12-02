import base64
import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models
from app.schemas import ParticipantCreate, ParticipantLogin, AuthResponse, ParticipantOut
from app.security import new_qr_uid

router = APIRouter(prefix="/auth", tags=["auth"])

def encode_face_from_base64(face_image_b64: str) -> str:
    """Convert base64 image to face encoding. In production, use face_recognition library."""
    try:
        # Decode base64 image - remove data URL prefix if present
        if ',' in face_image_b64:
            image_data = base64.b64decode(face_image_b64.split(',')[1])
        else:
            image_data = base64.b64decode(face_image_b64)
        
        # For demo: create a consistent hash-based encoding
        # In production: use face_recognition.face_encodings()
        import hashlib
        face_hash = hashlib.sha256(image_data).hexdigest()
        
        # Return as JSON string for storage
        return json.dumps({"encoding": face_hash, "method": "demo", "size": len(image_data)})
    except Exception as e:
        raise HTTPException(400, f"Invalid face image: {str(e)}")

def compare_face_encodings(encoding1: str, encoding2: str) -> bool:
    """Compare two face encodings. In production, use face_recognition.compare_faces()."""
    try:
        enc1 = json.loads(encoding1)
        enc2 = json.loads(encoding2)
        
        # Compare the hash encodings
        hash1 = enc1.get("encoding")
        hash2 = enc2.get("encoding")
        
        if hash1 == hash2:
            return True
            
        # For demo: also check if images are similar size (within 10%)
        size1 = enc1.get("size", 0)
        size2 = enc2.get("size", 0)
        if size1 and size2:
            size_diff = abs(size1 - size2) / max(size1, size2)
            # If exact hash match failed but sizes are very close, might be same image with slight compression
            if size_diff < 0.1 and hash1[:32] == hash2[:32]:  # First half of hash matches
                return True
                
        return False
    except Exception as e:
        print(f"Encoding comparison error: {e}")
        return False

@router.post("/register", response_model=AuthResponse)
def register_participant(payload: ParticipantCreate, db: Session = Depends(get_db)):
    """Admin registers a new participant with face ID"""
    
    # Verify organization exists
    org = db.get(models.Organization, payload.org_id)
    if not org:
        raise HTTPException(404, "Organization not found")
    
    # Generate unique QR UID
    uid = new_qr_uid()
    while db.query(models.Participant).filter_by(qr_uid=uid).first():
        uid = new_qr_uid()
    
    # Process face encoding if provided
    face_encoding = None
    if payload.face_image:
        face_encoding = encode_face_from_base64(payload.face_image)
    
    # Create participant
    participant = models.Participant(
        org_id=payload.org_id,
        display_name=payload.display_name,
        phone=payload.phone,
        email=payload.email,
        preferred_contact=payload.preferred_contact,
        qr_uid=uid,
        qr_active=True,
        face_encoding=face_encoding,
        created_by_admin=None,
    )
    
    db.add(participant)
    db.commit()
    db.refresh(participant)
    
    return AuthResponse(
        success=True,
        participant=ParticipantOut.model_validate(participant),
        message="Participant registered successfully"
    )

@router.post("/login", response_model=AuthResponse)
def login_participant(payload: ParticipantLogin, db: Session = Depends(get_db)):
    """Login participant using QR code or face ID"""
    
    participant = None
    
    # Try QR login first
    if payload.qr_uid:
        participant = db.query(models.Participant).filter_by(
            qr_uid=payload.qr_uid, 
            qr_active=True
        ).first()
        
        if participant:
            return AuthResponse(
                success=True,
                participant=ParticipantOut.model_validate(participant),
                message="Login successful via QR code"
            )
    
    # Try face ID login
    if payload.face_image:
        try:
            login_encoding = encode_face_from_base64(payload.face_image)
            
            # Find matching participant by face encoding
            participants = db.query(models.Participant).filter(
                models.Participant.face_encoding.isnot(None)
            ).all()
            
            for p in participants:
                if compare_face_encodings(p.face_encoding, login_encoding):
                    return AuthResponse(
                        success=True,
                        participant=ParticipantOut.model_validate(p),
                        message="Login successful via Face ID"
                    )
                    
        except Exception as e:
            return AuthResponse(
                success=False,
                message=f"Face recognition failed: {str(e)}"
            )
    
    return AuthResponse(
        success=False,
        message="Authentication failed. Invalid QR code or face not recognized."
    )

@router.get("/participant/{participant_id}/qr")
def get_participant_qr(participant_id: int, db: Session = Depends(get_db)):
    """Get QR code info for a participant"""
    participant = db.get(models.Participant, participant_id)
    if not participant:
        raise HTTPException(404, "Participant not found")
    
    return {
        "participant_id": participant.id,
        "qr_uid": participant.qr_uid,
        "qr_active": participant.qr_active,
        "display_name": participant.display_name
    }