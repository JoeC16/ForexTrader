from fastapi import APIRouter, Depends, Request

from apps.api.models.event import EventBatch
from apps.api.services.event_ingestion import ingest_events
from apps.api.routers.deps import resolve_site_id
from apps.api.rate_limit import limiter

router = APIRouter(prefix="/api/v1", tags=["events"])


@router.post("/events", status_code=202)
@limiter.limit("120/minute")
async def post_events(
    request: Request,
    batch: EventBatch,
    site_id: str = Depends(resolve_site_id),
):
    count = await ingest_events(site_id, batch)
    return {"received": count}
