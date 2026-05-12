import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { remotionColors } from '../constants';
import { DocumentRevealScene } from './DocumentRevealScene';
import { FolderBuildScene } from './FolderBuildScene';
import { ReadinessScoreScene } from './ReadinessScoreScene';
import { ScanScene } from './ScanScene';

const scenes = [
  { start: 0, end: 82, component: ScanScene },
  { start: 72, end: 158, component: FolderBuildScene },
  { start: 148, end: 228, component: DocumentRevealScene },
  { start: 216, end: 300, component: ReadinessScoreScene },
];

export function DocumentPreview() {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        background: remotionColors.cream,
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 80% 20%, rgba(26,107,74,0.1), transparent 28%), linear-gradient(180deg, rgba(250,250,248,0.9), rgba(245,243,238,1))',
        }}
      />
      {scenes.map(({ start, end, component: Scene }) => {
        const fadeIn = interpolate(frame, [start, start + 14], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        const fadeOut = interpolate(frame, [end - 14, end], [1, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        const opacity = Math.min(fadeIn, fadeOut);
        return (
          <div key={start} style={{ position: 'absolute', inset: 0, opacity }}>
            <Scene start={start} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
}

