import type { ReactNode } from 'react';
import { radius as r, ref, spacing } from '../../foundations/tokens';

/** Sticky footer bar (PDP ATC bar, cart checkout, checkout slide-to-pay): white, top radius 16, soft upward shadow. */
export function BottomBar({ children, above, radius = r.r16, gap = spacing.s8, padding = `${spacing.s8}px ${spacing.s16}px` }: { children: ReactNode; above?: ReactNode; radius?: number; gap?: number; padding?: string }) {
  return (
    <div style={{ position: 'relative' }}>
      {above}
      <div
        style={{
          background: ref.color('bgSurface'),
          borderRadius: `${radius}px ${radius}px 0 0`,
          boxShadow: ref.shadow('bottomBar'),
          padding,
          paddingBottom: `calc(var(--nk-inset-bottom) + ${ref.space('s8')})`,
          display: 'flex',
          flexDirection: 'column',
          gap,
        }}
      >
        {children}
      </div>
    </div>
  );
}
