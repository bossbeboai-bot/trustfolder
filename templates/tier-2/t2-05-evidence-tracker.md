---
template_id: t2-05-evidence-tracker
title: AI Governance Evidence Tracker
tier: 2
iso_42001_reference: 7.5 (Documented information), Annex A (Evidence for controls)
ai_act_reference: Articles 11, 12, 18, 19 (technical documentation, record-keeping)
generated_when: ALWAYS — every Tier 2 customer gets this
confidence_bands_applicable: [CLEAR, REVIEW]
version: 0.9
last_updated: 2026-05-08
---

# AI Governance Evidence Tracker Template

## AI engine instructions

Generate a structured evidence tracker (a register/log) covering AI governance evidence the customer should maintain. Output BOTH a markdown narrative AND a CSV/spreadsheet specification that the customer can import into Notion / Excel / Google Sheets.

**Inputs needed:**
- `{{ company_name }}`
- `{{ ai_systems[] }}` from inventory
- `{{ has_eu_customers }}`
- `{{ has_existing_iso_27001 }}`
- `{{ governance_contact }}`

**Confidence band:** CLEAR for typical organization. REVIEW if customer has high-volume EU users (more record-keeping obligations).

**Output formats:** Markdown (narrative + spec), CSV, importable Notion table.

---

## Customer-facing content (markdown)

# AI Governance Evidence Tracker — {{ company_name }}

**Tracker established:** {{ generation_date }}  
**Owner:** {{ governance_contact }}  
**Review cadence:** Monthly internal, quarterly with leadership

---

## Why an evidence tracker

AI governance is sustained through evidence — not policy alone. This tracker is the central register where {{ company_name }} records:

- Decisions made about AI systems (with date, rationale, decision-maker)
- Reviews and updates (inventory updates, classification re-assessments)
- Training and awareness activities
- Incidents and responses
- Vendor reviews
- DPIAs and impact assessments
- Audit and management review outputs

This tracker supports:
- ISO/IEC 42001:2023 Clause 7.5 (documented information control)
- EU AI Act Articles 11, 12, 18, 19 (technical documentation, record-keeping for high-risk; voluntary good practice for limited-risk)
- GDPR Article 30 (records of processing activities) where AI processes personal data
- Vendor questionnaire and audit response readiness

---

## Tracker schema

The tracker is a single living spreadsheet with multiple sheets/tabs. Below is the canonical schema for each tab.

### Tab 1: Master log (every governance event)

| Column | Type | Required | Description |
|---|---|---|---|
| Event ID | string (UUID or seq) | yes | Unique identifier |
| Event date | date | yes | When the event occurred |
| Event type | enum | yes | (see event types below) |
| Related AI system | reference | optional | From inventory (`t2-01`); blank if cross-system |
| Description | text | yes | What happened, briefly |
| Decision / outcome | text | yes | The action taken or decision recorded |
| Decision-maker / owner | string | yes | Name or role |
| Documents linked | list of links | optional | URLs to related documents |
| Follow-up needed | bool | yes | Yes / No |
| Follow-up due date | date | conditional | If follow-up needed |
| Follow-up status | enum | conditional | Open / In progress / Closed |
| Confidence band | enum | optional | CLEAR / REVIEW / UNCERTAIN (where applicable) |

**Event types to log:**
- `inventory_update` — new system, retired system, or material change
- `risk_classification` — initial or re-classification of a system
- `policy_review` — annual or trigger-based policy review
- `dpia` — Data Protection Impact Assessment under GDPR
- `aisia` — AI System Impact Assessment per ISO 42001
- `vendor_review` — vendor due diligence completed or refreshed
- `training` — AI awareness training delivered
- `incident` — AI incident or near-miss recorded
- `customer_inquiry` — customer asked AI governance question (track trends)
- `regulator_inquiry` — regulator inquiry (escalate immediately to legal)
- `management_review` — management review of AIMS performance
- `internal_audit` — internal audit of AI governance
- `external_audit` — external audit (customer, certifier, regulator)

### Tab 2: AI system inventory (mirrors `t2-01`)

Synchronize this tab with the inventory document from `t2-01`. The tracker tab is the operational copy; the document is the canonical published version.

### Tab 3: Risk register

| Column | Required | Description |
|---|---|---|
| Risk ID | yes | Unique |
| Related AI system | yes | From inventory |
| Risk description | yes | What could go wrong |
| Likelihood | yes | 1-5 |
| Impact | yes | 1-5 |
| Inherent risk score | calc | Likelihood × Impact |
| Mitigations in place | yes | Current controls |
| Residual risk score | yes | After mitigations |
| Owner | yes | Risk owner |
| Last reviewed | yes | Date |
| Next review date | yes | Date |
| Status | yes | Open / Treated / Accepted / Closed |

### Tab 4: Vendor register

| Column | Required | Description |
|---|---|---|
| Vendor name | yes | e.g., OpenAI, Anthropic |
| AI system / model used | yes | e.g., GPT-4, Claude 3.5 Sonnet |
| Used in (our systems) | yes | From inventory |
| Vendor's stated AI governance | yes | URL to vendor posture |
| Vendor questionnaire response date | yes | Date |
| Vendor questionnaire status | yes | Pending / Received / Reviewed / Approved / Rejected |
| Data Processing Agreement signed | yes | Yes / No / N/A |
| Last reviewed | yes | Date |
| Next review date | yes | Date |
| Risk level (low/med/high) | yes | Per our methodology |
| Owner | yes | Internal owner |

### Tab 5: Training & awareness

| Column | Required | Description |
|---|---|---|
| Training event date | yes | Date |
| Training topic | yes | Title |
| Audience | yes | Roles / departments |
| Number of attendees | yes | Count |
| Materials | yes | Link to slides / video |
| Effectiveness measure | optional | Quiz, survey, etc. |
| Owner | yes | Trainer / training owner |

### Tab 6: Incidents

| Column | Required | Description |
|---|---|---|
| Incident ID | yes | Unique |
| Incident date | yes | When discovered |
| Discovery method | yes | Customer report / monitoring / audit / other |
| Affected AI system | yes | From inventory |
| Severity | yes | Low / Med / High / Critical |
| Description | yes | What happened |
| Affected parties | yes | Users, partners, regulators |
| Initial response | yes | Action within 24 hrs |
| Root cause analysis | conditional | Required for Med+ severity |
| Corrective actions | yes | Actions taken |
| Preventive actions | yes | Actions to avoid recurrence |
| Reported externally | yes | To whom (vendors, regulators, customers) |
| Date closed | yes | Date |
| Owner | yes | Incident owner |

### Tab 7: Reviews & audits

| Column | Required | Description |
|---|---|---|
| Review type | yes | Internal audit / management review / external audit / customer review |
| Review date | yes | Date |
| Scope | yes | What was reviewed |
| Reviewer | yes | Name / firm |
| Findings | yes | Summary |
| Action items | yes | List with owners |
| Follow-up status | yes | Open / Closed |

---

## Minimum cadences

To keep the tracker meaningful (not theatre), {{ company_name }} commits to these minimum cadences:

| Activity | Cadence | Owner |
|---|---|---|
| Inventory update review | Monthly | Engineering + Product |
| Risk register review | Quarterly | AI Governance Lead |
| Vendor review | Annually (or on trigger) | Procurement |
| Training delivery | Annually + onboarding | HR / Engineering Lead |
| Internal audit | Annually | AI Governance Lead |
| Management review | Annually (minimum) | Leadership team |
| Policy review | Annually + on trigger | AI Governance Lead |
| External audit / customer review | As triggered | AI Governance Lead |

Triggers that force off-cycle reviews:
- New AI feature in production
- Material regulatory change (track in TrustFolder regulatory watch)
- Material incident
- Vendor change or vendor incident
- Customer request for review

---

## Sample records (starter content)

### Sample event (master log)

```
Event ID: 2026-001
Event date: 2026-05-08
Event type: inventory_update
Related AI system: SYS-001 (Customer Support Chatbot)
Description: Initial inventory established via TrustFolder readiness pack
Decision / outcome: Inventory created; classified limited-risk under Article 50(1)
Decision-maker: {{ governance_contact }}
Documents linked: [link to t2-01 inventory], [link to t2-03 risk classification]
Follow-up needed: Yes
Follow-up due date: 2026-08-08 (quarterly review)
Follow-up status: Open
Confidence band: CLEAR
```

### Sample risk register entry

```
Risk ID: R-001
Related AI system: SYS-001 (Customer Support Chatbot)
Risk description: Chatbot provides incorrect or harmful answer to user query
Likelihood: 3 (occasional given LLM hallucination patterns)
Impact: 2 (low — chatbot scope is informational, not transactional)
Inherent risk score: 6
Mitigations in place: [list — e.g., system prompt hardening, output filters, escalation to human]
Residual risk score: 3
Owner: [Engineering Lead]
Last reviewed: 2026-05-08
Next review date: 2026-08-08
Status: Treated
```

---

## Implementation note

The TrustFolder Tier 2 delivery includes a starter spreadsheet (Excel + Google Sheets formats) pre-populated with the schema above and the sample records. {{ company_name }} should adapt to its tooling preference (most customers use Notion or Airtable for the live tracker — both support easy CSV import).

---

## Confidence band: {{ confidence_band }}

{{ #if confidence_band == "CLEAR" }}
**Tracker schema fits standard B2B AI SaaS governance scope.** Maintenance cadences are reasonable for a 5-50 person organization. Adjust as the company scales.
{{ /if }}

{{ #if confidence_band == "REVIEW" }}
**Requires legal/compliance review.** Your organization may have additional record-keeping obligations beyond the schema above (e.g., GDPR Article 30 RoPA detail, industry-specific records). Validate with counsel before relying on this tracker as a complete record-keeping system.
{{ /if }}

---

## Disclaimer

This evidence tracker template is generated by TrustFolder for preparatory and informational purposes. It is an AI-generated draft. The tracker schema reflects general good practice but is not a regulatory-mandated form, and full regulatory record-keeping (especially under GDPR Article 30 or AI Act Articles 11, 12 for high-risk systems) may require additional fields and processes.

Always validate the tracker schema with qualified legal/compliance counsel before relying on it for audit, regulator, or customer responses. See https://trustfolder.com/regulatory-watch for current regulatory status.

---

## Sources

- ISO/IEC 42001:2023, Clause 7.5 (Documented information)
- EU AI Act (Regulation (EU) 2024/1689), Articles 11, 12, 18, 19
- GDPR (Regulation (EU) 2016/679), Article 30
- https://eur-lex.europa.eu/eli/reg/2024/1689/oj

---

*Generated by TrustFolder · v0.9 master template · {{ generation_date }}*
