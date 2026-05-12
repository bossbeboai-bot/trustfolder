# 42 — Supabase Production Check

Status: Phase 7 reference  
Pairs with: `scripts/probe-production-supabase.mjs`  
Last updated: 2026-05-11

## 1 · Migration order

Apply in order against the production project:

1. `engine/supabase/migrations/0001_initial_schema.sql`
2. `engine/supabase/migrations/0002_add_requests.sql`
3. `engine/supabase/migrations/0003_requests_admin_extensions.sql`
4. `engine/supabase/migrations/0004_customer_auth.sql`

Apply via the Supabase SQL editor (Database → SQL Editor → New query
→ paste and run) or via your preferred Supabase migration tool.

## 2 · Tables

After all migrations, the database must contain:

- `leads`
- `website_scans`
- `assessments`
- `orders`
- `order_status_events`
- `generated_packs`
- `qa_results`
- `email_events`
- `requests` (with `internal_note`, `updated_at`)
- Customer auth tables from `0004_customer_auth.sql`

The probe verifies each of these.

## 3 · Storage

1. Create a bucket called `deliveries`.
2. Set the bucket to **Private** (no public access).
3. The app generates signed download URLs server-side; the public will
   never see a direct storage URL.

## 4 · Backups

Supabase provides daily backups on its paid tiers. Phase 7 does not
require a custom backup system. Recommended:

- Enable Point-in-Time Recovery (PITR) on the production project.
- Take a manual snapshot before applying any future schema migration.

## 5 · How to run the probe

The probe reads `engine/.env`, masks secrets, and validates table /
bucket presence:

```sh
node scripts/probe-production-supabase.mjs
```

A clean production project should print `PROBE_RESULT: GO`. Any other
result is a NO-GO for launch.

## 6 · Hard rules

- The service role key never leaves the server.
- The `deliveries` bucket stays private.
- No row-level security relaxation in production.
- No `DROP TABLE` in production.
