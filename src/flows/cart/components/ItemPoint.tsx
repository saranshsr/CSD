import cardIcon from '@assets/cart/figma/card.svg';
import fastDelivery from '@assets/cart/figma/fast-delivery.svg';
import nonReturnable from '@assets/cart/figma/non-returnable.svg';
import refunds from '@assets/cart/figma/refunds.svg';
import warrantyShield from '@assets/cart/figma/warranty-shield.svg';
import warrantyTick from '@assets/cart/figma/warranty-tick.svg';
import type { ItemPointKind } from '../data';
import styles from './item.module.css';

/** Figma "item points" icon layers, placed at the component's inset (16px box). */
const ICONS: Record<ItemPointKind, Array<{ src: string; left: number; top: number }>> = {
  refund: [{ src: refunds, left: 1.37, top: 1.5 }],
  nonReturnable: [{ src: nonReturnable, left: 1.74, top: 1.74 }],
  prepaid: [{ src: cardIcon, left: 1.05, top: 3.08 }],
  fasterDelivery: [{ src: fastDelivery, left: 0, top: 2.16 }],
  warranty: [
    { src: warrantyShield, left: -0.04, top: 0.42 },
    { src: warrantyTick, left: 2.17, top: 1.42 },
  ],
};

/**
 * Figma "item points" (Item points row, e.g. I10575:94083;6893:26207): 16px icon + Label5 11/12 #1D2539,
 * gap 4, padding-start 6. Kit specifications (no icon) render as text-only points.
 */
export function ItemPoint({ kind, label }: { kind?: ItemPointKind; label: string }) {
  return (
    <span className={styles.point}>
      {kind && (
        <span className={styles.pointIcon}>
          {ICONS[kind].map((l) => (
            <img key={l.src} src={l.src} alt="" style={{ left: l.left, top: l.top }} />
          ))}
        </span>
      )}
      <span className={styles.pointText}>{label}</span>
    </span>
  );
}
