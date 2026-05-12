---
template_id: t2-10-governance-roadmap
title: 30-Day AI Governance Roadmap
tier: 2
purpose: Implementation plan after pack delivery
generated_when: ALWAYS — every Tier 2 customer gets this
confidence_bands_applicable: [CLEAR, REVIEW]
version: 0.9
last_updated: 2026-05-08
---

# 30-Day AI Governance Roadmap Template

## AI engine instructions

Generate a 30-day implementation roadmap. This is the "what to do Monday morning" document — it sequences actions across the 30 days following pack delivery so the customer doesn't end up with documents they never act on.

**Inputs needed:**
- `{{ company_name }}`
- `{{ ai_systems[] }}` from inventory
- `{{ governance_contact }}`
- `{{ has_eu_customers }}`
- Confidence bands across other templates (drives priority)
- Pack delivery date

**Confidence band:** CLEAR for typical implementations. REVIEW if pack has multiple Priority 1 items needing legal input before any action.

**Output formats:** Markdown (canonical), Notion-importable checklist, project-management-ready (CSV with assignee/date columns).

---

## Customer-facing content (markdown)

# 30-Day AI Governance Roadmap — {{ company_name }}

**Pack delivered:** {{ generation_date }}  
**Roadmap window:** Day 1 ({{ day_1_date }}) → Day 30 ({{ day_30_date }})  
**Owner:** {{ governance_contact }}  
**Estimated total effort:** {{ estimated_total_hours }} person-hours over 30 days

---

## How to use this roadmap

This roadmap sequences the actions {{ company_name }} should take over the 30 days after pack delivery. Each item has:
- A concrete task
- An owner role
- An estimated time
- Dependencies (what must happen first)
- Success criteria

The roadmap is conservative: most tasks can be done part-time alongside normal work. Priority is on getting the policy adopted, the inventory live, and counsel review scheduled.

**This roadmap is NOT a project plan.** It's a starting structure {{ company_name }} adapts to its calendar and capacity.

---

## Week 1 (Days 1-7): Internalize and review

### Day 1-2 · Read the pack

| Action | Owner | Time | Outcome |
|---|---|---|---|
| Read `t2-11` (pack README) end to end | {{ governance_contact }} | 15 min | Full overview |
| Skim `t2-01` (inventory) and `t2-03` (risk classification) | Engineering, Product leads | 30 min each | Familiarity with what TrustFolder generated |
| Read `t2-09` (lawyer handoff) | {{ governance_contact }} | 15 min | Aligned on what counsel review covers |

### Day 3 · Inventory accuracy check

| Action | Owner | Time | Outcome |
|---|---|---|---|
| Validate every AI system in `t2-01` against actual production state | Engineering Lead | 1 hour | Confirmed inventory or list of corrections |
| Add any AI systems missing from inventory | Engineering Lead | 30 min | Complete inventory |
| Confirm or correct each system's owner | {{ governance_contact }} | 30 min | Owners assigned |

### Day 4-5 · Schedule counsel review

| Action | Owner | Time | Outcome |
|---|---|---|---|
| Identify legal counsel (existing relationship or new) | {{ governance_contact }} | 30 min | Counsel engaged |
| Send `t2-09` (lawyer handoff) + full pack to counsel | {{ governance_contact }} | 15 min | Pack received |
| Schedule 60-min review call within Week 2 | {{ governance_contact }} | 15 min | Calendar invitation |

### Day 6-7 · Quick wins

| Action | Owner | Time | Outcome |
|---|---|---|---|
| Set up evidence tracker (`t2-05`) — Notion / Sheet / Airtable | {{ governance_contact }} | 1 hour | Tracker live with starter records |
| Add Day 1-7 actions as initial entries | {{ governance_contact }} | 30 min | First evidence records |

**Week 1 success criteria:**
- [ ] Pack read by all stakeholders
- [ ] Inventory validated and corrected
- [ ] Counsel review scheduled
- [ ] Evidence tracker live

---

## Week 2 (Days 8-14): Counsel review and decisions

### Day 8-10 · Counsel review

| Action | Owner | Time | Outcome |
|---|---|---|---|
| Hold counsel review call (60 min) | Counsel + {{ governance_contact }} | 1 hour | Decisions on Priority 1-5 items from `t2-09` |
| Document counsel decisions in evidence tracker | {{ governance_contact }} | 30 min | Logged decisions |
| Identify any items requiring follow-up research | Counsel | 15 min | Follow-up list |

### Day 11-12 · Adjustments based on counsel input

| Action | Owner | Time | Outcome |
|---|---|---|---|
| Update inventory `t2-01` per counsel input | Engineering Lead | 30 min | Counsel-aligned inventory |
| Update role memo `t2-02` per counsel input | {{ governance_contact }} | 30 min | Counsel-confirmed roles |
| Update risk classification `t2-03` per counsel input | {{ governance_contact }} | 30 min | Counsel-confirmed classifications |
| Update policy `t2-06` per counsel input | {{ governance_contact }} | 1 hour | Counsel-reviewed policy draft |

### Day 13-14 · Policy approval pathway

| Action | Owner | Time | Outcome |
|---|---|---|---|
| Brief CEO / top-management on policy | {{ governance_contact }} | 30 min | Top-management awareness |
| Adopt policy formally (sign or written approval) | CEO / top management | 15 min | Adopted policy v1.0 |
| Communicate adoption internally | {{ governance_contact }} | 30 min | Policy live for team |

**Week 2 success criteria:**
- [ ] Counsel review complete
- [ ] All Tier 2 documents updated per counsel input
- [ ] Policy formally adopted
- [ ] Decisions logged in evidence tracker

---

## Week 3 (Days 15-21): Implementation

### Day 15-17 · Tier 1 transparency implementation

| Action | Owner | Time | Outcome |
|---|---|---|---|
| Implement chatbot disclosures (`t1-01`) in product UI | Engineering | 4-8 hours | Disclosures live |
| Implement AI content marking (`t1-02`) where applicable | Engineering | 4-16 hours | Marking live (depends on content types) |
| Publish public AI disclosure page (`t1-06`) | Marketing + Engineering | 2-4 hours | Page live at company_url/ai-use |
| Implement deepfake / emotion / biometric notices if applicable | Engineering | varies | Per-system disclosures live |

### Day 18-20 · Internal policy rollout

| Action | Owner | Time | Outcome |
|---|---|---|---|
| Add policy `t2-06` to employee handbook / wiki | {{ governance_contact }} | 1 hour | Policy posted |
| Schedule and deliver AI awareness training (30 min all-hands) | {{ governance_contact }} | 2 hours | Team trained |
| Add training completion to evidence tracker | {{ governance_contact }} | 15 min | Training logged |

### Day 21 · Vendor outreach

| Action | Owner | Time | Outcome |
|---|---|---|---|
| Send vendor questionnaire (`t2-08`) to top 3 AI vendors | Procurement / {{ governance_contact }} | 1 hour | Questionnaires sent |
| Add vendor records to evidence tracker | {{ governance_contact }} | 30 min | Vendor register seeded |

**Week 3 success criteria:**
- [ ] Tier 1 transparency implementations live in product
- [ ] Policy adopted in handbook
- [ ] Team trained
- [ ] Vendor questionnaires sent

---

## Week 4 (Days 22-30): Operationalize

### Day 22-24 · Oversight and metrics

| Action | Owner | Time | Outcome |
|---|---|---|---|
| Implement per-system oversight per `t2-07` | Engineering + Product | 4-8 hours | Oversight tooling live or documented |
| Define metrics for each AI system (output volume, error rate, escalation rate) | Engineering | 2-3 hours | Metrics dashboards |
| Configure logging for oversight events | Engineering | 2-4 hours | Logs flowing |

### Day 25-26 · ISO 42001 priority gaps

| Action | Owner | Time | Outcome |
|---|---|---|---|
| Pick top 3 gaps from `t2-04` ISO checklist | {{ governance_contact }} | 30 min | Gap closure plan |
| Schedule gap closure into product/engineering backlog | Engineering Lead | 30 min | Backlog populated |

### Day 27-28 · Customer-facing readiness

| Action | Owner | Time | Outcome |
|---|---|---|---|
| Brief Sales / Customer Success on the readiness pack and what to say to customer questions | {{ governance_contact }} | 1 hour | Sales/CS aligned |
| Prepare 1-pager summary for customer-facing teams | {{ governance_contact }} | 1 hour | 1-pager live |
| Update customer-facing FAQ / trust page if applicable | Marketing | 2 hours | FAQ updated |

### Day 29-30 · Establish ongoing cadence

| Action | Owner | Time | Outcome |
|---|---|---|---|
| Schedule monthly inventory review (recurring) | {{ governance_contact }} | 15 min | Calendar recurrence |
| Schedule quarterly risk register review | {{ governance_contact }} | 15 min | Calendar recurrence |
| Schedule annual policy review | {{ governance_contact }} | 15 min | Calendar recurrence |
| Subscribe to TrustFolder regulatory watch updates | {{ governance_contact }} | 5 min | Subscribed |
| Run a 30-min retro on the rollout | All stakeholders | 30 min | Lessons captured |

**Week 4 success criteria:**
- [ ] Oversight live and producing logs
- [ ] Top 3 ISO gaps in backlog
- [ ] Sales/CS aligned
- [ ] Ongoing cadence scheduled

---

## Total estimated effort

| Role | Effort (over 30 days) |
|---|---|
| {{ governance_contact }} (AI Governance Lead) | 12-18 hours |
| Engineering Lead | 8-12 hours |
| Engineering team (cumulative) | 16-32 hours |
| Product | 4-6 hours |
| CEO / top management | 1 hour |
| Sales / CS lead | 1-2 hours |
| Counsel | 1-2 hours (review call + follow-up) |
| **Total person-effort** | **40-75 hours** |

This is realistic for a 5-50 person organization. The bulk of work is in Week 1 (validation) and Week 3 (implementation).

---

## What this roadmap does NOT include

- **Building the AI features themselves** (assumed already built)
- **Pursuing ISO 42001 certification** (a 6-12 month journey starting after readiness foundation)
- **Detailed counsel work** beyond the 1-hour review call
- **Marketing campaigns or sales enablement** beyond basic alignment

---

## Triggers for off-cycle action

The roadmap assumes a stable environment. Action immediately if:

- Material regulatory change (track via TrustFolder regulatory watch)
- New AI feature enters production
- Customer or vendor incident
- Material change in AI vendor relationships
- Acquisition or major partnership

---

## Confidence band: {{ confidence_band }}

{{ #if confidence_band == "CLEAR" }}
**Roadmap fits standard B2B AI SaaS implementation.** Realistic effort estimates for a 5-50 person organization.
{{ /if }}

{{ #if confidence_band == "REVIEW" }}
**Requires legal/compliance review.** Implementation of {{ company_name }}'s pack may require additional steps beyond this roadmap due to multiple flagged items needing counsel input. Discuss in counsel review call (Day 8-10).
{{ /if }}

---

## Disclaimer

This roadmap is generated by TrustFolder for preparatory and informational purposes. It is an AI-generated draft based on advisor-reviewed templates. It does not constitute legal advice or guaranteed compliance. Implementation effort varies by organization.

Always adapt the roadmap to {{ company_name }}'s actual capacity, calendar, and counsel guidance. See https://trustfolder.com/regulatory-watch for current regulatory status.

---

*Generated by TrustFolder · v0.9 master template · {{ generation_date }}*
