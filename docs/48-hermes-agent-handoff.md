# 48 - Hermes Agent Handoff

Status: current production handoff
Audience: Hermes agent / next production operator
Last updated: 2026-05-19
Repo: `C:\Users\hydra\Desktop\complybase`
Live site: https://trustfolder.vercel.app

## 1. Read this first

Hermes should treat the **current codebase and live production behavior** as the source of truth.

Do not restart from older handoff briefs, old audit files, or stale checklist text. Some docs in `docs/39-*` through `docs/44-*` were written before later product changes and now contain outdated assumptions.

Recently corrected stale examples:

- `docs/39-production-launch-hardening.md` and `docs/41-production-env-vars.md` now reflect current checkout tiers: `tier_1`, `tier_2`, and `tier_3` automated; `tier_4` manual.
- `docs/39-production-launch-hardening.md` and `scripts/probe-production-supabase.mjs` now check the current customer auth tables: `customer_profiles`, `customer_link_tokens`, and `customer_auth_events`.

Use old docs for context only. Verify important claims against code and production.

## 2. Current verified state

Branch and commit:

- Branch: `main`
- Latest pushed commit: `214d9e8d53f19cbe145c115d3c6fd27ae1c9bfb6`
- Commit message: `Harden production delivery lifecycle`
- `main` was clean and tracking `origin/main` when this handoff was written.

Deployment:

- Latest production deployment verified: `https://trustfolder-qzwx6pwdw-harendra-s-projects-adc434e0.vercel.app`
- Vercel deployment id: `dpl_3Ty1SjeVjJBuW3e4tHf15QMQDRmT`
- Public alias manually pointed to latest deployment:
  - `https://trustfolder.vercel.app`

Live route verification on 2026-05-19:

- `/` -> `200`
- `/api/health` -> `200`, body: `{"ok":true,"checks":{"app":true,"supabase":true,"storage":true}}`
- `/pricing` -> `200`
- `/assessment` -> `200`
- `/request` -> `200`
- `/login` -> `200`

## 3. Product state Hermes inherits

TrustFolder is now positioned as a buyer-review evidence room, not generic compliance automation.

Safe product promise:

> TrustFolder creates the first structured evidence folder your buyer, lawyer, or internal operator can review. It is not legal advice, certification, or a complete regulatory filing.

Automated product ladder in current code:

- Free readiness check: no ZIP, on-screen readiness/fit result.
- `tier_1` / `$99 Lite Readiness Snapshot`: autonomous checkout + generated branded snapshot ZIP.
- `tier_2` / `$499 AI Disclosure Pack`: autonomous checkout + generated disclosure evidence folder.
- `tier_3` / `$999 Buyer-Ready AI Governance Folder`: autonomous checkout + generated governance evidence room.
- `tier_4` / `$2,500+ Premium Buyer/Legal Handoff`: manual/request-led, no automated checkout.

Claims guardrails:

- Allowed: `source-traced`, `buyer/legal handoff`, `review-ready draft`, `transparency-readiness`, `governance evidence folder`, `first draft your lawyer can start from`, `ISO/IEC 42001-aligned readiness checklist`.
- Avoid: `fully compliant`, `certified`, `guaranteed compliance`, `audit-proof`, `legally complete`, `no lawyer needed`, `GDPR Article 50`, final legal filings, final authority submissions.

## 4. What was just fixed before handoff

Commit `214d9e8` hardened the production delivery lifecycle.

Files changed:

- `app/app/api/request/route.ts`
- `app/app/api/customer/login-link/route.ts`
- `app/app/api/paypal/capture/route.ts`
- `app/app/api/paypal/webhook/route.ts`
- `app/app/checkout/return/page.tsx`

Why:

- Vercel can freeze fire-and-forget work after an HTTP response.
- Request acknowledgement emails were staying in `queued`.
- PayPal confirmation emails and generation pipeline work could have been dropped if started with `void ...` after the response.

Current behavior after patch:

- Request received email is awaited before `/api/request` returns.
- Customer magic-link email is awaited before `/api/customer/login-link` returns.
- PayPal capture endpoint awaits order confirmation and `runPipeline`.
- PayPal webhook awaits order confirmation and `runPipeline`.
- Checkout return page awaits order confirmation and `runPipeline`.
- Failed/refunded webhook notifications are awaited.

This did not redesign auth, payments, email templates, storage, or product output.

## 5. Production issues found and current status

### 5.1 PayPal webhook delivery

Status: simulator delivery is fixed; real buyer capture still needs a true paid approval/capture test.

What was found:

- Vercel production was missing `PAYPAL_WEBHOOK_ID`.
- Production `/api/paypal/webhook` returned `500` for unsigned POSTs because the engine threw on missing env.
- The configured PayPal webhook listener URL was still pointing to an old ngrok URL:
  - `https://bankbook-await-tamer.ngrok-free.dev/api/paypal/webhook`

What was fixed:

- Added `PAYPAL_WEBHOOK_ID` to Vercel production from local PayPal config.
- Redeployed production.
- Updated the PayPal webhook listener URL to:
  - `https://trustfolder.vercel.app/api/paypal/webhook`

Evidence after fix:

- Unsigned direct webhook POST now returns `401` with `webhook_verification_failed`, not `500`.
- PayPal sandbox webhook simulator returned `202`.
- Vercel production logs show `POST /api/paypal/webhook` with `responseStatusCode: 200` for the simulator delivery.

Important:

- This proves PayPal can deliver signed simulator events to production.
- It does **not** prove a real customer order was approved, captured, generated, emailed, and downloaded.
- The simulator event used a fake PayPal order id, so the handler correctly had no real customer order to complete.

Next true gate:

1. Confirm whether Vercel `PAYPAL_ENV` is intended to be `sandbox` or `production`.
2. Use a real sandbox buyer or small live payment to approve a `tier_1` checkout.
3. Verify the order moves through:
   `payment_pending -> payment_completed -> generation_started -> qa_started -> qa_passed -> package_created -> delivered`.
4. Verify a real delivery email sends after Resend is fixed.
5. Verify customer dashboard download from that real order.

### 5.2 Resend real email delivery

Status: blocked by invalid API key.

Evidence:

- `node scripts/test-email-production.mjs --to aaron.miller198@protonmail.com` returned `401`.
- Direct Resend API response: `{"statusCode":401,"name":"validation_error","message":"API key is invalid"}`.
- Live `/api/request` after lifecycle patch created email event but recorded:
  - `status=failed`
  - `error=API key is invalid`
- Request id from the live verification attempt:
  - `373057c9-76db-4654-a3a8-34bde2897e5a`
- Email event id:
  - `1cbb9f1b-e43b-4371-95fb-a470d00223c3`

Next required action:

1. Replace `RESEND_API_KEY` in Vercel Production with a valid key.
2. Replace local `engine/.env` `RESEND_API_KEY` with the same valid production or approved test key.
3. Confirm `RESEND_FROM_EMAIL` is a verified sender/domain in Resend.
4. Redeploy production if Vercel env changes require it.
5. Rerun:

```sh
node scripts/test-email-production.mjs --to aaron.miller198@protonmail.com
```

6. Submit one live `/api/request` and verify `email_events.status = sent` with `resend_message_id`.

Do not call email complete until inbox receipt or Resend delivery status is confirmed.

### 5.3 Customer dashboard download check

Status: download API path verified with a production QA delivered order.

Why QA order was needed:

- Production had no delivered customer order in the latest checked orders.
- Latest real-ish orders were `payment_pending`, had PayPal order ids, and had no capture/delivery state.

QA artifact created:

- Order id: `c534fce5-6d5a-4cfb-b5b7-b92a34fd37e7`
- Email: `dashboard-download-qa-...@trustfolder.test`
- Tier: `tier_1`
- Storage path:
  - `orders/c534fce5-6d5a-4cfb-b5b7-b92a34fd37e7/trustfolder-lite-readiness-snapshot-2026-05-18.zip`

Evidence:

- Live customer token verify returned:
  - `307 -> https://trustfolder.vercel.app/dashboard`
  - `tf_customer` cookie issued
- Live `POST /api/customer/download-link` returned:
  - `200`
  - keys: `url`, `expires_at`, `file_name`
  - file name: `trustfolder-lite-readiness-snapshot-2026-05-18.zip`
- Signed URL fetched:
  - `status=200`
  - `bytes=6018`
  - ZIP magic bytes: `504b0304`

This verifies:

- customer magic-token verification
- dashboard session cookie issuance
- customer ownership check in `/api/customer/download-link`
- private Supabase storage signed URL creation
- actual ZIP download from signed URL

Still not verified:

- A real paid customer order creating that delivered state from PayPal capture automatically.

## 6. Key files Hermes must know

Payment and checkout:

- `app/app/api/paypal/create-order/route.ts`
- `app/app/api/paypal/capture/route.ts`
- `app/app/api/paypal/webhook/route.ts`
- `app/app/checkout/return/page.tsx`
- `app/app/success/[orderId]/page.tsx`
- `engine/src/paypal.ts`
- `engine/src/order-status.ts`

Generation and package delivery:

- `engine/src/pipeline.ts`
- `engine/src/snapshot.ts`
- `engine/src/package.ts`
- `engine/src/evidence-room.ts`
- `engine/src/generate.ts`
- `engine/src/qa.ts`
- `engine/src/deliver.ts`
- `engine/src/lib/resend.ts`
- `engine/src/lib/env.ts`

Customer dashboard and downloads:

- `app/lib/customer-auth.ts`
- `app/lib/customer-data.ts`
- `app/app/api/customer/login-link/route.ts`
- `app/app/api/customer/verify/route.ts`
- `app/app/api/customer/download-link/route.ts`
- `app/app/dashboard/downloads/page.tsx`
- `app/app/dashboard/downloads/DownloadButton.tsx`
- `app/app/dashboard/packs/page.tsx`
- `app/app/dashboard/orders/page.tsx`

Admin preview and package output:

- `app/lib/admin-package-previews.ts`
- `app/app/admin/(protected)/package-previews/page.tsx`
- `app/app/api/admin/package-previews/[pack]/route.ts`
- `app/app/api/admin/orders/[id]/reissue-download/route.ts`

Database and storage:

- `engine/supabase/migrations/0001_initial_schema.sql`
- `engine/supabase/migrations/0002_add_requests.sql`
- `engine/supabase/migrations/0003_requests_admin_extensions.sql`
- `engine/supabase/migrations/0004_customer_auth.sql`

Production docs/runbooks:

- `docs/39-production-launch-hardening.md`
- `docs/40-vercel-deployment-guide.md`
- `docs/41-production-env-vars.md`
- `docs/42-supabase-production-check.md`
- `docs/43-paypal-production-check.md`
- `docs/44-resend-email-production-check.md`
- `docs/45-admin-rescue-sop.md`
- This file: `docs/48-hermes-agent-handoff.md`

Scripts:

- `scripts/check-env.ps1`
- `scripts/check-paypal-env.ps1`
- `scripts/probe-production-supabase.mjs`
- `scripts/test-email-production.mjs`
- `scripts/qa-copy-guardrails.mjs`
- `scripts/qa-production-readiness.mjs`
- `scripts/qa-live-delivery-gates.mjs`
- `scripts/qa-production-e2e-dry-run.mjs`
- `scripts/qa-flow-test.mjs`
- `scripts/smoke-request-package-interest.mjs`
- `scripts/qa-scale-audit.mjs`

## 7. Environment variables Hermes must verify

Never print secret values. Only check presence or use masked output.

Vercel Production must have:

- `APP_BASE_URL=https://trustfolder.vercel.app`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_STORAGE_BUCKET=deliveries`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `AI_PROVIDER`
- `ANTHROPIC_API_KEY` if using Anthropic
- `PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`
- `NEXT_PUBLIC_PAYPAL_CLIENT_ID`
- `PAYPAL_WEBHOOK_ID`
- `PAYPAL_ENV`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `SUPPORT_EMAIL`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`
- `CUSTOMER_SESSION_SECRET`
- `NODE_ENV=production`

Current known env issue:

- `RESEND_API_KEY` is invalid and must be replaced.

Current PayPal caveat:

- Local `engine/.env` had sandbox PayPal settings during the simulator check.
- Confirm whether production should remain sandbox for testing or switch to live before accepting real customers.

## 8. Commands Hermes should run

Local verification:

```sh
cd app
npm run build
npm run typecheck
```

```sh
cd engine
npm run typecheck
npm run build
npm test
```

Repo-level checks:

```sh
node scripts/qa-copy-guardrails.mjs
node scripts/probe-production-supabase.mjs
node scripts/test-email-production.mjs --to aaron.miller198@protonmail.com
node scripts/qa-live-delivery-gates.mjs
```

Production deployment:

```sh
git status --short --branch
git add <intended files>
git commit -m "<clear message>"
git push origin main
vercel deploy --prod
vercel alias set <deployment-url> trustfolder.vercel.app
```

Live smoke:

```sh
node --input-type=module - <<'EOF'
const routes = ['/', '/api/health', '/pricing', '/assessment', '/request', '/login'];
for (const r of routes) {
  const res = await fetch('https://trustfolder.vercel.app' + r);
  const text = await res.text();
  console.log(`${r} ${res.status} ${r === '/api/health' ? text : ''}`);
}
EOF
```

Webhook sanity:

```sh
node --input-type=module - <<'EOF'
const res = await fetch('https://trustfolder.vercel.app/api/paypal/webhook', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: '{}',
});
console.log(res.status, await res.text());
EOF
```

Expected unsigned webhook result:

- `401`
- `webhook_verification_failed`

If it returns `500`, check Vercel env/logs first.

## 9. Exact next actions for Hermes

Priority 0 - fix email:

1. Replace invalid `RESEND_API_KEY` in Vercel Production.
2. Replace local `engine/.env` key if Hermes will run local email probes.
3. Confirm `RESEND_FROM_EMAIL` is verified in Resend.
4. Redeploy production.
5. Rerun `scripts/test-email-production.mjs`.
6. Submit a live `/api/request` and confirm `email_events.status = sent`.

Priority 1 - complete true PayPal-to-delivery run:

1. Confirm `PAYPAL_ENV`.
2. Use sandbox buyer or small live payment.
3. Start from `/assessment`.
4. Choose `$99 Lite Readiness Snapshot` to minimize cost/risk.
5. Approve payment in PayPal.
6. Confirm order captures.
7. Confirm webhook or checkout return transitions the order.
8. Confirm pipeline creates ZIP.
9. Confirm delivery email sends after Resend is fixed.
10. Confirm customer dashboard download link works for that real paid order.

Priority 2 - clean up test residue:

The QA delivered order is clearly marked and uses `@trustfolder.test`. It can remain for audit evidence, or Hermes can clean it after creating a real paid test order.

If cleaning, remove only rows/objects tied to:

- `c534fce5-6d5a-4cfb-b5b7-b92a34fd37e7`
- `dashboard-download-qa-...@trustfolder.test`
- storage prefix `orders/c534fce5-6d5a-4cfb-b5b7-b92a34fd37e7`

Do not bulk-delete production records.

## 10. Do not touch unless explicitly asked

Do not refactor or rewrite:

- Supabase schema beyond additive/fix migrations.
- PayPal pricing semantics except to correct env/live mode.
- Auth model.
- Admin dashboard architecture.
- Customer dashboard architecture.
- Email templates beyond necessary deliverability fixes.
- Output package content unless the user asks for another product-output upgrade.

## 11. Completion definition

Hermes can call the production gate complete only when all are true:

- `/api/health` returns `200` and `ok=true`.
- Resend test email sends with a real `resend_message_id`.
- Live request acknowledgement email is `sent`.
- Customer magic-link email is `sent`.
- A real PayPal-approved order reaches `delivered`.
- The delivered order has a ZIP in private Supabase storage.
- Customer dashboard can issue and fetch a fresh signed download link.
- No route or API regression on public pages.
- No banned claims introduced.

Until then, current status is:

> Production is deployed and mostly wired. PayPal webhook delivery to production is reachable. Customer dashboard download path is verified. Real email delivery is blocked by invalid Resend credentials, and a real approved PayPal capture-to-delivery run remains the final proof.
