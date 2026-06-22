from pydantic import BaseModel, ConfigDict
from typing import List, Optional


class CTAStyle(BaseModel):
    color: str = "#6366f1"
    size: str = "md"
    copy: Optional[str] = None


class RenderingProfile(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    archetype: str = "unknown"
    confidence: float = 0.0
    cta_style: CTAStyle = CTAStyle()
    layout_density: str = "normal"
    social_proof: str = "normal"
    urgency_elements: bool = False
    content_order: List[str] = ["hero", "features", "cta", "social-proof"]
    hero_type: str = "image-first"
    profile_age_seconds: int = 0
    event_count: int = 0
    model_version: str = "rules-v1"
