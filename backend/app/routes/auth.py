from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from jose import jwt, JWTError
from app.config import settings
from app import schemas, auth

router = APIRouter()


# -------------------------
# DEV REGISTER (BYPASSED)
# -------------------------
@router.post("/register", response_model=schemas.Token)
def register(user: schemas.UserCreate):
    access_token = auth.create_access_token(
        data={"sub": user.email}
    )
    refresh_token = auth.create_refresh_token(
        data={"sub": user.email}
    )

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }


# -------------------------
# DEV LOGIN (BYPASSED)
# -------------------------
@router.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    access_token = auth.create_access_token(
        data={"sub": form_data.username}
    )
    refresh_token = auth.create_refresh_token(
        data={"sub": form_data.username}
    )

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }


# -------------------------
# DEV REFRESH (BYPASSED)
# -------------------------
@router.post("/refresh", response_model=schemas.Token)
def refresh_token(request: schemas.TokenRefreshRequest):
    try:
        payload = jwt.decode(
            request.refresh_token,
            settings.JWT_SECRET,
            algorithms=[settings.ALGORITHM],
        )
        email: str = payload.get("sub")
    except JWTError:
        email = "dev@test.com"

    access_token = auth.create_access_token(
        data={"sub": email}
    )
    refresh_token = auth.create_refresh_token(
        data={"sub": email}
    )

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }