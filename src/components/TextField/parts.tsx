import type { CSSProperties, ReactNode } from 'react';
import { fieldMotion } from '../../motion/presets';
import styles from './TextField.module.css';

/**
 * Shared pieces of the Field DS inputs (TextField = M-InputText, TextArea = M-InputTextarea). Internal: not re-exported
 * from src/components/index.ts.
 */

const bezier = (b: readonly number[]) => `cubic-bezier(${b.join(', ')})`;

/** Field motion as CSS custom properties: --tf-ease (standard), --tf-focus (160ms border), --tf-lift (200ms inline label). */
export const fieldInputMotionVars = {
  '--tf-ease': bezier(fieldMotion.ease.standard),
  '--tf-focus': `${fieldMotion.duration.sm * 1000}ms`,
  '--tf-lift': `${fieldMotion.duration.base * 1000}ms`,
} as CSSProperties;

/** External label row: B12 Medium, red `*` 2px after it when required. Colour follows the field state (data-state). */
export function FieldLabel({ htmlFor, children, required }: { htmlFor: string; children: ReactNode; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className={styles.label}>
      <span className={styles.labelText}>{children}</span>
      {required && <span className={styles.required} aria-hidden>*</span>}
    </label>
  );
}

/** Helper / error line (B12 Regular) + `n/max` counter (B11 Regular, textMuted, 8 from the helper). */
export function FieldHelper({ id, text, counter }: { id: string; text?: ReactNode; counter?: string }) {
  if (!text && !counter) return null;
  return (
    <div className={styles.helperRow}>
      <span id={id} className={styles.helper}>
        {text}
      </span>
      {counter && <span className={styles.counter}>{counter}</span>}
    </div>
  );
}

/** state precedence shared by both inputs: error > disabled > focus > resting */
export function fieldState({ error, disabled, focused }: { error: boolean; disabled: boolean; focused: boolean }) {
  return error ? 'error' : disabled ? 'disabled' : focused ? 'focus' : 'rest';
}
