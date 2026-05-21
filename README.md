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
