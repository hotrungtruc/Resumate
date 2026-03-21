from __future__ import annotations
from pathlib import Path
from typing import Optional
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


def _find_env():
    p = Path(__file__).resolve()
    candidates = [p.parents[i] / ".env" for i in range(1, 6) if i < len(p.parents)]
    for c in candidates:
        if c.exists():
            return str(c)
    return None


class Settings(BaseSettings):
    MONGO_URI: str = Field(...)
    JWT_SECRET: str = Field(...)
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None
    FACEBOOK_APP_ID: Optional[str] = None
    FACEBOOK_APP_SECRET: Optional[str] = None
    # CORS Configuration
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"
    ALLOWED_METHODS: str = "GET,POST,PUT,DELETE,PATCH"
    # Logging
    LOG_LEVEL: str = "INFO"
    model_config = SettingsConfigDict(env_file=_find_env(), env_file_encoding="utf-8", extra="ignore")

    def get_cors_origins(self) -> list[str]:
        """Parse CORS_ORIGINS string to list"""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    def get_allowed_methods(self) -> list[str]:
        """Parse ALLOWED_METHODS string to list"""
        return [method.strip() for method in self.ALLOWED_METHODS.split(",")]


settings = Settings()
