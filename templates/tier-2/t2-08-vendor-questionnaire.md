---
template_id: t2-08-vendor-questionnaire
title: AI Vendor Due Diligence Questionnaire
tier: 2
iso_42001_reference: A.10 (Third-party and customer relationships)
ai_act_reference: General supply-chain governance support
generated_when: ALWAYS — every Tier 2 customer gets this
confidence_bands_applicable: [CLEAR, REVIEW]
version: 0.9
last_updated: 2026-05-08
---

# AI Vendor Due Diligence Questionnaire Template

## AI engine instructions

Generate a vendor AI questionnaire that {{ company_name }} can send to its AI vendors (e.g., OpenAI, Anthropic, foundation model providers, AI tool providers) to conduct due diligence. The output is a customer-ready questionnaire form, not a list of pre-filled answers.

**Inputs needed:**
- `{{ company_name }}`
- `{{ third_party_models[] }}` — vendors customer currently uses or evaluates
- `{{ ai_role }}`
- `{{ governance_contact }}`

**Confidence band:** CLEAR for standard B2B vendor due diligence. REVIEW if customer's vendor relationships involve unusual configurations.

**Output formats:** Markdown (canonical), DOCX (for sending to vendors), Google Forms / Typeform spec (for online distribution).

---

## Customer-facing content (markdown)

# AI Vendor Due Diligence Questionnaire — {{ company_name }}

**For completion by:** AI vendors providing models, tools, or platforms to {{ company_name }}  
**Issued by:** {{ governance_contact }}  
**Issue date:** {{ generation_date }}  
**Response deadline:** [insert deadline]  
**Return to:** {{ governance_contact }}

---

## Instructions to vendor

Please complete this questionnaire to help {{ company_name }} conduct AI vendor due diligence in alignment with our internal AI Policy and ISO/IEC 42001:2023 Annex A.10 controls. Where a question is not applicable, please write "N/A" with a brief explanation.

For documentation references, please provide a publicly accessible URL where possible. For confidential documentation, please indicate availability under NDA.

Total expected completion time: 30-45 minutes.

---

## Section 1 · Vendor identification

| Question | Response |
|---|---|
| 1.1 Vendor legal name | |
| 1.2 Vendor headquarters jurisdiction | |
| 1.3 Primary EU establishment (if any) | |
| 1.4 Primary contact for AI governance inquiries | |
| 1.5 Date this questionnaire was completed | |
| 1.6 Person completing | |

---

## Section 2 · AI products and services in scope

| Question | Response |
|---|---|
| 2.1 Names of AI products / models / services {{ company_name }} uses or is evaluating | |
| 2.2 For each, brief description (1-2 sentences) | |
| 2.3 For each, the underlying technology (foundation model, training approach, data sources) | |
| 2.4 For each, intended use cases | |
| 2.5 For each, use cases the vendor explicitly prohibits or discourages | |

---

## Section 3 · EU AI Act posture

| Question | Response |
|---|---|
| 3.1 Has the vendor formally classified the relevant AI system(s) under the EU AI Act? Provide the classification | |
| 3.2 What is the vendor's role under the AI Act for the system(s) — provider, deployer, both, GPAI provider? | |
| 3.3 If the system is a general-purpose AI (GPAI) model, has the vendor met the GPAI obligations under Articles 53-55? | |
| 3.4 Has the vendor published technical documentation and model documentation as required by the AI Act for its tier? | |
| 3.5 Where is this documentation accessible? | |
| 3.6 If the system supports Article 50 transparency obligations (interaction disclosure, content marking, deepfake disclosure), what mechanisms are provided? | |
| 3.7 Has the vendor experienced any AI Act-related regulatory inquiries, enforcement actions, or formal complaints? | |
| 3.8 What is the vendor's process for notifying customers of material AI Act-related changes? | |

---

## Section 4 · ISO/IEC 42001 and related standards

| Question | Response |
|---|---|
| 4.1 Is the vendor ISO/IEC 42001:2023 certified? If yes, please provide certificate ID, certifying body, scope, and expiration | |
| 4.2 If not certified, has the vendor implemented an AI Management System aligned with ISO 42001? | |
| 4.3 Is the vendor SOC 2 Type II audited? Please share the latest report (under NDA if applicable) | |
| 4.4 Is the vendor ISO 27001 certified? Please provide certificate details | |
| 4.5 Does the vendor follow other AI standards (NIST AI RMF, ISO 23894, ISO 42005)? Please specify | |
| 4.6 Are independent audit reports of AI controls available? | |

---

## Section 5 · Data handling

| Question | Response |
|---|---|
| 5.1 Does the vendor process personal data of {{ company_name }}'s users when our products use their AI? | |
| 5.2 Does the vendor act as processor or controller for that personal data? | |
| 5.3 Is a Data Processing Agreement (DPA) in place / available? | |
| 5.4 Does the vendor train models on customer data? Under what conditions? Is opt-out available? | |
| 5.5 Where is data processed (jurisdictions)? | |
| 5.6 What are data retention periods? | |
| 5.7 What sub-processors are used? Provide a list with locations | |
| 5.8 Are appropriate transfer mechanisms in place for international data transfers (SCCs, adequacy decisions, BCRs)? | |
| 5.9 Are there capabilities for data residency (EU-only processing)? | |

---

## Section 6 · Security controls

| Question | Response |
|---|---|
| 6.1 Encryption at rest and in transit | |
| 6.2 Access controls for vendor personnel | |
| 6.3 Penetration testing cadence | |
| 6.4 Vulnerability disclosure / bug bounty program | |
| 6.5 Incident response process | |
| 6.6 Customer notification timeline for security incidents | |
| 6.7 Customer notification timeline for AI-specific incidents (model issues, output incidents, training-data incidents) | |
| 6.8 Business continuity / disaster recovery RTOs/RPOs | |

---

## Section 7 · Model and output safety

| Question | Response |
|---|---|
| 7.1 What red-teaming or adversarial testing is performed? Cadence? | |
| 7.2 What evaluations are performed for: factuality, bias, harmful outputs, jailbreak resistance? | |
| 7.3 Are evaluation results published or available under NDA? | |
| 7.4 What output safety controls are available to {{ company_name }} (filters, moderation, blocklists)? | |
| 7.5 What guardrails are documented for prohibited use cases (Article 5 of the AI Act)? | |
| 7.6 Does the vendor support content provenance (C2PA, watermarking, etc.)? Which formats? | |
| 7.7 Does the vendor maintain an AI incident registry (model incidents, harmful outputs, etc.)? | |

---

## Section 8 · Supply chain and training data

| Question | Response |
|---|---|
| 8.1 What is the source of training data for the AI system(s)? | |
| 8.2 Does training data include any of: scraped public web data, licensed data, user data, synthetic data, partner data? | |
| 8.3 What measures are in place to handle copyright, personality rights, and personal data in training data? | |
| 8.4 Are there documented data exclusions (e.g., children's data, prohibited categories under Article 5(1)(g))? | |
| 8.5 Does the vendor publish a "training data summary" per Article 53(1)(d) of the AI Act (for GPAI providers)? | |

---

## Section 9 · Customer obligations and support

| Question | Response |
|---|---|
| 9.1 What documentation does the vendor provide to help customers meet their own AI Act obligations? | |
| 9.2 Does the vendor provide model cards / system cards? | |
| 9.3 Does the vendor publish AI Act Article 50 implementation guidance? | |
| 9.4 What support is provided for customer DPIAs / AI impact assessments? | |
| 9.5 What is the vendor's policy on customer audits or assessment requests? | |
| 9.6 Are there usage policies that customers must comply with (e.g., prohibited uses)? | |

---

## Section 10 · Contracting and indemnification

| Question | Response |
|---|---|
| 10.1 What liability and indemnification provisions are standard for AI Act non-compliance scenarios? | |
| 10.2 What liability provisions cover model output (e.g., infringement, defamation, harmful output)? | |
| 10.3 Are there service-level commitments for: availability, model performance, security incident response? | |
| 10.4 Is there a customer right to terminate for material AI governance failures? | |

---

## Section 11 · References

| Question | Response |
|---|---|
| 11.1 Can the vendor provide 2-3 customer references with similar use cases to {{ company_name }}? | |
| 11.2 Are there public case studies or implementation examples? | |
| 11.3 Has the vendor been involved in publicly disclosed AI governance incidents? Provide context | |

---

## Section 12 · Open questions

| Question | Response |
|---|---|
| 12.1 What's the most common AI Act-related question {{ company_name }}'s customers will likely ask the vendor about? | |
| 12.2 What's a known limitation of the AI system that customers should be aware of? | |
| 12.3 What's coming in the next 6 months that affects AI governance? | |

---

## Vendor attestation

By completing this questionnaire, the vendor representative attests that the responses are accurate and complete to the best of their knowledge as of the completion date. {{ company_name }} understands that responses are point-in-time and that material changes may occur post-completion; the vendor agrees to notify {{ company_name }} of material changes affecting the AI governance posture documented above.

| | |
|---|---|
| Vendor representative name | |
| Title | |
| Signature | |
| Date | |

---

## Internal use (after vendor responds)

This section is for {{ company_name }}'s use after receiving vendor responses.

**Reviewer:** {{ governance_contact }}  
**Review date:** [date]  
**Outcome:** Approved / Approved with conditions / Rejected / Pending follow-up  
**Risk level:** Low / Medium / High  
**Conditions or follow-up:** [list]  
**Next review date:** [date]

Logged in evidence tracker (`t2-05`) Tab 4 (Vendor register).

---

## Confidence band: {{ confidence_band }}

{{ #if confidence_band == "CLEAR" }}
**Standard B2B AI vendor due diligence.** Suitable for sending to current vendors (OpenAI, Anthropic, etc.) and prospective vendors as part of {{ company_name }}'s procurement process.
{{ /if }}

{{ #if confidence_band == "REVIEW" }}
**Requires legal/compliance review.** Specific vendor relationships ({{ company_name }}'s context) may need additional questions or modified contract clauses. Bring to counsel before relying on this questionnaire for high-stakes vendor selection.
{{ /if }}

---

## Disclaimer

This vendor questionnaire is generated by TrustFolder for preparatory and informational purposes. It is an AI-generated draft based on advisor-reviewed templates and the information you provided. It does not constitute legal advice, vendor compliance certification, or guaranteed coverage of all applicable obligations.

Always have this questionnaire and the resulting vendor responses reviewed by qualified legal/compliance counsel before relying on them for material vendor decisions, particularly contracting and indemnification. See https://trustfolder.com/regulatory-watch for current regulatory status.

---

## Sources

- ISO/IEC 42001:2023, Annex A.10 (Third-party and customer relationships)
- EU AI Act (Regulation (EU) 2024/1689) — supply-chain provisions, Articles 25, 53-55 (GPAI)
- GDPR (Regulation (EU) 2016/679), Articles 28, 44-49 (processor / international transfers)

---

*Generated by TrustFolder · v0.9 master template · {{ generation_date }}*
