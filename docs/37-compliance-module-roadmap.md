# Compliance Module Roadmap

Status: planning document  
Scope: TrustFolder website and product roadmap copy  
Last updated: 2026-05-11

## Purpose

This roadmap defines how TrustFolder communicates and sequences current AI governance readiness work, planned compliance-readiness modules, and expert-review-only areas.

TrustFolder prepares review-ready drafts and evidence folders for B2B AI teams. It does not provide legal advice, certification, audit, accreditation, or a compliance guarantee. Final review belongs with qualified counsel, security reviewers, compliance specialists, and the customer’s internal team.

## Current supported scope

Current product scope is AI governance and transparency-readiness preparation for B2B AI companies, AI agencies, chatbot products, AI agent platforms, automation teams, and AI SaaS products preparing for buyer, internal, or legal review.

Current supported deliverables:

- AI disclosure drafts
- AI system / AI use summary
- Governance summary
- Evidence tracker
- Source notes
- Buyer / legal handoff notes
- 30-day readiness roadmap
- ISO 42001-inspired checklist support
- EU AI Act transparency-readiness notes

Current supported use cases:

- AI disclosure readiness
- AI governance documentation
- AI vendor / buyer review preparation
- AI evidence folder preparation
- Legal-review handoff preparation
- AI agency client handoff preparation

Current automation status:

- Website scan: automated with human-readable outputs
- Intake assessment: automated triage with safe routing
- Tier recommendation: automated, subject to scope rules
- Paid pack generation: supported for approved tiers only
- Founder or reviewer pass: required before delivery expectations are final

## Current package mapping

### Free Eligibility Check

Purpose: determine whether TrustFolder is likely to fit before the customer spends anything.

Outputs:

- Plain-English fit result
- Recommended next step
- Scope flags when expert review may be needed

Automation status: automated triage.

Safety notes: no documents are prepared at this step.

### AI Website Trust Snapshot

Purpose: short readiness snapshot for teams deciding whether to prepare a full pack.

Outputs:

- Website scan summary
- AI product overview
- Likely disclosure areas
- Readiness result with confidence band
- Recommended next steps

Automation status: request-led / founder-prepared.

### AI Disclosure Pack

Purpose: review-ready disclosure and transparency drafts for AI products.

Outputs:

- Chatbot / assistant disclosure
- AI-generated content notice
- AI system disclosure page
- Disclosure placement guide
- Internal transparency summary
- Legal-review note

Automation status: supported pack; checkout may be enabled only through approved free-check routing.

### Buyer-Ready AI Governance Folder

Purpose: evidence folder preparation for enterprise buyer review or internal AI governance review.

Outputs:

- AI system inventory
- Governance policy draft
- Disclosure documents
- Evidence tracker
- Risk notes
- Lawyer / buyer handoff
- 30-day governance roadmap

Automation status: supported pack; checkout may be enabled only through approved free-check routing.

### Enterprise Buyer Handoff

Purpose: hands-on cleanup for active enterprise procurement or high-stakes buyer review.

Outputs:

- Governance folder review
- Buyer-question cleanup
- Handoff walkthrough
- One revision round
- Optional advisor-supported review later

Automation status: application-only.

### Agency Pack

Purpose: repeatable client handoff materials for AI agencies and automation studios.

Outputs:

- Per-client folder template
- Agency master folder
- Client-handoff cover sheet
- Repeatable scoping checklist

Automation status: custom request-only.

## Planned compliance-readiness modules

These modules are roadmap items. They should not be added as checkout options, purchasable products, or generated deliverables until templates, QA checks, risk gates, disclaimers, and review workflows are complete.

### Priority 1: SOC 2 readiness evidence pack

Client-friendly positioning: helps organize security and AI governance evidence for buyer due-diligence preparation.

Potential templates:

- Security evidence request tracker
- AI vendor / model provider inventory
- Access control evidence checklist
- Incident response evidence checklist
- Vendor management evidence tracker
- Buyer questionnaire response draft support

Required QA checks:

- No audit or attestation language
- No certification claims
- Clear distinction between evidence organization and formal audit work
- Requires human review before delivery

Automation status: planned, not enabled.

Legal / expert review need: security compliance expert review before launch.

### Priority 2: GDPR AI/data readiness pack

Client-friendly positioning: helps organize AI and data-processing materials for privacy-review preparation.

Potential templates:

- AI data flow summary
- Personal data processing notes
- Controller / processor handoff questions
- DPA review checklist
- Data subject rights readiness notes
- Privacy notice update prompts

Required QA checks:

- No privacy-law conclusions
- No claims that customer data handling meets regulatory requirements
- Must route complex cross-border transfer, children’s data, or special-category data cases to expert review

Automation status: planned, not enabled.

Legal / expert review need: privacy specialist review before launch.

### Priority 3: Enterprise security questionnaire support

Client-friendly positioning: helps teams prepare draft answers and evidence pointers for buyer security questionnaires.

Potential templates:

- Questionnaire intake table
- Evidence pointer index
- AI system / vendor answer bank
- Open-question tracker
- Reviewer signoff checklist

Required QA checks:

- Draft-answer language only
- No unsupported security posture claims
- Must cite source notes or mark unknowns clearly

Automation status: planned, not enabled.

Legal / expert review need: security reviewer input before launch.

### Priority 4: DPA / privacy agreement handoff pack

Client-friendly positioning: helps organize intake and handoff materials before counsel reviews a DPA or privacy agreement.

Potential templates:

- DPA intake summary
- Processing-role question list
- Sub-processor tracker
- Data retention handoff notes
- Legal-review cover note

Required QA checks:

- No contract interpretation
- No negotiation advice
- Must instruct customer to use qualified counsel for agreement review

Automation status: planned, not enabled.

Legal / expert review need: counsel review before launch.

### Priority 5: Full ISO 42001 readiness pack

Client-friendly positioning: helps organize AI management system readiness materials and evidence for expert review.

Potential templates:

- AI management system inventory
- AI policy evidence tracker
- Role and responsibility matrix
- Risk management evidence checklist
- Human oversight procedure draft
- Monitoring and review cadence tracker

Required QA checks:

- Use only readiness language
- No certification language
- No claims of formal ISO assessment
- Must separate lightweight checklist support from full readiness pack

Automation status: planned, not enabled.

Legal / expert review need: AI governance specialist review before launch.

## Expert-review-only areas

The following areas are not eligible for standard automated packs. TrustFolder may organize intake and handoff materials, but the customer should be routed to qualified expert review, custom scope, or declined.

- HIPAA / healthcare data
- Medical AI
- Employment / hiring AI
- Financial services AI
- Insurance / credit decisioning
- Children’s products
- Biometrics
- Law enforcement
- Critical infrastructure
- Education grading or admissions

Expert-review handling rules:

- Do not generate standard packs automatically.
- Do not offer instant checkout for these areas.
- Provide a clear explanation in plain English.
- Where useful, help the customer understand what category of expert review may be needed.
- Keep all outputs framed as intake, organization, or handoff materials.

## Phase 6 module catalog update

Phase 6 expands the public request catalog to include:

- SOC 2 Readiness Evidence Pack
- Enterprise Security Questionnaire Support
- GDPR AI/Data Readiness Pack
- DPA / Privacy Agreement Handoff Pack
- ISO 42001 Readiness Pack
- HIPAA / Healthcare Data Intake Pack
- Medical AI Expert-Review Intake
- Employment / Hiring AI Expert-Review Intake
- Financial Services / Credit / Insurance AI Expert-Review Intake
- Children’s Products Expert-Review Intake
- Biometrics Expert-Review Intake
- Law Enforcement / Critical Infrastructure Intake

Phase 6 template scaffolds live under `templates/modules/`. Detailed outputs,
website wording, QA safety rules, review requirements, and the build order live
in `docs/38-compliance-module-expansion.md`.

All new Phase 6 modules are request-only or expert-review intake-only. They do
not add checkout and do not produce automated final compliance conclusions.

## Required launch checklist for any planned module

Before a planned module becomes available:

1. Define exact deliverables and what is out of scope.
2. Create templates with source-note sections and review prompts.
3. Add QA checks for unsafe phrases, unsupported claims, and missing disclaimers.
4. Add risk routing for expert-review-only areas.
5. Add website copy that clearly marks scope and limitations.
6. Add pricing only after product, legal, and operational review.
7. Run typecheck, build, and forbidden phrase checks.
8. Update progress notes and relevant docs.

## Copy rules

Preferred phrases:

- readiness documentation
- review-ready drafts
- evidence pack
- handoff materials
- supports preparation
- ISO 42001-inspired checklist
- EU AI Act transparency-readiness
- buyer due-diligence preparation
- requires expert review

Avoid claims that suggest guaranteed outcomes, certification, formal counsel guidance, audit completion, regulator approval, or that a customer meets every requirement of any specific framework.

## Current implementation boundary

This roadmap is copy and planning only. It does not implement new compliance templates, module generation, checkout, pricing, or purchasable products for planned or expert-review-only areas.
