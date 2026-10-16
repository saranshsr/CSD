import type { CSSProperties, ReactNode } from 'react';
import { radius as r, ref, spacing } from '../../foundations/tokens';

/** NoonSectionCard: white, r16, padding 12, margin 0 12 12, optional 16/700 title row. */
export function SectionCard({
  title,
  right,
  children,
  padding = spacing.s12,
  gap = spacing.s12,
  margin = `0 ${spacing.s12}px ${spacing.s12}px`,
  radius = r.r16,
  style,
  onClick,
}: {
  title?: ReactNode;
  right?: ReactNode;
  children?: ReactNode;
  padding?: number | string;
  gap?: number;
  margin?: number | string;
  radius?: number;
  style?: CSSProperties;
  onClick?: () => void;
}) {
  return (
    <section onClick={onClick} style={{ background: ref.color('bgSurface'), borderRadius: radius, padding, margin, display: 'flex', flexDirection: 'column', gap, cursor: onClick ? 'pointer' : undefined, ...style }}>
      {(title || right) && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: spacing.s8 }}>
          {typeof title === 'string' ? <h3 style={{ font: ref.type('section'), color: ref.color('textStrong') }}>{title}</h3> : title}
          {right}
        </div>
      )}
      {children}
    </section>
  );
}
