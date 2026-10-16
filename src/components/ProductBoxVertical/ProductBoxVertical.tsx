import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState, type ReactNode, type UIEvent } from 'react';
import { useNav } from '../../kit/Navigator';
import { currency, etaFor, type Product, type ProductNudge } from '../../data';
import { EtaBadge } from '../EtaBadge/EtaBadge';
import freeDelivery from '@assets/products/iphone-17-pro/nudge-free-delivery.webp';
import lowStock from '@assets/products/iphone-17-pro/nudge-low-stock.webp';
import lowestPrice from '@assets/products/iphone-17-pro/nudge-lowest-price.webp';
import rank from '@assets/products/iphone-17-pro/nudge-rank.webp';
import sellingFast from '@assets/products/iphone-17-pro/nudge-selling-fast.webp';
import soldRecently from '@assets/products/iphone-17-pro/nudge-sold-recently.webp';
import { Icon } from '../Icon/Icon';
import { QuickAdd } from '../ProductCard/ProductCard';
import { ProductImage } from '../ProductImage/ProductImage';
import { compact, starColor } from '../Rating/Rating';
import { CatalogTag } from '../Tag/Tag';
import { WishlistHeart } from '../WishlistHeart/WishlistHeart';
import styles from './ProductBoxVertical.module.css';

/** NoonNudgeTag icons by ProductNudge.kind (the mpcms assets the API sends). */
const nudgeIcons: Record<ProductNudge['kind'], string> = { rank, lowestPrice, freeDelivery, lowStock, sellingFast, soldRecently, info: lowestPrice };

/** ProductBoxHelper.getPricePrecision(price, isPLP) + Price isCompact: ≥ 999.99 → no decimals; otherwise 2, dropped for whole numbers. */
const plpPrice = (n: number) =>
  n >= 999.99
    ? Math.round(n).toLocaleString('en-US')
    : Number.isInteger(n)
      ? n.toLocaleString('en-US')
      : n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/**
 * NoonProductBoxVertical, PLP layout: the search / listing result card, ported 1:1 from bappzaar
 * (`marketplaces/noon/components/NoonProductBox/NoonProductBoxVertical`, rendered by `ProductBox` with `isPLP`).
 * Anatomy, top to bottom: 177 × 241 image box (contain, 2% black overlay; > 1 image → paged slider with the pill pager),
 * "Best Seller" / catalog tag top-left, favourite 24 at 4 / 4, quick ATC 36 at the bottom-end · "{brand} {name}" 14/500 2 lines ·
 * rating pill (star first) · price row (sale 16 bold, struck was, "n% OFF") · nudge ticker · coupon tag · express flag + delivery line.
 * No press feedback (`activeOpacity={1}`), as in the app.
 *
 * `wishlist` = `isWishlist` on Wishlist V2 (`isWishlistCompactView`): no top tags, quick ATC, nudges or coupon; `topEnd`
 * replaces the favourite (NoonProductBoxCollectionButton) and `footer` is the bottomRow (marginTop 10, px 8, gap 8).
 */
export function ProductBoxVertical({
  product,
  onPress,
  quickAdd = true,
  wishlist,
}: {
  product: Product;
  onPress?: () => void;
  quickAdd?: boolean;
  /** Wishlist V2 compact view: `topEnd` in place of the heart, `footer` under the delivery row */
  wishlist?: { topEnd?: ReactNode; footer?: ReactNode };
}) {
  const nav = useNav();
  const open = onPress ?? (() => nav.push('pdp/detail', { productId: product.id }));
  const eta = etaFor(product); // Origin _ETA (replaces the express flag + delivery line)
  const images = (product.images ?? []).slice(0, 5);
  const name = product.title.toLowerCase().startsWith(product.brand.toLowerCase()) ? product.title : `${product.brand} ${product.title}`;
  const off = product.was && product.was > product.price ? Math.round(((product.was - product.price) / product.was) * 100) : 0;

  return (
    <article className={styles.container} data-testid="product_box" onClick={open}>
      <div className={styles.imageWrapper}>
        {images.length > 1 ? (
          <ImageSlider product={product} images={images} />
        ) : (
          <div className={styles.imageFill}>
            <ProductImage product={product} height="100%" />
            <span className={styles.overlay} />
          </div>
        )}

        <div className={styles.imageTop}>
          <div className={styles.topTags}>{!wishlist && product.tag && <CatalogTag>{product.tag}</CatalogTag>}</div>
          <div className={styles.topRight}>{wishlist ? wishlist.topEnd : <WishlistHeart productId={product.id} size={20} />}</div>
        </div>

        <div className={styles.imageBottom}>
          {quickAdd && !wishlist && (
            <span className={styles.quickAtc}>
              <QuickAdd productId={product.id} />
            </span>
          )}
        </div>
      </div>

      <div className={styles.info}>
        <span className={styles.name}>{name}</span>

        {product.rating > 0 && (
          <span className={styles.rating}>
            <span className={styles.ratingScore}>
              <Icon name="star" size={11} color={starColor(product.rating)} fill={starColor(product.rating)} strokeWidth={0} />
              {product.rating}{' '}
            </span>
            {product.ratingCount > 0 && <span className={styles.ratingCount}>({compact(product.ratingCount)})</span>}
          </span>
        )}

        <div className={styles.price}>
          <span className={styles.sale}>
            {currency}&nbsp;{plpPrice(product.price)}
          </span>
          {off > 0 && (
            <span className={styles.discountRow}>
              <span className={styles.was}>{plpPrice(product.was!)}</span>
              <span className={styles.off}>{off}% OFF</span>
            </span>
          )}
        </div>

        {!wishlist && product.nudges && product.nudges.length > 0 && <NudgeTicker nudges={product.nudges} />}

        {!wishlist && product.coupon && (
          <div className={styles.coupon}>
            <span className={styles.couponTag}>{product.coupon}</span>
          </div>
        )}
      </div>

      <div className={styles.flagRow}>
        <div className={`${styles.flagDelivery} ${wishlist ? styles.flagDeliveryFixed : ''}`}>
          {eta && <EtaBadge {...eta} />}
        </div>
      </div>

      {wishlist?.footer && (
        <div className={styles.bottomRow} onClick={(e) => e.stopPropagation()}>
          {wishlist.footer}
        </div>
      )}
    </article>
  );
}

/** NoonImageSlider: paged image strip (taps still open the PDP) with the PillPager (dots 6 → 2 px by distance from the current page). */
function ImageSlider({ product, images }: { product: Product; images: string[] }) {
  const [page, setPage] = useState(0);
  const onScroll = (e: UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const i = Math.round(Math.abs(el.scrollLeft) / el.clientWidth);
    if (i !== page) setPage(i);
  };
  return (
    <div className={styles.imageFill}>
      <div className={styles.slider} onScroll={onScroll}>
        {images.map((src) => (
          <div key={src} className={styles.slide}>
            <ProductImage product={{ ...product, image: src }} height="100%" />
            <span className={styles.overlay} />
          </div>
        ))}
      </div>
      <div className={styles.pager}>
        <div className={styles.pagerInner}>
          {images.map((src, i) => {
            const size = Math.max(2, 6 - Math.abs(i - page));
            return <span key={src} className={`${styles.dot} ${i === page ? styles.dotActive : ''}`} style={{ width: size, height: size }} />;
          })}
        </div>
      </div>
    </div>
  );
}

/** NoonNudgeTag ticker: one nudge at a time, enters from +18 (300 ms), holds 1 s, leaves to −18 (450 ms), linear, looping. */
function NudgeTicker({ nudges }: { nudges: ProductNudge[] }) {
  const [i, setI] = useState(0);
  const first = useRef(true);
  const many = nudges.length > 1;
  useEffect(() => {
    if (!many) return;
    // the first change waits enter + hold; later ones also wait for the previous exit (mode="wait")
    const t = window.setTimeout(() => setI((n) => (n + 1) % nudges.length), first.current ? 1300 : 1750);
    first.current = false;
    return () => clearTimeout(t);
  }, [i, many, nudges.length]);
  const n = nudges[i] ?? nudges[0];
  return (
    <div className={styles.nudges}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={i}
          className={styles.nudge}
          initial={{ y: 18 }}
          animate={{ y: 0, transition: { duration: 0.3, ease: 'linear' } }}
          exit={{ y: -18, transition: { duration: 0.45, ease: 'linear' } }}
        >
          <img className={styles.nudgeIcon} src={nudgeIcons[n.kind]} alt="" />
          <span className={styles.nudgeText}>{n.text}</span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
