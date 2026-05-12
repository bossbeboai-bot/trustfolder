# @trustfolder/motion

Standalone Remotion workspace for high-end TrustFolder motion assets.
**This package is intentionally separate from the Next.js app** — the
website at `app/` never imports Remotion code, and the Next.js build
never depends on a Remotion render.

> See `docs/DESIGN.md` §10 for the editorial rules every Remotion
> composition must follow.

---

## What's in here

| Composition id | Length | Format | Purpose |
|---|---|---|---|
| `TrustFolderEvidenceFlow` | 10 s | 1080×1080 MP4 | Master explainer. Used in sales decks, social posts, internal walkthroughs. |
| `TrustFolderHeroLoop` | 6 s | 1920×1080 silent loop | Optional homepage hero accent video. |
| `WebsiteScan` | 4 s | 1080×1080 | Subset of the master flow, for `/examples` and outbound. |
| `AgencyHandoff` | 8 s | 1080×1080 | Agency-focused variant for the agency outbound asset. |

All four resolve to the same underlying scenes (`src/TrustFolderEvidenceFlow/Composition.tsx`)
and only differ in duration / aspect ratio. This keeps the visual
language consistent without maintaining four parallel implementations.

---

## Install

```sh
cd motion
npm install
```

Remotion downloads its Chromium runtime on first render, not on install.
The first `npm run render:*` may take 1–2 minutes. Subsequent renders
finish in seconds.

## Develop interactively

```sh
npm run preview
```

Opens Remotion Studio in the browser at `http://localhost:3000`.
Pick a composition from the sidebar, scrub the timeline, and live-edit
TSX files in `src/`.

## Render

```sh
# 10 s master MP4 (default)
npm run render:evidence

# Same composition, but as a GIF for social posts
npm run render:evidence-gif

# 6 s 1920×1080 silent loop for the homepage hero
npm run render:hero-loop

# 4 s slice covering only the website-scan beat
npm run render:scan

# 8 s agency-focused variant
npm run render:agency-handoff
```

All outputs land in `motion/out/`. Commit nothing in `motion/out/` —
exports live in cloud storage / sales decks, not git.

---

## Editorial rules (read before editing)

1. **Match the live site's design tokens.** The `src/theme.ts` file
   mirrors `app/app/globals.css`. If you add a new colour to the
   site, add it here in the same change.
2. **One curve.** Every animation uses `[0.22, 1, 0.36, 1]` cubic
   easing or a Remotion `spring()`. No bounces. No overshoots.
3. **No counter animations.** Numbers are the numbers. They do not
   count up.
4. **No spinning.** Loaders spin on the live site (briefly). Video
   exports do not spin — they reveal.
5. **No gradient sweeps.** Backgrounds are static `tokens.bg` with
   one soft accent halo.
6. **Silent by default.** The master cut never has audio. Voice-over
   and SFX are layered in the post-production tool of your choice.
7. **Disclaimer always visible.** Every composition shows the
   disclaimer string at the bottom edge.

---

## Why is this a separate workspace?

The Next.js app at `app/` builds, typechecks, and ships independently
of Remotion. Reasons:

- Remotion brings a large dependency tree (Chromium, ffmpeg,
  webpack-isomorphic). Bundling it into the Next.js build adds
  minutes to CI and risks transitive version conflicts.
- Remotion compositions are **build artefacts**, not runtime code.
  They produce MP4/GIF files that get embedded as `<video>` or `<img>`
  on the live site (or shared elsewhere). The site never executes
  Remotion code in the browser.
- Keeping motion separate means the founder can render videos from
  a laptop without needing the Next.js build to succeed first.

If you ever need Remotion to share TypeScript types with the app
(e.g. a shared content schema), wire up a third package — do not
fold motion back into `app/`.
