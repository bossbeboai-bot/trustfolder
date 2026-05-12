---
template_id: t2-09-lawyer-handoff-pack
title: Lawyer-Review Handoff Pack
tier: 2
purpose: 1-page summary + flagged questions for legal counsel review
generated_when: ALWAYS — every Tier 2 customer gets this
confidence_bands_applicable: [CLEAR, REVIEW, UNCERTAIN]
version: 0.9
last_updated: 2026-05-08
---

# Lawyer-Review Handoff Pack Template

## AI engine instructions

Generate a 1-2 page document specifically designed for a legal counsel briefing. The customer hands this to their lawyer (or compliance person) along with the rest of the readiness pack. The handoff pack:
- Summarizes what's in the pack
- Highlights specific items needing legal review
- Lists flagged questions per template
- Estimates how much lawyer time is needed
- Provides a structured agenda for a 30-60 min lawyer call

**Inputs needed:**
- `{{ company_name }}`
- `{{ ai_systems[] }}` from inventory
- All confidence-band flags from other templates (REVIEW, UNCERTAIN, SOFT-OUT items)
- `{{ governance_contact }}`
- `{{ has_eu_customers }}`
- `{{ ai_role }}`

**Confidence band:** Reflects the highest uncertainty across the pack.

**Output formats:** Markdown (canonical), PDF (the lawyer-friendly format), DOCX (for editing in legal review).

---

## Customer-facing content (markdown)

# Lawyer-Review Handoff Pack — {{ company_name }}

**Prepared:** {{ generation_date }}  
**For:** {{ company_name }}'s legal / compliance counsel  
**Prepared by:** TrustFolder (preparatory AI-generated draft pack)  
**Estimated counsel review time:** {{ estimated_review_hours }} hours

---

## Purpose of this handoff

{{ company_name }} has prepared a TrustFolder Tier 2 AI Governance Readiness Pack covering inventory, classification, policies, and procedures aligned with the EU AI Act and ISO/IEC 42001:2023.

**The pack is preparatory.** TrustFolder is an AI governance evidence folder, not a legal compliance guarantee. Before {{ company_name }} relies on this pack for regulatory submissions, vendor questionnaires, or material business decisions, qualified legal/compliance counsel review is needed.

This document is intended to make that review efficient. It identifies:
1. What's in the pack
2. The high-stakes items needing closest review
3. Specific flagged questions per document
4. A suggested agenda for a 1-hour review call

---

## Snapshot of {{ company_name }}'s AI posture

| Item | Value |
|---|---|
| Total AI systems inventoried | {{ ai_systems_count }} |
| Likely AI Act role | {{ ai_role }} (per `t2-02`) |
| EU customer base | {{ has_eu_customers }} |
| Risk distribution | {{ risk_summary }} |
| Highest-confidence classification | {{ highest_confidence_count }} systems CLEAR |
| Items flagged for review | {{ review_count }} systems / decisions |
| Items flagged uncertain | {{ uncertain_count }} systems / decisions |

**Key narrative (1 sentence):**  
{{ company_name }} is a {{ company_size }} B2B AI SaaS company {{ company_role_summary }}, with primary AI Act exposure under Article 50 transparency obligations. The pack prepares the documentation, classification, and governance materials a lawyer would expect to see.

---

## Pack contents

| Document | TrustFolder ID | What it is |
|---|---|---|
| AI System Inventory | `t2-01` | Master list of all AI systems |
| Provider/Deployer Memo | `t2-02` | Per-system AI Act role determination |
| Risk Classification Memo | `t2-03` | Per-system risk classification with confidence bands |
| ISO 42001 Checklist | `t2-04` | Gap assessment vs the AI management standard |
| Evidence Tracker | `t2-05` | Schema for ongoing AI governance records |
| AI Policy Draft | `t2-06` | Internal policy ready for top-management approval |
| Human Oversight Procedure | `t2-07` | Per-system oversight specification |
| Vendor Questionnaire | `t2-08` | Form for AI vendor due diligence |
| Lawyer Handoff (this doc) | `t2-09` | Briefing for counsel |
| 30-Day Roadmap | `t2-10` | Implementation plan post-review |
| Pack README | `t2-11` | How to use everything together |

Plus 7 Tier 1 disclosure documents (Article 50 transparency artifacts).

---

## Highest-priority review items

### Priority 1: Provider/deployer determinations (`t2-02`)

**Why it matters:** Getting the role wrong means preparing the wrong documents and (if external) misrepresenting our compliance posture.

**Specific items needing your review:**

{{ #each role_flagged_items }}
- **System:** {{ this.system_name }}  
  **Our preliminary determination:** {{ this.role }}  
  **TrustFolder confidence:** {{ this.confidence_band }}  
  **Question for you:** {{ this.question }}
{{ /each }}

**Documents to read:** `t2-02` (full memo), `t2-01` (inventory for context)  
**Estimated time:** 15-25 minutes

---

### Priority 2: Risk classifications (`t2-03`)

**Why it matters:** False-CLEAR (saying limited-risk when actually high-risk) is the worst possible outcome. Customers may publish based on the classification.

**Specific items needing your review:**

{{ #each risk_flagged_items }}
- **System:** {{ this.system_name }}  
  **Preliminary classification:** {{ this.classification }}  
  **TrustFolder confidence:** {{ this.confidence_band }}  
  **Question for you:** {{ this.question }}
{{ /each }}

**Documents to read:** `t2-03` (full memo)  
**Estimated time:** 15-25 minutes

---

### Priority 3: Article 25 review (white-labeling, fine-tuning, substantial modification)

{{ #if article_25_flags }}
**Why it matters:** Article 25 can transform a deployer into a provider for AI Act purposes, dramatically expanding obligations for high-risk systems.

**Specific items:**
{{ #each article_25_flags }}
- **Activity:** {{ this.activity }}  
  **Implication:** {{ this.implication }}  
  **Question for you:** {{ this.question }}
{{ /each }}

**Documents to read:** `t2-02` Section "Article 25 review", relevant vendor agreements  
**Estimated time:** 10-20 minutes
{{ else }}
No Article 25 flags surfaced for {{ company_name }} based on current information. We do not currently white-label, fine-tune, or substantially modify AI systems beyond ordinary configuration.
{{ /if }}

---

### Priority 4: Article 50 transparency obligations implementation

**Why it matters:** Article 50 transparency obligations apply from 2 August 2026 (subject to ongoing dilution discussions). Implementation requires technical work; misimplementation creates regulatory and reputational risk.

**Items needing your review:**
- Whether the Tier 1 disclosure templates fit our specific products
- Whether our Article 50(2) machine-readable marking strategy is sufficient
- Whether deepfake / emotion recognition / biometric categorization disclosures (if applicable) meet your bar
- Public AI disclosure page language (`t1-06`)

**Documents to read:** All Tier 1 templates, `t1-06` in particular  
**Estimated time:** 20-30 minutes

---

### Priority 5: Policy adoption (`t2-06`)

**Why it matters:** Policy adoption requires top-management approval and should reflect our actual practice (not aspirational language).

**Items needing your review:**
- Section 4 (Roles and responsibilities) — confirm our actual assignments
- Section 7.1 (Article 50 transparency) — confirm we will implement before launch dates
- Section 9 (Incident handling) — confirm escalation thresholds work for our org
- Definitions (§14) — confirm consistent with how we use terms in contracts

**Documents to read:** `t2-06` (full policy)  
**Estimated time:** 15-25 minutes

---

## Suggested 1-hour review-call agenda

| Minutes | Topic | Outcome |
|---|---|---|
| 0-5 | Context: what's in the pack, what we want from this call | Aligned scope |
| 5-15 | Priority 1 — Provider/deployer determinations | Confirmed roles or flagged for follow-up |
| 15-25 | Priority 2 — Risk classifications | Confirmed classifications or escalations |
| 25-35 | Priority 3 — Article 25 / Article 50 implementation | Action items for engineering |
| 35-45 | Priority 5 — Policy adoption | Edits + approval timeline |
| 45-55 | Open questions, gaps, follow-ups | Action register |
| 55-60 | Next steps and review cadence | Scheduled |

---

## Open questions / gaps {{ company_name }} flagged

The TrustFolder pack identified the following open questions that require {{ company_name }}'s judgment plus counsel input:

{{ #each open_questions }}
{{ @index_plus_1 }}. {{ this }}
{{ /each }}

Counsel input requested on each.

---

## Documents not in this pack (and why)

The following are NOT in the pack — by design — but may be relevant to your review:

- **Vendor agreements** — These are {{ company_name }}'s contracts; please bring relevant ones (especially with foundation-model providers) to the review call
- **Privacy Policy / DPA** — Your privacy lead has these; the AI policy intersects with them
- **Existing security policies** — Particularly if {{ company_name }} is ISO 27001 aligned
- **Customer contracts with AI clauses** — These define our representations about AI to customers
- **Internal product architecture docs** — Useful for technical accuracy of the inventory

---

## Engagement model with TrustFolder

TrustFolder provides preparatory AI governance documentation. Our role:
- Generated this pack from advisor-reviewed master templates and {{ company_name }}'s answers
- Will update the pack on regulatory changes (regulatory watch maintained at https://trustfolder.com/regulatory-watch)
- Will not represent {{ company_name }} to regulators, customers, or other parties
- Does not provide legal advice

If counsel review surfaces material gaps in TrustFolder's pack, please contact TrustFolder support — we update master templates regularly and want to know.

---

## Confidence band: {{ confidence_band }}

This handoff pack reflects the highest uncertainty present in any individual document of the readiness pack:

{{ #if confidence_band == "CLEAR" }}
**Most items in the pack have clear classifications.** Counsel review can focus on policy adoption and Article 50 implementation specifics.
{{ /if }}

{{ #if confidence_band == "REVIEW" }}
**Multiple items flagged for review.** Counsel time should focus on Priority 1, 2, and 3 items above before policy adoption.
{{ /if }}

{{ #if confidence_band == "UNCERTAIN" }}
**Several uncertainties surfaced.** Counsel review may need to be split across two sessions: first to gather additional facts, second to confirm classifications and approve documents.
{{ /if }}

---

## Disclaimer

This handoff pack is generated by TrustFolder for preparatory and informational purposes. It is NOT a legal opinion. The classifications, policies, and procedures contained in the pack are AI-generated drafts requiring qualified legal counsel review before adoption or external use. TrustFolder is not a law firm, does not provide legal advice, and is not a substitute for qualified counsel.

Always have qualified legal counsel review the full pack before reliance. Regulatory requirements change — see https://trustfolder.com/regulatory-watch for current status.

---

## Sources and references

All documents in the pack cite their relevant EU AI Act articles, Annex provisions, and ISO/IEC 42001 controls. Primary sources:
- EU AI Act (Regulation (EU) 2024/1689): https://eur-lex.europa.eu/eli/reg/2024/1689/oj
- ISO/IEC 42001:2023: https://www.iso.org/standard/81230.html
- TrustFolder regulatory watch: https://trustfolder.com/regulatory-watch

---

*Generated by TrustFolder · v0.9 master template · {{ generation_date }}*
