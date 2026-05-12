---
template_id: t2-06-ai-policy-draft
title: Internal AI Policy (full draft)
tier: 2
iso_42001_reference: A.2 (Policies for AI), Clause 5.2
ai_act_reference: Governance support, Article 26 (deployer obligations)
generated_when: ALWAYS — every Tier 2 customer gets this
confidence_bands_applicable: [CLEAR, REVIEW]
version: 0.9
last_updated: 2026-05-08
---

# Internal AI Policy Template (Full Draft)

## AI engine instructions

Generate a full internal AI policy for the customer — distinct from the Tier 1 summary (`t1-07`). This is the comprehensive policy document suitable for:
- Posting in employee handbooks
- Sharing with auditors
- Attaching to vendor questionnaires
- Submitting to enterprise buyer review

**Inputs needed:**
- `{{ company_name }}`
- `{{ ai_systems[] }}`
- `{{ ai_role }}`
- `{{ third_party_models[] }}`
- `{{ has_eu_customers }}`
- `{{ governance_contact }}`
- `{{ ceo_or_top_management_name }}`
- `{{ effective_date }}`

**Confidence band:** CLEAR for standard policy. REVIEW if customer has unusual AI uses requiring custom provisions.

**Output formats:** Markdown (canonical), PDF (for handbook), DOCX (for legal review).

---

## Customer-facing content (markdown)

# {{ company_name }} · AI Policy

**Effective date:** {{ effective_date }}  
**Owner:** {{ governance_contact }}  
**Approved by:** {{ ceo_or_top_management_name }}  
**Review cadence:** Annually (or on material change)  
**Version:** 1.0 (initial draft via TrustFolder Tier 2 pack)

---

## 1. Purpose

This policy establishes {{ company_name }}'s principles, requirements, and governance for the development, deployment, and use of artificial intelligence (AI) systems. It applies to all employees, contractors, and vendors of {{ company_name }} and to all AI systems we develop, deploy, or substantially configure.

The policy supports our objectives of:
- Operating AI responsibly and in accordance with applicable law
- Earning and keeping the trust of our customers, employees, and partners
- Aligning with the EU AI Act (Regulation (EU) 2024/1689) and ISO/IEC 42001:2023
- Sustaining good practice as regulations and customer expectations evolve

## 2. Scope

This policy applies to:
- All AI systems listed in {{ company_name }}'s AI System Inventory (TrustFolder template `t2-01`)
- All employees, contractors, and vendors interacting with those systems
- All third-party AI tools used internally for {{ company_name }} work
- All AI features in our products, regardless of whether they are developed in-house or built on third-party models

## 3. Principles

{{ company_name }} commits to the following principles:

### 3.1 Lawfulness
We use AI only for lawful purposes. We do not use AI for any practice prohibited under Article 5 of the EU AI Act, including:
- Subliminal or manipulative techniques causing material harm
- Exploitation of vulnerabilities (age, disability, social or economic status)
- Social scoring of natural persons
- Real-time remote biometric identification in public spaces (with limited law-enforcement exceptions)
- Untargeted scraping of facial images for biometric databases
- Workplace or educational emotion recognition
- Biometric categorization on prohibited sensitive attributes (race, political opinions, trade union membership, religious or philosophical beliefs, sex life, sexual orientation)
- Predictive policing solely based on profiling

### 3.2 Transparency
We disclose to users that they are interacting with AI systems, mark AI-generated content, and explain (in plain language) where AI is used in our products. Our public AI disclosure page is the canonical statement of our practices.

### 3.3 Human oversight
For AI systems whose outputs materially affect users or {{ company_name }}'s operations, humans remain responsible. Procedures specifying oversight measures per system are maintained in TrustFolder template `t2-07` (Human Oversight Procedure).

### 3.4 Risk-aligned governance
We classify each AI system by EU AI Act risk tier and apply governance proportionate to that tier. We maintain an AI risk register (in our evidence tracker) and review it on a defined cadence.

### 3.5 Data minimization and protection
We process the minimum data necessary for AI features. AI processing complies with our existing data protection practices (GDPR for EU data, applicable local laws elsewhere). We conduct DPIAs where required.

### 3.6 Accountability
We maintain records — inventory, risk register, vendor reviews, incidents — sufficient to demonstrate our governance to customers, auditors, and regulators.

### 3.7 Continuous improvement
We track regulatory developments, customer feedback, vendor changes, and our own performance, and we update our practices accordingly.

## 4. Roles and responsibilities

| Role | Responsibility |
|---|---|
| Top management ({{ ceo_or_top_management_name }} and direct reports) | Approve this policy; provide resources for AI governance; accountable for AIMS effectiveness |
| AI Governance Lead ({{ governance_contact }}) | Maintain this policy and the AI System Inventory; coordinate AI governance activities; central point of contact for AI questions internally and externally |
| Engineering | Implement technical controls; build AI features per this policy; maintain technical documentation |
| Product | Define AI use cases per principles; ensure user-facing disclosures are implemented |
| Privacy / DPO (if applicable) | Conduct DPIAs for AI systems; ensure GDPR alignment |
| Legal | Review novel AI uses; track regulatory changes affecting policy; review high-impact decisions |
| Security | Implement security controls for AI systems and data |
| Customer Success / Sales | Handle AI governance questions from customers per scripts; escalate to {{ governance_contact }} where appropriate |
| Procurement | Conduct AI vendor due diligence |
| All employees | Comply with this policy; report concerns through the channels in §11 |

## 5. AI system lifecycle requirements

### 5.1 New AI features
Before a new AI feature enters production, the responsible team must:
1. Add it to the AI System Inventory (`t2-01`)
2. Classify its risk per the EU AI Act tier framework (`t2-03`)
3. Confirm it does NOT fall in a prohibited or out-of-scope category
4. Implement applicable Article 50 transparency obligations
5. Specify the human oversight approach (`t2-07`)
6. Conduct a DPIA if personal data is involved at material scale
7. Document the underlying model(s), data flows, and intended use
8. Get sign-off from the AI Governance Lead

### 5.2 Material changes to existing AI features
A "material change" includes a new model, a new use case, a new data flow, or a change in user-facing behavior. Material changes require:
1. Update of the inventory record within 30 days
2. Re-classification (if the change affects risk)
3. Re-assessment of oversight and disclosure
4. Logging of the change in the evidence tracker

### 5.3 Retirement of AI features
Retired AI features should be:
1. Marked "retired" in the inventory with the retirement date
2. Confirmed removed from production
3. Logged in the evidence tracker
4. Reviewed for residual data retention obligations

## 6. Use of third-party AI tools

### 6.1 Approved tools
{{ company_name }} maintains a list of approved third-party AI tools (e.g., LLM coding assistants, AI productivity tools). The list is maintained by the AI Governance Lead.

### 6.2 Conditions of use
When using any AI tool — approved or otherwise:
- Do NOT input customer personal data into tools that have not been approved for that purpose by {{ company_name }}
- Do NOT input confidential code, financial data, unreleased product information, or trade secrets into unapproved tools
- Treat AI outputs as drafts requiring human review before action
- Disclose AI assistance where appropriate (in code review, in research outputs, in customer-facing communications)
- Respect the AI tool's terms of use

### 6.3 New tool requests
Employees should request AI tool approvals through {{ governance_contact }}. The approval process includes a vendor questionnaire (TrustFolder template `t2-08`).

## 7. Customer-facing AI features

### 7.1 Article 50 transparency
For each customer-facing AI feature, {{ company_name }} ensures that the relevant Article 50 transparency obligation is implemented before launch:
- Article 50(1) — disclose AI interaction to users
- Article 50(2) — mark AI-generated content (machine-readable + human-readable)
- Article 50(3) — disclose AI-generated public-interest text (deployer responsibility for those publishing)
- Article 50(4) — disclose deepfakes
- Article 50(5) — emotion recognition / biometric categorization disclosure (in permitted contexts only)

### 7.2 Public AI disclosure page
{{ company_name }} maintains a public AI disclosure page at {{ company_url }}/ai-use (or equivalent), which is updated whenever AI features change.

### 7.3 Customer rights and inquiries
Customers may request:
- Information about which features use AI
- Opt-out of AI-powered features (where alternatives exist)
- Human review of AI-assisted decisions affecting them
- Data subject rights under GDPR (where applicable)

Inquiries are handled within [target turnaround] days by [responsible team], escalated to {{ governance_contact }} for novel questions.

## 8. Vendor and supply-chain governance

### 8.1 Due diligence
For any vendor providing or supporting AI capability used by {{ company_name }}, the AI Governance Lead (with Procurement) conducts due diligence including:
- Vendor questionnaire (`t2-08`)
- Data Processing Agreement (where applicable)
- Vendor's stated AI governance posture
- Independent assessments where available (SOC 2, ISO 27001, ISO 42001, etc.)
- Incident history

### 8.2 Ongoing monitoring
Approved vendors are reviewed at least annually. Material vendor changes (acquisition, security incident, governance policy change) trigger off-cycle review.

## 9. Incident handling

### 9.1 What is an AI incident
For this policy, an AI incident includes any event in which an AI system:
- Causes or risks material harm to a person
- Produces materially incorrect or biased output that reaches a customer or end-user
- Operates outside its intended use
- Is implicated in a security or privacy incident

### 9.2 Incident response
On discovery, the responsible team must:
1. Notify {{ governance_contact }} within 24 hours
2. Contain the incident (e.g., disable the affected feature)
3. Log the incident in the evidence tracker (`t2-05`)
4. Assess severity and notify legal/privacy where applicable
5. Conduct root-cause analysis for severity Med+ incidents
6. Implement corrective and preventive actions
7. Notify customers, vendors, or regulators where required by contract or law
8. Close the incident with a written summary

### 9.3 Regulatory reporting
For high-risk AI systems (currently outside our v1 scope) under the EU AI Act, certain serious incidents must be reported to regulators per Article 73. {{ company_name }}'s legal team is responsible for any such reporting.

## 10. Training and awareness

{{ company_name }} provides:
- AI governance awareness training to all employees on onboarding and at least annually
- Role-specific training for engineers, product, customer success, and procurement
- Materials covering this policy, the inventory, the risk classification framework, and incident reporting
- Tracking of training completion in the evidence tracker

## 11. Reporting concerns

Employees, contractors, vendors, and customers may report AI governance concerns to:
- {{ governance_contact }} (email)
- [Anonymous reporting channel if available]
- [HR or ethics hotline if available]

Concerns are reviewed promptly. Retaliation against reporters is prohibited.

## 12. Policy maintenance

This policy is:
- Reviewed at least annually by {{ governance_contact }}
- Updated upon material regulatory change, material incident, or material business change
- Approved by {{ ceo_or_top_management_name }} (or delegate)
- Versioned with effective dates

Material changes are communicated to all employees within 30 days.

## 13. Related documents

- AI System Inventory (`t2-01`)
- Provider/Deployer Memo (`t2-02`)
- Risk Classification Memo (`t2-03`)
- ISO 42001 Readiness Checklist (`t2-04`)
- Evidence Tracker (`t2-05`)
- Human Oversight Procedure (`t2-07`)
- Vendor Questionnaire (`t2-08`)
- Lawyer Handoff Pack (`t2-09`)
- 30-Day Governance Roadmap (`t2-10`)
- Public AI Disclosure Page (`t1-06`)

## 14. Definitions

- **AI system** — as defined in Article 3(1) of the EU AI Act
- **Provider** — as defined in Article 3(3) of the EU AI Act
- **Deployer** — as defined in Article 3(4) of the EU AI Act
- **Material change** — see §5.2
- **High-risk AI system** — as defined in Article 6 / Annex III
- **Limited-risk AI system** — AI systems subject to Article 50 transparency obligations
- **Minimal-risk AI system** — AI systems with no specific AI Act obligations

---

## Confidence band: {{ confidence_band }}

{{ #if confidence_band == "CLEAR" }}
**Standard B2B AI SaaS policy template, applied to {{ company_name }}'s context.** Suitable as a v1 policy after {{ company_name }}'s leadership review.
{{ /if }}

{{ #if confidence_band == "REVIEW" }}
**Requires legal/compliance review.** {{ company_name }}'s AI uses include features requiring custom policy provisions (e.g., novel AI applications, sector-specific rules). Bring this draft to qualified counsel before adoption.
{{ /if }}

---

## Disclaimer

This AI policy is generated by TrustFolder for preparatory and informational purposes. It is an AI-generated draft. It does not constitute legal advice, certification, or guaranteed compliance with the EU AI Act, ISO/IEC 42001, GDPR, or other applicable regulations.

Always have this policy reviewed by qualified legal counsel and adapted to {{ company_name }}'s specific context before adoption. Top management should approve the policy in writing. Regulatory requirements change — see https://trustfolder.com/regulatory-watch for current status.

---

## Sources

- EU AI Act (Regulation (EU) 2024/1689)
- ISO/IEC 42001:2023, Annex A.2 (Policies for AI) and Clause 5.2
- GDPR (Regulation (EU) 2016/679)

---

*Generated by TrustFolder · v0.9 master template · {{ generation_date }}*
