/**
 * TrustFolderEvidenceFlow — the master 10-second explainer.
 *
 * Five scenes, sized for a 1080×1080 square but auto-scales when used at
 * 1920×1080 (the hero-loop variant) thanks to a centred safe-area frame.
 *
 *  Scene 1 (0.0 - 1.6s) — Website URL enters
 *  Scene 2 (1.6 - 3.6s) — AI scan cards appear
 *  Scene 3 (3.6 - 5.4s) — Confirmation / review rail moves
 *  Scene 4 (5.4 - 8.0s) — Evidence folder assembles
 *  Scene 5 (8.0 - 10.0s) — Buyer / legal handoff card appears
 *
 * Motion vocabulary mirrors the live site: opacity 0→1, y 28→0,
 * cinematic easing `[0.22, 1, 0.36, 1]`. No spinning. No counters.
 * No sound on the master cut — voice-over and SFX are layered in post.
 */

import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { tokens, fontStack, easeOut } from '../theme';

void easeOut;

const FPS = 30;
const S = (sec: number) => Math.round(sec * FPS);

export const TrustFolderEvidenceFlow: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: tokens.bg,
        fontFamily: fontStack.sans,
        color: tokens.ink,
      }}
    >
      {/* Soft accent halo behind the entire composition */}
      <AccentHalo />

      {/* Persistent eyebrow + wordmark — present from frame 0 */}
      <PersistentChrome />

      {/* 5 staged scenes */}
      <Sequence from={0} durationInFrames={S(1.6)}>
        <SceneUrl />
      </Sequence>
      <Sequence from={S(1.6)} durationInFrames={S(2)}>
        <SceneScan />
      </Sequence>
      <Sequence from={S(3.6)} durationInFrames={S(1.8)}>
        <SceneReview />
      </Sequence>
      <Sequence from={S(5.4)} durationInFrames={S(2.6)}>
        <SceneFolder />
      </Sequence>
      <Sequence from={S(8.0)} durationInFrames={S(2.2)}>
        <SceneHandoff />
      </Sequence>
    </AbsoluteFill>
  );
};

/* -------------------------------------------------------------------------- */
/* Persistent chrome                                                          */
/* -------------------------------------------------------------------------- */

const AccentHalo: React.FC = () => {
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '8%',
          transform: 'translateX(-50%)',
          width: '85%',
          height: '50%',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${tokens.accentSoft} 0%, ${tokens.bg} 70%)`,
          filter: 'blur(80px)',
          opacity: 0.85,
        }}
      />
    </AbsoluteFill>
  );
};

const PersistentChrome: React.FC = () => {
  const { width } = useVideoConfig();
  return (
    <>
      {/* Wordmark top-left */}
      <div
        style={{
          position: 'absolute',
          top: 60,
          left: 60,
          fontSize: 28,
          fontWeight: 600,
          letterSpacing: '-0.035em',
          color: tokens.ink,
        }}
      >
        TrustFolder
      </div>
      {/* Mono caption top-right */}
      <div
        style={{
          position: 'absolute',
          top: 60,
          right: 60,
          fontFamily: fontStack.mono,
          fontSize: 18,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: tokens.slate,
        }}
      >
        Evidence flow · v1
      </div>
      {/* Disclaimer bottom-center */}
      <div
        style={{
          position: 'absolute',
          bottom: 50,
          left: 0,
          width,
          textAlign: 'center',
          fontFamily: fontStack.mono,
          fontSize: 14,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: tokens.slateSoft,
        }}
      >
        Not legal advice · Not certification · Not a compliance guarantee
      </div>
    </>
  );
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function useEntrance(localFrame: number): { opacity: number; y: number } {
  const opacity = interpolate(localFrame, [0, 14], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const y = interpolate(localFrame, [0, 18], [28, 0], {
    extrapolateRight: 'clamp',
  });
  return { opacity, y };
}

const SceneShell: React.FC<{
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}> = ({ eyebrow, title, children }) => {
  const frame = useCurrentFrame();
  const { opacity, y } = useEntrance(frame);
  const { width, height } = useVideoConfig();
  const isWide = width > height;
  return (
    <AbsoluteFill style={{ opacity, transform: `translateY(${y}px)` }}>
      <div
        style={{
          position: 'absolute',
          top: isWide ? '20%' : '22%',
          left: 60,
          right: 60,
          textAlign: 'left',
        }}
      >
        <p
          style={{
            fontFamily: fontStack.mono,
            fontSize: 16,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: tokens.accent,
            margin: 0,
          }}
        >
          {eyebrow}
        </p>
        <h2
          style={{
            marginTop: 18,
            fontSize: isWide ? 84 : 72,
            lineHeight: 1.02,
            letterSpacing: '-0.06em',
            fontWeight: 600,
            color: tokens.ink,
            maxWidth: '85%',
            margin: '18px 0 0',
          }}
        >
          {title}
        </h2>
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: '14%',
          left: 60,
          right: 60,
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
};

/* -------------------------------------------------------------------------- */
/* Scene 1 — Website URL enters                                                */
/* -------------------------------------------------------------------------- */

const SceneUrl: React.FC = () => {
  const frame = useCurrentFrame();
  const cursor = Math.floor(interpolate(frame, [0, 30], [0, 8], { extrapolateRight: 'clamp' }));
  const url = 'acme.ai'.slice(0, cursor);
  return (
    <SceneShell eyebrow="Step 01 · Website" title="Enter your AI product URL.">
      <div
        style={{
          background: tokens.surface,
          border: `1px solid ${tokens.borderStrong}`,
          borderRadius: 28,
          padding: '28px 36px',
          maxWidth: 720,
          boxShadow: '0 28px 90px rgba(7,17,31,0.12)',
          display: 'flex',
          alignItems: 'center',
          gap: 24,
        }}
      >
        <span
          style={{
            fontFamily: fontStack.mono,
            fontSize: 18,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: tokens.slateSoft,
          }}
        >
          URL
        </span>
        <span
          style={{
            fontSize: 44,
            fontWeight: 600,
            letterSpacing: '-0.045em',
            color: tokens.ink,
          }}
        >
          {url}
          <span
            style={{
              display: 'inline-block',
              width: 4,
              height: 44,
              background: tokens.accent,
              marginLeft: 6,
              transform: 'translateY(8px)',
              opacity: frame % 20 < 10 ? 1 : 0,
            }}
          />
        </span>
      </div>
    </SceneShell>
  );
};

/* -------------------------------------------------------------------------- */
/* Scene 2 — AI scan cards appear                                              */
/* -------------------------------------------------------------------------- */

const SceneScan: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cards = ['Public claims', 'AI features', 'Disclosure gaps', 'Risk flags'];
  return (
    <SceneShell eyebrow="Step 02 · AI scan" title="We extract AI signals from the website.">
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {cards.map((label, i) => {
          const local = frame - i * 4;
          const sp = spring({
            frame: local,
            fps,
            config: { damping: 18, stiffness: 140, mass: 0.9 },
          });
          return (
            <div
              key={label}
              style={{
                opacity: sp,
                transform: `translateY(${(1 - sp) * 28}px)`,
                background: tokens.document,
                border: `1px solid ${tokens.border}`,
                borderRadius: 22,
                padding: '22px 28px',
                minWidth: 230,
                boxShadow: '0 18px 60px rgba(7,17,31,0.06)',
              }}
            >
              <p
                style={{
                  fontFamily: fontStack.mono,
                  fontSize: 13,
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: tokens.slateSoft,
                  margin: 0,
                }}
              >
                {`Signal · 0${i + 1}`}
              </p>
              <p
                style={{
                  marginTop: 10,
                  fontSize: 24,
                  fontWeight: 600,
                  letterSpacing: '-0.035em',
                  color: tokens.ink,
                }}
              >
                {label}
              </p>
            </div>
          );
        })}
      </div>
    </SceneShell>
  );
};

/* -------------------------------------------------------------------------- */
/* Scene 3 — Confirmation / review rail moves                                  */
/* -------------------------------------------------------------------------- */

const SceneReview: React.FC = () => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [0, 50], [0, 1], { extrapolateRight: 'clamp' });
  const stages = ['Company', 'AI feature', 'Market', 'Users', 'Personal data'];
  return (
    <SceneShell eyebrow="Step 03 · Confirm" title="A founder confirms what matters.">
      <div
        style={{
          background: tokens.surface,
          border: `1px solid ${tokens.border}`,
          borderRadius: 28,
          padding: 32,
          maxWidth: 760,
          boxShadow: '0 24px 80px rgba(7,17,31,0.06)',
        }}
      >
        <div
          style={{
            height: 8,
            background: tokens.border,
            borderRadius: 9999,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${progress * 100}%`,
              height: '100%',
              background: tokens.accent,
              borderRadius: 9999,
            }}
          />
        </div>
        <div
          style={{
            marginTop: 22,
            display: 'flex',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          {stages.map((s, i) => {
            const reached = progress * stages.length >= i + 0.4;
            return (
              <div key={s} style={{ textAlign: 'center', flex: 1 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    margin: '0 auto',
                    borderRadius: 9999,
                    border: `1px solid ${reached ? tokens.accent : tokens.borderStrong}`,
                    background: reached ? tokens.accentSoft : tokens.surface,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: fontStack.mono,
                    fontSize: 14,
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                    color: reached ? tokens.accent : tokens.slateSoft,
                  }}
                >
                  {`0${i + 1}`}
                </div>
                <p
                  style={{
                    marginTop: 10,
                    fontSize: 16,
                    fontWeight: 500,
                    color: reached ? tokens.ink : tokens.slate,
                  }}
                >
                  {s}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </SceneShell>
  );
};

/* -------------------------------------------------------------------------- */
/* Scene 4 — Evidence folder assembles                                         */
/* -------------------------------------------------------------------------- */

const SceneFolder: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const layers = [
    '01 · AI system summary',
    '02 · Disclosure drafts',
    '03 · Placement guide',
    '04 · Governance policy',
    '05 · Evidence tracker',
    '06 · Lawyer handoff',
  ];
  return (
    <SceneShell eyebrow="Step 04 · Folder" title="The evidence folder assembles itself.">
      <div
        style={{
          background: tokens.document,
          border: `1px solid ${tokens.borderStrong}`,
          borderRadius: 28,
          padding: 32,
          maxWidth: 720,
          boxShadow: '0 30px 120px rgba(7,17,31,0.12)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p
            style={{
              fontFamily: fontStack.mono,
              fontSize: 14,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: tokens.slateSoft,
              margin: 0,
            }}
          >
            TrustFolder · Evidence pack
          </p>
          <span
            style={{
              border: `1px solid ${tokens.border}`,
              background: tokens.surface,
              borderRadius: 9999,
              padding: '6px 14px',
              fontFamily: fontStack.mono,
              fontSize: 12,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: tokens.slate,
            }}
          >
            DRAFT
          </span>
        </div>
        <div
          style={{
            marginTop: 20,
            borderTop: `1px solid ${tokens.border}`,
            borderBottom: `1px solid ${tokens.border}`,
          }}
        >
          {layers.map((label, i) => {
            const local = frame - i * 6;
            const sp = spring({
              frame: local,
              fps,
              config: { damping: 20, stiffness: 130, mass: 0.9 },
            });
            return (
              <div
                key={label}
                style={{
                  opacity: sp,
                  transform: `translateX(${(1 - sp) * -24}px)`,
                  padding: '14px 0',
                  borderBottom:
                    i < layers.length - 1 ? `1px solid ${tokens.border}` : undefined,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: 22,
                  fontWeight: 500,
                  letterSpacing: '-0.025em',
                  color: tokens.ink,
                }}
              >
                <span>{label}</span>
                <span style={{ color: tokens.slateSoft, fontSize: 22 }}>→</span>
              </div>
            );
          })}
        </div>
        <p
          style={{
            marginTop: 14,
            fontFamily: fontStack.mono,
            fontSize: 12,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: tokens.slateSoft,
          }}
        >
          ↳ source · website scan · founder confirmation
        </p>
      </div>
    </SceneShell>
  );
};

/* -------------------------------------------------------------------------- */
/* Scene 5 — Buyer / legal handoff card appears                                */
/* -------------------------------------------------------------------------- */

const SceneHandoff: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = spring({
    frame,
    fps,
    config: { damping: 16, stiffness: 110, mass: 1.1 },
  });
  return (
    <SceneShell eyebrow="Step 05 · Handoff" title="Ready for buyer or legal review.">
      <div
        style={{
          opacity: sp,
          transform: `translateY(${(1 - sp) * 36}px) rotate(-2deg)`,
          background: tokens.ink,
          color: '#fff',
          borderRadius: 28,
          padding: '28px 32px',
          maxWidth: 480,
          boxShadow: '0 30px 120px rgba(7,17,31,0.42)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <p
          style={{
            fontFamily: fontStack.mono,
            fontSize: 14,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: tokens.invertAccent,
            margin: 0,
          }}
        >
          Buyer handoff
        </p>
        <p
          style={{
            marginTop: 12,
            fontSize: 32,
            fontWeight: 600,
            lineHeight: 1.15,
            letterSpacing: '-0.035em',
          }}
        >
          Lawyer-ready cover sheet
        </p>
        <p
          style={{
            marginTop: 14,
            fontSize: 16,
            lineHeight: 1.5,
            color: 'rgba(255,255,255,0.72)',
          }}
        >
          One page summarising scope, disclosures, and the open review questions.
        </p>
        <div style={{ marginTop: 18, display: 'flex', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: 9999, background: tokens.invertAccent }} />
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: 9999,
              background: tokens.invertAccent,
              opacity: 0.5,
            }}
          />
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: 9999,
              background: tokens.invertAccent,
              opacity: 0.25,
            }}
          />
        </div>
      </div>
    </SceneShell>
  );
};
