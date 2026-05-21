import { RenderingProfile } from "./types";
import { applySpeedBuyer } from "./archetypes/speed-buyer";
import { applyResearcher } from "./archetypes/researcher";
import { applyDealHunter } from "./archetypes/deal-hunter";
import { applyBrandLoyalist } from "./archetypes/brand-loyalist";
import { applyMobileFirst } from "./archetypes/mobile-first";

const STYLE_ID = "_nr_styles";

const ARCHETYPE_FNS: Record<string, (p: RenderingProfile) => string> = {
  speed_buyer: applySpeedBuyer,
  researcher: applyResearcher,
  deal_hunter: applyDealHunter,
  brand_loyalist: applyBrandLoyalist,
  mobile_first: applyMobileFirst,
};

export function applyProfile(profile: RenderingProfile): void {
  removeStyles();
  if (profile.archetype === "unknown" || profile.confidence < 0.35) return;

  const fn = ARCHETYPE_FNS[profile.archetype];
  if (!fn) return;

  const css = fn(profile);
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = css;
  document.head.appendChild(style);

  document.dispatchEvent(
    new CustomEvent("nr:profile-applied", { detail: { archetype: profile.archetype, confidence: profile.confidence } }),
  );
}

export function removeStyles(): void {
  document.getElementById(STYLE_ID)?.remove();
}
