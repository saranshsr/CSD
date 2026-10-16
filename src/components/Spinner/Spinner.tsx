import type { CSSProperties } from 'react';
import { useReduceMotion } from '../../motion/reducedMotion';
import styles from './Spinner.module.css';

export interface SpinnerProps {
  /**
   * `ring` (default): a rotating CSS ring, the web stand-in for bappzaar `src/components/Loader` / RN `ActivityIndicator`.
   * `ios`: the 8-petal iOS `ActivityIndicator` (AddressV2 screens).
   */
  variant?: 'ring' | 'ios';
  /** outer size in px (default 20) */
  size?: number;
  /** arc colour (`ios`: petal colour). Default `currentColor`. */
  color?: string;
  /**
   * ring only — colour of the rest of the ring. Without a track the ring is drawn in `color` with one
   * transparent side (`gap`); with a track the ring is `track` and the top side is `color`.
   */
  track?: string;
  /** ring only — border width in px (default 2) */
  thickness?: number;
  /** ring only, no track — which side is left transparent (default `top`) */
  gap?: 'top' | 'right';
  /** seconds per turn (default 0.8) */
  duration?: number;
  className?: string;
  style?: CSSProperties;
  label?: string;
}

/**
 * Loading indicator shared by every flow (bappzaar `src/components/Loader`, RN `ActivityIndicator`).
 *
 * Presets in use:
 *   - noon Loader (checkout delivery): `<Spinner track="#DADCE3" color="var(--nk-color-badge)" />`
 *   - white loader on a filled button: `<Spinner color="#fff" track="rgba(255,255,255,0.4)" />`
 *   - cards PaymentButtonV2: `<Spinner color="#fff" gap="right" duration={0.75} />`
 *   - cart inline loader: `<Spinner size={14} thickness={size / 9} duration={0.7} />`
 *   - address AddressV2: `<Spinner variant="ios" color="var(--nk-color-cta)" />`
 *
 * Reduced motion (`useReduceMotion`): nothing turns. The ring holds its arc and the iOS petals hold one frame of
 * their fade; both pulse their opacity gently (`nk-reduced-pulse`) so loading still reads as in progress.
 */
export function Spinner({ variant = 'ring', size = 20, color = 'currentColor', track, thickness = 2, gap = 'top', duration = 0.8, className, style, label = 'Loading' }: SpinnerProps) {
  const reduce = useReduceMotion();
  const keep = reduce ? `${styles.reduced} nk-motion-keep` : undefined;
  if (variant === 'ios') {
    return (
      <span className={[styles.ios, keep, className].filter(Boolean).join(' ')} style={{ width: size, height: size, color, ...style }} aria-label={label} role="status">
        {Array.from({ length: 8 }).map((_, i) => (
          <i
            key={i}
            style={
              reduce
                ? { transform: `rotate(${i * 45}deg)`, animation: 'none', opacity: 0.25 + (0.75 * i) / 7 }
                : { transform: `rotate(${i * 45}deg)`, animationDelay: `${(i - 8) * 0.1}s`, animationDuration: `${duration}s` }
            }
          />
        ))}
      </span>
    );
  }
  const ring: CSSProperties = track
    ? { borderColor: track, borderTopColor: color }
    : { borderColor: color, [gap === 'right' ? 'borderRightColor' : 'borderTopColor']: 'transparent' };
  return (
    <span
      className={[styles.ring, keep, className].filter(Boolean).join(' ')}
      style={{ width: size, height: size, borderWidth: thickness, animationDuration: reduce ? undefined : `${duration}s`, ...ring, ...style }}
      aria-label={label}
      role="status"
    />
  );
}
