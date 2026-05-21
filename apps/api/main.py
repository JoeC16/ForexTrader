import os
import sys

# Allow imports from repo root
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../.."))

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from apps.api.db.connection import close_pool
from apps.api.routers import events, profiles, sites, dashboard

app = FastAPI(title="NeuralRender API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(events.router)
app.include_router(profiles.router)
app.include_router(sites.router)
app.include_router(dashboard.router)


@app.on_event("shutdown")
async def shutdown():
    await close_pool()


@app.get("/health")
def health():
    return {"status": "ok", "service": "neuralrender-api"}
