import { motion } from 'motion/react';
import { useLayoutEffect, useRef, useState } from 'react';
import { checkoutServerColors } from '../tokens';
import styles from './rewards.module.css';

const SHIMMER_GRADIENT_WIDTH = 15;
/** reanimated withTiming default easing: Easing.inOut(Easing.quad) */
const IN_OUT_QUAD = [0.455, 0.03, 0.515, 0.955] as const;

/**
 * NoonCheckoutTag (payment methods + provider callouts): pill (16h, r12, 12/600 white lh14) pinned at top -2 /
 * start -2, solid or gradient background (DEFAULT_SOLID #000000); a 15px secondaryBackgroundColor band
 * (40% opacity, rotated 20°, scaleY 1.5) sweeps across: withRepeat(withDelay(1500, withTiming(width + 15, 800))).
 */
export function CheckoutTag({ tag }: { tag: { message: string; colors: string[] } }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => setWidth(ref.current?.offsetWidth ?? 0), [tag.message]);
  const colors = tag.colors.length ? tag.colors : [checkoutServerColors.black];
  return (
    <span ref={ref} className={styles.tag} style={{ background: colors.length > 1 ? `linear-gradient(90deg, ${colors.join(', ')})` : colors[0] }}>
      <span className={styles.tagMessage}>{tag.message}</span>
      {width > 0 && (
        <motion.span
          className={styles.tagShimmer}
          initial={{ x: 0 }}
          animate={{ x: width + SHIMMER_GRADIENT_WIDTH }}
          transition={{ duration: 0.8, delay: 1.5, repeat: Infinity, repeatDelay: 1.5, ease: IN_OUT_QUAD }}
        />
      )}
    </span>
  );
}
