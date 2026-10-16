import { Screen, Skeleton } from '../../components';
import { radius } from '../../foundations/tokens';
import { wishlistTokens } from './tokens';
import styles from './wishlist.module.css';

const ROWS = 2;

/**
 * NoonWishlistV2ScreenSkeleton (while useNoonWishlistV2Home loads): header 40 × 40 · 104 × 24 · 104 × 40 (r6), three 126 × 152
 * collection tiles (r12), the 104 × 24 title, then 2 rows × 2 cards of (W − 36) / 2 × (image + 146), r12.
 */
export function WishlistLoadingScreen() {
  // image height = column width · 241 / 177 (ProductBoxVertical); 50cqw − 6 = one column of the s12-gapped grid
  const cardHeight = `calc((50cqw - 6px) * 241 / 177 + ${wishlistTokens.skeleton.cardExtra}px)`;
  return (
    <Screen background="bgSurface">
      <span role="status" className={styles.srOnly}>
        Loading wishlist
      </span>
      <div className={styles.skHeader}>
        <Skeleton width={40} height={40} radius={radius.r6} />
        <div style={{ flex: 1 }}>
          <Skeleton width={104} height={24} radius={radius.r6} />
        </div>
        <Skeleton width={104} height={40} radius={radius.r6} />
      </div>
      <div className={styles.skCollections}>
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} width={126} height={152} radius={radius.r12} style={{ flexShrink: 0 }} />
        ))}
      </div>
      <div className={styles.skTitle}>
        <Skeleton width={104} height={24} radius={radius.r6} />
      </div>
      <div className={styles.skGrid}>
        {Array.from({ length: 2 * ROWS }, (_, i) => (
          <Skeleton key={i} height={cardHeight} radius={radius.r12} />
        ))}
      </div>
    </Screen>
  );
}
