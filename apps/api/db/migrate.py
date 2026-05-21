"""Run all migrations in order against the configured DATABASE_URL."""
import asyncio
import os
import pathlib
import asyncpg
from dotenv import load_dotenv

load_dotenv()

MIGRATIONS_DIR = pathlib.Path(__file__).parent / "migrations"


async def run():
    url = os.getenv("DATABASE_URL", "postgresql://neuralrender:neuralrender@localhost:5432/neuralrender")
    conn = await asyncpg.connect(url)

    await conn.execute("""
        CREATE TABLE IF NOT EXISTS _migrations (
            filename TEXT PRIMARY KEY,
            applied_at TIMESTAMPTZ DEFAULT now()
        )
    """)

    applied = {r["filename"] for r in await conn.fetch("SELECT filename FROM _migrations")}
    files = sorted(MIGRATIONS_DIR.glob("*.sql"))

    for f in files:
        if f.name in applied:
            print(f"  skip  {f.name}")
            continue
        print(f"  apply {f.name}")
        sql = f.read_text()
        await conn.execute(sql)
        await conn.execute("INSERT INTO _migrations (filename) VALUES ($1)", f.name)

    await conn.close()
    print("Migrations complete.")


if __name__ == "__main__":
    asyncio.run(run())
