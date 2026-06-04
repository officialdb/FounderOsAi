from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic import Field, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

DEFAULT_DEV_JWT_SECRET = "founderos-dev-only-jwt-secret-change-me-in-production-2026"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(Path(__file__).resolve().parents[2] / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
        enable_decoding=False,
    )

    app_name: str = "FounderOS AI API"
    app_env: Literal["development", "staging", "production"] = "development"
    app_debug: bool = False
    api_v1_prefix: str = "/api/v1"

    database_url: str = Field(default="")
    redis_url: str = Field(default="")
    cors_origins: list[str] = Field(default_factory=list)
    jwt_secret_key: str = Field(default=DEFAULT_DEV_JWT_SECRET)
    jwt_algorithm: str = "HS256"
    access_token_expiry_minutes: int = 60
    openai_api_key: str = Field(default="")
    openai_model: str = "gpt-4o-mini"
    sentry_dsn: str = Field(default="")
    posthog_api_key: str = Field(default="")
    posthog_host: str = Field(default="https://us.i.posthog.com")

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: object) -> list[str]:
        if value in (None, ""):
            return []
        if isinstance(value, list):
            return value
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        raise TypeError("cors_origins must be a list or comma-separated string")

    @model_validator(mode="after")
    def validate_production_settings(self) -> "Settings":
        if self.app_env == "production":
            missing_settings = [
                name
                for name, value in (
                    ("database_url", self.database_url),
                    ("redis_url", self.redis_url),
                    ("jwt_secret_key", self.jwt_secret_key),
                )
                if not value
            ]
            if missing_settings:
                raise ValueError(f"Missing required production settings: {', '.join(missing_settings)}")
            if self.jwt_secret_key == DEFAULT_DEV_JWT_SECRET or len(self.jwt_secret_key) < 32:
                raise ValueError("JWT_SECRET_KEY must be at least 32 characters in production")
            if self.app_debug:
                raise ValueError("APP_DEBUG must be false in production")
            if not self.cors_origins:
                raise ValueError("CORS_ORIGINS must be configured in production")
            if any(origin == "*" for origin in self.cors_origins):
                raise ValueError("Wildcard CORS origins are not allowed in production")
        return self


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
