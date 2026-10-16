import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { useDemoStore } from '../../kit/DemoStore';
import { useNav } from '../../kit/Navigator';
import { etaFor, productById, type Product } from '../../data';
import { EtaBadge } from '../EtaBadge/EtaBadge';
import { spring } from '../../motion/presets';
import { Icon } from '../Icon/Icon';
import { Price } from '../Price/Price';
import { ProductImage } from '../ProductImage/ProductImage';
import { QuantityStepper } from '../QuantityStepper/QuantityStepper';
import { RatingPill } from '../Rating/Rating';
import { CatalogTag, CouponTag } from '../Tag/Tag';
import { Text } from '../Text/Text';
import { WishlistHeart } from '../WishlistHeart/WishlistHeart';
import { quickAdd as t, radius, spacing } from '../../foundations/tokens';
import styles from './ProductCard.module.css';

/**
 * NoonProductBoxVertical — the PLP / carousel product card.
 * Anatomy: image (≈0.8 aspect, contain) · Best Seller tag top-left · heart top-right ·
 * quick-ATC bottom-right · title 14/500 2 lines · rating pill · price row · coupon · ETA badge (Origin `_ETA`,
 * `EtaBadge` + `etaFor(product)`; small in the carousel).
 */
export function ProductCard({
  product,
  onPress,
  quickAdd = true,
  compact,
  carousel,
  width,
}: {
  product: Product;
  onPress?: () => void;
  quickAdd?: boolean;
  /** carousel variant: no coupon / delivery rows */
  compact?: boolean;
  /**
   * bappzaar home productCarousel box (NoonProductCard isCarousel in NoonOptimizedProductCarousel): r8, no hairline, image
   * 138 × 169 at 390 (`round((w − 14) · 1.361)`) with an r8 overlay (carouselImage), 24 heart circle, "+" lifted 2
   * (imageBottomWrapperCarousel), info inset 4 + marginBottom 2, price marginTop 6 with a 16/700 sign (saleCurrency),
   * "n%" discount (hideOffText), the small ETA badge at 18h (was the express flag, NoonEstimatedDelivery isCarousel). Implies `compact`.
   */
  carousel?: boolean;
  width?: number | string;
}) {
  const nav = useNav();
  const eta = etaFor(product); // Origin _ETA from the express / supermall flags and the delivery line
  const open = onPress ?? (() => nav.push('pdp/detail', { productId: product.id }));
  return (
    <motion.article className={styles.card} data-carousel={carousel || undefined} style={{ width, flexShrink: width !== undefined ? 0 : undefined }} onClick={open} whileTap={{ scale: 0.98 }} transition={spring.press}>
      <div className={styles.media}>
        <ProductImage product={product} aspect={carousel && typeof width === 'number' ? width / Math.round((width - 14) * 1.361) : 0.8} radius={carousel ? radius.r8 : 0} />
        {product.tag && (
          <span className={styles.tag}>
            <CatalogTag>{product.tag}</CatalogTag>
          </span>
        )}
        <span className={styles.heart}>
          <WishlistHeart productId={product.id} box={carousel ? 24 : undefined} />
        </span>
        {quickAdd && (
          <span className={styles.quick}>
            <QuickAdd productId={product.id} />
          </span>
        )}
      </div>
      <div className={styles.info}>
        <Text variant="productTitle" color="textProduct" lines={2} style={{ marginInlineEnd: spacing.s4 }}>
          {product.title}
        </Text>
        <RatingPill rating={product.rating} count={product.ratingCount} />
        {carousel ? (
          <span className={styles.price}>
            <Price price={product.price} was={product.was} offSuffix={false} currencySize="sale" />
          </span>
        ) : (
          <Price price={product.price} was={product.was} />
        )}
        {!compact && !carousel && product.coupon && <CouponTag>{product.coupon}</CouponTag>}
      </div>
      {carousel && eta && (
        <div className={styles.delivery}>
          <EtaBadge {...eta} size="small" />
        </div>
      )}
      {!compact && !carousel && eta && (
        <div className={styles.delivery}>
          <EtaBadge {...eta} />
        </div>
      )}
    </motion.article>
  );
}

/**
 * NoonProductBoxAddToCart: 36×36 white "+" → (tap) adds 1 and expands into a 76×36 #3866DF stepper
 * → collapses to a filled count badge after 2.5s idle. A product with sizes (`variant_overlay_url`) opens the
 * variants sheet instead (useCart → showVariantsFlyout), which adds and shows the snackbar itself.
 */
export function QuickAdd({ productId }: { productId: string }) {
  const { cart, addToCart, setQty } = useDemoStore();
  const nav = useNav();
  const qty = cart.find((l) => l.product.id === productId)?.qty ?? 0;
  const [expanded, setExpanded] = useState(false);
  const [timer, setTimer] = useState<number>();

  const bump = () => {
    clearTimeout(timer);
    setExpanded(true);
    setTimer(window.setTimeout(() => setExpanded(false), 2500));
  };

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <AnimatePresence mode="popLayout" initial={false}>
        {expanded && qty > 0 ? (
          <motion.div key="stepper" initial={{ width: t.size, opacity: 0.6 }} animate={{ width: t.expandedWidth, opacity: 1 }} exit={{ width: t.size, opacity: 0 }} transition={spring.gentle} style={{ overflow: 'hidden', borderRadius: t.radius }}>
            <QuantityStepper
              variant="filled"
              value={qty}
              onChange={(v) => {
                setQty(productId, v);
                bump();
              }}
            />
          </motion.div>
        ) : (
          <motion.button
            key="btn"
            type="button"
            className={qty ? styles.quickFilled : styles.quickBtn}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            whileTap={{ scale: t.pressScale }}
            transition={spring.bouncy}
            onClick={() => {
              if (!qty && hasSizeOverlay(productId)) return nav.sheet('pdp/variants', { productId });
              // useCartActions: a direct quick add shows no snackbar (only the variants flyout's success does — pdp/variants)
              if (!qty) addToCart(productId);
              bump();
            }}
            aria-label="Add to cart"
          >
            {qty ? <span className={styles.qty}>{qty}</span> : <Icon name="plus" size={t.iconSize} color={t.icon} />}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Fashion products pick a size first (bappzaar product boxes carry `variant_overlay_url`). */
const hasSizeOverlay = (id: string) => {
  const p = productById(id);
  return p.category === 'Fashion' && !!p.sizes?.length;
};
