# Phase 3.7 — Website Premium Design Pass

This phase elevates the public TrustFolder site and product flow from a
"functional form app" into a premium AI infrastructure / governance startup
surface. It is **UI / UX / copy only**. No engine, schema, payment, admin data
model, or package-generation logic was changed.

> Status: shipped. Typecheck and `next build` pass. 21 routes built.

---

## 1. Goals

- Calm, precise, intelligent, high-trust visual feel — appropriate for an
  enterprise audience evaluating an AI governance product.
- Consistent design system across every public page (homepage, assessment,
  request, pricing, examples, safety, agencies, contact).
- Transform the assessment from a long form into a guided four-step flow with
  a "magic moment" review screen.
- Honest, non-marketing copy. No "Buy now", no "guaranteed compliance", no
  "audit-proof", no "no lawyer needed".
- Respect `prefers-reduced-motion` everywhere; animations are restrained and
  serve the content, never decorate it.

---

## 2. Forbidden actions during this phase (all upheld)

- No customer login, no customer dashboard.
- No new payment provider; no instant checkout.
- No connectors, no subscriptions, no Remotion, no outreach automation.
- No changes to: core engine logic, Supabase schema, PayPal endpoints, admin
  data model, package generation logic.

PayPal endpoints (`/api/paypal/*`, `/checkout/return`, `/checkout/cancel`)
remain wired and unchanged. They are simply not invoked from the assessment
during the buyer-validation phase — `/assessment` funnels every paid tier to
`/request?type=...` for manual founder review (see docs/25 / Phase 3.6).

---

## 3. Design system (foundation)

### Tokens — `app/app/globals.css`

The full `--tf-*` palette and type scale live in `:root`:

| Token | Role |
|---|---|
| `--tf-bg` | Page background (off-white) |
| `--tf-bg-soft` | Subtle section / card background |
| `--tf-ink` | Primary text + buttons |
| `--tf-ink-soft` | Hover variant of ink |
| `--tf-slate`, `--tf-slate-soft` | Body and meta text |
| `--tf-accent`, `--tf-accent-soft` | Teal accent + tint |
| `--tf-border`, `--tf-border-strong` | Card and divider lines |
| `--tf-document` | Cream tone used for "evidence-folder" cards |
| `--tf-warning-soft` | Soft amber for review/heads-up cards |

### Shared chrome — `app/app/components/SiteChrome.tsx`

Single component used by every public page. Provides:

- Sticky header with the TrustFolder wordmark and the canonical nav order
  (`/pricing`, `/examples`, `/safety`, `/agencies`, `/contact`).
- Footer with the legal scope disclaimer:
  *"Not legal advice. Not certification. Not a compliance guarantee."*

### Shared primitives — `app/app/components/MarketingPrimitives.tsx`

- `Reveal` — inline `motion.div` with `prefers-reduced-motion` fallback.
- `Section` — wraps each homepage section with consistent vertical rhythm.
- `PageHeader` — eyebrow + balanced display heading + lede paragraph.
- `PrimaryLink` / `SecondaryLink` — pill buttons in ink and outline.
- `Card` — rounded-3xl bordered surface with subtle shadow.
- `ScopeNote` — fine-print disclaimer block.
- `FinalCta` — closing CTA used at the bottom of public pages.

### Motion rules

- Reveal: opacity 0→1 plus `y: 12 → 0` over ~0.4s with the cubic ease
  `[0.22, 1, 0.36, 1]`.
- Step transitions inside `/assessment` use `AnimatePresence mode="wait"` with
  the same ease curve and respect `useReducedMotion()`.
- No bouncy springs, no auto-playing video, no glitter effects.

---

## 4. Page-by-page summary

### `/` — homepage (`app/app/components/MarketingHome.tsx`)

- Premium hero: eyebrow ("AI governance for AI-native startups"), display
  headline ("Buyer-ready AI governance, in 1 business day."), supporting
  paragraph, two CTAs (`Free fit check` → `/assessment`, `See packages` →
  `/pricing`), trust strip underneath.
- HeroVisual + DocumentStack — animated evidence-folder visual using
  `--tf-document` cards staggering in.
- Nine sections: problem, value, what you get, who it's for, how it works,
  example pack contents, safety, scope note, final CTA.
- All CTAs land on `/assessment`, `/pricing`, or `/request?type=...`.

### `/assessment` — guided assessment

Replaced the previous one-shot form with a 4-step guided flow.

Files:

- `app/app/assessment/AssessmentPage.tsx` — new client component, all UI logic
- `app/app/assessment/page.tsx` — slim re-export

Layout: `SiteChrome` + page hero + step progress + two-column grid on desktop
(content card on the left, side info card on the right). Mobile stacks.

Step | Visible name | Backend call | Notes
---|---|---|---
1 | Website | `POST /api/scan` | URL + email; large rounded inputs
1 (loading) | Scanning | — | Four sequential stages (Scanning website / Extracting AI use signals / Preparing confirmation questions / Checking scope fit). Spinner on active, check on done.
2 | Confirm | `POST /api/confirm` | Questions grouped into themed cards: Company basics, AI use, Market and geography, User exposure, Personal data. Pills replace radio buttons.
3 | Review | — | "Magic moment": confidence band, "Your details" card, "Likely disclosure needs" card, optional "Heads-up" card if `band === 'REVIEW' / 'SOFT_OUT'`, "Recommended for you" pack card. Three actions: See packages, Edit answers, Scan looks wrong → fill in manually.
4 | Request | — | Three pack cards (Snapshot $99, Disclosure $499, Governance $999) with "Recommended for you" badge on the API-returned tier. CTA → `/request?type=...`.
Out-of-scope | Expert review | — | Calm copy. Link to `/contact` (request expert review) and `/safety` (read scope policy). No scary legal language.

Side info card body changes per step:

- Step 1: "What we'll do next" — quick description + ETA.
- Step 2: "Confirm a few details" — accuracy reminder.
- Step 3: "Magic moment" — explanation of what they're looking at.
- Step 4: "Request your pack" — no charge, 1-business-day reply.

Trust notes (always visible on the side card): no payment required, ~2
minutes, not legal advice, high-risk areas routed to expert review.

### `/request` (`app/app/components/RequestLeadPage.tsx`)

- Per-type heading, subhead, and "what to expect" block keyed off
  `?type=snapshot|disclosure|governance|premium|pack` (with `pack` aliased
  to `disclosure` for backwards compatibility with older links).
- Two-column layout on desktop: form on the left, expectations card on the
  right. Stacks on mobile.
- Optional `role` field added.
- Form data preserved on error.
- Submits to `POST /api/request` (unchanged).

### `/pricing`

- Six pack cards rendered as a uniform grid with consistent height.
- Each card: name, price, tagline, four-bullet contents, request CTA →
  `/request?type=...`, delivery expectation footer.
- Scope note above the footer: turnaround, founder review, scope policy
  link.

### `/examples`

- Three fictional illustrative samples, each clearly labeled
  *"Illustrative example. Not a real customer."*
- Per sample: scan summary, disclosure needs, folder contents, recommended
  next-step roadmap.

### `/safety`

- "What TrustFolder does" / "What it does not do" / "Verticals out of scope"
  blocks.
- Routes to `/contact` for expert review.
- Reuses `ScopeNote` and the standard disclaimer string.

### `/agencies`

- Problem → value → example pack contents → client delivery benefits →
  CTA (`Request agency pack` → `/request?type=premium`).
- Same SiteChrome shell, same primitives.

### `/contact` (`app/app/contact/ContactForm.tsx`)

- Topic selector, email, message.
- Local validation, preserves form data on error.
- Posts to `POST /api/request` with `source_page=/contact` and the topic
  field stored on the request row.

### Admin (`app/app/admin/(protected)/`)

Admin surface remained on the same neutral layout introduced in Phase 3.6.
This phase only ensured visual consistency — no functional change to admin
pages or admin API routes.

---

## 5. CTA routing table

Surface | Button label | Destination
---|---|---
Homepage hero — primary | "Start free fit check" | `/assessment`
Homepage hero — secondary | "See packages" | `/pricing`
Homepage final CTA | "Start free fit check" | `/assessment`
Pricing — Snapshot | "Request snapshot" | `/request?type=snapshot`
Pricing — Disclosure | "Request disclosure pack" | `/request?type=disclosure`
Pricing — Governance | "Request governance folder" | `/request?type=governance`
Pricing — Agency | "Request agency pack" | `/request?type=premium`
Examples / Safety / Agencies — primary | varies | `/assessment` or `/request?type=...`
Assessment Step 4 — primary | "Continue to request" | `/request?type=snapshot|disclosure|governance`
Assessment out-of-scope — primary | "Request expert review" | `/contact`
Assessment out-of-scope — secondary | "Read our scope policy" | `/safety`
Contact form — submit | "Send" | `POST /api/request` (then thank-you state)

No customer-facing button reads "Buy", "Pay", "Checkout", "Sign up", or
"Login". The only login surface is `/admin/login` (single-seat founder
auth, Phase 3.6).

---

## 6. Copy guidelines (applied)

- Plain English; no jargon ("provider/deployer", "Article 50" only inside
  pack contents and pricing copy).
- Disclaimer string used verbatim wherever scope is mentioned:
  *"Not legal advice. Not certification. Not a compliance guarantee."*
- Forbidden phrases that were grepped and confirmed absent from
  customer-facing copy: "Buy now", "audit-proof", "no lawyer needed",
  "fully compliant", "guaranteed".
- The remaining hits for "guarantee" / "certification" all sit inside the
  disclaimer text or in the "what TrustFolder does not do" list — i.e. the
  intentional disclaiming use.

---

## 7. Mobile

All pages were authored mobile-first using Tailwind responsive utilities:

- Single-column stack at base width.
- `lg:` breakpoint (1024px) introduces the two-column layouts on
  `/assessment`, `/request`, and homepage section pairs.
- The assessment side info card stacks below the content card on mobile
  using `lg:sticky lg:top-24` only at lg+.
- Buttons collapse to full-width via `sm:flex-row` blocks.

---

## 8. Verification

| Check | Result |
|---|---|
| `npx tsc --noEmit` (app) | pass |
| `npm run build` (app) | pass; 21 routes |
| Forbidden-phrase scan | only disclaimer hits |
| CTA routing matrix | every CTA lands on a real route |
| Engine | untouched |
| Schema / Supabase migrations | untouched |
| Admin data model and routes | untouched |

Build sizes (first-load JS) — for reference:

- `/`            1.19 kB / 88.6 kB
- `/assessment`  10.7 kB / 143 kB
- `/pricing`     2.0  kB / 134 kB
- `/agencies`    1.99 kB / 134 kB
- `/examples`    1.99 kB / 134 kB
- `/safety`      1.99 kB / 134 kB
- `/contact`     3.7  kB / 136 kB
- `/request`     1.19 kB / 88.6 kB

---

## 9. Known limitations

- The duplicated `Reveal` / `Section` / `PrimaryLink` / `SecondaryLink`
  helpers inside `MarketingHome.tsx` are functional but redundant with the
  shared `MarketingPrimitives.tsx` exports. A later cleanup can collapse
  them. Keeping them here in this phase to avoid touching homepage layout
  semantics during the polish pass.
- The page hero copy on `/assessment` ("Free AI governance fit check.")
  is similar to the eyebrow above it. Intentional — the eyebrow says
  "Free assessment" while the H1 names the offer. If the eyebrow ever
  changes, prefer differentiation rather than duplication.
- `/checkout/cancel` and `/checkout/return` still use the older Tailwind
  ink-* classes. They are not in the active customer journey during the
  buyer-validation phase. Polishing them is out-of-scope for Phase 3.7.

---

## 10. Acceptance criteria status

- [x] Calm, precise, premium AI-infra-startup feel across all public pages.
- [x] Consistent header / footer / nav / disclaimer via `SiteChrome`.
- [x] Restrained motion that respects `prefers-reduced-motion`.
- [x] `/assessment` rebuilt as a guided 4-step flow with magic-moment review.
- [x] Per-type request page with form-data preservation and `?type=`
      normalization (incl. legacy `pack` alias).
- [x] Six-pack pricing page with consistent cards and per-tier request CTAs.
- [x] Examples, safety, agencies, contact pages on the shared shell.
- [x] No "Buy now" / "guaranteed" / "audit-proof" / "no lawyer needed" in
      customer-facing copy.
- [x] All CTAs route to real, working destinations.
- [x] Mobile responsive across all public pages.
- [x] Engine, schema, payment logic, admin data model untouched.
- [x] `tsc` and `next build` both pass.
- [x] `progress.txt` updated; `docs/31-website-premium-polish.md` written.

---

*Authored at the close of Phase 3.7 — TrustFolder website premium design pass.*
