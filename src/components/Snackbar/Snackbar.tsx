import { useState, type CSSProperties, type ReactNode } from 'react';
import { OriginIcon } from '../Icon/OriginIcon';
import { Pressable } from '../Pressable/Pressable';
import styles from './Snackbar.module.css';

export type SnackbarType = 'dark' | 'light' | 'error' | 'success';

export interface SnackbarProps {
  /** Dark (default, neutral) · Light (neutral, lower emphasis) · Error · Success — use Error / Success only for that status */
  type?: SnackbarType;
  /** one line, truncates */
  title: ReactNode;
  /** one line, truncates; gets the trailing chevron when `onSubtitlePress` is set */
  subtitle?: ReactNode;
  onSubtitlePress?: () => void;
  /** leading icon / avatar / image (20–40 box) */
  asset?: ReactNode;
  /**
   * optional trailing action: a button (`{ label, onPress }`), or `'close'` — the Field / Origin M-Toast close (✕):
   * round chip, padding 4, 20px cross (Dark / Error / Success: white-8% chip, white ✕; Light: surface/tertiary, ink ✕)
   */
  action?: { label: string; onPress: () => void } | 'close';
  /** `action: 'close'` press handler (dismiss the toast). Without it the snackbar hides itself. */
  onClose?: () => void;
  className?: string;
  style?: CSSProperties;
}

/**
 * Snackbar — Origin Design System M-Toast (Figma wFRKiKskxZ4vjIHbDVvngJ · 4227:76702): a transient, non-blocking
 * notification. 351 wide (300–440), r14, 1px overlay border, drop-shadow 0 12 14; content p12 gap 8: asset (20–40),
 * title B14/SemiBold + subtitle B12/Regular with a 16px chevron, optional action (Dark/Error/Success: white-16% p8 r8;
 * Light: M-SecondaryNeutralButton 32h). For two or more at once use <SnackbarStack> (M-Stacked Toast).
 * Most screens show one through `useNav().toast(title, { type, subtitle, icon, action })`.
 */
export function Snackbar({ type = 'dark', title, subtitle, onSubtitlePress, asset, action, onClose, className, style }: SnackbarProps) {
  const [closed, setClosed] = useState(false);
  if (closed) return null;
  const chevronColor = type === 'light' ? 'var(--nk-snackbar-light-subtitle-fg)' : 'var(--nk-snackbar-subtitle-fg)';
  return (
    <div className={[styles.toast, className].filter(Boolean).join(' ')} data-type={type} style={style} role="status">
      <div className={styles.content}>
        {asset && <span className={styles.asset}>{asset}</span>}
        <div className={styles.texts}>
          <span className={styles.title}>{title}</span>
          {subtitle && (
            <button type="button" className={styles.subtitleRow} onClick={onSubtitlePress} disabled={!onSubtitlePress}>
              <span className={styles.subtitle}>{subtitle}</span>
              {onSubtitlePress && <OriginIcon name="chevron-right" size={16} color={chevronColor} />}
            </button>
          )}
        </div>
      </div>
      {action === 'close' ? (
        // Field Toast ActionSlot variant "close" (packages/components/src/Toast/Toast.tsx): pad 4, radius rounded, press 0.95
        <div className={styles.closeBox}>
          <Pressable className={styles.close} scale={0.95} aria-label="Dismiss" onClick={onClose ?? (() => setClosed(true))}>
            <OriginIcon name="cross" size={20} color={type === 'light' ? 'var(--nk-field-text-primary)' : 'var(--nk-field-text-on-surface-bold)'} />
          </Pressable>
        </div>
      ) : (
        action && (
          <div className={styles.actionBox}>
            <button type="button" className={styles.action} onClick={action.onPress}>
              {action.label}
            </button>
          </div>
        )
      )}
    </div>
  );
}

/**
 * M-Stacked Toast (Figma wFRKiKskxZ4vjIHbDVvngJ · 4229:76747): the front snackbar with a second card peeking 12px out
 * behind it (12px narrower each side) when two or more are queued. With `count < 2` it renders the plain snackbar.
 * The back card takes the front's type.
 */
export function SnackbarStack({ count, ...front }: SnackbarProps & { count: number }) {
  if (count < 2) return <Snackbar {...front} />;
  return (
    <div className={styles.stack}>
      <div className={`${styles.toast} ${styles.back}`} data-type={front.type ?? 'dark'} aria-hidden />
      <Snackbar {...front} className={[styles.front, front.className].filter(Boolean).join(' ')} />
    </div>
  );
}
