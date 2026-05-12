import { interpolate, useCurrentFrame } from 'remotion';
import { DocumentSheet } from '../components/DocumentSheet';
import { FolderMark } from '../components/FolderMark';
import { SceneLabel } from '../components/SceneLabel';
import { docLabels, remotionColors } from '../constants';

export function FolderBuildScene({ start }: { start: number }) {
  const frame = useCurrentFrame();
  const local = frame - start;
  const count = Math.min(8, Math.max(2, Math.floor(local / 11)));

  return (
    <div style={{ position: 'relative', height: '100%' }}>
      <div style={{ position: 'absolute', left: 64, top: 42 }}>
        <SceneLabel label="Evidence folder" value={`${count}/8 ready`} />
      </div>
      <div style={{ position: 'absolute', left: 82, top: 190 }}>
        <FolderMark size={170} />
      </div>
      <div style={{ position: 'absolute', left: 300, top: 118, width: 790, height: 520 }}>
        {docLabels.map((label, index) => {
          const opacity = interpolate(local, [index * 9, index * 9 + 18], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          const y = interpolate(local, [index * 9, index * 9 + 18], [40, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          return (
            <div
              key={label}
              style={{
                position: 'absolute',
                left: (index % 4) * 190,
                top: Math.floor(index / 4) * 235,
                width: 170,
                opacity,
                transform: `translateY(${y}px)`,
              }}
            >
              <DocumentSheet title={label} compact />
            </div>
          );
        })}
      </div>
      <p
        style={{
          position: 'absolute',
          left: 84,
          top: 390,
          width: 170,
          color: remotionColors.muted,
          fontSize: 22,
          lineHeight: 1.35,
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        }}
      >
        Structured documents, assembled around the product evidence.
      </p>
    </div>
  );
}

