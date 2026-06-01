from redis import Redis

from app.core.settings import get_settings


def get_redis_client() -> Redis | None:
    settings = get_settings()
    if not settings.redis_url:
        return None
    return Redis.from_url(settings.redis_url, decode_responses=True)

