import { AnimatePresence, motion } from 'motion/react';
import { ProductImage, Pressable } from '../../../components';
import { useDemoStore } from '../../../kit/DemoStore';
import { useNav } from '../../../kit/Navigator';
import { copy } from '../data';
import { wishlistTokens } from '../tokens';
import styles from '../wishlist.module.css';

/**
 * NoonWishlistV2FloatingCartButton: shown while the cart has anything in it (useNoonWishlistV2FloatingCartButton), with
 * the latest cart line's image and the cart count. SlideInDown / SlideOutDown spring (damping 16, stiffness 120, mass 0.7).
 * Tap → the Cart tab.
 */
export function ViewCartPill() {
  const nav = useNav();
  const { cart } = useDemoStore();
  const last = cart.at(-1);
  const count = cart.reduce((n, l) => n + l.qty, 0);
  return (
    <AnimatePresence>
      {last && (
        <motion.div className={styles.viewCartWrap} initial={{ y: 160 }} animate={{ y: 0 }} exit={{ y: 160 }} transition={wishlistTokens.viewCart.spring}>
          <Pressable className={styles.viewCart} onClick={() => nav.switchTab('cart')}>
            <span className={styles.viewCartImage}>
              <ProductImage product={last.product} width={32} height={42} emojiScale={0.6} fit="cover" />
            </span>
            <span className={styles.viewCartText}>
              <span className={styles.viewCartTitle}>{copy.viewCart}</span>
              <span className={styles.viewCartCount}>{copy.itemCount(count)}</span>
            </span>
          </Pressable>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
