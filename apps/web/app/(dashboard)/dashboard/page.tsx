"use client";

import { useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

interface SiteResult {
  id: string;
  name: string;
  domain: string;
  api_key: string;
  embed_snippet: string;
}

export default function DashboardPage() {
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [result, setResult] = useState<SiteResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/sites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, domain }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      alert("Failed to create site. Is the API running?");
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
        <a href="/" className="text-sm text-slate-500 hover:text-slate-900">← Home</a>
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

            <div className="bg-white rounded-2xl border p-4 shadow-sm text-sm">
              <div className="font-medium mb-2">Site ID</div>
              <code className="text-xs bg-slate-100 px-2 py-1 rounded">{result.id}</code>
            </div>

            <a
              href="/demo"
              className="block text-center bg-brand text-white py-3 rounded-xl font-semibold hover:bg-brand-dark transition-colors"
            >
              See the live demo →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
