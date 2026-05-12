# 33 — Remotion Motion Assets

> **Date:** 2026-05-10 (Phase 3.8)
> **Workspace:** `@C:/Users/hydra/Desktop/complybase/motion`
> **Source of truth for editorial rules:**
> `@C:/Users/hydra/Desktop/complybase/docs/DESIGN.md` §10
> **Companion changelog:**
> `@C:/Users/hydra/Desktop/complybase/docs/32-premium-visual-rebuild.md`

This document explains why Remotion lives outside the Next.js app, what
the `motion/` workspace produces, and how to render and embed those
assets into the live site (or share them as standalone artefacts).

If you only need to render a video, jump to **§4 Render commands**.

---

## 1 · Why a separate workspace

Remotion is a **build-time** tool that produces MP4 / GIF media. It is
not the runtime of the website. Folding it into `app/package.json`
would have three problems:

1. **Build-time cost.** Remotion brings Chromium and ffmpeg as
   transitive deps. CI for the website slows down by minutes for code
   that is never executed at runtime.
2. **Version conflicts.** Remotion's React 18 expectations and Next.js
   14's expectations sometimes drift. Decoupling avoids one surprise
   per Next minor.
3. **Founder workflow.** The founder may need to render an asset on a
   laptop without the Next.js build succeeding. Decoupling lets that
   happen.

So the structure is:

```
complybase/
├── app/         # Next.js website. Builds without Remotion.
├── motion/      # Remotion compositions. Builds without Next.
├── docs/        # Shared docs.
└── scripts/     # One-off ops scripts (visual QA).
```

`app/` never imports from `motion/`. `motion/` never imports from
`app/`. The only shared substance is design tokens, duplicated by
hand: `motion/src/theme.ts` mirrors `app/app/globals.css`. If you
change one, change the other in the same commit.

---

## 2 · What's in `motion/`

```
motion/
├── package.json              # @trustfolder/motion
├── tsconfig.json             # Strict + Bundler resolution
├── remotion.config.ts        # Renderer config
├── README.md                 # User-facing operating manual
├── src/
│   ├── index.ts              # registerRoot(<RemotionRoot />)
│   ├── Root.tsx              # Composition registry
│   ├── theme.ts              # Mirrors app/app/globals.css tokens
│   └── TrustFolderEvidenceFlow/
│       └── Composition.tsx   # 5-scene master composition
└── out/                      # Renders land here. Not committed.
```

### 2.1 The composition

There is **one** underlying composition —
`TrustFolderEvidenceFlow` — registered four times at different
durations and aspect ratios:

| Composition id | Length | Format | Use |
|---|---|---|---|
| `TrustFolderEvidenceFlow` | 10 s | 1080×1080 | Master explainer |
| `TrustFolderHeroLoop` | 6 s | 1920×1080 | Optional homepage hero accent |
| `WebsiteScan` | 4 s | 1080×1080 | `/examples` + outbound |
| `AgencyHandoff` | 8 s | 1080×1080 | Agency outbound |

Re-using one source of scenes keeps the visual language consistent.
If you need a fundamentally different look (e.g., a vertical 9:16
TikTok variant), add a *new* composition file rather than
re-registering this one with new dimensions — vertical layouts need
different copy ratios.

### 2.2 The five scenes

The composition unfolds in five staged sequences:

| Scene | Range (s) | Beat |
|---|---|---|
| `SceneUrl` | 0.0 – 1.6 | Website URL types in (`acme.ai`) |
| `SceneScan` | 1.6 – 3.6 | Four scan-signal cards spring in |
| `SceneReview` | 3.6 – 5.4 | A 5-step confirmation rail fills |
| `SceneFolder` | 5.4 – 8.0 | Six evidence-folder layers slide in |
| `SceneHandoff` | 8.0 – 10.0 | Dark "buyer handoff" cover sheet appears |

Each scene fades in with `opacity 0→1, y 28→0` over 14–18 frames and
then runs its own beat-specific animation. There are no spinning
elements, no counter-up animations, no gradient sweeps. The
disclaimer string ("Not legal advice · Not certification · Not a
compliance guarantee") is visible at the bottom edge for the entire
runtime.

---

## 3 · Editorial rules (re-stated from DESIGN.md §10)

1. **Match the live site's design tokens.** `src/theme.ts` mirrors
   `app/app/globals.css`. Update both in the same change.
2. **One curve.** All animations use either `[0.22, 1, 0.36, 1]` cubic
   easing (via `interpolate` with `extrapolateRight: 'clamp'`) or a
   Remotion `spring()` with `damping: 16-20`, `stiffness: 110-140`.
   No bounces, no overshoots.
3. **No counter animations.** Numbers display at their final value.
4. **No spinning.** The live site spins a small loader briefly. Video
   exports do not spin — they reveal.
5. **No gradient sweeps.** One soft accent halo per composition is
   the maximum atmospheric effect.
6. **Silent by default.** Voice-over and SFX are layered in post.
   `Composition.tsx` exports never include audio tracks.
7. **Disclaimer always visible.** Every composition shows the
   disclaimer at the bottom edge throughout.

---

## 4 · Render commands

All commands run from `motion/`.

```sh
# Interactive editor (Remotion Studio)
npm run preview
# → opens http://localhost:3000 with the composition list

# Master 10 s MP4 (sales decks, internal walkthroughs)
npm run render:evidence
# → motion/out/evidence-flow.mp4

# Same composition, GIF (X / LinkedIn / Slack)
npm run render:evidence-gif
# → motion/out/evidence-flow.gif

# 6 s 1920×1080 silent loop (homepage hero accent)
npm run render:hero-loop
# → motion/out/hero-loop.mp4

# 4 s slice (website-scan beat only)
npm run render:scan
# → motion/out/website-scan.mp4

# 8 s agency-focused variant
npm run render:agency-handoff
# → motion/out/agency-handoff.mp4
```

Remotion downloads its Chromium runtime on **first** render. Expect a
1–2 minute first run; subsequent renders complete in seconds.

`motion/out/` is **not** committed. Treat exports as build artefacts
that live in cloud storage / sales decks / social posts.

---

## 5 · How to embed a render into the live site

### 5.1 Hero loop (optional)

If we ever want a low-volume hero accent loop on `/`, embed the
exported MP4 with a static poster image. Add this to
`MarketingHome.tsx` only when the asset is ready:

```tsx
// In the hero column, replace <EvidenceScene /> with:
<video
  className="tf-loop w-full rounded-[28px] border border-[var(--tf-border-strong)] shadow-[0_30px_120px_rgba(7,17,31,0.18)]"
  src="/motion/hero-loop.mp4"
  poster="/motion/hero-loop.jpg"
  autoPlay
  muted
  loop
  playsInline
  aria-hidden="true"
/>
```

Required CSS guard for prefers-reduced-motion (already implied by
DESIGN.md §10.4):

```css
@media (prefers-reduced-motion: reduce) {
  video.tf-loop { display: none; }
}
```

When the loop is hidden by reduced-motion, the page must still ship
the static `EvidenceScene` mock-up underneath — never replace the
visual entirely with an MP4.

### 5.2 Examples page (`/examples`)

For the `WebsiteScan` 4 s clip, embed it inline above the first
example card:

```tsx
<video
  className="my-10 w-full max-w-3xl rounded-[24px] border border-[var(--tf-border)]"
  src="/motion/website-scan.mp4"
  poster="/motion/website-scan.jpg"
  autoPlay
  muted
  loop
  playsInline
  aria-label="Animated illustration of TrustFolder scanning a website"
/>
```

### 5.3 Static-asset hosting

Place the rendered MP4s and corresponding poster JPEGs in
`app/public/motion/` so Next.js serves them at `/motion/*.mp4`. The
`motion/out/` directory is the *source*; copying into `app/public/`
is a manual step gated by the founder so we don't ship un-reviewed
animation. A simple way to script this when needed:

```sh
# from repo root
mkdir -p app/public/motion
cp motion/out/*.mp4 app/public/motion/
cp motion/out/*.jpg app/public/motion/   # poster frames
```

Generate poster frames from the master MP4 with ffmpeg if needed:

```sh
ffmpeg -i motion/out/hero-loop.mp4 -vf "select=eq(n\,0)" -vframes 1 motion/out/hero-loop.jpg
```

---

## 6 · CI

Phase 3.8 deliberately does **not** add Remotion to CI. The Next.js
build at `app/npm run build` does not depend on any rendered MP4 or
the `motion/` workspace at all. If `motion/` is broken, the website
still ships.

If we later automate render uploads (e.g., publishing a fresh hero
loop weekly), do it as a *separate* workflow that:

1. Installs `motion/` deps.
2. Runs `npm run render:hero-loop`.
3. Uploads the resulting MP4 to a CDN.
4. Posts back a URL the website reads via env at deploy time.

Even then, the Next.js build remains independent.

---

## 7 · Things this is NOT

- Not the runtime of the live website.
- Not bundled into Next.js.
- Not a video-editing tool. Voice-over and SFX go through a real
  audio editor.
- Not the place to define design tokens. Tokens live in
  `app/app/globals.css` and are mirrored manually into
  `motion/src/theme.ts`.
- Not the place to put screenshots, marketing images, or other
  static assets. Those go into `app/public/`.

---

## 8 · Open follow-ups

- Render and host the `TrustFolderHeroLoop` MP4. Pending founder
  go-ahead — the static `EvidenceScene` is currently doing the job
  on the live hero.
- Add a vertical `9:16` composition for short-form social once we
  have copy that works at 1080×1920.
- Decide whether to commit `motion/package-lock.json`. Currently it
  is generated locally on first install but not committed; commit
  it once the deps stabilise.
- Add `npm run typecheck` to a pre-commit hook in `motion/` to catch
  composition regressions before they reach a render.

---

*Authored at Phase 3.8. Updates to this document should follow any
addition or removal of compositions in `motion/src/Root.tsx`.*
