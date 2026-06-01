from __future__ import annotations

from collections import defaultdict
from threading import Lock
from time import time

from fastapi import HTTPException, status
from redis.exceptions import RedisError

from app.database.redis import get_redis_client

_memory_buckets: dict[str, list[float]] = defaultdict(list)
_memory_lock = Lock()


def enforce_rate_limit(scope: str, identifier: str, limit: int, window_seconds: int) -> None:
    key = f"rate-limit:{scope}:{identifier}"
    try:
        redis_client = get_redis_client()
        if redis_client is not None:
            current = redis_client.incr(key)
            if current == 1:
                redis_client.expire(key, window_seconds)
            if current > limit:
                raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="Too many attempts")
            return
    except RedisError:
        pass

    now = time()
    with _memory_lock:
        bucket = [timestamp for timestamp in _memory_buckets[key] if now - timestamp < window_seconds]
        if len(bucket) >= limit:
            raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="Too many attempts")
        bucket.append(now)
        _memory_buckets[key] = bucket
