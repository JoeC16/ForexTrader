import os
from fastapi import APIRouter, HTTPException
from apps.api.db.connection import get_pool
from apps.api.models.site import SiteCreate, SiteResponse, generate_api_key, build_embed_snippet

router = APIRouter(prefix="/api/v1", tags=["sites"])

SDK_URL = os.getenv("NEXT_PUBLIC_SDK_URL", "https://cdn.neuralrender.com/collect.js")


@router.post("/sites", response_model=SiteResponse, status_code=201)
async def create_site(payload: SiteCreate):
    pool = await get_pool()
    api_key = generate_api_key()

    async with pool.acquire() as conn:
        # For MVP: auto-create a user if none exists (replace with real auth)
        user = await conn.fetchrow("SELECT id FROM users LIMIT 1")
        if not user:
            user = await conn.fetchrow(
                "INSERT INTO users (email) VALUES ('demo@neuralrender.com') RETURNING id"
            )
        owner_id = user["id"]

        row = await conn.fetchrow(
            """
            INSERT INTO sites (owner_id, name, domain, api_key)
            VALUES ($1, $2, $3, $4)
            RETURNING id
            """,
            owner_id,
            payload.name,
            payload.domain,
            api_key,
        )

    site_id = str(row["id"])
    return SiteResponse(
        id=site_id,
        name=payload.name,
        domain=payload.domain,
        api_key=api_key,
        embed_snippet=build_embed_snippet(site_id, api_key, SDK_URL),
    )


@router.get("/sites/{site_id}")
async def get_site(site_id: str):
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT id, name, domain, api_key, config FROM sites WHERE id=$1 AND deleted_at IS NULL",
            site_id,
        )
    if not row:
        raise HTTPException(status_code=404, detail="Site not found")
    return {"id": str(row["id"]), "name": row["name"], "domain": row["domain"], "config": row["config"]}
