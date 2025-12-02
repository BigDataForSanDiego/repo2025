# app/database.py
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from sqlalchemy.engine.url import make_url
from app.config import settings

# --- ORM Base ---
class Base(DeclarativeBase):
    """Base for ORM models."""
    pass

# --- URL helpers ---
def _server_url_and_dbname():
    """
    Split DB name from URL so we can connect to the server first (no database)
    and run CREATE DATABASE IF NOT EXISTS.
    """
    url = make_url(settings.database_url)  # works with mysql+mysqlconnector://...
    db_name = url.database
    server_url = url.set(database=None)    # connect without selecting a DB
    return str(server_url), db_name

# Engines are created lazily to ensure the DB exists first
_engine = None
_SessionLocal = None

def get_engine():
    global _engine
    if _engine is None:
        _engine = create_engine(
            settings.database_url,
            pool_pre_ping=True,
            pool_recycle=3600,
            echo=False,
            isolation_level="READ COMMITTED",
        )
    return _engine

def get_sessionmaker():
    global _SessionLocal
    if _SessionLocal is None:
        _SessionLocal = sessionmaker(bind=get_engine(), autocommit=False, autoflush=False)
    return _SessionLocal

def get_db():
    SessionLocal = get_sessionmaker()
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def ensure_database():
    """
    Create the database if it does not exist (MySQL).
    No-op for SQLite or drivers that don’t support server-only connects.
    """
    server_url, db_name = _server_url_and_dbname()
    if not db_name:
        return  # e.g., sqlite or missing db part

    # Connect to the server (no database selected) and create the DB if needed
    server_engine = create_engine(
        server_url,
        pool_pre_ping=True,
        echo=False,
        isolation_level="AUTOCOMMIT",
    )
    with server_engine.connect() as conn:
        conn.execute(
            text(f"CREATE DATABASE IF NOT EXISTS `{db_name}` "
                 "CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
        )
    server_engine.dispose()

def ping_db() -> bool:
    # simple connectivity probe
    with get_engine().connect() as conn:
        conn.execute(text("SELECT 1"))
        return True
