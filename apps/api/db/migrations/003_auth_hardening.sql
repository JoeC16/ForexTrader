ALTER TABLE users ADD COLUMN IF NOT EXISTS github_id TEXT UNIQUE;

ALTER TABLE sites ADD COLUMN IF NOT EXISTS api_key_hash TEXT;
ALTER TABLE sites ADD COLUMN IF NOT EXISTS api_key_prefix TEXT;

-- Demo site (002_demo_seed.sql) keeps working: hash of 'nr_demo'
UPDATE sites
SET api_key_hash = encode(digest('nr_demo', 'sha256'), 'hex'),
    api_key_prefix = 'nr_demo'
WHERE api_key = 'nr_demo' AND api_key_hash IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_sites_api_key_hash ON sites(api_key_hash);

ALTER TABLE sites DROP COLUMN IF EXISTS api_key;
DROP INDEX IF EXISTS idx_sites_api_key;
