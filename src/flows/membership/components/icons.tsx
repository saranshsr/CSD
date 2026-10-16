import type { CSSProperties } from 'react';
import { ref } from '../../../foundations/tokens';

/**
 * VIPThemeManager.icons SVGs that bappzaar recolours through props (react-native-svg `stroke` / `strokeWidth`).
 * Rendered inline so the stroke can be set per use like on master; everything else uses the files in
 * src/assets/membership via `assets.ts`.
 */

/** chevron-left-rounded.svg (viewBox 0 0 9 15). Master passes stroke textPrimary, strokeWidth 1.5, preserveAspectRatio xMidYMid. */
export function ChevronLeftRounded({
  width = 9,
  height = 18,
  stroke = ref.color('textPrimary'),
  strokeWidth = 1.5,
  direction = 'left',
  style,
  className,
}: {
  width?: number;
  height?: number;
  stroke?: string;
  strokeWidth?: number;
  /** master rotates the left chevron 180° for "→" rows (and flips again in RTL) */
  direction?: 'left' | 'right' | 'up' | 'down';
  style?: CSSProperties;
  className?: string;
}) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 9 15"
      fill="none"
      preserveAspectRatio="xMidYMid meet"
      className={className}
      data-dir={direction}
      style={{ flexShrink: 0, ...style }}
      aria-hidden
    >
      <path d="M7.95148 1.9707L1.96415 7.95803L7.95148 13.9454" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
