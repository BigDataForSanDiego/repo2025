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
    cursor.execute("ALTER TABLE participants ADD COLUMN face_encoding TEXT NULL")
    conn.commit()
    print("✓ Successfully added face_encoding column")
except mysql.connector.errors.DatabaseError as e:
    if "Duplicate column name" in str(e):
        print("✓ Column face_encoding already exists")
    else:
        print(f"✗ Error: {e}")
finally:
    cursor.close()
    conn.close()