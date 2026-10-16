import type { CSSProperties } from 'react';
import { maskSrc } from '../maskSrc';
import { MaskIcon } from '../../../../components';
import chevronLeft from '@assets/vip/chevron-left-rounded.svg';
import { offersTokens } from '../../tokens';
import styles from './primitives.module.css';

/** features/vip/components/VIPWave: quadratic wave strip (T-smoothed), filled below. */
export function VIPWave({ color, width, height = 12, cycles = 4, className }: { color: string; width: number; height?: number; cycles?: number; className?: string }) {
  const cy = height / 2;
  const cw = width / cycles;
  let d = `M0 ${cy}`;
  for (let i = 0; i < cycles; i++) {
    const end = (i + 1) * cw;
    d += i === 0 ? ` Q${cw / 2} ${i % 2 === 0 ? 0 : height} ${end} ${cy}` : ` T${end} ${cy}`;
  }
  d += ` L${width} ${height} L0 ${height} Z`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none" className={className} style={{ display: 'block' }}>
      <path d={d} fill={color} />
    </svg>
  );
}

/** features/vip/components/VIPDashedBorder: row of rounded rects `strokeWidth` long every `strokeSpacing`px. */
export function VIPDashedBorder({ strokeSpacing = 20, strokeWidth = 10, strokeHeight = 1, color, className, style }: { strokeSpacing?: number; strokeWidth?: number; strokeHeight?: number; color: string; className?: string; style?: CSSProperties }) {
  return (
    <span
      aria-hidden
      className={className}
      style={{
        display: 'block',
        width: '100%',
        height: strokeHeight,
        backgroundImage: `linear-gradient(90deg, ${color} ${strokeWidth}px, transparent ${strokeWidth}px)`,
        backgroundSize: `${strokeSpacing}px ${strokeHeight}px`,
        backgroundRepeat: 'repeat-x',
        borderRadius: strokeHeight / 2,
        ...style,
      }}
    />
  );
}

const HEX =
  'M15 1.05664C16.0256 1.05664 16.9964 1.3274 18.1514 1.85059C19.3014 2.37156 20.651 3.1512 22.4307 4.17871L22.8096 4.39648C24.5895 5.42412 25.9396 6.20392 26.9658 6.93945C27.9962 7.678 28.7157 8.38335 29.2285 9.27148C29.7413 10.1597 29.9928 11.1357 30.1172 12.3975C30.241 13.6539 30.2402 15.2125 30.2402 17.2676V17.7051C30.2402 19.7601 30.241 21.3187 30.1172 22.5752C29.9928 23.837 29.7413 24.813 29.2285 25.7012C28.7158 26.5893 27.9962 27.2947 26.9658 28.0332C25.9396 28.7687 24.5895 29.5485 22.8096 30.5762L22.4307 30.7939C20.651 31.8215 19.3014 32.6011 18.1514 33.1221C16.9964 33.6453 16.0256 33.916 15 33.916C13.9744 33.916 13.0036 33.6453 11.8486 33.1221C10.6986 32.6011 9.34904 31.8215 7.56934 30.7939L7.19043 30.5762C5.41051 29.5485 4.06044 28.7687 3.03418 28.0332C2.00377 27.2947 1.28425 26.5893 0.771484 25.7012C0.258687 24.813 0.0071924 23.837 -0.117188 22.5752C-0.241027 21.3187 -0.240234 19.7601 -0.240234 17.7051V17.2676C-0.240234 15.2125 -0.241037 13.6539 -0.117188 12.3975C0.00719442 11.1357 0.25867 10.1597 0.771484 9.27148C1.28426 8.38335 2.00376 7.678 3.03418 6.93945C4.06044 6.20392 5.41051 5.42412 7.19043 4.39648L7.56934 4.17871C9.34904 3.1512 10.6986 2.37156 11.8486 1.85059C13.0036 1.3274 13.9744 1.05664 15 1.05664Z';

/** features/vip/components/VIPMemberInitialHexagon (default 64×62, #FED2D2 / #C45C5C, white 0.8 stroke, font = width / 2.3). */
export function VIPMemberInitialHexagon({
  initial,
  width = 64,
  height = 62,
  fill = 'var(--nk-color-vip-hexagon-bg)',
  textColor = 'var(--nk-color-vip-hexagon-text)',
  stroke = 'var(--nk-palette-white)',
  strokeWidth = offersTokens.hexBorder,
  style,
}: {
  initial: string;
  width?: number;
  height?: number;
  fill?: string;
  textColor?: string;
  stroke?: string;
  strokeWidth?: number;
  style?: CSSProperties;
}) {
  return (
    <span className={styles.hex} style={{ width, height, ...style }}>
      <svg width={width} height={height} viewBox="0 0 30 35" style={{ overflow: 'visible' }}>
        <path d={HEX} fill={fill} stroke={stroke} strokeWidth={strokeWidth} vectorEffect="non-scaling-stroke" />
      </svg>
      <span className={styles.hexText} style={{ color: textColor, fontSize: width / offersTokens.hexFontDiv }}>
        {initial.trim().charAt(0).toUpperCase()}
      </span>
    </span>
  );
}

/** VIP chevronLeftRounded (svg stroke #404040) recoloured. */
export function ChevronLeft({ width, height, color = 'var(--nk-color-vip-of-back)' }: { width: number; height: number; color?: string }) {
  return <MaskIcon src={maskSrc(chevronLeft)} width={width} height={height} color={color} className={styles.flip} />;
}
