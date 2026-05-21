from pydantic import BaseModel
from typing import Optional
import secrets


class SiteCreate(BaseModel):
    name: str
    domain: str


class SiteResponse(BaseModel):
    id: str
    name: str
    domain: str
    api_key: str
    embed_snippet: str


def generate_api_key() -> str:
    return f"nr_live_{secrets.token_urlsafe(32)}"


def build_embed_snippet(site_id: str, api_key: str, sdk_url: str = "https://cdn.neuralrender.com/collect.js") -> str:
    return f'<script src="{sdk_url}" data-site-id="{site_id}" data-api-key="{api_key}" async></script>'
