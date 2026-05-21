from fastapi import APIRouter, Depends

from apps.api.models.event import EventBatch
from apps.api.services.event_ingestion import ingest_events
from apps.api.routers.deps import resolve_site_id

router = APIRouter(prefix="/api/v1", tags=["events"])


@router.post("/events", status_code=202)
async def post_events(
    batch: EventBatch,
    site_id: str = Depends(resolve_site_id),
):
    count = await ingest_events(site_id, batch)
    return {"received": count}
