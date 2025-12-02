#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import get_engine
from sqlalchemy import text

def run_migration():
    """Run training tables migration"""
    engine = get_engine()
    
    with open('create_training_tables.sql', 'r') as f:
        sql_content = f.read()
    
    # Split by semicolon and execute each statement
    statements = [s.strip() for s in sql_content.split(';') if s.strip()]
    
    with engine.connect() as conn:
        for statement in statements:
            try:
                conn.execute(text(statement))
                conn.commit()
                print(f"✅ Executed: {statement[:50]}...")
            except Exception as e:
                print(f"❌ Error: {e}")
                print(f"Statement: {statement[:100]}")
    
    print("\n✅ Migration completed!")

if __name__ == "__main__":
    run_migration()
