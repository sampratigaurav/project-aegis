from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from app import utils, blockchain

router = APIRouter()

@router.post("")
async def verify_model(file: UploadFile = File(...)):
    if not file.filename.endswith(('.pkl', '.pt')):
        raise HTTPException(status_code=400, detail="Invalid file type. Only .pkl and .pt are supported.")
        
    try:
        file_content = await file.read()
        file_hash = utils.compute_sha256(file_content)
        
        chain_data = blockchain.verify_model_on_chain(file_hash)
        
        return {
            "status": "success",
            "file_hash": file_hash,
            "on_chain_verification": {
                "is_registered": chain_data.get("is_registered", False),
                "publisher": chain_data.get("publisher"),
                "timestamp": chain_data.get("timestamp")
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
