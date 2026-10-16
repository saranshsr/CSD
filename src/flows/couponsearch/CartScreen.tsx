import { useEffect } from 'react';
import { OriginIcon, Pressable, Screen, TabBar } from '../../components';
import { currency } from '../../data';
import { useNav } from '../../kit/Navigator';
import homeIcon from '@assets/couponsearch/cart-home.svg';
import headerChevron from '@assets/couponsearch/cart-header-chevron.svg';
import wishlistIcon from '@assets/couponsearch/cart-wishlist.svg';
import instCard from '@assets/couponsearch/cart-inst-card.svg';
import instClock from '@assets/couponsearch/cart-inst-clock.svg';
import chevronRight from '@assets/couponsearch/cart-chevron-right.svg';
import percentBadge from '@assets/couponsearch/cart-percent-badge.svg';
import noonOneCard from '@assets/couponsearch/cart-noon-one-card.webp';
import lucidRaffle from '@assets/couponsearch/cart-lucid-raffle.webp';
import savingsWave from '@assets/couponsearch/cart-savings-wave.svg';
import { NoonOneLogo } from '../cart/components/NoonOneLogo';
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

/**
 * The coupon search's cart (team file 01 · Cart): the cart as the frame shows it, with the coupon entry on screen —
 * address header (Home ▾, address, wishlist), Savings & benefits (installments, noon One card cashback), Got a coupon?
 * (field + "View all coupons & offers"), the Lucid Air raffle, the "Đ130 saved!" tab over the sticky total + Checkout,
 * and the Field DS bottom nav. The coupon field and the row open the coupon tray (02 · Coupons) on BEAUTY10's data.
 */
export function CartScreen() {
  const nav = useNav();
  const openTray = () => nav.sheet('cart/couponTray', { variant: 'beauty10' });
  useEffect(() => nav.preload('cart/couponTray', 'couponsearch/eligible'), [nav]);

  const header = (
    <header className={styles.header}>
      <div className={styles.addr}>
        <span className={styles.addrTitle}>
          <img src={homeIcon} alt="" width={16} height={14} className={styles.addrIcon} />
          {cartCopy.addressType}
          <img src={headerChevron} alt="" width={16} height={16} />
        </span>
        <span className={styles.addrLine}>{cartCopy.address}</span>
      </div>
      <Pressable className={styles.wish} scale={0.9} aria-label="Wishlist" onClick={() => nav.push('wishlist/wishlist')}>
        <img src={wishlistIcon} alt="" width={36} height={36} />
      </Pressable>
    </header>
  );

  const footer = (
    <div className={styles.footer}>
      <div className={styles.savings}>
        <img className={styles.savingsWave} src={savingsWave} alt="" />
        <span className={styles.savingsChip}>
          <span>
            <b>
              {currency}
              {cartCopy.saved}
            </b>{' '}
            {cartCopy.savedWord}
          </span>
          <NoonOneLogo />
        </span>
      </div>
      <div className={styles.sticky}>
        <div className={styles.total}>
          <span className={styles.totalLabel}>{cartCopy.total}</span>
          <span className={styles.totalValue}>
            {currency} {cartCopy.totalValue}
          </span>
        </div>
        <Pressable className={styles.checkout} scale={0.97} onClick={() => nav.toast(cartCopy.checkoutToast)}>
          {cartCopy.checkout}
        </Pressable>
      </div>
      <div className={styles.tabDock}>
        <TabBar active="cart" variant="field" />
      </div>
    </div>
  );

  return (
    <Screen header={header} footer={footer} background="var(--nk-palette-anti-flash-white)">
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

        <section className={styles.coupon} data-testid="cs-cart-coupons">
          <div className={styles.couponTop}>
            <h3 className={styles.cardTitle}>{cartCopy.couponTitle}</h3>
            <div className={styles.couponTray}>
              <Pressable asDiv className={styles.couponField} scale={0.99} onClick={openTray}>
                <span className={styles.couponPlaceholder}>{cartCopy.couponPlaceholder}</span>
                <span className={styles.couponApply}>{cartCopy.couponApply}</span>
              </Pressable>
            </div>
          </div>
          <Pressable asDiv className={styles.couponRow} scale={0.99} onClick={openTray}>
            <img src={percentBadge} alt="" width={16} height={16} />
            <span className={styles.couponRowText}>{cartCopy.viewAll}</span>
            <img src={chevronRight} alt="" width={16} height={16} />
          </Pressable>
        </section>

        <img className={styles.raffle} src={lucidRaffle} alt={cartCopy.raffleAlt} />
      </div>
    </Screen>
  );
}
