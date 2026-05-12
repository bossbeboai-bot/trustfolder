---
description: Use when a website scan returned weak text, the customer's site is on Framer/Webflow/SPA, extraction confidence is low, or you need to add a new layer/heuristic to the crawler.
---

# Extraction Quality Skill

## When to use this skill

- A scan returned `combined_text.length < 500` or framework signals (`__NEXT_DATA__`, `data-framer-name`, `data-wf-page`, `id="root"`)
- `extract.ts` returned `confidence: 'low'` or `used_fallback_minimal: true`
- A customer reported "you got my company name wrong"
- You're adding a new heuristic to detect JS-heavy sites
- You're adjusting Layer 1/2/3 escalation rules
- You're touching `ExtractionData` or per-field provenance

## Reference docs

- Architecture: `docs/11-smooth-product-architecture.md` §1 (three layers) + §2 (per-field scoring)
- World-class bar: `docs/10-world-class-product-standards.md` §2 (magic moment) + §5 (premium output)
- Code: `engine/src/crawler.ts`, `engine/src/extract.ts`, `engine/src/lib/types.ts`

## Procedure

1. **Identify the failure mode** before touching code.
   - Read the failing `website_scans` row from Supabase (or run `crawler.ts` locally with the URL).
   - Categorize: empty body? framework-rendered? auth-walled? non-English? timeout?
2. **Match the failure to a layer:**
   - Empty/weak body + framework signals → escalate to Layer 2 (Playwright).
   - Layer 2 also weak + tier_2/tier_3 order → escalate to Layer 3 (Firecrawl).
   - Auth-walled or non-English → no scan can recover; route to manual fallback (skill: `out-of-scope-skill` not applicable; this is `extract` returning empty).
3. **Update heuristics** in `crawler.ts` if needed.
   - Heuristic checks live in a single `needsPlaywright(layer1)` function — keep them all there, don't scatter.
   - When adding a new framework signal, add a one-line test in the heuristic + a comment with an example URL where it triggers.
4. **Preserve graceful fallback.** Every code path must return a `Result<CrawlResult>` with `ok: true` even if all layers fail — set `fallback: true` on the data so downstream knows to treat user input as the source of truth (doc 11 §5).
5. **Update per-field provenance** (when §2 of doc 11 lands).
   - Each extracted field carries `source_url`, `source_type`, and `confidence`.
   - User-edited fields flip to `source_type: 'user_confirmed'` and `confidence: 'high'`.
6. **Verify with smoke test.**
   - Path C in `docs/10` §14: try a deliberately broken URL (e.g. `https://does-not-exist-xyz.example`) — must hit the manual fallback gracefully.
   - Try a Framer-built site (e.g. `https://framer.com`) — must succeed via Layer 2 if Playwright is enabled.

## Anti-patterns

- **Running Playwright by default** — adds 5-10s and cost; only escalate when Layer 1 is weak.
- **Calling Firecrawl on Tier 0/Tier 1 orders** — breaks unit economics.
- **Showing technical errors to users** ("Cheerio failed to parse:" etc.) — always plain English: *"We couldn't read your site automatically — let's fill it in together."*
- **Throwing instead of returning Result** — every crawler path must return `{ ok: true, data: { fallback: true } }` or `{ ok: false, error }` cleanly.
- **Letting one bad URL crash the engine** — wrap fetch + parse + Playwright in try/catch with timeout budgets.
- **Inventing facts when extraction is weak** — Claude prompts must say "if uncertain, return `null` or `'unknown'`," never hallucinate a company name.

## Definition of done

- The previously failing URL now returns `extraction_data` with at least company name + 1-2 AI features OR triggers the manual fallback with a clean UX.
- The `website_scans.extraction_layer` column reflects which layer succeeded (1/2/3).
- The `extraction_data.confidence` is honest — `low` when signals are weak; never inflated to mask a bad scan.
- Smoke test path C still passes (graceful fallback).
- No new Playwright-on-every-scan default introduced.
- A new `<example URL>` is added to the heuristics comment block if a new framework signal was added.
