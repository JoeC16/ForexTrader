from collections import defaultdict
from dataclasses import dataclass, field
from typing import Dict, Optional


@dataclass
class UserFeatures:
    avg_time_on_page: float = 0.0
    scroll_completion: float = 0.0
    cta_click_rate: float = 0.0
    pages_before_cta: int = 10
    review_section_views: int = 0
    session_count: int = 1
    promo_click_rate: float = 0.0
    cart_abandon_count: int = 0
    price_element_hovers: int = 0
    direct_traffic: bool = False
    return_visit_count: int = 0
    brand_page_views: int = 0
    device_type: str = "desktop"
    touch_events: int = 0
    event_count: int = 0
    raw: Dict = field(default_factory=dict)


@dataclass
class ArchetypeResult:
    archetype: str
    confidence: float
    scores: Dict[str, float] = field(default_factory=dict)
    model_version: str = "rules-v1"


ARCHETYPES = ["speed_buyer", "researcher", "deal_hunter", "brand_loyalist", "mobile_first"]

CONFIDENCE_THRESHOLD = 0.35


def classify_user(features: UserFeatures) -> ArchetypeResult:
    scores: Dict[str, float] = defaultdict(float)

    # Speed Buyer
    if features.avg_time_on_page < 30:
        scores["speed_buyer"] += 2.0
    if features.avg_time_on_page < 15:
        scores["speed_buyer"] += 1.0
    if features.scroll_completion < 0.4:
        scores["speed_buyer"] += 1.5
    if features.cta_click_rate > 0.3:
        scores["speed_buyer"] += 2.0
    if features.pages_before_cta < 2:
        scores["speed_buyer"] += 1.0

    # Researcher
    if features.avg_time_on_page > 120:
        scores["researcher"] += 2.0
    if features.avg_time_on_page > 60:
        scores["researcher"] += 1.0
    if features.scroll_completion > 0.8:
        scores["researcher"] += 1.5
    if features.review_section_views > 2:
        scores["researcher"] += 2.0
    if features.session_count > 3:
        scores["researcher"] += 1.5

    # Deal Hunter
    if features.promo_click_rate > 0.2:
        scores["deal_hunter"] += 2.5
    if features.cart_abandon_count > 1:
        scores["deal_hunter"] += 2.0
    if features.price_element_hovers > 3:
        scores["deal_hunter"] += 1.5

    # Brand Loyalist
    if features.direct_traffic:
        scores["brand_loyalist"] += 1.5
    if features.return_visit_count > 5:
        scores["brand_loyalist"] += 2.0
    if features.brand_page_views > 2:
        scores["brand_loyalist"] += 1.5

    # Mobile First
    if features.device_type == "mobile":
        scores["mobile_first"] += 3.0
    if features.touch_events > 0:
        scores["mobile_first"] += 2.0

    total = sum(scores.values())
    if total == 0 or not scores:
        return ArchetypeResult(archetype="unknown", confidence=0.0, scores={})

    top = max(scores, key=lambda k: scores[k])
    confidence = scores[top] / total

    if confidence < CONFIDENCE_THRESHOLD:
        return ArchetypeResult(archetype="unknown", confidence=confidence, scores=dict(scores))

    return ArchetypeResult(archetype=top, confidence=round(confidence, 3), scores=dict(scores))
