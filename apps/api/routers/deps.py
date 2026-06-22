import hmac
import os

from fastapi import Header, HTTPException

from apps.api.cache.redis_client import cache_get, cache_set, apikey_key
from apps.api.db.connection import get_pool
from apps.api.models.site import hash_api_key

INTERNAL_API_SECRET = os.getenv("INTERNAL_API_SECRET", "")


async def resolve_site_id(x_site_key: str = Header(..., alias="X-Site-Key")) -> str:
    key_hash = hash_api_key(x_site_key)
    cache_key = apikey_key(key_hash)
    cached = await cache_get(cache_key)
    if cached:
        return cached["site_id"]

    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT id FROM sites WHERE api_key_hash = $1 AND deleted_at IS NULL",
            key_hash,
        )

    if not row:
        raise HTTPException(status_code=401, detail="Invalid API key")

    site_id = str(row["id"])
    await cache_set(cache_key, {"site_id": site_id}, ttl=300)
    return site_id


async def require_internal_secret(x_internal_secret: str = Header(..., alias="X-Internal-Secret")) -> None:
    if not INTERNAL_API_SECRET or not hmac.compare_digest(x_internal_secret, INTERNAL_API_SECRET):
        raise HTTPException(status_code=401, detail="Unauthorized")
