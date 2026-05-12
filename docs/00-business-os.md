# 00 · Business OS · Master Flow Doc

The single source of truth describing how the entire business works end-to-end. If you can only read one doc, read this.

---

## North Star

> Help small B2B AI SaaS companies (5-50 employees) with EU customers prepare AI governance documentation in days, not months — so they can answer enterprise procurement questionnaires, brief their lawyers efficiently, and be ready for AI Act + ISO 42001 conversations as those obligations roll in.

We sell **preparation**, not compliance. We sell **readiness**, not certification. We sell **time saved**, not legal protection.

---

## Why now

1. **EU AI Act phased rollout** — Article 50 transparency obligations apply from August 2026; high-risk system rules following (subject to ongoing dilution discussion per Reuters May 2026).
2. **ISO 42001 is the emerging AI management standard** — adopted by Microsoft, Google, AWS; small AI SaaS companies are being asked about it in vendor questionnaires.
3. **Procurement pressure** — enterprise buyers are asking AI vendors for AI governance docs as a gate before signing contracts.
4. **No tool exists for the bottom of the market** — Vanta/Drata target enterprise; consultants charge $20k+. There's a $99-$499 wedge for self-serve startups.

---

## What we sell

### The full ladder

| Tier | Price | What | Status |
|---|---|---|---|
| 0 | Free | AI Act self-assessment (1-page risk PDF) | Day 24 launch |
| 1 | $99 | Article 50 Disclosure Generator (5-7 docs) | Day 24 launch |
| 2 | $499 | AI Governance Readiness Pack (12 docs) | Day 35 launch (post-advisor-review) |
| 3 | $1,500-$2,500 | Human-Assisted Review Pack (Tier 2 + advisor call + custom revisions + 30 days Q&A) | Application-only, manual fulfillment, defer to Mo-2+ |
| 4 (future) | $750-$1,500/mo | Ongoing AI Governance Support (regulatory updates + reviews + Q&A) | Defer to Mo-3+ |

Detail in `03-pricing-and-tiers.md`.

### The full deliverable for Tier 2 (the hero)

12 advisor-reviewed templates, AI-customized from a website-URL scan + 8-15 confirmation questions:

1. AI system inventory
2. Provider/deployer role memo
3. Risk classification memo (with confidence bands)
4. ISO 42001 readiness checklist
5. Evidence tracker spec (spreadsheet template)
6. AI policy draft
7. Human oversight procedure
8. Vendor AI questionnaire
9. Lawyer-review handoff pack
10. 30-day governance roadmap
11. README with disclaimers
12. Out-of-scope handoff (when AI flags a regulated vertical)

Plus all 7 Tier 1 disclosures included.

---

## Who we sell to

**ICP:** Founder/CTO at a B2B AI SaaS company, 5-50 employees, with EU customers, building generative or conversational AI products, NOT in regulated verticals.

**Disqualified verticals (auto-rejected at intake):** Banking, healthcare/medical, HR (recruiting/scoring), biometric identification, children's products, credit scoring, law enforcement, judicial, education scoring, critical infrastructure.

Detail in `02-icp-and-niche-scope.md`.

---

## How a customer flows through the product

### Free Assessment (Tier 0)
```
visit site → enter URL + email → backend scans homepage/pricing/about
→ AI extracts company info → 8 confirmation questions auto-prefilled
→ user confirms → scope-check → 1-page risk PDF emailed
→ added to lead funnel
```

### $99 Disclosure Generator (Tier 1)
```
free assessment user clicks upgrade → 8 confirmation questions (pre-filled)
→ scope-check → PayPal checkout → webhook → AI generates 5-7 disclosure docs
→ ZIP + Notion folder emailed within 5 min
```

### $499 Readiness Pack (Tier 2 · post-advisor-review)
```
12-15 confirmation questions → deeper scope-check → PayPal checkout
→ webhook → engine runs all 12 templates with confidence bands
→ QA pass → Notion-importable folder + ZIP emailed within 10 min
```

Detail in `04-product-flow.md`.

---

## How the AI engine produces output safely

Three structural protections ensure the AI never confidently misclassifies:

1. **Website-URL crawler** — pre-fills 60-70% of customer info from public site (high accuracy)
2. **Confidence bands** — every output labeled "likely limited-risk" / "requires legal review" / "cannot classify" / "out of automated scope" — never absolute
3. **Out-of-scope detector** — questionnaire hard-rejects regulated verticals at intake → automatic refund + handoff

Detail in `06-confidence-bands.md`.

---

## How customers find us

**Mo-1 acquisition (manual):**
- LinkedIn outreach to 50-100 small AI SaaS founders
- 5 LinkedIn launch posts queued
- ProductHunt launch
- Free assessment as lead magnet
- Cold DMs offering free assessment first

**Mo-2+ acquisition (compounding):**
- SEO content (Article 50 explainers, ISO 42001 starter guides)
- ProductHunt + Hacker News launches
- Customer testimonials from beta cohort
- Referral incentive (give-a-friend $50 credit)

Detail in `10-marketing-plan.md` (TBD).

---

## How money moves

**Per Tier 2 order ($499):**
- Revenue: $499
- PayPal fee: ~$25 (4.4% + $0.30 international)
- Claude API: ~$5
- Storage/email: ~$0.10
- **Net: ~$469 (94% margin)**

**Mo-1 fixed costs:**
- Domain: ~$1/mo
- Vercel/Resend/Supabase: $0 (free tier)
- Anthropic API: variable (~$5/customer)
- **Total fixed: ~$15/mo**

**Conditional one-time:** $500-1,000 advisor (gated to pre-Tier-2-launch)

---

## Build phasing (29 days to full launch)

| Phase | Days | Deliverable |
|---|---|---|
| 0 | 0-3 | Brand verified + governance docs + resources downloaded |
| 1 | 4-12 | 19 templates v0.9 (pre-advisor) |
| 2 | 13-20 | AI engine + website crawler + Supabase + PayPal |
| 3 | 21-24 | Framer marketing site + Next.js app · **SOFT LAUNCH Day 24** |
| 4 | 18-32 (parallel) | Advisor outreach + review |
| 5 | 32-35 | Tier 2 hard launch · **FULL LAUNCH Day 35** |
| 6 | post-v1 | Remotion marketing videos (optional) |

---

## Daily cadence (founder)

**Working day target:** 4 hours/day max + 1 rest day per week.

**Daily exit criteria:**
- Update `Phase X status` in this doc
- Push committed work to git
- Check `07-regulatory-watch.md` for any new entries needed
- Note blockers in `progress.txt`

---

## Weekly cadence

**Monday:** Plan the week (which phase tasks?)  
**Wednesday:** Mid-week regulatory watch review  
**Friday:** Week wrap + git commit + progress note  
**Sunday:** Rest day

---

## Success metrics

| Metric | Target | Measurement |
|---|---|---|
| Build Month revenue (Day 0-30) | $200-700 | informational |
| 30-day post-launch revenue (Day 23-53) | ≥ $2,000 | v9 floor #1 |
| 90-day post-launch cumulative (Day 23-113) | ≥ $10,000 | v9 floor #2 |
| Per-order net margin | ≥ 90% | Tier 2 actual |
| Customer legal complaints | 0 | direct count |
| Out-of-scope detector false negatives | 0 | sample audit |
| Advisor review turnaround | ≤ 7 days | calendar |

---

## What kills the business

- One regulated-vertical customer slips through and complains publicly
- Marketing copy contradicts disclaimers (e.g. "compliance in 24 hours" + "not legal advice")
- AI confidently misclassifies a customer's risk level (no confidence bands)
- Burnout from >4 hr/day pace
- Founder spends advisor budget before Tier 1 demonstrates demand

All have explicit mitigations in their respective docs.

---

## Single decision rule when uncertain

> When in doubt, say "preparation" and let the customer's lawyer say "compliance."

---

## Living document

This doc is updated whenever:
- Pricing changes
- A tier launches
- A new regulatory development affects strategy
- Founder profile/constraint changes

Last updated: 8 May 2026 (Day 0)
