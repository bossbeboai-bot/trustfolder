-- TrustFolder · Initial schema · Phase 2
-- 7 tables: leads, assessments, orders, website_scans, generated_packs, qa_results, email_events
-- Plus order_status_events for the state machine audit log

-- ============================================================================
-- Extensions
-- ============================================================================
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================================================
-- Enums
-- ============================================================================
-- Pricing tiers (canonical mapping in `docs/03-pricing-and-tiers.md`):
--   tier_0 = Free Eligibility Check         · $0
--   tier_1 = Lite Readiness Snapshot        · $99
--   tier_2 = Article 50 Disclosure Pack     · $499
--   tier_3 = Full AI Governance Evidence    · $999
--   tier_4 = Premium Buyer/Legal Handoff    · $2.5-4.5k (application-only)
do $$ begin
  create type tier_t as enum ('tier_0', 'tier_1', 'tier_2', 'tier_3', 'tier_4');
exception when duplicate_object then null; end $$;

do $$ begin
  create type confidence_band_t as enum ('CLEAR', 'REVIEW', 'UNCERTAIN', 'SOFT_OUT', 'HARD_OUT');
exception when duplicate_object then null; end $$;

do $$ begin
  create type order_status_t as enum (
    'lead_created',
    'website_scanned',
    'questions_completed',
    'scope_checked',
    'payment_pending',
    'payment_completed',
    'generation_started',
    'qa_started',
    'qa_passed',
    'package_created',
    'delivered',
    'failed_needs_retry',
    'out_of_scope'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_status_t as enum ('pending', 'completed', 'failed', 'refunded');
exception when duplicate_object then null; end $$;

-- ============================================================================
-- 1. leads
-- Captures every URL+email entry, regardless of whether it converts.
-- ============================================================================
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  url text,
  source text default 'free_assessment',  -- free_assessment | waitlist | nurture
  user_agent text,
  ip_country text,
  utm jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists leads_email_idx on leads (email);
create index if not exists leads_created_at_idx on leads (created_at desc);

-- ============================================================================
-- 2. website_scans
-- Cached crawler output — keyed by URL so re-scans are cheap.
-- ============================================================================
create table if not exists website_scans (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  fetched_at timestamptz not null default now(),
  fetch_ok boolean not null,
  http_status int,
  pages_fetched jsonb default '[]'::jsonb,  -- ['/', '/pricing', ...]
  raw_text_length int default 0,
  raw_text text,                             -- truncated combined body text
  fetch_error text,
  ttl_seconds int default 86400,
  unique (url, fetched_at)
);

create index if not exists website_scans_url_idx on website_scans (url, fetched_at desc);

-- ============================================================================
-- 3. assessments
-- The free Tier-0 assessment + Tier-1/2 pre-checkout questionnaire data.
-- One row per user-completed flow before payment.
-- ============================================================================
create table if not exists assessments (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete set null,
  email text not null,
  url text,
  scan_id uuid references website_scans(id) on delete set null,

  -- Extraction output (from Claude)
  extraction_data jsonb default '{}'::jsonb,
  extraction_confidence text,          -- low | medium | high
  extraction_at timestamptz,

  -- Questionnaire answers (8-15 fields)
  questionnaire_data jsonb default '{}'::jsonb,
  questionnaire_completed_at timestamptz,

  -- Scope check
  scope_check_passed boolean,
  scope_check_band confidence_band_t,
  scope_check_matched_keywords text[] default '{}',
  scope_check_at timestamptz,

  -- Tier suggestion shown to user
  recommended_tier tier_t,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists assessments_email_idx on assessments (email);
create index if not exists assessments_lead_id_idx on assessments (lead_id);
create index if not exists assessments_created_at_idx on assessments (created_at desc);

-- ============================================================================
-- 4. orders
-- Paid orders. Stores everything needed to regenerate if the engine fails.
-- ============================================================================
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid references assessments(id) on delete set null,
  email text not null,
  url text not null,
  tier tier_t not null,

  -- Pricing
  amount_cents int not null,
  currency text not null default 'usd',

  -- PayPal
  paypal_order_id text unique,
  paypal_capture_id text,
  payment_status payment_status_t not null default 'pending',

  -- Snapshot of assessment at create-order time (NEVER lose customer answers)
  questionnaire_data jsonb not null default '{}'::jsonb,
  extraction_data jsonb not null default '{}'::jsonb,
  scope_check_passed boolean,
  scope_check_band confidence_band_t,

  -- Status
  status order_status_t not null default 'payment_pending',
  status_updated_at timestamptz not null default now(),

  -- Generation artifacts
  generated_pack_id uuid,    -- FK set after package_created (generated_packs.id)
  delivery_email_id uuid,    -- FK set after delivered (email_events.id)
  signed_download_url text,
  signed_url_expires_at timestamptz,

  -- Failure handling
  retry_count int not null default 0,
  last_error text,
  last_error_at timestamptz,

  created_at timestamptz not null default now(),
  paid_at timestamptz,
  generated_at timestamptz,
  delivered_at timestamptz
);

create index if not exists orders_email_idx on orders (email);
create index if not exists orders_status_idx on orders (status);
create index if not exists orders_paypal_order_id_idx on orders (paypal_order_id);
create index if not exists orders_created_at_idx on orders (created_at desc);

-- ============================================================================
-- 5. order_status_events
-- Append-only audit log of every status transition. Diagnostic + monitoring.
-- ============================================================================
create table if not exists order_status_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  from_status order_status_t,
  to_status order_status_t not null,
  actor text not null,                 -- 'system' | 'webhook' | 'admin' | module name
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists order_status_events_order_id_idx on order_status_events (order_id, created_at desc);
create index if not exists order_status_events_to_status_idx on order_status_events (to_status, created_at desc);

-- ============================================================================
-- 6. generated_packs
-- Per-document outputs from a generation run.
-- ============================================================================
create table if not exists generated_packs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  generation_run int not null default 1,        -- 1 = first attempt, 2+ = retry
  template_id text not null,                    -- e.g., 't1-01-chatbot-disclosure'
  content_md text,
  content_html text,
  confidence_band confidence_band_t,
  citations jsonb default '[]'::jsonb,
  api_cost_cents int default 0,
  duration_ms int,
  generation_status text not null default 'pending',  -- pending | ok | failed
  error_message text,
  created_at timestamptz not null default now()
);

create index if not exists generated_packs_order_id_idx on generated_packs (order_id);
create unique index if not exists generated_packs_unique_template_per_run
  on generated_packs (order_id, generation_run, template_id);

-- ============================================================================
-- 7. qa_results
-- Output of the QA pass on a generation run.
-- ============================================================================
create table if not exists qa_results (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  generation_run int not null default 1,
  score int not null,                          -- 0-100
  pass boolean not null,
  flags jsonb default '[]'::jsonb,             -- list of issue objects
  rules_checked jsonb default '[]'::jsonb,
  api_cost_cents int default 0,
  duration_ms int,
  created_at timestamptz not null default now()
);

create index if not exists qa_results_order_id_idx on qa_results (order_id);
create unique index if not exists qa_results_unique_per_run on qa_results (order_id, generation_run);

-- ============================================================================
-- 8. email_events
-- Every transactional email we send (delivery, follow-up, refund, retry-notice).
-- ============================================================================
create table if not exists email_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete set null,
  to_email text not null,
  template_id text not null,                   -- 'order_confirmation' | 'pack_delivery' | 'retry_notice' | etc
  subject text,
  resend_message_id text,
  status text not null default 'queued',       -- queued | sent | delivered | bounced | failed
  metadata jsonb default '{}'::jsonb,
  sent_at timestamptz,
  delivered_at timestamptz,
  error_message text,
  created_at timestamptz not null default now()
);

create index if not exists email_events_order_id_idx on email_events (order_id);
create index if not exists email_events_to_email_idx on email_events (to_email);
create index if not exists email_events_template_id_idx on email_events (template_id);

-- ============================================================================
-- Triggers
-- ============================================================================
create or replace function trigger_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists assessments_set_updated_at on assessments;
create trigger assessments_set_updated_at
  before update on assessments
  for each row execute function trigger_set_updated_at();

create or replace function trigger_set_status_updated_at()
returns trigger as $$
begin
  if new.status is distinct from old.status then
    new.status_updated_at = now();
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists orders_set_status_updated_at on orders;
create trigger orders_set_status_updated_at
  before update on orders
  for each row execute function trigger_set_status_updated_at();

-- ============================================================================
-- Row Level Security
-- ============================================================================
-- All tables locked down to service role by default; anon/auth roles get nothing.
-- The Next.js app uses the service role key on server-only code paths.

alter table leads enable row level security;
alter table website_scans enable row level security;
alter table assessments enable row level security;
alter table orders enable row level security;
alter table order_status_events enable row level security;
alter table generated_packs enable row level security;
alter table qa_results enable row level security;
alter table email_events enable row level security;

-- (No policies created — service-role bypass applies.)

-- ============================================================================
-- Storage bucket — REQUIRED MANUAL SETUP
-- ============================================================================
-- Engine `package.ts` uploads finished pack ZIPs to a Supabase Storage bucket
-- named `deliveries` (overridable via env `SUPABASE_STORAGE_BUCKET`).
--
-- Bucket creation is intentionally NOT executed from this migration because
-- Supabase migrations cannot reliably create storage buckets in all hosting
-- modes. Create it once per environment via either of:
--
--   (a) Supabase Studio  →  Storage  →  New bucket
--          name:    deliveries
--          public:  off
--
--   (b) `supabase` CLI:
--          supabase storage create-bucket deliveries --public=false
--
--   (c) SQL (run manually in the Supabase SQL editor):
--          insert into storage.buckets (id, name, public)
--          values ('deliveries', 'deliveries', false)
--          on conflict (id) do nothing;
--
-- Verification: run `scripts/check-supabase-config-and-schema.ps1` after
-- creating the bucket. Pack delivery will fail with a `storage_upload_failed`
-- error if the bucket is missing.
