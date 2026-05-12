import { interpolate, useCurrentFrame } from 'remotion';
import { ScoreBars } from '../components/ScoreBars';
import { SceneLabel } from '../components/SceneLabel';
import { remotionColors } from '../constants';

export function ReadinessScoreScene({ start }: { start: number }) {
  const frame = useCurrentFrame();
  const local = frame - start;
  const score = Math.round(
    interpolate(local, [8, 54], [0, 74], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
  );

  return (
    <div style={{ position: 'relative', height: '100%' }}>
      <div style={{ position: 'absolute', left: 64, top: 42 }}>
        <SceneLabel label="Readiness result" value="Buyer handoff" />
      </div>
      <div
        style={{
          position: 'absolute',
          left: 140,
          top: 130,
          width: 520,
          borderRadius: 24,
          border: `1px solid ${remotionColors.borderMid}`,
          background: remotionColors.white,
          padding: 40,
          boxShadow: '0 30px 90px rgba(14,15,13,0.12)',
        }}
      >
        <p
          style={{
            margin: 0,
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            fontSize: 18,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: remotionColors.subtle,
          }}
        >
          AI documentation readiness
        </p>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 18 }}>
          <span
            style={{
              color: remotionColors.black,
              fontFamily: 'Georgia, serif',
              fontSize: 96,
              fontWeight: 700,
              lineHeight: 1,
            }}
          >
            {score}
          </span>
          <span style={{ color: remotionColors.muted, fontSize: 30 }}>/ 100</span>
        </div>
        <div style={{ marginTop: 34 }}>
          <ScoreBars startFrame={start + 24} />
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          right: 110,
          top: 178,
          width: 330,
          display: 'grid',
          gap: 18,
        }}
      >
        {['Review-ready folder prepared', 'Buyer/legal handoff included', 'Start your free check'].map((label, index) => {
          const opacity = interpolate(local, [44 + index * 18, 64 + index * 18], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          return (
            <div
              key={label}
              style={{
                opacity,
                borderRadius: 16,
                padding: '22px 24px',
                background: index === 2 ? remotionColors.green : remotionColors.greenLight,
                color: index === 2 ? remotionColors.white : remotionColors.greenDark,
                fontFamily: 'ui-sans-serif, system-ui, sans-serif',
                fontSize: 24,
                fontWeight: 700,
                boxShadow: '0 18px 50px rgba(14,15,13,0.1)',
              }}
            >
              {label}
            </div>
          );
        })}
      </div>
    </div>
  );
}

