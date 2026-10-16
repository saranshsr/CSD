import { motion } from 'motion/react';
import { handoff, supermall } from '../../../motion/presets';
import styles from '../orders.module.css';

/** Delivery PIN: 20×26 r6 blue tiles, 2px apart, 12/700/18 white digits; tiles rise in one by one on the move spring. */
export function PinTiles({ pin, delay = supermall.reveal.delay }: { pin: string; delay?: number }) {
  return (
    <span className={styles.pinTiles} aria-label={`Delivery PIN ${pin.split('').join(' ')}`}>
      {pin.split('').map((d, i) => (
        <motion.span
          key={i}
          className={styles.pinTile}
          initial={{ opacity: 0, y: -handoff.travel / 2 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ y: { ...handoff.spring, delay: delay + i * handoff.stagger.in }, opacity: { duration: handoff.fade.out, ease: handoff.easeOut, delay: delay + i * handoff.stagger.in } }}
        >
          {d}
        </motion.span>
      ))}
    </span>
  );
}
