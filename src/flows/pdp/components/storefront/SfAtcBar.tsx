import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import atcLoader from '@assets/cart/atc-loader-animation.lottie';
import { GlassFade, Lottie, OriginIcon, TabBar } from '../../../../components';
import { layout } from '../../../../foundations/tokens';
import { useDemoStore } from '../../../../kit/DemoStore';
import { useNav } from '../../../../kit/Navigator';
import type { Product } from '../../../../data';
import { spring } from '../../../../motion/presets';
import { copy } from '../../data';
import { npaCopy } from '../../data.npA';
import { pdpTokens } from '../../tokens';
import pdpStyles from '../../pdp.module.css';
import styles from './SfAtcBar.module.css';

/**
 * "Bottom Nav" — New PDP (Af34gfmhQ1D0wstXUEHSIF · 104:20387; Storefront 3499:75904): white, top r16, shadow 0 −2 4 black 5% —
 * in-cart strip (hidden "Content" row, 36h yellow) · ATC row 72h p12 gap 8: QTY box 48×48 r12 + "Buy now" (#041F62, 47h,
 * r10, 14/700/20 white) + "Add to cart" (accentColor, r10), the two buttons sharing the width · the 5-tab bar (kit TabBar,
 * Home active) over the home-indicator inset. Buy now = bappzaar NoonAddToCartQuantity.onBuyNowPress (the Buy Now
 * overlay checkout): adds the chosen quantity and goes straight to checkout; `buyNow={false}` hides it.
 * Liquid Glass (bappzaar noon/ios/liquid-upgrade, NoonProductDetails isLiquidGlass): the card floats — the glass tab
 * bar's width (inset 21), r16 on all corners, NoonAddToCartQuantity buttons p8 / 12 — docked FLOATING_BOTTOM_GAP above
 * the bar and following it; the surface is the tab bar's glass material (bappzaar: white + 0 −2 6 at 0.08).
 * "Back to top" (Pill Button 3499:75878) floats 48 above. Replaces AtcBar (same props): add → loader →
 * addToCart → `pdp/added` sheet; `interceptAdd` (size missing) wins; QTY opens the quantity chips.
 */
export function SfAtcBar({ product, showBackToTop, onBackToTop, interceptAdd, buyNow = true }: { product: Product; showBackToTop: boolean; onBackToTop: () => void; /** e.g. size not picked yet → open the variants sheet instead */ interceptAdd?: () => void; /** offer.is_buy_now_enabled */ buyNow?: boolean }) {
  const nav = useNav();
  const { cart, addToCart } = useDemoStore();
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const inCart = cart.find((l) => l.product.id === product.id)?.qty ?? 0;

  const add = () => {
    if (loading) return;
    setSelectorOpen(false);
    if (interceptAdd) return interceptAdd();
    setLoading(true);
    setTimeout(() => {
      addToCart(product.id, qty);
      setLoading(false);
      setQty(1);
      nav.sheet('pdp/added', { productId: product.id, qty });
    }, pdpTokens.atcLoadingMs);
  };

  const buy = () => {
    if (loading) return;
    setSelectorOpen(false);
    if (interceptAdd) return interceptAdd();
    if (!inCart) addToCart(product.id, qty);
    setQty(1);
    nav.push('checkout');
  };

  return (
    <div className={styles.sticky} data-glass-footer="">
      <GlassFade className={styles.fade} />
      <AnimatePresence>
        {showBackToTop && !selectorOpen && (
          <motion.div key="btt" className={styles.backToTopWrap} initial={false} exit={{ opacity: 0, transition: { duration: 0 } }}>
            <motion.button type="button" className={styles.backToTop} onClick={onBackToTop} whileTap={{ scale: 0.95 }} transition={spring.press}>
              <OriginIcon name="chevron-up" size={16} color="var(--nk-color-text-inverse)" />
              {copy.backToTop}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={styles.nav}>
        <AnimatePresence initial={false}>
          {inCart > 0 && !selectorOpen && (
            <motion.div key="incart" className={styles.inCart} initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={spring.gentle}>
              <div className={styles.inCartInner}>
                <OriginIcon name="cart-check-filled" size={20} color="var(--nk-color-text-primary)" />
                <span>
                  <motion.span key={inCart} className={styles.inCartCount} initial={{ scale: 1.4 }} animate={{ scale: 1 }} transition={spring.bouncy}>
                    {inCart}
                  </motion.span>{' '}
                  {copy.addedInCart}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <QuantitySelector open={selectorOpen} selected={qty} onClose={() => setSelectorOpen(false)} onSelect={(q) => { setQty(q); setSelectorOpen(false); }} />

        <div className={styles.atcRow}>
          <button type="button" className={styles.qty} onClick={() => setSelectorOpen((o) => !o)} aria-label={copy.quantity} aria-expanded={selectorOpen}>
            <span className={styles.qtyLabel}>{copy.qty}</span>
            <span className={styles.qtyValue}>{qty}</span>
          </button>
          {buyNow && (
            <button type="button" className={styles.buyNow} onClick={buy}>
              {npaCopy.buyNow}
            </button>
          )}
          <button type="button" className={styles.atc} data-loading={loading || undefined} onClick={add}>
            <span className={loading ? styles.hidden : undefined}>{copy.addToCart}</span>
            {loading && (
              <span className={styles.loader}>
                <Lottie src={atcLoader} loop style={{ width: 'var(--nk-layout-pdp-atc-loader)', height: 'var(--nk-layout-pdp-atc-loader)' }} />
              </span>
            )}
          </button>
        </div>
      </div>

      <div className={styles.tabs}>
        <TabBar active="home" />
      </div>
    </div>
  );
}

/** NoonQuantitySelector (as AtcBar): "Quantity" + close, chips (width = (screen − 24) / min(n, 4.5) − 12). Styles shared from pdp.module.css. */
function QuantitySelector({ open, selected, onClose, onSelect }: { open: boolean; selected: number; onClose: () => void; onSelect: (q: number) => void }) {
  const { sectionPad, gap, maxVisible, max } = pdpTokens.qty;
  const items = Array.from({ length: max }, (_, i) => i + 1);
  const full = layout.deviceWidth - 2 * sectionPad;
  const itemWidth = full / (items.length <= 4 ? items.length : maxVisible) - gap;
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div key="qty" className={pdpStyles.qtySelector} initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={spring.gentle}>
          <div className={pdpStyles.qtySelectorInner}>
            <div className={pdpStyles.qtyHeader}>
              <span className={pdpStyles.qtyHeaderText}>{copy.quantity} </span>
              <button type="button" className={pdpStyles.qtyClose} onClick={onClose} aria-label="Close">
                <OriginIcon name="cross" size={16} color="var(--nk-color-text-muted)" />
              </button>
            </div>
            <div className={pdpStyles.qtyItems}>
              {items.map((q) => (
                <button key={q} type="button" className={pdpStyles.qtyItem} data-selected={q === selected || undefined} style={{ width: itemWidth }} onClick={() => onSelect(q)}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
