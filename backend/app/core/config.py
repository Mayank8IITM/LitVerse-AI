from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "LitVerse AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]
    
    # Database
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/litverse"
    
    # Auth & Security
    SECRET_KEY: str = "super-secret-development-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Google OAuth
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    
    # AI Providers (Comma-separated keys)
    GEMINI_API_KEYS: str = ""
    GROQ_API_KEYS: str = ""

    @property
    def gemini_keys_list(self) -> List[str]:
        return [k.strip() for k in self.GEMINI_API_KEYS.split(",") if k.strip()]

    @property
    def groq_keys_list(self) -> List[str]:
        return [k.strip() for k in self.GROQ_API_KEYS.split(",") if k.strip()]

    model_config = SettingsConfigDict(env_file=".env", env_ignore_empty=True, extra="ignore")

settings = Settings()
