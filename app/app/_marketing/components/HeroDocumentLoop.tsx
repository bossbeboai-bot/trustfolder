'use client';

import { Player } from '@remotion/player';
import { useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { DocumentPreview } from '../remotion';
import {
  DOCUMENT_PREVIEW_DURATION,
  DOCUMENT_PREVIEW_FPS,
  DOCUMENT_PREVIEW_HEIGHT,
  DOCUMENT_PREVIEW_WIDTH,
} from '../remotion';
import { ScanPipeline } from './ScanPipeline';

function useSmallViewport() {
  const [isSmall, setIsSmall] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(max-width: 560px)');
    const update = () => setIsSmall(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return isSmall;
}

export function HeroDocumentLoop() {
  const prefersReducedMotion = useReducedMotion();
  const isSmall = useSmallViewport();
  const [mounted, setMounted] = useState(false);
  const [hasPlayerError, setHasPlayerError] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || prefersReducedMotion || isSmall || hasPlayerError) {
    return <ScanPipeline />;
  }

  return (
    <div className="overflow-hidden rounded-[2rem] border border-[var(--m-border)] bg-[var(--m-cream)] shadow-[0_30px_80px_rgba(28,49,38,0.16)]">
      <Player
        component={DocumentPreview}
        durationInFrames={DOCUMENT_PREVIEW_DURATION}
        compositionWidth={DOCUMENT_PREVIEW_WIDTH}
        compositionHeight={DOCUMENT_PREVIEW_HEIGHT}
        fps={DOCUMENT_PREVIEW_FPS}
        autoPlay
        loop
        controls={false}
        acknowledgeRemotionLicense
        clickToPlay={false}
        allowFullscreen={false}
        style={{ width: '100%', aspectRatio: `${DOCUMENT_PREVIEW_WIDTH} / ${DOCUMENT_PREVIEW_HEIGHT}` }}
        errorFallback={() => {
          setHasPlayerError(true);
          return <ScanPipeline />;
        }}
      />
    </div>
  );
}
