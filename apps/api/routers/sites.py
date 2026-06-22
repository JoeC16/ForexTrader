import os
from typing import List

from fastapi import APIRouter, Depends, HTTPException

from apps.api.db.connection import get_pool
from apps.api.models.site import (
    SiteCreate,
    SiteResponse,
    SiteSummary,
    build_embed_snippet,
    generate_api_key,
    hash_api_key,
    key_prefix,
)
from apps.api.routers.deps import require_internal_secret

router = APIRouter(prefix="/api/v1", tags=["sites"], dependencies=[Depends(require_internal_secret)])

SDK_URL = os.getenv("NEXT_PUBLIC_SDK_URL", "https://cdn.neuralrender.com/collect.js")


@router.post("/sites", response_model=SiteResponse, status_code=201)
async def create_site(payload: SiteCreate):
    pool = await get_pool()
    api_key = generate_api_key()

    async with pool.acquire() as conn:
        async with conn.transaction():
            user = await conn.fetchrow(
                "SELECT id FROM users WHERE email = $1", payload.owner_email
            )
            if not user:
                user = await conn.fetchrow(
                    "INSERT INTO users (email) VALUES ($1) RETURNING id", payload.owner_email
                )
            owner_id = user["id"]

            row = await conn.fetchrow(
                """
                INSERT INTO sites (owner_id, name, domain, api_key_hash, api_key_prefix)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id
                """,
                owner_id,
                payload.name,
                payload.domain,
                hash_api_key(api_key),
                key_prefix(api_key),
            )

    site_id = str(row["id"])
    return SiteResponse(
        id=site_id,
        name=payload.name,
        domain=payload.domain,
        api_key=api_key,
        embed_snippet=build_embed_snippet(site_id, api_key, SDK_URL),
    )


@router.get("/sites", response_model=List[SiteSummary])
async def list_sites(owner_email: str):
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT s.id, s.name, s.domain, s.api_key_prefix
            FROM sites s
            JOIN users u ON u.id = s.owner_id
            WHERE u.email = $1 AND s.deleted_at IS NULL
            ORDER BY s.created_at DESC
            """,
            owner_email,
        )
    return [
        SiteSummary(id=str(r["id"]), name=r["name"], domain=r["domain"], api_key_prefix=r["api_key_prefix"])
        for r in rows
    ]


@router.get("/sites/{site_id}")
async def get_site(site_id: str, owner_email: str):
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            SELECT s.id, s.name, s.domain, s.config
            FROM sites s
            JOIN users u ON u.id = s.owner_id
            WHERE s.id = $1 AND u.email = $2 AND s.deleted_at IS NULL
            """,
            site_id,
            owner_email,
        )
    if not row:
        raise HTTPException(status_code=404, detail="Site not found")
    return {"id": str(row["id"]), "name": row["name"], "domain": row["domain"], "config": row["config"]}
