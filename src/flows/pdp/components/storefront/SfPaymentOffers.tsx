import { HtmlText, Pressable } from '../../../../components';
import { useNav } from '../../../../kit/Navigator';
import type { PdpContent } from '../../data';
import enbdCard from '@assets/pdp/new-pdp/pay-enbd-card.png';
import { Card } from '../Sections';
import styles from './SfPaymentOffers.module.css';

export const sfPaymentCopy = {
  title: 'Payment offers', // Figma 3499:75414
  /** Figma 3499:75437 — ENBD noon VISA cashback (demo bank offer, shown before the SD installment items) */
  bankOffer: '<b>Get extra 5% cashback</b> using ENBD noon VISA credit card <a>Apply Now</a>',
};

type Offer = { key: string; html: string; logo: string; cover?: boolean };

const plain = (html: string) => html.replace(/<[^>]+>/g, '');

/**
 * Storefront "Offers for you" (Figma 3499:75412): white r16 card, py12, gap 12; 15/700 title (px14); a scroll row (px12,
 * gap 8) of 253 × 64 offer cards (1px blue-gray/200, r10, p8) with a 60 × 40 logo box and 12/14 rich text
 * (<b> bold, <a> 600 brand blue). First card = ENBD cashback (New PDP 64:5693: the ENBD noon VISA card image, 63 × 42
 * cover in a 60 × 40 r6 box), then the SD payments items (tabby / tamara logos). Replaces PaymentsCard.
 */
export function SfPaymentOffers({ content }: { content: PdpContent }) {
  const nav = useNav();
  if (!content.payments) return null;
  const offers: Offer[] = [{ key: 'bank', html: sfPaymentCopy.bankOffer, logo: enbdCard, cover: true }, ...content.payments.items.map((it) => ({ key: it.html, html: it.html, logo: it.logo }))];
  return (
    <Card className={styles.card} contentGap={12}>
      <h3 className={styles.title}>{sfPaymentCopy.title}</h3>
      <div className={styles.row}>
        {offers.map((o) => (
          <Pressable key={o.key} className={styles.offer} onClick={() => nav.toast(plain(o.html))}>
            <span className={styles.logo} data-cover={o.cover || undefined}>
              <img alt="" src={o.logo} />
            </span>
            <HtmlText value={o.html} lines={3} className={styles.text} />
          </Pressable>
        ))}
      </div>
    </Card>
  );
}
