from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
import bcrypt

from app.database import get_db
from app.models import AdminUser
from typing import Optional

router = APIRouter(prefix="/api/v1/admin", tags=["admin"])

# ---------- Schemas ----------

class AdminCreate(BaseModel):
    org_id: int
    email: EmailStr
    phone: str | None = None
    password: str

class AdminLogin(BaseModel):
    email: EmailStr
    password: str

class AdminOut(BaseModel):
    id: int
    org_id: int
    email: EmailStr
    phone: str | None
    role: str
    is_active: bool

    class Config:
        from_attributes = True  # pydantic v2

class AdminUpdateMe(BaseModel):
    email: EmailStr
    phone: str | None = None

class AdminChangePassword(BaseModel):
    email: EmailStr
    old_password: str
    new_password: str

# ---------- Endpoints ----------

@router.post("/admins", response_model=AdminOut, status_code=201)
def create_admin(payload: AdminCreate, db: Session = Depends(get_db)):
    # enforce unique email
    existing = db.query(AdminUser).filter(AdminUser.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already in use")

    pwd_hash = bcrypt.hashpw(payload.password.encode(), bcrypt.gensalt()).decode()

    user = AdminUser(
        org_id=payload.org_id,
        email=payload.email,
        phone=payload.phone,
        password_hash=pwd_hash,
        role="ADMIN",          # keep roles consistent with your role enum
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login")
def admin_login(payload: AdminLogin, db: Session = Depends(get_db)):
    user = db.query(AdminUser).filter(
        AdminUser.email == payload.email,
        AdminUser.is_active == True,     # noqa: E712
    ).first()

    if not user or not bcrypt.checkpw(payload.password.encode(), user.password_hash.encode()):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # DEV token (opaque). Frontend can store this in an httpOnly cookie.
    # Replace with real JWT later if you want.
    token = f"admin-{user.id}-{user.org_id}"
    return {
        "token": token,
        "user": {
            "id": user.id,
            "org_id": user.org_id,
            "email": user.email,
            "role": user.role,
            "is_active": user.is_active,
        },
    }

@router.get("/admins")
def list_admins(
    org_id: Optional[int] = None,
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """Return all admin users (optionally filter by org_id)."""
    q = db.query(AdminUser)
    if org_id is not None:
        q = q.filter(AdminUser.org_id == org_id)
    items = q.order_by(AdminUser.id.desc()).offset(offset).limit(limit).all()
    return {"items": items}


@router.patch("/me")
def update_me(payload: AdminUpdateMe, db: Session = Depends(get_db)):
    """Update admin’s phone or (future) profile info."""
    user = db.query(AdminUser).filter(AdminUser.email == payload.email).first()
    if not user:
        raise HTTPException(404, "Admin not found")

    if payload.phone is not None:
        user.phone = payload.phone
    db.add(user)
    db.commit()
    db.refresh(user)
    return {
        "ok": True,
        "user": {
            "id": user.id,
            "org_id": user.org_id,
            "email": user.email,
            "phone": user.phone,
            "role": user.role,
            "is_active": user.is_active,
        },
    }


@router.post("/change-password")
def change_password(payload: AdminChangePassword, db: Session = Depends(get_db)):
    """Change admin password (requires old password)."""
    user = db.query(AdminUser).filter(
        AdminUser.email == payload.email,
        AdminUser.is_active == True,
    ).first()
    if not user:
        raise HTTPException(404, "Admin not found")

    if not bcrypt.checkpw(payload.old_password.encode(), user.password_hash.encode()):
        raise HTTPException(401, "Old password incorrect")

    new_hash = bcrypt.hashpw(payload.new_password.encode(), bcrypt.gensalt()).decode()
    user.password_hash = new_hash
    db.add(user)
    db.commit()
    return {"ok": True}
