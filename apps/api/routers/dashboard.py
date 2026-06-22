from fastapi import APIRouter, Depends, HTTPException

from apps.api.db.connection import get_pool
from apps.api.routers.deps import require_internal_secret

router = APIRouter(prefix="/api/v1/dashboard", tags=["dashboard"], dependencies=[Depends(require_internal_secret)])


@router.get("/sites/{site_id}/overview")
async def site_overview(site_id: str, owner_email: str):
    pool = await get_pool()
    async with pool.acquire() as conn:
        owns = await conn.fetchval(
            """
            SELECT 1 FROM sites s JOIN users u ON u.id = s.owner_id
            WHERE s.id = $1 AND u.email = $2 AND s.deleted_at IS NULL
            """,
            site_id,
            owner_email,
        )
        if not owns:
            raise HTTPException(status_code=404, detail="Site not found")

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
