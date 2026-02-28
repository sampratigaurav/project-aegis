from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, utils, blockchain
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("")
async def verify_model(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith(('.pkl', '.pt', '.pth', '.h5', '.onnx', '.pb')):
        raise HTTPException(status_code=400, detail="Invalid file type. Supported: .pkl, .pt, .pth, .h5, .onnx, .pb")
        
    try:
        file_content = await file.read()
        file_hash = utils.compute_sha256(file_content)
        
        # 1. Check the database first
        db_model = db.query(models.ModelFile).filter(models.ModelFile.file_hash == file_hash).first()
        
        # 2. Also verify on-chain
        chain_data = blockchain.verify_model_on_chain(file_hash)
        
        # Determine publisher info from DB (email) or chain (address)
        publisher = None
        registered_at = None
        
        if db_model:
            publisher = db_model.publisher.email if db_model.publisher else chain_data.get("publisher")
            registered_at = chain_data.get("timestamp") or (int(db_model.created_at.timestamp()) if db_model.created_at else None)
        elif chain_data.get("is_registered"):
            publisher = chain_data.get("publisher")
            registered_at = chain_data.get("timestamp")
        
        is_registered = bool(db_model) or chain_data.get("is_registered", False)
        
        logger.info(f"Verification result for {file_hash[:16]}...: registered={is_registered}, publisher={publisher}")
        
        return {
            "status": "success",
            "file_hash": file_hash,
            "on_chain_verification": {
                "is_registered": is_registered,
                "publisher": publisher,
                "timestamp": registered_at
            }
        }
    except Exception as e:
        logger.error(f"Verification error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
