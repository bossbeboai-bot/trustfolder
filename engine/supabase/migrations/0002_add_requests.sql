-- TrustFolder · Migration 0002 · adds the `requests` table.
--
-- Purpose: capture paid-pack and contact requests that come in via /api/request
-- (the lead-capture form on /request and CTAs from /, /pricing, /agencies, ...).
-- This is intentionally separate from `leads`, which is opened by /api/scan.
--
-- Status values:
--   new          — just submitted, founder has not touched it
--   contacted    — founder has emailed/replied
--   qualified    — founder has confirmed scope is appropriate
--   converted    — request was upgraded to a paid order
--   closed_lost  — request will not convert
--
-- Privacy: `metadata jsonb` is reserved for non-PII context (UTM, source page,
-- referrer). Do not store secrets or tokens here.

-- ============================================================================
-- Enum
-- ============================================================================
do $$ begin
  create type request_status_t as enum (
    'new',
    'contacted',
    'qualified',
    'converted',
    'closed_lost'
  );
exception when duplicate_object then null; end $$;

-- ============================================================================
-- Table
-- ============================================================================
create table if not exists requests (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  website_url text,
  company_name text,
  package_interest text,                    -- 'snapshot' | 'pack' | 'governance' | 'agency' | 'premium' | etc
  message text,
  source_page text,                         -- '/request', '/contact', '/agencies', ...
  status request_status_t not null default 'new',
  created_at timestamptz not null default now(),
  metadata jsonb default '{}'::jsonb
);

create index if not exists requests_email_idx on requests (email);
create index if not exists requests_status_idx on requests (status);
create index if not exists requests_created_at_idx on requests (created_at desc);

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table requests enable row level security;
-- (No policies created — service-role bypass applies, mirroring the rest of the schema.)
