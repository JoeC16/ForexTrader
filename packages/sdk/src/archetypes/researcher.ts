import { RenderingProfile } from "../types";

export function applyResearcher(profile: RenderingProfile): string {
  const { cta_style } = profile;
  const copy = cta_style.copy ? `"${cta_style.copy}"` : null;

  return `
    /* NeuralRender: researcher */
    [data-nr-cta="primary"],
    [data-nr-cta] {
      background-color: ${cta_style.color} !important;
      font-weight: 600 !important;
      padding: 0.75rem 1.5rem !important;
      border-radius: 6px !important;
      color: #fff !important;
    }
    ${copy ? `[data-nr-cta="primary"] { font-size: 0 !important; }
    [data-nr-cta="primary"]::after { content: ${copy}; font-size: 1rem; }` : ""}

    [data-nr-section="social-proof"] {
      order: -1 !important;
      border: 2px solid #e2e8f0 !important;
      padding: 1.5rem !important;
      border-radius: 8px !important;
      margin-bottom: 1.5rem !important;
    }
    [data-nr-section="comparison"] { display: block !important; }
    [data-nr-section="detailed-specs"] { display: block !important; }

    [data-nr-description] {
      -webkit-line-clamp: unset !important;
      overflow: visible !important;
      display: block !important;
    }
  `;
}
