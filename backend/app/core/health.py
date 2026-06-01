from fastapi import HTTPException, status
from sqlalchemy import text

from app.core.settings import get_settings
from app.database.redis import get_redis_client
from app.database.session import engine


def get_service_health() -> dict[str, str]:
    settings = get_settings()
    if engine is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database not configured")

    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))

    redis_client = get_redis_client()
    redis_status = "not_configured"
    if redis_client is not None:
        redis_client.ping()
        redis_status = "ok"
    elif settings.app_env == "production":
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Redis not configured")

    return {"status": "ready", "database": "ok", "redis": redis_status}
