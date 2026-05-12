# TrustFolder DESIGN.md

## Purpose

TrustFolder should feel like a premium AI infrastructure startup for international B2B AI SaaS companies, AI agencies, and software teams preparing for buyer, internal, and legal review. The product is not positioned as a compliance template shop. It is positioned as a calm evidence-folder system that turns scattered AI product claims into structured, lawyer-review-ready materials.

Quality benchmark: premium AI-company craft, cinematic product narrative, editorial typography, smooth motion, enterprise credibility, and polished contact/CTA flow. Do not copy any reference company's layout, assets, copy, imagery, interaction patterns, or brand.

## Brand personality

- Calm, precise, enterprise, intelligent, internationally credible.
- Founder-friendly but not casual.
- B2B SaaS-native, legal-review-aware, buyer-ready.
- Clear about scope and limits.
- Trust comes from restraint, structure, and specificity rather than hype.

## Color tokens

Use a soft white/document-first palette with deep navy text and restrained teal/blue accents.

```css
:root {
  --tf-bg: #f7f5ef;
  --tf-bg-soft: #fbfaf7;
  --tf-surface: #ffffff;
  --tf-document: #fffefa;
  --tf-ink: #07111f;
  --tf-ink-soft: #102033;
  --tf-slate: #5f6d7a;
  --tf-slate-soft: #8793a0;
  --tf-border: #e3e0d8;
  --tf-border-strong: #cfc8bb;
  --tf-accent: #0f7c8a;
  --tf-accent-blue: #285fd6;
  --tf-accent-soft: #e8f3f4;
  --tf-warning-soft: #fff6df;
}
```

Rules:

- Backgrounds should be off-white, warm white, or document white.
- Text should be deep navy/near-black, not pure black except tiny UI chrome.
- Accent should be subtle teal/blue. Avoid saturated gradients.
- Borders should be thin and quiet.
- Shadows should be soft, large, and low-opacity.

## Typography

- Hero headlines: large, editorial, tightly tracked, measured line length.
- Body copy: clear SaaS prose with strong hierarchy and generous line-height.
- Labels: small uppercase or sentence-case technical labels, high letter spacing only when useful.
- Use existing system stack for now to avoid external font risk; compensate with scale, spacing, and hierarchy.

Recommended scale:

- Hero: `clamp(3.5rem, 8vw, 7.5rem)`
- Section heading: `clamp(2.25rem, 5vw, 4.5rem)`
- Card title: `1.05rem` to `1.25rem`
- Body: `1rem` to `1.125rem`
- Legal note: `0.75rem` to `0.875rem`

## Spacing scale

Use spacious section rhythm.

- Page gutters: `1.5rem` mobile, `2rem` tablet, `3rem` desktop.
- Max content width: `72rem` to `80rem`.
- Section vertical rhythm: `5rem` mobile, `7rem` to `10rem` desktop.
- Card padding: `1.25rem` mobile, `1.75rem` to `2rem` desktop.
- Hero min-height: no forced full-screen if it harms content; use large top/bottom breathing room.

## Card style

Cards should feel like evidence/documents, not generic SaaS blocks.

- Background: white or document white.
- Border: 1px solid soft border.
- Radius: 20px to 28px for major cards; 14px to 18px for small cards.
- Shadow: soft ambient, no harsh drop shadows.
- Interior: clear labels, document-line motifs, small status chips only if meaningful.
- Avoid left-border accent cards and icon-per-card clutter.

## Button style

Primary button:

- Deep navy background.
- White text.
- Rounded pill or refined radius.
- Medium weight.
- Subtle hover lift/soft shadow.
- Copy: `Run free eligibility check`.

Secondary button:

- Transparent or white background.
- Thin border.
- Deep navy text.
- Copy: `Request paid pack`, `Join waitlist`, `Apply for premium handoff`.

Forbidden button copy:

- `Buy now`
- `Guaranteed compliance`
- `Audit-proof`
- `No lawyer needed`
- `Fully compliant`

## Icon style

- Use minimal line icons only when they clarify information.
- Avoid decorative icon grids.
- Prefer small document/UI motifs, progress rails, check markers, and thin dividers.
- No emoji icons.
- No hand-drawn SVG people/objects.

## Layout rhythm

- Editorial hero: large type + product narrative visual.
- Alternating dense narrative sections and quiet whitespace.
- Use two-column sections on desktop, stacked on mobile.
- Product mockups should be composed from original motion cards and document layers.
- Avoid dashboard-heavy UI unless it directly explains the evidence folder.

## Motion rules

Use Framer Motion / Motion for React for:

- Smooth hero entrance.
- Calm progress rail animation in hero.
- Section reveal on scroll.
- Subtle document-card stack/parallax.
- Soft pricing-card hover.

Motion constraints:

- Respect `prefers-reduced-motion`.
- Keep transforms subtle: 4-24px movement, opacity, scale from 0.98 to 1.
- Avoid heavy scroll hijacking.
- Avoid constant looping except one calm hero progress indicator.
- Motion should clarify flow: website URL → AI scan → review summary → evidence folder.

## Accessibility rules

- Semantic headings in order.
- Buttons/links must have visible focus states.
- Color contrast must be readable on off-white backgrounds.
- Interactive targets at least 44px high where possible.
- Respect reduced motion.
- Do not rely on animation to understand the page.
- Legal/scope caveats must be visible, not hidden in tiny footer-only text.

## Copy tone

Use:

- Buyer-ready
- Lawyer-review-ready
- AI governance evidence folder
- Request paid pack
- Run free eligibility check
- Apply for premium handoff
- Not legal advice
- Not certification
- Not a compliance guarantee

Tone:

- Precise, calm, direct.
- Avoid panic-driven compliance fear.
- Avoid overpromising automation.
- Explain outputs as drafts and handoff materials.
- Speak to US/EU/UK/global B2B AI companies and AI agencies.

## Anti-patterns

Do not use:

- Exact layout, copy, assets, imagery, interactions, or brand from any reference site.
- Buy-now checkout language on marketing pages.
- Guarantee language: guaranteed compliance, audit-proof, no lawyer needed, fully compliant.
- Customer login, dashboard, auth, connectors, subscription portal, Remotion, payment provider rebuild.
- Purple AI gradients, emoji icons, fake stats, decorative icon grids, people SVGs.
- Heavy animations that hurt performance.
- Dense compliance jargon as the first impression.

## Component examples

### Hero CTA row

```tsx
<div className="flex flex-col gap-3 sm:flex-row">
  <Link className="tf-button-primary" href="/assessment">
    Run free eligibility check
  </Link>
  <Link className="tf-button-secondary" href="/request">
    Request paid pack
  </Link>
</div>
```

### Scope note

```tsx
<p className="text-sm text-slate-600">
  AI-generated drafts for review. Not legal advice. Not certification. Not a compliance guarantee.
</p>
```

### Evidence card

```tsx
<div className="rounded-[24px] border border-[#e3e0d8] bg-white p-6 shadow-[0_24px_80px_rgba(7,17,31,0.08)]">
  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Evidence folder</p>
  <h3 className="mt-3 text-xl font-semibold text-[#07111f]">AI system summary</h3>
  <p className="mt-3 text-sm leading-6 text-slate-600">
    A concise product-level description prepared for buyer and legal review.
  </p>
</div>
```

## Design QA checklist

- Does the page feel like premium AI infrastructure rather than a template store?
- Does every CTA avoid checkout pressure?
- Are legal limits visible and plainly stated?
- Are motion effects meaningful and reduced-motion safe?
- Does `/assessment` remain the free-check entry point?
- Does `/request` capture or stage lead intent without implying instant checkout?
