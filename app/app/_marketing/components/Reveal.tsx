'use client';

/**
 * Reveal — lightweight wrapper that fades child content up on scroll-in.
 * Respects prefers-reduced-motion automatically via Framer Motion.
 */

import { motion, useReducedMotion, type Variants } from 'framer-motion';
import type { ReactNode } from 'react';
import { fadeUp } from '../lib/motion';

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: 'div' | 'section' | 'article' | 'span' | 'li' | 'ul' | 'ol' | 'header' | 'footer';
  variants?: Variants;
}

export function Reveal({
  children,
  className,
  delay = 0,
  as = 'div',
  variants = fadeUp,
}: RevealProps) {
  const reduce = useReducedMotion();
  const MotionTag = motion[as] as typeof motion.div;

  if (reduce) {
    const Tag = as as 'div';
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '0px 0px -80px 0px' }}
      variants={variants}
      transition={{ delay }}
    >
      {children}
    </MotionTag>
  );
}
