#!/usr/bin/env python3
"""
Simple database migration to add face_encoding column
"""
import sqlite3
import os

# Path to your database file (adjust if needed)
DB_PATH = "app.db"  # or wherever your SQLite database is

def migrate():
    if not os.path.exists(DB_PATH):
        print("Database not found, will be created on next startup")
        return
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Check if face_encoding column exists
        cursor.execute("PRAGMA table_info(participants)")
        columns = [row[1] for row in cursor.fetchall()]
        
        if 'face_encoding' not in columns:
            print("Adding face_encoding column...")
            cursor.execute("ALTER TABLE participants ADD COLUMN face_encoding TEXT")
            conn.commit()
            print("Migration completed successfully!")
        else:
            print("face_encoding column already exists")
            
    except Exception as e:
        print(f"Migration error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()