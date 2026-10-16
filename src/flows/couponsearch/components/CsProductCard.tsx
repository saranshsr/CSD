import { motion } from 'motion/react';
import { memo } from 'react';
import { ProductImage, WishlistHeart } from '../../../components';
import { currency, discountPct, type Product } from '../../../data';
import { useDemoStore } from '../../../kit/DemoStore';
import { useNav } from '../../../kit/Navigator';
import { spring } from '../../../motion/presets';
import plusIcon from '@assets/couponsearch/card-plus.svg';
import starIcon from '@assets/couponsearch/card-star.svg';
import lowestIcon from '@assets/couponsearch/card-lowest-price.svg';
import boltIcon from '@assets/couponsearch/eta-bolt.svg';
import caretIcon from '@assets/couponsearch/eta-caret.svg';
import { cardExtras, copy, etaValue } from '../data';
import styles from '../card.module.css';

const price = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2));
const count = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K` : String(n));

/**
 * The team file's PLP product card ("Product card", 170.5 wide at 375): 0.5px #F2F3F7 r12 frame; 3:4 image box on a
 * 3% blue wash with the pager dots, Best Seller tag (r-br 10), 24 wishlist heart, colour swatches + count and the
 * 32 r8 add button; optional Mega Deal strip; then title 14 / 18 Medium (2 lines), rating pill, price row (15 Bold ·
 * struck 12 · discount 12 SemiBold emerald), unit price chip, "Lowest price in 30 days", coupon tags ("Extra 10% Off",
 * "+3") and the "Get in 1 Hr 15 Min" supermall ETA. Tapping the card opens the PDP.
 */
export const CsProductCard = memo(function CsProductCard({ product: p }: { product: Product }) {
  const nav = useNav();
  const { addToCart } = useDemoStore();
  const x = cardExtras[p.id] ?? {};
  const off = discountPct(p);
  return (
    <motion.article className={styles.card} onClick={() => nav.push('pdp/detail', { productId: p.id })} whileTap={{ scale: 0.98 }} transition={spring.press} data-testid="cs-card">
      <div className={styles.media}>
        <div className={styles.photo}>
          <ProductImage product={p} aspect={3 / 4} />
        </div>
        <span className={styles.dots} aria-hidden>
          <i data-on />
          <i />
          <i data-s="4" />
          <i data-s="2" />
        </span>
        {p.tag && <span className={styles.tag}>{p.tag}</span>}
        <span className={styles.heart}>
          <WishlistHeart productId={p.id} size={22} box={24} />
        </span>
        <span className={styles.swatches} aria-hidden>
          <span className={styles.swatchStack}>
            <i data-c="r" />
            <i data-c="g" />
            <i data-c="b" />
          </span>
          <span className={styles.swatchCount}>4</span>
        </span>
        <motion.button
          type="button"
          className={styles.add}
          aria-label="Add to cart"
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation();
            addToCart(p.id);
            nav.toast('Added to cart');
          }}
        >
          <img src={plusIcon} alt="" width={24} height={24} />
        </motion.button>
      </div>
      {x.megaDeal && <div className={styles.deal}>{copy.card.megaDeal}</div>}
      <div className={styles.body}>
        <div className={styles.titleBlock}>
          <p className={styles.title}>
            {p.brand} {p.title}
          </p>
          <span className={styles.rating}>
            <img src={starIcon} alt="" width={12} height={11.5} />
            {p.rating.toFixed(1)} ({count(p.ratingCount)})
          </span>
        </div>
        <div className={styles.pricing}>
          <div className={styles.priceRow}>
            <span className={styles.sale}>
              {currency}
              {price(p.price)}
            </span>
            {p.was && <s className={styles.was}>{price(p.was)}</s>}
            {off > 0 && <span className={styles.off}>{off}%</span>}
          </div>
          {x.unit && (
            <span className={styles.unit}>
              {x.unit[0]}
              <i aria-hidden />
              {currency}
              {x.unit[1]}
            </span>
          )}
          <span className={styles.nudge}>
            <img src={lowestIcon} alt="" width={14} height={14} />
            {copy.card.lowestPrice}
          </span>
        </div>
        {p.coupon && (
          <div className={styles.coupons}>
            <span className={styles.coupon}>{p.coupon}</span>
            {x.more ? <span className={styles.coupon}>+{x.more}</span> : null}
          </div>
        )}
        <span className={styles.eta}>
          <span className={styles.etaPill}>
            <img src={boltIcon} alt="" width={13} height={13} />
            <span>
              {copy.card.getIn} <b>{etaValue}</b>
            </span>
            <img src={caretIcon} alt="" width={13} height={13} className={styles.etaCaret} />
          </span>
          <span className={styles.etaShade} aria-hidden />
        </span>
      </div>
    </motion.article>
  );
});
