import { RenderingProfile } from "../types";

export function applyMobileFirst(profile: RenderingProfile): string {
  const { cta_style } = profile;
  const copy = cta_style.copy ? `"${cta_style.copy}"` : null;

  return `
    /* NeuralRender: mobile_first */
    @media (max-width: 767px) {
      [data-nr-cta="primary"],
      [data-nr-cta] {
        background-color: ${cta_style.color} !important;
        display: block !important;
        width: calc(100% - 2rem) !important;
        position: fixed !important;
        bottom: 1rem !important;
        left: 1rem !important;
        right: 1rem !important;
        z-index: 9999 !important;
        font-size: 1.125rem !important;
        font-weight: 700 !important;
        padding: 1rem !important;
        border-radius: 12px !important;
        color: #fff !important;
        text-align: center !important;
        border: none !important;
        box-shadow: 0 8px 24px rgba(0,0,0,0.2) !important;
      }
      ${copy ? `[data-nr-cta="primary"] { font-size: 0 !important; }
      [data-nr-cta="primary"]::after { content: ${copy}; font-size: 1.125rem; }` : ""}

      body { padding-bottom: 5rem !important; }

      button, a, input, [role=button] {
        min-height: 48px !important;
      }
    }
  `;
}
