from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    email: EmailStr


class UserCreate(UserBase):
    password: str


class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str


class TokenRefreshRequest(BaseModel):
    refresh_token: str


class ModelFileBase(BaseModel):
    name: str
    description: Optional[str] = None

class CLIModelRegister(BaseModel):
    name: str
    description: Optional[str] = None
    file_hash: str
    scan_status: str

class ModelFileResponse(ModelFileBase):
    id: int
    file_hash: str
    tx_hash: Optional[str] = None
    verified: bool
    scan_status: Optional[str] = None
    publisher_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class MarketplaceModel(BaseModel):
    name: str
    description: Optional[str] = None
    publisher: str
    verified: bool
    file_hash: str
    tx_hash: Optional[str] = None
    created_at: datetime