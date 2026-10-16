import type { ReactNode } from 'react';
import { OriginIcon, Pressable } from '../../../components';
import { useNav } from '../../../kit/Navigator';
import { haptic } from '../../../motion/haptics';
import styles from './ReviewHeader.module.css';

export interface ReviewHeaderProps {
  /** centred title ("Your review", "Rate your past orders"); string → 16/24 Bold */
  title?: ReactNode;
  /** 'semibold' = RatePastOrders' 16/22 SemiBold title */
  titleWeight?: 'bold' | 'semibold';
  /** leading circle: 'back' (chevron-left) · 'close' (cross) · 'none'. Default 'back' */
  leading?: 'back' | 'close' | 'none';
  /** leading tap; default nav.back */
  onLeading?: () => void;
  /** replaces the title slot (e.g. the docked ReviewProductHeader) */
  center?: ReactNode;
  right?: ReactNode;
  /** 1px `border` hairline under the bar (NewReview editing state) */
  bordered?: boolean;
  className?: string;
}

/**
 * ReviewHeader — R&R top bar (repo PageHeader in ManualReview / ReviewDraft A / B / AILoader, the X header of
 * NewReview / PastOrderRating / RatePastOrders; Figma M-PageHeader 6229:17795). Transparent (the page gradient
 * shows through), includes the top inset, 56h. The leading button is the kit 40px icon-button look (white, 1px
 * border — `borderSubtle` in this flow) with an Origin `chevron-left` / `cross`; `tap` haptic.
 * The kit `Header` has no leading close, which is why this exists; screens with a plain back + title can still use
 * `<Header variant="transparent">`.
 */
export function ReviewHeader({ title, titleWeight = 'bold', leading = 'back', onLeading, center, right, bordered, className }: ReviewHeaderProps) {
  const nav = useNav();
  return (
    <div className={[styles.header, bordered && styles.bordered, className].filter(Boolean).join(' ')}>
      <div className={styles.row}>
        {leading !== 'none' && (
          <Pressable
            className={styles.lead}
            aria-label={leading === 'close' ? 'Close' : 'Back'}
            onClick={() => {
              haptic('tap');
              (onLeading ?? nav.back)();
            }}
          >
            <OriginIcon name={leading === 'close' ? 'cross' : 'chevron-left'} size={20} className={leading === 'back' ? 'nk-flip-rtl' : undefined} />
          </Pressable>
        )}
        {(center || title) && (
          <div className={styles.center}>
            {center ?? (typeof title === 'string' ? <span className={styles.title} data-weight={titleWeight}>{title}</span> : title)}
          </div>
        )}
        {right && <div className={styles.right}>{right}</div>}
      </div>
    </div>
  );
}
