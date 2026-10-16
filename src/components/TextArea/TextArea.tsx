import {
  forwardRef,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type ReactNode,
} from 'react';
import { FieldHelper, FieldLabel, fieldInputMotionVars, fieldState } from '../TextField/parts';
import shared from '../TextField/TextField.module.css';
import styles from './TextArea.module.css';

/** field padding-y 14 × 2 + 1px border × 2: the box height minus the textarea's own */
const BOX_CHROME = 30;

export interface TextAreaProps {
  /** controlled value; omit for uncontrolled (`defaultValue`) */
  value?: string;
  defaultValue?: string;
  /** called with the new string (not the event) */
  onChange?: (value: string) => void;
  /** external B12 Medium label */
  label?: ReactNode;
  required?: boolean;
  placeholder?: string;
  helperText?: ReactNode;
  /** `true` = error border + red label; a string also shows as the helper line */
  error?: boolean | string;
  disabled?: boolean;
  maxLength?: number;
  /** `n/max` counter (needs `maxLength`) */
  showCounter?: boolean;
  /** field box min height (default 180) */
  minHeight?: number;
  /** field box max height; the text scrolls past it (default: grows with the text) */
  maxHeight?: number;
  /** textarea rows (Field numberOfLines, default 6) */
  rows?: number;
  autoFocus?: boolean;
  name?: string;
  id?: string;
  readOnly?: boolean;
  onFocus?: (e: FocusEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: FocusEvent<HTMLTextAreaElement>) => void;
  'aria-label'?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * Field DS M-InputTextarea (`@field-ds/components` InputTextarea/InputTextarea.tsx, Figma 1092:212): multi-line input.
 * Min 180h, r12, 1px border, padding 16 / 14, external B12 Medium label (+ red `*`), helper B12 Regular, `n/max`
 * counter B11 Regular. Same derived states as TextField: borderPrimary → borderMedium on focus (160ms), borderErrorBold
 * on error, surfaceMuted when disabled. Text B14 Regular, B14 Medium when filled; placeholder textMuted. The box grows
 * with the text up to `maxHeight`, then scrolls. Clicking anywhere in the box focuses the textarea.
 *
 *   <TextArea label="Review" maxLength={200} showCounter helperText="Tell us how it went." value={v} onChange={setV} />
 */
export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  {
    value: controlled,
    defaultValue = '',
    onChange,
    label,
    required,
    placeholder,
    helperText,
    error = false,
    disabled = false,
    maxLength,
    showCounter,
    minHeight = 180,
    maxHeight,
    rows = 6,
    autoFocus,
    name,
    id,
    readOnly,
    onFocus,
    onBlur,
    'aria-label': ariaLabel,
    className,
    style,
  },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? `ta${autoId}`;
  const helperId = `${inputId}-helper`;
  const areaRef = useRef<HTMLTextAreaElement>(null);
  useImperativeHandle(ref, () => areaRef.current as HTMLTextAreaElement);

  const [internal, setInternal] = useState(defaultValue);
  const value = controlled ?? internal;
  const [focused, setFocused] = useState(false);
  const hasError = !!error;
  const errorText = typeof error === 'string' ? error : undefined;
  const helper = errorText ?? helperText;
  const counter = showCounter && typeof maxLength === 'number' ? `${value.length}/${maxLength}` : undefined;

  // grow with the content; past maxHeight the textarea scrolls
  useLayoutEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const cap = maxHeight != null ? maxHeight - BOX_CHROME : Infinity;
    const h = Math.min(el.scrollHeight, cap);
    el.style.height = `${h}px`;
    el.style.overflowY = el.scrollHeight > cap ? 'auto' : 'hidden';
  }, [value, maxHeight, rows]);

  return (
    <div
      className={[shared.root, className].filter(Boolean).join(' ')}
      style={{ ...fieldInputMotionVars, ...style }}
      data-state={fieldState({ error: hasError, disabled, focused })}
      data-filled={value.length > 0 || undefined}
    >
      {label != null && (
        <FieldLabel htmlFor={inputId} required={required}>
          {label}
        </FieldLabel>
      )}
      <div className={styles.field} style={{ minHeight, maxHeight }} onClick={() => !disabled && areaRef.current?.focus()}>
        <textarea
          ref={areaRef}
          id={inputId}
          className={styles.input}
          rows={rows}
          value={value}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          autoFocus={autoFocus}
          name={name}
          aria-label={ariaLabel}
          aria-invalid={hasError || undefined}
          aria-describedby={helper ? helperId : undefined}
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
        />
      </div>
      <FieldHelper id={helperId} text={helper} counter={counter} />
    </div>
  );
});
