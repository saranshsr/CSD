import { motion } from 'motion/react';
import type { CSSProperties } from 'react';
import styles from './Checkbox.module.css';
import { Pressable } from '../Pressable/Pressable';
import { field } from '../../foundations/tokens';
import { fieldMotion } from '../../motion/presets';
import { tickPath, tickLength, useFieldSelection } from './fieldSelection';

export interface CheckboxProps {
  checked: boolean;
  /** glyph colour (default variant only; default `currentColor`) */
  color?: string;
  /** px. Default variant: 20. `variant="field"`: 16 | 20 | 24, default 24 */
  size?: number;
  /** `'field'` = Field DS M-Checkbox (animated, sizes 16/20/24, disabled look). Omit for the bappzaar glyph. */
  variant?: 'field';
  /** makes it a tappable `role="checkbox"` button; omit for a purely visual glyph inside a pressable row */
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  /** accessible label (aria-label) when there is no visible label wired to it */
  label?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * Square (squircle) checkbox glyph — bappzaar `NoonIcons.squareCheckboxSVG(selected)`, 20×20 filled with `color`.
 * Purely visual: wrap it in the pressable row that owns the toggle (e.g. checkout DeliveryInstruction).
 *
 * `variant="field"`: Field DS M-Checkbox (`packages/components/src/Checkbox/Checkbox.tsx`), sizes 16 / 20 / 24
 * (default 24). Off = squircle outline textTertiary #666D85 (borderMedium disabled); on = filled squircle textPrimary
 * #1D2539 (textMuted disabled) with a 2px white tick. Check-in 220ms / recede 180ms `ease.standard`: outline fades
 * out, fill fades in (no scale), tick draws after 120ms. With `onChange` it is a `role="checkbox"` button (press
 * opacity 0.85, ≈44px touch target); without, a visual span. Reduced motion snaps.
 */
export function Checkbox(props: CheckboxProps) {
  if (props.variant === 'field') return <FieldCheckbox {...props} />;
  if (props.onChange) {
    const { checked, onChange, disabled, label, className, style } = props;
    return (
      <Pressable
        role="checkbox"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        className={[styles.plain, className].filter(Boolean).join(' ')}
        style={style}
        onClick={(e) => {
          e.stopPropagation();
          if (!disabled) onChange(!checked);
        }}
      >
        <CheckboxGlyph checked={checked} color={props.color} size={props.size} />
      </Pressable>
    );
  }
  return <CheckboxGlyph checked={props.checked} color={props.color} size={props.size} />;
}

function CheckboxGlyph({ checked, color = 'currentColor', size = 20 }: { checked: boolean; color?: string; size?: number }) {
  return checked ? (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 1C1.45 1 1 1.45 1 10C1 18.55 1.45 19 10 19C18.55 19 19 18.55 19 10C19 1.45 18.55 1 10 1ZM15.7072 7.70711C16.0977 7.31658 16.0977 6.68342 15.7072 6.29289C15.3166 5.90237 14.6835 5.90237 14.293 6.29289L8.9154 11.6704C8.51883 12.067 8.29427 12.2883 8.11906 12.4206L8.11192 12.4259L8.10562 12.4196C7.95088 12.2639 7.75987 12.0131 7.42337 11.5644L5.80006 9.4C5.46869 8.95817 4.84189 8.86863 4.40006 9.2C3.95823 9.53137 3.86869 10.1582 4.20006 10.6L5.85874 12.8116C6.14647 13.1954 6.42162 13.5624 6.68702 13.8294C6.98274 14.127 7.38595 14.4264 7.9494 14.4713L7.98356 14.4737C8.5477 14.5089 8.98919 14.2696 9.32402 14.0168C9.62452 13.79 9.9488 13.4656 10.2879 13.1264L15.7072 7.70711Z"
        fill={color}
      />
    </svg>
  ) : (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.18425 5.26643C3.03143 6.34841 3 7.83823 3 10C3 12.1618 3.03143 13.6516 3.18425 14.7336C3.33653 15.8117 3.57002 16.1541 3.70796 16.292C3.84591 16.43 4.1883 16.6635 5.26643 16.8157C6.34841 16.9686 7.83823 17 10 17C12.1618 17 13.6516 16.9686 14.7336 16.8157C15.8117 16.6635 16.1541 16.43 16.292 16.292C16.43 16.1541 16.6635 15.8117 16.8157 14.7336C16.9686 13.6516 17 12.1618 17 10C17 7.83823 16.9686 6.34841 16.8157 5.26643C16.6635 4.1883 16.43 3.84591 16.292 3.70796C16.1541 3.57002 15.8117 3.33653 14.7336 3.18425C13.6516 3.03143 12.1618 3 10 3C7.83823 3 6.34841 3.03143 5.26643 3.18425C4.1883 3.33653 3.84591 3.57002 3.70796 3.70796C3.57002 3.84591 3.33653 4.1883 3.18425 5.26643ZM10 1C1.45 1 1 1.45 1 10C1 18.55 1.45 19 10 19C18.55 19 19 18.55 19 10C19 1.45 18.55 1 10 1Z"
        fill={color}
      />
    </svg>
  );
}

// Figma M-Checkbox squircle paths (24×24), verbatim from Field
const OUTLINE_D =
  'M12 21.3925C10.07 21.3925 8.13875 21.2725 6.2225 21.0325C4.51875 20.82 3.18 19.48 2.96625 17.7762C2.4875 13.9425 2.4875 10.055 2.96625 6.22125C3.17875 4.5175 4.51875 3.17875 6.2225 2.965C10.0562 2.48625 13.9437 2.48625 17.7775 2.965C19.4812 3.1775 20.82 4.51625 21.0337 6.22125C21.5125 10.055 21.5125 13.9425 21.0337 17.7762C20.8212 19.48 19.4812 20.8187 17.7775 21.0325C15.86 21.2725 13.93 21.3925 12 21.3925ZM12 4.1075C10.1312 4.1075 8.26375 4.22375 6.40875 4.455C5.38625 4.5825 4.5825 5.38625 4.455 6.40875C3.99125 10.1187 3.99125 13.8812 4.455 17.5925C4.5825 18.615 5.38625 19.4187 6.40875 19.5462C10.1187 20.01 13.8812 20.01 17.5925 19.5462C18.615 19.4187 19.4187 18.615 19.5462 17.5925C20.01 13.8825 20.01 10.12 19.5462 6.40875C19.4187 5.38625 18.615 4.5825 17.5925 4.455C15.7375 4.2225 13.8687 4.1075 12.0012 4.1075H12Z';
const FILL_D =
  'M21.0337 6.22225C20.8212 4.5185 19.4812 3.17975 17.7775 2.966C13.9437 2.48725 10.0562 2.48725 6.22249 2.966C4.51874 3.1785 3.17999 4.5185 2.96624 6.22225C2.48749 10.056 2.48749 13.9435 2.96624 17.7773C3.17874 19.481 4.51874 20.8198 6.22249 21.0335C8.13874 21.2735 10.07 21.3935 12 21.3935C13.93 21.3935 15.8612 21.2735 17.7775 21.0335C19.4812 20.821 20.82 19.481 21.0337 17.7773C21.5125 13.9435 21.5125 10.056 21.0337 6.22225Z';

/** Field hitSlop so the touch target reaches ≈44px (H16 +14, H20 +12, H24 +4). */
const HIT: Record<number, number> = { 16: 14, 20: 12, 24: 4 };

function FieldCheckbox({ checked, onChange, size = 24, disabled = false, label, className, style }: CheckboxProps) {
  const { outlineOpacity, fillOpacity, tickOffset, tickOpacity } = useFieldSelection(checked);
  const box: CSSProperties = { width: size, height: size, ...style };
  const glyph = (
    <>
      <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden style={{ opacity: outlineOpacity }}>
        <path d={OUTLINE_D} fillRule="evenodd" fill={disabled ? field.borderMedium : field.textTertiary} />
      </motion.svg>
      <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden style={{ opacity: fillOpacity }}>
        <path d={FILL_D} fill={disabled ? field.textMuted : field.textPrimary} />
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
  const cls = [styles.field, className].filter(Boolean).join(' ');
  if (!onChange) {
    return (
      <span className={cls} style={box} aria-hidden>
        {glyph}
      </span>
    );
  }
  return (
    <Pressable
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      scale={1}
      whileTap={disabled ? undefined : { opacity: fieldMotion.pressOpacity }}
      transition={{ duration: fieldMotion.duration.xs, ease: fieldMotion.ease.decelerate }}
      className={[cls, styles.interactive].join(' ')}
      style={{ ...box, ['--nk-checkbox-hit' as string]: `${HIT[size] ?? 4}px` }}
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled) onChange(!checked);
      }}
    >
      {glyph}
    </Pressable>
  );
}
