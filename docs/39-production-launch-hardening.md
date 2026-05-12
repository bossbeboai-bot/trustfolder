# 39 — Production Launch Hardening

Status: Phase 7 master checklist  
Scope: make the existing TrustFolder system run live 24/7 as an automated product. No new features, modules, providers, or compliance scope changes.  
Last updated: 2026-05-11

This doc is the entry point for Phase 7. Every detail lives in a sub-doc:

- `docs/40-vercel-deployment-guide.md`
- `docs/41-production-env-vars.md`
- `docs/42-supabase-production-check.md`
- `docs/43-paypal-production-check.md`
- `docs/44-resend-email-production-check.md`
- `docs/45-admin-rescue-sop.md`
- `docs/46-monitoring-alerts.md`
- `docs/47-production-go-no-go.md`

## 0 · Out of scope for Phase 7

Do not build subscriptions, connectors, team accounts, enterprise SSO, a
new payment provider, new compliance modules, complex analytics, a full
CMS, a marketplace, or a public API.

Phase 7 preserves the existing premium website, assessment flow, request
flow, admin dashboard, customer dashboard, PayPal main provider,
Supabase database, generation pipeline, blog/SEO foundation, and module
roadmap.

## 1 · Deployment checklist

- [ ] App typecheck passes (`npx tsc --noEmit`)
- [ ] App build passes (`npm run build`)
- [ ] Engine build passes (`npm run build`)
- [ ] No localhost hardcoding in production code paths (`APP_BASE_URL`)
- [ ] All public routes render and return 200
- [ ] All API routes export `runtime = 'nodejs'` where they touch
      filesystem, cookies, or the engine SDK
- [ ] No client-side imports of secrets or service-role keys
- [ ] `vercel.json` (if used) only contains build/headers config

## 2 · Production env checklist

- [ ] All required vars set in Vercel (see `docs/41`)
- [ ] No service role keys exposed via `NEXT_PUBLIC_*`
- [ ] No PayPal client secret exposed via `NEXT_PUBLIC_*`
- [ ] `APP_BASE_URL` points to the live domain (no trailing slash)
- [ ] `NODE_ENV=production`
- [ ] Cookie/session secrets set to long random values

## 3 · Supabase checklist

- [ ] Migrations 0001, 0002, 0003, 0004 applied
- [ ] All core tables exist (`leads`, `website_scans`, `assessments`,
      `orders`, `order_status_events`, `generated_packs`, `qa_results`,
      `email_events`)
- [ ] `requests` table exists, with `internal_note` and `updated_at`
- [ ] Customer auth tables exist (`magic_links`, `customer_sessions`,
      and any other tables shipped in `0004_customer_auth.sql`)
- [ ] `deliveries` storage bucket exists and is **private**
- [ ] Service role key works from server only
- [ ] Storage upload + signed-download path verified

Run probe:

```sh
node scripts/probe-production-supabase.mjs
```

## 4 · PayPal checklist

- [ ] Live app created in PayPal dashboard
- [ ] Live `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET` set in production env
- [ ] Live webhook configured at `https://yourdomain.com/api/paypal/webhook`
- [ ] Webhook subscribed to:
      `CHECKOUT.ORDER.APPROVED`, `PAYMENT.CAPTURE.COMPLETED`,
      `PAYMENT.CAPTURE.DENIED`, `PAYMENT.CAPTURE.REFUNDED`,
      `PAYMENT.CAPTURE.REVERSED`
- [ ] Sandbox approval/capture full dry-run done
- [ ] Optional small live amount (e.g. $1) test done if currency / region allows
- [ ] Only `tier_2` and `tier_3` are accepted by `/api/paypal/create-order`
- [ ] `tier_1` returns `tier_1_checkout_disabled` from
      `app/app/api/paypal/create-order/route.ts`
- [ ] Webhook is idempotent and never double-generates
- [ ] Manual invoice fallback documented in `docs/43`

## 5 · Resend / email checklist

- [ ] Sending domain authenticated (SPF + DKIM)
- [ ] `EMAIL_FROM`, `SUPPORT_EMAIL`, `ADMIN_EMAIL` set
- [ ] Magic link email tested
- [ ] Request received email tested
- [ ] Payment confirmed email tested (sandbox capture is enough)
- [ ] Pack preparing / pack delivered emails tested
- [ ] Founder alert email path tested when `ALERT_WEBHOOK_URL` is unset

Test:

```sh
node scripts/test-email-production.mjs
```

## 6 · Generation / delivery checklist

- [ ] Generation runs only after confirmed payment for `tier_2`/`tier_3`
- [ ] Generated pack is uploaded to the `deliveries` bucket
- [ ] `generated_packs` row created with the storage path
- [ ] QA pass runs against the generated docs
- [ ] Customer dashboard shows the new pack
- [ ] Signed download link expires (default 1 hour or whatever
      `download-link/route.ts` returns)
- [ ] Founder alert fires on generation failure

E2E dry-run (safe, marks manual-only steps explicitly):

```sh
node scripts/qa-production-e2e-dry-run.mjs
```

## 7 · Dashboard / download checklist

- [ ] Customer magic link request → email → token verify works
- [ ] `/dashboard/overview`, `/dashboard/orders`, `/dashboard/packs`,
      `/dashboard/downloads` all render after login
- [ ] Customer can only see their own records
- [ ] Replayed magic link is rejected
- [ ] Admin login still works
- [ ] Admin requests / orders / failures pages still render

## 8 · Legal / safety checklist

- [ ] `/terms` live
- [ ] `/privacy` live
- [ ] `/refund` live
- [ ] `/legal` live
- [ ] Footer links to all four pages
- [ ] Standard disclaimer (not legal advice / not certification / not a
      compliance guarantee) on every public page
- [ ] `engine/src/qa.ts` forbidden-phrase scan clean

## 9 · Monitoring / alerts checklist

- [ ] Vercel function logs reachable
- [ ] Supabase logs reachable
- [ ] PayPal webhook delivery view bookmarked
- [ ] Resend dashboard bookmarked
- [ ] `ALERT_WEBHOOK_URL` set or fallback to `ADMIN_EMAIL`
- [ ] `/api/health` returns 200 with `{ ok: true, ... }`
- [ ] Optional UptimeRobot / Better Stack uptime check on `/api/health`
- [ ] Optional Sentry / Axiom planned for after launch

See `docs/46-monitoring-alerts.md`.

## 10 · Rollback plan

If a production issue is found:

1. In Vercel, click the previous successful deployment and "Promote to
   production". This is the rollback.
2. Disable instant checkout by temporarily removing `PAYPAL_CLIENT_ID` /
   `PAYPAL_CLIENT_SECRET` from the production env, redeploy. The app
   will reject `/api/paypal/create-order` cleanly.
3. If a customer is mid-flow:
   - For pending payments: leave them; PayPal will time out.
   - For paid but undelivered: deliver manually using the rescue SOP
     (`docs/45`).
4. If a Supabase migration is the cause, revert the schema change with
   a follow-up migration. Never `DROP TABLE` in production.

## 11 · Manual rescue SOP

See `docs/45-admin-rescue-sop.md`. Summary:

- Failed request → admin `/admin/requests` → reply by email or mark
  `closed`/`out-of-scope`.
- Payment confirmed but generation failed → admin `/admin/failures` or
  `/admin/orders` → resume manually, then resend download.
- Refund needed → process inside PayPal dashboard, then update order
  status manually.
- Magic link not received → admin manually issues a one-time download
  link.

## 12 · Go / no-go gates

See `docs/47-production-go-no-go.md`. The launch is GO only when all
P7 gates pass. The launch is NO-GO if any critical gate fails.

## 13 · Runbook for launch day

1. Set all production env vars in Vercel.
2. Apply Supabase migrations and create the `deliveries` bucket
   (private).
3. Run `node scripts/probe-production-supabase.mjs` against the
   production project. Expect `PROBE_RESULT: GO`.
4. Run `node scripts/qa-production-readiness.mjs` against the live URL.
5. Ship a sandbox capture end-to-end. Confirm pack delivered + email
   sent.
6. Switch PayPal env to live, set live keys + webhook.
7. Make a small live test purchase if region allows.
8. Subscribe uptime check on `/api/health`.
9. Announce launch.

## 14 · Final outputs

After Phase 7 verification, classify status as:

- A — production-ready 24/7
- B — production-code-ready, manual live checks pending
- C — not production-ready

Status is recorded in `progress.txt` and `docs/47-production-go-no-go.md`.
