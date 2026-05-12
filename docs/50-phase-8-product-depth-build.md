# 50 — Phase 8 Product Depth Build

Status: Phase 8 implementation reference.  
Source plans: `docs/48-competitor-audit-action-plan.md`, `docs/49-trustfolder-positioning-refresh.md`.  
Last updated: 2026-05-11

This doc summarises everything built in Phase 8 — the competitor-inspired product depth pass — and the safety boundaries we preserved.

## 0 · Hard rules respected

- No new payment provider, no subscriptions, no connectors, no team
  accounts, no enterprise SSO, no runtime monitoring, no bias/drift
  detection, no Vanta/OneTrust-style full compliance automation, no
  final legal compliance conclusions.
- No language we forbid: "fully compliant", "certified",
  "audit-proof", "no lawyer needed", "legal guarantee", "SOC 2
  certified", "GDPR compliant", "HIPAA compliant", "ISO certified".

## 1 · Readiness Score (Batch 1)

New module: `engine/src/readiness-score.ts`. Pure deterministic
function that returns a `ReadinessScore` with five dimensions:

1. AI disclosure clarity
2. AI use summary completeness
3. Governance documentation readiness
4. Evidence / source strength
5. Expert-review headroom (high score = low need for expert review)

Bands:

- 80–100: Strong readiness
- 60–79: Good start, needs review
- 40–59: Partial readiness
- 0–39: Not ready / expert review likely

Out-of-scope assessments are hard-capped to `not_ready`. REVIEW-band
assessments cap at `good` even if numbers are high.

Customer-facing label: **AI documentation readiness score** /
**buyer-readiness score**. We never call it a compliance, audit, or
legal score.

Display surfaces:

- `/assessment` review screen (via `ReadinessScoreCard` on the confirm
  response).
- Customer dashboard `/dashboard/packs` (per-order card).
- Generated pack `README.md` (always present in tier_2 and tier_3
  packs).
- `manifest.json` inside the pack (machine-readable).

Limitations documented inside every render:

- Scored from your website scan and intake answers only.
- Does not assert that any law or framework is satisfied.
- Does not replace qualified counsel, security review, or privacy
  review.

## 2 · Source-to-Document Traceability (Batch 2)

`engine/src/package.ts` — `manifest.json` now emits a `sources` block
for every document:

- `website_pages` — citations extracted during generation.
- `user_confirmed_answers_used` — boolean.
- `system_inferred_signals_used` — boolean.
- `confidence_band` — per-document confidence.
- `needs_human_review` — derived from confidence band.

The existing `sources-and-notes.md` (tier 3 only) keeps a
human-readable per-document citation list.

## 3 · Open Review Items (Batch 3)

New module: `engine/src/open-review-items.ts`. Builds a static list
from the intake/scope. Categories: `product_clarity`, `user_disclosure`,
`data_use`, `human_oversight`, `buyer_legal_review`, `high_risk_scope`,
`missing_evidence`, `expert_review_required`. Each item has a title,
"why it matters", suggested owner, priority, and `open` status.

Surfaces:

- New file `open-review-items.md` in every ZIP.
- Embedded in the pack `README.md` open-items section.
- Appended to `next-steps-roadmap.md`.
- Machine-readable in `manifest.json` (`open_review_items`).

There is no full task-management system yet — these are static items
intended for the customer / lawyer / reviewer.

## 4 · PDF / DOCX (Batch 4) — printable HTML preview

Per the Phase 8 plan, we deferred a real PDF/DOCX renderer (no stable
serverless-safe renderer is in the codebase yet). We shipped:

- `buyer-review-packet.html` — a stand-alone printable HTML file
  inside every ZIP. Customers open it in any browser and use
  **Print → Save as PDF** to share a buyer-facing copy.
- `buyer-review-packet.md` — same content as Markdown.

Real `.pdf` / `.docx` export is documented as deferred until a stable
serverless renderer is chosen. The dashboard `Packs` page surfaces
this clearly: "Open the HTML in a browser and Print → Save as PDF for
a buyer-facing copy."

## 5 · Buyer Review Packet (Batch 5)

New module: `engine/src/buyer-review-packet.ts`. Builds both Markdown
and printable HTML versions of a clean buyer-facing summary.

Contents:

- AI use summary
- Disclosure summary
- Source / evidence summary
- Confidence band
- Open review items
- Legal review note
- Contact / support
- Standard disclaimer

Standard language used: "This packet is prepared for buyer / internal
/ legal review. This is not legal advice, certification, or a
compliance guarantee."

NOT a hosted public trust center. Distribution is via the existing
delivery ZIP only.

## 6 · Dashboard Pack Preview + Status Timeline (Batch 6)

`app/app/dashboard`:

- New `StatusTimeline.tsx` — renders 8 timeline states for an order
  (`Request received → Scope reviewed → Payment pending → Payment
  confirmed → Preparing evidence folder → QA checking → Pack ready →
  Download available`). Appends a `Manual review needed` state when
  the order has a failed payment or is in `failed_needs_retry`.
- `/dashboard/orders` — each order card now carries the timeline.
- `/dashboard/packs` — each pack card now carries the readiness score
  badge (recomputed on the server from `extraction_data` +
  `questionnaire_data` + `scope_check_*`) and a note explaining the
  Buyer Review Packet inside the ZIP.

New customer-data helpers in `app/lib/customer-data.ts`:
`buildOrderTimeline`, `getReadinessScoreForOrder`.

Customer empty states already exist (`EmptyState` primitive); the
Phase 8 surfaces inherit them.

## 7 · Framework SEO Landing Pages (Batch 7)

Eight new public pages, each built on the new shared
`FrameworkLanding` component:

- `/eu-ai-act-transparency-readiness`
- `/ai-disclosure-template`
- `/ai-governance-documents`
- `/soc2-readiness-evidence-pack`
- `/gdpr-ai-data-readiness`
- `/security-questionnaire-support`
- `/iso-42001-readiness`
- `/ai-agency-client-handoff`

Each page includes problem statement, audience, what we prepare, what
we do not guarantee, sample outputs, primary + secondary CTAs, FAQ,
and metadata via `buildPageMetadata`. All eight are added to
`PUBLIC_ROUTES` in `app/lib/seo.ts` so they appear in the sitemap.

These are not thin SEO pages — every page maps to an actual existing
or roadmap module and uses TrustFolder-safe language.

## 8 · Admin Reissue Download (Batch 8)

New endpoint: `POST /api/admin/orders/[id]/reissue-download`.

- Auth: admin session cookie.
- Generates a fresh 24-hour signed URL for the order's pack storage
  path and persists it on the order.
- Idempotent: does not regenerate or overwrite storage.
- Does not retrigger generation.

Why no retry button yet: the existing pipeline is retried by re-running
`runPipeline` from a server-side script with `is_retry: true`, but the
admin UI does not yet have a per-order detail page to host an action
button. Adding a button is a future improvement. Until then,
`docs/45-admin-rescue-sop.md` is the documented manual path.

## 9 · Verification

Automated (local):

- `npx tsc --noEmit` (app) — pass.
- `npm run build` (app) — pass (54 routes after Phase 8).
- `npm run typecheck` / `npm run build` (engine) — pass.
- Public-route + readiness + framework smokes — see
  `progress.txt` for run results.

Forbidden-phrase scan: clean on the public surface and module
starters.

## 10 · Known limitations

- Real PDF / DOCX export deferred to a future phase when a stable
  serverless renderer is chosen. Printable HTML inside the ZIP covers
  the immediate need.
- Readiness score on the dashboard is recomputed on each page render
  from order data; it is not persisted. This keeps the change
  database-migration-free, at the cost of an extra read per pack.
- Admin reissue endpoint is API-only; no UI button yet.
- Buyer Review Packet ships inside the ZIP; not a hosted public trust
  center.

## 11 · Safety boundaries preserved

- TrustFolder still prepares review-ready drafts and evidence
  material — never final compliance conclusions.
- Sensitive / high-risk modules remain expert-review intake-only
  (Phase 6 boundary unchanged).
- Engine QA still auto-fails high-risk template IDs that include
  final-conclusion language.
- Footer disclaimer present on every public surface, including the 8
  new framework pages.
