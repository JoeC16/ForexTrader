import { RenderingProfile } from "../types";

export function applySpeedBuyer(profile: RenderingProfile): string {
  const { cta_style } = profile;
  const copy = cta_style.copy ? `"${cta_style.copy}"` : null;

  return `
    /* NeuralRender: speed_buyer */
    [data-nr-cta="primary"],
    [data-nr-cta] {
      background-color: ${cta_style.color} !important;
      font-weight: 800 !important;
      padding: 1rem 2rem !important;
      font-size: 1.125rem !important;
      border-radius: 8px !important;
      border: none !important;
      cursor: pointer !important;
      color: #fff !important;
      box-shadow: 0 4px 14px ${cta_style.color}66 !important;
      transition: transform 0.15s !important;
    }
    [data-nr-cta="primary"]:hover,
    [data-nr-cta]:hover {
      transform: scale(1.04) !important;
    }
    ${copy ? `[data-nr-cta="primary"] { font-size: 0 !important; }
    [data-nr-cta="primary"]::after { content: ${copy}; font-size: 1.125rem; }` : ""}

    [data-nr-section="social-proof"] { display: none !important; }
    [data-nr-section="detailed-specs"] { display: none !important; }
    [data-nr-section="comparison"] { display: none !important; }

    [data-nr-urgency] { display: block !important; }
  `;
}
