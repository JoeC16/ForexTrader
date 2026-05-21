import json
import sys
import os
from datetime import datetime, timezone
from typing import Optional

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../../.."))

from packages.ml.serving.classifier import classify_user
from packages.ml.serving.feature_builder import build_features
from packages.ml.serving.rendering_mapper import archetype_to_rendering_profile

from apps.api.cache.redis_client import cache_get, cache_set, profile_key
from apps.api.db.connection import get_pool
from apps.api.models.profile import RenderingProfile, CTAStyle


async def get_profile(site_id: str, anon_id: str) -> dict:
    key = profile_key(site_id, anon_id)
    cached = await cache_get(key)
    if cached:
        return cached

    profile = await _compute_profile(site_id, anon_id)
    await cache_set(key, profile, ttl=900)
    return profile


async def invalidate_profile(site_id: str, anon_id: str) -> None:
    from apps.api.cache.redis_client import cache_del
    await cache_del(profile_key(site_id, anon_id))


async def _compute_profile(site_id: str, anon_id: str) -> dict:
    pool = await get_pool()

    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT event_type, properties, client_ts
            FROM events
            WHERE site_id = $1 AND anon_id = $2
            ORDER BY client_ts DESC
            LIMIT 200
            """,
            site_id,
            anon_id,
        )
        vp = await conn.fetchrow(
            "SELECT event_count, created_at FROM visitor_profiles WHERE site_id=$1 AND anon_id=$2",
            site_id,
            anon_id,
        )

    events = [{"event_type": r["event_type"], "properties": r["properties"]} for r in rows]
    features = build_features(events)

    result = classify_user(features)
    rendering = archetype_to_rendering_profile(result)

    event_count = vp["event_count"] if vp else len(events)
    profile_age = 0
    if vp and vp["created_at"]:
        age = datetime.now(timezone.utc) - vp["created_at"]
        profile_age = int(age.total_seconds())

    rendering["event_count"] = event_count
    rendering["profile_age_seconds"] = profile_age

    return rendering
