# Northstar Portfolio

A small multi-tenant investment tool. Each tenant logs in, uploads a CSV of holdings,
and sees market value by asset class plus the period return — with strict server-side
isolation so one tenant can never read another's data.

**Stack:** React + TypeScript + Vite + Tailwind · Node.js + Express · PostgreSQL (Docker Compose)

## Run it

Requires Docker Desktop and Node.js 20+.

```bash
# 1. Start Postgres + API (schema and seed data load automatically)
docker compose up -d --build

# 2. Start the frontend
cd client
npm install
npm run dev
```

Open http://localhost:5173.

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| API | http://localhost:3001 |
| Postgres | localhost:5432 (`northstar` / `northstar_dev`) |

## Configuration

Every setting lives in one place: **`.env.example`** at the project root. It documents
each variable — database credentials, ports, and the JWT secret — and is read by all
three pieces: the Postgres container, the API container, and the Vite dev proxy (which
loads the same root `.env` so the API port is never hardcoded in two places).

No setup is required to run the project: `docker-compose.yml` uses `${VAR:-default}`
fallbacks, so it works with no `.env` file at all. Copy it only if you want to change
something — for example if port 5432 is already taken on your machine:

```bash
cp .env.example .env
```

`.env` is gitignored; `.env.example` is committed. The `JWT_SECRET` there is a
dev-only placeholder — in a real deployment it would come from a secrets manager.

## Log in

| Email | Password | Tenant |
|---|---|---|
| `tenant_a@example.com` | `Password123!` | Alpha Capital |
| `tenant_b@example.com` | `Password123!` | Beacon Advisors |

Upload `samples/sample_good.csv` to populate the dashboard.
Upload `samples/sample_dirty.csv` to see its one bad row flagged and skipped while
the rest of the file still loads.

## API

| Method | Route | Purpose |
|---|---|---|
| `POST` | `/api/auth/login` | Email + password, returns a JWT |
| `POST` | `/api/holdings/upload` | Multipart CSV upload for the caller's own tenant |
| `GET` | `/api/holdings/summary` | Market value by asset class + period return |
| `GET` | `/api/health` | Liveness check |

### Period return

```
period_return = (end_market_value - start_market_value) / start_market_value
```

Start = total value on the earliest date in the data, end = total on the latest date.
Implemented as one pure function in `server/calculations.js`.

## Tenant isolation

The tenant id is read from the **signed JWT only** — never from a request body, query
string, or URL parameter. Every SQL statement that touches `holdings` filters on that
id, and all queries are parameterised (`$1`, `$2`), so there is no string-concatenated
SQL anywhere.

Verify it:

```bash
# Log in as Tenant A and upload data, then log in as Tenant B.
# B's summary comes back empty — A's holdings are unreachable.
curl -s -X POST http://localhost:3001/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"tenant_b@example.com","password":"Password123!"}'

# Without a token, every protected route returns 401.
curl -i http://localhost:3001/api/holdings/summary
```

There is no endpoint that accepts a tenant id from the caller, so there is no id to
tamper with.

## CSV validation

Rules live in `server/validateCsv.js`, one named function each, run per row:

- `checkMissingFields` — any of `date, ticker, asset_class, quantity, price` blank
- `checkDate` — must be a real `YYYY-MM-DD` calendar date
- `checkNumbers` — `quantity` and `price` must be non-negative numbers
- duplicate detection — same `ticker` on the same `date` twice in one file

The brief allows either "reject or flag" — this app **flags**: an invalid row is
excluded and reported (row number + reason), but every valid row in the same file
is still inserted. Nothing silently corrupts the totals, since a flagged row never
reaches the database; it just doesn't stop the rest of the upload. The only case
that fails outright is a file with **zero** valid rows, since there would be
nothing to insert.

`samples/sample_dirty.csv` trips the duplicate rule (row 20 repeats row 11) — the
other 17 rows still load.

## Schema

```
tenants  (id, name)
users    (id, email, password_hash, tenant_id)
holdings (id, tenant_id, date, ticker, asset_class, quantity, price)
         UNIQUE (tenant_id, date, ticker)
```

`db/init.sql` creates the tables and the two tenants; Docker Compose runs it
automatically on first start.

The two user accounts are seeded separately by `server/seed.js`, which runs on API
startup. It hashes `SEED_PASSWORD` with bcrypt at seed time rather than storing a
pre-computed hash in the repo — so the password and the bcrypt cost factor stay
configurable from `.env`, and there is no magic hash constant to explain. The insert
is an idempotent upsert, so restarting the API is always safe.

To reset the database completely:

```bash
docker compose down -v && docker compose up -d --build
```

## Assumptions

1. **The asset-class breakdown reflects the latest date** in the data, not a sum across
   all dates — it is a current snapshot, consistent with how the period return is defined.
2. **Each upload replaces that tenant's existing holdings** rather than appending, so a
   re-upload corrects the data instead of double-counting it.
3. **Auth uses a JWT bearer token** held in `localStorage`, with an 8-hour expiry.

## With more time

- Automated tests — `validateCsv.js` and `calculations.js` are pure functions and the
  obvious first targets.
- Dashboard filters by asset class and date range.
- `httpOnly` cookies instead of `localStorage` for the token, which would remove the
  XSS token-theft risk.
- Serve the built client from Nginx as a third Compose service; right now the frontend
  runs via `vite dev` and proxies `/api` to the backend.
- Batch the upload `INSERT`s into a single statement — fine at this file size, but it
  would matter for large files.
