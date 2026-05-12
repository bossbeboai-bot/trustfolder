# 24 — Implementation Gap Audit (docs 20–23 vs current code)

Status: planning artifact. P0 launch-safety items are now closed in code (see §13.1). Remaining gaps stay tracked here.
Owns: explicit map of what is built today vs what docs 20–23 plan, with priority and effort per gap.

> **Last update — 2026-05-09**: P0 launch-safety batch executed. Closed gaps are flagged inline below; full closure log lives in §13.1.

Audit basis (verified, not assumed):
- Routes: `app/app/**` directory tree.
- API endpoints: `app/app/api/**/route.ts`.
- Engine: `engine/src/**` and `engine/src/lib/**`.
- DB schema: `engine/supabase/migrations/0001_initial_schema.sql`.
- Email wiring: `engine/src/lib/resend.ts` + `engine/src/deliver.ts`.
- Order state machine: `engine/src/order-status.ts` (`TRANSITIONS`, `markFailed`, `STATUS_LABELS`).
- Pipeline: `engine/src/pipeline.ts`.
- Pack assembly: `engine/src/package.ts`.
- QA: `engine/src/qa.ts`.
- Templates: `templates/tier-1/`, `templates/tier-2/`.
- Phase 3 marketing site: `app/app/page.tsx` + `app/app/components/MarketingHome.tsx`, `app/app/request/page.tsx` + `app/app/components/RequestLeadPage.tsx`.

Conventions:
- **Priority**: `P0` = blocks first real paid customer · `P1` = blocks first 10 happy customers · `P2` = post-10 polish · `Later` = dashboard/auth/connectors phases.
- **Effort**: `S` ≈ ≤ ½ day · `M` ≈ 1–3 days · `L` ≈ ≥ 1 week.
- **Blocks launch**: `Yes` = launch is unsafe without it · `No` = ship without and iterate.

If a doc claim contradicts what is actually in code, the gap entry calls it out explicitly under "doc accuracy note".

---

## 1 — Already built

These items in docs 20–23 are implemented in code today. They do not need build work; they may need polish or doc reconciliation.

| Area | Where it lives | Notes |
|---|---|---|
| Marketing homepage `/` (Phase 3) | `app/app/page.tsx` → `app/app/components/MarketingHome.tsx` | Sections wired per `docs/20` §2.1; uses framer-motion via dynamic SSR-off wrapper (Windows build constraint). |
| Marketing `/request` page (placeholder) | `app/app/request/page.tsx` → `app/app/components/RequestLeadPage.tsx` | UX spec from `docs/20` §2.3 fully implemented; backend write is intentionally placeholder. |
| Multi-step `/assessment` flow | `app/app/assessment/page.tsx` | URL+email → scan → confirmation → review; matches `docs/20` §1 steps 1–6. |
| `/api/scan` | `app/app/api/scan/route.ts` | Crawls + extracts via engine; writes `leads`, `website_scans`, `assessments`. |
| `/api/confirm` | `app/app/api/confirm/route.ts` | Runs scope check, sets `band` + `next_step`. |
| `/api/paypal/create-order` | `app/app/api/paypal/create-order/route.ts` | Allowed tiers: `tier_1`, `tier_2`, `tier_3`; snapshots assessment onto order; touches `payment_pending`. |
| `/api/paypal/capture` | `app/app/api/paypal/capture/route.ts` | Manual capture backup; idempotent; triggers pipeline. |
| `/api/paypal/webhook` | `app/app/api/paypal/webhook/route.ts` | Signature-verified, deduped via event id, fires async pipeline + confirmation email. |
| `/api/status/[orderId]` | `app/app/api/status/[orderId]/route.ts` | Lightweight polling endpoint. |
| `/checkout/return` and `/checkout/cancel` | `app/app/checkout/return/page.tsx`, `app/app/checkout/cancel/page.tsx` | Capture + redirect flow. |
| `/success/[orderId]` | `app/app/success/[orderId]/page.tsx` | Polls `/api/status`, shows `STATUS_LABELS`-driven progress, terminal states for delivered / failed / out-of-scope. |
| `/out-of-scope` | `app/app/out-of-scope/page.tsx` | Calm "no charge / specialist review" copy. |
| Engine crawler + extractor | `engine/src/crawler.ts`, `engine/src/extract.ts` | |
| Engine classify + scope-check | `engine/src/classify.ts`, `engine/src/scope-check.ts` | |
| Engine generate (Tier 2 / Tier 3) | `engine/src/generate.ts`, `engine/src/prompts/generate-system.ts` | |
| Engine QA gate | `engine/src/qa.ts` (deterministic + LLM, persisted to `qa_results`) | Forbidden-phrase list is solid; small gap noted in §10. |
| Pack assembly | `engine/src/package.ts` (Tier 2 + Tier 3 ZIPs, README, manifest, signed URL) | Folder layout differs from `docs/22` — see §9. |
| Delivery emails | `engine/src/deliver.ts` (`pack_delivery`, `order_confirmation`, `retry_notice`, `out_of_scope_refund`) | Other templates from `docs/23` §3 not yet built. |
| Resend wrapper | `engine/src/lib/resend.ts` | Logs to `email_events`, status tracking. |
| Pipeline orchestrator | `engine/src/pipeline.ts` (classify → generate → qa → 1 retry → package → deliver) | Tier_1 currently routed to `markFailed` + retry-notice. |
| Order state machine | `engine/src/order-status.ts` (full `TRANSITIONS` map, `transition()`, `markFailed()`) | All 13 enum values implemented. **Doc 23 over-marked several states as `[target]`.** |
| Supabase schema (8 tables) | `engine/supabase/migrations/0001_initial_schema.sql` | leads, website_scans, assessments, orders, order_status_events, generated_packs, qa_results, email_events. RLS enabled (service-role only). |
| Smoke harness A/C/D | `scripts/smoke-acd.mjs` | Currently passing per `progress.txt`. |
| Smoke harness B/B2/B3 prep | `scripts/smoke-bb2b3-prepare.mjs` | Order creation works; sandbox approval deferred. |
| Tier-2 / Tier-3 templates | `templates/tier-1/*.md` (disclosures), `templates/tier-2/*.md` (governance) | Naming is misleading: `templates/tier-1/` is the disclosure family used by Tier 2 and Tier 3 packs. |

**Doc accuracy note (one-liner)**: `docs/23-email-and-status-flow.md` §1 over-tags `generation_started`, `qa_passed`, `package_delivered`, `failed_needs_retry` as `[target]`. They are implemented in `engine/src/pipeline.ts` and `engine/src/order-status.ts`. The audit below treats them as **already built** for prioritisation.

---

## 2 — Partially built

| # | Area | What exists | What's missing | Priority | Effort | Blocks launch |
|---|---|---|---|---|---|---|
| 2.1 | `/request` lead capture | UI form + success state in `app/app/components/RequestLeadPage.tsx` | No `/api/request` endpoint, no `requests` table, no founder notification, no `request_received` email | **P0** | M | **Yes** |
| 2.2 | Tier 1 (Snapshot) pipeline | `engine/src/snapshot.ts` is a stub with full build outline; `engine/src/pipeline.ts` rejects `tier_1` and routes to `markFailed` + retry-notice email | Actual generator, single-PDF assembly, Tier 1 routing in `pipeline.ts`, `package.ts` Tier 1 pass-through, `deliver.ts` attachment-style email | **P0** (or remove `tier_1` from checkout for launch) | M | **Yes** unless removed |
| 2.3 | Tier 3 pack folder layout | `engine/src/package.ts` builds `01-disclosures/`, `02-governance/`, `03-evidence/`, `04-legal-review-handoff/`, `sources-and-notes.md`, `README.md`, `manifest.json` | Folder name is `04-legal-review-handoff/` (doc 22 §1 says `04-buyer-legal-handoff/`); no `05-source-notes/` folder (single file at root); no `next-steps-roadmap.md` | **P0** (small) — keep customers and docs aligned | S | **Yes** (decide: rename folder + move sources-and-notes into `05-source-notes/` OR update `docs/22` to match code) |
| 2.4 | Pack manifest | `manifest.json` with `company`, `generated_at`, `tier`, `tier_label`, `documents[].{template_id,filename,confidence_band,citations}`, `generator` | Missing `pack_id`, `scan_id`, `assessment_id`, `order_id`, per-file `purpose`, structured per-file `sources[].{type:scan/answer/rationale}`, `qa{verdict,checks}` block per `docs/22` §7.2 | **P1** | M | No |
| 2.5 | QA forbidden phrases | `engine/src/qa.ts` blocks 14 phrases including all of: fully compliant, guaranteed compliance, audit-proof, no lawyer needed | Missing `"buy now"` from doc 20 §11 / 22 §3.18 / 23 §3 | **P1** | S | No |
| 2.6 | Universal email footer | All 4 existing emails carry "AI governance evidence folder, not a legal compliance guarantee" line | Missing the exact `Order id: {order_id} · Sent: {timestamp}` line from `docs/23` §3 wrapper | **P2** | S | No |
| 2.7 | Webhook payment-failure transitions | `app/app/api/paypal/webhook/route.ts` filters DENIED/REFUNDED/REVERSED and updates `orders.payment_status` | No corresponding `orders.status` transition (the enum has no `payment_failed`); no `payment_failed` customer email | **P1** | S | No, but customers go silent on failed payments |
| 2.8 | Pipeline retry | `engine/src/pipeline.ts` retries generation **once** when QA fails on `generation_run = 1` | No `failed_jobs` table; no founder alert; no manual rescue UI; no auto-retry for transient scan / extract errors with backoff | **P1** | M | No (founder can rescue manually for now) |
| 2.9 | Out-of-scope email | `engine/src/deliver.ts` has `out_of_scope_refund` (post-charge refund variant) | No `out_of_scope_optin` (pre-charge) email per `docs/23` §3.2; refund variant fires only when an order exists | **P2** | S | No |
| 2.10 | Storage bucket | `engine/src/package.ts` uploads to `env.supabaseStorageBucket()` (default `deliveries`) | Bucket creation is **commented out** in `engine/supabase/migrations/0001_initial_schema.sql` (manual step). Verify it has been created in the live Supabase project before launch | **P0** | S | **Yes** if bucket missing in production |

---

## 3 — Not built yet

Items from docs 20–23 with no code in the repo at all.

| # | Area | Doc reference | Priority | Effort | Blocks launch |
|---|---|---|---|---|---|
| 3.1 | `/pricing` page | `docs/20` §2.4 | P1 | M | No |
| 3.2 | `/examples` page (anonymised illustrative samples) | `docs/20` §2.5 | P1 | M | No |
| 3.3 | `/agencies` page | `docs/20` §2.6 | P1 | S | No |
| 3.4 | `/safety` page | `docs/20` §2.7 | P1 | S | No |
| 3.5 | `/contact` page | `docs/20` §2.8 | P1 | S | No |
| 3.6 | Refund policy page (linked from pricing footer) | `docs/20` §12.2 | P1 | S | No |
| 3.7 | `/api/request` endpoint + `requests` table | `docs/23` §4 | **P0** | M | **Yes** (see §4.1) |
| 3.8 | `failed_jobs` table + retry / manual delivery model | `docs/23` §5 | P1 | M | No (founder rescues by hand for first ~10 customers) |
| 3.9 | `pack_link_reissued` endpoint + email | `docs/22` §10.4, `docs/23` §3.9 | P1 | S | No |
| 3.10 | `manual_followup` email helper | `docs/23` §3.8 | P2 | S | No |
| 3.11 | `eligibility_result_optin` email | `docs/23` §3.1 | P2 | S | No |
| 3.12 | `pack_ready_enterprise` template (Tier 4) | `docs/22` §6.4 / `docs/23` §3.7 | Later | M | No (Tier 4 is application-only, founder-touched) |
| 3.13 | `next-steps-roadmap.md` generator (Tier 2 + Tier 3 pack files) | `docs/22` §5 | **P0** | S | **Yes** (named in pack contract) |
| 3.14 | Per-paragraph source-note inlining inside generated docs | `docs/22` §9 | P1 | M | No (consolidated `sources-and-notes.md` covers the trust story for v1) |
| 3.15 | Customer dashboard `/dashboard/*` (any tab) | `docs/21` Part A | Later | L | No |
| 3.16 | `customers` / `customer_sessions` / `customer_link_tokens` / `customer_auth_events` tables | `docs/21` §25 | Later | M | No |
| 3.17 | Magic-link auth | `docs/21` §1 | Later | M | No |
| 3.18 | Admin dashboard `/admin/*` (any tab) | `docs/21` Part B | Later | L | No |
| 3.19 | `admin_users` / `admin_sessions` / `admin_audit_events` / `app_settings` tables | `docs/21` §25 | Later | M | No |
| 3.20 | Founder Slack/email alerts on `failed_needs_retry` / `qa_failed` | `docs/23` §8 | P1 | S | No (Slack webhook is the simplest v1) |
| 3.21 | 30-day roadmap reminder email | `docs/20` §12.3 | P2 | S | No |
| 3.22 | Re-scan workflow from `/dashboard/scan` | `docs/21` §3 | Later | M | No |
| 3.23 | Connectors (Slack notify, Notion sync, Drive delivery, HubSpot/Pipedrive lead sync) | `docs/20` §12.5 | Later | L | No |

---

## 4 — Must build before first real user

These are the launch blockers. Each must be either built, descoped, or explicitly accepted as a known limitation in the launch checklist.

### 4.1 `/api/request` endpoint + `requests` table — P0 / M / blocks launch

- **Affected**: new `app/app/api/request/route.ts`; new migration `engine/supabase/migrations/0002_add_requests.sql`; wire `app/app/components/RequestLeadPage.tsx` `setSubmitted` to call the endpoint.
- **Why it matters**: every CTA on `/`, `/pricing` (when built), and `/agencies` ends at `/request?type=…`. Today the form's success state is a local-state toggle; nothing is persisted, founder gets nothing, customer gets no email. Launching without this means leads are silently dropped.
- **Doc reference**: `docs/20` §2.3, `docs/21` §15, `docs/23` §4.

### 4.2 Tier 1 (Snapshot) pipeline — P0 / M / blocks launch *unless* `tier_1` is removed from checkout

- **Affected**: `engine/src/snapshot.ts` (currently stub), `engine/src/pipeline.ts` (`markFailed` branch), `engine/src/package.ts` (Tier 1 pass-through), `engine/src/deliver.ts` (snapshot delivery email).
- **Why it matters**: `app/app/api/paypal/create-order/route.ts` currently allows `tier_1`. If anyone pays $99, the pipeline rejects them and emails a retry-notice; they will never receive a snapshot. Either ship `runSnapshot()` or remove `tier_1` from `ALLOWED_TIERS` until it ships.
- **Doc reference**: `docs/22` §6.1, `engine/src/snapshot.ts` header outline.

### 4.3 Storage bucket exists in the live Supabase project — P0 / S / blocks launch

- **Affected**: Supabase project storage settings (out of repo); validation script `scripts/check-supabase-config-and-schema.ps1`.
- **Why it matters**: `engine/src/package.ts` will fail uploads if the `deliveries` bucket is not created. Migration leaves bucket creation as a manual step (commented).
- **Action**: confirm bucket exists with public=false; document the manual step in `docs/12-smoke-test-procedure.md`.

### 4.4 Tier 2 / Tier 3 pack contract reconciliation — P0 / S / blocks launch (small)

- **Affected**: `engine/src/package.ts` and `docs/22` §1, §6.2, §6.3.
- **Why it matters**: Either fix code or fix doc — pick one source of truth. Decision recommended: keep `04-legal-review-handoff/` (already shipped name) and **update `docs/22` to match code**. Add `next-steps-roadmap.md` generation (P0 separately, see 4.5) and decide whether to keep `sources-and-notes.md` at root or move to `05-source-notes/01-source-citations.md`.
- **Doc reference**: `docs/22` §1, §3.16–§3.18.

### 4.5 `next-steps-roadmap.md` in Tier 2 / Tier 3 packs — P0 / S / blocks launch

- **Affected**: `engine/src/package.ts` (add a deterministic renderer using extraction + classification + answers).
- **Why it matters**: docs 20/22 explicitly position this as the customer's "what to do next" map. The pack feels incomplete without it.

### 4.6 Add `"buy now"` to QA forbidden-phrases list — P1 / S / no, but trivial

- **Affected**: `engine/src/qa.ts` `FORBIDDEN_PHRASES`.
- **Why it matters**: brand language rule. Trivial change.

### 4.7 Webhook → `orders.status` transition on payment failure — P1 / S / no, but customers go silent

- **Affected**: `app/app/api/paypal/webhook/route.ts` (transition to `failed_needs_retry` on DENIED/REVERSED, or to `out_of_scope` on REFUNDED with reason); add a `payment_failed` email template per `docs/23` §3.5.
- **Why it matters**: today a denied capture updates `orders.payment_status` but leaves `orders.status = payment_pending`. `/success/[orderId]` polling shows "Awaiting payment" forever. Customer gets no email.

### 4.8 Founder alert channel — P1 / S / no

- **Affected**: new minimal helper (Slack incoming-webhook env var or a dedicated email recipient) called from `engine/src/order-status.ts:markFailed`.
- **Why it matters**: without an alert, founder discovers failures only by polling Supabase. The doc 23 §8 promise that "no state is silent on the customer side" presumes someone is watching.

---

## 5 — Can wait until after first 10 users

| Item | Rationale | Priority | Effort |
|---|---|---|---|
| `/pricing`, `/examples`, `/agencies`, `/safety`, `/contact` pages | Homepage already explains packs and safety; founder can route the first 10 by hand. Build once we know which page is asked about most. | P1 | M total |
| Reissue download link self-serve endpoint | Founder can manually reissue from Supabase for the first 10 customers. | P1 | S |
| Per-paragraph inline source notes | Consolidated `sources-and-notes.md` covers the trust story; per-paragraph inlining is a polish pass. | P1 | M |
| Manifest schema upgrade (pack_id, scan_id, assessment_id, order_id, qa block) | Current manifest is functional; richer schema unlocks dashboard later. | P1 | M |
| `eligibility_result_optin` email | Free-check users can see the result on screen; emailing it is nice-to-have. | P2 | S |
| `manual_followup` email helper | Founder sends from inbox today; helper formalises the footer. | P2 | S |
| 30-day roadmap reminder email | Useful retention loop, not launch-critical. | P2 | S |
| Refund policy page | Can live as a section inside `/pricing` initially. | P1 | S |
| Out-of-scope opt-in pre-charge email | Refund variant already covers post-charge edge case. | P2 | S |

---

## 6 — Later / dashboard phase

Everything in this section is gated on a deliberate auth phase decision. Do not start before the launch list (§4) is closed.

| Item | Doc reference | Priority | Effort |
|---|---|---|---|
| Magic-link auth (v1) | `docs/21` §1.1, §25 | Later | M |
| `customers`, `customer_sessions`, `customer_link_tokens`, `customer_auth_events` tables | `docs/21` §25 | Later | M |
| `/dashboard` Overview tab | `docs/21` §2 | Later | M |
| `/dashboard/scan` | `docs/21` §3 | Later | M |
| `/dashboard/pack`, `/disclosures`, `/governance`, `/risk`, `/sources`, `/downloads` | `docs/21` §§4–9 | Later | L (combined) |
| `/dashboard/upgrade`, `/dashboard/settings` | `docs/21` §§10–11 | Later | M |
| Re-scan workflow | `docs/21` §3 (v2) | Later | M |
| Customer dashboard v2 (password + email change) | `docs/21` §1.2 | Later | M |
| Customer dashboard v3 (workspace, roles) | `docs/21` §1.3 | Later | L |
| `/admin/*` (Orders, Leads, Assessments, Scans, Packs, QA, Failed Jobs, Out-of-Scope, Revenue, Settings) | `docs/21` Part B | Later | L |
| `admin_users`, `admin_sessions`, `admin_audit_events`, `app_settings` tables | `docs/21` §25 | Later | M |
| Connectors (Slack, Notion, Drive, HubSpot, Pipedrive) | `docs/20` §12.5 | Later | L |

---

## 7 — Payment-dependent items

These items either touch PayPal or assume a paid order exists. Per the standing rule, **PayPal code does not change in this audit cycle**.

| # | Item | Touches PayPal? | Priority | Notes |
|---|---|---|---|---|
| 7.1 | `payment_failed` order-state transition + email (gap 4.7) | Reads webhook events; does **not** change PayPal calls | P1 | Webhook handler enriches our state; PayPal API surface is untouched. |
| 7.2 | One-click admin refund | Calls existing PayPal refund endpoint already wired | Later | Surface only; refund engine code already exists. |
| 7.3 | Tier 4 (Enterprise) instant checkout | Would require a new SKU and likely a separate flow | Later | Out of scope for first 10 customers; founder-touched. |
| 7.4 | "Buy now" copy/CTA on `/pricing` | Brand-language rule says no | P0 | UI rule; not a payment change. Use "Request paid pack" until the full instant-checkout surface is launched. |
| 7.5 | Re-issue signed download URL | No PayPal touch (Supabase Storage only) | P1 | New endpoint + email template. |
| 7.6 | Reconciling daily PayPal payouts vs orders | New admin tab | Later | Revenue tab is v2 of admin (`docs/21` §22). |

---

## 8 — Auth-dependent items

Every customer-facing dashboard tab and admin view in `docs/21` is auth-dependent. None are blockers for launch; all are **Later**.

| # | Item | Auth dependency | Priority |
|---|---|---|---|
| 8.1 | Customer Overview / Pack / Disclosures / Governance / Risk / Sources / Downloads / Upgrade / Settings tabs | Magic-link session cookie scoped by `customer_id` | Later |
| 8.2 | Email-change with double-confirm | v2 auth | Later |
| 8.3 | Workspace / multi-user invites | v3 auth | Later |
| 8.4 | Admin dashboard (`/admin/*`) | TOTP-second-factor admin sessions | Later |
| 8.5 | Per-customer signed-URL reissuance from dashboard | Requires customer auth | Later |
| 8.6 | Customer-side pack annotations / "implemented" flags (`customer_disclosure_status`) | v2 auth | Later |

For launch, signed URLs in delivery emails carry the access; no customer authentication is needed.

---

## 9 — Output-pack gaps

Anchored to `docs/22-output-pack-experience.md`.

| # | Gap | File / area | Priority | Effort | Blocks launch |
|---|---|---|---|---|---|
| 9.1 | Tier 1 single-PDF snapshot pipeline | `engine/src/snapshot.ts` (stub), `engine/src/pipeline.ts` tier_1 branch | **P0** | M | **Yes** unless `tier_1` removed from checkout |
| 9.2 | Tier 3 folder name `04-buyer-legal-handoff/` vs code `04-legal-review-handoff/` | `engine/src/package.ts:folderForTier3` and `docs/22` §1 | P0 | S | Pick one; recommend updating `docs/22` to code | 
| 9.3 | `05-source-notes/` folder vs root-level `sources-and-notes.md` | `engine/src/package.ts:renderSourcesAndNotes` and `docs/22` §1, §3.16–§3.18 | P0 | S | Pick one |
| 9.4 | `next-steps-roadmap.md` not generated | `engine/src/package.ts` | **P0** | S | **Yes** |
| 9.5 | Manifest schema lighter than spec | `engine/src/package.ts` (manifest writer) and `docs/22` §7.2 | P1 | M | No |
| 9.6 | Per-paragraph inline source notes | `engine/src/generate.ts` + prompt updates | P1 | M | No |
| 9.7 | Confidence-band assignment rules formalised | `engine/src/classify.ts`, `engine/src/generate.ts` (already emits per-doc band); needs explicit "answer-edited capped at Medium" and "vertical-only capped at Medium" rules per `docs/22` §8 | P1 | M | No |
| 9.8 | Universal disclaimer footer alignment | `engine/src/package.ts:disclaimerBlock`, `engine/src/deliver.ts` | P2 | S | No |
| 9.9 | Tier 4 (Enterprise) handoff folder structure | New code; `docs/22` §6.4 | Later | M | No (application-only) |

---

## 10 — Email / status gaps

Anchored to `docs/23-email-and-status-flow.md`.

| # | Gap | File / area | Priority | Effort | Blocks launch |
|---|---|---|---|---|---|
| 10.1 | `request_received` email | new entry in `engine/src/deliver.ts`; templates set ID `request_received` | **P0** | S | **Yes** (paired with 4.1) |
| 10.2 | `payment_failed` email + state | webhook + `engine/src/deliver.ts` | P1 | S | No, but customer goes silent |
| 10.3 | `eligibility_result_optin` email | `engine/src/deliver.ts` | P2 | S | No |
| 10.4 | `out_of_scope_optin` email (pre-charge) | `engine/src/deliver.ts` | P2 | S | No |
| 10.5 | `pack_link_reissued` email + endpoint | new endpoint + `engine/src/deliver.ts` | P1 | S | No |
| 10.6 | `manual_followup` helper | `engine/src/deliver.ts` | P2 | S | No |
| 10.7 | `pack_ready_enterprise` template | `engine/src/deliver.ts` | Later | M | No |
| 10.8 | Founder alert channel for `failed_needs_retry` / `qa_failed` | `engine/src/order-status.ts:markFailed`, optional Slack webhook env | P1 | S | No |
| 10.9 | Email footer carries `Order id · Sent` line | `engine/src/lib/resend.ts` (or `deliver.ts` per-template) | P2 | S | No |
| 10.10 | Idempotency keys on `/api/scan`, `/api/confirm`, `/api/request` | route handlers | P2 | M | No (PayPal endpoints already idempotent via webhook event-id) |
| 10.11 | `assessment_started` distinct from `assessment_completed` for abandon-tracking | `assessments` table tweak; founder dashboard uses it | Later | S | No |

---

## 11 — Admin rescue gaps

Anchored to `docs/21` Part B and `docs/23` §5. **All Later** (no admin UI today). Listed for completeness so the eventual implementer has a single shopping list.

| # | Gap | Priority | Effort |
|---|---|---|---|
| 11.1 | `failed_jobs` table + writer at `markFailed` | P1 (table) / Later (UI) | M |
| 11.2 | `/admin/orders` with timeline + retry + manual-upload + refund actions | Later | L |
| 11.3 | `/admin/leads` and `/admin/requests` with status + reply templates | Later | M |
| 11.4 | `/admin/assessments` with re-run scope check / mark out-of-scope | Later | M |
| 11.5 | `/admin/scans` with re-run + raw extractor output | Later | M |
| 11.6 | `/admin/packs` with manifest preview + force-regenerate + replace-with-manual | Later | M |
| 11.7 | `/admin/qa` results browser + override | Later | M |
| 11.8 | `/admin/failed-jobs` retry / manual-deliver / mark permanently-failed | Later | M |
| 11.9 | `/admin/out-of-scope` review queue with handoff-email action | Later | M |
| 11.10 | `/admin/revenue` simple monthly totals | Later | S |
| 11.11 | `/admin/settings` feature flags + content blocks + signed-URL TTL | Later | S |
| 11.12 | `admin_audit_events` writer everywhere admin mutates | Later | S |
| 11.13 | TOTP seat setup script + env contract | Later | S |
| 11.14 | One-click PayPal refund from `/admin/orders` | Later | S (engine call exists) |

For the launch window, the founder will rescue manually via Supabase + a custom reply from inbox; gap 4.8 (founder alert channel) is the minimum needed to make that possible.

---

## 12 — Public-site gaps

Anchored to `docs/20` §2.

| # | Page | Priority | Effort | Blocks launch | Notes |
|---|---|---|---|---|---|
| 12.1 | `/` homepage | — already built | — | — | `app/app/components/MarketingHome.tsx`. Polish copy where needed. |
| 12.2 | `/assessment` | — already built | — | — | `app/app/assessment/page.tsx`. Confirm review screen matches `docs/20` §4 layout in a follow-up polish pass. |
| 12.3 | `/request` UI | — already built | — | — | Backend wiring (gap 4.1) is the launch blocker, not the UI. |
| 12.4 | `/pricing` | P1 | M | No | Comparison table + per-tier panels + FAQ; canonical source for pack copy. |
| 12.5 | `/examples` | P1 | M | No | Anonymised illustrative samples only; mandatory "Illustrative sample" labels per `docs/20` §2.5. |
| 12.6 | `/agencies` | P1 | S | No | Routes CTAs to `/request?type=agency`. |
| 12.7 | `/safety` | P1 | S | No | Restates `docs/20` §11 trust/safety rules + scope-out matrix. |
| 12.8 | `/contact` | P1 | S | No | General inquiries vs `/request` (paid pack). |
| 12.9 | Refund policy page | P1 | S | No | Linked from `/pricing` footer. |
| 12.10 | Review-before-payment screen polish | P1 | M | No | `app/app/assessment/page.tsx` step 6 — match `docs/20` §4.1 layout (summary card, disclosure needs, risk flags, recommended package, what-will-be-generated, edit/manual fallback). |
| 12.11 | Sticky "AI-generated drafts for review" disclaimer on every public surface | P2 | S | No | Currently in homepage footer; verify on `/assessment`, `/request`. |
| 12.12 | Examples page sample assets actually built | P1 | M | No | Synthesise 1 Tier 2 + 1 Tier 3 anonymised sample from a non-customer URL via the existing engine; brand-strip; add "Illustrative sample" watermark. |

---

## 13 — Summary launch checklist (P0 only)

### 13.1 P0 closure log — 2026-05-09

| # | Item | Status | Files touched |
|---|---|---|---|
| 1 | `/api/request` + `requests` table + `RequestLeadPage` wiring | **CLOSED** | `engine/supabase/migrations/0002_add_requests.sql` (new) · `engine/src/requests.ts` (new) · `app/app/api/request/route.ts` (new) · `app/app/components/RequestLeadPage.tsx` |
| 2 | `request_received` email | **CLOSED** | `engine/src/deliver.ts:sendRequestReceived` |
| 3 | Tier 1 instant-checkout decision | **CLOSED — disabled** | `app/app/api/paypal/create-order/route.ts` (block tier_1) · `app/app/assessment/page.tsx` (selecting tier_1 routes to `/request?type=snapshot`) |
| 4 | `deliveries` storage bucket — manual setup documented | **CLOSED — doc + verification path** | `engine/supabase/migrations/0001_initial_schema.sql` (manual-setup block expanded). Live bucket creation remains an environment task (verified via `scripts/check-supabase-config-and-schema.ps1`). |
| 5 | Tier 3 folder reconciliation (rename to `04-buyer-legal-handoff/`) | **CLOSED** | `engine/src/package.ts:folderForTier3` + README rendering · `engine/src/deliver.ts` ("What to do next" path fix) |
| 6 | `next-steps-roadmap.md` generation in Tier 2 / Tier 3 packs | **CLOSED** | `engine/src/package.ts:renderNextStepsRoadmap` |
| 7 | `"buy now"` added to QA forbidden phrases | **CLOSED** | `engine/src/qa.ts:FORBIDDEN_PHRASES` |
| 8 | Webhook DENIED / REVERSED / REFUNDED → safe state + customer email + audit | **CLOSED** | `app/app/api/paypal/webhook/route.ts` (DENIED → `failed_needs_retry` from `payment_pending`; past-payment_completed records audit only) · `engine/src/deliver.ts:sendPaymentFailed` · `app/app/success/[orderId]/page.tsx` (distinct payment-failure copy via `payment_status`) |
| 9 | Founder alert channel on `markFailed` and webhook payment failures (optional `ALERT_WEBHOOK_URL`) | **CLOSED** | `engine/src/lib/alert.ts:notifyFounder` (new) · `engine/src/lib/env.ts:alertWebhookUrl` · `engine/src/order-status.ts:markFailed` · `app/app/api/paypal/webhook/route.ts` · `engine/.env.example` |
| 10 | Doc reconciliation in `docs/23` §1, §2, §4 | **CLOSED** | `docs/23-email-and-status-flow.md` §1 table + §2.x headers + §4 header now correctly tag `request_submitted`, `generation_started`, `qa_passed`, `package_delivered`, `failed_needs_retry` and the `/api/request` flow as `[current]`. `generation_completed` and `qa_failed` are kept tagged `[target — implicit]` because no literal enum state matches; they route through other states. The `failed_jobs` orchestration table remains `[target]`. |

### 13.1.1 Documented compromises

- **`order_status_t` still lacks `payment_failed`.** When PayPal capture is denied while `orders.status = payment_pending`, we transition to `failed_needs_retry` (closest legal transition). Past-payment_completed denials only append an `order_status_events` audit row and do not overwrite the status. The `/success/[orderId]` page reads `payment_status` alongside `status` and renders a distinct "Your payment did not complete / was reversed" copy when `payment_status` is `failed` or `refunded`. A future migration can add a dedicated `payment_failed` enum value; not required for launch.
- **Tier 1 snapshot instant checkout remains disabled.** `engine/src/snapshot.ts` is still a stub. The `/api/paypal/create-order` endpoint rejects `tier_1` with a clear `tier_1_checkout_disabled` error and the assessment page routes Tier 1 selections to `/request?type=snapshot`. Customers can still ask for a snapshot via the request flow.

### 13.2 Original P0 list (kept for traceability)


In a sprint planner, these are the only must-do items before taking a real first paid customer.

1. **Build** `/api/request` + `requests` table + wire `RequestLeadPage` (gap 4.1).
2. **Build** `request_received` email (gap 10.1).
3. **Decide and act on Tier 1** (gap 4.2): either ship `runSnapshot` or remove `tier_1` from `ALLOWED_TIERS` in `app/app/api/paypal/create-order/route.ts` and the Phase 3 marketing copy.
4. **Verify** the `deliveries` storage bucket exists in production Supabase (gap 4.3).
5. **Reconcile** Tier 2 / Tier 3 pack folder layout with `docs/22` (gap 4.4) — pick one source of truth.
6. **Add** `next-steps-roadmap.md` generation in `engine/src/package.ts` (gap 4.5).
7. **Add** `"buy now"` to QA forbidden phrases (gap 4.6).
8. **Wire** webhook payment-failure to `orders.status` and a customer email (gap 4.7).
9. **Wire** founder alert channel on `markFailed` (gap 4.8).
10. **Doc reconciliation**: update `docs/23` §1 to remove the `[target]` tag from `generation_started`, `qa_passed`, `package_delivered`, `failed_needs_retry`, since they are implemented.

Total estimated effort for the P0 list: **~3–5 days of focused work**, depending on the Tier 1 decision in item 3.

---

## 14 — Acceptance criteria for this audit

- Every gap has: file/area, why-it-matters, P0/P1/P2/Later, S/M/L effort, blocks-launch flag.
- Every claim is grounded in either a verified file path in `app/app/**`, `engine/src/**`, or `engine/supabase/migrations/**`, or in an explicit doc citation.
- The §13 launch checklist is short enough to execute in a single sprint.
- No code was written in this audit cycle. PayPal code untouched. Auth / dashboard / connectors untouched.
