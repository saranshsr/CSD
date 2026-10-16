import { MaskIcon, Pressable, ProductImage } from '../../components';
import { useDemoStore } from '../../kit/DemoStore';
import { useNav } from '../../kit/Navigator';
import type { ScreenProps } from '../../kit/types';
import { productById } from '../../data';
import { palette } from '../../foundations/palette';
import arrowIcon from '@assets/wishlist/noon-wishlist-v2-arrow-right-option.webp';
import copyIcon from '@assets/wishlist/noon-wishlist-v2-copy-icon.webp';
import deleteIcon from '@assets/shared/address-v2-delete.webp'; // = noon-wishlist-v2-delete-icon (same file)
import { collections, copy } from './data';
import styles from './wishlist.module.css';

interface Option {
  title: string;
  icon: string;
  color: string;
  onPress: () => void;
}

/**
 * NoonWishlistV2CollectionOptionScreen (the ⋮ on a wishlist product box, All Saved Items context): an antiFlashWhite r24
 * card of white r16 sections — "Organise" → Add to collection (only with ≥ 1 collection), then Remove item (dangerRed).
 * Remove: fullDeleteItems → snackbar "Removed from Wishlist" with the product image → close.
 */
export function OptionsSheet({ params }: ScreenProps<{ productId?: string }>) {
  const nav = useNav();
  const { wishlist, toggleWishlist } = useDemoStore();
  const product = productById(params.productId ?? wishlist[0] ?? 'p1');

  const organise: Option[] = [
    { title: copy.addToCollection, icon: copyIcon, color: palette.blueGray900, onPress: () => (nav.back(), nav.toast('Add to collection — the move / copy screen is not in this demo')) },
  ];
  const remove: Option[] = [
    {
      title: copy.removeItem,
      icon: deleteIcon,
      color: palette.dangerRed,
      onPress: () => {
        if (wishlist.includes(product.id)) toggleWishlist(product.id);
        nav.back();
        // NoonSnackBar title + titleBoldSuffix → one M-Toast title (nav.toast takes plain text)
        nav.toast(`${copy.removedFromPrefix}${copy.title}`, { icon: <ProductImage product={product} width={32} height={32} radius={6} emojiScale={0.6} /> });
      },
    },
  ];
  const sections = [...(collections.length ? [{ title: copy.organise, options: organise }] : []), { title: '', options: remove }];

  return (
    <div className={styles.optionsCard}>
      {sections.map((section, i) => (
        <div key={section.title || `section-${i}`} className={styles.optionsSection}>
          {section.title && <span className={styles.optionsSectionTitle}>{section.title}</span>}
          {section.options.map((o) => (
            <Pressable key={o.title} className={styles.optionsItem} onClick={o.onPress} style={{ color: o.color }}>
              <span className={styles.optionsLeading}>
                <MaskIcon src={o.icon} size={20} color={o.color} />
                {o.title}
              </span>
              <MaskIcon src={arrowIcon} size={20} color={o.color === palette.dangerRed ? o.color : palette.bluishGrey} className={styles.optionsArrow} />
            </Pressable>
          ))}
        </div>
      ))}
    </div>
  );
}
