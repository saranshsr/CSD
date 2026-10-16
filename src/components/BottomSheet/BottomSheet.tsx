import type { CSSProperties, ReactNode } from 'react';
import { useSheet } from '../../kit/sheet';
import { ActionBar, type ActionBarLayout, type ActionBarTone } from '../ActionBar/ActionBar';
import { Button, type ButtonProps } from '../Button/Button';
import { OriginIcon } from '../Icon/OriginIcon';
import { Pressable } from '../Pressable/Pressable';
import styles from './BottomSheet.module.css';

/**
 * Slots of the default bottom sheet — Origin Design System M-BottomSheet (Figma wFRKiKskxZ4vjIHbDVvngJ · 3207:15).
 * The navigator draws the chrome for a `presentation: 'sheet'` screen (scrim, grabber above the sheet, 12px floating
 * inset, r16 corners, max 680); the screen renders only these three slots, in this order:
 *
 *   <SheetHeader title="Delivery options" />
 *   <SheetBody>…any content: rows, forms, Lottie, illustration…</SheetBody>
 *   <SheetFooter primary={{ label: 'Confirm', onPress }} />
 *
 * Rule: a sheet with a grabber has no close button. <SheetHeader> shows the close (X) only when the screen sets
 * `sheet: { grabber: false }` (or `onClose` is passed explicitly).
 */

/** Header slot: 48 high, title (+ optional subtitle), optional leading / trailing; close (X) only without a grabber. */
export function SheetHeader({
  title,
  subtitle,
  leading,
  trailing,
  align = 'start',
  onClose,
  children,
}: {
  title?: ReactNode;
  subtitle?: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
  align?: 'start' | 'center';
  /** override the close action; ignored on a sheet with a grabber */
  onClose?: () => void;
  /** fully custom header content (replaces title / subtitle) */
  children?: ReactNode;
}) {
  const sheet = useSheet();
  const close = sheet?.grabber ? undefined : (onClose ?? sheet?.dismiss);
  return (
    <div className={styles.header} data-align={align}>
      {leading}
      <div className={styles.headerText}>
        {children ?? (
          <>
            {title && <div className={styles.title}>{title}</div>}
            {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
          </>
        )}
      </div>
      {trailing}
      {close && (
        <Pressable className={styles.close} onClick={close} aria-label="Close">
          <OriginIcon name="cross" size={24} color="var(--nk-sheet-close-fg)" />
        </Pressable>
      )}
    </div>
  );
}

/** Body slot: 100% custom content; scrolls inside the sheet once the sheet reaches its max height. */
export function SheetBody({ children, inset = true, className, style }: { children: ReactNode; inset?: boolean; className?: string; style?: CSSProperties }) {
  return (
    <div className={['nk-scroll', styles.body, inset && styles.inset, className].filter(Boolean).join(' ')} style={style}>
      {children}
    </div>
  );
}

type Action = { label: ReactNode; onPress: () => void } & Pick<ButtonProps, 'disabled' | 'loading' | 'icon' | 'iconRight'>;

/**
 * Footer: M-StackedActionBar — optional top slot, primary button (H52, r12), optional secondary, optional bottom slot.
 * Opt in to the Field M-ActionBar (`<ActionBar>`, Field `ActionBar/ActionBar.tsx`) by passing `layout` and/or `tone`:
 * `single | stacked | split | leadingTrailing` × `action | neutral`, with `leading` for split / leadingTrailing.
 * `children` / `bottom` then render under the bar. Without `layout` / `tone` the output is unchanged.
 */
export function SheetFooter({
  primary,
  secondary,
  top,
  bottom,
  children,
  layout,
  tone,
  leading,
}: {
  primary?: Action;
  secondary?: Action;
  top?: ReactNode;
  bottom?: ReactNode;
  children?: ReactNode;
  /** opt-in Field M-ActionBar layout (default when only `tone` is given: `stacked` if a secondary is set, else `single`) */
  layout?: ActionBarLayout;
  /** opt-in Field M-ActionBar tone (default `action`) */
  tone?: ActionBarTone;
  /** Field ActionBar leading slot (`split` / `leadingTrailing`) */
  leading?: ReactNode;
}) {
  if (layout || tone) {
    return (
      <>
        <ActionBar layout={layout ?? (secondary ? 'stacked' : 'single')} tone={tone} primary={primary} secondary={secondary} top={top} leading={leading} inset={false} />
        {(children || bottom) && (
          <div className={styles.footerExtra}>
            {children}
            {bottom && <div className={styles.slot}>{bottom}</div>}
          </div>
        )}
      </>
    );
  }
  return (
    <div className={styles.footer}>
      {top && <div className={styles.slot}>{top}</div>}
      {children}
      {primary && (
        <Button variant="bright" size="lg" block disabled={primary.disabled} loading={primary.loading} icon={primary.icon} iconRight={primary.iconRight} onClick={primary.onPress}>
          {primary.label}
        </Button>
      )}
      {secondary && (
        <Button variant="secondary" size="lg" block className={styles.secondary} disabled={secondary.disabled} loading={secondary.loading} icon={secondary.icon} iconRight={secondary.iconRight} onClick={secondary.onPress}>
          {secondary.label}
        </Button>
      )}
      {bottom && <div className={styles.slot}>{bottom}</div>}
    </div>
  );
}
