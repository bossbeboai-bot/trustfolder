---
template_id: t2-11-pack-readme
title: Pack README (with disclaimers + how-to-use)
tier: 2
purpose: Top-level README the customer reads first when opening their delivered pack
generated_when: ALWAYS — every Tier 2 customer gets this (also Tier 1 gets a smaller variant)
confidence_bands_applicable: [CLEAR, REVIEW]
version: 0.9
last_updated: 2026-05-08
---

# Pack README Template

## AI engine instructions

Generate the master README that sits at the top of the delivered pack ZIP / Notion folder. This is the document the customer opens FIRST. It must:
- Explain what's in the pack
- Set expectations honestly (no overclaiming)
- Direct the customer to what to read next based on their situation
- Include canonical disclaimers
- Be SHORT — under 1,000 words ideally

**Inputs needed:**
- `{{ company_name }}`
- `{{ ai_systems_count }}`
- Pack delivery date
- `{{ governance_contact }}`
- Tier (1 or 2 — adjusts the README scope)
- Confidence-band summary across pack

**Confidence band:** Reflects the overall pack confidence.

**Output formats:** Markdown (canonical, named `README.md`), HTML (for browser viewing), PDF.

---

## Customer-facing content (markdown)

# {{ company_name }} — AI Governance Readiness Pack

**Delivered:** {{ generation_date }}  
**Generator:** TrustFolder ({{ pack_tier }})  
**Pack version:** v0.9 (master templates) · customized for {{ company_name }}

---

## What you have here

This pack is your **AI governance evidence folder** — a structured set of documents covering AI inventory, classification, policy, oversight, vendor due diligence, and an implementation roadmap, aligned with the EU AI Act and ISO/IEC 42001:2023.

It is **preparatory**. It helps you organize, brief your lawyer efficiently, answer enterprise vendor questionnaires, and start an ISO 42001 alignment journey. It is **NOT**:
- A legal opinion
- A certification
- A guarantee of compliance with any law
- A substitute for qualified legal/compliance counsel

If you came here from a contractual obligation that required "EU AI Act compliance," your next step is your lawyer — start with the **Lawyer Handoff** doc below.

---

## Read this first if you have 5 minutes

1. Skim this README (you're here)
2. Open `t2-09-lawyer-handoff-pack.md` — the 1-page summary for your lawyer
3. Open `t2-10-governance-roadmap.md` — what to do over the next 30 days

That's enough to know what's in the pack and what to do next.

---

## What's in the pack

### Tier 1 — Article 50 Disclosure Documents (7 docs)
For implementing transparency obligations under Article 50 of the EU AI Act.

| File | What it is |
|---|---|
| `t1-01-chatbot-disclosure.md` | If you have a chatbot — disclosure for end-users that they're talking to AI |
| `t1-02-ai-content-labeling.md` | If you generate AI content — how to mark it (human + machine readable) |
| `t1-03-deepfake-notice.md` | If you generate synthetic media — deepfake disclosure |
| `t1-04-emotion-recognition-notice.md` | If you have emotion recognition (in permitted contexts) — disclosure notice |
| `t1-05-biometric-categorization-notice.md` | If you have biometric categorization (permitted) — disclosure notice |
| `t1-06-ai-system-disclosure-page.md` | Public-facing master AI disclosure page for your website |
| `t1-07-ai-usage-policy-summary.md` | 1-pager for your employee handbook |

{{ #if pack_tier == "tier_2" }}

### Tier 2 — AI Governance Documents (12 docs)
Per-system inventory, classification, policies, procedures.

| File | What it is | Read in order |
|---|---|---|
| `t2-01-ai-system-inventory.md` | Master list of every AI system in your product | 1 |
| `t2-02-provider-deployer-memo.md` | Your role under the AI Act, per system | 2 |
| `t2-03-risk-classification-memo.md` | Risk classification per system, with confidence bands | 3 |
| `t2-04-iso-42001-checklist.md` | Gap assessment vs ISO 42001 | 4 |
| `t2-05-evidence-tracker.md` | Schema + starter records for the evidence register | 7 |
| `t2-06-ai-policy-draft.md` | Full internal AI policy ready for adoption | 5 |
| `t2-07-human-oversight-procedure.md` | Per-system oversight specifications | 6 |
| `t2-08-vendor-questionnaire.md` | Form to send to your AI vendors | 8 |
| `t2-09-lawyer-handoff-pack.md` | 1-page brief for your lawyer | **Read second** |
| `t2-10-governance-roadmap.md` | 30-day implementation plan | **Read third** |
| `t2-11-pack-readme.md` | This document | **Read first** |
| `t2-12-out-of-scope-handoff.md` | If TrustFolder flagged any system as out-of-scope, you'll find handoff guidance here | as needed |

{{ /if }}

---

## What you should do (in order)

### Day 1
- [ ] Read this README
- [ ] Read `t2-09-lawyer-handoff-pack.md`
- [ ] Read `t2-10-governance-roadmap.md`

### Day 2-7
- [ ] Validate `t2-01-ai-system-inventory.md` against your actual production state
- [ ] Schedule counsel review (use the lawyer handoff as the briefing)

### Day 8-14
- [ ] Counsel review call
- [ ] Update pack documents per counsel input
- [ ] Adopt the AI policy

### Day 15-30
- [ ] Implement Tier 1 transparency in product
- [ ] Roll out policy internally
- [ ] Send vendor questionnaire to top 3 AI vendors
- [ ] Set ongoing cadence

Detail in `t2-10-governance-roadmap.md`.

---

## Snapshot of what TrustFolder generated for you

| Item | Value |
|---|---|
| AI systems inventoried | {{ ai_systems_count }} |
| Likely AI Act role | {{ ai_role }} |
| Risk distribution | {{ risk_summary }} |
| Items flagged for legal review | {{ review_count }} |
| Items flagged uncertain | {{ uncertain_count }} |
| Overall confidence band | {{ confidence_band }} |

If `Items flagged for legal review` is greater than 0, please prioritize counsel review before relying on the pack externally.

---

## Confidence bands explained

Throughout the pack, classifications use one of five labels:

| Band | Meaning |
|---|---|
| **CLEAR** | High-confidence classification |
| **REVIEW** | Plausible classification but warrants legal review |
| **UNCERTAIN** | Cannot classify from current data |
| **SOFT-OUT** | Sensitive area — human triage recommended |
| **HARD-OUT** | Out of TrustFolder's scope (refund-applicable) |

If you see UNCERTAIN or REVIEW labels, that's not a defect — it's a feature. The pack is honest about what it can and cannot determine.

---

## How to update the pack

The pack reflects your AI posture as of {{ generation_date }}. Your AI systems will change. Update by:

1. **Run-it-back through TrustFolder** — re-run the Tier 1 or Tier 2 generator when material changes occur (new AI systems, new vendors, regulatory changes)
2. **Maintain the evidence tracker** (`t2-05`) continuously — it's the living record between generations
3. **Subscribe to TrustFolder regulatory watch** at https://trustfolder.com/regulatory-watch — we email when material EU AI Act / ISO 42001 changes affect the pack

---

## Format notes

- **Markdown** — Canonical format. Open in any text editor or import into Notion / Obsidian / GitHub.
- **PDF** — Suitable for sharing with counsel, customers, regulators
- **DOCX** — Provided for documents most often needing legal edits (`t2-06`, `t2-09`)
- **CSV** — Provided for `t2-01` (inventory) and `t2-05` (tracker schema) for spreadsheet import

---

## How TrustFolder works (briefly)

We are an AI governance evidence-folder generator. Our master templates are advisor-reviewed; the AI engine (Claude 3.5 Sonnet) customizes them from your URL crawl + 8-15 confirmation questions; a second AI pass (QA) checks the output against rules; the package is delivered.

**What we are not:**
- A law firm. We do not provide legal advice.
- A certification body. We do not certify ISO 42001 or AI Act compliance.
- A monitoring service. We do not actively watch your product.
- A SaaS subscription. (Yet — Tier 4 ongoing support is on the roadmap.)

**What we are:**
- A self-serve preparation tool that gets you organized in 10 minutes
- A templates company that uses AI as the customization engine
- A regulatory watch service for the templates we sell

---

## Support

| Need | Contact |
|---|---|
| Questions about your pack | support@trustfolder.com |
| Regulatory questions about your specific situation | Your lawyer (we can refer if needed) |
| Tier 3 application (Human-Assisted Review) | https://trustfolder.com/enterprise |
| Tier 4 ongoing governance support | Coming Mo-3+ |
| Bugs / pack corrections | bugs@trustfolder.com |
| Press / partnership | hello@trustfolder.com |

---

## Confidence band (overall pack): {{ confidence_band }}

{{ #if confidence_band == "CLEAR" }}
**Most pack items have clear classifications.** Counsel review is recommended before adoption but the pack should hold up well.
{{ /if }}

{{ #if confidence_band == "REVIEW" }}
**Several items flagged for review.** Please prioritize counsel input before relying on the pack externally — see `t2-09` for which items.
{{ /if }}

---

## Master disclaimer (canonical)

This toolkit and its outputs are provided for informational and preparatory purposes only. They are AI-generated drafts based on advisor-reviewed templates and the information you provided. They do not constitute legal advice, certification, or guaranteed compliance with any regulation including the EU AI Act, ISO/IEC 42001, GDPR, or other applicable laws.

Always review outputs with qualified legal counsel before publication or submission to regulators, customers, or auditors. Regulatory requirements change — see https://trustfolder.com/regulatory-watch for current status.

---

*Generated by TrustFolder · v0.9 master pack · {{ generation_date }}*  
*TrustFolder is an AI governance evidence folder, not a legal compliance guarantee.*
