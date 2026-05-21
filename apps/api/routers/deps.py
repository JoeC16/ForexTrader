from fastapi import Header, HTTPException
from apps.api.cache.redis_client import cache_get, cache_set, apikey_key
from apps.api.db.connection import get_pool


async def resolve_site_id(x_site_key: str = Header(..., alias="X-Site-Key")) -> str:
    cache_key = apikey_key(x_site_key)
    cached = await cache_get(cache_key)
    if cached:
        return cached["site_id"]

    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT id FROM sites WHERE api_key = $1 AND deleted_at IS NULL",
            x_site_key,
        )

    if not row:
        raise HTTPException(status_code=401, detail="Invalid API key")

    site_id = str(row["id"])
    await cache_set(cache_key, {"site_id": site_id}, ttl=300)
    return site_id
