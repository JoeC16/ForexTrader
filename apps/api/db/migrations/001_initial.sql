CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email       TEXT UNIQUE NOT NULL,
    name        TEXT,
    plan        TEXT NOT NULL DEFAULT 'free',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE sites (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    domain      TEXT NOT NULL,
    api_key     TEXT UNIQUE NOT NULL,
    config      JSONB NOT NULL DEFAULT '{}',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at  TIMESTAMPTZ
);
CREATE INDEX idx_sites_api_key ON sites(api_key);
CREATE INDEX idx_sites_owner ON sites(owner_id);

CREATE TABLE visitor_profiles (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id         UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    anon_id         TEXT NOT NULL,
    known_user_id   TEXT,
    archetype       TEXT,
    confidence      FLOAT,
    event_count     INTEGER NOT NULL DEFAULT 0,
    last_seen_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(site_id, anon_id)
);
CREATE INDEX idx_vp_site_anon ON visitor_profiles(site_id, anon_id);
CREATE INDEX idx_vp_archetype ON visitor_profiles(site_id, archetype);

CREATE TABLE user_features (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id         UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    anon_id         TEXT NOT NULL,
    features        JSONB NOT NULL DEFAULT '{}',
    computed_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(site_id, anon_id)
);
CREATE INDEX idx_uf_site_anon ON user_features(site_id, anon_id);

CREATE TABLE events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id         UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    anon_id         TEXT NOT NULL,
    session_id      TEXT NOT NULL,
    event_type      TEXT NOT NULL,
    url             TEXT,
    properties      JSONB NOT NULL DEFAULT '{}',
    client_ts       TIMESTAMPTZ NOT NULL,
    server_ts       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_events_site_anon ON events(site_id, anon_id, server_ts DESC);
CREATE INDEX idx_events_type ON events(site_id, event_type, server_ts DESC);
CREATE INDEX idx_events_session ON events(session_id);

CREATE TABLE personalization_logs (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id             UUID NOT NULL,
    anon_id             TEXT NOT NULL,
    archetype           TEXT NOT NULL,
    rendering_profile   JSONB NOT NULL,
    model_version       TEXT NOT NULL DEFAULT 'rules-v1',
    served_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_pl_site_anon ON personalization_logs(site_id, anon_id, served_at DESC);
