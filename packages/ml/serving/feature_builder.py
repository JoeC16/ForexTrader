from typing import Any, Dict, List
from .classifier import UserFeatures

CTA_PATTERN = {"buy", "get", "start", "sign", "join", "try", "order", "checkout", "subscribe", "purchase"}


def build_features(events: List[Dict[str, Any]]) -> UserFeatures:
    if not events:
        return UserFeatures()

    page_view_times: List[float] = []
    scroll_depths: List[float] = []
    cta_clicks = 0
    total_clicks = 0
    promo_clicks = 0
    review_views = 0
    brand_views = 0
    price_hovers = 0
    cart_abandons = 0
    touch_count = 0
    pages_before_cta = 0
    found_cta = False
    device_type = "desktop"

    for ev in events:
        etype = ev.get("event_type", "")
        props = ev.get("properties", {})

        if etype == "dwell_time":
            secs = props.get("seconds_on_page", 0)
            if secs > 0:
                page_view_times.append(float(secs))

        elif etype == "scroll_depth":
            depth = props.get("depth_pct", 0)
            if depth > 0:
                scroll_depths.append(float(depth) / 100.0)

        elif etype == "click":
            total_clicks += 1
            text = (props.get("element_text") or "").lower()
            if props.get("is_cta") or any(kw in text for kw in CTA_PATTERN):
                cta_clicks += 1
                if not found_cta:
                    found_cta = True
            selector = (props.get("css_selector") or "").lower()
            if "promo" in selector or "discount" in selector or "sale" in selector:
                promo_clicks += 1

        elif etype == "element_visible":
            selector = (props.get("element_selector") or "").lower()
            if "review" in selector or "testimonial" in selector or "rating" in selector:
                review_views += 1
            if "brand" in selector or "about" in selector or "story" in selector:
                brand_views += 1

        elif etype == "price_hover":
            price_hovers += 1

        elif etype == "form_abandon":
            cart_abandons += 1

        elif etype == "touch":
            touch_count += 1

        elif etype == "page_view":
            if not found_cta:
                pages_before_cta += 1
            dev = props.get("device_type", "desktop")
            if dev:
                device_type = dev

    avg_time = sum(page_view_times) / len(page_view_times) if page_view_times else 0.0
    avg_scroll = sum(scroll_depths) / len(scroll_depths) if scroll_depths else 0.0
    cta_rate = cta_clicks / total_clicks if total_clicks > 0 else 0.0
    promo_rate = promo_clicks / total_clicks if total_clicks > 0 else 0.0

    return UserFeatures(
        avg_time_on_page=avg_time,
        scroll_completion=avg_scroll,
        cta_click_rate=cta_rate,
        pages_before_cta=pages_before_cta,
        review_section_views=review_views,
        promo_click_rate=promo_rate,
        cart_abandon_count=cart_abandons,
        price_element_hovers=price_hovers,
        brand_page_views=brand_views,
        touch_events=touch_count,
        device_type=device_type,
        event_count=len(events),
    )
