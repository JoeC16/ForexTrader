from fastapi import APIRouter, Depends

from apps.api.routers.deps import resolve_site_id
from apps.api.services.profile_service import get_profile

router = APIRouter(prefix="/api/v1", tags=["profiles"])


@router.get("/profile/{site_id}/{anon_id}")
async def get_visitor_profile(
    site_id: str,
    anon_id: str,
    _: str = Depends(resolve_site_id),
):
    return await get_profile(site_id, anon_id)
