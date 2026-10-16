import { copy } from '../data';
import styles from './DeckScreenParts.module.css';

/**
 * "Thanks for sharing" / "Rate your other orders on a single tap" — the centred title block of both past-order
 * carousels (repo src/screens/PastOrderRatingScreen.tsx + PastOrderRatingScreenB.tsx "Title"; Figma
 * KzR8dy12uT8CtgBRHHY6Qx · 8842:127140 / 8810:123358): 16px top, 18/24 Bold `textPrimary`, 6px, 14/20 Regular
 * `textSecondary` (repo text-n-icon.tertiary #666d85). Screen-only part of DeckScreen + SliderScreen.
 */
export function PastOrdersTitle() {
  return (
    <div className={styles.title}>
      <span className={styles.heading}>{copy.thanksForSharing}</span>
      <span className={styles.sub}>{copy.rateOthers}</span>
    </div>
  );
}
