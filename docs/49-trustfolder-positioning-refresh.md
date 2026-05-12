# 49 — TrustFolder Positioning Refresh

Status: positioning doc. Strategy/copy only — no code in this pass.
Pairs with `docs/01` (brand language rules), `docs/14-DESIGN.md` §12
(forbidden phrases), `docs/35-seo-content-strategy.md` (SEO clusters),
`docs/37-compliance-module-roadmap.md`, `docs/38-compliance-module-expansion.md`,
and `docs/48-competitor-audit-action-plan.md`.
Last updated: 2026-05-11

## 1 · Positioning statement

TrustFolder is the fastest way for B2B AI companies to turn their website
and product details into review-ready AI governance documents.

This positioning is the load-bearing line. Every public page should be
consistent with it. It does not promise compliance, certification,
audit, regulator approval, or any legal outcome.

## 2 · Core copy

We prepare the documents your buyer or legal team will ask for: AI
disclosure drafts, AI use summaries, governance notes, evidence
trackers, source notes, and buyer/legal handoff packs.

Use this exact phrasing (or a close paraphrase that keeps the same
shape) on:

- Homepage hero subhead.
- `/pricing` lede.
- `/request` lede.
- `/blog` index lede.
- `/contact` lede.

## 3 · What TrustFolder is, in one paragraph

TrustFolder is a preparation layer for B2B AI teams. We read your AI
product website with you, capture a few details about your AI use, and
prepare review-ready drafts and evidence material for buyer, internal,
and legal review. We support AI governance and transparency-readiness
preparation. We are not legal advice, not certification, and not a
compliance guarantee.

## 4 · Audience and trigger moments

Primary audience:

- Founders and operators at B2B AI SaaS companies.
- AI agency operators delivering chatbots, agents, and automation
  projects.
- Heads of compliance, legal, or security at small-to-mid AI teams who
  need a faster way to prepare buyer review.
- DPOs and privacy reviewers asking for clear AI documentation from
  vendors.

Trigger moments:

- Enterprise procurement is asking for AI documentation.
- A buyer security questionnaire just landed.
- Legal review is starting and the AI disclosure is unclear.
- The team is preparing for a renewal where AI is now a topic.
- A DPO is asking for a GDPR AI/data summary or DPA review inputs.
- Internal AI governance cleanup ahead of a board or audit conversation.

## 5 · Promise and boundary

We promise:

- Review-ready drafts and evidence material, not raw scraped content.
- A clear scope for what we prepared and what we did not.
- A safe out-of-scope answer for sensitive or regulated areas.
- Founder-reviewed delivery for paid packs.
- Plain-English next steps after the free check or after a delivered
  pack.

We do not promise:

- Compliance with any law, framework, or standard.
- Certification, audit, or regulator approval.
- Replacement of qualified counsel, security reviewers, privacy
  reviewers, or expert advisors.
- Runtime detection, runtime monitoring, guardrails, bias detection,
  PII/PHI detection, or model drift detection.
- Final compliance conclusions for high-risk or regulated AI use cases.

## 6 · Allowed and forbidden language

Allowed:

- "Readiness pack", "evidence pack", "review-ready drafts".
- "Intake summary", "buyer/legal handoff", "expert-review handoff".
- "Questionnaire support".
- "Supports EU AI Act transparency-readiness documentation".
- "Prepares review-ready AI governance drafts".
- "Organizes evidence for buyer, legal, and internal review".
- "ISO 42001-inspired checklist support".
- "Not legal advice", "not certification", "not a compliance guarantee".

Forbidden:

- "Fully compliant", "compliance guaranteed", "guaranteed compliance".
- "Certified", "ISO 42001 certified", "SOC 2 certified",
  "GDPR compliant", "HIPAA compliant", "EU AI Act compliant".
- "Audit-proof", "regulator-ready".
- "No lawyer needed".
- "100% autonomous compliance", "skip legal review",
  "complete compliance solution".
- "Buy now" as a CTA on the public marketing surface.
- Anything that asserts the customer's risk class or legal status
  ("you are limited risk", "you are a deployer", etc.).

These are also enforced by `engine/src/qa.ts` and the high-risk module
guardrails added in Phase 6.

## 7 · Public surface alignment

The positioning lands on each page as follows:

`/` — what we prepare, what readiness areas we support, the Phase 6
module catalog, the safety boundary, and FAQ.

`/pricing` — packs, what each pack includes, request-only modules, no
checkout for new modules, and FAQs.

`/request` — pack interest selector across all 12 Phase 6 modules,
supporting copy that matches each interest, and the founder-reviewed
timeline.

`/safety` — what we do, what we do not do, out-of-scope verticals,
expert-review-only routing, and the standard disclaimer.

`/examples` — illustrative samples, including the Phase 6 module
examples, each labelled as fictional.

`/agencies` — agency handoff use case, no certification claim.

`/blog` — readiness guides aligned with `docs/35` clusters.

`/contact` — partner / advisor / press / support contact paths.

## 8 · Differentiation versus the competitive surface (audit summary)

We are not VerifyWise, Modulos, OneTrust AI Governance, EQS, Fiddler AI
GRC, or Vanta. Each of those targets a larger or different surface
(GRC platform, AI lifecycle, runtime monitoring, trust center hosting).

TrustFolder targets a narrower job: turn the AI product website and
intake into review-ready AI governance documents and evidence
material, fast, and route sensitive areas to expert review. We do not
claim feature parity with any competitor and we do not claim to
replace any of them. Details and the resulting product / website /
module / safety plan live in `docs/48-competitor-audit-action-plan.md`.

## 9 · Implementation boundary

This document is positioning and copy guidance only. It does not
introduce new features, modules, checkout flows, generation logic, or
QA rules. Code changes that follow this positioning go through the
normal Phase 6 safety review and forbidden-phrase scan.
