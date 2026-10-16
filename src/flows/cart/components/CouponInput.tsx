import { useEffect, useRef, useState } from 'react';
import { useDemoStore } from '../../../kit/DemoStore';
import { useNav } from '../../../kit/Navigator';
import { currency, formatPrice } from '../../../data';
import { couponFeedback, t } from '../data';
import { CartIcon } from './CartIcon';
import { HtmlText } from '../../../components';
import html from './html.module.css';
import styles from './coupon.module.css';

const ICON_COLOR = { success: 'var(--nk-color-cart-emerald)', error: 'var(--nk-palette-dark-red)', warning: 'var(--nk-palette-orange-color)' } as const;

/**
 * NoonCouponInput (parentScreen="cart"), 1:1 with bappzaar master: a lightGrey r16 outer card holding the white r16
 * container (16 bold title, 54px secondaryBackground input row with the applied tag icon + APPLY / REMOVE, HTML feedback)
 * and, on the grey below it, "View available coupons & offers" (emeraldGreen700 discount icon, thick chevron).
 * Apply / remove run behind NoonCartScreen's screen loader (`onBusyChange`, CART_APPLY_COUPON → RELOADING).
 */
export function CouponInput({ onBusyChange }: { onBusyChange?: (busy: boolean) => void }) {
  const nav = useNav();
  const { coupon, cartTotals, applyCoupon, removeCoupon } = useDemoStore();
  const state = coupon ? cartTotals.coupon : null;
  const [text, setText] = useState(coupon ?? '');
  const busy = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const applied = !!coupon;

  useEffect(() => {
    setText(coupon ?? '');
  }, [coupon]);

  // useNoonSalesActionLock: one request at a time, behind the screen loader
  const run = (fn: () => void, ms: number) => {
    if (busy.current) return;
    busy.current = true;
    onBusyChange?.(true);
    window.setTimeout(() => {
      fn();
      busy.current = false;
      onBusyChange?.(false);
    }, ms);
  };

  const onPress = () => {
    if (applied) return run(removeCoupon, 500);
    if (!text) return;
    inputRef.current?.blur();
    run(() => applyCoupon(text), 650);
  };

  const fb = couponFeedback(state, currency, formatPrice);
  const tone = fb?.tone ?? null;

  return (
    <div className={styles.outer}>
      <div className={styles.container}>
        <div className={styles.title}>{t.couponTitle}</div>
        <div className={`${styles.row} ${tone ? styles[tone] : ''}`}>
          <div className={styles.inner}>
            {applied && (
              <span className={styles.appliedIcon}>
                <CartIcon name="appliedCoupon" size={16} color={tone ? ICON_COLOR[tone] : undefined} />
              </span>
            )}
            <input
              ref={inputRef}
              className={styles.input}
              value={text}
              onChange={(e) => setText(e.target.value.toUpperCase())}
              placeholder={t.couponPlaceholder}
              readOnly={applied}
              autoCapitalize="characters"
              onKeyDown={(e) => e.key === 'Enter' && text && onPress()}
            />
          </div>
          <button type="button" className={`${styles.apply} ${!text ? styles.applyDisabled : ''}`} onClick={onPress} disabled={!text}>
            {applied ? t.remove : t.apply}
          </button>
        </div>
        {fb && (
          <div className={styles.feedback}>
            <HtmlText base value={fb.html} className={html[tone === 'success' ? 'couponSuccess' : 'couponError']} />
          </div>
        )}
      </div>
      <button type="button" className={styles.offers} onClick={() => nav.sheet('cart/couponTray')}>
        <span className={styles.offersContent}>
          <CartIcon name="discount" size={16} color="var(--nk-color-cart-emerald700)" />
          <span className={styles.offersText}>{t.availableOffers}</span>
        </span>
        <CartIcon name="chevronThick" size={16} color="var(--nk-color-text-primary)" flipRtl style={{ width: 17 }} />
      </button>
    </div>
  );
}
