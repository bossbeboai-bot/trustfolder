---
template_id: t1-04-emotion-recognition-notice
title: Emotion Recognition System Disclosure
tier: 1
article_50_reference: 50(3) [emotion recognition information]
ai_act_prohibition_reference: Article 5(1)(f) [workplace/education prohibition]
generated_when: customer uses emotion recognition (sentiment analysis on humans, affective computing)
confidence_bands_applicable: [REVIEW, SOFT-OUT, HARD-OUT]
version: 0.9
last_updated: 2026-05-08
---

# Emotion Recognition System Disclosure Template

## AI engine instructions

Generate an emotion recognition disclosure notice. **CRITICAL:** Emotion recognition is one of the riskiest categories under the AI Act. The template must lead with prohibition checks.

**Inputs needed:**
- `{{ company_name }}`
- `{{ product_name }}`
- `{{ emotion_recognition_use_case }}` — what is being inferred (mood, frustration, intent, satisfaction)
- `{{ deployment_context }}` — where it operates (workplace? education? consumer-facing? other?)
- `{{ data_subjects }}` — who is being analyzed (employees, students, customers, end-users)

**Confidence band logic:**
- HARD-OUT if deployment_context = "workplace" or "education" (Article 5(1)(f) prohibition)
- HARD-OUT if data_subjects includes children
- SOFT-OUT if deployment_context is unclear or might involve workplace/education
- REVIEW if consumer-facing emotion recognition (legal but high-scrutiny)

**Output formats:** Markdown, HTML, plain text.

---

## Customer-facing content (markdown)

# Emotion Recognition System Disclosure

**Company:** {{ company_name }}  
**Product / feature:** {{ product_name }}  
**Last updated:** {{ generation_date }}

---

## ⚠ Important: prohibited uses under Article 5(1)(f)

Before deploying any emotion recognition system, please confirm your use case is NOT in the following PROHIBITED categories under Article 5(1)(f) of the EU AI Act (Regulation (EU) 2024/1689):

- **Workplace emotion recognition** — emotion recognition systems used to infer emotions of natural persons in the area of workplace
- **Education emotion recognition** — emotion recognition systems used to infer emotions of natural persons in the area of educational institutions

These uses are PROHIBITED in the EU. Limited exceptions exist for medical or safety reasons (e.g., monitoring driver fatigue for road safety).

If your product is used in either of these contexts, you must:
1. **Stop deployment in those contexts immediately**
2. **Consult specialized legal counsel before continuing**
3. **Do NOT rely on this disclosure template for prohibited uses**

## What this notice covers (for permitted contexts only)

For uses outside the prohibited categories, {{ product_name }} performs emotion recognition: it infers {{ emotion_recognition_use_case }} from {{ data_subjects }}.

Under Article 50 of the EU AI Act, persons subject to emotion recognition systems must be informed of the system's operation.

## What you must disclose

Persons exposed to {{ product_name }}'s emotion recognition system must be informed:

1. **That an emotion recognition system is being applied** to them
2. **What emotional states the system attempts to infer**
3. **What the inferred emotional states are used for**
4. **What rights they have**, including (where applicable):
   - Right to object to the processing
   - Right to access their data
   - Right to request human review of decisions
   - Right to withdraw consent (where consent is the legal basis)

The disclosure must be:
- Clear and distinguishable
- Provided at the time of first interaction or exposure (or before)
- Provided in a language understood by the affected person

## Standard disclosure language

> **Emotion recognition notice**  
> {{ product_name }} uses AI to infer {{ emotion_recognition_use_case }} from your interactions. The inferred information is used for [purpose: e.g., quality improvement, response personalization, support routing]. Inferred emotional states are not always accurate. You can opt out by [opt-out mechanism]. For more information about how your data is processed, see our Privacy Policy.

## Data protection overlap (GDPR)

Emotion data may constitute special-category personal data under Article 9 of the GDPR depending on what is being inferred and the context. We strongly recommend:

- Conducting a Data Protection Impact Assessment (DPIA) under Article 35 GDPR
- Identifying the lawful basis under Article 6 (and Article 9 if applicable)
- Implementing data minimization — only inferring emotions when strictly necessary
- Setting clear retention periods for inferred emotional states

## What {{ product_name }} commits to

- We provide tooling for our deployers to implement the disclosures above
- We do not deploy {{ product_name }} for prohibited workplace or education emotion recognition
- We require deployer attestation regarding deployment context where feasible

## What deployers must do

1. **Audit your deployment context.** Confirm you are NOT using emotion recognition in workplace or educational settings.
2. **Implement the disclosure** in user-facing interfaces.
3. **Conduct a DPIA** under GDPR.
4. **Configure data retention** for inferred emotional states.
5. **Provide opt-out mechanisms** where required.
6. **Document the deployment** in your AI system inventory (see TrustFolder Tier 2 inventory template).

---

## Confidence band: {{ confidence_band }}

{{ #if confidence_band == "REVIEW" }}
**Requires legal/compliance review.** Emotion recognition is a sensitive AI category with overlapping obligations under the AI Act, GDPR, and potentially national law. Review carefully with qualified counsel before deployment.
{{ /if }}

{{ #if confidence_band == "SOFT-OUT" }}
**Out of automated scope — please contact us for review.** Your deployment context appears unclear or may involve prohibited workplace/education uses. Human triage required before proceeding.
{{ /if }}

{{ #if confidence_band == "HARD-OUT" }}
**Out of v1 scope — automatic refund issued.** Your use case appears to be in a PROHIBITED category under Article 5(1)(f) of the AI Act (workplace or education emotion recognition). TrustFolder cannot generate compliance documentation for prohibited uses. We strongly recommend specialized legal counsel.
{{ /if }}

---

## Disclaimer

This disclosure template is generated by TrustFolder for preparatory and informational purposes. Emotion recognition systems carry elevated legal risk. This template is an AI-generated draft based on advisor-reviewed master templates and the information you provided. It does not constitute legal advice, certification, or guaranteed compliance.

Always review this template and your deployment context with qualified legal counsel before deploying. Regulatory requirements change — see https://trustfolder.com/regulatory-watch for current status.

---

## Sources

- EU AI Act (Regulation (EU) 2024/1689), Article 5(1)(f) — prohibitions
- EU AI Act, Article 50 — transparency obligations
- https://eur-lex.europa.eu/eli/reg/2024/1689/oj
- GDPR (Regulation (EU) 2016/679), Articles 9, 35

---

*Generated by TrustFolder · v0.9 master template · {{ generation_date }}*
