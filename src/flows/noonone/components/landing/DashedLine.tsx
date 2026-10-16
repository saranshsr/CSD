import type { CSSProperties } from 'react';

/**
 * features/vip/components/VIPDashedBorder: a row of `strokeWidth × strokeHeight` rounded bars every `strokeSpacing` px
 * (SVG, clipped to the container width) → CSS repeating gradient.
 */
export function DashedLine({ strokeWidth = 10, strokeSpacing = 20, strokeHeight = 1, color, className, style }: { strokeWidth?: number; strokeSpacing?: number; strokeHeight?: number; color: string; className?: string; style?: CSSProperties }) {
  return (
    <div
      aria-hidden
      className={className}
      style={{
        height: strokeHeight,
        borderRadius: strokeHeight / 2,
        background: `repeating-linear-gradient(90deg, ${color} 0 ${strokeWidth}px, transparent ${strokeWidth}px ${strokeSpacing}px)`,
        ...style,
      }}
    />
  );
}
