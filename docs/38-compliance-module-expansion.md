# 38 — Compliance-Readiness Module Expansion

Status: Phase 6 implementation reference  
Scope: public copy, request-only module catalog, template scaffolds, QA safety rules  
Last updated: 2026-05-11

## Positioning

TrustFolder prepares compliance-readiness documents, evidence packs, intake summaries, questionnaire support, buyer/legal handoff, and expert-review handoff material.

TrustFolder does not provide legal advice, certification, audit reports, regulator approval, or a compliance guarantee. Sensitive or regulated areas are routed to expert review and are not handled as automated compliance packs.

## Module catalog

| Module | Public status | Automation boundary |
|---|---|---|
| AI governance and disclosure readiness | Available readiness pack | Existing AI governance flow |
| SOC 2 Readiness Evidence Pack | Readiness pack, request-only | No report, audit, or certification output |
| Enterprise Security Questionnaire Support | Support pack, request-only | Draft answers require company review before submission |
| GDPR AI/Data Readiness Pack | Readiness pack, request-only | Privacy/legal review required before use |
| DPA / Privacy Agreement Handoff Pack | Expert-review handoff | Review inputs only; no final legal agreements |
| ISO 42001 Readiness Pack | Readiness pack, request-only | Readiness folder only; no certification output |
| HIPAA / Healthcare Data Intake Pack | Expert-review only | Intake and handoff only |
| Medical AI Expert-Review Intake | Expert-review only | No automated compliance conclusions |
| Employment / Hiring AI Expert-Review Intake | Expert-review only | No automated hiring AI compliance pack |
| Financial / Credit / Insurance AI Expert-Review Intake | Expert-review only | No automated compliance conclusions |
| Children’s Products Expert-Review Intake | Expert-review only | Intake and handoff only |
| Biometrics Expert-Review Intake | Expert-review only | Intake and handoff only |
| Law Enforcement / Critical Infrastructure Intake | Expert-review only | Intake and handoff only |

## Outputs by module

### SOC 2 Readiness Evidence Pack

- SOC 2 readiness summary
- Control/evidence tracker
- Security policy draft checklist
- Access control evidence checklist
- Vendor/subprocessor evidence checklist
- Incident response readiness checklist
- Availability/backup evidence checklist
- Confidentiality/privacy evidence checklist
- Buyer security review handoff
- Auditor/advisor review note

Disclaimer: this is not a SOC 2 report, audit, or certification.

### Enterprise Security Questionnaire Support

- Questionnaire answer draft
- Evidence/source map
- Unknowns list
- Red/yellow/green confidence flags
- Supporting-doc checklist
- Follow-up questions for customer/security team
- Buyer-response handoff

Disclaimer: answers must be reviewed by the company’s security/legal owner before submission.

### GDPR AI/Data Readiness Pack

- Data processing summary draft
- AI data-use summary
- Personal data intake checklist
- Lawful-basis discussion prompt
- Data retention/deletion checklist
- Subprocessor/vendor evidence tracker
- DPA/privacy review handoff
- User-rights readiness checklist
- GDPR review note

Disclaimer: this is not legal advice or a certification output.

### DPA / Privacy Agreement Handoff Pack

- Processing activity summary
- Subprocessor list draft
- Data categories summary
- Transfer/hosting notes
- Security measures summary
- Open legal questions
- Counsel review handoff

Disclaimer: do not generate final legal agreements. Prepare review inputs only.

### ISO 42001 Readiness Pack

- AI management system readiness checklist
- AI policy draft
- AI system inventory
- Risk/opportunity register
- Human oversight notes
- Supplier/vendor AI review checklist
- Monitoring and improvement log
- Internal governance handoff
- Certification-readiness gaps note

Disclaimer: this is not ISO 42001 certification.

### HIPAA / Healthcare Data Intake Pack

- PHI/ePHI intake summary
- Covered entity/business associate question set
- Safeguard evidence checklist
- Data flow summary
- Vendor/BAA evidence checklist
- Expert-review handoff

Rules: no automated final pack. Do not claim that HIPAA requirements are met. Route to expert review.

### Medical AI Expert-Review Intake

- Medical AI intake summary
- Intended-use summary
- User/risk context summary
- Clinical decision-support flag
- Expert-review handoff

Rules: no automated compliance conclusions.

### Employment / Hiring AI Expert-Review Intake

- Employment AI intake summary
- Decision-impact checklist
- Candidate/employee exposure summary
- Human oversight summary
- Expert-review handoff

Rules: no automated hiring AI compliance pack.

### Financial / Credit / Insurance AI Expert-Review Intake

- Regulated decisioning intake
- Affected-user summary
- Decision-impact summary
- Data-use summary
- Human review summary
- Expert-review handoff

Rules: no automated compliance conclusions.

### Children’s Products Expert-Review Intake

- Child-user intake summary
- Data collection summary
- Parental/guardian flow checklist
- Risk flags
- Expert-review handoff

### Biometrics Expert-Review Intake

- Biometric-use intake summary
- Data type summary
- User notice/consent prompt list
- Storage/retention evidence checklist
- Expert-review handoff

### Law Enforcement / Critical Infrastructure Intake

- High-risk intake summary
- Use-case context
- Impacted-user summary
- Risk flags
- Expert-review handoff

## Forbidden claims

Do not claim:

- Full legal compliance
- Certification or accreditation
- Audit immunity or guaranteed audit results
- Regulator approval
- A legal guarantee
- That no lawyer is needed
- That a sensitive product is safe to deploy without expert review
- Final compliance conclusions for high-risk modules

## Required safety language

Use the following language where relevant:

- Readiness pack
- Evidence pack
- Review-ready drafts
- Intake summary
- Buyer/legal handoff
- Expert-review handoff
- Questionnaire support
- Not legal advice
- Not certification
- Not a compliance guarantee
- Expert review required
- Draft/intake only

## Website wording

Homepage section title:

Compliance-readiness modules for AI teams.

Homepage copy:

TrustFolder currently prepares AI governance and disclosure readiness documents. We are expanding into adjacent evidence packs for security, privacy, vendor review, and expert-review handoffs.

Disclaimer:

Some modules produce readiness drafts and evidence checklists. Sensitive or regulated areas are routed to expert review and are not handled as automated compliance packs.

Pricing rule:

New Phase 6 modules are request-only or apply-only. Do not add checkout.

## Template folder map

- `templates/modules/soc2-readiness/`
- `templates/modules/security-questionnaire/`
- `templates/modules/gdpr-ai-data-readiness/`
- `templates/modules/dpa-privacy-handoff/`
- `templates/modules/iso42001-readiness/`
- `templates/modules/hipaa-healthcare-intake/`
- `templates/modules/medical-ai-intake/`
- `templates/modules/employment-ai-intake/`
- `templates/modules/financial-credit-insurance-intake/`
- `templates/modules/childrens-products-intake/`
- `templates/modules/biometrics-intake/`
- `templates/modules/law-enforcement-critical-infrastructure-intake/`

Each module folder includes:

- `README.md`
- `intake.md`
- `outputs.md`
- `qa-rules.md`
- `disclaimers.md`

## Future build order

1. Stabilize public request copy and module options.
2. Review P1 templates with a qualified advisor.
3. Add internal admin tagging for module requests if needed.
4. Add manual delivery process for SOC 2, security questionnaire, GDPR AI/data, and ISO 42001 readiness packs.
5. Add guarded automation only after QA rules and reviewer workflow are tested.
6. Keep expert-review-only modules as intake/handoff unless qualified reviewers approve a custom workflow.

## Legal/advisor review requirements

Required before any module becomes a paid deliverable:

- Security reviewer for SOC 2 readiness and questionnaire support.
- Privacy reviewer for GDPR AI/data and DPA/privacy handoff.
- AI governance reviewer for ISO 42001 readiness.
- Qualified healthcare, medical device, employment, financial services, children’s privacy, biometric, public-sector, or infrastructure specialist for expert-review-only modules.

## Implementation boundary

Phase 6 adds public request paths, template scaffolds, docs, SEO strategy, and QA safety rules. It does not add checkout, automated final compliance generation, legal agreement generation, certification outputs, or high-risk compliance conclusions.
