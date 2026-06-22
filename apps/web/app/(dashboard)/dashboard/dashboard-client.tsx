"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";

interface ExistingSite {
  id: string;
  name: string;
  domain: string;
  api_key_prefix: string;
}

interface SiteResult {
  id: string;
  name: string;
  domain: string;
  api_key: string;
  embed_snippet: string;
}

export function DashboardClient({
  email,
  initialSites,
}: {
  email: string;
  initialSites: ExistingSite[];
}) {
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [result, setResult] = useState<SiteResult | null>(null);
  const [sites, setSites] = useState(initialSites);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, domain }),
      });
      if (!res.ok) throw new Error("Failed to create site");
      const data = await res.json();
      setResult(data);
      setSites((prev) => [
        { id: data.id, name: data.name, domain: data.domain, api_key_prefix: data.api_key.slice(0, 12) },
        ...prev,
      ]);
    } catch {
      setError("Failed to create site. Is the API running?");
    } finally {
      setLoading(false);
    }
  };

  const copySnippet = () => {
    if (result) {
      navigator.clipboard.writeText(result.embed_snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <span className="font-bold text-lg">
          Neural<span className="text-brand">Render</span>{" "}
          <span className="text-slate-400 font-normal text-sm">Dashboard</span>
        </span>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-slate-500">{email}</span>
          <button onClick={() => signOut()} className="text-slate-500 hover:text-slate-900">
            Sign out
          </button>
          <a href="/" className="text-slate-500 hover:text-slate-900">← Home</a>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-extrabold mb-2">Get your embed snippet</h1>
        <p className="text-slate-500 mb-8">
          Register your site and get a script tag to paste into your{" "}
          <code className="bg-slate-100 px-1.5 py-0.5 rounded text-sm">&lt;head&gt;</code>.
        </p>

        {!result ? (
          <form onSubmit={handleCreate} className="bg-white rounded-2xl border p-6 shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Site name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Awesome Store"
                required
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Domain</label>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="mystore.com"
                required
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
            {error && <div className="text-sm text-red-600">{error}</div>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand text-white py-3 rounded-xl font-semibold hover:bg-brand-dark transition-colors disabled:opacity-60"
            >
              {loading ? "Creating…" : "Generate embed snippet →"}
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
              <span className="text-2xl">✅</span>
              <div>
                <div className="font-semibold text-green-800">Site registered!</div>
                <div className="text-sm text-green-600">
                  {result.name} · {result.domain}
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
              This API key is shown once. Store it securely — it won&apos;t be displayed again.
            </div>

            <div className="bg-white rounded-2xl border p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="font-semibold">Your embed snippet</div>
                <button
                  onClick={copySnippet}
                  className="text-xs bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors font-medium"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <pre className="bg-slate-900 text-green-400 text-xs font-mono rounded-xl p-4 overflow-x-auto whitespace-pre-wrap break-all">
                {result.embed_snippet}
              </pre>
            </div>

            <button
              onClick={() => setResult(null)}
              className="block w-full text-center bg-white border py-3 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
            >
              Register another site
            </button>

            <a
              href="/demo"
              className="block text-center bg-brand text-white py-3 rounded-xl font-semibold hover:bg-brand-dark transition-colors"
            >
              See the live demo →
            </a>
          </div>
        )}

        {sites.length > 0 && (
          <div className="mt-10">
            <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Your sites
            </div>
            <div className="space-y-2">
              {sites.map((s) => (
                <div key={s.id} className="bg-white rounded-xl border p-4 flex items-center justify-between text-sm">
                  <div>
                    <div className="font-medium">{s.name}</div>
                    <div className="text-slate-400">{s.domain}</div>
                  </div>
                  <code className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500">
                    {s.api_key_prefix}…
                  </code>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
