---
description: Use when a new regulated vertical surfaces, scope-check needs a new keyword, a soft-out customer needs founder triage, or a refund needs to be issued for an out-of-scope discovery after payment.
---

# Out-of-Scope Skill

## When to use this skill

- A customer's questionnaire vertical = banking / healthcare / hr / biometric / children / credit / law_enforcement
- A keyword scan flagged a hard-out term in the extraction or answers
- A soft-out vertical (insurance, legal litigation, defense, government) needs 24-hour founder triage
- A REVIEW-band flag from extraction (emotion recognition, biometric categorization, deepfake) needs a tier upgrade or a notes addition
- A new regulatory category needs to be added to the hard-out list (e.g., new Annex III amendment)
- An out-of-scope was discovered AFTER payment — refund branch needs to fire

## Reference docs

- Out-of-scope rules: `docs/10-world-class-product-standards.md` §7 (canonical list)
- Scope ICP: `docs/02-icp-and-niche-scope.md`
- Code: `engine/src/scope-check.ts` (the deterministic logic), `engine/src/deliver.ts` (refund email)

## Procedure

1. **Confirm the category.**
   - Hard-out (auto-reject pre-checkout): healthcare diagnosis, HR/hiring, credit scoring, insurance underwriting (auto-reject branch when confidence is high), biometric ID, children, education grading/admissions, law enforcement, critical infrastructure, migration/asylum.
   - Soft-out (allowed through but flagged for 24-hr founder review): insurance pricing edge cases, legal litigation, defense, government procurement, manufacturing safety AI.
   - Article 5 prohibitions: social scoring, subliminal manipulation, real-time public biometric ID, workplace/classroom emotion recognition.
2. **For pre-payment hard-out:**
   - Confirm `scope-check.ts` returns `band: 'HARD_OUT'` and `recommended_tier: null`.
   - The frontend (`app/app/assessment/page.tsx`) routes to `/out-of-scope` automatically; no PayPal button shows.
   - The lead is captured for "we expanded coverage" notification — verify `leads` row exists.
   - Email goes via `sendOutOfScopeRefund` (with no charge) — verify `email_events` row.
3. **For pre-payment soft-out:**
   - `scope-check.ts` returns `band: 'SOFT_OUT'`, `recommended_tier: 'tier_2'`, `in_scope: true`.
   - The user sees: *"We can help, but your use case has some sensitive aspects we'd like a human to confirm before generating. We'll route this for a quick founder review and follow up within 24 hours. No charge yet."*
   - **Founder triage within 24 hours.** Either approve (allow checkout) or decline politely (out-of-scope email).
4. **For post-payment out-of-scope discovery (rare):**
   - Issue a full PayPal refund: `refundCapture(paypal_capture_id, "Out-of-scope: specialist counsel recommended")`.
   - Move the order to `out_of_scope` status (terminal — bypasses retry logic).
   - Send the refund-explanation email with specialist-counsel pointer.
   - Add a note to `progress.txt` — every post-payment out-of-scope is a scope-check gap to close.
5. **Adding a new hard-out keyword:**
   - Add to `HARD_OUT_KEYWORDS` in `engine/src/scope-check.ts`.
   - Add a one-line comment with an example trigger phrase.
   - Update the questionnaire `vertical` enum in `engine/src/lib/types.ts` if it's a new vertical.
   - Update `app/app/assessment/page.tsx` `VERTICAL_OPTIONS` to surface the new vertical with the "out of scope" label.
   - Update doc 10 §7 + doc 02 ICP doc with the new entry.
6. **Communicate with calm honesty.**
   - Use the canonical wording: *"This looks like it needs expert review before automated document generation. We will not charge you."*
   - Never imply we'll review-and-decide if we won't.
   - Always offer a specialist-counsel pointer in the email.

## Anti-patterns

- **Charging an out-of-scope customer "just in case"** — refund risk, trust risk, legal risk. Always reject pre-payment.
- **Using LLM judgment for the scope check** — it's deterministic on purpose. False-CLEAR on a regulated vertical = refund + legal exposure.
- **Saying "you might be in scope, let's try"** — either you're confident or you decline. No middle ground in the user-facing flow.
- **Forgetting to capture the lead email** on a hard-out rejection — even out-of-scope leads are valuable for the "we expanded coverage" nurture sequence.
- **Pretending the scope-check is part of the AI pipeline** — it's a hard-coded keyword filter that runs BEFORE classify.ts, by design.
- **Adding a soft-out vertical without setting up 24-hour founder triage** — soft-out without follow-up = the customer feels ignored.

## Definition of done

- The new keyword/vertical is in `HARD_OUT_VERTICALS` or `HARD_OUT_KEYWORDS` (or `SOFT_OUT_KEYWORDS`).
- A test URL/answer combo that should trigger does trigger.
- A test URL/answer combo that should NOT trigger does not (no false positives).
- Doc 10 §7 + doc 02 reflect the new entry.
- Frontend `VERTICAL_OPTIONS` in `app/app/assessment/page.tsx` surfaces it with the right "out of scope" or "needs review" label.
- The customer (if in flow) sees the canonical message, not a raw error.
- For post-payment cases: refund issued, order at `out_of_scope`, refund email sent, postmortem in `progress.txt`.
