from typing import Dict
from .classifier import ArchetypeResult

ARCHETYPE_PROFILES: Dict[str, dict] = {
    "speed_buyer": {
        "cta_style": {"color": "#FF4500", "size": "lg", "copy": "Get Started Now"},
        "layout_density": "minimal",
        "social_proof": "hidden",
        "urgency_elements": True,
        "content_order": ["hero", "cta", "features", "social-proof"],
        "hero_type": "text-first",
    },
    "researcher": {
        "cta_style": {"color": "#2563eb", "size": "md", "copy": "See Full Details"},
        "layout_density": "detailed",
        "social_proof": "prominent",
        "urgency_elements": False,
        "content_order": ["hero", "features", "social-proof", "comparison", "cta"],
        "hero_type": "image-first",
    },
    "deal_hunter": {
        "cta_style": {"color": "#16a34a", "size": "lg", "copy": "Claim Your Deal"},
        "layout_density": "normal",
        "social_proof": "normal",
        "urgency_elements": True,
        "content_order": ["promo", "hero", "cta", "features"],
        "hero_type": "text-first",
    },
    "brand_loyalist": {
        "cta_style": {"color": "#1e1e2e", "size": "md", "copy": "Continue"},
        "layout_density": "spacious",
        "social_proof": "normal",
        "urgency_elements": False,
        "content_order": ["hero", "brand-story", "features", "cta"],
        "hero_type": "image-first",
    },
    "mobile_first": {
        "cta_style": {"color": "#7c3aed", "size": "full", "copy": "Get Started"},
        "layout_density": "compact",
        "social_proof": "normal",
        "urgency_elements": False,
        "content_order": ["cta", "hero", "features"],
        "hero_type": "text-first",
    },
    "unknown": {
        "cta_style": {"color": "#6366f1", "size": "md", "copy": None},
        "layout_density": "normal",
        "social_proof": "normal",
        "urgency_elements": False,
        "content_order": ["hero", "features", "cta", "social-proof"],
        "hero_type": "image-first",
    },
}


def archetype_to_rendering_profile(result: ArchetypeResult) -> dict:
    base = ARCHETYPE_PROFILES.get(result.archetype, ARCHETYPE_PROFILES["unknown"])
    return {
        "archetype": result.archetype,
        "confidence": result.confidence,
        "model_version": result.model_version,
        **base,
    }
