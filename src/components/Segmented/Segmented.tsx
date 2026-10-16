import { motion, useReducedMotion } from 'motion/react';
import { useId, useState } from 'react';
import styles from './Segmented.module.css';
import { field, radius, ref, spacing } from '../../foundations/tokens';
import { duration, easing, fieldMotion } from '../../motion/presets';

export interface SegmentedProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  width?: number;
  /** `'field'` = Field DS M-Switch (2–4 options, sizes 40/48, spring thumb, press squash). Omit for the language toggle. */
  variant?: 'field';
  /** Field track height: 40 (default, thumb 32, B12 Semibold) · 48 (thumb 40, B14 Semibold) */
  size?: 40 | 48;
  /** blocks taps and dims the control to 50% */
  disabled?: boolean;
}

/**
 * Language toggle style segmented control (126×40, #F9F9FB, white sliding thumb, 250ms ease-out-cubic).
 *
 * `variant="field"`: Field DS M-Switch (`packages/components/src/Switch/Switch.tsx`), a pill segmented control for 2–4
 * options. Size 40 (thumb 32, B12 Semibold) or 48 (thumb 40, B14 Semibold), padding 4, fully rounded, surfaceSecondary
 * #F9F9FB track with no border, white thumb with `field.shadowSm`; active label textPrimary #1D2539, inactive
 * textTertiary #666D85. The thumb slides on `fieldMotion.spring.springLight` and squashes to scaleX 0.94 while an option
 * is held; option press opacity 0.85; disabled = 50% opacity. Reduced motion snaps. No drag-to-select (see field-ds.md).
 */
export function Segmented<T extends string>(props: SegmentedProps<T>) {
  if (props.variant === 'field') return <FieldSegmented {...props} />;
  return <ClassicSegmented {...props} />;
}

function ClassicSegmented<T extends string>({ options, value, onChange, width, disabled }: SegmentedProps<T>) {
  const id = useId();
  return (
    <div style={{ display: 'flex', padding: spacing.s4, borderRadius: radius.full, background: ref.color('bgSubtle'), width, border: `1px solid ${ref.color('borderSubtle')}`, ...(disabled ? { opacity: 0.5 } : null) }}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            disabled={disabled}
            onClick={(e) => {
              e.stopPropagation();
              onChange(o.value);
            }}
            style={{ position: 'relative', flex: 1, height: 32, border: 0, background: 'none', cursor: 'pointer', padding: `0 ${spacing.s10}px`, font: ref.type(on ? 'text12SemiboldLh1' : 'text14MediumLh1'), color: on ? ref.color('textPrimary') : ref.color('textSecondary'), whiteSpace: 'nowrap' }}
          >
            {on && <motion.span layoutId={`seg-${id}`} transition={{ duration: duration.base, ease: easing.out }} style={{ position: 'absolute', inset: 0, background: ref.color('bgSurface'), borderRadius: radius.full, boxShadow: ref.shadow('thumb') }} />}
            <span style={{ position: 'relative' }}>{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

const FIELD_SEGMENTED = {
  40: { thumb: 32, font: ref.type('fieldB12Semibold') },
  48: { thumb: 40, font: ref.type('fieldB14Semibold') },
} as const;
/** Field THUMB_GRAB_SCALE_X */
const GRAB_SCALE_X = 0.94;

function FieldSegmented<T extends string>({ options, value, onChange, width, size = 40, disabled = false }: SegmentedProps<T>) {
  const cfg = FIELD_SEGMENTED[size];
  const reduced = useReducedMotion();
  const [held, setHeld] = useState(false);
  const found = options.findIndex((o) => o.value === value);
  const active = found < 0 ? 0 : found;
  const n = Math.max(options.length, 1);
  const release = () => setHeld(false);
  return (
    <div role="tablist" aria-disabled={disabled || undefined} className={[styles.track, disabled && styles.disabled].filter(Boolean).join(' ')} style={{ width, height: cfg.thumb + spacing.s4 * 2 }}>
      <span className={styles.thumbLayer} aria-hidden>
        <motion.span
          className={styles.thumb}
          style={{ width: `${100 / n}%` }}
          initial={false}
          animate={{ x: `${active * 100}%`, scaleX: held && !disabled ? GRAB_SCALE_X : 1 }}
          transition={reduced ? { duration: 0 } : fieldMotion.spring.springLight}
        />
      </span>
      {options.map((o, i) => {
        const on = i === active;
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={on}
            disabled={disabled}
            className={styles.option}
            style={{ height: cfg.thumb, font: cfg.font, color: on ? field.textPrimary : field.textTertiary }}
            onPointerDown={() => !disabled && setHeld(true)}
            onPointerUp={release}
            onPointerLeave={release}
            onPointerCancel={release}
            onClick={(e) => {
              e.stopPropagation();
              if (!disabled && o.value !== value) onChange(o.value);
            }}
          >
            <span className={styles.label}>{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
