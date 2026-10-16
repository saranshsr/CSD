import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { HtmlText, ProductCard, Skeleton, Spinner } from '../../components';
import { useDemoStore } from '../../kit/DemoStore';
import { useNav } from '../../kit/Navigator';
import type { ScreenProps } from '../../kit/types';
import { tween } from '../../motion/presets';
import { currency, formatPrice, productById } from '../../data';
import { CartIcon } from './components/CartIcon';
import html from './components/html.module.css';
import { cartItemExtras, couponFeedback, t, type DiscountTag } from './data';
import styles from './discount.module.css';

const LOADING_MS = 600; // stands in for CatalogService.getDynamicLoaderData
const APPLYING_MS = 700; // NoonCartActions.applyCartCoupon round-trip

function findTag(productId?: string, tagId?: string): DiscountTag | undefined {
  const tags = cartItemExtras[productId ?? '']?.discountTags ?? Object.values(cartItemExtras).flatMap((e) => e.discountTags ?? []);
  return tags.find((d) => d.id === tagId) ?? tags[0];
}

/**
 * NoonCartDiscountDetailsOverlayScreen — opened by tapping an item's discount tag.
 * Header, title, dashed code chip + Apply (onApplyDiscountPress is passed on master when the cart has a
 * coupon_tray section) → loader overlay → "Applied" + coupon feedback; terms with green checks;
 * "Eligible items for this discount" carousel (skeleton while loading) with View all.
 */
export function DiscountDetailsSheet({ params }: ScreenProps<{ productId?: string; tagId?: string; copyOnly?: boolean }>) {
  const nav = useNav();
  const { coupon, cartTotals, applyCoupon } = useDemoStore();
  const tag = findTag(params.productId, params.tagId);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setLoading(false), LOADING_MS);
    return () => window.clearTimeout(id);
  }, []);

  if (!tag) return null;
  const isApplied = coupon === tag.code;
  const products = (tag.eligibleProductIds ?? []).slice(0, tag.productsLimit ?? undefined).map(productById);

  const onApply = () => {
    if (isApplied || applying) return;
    setApplying(true);
    window.setTimeout(() => {
      applyCoupon(tag.code);
      setApplying(false);
    }, APPLYING_MS);
  };

  const onCopy = () => {
    if (copied) return;
    setCopied(true);
    try {
      void navigator.clipboard?.writeText(tag.code);
    } catch {
      /* clipboard unavailable in previews */
    }
  };

  const onViewAll = () => {
    nav.back();
    nav.push('plp/listing');
  };

  const renderButton = () => {
    if (!tag.showButton) return null;
    if (params.copyOnly) {
      return (
        <button type="button" className={styles.copyBtn} onClick={onCopy}>
          <CartIcon name={copied ? 'checkmark' : 'copySquare'} size={copied ? 16 : 18} color="var(--nk-palette-new-blue)" />
          {copied ? t.copied : t.copyCode}
        </button>
      );
    }
    return (
      <motion.button type="button" whileTap={isApplied ? undefined : { scale: 0.96 }} className={isApplied ? styles.appliedBtn : styles.applyBtn} onClick={onApply}>
        {isApplied ? t.applied : t.applyCommon}
      </motion.button>
    );
  };

  const feedback = (() => {
    const c = cartTotals.coupon;
    if (params.copyOnly || !isApplied || !c) return null;
    const fb = couponFeedback(c, currency, formatPrice)!;
    return <HtmlText base value={fb.html} className={html[fb.tone === 'success' ? 'couponSuccess' : 'couponError']} />;
  })();

  return (
    <div className={styles.container}>
      <AnimatePresence>
        {applying && (
          <motion.div className={styles.refresh} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={tween('fast')}>
            <Spinner size={28} thickness={3} track="var(--nk-color-border)" color="var(--nk-color-cart-accent-blue)" />
          </motion.div>
        )}
      </AnimatePresence>
      <div className={styles.header}>
        <div className={styles.headerText}>{t.discountDetails}</div>
      </div>
      <div className={styles.scroll}>
        <div className={styles.title}>{tag.title}</div>
        <div className={styles.discountRow}>
          <span className={styles.discountCode}>{tag.code}</span>
          {renderButton()}
        </div>
        <AnimatePresence initial={false}>
          {feedback && (
            <motion.div className={styles.feedback} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={tween('medium')}>
              {feedback}
            </motion.div>
          )}
        </AnimatePresence>
        {tag.terms.length > 0 && (
          <div className={styles.terms}>
            {tag.terms.map((term) => (
              <div key={term} className={styles.term}>
                <CartIcon name="greenCheck" size={20} color="var(--nk-color-cart-emerald)" />
                <span>{term}</span>
              </div>
            ))}
          </div>
        )}
        {tag.url && (loading ? <EligibleSkeleton /> : products.length > 0 && (
          <motion.div className={styles.eligible} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={tween('base')}>
            <div className={styles.eligibleHeader}>
              <span className={styles.eligibleHeaderText}>{t.eligibleItems}</span>
              <button type="button" className={styles.viewAll} onClick={onViewAll}>
                {t.viewAll}
              </button>
            </div>
            <div className={styles.carousel}>
              {products.map((p) => (
                <div key={p.id} className={styles.productBox}>
                  <ProductCard product={p} compact width="100%" />
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function EligibleSkeleton() {
  return (
    <div className={styles.eligible}>
      <div className={styles.skeletonHeader}>
        <Skeleton width={200} height={20} radius={2} />
        <Skeleton width={80} height={16} radius={2} />
      </div>
      <div className={styles.carousel}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={styles.loadingItem}>
            <div>
              <Skeleton width={130} height={200} radius={8} />
              <Skeleton width={130} height={16} radius={2} style={{ marginTop: 8 }} />
              <Skeleton width={110} height={16} radius={2} style={{ marginTop: 4 }} />
            </div>
            <div className={styles.loadingBottom}>
              <Skeleton width={90} height={14} radius={2} style={{ marginTop: 4 }} />
              <Skeleton width={90} height={14} radius={2} style={{ marginTop: 4 }} />
              <Skeleton width={60} height={16} radius={2} style={{ marginTop: 8 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
