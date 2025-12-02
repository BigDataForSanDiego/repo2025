from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from app.database import get_db
from app import models
import io
import qrcode

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/participants/{participant_id}/qr.png")
def qr_png(participant_id: int, db: Session = Depends(get_db)):
    p = db.get(models.Participant, participant_id)
    if not p or not p.qr_active:
        raise HTTPException(404, "Participant not found or QR disabled")

    deep_link = f"/api/v1/lookup/qr/{p.qr_uid}"   # in prod, make this a full URL
    img = qrcode.make(deep_link)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return Response(
        content=buf.getvalue(),
        media_type="image/png",
        headers={"Cache-Control": "public, max-age=31536000"}
    )
