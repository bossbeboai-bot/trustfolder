# 03 · Pricing and Tiers · 5-Tier Ladder + Rationale

The 5-tier ladder, why each price point exists, what each one delivers, and the revenue math.

> **Positioning lock:** TrustFolder is **not** a cheap template pack. It is an automated AI governance evidence-preparation workflow: website scan → extraction → confirmation → scope check → document generation → QA → packaged evidence folder. Every output is more useful than what the customer would get from prompting ChatGPT directly.

---

## The ladder at a glance

| Tier | Name | Price | Status | Effort/order |
|---|---|---|---|---|
| 0 | Free Eligibility Check | $0 | Day 24 launch | Fully automated · ~2 min · no documents |
| 1 | Lite Readiness Snapshot | $99 | Day 24 launch | Fully automated · ~3 min · 1 short report |
| 2 | Article 50 Disclosure Pack | $499 | Day 24 launch | Fully automated · ~5 min · 6-7 docs |
| 3 | Full AI Governance Evidence Folder | $999 | Day 35 launch (post-advisor-review) | Fully automated · ~10 min · 12-13 docs |
| 4 | Premium Buyer/Legal Handoff Pack | $2,500-$4,500 | Application-only, Mo-2+ | Manual · ~3-5 hrs |

### One-line value framing (use this in copy)

> Start with a **free eligibility check**. Get a paid **readiness snapshot for $99**. Generate **Article 50 disclosure documents for $499**. Build your full **buyer-ready AI governance evidence folder for $999**.

Premium handoff ($2,500-$4,500) is application-only and is not surfaced in the public ladder until Mo-2+.

---

## Tier 0 · Free Eligibility Check · $0

**Purpose:** Lead capture only. Tell the prospect whether TrustFolder is a fit for them.

**What customer gets:**
- A web result with one of three verdicts:
  - **Likely fit** → recommended next step (Tier 1 snapshot or Tier 2 disclosure pack)
  - **Needs review** → soft-out vertical detected (e.g., insurance, legal-litigation, defense) — we'll follow up within 24 hours
  - **Out of scope** → hard-out vertical (healthcare, HR, credit, biometrics, children, education-grading, law-enforcement, critical-infra) → polite decline, no charge
- A recommended next step
- Email captured for nurture sequence

**Customer does NOT get at Tier 0:**
- Detailed risk classification report
- ZIP pack
- Generated documents
- PDF email

**Customer effort:** Enter URL + email + answer 8 confirmation questions (~2 min total)

**Our cost per lead:** ~$0.10-0.20 (one Claude extraction call + one classification call; no document generation)

**Conversion goals:**
- 60-80% email capture rate
- 8-15% upgrade to Tier 1 within 7 days
- 3-6% upgrade to Tier 2 within 14 days

---

## Tier 1 · Lite Readiness Snapshot · $99

**Purpose:** Low-friction first paid step. The customer gets a readable, brandable readiness snapshot they can share internally — not generated documents.

**Why $99:**
- Below the "talk to my boss" threshold for most founders
- High enough to feel real, low enough to be a no-brainer
- Compatible with corporate cards without approval
- Gives us a paid signal of intent before we spend Tier 2/Tier 3 generation budget

**What customer gets:**
- A single, polished readiness snapshot report (Markdown + PDF) covering:
  1. Website scan summary (what we read from their site)
  2. AI product overview (company, product, AI features detected)
  3. Likely transparency/disclosure areas (Article 50 categories that apply, in plain English)
  4. Simple readiness result (CLEAR / REVIEW / UNCERTAIN, with confidence band)
  5. Recommended next steps (which Tier 2/3 pack and why, or "talk to a lawyer first")
  6. Expert-review / out-of-scope flags surfaced inline
- Format: Markdown + PDF
- Delivery: web result on success page + emailed report

**What Tier 1 is NOT:**
- Not a generated disclosure pack — that's Tier 2
- Not a full evidence folder — that's Tier 3
- Not a legal opinion — explicit disclaimer in the report

**Customer effort:** Enter URL + email + 8 confirmation questions (~3 min total)

**Per-order economics:**
- Revenue: $99
- PayPal fee: ~$4.66 (4.4% + $0.30 international)
- Claude API: ~$1.20 (extraction + classification + one polish pass for the report)
- Email/storage: ~$0.05
- **Net: ~$93 (94% margin)**

---

## Tier 2 · Article 50 Disclosure Pack · $499

**Purpose:** The first true documents tier. Customer gets a structured set of filled transparency disclosures they can apply to their product immediately.

**Why $499:**
- Above the casual-impulse threshold but well below "needs CFO approval"
- Anchored against legal-content consultants ($3-10k for similar deliverables) — feels like a 90% discount, not a low-quality upsell
- Margin works at 95%+ net

**Why not $99 or $999 for this tier:**
- $99 = perceived as a template-pack tier, not a system → cheapens the disclosure content
- $999 = needs the full evidence folder to justify; mismatched with disclosure-only scope
- $499 = sweet spot for "serious starter pack" framing

**What customer gets (6-7 documents):**
1. Filled chatbot / AI assistant disclosure
2. Filled AI-generated content notice
3. Filled AI system disclosure page (for product website)
4. Disclosure placement guide (where each disclosure goes on their site/product)
5. Internal transparency summary (1-pager for the team)
6. Legal-review note (1-page brief for the customer's lawyer)
7. Deepfake / emotion-recognition / biometric notices (only if their product surfaces those — generated conditionally)

**Format:** Markdown + HTML + plaintext variants in a ZIP, Notion-importable folder structure.

**Why this scope is safe to launch without advisor review:**
- Tier 2 is the LOWEST risk content — pure transparency text
- No risk classification, no provider/deployer determination, no high-stakes claims
- Customer can launch without lawyer review (though we recommend it)
- Safe to ship before advisor review of the full evidence folder

**Customer effort:** Enter URL + 8-10 confirmation questions (~5 min)

**Per-order economics:**
- Revenue: $499
- PayPal fee: ~$22.26 (4.4% + $0.30 international)
- Claude API: ~$3.50 (7 docs at ~$0.50 each)
- Email/storage: ~$0.10
- **Net: ~$473 (95% margin)**

---

## Tier 3 · Full AI Governance Evidence Folder · $999 · HERO

**Purpose:** The hero offer. Where most revenue comes from. The structural value bet.

**Why $999:**
- Buyer-ready signal — companies pay $999 when there's a procurement deadline or vendor questionnaire pending
- Anchored against consultant pricing of $5-20k for similar deliverables
- High enough to gate it behind advisor review (Day 35 launch)
- Margin works at 94%+ net even with longer Claude generation runs

**Why not $499 or $1,500 for this tier:**
- $499 = doesn't justify the full 12-13 doc scope; eats Tier 2's anchor
- $1,500 = pushes into "I need to talk to my CFO" territory; reduces conversion 3-5x
- $999 = high enough to feel premium, low enough for an SDR/CTO to put on a card

**What customer gets (12-13 documents):**

1. **AI system inventory** — structured list of every AI feature in their product, with classification per feature
2. **Provider/deployer role memo** — clarifies their EU AI Act role for each AI system
3. **Risk classification memo** — limited-risk / unclear / out-of-scope assessment per system, with confidence bands
4. **ISO 42001 readiness checklist** — gap assessment, NOT a certification claim
5. **Evidence tracker** — controls + ownership + cadence, in a structured table
6. **AI policy draft** — internal-facing AI use policy (employees, vendors, customers)
7. **Human oversight procedure** — clauses on human-in-the-loop, escalation, decision review
8. **Vendor AI questionnaire** — for procurement when evaluating third-party AI suppliers
9. **Lawyer-review handoff pack** — 1-page summary + flagged questions to bring to counsel
10. **30-day governance roadmap** — what to do in their first month with the pack
11. **README with disclaimers** — how to use each doc + risk caveats
12. **Out-of-scope handoff** — only generated if any system flags as out-of-automated-scope
13. **Source notes** — consolidated citations + manifest

**PLUS:** All Tier 2 disclosure documents bundled in.

**Why all 12-13 docs and not fewer:**
- Each doc maps to a specific buyer pain (vendor q's, lawyer prep, internal policy, etc.)
- Cutting any doc reduces a specific use case
- Customer perceived value compounds with comprehensiveness

**Why advisor review is gated to Tier 3 (not Tier 2):**
- Tier 3 contains risk classification (limited/unclear/out-of-scope) — this is where AI mistakes have legal consequences
- Tier 3 contains provider/deployer role determinations — also high-stakes
- Tier 2 is just transparency copy — safer to launch without advisor

**Customer effort:** Enter URL + 12-15 confirmation questions (~10 min)

**Per-order economics:**
- Revenue: $999
- PayPal fee: ~$44.26 (4.4% + $0.30 international)
- Claude API: ~$8.00 (13 docs at ~$0.60 each)
- Email/storage: ~$0.15
- **Net: ~$946 (95% margin)**

---

## Tier 4 · Premium Buyer/Legal Handoff Pack · $2,500-$4,500 · APPLICATION-ONLY

**Purpose:** Capture serious buyers who want a real human in the loop and a polished hand-off. Defer to Mo-2+ when advisor relationship is established.

**Why application-only (not direct checkout):**
- Lets us decline bad-fit customers (regulated verticals, oversized companies)
- Manual fulfillment doesn't scale to direct checkout volume
- Creates premium feel — "by application" signals exclusivity
- Allows pricing flexibility based on company size/complexity ($2,500 small, $4,500 mid)

**What customer gets:**
- Everything in **Tier 3 Full Evidence Folder**, PLUS:
- **Loom walkthrough** — a 15-20 min video walking through the customer's specific pack, classifications, and recommended next steps
- **One revision round** — customer flags up to 5 items, we revise them within 5 business days
- **Buyer/legal handoff cleanup** — we polish the lawyer-handoff doc and the vendor-questionnaire-response doc with their specific buyer's questions
- **Optional advisor-supported review** — when our advisor relationship allows, the advisor signs off on the classifications (not legal advice; clear caveat)
- **30 days of email Q&A access** to the founder (not the advisor)

**Application form:**
- Company size (5-50 employees / 50-200 / 200+) — 200+ deferred to enterprise
- Vertical confirmation (out-of-scope check)
- Primary AI use case
- Compliance trigger (vendor q? lawyer? procurement?)
- Timeline urgency
- Willingness to be a case study (optional, light discount)

**Pricing tiers within Tier 4:**
- $2,500 — 5-25 employees, 1-2 AI systems, no advisor review
- $3,500 — 25-100 employees, multiple AI systems, no advisor review
- $4,500 — multiple AI systems + advisor co-sign + custom buyer questionnaire response

**Why defer to Mo-2+:**
- Need advisor relationship locked first (Tier 3 launch gate)
- Need 5+ Tier 3 customers to validate base demand
- Need the standard pack to be airtight before adding manual layer on top

---

## Standard pricing (later — after first 100 paid customers across all tiers)

| Tier | Founding price | Standard price | When to switch |
|---|---|---|---|
| 1 — Snapshot | $99 | $149 | After 50 Tier 1 customers |
| 2 — Disclosure Pack | $499 | $799 | After 30 Tier 2 customers |
| 3 — Full Evidence Folder | $999 | $1,499 | After 30 Tier 3 customers |
| 4 — Premium Handoff | $2,500-$4,500 | $4,500-$6,500 | After 10 Tier 4 customers |

**Display rules** (carried from `docs/10` §12):
- Show the founding price as the headline number
- Optionally show standard price as struck-through reference (`$99 ~~$149~~`) — only when believable, not before traction
- Avoid discount-heavy language: no "50% off!", no "limited time!"
- Use "Founding price" framing — implies finite, not promotional
- No coupon codes for Tier 2 or Tier 3

---

## Revenue math (validated against v9 dual-floor)

### Build Month (Day 0-30) — informational, not the floor metric
- Days 0-22: $0 (building)
- Days 23-30: 7 days of Tier 0 + Tier 1 + Tier 2 (Tier 3 launches Day 35)
- Realistic mix: 0.5/day Tier 1 ($99) + 0.2/day Tier 2 ($499)
- Build month forecast: **7 × ($49.50 + $99.80) = ~$1,045**

### 30 Days Post-Soft-Launch (Day 23-53) — v9 floor #1
- Tier 1 (30 days × 0.5/day × $99) = **$1,485**
- Tier 2 (30 days × 0.3/day × $499) = **$4,491**
- Tier 3 (Day 35-53, ~18 days × 0.15/day × $999) = **$2,697**
- Waitlist launch bump = **~$999**
- **30-day post-launch median: ~$9,672** → clears $2k floor by 4.8x

### 90 Days Post-Soft-Launch (Day 23-113) — v9 floor #2
- Tier 1 cumulative: 90 × 0.5 × $99 = **$4,455**
- Tier 2 cumulative: 90 × 0.3 × $499 = **$13,473**
- Tier 3 cumulative: 78 × 0.2 × $999 = **$15,584**
- Tier 4: 2 × $3,500 = **$7,000**
- **90-day cumulative median: ~$40,512** → clears $10k floor by 4x

### Stretch case (75th percentile)
- Tier 3 at 0.4/day × 78 days = $31,168
- Plus Tier 1 + Tier 2 cumulative + Tier 4
- **90-day stretch: ~$60,000+**

### Pricing-vs-old-ladder comparison
| Metric | Old (3-tier) | New (5-tier) | Delta |
|---|---|---|---|
| Tier 1 price | $99 (disclosure pack) | $99 (snapshot) | Same anchor |
| Tier 2 price | $499 (governance pack) | $499 (disclosure pack) | Same anchor |
| Tier 3 price | — | $999 (governance folder) | **+$500 hero** |
| Application tier | $1,500-$2,500 | $2,500-$4,500 | **+$1,000-$2,000** |
| 90-day median | ~$19,132 | ~$40,512 | **+$21,380** |

The 5-tier ladder roughly **2x the 90-day median revenue** without changing the user journey or content scope (Tier 3 = repackaged old Tier 2; new Tier 1 is a small additive step).

---

## Pricing principles (when adjusting)

1. **Price for the buyer, not the cost.** Customer doesn't care about $5 API cost — they care about $5,000 saved in lawyer fees.
2. **Anchor against consultants.** "$999 vs $20,000" is a clear story.
3. **Don't discount the hero tier (Tier 3).** Discounts on $999 = margin death + signals weakness.
4. **Run promotions on Tier 1 only.** A "$49 first-month launch deal" on the snapshot is fine; never on Tier 2/3.
5. **Tier 4 pricing is conversational.** Quote $2,500 for small, $3,500 for mid, $4,500 for full advisor co-sign. Don't post a fixed price publicly.
6. **Keep Tier 1 + 2 + 3 prices stable.** Changing them = SEO/positioning churn.

---

## When to introduce a new tier or split

Only when:
- Existing tier has clear demand pattern (≥10 customers)
- New tier solves a distinct customer use case (not just a price point)
- Margin math works at >85% net
- We have advisor or operational coverage for it

---

## Refund policy

- **Tier 0:** N/A (free)
- **Tier 1:** 14-day money-back guarantee, no questions asked
- **Tier 2:** 14-day money-back guarantee, no questions asked
- **Tier 3:** 7-day money-back guarantee (post-delivery, before substantive customer use)
- **Tier 4:** Pro-rated refund based on advisor work completed
- **Out-of-scope auto-rejection:** Full automatic refund within 24 hours
- **QA-failure failed_needs_retry:** Full refund if pack cannot be delivered after 2 retry runs

Refund language stays simple to maintain trust at low brand maturity.

---

## Forbidden language (carried from `docs/10` §4)

Never say in any pricing surface:
- ❌ guaranteed compliance
- ❌ audit-proof
- ❌ no lawyer needed
- ❌ fully compliant
- ❌ regulator-ready

Always say:
- ✅ buyer-ready
- ✅ lawyer-review-ready
- ✅ AI governance evidence folder, not a legal compliance guarantee
- ✅ readiness draft / preparation pack
- ✅ first-pass materials

---

## Code identifier mapping (for engineers)

The pricing-doc tier numbers map to these code identifiers:

| Doc tier | Code identifier | Implementation status |
|---|---|---|
| Tier 0 (Free) | (no code identifier — runs through `/api/scan` + `/api/confirm` only) | ✅ Built |
| Tier 1 ($99 Snapshot) | `tier_1` | 🟡 Generator stub — needs `engine/src/snapshot.ts` (TODO before smoke test path B) |
| Tier 2 ($499 Disclosure Pack) | `tier_2` | ✅ Built (was originally `tier_1` in code; renamed) |
| Tier 3 ($999 Full Governance Folder) | `tier_3` | ✅ Built (was originally `tier_2` in code; renamed) |
| Tier 4 (Premium Handoff) | `tier_4` | 🔴 Not in checkout flow; manual fulfillment only |

When reading Phase 2 commits before this rename, `tier_1` referred to the disclosure pack and `tier_2` referred to the governance pack. After this rename:
- `tier_1` = $99 snapshot (NEW; small generator)
- `tier_2` = $499 disclosure pack (was `tier_1`)
- `tier_3` = $999 governance folder (was `tier_2`)
- `tier_4` = $2.5-4.5k premium handoff (NEW; not in PayPal flow)

---

## Living document

Updated whenever:
- A tier launches/closes
- Per-order economics shift (API price changes, payment fee changes)
- A new pricing experiment is run
- A competitor signals a different tier structure we should respond to

Last updated: 8 May 2026 (Day 0/1) — 5-tier ladder migration.
