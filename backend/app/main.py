from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import logging
from app.config import settings
from app.database import engine, Base
from app.routes import auth, models, verify, marketplace

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Note: Using Alembic for migrations in prod, but for dev fallback we create tables if they don't exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend for AI Model Trust Layer",
    version="1.0.0"
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"message": "Internal server error. Please try again later."}
    )

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN, "http://localhost:5173", "https://yourfrontend.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(models.router, prefix="/models", tags=["Models"])
app.include_router(verify.router, prefix="/models/verify", tags=["Verification"])
app.include_router(marketplace.router, prefix="/marketplace", tags=["Marketplace"])

@app.get("/")
def read_root():
    return {"message": "Aegis backend running"}

@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok"}
