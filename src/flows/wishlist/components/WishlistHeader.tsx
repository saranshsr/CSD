import { MaskIcon, Pressable } from '../../../components';
import { useNav } from '../../../kit/Navigator';
import { palette } from '../../../foundations/palette';
import backIcon from '@assets/wishlist/noon-wishlist-v2-wishlist-back-icon.webp';
import plusIcon from '@assets/wishlist/noon-wishlist-v2-plus-wishlist-collection.webp';
import { copy } from '../data';
import styles from '../wishlist.module.css';

/**
 * NoonWishlistV2Header: bordered 40 back circle · two stacked titles · Create pill.
 * `progress` (0 → 1) is useNoonWishlistV2HeaderAnimation's interpolation of scrollY over [bottom − 8, bottom + 8] of the
 * "All Saved Items" heading: "Wishlist" fades out moving to −4, "All Saved Items" fades in from +4, the Create pill fades
 * with "Wishlist". No timing: it follows the scroll, as in the app.
 */
export function WishlistHeader({ progress = 0, showCreate = true }: { progress?: number; showCreate?: boolean }) {
  const nav = useNav();
  const wishlistOpacity = 1 - progress;
  return (
    <div className={styles.header}>
      <div className={styles.headerRow}>
        <Pressable className={styles.backButton} onClick={nav.back} aria-label="Back">
          <MaskIcon src={backIcon} size={20} color={palette.black} />
        </Pressable>
        <span className={styles.titleSlot}>
          <span className={styles.title} style={{ opacity: wishlistOpacity, transform: `translateY(${-4 * progress}px)` }} aria-hidden={progress === 1}>
            {copy.title}
          </span>
          <span className={styles.title} style={{ opacity: progress, transform: `translateY(${4 * wishlistOpacity}px)` }} aria-hidden={progress === 0}>
            {copy.allSavedItems}
          </span>
        </span>
        {showCreate && (
          <span style={{ opacity: wishlistOpacity, pointerEvents: wishlistOpacity === 0 ? 'none' : undefined }}>
            <Pressable className={styles.createPill} onClick={() => nav.toast('Create collection — the naming sheet is not in this demo')}>
              <MaskIcon src={plusIcon} size={12} color={palette.white} className={styles.createIcon} />
              {copy.create}
            </Pressable>
          </span>
        )}
      </div>
    </div>
  );
}
