CREATE TABLE tenants (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id)
);

CREATE TABLE holdings (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id),
  date DATE NOT NULL,
  ticker TEXT NOT NULL,
  asset_class TEXT NOT NULL,
  quantity NUMERIC(20, 4) NOT NULL,
  price NUMERIC(20, 4) NOT NULL,
  UNIQUE (tenant_id, date, ticker)
);

CREATE INDEX idx_holdings_tenant_date ON holdings (tenant_id, date);

INSERT INTO tenants (id, name) VALUES (1, 'Alpha Capital'), (2, 'Beacon Advisors');
SELECT setval('tenants_id_seq', (SELECT MAX(id) FROM tenants));

-- Users are seeded by server/seed.js, not here: the password is hashed with
-- bcrypt at seed time from SEED_PASSWORD, so no hash is ever hardcoded.
