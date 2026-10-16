import { Asset, type IconSize } from './Asset';
import styles from '../pdp.module.css';

/** NoonReviewUtil.noonReviewColorV2 → kit star tokens (≤1.9 #F36302 · ≤2.9 #F8B200 · ≤3.9 #05AF25 · ≤5 #006300). */
export const starTint = (v: number) =>
  v <= 1.9 ? 'var(--nk-color-star-low)' : v <= 2.9 ? 'var(--nk-color-star-mid)' : v <= 3.9 ? 'var(--nk-color-star-good)' : v <= 5 ? 'var(--nk-color-star-great)' : 'var(--nk-color-border)';

/** NoonStarsRating: noonReviewStarEmpty tinted; partial star clipped to the fraction; empty = lightGreyColor. */
export function Stars({ rating, size, max = 5 }: { rating: number; size: IconSize; max?: number }) {
  const floor = Math.floor(rating);
  const tint = starTint(rating);
  return (
    <span className={styles.stars} aria-label={`${rating} out of ${max}`}>
      {Array.from({ length: max }).map((_, i) => {
        const n = i + 1;
        const partial = n > floor && n - rating < 1;
        return (
          <span key={i} className={styles.star}>
            <Asset name="reviewStar" size={size} tint={n <= floor ? tint : 'var(--nk-color-border)'} />
            {partial && (
              <span className={styles.starFill} style={{ width: `${Math.round((rating - floor) * 100)}%` }}>
                <Asset name="reviewStar" size={size} tint={tint} />
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
}
