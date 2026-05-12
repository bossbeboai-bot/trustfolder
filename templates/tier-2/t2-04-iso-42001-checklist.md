---
template_id: t2-04-iso-42001-checklist
title: ISO/IEC 42001 Readiness Checklist (Gap Assessment)
tier: 2
iso_42001_reference: All clauses + Annex A
generated_when: ALWAYS — every Tier 2 customer gets this
confidence_bands_applicable: [CLEAR, REVIEW]
version: 0.9
last_updated: 2026-05-08
---

# ISO/IEC 42001 Readiness Checklist Template

## AI engine instructions

Generate a structured ISO/IEC 42001:2023 readiness checklist (gap assessment). This is NOT a certification claim — it is a self-assessment helping the customer understand where they stand against the standard.

**Critical language rule:**
- ALWAYS say "ISO 42001 readiness" or "ISO 42001 alignment" or "gap assessment"
- NEVER say "ISO 42001 compliant" or "ISO 42001 certified"

**Inputs needed:**
- `{{ company_name }}`
- `{{ ai_systems[] }}` from inventory
- `{{ has_existing_iso_27001 }}` — bool: many controls overlap with ISO 27001
- `{{ company_size }}`
- `{{ governance_contact }}`

**Per-control assessment:**
- IMPLEMENTED — control is in place and documented
- PARTIAL — control partially in place; gaps documented
- PLANNED — committed to implement within timeline
- NOT YET — not yet addressed
- NOT APPLICABLE — control does not apply to organization (with rationale)

**Confidence band:** CLEAR for typical assessment with clear evidence. REVIEW if multiple "NOT APPLICABLE" claims need validation.

**Output formats:** Markdown (canonical), CSV (machine-readable for tracker import), Excel (with conditional formatting).

---

## Customer-facing content (markdown)

# ISO/IEC 42001 Readiness Checklist — {{ company_name }}

**Assessment date:** {{ generation_date }}  
**Assessor:** TrustFolder (preparatory, AI-generated)  
**Owner for follow-up:** {{ governance_contact }}  
**Reference standard:** ISO/IEC 42001:2023 — Information technology — Artificial intelligence — Management system

---

## What this checklist is (and is not)

**What this is:**
- A preparatory gap assessment of {{ company_name }}'s AI governance practices against the ISO/IEC 42001:2023 standard
- Designed to help {{ company_name }} understand its current posture and identify gaps
- Suitable for sharing with auditors, advisors, and enterprise buyers as a starting point

**What this is NOT:**
- A certification audit (that requires accredited certification bodies)
- A guarantee that {{ company_name }} would pass certification
- A substitute for a qualified ISO 42001 implementer / auditor relationship

{{ #if has_existing_iso_27001 }}
**Note on ISO 27001 overlap:** {{ company_name }} maintains ISO 27001 alignment. Many ISO 42001 controls relate to or extend ISO 27001 controls — this checklist references those overlaps where applicable.
{{ /if }}

---

## Summary

- **Total controls assessed:** {{ total_controls }}
- **Implemented:** {{ implemented_count }} ({{ implemented_pct }}%)
- **Partial:** {{ partial_count }} ({{ partial_pct }}%)
- **Planned:** {{ planned_count }} ({{ planned_pct }}%)
- **Not yet:** {{ not_yet_count }} ({{ not_yet_pct }}%)
- **Not applicable:** {{ na_count }} ({{ na_pct }}%)

**Top-line readiness assessment:** {{ overall_readiness_label }}

---

## Clause 4 · Context of the organization

| ID | Item | Status | Evidence | Notes |
|---|---|---|---|---|
| 4.1 | Internal/external issues affecting AIMS identified | {{ c4_1_status }} | {{ c4_1_evidence }} | {{ c4_1_notes }} |
| 4.2 | Interested parties and their requirements identified | {{ c4_2_status }} | {{ c4_2_evidence }} | {{ c4_2_notes }} |
| 4.3 | AIMS scope defined | {{ c4_3_status }} | {{ c4_3_evidence }} | {{ c4_3_notes }} |
| 4.4 | AIMS established and maintained | {{ c4_4_status }} | {{ c4_4_evidence }} | {{ c4_4_notes }} |

---

## Clause 5 · Leadership

| ID | Item | Status | Evidence | Notes |
|---|---|---|---|---|
| 5.1 | Top management commitment demonstrated | {{ c5_1_status }} | {{ c5_1_evidence }} | {{ c5_1_notes }} |
| 5.2 | AI policy established | {{ c5_2_status }} | TrustFolder t2-06 draft | {{ c5_2_notes }} |
| 5.3 | Roles, responsibilities, and authorities assigned | {{ c5_3_status }} | {{ c5_3_evidence }} | {{ c5_3_notes }} |

---

## Clause 6 · Planning

| ID | Item | Status | Evidence | Notes |
|---|---|---|---|---|
| 6.1.1 | Risks and opportunities for AIMS identified | {{ c6_1_1_status }} | {{ c6_1_1_evidence }} | {{ c6_1_1_notes }} |
| 6.1.2 | AI risk assessment process established | {{ c6_1_2_status }} | TrustFolder t2-03 risk classification | {{ c6_1_2_notes }} |
| 6.1.3 | AI risk treatment plan defined | {{ c6_1_3_status }} | {{ c6_1_3_evidence }} | {{ c6_1_3_notes }} |
| 6.1.4 | AI system impact assessment process | {{ c6_1_4_status }} | {{ c6_1_4_evidence }} | {{ c6_1_4_notes }} |
| 6.2 | AI objectives established and planned | {{ c6_2_status }} | {{ c6_2_evidence }} | {{ c6_2_notes }} |
| 6.3 | Planning of changes | {{ c6_3_status }} | {{ c6_3_evidence }} | {{ c6_3_notes }} |

---

## Clause 7 · Support

| ID | Item | Status | Evidence | Notes |
|---|---|---|---|---|
| 7.1 | Resources determined and provided | {{ c7_1_status }} | {{ c7_1_evidence }} | {{ c7_1_notes }} |
| 7.2 | Competence requirements identified and met | {{ c7_2_status }} | {{ c7_2_evidence }} | {{ c7_2_notes }} |
| 7.3 | Awareness program in place | {{ c7_3_status }} | {{ c7_3_evidence }} | {{ c7_3_notes }} |
| 7.4 | Communication processes defined | {{ c7_4_status }} | {{ c7_4_evidence }} | {{ c7_4_notes }} |
| 7.5 | Documented information controlled | {{ c7_5_status }} | TrustFolder pack as starter | {{ c7_5_notes }} |

---

## Clause 8 · Operation

| ID | Item | Status | Evidence | Notes |
|---|---|---|---|---|
| 8.1 | Operational planning and control | {{ c8_1_status }} | {{ c8_1_evidence }} | {{ c8_1_notes }} |
| 8.2 | AI risk assessment performed | {{ c8_2_status }} | TrustFolder t2-03 | {{ c8_2_notes }} |
| 8.3 | AI risk treatment implemented | {{ c8_3_status }} | {{ c8_3_evidence }} | {{ c8_3_notes }} |
| 8.4 | AI system impact assessment performed | {{ c8_4_status }} | {{ c8_4_evidence }} | {{ c8_4_notes }} |

---

## Clause 9 · Performance evaluation

| ID | Item | Status | Evidence | Notes |
|---|---|---|---|---|
| 9.1 | Monitoring, measurement, analysis, evaluation | {{ c9_1_status }} | {{ c9_1_evidence }} | {{ c9_1_notes }} |
| 9.2 | Internal audit program | {{ c9_2_status }} | {{ c9_2_evidence }} | {{ c9_2_notes }} |
| 9.3 | Management review | {{ c9_3_status }} | {{ c9_3_evidence }} | {{ c9_3_notes }} |

---

## Clause 10 · Improvement

| ID | Item | Status | Evidence | Notes |
|---|---|---|---|---|
| 10.1 | Continual improvement | {{ c10_1_status }} | {{ c10_1_evidence }} | {{ c10_1_notes }} |
| 10.2 | Nonconformity and corrective action | {{ c10_2_status }} | {{ c10_2_evidence }} | {{ c10_2_notes }} |

---

## Annex A · Reference controls

The following are the Annex A control objectives and controls. Each is assessed for {{ company_name }}.

### A.2 Policies for AI

| ID | Control | Status | Evidence |
|---|---|---|---|
| A.2.2 | AI policy | {{ a2_2_status }} | TrustFolder t2-06 draft |
| A.2.3 | Alignment with other organizational policies | {{ a2_3_status }} | {{ a2_3_evidence }} |
| A.2.4 | Review of the AI policy | {{ a2_4_status }} | {{ a2_4_evidence }} |

### A.3 Internal organization

| ID | Control | Status | Evidence |
|---|---|---|---|
| A.3.2 | AI roles and responsibilities | {{ a3_2_status }} | {{ a3_2_evidence }} |
| A.3.3 | Reporting of concerns | {{ a3_3_status }} | {{ a3_3_evidence }} |

### A.4 Resources for AI systems

| ID | Control | Status | Evidence |
|---|---|---|---|
| A.4.2 | Resource documentation | {{ a4_2_status }} | TrustFolder t2-01 inventory |
| A.4.3 | Data resources | {{ a4_3_status }} | {{ a4_3_evidence }} |
| A.4.4 | Tooling resources | {{ a4_4_status }} | {{ a4_4_evidence }} |
| A.4.5 | System and computing resources | {{ a4_5_status }} | {{ a4_5_evidence }} |
| A.4.6 | Human resources | {{ a4_6_status }} | {{ a4_6_evidence }} |

### A.5 Assessing impacts of AI systems

| ID | Control | Status | Evidence |
|---|---|---|---|
| A.5.2 | AI system impact assessment process | {{ a5_2_status }} | TrustFolder t2-03 starter |
| A.5.3 | Documentation of AI system impact assessments | {{ a5_3_status }} | {{ a5_3_evidence }} |
| A.5.4 | Assessing AI system impact on individuals or groups | {{ a5_4_status }} | {{ a5_4_evidence }} |
| A.5.5 | Assessing societal impacts of AI systems | {{ a5_5_status }} | {{ a5_5_evidence }} |

### A.6 AI system lifecycle

| ID | Control | Status | Evidence |
|---|---|---|---|
| A.6.1.2 | Objectives for responsible development of AI systems | {{ a6_1_2_status }} | {{ a6_1_2_evidence }} |
| A.6.1.3 | Processes for responsible design and development | {{ a6_1_3_status }} | {{ a6_1_3_evidence }} |
| A.6.2.2 | AI system requirements and specification | {{ a6_2_2_status }} | {{ a6_2_2_evidence }} |
| A.6.2.3 | Documentation of AI system design and development | {{ a6_2_3_status }} | {{ a6_2_3_evidence }} |
| A.6.2.4 | AI system verification and validation | {{ a6_2_4_status }} | {{ a6_2_4_evidence }} |
| A.6.2.5 | AI system deployment | {{ a6_2_5_status }} | {{ a6_2_5_evidence }} |
| A.6.2.6 | AI system operation and monitoring | {{ a6_2_6_status }} | {{ a6_2_6_evidence }} |
| A.6.2.7 | AI system technical documentation | {{ a6_2_7_status }} | {{ a6_2_7_evidence }} |
| A.6.2.8 | AI system event logs | {{ a6_2_8_status }} | {{ a6_2_8_evidence }} |

### A.7 Data for AI systems

| ID | Control | Status | Evidence |
|---|---|---|---|
| A.7.2 | Data for development and enhancement of AI system | {{ a7_2_status }} | {{ a7_2_evidence }} |
| A.7.3 | Acquisition of data | {{ a7_3_status }} | {{ a7_3_evidence }} |
| A.7.4 | Quality of data for AI systems | {{ a7_4_status }} | {{ a7_4_evidence }} |
| A.7.5 | Data provenance | {{ a7_5_status }} | {{ a7_5_evidence }} |
| A.7.6 | Data preparation | {{ a7_6_status }} | {{ a7_6_evidence }} |

### A.8 Information for interested parties of AI systems

| ID | Control | Status | Evidence |
|---|---|---|---|
| A.8.2 | System documentation and information for users | {{ a8_2_status }} | TrustFolder Tier 1 disclosures |
| A.8.3 | External reporting | {{ a8_3_status }} | {{ a8_3_evidence }} |
| A.8.4 | Communication of incidents | {{ a8_4_status }} | {{ a8_4_evidence }} |
| A.8.5 | Information for interested parties | {{ a8_5_status }} | TrustFolder t1-06 disclosure page |

### A.9 Use of AI systems

| ID | Control | Status | Evidence |
|---|---|---|---|
| A.9.2 | Processes for responsible use of AI systems | {{ a9_2_status }} | {{ a9_2_evidence }} |
| A.9.3 | Objectives for responsible use of AI system | {{ a9_3_status }} | {{ a9_3_evidence }} |
| A.9.4 | Intended use of the AI system | {{ a9_4_status }} | {{ a9_4_evidence }} |

### A.10 Third-party and customer relationships

| ID | Control | Status | Evidence |
|---|---|---|---|
| A.10.2 | Allocating responsibilities | {{ a10_2_status }} | TrustFolder t2-02 role memo |
| A.10.3 | Suppliers | {{ a10_3_status }} | TrustFolder t2-08 vendor questionnaire |
| A.10.4 | Customers | {{ a10_4_status }} | {{ a10_4_evidence }} |

---

## Top gap-priorities

Based on the assessment above, the highest-priority gaps for {{ company_name }} are:

{{ #each top_gaps }}
{{ @index_plus_1 }}. **{{ this.control }}** ({{ this.id }}) — {{ this.gap_description }}
   - **Why it matters:** {{ this.why_matters }}
   - **Recommended action:** {{ this.action }}
   - **Estimated effort:** {{ this.effort }}
{{ /each }}

These priorities feed directly into the 30-Day Governance Roadmap (`t2-10`).

---

## Path to certification (informational)

If {{ company_name }} chooses to pursue ISO/IEC 42001 certification in the future, the typical path is:

1. **Implement gaps** identified above (3-12 months for an organization at {{ company_name }}'s stage)
2. **Engage an accredited certification body** (PECB, BSI, DNV, TÜV, or similar)
3. **Stage 1 audit** — documentation review
4. **Stage 2 audit** — implementation verification
5. **Certification decision** — issued by the certification body
6. **Surveillance audits** — annual maintenance audits
7. **Recertification** — every 3 years

**TrustFolder is NOT a certification body and does NOT issue ISO 42001 certifications.** This checklist prepares {{ company_name }} for a conversation with a certification body, an internal auditor, or an enterprise buyer asking about ISO 42001 alignment.

---

## Confidence band: {{ confidence_band }}

{{ #if confidence_band == "CLEAR" }}
**Assessment based on clear evidence and standard practices.** Gap status reflects realistic assessment for an organization at {{ company_name }}'s stage. Specific control statuses can be validated by an internal auditor or implementer.
{{ /if }}

{{ #if confidence_band == "REVIEW" }}
**Requires implementer/auditor review.** Several control statuses (particularly "Implemented" and "Not Applicable" claims) warrant validation by a qualified ISO 42001 implementer or auditor before being relied upon externally (e.g., in vendor questionnaires).
{{ /if }}

---

## Disclaimer

This ISO/IEC 42001 readiness checklist is generated by TrustFolder for preparatory and informational purposes. It is an AI-generated draft based on advisor-reviewed templates and the information you provided. It does not constitute an audit, certification, ISO 42001 certified status, or guaranteed alignment. Only an accredited certification body can issue ISO 42001 certification.

Always have the assessment validated by a qualified ISO 42001 implementer or auditor before relying on it for vendor responses, audit preparation, or external claims about ISO 42001 status. ISO standards are updated periodically — check ISO.org for the current version of the standard.

---

## Sources

- ISO/IEC 42001:2023 — Information technology — Artificial intelligence — Management system
- https://www.iso.org/standard/81230.html
- ISO/IEC 42001:2023 abstract: https://www.iso.org/obp/ui/#iso:std:iso-iec:42001:ed-1:v1:en
- TrustFolder learning note: `docs/09-learning-notes/01-iso-42001-overview.md`

---

*Generated by TrustFolder · v0.9 master template · {{ generation_date }}*
