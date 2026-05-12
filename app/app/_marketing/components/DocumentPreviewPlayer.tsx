'use client';

import { Player } from '@remotion/player';
import { DocumentPreview } from '../remotion';
import {
  DOCUMENT_PREVIEW_DURATION,
  DOCUMENT_PREVIEW_FPS,
  DOCUMENT_PREVIEW_HEIGHT,
  DOCUMENT_PREVIEW_WIDTH,
} from '../remotion';

export function DocumentPreviewPlayer() {
  return (
    <div className="rounded-[1.75rem] border border-[var(--m-border)] bg-[var(--m-white)] p-3 shadow-[0_30px_90px_rgba(28,49,38,0.14)] sm:p-4">
      <div className="overflow-hidden rounded-[1.25rem] border border-[var(--m-border)] bg-[var(--m-cream)]">
        <Player
          component={DocumentPreview}
          durationInFrames={DOCUMENT_PREVIEW_DURATION}
          compositionWidth={DOCUMENT_PREVIEW_WIDTH}
          compositionHeight={DOCUMENT_PREVIEW_HEIGHT}
          fps={DOCUMENT_PREVIEW_FPS}
          controls
          acknowledgeRemotionLicense
          clickToPlay
          loop
          allowFullscreen
          style={{
            width: '100%',
            aspectRatio: `${DOCUMENT_PREVIEW_WIDTH} / ${DOCUMENT_PREVIEW_HEIGHT}`,
          }}
        />
      </div>
    </div>
  );
}
