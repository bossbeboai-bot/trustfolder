import { interpolate, useCurrentFrame } from 'remotion';
import { remotionColors } from '../constants';

const bars = [
  ['Disclosure clarity', 0.78],
  ['Evidence strength', 0.68],
  ['Buyer-readiness', 0.76],
] as const;

export function ScoreBars({ startFrame }: { startFrame: number }) {
  const frame = useCurrentFrame();

  return (
    <div style={{ display: 'grid', gap: 22 }}>
      {bars.map(([label, value], index) => {
        const width = interpolate(frame, [startFrame + index * 8, startFrame + 34 + index * 8], [0, value], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        return (
          <div key={label}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 8,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                fontSize: 16,
                color: remotionColors.muted,
              }}
            >
              <span>{label}</span>
              <span>{Math.round(value * 100)}%</span>
            </div>
            <div style={{ height: 12, borderRadius: 999, background: 'rgba(14,15,13,0.1)' }}>
              <div
                style={{
                  height: 12,
                  width: `${width * 100}%`,
                  borderRadius: 999,
                  background: remotionColors.green,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

