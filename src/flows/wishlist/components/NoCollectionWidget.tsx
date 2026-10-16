import { MaskIcon, Pressable } from '../../../components';
import { useNav } from '../../../kit/Navigator';
import { palette } from '../../../foundations/palette';
import background from '@assets/wishlist/noon-wishlist-v2-wishlist-collection-overlay-background.webp';
import closeIcon from '@assets/wishlist/noon-wishlist-v2-close-icon.webp';
import emptyArt from '@assets/wishlist/noon-wishlist-v2-wishlist-empty.webp';
import plusIcon from '@assets/wishlist/noon-wishlist-v2-plus-wishlist-collection.webp';
import { copy } from '../data';
import styles from '../wishlist.module.css';

/** NoonWishlistV2NoCollectionWidget: shown in place of the collections row when there are none; the X dismisses it for the session. */
export function NoCollectionWidget({ onDismiss }: { onDismiss: () => void }) {
  const nav = useNav();
  return (
    <div className={styles.noCollection}>
      <img className={styles.noCollectionBg} src={background} alt="" />
      <Pressable className={styles.noCollectionClose} onClick={onDismiss} aria-label="Dismiss">
        <MaskIcon src={closeIcon} size={8} color={palette.blueGray900} />
      </Pressable>
      <div className={styles.noCollectionContent}>
        {/* intrinsic size of the @3x asset (517 × 396) */}
        <img className={styles.noCollectionArt} src={emptyArt} alt="" width={172} height={132} />
        <div className={styles.noCollectionText}>
          <span className={styles.noCollectionTitle}>{copy.organiseShareNotify}</span>
          <Pressable className={styles.noCollectionCta} onClick={() => nav.toast('Create collection — the naming sheet is not in this demo')}>
            {/* intrinsic size of the @3x asset (34 px) */}
            <MaskIcon src={plusIcon} size={11} color={palette.primaryBlue} />
            {copy.createNewCollection}
          </Pressable>
        </div>
      </div>
    </div>
  );
}
