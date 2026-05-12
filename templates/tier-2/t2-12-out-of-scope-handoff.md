---
template_id: t2-12-out-of-scope-handoff
title: Out-of-Scope Handoff (when AI flags any system as out-of-automated-scope)
tier: 2
purpose: Triage + referral when one or more systems are SOFT-OUT or partially out-of-scope
generated_when: CONDITIONAL — only generated if any system is flagged SOFT-OUT or partial out-of-scope at QA pass
confidence_bands_applicable: [SOFT-OUT, REVIEW]
version: 0.9
last_updated: 2026-05-08
---

# Out-of-Scope Handoff Template

## AI engine instructions

Generate this template ONLY when the readiness pack QA pass detects one or more AI systems flagged SOFT-OUT or partial out-of-scope (e.g., the customer is mostly in-scope, but one specific system requires specialist counsel beyond TrustFolder's automated coverage).

If ALL systems are HARD-OUT, the customer should NOT receive a Tier 2 pack at all — the out-of-scope detector should reject at intake and refund. This template is for the partial / soft-out cases.

**Inputs needed:**
- `{{ company_name }}`
- `{{ flagged_systems[] }}` — systems flagged SOFT-OUT or partial out-of-scope
- `{{ in_scope_systems[] }}` — systems we DO cover
- `{{ governance_contact }}`
- For each flagged system: reason for flag, recommended specialist, recommended next steps

**Confidence band:** Always SOFT-OUT or REVIEW — by definition this template is the soft-out case.

**Output formats:** Markdown (canonical), PDF.

---

## Customer-facing content (markdown)

# Out-of-Scope Handoff — {{ company_name }}

**Delivered:** {{ generation_date }}  
**Status:** Partial out-of-scope items flagged. Pack delivered for in-scope systems; flagged systems require specialist follow-up.  
**Owner:** {{ governance_contact }}

---

## Why you received this document

TrustFolder generates AI governance documentation for B2B AI SaaS companies whose AI systems fall within our v1 coverage scope. During QA review of your pack, one or more of your AI systems were flagged as outside our automated coverage.

**Important:** This is NOT a refund situation (those are hard-rejects at intake). You received the pack for the systems we DO cover. This document explains what we did NOT cover and what to do about it.

---

## Summary

- **Total AI systems in your inventory:** {{ ai_systems_count_total }}
- **Covered by TrustFolder:** {{ in_scope_count }}
- **Flagged out-of-scope (this document):** {{ flagged_count }}

---

## Systems we covered (in-scope)

For these systems, the full Tier 2 pack applies — inventory, classification, policy, oversight, etc.

| System | Classification | Status |
|---|---|---|
{{ #each in_scope_systems }}
| {{ this.name }} | {{ this.classification }} | Covered in `t2-01` through `t2-08` |
{{ /each }}

---

## Systems we did NOT cover (flagged)

For these systems, TrustFolder's automated documentation generation is insufficient. You should engage specialized counsel.

{{ #each flagged_systems }}

### {{ this.name }}

**Reason flagged:** {{ this.reason }}  
**Confidence band:** {{ this.band }}  
**TrustFolder finding:** {{ this.finding }}

**What this means:**
{{ this.implication }}

**What we recommend:**

1. **Pause expansion** of this system to EU users until specialist review is complete
2. **Engage specialized counsel** — see referral guidance below
3. **Document the flag** in your evidence tracker (`t2-05`) under the master log
4. **Do NOT use the in-scope-system templates as a basis for documenting this system** — they are not designed for this risk profile

**Suggested specialist type for this case:**
- {{ this.specialist_type }}
- Sample search criteria: {{ this.specialist_search_criteria }}
- Estimated specialist engagement: {{ this.estimated_specialist_engagement }}

**Specific questions to bring to specialist counsel:**

{{ #each this.questions_for_specialist }}
- {{ this }}
{{ /each }}

---
{{ /each }}

## Referral guidance

TrustFolder does not maintain an active referral list (we are not a law firm and do not have referral relationships). However, the following resources are good starting points for finding specialized AI/regulatory counsel:

### EU AI law
- **EU lawyer directories** — Most national bar associations maintain searchable directories with AI/tech specializations
- **AI law associations** — Several EU-level groups maintain practitioner directories (LL.M. in AI, AILA, etc.)
- **Search firm name + jurisdiction + "AI Act"** — Often surfaces specialized practitioners

### Specific high-risk verticals
- **Banking/finance** — FinTech-specialist firms or DLA Piper / Allen & Overy / Linklaters financial regulation teams
- **Healthcare/MDR** — Medical device regulation specialists; Bird & Bird / Hogan Lovells health teams
- **HR/employment** — Employment law specialists with AI experience
- **Biometric / law-enforcement** — Privacy specialists with biometric expertise (one Trust law firms in the EU)
- **Children's data / education** — DPO-specialist firms or DSA/AI specialists

### Specialist consultancies (alternative to law firms)
- **AI ethics consultancies** — Useful for impact assessment and risk methodology
- **ISO 42001 implementers** — Useful for management system implementation
- **GDPR/privacy consultancies with AI extension** — Useful for privacy-AI overlap

**TrustFolder caveat:** We do NOT vet specific firms or consultants. Diligence the specialist as you would any vendor.

---

## What TrustFolder will and will not help with

### We WILL
- Continue covering your in-scope systems through the full pack
- Notify you via regulatory watch when EU AI Act or ISO 42001 changes affect your situation
- Adjust our coverage scope over time — flagged categories may become covered as we expand. We'll notify you when coverage changes.

### We will NOT
- Provide legal advice on the flagged system
- Recommend specific law firms / consultants
- Maintain documentation for the flagged system
- Substitute for qualified specialist counsel

---

## Updating your inventory

In your `t2-01` AI System Inventory, the flagged system(s) should be annotated:

```
Status: Flagged out-of-scope by TrustFolder
Counsel engagement: [yes/no/in-progress]
Specialist firm: [name when engaged]
Counsel review date: [date]
Action plan: [link to internal action plan]
```

This keeps the flag visible in the same inventory you maintain for in-scope systems.

---

## Confidence band: {{ confidence_band }}

This document itself is SOFT-OUT or REVIEW — by definition. The flagged systems require specialist input that TrustFolder cannot provide.

---

## Disclaimer

This out-of-scope handoff is generated by TrustFolder for informational purposes. It is NOT a referral, NOT legal advice, and NOT a substitute for qualified specialist counsel. TrustFolder is not responsible for the actions or omissions of any specialist counsel or consultant you engage based on this document.

Engage qualified, specialist-area counsel for any AI system flagged in this document before continuing operation in the EU.

---

*Generated by TrustFolder · v0.9 master template · {{ generation_date }}*
