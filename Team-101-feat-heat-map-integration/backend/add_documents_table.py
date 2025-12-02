#!/usr/bin/env python3
import mysql.connector
from app.config import settings

# Parse database URL
db_url = settings.database_url.replace("mysql+mysqlconnector://", "")
user_pass, host_db = db_url.split("@")
user, password = user_pass.split(":")
host_port, database = host_db.split("/")
host, port = host_port.split(":")

conn = mysql.connector.connect(
    host=host,
    port=int(port),
    user=user,
    password=password,
    database=database
)

cursor = conn.cursor()

try:
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS documents (
            id BIGINT AUTO_INCREMENT PRIMARY KEY,
            participant_id BIGINT NOT NULL,
            document_type ENUM('SSN', 'PASSPORT', 'DRIVERS_LICENSE', 'BIRTH_CERTIFICATE', 'OTHER') NOT NULL,
            document_name VARCHAR(255) NOT NULL,
            file_path VARCHAR(500) NOT NULL,
            file_size BIGINT NOT NULL,
            mime_type VARCHAR(100) NOT NULL,
            uploaded_by_admin BIGINT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
            INDEX idx_participant_id (participant_id),
            INDEX idx_uploaded_by_admin (uploaded_by_admin),
            INDEX idx_created_at (created_at),
            FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE,
            FOREIGN KEY (uploaded_by_admin) REFERENCES admin_users(id) ON DELETE SET NULL
        )
    """)
    conn.commit()
    print("✓ Successfully created documents table")
except mysql.connector.errors.DatabaseError as e:
    print(f"✗ Error: {e}")
finally:
    cursor.close()
    conn.close()
