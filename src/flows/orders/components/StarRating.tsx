import { motion } from 'motion/react';
import { useState } from 'react';
import { DashedDivider, OriginIcon } from '../../../components';
import { ref } from '../../../foundations/tokens';
import { useNav } from '../../../kit/Navigator';
import { haptic } from '../../../motion/haptics';
import { spring } from '../../../motion/presets';
import { openReview } from '../../reviews/store';
import { reviewsMotion } from '../../reviews/tokens';
import type { Order } from '../data';
import styles from '../orders.module.css';

/**
 * "What would you rate it?" row (PDS reference): dashed `#EAECF0` 5/5 divider, 13/500/20 prompt, five 24px outline
 * stars 2px apart. A tap fills the stars up to it, pops the tapped one (`spring.bouncy`, haptic `tick`) and, once the
 * pop lands (`reviewsMotion.timing.orderStarPushMs`), opens the review via `openReview` from the reviews flow.
 */
export function StarRating({ order, initial = 0 }: { order: Order; initial?: number }) {
  const nav = useNav();
  const [value, setValue] = useState(initial);
  const [popped, setPopped] = useState(0);
  const rate = (i: number) => {
    setValue(i);
    setPopped(i);
    haptic('tick');
    window.setTimeout(() => openReview(nav, { orderId: order.id, rating: i, ...(order.reviewProduct ? { product: order.reviewProduct } : {}) }), reviewsMotion.timing.orderStarPushMs);
  };
  return (
    <div className={styles.rating}>
      <DashedDivider color={ref.color('border')} inset={4} dash={5} />
      <div className={styles.ratingRow}>
        <span className={styles.ratingLabel}>What would you rate it?</span>
        <span className={styles.stars}>
          {[1, 2, 3, 4, 5].map((i) => (
            <motion.button
              key={i}
              type="button"
              className={styles.star}
              aria-label={`Rate ${i} star${i > 1 ? 's' : ''}`}
              onClick={() => rate(i)}
              animate={popped === i ? { scale: [1, 1.25, 1] } : { scale: 1 }}
              transition={spring.bouncy}
              onAnimationComplete={() => setPopped(0)}
            >
              <OriginIcon name="star" filled={i <= value} size={24} color={i <= value ? ref.color('starMid') : ref.color('borderStrong')} />
            </motion.button>
          ))}
        </span>
      </div>
    </div>
  );
}
