# 48 — Competitor Audit Action Plan

Status: strategy doc. No code in this pass.
Scope: turn the competitor audit into a TrustFolder website + product +
module + safety plan.
Last updated: 2026-05-11

This doc summarizes what we learned from public-facing pages of six
competitors and proposes what TrustFolder should ship, in what order, and
where to hold the line. It is product input only — we do not copy
competitor copy, designs, assets, logos, or layouts.

TrustFolder remains an AI-governance readiness vendor. We help B2B AI
teams prepare review-ready drafts and evidence material for buyer,
internal, and legal review. We do not provide legal advice, certification,
audit, runtime monitoring, or a compliance guarantee.

---

## 1 · What we learned from competitors

### 1.1 VerifyWise

What stood out:

- Modular surface: separate modules for inventory, frameworks, policies,
  controls, evidence, and reports.
- Framework coverage shown plainly (EU AI Act, ISO 42001, NIST AI RMF).
- Source-and-evidence center concept: every claim points back to a piece
  of underlying evidence.
- Public AI trust center pattern: a shareable surface that an external
  buyer can read.
- Report generation framed as the deliverable, not the dashboard.
- Policy manager that organizes drafted policies with status.

TrustFolder takeaway: we already prepare governance drafts. The big
unlock is **traceability** ("here is the source for every line in the
pack") and **buyer-readable Trust Packet** (a clean shareable view).

### 1.2 Modulos

What stood out:

- AI inventory as the spine of the product.
- Lifecycle thinking: scoping → risk classification → evidence → release.
- EU AI Act risk-tier scoping flow.
- Audit-export packaging.
- Vendor / supplier registry tied to AI components.

TrustFolder takeaway: we should keep the AI use summary and AI inventory
front-and-center, and treat the **pack** as an audit-export artifact, not
just a folder. The vendor/supplier idea fits naturally into our
buyer/legal handoff.

### 1.3 OneTrust AI Governance

What stood out:

- ROI framing in marketing copy ("hours saved", "audits passed").
- Maturity journey storytelling (start → mature governance program).
- Heavy emphasis on inventory, risk tiering, and policy enforcement.
- Enterprise partner / certification proof.
- Page-level proof: case studies, testimonials, named brands.

TrustFolder takeaway: we are not OneTrust and should not pretend to be.
Their lessons for us are about **clarity of stages** (free check →
readiness pack → review handoff) and **proof on the page** (sample packs,
illustrative outputs, buyer-side wording). We should not claim
"replacement" or "enterprise GRC". We do borrow the idea of a clearly
illustrated maturity progression as plain-English text.

### 1.4 EQS AI Compliance / Privacy Cockpit

What stood out:

- EU AI Act risk education as the primary marketing magnet.
- Privacy/data overlap with AI compliance.
- Audit-ready documentation language.
- DPO-friendly content and tone (privacy reviewer framing).

TrustFolder takeaway: privacy reviewers and DPOs are real readers of our
packs. We should keep our copy neutral on legal claims, but speak more
clearly to the **DPO / privacy reviewer** persona on `/safety`,
`/examples`, and `/blog`. Our Phase 6 GDPR AI/data readiness pack and
DPA / privacy agreement handoff fit that persona directly.

### 1.5 Fiddler AI GRC

What stood out:

- Runtime risk language: bias, PII/PHI exposure, drift.
- Guardrails framing.
- Audit-evidence framing for runtime events.

TrustFolder takeaway: this is the most dangerous comparison surface,
because **we do not run runtime detection**. We must not borrow the
language. We can however acknowledge that buyers ask "how do you handle
bias / PII / drift?" and our pack helps customers prepare review-ready
answers and evidence pointers — without us claiming to detect anything.

### 1.6 Vanta

What stood out:

- Trust Center as the buyer-facing surface.
- Questionnaire automation as a marketing pillar.
- Integrations as proof of seriousness.
- Framework landing pages as SEO magnets (SOC 2, ISO, HIPAA, GDPR).
- Heavy customer proof, resource library, blog cadence.

TrustFolder takeaway: Vanta is not our target replacement, but the
**Trust Packet pattern**, the **questionnaire support pattern**, and
**framework landing pages** are all very compatible with our scope. We
should not claim to replace Vanta and we should not claim certification.

---

## 2 · TrustFolder action plan

### PART A — Website improvements

A1. Clearer "what documents we prepare" section.
- Surface the canonical document list (AI disclosure drafts, AI use
  summary, evidence tracker, governance summary, source notes, buyer /
  legal handoff, 30-day next-steps roadmap, ISO 42001-inspired checklist,
  EU AI Act transparency-readiness notes) on the homepage in one tight
  block.
- Keep "review-ready drafts" wording. No "compliant" / "certified".

A2. Platform layer section.
- Plain-English explanation of how a TrustFolder pack is assembled:
  intake → website scan → drafts → evidence tracker → handoff. Show this
  as a single, honest layer diagram in copy form.
- Frame TrustFolder as a "preparation layer", not a "platform" in the
  GRC sense.

A3. Readiness areas section.
- A grid of supported readiness areas (already exists as
  `ReadinessAreas`). Refresh copy to align with the Phase 6 module map.

A4. Compliance-readiness modules section.
- Three groups (already implemented in `ComplianceModulesBlock`):
  - Available readiness packs
  - Expert-review handoff packs
  - Sensitive / high-risk intake-only
- Add 1–2 line plain-English explanations for each module.

A5. Expert-review-only section.
- Make it visually clear which areas are intake-only.
- Reuse `ExpertReviewOnlyBlock` and tighten copy.

A6. Sample pack previews.
- Add illustrative sample previews on `/examples` for SOC 2 readiness
  evidence, security questionnaire, GDPR AI/data readiness, ISO 42001
  readiness, and the expert-review intake (already added in Phase 6).
- Every sample carries: "Illustrative sample. Not a real customer pack."

A7. Framework SEO landing page plan.
- New `/frameworks/<slug>` pages aligned with `docs/35` clusters:
  `/frameworks/eu-ai-act`, `/frameworks/iso-42001`, `/frameworks/soc-2`,
  `/frameworks/gdpr-ai`, `/frameworks/security-questionnaires`.
- Each page: what the framework asks for, what TrustFolder helps prepare,
  what is out of scope, and a CTA to `/request` or `/assessment`.
- Wording rule: never claim that following our pack makes a customer
  satisfy the framework.

### PART B — Product improvements

B1. Readiness score.
- A plain-English score (`Likely fit` / `Some review needed` / `Expert
  review required`) shown on the assessment result and on the customer
  dashboard once a pack is requested.
- The score never says the customer is or is not compliant.

B2. Source-to-document traceability.
- Each generated paragraph in a pack carries a small "source" reference
  back to: a website URL, an intake answer, or a reviewer note.
- Stored as data, rendered in the pack and in the customer dashboard.

B3. Open review items.
- A first-class "Open review items" list per pack. Items can be
  resolved by the customer or marked `expert-review required`.

B4. Customer dashboard timeline.
- A timeline view: requested → fit confirmed → pack drafting → QA pass
  → delivered. Mirrors what we show today in order status, but lifts it
  out of the email thread.

B5. Pack preview.
- A read-only HTML preview of the delivered pack, visible from the
  dashboard and exportable.

B6. PDF / DOCX export.
- Stable export of the pack contents for buyer/legal review.
- Keep markdown as the source of truth.

B7. Buyer-facing Trust Packet.
- A clean, shareable "Trust Packet" view (subset of the pack) that the
  customer can hand to a buyer/legal reviewer.
- No external publishing, no logos, no claims of certification.

B8. Expert-review intake flows.
- For HIPAA / medical / hiring / finance / children / biometric / law
  enforcement / critical infrastructure modules, an intake form that
  produces an intake summary and an expert-review handoff document only.

### PART C — Module roadmap

These are the modules and how we plan to evolve them. All modules stay
inside the Phase 6 safety boundary: readiness/intake/handoff only, no
final compliance conclusions.

C1. AI governance and disclosure readiness — already shipping.
- Continue iterating on the disclosure pack and governance folder.
- Add traceability and pack preview as the next quality jumps.

C2. Enterprise security questionnaire support.
- Request-only support pack.
- Internal: a question-bank format, evidence pointers, unknowns list,
  red/yellow/green confidence flags, buyer-response handoff.

C3. SOC 2 readiness evidence pack.
- Request-only readiness pack.
- Internal: control/evidence tracker, security checklist drafts,
  vendor/subprocessor evidence checklist, incident response readiness,
  buyer security review handoff, auditor/advisor review note. No SOC 2
  report, audit, or attestation language.

C4. GDPR AI/data readiness pack.
- Request-only readiness pack.
- Internal: AI data-use summary, processing summary, lawful-basis
  discussion prompts, retention/deletion checklist, subprocessor /
  vendor evidence, DPA / privacy review handoff. No GDPR compliance
  claim.

C5. ISO 42001 readiness pack.
- Request-only readiness pack.
- Internal: AI management system readiness checklist, AI policy draft,
  AI system inventory, risk/opportunity register, supplier/vendor AI
  review, monitoring and improvement log, internal governance handoff.
  No ISO 42001 certification language.

C6. DPA / privacy agreement handoff.
- Expert-review handoff. Intake + structured review inputs only.
- Never generate final legal agreements.

C7. Expert-review-only regulated modules.
- HIPAA / healthcare data, medical AI, employment / hiring AI,
  financial / credit / insurance AI, children's products, biometrics,
  law enforcement, critical infrastructure.
- Intake summary + expert-review handoff only. Engine QA enforces
  high-risk disclaimers and forbids final-conclusion language.

### PART D — What NOT to build or claim

D1. Do not claim compliance certification.
- We do not certify SOC 2, GDPR, HIPAA, ISO 42001, EU AI Act, or any
  other framework. Public copy must avoid "certified" and "compliant".

D2. Do not claim runtime monitoring.
- We do not monitor model output in production. We must not borrow the
  Fiddler-style runtime framing.

D3. Do not claim guardrails / bias / drift detection unless built.
- We may help customers prepare review-ready evidence about how they
  handle bias, PII, drift, and human oversight, but we must not claim
  detection capabilities we do not have.

D4. Do not claim to replace Vanta or OneTrust.
- Different category. We are a preparation layer for AI governance
  documents and review handoff. We do not run the GRC platform or trust
  center for the customer.

D5. Do not automate high-risk legal conclusions.
- For sensitive or regulated areas, outputs are intake summaries and
  expert-review handoffs only. Engine QA already auto-fails high-risk
  template IDs that include final-conclusion language.

---

## 3 · Prioritization

P0 — before production launch
- A1 — clearer what-documents-we-prepare section
- A4 — compliance-readiness modules section (Phase 6 catalog)
- A5 — expert-review-only section
- A6 — sample pack previews on `/examples`
- C1 — AI governance and disclosure readiness (current scope, hardened)
- D1, D2, D3, D4, D5 — safety boundaries codified in copy and QA

P1 — after launch
- A2 — platform layer section
- A3 — readiness areas refresh
- A7 — framework SEO landing pages (start with EU AI Act and SOC 2)
- B1 — readiness score on dashboard
- B4 — customer dashboard timeline
- B6 — PDF / DOCX export
- C2 — enterprise security questionnaire support
- C3 — SOC 2 readiness evidence pack
- C4 — GDPR AI/data readiness pack

P2 — later platform
- B2 — source-to-document traceability
- B3 — open review items
- B5 — pack preview
- B7 — buyer-facing Trust Packet
- B8 — expert-review intake flows
- C5 — ISO 42001 readiness pack
- C6 — DPA / privacy agreement handoff
- C7 — expert-review-only regulated modules (templates already exist as
  intake/handoff scaffolds)

P3 — do not build yet
- Runtime monitoring, guardrails, bias/drift/PII detection.
- Public Trust Center hosting (the buyer-facing Trust Packet at B7 is
  scoped to a shareable export, not a hosted public site).
- Vanta- or OneTrust-style integrations marketplace.
- Auto-published policies, auto-published disclosures, auto-published
  customer claims.
- Any final compliance conclusion or legal opinion automation.

---

## 4 · Acceptance rules

A change inspired by this audit is acceptable when:

1. It uses TrustFolder language ("readiness pack", "evidence pack",
   "review-ready drafts", "intake summary", "buyer/legal handoff",
   "expert-review handoff", "questionnaire support").
2. It does not assert that a customer satisfies any named law or
   framework.
3. It does not claim runtime detection or monitoring.
4. It does not borrow competitor copy, designs, asset, logos, or
   layouts.
5. It carries the standard disclaimer: not legal advice, not
   certification, not a compliance guarantee.
6. It routes sensitive / regulated areas to expert review and does not
   produce final compliance conclusions for those areas.
