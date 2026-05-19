# 21 — Dashboard Information Architecture

Status: planning artifact. No code changes flow from this document.
Owns: customer dashboard and founder/admin dashboard — IA, tabs, data sources, actions, versioning.
Companion: `docs/20-product-ux-blueprint.md` §7–§8 for the cross-cutting summary.

Hard rule: **nothing in this doc gets implemented in this task.** Auth, dashboards, and connectors are explicitly deferred. This doc exists so the implementer can ship without re-deriving structure.

---

## 0 — Conventions

- **v1 / v2 / v3** indicate launch wave. v1 = first dashboard release. v2 = second iteration once 10–25 customers exist. v3 = team / workspace scale.
- **Data source** lists the canonical Supabase table or API the tab reads from.
- **Action** is a thing the user (or admin) can do on the tab. Each action lists the write target.
- **Surface** = where this lives in the URL tree.
- **Auth model** is documented in §1.5 and applies to every customer tab.

---

# Part A — Customer dashboard

Surface: `/dashboard/*` (all customer surface). Auth required. Dependent on the v1 magic-link auth phase, which is **not** built yet.

## 1 — Customer auth model

### 1.1 v1 — magic-link only

- User enters email on `/dashboard/login`.
- System checks the email matches a `customers` row (created on first paid order or first request).
- If yes, issue a 15-minute magic-link token; email it; clicking the link sets a 30-day session cookie.
- If no, render a generic "We couldn't find an account for that email. Run a free eligibility check first." message — never reveal whether an email exists.

### 1.2 v2 — password + magic-link

- Optional password set after first login.
- Email change flow with double-confirm (old email + new email).

### 1.3 v3 — workspace

- A workspace owns assessments, orders, packs.
- Roles: owner, editor, viewer.
- Invite by email, magic-link onboarding for invited members.

### 1.4 Identity model (v1)

- `customers(id, email, created_at, last_login_at, status)`
- `customer_link_tokens(id, customer_id, token_hash, expires_at, used_at, ip, user_agent)`
- `customer_link_tokens(id, customer_id, token_hash, expires_at, used_at)`

### 1.5 Cross-tab auth rules

- Every `/dashboard/*` route checks the session cookie server-side and 302s to `/dashboard/login` if absent or expired.
- No customer tab ever shows another customer's data; queries are scoped by `customer_id`.
- Server log of every auth event in `customer_auth_events` (login_link_sent, login_success, login_failed, logout).

---

## 2 — Tab: Overview

- **Surface**: `/dashboard`.
- **v1**: yes.
- **What user sees**:
  - Most recent assessment summary (company name, scan date, band, recommended tier).
  - Most recent order: tier, status, delivery state, download link if delivered.
  - Single "next action" card: e.g. "Your governance pack is ready — download" or "Confirm your answers to continue" or "Apply for premium handoff".
  - 2–3 recommended next steps tied to band: "Upgrade to Disclosure Pack", "Re-scan after a copy change", "Talk to advisor".
- **Actions**:
  - Open assessment → `/dashboard/scan`.
  - Open most recent pack → `/dashboard/pack`.
  - Request upgrade → `/dashboard/upgrade`.
- **Data source**: `customers`, `assessments` (latest), `orders` (latest), `generated_packs` (latest), `email_events`.
- **Notes**: the Overview must always present *one* primary action — never two equal CTAs.

---

## 3 — Tab: Website Scan

- **Surface**: `/dashboard/scan`.
- **v1**: yes.
- **What user sees**:
  - URL scanned, scan timestamp, pages crawled count.
  - Extracted fields (company name, product name, description, AI signals) with the source URL for each.
  - User-confirmed answers next to extracted values, with a small "edited from extracted" note where the user changed something.
  - List of disclosure-relevant claims found, each with a quoted snippet and the source page.
  - Re-scan button (v2 only — v1 says "Re-scanning is coming soon").
- **Actions**:
  - View scan source pages (opens external link in new tab).
  - Edit answers (v2): re-opens `/assessment` with current values prefilled and re-runs scope check.
  - Re-scan (v2): triggers `/api/scan` reusing the email; new `website_scans` row.
- **Data source**: `website_scans`, `assessments`.

---

## 4 — Tab: Evidence Pack

- **Surface**: `/dashboard/pack`.
- **v1**: yes.
- **What user sees**:
  - Pack title (e.g. "Buyer-Ready AI Governance Folder for Acme AI").
  - Tier name + price paid + delivery date.
  - Folder tree visualisation (read-only) reflecting the actual zip contents.
  - Per-folder description (matches doc 22 §2).
  - Confidence summary at the top: "X High / Y Medium / Z Low".
  - "Download full pack" button (signed URL valid 7 days; re-issuable from the same button).
- **Actions**:
  - Download pack zip.
  - Re-issue download link (writes a new `email_events` row with new signed URL; invalidates old one when feasible).
  - Open a single file in inline preview (markdown render in v1; PDF preview in v2).
- **Data source**: `generated_packs`, `qa_results`, deliveries storage bucket.

---

## 5 — Tab: Disclosures

- **Surface**: `/dashboard/disclosures`.
- **v1**: yes (read-only).
- **What user sees**:
  - List of disclosure documents in the pack (chatbot disclosure, AI-content notice, system disclosure page, placement guide).
  - Per-doc: confidence band, source notes, review note, recommended placement (footer / chat header / settings page / privacy policy / terms / docs).
- **Actions**:
  - Copy markdown / HTML.
  - Download single file.
  - Mark as "implemented" (v2): writes a customer-side flag in `customer_disclosure_status`.
- **Data source**: file rows inside `generated_packs.contents` (JSON manifest), plus copy stored in storage.

---

## 6 — Tab: Governance Docs

- **Surface**: `/dashboard/governance`.
- **v1**: yes (read-only). Tier_3 only.
- **What user sees**:
  - Governance policy draft, AI system inventory, evidence tracker, risk notes, lawyer/buyer handoff doc.
  - Each with confidence band and source notes; lawyer/buyer handoff doc has a "what to ask your lawyer" inline checklist.
  - 30-day roadmap snippet at top.
- **Actions**:
  - Download single file or all.
  - Copy section.
  - Mark sections as reviewed (v2).
- **Data source**: `generated_packs.contents` filtered to `02-governance/` and `04-buyer-legal-handoff/`.

---

## 7 — Tab: Risk Flags

- **Surface**: `/dashboard/risk`.
- **v1**: yes.
- **What user sees**:
  - List of risk flags surfaced during scope check, with severity (red / amber / green-cleared) and explanation.
  - For each flag: source (which answer / scan finding triggered it), recommendation, link to the relevant pack section.
  - "How TrustFolder treated this" line per flag, e.g. "We added a chatbot disclosure draft because the scan found an embedded chat widget on the homepage."
- **Actions**:
  - Mark flag as "internal review done" (v2).
  - Re-run scope check after editing answers (v2).
- **Data source**: `assessments.derived.risk_flags` (JSON).

---

## 8 — Tab: Source Notes

- **Surface**: `/dashboard/sources`.
- **v1**: yes.
- **What user sees**:
  - Every claim in the pack mapped back to its source: scan citation, user-confirmed answer, or model rationale tag.
  - Group by pack file; expandable per file.
  - "Why we wrote this paragraph" trace under each section of the major drafts.
- **Actions**:
  - Click a source to open the underlying scan page or the original answer.
- **Data source**: `generated_packs.source_map` (JSON, written by the generator).

---

## 9 — Tab: Downloads

- **Surface**: `/dashboard/downloads`.
- **v1**: yes.
- **What user sees**:
  - Every delivered pack the customer has, ordered by date.
  - Per pack: tier, delivery date, expires badge if signed URL has rolled over, file size.
- **Actions**:
  - Download zip / single file.
  - Re-issue link.
  - Request a re-export (v2): regenerates the pack from current answers (separately priced if scope changed).
- **Data source**: `generated_packs`, `email_events` (most recent download issuance).

---

## 10 — Tab: Upgrade / Request Review

- **Surface**: `/dashboard/upgrade`.
- **v1**: yes.
- **What user sees**:
  - Recommended next pack based on current band + history.
  - Request form same as `/request` but pre-filled.
  - "Apply for premium handoff" entry point.
  - Refund / scope-change policy block.
- **Actions**:
  - Submit upgrade request → `requests` table (when wired).
  - Open instant checkout when wired.
- **Data source**: `customers`, latest `assessments`, latest `orders`.

---

## 11 — Tab: Settings

- **Surface**: `/dashboard/settings`.
- **v1**: partial (email + logout only).
- **v2**: change email (with double-confirm), notification preferences, language, timezone.
- **v3**: workspace members, roles, billing contact.
- **Actions**:
  - Logout → invalidates session.
  - Email change request (v2) writes to `customer_email_change_requests` and emails the new address.
- **Data source**: `customer_profiles`, `customer_link_tokens`, `customer_auth_events`.

---

## 12 — Acceptance criteria — customer dashboard

A new developer, given this doc, must be able to:
- Build every v1 tab without asking what data populates it.
- Wire magic-link auth without inventing additional tables.
- Add v2 / v3 features incrementally without breaking the v1 contract.
- Refuse to surface any customer data outside the customer's `customer_id` scope (verified by an explicit middleware test).

---

# Part B — Founder / admin dashboard

Surface: `/admin/*`. Auth required, with a separate `admin_sessions` table and IP-restricted login. The founder is the only seat in v1.

## 13 — Admin auth model

- v1: single allowlisted email + magic-link, plus a TOTP-style second factor stored in `admin_totp` (configured once via secure setup script).
- v2: support for additional admin seats with role tags (founder / support).
- All admin actions append to `admin_audit_events(id, admin_id, action, target_type, target_id, payload, created_at)`.

---

## 14 — Tab: Orders

- **Surface**: `/admin/orders`.
- **What founder sees**: every order with status, tier, amount, payment status, delivery status, last status update, customer email, retry count, QA verdict, signed-URL last-issued-at.
- **Actions**:
  - View order detail: full timeline (`order_status_events`), capture/refund history (PayPal), pipeline trace.
  - Retry generation — re-runs pipeline for that `order_id`; idempotent. Writes `failed_jobs.retry_attempts++`.
  - Manual upload + deliver — uploads a hand-prepared pack zip to deliveries bucket and triggers the delivery email.
  - Issue refund (PayPal sandbox / live) — calls existing PayPal refund endpoint; updates order status.
  - Reissue download link.
- **Data source**: `orders`, `order_status_events`, `generated_packs`, `qa_results`, `failed_jobs`, `email_events`.

## 15 — Tab: Leads

- **Surface**: `/admin/leads`.
- **What founder sees**: every `leads` row with email, source page, status (active / converted / lost), last touched, assessment link if any, request link if any, contact link if any.
- **Actions**:
  - Mark contacted, mark converted, mark lost.
  - Send reply email from a templated set.
  - Convert lead → request (creates a `requests` row pre-filled).
- **Data source**: `leads`, `requests`, `assessments`.

## 16 — Tab: Assessments

- **Surface**: `/admin/assessments`.
- **What founder sees**: every assessment with band, recommended tier, vertical, AI feature type, EU exposure flag, conversion status (paid / requested / abandoned).
- **Actions**:
  - View full extracted vs confirmed answers.
  - Re-run scope check with overridden vertical or feature for QA / debugging.
  - Mark as out-of-scope manually with rationale.
- **Data source**: `assessments`, `website_scans`.

## 17 — Tab: Website Scans

- **Surface**: `/admin/scans`.
- **What founder sees**: every `website_scans` row with URL, scan date, pages crawled, extractor warnings, errors.
- **Actions**:
  - Re-run scan.
  - Inspect raw extractor output.
  - Flag extractor regression for engineering review.
- **Data source**: `website_scans`.

## 18 — Tab: Generated Packs

- **Surface**: `/admin/packs`.
- **What founder sees**: every generated pack with tier, file count, total size, manifest preview, QA verdict, deliveries object key.
- **Actions**:
  - Open pack contents inline.
  - Download for manual review.
  - Force-regenerate.
  - Replace with manual upload.
- **Data source**: `generated_packs`, deliveries bucket.

## 19 — Tab: QA Results

- **Surface**: `/admin/qa`.
- **What founder sees**: every `qa_results` row with verdict, failure reasons (forbidden phrase hit, missing source citation, vertical guardrail tripped, low-confidence draft), pack id, order id.
- **Actions**:
  - View full QA reasoning.
  - Override (v2) with documented rationale → triggers re-delivery.
- **Data source**: `qa_results`.

## 20 — Tab: Failed Jobs

- **Surface**: `/admin/failed-jobs`.
- **What founder sees**: every failed pipeline run with order id, stage that failed (scan / extract / generate / QA / deliver), error, retry attempts, last attempt time, customer email, time since failure.
- **Actions**:
  - One-click retry.
  - Manual delivery (uploads a hand-prepared pack and flips order status).
  - Mark as "permanently failed — refund issued".
- **Data source**: `failed_jobs` (new table; planned in doc 23 §retries).

## 21 — Tab: Out-of-Scope Leads

- **Surface**: `/admin/out-of-scope`.
- **What founder sees**: every assessment that hit the out-of-scope path, with reason, vertical, what they were trying to do, contact email if they opted in to follow-up.
- **Actions**:
  - Send expert-review handoff email.
  - Tag as "vertical we should consider supporting" — feeds the scope-change backlog.
- **Data source**: `assessments` filtered by `band = 'OUT_OF_SCOPE'`, plus `out_of_scope_reasons` JSON.

## 22 — Tab: Revenue

- **Surface**: `/admin/revenue`.
- **v1**: simple list of completed orders by month with totals and refunds. No analytics.
- **v2**: tier mix, refund rate, time-to-deliver percentiles.
- **Data source**: `orders` joined with PayPal capture / refund events.

## 23 — Tab: Settings

- **Surface**: `/admin/settings`.
- **v1**: feature flags (instant-checkout-enabled, snapshot-tier-enabled), content blocks (refund policy, scope-change policy), email-from address, deliveries bucket lifecycle (signed-URL TTL).
- **v2**: per-tier price overrides for promos, admin seats.
- **Data source**: `app_settings` (single-row keyed config) + `admin_audit_events` for history.

---

## 24 — Cross-cutting admin rules

- **Rescue first.** Every failed delivery must have a one-click retry and a manual-upload-and-deliver path within the Failed Jobs tab.
- **One-click refund** must be available wherever an order is shown.
- **No silent edits.** Every admin write hits `admin_audit_events` with payload diff.
- **Read-mostly defaults.** New tabs default to read-only; mutating actions are gated behind an "Enable admin actions" toggle that re-prompts TOTP.
- **No analytics in v1.** Time-to-deliver percentiles, conversion funnels, and cohort views are explicitly v2 / v3.

---

## 25 — New tables required for dashboards (plan only)

```
customers(id, email UNIQUE, created_at, last_login_at, status)
customer_link_tokens(id, customer_id, token_hash, expires_at, used_at, ip, user_agent, created_at)
customer_link_tokens(id, customer_id, token_hash, expires_at, used_at, created_at)
customer_auth_events(id, customer_id, event, payload, created_at)
customer_disclosure_status(id, customer_id, pack_id, file_path, status, updated_at)  -- v2
customer_email_change_requests(id, customer_id, new_email, token_hash, status, created_at, confirmed_at)  -- v2

requests(id, lead_id NULL, customer_id NULL, pack_interest, email, website, notes, source, status, created_at)

failed_jobs(id, order_id, stage, error_payload, retry_attempts, last_attempt_at, status, created_at)

admin_users(id, email UNIQUE, totp_secret_encrypted, created_at, last_login_at)
admin_sessions(id, admin_id, token_hash, expires_at, ip, ua, created_at)
admin_audit_events(id, admin_id, action, target_type, target_id, payload, created_at)
app_settings(key PRIMARY KEY, value JSONB, updated_at, updated_by_admin_id)
```

These are spec-only. Migrations will be drafted alongside the dashboard implementation phase, not in this task.

---

## 26 — Acceptance criteria — admin dashboard

A new developer, given this doc, must be able to:
- Implement every v1 admin tab and the four cross-cutting rules in §24 without re-deriving structure.
- Write the new tables in §25 in one migration.
- Ensure every admin write is auditable and that every order has a viable rescue path within the Orders + Failed Jobs tabs.
