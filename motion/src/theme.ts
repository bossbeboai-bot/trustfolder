/**
 * Design tokens shared across every Remotion composition.
 *
 * These mirror the live website tokens in `app/app/globals.css`, so that
 * exported MP4 assets and the live site read as the same product.
 *
 * If you update one side, update the other in the same change.
 */

export const tokens = {
  bg: '#f7f5ef',
  bgSoft: '#fbfaf7',
  surface: '#ffffff',
  document: '#fffefa',
  paper: '#f3eee2',
  ink: '#07111f',
  inkSoft: '#102033',
  slate: '#5f6d7a',
  slateSoft: '#8793a0',
  border: '#e3e0d8',
  borderStrong: '#cfc8bb',
  accent: '#0f7c8a',
  accentDeep: '#0a5a64',
  accentSoft: '#e8f3f4',
  successSoft: '#e7f4eb',
  warningSoft: '#fff6df',
  invertAccent: '#a9dce2',
} as const;

export const fontStack = {
  sans:
    'ui-sans-serif, system-ui, -apple-system, "Inter", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  mono:
    'ui-monospace, "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace',
} as const;

/** Shared cinematic easing curve. Matches Framer Motion's site curve. */
export const easeOut = [0.22, 1, 0.36, 1] as const;
