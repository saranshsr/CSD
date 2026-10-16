import { useMotionValue } from 'motion/react';
import { useEffect, useState, type MouseEvent } from 'react';
import { OriginIcon, Pressable, Screen, TabBar } from '../../components';
import type { CartTotals } from '../../kit/DemoStore';
import { currency } from '../../data';
import { useNav } from '../../kit/Navigator';
import instCard from '@assets/couponsearch/cart-inst-card.svg';
import instClock from '@assets/couponsearch/cart-inst-clock.svg';
import noonOneCard from '@assets/couponsearch/cart-noon-one-card.webp';
import lucidRaffle from '@assets/couponsearch/cart-lucid-raffle.webp';
// the kit's cart pieces (src/flows/cart): address header, coupon input row, Liquid Glass sticky total + Checkout
import { CartFooter } from '../cart/components/CartFooter';
import { CartHeader } from '../cart/components/CartHeader';
import { CouponInput } from '../cart/components/CouponInput';
import { cartCopy } from './data';
import styles from './cart.module.css';

/** Origin installments mark: the card, and the clock on a white disc over its corner (Molecule/BrandLogo). */
function InstallmentsMark() {
  return (
    <span className={styles.instMark} aria-hidden>
      <img className={styles.instCard} src={instCard} alt="" />
      <span className={styles.instClock}>
        <img src={instClock} alt="" />
      </span>
    </span>
  );
}

function Installment({ value, note }: { value: string; note?: string }) {
  return (
    <div className={styles.po}>
      <div className={styles.poHead}>
        <InstallmentsMark />
        <OriginIcon name="chevron-right" size={16} color="var(--nk-palette-slate-gray)" />
      </div>
      <div className={styles.poCopy}>
        <span className={styles.poValue}>{value}</span>
        {note && <span className={styles.poNote}>{note}</span>}
      </div>
    </div>
  );
}

/** The frame's totals (01 · Cart: Đ1,760.00, Đ130 saved) for the kit's footer, whatever is in the kit's demo cart. */
const frameTotals: CartTotals = {
  itemCount: 2,
  subtotal: 1890,
  savings: 130,
  addOns: 0,
  foupons: 0,
  shipping: 0,
  freeDelivery: true,
  groups: [],
  coupon: null,
  couponDiscount: 0,
  total: 1760,
  totalSavings: 130,
};

/**
 * The coupon search's cart (team file 01 · Cart), on the kit's cart pieces in the frame's order: the kit CartHeader
 * (address, wishlist), Savings & benefits (installments, noon One card cashback: the frame's tiles, no kit counterpart),
 * the kit CouponInput ("Got a coupon?" + the coupons & offers row, which opens the tray on BEAUTY10's data, 02 / 03),
 * the Lucid Air raffle, the kit's Liquid Glass sticky total + Checkout (CartFooter on the Cart tab) and the Liquid Glass
 * tab bar. The coupon entry is on screen with no scroll.
 */
export function CartScreen() {
  const nav = useNav();
  const scrollY = useMotionValue(0);
  const [footerH, setFooterH] = useState(0);
  const openTray = () => nav.sheet('cart/couponTray', { variant: 'beauty10' });
  useEffect(() => nav.preload('cart/couponTray', 'couponsearch/eligible'), [nav]);
  // the kit row opens the kit's own tray: here it opens the BEAUTY10 one (the field and APPLY stay the kit's)
  const onCouponClick = (e: MouseEvent) => {
    const b = (e.target as HTMLElement).closest('button');
    if (b && !b.disabled && b.textContent?.includes('coupons & offers')) {
      e.stopPropagation();
      e.preventDefault();
      openTray();
    }
  };

  return (
    <Screen
      header={<CartHeader scrollY={scrollY} />}
      footer={<CartFooter totals={frameTotals} cart={[]} isTabRoot onCheckout={() => nav.toast(cartCopy.checkoutToast)} onHeightChange={setFooterH} />}
      floatingFooter
      background="bgPage"
      onScroll={(y) => scrollY.set(y)}
      contentStyle={{ paddingTop: 0, paddingBottom: `calc(${footerH}px + var(--nk-tab-bar-floating-gap) + var(--nk-layout-tab-bar) + var(--nk-inset-bottom) + var(--nk-space-s16))` }}
      overlay={<TabBar active="cart" />}
    >
      <div className={styles.page}>
        <section className={styles.card}>
          <h3 className={styles.cardTitle}>{cartCopy.savingsTitle}</h3>
          <div className={styles.poWrap}>
            <div className={styles.poRow}>
              <Installment value={`${currency}375 * 4`} note={cartCopy.installments} />
              <Installment value={`${currency}375 * 4`} note={cartCopy.installments} />
              <Installment value={cartCopy.bankInstallments} />
            </div>
            <div className={styles.poWide}>
              <img className={styles.poOne} src={noonOneCard} alt="" width={54} height={34} />
              <span className={styles.poOneCopy}>
                {cartCopy.earn}{' '}
                <b>
                  {currency}
                  {cartCopy.cashback}
                </b>{' '}
                {cartCopy.withCard}
              </span>
              <Pressable className={styles.poApply} onClick={() => nav.push('noonone/landing', { source: '/cart' })}>
                {cartCopy.apply}
                <OriginIcon name="chevron-right" size={16} color="var(--nk-color-cs-link)" />
              </Pressable>
            </div>
          </div>
        </section>

        <div onClickCapture={onCouponClick} data-testid="cs-cart-coupons">
          <CouponInput />
        </div>

        <img className={styles.raffle} src={lucidRaffle} alt={cartCopy.raffleAlt} />
      </div>
    </Screen>
  );
}
