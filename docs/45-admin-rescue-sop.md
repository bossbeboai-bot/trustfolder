# 45 — Admin Rescue SOP

Status: Phase 7 operations runbook  
Audience: founder / admin operator  
Last updated: 2026-05-11

This SOP exists so a single operator can recover any stuck flow without
guessing. It covers the existing system; do not invent missing
features. Where a feature does not exist yet, the SOP says so and
points at the manual step plus the future-improvement marker.

## 1 · Where to look

- Failed requests: `/admin/requests` (filter `status` if needed).
- Failed orders: `/admin/orders` and `/admin/failures`.
- Failed generation / QA: `/admin/failures` (and Vercel function logs
  for the `paypal/webhook`, `confirm`, and engine entry points).
- Out-of-scope leads: `/admin/out-of-scope`.

## 2 · Identify payment state

Order `payment_status` (or equivalent) values to reason about:

- `pending` — order created, customer has not approved on PayPal.
- `approved` — buyer approved on PayPal, capture not yet recorded.
- `paid` / `captured` — payment captured, generation should run.
- `failed` / `denied` — payment denied; customer needs another try.
- `refunded` / `reversed` — money returned; do not deliver.

If you see `approved` for too long (e.g. > 30 minutes), check the
PayPal dashboard webhook delivery view; replay the webhook event if
needed.

## 3 · Manual rescue actions

### 3.1 Resend a magic link for the customer dashboard

1. Open `/admin/requests`, find the email.
2. Confirm the customer is the right person.
3. Use the customer login API on their behalf only if absolutely
   needed; otherwise instruct the customer to request a new link from
   `/login`.

### 3.2 Manually create a download link

If a pack is delivered but the customer cannot reach the dashboard:

1. Find the `generated_packs` row in Supabase (joined to the order).
2. Copy the storage path.
3. Use the Supabase dashboard "Generate signed URL" feature on the
   `deliveries` bucket. Default TTL: 1 hour for an unattended share,
   24 hours if you need to email it.
4. Send the link with a one-line note that it expires.

Future improvement: surface this in `/admin` directly (P1).

### 3.3 Refund a payment

1. Refund inside the PayPal dashboard.
2. The webhook will mark the order refunded if it fires; if not,
   manually flip the order status via SQL or the admin route.
3. If a download has already been served, decide case-by-case whether
   to leave the pack accessible or revoke it (Supabase storage
   delete).

### 3.4 Mark request status

In `/admin/requests/[id]`:

- `new` → fresh inbound.
- `contacted` → you replied.
- `qualified` → fits scope; keep as paid pack candidate.
- `closed` → wrap up; reason in `internal_note`.
- `out-of-scope` → routed to expert review.

Use `internal_note` to record decisions and follow-up dates.

### 3.5 Out-of-scope leads

If a request points at HIPAA / medical / hiring / finance / children /
biometrics / law-enforcement / critical-infrastructure (per Phase 6
expert-review-only modules):

1. Mark the request `out-of-scope`.
2. Reply with the standard expert-review email (no compliance
   conclusion, no implication that TrustFolder will handle it).
3. If the customer asks, point at `/safety`.

### 3.6 Escalate expert-review-only modules

For Phase 6 intake-only modules:

1. Capture intake.
2. Hand off to the qualified reviewer (security / privacy / clinical /
   legal). Track the handoff via email + `internal_note`.
3. Do not produce final compliance conclusions inside TrustFolder.

## 4 · Common scenarios

| Symptom | Likely cause | Action |
|---|---|---|
| Customer paid, no pack | Webhook missed | Replay webhook in PayPal; verify generation logs |
| Customer paid, generation failed | Engine error | `/admin/failures`, retrigger via SQL; future P1 retry button |
| Customer can't login | Magic link email missing | Check Resend; resend manually |
| Customer reports wrong details in pack | Intake data wrong | Update `assessments` / `requests`, re-run generation |
| Refund issued but pack still accessible | Storage TTL not yet expired | Optionally revoke; otherwise leave |

## 5 · Hard rules

- Never email a download link that does not require auth.
- Never share Supabase service role credentials.
- Never produce a final compliance conclusion for a Phase 6 high-risk
  module.
- Always record the action in `internal_note`.

## 6 · Future improvements

- P1: One-click retry for failed generation in `/admin/failures`.
- P1: Reissue download link button in `/admin/orders/[id]`.
- P2: Customer-facing "resend my pack" button.
