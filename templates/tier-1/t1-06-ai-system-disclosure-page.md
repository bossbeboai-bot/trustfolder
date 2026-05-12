---
template_id: t1-06-ai-system-disclosure-page
title: Master AI System Disclosure Page
tier: 1
article_50_reference: 50 (general consolidation)
generated_when: ALWAYS — every Tier 1 customer gets this
confidence_bands_applicable: [CLEAR, REVIEW]
version: 0.9
last_updated: 2026-05-08
---

# AI System Disclosure Page Template

## AI engine instructions

Generate a master "AI Use" disclosure page that the customer publishes on their website. This is the primary public-facing AI transparency artifact. It consolidates all individual disclosures into one accessible page.

**Inputs needed:**
- `{{ company_name }}`
- `{{ company_url }}`
- `{{ ai_systems[] }}` — array of all AI features the customer has
- `{{ third_party_models[] }}` — underlying AI models used
- `{{ data_handling_summary }}` — how user data is processed by AI
- `{{ governance_contact }}` — contact email for AI governance inquiries
- `{{ ai_role }}` — provider / deployer / both
- `{{ has_eu_customers }}` — bool

**Confidence band:** CLEAR for typical B2B SaaS. REVIEW if multiple AI systems with mixed risk profiles.

**Output formats:** Markdown (canonical), HTML (for direct embedding on customer's site), plain text.

---

## Customer-facing content (markdown)

# How {{ company_name }} Uses AI

**Last updated:** {{ generation_date }}  
**Contact for AI governance questions:** {{ governance_contact }}

---

## Our commitment to AI transparency

{{ company_name }} uses artificial intelligence (AI) in our products and services. We are committed to clearly disclosing where, how, and why we use AI, in line with the transparency obligations of Article 50 of the EU AI Act (Regulation (EU) 2024/1689).

This page is our master AI disclosure. It explains:
- Which features use AI
- What the AI does
- What technology powers it
- How we handle your data
- Your rights and options

## AI features in our products

The following features in our products use AI:

{{ #each ai_systems }}
### {{ this.name }}
- **What it does:** {{ this.description }}
- **AI role:** {{ this.ai_function }}
- **EU AI Act classification:** {{ this.classification }}  
- **Disclosure type:** {{ this.disclosure_type }}
- **Where you encounter it:** {{ this.user_touchpoint }}
{{ /each }}

## Underlying AI technology

{{ #if third_party_models }}
We build our AI features on top of foundation models from leading AI providers. The underlying AI models we use include:

{{ #each third_party_models }}
- **{{ this.name }}** ({{ this.provider }}) — {{ this.purpose }}
{{ /each }}

We do not develop these foundation models. We configure, prompt, and integrate them into our products.

**Our role under the EU AI Act:** {{ ai_role }}

- {{ #if ai_role == "deployer" }}As a deployer, we use AI systems under our authority within our products.{{ /if }}
- {{ #if ai_role == "provider" }}As a provider, we place AI systems on the market under our brand.{{ /if }}
- {{ #if ai_role == "both" }}We act as both a provider and deployer depending on the specific AI system.{{ /if }}
{{ /if }}

## How we handle your data

{{ data_handling_summary }}

For comprehensive information, please see our [Privacy Policy] and [Data Processing Agreement].

## Your rights

When you interact with our AI features, you have the following rights:

1. **To know.** You can always ask us which features use AI and how. This page is the starting point.
2. **To opt out.** Where applicable, you can opt out of AI-powered features or request human alternatives. See each feature's settings for opt-out options.
3. **To human review.** For decisions that affect you, you can request human review.
4. **To data subject rights** under GDPR (where applicable): access, rectification, erasure, portability, objection, restriction.
5. **To lodge a complaint** with your data protection supervisory authority.

To exercise any of these rights, contact us at {{ governance_contact }}.

## What our AI does NOT do

To set clear expectations:

- Our AI does not provide legal, medical, financial, or other professional advice.
- Our AI is not always accurate. Outputs may contain errors, biases, or outdated information.
- Our AI does not replace human judgment for important decisions.
- We do not use our AI for any of the prohibited practices under Article 5 of the EU AI Act, including:
  - Social scoring by public authorities
  - Manipulative or exploitative AI practices
  - Real-time remote biometric identification in public spaces
  - Workplace or educational emotion recognition
  - Biometric categorization on prohibited sensitive attributes

## How we govern AI internally

{{ company_name }} maintains internal policies and processes for responsible AI use, including:

- An AI system inventory tracking every AI feature in our products
- Risk classification per AI system aligned with the EU AI Act framework
- Human oversight procedures for AI-assisted decisions
- Vendor due diligence for the third-party AI models we use
- Periodic review of AI features and their impacts
- Alignment work toward ISO/IEC 42001 (AI Management System) practices

## Updates to this page

We update this page when:
- We add or change AI features
- The EU AI Act or related regulations change
- We change our underlying AI providers
- Our governance practices evolve

The "Last updated" date at the top reflects the most recent revision.

## Questions?

For any question about how we use AI:
- Email: {{ governance_contact }}
- Mail: [your registered address]

For data protection specifically: [DPO or privacy contact, if applicable]

---

## Confidence band: {{ confidence_band }}

{{ #if confidence_band == "CLEAR" }}
**Likely limited-risk transparency obligation under Article 50.** Publishing this page is a primary action.
{{ /if }}

{{ #if confidence_band == "REVIEW" }}
**Requires legal/compliance review.** Your AI system mix may have features warranting additional or different disclosure language. Review with qualified counsel.
{{ /if }}

---

## Disclaimer

This disclosure page template is generated by TrustFolder for preparatory and informational purposes. It is an AI-generated draft based on advisor-reviewed templates and the information you provided. It does not constitute legal advice, certification, or guaranteed compliance with the EU AI Act, ISO/IEC 42001, GDPR, or other applicable regulations.

Always review this page with qualified legal counsel before publishing it on your website. Regulatory requirements change — see https://trustfolder.com/regulatory-watch for current status.

---

## Sources

- EU AI Act (Regulation (EU) 2024/1689), Article 50 (overall transparency)
- EU AI Act, Article 5 (prohibited practices)
- https://eur-lex.europa.eu/eli/reg/2024/1689/oj
- ISO/IEC 42001:2023 (AI management system practices)

---

*Generated by TrustFolder · v0.9 master template · {{ generation_date }}*
