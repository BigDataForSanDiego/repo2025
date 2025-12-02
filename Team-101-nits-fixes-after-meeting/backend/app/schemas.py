from pydantic import BaseModel, EmailStr, Field, field_serializer
from typing import Optional
from datetime import datetime

# ------- Organization (optional for now) -------
class OrganizationCreate(BaseModel):
    name: str
    contact_phone: Optional[str] = None
    contact_email: Optional[EmailStr] = None

class OrganizationOut(BaseModel):
    id: int
    name: str
    contact_phone: Optional[str]
    contact_email: Optional[str]
    class Config:
        from_attributes = True

# ------- Admin users (we’ll wire signup later) -------
class AdminUserCreate(BaseModel):
    org_id: int
    email: EmailStr
    phone: Optional[str] = None
    password: str = Field(min_length=8)
    role: str = "STAFF"

class AdminUserOut(BaseModel):
    id: int
    org_id: int
    email: EmailStr
    phone: Optional[str]
    role: str
    is_active: bool
    class Config:
        from_attributes = True

# ------- Participants (admin creates) -------
class ParticipantCreate(BaseModel):
    org_id: int
    display_name: str
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    preferred_contact: str = "NONE"
    face_image: Optional[str] = None  # base64 encoded image

class ParticipantLogin(BaseModel):
    qr_uid: Optional[str] = None
    face_image: Optional[str] = None  # base64 encoded image

class ParticipantOut(BaseModel):
    id: int
    org_id: int
    display_name: str
    phone: Optional[str]
    email: Optional[str]
    preferred_contact: str
    qr_uid: str
    qr_active: bool
    created_by_admin: Optional[int] = None
    class Config:
        from_attributes = True

# ------- Lookup response (public) -------
class ParticipantPublic(BaseModel):
    display_name: str
    preferred_contact: str
    org_id: int

class AuthResponse(BaseModel):
    success: bool
    participant: Optional[ParticipantOut] = None
    message: str

# ------- Documents -------
class DocumentUpload(BaseModel):
    participant_id: int
    document_type: str
    document_name: str

class DocumentOut(BaseModel):
    id: int
    participant_id: int
    document_type: str
    document_name: str
    file_size: int
    mime_type: str
    created_at: datetime
    
    class Config:
        from_attributes = True
