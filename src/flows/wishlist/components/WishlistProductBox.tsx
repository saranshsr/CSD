import { MaskIcon, Pressable, ProductBoxVertical } from '../../../components';
import { useNav } from '../../../kit/Navigator';
import type { Product } from '../../../data';
import { palette } from '../../../foundations/palette';
import threeDots from '@assets/wishlist/vertical-three-dot-menu-collection.webp';
import shareIcon from '@assets/shared/addressV2-share-icon.webp';
import { copy } from '../data';
import styles from '../wishlist.module.css';
import { WishlistAtc } from './WishlistAtc';

/** Fashion products pick a size first: the API sends show_wishlist_atc false → "View options" (opens the PDP). */
const needsOptions = (p: Product) => p.category === 'Fashion' && !!p.sizes?.length;

/**
 * NoonProductBoxVertical with `isWishlist` (Wishlist V2 compact view): the shared PLP box with the ⋮ collection button
 * (→ NoonCollectionOptionScreen, `wishlist/options`) in place of the heart and the bottomRow: ATC / View options + share.
 */
export function WishlistProductBox({ product }: { product: Product }) {
  const nav = useNav();
  const open = () => nav.push('pdp/detail', { productId: product.id });
  return (
    <ProductBoxVertical
      product={product}
      onPress={open}
      wishlist={{
        topEnd: (
          <Pressable className={styles.collectionButton} onClick={(e) => (e.stopPropagation(), nav.sheet('wishlist/options', { productId: product.id }))} aria-label="Item options">
            <img className={styles.collectionIcon} src={threeDots} alt="" />
          </Pressable>
        ),
        footer: (
          <>
            {needsOptions(product) ? (
              <Pressable className={styles.viewOptions} onClick={open}>
                {copy.viewOptions}
              </Pressable>
            ) : (
              <WishlistAtc productId={product.id} />
            )}
            <Pressable className={styles.shareButton} onClick={() => nav.toast('Share — the share sheet is not in this demo')} aria-label="Share">
              <MaskIcon src={shareIcon} size={16} color={palette.blueGray900} />
            </Pressable>
          </>
        ),
      }}
    />
  );
}
