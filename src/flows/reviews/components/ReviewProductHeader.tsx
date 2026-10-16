import type { ReactNode } from 'react';
import { reviewsMotion, reviewsTokens } from '../tokens';
import { StarRatingInput } from './StarRatingInput';
import styles from './ReviewProductHeader.module.css';

export interface ReviewProductHeaderProps {
  product: { image: string; name: string };
  rating: number;
  /** tappable stars (rate / docked); omit for read-only (compact) */
  onRate?: (n: number) => void;
  /**
   * 'rate'    — ManualReview (Figma 6229:27913): 56×64 r12 tile · name 16/24 SemiBold `textPrimary` · 24px stars, gap 4
   * 'compact' — ReviewDraftB card (Figma 7159:44106): 48×64 r8 tile · name 14/20 Medium `textMuted` · 24px stars, gap 2, pop-in
   * 'docked'  — nav-bar product (NewReview 8194-101662 docked state, RatePastOrders): 28×32 r8 tile + 24px stars, centred
   */
  variant?: 'rate' | 'compact' | 'docked';
  /** extra content under the stars (rarely needed) */
  children?: ReactNode;
  className?: string;
}

/**
 * ReviewProductHeader — product image + name + star rating, the block every R&R screen starts with (repo
 * src/screens/ManualReviewScreen.tsx ProductHeader, ReviewDraftScreenB.tsx ReviewCardB header,
 * RatePastOrdersScreen.tsx docked product). The image tile is white with a 1px `border` hairline (repo #ececec,
 * snapped). Margins are the caller's (repo: 12px inline). NewReview's scroll-driven MorphingHeader interpolates
 * between 'rate' and 'docked' itself; it can reuse StarRatingInput + these metrics (reviewsTokens.headerImage /
 * dockedImage).
 */
export function ReviewProductHeader({ product, rating, onRate, variant = 'rate', children, className }: ReviewProductHeaderProps) {
  const img = variant === 'rate' ? reviewsTokens.headerImage : variant === 'compact' ? reviewsTokens.compactImage : reviewsTokens.dockedImage;
  const stars =
    variant === 'compact' ? (
      <StarRatingInput value={rating} onChange={onRate} gap={2} appear={onRate ? undefined : reviewsMotion.starAppearB} />
    ) : (
      <StarRatingInput value={rating} onChange={onRate} gap={4} label={`Rate ${product.name}`} />
    );
  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')} data-variant={variant}>
      <div className={styles.image} style={{ width: img.width, height: img.height }}>
        <img src={product.image} alt="" />
      </div>
      {variant === 'docked' ? (
        stars
      ) : (
        <div className={styles.text}>
          <span className={styles.name}>{product.name}</span>
          {stars}
          {children}
        </div>
      )}
    </div>
  );
}
