import { interpolate, useCurrentFrame } from 'remotion';
import { DocumentSheet, SheetLines } from '../components/DocumentSheet';
import { SceneLabel } from '../components/SceneLabel';
import { remotionColors } from '../constants';

export function DocumentRevealScene({ start }: { start: number }) {
  const frame = useCurrentFrame();
  const local = frame - start;
  const scale = interpolate(local, [0, 34], [0.92, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div style={{ position: 'relative', height: '100%' }}>
      <div style={{ position: 'absolute', left: 64, top: 42 }}>
        <SceneLabel label="Document preview" value="Prepared for review" />
      </div>
      <div
        style={{
          position: 'absolute',
          left: 134,
          top: 126,
          width: 720,
          transform: `scale(${scale})`,
          transformOrigin: 'center',
        }}
      >
        <DocumentSheet title="AI Disclosure Draft - ACME.ai">
          <div style={{ display: 'grid', gap: 22 }}>
            <p
              style={{
                margin: 0,
                color: remotionColors.muted,
                fontSize: 26,
                lineHeight: 1.45,
                fontFamily: 'ui-sans-serif, system-ui, sans-serif',
              }}
            >
              ACME.ai uses AI to draft support responses. Users should be told when AI assists a reply and when a human reviewer is involved.
            </p>
            <SheetLines count={4} />
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 18,
                borderTop: `1px solid ${remotionColors.border}`,
                paddingTop: 18,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                fontSize: 15,
                color: remotionColors.subtle,
              }}
            >
              <span>Source: acme.ai/product - Scanned 12 May 2026</span>
              <span style={{ color: remotionColors.amber }}>Confidence: Review</span>
            </div>
          </div>
        </DocumentSheet>
      </div>
      <div
        style={{
          position: 'absolute',
          right: 104,
          top: 260,
          width: 240,
          padding: 22,
          borderRadius: 16,
          border: `1px solid ${remotionColors.border}`,
          background: remotionColors.greenLight,
          color: remotionColors.greenDark,
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          fontSize: 18,
          lineHeight: 1.45,
        }}
      >
        Source-traced draft, ready for buyer or counsel review.
      </div>
    </div>
  );
}
