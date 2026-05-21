import { NRConfig, RenderingProfile } from "./types";

const DEFAULT_PROFILE: RenderingProfile = {
  archetype: "unknown",
  confidence: 0,
  cta_style: { color: "#6366f1", size: "md", copy: null },
  layout_density: "normal",
  social_proof: "normal",
  urgency_elements: false,
  content_order: ["hero", "features", "cta", "social-proof"],
  hero_type: "image-first",
  event_count: 0,
  model_version: "default",
};

export async function fetchProfile(
  config: NRConfig,
  anonId: string,
): Promise<RenderingProfile> {
  try {
    const res = await fetch(
      `${config.apiBase}/api/v1/profile/${config.siteId}/${encodeURIComponent(anonId)}`,
      {
        headers: { "X-Site-Key": config.apiKey },
      },
    );
    if (!res.ok) return DEFAULT_PROFILE;
    return (await res.json()) as RenderingProfile;
  } catch {
    return DEFAULT_PROFILE;
  }
}
