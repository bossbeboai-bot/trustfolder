# 20 — TrustFolder Product UX Blueprint

Status: planning artifact. No code changes flow from this document directly.
Owns: cross-cutting product experience from visitor to delivered evidence pack.
Companion docs:
- `docs/21-dashboard-information-architecture.md` — customer + founder/admin dashboards (plan only).
- `docs/22-output-pack-experience.md` — evidence pack folder, file specs, confidence bands.
- `docs/23-email-and-status-flow.md` — order states, emails, retry/manual recovery.

If anything in this blueprint conflicts with the deep-dive docs, the deep-dive doc wins for its area.

---

## 0 — Reading guide

This document answers four questions in order:
1. What does the visitor experience, end to end, from landing to delivered pack?
2. What pages and CTAs make that journey work?
3. What inputs power the system and how are they collected?
4. What outputs come back, in what form, and through what channels?

After answering those, sections 7–10 plan the post-MVP surface area (dashboards, emails, smoothness, safety) at a level a developer can implement against without guessing.

Section 12 splits the work into "already built / before launch / after first 10 users / later".

---

## 1 — Full user journey

This is the canonical journey TrustFolder is designed around. Every page, email, and dashboard tab traces back to a step in this list.

```
Visitor lands on /
  → reads hero + how-it-works + packs + safety
  → clicks "Run free eligibility check"
Visitor enters /assessment
  → enters website URL + email
  → /api/scan crawls + extracts (~5–15s, on-page progress)
  → /assessment shows scan summary + AI signals + prefilled answers
  → user reviews + edits 8 confirmation questions
  → /api/confirm runs scope check + band calculation
Branch A — out_of_scope:
  → redirect to /out-of-scope with explanation + safe-handoff suggestions
  → no charge, no pack, lead stored
Branch B — soft_out_review:
  → show "needs review" screen
  → CTA: "Apply for premium handoff" → /request?type=premium
  → no charge, lead stored
Branch C — in_scope:
  → review-before-payment screen with summary + recommended tier
  → CTAs: pay (if instant checkout enabled later) OR "Request paid pack"
  → MVP path: /request?type={snapshot|pack|governance|premium} (lead capture)
  → Future path: instant PayPal checkout for tier_1 / tier_2 / tier_3
Payment / request submission:
  → if paid: /api/paypal/create-order → PayPal approve → /checkout/return → /api/paypal/capture
  → if requested: lead written to Supabase requests table, founder notified
Generation:
  → pipeline assembles evidence pack
  → QA gate runs (forbidden phrases, claim sourcing, vertical guardrails)
  → on QA fail: status = failed_needs_retry, founder alerted, no email sent yet
  → on QA pass: pack uploaded to deliveries bucket
Delivery:
  → email sent with download link (signed URL, 7-day expiry, re-issuable)
  → /success/[orderId] shows status, download link, "what to do next"
Post-delivery:
  → customer can re-download from email or future dashboard
  → customer can request review or upgrade pack
  → 30-day roadmap reminder email
Future dashboard:
  → magic-link login (v1)
  → tabs: Overview / Pack / Disclosures / Governance / Risk / Source Notes / Downloads / Upgrade
  → admin tools for founder: failed jobs, manual delivery, refunds
```

The full pipeline is meant to feel like one calm flow, even though it spans up to 48h on the slowest path (Tier 3 with QA review).

---

## 2 — Public site pages

Routes are defined relative to the marketing site. Existing routes: `/`, `/assessment`, `/request`, `/checkout/return`, `/success/[orderId]`, `/out-of-scope`, `/checkout/cancel`. New marketing routes: `/pricing`, `/examples`, `/agencies`, `/safety`, `/contact`.

Convention: each page section names its purpose, target user, primary CTA, secondary CTA, content blocks, data captured, and the next step we want the visitor to take.

### 2.1 `/` — Homepage

- **Purpose**: convert qualified B2B AI visitors into the free eligibility check; secondary conversion to paid pack request.
- **Target user**: founder / head of product / GTM lead at a B2B AI SaaS or AI agency, US/EU/UK, 5–50 people.
- **Primary CTA**: "Run free eligibility check" → `/assessment`.
- **Secondary CTA**: "Request paid pack" → `/request?type=pack`.
- **Sections**: header, hero with animated flow visual, trust strip, problem cards, how-it-works (4 steps), packs preview (linked to `/pricing`), evidence folder visual, AI agencies block, safety/scope, final CTA, footer.
- **Data captured**: none on `/` directly (analytics only).
- **Next step**: click into `/assessment` or `/request`.

### 2.2 `/assessment`

- **Purpose**: collect website URL + email, run scan, surface scan results, capture confirmation answers, run scope check, route to the right next step.
- **Target user**: same as homepage; on this page they have already self-qualified.
- **Primary CTA**: per step — "Scan my site", "Confirm answers", "See my recommended pack".
- **Secondary CTA**: "Back" / "Edit answers" between steps; "Save and email me" (future).
- **Sections (multi-step)**:
  1. URL + email input.
  2. Scanning animation + live status.
  3. Scan results review (homepage + key pages summary, AI signals found).
  4. Confirmation questions (8 questions, prefilled where possible).
  5. Review screen (see section 4 below).
  6. Branch routing (out_of_scope / soft_out_review / in_scope → request or pay).
- **Data captured**: see section 3.
- **Next step**: `/out-of-scope`, `/request?type=…`, or paid checkout path.

### 2.3 `/request`

- **Purpose**: capture intent for a paid pack when the user is not (yet) on instant checkout.
- **Target user**: an in-scope user who reached the recommended-tier screen, or a visitor who clicked "Request paid pack" from the homepage / pricing.
- **Primary CTA**: "Join waitlist / request follow-up".
- **Secondary CTA**: "Run free eligibility check" if they skipped `/assessment`.
- **Sections**: pack picker (defaulted via `?type=`), email, product website, scope notes, scope safety note, success state with summary.
- **Data captured**: pack interest (snapshot / pack / governance / agency / premium), email, website, free-text notes, optional referral source (v1.1).
- **Next step**: founder follow-up email within 24h, or upgrade to paid checkout when wired.
- **Storage**: when the Supabase `requests` table is wired (see doc 23 §requests), this becomes a server write. Until then, the form runs as a placeholder with the same field schema so we can swap the backend without UX changes.

### 2.4 `/pricing`

- **Purpose**: dedicated page that fully explains every tier, what's inside, who it's for, and what the request flow looks like. Removes the "I need to scroll the homepage to compare" friction.
- **Target user**: evaluator who wants to compare tiers before scanning, or a returning visitor sent here directly.
- **Primary CTA per tier**: see section 5 (CTA language).
- **Secondary CTA**: "Run free eligibility check" sticky.
- **Sections**: comparison table (5 tiers × 8 rows: price, who it's for, input, output, delivery, turnaround, upgrade path, refund policy), in-depth tier panels, FAQ, scope safety note.
- **Data captured**: none on the page itself; CTAs route to `/assessment` or `/request?type=…`.
- **Next step**: `/assessment` for free check, `/request?type=…` for paid pack.
- **Relationship to homepage packs**: `/pricing` is the canonical source. Homepage shows a condensed preview that links here. If a tier name, price, or scope changes, it changes here first, then the homepage preview is refreshed.

### 2.5 `/examples`

- **Purpose**: show what an evidence pack actually looks like, build trust without pretending we have customer testimonials we don't have.
- **Target user**: evaluator who wants proof of substance before committing.
- **Primary CTA**: "Run free eligibility check".
- **Secondary CTA**: "See pricing".
- **Sections**: 3 anonymised sample packs (Snapshot, Disclosure Pack, Governance Folder), each with screenshots / inline previews of the README and 2–3 representative documents, downloadable PDF samples, an explicit illustrative-only label on every sample.
- **Data captured**: none; "Email me sample pack" is optional and feeds the lead pipeline as `lead_source = examples_sample_request`.
- **Next step**: `/assessment` or `/pricing`.
- **Mandatory labels**: every screenshot, hero, and download must carry "Illustrative sample. Anonymised. Not a customer-delivered pack." inside the asset itself, not just on the page.

### 2.6 `/agencies`

- **Purpose**: convert AI agencies (chatbot / agent / automation builders) into the agency pack request.
- **Target user**: agency principal, head of delivery, account director.
- **Primary CTA**: "Request agency pack" → `/request?type=agency`.
- **Secondary CTA**: "Run free eligibility check on a client site".
- **Sections**: agency value prop, "what your client receives", per-client handoff folder visual, per-engagement pricing model (3-pack / 5-pack / volume), white-label disclosure (v2), partner contact form.
- **Data captured**: agency name, contact email, number of active AI client projects (range), whether they want white-label (v2 flag).
- **Next step**: founder follow-up call.

### 2.7 `/safety`

- **Purpose**: state, in plain language, what TrustFolder will and will not do, and which verticals trigger automatic out-of-scope.
- **Target user**: cautious legal/compliance buyer; also a defensive page if regulators or journalists check the site.
- **Primary CTA**: "Run free eligibility check".
- **Secondary CTA**: "Contact us" → `/contact`.
- **Sections**: scope-in / scope-out matrix, high-risk vertical list with rationale, what we explicitly do not claim, expert-review handoff path, scope-change policy (we will widen scope only when we have a documented review process for that vertical), data handling, retention, deletion.
- **Data captured**: none.
- **Next step**: `/assessment` or `/contact`.

### 2.8 `/contact`

- **Purpose**: catch-all for non-pack inquiries — sales conversations, agency partnerships, custom scope, press, security disclosures.
- **Target user**: anyone who does not fit the standard request flow.
- **Primary CTA**: "Send message".
- **Secondary CTA**: "Run free eligibility check".
- **Sections**: short intent picker (sales / agency / custom scope / press / security / other), form with name, work email, company, message, optional URL.
- **Data captured**: same fields, plus inferred `lead_source = contact_form`.
- **Next step**: founder reply within 1 business day; security disclosures auto-acknowledged.
- **Distinction from `/request`**: `/request` is for "I want pack X". `/contact` is for "I want to talk first". They feed the same lead pipeline but with different `lead_intent` tags.

---

## 3 — Input flow

Every field collected from a user, grouped by source. Source categories:

- **website-extracted (W)** — pulled by the crawler / extractor; user can correct.
- **user-confirmed (C)** — pre-filled from W, user confirms or edits.
- **user-entered (E)** — user types it manually, no W prefill.
- **system-inferred (S)** — derived by the engine from W + C, not directly typed by the user.

### 3.1 Field catalogue

| Field | Source | Where collected | Used by | Notes |
|---|---|---|---|---|
| `website_url` | E | `/assessment` step 1 | `/api/scan` | required, single canonical URL |
| `email` | E | `/assessment` step 1 | `leads`, all emails | required, lower-cased, validated |
| `company_name` | C | `/assessment` step 4 | scope check, pack content | extracted from `<title>`, OG, footer |
| `product_name` | C | `/assessment` step 4 | pack content | falls back to `company_name` if not found |
| `product_description` | C | `/assessment` step 4 | scope check, pack copy | extracted from hero / meta description |
| `b2b_or_b2c` | C | `/assessment` step 4 | scope check (B2C children rules differ) | enum: `B2B` / `B2C` / `mixed` |
| `target_users` | E | `/assessment` step 4 | scope check | free text + chips ("developers", "ops teams"…) |
| `countries_served` | E | `/assessment` step 4 | EU / UK exposure | multi-select; `has_eu_customers` derived |
| `has_eu_customers` | S | derived from `countries_served` | scope check | yes / no / unknown |
| `primary_jurisdictions` | E | `/assessment` step 4 (advanced) | governance pack | for tier_3 only |
| `num_eu_customers` | E | `/assessment` step 4 (advanced) | governance pack | range buckets |
| `primary_ai_use_case` | C | `/assessment` step 4 | scope check, disclosure copy | extracted candidate + user confirmation |
| `ai_feature_type` | C | `/assessment` step 4 | scope check | enum: chatbot, copilot, content gen, summarisation, search, agent, decision support, other |
| `ai_user_interaction` | C | `/assessment` step 4 | Article-50-style transparency | enum: direct chat, embedded, background, reviewed-by-human, none |
| `processes_personal_data` | E | `/assessment` step 4 | governance pack | yes / no / unknown |
| `data_subject_categories` | E | `/assessment` step 4 (tier_3) | governance pack | multi-select chips |
| `ai_training_data_sources` | E | `/assessment` step 4 (tier_3) | governance pack | multi-select chips |
| `third_party_models` | E | `/assessment` step 4 | governance pack, vendor list | multi-select (OpenAI, Anthropic, Mistral, Google, AWS, self-hosted, other) |
| `human_oversight` | E | `/assessment` step 4 | governance pack | enum: always / sometimes / rarely / never |
| `has_incident_response` | E | `/assessment` step 4 (tier_3) | governance pack | enum: full / partial / none |
| `vertical` | C | `/assessment` step 4 | scope gate, high-risk routing | enum: productivity, dev_tools, marketing, sales, support, finance_ops_only, hr_recruiting (HIGH), healthcare (HIGH), credit_scoring (HIGH), biometrics (HIGH), education_grading (HIGH), critical_infra (HIGH), law_enforcement (HIGH), childrens_products (HIGH), other |
| `high_risk_vertical_confirm` | E | `/assessment` step 4 | scope gate | yes / no — explicit second confirmation when vertical is HIGH |
| `recommended_tier` | S | from band + answers | recommendation | enum: tier_1, tier_2, tier_3, soft_out_review, out_of_scope |
| `band` | S | scope check | recommendation | enum: CLEAR / NEEDS_REVIEW / OUT_OF_SCOPE |
| `pack_interest` | E | `/request` | request lead | enum (matches pricing page) |
| `notes` | E | `/request` and `/contact` | request lead | free text |
| `referral_source` | E | optional everywhere | analytics + attribution | "How did you hear about us?" |

### 3.2 Collection rules

- **Required at scan**: `website_url`, `email`. Everything else is filled in step 4.
- **Step 4 visibility**: tier_3 advanced fields (`primary_jurisdictions`, `num_eu_customers`, `data_subject_categories`, `ai_training_data_sources`, `has_incident_response`) only render when the band is `CLEAR` and recommended tier is `tier_3` or when the user manually expands "Add governance details".
- **Editing W fields**: every C field shows the extracted value, the source URL it came from, and an "edit" affordance. If the user edits, store both the original W value and the edited value (`website_extracted_*` vs confirmed value), so QA / source-notes can flag divergence.
- **No silent S fields**: every S field (`band`, `recommended_tier`, `has_eu_customers`) is shown to the user on the review screen with a one-line explanation of how it was derived.

### 3.3 Field schema lifecycle

- **MVP**: W + C + E fields above are stored on the existing `assessments` table; S fields live in a `derived` JSON column.
- **Phase 4**: split S into typed columns once stable.
- **Phase 5+**: add tenant scoping and edit history.

---

## 4 — Review-before-payment / request screen

This is the screen the user sees right before either paying or submitting a paid pack request. It is the single most important UX surface in the product.

### 4.1 Layout

```
┌────────────────────────────────────────────────────────────────┐
│ Header strip: assessment id, scan time, "Edit answers" button  │
├────────────────────────────────────────────────────────────────┤
│  Summary card                                                  │
│   - company_name + product_name                                │
│   - one-line product description                               │
│   - country / EU exposure                                      │
│   - vertical                                                   │
│   - AI feature type + interaction type                         │
├────────────────────────────────────────────────────────────────┤
│  Likely disclosure needs                                       │
│   - chatbot disclosure (if interaction = direct chat)          │
│   - AI-generated content notice (if feature = content gen)     │
│   - automated decision notice (if feature = decision support)  │
│   - dataset / training transparency (if data source = customer)│
│   - source link to scan finding for each item                  │
├────────────────────────────────────────────────────────────────┤
│  Risk flags                                                    │
│   - vertical HIGH → red                                        │
│   - personal data + no oversight → amber                       │
│   - EU exposure + no DPA mention found → amber                 │
│   - children's product signal → red                            │
│   - explainer line per flag                                    │
├────────────────────────────────────────────────────────────────┤
│  Recommended package                                           │
│   - tier name + price                                          │
│   - one-paragraph "why this fit"                               │
│   - what's inside (link to /pricing)                           │
│   - "Pick a different package" toggle                          │
├────────────────────────────────────────────────────────────────┤
│  What will be generated                                        │
│   - exact file list scoped to chosen tier                      │
│   - "AI-generated drafts for review" badge                     │
├────────────────────────────────────────────────────────────────┤
│  Primary CTA: Request this pack  /  Pay (when wired)           │
│  Secondary CTA: Edit answers  |  Apply for premium handoff     │
│  Tertiary text: refund policy + delivery time + email used     │
└────────────────────────────────────────────────────────────────┘
```

### 4.2 Edit / manual fallback actions

Every block above must offer one of:
- **Edit** — return to the appropriate step in `/assessment` with the current values preserved.
- **Mark as wrong** — for an extracted W field, user can flag it as "not us / wrong page", which forces a scope-check rerun.
- **Talk to a human** — bottom-of-screen link to `/contact?topic=scope`, used when the recommendation feels off.

### 4.3 No-surprise rules

- The page must never auto-charge or auto-submit. Every transition to payment or request requires an explicit click.
- The cost is shown in the same visual block as the CTA, never below the fold.
- If recommended tier is `out_of_scope`, the request CTA is replaced with a free `/out-of-scope` route and a "We will not charge you" statement.
- If recommended tier is `soft_out_review`, the only paid CTA is "Apply for premium handoff" and the copy says "We need to look at this manually before generating anything."

---

## 5 — Package flow

Five tiers. Each has a single clear journey. CTA language matches what is approved in `docs/14-DESIGN.md` and Phase 3 prompt.

### 5.1 Free Eligibility Check

- **Price**: free.
- **Input required**: `website_url`, `email`, 8 confirmation answers.
- **Output generated**: routing verdict (in_scope / soft_out_review / out_of_scope), recommended tier, list of likely disclosure needs, list of risk flags. No documents.
- **Delivery method**: shown on `/assessment` review screen + plain-text email summary (`Eligibility result for {company_name}`).
- **CTA language**: "Start free check" → "Run free eligibility check" → "See my result".
- **Upgrade path**: "Request paid pack" or instant checkout (when wired).

### 5.2 AI Website Trust Snapshot — $99

- **Price**: $99.
- **Input required**: scan + answers from free check.
- **Output**: single PDF + a short README. Contents:
  - Website scan summary
  - AI product overview
  - Likely disclosure areas (3–6 bullets with scan-source citations)
  - Readiness result (one of: ready, draft-needed, expert-review-needed)
  - Next steps (3–5 bullets)
- **Delivery method**: email with signed download link, status visible on `/success/[orderId]`.
- **CTA language**: "Request snapshot" (request flow) or "Buy snapshot" (instant checkout — only used once snapshot.ts pipeline is implemented and routed; until then we keep request language).
- **Upgrade path**: "Upgrade to Disclosure Pack" surfaced inside the snapshot email + on `/success/[orderId]`.

### 5.3 AI Disclosure Pack — $499

- **Price**: $499.
- **Input required**: scan + answers; plus optional brand voice notes (v1.1).
- **Output**: zip with subfolders:
  - `01-disclosures/` — chatbot disclosure, AI-generated content notice, AI system disclosure page draft, placement guide.
  - `02-internal-summary/` — internal transparency summary (one-pager).
  - `03-legal-review/` — legal-review note (what to ask a lawyer).
  - `README.md` — what's inside, how to use it, scope reminder.
- **Delivery method**: email + signed download link; future dashboard tab "Disclosures".
- **CTA language**: "Request pack" (current) / "Buy pack" (when instant checkout is wired).
- **Upgrade path**: "Upgrade to Governance Folder" inside email + dashboard.

### 5.4 Buyer-Ready AI Governance Folder — $999

- **Price**: $999.
- **Input required**: scan + answers; tier_3 advanced fields if not already collected.
- **Output**: zip matching the canonical folder layout (see doc 22):
  - `README.md`
  - `01-disclosures/`
  - `02-governance/`
  - `03-evidence/`
  - `04-buyer-legal-handoff/`
  - `05-source-notes/`
  - `next-steps-roadmap.md`
- **Delivery method**: email + signed download; future dashboard tabs Pack / Governance / Disclosures / Risk / Source Notes.
- **CTA language**: "Request pack" / "Buy pack".
- **Upgrade path**: "Apply for Enterprise Buyer Handoff" inside email and dashboard.

### 5.5 Enterprise Buyer Handoff — $2,500+

- **Price**: $2,500+ (custom).
- **Input required**: everything in 5.4 plus a 30-minute kickoff call and shared docs from the customer (DPA, sub-processor list, sample buyer questionnaires).
- **Output**: everything in Governance Folder, plus:
  - handoff cleanup pass on copy
  - Loom walkthrough recording
  - one revision round
  - optional advisor-supported review (separate scope)
- **Delivery method**: email with download + Loom link + scheduled follow-up; founder-touched, not fully automated.
- **CTA language**: "Apply" only. Never "Buy now".
- **Upgrade path**: ongoing advisory engagement (out of scope of TrustFolder MVP, captured in `/contact`).

### 5.6 Cross-tier rules

- Every tier email contains the same legal-review reminder: "AI-generated drafts for review. Not legal advice. Not certification."
- Every tier shows the user, before they pay, the *exact file list* they will receive.
- Refund rule: if the QA gate fails before delivery, no charge stands; if delivered and customer disputes within 7 days, manual review by founder.
- Out-of-scope rule applies before payment: we never charge, then refund. We refuse upfront.

---

## 6 — Output pack experience (summary, deep spec in doc 22)

Canonical folder, used as Tier 3 target; Tier 1 and Tier 2 are subsets.

```
TrustFolder Evidence Pack/
├─ README.md
├─ 01-disclosures/
├─ 02-governance/
├─ 03-evidence/
├─ 04-buyer-legal-handoff/
├─ 05-source-notes/
└─ next-steps-roadmap.md
```

Per-file contract (deep version in doc 22):
- **purpose** — one sentence on what this file is for.
- **where the user uses it** — buyer review, internal team, lawyer prep, agency client handoff, regulator response.
- **confidence band** — High / Medium / Low — how grounded the draft is in scan + confirmed answers.
- **source notes** — list of scan citations, user-confirmed answers, model rationale.
- **review note** — what a lawyer should specifically check.
- **next action** — the single recommended action after reading.

Tier subsets:
- **Tier 1 (Snapshot)** — single PDF, no folder. Maps to a "highlights" extract of `01-disclosures/` + readiness note. Currently pending implementation; flagged in doc 22.
- **Tier 2 (Disclosure Pack)** — `01-disclosures/`, `02-internal-summary/`, `03-legal-review/`, README. No `03-evidence/` or buyer handoff folder.
- **Tier 3 (Governance Folder)** — full canonical layout.
- **Enterprise** — Tier 3 + Loom + revision round + advisor handoff (separate doc).

---

## 7 — Future customer dashboard (summary, deep spec in doc 21)

Plan-only. Blocked on a later auth phase. All tabs are read-mostly in v1.

| Tab | v1 | v2 | v3 |
|---|---|---|---|
| Overview | yes | yes | yes |
| Website Scan | yes | yes | yes |
| Evidence Pack | yes | yes | yes |
| Disclosures | yes | yes | yes |
| Governance Docs | yes | yes | yes |
| Risk Flags | yes | yes | yes |
| Source Notes | yes | yes | yes |
| Downloads | yes | yes | yes |
| Upgrade / Request Review | yes | yes | yes |
| Settings | partial | yes | yes |
| Re-scan workflow | — | yes | yes |
| Team workspace | — | — | yes |
| Connector data | — | — | yes |

Auth model:
- v1: passwordless magic-link to the email used during checkout. No password DB. Current implementation uses `customer_profiles`, `customer_link_tokens`, and a signed `tf_customer` cookie rather than the older separate session-table design.
- v2: password + magic-link, email change with double-confirm.
- v3: workspace, multiple users, role permissions.

---

## 8 — Founder / admin dashboard (summary, deep spec in doc 21)

Plan-only. The minimum useful admin tooling so the founder can rescue any failed delivery within 24h.

Tabs: Orders, Leads, Assessments, Website Scans, Generated Packs, QA Results, Failed Jobs, Out-of-Scope Leads, Revenue, Settings.

Operating principles:
- **Rescue first, analytics later.** Every failed order must have a one-click "retry generation" and a one-click "manual upload + deliver" path.
- **No PII drift.** Customer email shown only when needed for a specific support action.
- **Audit trail.** Every admin action writes to `admin_audit_events`.

---

## 9 — Email and status flow (summary, deep spec in doc 23)

Lifecycle states and where they fire from. Tags: **[current]** = already in code, **[target]** = planned, must be added before launch.

| State | Where it fires | Customer email | Internal | Admin action? |
|---|---|---|---|---|
| `lead_created` [current via leads table] | `/api/scan` | none | row in `leads` | no |
| `assessment_completed` [current] | `/api/confirm` | none | row in `assessments` | no |
| `request_submitted` [target] | `/api/request` (to add) | "We received your request" | row in `requests` | yes (within 1 day) |
| `payment_pending` [current] | `/api/paypal/create-order` | none | row in `orders` | no |
| `payment_completed` [current] | webhook + capture | "Payment received, generating pack" | order status flip | no |
| `generation_started` [target] | pipeline kick | none | order status | no |
| `qa_passed` [target] | QA gate pass | none | qa_results row | no |
| `package_delivered` [partial; target for full email] | post-upload | "Your pack is ready" with link | row in `email_events` | no |
| `failed_needs_retry` [target] | QA fail / pipeline error | none yet | row in `failed_jobs` | yes |
| `out_of_scope` [current] | `/api/confirm` | "We can't safely auto-generate for your case" | flag on assessment | no |

Smoothness rule (from section 10): the customer must never wonder if money was charged or whether the pack is coming. Every state above maps to a clear customer-facing message; no state is silent on the customer side except when the customer has not yet acted.

---

## 10 — Smoothness rules

The user must always know, at every step:
1. **What just happened** — confirmed by an immediate visible message and, where money or generation is involved, by an email.
2. **What happens next** — explicit "next step" line on every screen and in every email.
3. **Whether they need to act** — every email states clearly "no action needed" or "action needed".
4. **Whether money was charged** — every payment-relevant state confirms the charge state in plain language ("Charged $499", "No charge", "Refund initiated").
5. **When and where they get the pack** — every paid order states an expected delivery window ("typically within 1 business hour for snapshot, up to 24h for governance, up to 48h for enterprise") and where it will arrive (which email and, when wired, which dashboard tab).

Operating limits:
- No screen waits for generation to finish. Generation always runs async; the user gets a status page + email.
- No "thank you" screens without a next-step CTA.
- No "we'll be in touch" without a stated SLA.
- No silent failures. If generation fails, the user gets either a retry email or a founder-touched email within 24h.

---

## 11 — Trust and safety rules

Carry-over from `docs/14-DESIGN.md`, restated here as product rules.

**Never use** in any product surface (UI copy, emails, pack contents, dashboards):
- "guaranteed compliance"
- "audit-proof"
- "no lawyer needed"
- "fully compliant"
- "buy now" (until instant checkout is launched and reviewed)
- "certified"

**Always use**:
- "evidence folder"
- "readiness drafts"
- "buyer-ready"
- "lawyer-review-ready"
- "AI governance evidence folder"
- "not legal advice"
- "not certification"
- "not a compliance guarantee"

**Disclaimers required on**:
- every pack file (footer line)
- every delivery email (body)
- pricing page (footer)
- safety page (top of page)
- examples page (every sample asset)

**Vertical scope gates** (auto out-of-scope):
- HR / recruiting
- healthcare diagnosis
- credit scoring
- biometrics
- children's products
- law enforcement
- critical infrastructure
- education grading / admissions

If the user's vertical or feature falls into a gate, the system must:
1. Show a non-judgemental "we don't auto-generate for this" screen.
2. Refuse to charge.
3. Offer the expert-review handoff path (`/contact?topic=expert-review`).
4. Store the lead with `out_of_scope_reason` and a free-text "what they were trying to do".

---

## 12 — Build roadmap

Split as requested. Each item owns its acceptance shape.

### 12.1 Already built

- Marketing homepage `/` (Phase 3).
- `/assessment` multi-step flow with `/api/scan` and `/api/confirm`.
- `/request` placeholder with pack picker, success state, query-param routing.
- PayPal create-order, webhook, capture, return route.
- `/success/[orderId]` polling status from `/api/status/[orderId]`.
- `/out-of-scope`, `/checkout/cancel`.
- Supabase tables: `leads`, `website_scans`, `assessments`, `orders`, `order_status_events`, `generated_packs`, `qa_results`, `email_events`.
- Smoke tests A/C/D pass; B2/B3 prepared but PayPal sandbox approval skipped.

### 12.2 Needed before launch

- `/api/request` endpoint and `requests` table; wire the placeholder form to real backend without changing UX.
- Tier 1 Snapshot delivery (`snapshot.ts`, single-PDF assembly, email + status flip).
- Tier 2 / Tier 3 pipeline finalisation: folder assembly, QA gate, signed-URL email.
- Email templates for: payment received, pack ready, request received, out-of-scope acknowledgement, failed-needs-retry founder alert.
- `/pricing`, `/examples`, `/agencies`, `/safety`, `/contact` pages.
- Review-before-payment screen polish on `/assessment` (section 4 layout).
- Admin alerts on `failed_needs_retry`.
- Refund policy page (linked from pricing footer).

### 12.3 Nice after first 10 users

- `/examples` real anonymised samples (Tier 2 + Tier 3) replacing initial illustrative drafts.
- Magic-link customer dashboard v1 (Overview, Pack, Disclosures, Downloads, Upgrade).
- Founder dashboard v1 (Orders, Failed Jobs, Out-of-Scope Leads, Manual Delivery).
- Per-tier upgrade path UX inside the delivery email.
- 30-day roadmap reminder email.
- Audit-trail of every admin action.

### 12.4 Later dashboard / auth

- Customer dashboard v2 (Re-scan, Settings, password + magic link).
- Customer dashboard v3 (team workspace, roles).
- Founder dashboard v2 (Revenue, QA Results browser, Generated Packs browser).
- Internal API rate limiting, abuse detection.

### 12.5 Later connectors

- Slack notification connector for buyer-review readiness.
- Notion / Confluence sync of disclosure docs.
- Google Drive connector for evidence pack delivery.
- HubSpot / Pipedrive lead sync for agencies.
- These are explicitly **not** part of the MVP and should not appear in any roadmap deck before §12.4 is shipped.

---

## 13 — Acceptance criteria for this blueprint

A different developer, given this doc and docs 21/22/23, should be able to:

1. Build every public site page in section 2 to spec, without asking what fields to collect, what CTAs to use, or how each page relates to the next.
2. Implement the review-before-payment screen exactly as section 4.1 lays out, including edit/manual fallback rules in 4.2 and no-surprise rules in 4.3.
3. Implement per-tier journeys (input → output → delivery → upgrade) exactly as section 5 spells out.
4. Wire status states and emails as section 9 + doc 23 specify, with [current] vs [target] tags telling them what already exists.
5. Plan the customer + founder dashboards from doc 21 without re-deriving information architecture.
6. Apply trust/safety rules from section 11 across every UI copy and pack file.

If any of those is not derivable from this doc plus 21/22/23, that is a doc bug — file it before writing code.
