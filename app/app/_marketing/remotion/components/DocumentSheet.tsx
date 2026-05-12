import type { ReactNode } from 'react';
import { remotionColors } from '../constants';

export function DocumentSheet({
  title,
  children,
  compact = false,
}: {
  title: string;
  children?: ReactNode;
  compact?: boolean;
}) {
  return (
    <div
      style={{
        border: `1px solid ${remotionColors.border}`,
        borderRadius: 14,
        background: remotionColors.white,
        padding: compact ? 18 : 30,
        boxShadow: compact ? '0 10px 30px rgba(14,15,13,0.08)' : '0 24px 70px rgba(14,15,13,0.12)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 20,
          borderBottom: `1px solid ${remotionColors.border}`,
          paddingBottom: compact ? 10 : 18,
        }}
      >
        <p
          style={{
            margin: 0,
            color: remotionColors.black,
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            fontSize: compact ? 15 : 20,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            fontWeight: 700,
          }}
        >
          {title}
        </p>
        <span
          style={{
            border: `1px solid ${remotionColors.green}`,
            borderRadius: 4,
            padding: compact ? '3px 7px' : '5px 10px',
            color: remotionColors.green,
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            fontSize: compact ? 11 : 14,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          Draft
        </span>
      </div>
      <div style={{ marginTop: compact ? 14 : 22 }}>{children ?? <SheetLines />}</div>
    </div>
  );
}

export function SheetLines({ count = 5 }: { count?: number }) {
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {Array.from({ length: count }).map((_, index) => (
        <span
          key={index}
          style={{
            display: 'block',
            height: index === count - 1 ? 10 : 13,
            width: `${94 - index * 9}%`,
            borderRadius: 99,
            background: index % 2 ? 'rgba(14,15,13,0.08)' : 'rgba(26,107,74,0.12)',
          }}
        />
      ))}
    </div>
  );
}

