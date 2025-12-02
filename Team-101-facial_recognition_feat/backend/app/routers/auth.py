from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models
from app.schemas import ParticipantCreate, ParticipantLogin, AuthResponse, ParticipantOut
from app.security import new_qr_uid
from app.face_recognition import encode_face, verify_face

router = APIRouter(prefix="/auth", tags=["auth"])

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
        try:
            face_encoding = encode_face(payload.face_image)
        except Exception as e:
            raise HTTPException(400, f"Face encoding failed: {str(e)}")
    
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
            # Find matching participant by face encoding
            participants = db.query(models.Participant).filter(
                models.Participant.face_encoding.isnot(None)
            ).all()
            
            print(f"Found {len(participants)} participants with face encodings")
            
            if not participants:
                return AuthResponse(
                    success=False,
                    message="No registered faces found. Please register first."
                )
            
            for p in participants:
                print(f"Checking participant {p.id}: {p.display_name}")
                try:
                    verified, distance = verify_face(payload.face_image, p.face_encoding)
                    print(f"  Distance: {distance:.4f}, Verified: {verified}")
                    if verified:
                        return AuthResponse(
                            success=True,
                            participant=ParticipantOut.model_validate(p),
                            message=f"Login successful via Face ID"
                        )
                except Exception as face_err:
                    print(f"  Error verifying face: {face_err}")
                    continue
                    
        except Exception as e:
            print(f"Face login error: {e}")
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