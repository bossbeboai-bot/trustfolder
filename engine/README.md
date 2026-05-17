# TrustFolder Engine

The generation pipeline. Eleven modules that take a customer's website URL + 8-15 confirmation answers and produce a delivered AI governance evidence pack.

## Modules

| File | Role |
|---|---|
| `src/crawler.ts` | Fetch homepage / pricing / about / docs; cheerio parse to text |
| `src/extract.ts` | Claude structured extraction → company info |
| `src/scope-check.ts` | Hard-coded keyword detection of out-of-scope verticals |
| `src/classify.ts` | Per-system EU AI Act risk classification with confidence bands |
| `src/generate.ts` | Fill master templates via Claude (parallel, with retry) |
| `src/qa.ts` | Second-pass LLM validation: confidence bands present, citations, disclaimers |
| `src/package.ts` | ZIP build + Supabase Storage upload + signed URL |
| `src/deliver.ts` | Resend transactional email with download link |
| `src/paypal.ts` | Create order, capture, verify webhook signature |
| `src/order-status.ts` | Status state machine (13 states, transition validation) |
| `src/pipeline.ts` | Post-payment async orchestrator: classify -> tier-specific generation -> package -> deliver |
| `src/snapshot.ts` | Tier 1 Lite Readiness Snapshot generator for the autonomous $99 path |

Plus shared `lib/` (Supabase, Claude, Resend clients + types) and `prompts/` (4 system prompts).

## Tier mapping (canonical: `docs/03-pricing-and-tiers.md`)

| Tier identifier | Customer-facing name | Price | Engine handler |
|---|---|---|---|
| `tier_0` | Free Eligibility Check | $0 | `/api/scan` + `/api/confirm` (no docs) |
| `tier_1` | Lite Readiness Snapshot | $99 | `snapshot.ts` + `buildSnapshotPack` |
| `tier_2` | Article 50 Disclosure Pack | $499 | `generate.ts` → `DISCLOSURE_DOCS` only |
| `tier_3` | Full AI Governance Evidence Folder | $999 | `generate.ts` → `DISCLOSURE_DOCS + GOVERNANCE_DOCS` |
| `tier_4` | Premium Buyer/Legal Handoff | $2.5-4.5k | Application-only (manual fulfillment) |

**Note:** Template file IDs (`t1-*`, `t2-*` in `templates/`) are internal file paths and were named before the 5-tier ladder rename. They do not directly correspond to customer-facing tier numbers.

## Customer journey supported

```
URL + email
   ↓
[crawler]  → "Scanning website..."
   ↓
[extract]  → "Preparing questions..."
   ↓
8-question confirmation form (frontend)
   ↓
[scope-check] → "Checking fit..."
   ↓
in-scope?
   ├─ yes → recommended package + PayPal checkout
   └─ no  → polite "requires expert review" page
   ↓
PayPal payment captured (webhook)
   ↓
"Pack is being generated. We'll email it shortly." (no on-page wait)
   ↓
[classify] → [generate] → [qa] → [package] → [deliver]
   ↓
Customer receives email with signed download link
```

## Status state machine

Order status flows through (with `failed_needs_retry` and `out_of_scope` as terminal/recoverable forks):

```
lead_created
  → website_scanned
  → questions_completed
  → scope_checked
  → payment_pending
  → payment_completed
  → generation_started
  → qa_started
  → qa_passed
  → package_created
  → delivered
```

Errors:
- `failed_needs_retry` — recoverable; retry queued, customer emailed "we're finishing your pack"
- `out_of_scope` — terminal; refund initiated

See `src/order-status.ts` for valid transitions.

## Setup

```bash
cd engine
cp .env.example .env  # fill in secrets
npm install
npm run typecheck
```

Run Supabase migration:
```bash
# from repo root
psql "$SUPABASE_URL_DIRECT" -f engine/supabase/migrations/0001_initial_schema.sql
# or via Supabase CLI:
supabase db push
```

## Architecture decisions

- **Async generation.** PayPal webhook triggers `generation_started`, then a background pipeline runs through `generate → qa → package → deliver`. The user is never blocked on screen.
- **Idempotent webhooks.** PayPal webhook handler dedupes by `paypal_order_id`; replays are safe.
- **Customer answers persisted before payment.** Saved on `assessments.questionnaire_data` and copied to `orders.questionnaire_data` at create-order time. Never lost on payment failure.
- **Status writes are atomic.** Every module emits a single status update with timestamp + actor + metadata.
- **Confidence-band conservatism.** When in doubt, the classifier escalates to REVIEW. False-CLEAR is the worst outcome; QA pass enforces.

## What this engine does NOT do (Phase 2 scope)

- No customer dashboard (per Phase 2 spec)
- No Remotion / motion graphics
- No advisor workflow (deferred to pre-Tier-2-launch)
- No Tier 2 checkout (gated to advisor review at Day 28-32)
- No fine-tuned model. Plain Claude + structured prompts.

These are Phase 3+.
