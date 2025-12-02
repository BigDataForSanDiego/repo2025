"""
Database seeding script for ReLink
Populates the database with sample data for development/testing
"""
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.database import get_engine, Base, ensure_database
from app.models import (
    Organization, AdminUser, Participant, Employer, 
    Announcement, Certification, TrainingSession, TrainingRegistration
)
from app.security import hash_password, new_qr_uid

def seed_database():
    """Seed the database with sample data"""
    ensure_database()
    engine = get_engine()
    Base.metadata.create_all(bind=engine)
    
    with Session(engine) as session:
        # Check if already seeded
        if session.query(Organization).count() > 0:
            print("Database already seeded. Skipping...")
            return
        
        print("Seeding database...")
        
        # 1. Organizations
        orgs = [
            Organization(name="San Diego Homeless Services", contact_phone="619-555-0100", contact_email="contact@sdhomeless.org"),
            Organization(name="Community Outreach Center", contact_phone="619-555-0200", contact_email="info@communityoutreach.org"),
        ]
        session.add_all(orgs)
        session.flush()
        
        # 2. Admin Users
        admins = [
            AdminUser(org_id=orgs[0].id, email="admin@relink.com", password_hash=hash_password("admin123"), role="ADMIN"),
            AdminUser(org_id=orgs[0].id, email="staff@relink.com", password_hash=hash_password("staff123"), role="STAFF"),
            AdminUser(org_id=orgs[1].id, email="admin2@relink.com", password_hash=hash_password("admin123"), role="ADMIN"),
        ]
        session.add_all(admins)
        session.flush()
        
        # 3. Participants
        participants = [
            Participant(org_id=orgs[0].id, display_name="John Smith", phone="619-555-1001", email="john.smith@example.com", preferred_contact="EMAIL", qr_uid=new_qr_uid(), created_by_admin=admins[0].id),
            Participant(org_id=orgs[0].id, display_name="Maria Garcia", phone="619-555-1002", email="maria.garcia@example.com", preferred_contact="SMS", qr_uid=new_qr_uid(), created_by_admin=admins[0].id),
            Participant(org_id=orgs[0].id, display_name="David Johnson", phone="619-555-1003", preferred_contact="NONE", qr_uid=new_qr_uid(), created_by_admin=admins[1].id),
            Participant(org_id=orgs[0].id, display_name="Sarah Williams", phone="619-555-1004", email="sarah.w@example.com", preferred_contact="EMAIL", qr_uid=new_qr_uid(), created_by_admin=admins[0].id),
            Participant(org_id=orgs[1].id, display_name="Michael Brown", phone="619-555-1005", preferred_contact="SMS", qr_uid=new_qr_uid(), created_by_admin=admins[2].id),
        ]
        session.add_all(participants)
        session.flush()
        
        # 4. Employers
        employers = [
            Employer(company_name="Tech Solutions Inc", contact_name="Robert Chen", email="robert@techsolutions.com", phone="619-555-2001", password_hash=hash_password("employer123")),
            Employer(company_name="Green Valley Restaurant", contact_name="Lisa Martinez", email="lisa@greenvalley.com", phone="619-555-2002", password_hash=hash_password("employer123")),
            Employer(company_name="City Construction Co", contact_name="James Wilson", email="james@cityconstruction.com", phone="619-555-2003", password_hash=hash_password("employer123")),
        ]
        session.add_all(employers)
        session.flush()
        
        # 5. Announcements
        announcements = [
            Announcement(title="Job Fair Next Week", content="Join us for a job fair on Monday at 10 AM. Multiple employers will be present.", expiry_date=datetime.now() + timedelta(days=7), created_by_admin=admins[0].id),
            Announcement(title="Free Resume Workshop", content="Learn how to create a professional resume. Workshop on Wednesday at 2 PM.", expiry_date=datetime.now() + timedelta(days=5), created_by_admin=admins[0].id),
            Announcement(title="Housing Assistance Available", content="New housing assistance program now accepting applications. Contact us for details.", expiry_date=datetime.now() + timedelta(days=30), created_by_admin=admins[1].id),
            Announcement(title="Food Distribution Schedule", content="Food distribution every Friday from 9 AM to 12 PM at the community center.", created_by_admin=admins[0].id),
        ]
        session.add_all(announcements)
        session.flush()
        
        # 6. Certifications
        certifications = [
            Certification(participant_id=participants[0].id, title="Food Handler Certificate", issuer="San Diego County Health", description="Certified to handle food safely", issue_date=datetime.now() - timedelta(days=30)),
            Certification(participant_id=participants[0].id, title="Forklift Operator License", issuer="OSHA Training Center", description="Licensed to operate forklifts", issue_date=datetime.now() - timedelta(days=60)),
            Certification(participant_id=participants[1].id, title="CPR Certification", issuer="American Red Cross", description="Certified in CPR and First Aid", issue_date=datetime.now() - timedelta(days=90)),
            Certification(participant_id=participants[2].id, title="Customer Service Excellence", issuer="Retail Training Institute", description="Completed customer service training", issue_date=datetime.now() - timedelta(days=45)),
            Certification(participant_id=participants[3].id, title="Basic Computer Skills", issuer="Community College", description="Proficient in Microsoft Office", issue_date=datetime.now() - timedelta(days=20)),
        ]
        session.add_all(certifications)
        session.flush()
        
        # 7. Training Sessions
        training_sessions = [
            TrainingSession(title="Interview Skills Workshop", description="Learn effective interview techniques", location="Main Office - Room 101", training_date=datetime.now() + timedelta(days=3), created_by_admin=admins[0].id),
            TrainingSession(title="Financial Literacy Course", description="Budgeting and money management basics", location="Community Center", training_date=datetime.now() + timedelta(days=7), created_by_admin=admins[0].id),
            TrainingSession(title="Construction Safety Training", description="OSHA safety standards and practices", location="Training Facility", training_date=datetime.now() + timedelta(days=10), created_by_admin=admins[1].id),
            TrainingSession(title="Digital Skills Bootcamp", description="Computer basics and online job searching", location="Computer Lab", training_date=datetime.now() + timedelta(days=14), created_by_admin=admins[0].id),
            TrainingSession(title="Conflict Resolution Workshop", description="Managing workplace conflicts effectively", location="Main Office - Room 202", training_date=datetime.now() + timedelta(days=21), created_by_admin=admins[1].id),
        ]
        session.add_all(training_sessions)
        session.flush()
        
        # 8. Training Registrations
        registrations = [
            TrainingRegistration(participant_id=participants[0].id, training_session_id=training_sessions[0].id, status="REGISTERED"),
            TrainingRegistration(participant_id=participants[0].id, training_session_id=training_sessions[1].id, status="COMPLETED"),
            TrainingRegistration(participant_id=participants[1].id, training_session_id=training_sessions[0].id, status="REGISTERED"),
            TrainingRegistration(participant_id=participants[1].id, training_session_id=training_sessions[3].id, status="ATTENDED"),
            TrainingRegistration(participant_id=participants[2].id, training_session_id=training_sessions[2].id, status="REGISTERED"),
            TrainingRegistration(participant_id=participants[3].id, training_session_id=training_sessions[1].id, status="COMPLETED"),
            TrainingRegistration(participant_id=participants[3].id, training_session_id=training_sessions[3].id, status="REGISTERED"),
            TrainingRegistration(participant_id=participants[4].id, training_session_id=training_sessions[4].id, status="REGISTERED"),
        ]
        session.add_all(registrations)
        
        session.commit()
        print("✅ Database seeded successfully!")
        print("\n📋 Sample Credentials:")
        print("\nAdmin Users:")
        print("  - admin@relink.com / admin123")
        print("  - staff@relink.com / staff123")
        print("  - admin2@relink.com / admin123")
        print("\nEmployers:")
        print("  - robert@techsolutions.com / employer123")
        print("  - lisa@greenvalley.com / employer123")
        print("  - james@cityconstruction.com / employer123")
        print("\nParticipants:")
        print("  - John Smith, Maria Garcia, David Johnson, Sarah Williams, Michael Brown")

if __name__ == "__main__":
    seed_database()
