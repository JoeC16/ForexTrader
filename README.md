# NeuralRender

AI-powered personalization SDK. Add one script tag — NeuralRender detects each visitor's buying style and dynamically reshapes your site to drive conversions.

## Quick Start

### 1. Start infrastructure

```bash
docker-compose up -d
```

### 2. Install API dependencies & run migrations

```bash
cd apps/api
pip install -r requirements.txt
python db/migrate.py
```

### 3. Start the API

```bash
cd apps/api
uvicorn main:app --reload --port 8000
```

### 4. Start the web dashboard

```bash
cp .env.example .env
cd apps/web
npm install
npm run dev
```

### 5. Build the SDK

```bash
cd packages/sdk
npm install
npm run build
```

Open [http://localhost:3000/demo](http://localhost:3000/demo) to see NeuralRender classifying behavior in real-time.

## Embed on any site

```html
<script
  src="https://cdn.neuralrender.com/collect.js"
  data-site-id="YOUR_SITE_ID"
  data-api-key="nr_live_..."
  async
></script>
```

Add `data-nr-*` attributes to your elements for precise control:

```html
<button data-nr-cta="primary">Buy Now</button>
<section data-nr-section="social-proof">Reviews...</section>
<div data-nr-urgency>Only 3 left!</div>
```

## Architecture

```
collect.js (embed SDK)
  ↓ behavioral events
FastAPI backend → PostgreSQL + Redis
  ↓ profile serving (<50ms)
AI classifier (rule-based → LightGBM → neural net)
  ↓ rendering profile
DOM modifier → instant layout changes
```

## Buyer Archetypes

| Archetype | Signals | Modifications |
|---|---|---|
| Speed Buyer | Fast clicks, low scroll | Bold orange CTA, hide reviews |
| Researcher | Long dwell, deep scroll | Surface reviews, show specs |
| Deal Hunter | Promo clicks, cart abandons | Sticky banner, urgency |
| Brand Loyalist | Direct traffic, repeat visits | Premium spacing, brand story |
| Mobile First | Mobile device detected | Fixed bottom CTA, 48px targets |

## Security model

- **Public ingest endpoints** (`POST /api/v1/events`, `GET /api/v1/profile/...`) are authenticated by a per-site API key (`X-Site-Key`), hashed with SHA-256 before storage/lookup, and are CORS-open since the SDK runs on arbitrary customer domains. Rate-limited to 120 req/min per site key (Redis-backed).
- **Dashboard/site-management endpoints** (`/api/v1/sites`, `/api/v1/dashboard/*`) are not reachable from a browser at all — they require an `X-Internal-Secret` header that only the Next.js server holds, and every read/write is scoped to the authenticated user's own sites.
- **Dashboard auth** is GitHub OAuth via NextAuth. `middleware.ts` blocks unauthenticated access to `/dashboard`.

## Deploying to production

**API → Railway**
1. New Railway project from this repo, root directory = repo root (uses the included `Dockerfile` + `railway.toml`).
2. Add Postgres and Redis plugins; Railway injects `DATABASE_URL`/`REDIS_URL` automatically (alias them if the plugin uses different names).
3. Set env vars: `INTERNAL_API_SECRET`, `NEXT_PUBLIC_SDK_URL`.
4. Migrations run automatically on container start (`python apps/api/db/migrate.py`).

**Web → Vercel**
1. New Vercel project from this repo, **Root Directory = `apps/web`**.
2. Set env vars: `NEXTAUTH_SECRET`, `NEXTAUTH_URL` (your prod URL), `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `API_BASE_URL` (Railway API URL, server-side only), `NEXT_PUBLIC_API_BASE_URL` (same URL, public), `INTERNAL_API_SECRET` (must match the API's value).
3. Create a GitHub OAuth App with callback URL `https://<your-domain>/api/auth/callback/github`.

Generate secrets with `openssl rand -hex 32`.
