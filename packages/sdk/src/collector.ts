import { NREvent, NRConfig } from "./types";

const CTA_PATTERN = /buy|get|start|sign|join|try|order|checkout|subscribe|purchase/i;
const BATCH_SIZE = 20;
const FLUSH_INTERVAL = 5000;

export class Collector {
  private queue: NREvent[] = [];
  private timer: ReturnType<typeof setInterval> | null = null;
  private pageStart = Date.now();
  private maxScroll = 0;
  private scrollMilestones = new Set<number>();

  constructor(
    private readonly anon_id: string,
    private readonly session_id: string,
    private readonly config: NRConfig,
  ) {}

  start(): void {
    this.track("page_view", { referrer: document.referrer, device_type: this.deviceType() });

    document.addEventListener("click", this.onClick, { passive: true });
    document.addEventListener("scroll", this.onScroll, { passive: true });
    document.addEventListener("visibilitychange", this.onVisibility);
    window.addEventListener("beforeunload", this.onUnload);

    this.setupIntersectionObserver();
    this.timer = setInterval(() => this.flush(), FLUSH_INTERVAL);
  }

  track(type: string, properties: Record<string, unknown> = {}): void {
    this.queue.push({ type, timestamp: Date.now(), url: location.href, properties });
    if (this.queue.length >= BATCH_SIZE) this.flush();
  }

  private onClick = (e: MouseEvent): void => {
    const el = e.target as HTMLElement;
    if (!el) return;
    const text = (el.textContent || "").trim().slice(0, 80);
    const isCta =
      el.matches("button, [role=button], input[type=submit]") ||
      CTA_PATTERN.test(text) ||
      !!el.closest("[data-nr-cta]");

    this.track("click", {
      element_type: el.tagName.toLowerCase(),
      element_text: text,
      css_selector: el.getAttribute("data-nr-cta") ? `[data-nr-cta]` : el.tagName.toLowerCase(),
      is_cta: isCta,
    });
  };

  private onScroll = (): void => {
    const docH = Math.max(document.body.scrollHeight, 1);
    const pct = Math.min(100, Math.round(((window.scrollY + window.innerHeight) / docH) * 100));
    if (pct > this.maxScroll) this.maxScroll = pct;

    for (const milestone of [25, 50, 75, 90, 100]) {
      if (pct >= milestone && !this.scrollMilestones.has(milestone)) {
        this.scrollMilestones.add(milestone);
        this.track("scroll_depth", { depth_pct: milestone });
      }
    }
  };

  private onVisibility = (): void => {
    if (document.visibilityState === "hidden") {
      this.track("dwell_time", {
        seconds_on_page: Math.round((Date.now() - this.pageStart) / 1000),
      });
      this.flush(true);
    }
  };

  private onUnload = (): void => {
    this.flush(true);
  };

  private setupIntersectionObserver(): void {
    if (!window.IntersectionObserver) return;
    const sections = document.querySelectorAll("[data-nr-section]");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            this.track("element_visible", { element_selector: el.dataset.nrSection });
            observer.unobserve(el);
          }
        }
      },
      { threshold: 0.3 },
    );
    sections.forEach((el) => observer.observe(el));
  }

  private deviceType(): string {
    const w = window.innerWidth;
    if (w < 768) return "mobile";
    if (w < 1024) return "tablet";
    return "desktop";
  }

  flush(beacon = false): void {
    if (this.queue.length === 0) return;
    const payload = JSON.stringify({
      anon_id: this.anon_id,
      session_id: this.session_id,
      events: this.queue.splice(0),
    });
    const url = `${this.config.apiBase}/api/v1/events`;
    const headers = { "Content-Type": "application/json", "X-Site-Key": this.config.apiKey };

    if (beacon && navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "application/json" });
      navigator.sendBeacon(url, blob);
    } else {
      fetch(url, { method: "POST", headers, body: payload, keepalive: true }).catch(() => {});
    }
  }

  destroy(): void {
    if (this.timer) clearInterval(this.timer);
    document.removeEventListener("click", this.onClick);
    document.removeEventListener("scroll", this.onScroll);
    document.removeEventListener("visibilitychange", this.onVisibility);
    window.removeEventListener("beforeunload", this.onUnload);
  }
}
