from fastapi import FastAPI, Request
from fastapi.exceptions import HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.config import settings
from app.database import engine, Base
from app.routes import auth, models, verify, marketplace

# -----------------------
# Logging Configuration
# -----------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# -----------------------
# Database Init (Dev fallback)
# -----------------------
Base.metadata.create_all(bind=engine)

# -----------------------
# App Initialization
# -----------------------
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend for AI Model Trust Layer",
    version="1.0.0"
)

# -----------------------
# Global Exception Handler
# -----------------------
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # Let FastAPI handle its own HTTPExceptions (401, 403, 404, etc.)
    if isinstance(exc, HTTPException):
        raise exc
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"message": "Internal server error. Please try again later."}
    )

# -----------------------
# CORS Configuration
# -----------------------
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://project-aegis-wine.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------
# Routers
# -----------------------
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(models.router, prefix="/models", tags=["Models"])
app.include_router(verify.router, prefix="/models/verify", tags=["Verification"])
app.include_router(marketplace.router, prefix="/marketplace", tags=["Marketplace"])

# -----------------------
# Health & Root
# -----------------------
@app.get("/")
def read_root():
    return {"message": "Aegis backend running"}

@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok"}