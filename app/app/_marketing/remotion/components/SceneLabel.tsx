import { remotionColors } from '../constants';

export function SceneLabel({ label, value }: { label: string; value?: string }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 12px',
        border: `1px solid ${remotionColors.border}`,
        borderRadius: 6,
        background: remotionColors.white,
        color: remotionColors.subtle,
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        fontSize: 16,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
      }}
    >
      <span>{label}</span>
      {value ? (
        <span style={{ color: remotionColors.green, fontWeight: 700 }}>{value}</span>
      ) : null}
    </div>
  );
}

