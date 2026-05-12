---
template_id: t2-03-risk-classification-memo
title: AI Risk Classification Memo
tier: 2
ai_act_reference: Articles 5, 6, 50, Annex III
iso_42001_reference: A.5 (Assessing impacts of AI systems), Clause 6 (Planning)
generated_when: ALWAYS — every Tier 2 customer gets this
confidence_bands_applicable: [CLEAR, REVIEW, UNCERTAIN, SOFT-OUT]
version: 0.9
last_updated: 2026-05-08
---

# AI Risk Classification Memo Template

## AI engine instructions

Generate a per-system risk classification memo using the EU AI Act's tier framework: prohibited / high-risk / limited-risk / minimal-risk. **HIGHEST-STAKES TEMPLATE** — false-CLEAR is the worst outcome. Default to REVIEW or UNCERTAIN when in doubt.

**Inputs needed:**
- `{{ company_name }}`
- `{{ ai_systems[] }}` from inventory
- Each system's: purpose, data subjects, deployment context, third-party models
- `{{ governance_contact }}`

**Per-system classification:**
- HARD-OUT (PROHIBITED) — Article 5 prohibitions trigger refund
- HARD-OUT (HIGH-RISK) — Annex III high-risk verticals trigger refund
- LIMITED-RISK + Article 50 — chatbots, content generation, deepfakes, emotion recognition (permitted contexts), biometric categorization (permitted)
- MINIMAL-RISK — recommendation systems, internal-only AI, no individual decisions
- UNCERTAIN — insufficient information

**Confidence band:** Per system. Defaults to REVIEW if any feature touches sensitive data, decisions affecting individuals, or high-volume EU users.

**Output formats:** Markdown (canonical), PDF (for lawyer handoff).

---

## Customer-facing content (markdown)

# AI Risk Classification Memo — {{ company_name }}

**Memo date:** {{ generation_date }}  
**Owner:** {{ governance_contact }}  
**Purpose:** Per-system EU AI Act risk classification with confidence bands  
**Status:** Preparatory assessment. Final classifications require qualified legal counsel.

---

## The classification framework

The EU AI Act classifies AI systems into four tiers, each with different obligations:

| Tier | Reference | What it means |
|---|---|---|
| **Prohibited** | Article 5 | Banned in the EU. Cannot be deployed. |
| **High-risk** | Annex III, Article 6 | Heavy obligations: conformity assessment, registration, monitoring |
| **Limited-risk** | Article 50 | Transparency obligations only |
| **Minimal-risk** | None specific | No specific AI Act obligations; voluntary codes apply |

We add an internal layer — **confidence bands** — to ensure no classification is overstated:

- **CLEAR**: high-confidence classification
- **REVIEW**: classification is plausible but warrants legal review
- **UNCERTAIN**: cannot classify with current data
- **SOFT-OUT**: sensitive area; human triage needed before relying on classification
- **HARD-OUT**: prohibited or high-risk; out of TrustFolder's v1 scope

---

## Summary table

| AI System | Classification | Article reference | Confidence | Action |
|---|---|---|---|---|
{{ #each ai_systems }}
| {{ this.name }} | {{ this.classification }} | {{ this.classification_citation }} | {{ this.confidence_band }} | {{ this.recommended_action }} |
{{ /each }}

---

## Per-system analysis

{{ #each ai_systems }}

### {{ this.name }}

**Classification:** {{ this.classification }}  
**Citation:** {{ this.classification_citation }}  
**Confidence band:** {{ this.confidence_band }}

**Description:** {{ this.description }}

**Risk-relevant facts:**
{{ #each this.risk_facts }}
- {{ this }}
{{ /each }}

**Analysis:**

{{ #if this.classification == "limited-risk" }}
This system likely falls within the **limited-risk** category under Article 50 of the AI Act because:
- {{ this.limited_risk_basis }}

The applicable obligation is the relevant transparency obligation under Article 50:
{{ this.specific_article_50_obligation }}

**This means {{ company_name }} should:**
- {{ this.transparency_action_1 }}
- {{ this.transparency_action_2 }}
- {{ this.transparency_action_3 }}

These actions are addressed in TrustFolder Tier 1 templates: {{ this.tier_1_template_references }}.

**This is NOT a determination that {{ company_name }} or this system "is compliant" with Article 50.** Compliance is achieved by implementing the transparency measures and maintaining them over time. This memo identifies which obligations apply.
{{ /if }}

{{ #if this.classification == "minimal-risk" }}
This system likely falls within the **minimal-risk** category under the AI Act because:
- {{ this.minimal_risk_basis }}

The AI Act imposes no specific obligations on minimal-risk AI systems. However, voluntary codes of conduct (Article 95) apply, and good practice — particularly for B2B vendors — includes:
- Documenting the system in {{ company_name }}'s AI inventory
- Implementing voluntary governance practices aligned with ISO/IEC 42001
- Providing transparency to users where appropriate (even when not legally required)
- Including the system in vendor questionnaire responses

**Even minimal-risk classification can shift if the system's purpose changes.** This classification is reviewable as the system evolves.
{{ /if }}

{{ #if this.classification == "potentially_high_risk" }}
This system **may fall within the high-risk category** under Annex III of the AI Act. Specifically:
- {{ this.high_risk_basis }}
- Annex III reference: {{ this.annex_iii_reference }}

**This is a CRITICAL determination.** High-risk classification triggers extensive obligations including conformity assessment, registration in the EU database, post-market monitoring, and (for certain deployers) fundamental rights impact assessments. TrustFolder cannot definitively classify high-risk systems — qualified counsel is required.

**TrustFolder's stance:** This system requires legal review before {{ company_name }} continues operating it for EU users. We recommend:
1. Pause expansion to EU users until counsel review is complete
2. Engage AI/regulatory counsel for definitive classification
3. If counsel confirms high-risk, prepare for full Annex III obligations or modify the system to remain limited-risk
{{ /if }}

{{ #if this.classification == "uncertain" }}
**This system cannot be confidently classified from current information.** The facts available are insufficient to choose between possible classifications. Specifically:
- {{ this.uncertainty_reasons }}

**Recommended action:**
1. Gather additional information: {{ this.required_information }}
2. Bring to qualified counsel with the additional information
3. Until classification is resolved, treat the system conservatively (apply both transparency and additional governance practices)
{{ /if }}

{{ #if this.classification == "soft-out" }}
**This system is in a sensitive area requiring human triage before reliance on automated classification.** Specifically:
- {{ this.soft_out_reasons }}

TrustFolder's automated assessment cannot reliably classify this system. We will route this to founder review within 24 hours and follow up with you directly.
{{ /if }}

{{ #if this.classification == "hard-out" }}
**This system appears to fall within a prohibited or high-risk vertical.** Specifically:
- {{ this.hard_out_reasons }}

TrustFolder cannot generate a risk classification for prohibited or high-risk AI systems. {{ company_name }} should:
1. Pause deployment of this system in the EU pending qualified legal review
2. Engage specialized AI/regulatory counsel
3. Assess whether the system can be modified to fall outside prohibited/high-risk categories

If this is a misclassification (the system is NOT actually in a regulated vertical), please contact TrustFolder support with corrected information.
{{ /if }}

**Recommended next actions for this system:**

{{ #each this.next_actions }}
- {{ this }}
{{ /each }}

---
{{ /each }}

## Cross-system patterns

{{ #if has_multiple_systems }}
{{ company_name }} operates {{ ai_systems_count }} AI systems with the following risk distribution:

- {{ limited_risk_count }} system(s) likely limited-risk
- {{ minimal_risk_count }} system(s) likely minimal-risk
- {{ review_count }} system(s) flagged for legal review
- {{ uncertain_count }} system(s) with uncertain classification
- {{ soft_out_count }} system(s) in soft-out triage
- {{ hard_out_count }} system(s) in hard-out (refund issued where applicable)

**Pattern observations:**
{{ #each pattern_observations }}
- {{ this }}
{{ /each }}
{{ /if }}

---

## Limitations of this assessment

This memo is based on:
- Information extracted from {{ company_name }}'s public website
- {{ company_name }}'s answers to the TrustFolder questionnaire
- The state of EU AI Act guidance as of {{ generation_date }}

This memo does NOT account for:
- Confidential information not provided to TrustFolder
- National-level enforcement guidance specific to {{ company_name }}'s EU jurisdictions
- Pending regulatory changes (track in TrustFolder regulatory watch)
- {{ company_name }}'s specific contractual context with vendors and customers
- Evolving European Commission and AI Office implementing acts

---

## Confidence band: {{ confidence_band }} (overall)

{{ #if confidence_band == "CLEAR" }}
**Most systems classified with high confidence.** Limited-risk transparency obligations are the dominant pattern. Implementation of Tier 1 templates addresses the primary obligations.
{{ /if }}

{{ #if confidence_band == "REVIEW" }}
**Requires legal/compliance review.** One or more systems have classifications warranting counsel review before reliance. Specific systems are flagged in the per-system analysis.
{{ /if }}

{{ #if confidence_band == "UNCERTAIN" }}
**Multiple systems cannot be confidently classified from current information.** Counsel review with additional facts is required.
{{ /if }}

---

## Disclaimer

This risk classification memo is generated by TrustFolder for preparatory and informational purposes. Risk classification under the EU AI Act is one of the highest-stakes assessments and TrustFolder's preparatory assessment does NOT substitute for qualified legal counsel.

Always review this memo with qualified AI/regulatory counsel before relying on classifications for: regulatory submissions, vendor questionnaire responses, customer assurances, contractual representations, or material business decisions. Regulatory requirements change — see https://trustfolder.com/regulatory-watch for current status.

---

## Sources

- EU AI Act (Regulation (EU) 2024/1689), Articles 5, 6, 50, Annex III
- https://eur-lex.europa.eu/eli/reg/2024/1689/oj
- ISO/IEC 42001:2023, Annex A.5 (Assessing impacts of AI systems), Clause 6 (Planning)
- TrustFolder learning notes: `docs/09-learning-notes/00-article-50-transparency-obligations.md`, `03-risk-classification-framework.md`

---

*Generated by TrustFolder · v0.9 master template · {{ generation_date }}*
