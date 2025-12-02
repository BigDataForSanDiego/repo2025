import os
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app import models
from app.schemas import DocumentOut
from typing import List

router = APIRouter(prefix="/documents", tags=["documents"])

UPLOAD_DIR = "uploads/documents"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload", response_model=DocumentOut)
async def upload_document(
    participant_id: int = Form(...),
    document_type: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload a document for a participant"""
    
    # Verify participant exists
    participant = db.get(models.Participant, participant_id)
    if not participant:
        raise HTTPException(404, "Participant not found")
    
    # Validate document type
    valid_types = ["SSN", "PASSPORT", "DRIVERS_LICENSE", "BIRTH_CERTIFICATE", "OTHER"]
    if document_type not in valid_types:
        raise HTTPException(400, f"Invalid document type. Must be one of: {', '.join(valid_types)}")
    
    # Create unique filename
    file_extension = os.path.splitext(file.filename)[1]
    safe_filename = f"{participant_id}_{document_type}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, safe_filename)
    
    # Save file
    contents = await file.read()
    with open(file_path, "wb") as f:
        f.write(contents)
    
    # Create document record
    document = models.Document(
        participant_id=participant_id,
        document_type=document_type,
        document_name=file.filename,
        file_path=file_path,
        file_size=len(contents),
        mime_type=file.content_type or "application/octet-stream",
        uploaded_by_admin=None
    )
    
    db.add(document)
    db.commit()
    db.refresh(document)
    
    return document

@router.get("/participant/{participant_id}", response_model=List[DocumentOut])
def get_participant_documents(participant_id: int, db: Session = Depends(get_db)):
    """Get all documents for a participant"""
    
    participant = db.get(models.Participant, participant_id)
    if not participant:
        raise HTTPException(404, "Participant not found")
    
    documents = db.query(models.Document).filter_by(participant_id=participant_id).all()
    return documents

@router.get("/download/{document_id}")
def download_document(document_id: int, db: Session = Depends(get_db)):
    """Download a document"""
    
    document = db.get(models.Document, document_id)
    if not document:
        raise HTTPException(404, "Document not found")
    
    if not os.path.exists(document.file_path):
        raise HTTPException(404, "File not found on server")
    
    return FileResponse(
        path=document.file_path,
        filename=document.document_name,
        media_type=document.mime_type
    )

@router.put("/{document_id}/rename")
def rename_document(document_id: int, new_name: str = Form(...), db: Session = Depends(get_db)):
    """Rename a document"""
    
    document = db.get(models.Document, document_id)
    if not document:
        raise HTTPException(404, "Document not found")
    
    # Update document name
    document.document_name = new_name
    db.commit()
    db.refresh(document)
    
    return {"success": True, "message": "Document renamed successfully", "document": document}

@router.delete("/{document_id}")
def delete_document(document_id: int, db: Session = Depends(get_db)):
    """Delete a document"""
    
    document = db.get(models.Document, document_id)
    if not document:
        raise HTTPException(404, "Document not found")
    
    # Delete file from disk
    try:
        if os.path.exists(document.file_path):
            os.remove(document.file_path)
    except Exception as e:
        print(f"Error deleting file: {e}")
    
    # Delete from database
    db.delete(document)
    db.commit()
    
    return {"success": True, "message": "Document deleted successfully"}
