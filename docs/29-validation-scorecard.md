# Validation Scorecard

## Purpose

This document defines how the Phase 4 Buyer Validation effort is evaluated.

The scorecard is the decision instrument at the end of the 14-day validation window described in `25-phase-4-buyer-validation-plan.md`. It converts the manual outreach, free checks, and paid pack engagements into a single decision: continue, pivot, narrow, or stop.

The scorecard is evidence-first. No score is allowed without the underlying counts and qualitative notes recorded in the lead sheet.

## Phase 4 Operating Principle

Phase 4 is documentation-only. The scorecard does not authorize new product features, dashboards, automation, subscriptions, connectors, or new payment providers under any score.

The scorecard authorizes only:

- Continuing the manual operating model into Phase 5.
- Narrowing or shifting the lead profile.
- Adjusting messaging or pack structure.
- Pausing or stopping outreach.

Anything that requires building is recorded as Phase 5 demand signal, not as a Phase 4 decision.

## Inputs

The scorecard reads from the lead sheet defined in `26-target-lead-list-spec.md` and the outreach log defined in `27-outbound-message-bank.md`. It also reads delivery outcomes from `28-demo-pack-strategy.md`.

Required inputs from the 14-day window:

- Total leads sourced.
- Total leads contacted.
- Total replies (positive, negative, neutral).
- Total free check opt-ins.
- Total free checks delivered.
- Total paid pack requests.
- Total paid packs delivered.
- Total revisions issued.
- Total refunds issued.
- Qualitative reasons for refusal, by lead.
- Qualitative reasons for paid pack purchase, by lead.

Each input must be a number. Each qualitative reason must be a short note tied to a specific lead in the sheet.

## Six Filters

The scorecard has six filters. Each filter is scored from 0 to 10. Maximum score is 60.

| # | Filter | Question |
|---|---|---|
| F1 | Reachability | Were qualified leads reachable through manual outreach? |
| F2 | Recognition | Did qualified leads recognize the buyer-trust pain when described? |
| F3 | Free check pull | Did qualified leads accept the free check at a meaningful rate? |
| F4 | Paid pack pull | Did free check recipients convert into paid pack requests? |
| F5 | Delivery quality | Did paid packs hold up without refund or quality dispute? |
| F6 | Manual viability | Can the founder run this workflow manually at the volume implied by the conversion rates? |

## Filter Anchors

The same anchor scale applies to every filter.

| Score | Meaning |
|---:|---|
| 0 | Fatal negative evidence. The filter cannot pass under current conditions. |
| 1–2 | Very weak. Mostly absence of signal. |
| 3–4 | Weak. Plausible but unproven. Major gaps. |
| 5–6 | Mixed. Some signal, but meaningful risk remains. |
| 7–8 | Strong. Multiple repeatable signals. |
| 9 | Very strong. Direct evidence with low uncertainty. |
| 10 | Exceptional. Rare. Direct paid behavior at scale. |

Each filter score must be backed by:

- The exact count from the input list.
- A short justification referencing leads in the sheet.
- A note on what would raise or lower the score.

## Filter Targets

The 14-day window is the budget. Targets below describe what each filter looks like at score 7 versus score 4. Anything below 4 is a filter failure.

### F1 · Reachability

- Score 7 · At least 60% of sourced leads have a verified work email and at least one usable contact role.
- Score 4 · Fewer than 40% of sourced leads have a usable contact path. Outreach volume is dominated by guesswork.

### F2 · Recognition

- Score 7 · At least 25% of replies acknowledge buyer-trust pain in their own words. Negative replies are about timing, not the premise.
- Score 4 · Most replies are confused, dismiss the premise, or treat TrustFolder as a generic SOC 2 vendor.

### F3 · Free check pull

- Score 7 · At least 8 free checks delivered in 14 days. Free check opt-in rate is at least 5% of contacted leads.
- Score 4 · Fewer than 4 free checks delivered. Opt-in rate below 2% of contacted leads.

### F4 · Paid pack pull

- Score 7 · At least 2 paid pack requests in 14 days, both from leads that came through free checks. Conversion from free check to paid pack at least 20%.
- Score 4 · Zero paid pack requests, or paid pack requests only from leads who never engaged with the free check.

### F5 · Delivery quality

- Score 7 · Paid packs delivered without refund. At most one revision pass per pack. Buyer feedback is grounded in scope, not format.
- Score 4 · Refunds issued. Multiple revision passes. Buyer feedback indicates the pack is unclear, generic, or off-target.

### F6 · Manual viability

- Score 7 · Founder can sustain the implied volume manually for the next 60 days without sacrificing pack quality. Steady-state time per customer is bounded.
- Score 4 · Implied volume already strains founder capacity. Pack quality is at risk under current load.

## Score Caps

Caps are applied after raw scoring. They prevent attractive but misleading scores.

| Condition | Cap |
|---|---:|
| Zero paid pack requests in 14 days | Total capped at 35. Verdict cannot be Continue. |
| At least one refund issued | Total capped at 45 unless the refund cause was a documented one-off scope error. |
| Paid pack conversion below 5% from free check | F4 capped at 4. |
| Free check opt-in rate below 1% of contacted leads | F3 capped at 4. |
| Founder time per customer exceeds the 60-day sustainability threshold | F6 capped at 4. |
| Buyer-trust pain not recognized in qualified replies | F2 capped at 4. |
| Verified-email rate below 25% of sourced leads | F1 capped at 4. |
| Any unresolved legal, payment, or trust risk surfaced during Phase 4 | Total capped at 45 and verdict cannot be Continue until resolved. |

If two or more caps trigger simultaneously, the verdict is automatically Pivot or Stop, regardless of total score.

## Verdict Bands

After caps, the total score maps to one verdict.

| Total | Verdict | Meaning |
|---:|---|---|
| 0–24 | Stop | The current ICP, offer, and channel mix are not validated. Do not continue Phase 4 in its current form. |
| 25–34 | Pivot | Real but mismatched signal. The pain is present somewhere, but not where Phase 4 looked. Reframe ICP, channel, or offer before any further effort. |
| 35–44 | Narrow | Some buyer pull, but too thin to scale. Tighten the ICP and rerun a second 14-day window with a smaller, sharper list. |
| 45–54 | Continue manual | Validated for the manual operating model. Phase 5 is allowed only as a manual extension. No new product features authorized. |
| 55–60 | Continue and prepare Phase 5 | Strong manual signal. Phase 5 planning may begin, but Phase 5 itself is a separate decision and a separate documentation pass. |

Build authorization is never granted by this scorecard. Build authorization requires its own decision document beyond Phase 4.

## Qualitative Lessons Section

Numbers alone do not pass the scorecard. Every Phase 4 review also produces a short qualitative section. Required notes:

- The angle that produced the most free check opt-ins.
- The angle that produced the most paid pack requests.
- The most common reason qualified leads declined.
- The most common reason qualified leads converted.
- The single biggest surprise from the 14-day window.
- The single biggest risk surfaced.

Each note is one or two sentences. Each note must reference at least one lead in the sheet.

## Decision Log Format

The output of the scorecard is a single decision log entry appended to the Phase 4 review file.

Required fields:

| Field | Content |
|---|---|
| Window dates | Start and end of the 14-day validation window. |
| Leads sourced | Count. |
| Leads contacted | Count. |
| Replies | Positive, negative, neutral. |
| Free checks delivered | Count. |
| Paid pack requests | Count. |
| Paid packs delivered | Count. |
| Refunds | Count. |
| F1–F6 raw scores | Six numbers. |
| Caps triggered | Named caps. |
| Total after caps | Number out of 60. |
| Verdict | Stop / Pivot / Narrow / Continue manual / Continue and prepare Phase 5. |
| Qualitative lessons | Six short notes. |
| Next action | One sentence describing the very next step. |

The decision log is the single source of truth for what happens after the window closes.

## Anti-theater Rules

The scorecard is meant to protect against false positives. The following are prohibited inside the scorecard.

- No score above 5 on any filter without the underlying numeric input recorded.
- No use of "interest" as a substitute for paid behavior.
- No counting of likes, opens, or LinkedIn impressions as buyer signal.
- No counting of intro calls without a paid follow-up as a paid pack signal.
- No retroactive changes to a filter score after the verdict is written.

A revised scorecard requires a new decision log entry, not an in-place edit.

## Allowed Adjustments After Verdict

After the verdict is recorded, the only adjustments allowed within Phase 4 are:

- Tightening the ICP and rerunning a second 14-day window.
- Adjusting the message angles in `27-outbound-message-bank.md`.
- Adjusting the demo pack structure in `28-demo-pack-strategy.md` within the existing manual model.
- Adjusting price within a single fixed tier.

Disallowed without leaving Phase 4:

- Adding a dashboard.
- Adding subscriptions.
- Adding connectors.
- Adding auth.
- Adding a new payment provider.
- Adding new product surface area of any kind.

## Out of Scope for Phase 4

The validation scorecard does not score, predict, or recommend:

- Long-term ARR or growth projections.
- Pricing optimization beyond a single fixed tier.
- Channel scaling.
- Hiring decisions.
- Product roadmap items.
- Brand positioning beyond the message angles already documented.

These belong to a future phase and a separate document, not to the Phase 4 validation scorecard.
