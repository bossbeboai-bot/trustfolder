-- TrustFolder · Migration 0004 · customer auth + dashboard linkage
--
-- Phase 5 / Batch 1 — adds the three new tables and the nullable
-- customer_id columns described in `docs/34-phase-5-platform-expansion-plan.md`
-- §3.1–§3.2.
--
-- Hard rules:
--   · Additive only — no existing column dropped, no row mutated.
--   · RLS enabled, no policies — service-role bypass continues to apply.
--   · `customer_id` is nullable everywhere it is added so legacy rows
--     keep working until the lazy first-login backfill associates them.
--
-- Identity model is "known emails only": magic-link tokens are issued only
-- when the email already appears in `requests.email`, `orders.email`, or
-- `assessments.email`. Lazy creation happens at /api/customer/verify, not
-- at /api/customer/login-link, so unknown emails leave no trail beyond
-- a `customer_auth_events` row with event_type = 'link_unknown_email'.

-- ============================================================================
-- customer_profiles — one row per known customer email
-- ============================================================================
create table if not exists customer_profiles (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  display_name text,
  company_name text,
  website_url text,
  notification_opt_in boolean not null default true,
  created_at timestamptz not null default now(),
  last_login_at timestamptz,
  status text not null default 'active'  -- 'active' | 'disabled'
);

create index if not exists customer_profiles_status_idx on customer_profiles (status);

-- ============================================================================
-- customer_link_tokens — single-use magic-link tokens
-- token_hash = sha256(token). Raw token is never stored.
-- ============================================================================
create table if not exists customer_link_tokens (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customer_profiles(id) on delete cascade,
  token_hash text not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  ip text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists customer_link_tokens_hash_idx on customer_link_tokens (token_hash);
create index if not exists customer_link_tokens_customer_idx on customer_link_tokens (customer_id, created_at desc);

-- ============================================================================
-- customer_auth_events — audit log for every auth-related action
-- event_type ∈ {
--   'link_sent', 'link_unknown_email', 'login_success',
--   'login_failed', 'logout', 'profile_updated'
-- }
-- ============================================================================
create table if not exists customer_auth_events (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customer_profiles(id) on delete set null,
  email text not null,
  event_type text not null,
  ip text,
  user_agent text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists customer_auth_events_email_idx on customer_auth_events (email, created_at desc);
create index if not exists customer_auth_events_type_idx on customer_auth_events (event_type, created_at desc);

-- ============================================================================
-- Backfill columns on existing tables
-- ============================================================================
alter table requests    add column if not exists customer_id uuid references customer_profiles(id);
alter table orders      add column if not exists customer_id uuid references customer_profiles(id);
alter table assessments add column if not exists customer_id uuid references customer_profiles(id);

create index if not exists requests_customer_id_idx     on requests (customer_id);
create index if not exists orders_customer_id_idx       on orders (customer_id);
create index if not exists assessments_customer_id_idx  on assessments (customer_id);

-- ============================================================================
-- Triggers — keep last_login_at honest is handled in app code, not SQL
-- ============================================================================

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table customer_profiles    enable row level security;
alter table customer_link_tokens enable row level security;
alter table customer_auth_events enable row level security;
-- (No policies — service-role bypass applies, mirroring the rest of the schema.)
