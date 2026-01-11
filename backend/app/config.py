"""
Configuration management for SmartNoteX backend.
Uses Pydantic Settings for type-safe environment variable handling.
"""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Database
    DATABASE_URL: str
    
    # JWT Authentication
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    
    # Supabase Storage
    SUPABASE_URL: str
    SUPABASE_KEY: str  # Anon/public key
    SUPABASE_SERVICE_KEY: str  # Service role key (for admin operations)
    SUPABASE_STORAGE_BUCKET: str = "smartnotex-files"
    
    # Vector Database (pgvector - enabled in Supabase PostgreSQL)
    # No additional config needed, uses DATABASE_URL
    
    # HuggingFace
    HUGGINGFACE_API_KEY: str = ""  # Optional: for Inference API, leave empty for local models
    HUGGINGFACE_EMBEDDING_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"  # 384 dimensions
    
    # Redis (Upstash)
    # Get your Upstash Redis URL from: https://console.upstash.com/
    # Format: redis://default:[YOUR-PASSWORD]@[YOUR-ENDPOINT]:[PORT]
    # Or: rediss://default:[YOUR-PASSWORD]@[YOUR-ENDPOINT]:[PORT] (for SSL)
    REDIS_URL: str
    
    # Application
    ENVIRONMENT: str = "development"
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:5173"
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins from comma-separated string."""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Global settings instance
settings = Settings()

