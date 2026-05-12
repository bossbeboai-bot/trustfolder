---
template_id: t1-05-biometric-categorization-notice
title: Biometric Categorization System Disclosure
tier: 1
article_50_reference: 50(3) [biometric categorization information]
ai_act_prohibition_reference: Article 5(1)(g) [sensitive-attribute categorization prohibition]
generated_when: customer uses biometric categorization (NOT identification — categorization only)
confidence_bands_applicable: [REVIEW, SOFT-OUT, HARD-OUT]
version: 0.9
last_updated: 2026-05-08
---

# Biometric Categorization Disclosure Template

## AI engine instructions

Generate a biometric categorization disclosure notice. **CRITICAL:** This is among the most heavily restricted AI categories. Lead with prohibition checks.

**Inputs needed:**
- `{{ company_name }}`
- `{{ product_name }}`
- `{{ categorization_purpose }}` — what is inferred from biometric data (e.g., age range, gender presentation, attentiveness)
- `{{ data_subjects }}` — who is being categorized
- `{{ deployment_context }}` — where deployed

**Confidence band logic:**
- HARD-OUT if categorization infers: race, political opinions, trade union membership, religious/philosophical beliefs, sex life, sexual orientation (Article 5(1)(g) prohibition)
- HARD-OUT if categorization is for biometric identification (different category — Annex III high-risk)
- SOFT-OUT if categorization purpose is unclear
- REVIEW for permitted categorization purposes

**Output formats:** Markdown, HTML, plain text.

---

## Customer-facing content (markdown)

# Biometric Categorization System Disclosure

**Company:** {{ company_name }}  
**Product / feature:** {{ product_name }}  
**Last updated:** {{ generation_date }}

---

## ⚠ Important: prohibited categorizations under Article 5(1)(g)

Before deploying any biometric categorization system, you MUST confirm your system does NOT categorize natural persons by:

- Race
- Political opinions
- Trade union membership
- Religious or philosophical beliefs
- Sex life
- Sexual orientation

These categorizations are PROHIBITED under Article 5(1)(g) of the EU AI Act (Regulation (EU) 2024/1689). Limited exceptions exist for the labeling/filtering of lawfully acquired biometric datasets and for law enforcement under specific conditions — but for general commercial use, the prohibition is absolute.

If your system performs any of these prohibited categorizations:
1. **Stop deployment immediately**
2. **Consult specialized legal counsel**
3. **Do NOT use this disclosure template — TrustFolder cannot prepare documentation for prohibited uses**

## Distinction: categorization vs identification

This notice covers **biometric categorization** — the inference of attributes (e.g., age range, attentiveness) from biometric data. It does NOT cover **biometric identification** (identifying a specific person from biometric data).

Biometric IDENTIFICATION is classified as high-risk under Annex III(1) of the AI Act and requires extensive conformity assessment beyond TrustFolder's v1 scope. If your system performs biometric identification, contact us before continuing.

## What this notice covers (for permitted categorization only)

For categorization that is NOT prohibited under Article 5(1)(g) and NOT identification, {{ product_name }} infers {{ categorization_purpose }} from biometric data of {{ data_subjects }}.

Common permitted categorization purposes include:
- Age range estimation (for age verification, content rating)
- Liveness detection (for fraud prevention)
- Attention tracking (for accessibility, UX research with consent)
- Aggregate demographic insights (for analytics, fully anonymized)

## What you must disclose

Under Article 50 of the AI Act, persons exposed to biometric categorization systems must be informed of the system's operation.

The disclosure must include:

1. **That a biometric categorization system is being applied** to them
2. **What attributes are being inferred**
3. **What the inferred attributes are used for**
4. **What rights they have**, including (where applicable):
   - Right to object to the processing
   - Right to access their data
   - Right to request human review of decisions
   - Right to withdraw consent (where consent is the legal basis)
   - Right to lodge a complaint with a supervisory authority

The disclosure must be:
- Clear and distinguishable
- Provided at the time of first interaction or exposure (or before)
- In a language understood by the affected person

## Standard disclosure language

> **Biometric categorization notice**  
> {{ product_name }} uses AI to infer {{ categorization_purpose }} from your biometric data. This inference is used for [specific purpose]. We do NOT infer race, political opinions, trade union membership, religious beliefs, sex life, or sexual orientation. The inferred information is retained for [retention period]. You can opt out by [mechanism]. For details, see our Privacy Policy.

## Data protection overlap (GDPR)

Biometric data is special-category personal data under Article 9 GDPR. You must:

- Identify the lawful basis under Article 6 AND a condition under Article 9
- Conduct a Data Protection Impact Assessment (DPIA) under Article 35
- Implement strict data minimization
- Set short retention periods for biometric data
- Provide easy opt-out mechanisms
- Document everything in your records of processing activities

## What {{ product_name }} commits to

- We do not categorize on prohibited attributes
- We provide deployer tooling to implement the disclosures above
- We retain biometric data for the minimum period necessary
- We support data subject rights requests through deployer interfaces

## What deployers must do

1. **Audit your categorization purposes.** Confirm none fall under Article 5(1)(g) prohibitions.
2. **Confirm this is categorization, not identification.** If it is identification, this template does NOT apply.
3. **Implement the disclosure** in user-facing interfaces.
4. **Conduct a DPIA** under GDPR.
5. **Set strict retention periods** for biometric data.
6. **Provide opt-out / consent mechanisms** as required.
7. **Document the deployment** in your AI system inventory.

---

## Confidence band: {{ confidence_band }}

{{ #if confidence_band == "REVIEW" }}
**Requires legal/compliance review.** Biometric categorization is a sensitive AI category. Verify your specific use case is permitted, then review with qualified counsel before deployment.
{{ /if }}

{{ #if confidence_band == "SOFT-OUT" }}
**Out of automated scope — please contact us for review.** Your categorization purpose appears unclear or may approach prohibited categorizations. Human triage required.
{{ /if }}

{{ #if confidence_band == "HARD-OUT" }}
**Out of v1 scope — automatic refund issued.** Your system appears to perform prohibited biometric categorization (Article 5(1)(g)) or biometric identification (Annex III(1) high-risk). TrustFolder cannot generate documentation for these uses. Specialized legal counsel required.
{{ /if }}

---

## Disclaimer

This disclosure template is generated by TrustFolder for preparatory and informational purposes. Biometric AI systems carry significantly elevated legal risk. This template is an AI-generated draft. It does not constitute legal advice, certification, or guaranteed compliance.

Always review this template AND your deployment with qualified legal counsel before deployment. Specialized counsel is strongly recommended for biometric AI systems. See https://trustfolder.com/regulatory-watch for current status.

---

## Sources

- EU AI Act (Regulation (EU) 2024/1689), Article 5(1)(g) — prohibitions
- EU AI Act, Annex III(1) — high-risk biometric identification
- EU AI Act, Article 50 — transparency obligations
- https://eur-lex.europa.eu/eli/reg/2024/1689/oj
- GDPR (Regulation (EU) 2016/679), Articles 9, 35

---

*Generated by TrustFolder · v0.9 master template · {{ generation_date }}*
