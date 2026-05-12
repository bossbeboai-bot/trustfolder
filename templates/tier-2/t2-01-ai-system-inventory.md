---
template_id: t2-01-ai-system-inventory
title: AI System Inventory
tier: 2
iso_42001_reference: A.4 (Resources for AI systems — inventory)
ai_act_reference: General governance, supports Articles 6, 16, 26, 50
generated_when: ALWAYS — every Tier 2 customer gets this
confidence_bands_applicable: [CLEAR, REVIEW]
version: 0.9
last_updated: 2026-05-08
---

# AI System Inventory Template

## AI engine instructions

Generate a structured AI system inventory listing every AI feature/system the customer has. This is the foundational governance document — many other deliverables (risk classification memo, policy, oversight procedure, vendor questionnaire) reference this inventory.

**Inputs needed:**
- `{{ company_name }}`
- `{{ ai_systems[] }}` — array detected from URL crawl + confirmation questions
- `{{ third_party_models[] }}` — underlying AI models
- `{{ ai_role }}` — provider / deployer / both
- `{{ has_eu_customers }}`
- `{{ governance_contact }}`

**Per-system detail required:**
- Name, description, purpose
- Inputs (data, prompts, user actions)
- Outputs (text, image, decisions, classifications)
- Data subjects affected
- Underlying model(s)
- Deployment context (customer-facing, internal, embedded in product)
- Article 50 / Annex III classification with confidence band
- Owner within the customer's organization

**Confidence band:** CLEAR if 1-3 standard B2B AI systems with clear classification. REVIEW if mixed risk profiles, sensitive data, or unclear use cases.

**Output formats:** Markdown (canonical), CSV (machine-readable inventory), Notion-table-ready.

---

## Customer-facing content (markdown)

# AI System Inventory — {{ company_name }}

**Inventory date:** {{ generation_date }}  
**Owner:** {{ governance_contact }}  
**Review cadence:** Quarterly (or upon any new AI feature)

---

## Purpose

This inventory lists every AI system that {{ company_name }} develops, deploys, or substantially configures, in alignment with:
- ISO/IEC 42001:2023, Annex A.4 (Resources for AI systems)
- EU AI Act (Regulation (EU) 2024/1689) governance requirements

It is the foundation for our AI governance: risk classification, oversight, vendor management, and regulatory disclosure all reference this inventory.

---

## Summary

- **Total AI systems inventoried:** {{ ai_systems_count }}
- **Customer-facing systems:** {{ customer_facing_count }}
- **Internal-only systems:** {{ internal_only_count }}
- **Provider role systems:** {{ provider_count }}
- **Deployer role systems:** {{ deployer_count }}
- **EU AI Act risk distribution:**
  - Limited-risk (Article 50): {{ limited_risk_count }}
  - Minimal-risk: {{ minimal_risk_count }}
  - Requires legal review: {{ review_count }}
  - Out of scope (auto-rejected): {{ out_of_scope_count }}

---

## AI systems detail

{{ #each ai_systems }}

### System {{ @index_plus_1 }}: {{ this.name }}

| Field | Value |
|---|---|
| **System ID** | {{ this.id }} |
| **Description** | {{ this.description }} |
| **Purpose** | {{ this.purpose }} |
| **Owner** | {{ this.owner }} |
| **Status** | {{ this.status }} (production / beta / development / retired) |
| **Customer-facing or internal** | {{ this.deployment_context }} |
| **Our role under AI Act** | {{ this.our_role }} (provider / deployer / both) |
| **EU AI Act classification** | {{ this.ai_act_classification }} |
| **Confidence band** | {{ this.confidence_band }} |
| **Citation** | {{ this.citation }} |

**Inputs:** {{ this.inputs }}  
**Outputs:** {{ this.outputs }}  
**Data subjects affected:** {{ this.data_subjects }}  
**Underlying AI models:** {{ this.underlying_models }}  
**User-facing disclosure:** {{ this.user_disclosure }}  
**Human oversight:** {{ this.oversight }}

**Notes:**  
{{ this.notes }}

---
{{ /each }}

## Cross-cutting attributes

### Underlying AI models in use

{{ #each third_party_models }}
- **{{ this.name }}** ({{ this.provider }})
  - Used in systems: {{ this.used_in }}
  - Provider's data handling: {{ this.data_handling_summary }}
  - Provider's stated AI Act posture: {{ this.provider_posture_link }}
  - Last reviewed: {{ this.last_reviewed_date }}
{{ /each }}

### Data flows

For each customer-facing AI system, our processing typically involves:
1. User input is captured by our product
2. Input may be augmented with system context (prompts, retrieved data)
3. Augmented input is sent to underlying AI model
4. AI output is post-processed and returned to user
5. Logs/metrics are retained per our data retention policy

System-specific deviations from this default are noted per system above.

### Special-category personal data

{{ #if has_special_category_data }}
The following AI systems process special-category personal data under Article 9 GDPR:
{{ #each special_category_systems }}
- {{ this.name }}: {{ this.data_categories }}
{{ /each }}
DPIAs have been (or will be) conducted for these systems — see Evidence Tracker.
{{ else }}
No AI system in our inventory currently processes special-category personal data under Article 9 GDPR. This will be re-assessed any time a new system is added.
{{ /if }}

### Children's data

{{ #if has_children_data }}
The following AI systems may process data of users under 18:
{{ #each children_data_systems }}
- {{ this.name }}: {{ this.note }}
{{ /each }}
**Note:** TrustFolder's out-of-scope detector hard-rejects children's products in v1. Any children's-data AI system identified here should be reviewed for whether it falls within our v1 scope.
{{ else }}
No AI system in our inventory is intentionally directed at users under 18.
{{ /if }}

---

## Maintenance procedure

This inventory is updated:
- **Within 14 days** of any new AI system entering production
- **Within 30 days** of any material change to an existing system (new model, new use case, new data flow)
- **At least quarterly** as a complete review (see Evidence Tracker for cadence record)
- **Immediately** upon retirement of an AI system (mark "retired" with date)

The inventory is owned by {{ governance_contact }} and is reviewed by [Engineering lead], [Product lead], and (where applicable) [Privacy / DPO].

---

## How this inventory feeds other documents

| Document | Uses inventory for |
|---|---|
| Risk Classification Memo (`t2-03`) | Per-system EU AI Act classification |
| Provider/Deployer Memo (`t2-02`) | Per-system role assignment |
| ISO 42001 Checklist (`t2-04`) | A.4 control evidence |
| Evidence Tracker (`t2-05`) | Inventory updates as evidence |
| AI Policy (`t2-06`) | Reference list of governed systems |
| Human Oversight Procedure (`t2-07`) | Per-system oversight specifications |
| Lawyer Handoff (`t2-09`) | Summary table of systems for counsel |

---

## Confidence band: {{ confidence_band }}

{{ #if confidence_band == "CLEAR" }}
**Inventory reflects standard B2B AI SaaS profile.** All systems classified with high confidence.
{{ /if }}

{{ #if confidence_band == "REVIEW" }}
**Requires legal/compliance review.** One or more inventoried systems have classification ambiguity flagged in the per-system table. Review with qualified counsel before relying on classifications for external use (vendor questionnaires, regulatory communications).
{{ /if }}

---

## Disclaimer

This AI system inventory is generated by TrustFolder for preparatory and informational purposes. It is an AI-generated draft based on advisor-reviewed templates and the information you provided. Classification of each system under the EU AI Act and ISO/IEC 42001 is preparatory and does not constitute legal advice or guaranteed compliance.

Always review classifications and inventory completeness with qualified legal counsel before relying on this inventory for regulatory submissions, vendor responses, or audit preparation. Regulatory requirements change — see https://trustfolder.com/regulatory-watch for current status.

---

## Sources

- ISO/IEC 42001:2023, Annex A.4 (Resources for AI systems)
- EU AI Act (Regulation (EU) 2024/1689), Articles 3, 6, 16, 26, 50
- https://eur-lex.europa.eu/eli/reg/2024/1689/oj
- https://www.iso.org/standard/81230.html

---

*Generated by TrustFolder · v0.9 master template · {{ generation_date }}*
