import { OriginIcon, type OriginIconName } from '../../../../components';
import type { PdpContent } from '../../data';
import { Card } from '../Sections';
import styles from './SfTrustCard.module.css';

/** offer_badges icon kind → Origin trust icon (Figma "returns low" / "Product as described" / mdi:tick-decagram …). */
export const sfTrustIcons: Record<PdpContent['offerBadges'][number]['icon'], OriginIconName> = {
  returnable: 'delivery-box-return',
  warranty: 'check-shield',
  verified: 'verified',
  tick: 'delivery-box-check-circle',
  offer: 'discount-tag',
};

/**
 * Trust markers (New PDP 64:5694 / Storefront 3499:75389 "Trustmarker"): white r16 card, p12; a row of 80-high tiles (gap 8,
 * 1px blue-gray/200 border, r12, padding 14·8, gap 4) with a 20px blue icon over a 12/600/14 two-line label.
 * ≤ 3 tiles share the row (103.67 each at 375); ≥ 4 tiles are 94 wide and scroll. Replaces ReinforcementCard
 * (same SD offer_badges ≥ 2 rule).
 */
export function SfTrustCard({ content }: { content: PdpContent }) {
  const items = content.offerBadges;
  if (items.length < 2) return null;
  const scrolls = items.length >= 4;
  return (
    <Card>
      <div className={styles.row} data-scroll={scrolls || undefined}>
        {items.map((b) => (
          <div key={b.title} className={styles.tile}>
            <OriginIcon name={sfTrustIcons[b.icon]} filled size={20} color="var(--nk-color-pdp-sfc-trust-icon)" />
            <span className={styles.label}>{b.title}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
