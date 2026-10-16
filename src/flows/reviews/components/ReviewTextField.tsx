import { type FocusEventHandler, type MutableRefObject, type Ref, useCallback, useLayoutEffect, useRef } from 'react';
import styles from './ReviewTextField.module.css';

export interface ReviewTextFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /**
   * 'note'     — NewReview / RatePastOrders "Anything else you would like to add": 12/14 padding, 15/22 Medium, grows from 1 line
   * 'optional' — ManualReview "Add anything we missed (Optional)": 14/16 padding, min 96h, 16/24 Medium
   * 'large'    — manual "write your own" field: fills its column (flex 1), min 136h text, 16/24 Medium
   */
  size?: 'note' | 'optional' | 'large';
  /** 'subtle' = the grey edit field (bgSubtle, borderSubtle, 14/20 — EditReviewSheet, ReviewDraftB in-place field) */
  surface?: 'surface' | 'subtle';
  /** grow with the content instead of scrolling (default true); `minHeight` floors it */
  autoGrow?: boolean;
  minHeight?: number;
  /** cap for autoGrow; past it the field scrolls (EditReviewSheet: 220 so sheet + keyboard fit) */
  maxHeight?: number;
  maxLength?: number;
  /** "123/1000" under the field */
  counter?: boolean;
  /** 'none' keeps the device keyboard down — use while the MockKeyboard is the input (repo editors) */
  inputMode?: 'none' | 'text';
  autoFocus?: boolean;
  onFocus?: FocusEventHandler<HTMLTextAreaElement>;
  onBlur?: FocusEventHandler<HTMLTextAreaElement>;
  inputRef?: Ref<HTMLTextAreaElement>;
  className?: string;
}

/**
 * ReviewTextField — bordered auto-growing textarea used for the optional note, the manual review and the edit
 * fields (repo ManualReviewScreen OptionalTextArea / ManualTextArea, NewReviewScreen note + manual fields,
 * RatePastOrdersScreen note, EditReviewSheet field). Tapping anywhere in the box focuses it. NewReview's
 * focused-note morph (picks fold away, counter + "Add note" appear) is screen choreography built around this.
 */
export function ReviewTextField({
  value,
  onChange,
  placeholder,
  size = 'note',
  surface = 'surface',
  autoGrow = true,
  minHeight,
  maxHeight,
  maxLength,
  counter,
  inputMode,
  autoFocus,
  onFocus,
  onBlur,
  inputRef,
  className,
}: ReviewTextFieldProps) {
  const local = useRef<HTMLTextAreaElement | null>(null);
  // Stable across renders, so a callback `inputRef` isn't re-run (and can't re-grab focus) on every render.
  const setRef = useCallback(
    (el: HTMLTextAreaElement | null) => {
      local.current = el;
      if (typeof inputRef === 'function') inputRef(el);
      else if (inputRef) (inputRef as MutableRefObject<HTMLTextAreaElement | null>).current = el;
    },
    [inputRef],
  );
  useLayoutEffect(() => {
    const ta = local.current;
    if (!ta || !autoGrow) return;
    ta.style.height = 'auto';
    const h = Math.max(minHeight ?? 0, ta.scrollHeight);
    ta.style.height = `${maxHeight ? Math.min(maxHeight, h) : h}px`;
    ta.style.overflowY = maxHeight && h > maxHeight ? 'auto' : 'hidden';
  }, [value, autoGrow, minHeight, maxHeight]);
  return (
    <div className={[styles.box, className].filter(Boolean).join(' ')} data-size={size} data-surface={surface} onClick={() => local.current?.focus()}>
      <textarea
        ref={setRef}
        className={styles.input}
        value={value}
        rows={1}
        maxLength={maxLength}
        placeholder={placeholder}
        inputMode={inputMode}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        style={autoGrow ? undefined : { overflowY: 'auto', flex: 1 }}
      />
      {counter && (
        <span className={styles.counter}>
          {value.length}/{maxLength ?? '∞'}
        </span>
      )}
    </div>
  );
}
