import os

from slowapi import Limiter
from slowapi.util import get_remote_address


def _site_key_or_ip(request) -> str:
    site_key = request.headers.get("x-site-key")
    return site_key or get_remote_address(request)


limiter = Limiter(
    key_func=_site_key_or_ip,
    storage_uri=os.getenv("REDIS_URL", "redis://localhost:6379"),
)
