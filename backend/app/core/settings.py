from functools import lru_cache
from typing import Literal

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        enable_decoding=False,
    )

    app_name: str = "FounderOS AI API"
    app_env: Literal["development", "staging", "production"] = "development"
    app_debug: bool = True
    api_v1_prefix: str = "/api/v1"

    database_url: str = Field(default="")
    redis_url: str = Field(default="")
    cors_origins: list[str] = Field(default_factory=list)
    jwt_secret_key: str = Field(default="change-me")
    jwt_algorithm: str = "HS256"
    access_token_expiry_minutes: int = 60
    openai_api_key: str = Field(default="")
    openai_model: str = "gpt-4o-mini"

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


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
