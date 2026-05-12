# 11 · Smooth Product Architecture · Reliability + Extraction Layer

The reliability and extraction upgrades that make TrustFolder feel premium and survive real-world inputs (Framer/Webflow/SPA marketing sites, partial scans, payment-success-with-generation-fail, etc.).

> Read this **after** `docs/10-world-class-product-standards.md` and **before** starting Phase 3. Phase 3 is still gated by the §14 smoke test in doc 10. Nothing here changes that gate.

---

## Why this doc exists

Phase 2 shipped a working pipeline. But "working" is not "smooth." Real customer URLs include:
- Framer/Webflow/Squarespace marketing pages where the body text only renders client-side
- Pricing pages behind auth or paywalls
- Single-page React apps where the homepage is `<div id="root"></div>`
- Sites that redirect, time out, or return 403 to non-browser user-agents
- Customers who paid but a downstream API hiccupped during generation

This doc captures the architecture upgrades that handle those cases gracefully without overspending on infra in v1.

The 10 upgrades are listed in implementation-priority order. Items 1-5 are required before public launch. Items 6-9 can land in Mo-2+. Item 10 (skill docs) is a parallel scaffolding deliverable.

---

## §1 · Three-Layer Extraction Strategy

A single fetch + cheerio pass fails on ~30-40% of B2B AI SaaS marketing sites. We need a tiered fallback.

### The three layers

| Layer | Tool | When | Cost | Latency |
|---|---|---|---|---|
| 1 | `fetch()` + `cheerio` | Always — first attempt | $0 | 1-3 sec |
| 2 | Playwright (headless Chromium) | When Layer 1 yields weak text | ~$0.001-0.003 / scan | 5-10 sec |
| 3 | Firecrawl API (paid SaaS) | Tier 2/3 paid orders only, or after Layer 2 fails | ~$0.005 / scan | 3-8 sec |

### Triggers for Layer 2 (Playwright)

Run Playwright **only when** Layer 1 produces signal that the page is JS-rendered:
- `combined_text.length < 500` (after stripping nav/footer)
- HTML contains `id="root"`, `id="app"`, `id="__next"`, or `<noscript>` directing to enable JS
- Body text contains the words `"javascript"`, `"please enable"`, `"loading…"` and very little else
- Detected framework signals in HTML: `data-framer-name`, `data-wf-page`, `data-reactroot`, `__NEXT_DATA__`, `data-sveltekit`

> **Do not run Playwright on every scan by default.** Latency adds 5-10s and cost adds up at scale. Layer 1 should handle ~60-70% of sites with no fallback.

### Triggers for Layer 3 (Firecrawl)

Run Firecrawl **only when**:
- Order is `tier_2` or `tier_3` (paid — we can absorb $0.005)
- AND Layer 2 still produces weak output (same heuristics as above, or Playwright fails)
- AND `extraction_confidence` from Claude is `'low'`

Tier 0 free eligibility check + Tier 1 snapshot **never** call Firecrawl — keeps free-and-cheap funnel within unit-economics.

### Implementation outline

Update `engine/src/crawler.ts`:

```ts
// Pseudocode
async function crawl(input: CrawlInput): Promise<Result<CrawlResult>> {
  const layer1 = await fetchAndParseWithCheerio(input.url);
  if (isStrong(layer1)) return { ok: true, data: { ...layer1, layer: 1 } };

  if (env.playwrightEnabled() && needsPlaywright(layer1)) {
    const layer2 = await fetchWithPlaywright(input.url);
    if (isStrong(layer2)) return { ok: true, data: { ...layer2, layer: 2 } };
  }

  if (env.firecrawlEnabled() && input.tier !== 'tier_0' && input.tier !== 'tier_1') {
    const layer3 = await fetchWithFirecrawl(input.url);
    if (isStrong(layer3)) return { ok: true, data: { ...layer3, layer: 3 } };
  }

  // All layers failed — graceful fallback (see §5)
  return { ok: true, data: { ...layer1, fallback: true, layer: 1 } };
}
```

Persist the layer used onto the `website_scans` row (add column `extraction_layer int`). Helps debugging and unit-economics tracking.

### Deps to add (when ready)

```
playwright          ^1.48.0   # Layer 2 (engine workspace)
firecrawl-ts        ^0.0.36   # Layer 3 (optional, behind FIRECRAWL_API_KEY)
```

Both are gated on env keys so the engine still runs without them. Default in dev = Layer 1 only.

---

## §2 · Extraction Quality Scoring

Currently `ExtractionData.confidence` is a single overall band (`'low' | 'medium' | 'high'`). Upgrade to per-field provenance so the QA layer + the customer-facing review screen can show exactly which facts are strong vs weak.

### The new shape

Every extracted field becomes:

```ts
interface ExtractedField<T> {
  value: T;
  source_url: string | null;             // page where this was inferred from
  source_type: 'website' | 'user_confirmed' | 'inferred' | 'unknown';
  confidence: 'high' | 'medium' | 'low' | 'needs_review';
}
```

### Source-type semantics

| `source_type` | When to use |
|---|---|
| `website` | Found verbatim or near-verbatim on the customer's site |
| `user_confirmed` | The user typed/confirmed it on the assessment form |
| `inferred` | We deduced it from context (e.g., "B2B" from "Built for engineering teams") |
| `unknown` | Couldn't extract — display a gentle question to the user |

### Confidence-band semantics

Same as the QA confidence bands in `docs/06-confidence-bands.md`, applied per field:
- `high` — multiple aligned signals, near-verbatim from source
- `medium` — single clear signal
- `low` — weak/ambiguous signal
- `needs_review` — model surfaced uncertainty; show as editable in the UI

### Where to apply this in the existing types

Update `engine/src/lib/types.ts`:

```ts
// Before
export interface ExtractionData {
  company_name: string;
  product_description: string;
  // ...
  confidence: 'low' | 'medium' | 'high';
}

// After
export interface ExtractionData {
  company_name: ExtractedField<string>;
  product_description: ExtractedField<string>;
  // ...
  // (overall confidence becomes a derived value across fields)
}
```

This is a breaking change for downstream code. Migration plan when implemented:
1. Add `ExtractedField<T>` type (non-breaking — new export)
2. Add `ExtractionDataV2` alongside `ExtractionData`
3. Update `extract.ts` to populate V2
4. Migrate `classify.ts`, `generate.ts`, the assessment page, and DB columns one at a time
5. Drop V1 once V2 is everywhere

### Why this matters for QA

Today, QA only sees the final generated content. With per-field source attribution, the QA layer can run rules like:
- "Don't make a hard legal claim using a `low`-confidence field as the basis"
- "If `product_description.source_type === 'unknown'`, the lawyer-handoff doc must flag it as 'customer to confirm'"
- "Any classification touching a `needs_review` field automatically biases its `confidence_band` toward REVIEW"

This is the structural defense against false-CLEAR (doc 10 §6).

---

## §3 · Review-Before-Payment Screen ✅ BUILT

**Status:** Shipped 8 May 2026. See `app/app/assessment/page.tsx` (`Step3_5Review` component + `computeLikelyDisclosures` + `computeRiskFlags` helpers).

The flow now goes:
```
URL+email → scan → 8-question form → scope-check → REVIEW SCREEN (3.5) → pack picker → PayPal
```

Before the upgrade, the 8-question form was doing double duty as both data-entry and review. That was confusing and easy to skim past.

### The upgrade — explicit Step 3.5: Review

Insert a new step **between** the questionnaire and the pack/checkout screen:

```
[questionnaire] → [REVIEW SCREEN] → [pack picker] → [PayPal]
```

The Review screen shows a single-card summary the user must explicitly confirm:

```
Before we prepare your pack, please confirm:

  Company name:           Acme AI
  Product:                Customer support chatbot for SaaS
  AI feature type:        Chatbot / conversational assistant
  Who uses it:            Business teams (B2B)
  EU customers:           Yes
  Vertical:               Customer support

  Likely disclosure needs:
    • Article 50(1) chatbot disclosure
    • AI-generated content notice (if your bot composes responses)

  Risk warnings flagged:
    • None — looks like standard limited-risk B2B AI SaaS.
                                                          [ Edit ]   [ Looks right →  ]
```

Behavior:
- Each row is editable inline (or "Edit" returns the user to the questionnaire pre-filled)
- The "Looks right →" button is the only path forward
- If the user edits a field, that field's `source_type` becomes `user_confirmed` (per §2) and `confidence` becomes `high`
- A small note at the bottom: *"You can change any of this before paying. Once we generate your pack, edits require a regeneration."*

### Why this matters

- **Trust signal** — the user feels in control of what we'll generate
- **Conversion lift** — clear summaries reduce the "what am I actually buying?" anxiety
- **QA protection** — paying customers have explicitly endorsed the inputs, so the generated pack is grounded in confirmed data
- **Bug catch** — if extraction got the company name wrong, the user catches it before it ends up in 19 generated docs

### Implementation outline

In `app/app/assessment/page.tsx`, add a new `'review'` step between the existing `'confirm'` and `'result'` steps. Reuse the same `ScanResponse + ConfirmResponse` data with a single new component `Step3_5Review`. No new API routes needed.

---

## §4 · Source-Grounded Output

Every generated document must surface the provenance of its facts so the customer (and their lawyer) can audit it.

### Inside each generated doc

Every doc gets a "Sources" section near the top, populated from the extraction's per-field provenance:

```
## Sources for this document

This document was generated using the following information:

| Fact | Source | Confidence |
|---|---|---|
| Company name (Acme AI) | Your website (acme.ai) | High |
| Product description | Confirmed by you on 2026-05-08 | High |
| AI feature type | Inferred from product description | Medium |
| EU customer presence | Confirmed by you on 2026-05-08 | High |
| Risk classification (limited-risk) | Inferred from feature type + role | Medium — review with counsel |
```

### Inside the consolidated `sources-and-notes.md`

For Tier 3 (Full Evidence Folder), the existing `sources-and-notes.md` (built in `engine/src/package.ts`) gets a new top section:

```
## How we built this pack

Inputs we used:
  • Pages crawled from your website: 4 (homepage, /pricing, /about, /docs)
  • Extraction layer used: 1 (fast HTML fetch)
  • Questionnaire answers you confirmed: 8 of 8
  • Inferences we made: 6 (listed below)

Items flagged for your review:
  • Risk classification confidence: Medium — see classification memo §3
  • Provider/deployer role: Both — see role memo §2
```

### Implementation outline

When §2 (per-field provenance) lands, `generate-system.ts` gets a new system-prompt section instructing Claude to render the per-doc Sources table from the structured `extraction.fields[].source_type` data.

Until §2 ships, this is a documentation aspiration; don't add fake sources tables.

---

## §5 · Graceful Fallback (already partially in place — formalize)

`engine/src/crawler.ts` and `app/app/api/scan/route.ts` already handle scan failure gracefully. This section formalizes the rules so future modules don't regress.

### Required behavior on any scan failure

1. **Never show stack traces or HTTP status codes** to the user.
2. **Never say "the AI is broken"** — the AI didn't fail; we couldn't read the page.
3. **Always allow the user to continue** — the manual questionnaire fully replaces the scan output.
4. **Persist the failure** — the `assessments` row gets `extraction_data: {}` and `extraction_confidence: 'low'` so QA + downstream modules know to treat user-typed inputs as the source of truth.
5. **Friendly UX copy:**

   > *"We couldn't read your site automatically — that's normal for some setups. Let's fill it in together. (~30 seconds)"*

### Failure cases that must all hit the same fallback

| Failure | What we do |
|---|---|
| URL doesn't resolve (DNS, 4xx, 5xx) | Manual fallback |
| Site requires auth / returns 403 to bots | Manual fallback |
| Layer 1 produces weak text + Layer 2/3 disabled or also weak | Manual fallback (with note that the user can paste a description) |
| Site is non-English | Manual fallback (prompt user to confirm in English) |
| Network timeout | Manual fallback (retry button visible if user wants) |

### What the manual-fallback questionnaire looks like

Same 8 questions as the prefilled flow, but **no prefilled values** and a small banner:

> *"We couldn't auto-fill from your URL — fill in below and we'll proceed."*

Already implemented in `app/app/assessment/page.tsx` — verify before each release that this path still works (smoke-test path C in doc 10 §14).

---

## §6 · Admin Rescue Tools

For Mo-2+. Build only after the first 5-10 paying customers — don't pre-build for non-existent operators.

### Minimum viable admin dashboard

A protected `/admin` route (Supabase magic-link auth or basic-auth via env) with these tools:

| Tool | What it does | Calls |
|---|---|---|
| **View order detail** | Show the full order row + status timeline + linked assessment | `select * from orders … join order_status_events …` |
| **View scan result** | Show the cached `website_scans` row, including raw text and which layer succeeded | `select * from website_scans where id = …` |
| **View extracted facts** | Show the structured extraction (with §2 provenance once landed) | From `assessments.extraction_data` |
| **Retry scan** | Re-run `crawler.ts` for the URL, force layer escalation | `POST /api/admin/retry-scan` |
| **Retry generation** | Call `runPipeline({ order_id, is_retry: true })` | `POST /api/admin/retry-pipeline` |
| **Retry email** | Re-send the delivery email with the existing signed URL | `POST /api/admin/retry-email` |
| **View QA errors** | Show the latest `qa_results` row + flags array | `select * from qa_results where order_id = …` |
| **Manually download pack** | Generate a fresh signed URL and present a link (no email) | `supabase.storage.createSignedUrl` |

### Auth — keep it minimal in v1

- Single founder admin email allowlist via env var `ADMIN_EMAIL`
- Magic-link sign-in via Supabase auth
- All admin actions logged to a new `admin_actions` table for audit

### Why this matters

When a customer emails saying *"my pack didn't arrive"*, the founder needs a 60-second triage path. Without these tools, every support email costs 15-30 minutes.

---

## §7 · Background Job Recommendation

Today, the post-payment pipeline runs as a **fire-and-forget** Promise from the PayPal webhook + the manual capture endpoint:

```ts
// engine/src/index.ts re-exports runPipeline; routes call:
void runPipeline({ order_id }).catch((err) => console.error(err));
```

This works in dev and on Vercel up to the platform's ~25-second invocation budget for serverless functions. Tier 3 generation can take **5-10 minutes** end-to-end (13 docs × parallel pool of 4 + QA + package + deliver).

### The risk

- Vercel kills the request after the function timeout
- The pipeline's later steps (`qa`, `package`, `deliver`) never run
- Order is stuck at `qa_started` indefinitely
- Customer never gets a pack
- This is a silent failure mode — webhook returned 200, customer thinks all is well

### The fix — add a real job queue before public launch

Two equally good options:

| Option | Pros | Cons |
|---|---|---|
| **Inngest** | Free tier ample for pre-launch volume; Next.js integration is one route handler; per-step retries and observability | Vendor lock-in; need to refactor `runPipeline` into named steps |
| **Trigger.dev** | Open-source self-host option; similar DX | Same refactor required |

### Refactor plan

`runPipeline` becomes a job definition with named steps:

```ts
// Pseudocode
inngest.createFunction(
  { id: 'trustfolder-generate-pack' },
  { event: 'order/payment.completed' },
  async ({ event, step }) => {
    const order = await step.run('load-order', () => loadOrder(event.data.order_id));
    const cls   = await step.run('classify', () => classify({ ... }));
    const gen   = await step.run('generate', () => generate({ ... }));
    const qa1   = await step.run('qa', () => qa({ ... }));
    if (!qa1.pass) {
      const gen2 = await step.run('generate-retry', () => generate({ ... }));
      const qa2  = await step.run('qa-retry', () => qa({ ... }));
    }
    const pkg = await step.run('package', () => buildPack({ ... }));
    const del = await step.run('deliver', () => deliverPack({ ... }));
  }
);
```

The PayPal webhook then just emits an event and returns 200 immediately:

```ts
await inngest.send({ name: 'order/payment.completed', data: { order_id } });
return NextResponse.json({ ok: true });
```

### When to switch

- Soft launch (Day 24): fire-and-forget is fine for 1-3 orders/day
- Public launch (Day 35+): switch to Inngest before Tier 3 launches (Tier 3's longer pipeline runs are where the timeout risk is real)

---

## §8 · No Extra Connectors in v1

**Locked decision.** Do NOT add any of these in v1:
- Notion API integration
- Google Drive export
- Slack notifications
- GitHub commits
- HubSpot / Salesforce / Attio CRM sync
- Webhooks for "generation complete" events

### Why not

Every connector adds:
- An auth flow (OAuth, API keys, scopes) that costs UX simplicity
- A failure mode (token expired, API rate-limited, scope revoked)
- A support surface ("my Notion import is missing pages")
- A documentation burden

In v1, **ZIP + email is the only delivery channel.** Customers can manually drag a ZIP into Notion, Google Drive, or anywhere else they want. The Markdown files in the ZIP are designed to be Notion-importable as-is.

### When to revisit

After 50+ paying customers, look at support emails. If 5+ customers explicitly request *"can you push directly to my Notion / Drive"*, build the highest-frequency request first. Until then, this is a distraction.

### Allowed v1 integrations

- **Resend** — transactional email (already in)
- **PayPal** — payment (already in)
- **Anthropic Claude** — model API (already in)
- **Supabase** — DB + Storage + auth (already in)
- **Inngest / Trigger.dev** — job queue (per §7, before public launch)

That's the entire integration surface. No others until traction is real.

---

## §9 · Optional Future Upload Layer

For Mo-3+. Lets the customer upload existing docs that improve their generated pack accuracy:

### What customers can upload (when this lands)

| Document type | Why it helps |
|---|---|
| Existing privacy policy (PDF/DOCX) | We learn their data-handling stance, avoid contradicting it |
| Existing AI / acceptable-use policy | We avoid generating a duplicate; we generate a complementary one |
| Security overview / SOC2 letter | Strengthens vendor-questionnaire doc with real claims |
| Existing product docs / API docs | Better extraction of the AI feature surface |
| Buyer questionnaire they've already received | We can tailor the lawyer-handoff doc to those exact questions |

### Implementation approach

- **Parser:** [Unstructured](https://unstructured.io/) (open-source) or LlamaParse for DOCX/PDF → structured Markdown.
- **Storage:** Supabase Storage, private bucket per assessment, 30-day retention by default.
- **Surface in the engine:** the upload becomes an additional input to `extract.ts`. Treat it as a fourth source after website / questionnaire / inferred — `source_type: 'uploaded'`.
- **PII risk:** uploaded docs may contain personal data. Default behavior: redact email addresses + phone numbers before sending to Claude. Opt-in toggle in the UI.

### Pricing implication

Upload support is a Tier 3+ feature when it lands. Tier 0/1/2 stay automatic.

### When to revisit

After Tier 3 has 30+ customers. Look at support emails for "can I share my existing X." If we hear that 5+ times, build it.

---

## §10 · Skill Documents (Cascade-Style Skills)

Five companion skill docs let future Cascade sessions (or human contributors) consistently handle the most common operational paths. Each skill is a focused playbook — not a tutorial, not a reference — that an agent can follow when triggered.

| File | Triggers | Purpose |
|---|---|---|
| `docs/skills/extraction-quality-skill.md` | Extraction failed, weak signal, framework detection | Apply the §1 three-layer strategy + §2 quality scoring |
| `docs/skills/qa-skill.md` | Adding a new QA rule, debugging a QA flag, tuning auto_fail thresholds | Stay aligned with the QA rules in doc 10 §6 |
| `docs/skills/payment-recovery-skill.md` | Customer reports "paid but no pack", webhook missed, capture failed | Walk the failure-recovery flow without losing the order |
| `docs/skills/out-of-scope-skill.md` | New regulated vertical surfaces, scope-check needs to add a keyword, refund needs to fire | Keep the §7 of doc 10 boundaries firm and consistent |
| `docs/skills/packaging-skill.md` | Tier-folder structure changes, README copy edits, new doc added to a tier | Maintain the §10 of doc 10 packaging shapes |

The skills sit in `docs/skills/` so a future Cascade session can `read_file` them when it sees a matching trigger phrase.

Each skill follows the same shape (mirroring the one in `c:\Users\hydra\Desktop\MCP\.windsurf\skills\solo-founder-sourcing\SKILL.md`):

```markdown
---
description: <one-line trigger description>
---

# <skill name>

## When to use this skill
<bullet-list of triggers>

## Procedure
<numbered steps>

## Anti-patterns
<bullet-list of common mistakes>

## Definition of done
<bullet-list of success criteria>
```

These skills are **scaffolding** in v1 — they document the playbook even before automation exists. Reading and following them is what makes the product feel boringly reliable (doc 10 §15).

---

## Phase 3 gate (still respected)

This doc adds future-state architecture. **Do NOT start Phase 3 (Framer marketing site + brand kit) until:**

1. ✅ This doc is added (you're reading it)
2. ✅ The 5 skill docs are scaffolded (`docs/skills/*.md`)
3. ⬜ `npm install` complete in `engine/` and `app/`
4. ⬜ Supabase migration applied + `deliveries` storage bucket created
5. ⬜ PayPal sandbox + Resend + Anthropic env vars set
6. ⬜ Smoke test paths from `docs/10` §14 confirmed (or documented as known-pending)

Items 3-6 are the same gate as before. This doc does not relax them.

---

## Implementation prioritization

When time comes to build the upgrades in this doc, the order is:

1. ~~**§5 — Graceful fallback**~~ (verify; mostly done)
2. ~~**§3 — Review-before-payment screen**~~ ✅ **Shipped 8 May 2026**
3. **§1 — Three-layer extraction (Layer 2 Playwright)** (handles ~30% of failed scans, ~4 hours)
4. **§7 — Background job queue** (before Tier 3 launches publicly, ~6 hours)
5. **§2 — Per-field extraction provenance** (refactor; ~8 hours, breaking change)
6. **§4 — Source-grounded output** (depends on §2)
7. **§6 — Admin rescue tools** (when first 5-10 customers ship; ~6 hours)
8. **§1 — Layer 3 Firecrawl** (only if Layer 2 retention isn't enough; ~2 hours)
9. **§9 — Upload layer** (Mo-3+; ~12 hours)

Total budget for items 1-7 (everything required before public launch): **~31 hours of build** (of which ~3 now shipped), spread across Mo-1 to Mo-2.

---

Last updated: 8 May 2026 (Day 0/1)
