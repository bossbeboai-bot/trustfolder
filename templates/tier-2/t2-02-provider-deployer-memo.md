---
template_id: t2-02-provider-deployer-memo
title: Provider / Deployer Role Memo
tier: 2
ai_act_reference: Articles 3(3), 3(4), 16, 25, 26
generated_when: ALWAYS — every Tier 2 customer gets this
confidence_bands_applicable: [CLEAR, REVIEW, UNCERTAIN]
version: 0.9
last_updated: 2026-05-08
---

# Provider / Deployer Role Memo Template

## AI engine instructions

Generate a memo classifying the customer's role under the EU AI Act for each AI system in their inventory. This is one of the highest-stakes determinations in the pack — getting it wrong can mean preparing entirely wrong documentation. Confidence-band-conservatism is essential.

**Inputs needed:**
- `{{ company_name }}`
- `{{ ai_systems[] }}` — full inventory
- `{{ third_party_models[] }}`
- `{{ has_white_label_products }}` — bool: does customer white-label any AI products
- `{{ has_fine_tuned_models }}` — bool: does customer fine-tune any models
- `{{ has_substantial_modifications }}` — bool: does customer substantially modify AI systems
- `{{ governance_contact }}`

**Per-system role-determination logic:**
- DEPLOYER if customer uses third-party AI under their authority without substantially modifying it
- PROVIDER if customer develops AI or places it on the market under their own name/trademark
- BOTH if mixed (e.g., deployer of base LLM + provider of fine-tuned variant)
- UNCERTAIN if facts don't clearly map (escalate to legal review)

**Confidence band:** Default CLEAR for typical B2B SaaS using third-party LLM APIs. REVIEW if customer fine-tunes / white-labels / substantially modifies. UNCERTAIN if any borderline.

**Output formats:** Markdown (canonical), PDF (for lawyer review).

---

## Customer-facing content (markdown)

# Provider / Deployer Role Memo — {{ company_name }}

**Memo date:** {{ generation_date }}  
**Owner:** {{ governance_contact }}  
**Purpose:** Determine, per AI system, {{ company_name }}'s role under the EU AI Act, and the obligations attaching to that role.  
**Status:** Preparatory assessment. Final determinations require qualified legal counsel.

---

## Why role determination matters

The EU AI Act assigns different obligations to different actors in the AI value chain. A company can be a **provider**, a **deployer**, or both, simultaneously, for different AI systems. The obligations differ substantially.

| Role | Definition (Art. 3) | Key obligations |
|---|---|---|
| **Provider** (Art. 3(3)) | Develops an AI system or has it developed and places it on the market or puts it into service under its own name or trademark | Conformity assessment (high-risk), technical documentation, quality management, EU database registration (high-risk), incident reporting, Article 50 design obligations |
| **Deployer** (Art. 3(4)) | Uses an AI system under its authority (excluding personal non-professional use) | Use per instructions, human oversight, monitoring, fundamental rights impact assessment (high-risk, certain deployers), Article 50 user-facing obligations |

Article 25 explicitly extends provider obligations to actors who put their name on a high-risk AI system, make substantial modifications, or change the intended purpose so the system becomes high-risk.

---

## Summary table

| AI System | Our role | Confidence | Trigger |
|---|---|---|---|
{{ #each ai_systems }}
| {{ this.name }} | {{ this.our_role }} | {{ this.role_confidence }} | {{ this.role_trigger }} |
{{ /each }}

---

## Per-system analysis

{{ #each ai_systems }}

### {{ this.name }}

**Determined role:** {{ this.our_role }}  
**Confidence band:** {{ this.role_confidence }}  
**Article reference:** {{ this.role_article_reference }}

**Facts considered:**
{{ #each this.role_facts }}
- {{ this }}
{{ /each }}

**Reasoning:**

{{ #if this.our_role == "deployer" }}
{{ company_name }} appears to be a **deployer** of this AI system because:
- The underlying AI model ({{ this.underlying_models }}) is developed and placed on the market by a third party
- {{ company_name }} does not place this AI system on the market or put it into service under its own name as a separately distinguishable AI system
- {{ company_name }} integrates and uses the AI under its authority within its product

**Deployer obligations (key items):**
- Use the AI system in accordance with the provider's instructions for use
- Implement appropriate human oversight measures (Art. 26(2))
- Monitor operation and report serious incidents to the provider (Art. 26(5))
- Ensure transparency obligations under Article 50 are met for end-users
- Where applicable as a deployer of a high-risk AI system in specific public-sector contexts: conduct a fundamental rights impact assessment under Article 27 (NOT applicable here, as this system is not classified as high-risk)
- Cooperate with competent authorities (Art. 26(11))
{{ /if }}

{{ #if this.our_role == "provider" }}
{{ company_name }} appears to be a **provider** of this AI system because:
- {{ company_name }} {{ this.provider_basis }}
- The AI system is placed on the market or put into service under {{ company_name }}'s name or trademark
- {{ company_name }} bears the responsibility for compliance of this AI system

**Provider obligations (key items, applicable in proportion to the system's risk classification):**
- Ensure the AI system meets applicable AI Act requirements (Art. 16)
- Maintain technical documentation (Art. 11, for high-risk; voluntary for non-high-risk)
- Implement a quality management system (Art. 17, for high-risk)
- Where applicable, register the AI system in the EU database (Art. 49, for high-risk)
- Implement post-market monitoring (Art. 72, for high-risk)
- Report serious incidents (Art. 73, for high-risk)
- Implement Article 50 transparency design obligations
- Cooperate with competent authorities
{{ /if }}

{{ #if this.our_role == "both" }}
{{ company_name }} appears to be **both a provider and a deployer** with respect to this AI system because:
- {{ this.both_role_basis }}

This dual role typically arises in scenarios such as:
- Fine-tuning or substantially modifying a base model and deploying the result
- White-labeling another provider's AI system under {{ company_name }}'s brand (Article 25)
- Using a third-party model AND offering an integrated AI system under {{ company_name }}'s name

**Both sets of obligations apply.** Provider obligations attach to the resulting AI system that {{ company_name }} places on the market under its own name; deployer obligations attach to the underlying third-party model used in operation.
{{ /if }}

{{ #if this.our_role == "uncertain" }}
**The role is UNCERTAIN.** The facts available to TrustFolder are insufficient to confidently classify {{ company_name }}'s role for this system. Specifically:
- {{ this.uncertainty_reasons }}

**Recommended action:** Bring this system to qualified legal counsel for a definitive role determination. Until then, treat both provider and deployer obligations as potentially applicable, and document the uncertainty in your evidence tracker.
{{ /if }}

**Citation:** {{ this.role_article_reference }}

---
{{ /each }}

## Article 25 review

Article 25 of the AI Act extends provider obligations to actors who:
1. Put their name or trademark on a high-risk AI system already placed on the market
2. Make a substantial modification to a high-risk AI system that remains high-risk
3. Modify the intended purpose of an AI system (including general-purpose AI) such that it becomes high-risk

**{{ company_name }}'s exposure to Article 25:**

{{ #if has_white_label_products }}
- White-labeling: {{ company_name }} places one or more AI products on the market under its own name. Per Article 25(1)(a), if any such system is high-risk, {{ company_name }} would be treated as the provider for AI Act purposes. **Action: confirm whether any white-labeled system is high-risk.**
{{ else }}
- White-labeling: {{ company_name }} does not currently white-label or rebrand third-party AI systems under its name (Article 25(1)(a) trigger). This is an inventory-time confirmation; revisit if business model changes.
{{ /if }}

{{ #if has_substantial_modifications }}
- Substantial modification: {{ company_name }} substantially modifies one or more AI systems. Per Article 25(1)(b), this can trigger provider obligations if the result is or remains high-risk. **Action: review specific modifications with counsel.**
{{ else }}
- Substantial modification: {{ company_name }} does not currently make substantial modifications to AI systems beyond ordinary configuration (Article 25(1)(b) trigger). Revisit if technical practices change.
{{ /if }}

{{ #if has_fine_tuned_models }}
- Fine-tuning: {{ company_name }} fine-tunes one or more models. Fine-tuning may amount to a substantial modification under Article 25 depending on extent. **Action: document fine-tuning scope and review with counsel.**
{{ else }}
- Fine-tuning: {{ company_name }} does not currently fine-tune models beyond prompt engineering and configuration. Revisit if practices change.
{{ /if }}

---

## Open questions for legal counsel

The following items warrant counsel review:

1. {{ #if any_uncertain }}Confirmation of role for systems flagged UNCERTAIN above{{ /if }}
2. {{ #if has_white_label_products }}Article 25(1)(a) analysis for white-labeled systems{{ /if }}
3. {{ #if has_fine_tuned_models }}Whether fine-tuning rises to substantial modification under Article 25(1)(b){{ /if }}
4. National-level enforcement guidance for {{ company_name }}'s primary EU jurisdictions
5. Provider vs deployer responsibility allocation in vendor agreements (especially with foundation-model providers)

---

## Confidence band: {{ confidence_band }}

{{ #if confidence_band == "CLEAR" }}
**Likely deployer of standard third-party AI models.** Most B2B AI SaaS using LLM APIs falls into this pattern. Continue with deployer-aligned obligations.
{{ /if }}

{{ #if confidence_band == "REVIEW" }}
**Requires legal/compliance review.** Your AI systems include configurations (fine-tuning, white-labeling, or substantial modifications) where the provider/deployer line is genuinely contested. Bring this memo and your vendor agreements to qualified counsel.
{{ /if }}

{{ #if confidence_band == "UNCERTAIN" }}
**Cannot confidently classify role from current data.** The facts available are insufficient — specifically around fine-tuning scope, white-labeling extent, or vendor agreement terms. Counsel review required before relying on role determinations externally.
{{ /if }}

---

## Disclaimer

This memo is generated by TrustFolder for preparatory and informational purposes. Provider/deployer determination is one of the highest-stakes assessments under the EU AI Act, and TrustFolder's preparatory assessment does NOT substitute for qualified legal counsel.

Always review this memo with your AI/regulatory counsel, including review of underlying vendor agreements, before relying on it for regulatory submissions, vendor questionnaires, or material business decisions. Regulatory requirements change — see https://trustfolder.com/regulatory-watch for current status.

---

## Sources

- EU AI Act (Regulation (EU) 2024/1689), Articles 3(3), 3(4), 16, 25, 26
- https://eur-lex.europa.eu/eli/reg/2024/1689/oj
- TrustFolder learning note: `docs/09-learning-notes/02-provider-deployer-roles.md`

---

*Generated by TrustFolder · v0.9 master template · {{ generation_date }}*
