import Link from "next/link";

const ARCHETYPES = [
  { name: "Speed Buyer", color: "#FF4500", icon: "⚡", desc: "Bold CTAs, minimal text, instant decisions." },
  { name: "Researcher", color: "#2563eb", icon: "🔍", desc: "Detailed specs, reviews front and centre." },
  { name: "Deal Hunter", color: "#16a34a", icon: "🏷️", desc: "Promos sticky, urgency elements live." },
  { name: "Brand Loyalist", color: "#1e1e2e", icon: "👑", desc: "Premium aesthetics, story-first layout." },
  { name: "Mobile First", color: "#7c3aed", icon: "📱", desc: "Fixed bottom CTA, 48px touch targets." },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-slate-100 max-w-7xl mx-auto">
        <span className="text-xl font-bold tracking-tight">
          Neural<span className="text-brand">Render</span>
        </span>
        <div className="flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link href="/demo" className="hover:text-slate-900 transition-colors">Live Demo</Link>
          <Link href="/docs" className="hover:text-slate-900 transition-colors">Docs</Link>
          <Link
            href="/dashboard"
            className="bg-brand text-white px-4 py-2 rounded-lg hover:bg-brand-dark transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-50 text-brand px-4 py-1.5 rounded-full text-sm font-medium mb-6">
          <span className="w-2 h-2 bg-brand rounded-full animate-pulse" />
          AI-powered · Real-time · Any website
        </div>
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-tight mb-6">
          Every visitor sees <br />
          <span className="text-brand">their ideal version</span> of your site.
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-10">
          NeuralRender detects each user&apos;s buying style from behavioral signals and instantly
          reshapes your layout, CTAs, and content — without any code changes on your end.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/demo"
            className="bg-brand text-white px-8 py-3.5 rounded-xl font-semibold text-lg hover:bg-brand-dark transition-colors shadow-lg shadow-indigo-200"
          >
            See it live →
          </Link>
          <Link
            href="/dashboard"
            className="border border-slate-200 px-8 py-3.5 rounded-xl font-semibold text-lg hover:border-brand hover:text-brand transition-colors"
          >
            Get embed snippet
          </Link>
        </div>
      </section>

      {/* Code snippet */}
      <section className="max-w-3xl mx-auto px-6 pb-20">
        <div className="bg-slate-900 rounded-2xl p-6 text-sm font-mono text-slate-300 overflow-x-auto">
          <div className="text-slate-500 mb-2">{"<!-- Add to your <head> — that's it -->"}</div>
          <div>
            {"<"}
            <span className="text-blue-400">script</span>
            {" "}
            <span className="text-green-400">src</span>
            {"="}
            <span className="text-yellow-300">"https://cdn.neuralrender.com/collect.js"</span>
          </div>
          <div className="pl-4">
            <span className="text-green-400">data-site-id</span>
            {"="}
            <span className="text-yellow-300">"YOUR_SITE_ID"</span>
          </div>
          <div className="pl-4">
            <span className="text-green-400">data-api-key</span>
            {"="}
            <span className="text-yellow-300">"nr_live_..."</span>
          </div>
          <div>
            {"  "}
            <span className="text-slate-500">async</span>
            {"></"}
            <span className="text-blue-400">script</span>
            {">"}
          </div>
        </div>
      </section>

      {/* Archetypes */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-3">5 buyer archetypes. Infinite variations.</h2>
          <p className="text-slate-500 text-center mb-12 max-w-xl mx-auto">
            NeuralRender classifies every visitor in real-time and applies the right layout — automatically.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {ARCHETYPES.map((a) => (
              <div key={a.name} className="bg-white rounded-xl p-5 border border-slate-100 hover:shadow-md transition-shadow">
                <div className="text-2xl mb-3">{a.icon}</div>
                <div className="font-semibold mb-1" style={{ color: a.color }}>
                  {a.name}
                </div>
                <p className="text-sm text-slate-500">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 max-w-5xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-12">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: "1", title: "Install the script", desc: "One line of HTML. No framework. No backend changes. Loads in under 3ms." },
            { step: "2", title: "AI classifies each visitor", desc: "Behavioral signals (clicks, scroll, dwell) are processed in real-time by our neural net." },
            { step: "3", title: "Site reshapes itself", desc: "CTAs, layout, content order and messaging adapt — for every individual visitor, every visit." },
          ].map((s) => (
            <div key={s.step} className="text-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-brand font-bold text-lg mx-auto mb-4">
                {s.step}
              </div>
              <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
              <p className="text-slate-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand text-white py-20 text-center px-6">
        <h2 className="text-4xl font-extrabold mb-4">Ready to personalise at scale?</h2>
        <p className="text-indigo-200 mb-8 text-lg">
          Free tier includes 10,000 visitor profiles per month.
        </p>
        <Link
          href="/dashboard"
          className="bg-white text-brand px-10 py-4 rounded-xl font-bold text-lg hover:bg-indigo-50 transition-colors"
        >
          Get your embed snippet →
        </Link>
      </section>

      <footer className="text-center py-8 text-slate-400 text-sm">
        © {new Date().getFullYear()} NeuralRender. Built to convert.
      </footer>
    </div>
  );
}
