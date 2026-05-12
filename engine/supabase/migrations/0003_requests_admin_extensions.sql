-- TrustFolder · Migration 0003 · admin extensions to `requests`
--
-- Phase 3.6 (Website Product Flow + Admin Ops Completion) needs two small
-- additions on the existing `requests` table so the founder admin dashboard
-- can capture context as it processes inbound leads:
--
--   internal_note  text                     — founder-only free-text note
--   updated_at     timestamptz default now()
--
-- Both are nullable / defaulted so existing rows continue to satisfy
-- read paths without backfill. Service-role bypass continues to apply
-- (RLS already enabled in migration 0002).

alter table requests
  add column if not exists internal_note text,
  add column if not exists updated_at timestamptz not null default now();

create index if not exists requests_updated_at_idx on requests (updated_at desc);

-- Keep updated_at honest for any future trigger-driven UI.
create or replace function trigger_set_requests_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists requests_set_updated_at on requests;
create trigger requests_set_updated_at
  before update on requests
  for each row execute function trigger_set_requests_updated_at();
