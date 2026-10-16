import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import freeDelivery from '@assets/products/iphone-17-pro/nudge-free-delivery.webp';
import lowStock from '@assets/products/iphone-17-pro/nudge-low-stock.webp';
import lowestPrice from '@assets/products/iphone-17-pro/nudge-lowest-price.webp';
import rank from '@assets/products/iphone-17-pro/nudge-rank.webp';
import sellingFast from '@assets/products/iphone-17-pro/nudge-selling-fast.webp';
import soldRecently from '@assets/products/iphone-17-pro/nudge-sold-recently.webp';
import { CatalogTag, Price, ProductImage, QuickAdd, RatingPill, Text, WishlistHeart } from '../../../components';
import { useNav } from '../../../kit/Navigator';
import type { Product, ProductNudge } from '../../../data';
import { spring } from '../../../motion/presets';
import { pdpTokens } from '../tokens';
import styles from '../pdp.module.css';
import { useReduceMotion } from '../../../motion/reducedMotion';

/** Live nudge icons (mpcms assets on the page), by ProductNudge.kind. */
export const nudgeIcons: Record<ProductNudge['kind'], string> = { rank, lowestPrice, freeDelivery, lowStock, sellingFast, soldRecently, info: lowestPrice };

/**
 * NoonProductBoxVertical, carousel variant (productBoxV2: r10, 0.5px lightGray, 144 wide) with the
 * NoonNudgeTag ticker under the price (`carouselNudge`: 13/16 slateBlueGray, 14px icon), which is where
 * the API's "#38 in Smartphones" / "Lowest price in a year" / "Only 1 left in stock" nudges render.
 * PDP-local until the shared ProductCard renders `product.nudges` (MAPPING.md → Shared follow-ups).
 */
export function RecoCard({ product }: { product: Product }) {
  const nav = useNav();
  return (
    <motion.article className={styles.recoCard} style={{ width: pdpTokens.recoCardWidth() }} onClick={() => nav.push('pdp/detail', { productId: product.id })} whileTap={{ scale: 0.98 }} transition={spring.press}>
      <div className={styles.recoMedia}>
        <ProductImage product={product} aspect={0.8} />
        {product.tag && (
          <span className={styles.recoTag}>
            <CatalogTag>{product.tag}</CatalogTag>
          </span>
        )}
        <span className={styles.recoHeart}>
          <WishlistHeart productId={product.id} />
        </span>
        <span className={styles.recoQuick}>
          <QuickAdd productId={product.id} />
        </span>
      </div>
      <div className={styles.recoInfo}>
        <Text variant="productTitle" color="textProduct" lines={2}>
          {product.brand && product.brand !== 'Generic' && !product.title.startsWith(product.brand) ? `${product.brand} ${product.title}` : product.title}
        </Text>
        {product.rating > 0 && <RatingPill rating={product.rating} count={product.ratingCount} />}
        <Price price={product.price} was={product.was} />
        {product.nudges && product.nudges.length > 0 && <CardNudges nudges={product.nudges} />}
      </div>
    </motion.article>
  );
}

/** NoonNudgeTag (carousel): one nudge at a time, enter 300 / hold 1000 / exit 450 ms (NoonNudgeTag defaults). */
function CardNudges({ nudges }: { nudges: ProductNudge[] }) {
  const { card } = pdpTokens.nudge;
  const [i, setI] = useState(0);
  const reduce = useReduceMotion();
  useEffect(() => {
    // reduced motion: the first nudge stays (no auto-rotation)
    if (nudges.length < 2 || reduce) return;
    const t = setInterval(() => setI((n) => (n + 1) % nudges.length), card.enterMs + card.holdMs + card.exitMs);
    return () => clearInterval(t);
  }, [nudges.length, card.enterMs, card.holdMs, card.exitMs, reduce]);
  const n = nudges[i];
  return (
    <div className={styles.cardNudge}>
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={i}
          className={styles.cardNudgeItem}
          initial={{ y: card.offset }}
          animate={{ y: 0, transition: { duration: card.enterMs / 1000, ease: 'linear' } }}
          exit={{ y: -card.offset, transition: { duration: card.exitMs / 1000, ease: 'linear' } }}
        >
          <img alt="" src={nudgeIcons[n.kind]} className={styles.cardNudgeIcon} />
          <span className={styles.cardNudgeText}>{n.text}</span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
