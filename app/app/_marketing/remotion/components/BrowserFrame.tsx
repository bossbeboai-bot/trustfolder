import type { ReactNode } from 'react';
import { remotionColors } from '../constants';

export function BrowserFrame({ children, url }: { children: ReactNode; url: string }) {
  return (
    <div
      style={{
        overflow: 'hidden',
        border: `1px solid ${remotionColors.borderMid}`,
        borderRadius: 18,
        background: remotionColors.white,
        boxShadow: '0 24px 80px rgba(14,15,13,0.12)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          borderBottom: `1px solid ${remotionColors.border}`,
          padding: '16px 20px',
          background: remotionColors.white,
        }}
      >
        {['#E24B4A', '#F4B33A', '#4CAE6A'].map((color) => (
          <span key={color} style={{ width: 13, height: 13, borderRadius: 999, background: color }} />
        ))}
        <span
          style={{
            marginLeft: 16,
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            fontSize: 16,
            color: remotionColors.subtle,
          }}
        >
          {url}
        </span>
      </div>
      {children}
    </div>
  );
}

