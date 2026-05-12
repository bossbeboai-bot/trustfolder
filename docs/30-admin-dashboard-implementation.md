# 30 — Admin Dashboard Implementation (Phase 3.6 v1)

Status: implemented. This document describes the admin dashboard as it exists
in code today, after Phase 3.6 (Website Product Flow + Admin Ops Completion).
Companion: `docs/21-dashboard-information-architecture.md` (planning artifact;
v1 of the admin half is replaced by this document for the implemented surface,
the rest of doc 21 remains aspirational).

## Scope of this implementation

This is the smallest viable founder-ops surface for collecting, managing, and
following up with international prospects during Phase 4 (buyer validation).
It is intentionally narrower than the long-form admin spec in `docs/21` Part B.

In scope:

- Public website flow polish and the new public pages (`/pricing`, `/examples`,
  `/safety`, `/agencies`, `/contact`).
- Single-seat admin auth via `ADMIN_PASSWORD` and an HMAC-signed cookie.
- Internal admin dashboard for requests, assessments, orders, failures, and
  out-of-scope leads.

Explicitly out of scope:

- Customer login and customer dashboard.
- Connectors (Slack, Notion, Drive, HubSpot, Pipedrive).
- Subscriptions, Remotion, new payment provider, instant checkout.
- Admin TOTP / second factor.
- Admin audit log table.
- Auto-retry of failed jobs from the UI.
- Bulk outreach infrastructure.

## Routes

### Public pages

| Route | Type | Purpose |
|-------|------|---------|
| `/` | Static | Premium marketing homepage (`MarketingHome`). |
| `/pricing` | Static | All six packs with request CTAs and scope notes. |
| `/examples` | Static | Three illustrative samples (B2B AI chatbot, AI agency, AI productivity tool). Every example labeled “Illustrative sample. Not a real customer pack.” |
| `/safety` | Static | What TrustFolder does, what it does not do, full out-of-scope vertical list. |
| `/agencies` | Static | Agency positioning and `/request?type=agency` CTA. |
| `/contact` | Static (form is client) | Custom scope, partnerships, advisor, support, press. POSTs to `/api/request` with `source_page=/contact`. |
| `/assessment` | Dynamic (existing) | Free eligibility check. Paid tiers route to `/request?type=…` instead of PayPal during the validation phase. |
| `/request` | Static (form is client) | Paid-pack request capture. Supports `?type=snapshot|disclosure|governance|premium|agency` and the legacy alias `?type=pack` (mapped to `disclosure`). |
| `/out-of-scope` | Static (existing) | Calm out-of-scope copy. |
| `/success/[orderId]` | Dynamic (existing) | Order status polling page. |
| `/checkout/return`, `/checkout/cancel` | Existing | PayPal redirect surfaces. Untouched in Phase 3.6. |

### Admin pages

| Route | Auth | Purpose |
|-------|------|---------|
| `/admin/login` | Public | Single-seat password sign-in. Redirects to `/admin` if already authenticated. |
| `/admin` | Protected | Founder ops overview: 7 summary cards + latest requests. |
| `/admin/requests` | Protected | Inbound `requests` table with status update (mark contacted / qualified / converted / closed_lost) and internal note. |
| `/admin/assessments` | Protected | Free-check completions (`assessments` table). |
| `/admin/orders` | Protected | Paid orders (`orders` table), payment + status badges. |
| `/admin/failures` | Protected | `failed_needs_retry` orders + `payment_status in ('failed','refunded')`. |
| `/admin/out-of-scope` | Protected | Assessments where `scope_check_passed = false` or `scope_check_band in ('SOFT_OUT','HARD_OUT')`. |

Protected pages live inside the route group `app/app/admin/(protected)/`. The
group has its own `layout.tsx` that runs the auth check before rendering any
child page; if the cookie is absent or invalid, the layout `redirect()`s to
`/admin/login`.

### Admin API routes

All `/api/admin/*` routes require a valid `tf_admin` session cookie. They
return `401 { error: 'unauthorized' }` otherwise.

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/admin/login` | Verifies `password` against `ADMIN_PASSWORD`, sets `tf_admin` cookie. |
| `POST` | `/api/admin/logout` | Clears the `tf_admin` cookie. |
| `GET` | `/api/admin/summary` | Same data the overview page shows. |
| `GET` | `/api/admin/requests` | Lists `requests`. Optional `?status=`. |
| `PATCH` | `/api/admin/requests/[id]` | Updates `status` and/or `internal_note`. |
| `GET` | `/api/admin/assessments` | Lists assessments. |
| `GET` | `/api/admin/orders` | Lists orders. |
| `GET` | `/api/admin/failures` | Lists pipeline + payment failures. |
| `GET` | `/api/admin/out-of-scope` | Lists out-of-scope leads. |

## Auth model

Single seat, password-only, no roles, no reset flow.

- Password lives in `app/.env.local` as `ADMIN_PASSWORD`.
- Optional `ADMIN_SESSION_SECRET` for cookie signing. If unset, the password
  is used as the HMAC key — rotating the password invalidates outstanding
  sessions automatically.
- Cookie name: `tf_admin`.
- Cookie format: `<expiry_unix>.<hex_hmac_sha256>`.
- Cookie attributes: `HttpOnly`, `SameSite=Lax`, `Path=/`, `Secure` in
  production. TTL: 30 days.
- Server-side helpers: `app/lib/admin-auth.ts` exposes
  `checkAdminPassword`, `signSession`, `verifySessionCookie`,
  `hasAdminSessionFromCookies`, `requireAdminApi`, `buildSessionCookie`,
  `buildLogoutCookie`, `isAdminConfigured`.
- Server-side data helpers: `app/lib/admin-data.ts` wraps the engine
  `service()` Supabase client; both server pages and API routes call into
  the same functions so the read logic lives in one place.

Hard rules (enforced at code-review time):

- Never log `ADMIN_PASSWORD` or `ADMIN_SESSION_SECRET`.
- Never expose them client-side.
- Never reuse the engine `service()` client from a client component.
- Every `/api/admin/*` handler calls `requireAdminApi()` before doing any
  Supabase work.
- Every protected page lives under `/admin/(protected)/` so the layout guard
  runs before the page renders.

## Database changes

One new migration: `engine/supabase/migrations/0003_requests_admin_extensions.sql`.

```sql
alter table requests
  add column if not exists internal_note text,
  add column if not exists updated_at timestamptz not null default now();

create index if not exists requests_updated_at_idx on requests (updated_at desc);

-- updated_at trigger on update.
```

No other schema changes. All admin tabs read from existing tables defined in
`0001_initial_schema.sql` and `0002_add_requests.sql`:

- `requests` (with `internal_note` + `updated_at` from `0003`)
- `assessments`
- `orders`
- `website_scans` (read transitively via assessments)

## Public-flow changes summary

- `app/app/globals.css` now defines the full `--tf-*` design token set per
  `docs/14-DESIGN.md`. Existing pages already referenced these variables but
  the values were missing.
- `app/app/components/SiteChrome.tsx` is the shared header/footer used by
  every public marketing page. The footer carries the canonical scope note
  on every page.
- `app/app/components/MarketingPrimitives.tsx` provides
  `PrimaryLink`, `SecondaryLink`, `Reveal`, `Section`, `PageHeader`, `Card`,
  `ScopeNote`, `FinalCta`. Used by every public page.
- `RequestLeadPage` accepts the canonical query types
  `snapshot | disclosure | governance | premium | agency` and the legacy
  alias `pack` (mapped to `disclosure`). Heading, sub-head, and price
  caption are tailored per type. Form values are preserved across error.
  No “Buy now” language anywhere.
- `MarketingHome` was switched to `SiteChrome` and to `?type=disclosure`.
- `assessment/page.tsx` Step 4 routes every paid tier through `/request`
  (`tier_1 → snapshot`, `tier_2 → disclosure`, `tier_3 → governance`).
  PayPal endpoints are unchanged but no longer invoked from the user
  journey.

## Known limitations (Phase 3.6 v1)

- Single founder seat. No additional admin users.
- No retry button on the failures page; manual follow-up only. The page
  surfaces `manual follow-up required` for `failed_needs_retry` rows.
- No admin audit log table. Every status update on a request is a direct
  database write.
- No CSV export.
- No filters/search on tables beyond optional `?status=` on requests.
  Tables show the latest 200 rows.
- No analytics, no funnel views, no time-to-deliver percentiles.
- No customer auth or customer dashboard. Doc 21 Part A remains aspirational.

## Verification

- `npm run typecheck` (in `app/`) — pass.
- `npm run build` (in `app/`) — pass; **21 routes** including all five new
  public pages and all admin pages and API endpoints.
- Engine untouched (no `engine/` build re-run needed for Phase 3.6 work).
  PayPal endpoints, package generation, and order state machine logic
  unchanged.

## Acceptance criteria — status

| # | Criterion | Status |
|---|-----------|--------|
| 1 | Homepage CTAs work | ✓ |
| 2 | `/assessment` routes paid intent to `/request` not broken checkout | ✓ |
| 3 | `/request` supports all required query params | ✓ (incl. legacy `pack` alias) |
| 4 | `/request` saves leads to Supabase | ✓ (existing `/api/request`) |
| 5 | `/pricing`, `/examples`, `/safety`, `/agencies`, `/contact` exist | ✓ |
| 6 | All public CTAs route correctly | ✓ |
| 7 | No “Buy now” language | ✓ |
| 8 | No legal overclaims | ✓ |
| 9 | `/admin` is protected by password | ✓ |
| 10 | Wrong password cannot access admin | ✓ |
| 11 | Correct password opens dashboard | ✓ |
| 12 | Admin can see requests from `/request` | ✓ |
| 13 | Admin can update request status | ✓ |
| 14 | Admin can see assessments / orders / failures / out-of-scope records | ✓ |
| 15 | No customer auth was built | ✓ |
| 16 | No connectors / subscriptions / Remotion / new payment provider | ✓ |
| 17 | Build passes | ✓ |

## Operational notes

- The first time the admin page is hit on a new environment, set
  `ADMIN_PASSWORD` in `app/.env.local`, restart `next dev` / `next start`,
  and visit `/admin/login`.
- Apply migration `0003_requests_admin_extensions.sql` to the Supabase
  project before signing in. The requests table works without the new
  columns, but the admin "internal note" column will be unavailable until
  the migration runs.
- The admin pages use `force-dynamic` rendering — no caching, every load
  re-queries Supabase via the service-role client.
