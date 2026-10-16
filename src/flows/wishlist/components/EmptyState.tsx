import { Lottie, MaskIcon, Pressable, Screen } from '../../../components';
import { useNav } from '../../../kit/Navigator';
import { palette } from '../../../foundations/palette';
import emptyLottie from '@assets/wishlist/noon-wishlist-v2-wishlist-empty-mobile.lottie';
import ctaIcon from '@assets/wishlist/noon-wishlist-v2-stw-close.webp';
import { copy } from '../data';
import styles from '../wishlist.module.css';
import { WishlistHeader } from './WishlistHeader';

/**
 * NoonWishlistV2Empty: the looping noonWishlistV2EmptyLottie (W × W / 0.75) with the text block at 55 % of its height.
 * Used full screen by `EmptyWishlist` and as the list's ListEmptyComponent (collections exist, no saved items).
 */
export function EmptyState() {
  const nav = useNav();
  return (
    <div className={styles.emptyArt}>
      <Lottie src={emptyLottie} loop style={{ width: '100%', height: '100%' }} />
      <div className={styles.emptyText}>
        <h2 className={styles.emptyTitle}>{copy.emptyTitle}</h2>
        <p className={styles.emptySubtitle}>{copy.emptySubtitle}</p>
        <Pressable className={styles.emptyCta} onClick={() => nav.push('search/search')}>
          <MaskIcon src={ctaIcon} size={16} color={palette.white} className={styles.emptyCtaIcon} />
          {copy.startAddingItems}
        </Pressable>
      </div>
    </div>
  );
}

/** NoonWishlistV2Screen `isEmpty` branch: the header floats over the top (Create still shown), NoonWishlistV2Empty centred in the screen. */
export function EmptyWishlist() {
  return (
    <Screen header={<WishlistHeader />} overlayHeader background="bgSurface" safeTop contentStyle={{ display: 'flex', paddingBottom: 0 }}>
      <div className={styles.emptyBody}>
        <EmptyState />
      </div>
    </Screen>
  );
}
