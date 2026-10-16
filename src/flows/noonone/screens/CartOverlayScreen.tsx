import { HtmlText, ProductImage } from '../../../components';
import { useDemoStore } from '../../../kit/DemoStore';
import { useNav } from '../../../kit/Navigator';
import type { ScreenProps } from '../../../kit/types';
import { products } from '../../../data';
import noonColorIcon from '@assets/noonone/entry/noon-one-text.webp';
import noonOneIcon from '@assets/noonone/entry/noon-one.webp';
import { LegacyOverlay, useLegacyOverlay } from '../components/entry/LegacyOverlay';
import { cartOverlayTouchpoint as tp, cartPushUnitPrice, type EntryButton } from '../data.entry';
import { showLandingWithRedirect } from '../store';
import styles from './CartOverlayScreen.module.css';

/**
 * features/vip/screens/VIPCartOverlayScreen — NoonCartScreen.showVipPush (Checkout tap, once per session, cart
 * `pushes.vip`). noon One colour logo, title 32/bold, `[placeholder]` subtitle, horizontal member-price items
 * (90px image, html unit price, noon One tag), stacked bordered buttons. /viewPlans → close(false) + landing
 * (VIPUtil.showLandingWithRedirect; isVIPV2CartPlansLinkEnabled off → no plan-select redirect); /checkout, ×,
 * scrim → close() → onDismiss → checkout.
 */
export function CartOverlayScreen({ params }: ScreenProps<{ isOneDay?: boolean; coupon?: string | null }>) {
  const nav = useNav();
  const goToCheckout = () => nav.push('checkout/checkout', { coupon: params.coupon ?? null });
  return (
    <LegacyOverlay sheetClassName={styles.sheet} onDismiss={goToCheckout}>
      <Content isOneDay={!!params.isOneDay} />
    </LegacyOverlay>
  );
}

function Content({ isOneDay }: { isOneDay: boolean }) {
  const nav = useNav();
  const { close } = useLegacyOverlay();
  const { cart } = useDemoStore();
  // pushes.vip.items = the cart lines; opened directly from the playground → three catalogue items
  const items = cart.length ? cart.map((l) => l.product) : products.slice(0, 3);

  const onButton = (b: EntryButton) => {
    if (b.cta === '/viewPlans') close(false, () => showLandingWithRedirect(nav, undefined, { source: '/cart' }));
    else if (b.cta === '/checkout') close();
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <img className={styles.headerIcon} src={noonColorIcon} alt="noon One" />
      </div>
      <div className={styles.scroll}>
        <div className={styles.titleWrapper}>
          <span className={styles.titleText}>{isOneDay ? tp.pushMessage : tp.title}</span>
          <HtmlText base className={styles.subtitle} value={isOneDay ? tp.oneDaySubtitle : tp.subtitle.replace('[placeholder]', tp.pushMessage)} />
        </div>
        <div className={styles.items}>
          {items.map((p) => (
            <div key={p.id} className={styles.item}>
              {/* itemImage: 90 × 90 Image, resizeMode contain — no tile, no overlay */}
              {p.image ? (
                <img className={styles.itemImage} src={p.image} alt={p.title} draggable={false} />
              ) : (
                <ProductImage product={p} width="var(--nk-layout-vip-cart-item-image)" height="var(--nk-layout-vip-cart-item-image)" />
              )}
              <HtmlText base className={styles.itemPrice} value={cartPushUnitPrice(p.price)} />
              <img className={styles.itemIcon} src={noonOneIcon} alt="" />
            </div>
          ))}
        </div>
      </div>
      <div className={styles.buttons}>
        {tp.buttons.map((b) => (
          <button key={b.cta} type="button" className={`nk-pressable ${styles.button}`} style={{ background: b.backgroundColor, borderColor: b.borderColor, color: b.textColor }} onClick={() => onButton(b)}>
            {b.title}
          </button>
        ))}
      </div>
    </div>
  );
}
