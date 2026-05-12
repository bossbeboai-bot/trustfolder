/**
 * Shared Framer Motion variants for the marketing site.
 *
 * Motion rules (docs/14-DESIGN + windsurf brief):
 *   - 0.4–0.6s entrance, editorial easing (0.22, 1, 0.36, 1)
 *   - Subtle fade-up (y: 16 → 0)
 *   - Staggered children by 0.08s
 *   - Reduced-motion users get instant reveal
 */

import type { Variants } from 'framer-motion';

export const EDITORIAL_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EDITORIAL_EASE },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.6, ease: EDITORIAL_EASE },
  },
};

export const stagger = (staggerChildren = 0.08, delayChildren = 0): Variants => ({
  hidden: {},
  visible: {
    transition: { staggerChildren, delayChildren },
  },
});

export const fadeUpChild: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: EDITORIAL_EASE },
  },
};
