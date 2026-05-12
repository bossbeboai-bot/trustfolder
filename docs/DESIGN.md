# DESIGN.md — TrustFolder Design System

> **Single source of truth for everything visual on the TrustFolder public site.**
> If a spec lives in this file, it overrides any older guidance in `docs/14-DESIGN.md`,
> `docs/15-phase-3-site-plan.md`, `docs/27-website-revamp-spec.md`, or
> `docs/31-website-premium-polish.md`. Treat those older docs as historical
> context for *why* we got here. Treat **this** doc as the rulebook for what
> we ship now and next.

> **Audience:** future engineering / design agents, the founder, contractors,
> and anyone editing the public surface (homepage, assessment, request,
> pricing, examples, safety, agencies, contact). Admin pages are intentionally
> outside this rulebook.

> **Status:** active. Phase 3.8.

---

## 0 · How to use this document

1. **Before any visual work**, read sections 1–3 (positioning, principles,
   chosen direction). They tell you *what we are*.
2. **Before writing CSS**, read sections 4–8 (tokens, type, spacing, layout,
   components). They tell you *what we look like*.
3. **Before adding motion**, read sections 9 and 10 (Framer Motion rules,
   Remotion rules). They tell you *what we move like*.
4. **Before writing copy**, read sections 11 and 12 (copy voice, forbidden
   phrases). They tell you *what we sound like*.
5. **Before declaring done**, read sections 13 and 14 (accessibility, page
   quality bar). They tell you *whether the page actually shipped*.

If you change something fundamental (token, type scale, motion ease curve),
**update this file in the same commit**. The doc is the source of truth, not
the code.

---

## 1 · Positioning

**TrustFolder is an AI governance evidence-folder platform** for B2B AI
companies and AI agencies selling to serious international buyers.

**Core message.** TrustFolder turns an AI product website into a
buyer-ready evidence folder with disclosure, governance, source-note, and
legal-review handoff drafts.

**Audience.** Founders, GTM leads, and AI agency operators who:

- ship an AI feature inside a SaaS or agent product;
- sell to enterprise / global buyers;
- get blocked by procurement / legal / risk questions;
- do not have an in-house compliance function;
- can not wait six weeks for a lawyer to handcraft a folder.

**Quality benchmark.** Use [micro1.ai](https://www.micro1.ai/) as a quality
benchmark only. Do not copy assets, copy, animations, layout, or brand. We
borrow only the *feeling*: cinematic hero, editorial typography, smooth
motion, clean product narrative, refined enterprise trust.

---

## 2 · Brand personality

**TrustFolder is calm, precise, intelligent, and quietly premium.**

Adjectives we *are*:

- buyer-ready
- editorial
- document-first
- considered
- cinematic in pacing, not in volume
- enterprise-grade without being corporate
- international
- review-ready

Adjectives we are *not*:

- bombastic, gradient-heavy, “AI for AI’s sake”
- legal-template-shop, fine-print-heavy
- generic SaaS form-app, dashboard-first
- crypto / web3 / cyberpunk
- fake-3D / fake-testimonial / fake-stats

Tone of voice → see §11.

---

## 3 · Design exploration — 3 directions and the chosen one

This section satisfies the Huashu Design exploration phase. We considered
three differentiated visual philosophies, judged each against TrustFolder’s
positioning, and chose a combination of the strongest two.

### Direction A · Premium AI Infrastructure

> Inspired by Stripe, Linear, Anthropic, OpenAI for Business.

- **Hero concept.** Dark or off-white canvas, restrained editorial
  headline, single-product visual on the right that hints at the engine
  underneath. No marketing fireworks; the product *is* the visual.
- **Visual motif.** Hairline borders, generous whitespace, monochrome
  document mockups with a single accent colour, restrained dataviz.
- **Mood.** Sophisticated, technical, confident.
- **Sample section.** A "platform pillars" trio of cards with monospaced
  labels, hairline dividers, no icons.
- **Motion.** Hero entrance fades + 12 px lift; everything else respects
  the eye.
- **Why it fits.** Reads as *infrastructure*, not as marketing. Buyers and
  GCs treat us as a peer of their internal tools.
- **Why it is not enough alone.** Could feel cold. Could read as "another
  AI dev-tools landing page" with no point of view.

### Direction B · Editorial Evidence System

> Inspired by Pentagram, *The Browser Company*, Field.io editorial work,
> Werner Aisslinger documentation aesthetics.

- **Hero concept.** Off-white / ivory canvas, oversized editorial
  headline (clamp(56px → 132px)), document/folder mockup as the cinematic
  protagonist. The page reads like a long-form essay with figures.
- **Visual motif.** Document stack visualisations, hand-set numerals,
  margin notes, footnote-style microcopy, paper-warm tones for evidence
  surfaces.
- **Mood.** Editorial, considered, calm. Treats every page as a publication.
- **Sample section.** "Inside the evidence folder" with a tilted document
  stack, captions in monospace, one accent line per card.
- **Motion.** Document cards stagger in, parallax shift on scroll,
  text-reveal on hero with masked clip-path.
- **Why it fits.** TrustFolder’s product *is* a document folder. Making
  the documents the hero gives the brand a unique visual signature.
- **Why it is not enough alone.** If we only do editorial, we risk reading
  as "design studio" or "law firm". We need the AI infrastructure layer to
  signal we are a product.

### Direction C · Enterprise Buyer-Readiness Platform

> Inspired by Palantir, ServiceNow, Workday, Bridgewater public-facing
> material.

- **Hero concept.** Heavy whitespace, very small headline, dense
  process-rail / dataviz visual with status indicators. Feels like a
  Bloomberg terminal sketch.
- **Visual motif.** Charts, dashboards, multi-stage flow diagrams,
  monospace data, dark glass panels.
- **Mood.** Authoritative, institutional, slightly intimidating.
- **Sample section.** A buyer-readiness scorecard with progress bars and
  category readouts.
- **Motion.** Numerical counters animating, bar charts filling, very
  little personality.
- **Why it might fit.** Speaks the buyer’s language at procurement.
- **Why it does not fit (today).** TrustFolder is a request-led, founder-
  reviewed product, not a SaaS dashboard. Direction C oversells the
  automation and undersells the human review. It also reads as
  intimidating to the founders we are actually trying to convert.

### Chosen direction · A + B (Premium AI Infrastructure × Editorial Evidence System)

We combine the **calm, technical confidence** of Direction A with the
**document-first editorial signature** of Direction B. This gives
TrustFolder:

- the *infrastructure* read that earns enterprise trust
- the *editorial* read that sets us apart from "another AI SaaS landing page"
- a unique visual signature (the document/folder as protagonist) that no
  competitor in the AI-governance space currently owns

Direction C influences only the **/safety** page (where institutional
authority is helpful) and never the homepage hero.

---

## 4 · Color system

All values live as CSS custom properties on `:root` in
`@C:/Users/hydra/Desktop/complybase/app/app/globals.css`. Tailwind reads
them via the bracket-syntax (`bg-[var(--tf-ink)]`).

### Tokens

| Token | Hex | Role |
|---|---|---|
| `--tf-bg` | `#f7f5ef` | Page background. Off-white / paper. Default for every public page. |
| `--tf-bg-soft` | `#fbfaf7` | Section variant background. Sits *above* `--tf-bg`. Use for trust strip, subtle alternation. |
| `--tf-surface` | `#ffffff` | Pure white card surface. Default card colour. |
| `--tf-document` | `#fffefa` | Warmer, paper-like surface for evidence-folder cards. **Distinct from `--tf-surface`.** Pull this out for anything that should read as "a document". |
| `--tf-paper` | `#f3eee2` | Deeper paper / kraft tone. Reserved for the document-stack hero motif and the "inside the folder" section. |
| `--tf-ink` | `#07111f` | Primary text and primary-button surface. Near-black with a navy bias. |
| `--tf-ink-soft` | `#102033` | Hover variant of `--tf-ink`. Used for body emphasis. |
| `--tf-slate` | `#5f6d7a` | Body text. The default *non-headline* colour. |
| `--tf-slate-soft` | `#8793a0` | Meta text, captions, legal disclaimer text. |
| `--tf-border` | `#e3e0d8` | Default card and divider line. |
| `--tf-border-strong` | `#cfc8bb` | Header borders, dark-section borders, footer divider. |
| `--tf-accent` | `#0f7c8a` | Primary accent. Restrained teal. Used sparingly: eyebrows, hover accents, key-stat numerals, progress bars. |
| `--tf-accent-deep` | `#0a5a64` | Deeper teal. Use only for dark-on-light hover or focus emphasis. |
| `--tf-accent-soft` | `#e8f3f4` | Tinted teal background. Pills, gentle highlights. |
| `--tf-accent-blue` | `#285fd6` | Blue accent, *only* for buyer/legal handoff motifs. **Do not** use as a generic CTA colour. |
| `--tf-warning-soft` | `#fff6df` | Soft amber for "review needed" / heads-up cards. **Never** use red. We do not have an error state on the marketing site. |
| `--tf-success-soft` | `#e7f4eb` | Soft green for "fit confirmed" badges. Used in the assessment review screen. |

### Usage rules

- **Backgrounds.** Default page is `--tf-bg`. Sections that need to feel
  *quietly different* (trust strip, FAQ, footer) move up to `--tf-bg-soft`
  or down to a dark `--tf-ink` block. We never use neutral grey.
- **Text.** Headlines on `--tf-ink`. Body on `--tf-slate`. Captions on
  `--tf-slate-soft`. **Three colours, no more.**
- **Accents.** One accent per surface. Teal is the global accent. Blue is
  reserved for the buyer-handoff motif. Amber is reserved for review-needed
  cards. Green is reserved for fit-confirmed badges.
- **Forbidden palettes.** Purple gradients. Neon pink. RGB rainbow.
  `bg-gradient-to-r` from any two saturated tones. We never reach for
  these.

---

## 5 · Typography system

### Families

We use **system stacks** for v1 — they look polished on Mac, Windows, and
mobile without a font-loading flash. We will move to a custom display
serif (e.g. *Tiempos Headline*, *GT Sectra*, or *Söhne*) once brand
licensing is in place. **Do not** ship a free Google Font as the display
family. It will read as "AI default" and undo the rest of the design.

```css
/* in globals.css */
font-family: ui-sans-serif, system-ui, -apple-system, "Inter", "Segoe UI",
  Roboto, "Helvetica Neue", Arial, sans-serif;
```

For monospace eyebrows / numerals:

```css
font-family: ui-monospace, "JetBrains Mono", "SF Mono", Menlo, Consolas,
  monospace;
```

### Scale

The scale is editorial, not SaaS-default. Display sizes are larger than a
typical landing page; body sizes are larger than a typical app.

| Token | Size | Line-height | Tracking | Where |
|---|---|---|---|---|
| Display XL | `clamp(3.4rem, 8vw, 7.4rem)` | `0.92` | `-0.075em` | Homepage hero H1. **Only here.** |
| Display L | `clamp(2.6rem, 5.6vw, 4.6rem)` | `1.02` | `-0.06em` | Section H2 across the site. |
| Display M | `clamp(1.9rem, 3.4vw, 2.8rem)` | `1.04` | `-0.05em` | Card-level H3 / page sub-titles. |
| Headline | `1.5rem` | `1.2` | `-0.04em` | Pack card titles, document titles. |
| Body L | `1.125rem` | `1.65` | `-0.005em` | Hero lede, section lede. |
| Body | `0.9375rem` | `1.65` | normal | Default paragraph copy. |
| Caption | `0.8125rem` | `1.6` | normal | Card meta, side-info card body. |
| Eyebrow | `0.75rem` | `1.5` | `0.22em` | All-caps section eyebrow. Always teal. Always monospace OR sans-uppercase. |
| Mono | `0.75rem` | `1.5` | `0.18em` | Step numerals, document layer labels, status read-outs. |

### Composition rules

- **One Display XL per page**, always the H1. Anything else compromises
  the cinematic feel.
- **Headlines are balanced.** Use Tailwind `text-balance` and
  `text-pretty` to eliminate ragged endings.
- **Lede paragraphs cap at 60-72 characters per line** (`max-w-3xl` /
  `max-w-2xl`).
- **Body copy never exceeds 75 characters per line.**
- **Eyebrows are always all-caps**, monospace or sans, with `0.22em`
  tracking. Always teal (`--tf-accent`). They read as *figure labels in
  a publication*, not as marketing chips.

---

## 6 · Spacing rhythm

We use a **4-point grid** with explicit major beats:

| Beat | Tailwind | px | Where |
|---|---|---|---|
| `xs` | `gap-2` | 8 | Inline icon gaps, pill spacing |
| `sm` | `gap-3` | 12 | List-item gaps |
| `md` | `gap-5` | 20 | Card grids |
| `lg` | `gap-8` | 32 | Section column gaps |
| `xl` | `gap-12` | 48 | Major intra-section beats |

**Section vertical rhythm.** All sections use the same outer padding:

```tsx
className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-10 lg:py-28"
```

**Hero padding.** Heroes sit *above* the rhythm:

```tsx
className="mx-auto max-w-7xl px-6 pb-24 pt-20 sm:px-8 lg:px-10 lg:pb-32 lg:pt-28"
```

**Whitespace is design.** When in doubt, double the padding. Density goes
*inside* cards, not in the page chrome.

---

## 7 · Layout rules

- **Container.** `max-w-7xl` (1280 px) for marketing copy.
  `max-w-6xl` (1152 px) for inside-card grids when 7xl feels too sparse.
- **Hero.** Two-column on `lg` (`grid-cols-[1.05fr_0.95fr]` typical),
  single column below. Visual side never has more visual weight than the
  text side; both read as protagonists.
- **Section grid.** Three- or four-column card grids on `lg`, two-column
  on `md`, single on mobile.
- **Sticky side card.** Used on `/assessment` Step 2/3 and `/request`.
  `lg:sticky lg:top-28`.
- **Bleed sections.** Dark or accented sections (agencies, final CTA) sit
  inside an `Inset` rounded `36px` panel with shadow, not full-bleed
  backgrounds. This keeps the "publication" feel.

---

## 8 · Components

### 8.1 Cards

Four card variants. Pick one consciously per surface.

| Variant | Background | Border | Use for |
|---|---|---|---|
| `Surface` | `--tf-surface` (white) | `--tf-border` | Default content cards. |
| `Document` | `--tf-document` (warm cream) | `--tf-border` | Anything that should read as *a document*: pack contents preview, evidence folder mock, examples. |
| `Dark` | `--tf-ink` | `border-white/10` | Featured pack, agencies hero block, final CTA option. |
| `Glass` | `bg-white/70 backdrop-blur` | `--tf-border-strong` | Sticky side info card, in-flow micro-cards over hero. |

**Shape.**
- Default radius: `28px` (`rounded-[28px]`).
- "Document" cards: `24px`.
- "Pill" buttons: `9999px`.
- Avoid `8px` and `12px` radii — they read as SaaS-app, not editorial.

**Shadow.**
- Default: `shadow-[0_24px_80px_rgba(7,17,31,0.06)]`.
- Featured: `shadow-[0_30px_120px_rgba(7,17,31,0.18)]`.
- Glass: `shadow-[0_18px_60px_rgba(7,17,31,0.08)]`.
- **Never** Tailwind defaults like `shadow-md` / `shadow-lg`. They read
  as 2018 Bootstrap.

### 8.2 Buttons / CTAs

Two primary controls. **Pill shape, 12 px height** (`h-12`).

```tsx
// Primary (high-intent, e.g. Run free check)
<Link className="inline-flex h-12 items-center justify-center rounded-full
  bg-[var(--tf-ink)] px-6 text-sm font-medium text-white
  shadow-[0_16px_50px_rgba(7,17,31,0.18)]
  transition hover:-translate-y-0.5 hover:bg-[var(--tf-ink-soft)]" />

// Secondary (parallel intent, e.g. See example folder)
<Link className="inline-flex h-12 items-center justify-center rounded-full
  border border-[var(--tf-border-strong)] bg-white/70 px-6
  text-sm font-medium text-[var(--tf-ink)]
  transition hover:-translate-y-0.5 hover:bg-[var(--tf-accent-soft)]" />
```

**Tertiary** (inside cards, near captions): underlined link, no pill. Use
`underline decoration-[var(--tf-border-strong)] underline-offset-2`.

**CTA pairing rules.**

- **Primary / secondary on the hero.** Always two CTAs. Primary first,
  secondary second.
- **Primary only on cards.** Pack cards, examples cards, agency block:
  one CTA each.
- **Never four buttons in a row.** Maximum two CTAs visible at once on
  any surface.

### 8.3 Forms

- **Field height.** `h-12` to match buttons.
- **Field background.** `bg-white` on default surfaces, `bg-[var(--tf-bg-soft)]`
  on document surfaces.
- **Field border.** `border border-[var(--tf-border-strong)]`.
- **Field radius.** `rounded-2xl` (16 px). Pills are reserved for buttons.
- **Label position.** *Above* the field, with a hint underneath in
  `text-xs text-[var(--tf-slate-soft)]`.
- **Inline help / placeholder.** Placeholder is illustrative only; never
  the only label. Hints sit in `text-xs leading-6 text-[var(--tf-slate-soft)]`.
- **Validation.** Inline, calm. `bg-[var(--tf-warning-soft)]` for
  warnings. We do not have an error red on the marketing site; mistakes
  surface as gentle warnings.
- **Long forms** (assessment Step 2, request page): split into themed
  cards (Company / AI use / Market / Users / Personal data). Maximum 5
  fields per card.

### 8.4 Document / folder visual language

This is **the** signature. Use it on the hero, on the `/examples` page,
on the `/agencies` page, and on the assessment review screen.

Patterns:

- **Document stack.** Three-to-five cards stacked with small
  rotational offsets (`-5deg`, `-2deg`, `0deg`, `+2deg`, `+5deg`). The
  top card is the *active* one (full opacity, no rotation). The cards
  beneath read as a paper trail.
- **Folder index.** Numbered list inside a `Document` card with monospace
  numerals (`01`, `02`, `03`...). One row per top-level folder item.
- **Label tag.** Top-right of every document card: monospace eyebrow
  (e.g. `DRAFT`, `READY FOR REVIEW`, `LAYER 3 / 5`).
- **Paper line.** Inside a document card, three to four `h-2` rounded
  bars representing copy. Widths: `4/5`, `full`, `3/5` for natural
  rhythm.
- **Source note.** A small foot-note style block under a document card,
  monospace, prefixed `↳ source ·`. Used to suggest provenance.

### 8.5 Eyebrows and section headers

Every section *that needs context* uses this trio: eyebrow → headline →
optional lede.

```tsx
<p className="text-sm uppercase tracking-[0.22em] text-[var(--tf-accent)]">
  {eyebrow}
</p>
<h2 className="mt-5 text-balance text-4xl font-semibold leading-[1.02]
  tracking-[-0.06em] sm:text-6xl">
  {title}
</h2>
{lede && (
  <p className="mt-7 max-w-3xl text-pretty text-lg leading-8
    text-[var(--tf-slate)]">{lede}</p>
)}
```

### 8.6 Trust strip

Single horizontal band, `bg-[var(--tf-bg-soft)]`, `border-y` in
`--tf-border`. Two columns: positioning sentence on the left, scope
disclaimer on the right. **No logos.** We will not fake logos until we
have real customer permission.

### 8.7 Process rail

Four-step horizontal rail (homepage "How it works") or four-step vertical
progress (`/assessment`).

- Each step is a `Document` card with a monospace number, a title, a
  body, and a hairline progress bar at the bottom.
- The progress bar is `h-1`, `--tf-border` background, `--tf-accent`
  foreground. On hover it advances (`group-hover:w-full`).

### 8.8 Side info card

Used in `/assessment` Step 1–4 and `/request`. Sticky on `lg`. Carries:

- a single eyebrow (e.g. `WHAT WE'LL DO NEXT`)
- a one-paragraph body
- 3–4 trust-note rows (`✓ no payment required`, `⏱ takes 2 minutes`, etc.)
- one calm tertiary link (e.g. `Read scope policy`)

Uses the `Glass` card variant.

### 8.9 Confidence badge

Used on `/assessment` Step 3 and `/safety`.

- **GREEN** — fit likely. `bg-[var(--tf-success-soft)]`,
  `text-[#0f6b3a]`, label `Likely fit`.
- **AMBER** — review needed. `bg-[var(--tf-warning-soft)]`,
  `text-[#7a4a00]`, label `Some review needed`.
- **NEUTRAL** — out of scope. `bg-white`, `border-[var(--tf-border-strong)]`,
  `text-[var(--tf-slate)]`, label `Expert review required`.

Format: small pill, eyebrow-style label, optional one-line description
underneath.

### 8.10 Final CTA block

Centered card inside `mx-auto max-w-7xl`, `rounded-[40px]`, white
surface, `shadow-[0_30px_120px_rgba(7,17,31,0.1)]`. Display L headline,
two CTAs, padding `p-8 sm:p-14 lg:p-20`.

---

## 9 · Motion rules — Framer Motion

We use `framer-motion` (already installed at `@^11.18.2`) for **every
live website interaction**. Motion is **subtle, consequential, and
reduced-motion aware**.

### 9.1 Curves and durations

| Pattern | Curve | Duration |
|---|---|---|
| Hero entrance | `[0.22, 1, 0.36, 1]` (smooth-out cubic) | `0.8s` |
| Section reveal | `[0.22, 1, 0.36, 1]` | `0.6–0.7s` |
| Card hover | default ease | `0.2s` |
| Step transition | `[0.22, 1, 0.36, 1]` | `0.45s` |
| Document card stagger | `[0.22, 1, 0.36, 1]`, `0.1s` step delay | `0.6s` per |

### 9.2 Patterns

- **Hero entrance.** `opacity 0→1`, `y: 28→0`, no scale on the text
  column. Visual side `y: 34→0, scale 0.98→1`. Stagger by `0.1s`.
- **Section reveal.** `Reveal` primitive: `opacity 0→1`, `y: 22→0`,
  `viewport={{ once: true, margin: '-80px' }}`. Triggers when the
  section enters at -80 px. Once per session.
- **Step transition.** `<AnimatePresence mode="wait">` around step
  bodies. `opacity 0→1`, `x: 12→0`. We avoid scale-in transitions on
  forms; scaling forms feels gimmicky.
- **Hover.** Cards: `whileHover={{ y: -8 }}`. Buttons:
  `hover:-translate-y-0.5`. Maximum 8 px lift. Anything more reads as
  arcade.
- **Document stack.** Each card animates `y: 28→0`, `rotate: random
  small`, `opacity 0→1`, staggered.

### 9.3 Reduced motion

**Always** call `useReducedMotion()` and short-circuit transforms:

```tsx
const reduceMotion = useReducedMotion();
<motion.div
  initial={reduceMotion ? false : { opacity: 0, y: 22 }}
  animate={reduceMotion ? {} : { opacity: 1, y: 0 }}
/>
```

If `reduceMotion === true` we render the final state directly. Never
fall back to a "less intense" animation; fall back to *no* animation.

### 9.4 What we do not animate

- Form fields. They never bounce in.
- Buttons. They translate `0.5 px` on hover, nothing else.
- Numerical counters. We do not count up. The number is the number.
- Backgrounds. No animated gradient sweeps.
- Icons. Icons do not spin, pulse, or float.
- Confetti. Ever.

---

## 10 · Motion rules — Remotion

Remotion creates **high-end animated assets** that we export as MP4 / GIF
and embed where useful (hero accent video, sales decks, social posts,
internal walkthroughs). It is **not** the runtime engine for the website.

### 10.1 Hard constraints

1. **Remotion never appears in the Next.js production bundle.** It is a
   separate workspace that compiles to standalone media files.
2. **The Next.js build never depends on a Remotion render.** If Remotion
   is broken, the website still ships.
3. **Remotion compositions live in `app/motion/`** (or `motion/` at repo
   root if a clean workspace boundary is needed). They have their own
   `package.json` and `tsconfig.json`.
4. **Render commands are documented**, not auto-run on CI.

### 10.2 Compositions (planned)

| Composition | Length | Purpose |
|---|---|---|
| `TrustFolderEvidenceFlow` | 10 s, 1080 × 1080 | Master explainer. Website URL → AI scan cards → confirmation rail → evidence folder assembling → buyer/legal handoff card. |
| `TrustFolderHeroLoop` | 6 s, 16:9 silent loop | Optional homepage hero accent. Subset of the above, top-edge only. |
| `AgencyHandoff` | 8 s | Used on `/agencies` and in agency outbound. Shows a client deliverable folder being prepared. |
| `WebsiteScan` | 4 s | Just the scan portion. Used on `/examples`. |

### 10.3 Composition design rules

- **Frame rate.** 30 fps default, 60 fps when smoothness matters
  (loop-able assets).
- **Duration.** ≤ 10 s for any embedded asset. Longer assets are sales
  artifacts, not website embeds.
- **Type.** Same families as the live site (system stack). Display
  sizes are exaggerated for video legibility (`140 px+`).
- **Motion vocabulary.** Match Framer Motion: same `[0.22, 1, 0.36, 1]`
  curve, same hierarchy of fades + 28 px translate. Remotion videos
  should look like *the same product* as the site, not a separate brand.
- **Audio.** Default silent (loops on hero do not play sound). If we
  add a narrated explainer later, render two variants (silent + voiced).

### 10.4 Embedding into Next.js

Embed exported MP4 via the native `<video>` tag with `autoPlay muted
loop playsInline poster={posterPng}`. **Always** ship a static poster
image so the page never flashes. Lazy-load using `loading="lazy"` on
the poster, and gate playback behind `prefers-reduced-motion: no-preference`
in CSS:

```css
@media (prefers-reduced-motion: reduce) {
  video.tf-loop { display: none; }
}
```

---

## 11 · Copy voice

- **Plain English.** Active voice. One idea per sentence.
- **Specific.** "Disclosure pack" beats "comprehensive solution".
- **Honest.** We say "drafts for review", not "ready for filing".
- **Calm.** No exclamation marks. No second-person hyperbole.
- **Short.** 12-18 word headlines. 60-90 word section ledes. Body
  paragraphs ≤ 4 sentences.

### Preferred phrases

- *request pack*
- *buyer-ready*
- *lawyer-review-ready*
- *evidence drafts*
- *governance evidence folder*
- *review-ready*
- *founder-reviewed*
- *not legal advice. not certification. not a compliance guarantee.*

### Disclaimer string (verbatim)

Use this exact string on the homepage hero, footer, every paid pack
page, and the safety page:

> Not legal advice. Not certification. Not a compliance guarantee.

---

## 12 · Forbidden phrases

Never use, on any customer-facing surface:

- *buy now* · *order now* · *check out*
- *guaranteed compliance* · *fully compliant* · *legal guarantee*
- *audit-proof* · *certified* (used as a claim)
- *no lawyer needed*
- *instant compliance*

If a customer-facing button says any of `Buy`, `Pay`, `Checkout`,
`Sign up`, or `Login`, **revert it**. The only login surface is
`/admin/login` for the founder.

(`Not legal advice` / `Not certification` / `Not a compliance guarantee`
are the disclaimer form and are *not* forbidden.)

---

## 13 · Accessibility

- **Contrast.** Body text ≥ 4.5:1 against its background.
  `--tf-slate` on `--tf-bg` passes. `--tf-slate-soft` is borderline; use
  it only for non-essential meta.
- **Focus rings.** Always visible. Default ring is
  `outline: 2px solid var(--tf-accent); outline-offset: 2px;`.
- **Tap targets.** Minimum 44 × 44 px on mobile. `h-12` buttons satisfy
  this.
- **Reduced motion.** Always honoured. See §9.3.
- **Headings.** One `h1` per page. Section `h2`s in order, no skipping
  levels. `h3` for cards.
- **Forms.** Every input has a visible `<label>` and a programmatic
  `htmlFor` / `id` linkage.
- **Alt text.** All non-decorative imagery has alt text. Decorative
  document mockups use `alt=""` and `aria-hidden="true"`.
- **Keyboard.** Every interactive element reachable in tab order. Step
  navigation in `/assessment` survives keyboard-only use.

---

## 14 · Page quality bar

A page is **not done** until every box is ticked. This is the only
acceptance gate that matters.

### 14.1 First-screen test (every page)

- [ ] Headline reads in <2 seconds.
- [ ] You can tell what TrustFolder *is* from the first screen alone.
- [ ] No form is the first screen.
- [ ] First screen has either a cinematic visual *or* a confident
      editorial headline (homepage, `/agencies`) — never both missing.
- [ ] Two CTAs maximum, primary first.
- [ ] Disclaimer string visible somewhere on the page.

### 14.2 Per-page bar

#### `/`

- [ ] Display XL hero headline (≥ 90 px on desktop).
- [ ] Hero visual: animated evidence-folder mockup, *not* a form.
- [ ] Trust strip directly under hero.
- [ ] Three platform pillars (Website Intelligence / Evidence Folder
      Engine / Buyer Handoff Layer).
- [ ] Problem section (5 cards).
- [ ] How-it-works rail (4 steps).
- [ ] Inside-the-folder section with document stack mockup.
- [ ] Packages preview (5 cards) with featured-card highlight.
- [ ] Agencies dark block.
- [ ] Safety section with risk areas.
- [ ] Final CTA block.

#### `/assessment`

- [ ] Hero with eyebrow, Display L headline, lede.
- [ ] 4-step progress rail visible above the fold.
- [ ] Two-column layout: content card + sticky side info card.
- [ ] Step 1: URL + email card with trust-note row, no other fields.
- [ ] Scanning state: 4 stages with spinner-on-active, check-on-done.
- [ ] Step 2: questions grouped into themed cards (Company / AI use /
      Market / Users / Personal data). Pills, not radio dots.
- [ ] Step 3: confidence badge, details card, disclosure-needs card,
      heads-up card if any flags, recommended pack card, three CTAs.
- [ ] Step 4: 3 premium pack cards with "recommended" badge on the API
      tier. CTAs route to `/request?type=…`.
- [ ] Out-of-scope state: calm, links to `/contact` + `/safety`.
- [ ] Reduced motion respected.

#### `/request`

- [ ] Hero with selected-package label and headline.
- [ ] "What happens next" timeline (3-4 steps).
- [ ] Two-column: form card + summary side card.
- [ ] Optional `role` field.
- [ ] Form data preserved on error.
- [ ] Polished success state (eyebrow + headline + body + return CTA).
- [ ] All five `?type=` keys supported with bespoke copy.

#### `/pricing`

- [ ] Hero with eyebrow + Display L + lede.
- [ ] 6 pack cards in a balanced 2-column grid (no awkward 3+3 gaps).
- [ ] Featured card visually distinct (dark surface).
- [ ] Per-card delivery line + disclaimer.
- [ ] Notes section below the grid (3 small cards).
- [ ] FAQ section with 5-6 calm Q&As.
- [ ] Final CTA block.

#### `/examples`

- [ ] Hero headline + clearly labeled "Illustrative examples. Not real
      customer packs."
- [ ] 3 example cards: B2B AI chatbot, AI automation agency, AI
      content/productivity tool.
- [ ] Each card opens a sample-pack preview (folder index + 4 sample
      snippets + recommended next step).
- [ ] Final CTA block.

#### `/safety`

- [ ] Hero with confidence-band visual (3 bands explained).
- [ ] "What we do" / "What we do not do" two-column.
- [ ] Out-of-scope category grid (8 categories).
- [ ] Expert-review CTA → `/contact`.
- [ ] Final CTA block.

#### `/agencies`

- [ ] Hero with bold headline, dedicated visual.
- [ ] Agency-delivery problem cards.
- [ ] Handoff folder workflow (process rail).
- [ ] What the agency pack includes.
- [ ] Repeat-project value section.
- [ ] CTA → `/request?type=agency`.

#### `/contact`

- [ ] Topic selector (request / question / partnership / press).
- [ ] Email + message fields.
- [ ] Side info card with response-time expectation.
- [ ] Polished success state.
- [ ] POSTs to `/api/request` with `source_page=/contact`.

### 14.3 Mobile bar (every page)

- [ ] Hero stacks cleanly; visual sits below text.
- [ ] Buttons full-width on mobile.
- [ ] Sticky side cards collapse to inline blocks.
- [ ] No horizontal scroll.
- [ ] Tap targets ≥ 44 px.
- [ ] Headlines downscale via the `clamp()` we set; no fixed `text-7xl`.

### 14.4 Screenshots checklist

Before declaring a page done, capture a Playwright full-page PNG and
judge:

- [ ] First screen feels premium (Stripe / Linear / Anthropic
      neighbourhood).
- [ ] No section reads as a form-app dashboard.
- [ ] No awkward gap between sections.
- [ ] Typography hierarchy is obvious in 2 seconds.
- [ ] Colour is restrained — at most three on the page.
- [ ] Document/folder motif is present somewhere.
- [ ] CTAs are clear and well-placed.

If any box fails, iterate before shipping.

---

## 15 · Implementation patterns

### 15.1 New page boilerplate

```tsx
// app/app/<route>/page.tsx
import { SiteChrome } from '../components/SiteChrome';
import { PageHeader, Section, FinalCta, ScopeNote } from '../components/MarketingPrimitives';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '<page-name> — TrustFolder',
  description: '<one-line page description, 140 chars>',
};

export default function Page() {
  return (
    <SiteChrome active="<lowercase-nav-key>">
      <PageHeader eyebrow="<EYEBROW>" title="<Display L headline.>" lede="<Lede paragraph.>" />
      <Section eyebrow="<…>" title="<…>">
        {/* content */}
      </Section>
      <FinalCta
        title="<…>"
        body="<…>"
        primary={{ href: '/assessment', label: 'Run free check' }}
        secondary={{ href: '/request?type=disclosure', label: 'Request paid pack' }}
      />
    </SiteChrome>
  );
}
```

### 15.2 Reveal-on-scroll wrapper

```tsx
import { Reveal } from '../components/MarketingPrimitives';
<Reveal className="grid gap-5 lg:grid-cols-3">{children}</Reveal>
```

### 15.3 Step transitions inside `/assessment`

```tsx
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

const reduceMotion = useReducedMotion();
<AnimatePresence mode="wait">
  <motion.div
    key={step}
    initial={reduceMotion ? false : { opacity: 0, x: 12 }}
    animate={reduceMotion ? {} : { opacity: 1, x: 0 }}
    exit={reduceMotion ? {} : { opacity: 0, x: -12 }}
    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
  >
    {/* step body */}
  </motion.div>
</AnimatePresence>
```

### 15.4 Reduced motion guard

```tsx
import { useReducedMotion } from 'framer-motion';
const reduceMotion = useReducedMotion();
```

Always read this *once at the top* of a component and short-circuit
animations through it.

### 15.5 New section block

```tsx
<Section id="how-it-works" eyebrow="How it works"
  title="From website scan to review-ready folder.">
  <div className="grid gap-5 lg:grid-cols-4">
    {steps.map((step) => (
      <Reveal key={step.id} className="rounded-[28px] border border-[var(--tf-border)]
        bg-[var(--tf-document)] p-7 shadow-[0_24px_80px_rgba(7,17,31,0.06)]">
        {/* step card */}
      </Reveal>
    ))}
  </div>
</Section>
```

---

## 16 · CTA routing matrix (locked)

| CTA label | Destination |
|---|---|
| Run free check | `/assessment` |
| See example folder | `/examples` |
| Request snapshot | `/request?type=snapshot` |
| Request disclosure pack | `/request?type=disclosure` |
| Request governance folder | `/request?type=governance` |
| Apply premium | `/request?type=premium` |
| Request agency pack | `/request?type=agency` |
| Contact | `/contact` |
| Read scope policy | `/safety` |
| Request expert review | `/contact` |

`/request` accepts any of the `?type=` keys above plus the legacy alias
`?type=pack` (treated as `disclosure`).

---

## 17 · Forbidden visual patterns

We do not ship:

- Purple gradients of any kind.
- Neon / cyberpunk palettes.
- Glassmorphism on every card.
- Rotating "AI brain" motifs.
- Stock compliance / handshake / lawyer imagery.
- Faux 3D objects or isometric icon sets.
- Five-emoji bullet lists.
- Animated gradient backgrounds.
- Counters that count up on scroll.
- Auto-play videos with sound.
- "We are GDPR-certified" badges (we are not).
- Carousel testimonials.
- Slack-style chat bubble screenshots.

---

## 18 · Maintenance and evolution

- This file is the source of truth. PRs that change visual behavior
  should update this file in the same change.
- When you add a new component, document it in §8.
- When you change a token, update §4 and grep the codebase to verify
  no inline hex sneaks back.
- When you change a motion curve, update §9.1.
- When you ban a phrase, update §12.
- When you ship a new page, add its quality bar to §14.2.

---

*Authored at Phase 3.8. Replaces the visual prescriptions in
`docs/14-DESIGN.md` (which remains as the original brand brief) and
`docs/27-website-revamp-spec.md` (which remains as the Phase 3.7 plan).*
