import { useCallback, useMemo, useRef, useState } from 'react';
import { Pressable, Skeleton } from '../../components';
import { useDemoStore } from '../../kit/DemoStore';
import { useNav } from '../../kit/Navigator';
import { useMembership, useMembershipEligibility } from '../../kit/membership';
import type { ScreenProps } from '../../kit/types';
import errorArt from '@assets/cart/coupon-tray/coupon-tray-error.webp';
import emptyArt from '@assets/cart/coupon-tray/coupon-tray-empty.webp';
import { BestPriceSection, TrayItem } from './components/couponTray/BestPriceSection';
import { TrayOffer, type TrayOfferShared } from './components/couponTray/TrayOffer';
import { buildCouponTray, trayCopy, type CouponTray, type TrayOffer as Offer } from './data.couponTray';
import styles from './couponTray.module.css';

const LOADING_MS = 700; // stands in for NoonCartService.getCouponTray
const ACTION_MS = 700; // applyCartCoupon / removeCartCoupon round-trip

type Params = {
  /** playground / journeys: force a state (`loading` holds the skeleton, `error` shows the retry, `empty` no offers) */
  state?: 'loading' | 'error' | 'empty';
};

/**
 * NoonSalesCouponTrayOverlayScreen (coupon tray revamp) — opened by "View available coupons & offers" in the cart.
 * Best price card, "Coupons", "Payment offers"; loading skeleton, error with Try again, empty. Apply shows the loader on
 * the offer, locks the tray, applies the cart coupon and closes; Remove refreshes in place. T&C / Shop more / Join One
 * close the tray first. Mapping: components/couponTray/MAPPING.md.
 */
export function CouponTraySheet({ params }: ScreenProps<Params>) {
  const nav = useNav();
  const { coupon, cartTotals, applyCoupon, removeCoupon } = useDemoStore();
  const { status } = useMembership();
  const { trialEligible } = useMembershipEligibility();
  const isMember = status === 'active' || status === 'trial';
  // master passes the cart's couponTray as initialData, so the tray opens with content (and delays the stagger)
  const [phase, setPhase] = useState<'loading' | 'error' | 'ready'>(params.state === 'loading' ? 'loading' : params.state === 'error' ? 'error' : 'ready');
  const [activeId, setActiveId] = useState<string | null>(null);
  const seen = useRef(new Set<string>());
  const busy = activeId != null;

  const tray: CouponTray = useMemo(() => {
    if (params.state === 'empty') return { bestPrice: null, coupons: [], bankDiscounts: [] };
    return buildCouponTray({ subtotal: cartTotals.subtotal, units: cartTotals.itemCount, appliedCode: coupon, isMember });
  }, [params.state, cartTotals.subtotal, cartTotals.itemCount, coupon, isMember]);

  const getTray = useCallback(() => {
    setPhase('loading');
    window.setTimeout(() => setPhase('ready'), LOADING_MS);
  }, []);

  const close = () => nav.back();

  const shared: TrayOfferShared = {
    disabled: busy,
    isMember,
    trialEligible,
    onTnc: () => {
      if (busy) return;
      close();
      nav.toast(trayCopy.tncToast);
    },
    onShopMore: (o: Offer) => {
      if (busy) return;
      close();
      // BEAUTY10 opens the coupon-scoped search's eligible items (src/flows/couponsearch)
      if (o.code === 'BEAUTY10') nav.push('couponsearch/eligible');
      else nav.push('plp/listing', { query: o.plpQuery ?? 'deals' });
    },
    onJoinOne: () => {
      if (busy) return;
      close();
      nav.push('noonone/landing', { source: '/cart' });
    },
  };

  const onApply = (id: string, code: string) => {
    if (busy) return;
    setActiveId(id);
    const previous = coupon;
    window.setTimeout(() => {
      const result = applyCoupon(code);
      setActiveId(null);
      if (result.state === 'success') close();
      else {
        // master keeps the cart as it was and shows the warning toast
        if (previous) applyCoupon(previous);
        else removeCoupon();
        nav.toast(trayCopy.applyFailed, { tone: 'error' });
      }
    }, ACTION_MS);
  };

  const onRemove = (id: string) => {
    if (busy) return;
    setActiveId(id);
    window.setTimeout(() => {
      removeCoupon();
      setActiveId(null); // handleGetTray(false): the tray refreshes in place from the cart
    }, ACTION_MS);
  };

  const empty = !tray.bestPrice?.offers.length && !tray.coupons.length && !tray.bankDiscounts.length;

  if (phase === 'loading') {
    return (
      <div className={styles.feedbackWrapper} data-testid="coupon-tray" data-state="loading">
        <div className={styles.loading}>
          <Skeleton width="100%" height="60%" radius={16} style={{ marginTop: 8, marginBottom: 16 }} />
          <Skeleton width={100} height={22} radius={4} style={{ marginTop: 8, marginBottom: 16 }} />
          <Skeleton width="100%" height={120} radius={16} />
        </div>
      </div>
    );
  }
  if (phase === 'error' || empty) {
    const error = phase === 'error';
    return (
      <div className={`${styles.feedbackWrapper} ${styles.feedbackWhite}`} data-testid="coupon-tray" data-state={error ? 'error' : 'empty'}>
        <div className={styles.feedback}>
          <img src={error ? errorArt : emptyArt} width={100} height={100} alt="" className={styles.feedbackArt} />
          <span className={styles.feedbackTitle}>{error ? trayCopy.errorTitle : trayCopy.emptyTitle}</span>
          <span className={styles.feedbackSubtitle}>{error ? trayCopy.errorSubtitle : trayCopy.emptySubtitle}</span>
          {error && (
            <Pressable className={styles.retry} onClick={getTray}>
              {trayCopy.tryAgain}
            </Pressable>
          )}
        </div>
      </div>
    );
  }

  let index = 0;
  const delayed = params.state == null;
  const offerRow = (o: Offer) => (
    <TrayItem key={o.id} id={o.id} index={index++} seen={seen} delayed={delayed}>
      <TrayOffer offer={o} bestPrice={false} shared={shared} loading={activeId === o.id} onApply={(code) => onApply(o.id, code)} onRemove={() => onRemove(o.id)} className={styles.trayOffer} />
    </TrayItem>
  );
  const header = (key: string, title: string) => (
    <TrayItem key={key} id={key} index={index++} seen={seen} delayed={delayed}>
      <div className={styles.sectionHeader}>{title}</div>
    </TrayItem>
  );

  return (
    <div className={`nk-scroll ${styles.wrapper}`} data-testid="coupon-tray" data-state="ready" aria-busy={busy || undefined}>
      <div className={styles.topSpacing} />
      {tray.bestPrice && tray.bestPrice.offers.length > 0 && (
        <TrayItem id="best-price" index={index++} seen={seen} delayed={delayed}>
          <BestPriceSection bestPrice={tray.bestPrice} shared={shared} activeId={activeId} onApply={onApply} onRemove={(id) => onRemove(id)} />
        </TrayItem>
      )}
      {tray.coupons.length > 0 && [header('coupons-section-title', trayCopy.couponsTitle), ...tray.coupons.map(offerRow)]}
      {tray.bankDiscounts.length > 0 && [header('bank-discounts-section-title', trayCopy.bankTitle), ...tray.bankDiscounts.map(offerRow)]}
      <div className={styles.bottomSpacing} />
    </div>
  );
}
