export interface CTAStyle {
  color: string;
  size: "sm" | "md" | "lg" | "full";
  copy: string | null;
}

export interface RenderingProfile {
  archetype: "speed_buyer" | "researcher" | "deal_hunter" | "brand_loyalist" | "mobile_first" | "unknown";
  confidence: number;
  cta_style: CTAStyle;
  layout_density: "minimal" | "compact" | "normal" | "detailed" | "spacious";
  social_proof: "prominent" | "normal" | "hidden";
  urgency_elements: boolean;
  content_order: string[];
  hero_type: "image-first" | "text-first";
  event_count: number;
  model_version: string;
}

export interface NREvent {
  type: string;
  timestamp: number;
  url: string;
  properties: Record<string, unknown>;
}

export interface NRConfig {
  siteId: string;
  apiKey: string;
  apiBase: string;
}
