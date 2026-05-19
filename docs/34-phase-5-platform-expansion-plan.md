# 34 — Phase 5 Platform Expansion Plan

Status: planning artifact. **No code changes flow from this document until
the founder approves Batch 1.** This plan exists so each batch ships in
controlled, low-risk slices and the launch-ready v1 (Phase 3.9) keeps
working throughout.

Owns: customer auth, customer dashboard, instant checkout, subscriptions,
connectors. Cross-references `docs/21` (dashboard IA — already detailed),
`docs/23` (email and status flow), `docs/24` (implementation gap audit),
`docs/03` (pricing and tiers), and `docs/05` (tech architecture).

---

## 0 · What we are protecting

The Fast Finish Sprint (Phase 3.9) shipped a working request-led v1.
Phase 5 must not regress any of these:

- Public website at `/`, `/assessment`, `/request`, `/pricing`,
  `/examples`, `/safety`, `/agencies`, `/contact`
- Free assessment flow (`/assessment` → `/api/scan` →
  `/api/request`)
- Lead capture via `/api/request` → `requests` table
- Founder admin at `/admin/*` with HMAC-cookie session
- PayPal full pipeline (`/api/paypal/create-order`,
  `/api/paypal/capture`, `/api/paypal/webhook`) for tier_2 / tier_3
- Engine pipeline (`engine/src/pipeline.ts`) for tier_2 and tier_3
- Supabase schema with service-role-only access (RLS on, no policies)
- Safety language: no "guaranteed compliance", "audit-proof",
  "no lawyer needed", "fully compliant", "legal guarantee"
- Disclaimer string on every public page

Every batch acceptance test must include a smoke pass on the v1 core
loop before the batch is considered done.

---

## 1 · Feature scope

What Phase 5 adds, in scope:

- **Customer login** via email magic link (no passwords in v1).
- **Customer dashboard** at `/dashboard/*` (Overview, Requests, Orders,
  Packs, Downloads, Settings) showing only the signed-in customer's data.
- **Instant checkout** at `/checkout` for tiers whose generation
  delivery exists (tier_2 disclosure pack at $499, tier_3 governance
  folder at $999). Tier_1 snapshot stays request-only until
  `engine/src/snapshot.ts` is implemented.
- **Subscription billing** for an optional Update Monitor at $99/month
  and an Agency Monthly Plan at $299–$999/month — only after one-time
  checkout is stable and the recurring delivery path exists.
- **Optional connectors** for Google Drive export, Notion export,
  GitHub doc import, and PDF/DOCX upload — strictly additive; never
  required for pack delivery.

What Phase 5 is **explicitly NOT**:

- No team seats. No invite/accept. No multi-user workspaces.
- No roles. Single-customer view per email.
- No SSO, no OAuth, no SAML, no enterprise login.
- No SOC2 claims, certification badges, or legal guarantees.
- No public REST/GraphQL API for customers.
- No marketplace, partner program, or affiliate system.
- No new AI capabilities. No LLM-driven dashboard agents.
- No analytics dashboards beyond status and amount.
- No legal advice features. The platform stays an evidence drafter,
  not a compliance certifier.

These can come in a later phase if validation supports them.

---

## 2 · Batch order (locked)

Each batch is shippable on its own and reversible without breaking
the previous one. Numbering matches the Phase 5 brief.

| # | Batch | Outcome | Gate to next |
|---|---|---|---|
| 1 | Customer login + dashboard | Magic-link auth + read-only dashboard over existing tables | All v1 smoke tests still pass + customer can see their requests |
| 2 | Instant checkout + payment provider | New provider live for tier_2 / tier_3; PayPal kept as fallback | First successful end-to-end paid order with new provider |
| 3 | Subscriptions | Optional recurring billing for Update Monitor + Agency Monthly | Cancel + failed-payment paths verified |
| 4 | Connectors | Google Drive + Notion export, GitHub import, file upload — all optional | Connector failures never block delivery |
| 5 | World-class polish | Empty states, status timeline, notification emails, mobile audit, security audit | Final screenshot QA + forbidden-phrase audit |

Each batch ends with: typecheck, build, manual browser flow, screenshot
QA, v1 core-loop smoke test, forbidden-phrase grep, `progress.txt`
update.

The Batch 2 gate is conditional: if we choose to enable instant checkout
for the $99 snapshot, we must implement `engine/src/snapshot.ts` first
(see §6 Tier rule). Otherwise $99 stays request-only.

---

## 3 · Database changes

### 3.1 New tables (Batch 1)

Three small tables. All RLS-on, service-role-only access (matches the
existing schema convention in
`engine/supabase/migrations/0001_initial_schema.sql`).

```sql
-- customer_profiles
-- One row per customer email. Created lazily on first magic-link request.
create table customer_profiles (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  display_name text,
  company_name text,
  website_url text,
  notification_opt_in boolean not null default true,
  created_at timestamptz not null default now(),
  last_login_at timestamptz,
  status text not null default 'active'  -- active | disabled
);

-- customer_link_tokens
-- Single-use magic-link tokens. token_hash = sha256(token). 15-min TTL.
create table customer_link_tokens (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customer_profiles(id) on delete cascade,
  token_hash text not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  ip text,
  user_agent text,
  created_at timestamptz not null default now()
);
create index customer_link_tokens_hash_idx on customer_link_tokens (token_hash);
create index customer_link_tokens_customer_idx on customer_link_tokens (customer_id, created_at desc);

-- customer_auth_events
-- Audit log. Every login_link_sent, login_success, login_failed, logout.
create table customer_auth_events (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customer_profiles(id) on delete set null,
  email text not null,
  event_type text not null,    -- 'link_sent' | 'login_success' | 'login_failed' | 'logout'
  ip text,
  user_agent text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index customer_auth_events_email_idx on customer_auth_events (email, created_at desc);
```

Sessions are **stateless** — HMAC-signed cookie (mirrors `admin-auth.ts`
pattern). No separate customer session table is needed in v1. If we ever need
server-side revocation we add that table later.

### 3.2 Foreign keys (Batch 1)

Add nullable `customer_id` references on existing tables so the
dashboard can join cleanly:

```sql
alter table requests        add column customer_id uuid references customer_profiles(id);
alter table orders          add column customer_id uuid references customer_profiles(id);
alter table assessments     add column customer_id uuid references customer_profiles(id);
create index requests_customer_id_idx     on requests (customer_id);
create index orders_customer_id_idx       on orders (customer_id);
create index assessments_customer_id_idx  on assessments (customer_id);
```

Backfill rule: on first login, attach all rows where `email = customer.email`
to `customer.id`. Idempotent. New rows created by `/api/request`,
`/api/scan`, and the checkout endpoints write `customer_id` if the email
matches a known profile, otherwise leave null.

### 3.3 New tables (Batch 2 — payments)

Extend `orders` rather than rewrite it:

```sql
alter table orders
  add column provider text not null default 'paypal',           -- 'paypal' | 'paddle' | 'stripe' | 'manual'
  add column provider_order_id text,
  add column provider_capture_id text,
  add column manual_invoice_ref text;
create index orders_provider_idx on orders (provider, payment_status);

-- provider_events
-- Per-provider raw event log; one row per webhook delivery.
create table provider_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  event_type text not null,
  external_event_id text not null,
  order_id uuid references orders(id) on delete set null,
  raw jsonb not null,
  signature_ok boolean not null,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (provider, external_event_id)
);
```

Idempotency comes from the unique `(provider, external_event_id)`. Replay
of the same webhook is a no-op.

### 3.4 New tables (Batch 3 — subscriptions)

```sql
create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customer_profiles(id) on delete cascade,
  provider text not null,
  external_subscription_id text not null,
  plan_code text not null,                  -- 'update_monitor_99' | 'agency_monthly_299' | ...
  status text not null,                     -- 'trialing' | 'active' | 'past_due' | 'cancelled' | 'expired'
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, external_subscription_id)
);
create index subscriptions_customer_idx on subscriptions (customer_id, status);

-- subscription_events for audit + replay
create table subscription_events (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid references subscriptions(id) on delete cascade,
  event_type text not null,
  external_event_id text,
  raw jsonb not null,
  created_at timestamptz not null default now(),
  unique (subscription_id, external_event_id)
);
```

### 3.5 New tables (Batch 4 — connectors)

```sql
create table customer_connectors (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customer_profiles(id) on delete cascade,
  provider text not null,                  -- 'google_drive' | 'notion' | 'github'
  external_account_id text,
  access_token_enc bytea,                  -- AES-256-GCM via CONNECTOR_ENC_KEY
  refresh_token_enc bytea,
  token_expires_at timestamptz,
  scopes text[] default '{}',
  status text not null default 'active',   -- 'active' | 'revoked' | 'errored'
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (customer_id, provider)
);

create table connector_exports (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customer_profiles(id) on delete cascade,
  pack_id uuid references generated_packs(id) on delete cascade,
  provider text not null,
  status text not null,                    -- 'queued' | 'running' | 'ok' | 'failed'
  external_resource_id text,
  external_resource_url text,
  error_message text,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now()
);
```

### 3.6 Migration discipline

- One numbered migration per batch under
  `engine/supabase/migrations/0004_*.sql` onward.
- Every migration must be re-runnable (`if not exists` / `create or
  replace`). No destructive `drop` without a paired down-migration.
- After each migration, run
  `scripts/check-supabase-config-and-schema.ps1` to confirm the schema
  matches what the engine expects.
- No data migration touches existing rows except the idempotent backfill
  in §3.2. No schema changes to `leads`, `website_scans`,
  `generated_packs`, `qa_results`, `email_events`, `order_status_events`
  in Batches 1–4.

---

## 4 · API changes

### 4.1 New routes (Batch 1 — customer auth + dashboard)

All routes server-rendered (`runtime: 'nodejs'`,
`dynamic: 'force-dynamic'`). All require valid `tf_customer` cookie
unless explicitly noted.

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `POST` | `/api/customer/login-link` | none | Request a magic link. Always returns 200 with generic copy. |
| `GET`  | `/api/customer/verify` | token in URL | Consume single-use token, set `tf_customer` cookie, redirect to `/dashboard`. |
| `POST` | `/api/customer/logout` | cookie | Clear cookie. |
| `GET`  | `/api/customer/me` | cookie | Returns `{ id, email, company_name, website_url, notification_opt_in }`. |
| `GET`  | `/api/customer/summary` | cookie | Counts + latest snippet for Overview tab. |
| `GET`  | `/api/customer/requests` | cookie | List of customer's `requests` rows. |
| `GET`  | `/api/customer/orders` | cookie | List of customer's `orders` rows. |
| `GET`  | `/api/customer/packs` | cookie | List of `generated_packs` for customer's orders. |
| `POST` | `/api/customer/download-link` | cookie | Issue a fresh signed Supabase Storage URL for a pack the customer owns. |
| `PATCH` | `/api/customer/me` | cookie | Update display name / company / website / notif pref. |

Auth helper: `app/lib/customer-auth.ts` — same shape as
`admin-auth.ts` (`hasCustomerSessionFromCookies`,
`buildCustomerSessionCookie`, `requireCustomerApi`,
`extractCustomerFromCookie`). Cookie name `tf_customer`. 30-day TTL.
HttpOnly + SameSite=Lax + Secure-in-prod.

Admin and customer cookies are independent. A user can be admin and
customer simultaneously without conflict.

### 4.2 New routes (Batch 2 — payments)

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `POST` | `/api/checkout/start` | none | Create checkout session for chosen tier; returns provider redirect URL. Issues a draft `orders` row. |
| `GET`  | `/checkout/success` | none | Server-side handler that confirms the order via provider API, attaches `customer_id` if email matches, magic-link-emails a login link. |
| `GET`  | `/checkout/cancel` | none | Friendly cancel page; offers to re-open `/pricing`. |
| `POST` | `/api/paddle/webhook` (or chosen provider) | signature | Idempotent provider webhook handler. Mirrors `paypal/webhook` route shape. |

PayPal routes stay live unchanged in Batch 2; we just add the new
provider alongside. Removal of PayPal is **not** in Phase 5 scope.

### 4.3 New routes (Batch 3 — subscriptions)

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `POST` | `/api/subscription/start` | cookie | Create subscription via provider; returns redirect URL. |
| `POST` | `/api/subscription/cancel` | cookie | Mark `cancel_at_period_end = true`; instruct provider. |
| `POST` | `/api/{provider}/sub-webhook` | signature | Idempotent subscription webhook handler. |

### 4.4 New routes (Batch 4 — connectors)

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `GET`  | `/api/connectors/{provider}/start` | cookie | Begin OAuth dance; redirect to provider. |
| `GET`  | `/api/connectors/{provider}/callback` | cookie | Exchange code, encrypt tokens, persist `customer_connectors`. |
| `POST` | `/api/connectors/{provider}/export` | cookie | Queue an export of a pack the customer owns. |
| `POST` | `/api/connectors/{provider}/disconnect` | cookie | Revoke + delete tokens. |
| `POST` | `/api/uploads` | cookie | Multipart upload (privacy policy / AI policy / docs). |

### 4.5 No-touch routes

These keep their current behaviour through all batches:

- `/api/scan`
- `/api/request`
- `/api/confirm`
- `/api/status/[orderId]`
- `/api/paypal/*`
- `/api/admin/*`

Any change there requires its own RFC.

---

## 5 · Customer dashboard IA

Aligns with `docs/21` and the Phase 5 brief. Tab list per the brief:

```
/login                       (magic-link request — no auth)
/dashboard                   (redirects to /dashboard/overview)
/dashboard/overview
/dashboard/requests
/dashboard/orders
/dashboard/packs
/dashboard/downloads
/dashboard/settings
/dashboard/subscription      (Batch 3)
/dashboard/settings/connectors (Batch 4)
```

### 5.1 Per-tab data sources and surface

| Tab | Source | Server-side join | Primary surface |
|---|---|---|---|
| Overview | `requests`, `orders`, `generated_packs`, `email_events` | `customer_id = me.id` | One status card + next-action CTA |
| Requests | `requests` | `customer_id = me.id` | List with company / package / status / date / message |
| Orders | `orders` | `customer_id = me.id` | List with tier label / amount / `payment_status` / `status` / `paid_at` |
| Packs | `generated_packs` join `orders` | `orders.customer_id = me.id` | List with template name (humanised) / confidence band / generation date / "Open" |
| Downloads | `generated_packs` + Storage signed URL issuer | `orders.customer_id = me.id` | "Download pack zip", expiry note, "Re-issue link" |
| Settings | `customer_profiles` | self-row | Email (read-only), company, website, notification toggle, "Export my data", "Request deletion" placeholder |
| Subscription | `subscriptions` (Batch 3) | `customer_id = me.id` | Active plan, renewal date, cancel button |
| Connectors | `customer_connectors` (Batch 4) | `customer_id = me.id` | Per-provider connect / disconnect / status |

### 5.2 Visual system

Reuses the dark editorial palette and shared primitives shipped in
Phase 3.9:

- `--tf-bg`, `--tf-ink`, `--tf-paper`, `--tf-surface`, `--tf-accent`
- `Card`, `DocumentCard`, `DarkCard`, `PrimaryLink`, `SecondaryLink`,
  `Section`, `EvidenceScene`
- New: `StatusPill`, `ConfidenceBandBadge`, `OrderTimeline`,
  `EmptyState`, `DocumentTreeView` for the Packs tab
- Uses generous spacing, large status cards, document-folder iconography
  (folder + page glyphs), and the same eyebrow → headline pattern as
  the marketing site

Empty states:
- Overview: "Nothing to show yet — run a free check or request a pack."
  with `Run free check` and `Request pack` buttons.
- Requests / Orders / Packs / Downloads: explicit "No X yet" copy + a
  one-line explanation + a single CTA back to the public site.

### 5.3 Boundary rules

- A customer **never** sees another customer's data. All queries scope
  by `customer_id`.
- A customer **never** sees admin-only fields:
  `internal_note`, `last_error`, `retry_count`, raw `extraction_data`,
  raw `questionnaire_data`, raw QA flags.
- Admin and customer dashboards are at separate URL trees and use
  separate cookies. No shared layout.
- The customer dashboard cannot trigger generation or status changes —
  it is read-only over orders/packs in v1, with the single exception of
  `Settings → update profile` and `Downloads → re-issue link`.

---

## 6 · Payment provider choice

### 6.1 Comparison

| Provider | Indian founder allowed? | International USD pricing | Subscriptions | Tax handling | Webhooks | B2B trust |
|---|---|---|---|---|---|---|
| **PayPal** (current) | yes | yes | yes (basic) | none | yes (already wired) | medium |
| **Paddle** | yes (Merchant of Record) | yes | yes (mature) | full (handles VAT/sales-tax/India GST per buyer geo) | yes | high |
| **Lemon Squeezy** | yes (MoR; now Stripe-owned) | yes | yes | full | yes | medium |
| **Stripe** (direct) | **no** for Indian-founder digital exports without a foreign entity | yes | yes (best-in-class) | partial | yes | high |
| **Wise / Skydo / manual invoice** | yes | yes | no | manual | n/a | medium (premium tier only) |

### 6.2 Decision

**Primary provider: Paddle.**

- Acts as Merchant of Record so the founder ships invoices, handles
  sales tax / VAT / GST per buyer geography, and pays out to an Indian
  bank. This unblocks the "international customers only" requirement
  without needing a US/UK/EU entity.
- Subscription support is mature and tested on B2B SaaS.
- Webhook signing model is straightforward and idempotent.
- Pricing UX is professional enough for B2B procurement teams.

**Fallback: PayPal.** Already wired, already tested. Customers who
prefer it (especially smaller buyers) keep that option. No code is
removed.

**Manual invoice (Wise) for premium tier ($2,500+).** Stays an admin
operation; customer journey is "Apply → founder reviews → invoice".
Not part of the automated checkout.

### 6.3 Tier-1 snapshot rule (locked)

The brief says: "if instant checkout for $99 is enabled, snapshot
generation must be implemented first." Current state:
`engine/src/snapshot.ts` is a stub; `engine/src/pipeline.ts:112-125`
explicitly rejects tier_1 with `failed_needs_retry`.

Therefore in Batch 2:

- **Default**: $99 snapshot stays `request-only`. No `/checkout` button
  for tier_1. The pricing page keeps "Request snapshot" for that tier.
- **Optional add-on inside Batch 2**: implement `engine/src/snapshot.ts`
  first (the file's own header lists the build outline — ~2-3 hours of
  work). Then enable tier_1 in `/checkout`.

This keeps the rule "do not enable checkout for a tier unless delivery
exists."

### 6.4 Removal plan for PayPal

**Not in Phase 5.** PayPal stays live. We re-evaluate after we have a
month of data on Paddle webhook reliability + buyer preference.

---

## 7 · Subscription model (Batch 3)

### 7.1 Plans

| Plan code | Display name | Price | Delivery on renewal |
|---|---|---|---|
| `update_monitor_99` | AI Governance Update Monitor | $99 / month | Monthly re-scan, disclosure-update reminder, queue refresh of latest pack |
| `agency_monthly_299` | Agency Monthly Handoff Plan — Starter | $299 / month | Up to 3 client handoff packs / month |
| `agency_monthly_999` | Agency Monthly Handoff Plan — Studio | $999 / month | Up to 12 client handoff packs / month |
| `premium_retainer` | Premium Review Retainer | manual / custom | Founder-led; not in `/checkout` |

### 7.2 Hard rules

- Subscriptions are **optional**. Nothing on the public site is gated
  on a subscription.
- Subscriptions are **not visible** in the dashboard until the chosen
  provider supports them and the account is configured.
- A subscription that fails to renew keeps the customer in `past_due`
  for one cycle, then `expired`. We never auto-charge again silently.
- Cancellation is one click on
  `/dashboard/subscription`. Effective at period end. We email a
  receipt + cancel confirmation.
- We never claim a subscription "ensures compliance" or "prevents
  audit findings". Copy uses "monthly evidence refresh", "update
  monitoring", "draft refresh".

### 7.3 Renewal delivery

The renewal handler reuses `engine/src/pipeline.ts` for governance pack
refresh. A new helper `engine/src/snapshot.ts` (when built) handles
the monthly snapshot. The pipeline already routes by tier; renewal
just re-uses the customer's last `assessment` + a fresh `website_scan`.

---

## 8 · Connector roadmap (Batch 4)

### 8.1 Sequence

1. **Google Drive export** (highest customer demand expected)
2. **Notion export** (mid-market customer fit)
3. **GitHub doc import** (read-only; helps extraction quality)
4. **PDF / DOCX upload parsing** (for privacy policy, AI policy,
   security docs the customer already has)
5. **Slack / CRM** — explicitly later. Not in Phase 5.

### 8.2 Hard rules

- Connectors are **always optional**. The pack is always downloadable
  from `/dashboard/downloads` as a zip. A connector failure can only
  affect the connector export, never delivery.
- OAuth tokens are encrypted at rest with `CONNECTOR_ENC_KEY` (AES-256
  GCM, key only on server). No tokens in client code, no tokens in
  logs.
- We request the **least scope** that works:
  - Drive: `drive.file` (only files we create)
  - Notion: workspace export OAuth, read+write on user-selected page
  - GitHub: `public_repo` read-only
- Disconnect is one click. Disconnect deletes the encrypted token row.
- Every connector export writes a `connector_exports` row with status
  + error so the customer can see why something failed.

### 8.3 v1 connector UI

- `/dashboard/settings/connectors` — list of providers + connect /
  disconnect button per row.
- `/dashboard/packs/[id]` — primary action remains "Download zip";
  connector exports are secondary buttons next to it.

---

## 9 · Security model

### 9.1 Auth

- **Customer**: HMAC-signed cookie `tf_customer`. Format
  `<exp_unix>.<hmac_sha256>`. Key = `CUSTOMER_SESSION_SECRET` (server
  env). 30-day TTL. HttpOnly + SameSite=Lax + Secure in prod.
- **Admin**: unchanged. `tf_admin` cookie, separate signing key.
- **Magic link**: generate 32-byte random token, store
  `sha256(token)` only, 15-minute TTL, single-use (set `used_at` on
  first verify). Token in URL query: `/api/customer/verify?t=...`.
  Never log the raw token. Never email the cookie.

### 9.2 Database

- Service-role-only access (matches existing convention). No anon-key
  client queries from browser. Every dashboard fetch hits a Next
  server route that uses the engine's `service()` client.
- Per-customer scoping enforced **server-side** by every customer API
  reading `me.id` from the verified cookie and adding
  `.eq('customer_id', me.id)` to the Supabase query.
- Cross-tenant testing in QA: a second test customer must never see
  the first customer's rows.

### 9.3 Storage

- Pack zips stay in the existing `deliveries` Supabase Storage bucket
  (private). Customer downloads use signed URLs issued by
  `/api/customer/download-link`, valid 7 days, with the `customer_id`
  stamped in the URL audit log via the new `download_link_events`
  field on `email_events`.
- Customer cannot list the bucket. Customer cannot guess paths
  (storage paths include `order_id` UUID).

### 9.4 Webhooks

- Every provider webhook verifies signature before any DB write
  (matches existing PayPal pattern).
- Replays are no-ops (`unique (provider, external_event_id)` on
  `provider_events`).
- Failures notify the founder via the existing `notifyFounder` helper
  and never silently swallow.

### 9.5 Headers and logging

- Add CSP and `Strict-Transport-Security` in production via
  `next.config.js` headers — confirm in Batch 1 review.
- Never log full email addresses in app logs. Mask as
  `f***@example.com`.
- Never log tokens, passwords, or session secrets.
- Every customer API logs `{ customer_id, route, ms, status }` only.

### 9.6 Forbidden language audit

Every batch ends with:

```
grep -ri "guaranteed compliance|fully compliant|audit-proof|no lawyer needed|legal guarantee|buy now|order now"
```

across `app/app/**` and `engine/**`. Expected: 0 hits.

---

## 10 · Rollback plan

Each batch must be reversible without a data restore. Strategy:

### Batch 1 — auth + dashboard
- All new code lives under `/dashboard/*`, `/login`, `/api/customer/*`,
  `app/lib/customer-auth.ts`. Removal: delete those routes + drop the
  three new tables. Rolling back leaves `customer_id` columns on
  existing tables — they're nullable and unused, so harmless.
- If the magic-link flow breaks: a feature flag
  `NEXT_PUBLIC_CUSTOMER_AUTH_ENABLED=false` disables `/login` and
  redirects `/dashboard/*` to `/contact`. Public site keeps working.

### Batch 2 — instant checkout
- New provider lives behind `NEXT_PUBLIC_CHECKOUT_PROVIDER=paddle|paypal|off`.
  Default `off` until launch. Setting `off` keeps everything
  request-led.
- PayPal stays in place untouched. So even with new provider broken,
  the founder can flip back to "request → manual invoice" or "PayPal
  link in email".
- Open `orders` rows with `provider != 'paypal'` are isolated by the
  `provider` column; rolling back just stops new orders.

### Batch 3 — subscriptions
- Behind `NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED=false`. Public pricing
  page hides the recurring section if false.
- Existing subscriptions (if any) keep flowing through the webhook
  but the customer dashboard tab is hidden.

### Batch 4 — connectors
- Behind `NEXT_PUBLIC_CONNECTORS_ENABLED=false`. Settings tab hides
  the connector list. Pack delivery (zip) keeps working.
- Disabling a single provider is a per-provider feature flag:
  `CONNECTOR_GOOGLE_DRIVE_ENABLED=false`.

### Batch 5 — polish
- Pure UI / UX. Roll back by reverting the commit.

### Universal
- All migrations are additive. None drop columns or tables. Rollback =
  drop the new tables in reverse order.
- Every batch ends with a clean `git tag phase-5-batch-N-launch`.
  `git revert` to the previous tag is always possible.

---

## 11 · Smoke tests

Each batch must pass these before merge.

### 11.1 Universal v1 core-loop smoke (every batch)

1. `/` renders with the dark hero + "Run free check" header pill.
2. `/assessment` step 1 input renders and accepts a URL.
3. `POST /api/request` with a test email returns 200 and writes a row.
4. `/admin/login` accepts the password and redirects to `/admin`.
5. `/admin/requests` shows the test row.
6. PATCH `/api/admin/requests/[id]` flips status and the change
   persists.

These are codified in `scripts/qa-flow-test.mjs` and
`scripts/qa-admin-flow.mjs`. **Both must remain green throughout
Phase 5.**

### 11.2 Per-batch smokes

**Batch 1**:
1. Request magic link for a brand-new email → email arrives → click
   link → land on `/dashboard/overview` with empty state.
2. Request magic link for an email matching a real `requests` row →
   verify → see the request in `/dashboard/requests`.
3. Sign out → `/dashboard/*` redirects to `/login`.
4. Forge a `tf_customer` cookie → backend rejects.
5. Customer A cannot see customer B's row.
6. Admin dashboard untouched (admin smoke still green).

**Batch 2**:
1. Click "Buy disclosure pack" → land on Paddle checkout → pay with
   test card → return to `/checkout/success` → magic link emailed →
   sign in → see the order in `/dashboard/orders`.
2. Webhook replays the same `external_event_id` → no duplicate order.
3. Webhook signature failure → 401, no DB writes.
4. Failed test card → `/checkout/cancel` → no order row created (or
   order row in `payment_status = 'failed'`).
5. PayPal flow still works end-to-end.
6. Tier 1 (snapshot) checkout button is **not** present unless
   `engine/src/snapshot.ts` is implemented.

**Batch 3**:
1. Subscribe to Update Monitor with test card → `subscriptions` row
   created, `/dashboard/subscription` shows active.
2. Cancel → `cancel_at_period_end = true` shown.
3. Simulate failed renewal → status flips to `past_due`, customer sees
   it, founder is notified.
4. Re-subscribe after expiry creates a fresh row, not a duplicate.

**Batch 4**:
1. Connect Google Drive → token row created → click "Export pack" →
   `connector_exports` row goes `queued → running → ok` → file
   appears in the customer's Drive.
2. Disconnect → token row deleted → "Export pack" hidden.
3. Force a connector error → row goes `running → failed`, customer
   sees error, pack zip still downloadable.
4. Upload a privacy-policy PDF → parsed source notes saved → next
   pack generation references them.

**Batch 5**:
1. Every dashboard tab has a useful empty state.
2. Mobile (390 viewport) audit of every dashboard tab.
3. Dark-mode contrast spot-check (no dark-on-dark text).
4. Final forbidden-phrase grep → 0 hits.
5. 24 screenshots captured at 1440 / 1920 / 390 for the dashboard.

### 11.3 Reproducible test scripts

Each batch ships its scripts under `scripts/qa-*.mjs`:

- `qa-customer-flow.mjs` (Batch 1)
- `qa-checkout-flow.mjs` (Batch 2)
- `qa-subscription-flow.mjs` (Batch 3)
- `qa-connector-flow.mjs` (Batch 4)
- `qa-dashboard-screenshots.mjs` (every batch — recapture on change)

---

## 12 · Launch gates

Each batch is gated on the same checklist before the founder calls it
done:

```
[ ] npx tsc --noEmit                         pass
[ ] npm run build                            pass
[ ] qa-flow-test.mjs                         15/15 pass
[ ] qa-admin-flow.mjs                        8/8 pass
[ ] qa-{batch}-flow.mjs                      defined acceptance pass
[ ] qa-scale-audit.mjs                       no overflow / no tiny cards
[ ] forbidden-phrase grep                    0 hits
[ ] disclaimer present on every public page  yes
[ ] manual click-through of v1 loop          yes
[ ] manual click-through of new batch        yes
[ ] progress.txt                             updated with batch outcome
[ ] docs/34 § N "Batch N status"             updated
```

Phase 5 is "complete" when all five batches close and the customer
journey end-to-end (visitor → free check → checkout → magic link →
dashboard → download → upgrade) works without founder intervention
for at least one paying international customer.

---

## 13 · Risk notes

- **`engine/src/snapshot.ts` is a stub.** Tier_1 cannot be sold via
  `/checkout` until this ships. Either skip $99 in Batch 2 (default)
  or implement snapshot first.
- **PayPal webhook is the canonical pipeline trigger today.** Any
  change to that handler is high-risk. Batch 2 adds a parallel
  Paddle webhook; it does not modify PayPal.
- **Service-role-only Supabase model.** Every customer query MUST
  go through a server route. Direct browser → Supabase with anon key
  is forbidden in v1 (no policies exist to scope it correctly).
- **Email deliverability** for the magic link is critical. Resend
  is already configured for transactional mail. Add SPF/DKIM/DMARC
  audit before Batch 1 launches publicly.
- **Cookie name collision.** `tf_admin` and `tf_customer` are
  separate. Verify in QA that having both does not break either.
- **Customer/admin separation audit.** Before each batch closes, an
  admin trying to navigate `/dashboard/*` without the customer cookie
  should land on `/login`, not in the dashboard. And vice-versa.
- **No legal overclaims.** Every new dashboard string passes through
  the same content review as marketing pages: no certification, no
  guarantee, no "audit-proof", no "fully compliant".

---

## 14 · Documentation discipline

Each batch ends with:

- Append a `## Batch N status` block to this doc (§ 15+).
- Update `progress.txt` with a one-paragraph summary + acceptance
  checklist outcome.
- If a doc dependency moved (e.g. `docs/21` IA tweaks), commit the
  doc change in the same batch.

This doc owns Phase 5. It supersedes nothing; it cross-references
`docs/21`, `docs/23`, `docs/24` for detail beyond the planning level.

---

## 15 · Open questions for the founder before Batch 1 starts

These are blockers; please confirm so coding can begin without rework.

1. **Magic-link UX**: confirm we issue links to ANY email that submits
   `/api/customer/login-link` — i.e. we lazily create
   `customer_profiles` on first request. (Alternative: only allow login
   for emails that already appear in `requests` or `orders`. Slightly
   safer but worse UX.)
2. **Backfill rule**: confirm "on first login, attach all rows where
   `email = customer.email`" is acceptable. If the email was used by
   different humans in the past, they share an account.
3. **Cookie strategy**: confirm we use a parallel HMAC cookie
   (`tf_customer`) instead of bringing in Supabase Auth. The HMAC
   pattern matches `admin-auth.ts`, avoids new dependencies, and keeps
   the service-role-only DB model intact. Switching to Supabase Auth is
   possible later; it is a one-way door if we adopt it now.
4. **Provider choice**: confirm Paddle as primary for Batch 2. If the
   founder has an existing Paddle / LemonSqueezy / Stripe Atlas account,
   say so — that changes which integration we wire first.
5. **Tier 1 in Batch 2**: confirm we skip $99 instant checkout until
   `engine/src/snapshot.ts` is implemented. Otherwise we must implement
   snapshot inside Batch 2 (~2-3 hours of additional engine work).
6. **Subscriptions reveal**: confirm we hide all subscription UI on
   public site + dashboard until Batch 3 ships. The pricing page won't
   mention recurring offers in Batch 2.

Once these six are answered, Batch 1 can start.

---

*Phase 5 succeeds when a real international buyer can: visit the
website, run the free check, request or pay for a pack, receive a
magic-link login, see their order and pack in the dashboard, download
the pack, and request an upgrade — without the founder doing any
manual work in the happy path.*

---

## 16 · Batch 1 status — Customer login + dashboard

Status: **code-complete, runtime-pending one DB migration.**

### What shipped

**Foundation (Sub-batch 1A)**
- `engine/supabase/migrations/0004_customer_auth.sql` — three new tables
  (`customer_profiles`, `customer_link_tokens`, `customer_auth_events`)
  + nullable `customer_id` on `requests`, `orders`, `assessments`. RLS on,
  service-role bypass, fully additive.
- `app/lib/customer-auth.ts` — HMAC `tf_customer` cookie utils
  (`<exp>.<customer_id>.<hmac_sha256>`), 30-day TTL, plus magic-link
  token generation (32-byte hex, sha256 stored, 15-min TTL, single-use).
- `app/lib/customer-data.ts` — known-email gate (`isKnownEmail`),
  get-or-create profile, idempotent backfill of `customer_id` on
  existing rows, customer-scoped reads (`listMyRequests` / `listMyOrders`
  / `listMyPacks` / `getMyOrder`), audit logger.
- `engine/src/customer-mail.ts` — `sendCustomerMagicLink` template via
  Resend, `template_id = 'customer_magic_link'` so the founder can
  filter auth-link sends out of pack delivery.

**API surface (Sub-batch 1B)**
- `POST /api/customer/login-link` — known emails only, generic
  response always returns 200 to prevent email enumeration. Logs
  `link_sent` or `link_unknown_email` audit row.
- `GET  /api/customer/verify` — single-use token consumption, sets
  `tf_customer` cookie, runs idempotent backfill, redirects to
  `/dashboard` (or `/login?status=invalid_link` on failure).
- `POST /api/customer/logout` — clears cookie, idempotent.
- `GET / PATCH /api/customer/me` — profile read + update.
- `GET /api/customer/summary` — Overview tab payload.
- `GET /api/customer/requests` — customer-scoped requests list.
- `GET /api/customer/orders` — customer-scoped orders list.
- `GET /api/customer/packs` — customer-scoped packs (delivered only).
- `POST /api/customer/download-link` — issues a fresh 7-day signed
  Supabase Storage URL for a pack the customer owns.

**UI (Sub-batches 1C–1F)**
- `/login` + `LoginForm` — calm generic UX, "If this email is linked
  to a TrustFolder request, we'll send a sign-in link."
- `/dashboard/*` layout with sidebar nav, sign-out, dark editorial
  palette matching the public site.
- `/dashboard/overview` — Single primary "next step" card driven by
  state machine + three latest snapshots (request / order / pack).
- `/dashboard/requests` `/orders` `/packs` `/downloads` `/settings` —
  read-only over existing Supabase tables, scoped by `customer_id`,
  with strong empty states everywhere.

**Environment**
- `CUSTOMER_SESSION_SECRET` added to `app/.env.local` (random 48-byte
  base64). Production must set its own value.

### Verification

| Check | Result |
|---|---|
| `npx tsc --noEmit` (engine + app) | pass |
| `npm run build` | pass — 16 new routes, total 47 routes |
| `qa-flow-test.mjs` (v1 regression) | 15/15 pass |
| `qa-admin-flow.mjs` (v1 regression) | 8/8 pass |
| `qa-customer-flow.mjs` Phase 1 | 7/7 pass (page renders, auth gate, generic login-link, 401, idempotent logout, invalid-token redirect) |
| `qa-customer-flow.mjs` Phase 2 | skipped — migration 0004 not yet applied |
| `qa-batch1-screenshots.mjs` Phase 1 | `/login`, `/dashboard` redirect captured |
| Forbidden-phrase grep (entire customer surface) | 0 hits |
| Disclaimer present on dashboard | yes (Overview footer + Settings card) |

### Hand-off — founder action required (one step)

Apply `engine/supabase/migrations/0004_customer_auth.sql` to the
Supabase project:

1. Open Supabase Studio → SQL editor → New query.
2. Paste the entire migration file.
3. Click **Run**. Idempotent — safe to run twice.
4. Locally re-run `node scripts/qa-customer-flow.mjs` to execute Phase 2
   (full magic-link end-to-end: link sent → token consumed → cookie set
   → dashboard renders → logout → token cannot be replayed).
5. (Optional) `node scripts/qa-batch1-screenshots.mjs` to capture all
   six dashboard tabs for review.

Once Phase 2 passes, Batch 1 is fully verified and Batch 2 can begin.

### What is deferred (out of Batch 1)

- Email change flow + double-confirm (v2 of customer auth).
- Workspaces / team seats (Phase 5 §1 explicitly out of scope).
- Any mutation from the dashboard beyond profile + download-link
  re-issue. No order cancellation, no request edit, no pack delete.
- Connector tabs (Batch 4).
- Subscription tab (Batch 3).

---

## 15 · Batch 2 payment provider decision — PayPal primary

PayPal is the main payment provider for Batch 2. Manual PayPal invoice or
payment link remains the fallback for unsupported tiers.

Do not integrate Paddle, Stripe, Lemon Squeezy, or any new provider in
Batch 2. Do not build subscriptions in Batch 2. Keep subscription UI hidden
until Batch 3.

Batch 2 supported checkout tiers:

- `tier_2` — AI Disclosure Pack, $499, secure PayPal checkout after fit check.
- `tier_3` — Buyer-Ready AI Governance Folder, $999, secure PayPal checkout
  after fit check.

Request-only/manual tiers:

- `tier_1` — AI Website Trust Snapshot, $99. No PayPal checkout until snapshot
  generation exists.
- `tier_4` — Enterprise Buyer Handoff, $2,500+. Manual application/invoice.
- Agency Pack — manual request/invoice.

Safety invariants:

- Generation starts only after confirmed PayPal capture.
- Capture, return-page retry, and webhook replay must not create duplicate
  generation or duplicate delivery.
- Failed, denied, refunded, and reversed payments must show a clear status and
  support path in the customer dashboard.
- PayPal sandbox currency/account issues should be documented and retested with
  a compatible sandbox buyer, not used as a reason to switch providers.

Reference: `docs/36-paypal-main-provider.md`.
