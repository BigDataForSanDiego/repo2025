from fastapi import APIRouter, HTTPException
from app.database import ping_db

router = APIRouter(tags=["health"])

@router.get("/health/db")
def health_db():
    try:
        ok = ping_db()
        return {"db": "ok" if ok else "error"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DB error: {e}")