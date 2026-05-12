---
template_id: t1-07-ai-usage-policy-summary
title: Internal AI Usage Policy Summary
tier: 1
article_50_reference: 50 (governance support)
iso_42001_reference: A.2 (AI policies)
generated_when: ALWAYS — every Tier 1 customer gets this
confidence_bands_applicable: [CLEAR, REVIEW]
version: 0.9
last_updated: 2026-05-08
---

# Internal AI Usage Policy Summary Template

## AI engine instructions

Generate a short (1-2 page) internal AI use policy summary for the customer's team. This is NOT a full corporate AI policy — that's in the Tier 2 `t2-06-ai-policy-draft.md` template. This Tier 1 version is a one-page summary suitable for posting in employee handbooks, vendor onboarding materials, or as an attachment to vendor questionnaires.

**Inputs needed:**
- `{{ company_name }}`
- `{{ ai_systems[] }}` — features customer has
- `{{ ai_role }}` — provider / deployer / both
- `{{ governance_contact }}`
- `{{ has_eu_customers }}` — bool

**Confidence band:** CLEAR for typical B2B SaaS. REVIEW if customer has unusual AI uses requiring custom policy.

**Output formats:** Markdown, PDF (for handbook attachment), plain text.

---

## Customer-facing content (markdown)

# {{ company_name }} — AI Usage Policy Summary

**Effective date:** {{ generation_date }}  
**Owner:** {{ governance_contact }}  
**Audience:** All employees, contractors, and vendors of {{ company_name }}

---

## Why this policy exists

{{ company_name }} uses AI in our products and operations. This policy summarizes our principles and guardrails so that:

- Our customers can rely on consistent practices across our products
- Our employees know what is expected when building or using AI
- Our vendors and partners understand our AI governance posture
- Our regulators and buyers can review a clear policy summary

This is a SUMMARY. The full policy and procedures live in our internal AI Management System documentation (aligned with ISO/IEC 42001 practices) and in the EU AI Act-aligned governance pack maintained at {{ governance_contact }}.

## Our principles

1. **Transparency.** We disclose where and how we use AI in our products. We disclose to users that they are interacting with AI when they are.
2. **Human oversight.** Decisions that materially affect individuals are reviewed by humans, not made solely by AI.
3. **Risk-aligned use.** We use AI only for purposes appropriate to its risk level. We do NOT use AI for prohibited practices under Article 5 of the EU AI Act.
4. **Data minimization.** We process the minimum data necessary for AI features, and we apply our existing data protection practices.
5. **Accountability.** We maintain records of which AI features exist, what they do, who is responsible for them, and how they perform.
6. **Continuous improvement.** We track regulatory developments, customer feedback, and AI system performance, and we update our practices accordingly.

## What this means in practice

### When building AI features

Engineers, product managers, and designers must:
- Add new AI features to our internal AI system inventory
- Specify the purpose, the data used, the AI model used, and the user-facing disclosure
- Confirm the use case is NOT in a prohibited or out-of-scope category
- Implement the appropriate Article 50 transparency obligations
- Document confidence/uncertainty information for outputs that affect users

### When using AI internally (employee tools)

Employees may use AI tools (e.g., LLM assistants, AI coding tools) for productivity, subject to:
- Not entering customer personal data into third-party AI tools that are not approved by {{ company_name }}
- Not entering confidential code, financial data, or unreleased product information into unapproved tools
- Treating AI outputs as drafts requiring human review before action
- Disclosing AI assistance where appropriate (e.g., in code review, in research outputs)

### When evaluating vendor AI tools

Procurement and engineering must:
- Conduct AI vendor due diligence using {{ company_name }}'s vendor questionnaire
- Confirm the vendor is not subject to outstanding regulatory enforcement
- Understand what data the vendor receives and how it is used
- Document the vendor relationship in our AI system inventory

### When responding to customer or regulator inquiries

Customer-facing teams must:
- Direct AI governance questions to {{ governance_contact }}
- Not make claims of "compliance" or "certification" not supported by our actual posture
- Use the canonical disclaimers from our public AI disclosure page
- Escalate to the AI governance lead for questions outside standard scripts

## Prohibited uses

{{ company_name }} prohibits use of AI — by employees, in our products, or by vendors acting on our behalf — for:

- Social scoring of natural persons
- Subliminal or manipulative techniques causing material harm
- Exploitation of vulnerabilities (age, disability, social or economic status)
- Real-time remote biometric identification in public spaces
- Untargeted scraping of facial images for biometric databases
- Workplace or educational emotion recognition
- Biometric categorization on prohibited sensitive attributes (race, political opinions, trade union membership, religious or philosophical beliefs, sex life, sexual orientation)
- Predictive policing solely based on profiling
- Any use that violates applicable laws

This list mirrors Article 5 of the EU AI Act and may be expanded based on our internal risk assessments.

## Roles and responsibilities

| Role | Responsibility |
|---|---|
| AI Governance Lead | Maintains this policy, AI system inventory, and risk register; approves new AI features |
| Engineering | Builds AI features per policy; implements technical controls |
| Product | Defines AI use cases per principles; ensures user-facing disclosures |
| Privacy / DPO (if applicable) | DPIAs and GDPR alignment for AI features |
| Legal | Reviews novel AI uses, regulatory changes, and high-impact decisions |
| Security | Implements security controls for AI systems and data |
| Customer Success | Handles AI governance questions from customers |
| Procurement | Conducts AI vendor due diligence |

For {{ company_name }}'s specific assignments, see the AI System Inventory.

## How this policy is maintained

- **Reviewed:** At least annually, and on material regulatory changes
- **Updated:** When new AI features are added, when the EU AI Act or related regulations change, or when material incidents occur
- **Owned by:** {{ governance_contact }}

## Questions?

Contact {{ governance_contact }} for any policy interpretation or AI governance question.

---

## Confidence band: {{ confidence_band }}

{{ #if confidence_band == "CLEAR" }}
**Likely fits standard B2B AI SaaS use cases.** This policy summary is suitable for general internal use; the full Tier 2 AI Policy Draft (`t2-06`) is recommended for organizations needing deeper governance documentation.
{{ /if }}

{{ #if confidence_band == "REVIEW" }}
**Requires legal/compliance review.** Your AI uses may need policy provisions beyond this summary. Review with qualified counsel before adoption.
{{ /if }}

---

## Disclaimer

This policy summary is generated by TrustFolder for preparatory and informational purposes. It is an AI-generated draft based on advisor-reviewed templates and the information you provided. It does not constitute legal advice, certification, or guaranteed compliance with the EU AI Act, ISO/IEC 42001, GDPR, or other applicable regulations.

Always review this policy with qualified legal counsel and adapt it to your organization's specific governance, before adoption. Regulatory requirements change — see https://trustfolder.com/regulatory-watch for current status.

---

## Sources

- EU AI Act (Regulation (EU) 2024/1689), Articles 5, 50
- ISO/IEC 42001:2023, Annex A.2 (AI policies)
- https://eur-lex.europa.eu/eli/reg/2024/1689/oj

---

*Generated by TrustFolder · v0.9 master template · {{ generation_date }}*
