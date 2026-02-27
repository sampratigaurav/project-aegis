from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models, schemas

router = APIRouter()

@router.get("", response_model=List[schemas.MarketplaceModel])
def get_marketplace_models(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    # We join with User to get the publisher email/name
    models_query = db.query(models.ModelFile).filter(models.ModelFile.verified == True).offset(skip).limit(limit).all()
    
    result = []
    for model in models_query:
        result.append({
            "name": model.name,
            "description": model.description,
            "publisher": model.publisher.email if model.publisher else "Unknown",
            "verified": model.verified,
            "file_hash": model.file_hash,
            "created_at": model.created_at
        })
    return result
