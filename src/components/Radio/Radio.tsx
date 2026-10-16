import { motion } from 'motion/react';
import type { CSSProperties } from 'react';
import styles from './Radio.module.css';
import { Pressable } from '../Pressable/Pressable';
import { field } from '../../foundations/tokens';
import { fieldMotion } from '../../motion/presets';
import { tickPath, tickLength, useFieldSelection } from '../Checkbox/fieldSelection';

export type RadioSize = 16 | 20 | 24;

export interface RadioProps {
  checked: boolean;
  /** called with `true` when an unselected radio is tapped (tapping a selected radio is a no-op, like Field).
   *  Omit to render a purely visual span for a radio inside a larger pressable row. */
  onChange?: (checked: true) => void;
  /** 24 default · 20 dense lists · 16 compact tables only */
  size?: RadioSize;
  disabled?: boolean;
  /** accessible label (aria-label) when there is no visible label wired to it */
  label?: string;
  className?: string;
  style?: CSSProperties;
}

const HIT: Record<RadioSize, number> = { 16: 14, 20: 12, 24: 4 };

/**
 * Field DS M-Radio (`packages/components/src/Radio/Radio.tsx`): single-select disc, sizes 16 / 20 / 24 (default 24).
 * Off = white disc (surfacePrimary; surfaceSecondary disabled) + 1px borderMedium #D0D4DD ring; on = textAction #0F61FF
 * disc (textMuted disabled) with a 2px white tick. Select-in 220ms / recede 180ms, `ease.standard`: the ring fades out,
 * the disc fades in (no scale), the tick draws after 120ms. Press opacity 0.85, touch target ≈44px, reduced motion snaps.
 */
export function Radio({ checked, onChange, size = 24, disabled = false, label, className, style }: RadioProps) {
  const { outlineOpacity, fillOpacity, tickOffset, tickOpacity } = useFieldSelection(checked);
  const box: CSSProperties = { width: size, height: size, ...style };
  const glyph = (
    <>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx={12} cy={12} r={12} fill={disabled ? field.surfaceSecondary : field.surfacePrimary} />
      </svg>
      <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden style={{ opacity: outlineOpacity }}>
        {/* 1px ring inside the disc edge, at any size */}
        <circle cx={12} cy={12} r={12 - 12 / size} stroke={field.borderMedium} strokeWidth={24 / size} />
      </motion.svg>
      <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden style={{ opacity: fillOpacity }}>
        <circle cx={12} cy={12} r={12} fill={disabled ? field.textMuted : field.textAction} />
      </motion.svg>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
        <motion.path
          d={tickPath}
          stroke={field.surfacePrimary}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={tickLength}
          style={{ strokeDashoffset: tickOffset, opacity: tickOpacity }}
        />
      </svg>
    </>
  );
  const cls = [styles.root, className].filter(Boolean).join(' ');
  if (!onChange) {
    return (
      <span className={cls} style={box} aria-hidden>
        {glyph}
      </span>
    );
  }
  return (
    <Pressable
      role="radio"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      scale={1}
      whileTap={disabled ? undefined : { opacity: fieldMotion.pressOpacity }}
      transition={{ duration: fieldMotion.duration.xs, ease: fieldMotion.ease.decelerate }}
      className={[cls, styles.interactive].join(' ')}
      style={{ ...box, ['--nk-radio-hit' as string]: `${HIT[size]}px` }}
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled && !checked) onChange(true);
      }}
    >
      {glyph}
    </Pressable>
  );
}
