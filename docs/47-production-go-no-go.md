# 47 — Production Go / No-Go

Status: Phase 7 launch gate  
Last updated: 2026-05-11

This document is the single sheet of paper used to decide whether
TrustFolder can run live 24/7. Each gate is binary: PASS or FAIL.
The launch is GO only if every gate is PASS.

## 1 · GO gates

- [ ] **App build**: `npx tsc --noEmit` and `npm run build` pass in `app/`.
- [ ] **Engine build**: `npm run build` passes in `engine/`.
- [ ] **Production env**: every variable in `docs/41-production-env-vars.md`
      is set in Vercel.
- [ ] **Supabase probe**: `node scripts/probe-production-supabase.mjs`
      returns `PROBE_RESULT: GO`.
- [ ] **Resend test**: `node scripts/test-email-production.mjs --to
      <ADMIN_EMAIL>` returns `EMAIL_TEST_RESULT: GO` and the mail
      arrives.
- [ ] **PayPal sandbox**: at least one full sandbox approval/capture
      end-to-end test for `tier_2` and `tier_3` produced a delivered
      pack.
- [ ] **Generation/delivery**: `node scripts/qa-production-e2e-dry-run.mjs`
      returns no `FAIL` (manual-only steps may show `NOT_RUN_MANUAL_REQUIRED`
      and they must be resolved by the sandbox capture above).
- [ ] **Customer dashboard**: magic link → `/dashboard/overview` →
      `/dashboard/orders` → `/dashboard/packs` → `/dashboard/downloads`
      all work for a known test account.
- [ ] **Admin dashboard**: login works; requests, orders, failures,
      out-of-scope all render.
- [ ] **Legal pages**: `/terms`, `/privacy`, `/refund`, `/legal` all
      render and link from the footer.
- [ ] **Health**: `GET /api/health` returns 200 with `{ ok: true, ... }`.
- [ ] **Forbidden phrase scan**: clean (no `fully compliant`,
      `guaranteed compliance`, `audit-proof`, `no lawyer needed`,
      `legal guarantee`, `certified`/`certification` outside the
      `not certification` disclaimer, `buy now`).
- [ ] **Tier guards**: `/api/paypal/create-order` rejects `tier_1` and
      any tier outside `tier_2`/`tier_3`.
- [ ] **Support email**: a real human answers `SUPPORT_EMAIL`.

## 2 · NO-GO gates

If any of the following is true, the launch is NO-GO:

- PayPal sandbox approval/capture has not been done.
- Generation or delivery has not been tested end-to-end.
- Email deliverability has not been verified.
- Customer dashboard download is broken for a known test account.
- Supabase `deliveries` bucket is not private.
- Service role key is exposed via `NEXT_PUBLIC_*`.
- One or more of `/terms`, `/privacy`, `/refund`, `/legal` is missing.
- Forbidden overclaiming language is present in the public surface.
- A new compliance module has been turned into checkout (must remain
  request-only).

## 3 · Decision states

The phase result is one of:

- **A — Production-ready 24/7**  
  All GO gates pass. PayPal sandbox capture done. No NO-GO triggered.

- **B — Production-code-ready, manual live checks pending**  
  Build / scripts / dashboards / legal / tier guard pass, but at
  least one manual gate (PayPal live capture, real email
  deliverability, domain DNS) is still pending.

- **C — Not production-ready**  
  Any NO-GO gate triggered.

The current state is recorded in `progress.txt`.
