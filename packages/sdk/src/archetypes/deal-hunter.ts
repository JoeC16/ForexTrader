import { RenderingProfile } from "../types";

export function applyDealHunter(profile: RenderingProfile): string {
  const { cta_style } = profile;
  const copy = cta_style.copy ? `"${cta_style.copy}"` : null;

  return `
    /* NeuralRender: deal_hunter */
    [data-nr-cta="primary"],
    [data-nr-cta] {
      background-color: ${cta_style.color} !important;
      font-weight: 700 !important;
      padding: 0.9rem 1.75rem !important;
      border-radius: 6px !important;
      color: #fff !important;
    }
    ${copy ? `[data-nr-cta="primary"] { font-size: 0 !important; }
    [data-nr-cta="primary"]::after { content: ${copy}; font-size: 1rem; }` : ""}

    [data-nr-urgency] {
      display: block !important;
      background: #fef3c7 !important;
      border-left: 4px solid #f59e0b !important;
      padding: 0.75rem 1rem !important;
      font-weight: 600 !important;
      margin-bottom: 1rem !important;
    }
    [data-nr-section="promo"] {
      position: sticky !important;
      top: 0 !important;
      z-index: 999 !important;
      background: #16a34a !important;
      color: white !important;
      padding: 0.5rem 1rem !important;
      text-align: center !important;
    }
  `;
}
