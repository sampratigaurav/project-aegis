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
        
        # 1. Check the database
        db_model = db.query(models.ModelFile).filter(models.ModelFile.file_hash == file_hash).first()
        
        # 2. Check on-chain (this is the source of truth)
        chain_data = {"is_registered": False, "publisher": None, "timestamp": None}
        try:
            chain_data = blockchain.verify_model_on_chain(file_hash)
        except Exception as chain_err:
            logger.warning(f"Blockchain verification unavailable: {chain_err}")
        
        # Decision logic:
        # - On-chain = TRUE  →  Verified (blockchain is the ultimate proof)
        # - On-chain = FALSE but DB has it with valid tx_hash  →  Verified (registered previously)
        # - On-chain = FALSE and DB has it but NO tx_hash  →  Registered (pending chain confirmation)
        # - Not in DB and not on-chain  →  Unregistered / Tampered
        
        is_registered = False
        publisher = None
        registered_at = None
        
        if chain_data.get("is_registered"):
            # On-chain verified — strongest proof
            is_registered = True
            # Prefer DB publisher email over wallet address
            if db_model and db_model.publisher:
                publisher = db_model.publisher.email
            else:
                publisher = chain_data.get("publisher")
            registered_at = chain_data.get("timestamp")
            
        elif db_model and db_model.tx_hash:
            # In DB with a valid tx_hash — was registered on chain previously
            is_registered = True
            publisher = db_model.publisher.email if db_model.publisher else "Unknown"
            registered_at = int(db_model.created_at.timestamp()) if db_model.created_at else None
            
        # If neither condition is met, is_registered stays False
        
        logger.info(f"Verification for {file_hash[:16]}...: on_chain={chain_data.get('is_registered')}, in_db={bool(db_model)}, result={is_registered}")
        
        return {
            "status": "success",
            "file_hash": file_hash,
            "on_chain_verification": {
                "is_registered": is_registered,
                "publisher": publisher,
                "timestamp": registered_at
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Verification error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
