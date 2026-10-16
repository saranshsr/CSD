import { motion } from 'motion/react';
import { OriginIcon, Pressable } from '../../../components';
import { appleSpring, duration, supermall } from '../../../motion/presets';
import { heatAdvice, type HeroVariant } from '../data';
import styles from '../orders.module.css';
import { ordersTokens } from '../tokens';

/** pill grows with ≈3% overshoot, like the reference (136×18 → 280×37 → 272×36) */
const grow = appleSpring(0.42, 0.78);
const H = ordersTokens.heat;

/**
 * Delivery-window pill under the headline. V1: white 40h pill, 14/600/20 + info. V2–V4 ("hot afternoon"): a 36h pill
 * that grows from a dot (V2/V4 glass, V3 orange gradient with a glow), its letters blur in one by one, then the heat
 * advice line fades up under it — beats measured from the reference (`ordersTokens.heat`, seconds after the page).
 */
export function WindowPill({ variant, text, heatText, onInfo }: { variant: HeroVariant; text: string; heatText: string; onInfo: () => void }) {
  const t0 = supermall.reveal.delay;
  if (variant === 1) {
    return (
      <div className={styles.windowArea}>
        <Pressable className={styles.windowPill} scale={0.98} onClick={onInfo}>
          {text}
          <OriginIcon name="info-circle" size={20} />
        </Pressable>
      </div>
    );
  }
  const letters = [...heatText];
  return (
    <div className={styles.windowArea} data-heat>
      <motion.div
        style={{ position: 'absolute', inset: 0 }}
        initial={{ opacity: 0, scaleX: 0.5, scaleY: 0.5 }}
        animate={{ opacity: 1, scaleX: 1, scaleY: 1 }}
        transition={{ scaleX: { ...grow, delay: t0 + H.pillAt }, scaleY: { ...grow, delay: t0 + H.pillAt }, opacity: { duration: duration.base, delay: t0 + H.pillAt } }}
      >
        <Pressable className={styles.heatPill} data-v={variant} scale={0.98} onClick={onInfo}>
          {variant === 3 && <span className={styles.heatPillFill} style={{ background: ordersTokens.heatPill, boxShadow: ordersTokens.heatPillGlow }} />}
          <span aria-label={heatText}>
            {letters.map((ch, i) => (
              <motion.span
                key={i}
                className={styles.letter}
                aria-hidden
                initial={{ opacity: 0, y: H.letterY, filter: `blur(${H.blur}px)` }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: H.letterMove, ease: supermall.ease.textIn, delay: t0 + H.lettersAt + i * H.letterStagger }}
              >
                {ch}
              </motion.span>
            ))}
          </span>
          <OriginIcon name="info-circle" size={18} />
        </Pressable>
      </motion.div>
      <motion.p
        className={styles.advice}
        initial={{ opacity: 0, y: H.adviceY, filter: `blur(${H.blur}px)` }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: H.adviceMove, ease: supermall.ease.soft, delay: t0 + H.adviceAt }}
      >
        <b>{heatAdvice.lead}</b> {heatAdvice.rest}
      </motion.p>
    </div>
  );
}
