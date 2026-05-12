import { interpolate, useCurrentFrame } from 'remotion';
import { BrowserFrame } from '../components/BrowserFrame';
import { SceneLabel } from '../components/SceneLabel';
import { remotionColors } from '../constants';

const signals = [
  'AI feature detected',
  'User-facing disclosure opportunity',
  'EU transparency signals found',
  'Buyer review gaps identified',
];

export function ScanScene({ start }: { start: number }) {
  const frame = useCurrentFrame();
  const local = frame - start;
  const scanY = interpolate(local, [0, 74], [28, 378], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div style={{ position: 'relative', height: '100%' }}>
      <div style={{ position: 'absolute', left: 64, top: 42 }}>
        <SceneLabel label="Website scan" value="acme.ai" />
      </div>
      <div style={{ position: 'absolute', left: 64, top: 116, width: 610 }}>
        <BrowserFrame url="acme.ai/product">
          <div style={{ position: 'relative', height: 420, padding: 34, background: remotionColors.cream }}>
            <div style={{ height: 42, width: 260, borderRadius: 10, background: remotionColors.black, opacity: 0.14 }} />
            <div style={{ marginTop: 26, display: 'grid', gap: 12 }}>
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  style={{
                    height: i === 0 ? 76 : 42,
                    width: `${92 - i * 9}%`,
                    borderRadius: 12,
                    background: i === 1 ? 'rgba(26,107,74,0.14)' : 'rgba(14,15,13,0.08)',
                  }}
                />
              ))}
            </div>
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: scanY,
                height: 3,
                background: `linear-gradient(90deg, transparent, ${remotionColors.green}, transparent)`,
                boxShadow: `0 0 28px ${remotionColors.green}`,
              }}
            />
          </div>
        </BrowserFrame>
      </div>
      <div style={{ position: 'absolute', right: 76, top: 150, width: 360, display: 'grid', gap: 14 }}>
        {signals.map((signal, index) => {
          const opacity = interpolate(local, [18 + index * 14, 34 + index * 14], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          const x = interpolate(local, [18 + index * 14, 34 + index * 14], [26, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          return (
            <div
              key={signal}
              style={{
                opacity,
                transform: `translateX(${x}px)`,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '16px 18px',
                border: `1px solid ${remotionColors.border}`,
                borderRadius: 12,
                background: remotionColors.white,
                color: remotionColors.black,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                fontSize: 16,
                boxShadow: '0 12px 36px rgba(14,15,13,0.08)',
              }}
            >
              <span style={{ width: 9, height: 9, borderRadius: 999, background: remotionColors.green }} />
              {signal}
            </div>
          );
        })}
      </div>
    </div>
  );
}

