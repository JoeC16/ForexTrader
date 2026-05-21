"use client";

import { useState, useEffect, useRef } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

const ARCHETYPE_META: Record<string, { label: string; color: string; icon: string; tip: string }> = {
  speed_buyer: { label: "Speed Buyer", color: "#FF4500", icon: "⚡", tip: "Click the CTA fast, 3+ times" },
  researcher: { label: "Researcher", color: "#2563eb", icon: "🔍", tip: "Scroll slowly, dwell on sections" },
  deal_hunter: { label: "Deal Hunter", color: "#16a34a", icon: "🏷️", tip: "Click the pricing / promo area" },
  brand_loyalist: { label: "Brand Loyalist", color: "#1e1e2e", icon: "👑", tip: "Return multiple times" },
  mobile_first: { label: "Mobile First", color: "#7c3aed", icon: "📱", tip: "Resize to mobile width" },
  unknown: { label: "Detecting…", color: "#94a3b8", icon: "🧠", tip: "Interact with the page below" },
};

interface Profile {
  archetype: string;
  confidence: number;
  cta_style: { color: string; size: string; copy: string | null };
  urgency_elements: boolean;
  social_proof: string;
  event_count: number;
}

const DEMO_SITE_ID = "00000000-0000-0000-0000-000000000002";
const DEMO_API_KEY = "nr_demo";

export default function DemoPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [events, setEvents] = useState<string[]>([]);
  const [clickCount, setClickCount] = useState(0);
  const [scrollPct, setScrollPct] = useState(0);
  const anonId = useRef(`demo_${Math.random().toString(36).slice(2)}`);
  const sessionId = useRef(`s_${Date.now().toString(36)}`);

  const logEvent = (msg: string) =>
    setEvents((prev) => [`${new Date().toLocaleTimeString()} ${msg}`, ...prev].slice(0, 12));

  const sendEvent = async (type: string, properties: Record<string, unknown> = {}) => {
    logEvent(`→ ${type}`);
    try {
      await fetch(`${API_BASE}/api/v1/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Site-Key": DEMO_API_KEY },
        body: JSON.stringify({
          anon_id: anonId.current,
          session_id: sessionId.current,
          events: [{ type, timestamp: Date.now(), url: "/demo", properties }],
        }),
      });
    } catch {}
  };

  const refreshProfile = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/api/v1/profile/${DEMO_SITE_ID}/${anonId.current}`,
        { headers: { "X-Site-Key": DEMO_API_KEY } },
      );
      if (res.ok) {
        const p = await res.json();
        setProfile(p);
        logEvent(`← profile: ${p.archetype} (${Math.round(p.confidence * 100)}%)`);
      }
    } catch {}
  };

  useEffect(() => {
    sendEvent("page_view", { device_type: window.innerWidth < 768 ? "mobile" : "desktop" });
    refreshProfile();

    const interval = setInterval(refreshProfile, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleCtaClick = async () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    await sendEvent("click", { is_cta: true, element_text: "Buy Now" });
    if (newCount >= 3) {
      await sendEvent("dwell_time", { seconds_on_page: 8 });
    }
    await refreshProfile();
  };

  const handleScroll = async () => {
    const el = document.getElementById("demo-content");
    if (!el) return;
    const pct = Math.round((window.scrollY / (el.scrollHeight - window.innerHeight + 1)) * 100);
    setScrollPct(Math.min(100, pct));
    if (pct > 60) {
      await sendEvent("scroll_depth", { depth_pct: 75 });
      await sendEvent("element_visible", { element_selector: "social-proof" });
      await sendEvent("dwell_time", { seconds_on_page: 90 });
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const meta = ARCHETYPE_META[profile?.archetype ?? "unknown"] ?? ARCHETYPE_META.unknown;
  const ctaColor = profile?.cta_style?.color ?? "#6366f1";
  const ctaCopy = profile?.cta_style?.copy ?? "Get Started";

  return (
    <div id="demo-content" className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <span className="font-bold text-lg">
          Neural<span className="text-brand">Render</span>{" "}
          <span className="text-slate-400 font-normal text-sm">— Live Demo</span>
        </span>
        <a href="/" className="text-sm text-slate-500 hover:text-slate-900">← Back</a>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Profile Panel */}
        <div className="lg:col-span-1 space-y-4">
          {/* Archetype card */}
          <div className="bg-white rounded-2xl border p-6 shadow-sm">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Detected Archetype
            </div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{meta.icon}</span>
              <div>
                <div className="font-bold text-xl" style={{ color: meta.color }}>
                  {meta.label}
                </div>
                <div className="text-sm text-slate-400">
                  {profile ? `${Math.round(profile.confidence * 100)}% confidence` : "—"}
                </div>
              </div>
            </div>

            {/* Confidence bar */}
            <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.round((profile?.confidence ?? 0) * 100)}%`,
                  background: meta.color,
                }}
              />
            </div>

            <div className="mt-4 text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2">
              <span className="font-medium">Tip:</span> {meta.tip}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-2xl border p-4 shadow-sm">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Signal Strength
            </div>
            <div className="space-y-3 text-sm">
              <Stat label="Events sent" value={String(profile?.event_count ?? 0)} />
              <Stat label="CTA clicks" value={String(clickCount)} />
              <Stat label="Scroll depth" value={`${scrollPct}%`} />
            </div>
          </div>

          {/* Event log */}
          <div className="bg-slate-900 rounded-2xl p-4">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Event Log
            </div>
            <div className="space-y-1 font-mono text-xs text-green-400 max-h-48 overflow-y-auto">
              {events.length === 0 && <div className="text-slate-600">Waiting for events…</div>}
              {events.map((e, i) => (
                <div key={i}>{e}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Demo Site */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
            {/* Demo site header */}
            <div className="bg-slate-100 px-4 py-2 flex items-center gap-2 border-b">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 bg-white rounded text-xs text-slate-400 px-3 py-1 text-center">
                example-store.com
              </div>
            </div>

            {/* Demo site content */}
            <div className="p-8">
              {/* Promo banner */}
              {profile?.urgency_elements && (
                <div
                  data-nr-section="promo"
                  className="text-white text-sm font-semibold py-2 px-4 rounded-lg mb-6 text-center"
                  style={{ background: "#16a34a" }}
                >
                  Limited time: 30% off — ends tonight
                </div>
              )}

              {/* Hero */}
              <div data-nr-section="hero" className="mb-8">
                <div className="text-xs font-semibold text-brand uppercase tracking-widest mb-2">
                  AI-Powered Analytics
                </div>
                <h1 className="text-3xl font-extrabold mb-3 leading-tight">
                  Understand your data.<br />Grow faster.
                </h1>
                <p className="text-slate-500 mb-6">
                  The platform trusted by 12,000 companies to turn raw data into revenue.
                  Set up in minutes. No engineers required.
                </p>

                <button
                  data-nr-cta="primary"
                  onClick={handleCtaClick}
                  className="px-7 py-3 rounded-xl font-bold text-white text-lg transition-all duration-300 hover:scale-105 cursor-pointer border-none"
                  style={{ background: ctaColor }}
                >
                  {ctaCopy}
                </button>
                <p className="text-xs text-slate-400 mt-2">No credit card required</p>
              </div>

              {/* Social proof */}
              <div
                data-nr-section="social-proof"
                className={`mb-8 transition-all duration-300 ${
                  profile?.social_proof === "hidden" ? "opacity-30 scale-95" : "opacity-100"
                } ${
                  profile?.social_proof === "prominent" ? "border-2 border-blue-100 rounded-xl p-4 bg-blue-50" : ""
                }`}
              >
                <div className="text-sm font-semibold text-slate-500 mb-3">Trusted by teams at</div>
                <div className="flex gap-6 text-slate-400 font-bold text-sm">
                  <span>Acme Corp</span>
                  <span>TechFlow</span>
                  <span>Buildify</span>
                  <span>Launchpad</span>
                </div>
                {profile?.social_proof === "prominent" && (
                  <div className="mt-4 bg-white rounded-lg p-3 border text-sm text-slate-600 italic">
                    &quot;NeuralRender increased our conversion rate by 34% in 2 weeks.&quot; — Sarah K., Head of Growth
                  </div>
                )}
              </div>

              {/* Features */}
              <div data-nr-section="features" className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {[
                  { icon: "📊", title: "Real-time analytics", desc: "Live dashboards that update as events happen." },
                  { icon: "🤖", title: "AI insights", desc: "Automated pattern detection across all your data." },
                  { icon: "🔗", title: "100+ integrations", desc: "Connect your existing stack in one click." },
                ].map((f) => (
                  <div key={f.title} className="bg-slate-50 rounded-xl p-4">
                    <div className="text-2xl mb-2">{f.icon}</div>
                    <div className="font-semibold text-sm mb-1">{f.title}</div>
                    <p className="text-xs text-slate-500">{f.desc}</p>
                  </div>
                ))}
              </div>

              {/* Detailed specs */}
              <div
                data-nr-section="detailed-specs"
                className={`transition-all duration-300 ${
                  profile?.archetype !== "researcher" ? "hidden" : "block"
                }`}
              >
                <h3 className="font-semibold mb-3 text-slate-700">Full Specifications</h3>
                <table className="w-full text-sm text-slate-600 border-collapse">
                  <tbody>
                    {[
                      ["Data retention", "24 months"],
                      ["Events per month", "Unlimited"],
                      ["API rate limit", "10,000 req/min"],
                      ["SLA uptime", "99.9%"],
                      ["GDPR compliant", "Yes"],
                    ].map(([k, v]) => (
                      <tr key={k} className="border-b border-slate-100">
                        <td className="py-2 font-medium text-slate-500">{k}</td>
                        <td className="py-2">{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Urgency */}
              {profile?.urgency_elements && (
                <div
                  data-nr-urgency=""
                  className="mt-6 bg-amber-50 border-l-4 border-amber-400 px-4 py-3 rounded-r-lg text-sm font-semibold text-amber-800"
                >
                  Only 14 free trial slots remaining this month.
                </div>
              )}
            </div>
          </div>

          <p className="text-center text-xs text-slate-400 mt-4">
            Interact with the demo above. The left panel updates in real-time as NeuralRender classifies your behavior.
          </p>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold tabular-nums">{value}</span>
    </div>
  );
}
