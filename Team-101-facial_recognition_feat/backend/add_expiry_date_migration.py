#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import text
from app.database import get_engine

def add_expiry_date_column():
    """Add expiry_date column to announcements table"""
    engine = get_engine()
    
    with engine.connect() as conn:
        try:
            # Check if column already exists
            result = conn.execute(text("""
                SELECT COUNT(*) as count 
                FROM information_schema.columns 
                WHERE table_name = 'announcements' 
                AND column_name = 'expiry_date'
                AND table_schema = DATABASE()
            """))
            
            if result.fetchone()[0] == 0:
                # Add the column
                conn.execute(text("""
                    ALTER TABLE announcements 
                    ADD COLUMN expiry_date TIMESTAMP NULL
                """))
                conn.commit()
                print("✅ Added expiry_date column to announcements table")
            else:
                print("ℹ️  expiry_date column already exists in announcements table")
                
        except Exception as e:
            print(f"❌ Error: {e}")
            conn.rollback()

if __name__ == "__main__":
    add_expiry_date_column()