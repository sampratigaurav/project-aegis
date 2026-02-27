from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Aegis Backend"
    
    DATABASE_URL: str = "sqlite:///./dev.db"
    JWT_SECRET: str = "supersecretkey_change_in_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    POLYGON_RPC: str = "https://rpc-amoy.polygon.technology"
    PRIVATE_KEY: str = ""
    CONTRACT_ADDRESS: str = ""
    
    FRONTEND_ORIGIN: str = "http://localhost:5173"
    
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
