---
description: Use when adding a new QA rule, debugging a QA flag, tuning auto_fail thresholds, or investigating why a generation failed QA.
---

# QA Skill

## When to use this skill

- A generation passed deterministic checks but failed LLM QA (or vice versa)
- You're adding a new forbidden phrase to the auto_fail list
- A customer reported a doc that says "you are compliant" or another forbidden claim
- The QA score keeps falling below threshold for a specific template
- You're tuning the retry-once threshold
- You're adding a new check (e.g., "every doc has a confidence band callout")

## Reference docs

- World-class bar: `docs/10-world-class-product-standards.md` §6 (QA standard, the canonical rules)
- Brand language: `docs/01-brand-language-rules.md` (forbidden phrase list)
- Confidence bands: `docs/06-confidence-bands.md`
- Code: `engine/src/qa.ts`, `engine/src/prompts/qa-system.ts`

## Procedure

1. **Decide which layer the rule belongs in:**
   - **Deterministic (Layer A)** — exact-match string checks, regex patterns, structural validation (e.g., disclaimer present). Cheap, instant, always run.
   - **LLM (Layer B)** — semantic checks ("does this doc make any unsupported legal conclusions?"). Cost-bearing; only run after Layer A passes.
2. **Add the rule.**
   - Layer A: add to the rule list in `engine/src/qa.ts` with a `severity` of `auto_fail` | `warn` | `info`.
   - Layer B: extend the system prompt in `engine/src/prompts/qa-system.ts` with the new check; keep prompt under ~150 lines for cost.
3. **Set severity carefully:**
   - `auto_fail` = regenerate the doc once. Use for: blank placeholders, forbidden phrases, missing disclaimer, "you are compliant" patterns.
   - `warn` = log + include in flags; doesn't fail the run alone. Use for: missing citation, weak confidence-band wording.
   - `info` = log only.
4. **Bias toward REVIEW.** False-CLEAR is the worst failure mode (doc 10 §6). When uncertain whether to fail or warn, **fail** — regeneration is cheap, false confidence is costly.
5. **Test the rule.**
   - Construct a known-bad output and verify QA flags it as expected.
   - Construct a known-good output and verify QA does NOT flag it (avoid false positives).
   - Run the full pipeline on a sandbox order; check `qa_results` in Supabase.
6. **Document the rule.** Add a one-line comment near the rule explaining what bad behavior it's defending against and the date added.

## Anti-patterns

- **Adding overly-strict rules** that fail valid output — worse than no rule because they cause infinite retry loops.
- **Skipping deterministic checks** in favor of LLM-only QA — deterministic is faster, cheaper, and harder for the model to game.
- **Forgetting the disclaimer check** when adding new doc types — every doc must end with the canonical disclaimer.
- **Running LLM QA before deterministic** — wastes cost on outputs that fail deterministic anyway.
- **Tuning the auto_fail threshold below 70** — anything that low signals broken generation, not a borderline-acceptable doc.
- **Hardcoding numbers in prompts** ("score above 80 is pass") — keep thresholds in env or config, not in the prompt.

## Definition of done

- A failing example now triggers the rule.
- A passing example does NOT trigger the rule.
- The rule's `severity` matches its impact (auto_fail = regenerate; warn = log).
- `qa_results` rows show the new rule under `rules_checked` for runs since the change.
- Doc 10 §6 still describes the QA layer accurately (update doc 10 if structural changes).
- No regression on previously-green smoke test path G.
