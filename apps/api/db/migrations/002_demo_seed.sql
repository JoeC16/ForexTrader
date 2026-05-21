-- Demo site for the /demo page — fixed UUIDs so the frontend can reference them
INSERT INTO users (id, email, name, plan)
VALUES ('00000000-0000-0000-0000-000000000001', 'demo@neuralrender.com', 'Demo User', 'free')
ON CONFLICT (email) DO NOTHING;

INSERT INTO sites (id, owner_id, name, domain, api_key)
VALUES (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'NeuralRender Demo',
    'localhost',
    'nr_demo'
)
ON CONFLICT DO NOTHING;
