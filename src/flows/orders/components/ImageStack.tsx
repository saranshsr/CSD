import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { MarketplaceTag, OriginIcon } from '../../../components';
import { ref } from '../../../foundations/tokens';
import { supermall } from '../../../motion/presets';
import styles from '../orders.module.css';
import { ordersTokens, ordersVar } from '../tokens';
import { useReduceMotion } from '../../../motion/reducedMotion';

export interface StackCard {
  image: string;
  title: string;
  qty?: number;
  installation?: boolean;
}

const S = ordersTokens.stack;

/** look of a card by its distance from the centre (PDS reference: borders, overlays and shadows step out) */
const look = (d: number) => {
  const a = Math.abs(d);
  return {
    border: a === 0 ? ref.color('bgSurface') : a === 1 ? ref.palette('brightGreyColor') : ref.palette('filterCheckboxBorder'),
    shade: a === 0 ? 'transparent' : a === 1 ? ref.palette('blackAlpha8') : ref.palette('blackAlpha20'),
    shadow: a <= 1 ? ordersVar.stackNear : ordersVar.stackFar,
  };
};

/**
 * Details hero image stack (PDS reference): a ring of 81×108 r10 cards in a 295×116 box, placed by their offset from
 * the centre card (x 107 · ±46 · ±92 · ±127.5; scale 1 · .852 · .704 · .6 hidden), centre on top, express pill under it.
 * `rotate` steps the ring every `ordersTokens.stackRotateMs` on `supermall.springs.return` (the reference's 700 ms
 * critically damped move) — V2–V4; V1 holds still.
 */
export function ImageStack({ cards, centre = 0, rotate, express, dim }: { cards: StackCard[]; centre?: number; rotate?: boolean; express?: boolean; dim?: boolean }) {
  const [shift, setShift] = useState(0);
  const n = cards.length;
  const reduce = useReduceMotion();
  useEffect(() => {
    // reduced motion: the stack holds still (as V1)
    if (!rotate || n < 2 || reduce) return;
    const t = window.setInterval(() => setShift((s) => s + 1), ordersTokens.stackRotateMs);
    return () => window.clearInterval(t);
  }, [rotate, n, reduce]);
  const c = (centre + shift) % Math.max(n, 1);
  return (
    <div className={styles.stack} style={{ opacity: dim ? 0.5 : 1 }}>
      {cards.map((card, i) => {
        // signed ring distance from the centre card, in −n/2 … n/2
        let d = (((i - c) % n) + n) % n;
        if (d > n / 2) d -= n;
        const a = Math.min(Math.abs(d), 3);
        const slot = S.slots[a];
        const x = S.slots[0].x + Math.sign(d) * (a === 0 ? 0 : slot.x);
        const l = look(a);
        return (
          <motion.div
            key={card.image + i}
            className={styles.stackCard}
            initial={false}
            animate={{ x, scale: slot.s, opacity: a >= 3 ? 0 : 1, zIndex: 10 - a }}
            transition={{ ...supermall.springs.return, zIndex: { duration: 0 } }}
            style={{ boxShadow: l.shadow }}
          >
            <img src={card.image} alt={a === 0 ? card.title : ''} draggable={false} />
            <span className={styles.stackShade} style={{ background: a === 0 ? ordersVar.imageTint : l.shade }} />
            <span className={styles.stackRing} style={{ borderColor: l.border }} />
            {card.installation && (
              <span className={styles.installBadge}>
                <OriginIcon name="installation-filled" size={12} color={ref.color('textInverse')} />
              </span>
            )}
            {card.qty && card.qty > 1 ? <span className={styles.qtyBadge}>x{card.qty}</span> : null}
          </motion.div>
        );
      })}
      {express && (
        <span className={styles.stackTag} style={{ top: S.tagTop }}>
          <MarketplaceTag kind="express" height={16} />
        </span>
      )}
    </div>
  );
}
