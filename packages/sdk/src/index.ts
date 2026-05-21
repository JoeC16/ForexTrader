import { getOrCreateAnonId, getSessionId } from "./fingerprint";
import { Collector } from "./collector";
import { fetchProfile } from "./profile-fetcher";
import { applyProfile } from "./dom-modifier";
import { NRConfig, RenderingProfile } from "./types";

declare global {
  interface Window {
    NeuralRender: NeuralRenderSDK;
    _nr_config?: Partial<NRConfig>;
  }
}

class NeuralRenderSDK {
  private config!: NRConfig;
  private collector!: Collector;
  private profile: RenderingProfile | null = null;

  init(config: NRConfig): void {
    this.config = config;
    const anonId = getOrCreateAnonId();
    const sessionId = getSessionId();

    this.collector = new Collector(anonId, sessionId, config);
    this.collector.start();

    fetchProfile(config, anonId).then((p) => {
      this.profile = p;
      applyProfile(p);
    });
  }

  track(event: string, properties: Record<string, unknown> = {}): void {
    this.collector?.track(event, properties);
  }

  identify(userId: string, traits: Record<string, unknown> = {}): void {
    const anonId = getOrCreateAnonId();
    fetch(`${this.config.apiBase}/api/v1/identify`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Site-Key": this.config.apiKey },
      body: JSON.stringify({ anon_id: anonId, user_id: userId, traits }),
    }).catch(() => {});
  }

  getProfile(): RenderingProfile | null {
    return this.profile;
  }
}

function autoInit(): void {
  const script = document.currentScript as HTMLScriptElement | null;
  const siteId = script?.dataset.siteId ?? window._nr_config?.siteId ?? "";
  const apiKey = script?.dataset.apiKey ?? window._nr_config?.apiKey ?? "";
  const apiBase =
    script?.dataset.apiBase ??
    window._nr_config?.apiBase ??
    "https://api.neuralrender.com";

  if (!siteId || !apiKey) {
    console.warn("[NeuralRender] Missing data-site-id or data-api-key on script tag.");
    return;
  }

  window.NeuralRender = new NeuralRenderSDK();
  window.NeuralRender.init({ siteId, apiKey, apiBase });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", autoInit);
} else {
  autoInit();
}

export default NeuralRenderSDK;
