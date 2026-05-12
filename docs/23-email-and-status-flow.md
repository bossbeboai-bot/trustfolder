# 23 — Email and Status Flow

Status: planning artifact. No code changes flow from this document.
Owns: status state machine, customer-facing emails, admin notifications, retry/manual rescue.
Companion: `docs/20-product-ux-blueprint.md` §9 for the cross-cutting summary; `docs/21-dashboard-information-architecture.md` for the surfaces that reflect these states.

Hard rule: every state transition that touches a customer (charge, generation, delivery, refusal) must produce either a visible UI message OR an email. No silent transitions.

Convention tags:
- **[current]** — already implemented (table or route exists in code).
- **[target]** — planned, must be added before launch.

---

## 0 — Reading guide

- §1 lists every status state with its scope (lead / assessment / order / request).
- §2 maps each state to: what triggers it, what UI surface confirms it, what email goes out, and whether admin action is required.
- §3 specs every email template: subject, preview text, body skeleton, sender, footer.
- §4 specs the request flow (`/api/request` and `requests` table).
- §5 specs the retry / manual delivery model.
- §6 specs idempotency, deduplication, and PII rules.
- §7 specs the smoothness contract (what the user always knows).
- §8 lists pending work and dependencies.

---

## 1 — Status state catalogue

States are scoped to a record. A single customer journey usually touches several scopes (lead → assessment → request OR order → delivery).

| Scope | State | Tag | Where stored |
|---|---|---|---|
| lead | `lead_created` | [current] | `leads.status` (created on first scan) |
| assessment | `assessment_started` | [current] | `assessments.status` |
| assessment | `assessment_completed` | [current] | `assessments.status` |
| assessment | `out_of_scope` | [current] | `assessments.band = OUT_OF_SCOPE` |
| assessment | `soft_out_review` | [current] | `assessments.next_step = soft_out_review` |
| request | `request_submitted` | [current] | `requests.status` (table added by `engine/supabase/migrations/0002_add_requests.sql`) |
| request | `request_acknowledged` | [target] | `requests.status` |
| request | `request_converted_to_order` | [target] | `requests.status` |
| order | `payment_pending` | [current] | `orders.status` after `/api/paypal/create-order` |
| order | `payment_completed` | [current] | `orders.payment_status = COMPLETED` via webhook or capture |
| order | `payment_failed` | [current] | `orders.payment_status = DENIED` / `REVERSED` / `REFUNDED` |
| order | `generation_started` | [current] | `order_status_events` (transitioned in `engine/src/pipeline.ts`) |
| order | `generation_completed` | [target — implicit] | Pipeline goes `generation_started` → `qa_started` → `qa_passed` → `package_created` → `delivered`; no literal `generation_completed` state. |
| order | `qa_passed` | [current] | `qa_results.verdict = pass` + `orders.status = qa_passed` |
| order | `qa_failed` | [target — implicit] | QA failure routes through `markFailed` → `failed_needs_retry`; no literal `qa_failed` state. |
| order | `package_delivered` | [current] | `orders.status = delivered` + `pack_delivery` email via `engine/src/deliver.ts:deliverPack` |
| order | `failed_needs_retry` | [current] | `engine/src/order-status.ts:markFailed`. The dedicated `failed_jobs` table for richer retry orchestration is still [target]. |

`assessment_started` is a transient state: created when `/api/scan` succeeds, replaced by `assessment_completed` once `/api/confirm` runs. It exists so the founder dashboard can show abandoned assessments.

---

## 2 — Per-state spec

For each: trigger, customer UI, customer email, internal effect, admin action.

### 2.1 `lead_created` [current]

- **Trigger**: first row written to `leads` (typically by `/api/scan`).
- **Customer UI**: implicit (the user is on `/assessment` — no separate confirmation needed).
- **Customer email**: none.
- **Internal effect**: row in `leads`.
- **Admin action**: none.

### 2.2 `assessment_started` [current]

- **Trigger**: `/api/scan` returns `200` with a new `assessment_id`.
- **Customer UI**: scan results screen on `/assessment`.
- **Customer email**: none.
- **Internal effect**: rows in `website_scans`, `assessments` (status `started`).
- **Admin action**: none.

### 2.3 `assessment_completed` [current]

- **Trigger**: `/api/confirm` succeeds with `in_scope = true`, sets `band` and `next_step`.
- **Customer UI**: review-before-payment screen (doc 20 §4).
- **Customer email**: optional plain-text "Eligibility result for {company_name}" (Tier-0 only). Sent only when the user opts in to "email me my result", not by default.
- **Internal effect**: assessment row updated.
- **Admin action**: none.

### 2.4 `out_of_scope` [current]

- **Trigger**: `/api/confirm` returns `band = OUT_OF_SCOPE`.
- **Customer UI**: redirect to `/out-of-scope` with an explanation block + a `/contact?topic=expert-review` CTA.
- **Customer email**: short "We can't safely auto-generate for {company_name}" — explains why, points to expert-review handoff. Sent only on opt-in.
- **Internal effect**: assessment row flagged; `out_of_scope_reason` JSON populated.
- **Admin action**: weekly review of out-of-scope cases for scope-policy iteration.

### 2.5 `soft_out_review` [current]

- **Trigger**: `/api/confirm` returns `next_step = soft_out_review`.
- **Customer UI**: review screen with "we need to look at this manually" block; primary CTA = "Apply for premium handoff" → `/request?type=premium`.
- **Customer email**: none unless user submits the request form, in which case `request_submitted` fires.
- **Internal effect**: assessment row flagged.
- **Admin action**: founder reviews within 1 business day.

### 2.6 `request_submitted` [current]

- **Trigger**: `POST /api/request` writes to `requests` with status `submitted`.
- **Customer UI**: success state on `/request` (doc 20 §2.3) with the captured details.
- **Customer email**: "We received your request — {pack_name} for {company}". Sets expectation: founder reply within 1 business day.
- **Internal effect**: row in `requests`; founder gets a dashboard alert.
- **Admin action**: reply with proposed next steps (call / payment link / scope question).

### 2.7 `request_acknowledged` [target]

- **Trigger**: founder marks the request as acknowledged in admin Leads / Requests tab.
- **Customer UI**: dashboard / inbox (post-launch).
- **Customer email**: optional, only when the founder needs to ask a follow-up question.
- **Internal effect**: `requests.status = acknowledged`, `acknowledged_at` set.
- **Admin action**: send custom reply.

### 2.8 `request_converted_to_order` [target]

- **Trigger**: founder issues a checkout link or the user proceeds via instant checkout. Creates an `orders` row and links `requests.order_id`.
- **Customer UI**: PayPal approve flow.
- **Customer email**: none here; `payment_pending` and `payment_completed` carry the customer-visible messages.
- **Internal effect**: `requests.status = converted`, `orders` row created.
- **Admin action**: none beyond initiating the link.

### 2.9 `payment_pending` [current]

- **Trigger**: `/api/paypal/create-order` writes a row in `orders` with `payment_status = PENDING`.
- **Customer UI**: PayPal-hosted approval; on return, `/checkout/return` polls `/api/status/[orderId]`.
- **Customer email**: none (the user is mid-flow).
- **Internal effect**: order row created; `order_status_events` first entry.
- **Admin action**: none unless the order stays pending > 24h.

### 2.10 `payment_completed` [current]

- **Trigger**: PayPal webhook `PAYMENT.CAPTURE.COMPLETED` or `/api/paypal/capture` succeeds.
- **Customer UI**: `/success/[orderId]` polls `/api/status/[orderId]` and shows "Payment received — generating pack".
- **Customer email**: "Payment received for {tier_name}. Generating your pack." Includes order id, amount paid, expected delivery window per tier (Snapshot ≤ 1 business hour, Disclosure Pack ≤ 24h, Governance Folder ≤ 24h, Enterprise ≤ 48h plus call).
- **Internal effect**: `orders.payment_status = COMPLETED`; pipeline triggered async.
- **Admin action**: none.

### 2.11 `payment_failed` [current]

- **Trigger**: webhook `PAYMENT.CAPTURE.DENIED` / `REVERSED` / `REFUNDED` or capture endpoint failure.
- **Customer UI**: `/checkout/cancel` or a payment-failed branch on `/success/[orderId]`.
- **Customer email**: "Payment didn't go through for {tier_name}. No pack will be generated. Try again or talk to us." Refund-issued variant if `REFUNDED`.
- **Internal effect**: order row updated; `order_status_events` records the reason; admin alerted if `REFUNDED` was customer-initiated.
- **Admin action**: review refund cases, reach out where helpful.

### 2.12 `generation_started` [current]

- **Trigger**: pipeline picks up the order after `payment_completed`.
- **Customer UI**: `/success/[orderId]` updates to "Generating your pack — this usually takes a few minutes".
- **Customer email**: none.
- **Internal effect**: `order_status_events` records start time.
- **Admin action**: none unless step stalls > expected window per tier.

### 2.13 `generation_completed` [target]

- **Trigger**: pipeline finishes assembling the pack and writes `generated_packs`.
- **Customer UI**: `/success/[orderId]` updates to "Running quality checks".
- **Customer email**: none.
- **Internal effect**: `generated_packs` row created with manifest.
- **Admin action**: none.

### 2.14 `qa_passed` [current]

- **Trigger**: QA gate (doc 22 §11) verdict = pass.
- **Customer UI**: `/success/[orderId]` updates to "Almost ready — emailing you the link".
- **Customer email**: none yet (deferred to `package_delivered`).
- **Internal effect**: `qa_results.verdict = pass`.
- **Admin action**: none.

### 2.15 `qa_failed` [target]

- **Trigger**: QA gate verdict = fail.
- **Customer UI**: `/success/[orderId]` updates to "Manual review in progress — we'll email you within 24h".
- **Customer email**: none directly; founder may send a follow-up if the delay extends.
- **Internal effect**: `qa_results.verdict = fail`, `failed_jobs` row created with stage `qa`, founder alerted.
- **Admin action**: review, retry generation, or replace with manual upload.

### 2.16 `package_delivered` [current]

- **Trigger**: pack uploaded to deliveries bucket and signed URL minted.
- **Customer UI**: `/success/[orderId]` shows "Your pack is ready — check your email" plus a download button.
- **Customer email**: "Your TrustFolder {tier_name} is ready" — body explains what's inside, links to download (signed URL TTL 7 days), references next-step roadmap, includes universal disclaimer footer.
- **Internal effect**: `orders.delivery_status = delivered`, `email_events` row created.
- **Admin action**: none.

### 2.17 `failed_needs_retry` [current — state] / [target — `failed_jobs` orchestration table]

- **Trigger**: pipeline error at any stage (scan / extract / generate / deliver / email) OR `qa_failed`.
- **Customer UI**: `/success/[orderId]` shows "We hit an issue — we'll email you within 24h. No further action needed from you."
- **Customer email**: none until founder either retries successfully or sends a manual update.
- **Internal effect**: `failed_jobs` row created with stage + error payload; founder alert.
- **Admin action**: open the Failed Jobs tab, click retry or manual delivery, or refund.

---

## 3 — Email templates

All emails use the same wrapper:
- **From**: `TrustFolder <hello@trustfolder.com>` (placeholder until live).
- **Reply-to**: `hello@trustfolder.com`.
- **Footer block**:
  ```
  TrustFolder · AI governance evidence folders for B2B AI companies.
  AI-generated drafts for review. Not legal advice. Not certification. Not a compliance guarantee.
  Order id: {order_id} · Sent: {timestamp}
  ```
- **Signed-URL TTL**: 7 days. Re-issuance is one click in `/success/[orderId]` (signed-in customer) or via the customer dashboard once shipped.

### 3.1 `eligibility_result_optin` (Tier 0)

- Subject: `Eligibility result for {company_name}`.
- Preview: `Your free TrustFolder result.`
- Body skeleton:
  - Greeting with `{company_name}`.
  - Verdict line (in_scope / soft_out_review / out_of_scope) and recommended tier.
  - Top 3 likely disclosure areas with one-line explanation each.
  - Top 3 risk flags if any.
  - CTA: "See your result on TrustFolder" → `/assessment?id=…` (resumes the review screen).
  - Disclaimer footer.

### 3.2 `out_of_scope_optin` (Tier 0)

- Subject: `We can't safely auto-generate for {company_name}`.
- Preview: `Why TrustFolder declined and what to do next.`
- Body skeleton:
  - Apology paragraph (calm tone).
  - Reason in plain language tied to vertical / risk flag.
  - Expert-review handoff path with link to `/contact?topic=expert-review`.
  - Disclaimer footer.

### 3.3 `request_received`

- Subject: `We received your request — {pack_name}`.
- Preview: `We'll reply within 1 business day.`
- Body skeleton:
  - "Thanks for the request" line.
  - Captured details (pack, email, website, notes).
  - SLA: founder reply within 1 business day.
  - Refund / scope-change reminder.
  - Disclaimer footer.

### 3.4 `payment_received`

- Subject: `Payment received — generating your {tier_name}`.
- Preview: `We're preparing your pack now.`
- Body skeleton:
  - Confirmation of charge: `{amount_charged}`.
  - Tier name + what's inside (bullets).
  - Expected delivery window (per tier).
  - Order id + reply-to for any question.
  - Disclaimer footer.

### 3.5 `payment_failed`

- Subject: `Payment didn't go through`.
- Preview: `No pack will be generated. Try again or talk to us.`
- Body skeleton:
  - "No charge stands" reassurance.
  - Reason where available (denied / reversed / refunded).
  - Try again CTA → `/checkout/return?retry={order_id}` once retry path is wired.
  - Disclaimer footer.

### 3.6 `pack_ready`

- Subject: `Your TrustFolder {tier_name} is ready`.
- Preview: `Download link inside, valid for 7 days.`
- Body skeleton:
  - Greeting.
  - "What you got" — quick file list grouped by folder.
  - Download CTA (signed URL).
  - Pointer to `next-steps-roadmap.md` and the 30-day plan.
  - Reissue note: "Need a fresh link? Reply to this email or use your dashboard once it's available."
  - Disclaimer footer.

### 3.7 `pack_ready_enterprise`

- Same as `pack_ready`, plus:
  - Loom walkthrough link.
  - Scheduled call slot (if booked).
  - One-revision policy reminder.

### 3.8 `manual_followup`

- Subject: customised by founder.
- Preview: customised.
- Body skeleton: free-form; must include the universal footer.

### 3.9 `pack_link_reissued`

- Subject: `Fresh download link for your TrustFolder {tier_name}`.
- Preview: `Your previous link expired or was lost.`
- Body skeleton:
  - New signed URL.
  - Reminder of TTL (7 days).
  - Disclaimer footer.

---

## 4 — Request flow (`/api/request` and `requests` table) [current]

### 4.1 Endpoint contract

`POST /api/request`

Request body:
```
{
  "pack_interest": "snapshot|pack|governance|agency|premium",
  "email": "string",
  "website": "string",
  "notes": "string",
  "assessment_id": "uuid|null",
  "lead_id": "uuid|null",
  "referral_source": "string|null",
  "intent": "buy|talk_first|agency"
}
```

Response:
```
{
  "request_id": "uuid",
  "status": "submitted",
  "expected_reply_window_hours": 24
}
```

### 4.2 Server effect

- Insert into `requests` (schema in doc 21 §25).
- Send `request_received` email (template 3.3).
- Notify founder via the founder-alert channel (Slack / email until the admin dashboard exists).
- Idempotency key: `(email, website, pack_interest)` within a 1-hour window — duplicates are coalesced and re-acknowledged.

### 4.3 Admin handling

- New row appears in `/admin/leads` and `/admin/orders` (linked once converted).
- One-click actions: send checkout link, ask follow-up question, reject (with reason).

---

## 5 — Retry / manual rescue model [target]

### 5.1 `failed_jobs` table

```
failed_jobs(
  id uuid pk,
  order_id uuid references orders(id),
  stage text check (stage in ('scan','extract','generate','qa','deliver','email')),
  error_payload jsonb,
  retry_attempts int default 0,
  last_attempt_at timestamptz,
  status text check (status in ('open','retried','manually_resolved','permanently_failed')) default 'open',
  created_at timestamptz default now()
)
```

### 5.2 Retry policy

- Auto retry: at most 2 automatic retries on transient errors (scan timeout, extractor 5xx, model 429), with 30-second and 5-minute backoff.
- Manual retry: founder one-click in `/admin/failed-jobs`. Increments `retry_attempts`. No automatic limit on manual retries.
- After 3rd auto-retry failure: state moves to `failed_needs_retry`, customer is notified by founder via `manual_followup`.

### 5.3 Manual delivery

- Founder uploads a hand-prepared pack zip to the deliveries bucket via the admin Generated Packs / Failed Jobs tab.
- Manifest required (same schema as auto-generated).
- Triggering manual delivery flips order status to `package_delivered`, sends `pack_ready`, writes to `email_events`, and marks `failed_jobs.status = manually_resolved`.

### 5.4 Refund path

- One-click refund in `/admin/orders` calls the existing PayPal refund endpoint.
- Customer receives `payment_failed` (REFUNDED variant).
- Order status flips to `payment_failed`; pack is not generated or, if generated, is archived.

---

## 6 — Idempotency, deduplication, PII

### 6.1 Idempotency

- `/api/scan`, `/api/confirm`, `/api/paypal/create-order`, `/api/paypal/capture`, `/api/paypal/webhook`, `/api/request` (when added) all accept an `Idempotency-Key` header.
- Webhook events are deduplicated on `(event_id)`; replays are accepted but not re-acted on.
- Email sends are deduplicated on `(order_id, template_id)` for transactional emails.

### 6.2 Deduplication

- `requests` coalesce duplicates within 1 hour per `(email, website, pack_interest)`.
- `leads` are upserted on `email` (last-touched timestamp wins).
- `assessments` are not deduplicated — re-scans are first-class.

### 6.3 PII rules

- Email is the only PII collected by default. Names appear only when typed in `notes` or `/contact`.
- Customer email is shown to founder only inside admin tabs; never in logs (logs use `customer_id` and `lead_id`).
- Pack contents may include the customer-supplied product description; we do not include the customer email in pack files.
- All exports honour Supabase row-level security; admin reads bypass RLS only via the service role used by the admin dashboard.

---

## 7 — Smoothness contract

Restated from `docs/20-product-ux-blueprint.md` §10 with email-specific guarantees:

1. **What just happened**: every state in §2 has either a UI message, an email, or both. No state in the order scope is silent.
2. **What happens next**: every customer-facing email ends with a "next step" line.
3. **Whether action is needed**: every email's preview text either says "no action needed" or "action needed: {short instruction}".
4. **Whether money was charged**: every payment-relevant email states the charge state explicitly.
5. **When and where the pack arrives**: every payment-received email states the per-tier delivery window and the email address it will be delivered to.

If any state would otherwise be silent on the customer side, the founder must either send a `manual_followup` or accept that we are violating the smoothness contract. Repeated violations escalate as a P1 product issue.

---

## 8 — Pending work and dependencies

- **Add `requests` table + `/api/request` endpoint** (target).
- **Add `failed_jobs` table** (target).
- **Add the `request_received`, `payment_received`, `pack_ready`, `pack_ready_enterprise`, `pack_link_reissued`, `manual_followup`, `payment_failed`, `eligibility_result_optin`, `out_of_scope_optin` templates** to the email service (target).
- **Implement Tier 1 snapshot pipeline** so `package_delivered` can fire for Snapshot orders (target — same blocker noted in `docs/22-output-pack-experience.md` §12).
- **Wire `generation_started` / `generation_completed` / `qa_passed` / `qa_failed` to `order_status_events`** so `/success/[orderId]` shows the correct progress copy (target).
- **Founder alerts** for `failed_needs_retry`, `out_of_scope`, `qa_failed` (target — Slack webhook in v1, founder dashboard alerts later).

These items are the blocking set for closing the loop on every state in §2 — without them, several states remain silent or admin-invisible.

---

## 9 — Acceptance criteria

A new developer, given this doc plus 20/21/22, must be able to:

- Implement the request endpoint and table (§4).
- Wire every state in §1 to its UI surface and email per §2.
- Add the email templates in §3 with the universal footer enforced.
- Implement the retry / manual rescue model in §5 with audit trails in `admin_audit_events`.
- Pass an end-to-end test that covers: scan → confirm → in_scope → request → admin acknowledge → checkout link → payment → generation → QA → delivery → reissue → optional refund — with the customer never being silently abandoned at any step.
