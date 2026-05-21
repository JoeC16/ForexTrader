import { RenderingProfile } from "../types";

export function applyBrandLoyalist(profile: RenderingProfile): string {
  const { cta_style } = profile;
  const copy = cta_style.copy ? `"${cta_style.copy}"` : null;

  return `
    /* NeuralRender: brand_loyalist */
    [data-nr-cta="primary"],
    [data-nr-cta] {
      background-color: ${cta_style.color} !important;
      font-weight: 500 !important;
      padding: 0.875rem 2.5rem !important;
      border-radius: 4px !important;
      color: #fff !important;
      letter-spacing: 0.05em !important;
    }
    ${copy ? `[data-nr-cta="primary"] { font-size: 0 !important; }
    [data-nr-cta="primary"]::after { content: ${copy}; font-size: 1rem; }` : ""}

    [data-nr-urgency] { display: none !important; }
    [data-nr-section="promo"] { display: none !important; }
    [data-nr-section="brand-story"] { display: block !important; }

    body { letter-spacing: 0.01em; line-height: 1.7; }
  `;
}
