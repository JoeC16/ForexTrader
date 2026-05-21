from fastapi import APIRouter, HTTPException
from apps.api.db.connection import get_pool

router = APIRouter(prefix="/api/v1/dashboard", tags=["dashboard"])


@router.get("/sites/{site_id}/overview")
async def site_overview(site_id: str):
    pool = await get_pool()
    async with pool.acquire() as conn:
        total = await conn.fetchval(
            "SELECT COUNT(*) FROM visitor_profiles WHERE site_id=$1", site_id
        )
        archetypes = await conn.fetch(
            """
            SELECT archetype, COUNT(*) as count
            FROM visitor_profiles
            WHERE site_id=$1 AND archetype IS NOT NULL
            GROUP BY archetype
            ORDER BY count DESC
            """,
            site_id,
        )
        daily = await conn.fetch(
            """
            SELECT DATE(server_ts) as day, COUNT(*) as events
            FROM events
            WHERE site_id=$1 AND server_ts > now() - interval '30 days'
            GROUP BY day
            ORDER BY day
            """,
            site_id,
        )

    return {
        "total_visitors": total,
        "archetype_breakdown": [{"archetype": r["archetype"], "count": r["count"]} for r in archetypes],
        "daily_events": [{"day": str(r["day"]), "events": r["events"]} for r in daily],
    }
