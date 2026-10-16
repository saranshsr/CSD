import { motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { appleSpring, duration, easing, spring } from '../../motion/presets';
import { needHelp as t } from '../../foundations/tokens';
import { OriginIcon } from '../Icon/OriginIcon';
import { Pressable } from '../Pressable/Pressable';
import styles from './NeedHelpButton.module.css';

/** the pill ⇄ circle morph: quick, no visible bounce (SwiftUI response 0.38, damping 0.9) */
const morph = appleSpring(0.38, 0.9);

/**
 * Floating "Need help?" pill (Accounts Figma 4NvyqO60K7Xn4gRJrkWmzQ · 8924:67388): white, 2px blue/200 ring, r36,
 * soft upward shadow, 20px `message` icon in brand blue + Label2 Semibold copy. Pass it as `<Screen overlay>`.
 * `collapsed` (e.g. once the page scrolls) folds it into the 48px icon circle anchored to the right edge: the
 * width springs closed while the label fades and blurs out first; expanding plays it back with the label
 * arriving just behind the width. The icon gives a small press-like pop on every change, and the whole button
 * pops in on mount. `aboveTabBar` lifts it over the bottom tab bar.
 */
export function NeedHelpButton({ collapsed, onPress, label = 'Need help?', aboveTabBar = true }: { collapsed: boolean; onPress: () => void; label?: string; aboveTabBar?: boolean }) {
  // count collapse / expand changes after mount, so the icon pops on each one but not on first render
  const [pops, setPops] = useState(0);
  const prev = useRef(collapsed);
  useEffect(() => {
    if (prev.current === collapsed) return;
    prev.current = collapsed;
    setPops((n) => n + 1);
  }, [collapsed]);
  return (
    <motion.div
      className={styles.dock}
      data-tabbar={aboveTabBar || undefined}
      initial={{ opacity: 0, scale: 0.6, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ ...spring.bouncy, delay: 0.35 }}
      style={{ originX: 1, originY: 1 }}
    >
      <Pressable className={styles.btn} scale={t.pressScale} onClick={onPress} aria-label={label}>
        <motion.span
          // width: the full pill ⇄ the 48 circle; the icon sits at the padding, so it lands centred in the circle
          initial={false}
          animate={{ width: collapsed ? t.size - 2 * t.padding - 2 * t.borderWidth : 'auto' }}
          transition={morph}
          style={{ display: 'flex', alignItems: 'center', gap: t.gap, overflow: 'hidden' }}
        >
          <motion.span
            className={styles.icon}
            key={pops}
            initial={pops ? { scale: 0.82, rotate: collapsed ? -12 : 12 } : false}
            animate={{ scale: 1, rotate: 0 }}
            transition={spring.bouncy}
          >
            <OriginIcon name="message" size={t.iconSize} color={t.icon} />
          </motion.span>
          <motion.span
            className={styles.label}
            initial={false}
            animate={collapsed ? { opacity: 0, x: 8, filter: 'blur(3px)' } : { opacity: 1, x: 0, filter: 'blur(0px)' }}
            transition={collapsed ? { duration: duration.fast, ease: easing.in } : { duration: duration.base, ease: easing.out, delay: 0.08 }}
            aria-hidden={collapsed}
          >
            {label}
          </motion.span>
        </motion.span>
      </Pressable>
    </motion.div>
  );
}
