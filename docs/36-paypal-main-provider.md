# 36 — PayPal Main Provider

Status: Batch 2 — **code-complete and partially verified. Full sandbox buyer approval/capture skipped by user decision.**

PayPal is the selected main payment provider. Supported checkout tiers are tier_2 and tier_3. Tier_1, Enterprise, and Agency remain request/manual only. Create-order and routing are verified. Full sandbox buyer approval/capture was skipped, so live payment launch still requires one manual sandbox approval/capture test before accepting real payments.

PayPal is the primary payment provider for TrustFolder Batch 2. Manual PayPal invoice or payment link remains the fallback for tiers that are not safe for instant checkout yet.

No Paddle, Stripe, Lemon Squeezy, subscriptions, connectors, or new payment provider work is part of Batch 2.

---

## Provider decision

- Primary provider: PayPal.
- Currency: USD for international buyers.
- Fallback: manual PayPal invoice or payment link.
- Subscriptions: hidden until Batch 3.
- Unsupported tiers stay request-only.

If a PayPal sandbox buyer fails because of currency or sandbox-account limitations, test with a compatible PayPal sandbox buyer account. Do not switch providers because one sandbox buyer account fails.

---

## Tier rules

| Tier | Price | Batch 2 payment rule | CTA |
|---|---:|---|---|
| AI Website Trust Snapshot | $99 | Request-only. No PayPal checkout until snapshot generation exists. | Request snapshot |
| AI Disclosure Pack | $499 | PayPal checkout enabled after free fit check. | Start secure checkout |
| Buyer-Ready AI Governance Folder | $999 | PayPal checkout enabled after free fit check. | Start secure checkout |
| Enterprise Buyer Handoff | $2,500+ | Application/manual invoice only. | Apply |
| Agency Pack | Custom | Request/manual invoice only. | Request agency pack |

---

## Required flow

1. User completes the free fit check.
2. User chooses a supported paid pack.
3. `/api/paypal/create-order` creates an internal order and PayPal order.
4. User approves payment on PayPal.
5. `/checkout/return` captures as a fallback path.
6. `/api/paypal/webhook` remains the canonical payment confirmation path.
7. Internal order moves from `payment_pending` to `payment_completed` only after confirmed capture.
8. Generation starts only when the payment transition is acquired.
9. Dashboard shows order and payment status.
10. Generated pack appears in `/dashboard/packs` when available.
11. Secure download appears in `/dashboard/downloads` when delivered.

---

## Safety rules

- Do not generate before confirmed payment.
- Do not route snapshot, enterprise, or agency tiers through instant checkout.
- Do not start subscriptions in Batch 2.
- Do not create duplicate generation runs from webhook replay, return-page retry, or manual capture retry.
- Treat webhook/capture replay as no-op once the order has moved past `payment_pending`.
- Failed, denied, refunded, or reversed payments must not leave users stuck in an endless pending state.
- Founder alerts must fire for payment failures, reversals, refunds, and generation failures.

---

## Current implementation notes

- Supported checkout tiers are gated in `app/app/api/paypal/create-order/route.ts` as `tier_2` and `tier_3` only.
- `tier_1` returns `tier_1_checkout_disabled` and remains request-only.
- `engine/src/order-status.ts` uses optimistic concurrency when `expected_from` is supplied, preventing two callers from acquiring the same transition.
- `engine/src/pipeline.ts` no-ops if a non-retry call reaches an order that is already preparing, packaged, delivered, failed, or refunded.
- `/checkout/return`, `/api/paypal/capture`, and `/api/paypal/webhook` only send confirmation and call `runPipeline` when they acquire `payment_pending → payment_completed`.
- Webhook capture lookup accepts either the internal UUID or the PayPal order id.

---

## Customer-facing copy

Use:

- Secure PayPal checkout
- Payment confirmed
- Preparing your evidence folder
- Your pack is being prepared
- Your pack is ready

Do not use broad legal outcome promises, certification claims, or language implying TrustFolder replaces legal review.

---

## Verification checklist

Non-manual checks run this batch (all PASS):

- `scripts/check-paypal-env.ps1` → `PAYPAL_ENV_RESULT = GO`
- `node scripts/smoke-bb2b3-prepare.mjs` → tier_2 create-order PASS, tier_3 create-order PASS, tier_1 expected-pending
- `node scripts/qa-flow-test.mjs` → 15/15
- `node scripts/qa-admin-flow.mjs` → 8/8
- `node scripts/qa-customer-flow.mjs` → 16/16
- `cd app && npx tsc --noEmit` → clean
- `cd app && npm run build` → build passes
- Forbidden phrase grep across `app/app`, `app/lib`, `engine/src`, Batch 2 docs → 0 hits
- Unsupported-tier guard → `tier_1` returns `400 tier_1_checkout_disabled`, other tiers return `400 unsupported_tier` (code inspection at `app/app/api/paypal/create-order/route.ts`).
- Capture/webhook idempotency logic present by code inspection (`app/app/api/paypal/capture/route.ts`, `app/app/api/paypal/webhook/route.ts`, `engine/src/order-status.ts`, `engine/src/pipeline.ts`).
- Refund/reversal handling present by code inspection (`app/app/api/paypal/webhook/route.ts` — `PAYMENT.CAPTURE.REFUNDED` and `PAYMENT.CAPTURE.REVERSED` branches, plus dashboard status copy in `app/app/dashboard/orders/page.tsx`).
- Dashboard status copy present by code inspection (`engine/src/order-status.ts`, `app/app/dashboard/primitives.tsx`, `app/app/success/[orderId]/page.tsx`, `app/app/checkout/cancel/page.tsx`).

Sandbox checks **deliberately skipped this batch**:

- Sandbox buyer approval and capture round-trip.
- Webhook replay/idempotency against a live capture event.
- Failed/denied capture in sandbox.
- Refund/reversal event replay.
- Dashboard status after a real confirmed payment.

These are gated on one manual PayPal sandbox approval/capture test and are required before accepting real payments. No additional code changes should be needed — this is a live-run verification only.

---

## Acceptance criteria

1. PayPal is documented as the main provider. — met.
2. Supported tiers can create PayPal orders. — met (tier_2/tier_3 create-order PASS).
3. Payment capture updates the internal order. — code-complete, not live-verified this batch.
4. Webhook handling is idempotent. — code-complete and inspected, not live-replayed this batch.
5. Dashboard reflects payment and order status. — code-complete and inspected, not live-verified end-to-end this batch.
6. Failed/refunded cases do not leave users stuck. — code-complete and inspected, not live-replayed this batch.
7. Unsupported tiers stay request-only. — met (guard at route level).
8. Typecheck passes. — met.
9. Build passes. — met.
10. Existing v1 request/admin/customer flows remain green. — met (15/15, 8/8, 16/16).

Overall: **code-complete and partially verified.** One manual sandbox approval/capture test remains required before accepting real payments.
