from sqlalchemy import (
    BigInteger,
    Boolean,
    Enum,
    ForeignKey,
    String,
    TIMESTAMP,
    UniqueConstraint,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.database import Base


# -----------------------------
# Organizations (service providers)
# -----------------------------
class Organization(Base):
    __tablename__ = "organizations"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    contact_phone: Mapped[str | None] = mapped_column(String(32))
    contact_email: Mapped[str | None] = mapped_column(String(160))
    created_at: Mapped[str] = mapped_column(
        TIMESTAMP, server_default=func.current_timestamp(), nullable=False, index=True
    )

    # relationships
    admins = relationship("AdminUser", back_populates="org", cascade="all, delete")
    participants = relationship("Participant", back_populates="org", cascade="all, delete")


# -----------------------------
# Admin users (staff accounts)
# -----------------------------
class AdminUser(Base):
    __tablename__ = "admin_users"
    __table_args__ = (
        UniqueConstraint("email", name="uq_admin_users_email"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    org_id: Mapped[int] = mapped_column(
        ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True
    )
    email: Mapped[str] = mapped_column(String(160), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(32))
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(
        Enum("OWNER", "ADMIN", "STAFF", name="role_enum"), default="STAFF", nullable=False
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[str] = mapped_column(
        TIMESTAMP, server_default=func.current_timestamp(), nullable=False, index=True
    )

    org = relationship("Organization", back_populates="admins")


# -----------------------------
# Participants (people being helped)
# -----------------------------
class Participant(Base):
    __tablename__ = "participants"
    __table_args__ = (
        UniqueConstraint("qr_uid", name="uq_participants_qr_uid"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    org_id: Mapped[int] = mapped_column(
        ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True
    )

    display_name: Mapped[str] = mapped_column(String(160), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(32))
    email: Mapped[str | None] = mapped_column(String(160))
    preferred_contact: Mapped[str] = mapped_column(
        Enum("SMS", "EMAIL", "NONE", name="pref_contact_enum"),
        default="NONE",
        nullable=False,
    )

    # QR strategy: store only the stable, unique UID; generate/serve images on demand
    qr_uid: Mapped[str] = mapped_column(String(26), nullable=False, index=True)
    qr_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    
    # Face ID authentication
    face_encoding: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_by_admin: Mapped[int | None] = mapped_column(
        ForeignKey("admin_users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    created_at: Mapped[str] = mapped_column(
        TIMESTAMP, server_default=func.current_timestamp(), nullable=False, index=True
    )

    org = relationship("Organization", back_populates="participants")


# -----------------------------
# Employers (read-only viewers after scanning QR)
# -----------------------------
class Employer(Base):
    __tablename__ = "employers"
    __table_args__ = (
        UniqueConstraint("email", name="uq_employers_email"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    company_name: Mapped[str] = mapped_column(String(160), nullable=False)
    contact_name: Mapped[str | None] = mapped_column(String(160))
    email: Mapped[str] = mapped_column(String(160), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(32))
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[str] = mapped_column(
        TIMESTAMP, server_default=func.current_timestamp(), nullable=False, index=True
    )


# -----------------------------
# Audit log: when an employer (or anonymous) views a profile via QR
# -----------------------------
class ProfileView(Base):
    __tablename__ = "profile_views"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    participant_id: Mapped[int] = mapped_column(
        ForeignKey("participants.id", ondelete="CASCADE"), nullable=False, index=True
    )
    employer_id: Mapped[int | None] = mapped_column(
        ForeignKey("employers.id", ondelete="SET NULL"), nullable=True, index=True
    )
    via_qr_uid: Mapped[str] = mapped_column(String(26), nullable=False)
    created_at: Mapped[str] = mapped_column(
        TIMESTAMP, server_default=func.current_timestamp(), nullable=False, index=True
    )


# -----------------------------
# Documents (participant uploaded documents)
# -----------------------------
class Document(Base):
    __tablename__ = "documents"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    participant_id: Mapped[int] = mapped_column(
        ForeignKey("participants.id", ondelete="CASCADE"), nullable=False, index=True
    )
    document_type: Mapped[str] = mapped_column(
        Enum("SSN", "PASSPORT", "DRIVERS_LICENSE", "BIRTH_CERTIFICATE", "OTHER", name="document_type_enum"),
        nullable=False
    )
    document_name: Mapped[str] = mapped_column(String(255), nullable=False)
    file_path: Mapped[str] = mapped_column(String(500), nullable=False)
    file_size: Mapped[int] = mapped_column(BigInteger, nullable=False)
    mime_type: Mapped[str] = mapped_column(String(100), nullable=False)
    uploaded_by_admin: Mapped[int | None] = mapped_column(
        ForeignKey("admin_users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    created_at: Mapped[str] = mapped_column(
        TIMESTAMP, server_default=func.current_timestamp(), nullable=False, index=True
    )


# -----------------------------
# Announcements
# -----------------------------
class Announcement(Base):
    __tablename__ = "announcements"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    expiry_date: Mapped[str | None] = mapped_column(TIMESTAMP, nullable=True)
    created_by_admin: Mapped[int | None] = mapped_column(
        ForeignKey("admin_users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    created_at: Mapped[str] = mapped_column(
        TIMESTAMP, server_default=func.current_timestamp(), nullable=False, index=True
    )


# -----------------------------
# Certifications (employer reviews/certificates)
# -----------------------------
class Certification(Base):
    __tablename__ = "certifications"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    participant_id: Mapped[int] = mapped_column(
        ForeignKey("participants.id", ondelete="CASCADE"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    issuer: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    issue_date: Mapped[str] = mapped_column(TIMESTAMP, nullable=False)
    created_at: Mapped[str] = mapped_column(
        TIMESTAMP, server_default=func.current_timestamp(), nullable=False, index=True
    )


# -----------------------------
# Training Sessions (available trainings)
# -----------------------------
class TrainingSession(Base):
    __tablename__ = "training_sessions"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    location: Mapped[str | None] = mapped_column(String(255), nullable=True)
    training_date: Mapped[str] = mapped_column(TIMESTAMP, nullable=False)
    created_by_admin: Mapped[int | None] = mapped_column(
        ForeignKey("admin_users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    created_at: Mapped[str] = mapped_column(
        TIMESTAMP, server_default=func.current_timestamp(), nullable=False, index=True
    )


# -----------------------------
# Training Registrations (participant enrollments)
# -----------------------------
class TrainingRegistration(Base):
    __tablename__ = "training_registrations"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    participant_id: Mapped[int] = mapped_column(
        ForeignKey("participants.id", ondelete="CASCADE"), nullable=False, index=True
    )
    training_session_id: Mapped[int] = mapped_column(
        ForeignKey("training_sessions.id", ondelete="CASCADE"), nullable=False, index=True
    )
    status: Mapped[str] = mapped_column(
        Enum("REGISTERED", "ATTENDED", "COMPLETED", "CANCELLED", name="training_status_enum"),
        default="REGISTERED",
        nullable=False
    )
    registered_at: Mapped[str] = mapped_column(
        TIMESTAMP, server_default=func.current_timestamp(), nullable=False, index=True
    )
