---
template_id: t2-07-human-oversight-procedure
title: Human Oversight Procedure
tier: 2
ai_act_reference: Articles 14, 26(2), 26(3) (deployer human oversight)
iso_42001_reference: A.9 (Use of AI systems)
generated_when: ALWAYS — every Tier 2 customer gets this
confidence_bands_applicable: [CLEAR, REVIEW]
version: 0.9
last_updated: 2026-05-08
---

# Human Oversight Procedure Template

## AI engine instructions

Generate a per-AI-system human oversight procedure. Most B2B AI SaaS use cases are limited-risk (Article 50), so Article 14 obligations technically apply primarily to high-risk systems — BUT good practice (and ISO 42001) calls for oversight regardless of risk tier. This template establishes proportionate oversight.

**Inputs needed:**
- `{{ company_name }}`
- `{{ ai_systems[] }}` from inventory
- Each system's: purpose, output type, decision-impact, deployment context
- `{{ governance_contact }}`

**Per-system oversight design:**
- Define what humans do (review, approve, intervene, escalate)
- Define when they do it (every output, sample, on-trigger, post-hoc)
- Define who they are (role, escalation path)
- Define what tooling supports them

**Confidence band:** CLEAR for standard chatbot/content systems. REVIEW for systems making decisions about individuals.

**Output formats:** Markdown (canonical), PDF (for handbook).

---

## Customer-facing content (markdown)

# Human Oversight Procedure — {{ company_name }}

**Effective date:** {{ generation_date }}  
**Owner:** {{ governance_contact }}  
**Review cadence:** Annually + on system changes

---

## Why human oversight matters

Even when an AI system is classified as limited-risk under the EU AI Act, human oversight remains best practice because:

- **AI outputs can be wrong** — language models hallucinate, vision systems misclassify, recommenders amplify bias
- **Customers expect a human in the loop** for material decisions
- **Vendor questionnaires increasingly ask** specifically about oversight
- **ISO/IEC 42001:2023 Annex A.9** requires processes for responsible use, including oversight
- **High-risk AI systems** (Article 14 of the AI Act) require specific oversight, and best practice for limited-risk systems is to mirror these principles proportionately

This procedure specifies, per AI system, the oversight {{ company_name }} maintains.

---

## Oversight design principles

1. **Proportionate to impact.** Higher-impact outputs get heavier oversight. A chatbot answering "what are your support hours" needs less oversight than a chatbot recommending product upgrades.
2. **Practical and sustainable.** Oversight that is too heavy gets bypassed. Aim for the minimum effective level.
3. **Tied to specific decisions.** "Human reviews everything" is unfocused. Specify which decisions get reviewed.
4. **Escalation paths defined.** Reviewers must know who to escalate to, with what timeline.
5. **Tooling-supported.** Reviewers need interfaces, dashboards, and logs that make oversight feasible.
6. **Documented and auditable.** Oversight events are recorded in the evidence tracker.

---

## Oversight modes

| Mode | Definition | When appropriate |
|---|---|---|
| **Pre-deployment review** | Human reviews and approves before AI system is deployed or its model is changed | All systems, before launch |
| **Pre-output approval** | Human approves each individual AI output before it reaches a customer | Highest-impact decisions only |
| **Sample review** | Human reviews a statistical sample of outputs (e.g., 5% per week) | High-volume systems with material impact |
| **Trigger-based review** | Human reviews outputs that match specific triggers (low confidence, flagged content, novel inputs) | Most production systems |
| **On-request review** | Human reviews outputs only when a user requests | Low-impact systems with opt-in review |
| **Post-hoc review** | Human reviews aggregated metrics and incidents after the fact | All systems, complementing other modes |
| **Kill-switch** | Human can disable the AI system | All production systems (always required) |

---

## Per-system oversight specifications

{{ #each ai_systems }}

### {{ this.name }}

**System ID:** {{ this.id }}  
**Risk classification:** {{ this.classification }} ({{ this.confidence_band }})  
**Owner:** {{ this.owner }}  
**Reviewer role(s):** {{ this.reviewer_roles }}

**Oversight modes applied:**

{{ #each this.oversight_modes }}
- **{{ this.mode }}** — {{ this.specification }}
{{ /each }}

**Triggers for review:**
{{ #each this.triggers }}
- {{ this }}
{{ /each }}

**Escalation path:**
1. {{ this.escalation_step_1 }}
2. {{ this.escalation_step_2 }}
3. {{ this.escalation_step_3 }}

**Tooling:**
- {{ this.tooling }}

**Logging:**
- All reviews are logged with: timestamp, reviewer, output reviewed, decision (approve / modify / block / escalate), reasoning if non-approve
- Logs are retained per {{ company_name }}'s data retention policy
- Logs are reviewed in monthly cadence to identify patterns

**Kill-switch:**
- {{ this.kill_switch_description }}
- Authority to disable: {{ this.kill_switch_authority }}

**Performance metrics:**
- {{ this.metrics }}

---
{{ /each }}

## Reviewer training and competence

Reviewers must:
- Complete AI governance awareness training annually
- Complete role-specific reviewer training before being assigned reviews
- Demonstrate understanding of: the AI system's purpose, its known failure modes, the escalation path, and the recording requirements
- Be empowered (organizationally and culturally) to block or escalate without retaliation

Training records are maintained in the evidence tracker (`t2-05`).

## Reviewer authority

For each AI system, the assigned reviewers have explicit authority to:
- Approve, modify, or block individual outputs (per oversight mode)
- Pause the AI system for triage (within scope per system)
- Request kill-switch activation through the escalation path
- Refuse to approve outputs they cannot justify

This authority is documented and reinforced in onboarding.

## Records of oversight

For each AI system, the following oversight records are maintained:

- **Per-event log** — every review event (approve, modify, block, escalate) with metadata
- **Aggregate metrics** — review volumes, approval rates, escalation rates, time-to-review
- **Incident records** — outputs that bypassed oversight or where oversight failed (in evidence tracker)
- **Training records** — reviewer training completion

Records are kept for at least [retention period — recommended 24 months] or as required by applicable law / customer contracts.

## Procedure review

This procedure is reviewed:
- Annually
- On material change to any AI system
- After any oversight failure or escalation pattern indicating procedure inadequacy
- After regulatory changes affecting oversight requirements

---

## Confidence band: {{ confidence_band }}

{{ #if confidence_band == "CLEAR" }}
**Standard oversight design for B2B AI SaaS limited-risk systems.** Trigger-based review with kill-switch is sufficient for most systems in {{ company_name }}'s inventory.
{{ /if }}

{{ #if confidence_band == "REVIEW" }}
**Requires legal/compliance review.** One or more systems make decisions about individuals or have characteristics warranting heavier oversight than this template's defaults. Counsel review and possible modification recommended before deployment.
{{ /if }}

---

## Disclaimer

This human oversight procedure is generated by TrustFolder for preparatory and informational purposes. It is an AI-generated draft based on advisor-reviewed templates. For systems classified as high-risk under the EU AI Act, Article 14 imposes specific human oversight obligations that go beyond this template — qualified counsel is required.

Always validate this procedure with qualified legal/compliance counsel and adapt it to {{ company_name }}'s actual operations before adoption. See https://trustfolder.com/regulatory-watch for current regulatory status.

---

## Sources

- EU AI Act (Regulation (EU) 2024/1689), Articles 14 (high-risk oversight), 26(2)-26(3) (deployer oversight)
- ISO/IEC 42001:2023, Annex A.9 (Use of AI systems)
- https://eur-lex.europa.eu/eli/reg/2024/1689/oj

---

*Generated by TrustFolder · v0.9 master template · {{ generation_date }}*
