from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Aegis Backend"
    
    DATABASE_URL: str = "sqlite:///./dev.db"
    JWT_SECRET: str = "supersecretkey_change_in_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    POLYGON_RPC: str = "https://polygon-amoy.g.alchemy.com/v2/YVa7apDLJrsHD_4EoXAyF"
    PRIVATE_KEY: str = "1f6c6a7970e85bc2f089ba54cc81911bccac6a7fadb2568efceabd487bee0e31"
    CONTRACT_ADDRESS: str = "0xe7f686901b96311C027464D7ed25300879C64924"
    
    FRONTEND_ORIGIN: str = "http://localhost:5173"
    
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
