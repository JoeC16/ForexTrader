import hashlib
import secrets

from pydantic import BaseModel


class SiteCreate(BaseModel):
    name: str
    domain: str
    owner_email: str


class SiteResponse(BaseModel):
    id: str
    name: str
    domain: str
    api_key: str
    embed_snippet: str


class SiteSummary(BaseModel):
    id: str
    name: str
    domain: str
    api_key_prefix: str


def generate_api_key() -> str:
    return f"nr_live_{secrets.token_urlsafe(32)}"


def hash_api_key(api_key: str) -> str:
    return hashlib.sha256(api_key.encode()).hexdigest()


def key_prefix(api_key: str, length: int = 12) -> str:
    return api_key[:length]


def build_embed_snippet(site_id: str, api_key: str, sdk_url: str = "https://cdn.neuralrender.com/collect.js") -> str:
    return f'<script src="{sdk_url}" data-site-id="{site_id}" data-api-key="{api_key}" async></script>'
