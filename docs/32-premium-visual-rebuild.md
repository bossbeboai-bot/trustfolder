# Phase 3.8 — Premium Visual Rebuild

> **Date:** 2026-05-10
> **Direction:** Premium AI Infrastructure × Editorial Evidence System
> **Source of truth:** `@C:/Users/hydra/Desktop/complybase/docs/DESIGN.md`
> **Related:** `@C:/Users/hydra/Desktop/complybase/docs/33-remotion-motion-assets.md`,
> `@C:/Users/hydra/Desktop/complybase/docs/31-website-premium-polish.md`

This document is the Phase 3.8 changelog. It is *not* the design rulebook —
that lives in `docs/DESIGN.md`. Read that one before editing visual code;
read this one to understand what changed and why.

---

## 1 · Why this phase

Phase 3.7 ("premium polish") tightened the existing system but did not commit
to a single visual direction. The site still read as a careful SaaS app with
a small evidence-folder accent. The founder's read after Phase 3.7 was that
TrustFolder still felt "form-heavy" rather than like a *premium AI
infrastructure / governance startup*.

Phase 3.8 commits to a single direction, codifies it in a Google-Stitch-style
`DESIGN.md`, applies it across every public page, and adds a separate
Remotion workspace for high-end motion assets so the brand can travel into
sales decks and social posts as MP4/GIF without coupling to the live build.

Quality benchmark: **micro1.ai** (only as a feel reference, never copied).

---

## 2 · Direction (reference §3 of DESIGN.md)

Three directions were considered:

- **A. Premium AI Infrastructure** (Stripe / Linear / Anthropic) — calm,
  technical, confident. Risk: cold without point of view.
- **B. Editorial Evidence System** (Pentagram / *Browser Company* /
  Field.io) — document-first, oversized editorial typography, paper-warm
  surfaces. Risk: reads as a design studio without the infrastructure
  signal.
- **C. Enterprise Buyer-Readiness Platform** (Palantir / Bridgewater) —
  dataviz-heavy, dark-glass institutional feel. Risk: oversells the
  automation, undersells the founder review, intimidates the audience.

**Chosen: A + B.** The infrastructure read earns enterprise trust; the
editorial document-first signature gives TrustFolder a unique visual
identity in a category dominated by SaaS-default landing pages. C influences
only the `/safety` page (where institutional authority helps) and never the
homepage.

---

## 3 · Foundation changes

### 3.1 Tokens

Three new tokens added to `@C:/Users/hydra/Desktop/complybase/app/app/globals.css:5-28`:

- `--tf-paper` `#f3eee2` — kraft-paper surface for the document-stack motif.
- `--tf-accent-deep` `#0a5a64` — hover variant of the teal accent.
- `--tf-success-soft` `#e7f4eb` — soft green for fit-confirmed badges.

All previous tokens (`--tf-bg`, `--tf-ink`, `--tf-slate`, etc.) are
unchanged so existing pages keep rendering during incremental rollout.

### 3.2 Primitives

`@C:/Users/hydra/Desktop/complybase/app/app/components/MarketingPrimitives.tsx:184-521`
extends Phase 3.7's `Reveal` / `PrimaryLink` / `SecondaryLink` / `PageHeader`
/ `Section` / `Card` / `FinalCta` / `ScopeNote` set with the editorial
vocabulary the chosen direction needs:

| Primitive | Purpose |
|---|---|
| `MonoLabel` | Monospace caps eyebrow, 4 tones (accent/slate/soft/invert) |
| `DocumentCard` | Warm-cream surface card. Default for anything that should read as *a document*. |
| `DarkCard` | Ink card for featured surfaces (agencies block, featured pack). |
| `GlassCard` | Blurred sticky card for side-info panels. |
| `TrustNote` | Icon + caption row used in side cards. |
| `ConfidenceBadge` | Three-tone fit / review / expert pill. |
| `MonoNumeral` | 01/02/03 monospace step numerals. |
| `Eyebrow` | Sans-uppercase teal eyebrow row. |
| `EvidenceScene` | The cinematic 3-layer hero visual. Reusable. |
| `ProcessRailCard` | Step card with hover progress bar. |
| `SideInfoCard` | Sticky side-info card with trust notes + tertiary link. |

Names are namespaced inside `MarketingPrimitives` so existing imports keep
working. The previously-internal `Card` and `FinalCta` are unchanged.

---

## 4 · Page-by-page changes

### 4.1 `/` — `@C:/Users/hydra/Desktop/complybase/app/app/components/MarketingHome.tsx:1-515`

Full rewrite. New 10-section narrative:

1. **Cinematic hero.** Editorial display H1 at `clamp(3.4rem, 7.4vw, 7.25rem)`,
   monospace pill eyebrow, two CTAs, monospace trust strip. Hero visual is
   the new `EvidenceScene` (paper sheet + glass pipeline + dark handoff
   card) with Framer Motion staggered entrance and a 6-second loop on the
   pipeline progress bar.
2. **Trust strip** — single-row positioning + disclaimer.
3. **Platform pillars** — three `DocumentCard`s (Website Intelligence /
   Evidence Folder Engine / Buyer Handoff Layer) with mono numerals.
4. **Problem section** — 5-card grid.
5. **How it works** — 4-step `ProcessRailCard` row.
6. **Inside the evidence folder** — new `FolderIndex` mockup component
   (six numbered layers, DRAFT tag, source-note footer).
7. **Packages preview** — 5 cards with motion hover, featured-card
   highlight, quiet "see full pricing" tertiary link.
8. **Agencies block** — `DarkCard` with bold headline and CTA.
9. **Safety section** — risk-area chip grid + scope explanation.
10. **Final CTA** — centered card.

### 4.2 `/assessment` — `@C:/Users/hydra/Desktop/complybase/app/app/assessment/AssessmentPage.tsx`

The Phase 3.7 4-step structure (Website / Confirm / Review / Request)
is preserved. The visual layer is upgraded:

- New `PageHero` — accent halo, monospace pill, two-tone display
  headline ("…in two minutes") with the second clause coloured in teal.
- `StepProgress` upgraded to mono `01 / 02 / 03 / 04` numerals with a
  shadow-lifted active step.
- Local `SideInfoCard` now wraps the shared `TFSideInfoCard` so the
  trust-notes list and tertiary link are consistent with `/request`.
- Local `ConfidenceBadge` now delegates to the shared `TFConfidenceBadge`
  primitive.
- Step 4 tier cards become `motion.button` with `whileHover={{ y: -4 }}`
  and `MonoNumeral` headers.

Backend contract (`POST /api/scan`, `POST /api/confirm`) is unchanged.

### 4.3 `/request` — `@C:/Users/hydra/Desktop/complybase/app/app/components/RequestLeadPage.tsx:1-559`

Full rewrite as premium consultation flow.

- **Selected-package hero** with monospace pill (`Request paid pack ·
  {selectedLabel}`) and a per-type Display L headline.
- **What happens next** timeline — 4 `DocumentCard`s with mono numerals
  (You send / Founder reviews / We reply / You confirm).
- **Form card + summary side card** layout. Side card is a sticky
  `GlassCard` showing the selected package's includes + a Privacy block
  with `TrustNote` rows.
- **Polished success state** — green `Request received` badge, the
  request summary as a definition list, side card stays for context.

The `/api/request` payload shape and `?type=` keys are unchanged. Legacy
alias `?type=pack` still maps to `disclosure`.

### 4.4 `/pricing` — `@C:/Users/hydra/Desktop/complybase/app/app/pricing/page.tsx`

- Server component for `metadata` export. Pack card extracted into the
  client component
  `@C:/Users/hydra/Desktop/complybase/app/app/pricing/PricingPackCard.tsx`
  so motion hover (`whileHover={{ y: -6 }}`) lives client-side.
- Six packs in a 2-column grid (3 rows × 2 = no awkward gaps).
- Mono numeral `01 · Featured` / `02` etc on every pack.
- Featured "AI Disclosure Pack" pack uses the dark variant.
- New **FAQ section** with 6 Q&As (Q · 01 — Q · 06).
- Final CTA preserved.

### 4.5 `/examples` — `@C:/Users/hydra/Desktop/complybase/app/app/examples/page.tsx`

- Bordered illustrative-sample notice with monospace eyebrow + warning
  icon.
- Each example card now leads with a mono `Example · 01` eyebrow and
  has a folder-contents block in monospace on a `--tf-paper`/40 surface.
- Document snippet is highlighted in a `DocumentCard` with a `DRAFT`
  tag.

### 4.6 `/safety` — `@C:/Users/hydra/Desktop/complybase/app/app/safety/page.tsx`

- New top section "Confidence bands" explains the three pill tones
  (`fit`, `review`, `expert`) using the shared `ConfidenceBadge`.
- All eyebrows upgraded to monospace. Out-of-scope category chips
  numbered (`Out · 01` … `Out · 09`).

### 4.7 `/agencies` — `@C:/Users/hydra/Desktop/complybase/app/app/agencies/page.tsx`

- Value cards prefix monospace `Layer · 01` / `Layer · 02` etc.
- Pack contents block uses monospace + paper surface, with a `DRAFT`
  tag, matching the homepage `FolderIndex` motif.
- "How it helps" cards prefix `Value · 01` / `Value · 02` etc.

### 4.8 `/contact` — `@C:/Users/hydra/Desktop/complybase/app/app/contact/page.tsx`

- "What this is for" list now numbered `01` … `05` in monospace.
- Reply-window box upgraded to a glass card with monospace eyebrow.
- Disclaimer footer in mono caps.

---

## 5 · Motion

### 5.1 Live site (Framer Motion)

- All section reveals continue to use the Phase 3.7 `Reveal` primitive
  (opacity 0→1, y 22→0, `viewport={{ once: true, margin: '-80px' }}`,
  `[0.22, 1, 0.36, 1]` cubic ease, 0.6–0.7 s duration).
- New `EvidenceScene` runs three independent loops: pipeline progress
  bar (6 s), per-row hover float (4.5 s with staggered delays), and a
  one-shot foreground card entrance (`y 30→0`, `rotate -3°`).
- All hover lifts are 4–8 px max. Buttons translate 0.5 px on hover.
- `useReducedMotion()` is honoured everywhere via early-return short
  circuits.

### 5.2 Remotion (separate workspace)

See `@C:/Users/hydra/Desktop/complybase/docs/33-remotion-motion-assets.md`
for the full Remotion plan. Summary:

- New workspace at `motion/` (sibling to `app/`).
- Single composition `TrustFolderEvidenceFlow` (5 scenes, 10 s default,
  registered four times at different durations / aspects).
- **Not** required for the Next.js build to succeed.
- Produces MP4 / GIF assets that can be embedded into the live site or
  used as standalone artefacts in sales / social.

---

## 6 · Forbidden phrases — re-audit

Grep across customer-facing copy for the DESIGN.md §12 forbidden list:

```
buy now            → 0 hits in /app/app/**
order now          → 0 hits
guaranteed compliance → 0 hits
audit-proof        → 0 hits
no lawyer needed   → 0 hits
fully compliant    → 0 hits
legal guarantee    → 0 hits
```

Disclaimer string ("Not legal advice. Not certification. Not a compliance
guarantee.") visible on every public page footer + in the homepage hero
microcopy.

---

## 7 · CTA routing matrix (locked)

| Label | Destination |
|---|---|
| Run free check | `/assessment` |
| See example folder | `/examples` |
| Request snapshot | `/request?type=snapshot` |
| Request pack (disclosure) | `/request?type=disclosure` |
| Request governance folder | `/request?type=governance` |
| Apply (premium) | `/request?type=premium` |
| Request agency pack | `/request?type=agency` |
| Contact | `/contact` |
| Read scope policy | `/safety` |
| Compare packs | `/pricing` |

`/request` accepts the legacy alias `?type=pack` and maps to `disclosure`.

---

## 8 · Verification

| Check | Result |
|---|---|
| `npx tsc --noEmit` (app/) | pass |
| `npx tsc --noEmit` (motion/) | pass |
| `npm run build` (app/) | pass — 21 routes |
| `npm install` (motion/) | pass — 182 packages |
| Playwright fold screenshots | captured at 1440×900 for all 8 public pages |
| Visual quality bar | met for first-screen impression on every page |
| Forbidden-phrase grep | clean |

Build sizes (top routes):

- `/assessment` — 10.3 kB / 146 kB first-load JS
- `/contact` — 2.33 kB / 138 kB
- `/request` — 1.19 kB / 88.6 kB
- `/pricing` — 1.06 kB / 137 kB
- `/examples`, `/safety`, `/agencies` — 185–186 B / 136 kB (server-rendered)

---

## 9 · Open items / deferred

- **Custom display font.** DESIGN.md §5 calls for a licensed display
  serif (e.g., *Tiempos Headline* / *GT Sectra*). Phase 3.8 ships with
  the system stack to avoid the AI-default Google-Font tell.
  Defer to a future phase once licensing is settled.
- **Real Remotion renders.** The compositions exist and `npm run preview`
  works, but no MP4/GIF is committed yet. Running the renders is a
  founder action gated by which assets ship first (homepage hero loop
  vs. agency outbound vs. social post). See `docs/33`.
- **`/checkout/cancel` and `/checkout/return`.** Outside the active
  customer journey during the buyer-validation phase. Preserved as-is
  with the older `bg-ink-*` styling. Documented but not refactored.
- **MarketingHome local helpers (`Section`, `Reveal`).** Still defined
  inside `MarketingHome.tsx` despite the shared primitives now offering
  the same shapes. Functional but redundant. Defer dedupe to a future
  cleanup pass.

---

## 10 · How to reproduce the visual QA

```sh
# 1. Make sure the dev server is running
cd app && npm run dev

# 2. From a separate shell, run the QA capture script
cd ../scripts && npm install   # one-time: installs playwright
node qa-screenshots.mjs        # writes .playwright-mcp/qa-*.png

# 3. Inspect the fold screenshots first; full-page later
explorer ..\.playwright-mcp
```

Override base URL:

```sh
$env:BASE_URL = 'https://staging.trustfolder.io'
node qa-screenshots.mjs
```

---

*Phase 3.8 closes Phase 3 of the website program. Phase 4 is the
buyer-validation push (see `docs/25-phase-4-buyer-validation-plan.md`).*

---

## 11 · Launch-ready v1 status (Phase 3.9 — Fast Finish Sprint)

The Fast Finish Sprint took the site from "Phase 3.8 scale-corrected"
to "ready for first outreach" with three changes layered on top of
the work above:

1. **Dark editorial palette flip.** `globals.css` tokens switched from
   off-white paper to near-black + warm off-white ink + muted mint-teal
   accent. All shared primitives (`SiteChrome`, `MarketingPrimitives`,
   `PricingPackCard`, `ContactForm`) re-toned to the new palette.
   Inverted CTA pill pattern (light pill, dark text) preserved via a
   new `--tf-on-light` token.
2. **Encoding repair.** An earlier bulk PowerShell rewrite had read
   files as Windows-1252 and re-written them as UTF-8, doubling the
   byte sequences for `·`, `—`, and similar. Reversed by reading each
   affected file as UTF-8, re-encoding the resulting string as
   Windows-1252, then decoding as UTF-8 again. Zero residual mojibake.
3. **Admin section dark-safe.** `AdminChrome`, `AdminTable`,
   `RequestRowActions`, `LoginForm`, and the protected dashboard pages
   all patched off `bg-white` / `text-white` so the founder workspace
   reads correctly in the new palette.

### What works (verified)

- `npx tsc --noEmit` — pass
- `npm run build` — pass, all 31 routes
- Playwright screenshots at 1440 / 1920 / 390 for all 8 public pages —
  premium, readable, no overflow, large hero typography, generous
  cards. Captured under `.playwright-mcp/v1-*.png`.
- Flow A (home → run free check → assessment step 1) — passes via
  `scripts/qa-flow-test.mjs`
- Flow B (`/request?type=governance` submission → success state) —
  passes; row lands in `requests` table
- Flow C (admin login → list → PATCH status → re-fetch persistence) —
  passes via `scripts/qa-admin-flow.mjs` (8/8)
- Flow D (`/pricing`, `/examples`, `/safety`, `/agencies`, `/contact`
  render with working CTA anchors) — passes (10/10)
- Forbidden-phrase audit (`buy now`, `order now`, `guaranteed
  compliance`, `audit-proof`, `no lawyer needed`, `fully compliant`,
  `legal guarantee`) — still 0 hits
- Disclaimer string visible on every public page

### What was tested

| Flow | Tool | Result |
|---|---|---|
| Public hero render at 3 viewports | `scripts/qa-scale-audit.mjs` | 24/24 |
| Home → assessment navigation | `scripts/qa-flow-test.mjs` (A1–A3) | 3/3 |
| Lead capture via `/request` | `scripts/qa-flow-test.mjs` (B1–B2) | 2/2 |
| Secondary page CTAs | `scripts/qa-flow-test.mjs` (D × 5) | 10/10 |
| Admin login → list → status update | `scripts/qa-admin-flow.mjs` | 8/8 |
| Admin screens dark-mode render | `scripts/qa-admin-screenshot.mjs` | manual review pass |

### What is deferred (out of v1 scope)

- Customer dashboard, customer login, connectors, subscriptions
- New payment provider, instant checkout
- Real Remotion MP4/GIF renders (compositions exist; running them
  is a founder action)
- Licensed display serif font
- `MarketingHome` local helpers de-duplication
- `/checkout/cancel` and `/checkout/return` deeper polish

### Next step

Phase 4 — buyer validation. Use the site for first outreach. Watch
`/admin/requests` for inbound leads; iterate copy + scope based on
the questions buyers ask in their replies. See
`docs/25-phase-4-buyer-validation-plan.md`.
