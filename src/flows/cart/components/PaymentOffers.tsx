import { useNav } from '../../../kit/Navigator';
import { useIsNoonOneMember } from '../../../kit/membership';
import { t, type PaymentOffer } from '../data';
import { SalesCallout } from './SalesCallout';
import styles from './sections.module.css';

/**
 * NoonCartScreenCallouts (order: horizontal), styled to All flows "Offers for you" (Af34gfmhQ1D0wstXUEHSIF · 127:40114):
 * white r16 card (pt 12 pb 14, gap 12), title B16/Bold #1D2539 px 14, then a scrolling row (gap 8, px 12) of 259-wide
 * `.coupon-content` entries — 1px #F2F3F7 r16, p 8, gap 8, 48px r12 logo tile and 12/16 SemiBold copy with the
 * "Learn more" link in #0F61FF (master textStyleSheet: p blueGray900 12 600, highlight primaryBlue).
 * Master behaviour kept: the noon One callout opens the noon One landing and is hidden for members; other entries
 * follow their deeplink (a toast in the kit).
 */
export function PaymentOffers({ entries }: { entries: PaymentOffer[] }) {
  const nav = useNav();
  const member = useIsNoonOneMember();
  const visible = entries.filter((c) => !(member && c.link === '/noon-one'));
  if (!visible.length) return null;
  return (
    <section className={styles.offers}>
      <h3 className={styles.offersTitle}>{t.paymentOffers}</h3>
      <div className={`nk-hscroll ${styles.offersRow}`}>
        {visible.map((c, i) => (
          <button
            key={`${c.link}-${i}`}
            type="button"
            className={styles.offer}
            onClick={() => (c.link === '/noon-one' ? nav.push('noonone/landing', { source: '/cart' }) : nav.toast(`Opens ${c.link?.slice(1)} details`))}
          >
            <SalesCallout
              entry={c}
              sheet={c.regular ? 'paymentOfferRegular' : 'paymentOffer'}
              lines={3}
              className={styles.offerEntry}
              iconRender={(url) => (
                <span className={styles.offerTile} data-tile={c.tile}>
                  <img src={url} alt="" />
                </span>
              )}
            />
          </button>
        ))}
      </div>
    </section>
  );
}
