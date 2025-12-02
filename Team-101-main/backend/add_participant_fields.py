"""
Add gender, veteran_status, and disability fields to participants table
"""
from sqlalchemy import text
from app.database import get_engine

def add_fields():
    engine = get_engine()
    
    with engine.connect() as conn:
        # Add gender field
        try:
            conn.execute(text("""
                ALTER TABLE participants 
                ADD COLUMN gender VARCHAR(20) DEFAULT 'UNKNOWN'
            """))
            conn.commit()
            print("✓ Added gender column")
        except Exception as e:
            print(f"Gender column might already exist: {e}")
        
        # Add veteran_status field
        try:
            conn.execute(text("""
                ALTER TABLE participants 
                ADD COLUMN veteran_status BOOLEAN DEFAULT FALSE
            """))
            conn.commit()
            print("✓ Added veteran_status column")
        except Exception as e:
            print(f"Veteran_status column might already exist: {e}")
        
        # Add disability field
        try:
            conn.execute(text("""
                ALTER TABLE participants 
                ADD COLUMN disability BOOLEAN DEFAULT FALSE
            """))
            conn.commit()
            print("✓ Added disability column")
        except Exception as e:
            print(f"Disability column might already exist: {e}")
    
    print("\n✅ Migration completed!")

if __name__ == "__main__":
    add_fields()
