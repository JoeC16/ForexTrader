import json
import os
from typing import Any, Optional
import redis.asyncio as aioredis

_pool: Optional[aioredis.Redis] = None


async def get_redis() -> aioredis.Redis:
    global _pool
    if _pool is None:
        _pool = aioredis.from_url(
            os.getenv("REDIS_URL", "redis://localhost:6379"),
            encoding="utf-8",
            decode_responses=True,
        )
    return _pool


async def cache_get(key: str) -> Optional[Any]:
    r = await get_redis()
    value = await r.get(key)
    if value is None:
        return None
    return json.loads(value)


async def cache_set(key: str, value: Any, ttl: int = 900) -> None:
    r = await get_redis()
    await r.setex(key, ttl, json.dumps(value))


async def cache_del(key: str) -> None:
    r = await get_redis()
    await r.delete(key)


def profile_key(site_id: str, anon_id: str) -> str:
    return f"profile:{site_id}:{anon_id}"


def apikey_key(api_key: str) -> str:
    return f"apikey:{api_key}"
