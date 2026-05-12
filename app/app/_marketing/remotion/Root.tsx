import { Composition } from 'remotion';
import {
  DOCUMENT_PREVIEW_DURATION,
  DOCUMENT_PREVIEW_FPS,
  DOCUMENT_PREVIEW_HEIGHT,
  DOCUMENT_PREVIEW_WIDTH,
} from './constants';
import { DocumentPreview } from './compositions/DocumentPreview';

export function RemotionRoot() {
  return (
    <Composition
      id="DocumentPreview"
      component={DocumentPreview}
      durationInFrames={DOCUMENT_PREVIEW_DURATION}
      fps={DOCUMENT_PREVIEW_FPS}
      width={DOCUMENT_PREVIEW_WIDTH}
      height={DOCUMENT_PREVIEW_HEIGHT}
    />
  );
}

