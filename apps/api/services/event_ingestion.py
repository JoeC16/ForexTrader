import json
from datetime import datetime, timezone
from typing import List

from apps.api.db.connection import get_pool
from apps.api.models.event import EventBatch, RawEvent


async def ingest_events(site_id: str, batch: EventBatch) -> int:
    pool = await get_pool()
    now = datetime.now(timezone.utc)

    rows = [
        (
            site_id,
            batch.anon_id,
            batch.session_id,
            ev.type,
            ev.url,
            json.dumps(ev.properties),
            datetime.fromtimestamp(ev.timestamp / 1000, tz=timezone.utc),
            now,
        )
        for ev in batch.events
    ]

    async with pool.acquire() as conn:
        await conn.executemany(
            """
            INSERT INTO events (site_id, anon_id, session_id, event_type, url, properties, client_ts, server_ts)
            VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8)
            """,
            rows,
        )
        await conn.execute(
            """
            INSERT INTO visitor_profiles (site_id, anon_id, event_count, last_seen_at)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (site_id, anon_id) DO UPDATE
            SET event_count = visitor_profiles.event_count + $3,
                last_seen_at = $4
            """,
            site_id,
            batch.anon_id,
            len(batch.events),
            now,
        )

    return len(rows)
