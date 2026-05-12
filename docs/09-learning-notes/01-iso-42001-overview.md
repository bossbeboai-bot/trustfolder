# ISO/IEC 42001:2023 · AI Management System · Learning Note

Source: ISO/IEC 42001:2023 — Information technology — Artificial intelligence — Management system
Reference: https://www.iso.org/standard/81230.html
Abstract: https://www.iso.org/obp/ui/#iso:std:iso-iec:42001:ed-1:v1:en

---

## What ISO 42001 is

ISO/IEC 42001 is the first international management system standard for AI. It specifies requirements for establishing, implementing, maintaining, and continually improving an AI management system (AIMS) within organizations.

**Key point:** ISO 42001 is a MANAGEMENT SYSTEM standard (like ISO 27001 for infosec). It's about processes, controls, and governance — not about specific technical AI requirements.

---

## Structure (Annex SL / High-Level Structure)

Like all modern ISO management system standards, 42001 follows the Annex SL structure:

| Clause | Title | What it covers |
|---|---|---|
| 4 | Context of the organization | Understanding internal/external issues, interested parties, AIMS scope |
| 5 | Leadership | Management commitment, AI policy, roles and responsibilities |
| 6 | Planning | Risk assessment, AI risk treatment, objectives |
| 7 | Support | Resources, competence, awareness, communication, documented info |
| 8 | Operation | Operational planning and control, AI risk assessment, AI system impact assessment |
| 9 | Performance evaluation | Monitoring, measurement, analysis, internal audit, management review |
| 10 | Improvement | Nonconformity, corrective action, continual improvement |

---

## Annexes (normative and informative)

| Annex | Title | Type | Relevance to TrustFolder |
|---|---|---|---|
| A | Reference control objectives and controls | Normative | **Primary source for checklist template** |
| B | Implementation guidance for AI controls | Informative | Guidance for how to implement Annex A controls |
| C | Potential AI-related organizational objectives and risk sources | Informative | Risk assessment context |
| D | Use of the AIMS across domains and sectors | Informative | Sector-specific considerations |

---

## Annex A controls (key controls for TrustFolder templates)

These are the control objectives that matter most for small B2B AI SaaS:

### A.2 — Policies for AI
- AI policy statement
- Alignment with organizational strategy
- Commitment to responsible AI

### A.3 — Internal organization
- Roles, responsibilities, authorities for AI
- Contact with authorities and special interest groups

### A.4 — Resources for AI systems
- Data management for AI
- Tools and computing resources
- Inventory of AI systems

### A.5 — Assessing impacts of AI systems
- AI system impact assessment methodology
- Assessment of impacts on individuals and groups

### A.6 — AI system lifecycle
- AI system design and development processes
- Data for AI systems
- Testing and validation
- Operation and monitoring
- Retirement and decommissioning

### A.7 — Data for AI systems
- Data acquisition, quality, provenance
- Data labeling, pre-processing

### A.8 — Information for interested parties
- Transparency and provision of information
- Communication about AI systems

### A.9 — Use of AI systems
- Responsible use
- Oversight mechanisms

### A.10 — Third-party and customer relationships
- Supply chain for AI
- Customer use of AI systems

---

## How this maps to TrustFolder templates

| ISO 42001 area | TrustFolder Tier 2 template |
|---|---|
| A.4 (AI system inventory) | `t2-01-ai-system-inventory.md` |
| A.2 (AI policies) | `t2-06-ai-policy-draft.md` |
| A.9 (Oversight) | `t2-07-human-oversight-procedure.md` |
| A.5 (Impact assessment) | `t2-03-risk-classification-memo.md` |
| A.10 (Third-party) | `t2-08-vendor-questionnaire.md` |
| Annex A gap assessment | `t2-04-iso-42001-checklist.md` |
| A.4 + A.6 (Evidence) | `t2-05-evidence-tracker.md` |

---

## What TrustFolder does NOT do with ISO 42001

- **Does NOT certify.** We provide a readiness checklist, not certification.
- **Does NOT audit.** We help organize materials for an eventual audit.
- **Does NOT implement.** We provide a gap assessment and roadmap, not implementation.

**Language rule:** Always say "ISO 42001 readiness checklist" or "gap assessment" — never "ISO 42001 certification" or "ISO 42001 compliant."

---

## Why enterprise buyers care

1. **Vendor questionnaires** increasingly reference ISO 42001
2. **Microsoft, Google, AWS** have achieved ISO 42001 certification — it's becoming table stakes for AI vendors
3. **Procurement teams** use ISO 42001 as a screening question: "Are you ISO 42001 aligned?"
4. **Insurance providers** may use ISO 42001 alignment as a risk reduction factor

For small AI SaaS (our ICP), the goal is NOT certification (expensive, time-consuming). The goal is **demonstrating alignment** — showing they've thought about it and have a plan.

---

## Confidence band implications

- ISO 42001 readiness checklist → **CLEAR** band (factual gap assessment, low risk)
- Specific control recommendations → **REVIEW** band (organization-specific, needs validation)
- Certification timeline claims → **NEVER** (we don't make these)

---

Last updated: 8 May 2026
