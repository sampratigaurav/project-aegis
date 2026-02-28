from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from app.database import get_db
from app import models, schemas, scanner, blockchain, utils
from app.dependencies import get_current_user
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024 # 2 GB

@router.post("/register", response_model=schemas.ModelFileResponse)
async def register_model(
    description: str = Form(None),
    file: UploadFile = File(...),
    name: str = Form(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if not file.filename.endswith(('.pkl', '.pt', '.pth', '.h5', '.onnx', '.pb')):
        raise HTTPException(status_code=400, detail="Invalid file type. Supported: .pkl, .pt, .pth, .h5, .onnx, .pb")
        
    file_content = await file.read()
    
    if len(file_content) > MAX_FILE_SIZE:
        logger.warning(f"File size exceeded for user {current_user.email}")
        raise HTTPException(status_code=400, detail="File too large. Max size is 2GB.")
        
    # 1. Scan for malicious patterns
    is_malicious = scanner.scan_model_file(file_content)
    if is_malicious:
        logger.warning(f"Malicious code detected in upload by {current_user.email}")
        raise HTTPException(status_code=403, detail="Malicious code detected in model file. Registration rejected.")
        
    # 2. Compute Hash
    file_hash = utils.compute_sha256(file_content)
    
    # 3. Check if already exists in DB
    existing_model = db.query(models.ModelFile).filter(models.ModelFile.file_hash == file_hash).first()
    if existing_model:
        raise HTTPException(status_code=400, detail="Model with this hash is already registered.")
        
    # 4. Register on blockchain
    tx_hash = blockchain.register_model_hash_on_chain(file_hash)
    
    actual_name = name if name else file.filename
    # 5. Store in DB
    new_model = models.ModelFile(
        name=actual_name,
        description=description,
        file_hash=file_hash,
        tx_hash=tx_hash,
        verified=True,
        publisher_id=current_user.id
    )
    
    try:
        db.add(new_model)
        db.commit()
        db.refresh(new_model)
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Database error during model registration: {str(e)}")
        raise HTTPException(status_code=500, detail="Database error occurred during registration.")
    
    # We return a dictionary matching ModelFileResponse to include scan_status
    # without needing to add it to the ModelFile database model directly.
    return {
        "id": new_model.id,
        "name": new_model.name,
        "description": new_model.description,
        "file_hash": new_model.file_hash,
        "tx_hash": new_model.tx_hash,
        "verified": new_model.verified,
        "scan_status": "Passed (ProtectAI ModelScan)",
        "publisher_id": new_model.publisher_id,
        "created_at": new_model.created_at
    }
