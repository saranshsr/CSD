import { motion } from 'motion/react';
import { Lottie, ProductCard, ProductImage } from '../../components';
import { useNav } from '../../kit/Navigator';
import type { ScreenProps } from '../../kit/types';
import { productById, products } from '../../data';
import { copy } from './data';
import { pdpTokens } from './tokens';
import styles from './pdp.module.css';

const { quickCart: qc } = pdpTokens;

/**
 * NoonQuickCartScreen (post-ATC bottom sheet): 80px circle with the 64px product image under the 120px
 * atc-check Lottie; the row slides in from x+150 and the text fades in from the right; then
 * CONTINUE SHOPPING (outline) / VIEW CART (accentColor). Recommendations only for
 * FeatureFlags.getPDPATCPopupRecommendationsVariant 1/2 (default 0 → hidden; pass `recsVariant`).
 */
export function AddedSheet({ params }: ScreenProps<{ productId: string; qty?: number; recsVariant?: 0 | 1 | 2 }>) {
  const nav = useNav();
  const product = productById(params.productId);
  const showRecs = (params.recsVariant ?? 0) > 0;
  return (
    <div className={styles.quickCart}>
      <div className={styles.quickInfo}>
        <motion.div className={styles.quickRow} initial={{ x: qc.rowFrom }} animate={{ x: 0 }} transition={{ delay: qc.rowDelay, duration: qc.rowMs, ease: qc.ease }}>
          <div className={styles.checkWrapper}>
            <span className={styles.checkImage}>
              <ProductImage product={product} width="var(--nk-layout-pdp-check-image)" height="var(--nk-layout-pdp-check-image)" emojiScale={0.6} />
            </span>
            <span className={styles.checkLottie}>
              <Lottie name="atcCheck" style={{ width: '100%', height: '100%' }} />
            </span>
            <span className={styles.checkOverlay} />
          </div>
          <motion.div className={styles.quickText} initial={{ x: qc.textFrom, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: qc.textDelay, duration: qc.textMs, ease: qc.ease }}>
            <div className={styles.quickTitle}>{copy.addedToCart}</div>
            <div className={styles.quickSubtitle}>{product.title}</div>
          </motion.div>
        </motion.div>
      </div>

      {showRecs && (
        <section className={styles.quickRecs}>
          <h3 className={styles.quickRecsTitle}>{copy.customersAlsoViewed}</h3>
          <div className={styles.recsList}>
            {products
              .filter((p) => p.id !== product.id)
              .slice(0, 6)
              .map((p) => (
                <div key={p.id} className={styles.recsItem}>
                  <ProductCard product={p} compact width={pdpTokens.recoCardWidth()} />
                </div>
              ))}
          </div>
        </section>
      )}

      <div className={styles.quickButtons}>
        <button type="button" className={styles.quickClose} onClick={nav.back}>
          {copy.continueShopping}
        </button>
        <button type="button" className={styles.quickCheckout} onClick={() => nav.push('cart/cart')}>
          {copy.viewCart}
        </button>
      </div>
    </div>
  );
}
