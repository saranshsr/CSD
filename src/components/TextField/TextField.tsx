import {
  forwardRef,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type HTMLAttributes,
  type HTMLInputTypeAttribute,
  type ReactNode,
} from 'react';
import { FieldHelper, FieldLabel, fieldInputMotionVars, fieldState } from './parts';
import styles from './TextField.module.css';

export type TextFieldLabelMode = 'external' | 'inline' | 'none';

export interface TextFieldProps {
  /** controlled value; omit for uncontrolled (`defaultValue`) */
  value?: string;
  defaultValue?: string;
  /** called with the new string (not the event) */
  onChange?: (value: string) => void;
  label?: ReactNode;
  /** `external` (default): B12 Medium label above · `inline`: label floats inside a 56h field · `none` */
  labelMode?: TextFieldLabelMode;
  /** red `*` after the label */
  required?: boolean;
  placeholder?: string;
  /** B12 Regular line under the field (replaced by the error text when `error` is a string) */
  helperText?: ReactNode;
  /** `true` = error border + red label; a string also shows as the helper line */
  error?: boolean | string;
  disabled?: boolean;
  maxLength?: number;
  /** `n/max` counter (needs `maxLength`) */
  showCounter?: boolean;
  /** 20 × 20 slot before / after the input (icon, clear button, eye toggle …) */
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
  /** HTML input type, e.g. `password`, `email`, `tel` */
  type?: HTMLInputTypeAttribute;
  inputMode?: HTMLAttributes<HTMLInputElement>['inputMode'];
  autoComplete?: string;
  autoFocus?: boolean;
  name?: string;
  id?: string;
  readOnly?: boolean;
  onFocus?: (e: FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
  /** Enter key */
  onSubmit?: (value: string) => void;
  /** accessible name when there is no visible label */
  'aria-label'?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * Field DS M-InputText (`@field-ds/components` InputText/InputText.tsx, Figma 1102:164105): single-line text input.
 * 48h (inline label mode 56h, padding-y 8), r12, 1px border, padding-x 16, gap 8, 20px left / right slots.
 * State is derived (focus, value, `error`, `disabled`): border borderPrimary → borderMedium on focus (160ms, standard
 * ease), borderErrorBold on error, surfaceMuted fill when disabled. Value B14 Regular while empty, B14 Medium when filled
 * (inline: B14 SemiBold); placeholder textMuted; caret surfaceActionBold. `labelMode="inline"`: the label is the
 * placeholder and floats 14 → 11 to the top over 200ms. Helper B12 Regular 6 below, counter B11 Regular.
 * Clicking anywhere in the field focuses the input.
 *
 *   <TextField label="Email" placeholder="you@noon.com" value={email} onChange={setEmail} />
 */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  {
    value: controlled,
    defaultValue = '',
    onChange,
    label,
    labelMode = 'external',
    required,
    placeholder,
    helperText,
    error = false,
    disabled = false,
    maxLength,
    showCounter,
    leftSlot,
    rightSlot,
    type = 'text',
    inputMode,
    autoComplete,
    autoFocus,
    name,
    id,
    readOnly,
    onFocus,
    onBlur,
    onSubmit,
    'aria-label': ariaLabel,
    className,
    style,
  },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? `tf${autoId}`;
  const helperId = `${inputId}-helper`;
  const inputRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

  const [internal, setInternal] = useState(defaultValue);
  const value = controlled ?? internal;
  const [focused, setFocused] = useState(false);
  const hasError = !!error;
  const errorText = typeof error === 'string' ? error : undefined;
  const filled = value.length > 0;
  const inline = labelMode === 'inline' && label != null;
  const lifted = focused || filled;
  const state = fieldState({ error: hasError, disabled, focused });
  const helper = errorText ?? helperText;
  const counter = showCounter && typeof maxLength === 'number' ? `${value.length}/${maxLength}` : undefined;

  const input = (
    <input
      ref={inputRef}
      id={inputId}
      className={styles.input}
      type={type}
      inputMode={inputMode}
      autoComplete={autoComplete}
      autoFocus={autoFocus}
      name={name}
      value={value}
      maxLength={maxLength}
      // inline mode: the floating label is the placeholder
      placeholder={inline ? undefined : placeholder}
      disabled={disabled}
      readOnly={readOnly}
      required={required}
      aria-invalid={hasError || undefined}
      aria-describedby={helper ? helperId : undefined}
      aria-label={ariaLabel ?? (labelMode === 'none' && typeof label === 'string' ? label : undefined)}
      onChange={(e) => {
        if (controlled === undefined) setInternal(e.target.value);
        onChange?.(e.target.value);
      }}
      onFocus={(e) => {
        setFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        onBlur?.(e);
      }}
      onKeyDown={(e) => e.key === 'Enter' && onSubmit?.(value)}
    />
  );

  return (
    <div
      className={[styles.root, className].filter(Boolean).join(' ')}
      style={{ ...fieldInputMotionVars, ...style }}
      data-mode={inline ? 'inline' : labelMode}
      data-state={state}
      data-filled={filled || undefined}
      data-lifted={(inline && lifted) || undefined}
    >
      {labelMode === 'external' && label != null && (
        <FieldLabel htmlFor={inputId} required={required}>
          {label}
        </FieldLabel>
      )}
      <div className={styles.field} onClick={() => !disabled && inputRef.current?.focus()}>
        {leftSlot != null && <span className={styles.slot}>{leftSlot}</span>}
        {inline ? (
          <span className={styles.inlineContent}>
            <label htmlFor={inputId} className={styles.floatLabel}>
              {label}
              {required && <span className={styles.required}> *</span>}
            </label>
            <span className={styles.inlineInputWrap}>{input}</span>
          </span>
        ) : (
          input
        )}
        {rightSlot != null && <span className={styles.slot}>{rightSlot}</span>}
      </div>
      <FieldHelper id={helperId} text={helper} counter={counter} />
    </div>
  );
});
