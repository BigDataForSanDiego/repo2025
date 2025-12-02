#!/usr/bin/env python3
import mysql.connector
from app.config import settings

db_url = settings.database_url.replace("mysql+mysqlconnector://", "")
user_pass, host_db = db_url.split("@")
user, password = user_pass.split(":")
host_port, database = host_db.split("/")
host, port = host_port.split(":")

conn = mysql.connector.connect(host=host, port=int(port), user=user, password=password, database=database)
cursor = conn.cursor()

try:
    # Announcements
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS announcements (
            id BIGINT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            content TEXT NOT NULL,
            created_by_admin BIGINT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
            INDEX idx_created_at (created_at),
            FOREIGN KEY (created_by_admin) REFERENCES admin_users(id) ON DELETE SET NULL
        )
    """)
    
    # Certifications
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS certifications (
            id BIGINT AUTO_INCREMENT PRIMARY KEY,
            participant_id BIGINT NOT NULL,
            title VARCHAR(255) NOT NULL,
            issuer VARCHAR(255) NOT NULL,
            description TEXT NULL,
            issue_date TIMESTAMP NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
            INDEX idx_participant_id (participant_id),
            FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE
        )
    """)
    
    # Trainings
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS trainings (
            id BIGINT AUTO_INCREMENT PRIMARY KEY,
            participant_id BIGINT NOT NULL,
            title VARCHAR(255) NOT NULL,
            description TEXT NULL,
            location VARCHAR(255) NULL,
            training_date TIMESTAMP NOT NULL,
            status ENUM('REGISTERED', 'ATTENDED', 'COMPLETED', 'CANCELLED') DEFAULT 'REGISTERED' NOT NULL,
            registered_by_admin BIGINT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
            INDEX idx_participant_id (participant_id),
            FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE,
            FOREIGN KEY (registered_by_admin) REFERENCES admin_users(id) ON DELETE SET NULL
        )
    """)
    
    conn.commit()
    print("✓ Successfully created announcements, certifications, and trainings tables")
except Exception as e:
    print(f"✗ Error: {e}")
finally:
    cursor.close()
    conn.close()
