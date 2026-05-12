# 43 — PayPal Production Check

Status: Phase 7 reference  
Pairs with: `app/app/api/paypal/create-order/route.ts`,
`app/app/api/paypal/capture/route.ts`,
`app/app/api/paypal/webhook/route.ts`,
`scripts/check-paypal-env.ps1`  
Last updated: 2026-05-11

PayPal is the main and only payment provider for TrustFolder. Do not
add a second provider in this phase.

## 1 · Live app setup

1. PayPal Developer dashboard → **My Apps & Credentials** → **Live**.
2. Create a new app (or open the existing one).
3. Capture:
   - `Client ID` → `PAYPAL_CLIENT_ID` (and `NEXT_PUBLIC_PAYPAL_CLIENT_ID`)
   - `Secret` → `PAYPAL_CLIENT_SECRET`
4. Set `PAYPAL_ENV=production` in the production env.

## 2 · Live webhook

1. In the PayPal app settings, add a webhook with URL
   `https://yourdomain.com/api/paypal/webhook`.
2. Subscribe to:
   - `CHECKOUT.ORDER.APPROVED`
   - `PAYMENT.CAPTURE.COMPLETED`
   - `PAYMENT.CAPTURE.DENIED`
   - `PAYMENT.CAPTURE.REFUNDED`
   - `PAYMENT.CAPTURE.REVERSED`
3. Capture the webhook ID → `PAYPAL_WEBHOOK_ID`.

## 3 · Sandbox dry-run

Before flipping to live:

1. Configure sandbox env (`PAYPAL_ENV=sandbox`, sandbox keys, sandbox
   webhook).
2. Run a complete `tier_2` checkout in sandbox:
   - free check → fit confirmed → create-order → approve → capture
     → generation → delivery → dashboard download
3. Run the same for `tier_3`.

The dry-run is mandatory. NO-GO if it has not been completed.

## 4 · Live small-amount test

If your region/currency supports a low-value live transaction (e.g. $1
on a test SKU temporarily set up under tier_2), run it through end-to-end
once you switch to live keys, then refund it.

If the region does not support this (e.g. INR home currency with a $499
billing currency), skip and note "manual sandbox-only verification" in
`progress.txt` and `docs/47-production-go-no-go.md`.

## 5 · Tier rules (already enforced in code)

`app/app/api/paypal/create-order/route.ts` enforces:

- `tier_1` → returns `tier_1_checkout_disabled`. Snapshot stays
  request-only.
- Any tier other than `tier_2` / `tier_3` → returns `unsupported_tier`.
- `tier_2` and `tier_3` create the PayPal order and return an approve
  URL.

The new compliance-readiness modules (Phase 6) do not have a tier and
do not hit `/api/paypal/create-order`. They route to `/request`.

## 6 · Webhook idempotency

The webhook handler must:

- Detect duplicate event IDs and skip them.
- Update `orders` and `order_status_events` atomically.
- Never double-trigger generation for the same payment capture.

If duplicate events are observed in the webhook delivery view, do not
manually retrigger generation; check `order_status_events` first.

## 7 · Failed and refunded states

- `PAYMENT.CAPTURE.DENIED` → mark order failed, surface "Contact
  support" in the dashboard, founder alert.
- `PAYMENT.CAPTURE.REFUNDED` / `REVERSED` → mark order refunded, do
  not deliver further. If a pack was already delivered, document and
  decide manually whether to revoke the download link.

## 8 · Manual invoice fallback

If a customer cannot complete PayPal checkout:

1. Issue a manual PayPal invoice from the dashboard.
2. On payment, manually create or progress the order via the admin
   dashboard / SQL.
3. Trigger generation via the existing engine path.
4. Email the download link from `/dashboard/downloads` once the pack
   is delivered.

This is a documented fallback only; it is not the default flow.

## 9 · Currency / region note

If TrustFolder operates from India (or any region where USD billing
needs explicit configuration), confirm that the live PayPal account is
allowed to accept the chosen currency. Mismatches show up only at
capture time and are painful in production.

## 10 · How to verify env

Run:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/check-paypal-env.ps1
```

For sandbox the script expects `PAYPAL_ENV=sandbox`. For production
verification, change `PAYPAL_ENV=production` in the production env and
re-run after deploying.

## 11 · Hard rules

- `PAYPAL_CLIENT_SECRET` is server-only.
- `NEXT_PUBLIC_PAYPAL_CLIENT_ID` is the only client-side value.
- The webhook must verify signatures.
- Do not enable any tier that is not implemented end-to-end.
