import { AnimatePresence, motion, useReducedMotionConfig } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { Lottie, OriginIcon, Pressable, Screen } from '../../components';
import type { ScreenProps } from '../../kit/types';
import { useNav } from '../../kit/Navigator';
import { haptic } from '../../motion/haptics';
import { reviewsLotties } from './assets';
import { ReviewHeader } from './components';
import { copy } from './data';
import { reviewsNav, useReviewParams, type ReviewParams } from './store';
import { reviewsAi, reviewsMotion as M } from './tokens';
import styles from './components/AiLoaderScreen.module.css';

/** repo AILoaderScreen inline values */
const LABEL_SHIFT = 4; // label blur cross-fade travels 4px (the other in-place swaps use reviewsMotion.swap.y)
const ICON_POP_FROM = 0.6; // sparkle Lottie out / check badge in: scale .6
const STOP_EXIT_Y = 6;

/**
 * Writing your review — port of repo src/screens/AILoaderScreen.tsx (Figma KzR8dy12uT8CtgBRHHY6Qx · 6305:167731).
 * A full-bleed blurred purple bloom pools at the bottom while "Finangling through your choices" (sparkle Lottie)
 * holds for 2.4s; then the bloom sweeps to the top (1.1s strong in-out), the label blur-swaps to "Review draft
 * generated" with a popping check badge, Stop processing fades away, and after 1.3s the loader is replaced by the
 * draft (reviewsNav.finishGenerating, fade). Back / Stop processing → reviewsNav.stopGenerating (back to rate).
 */
export function AiLoaderScreen({ params }: ScreenProps<ReviewParams>) {
  useReviewParams(params);
  const nav = useNav();
  const reduce = useReducedMotionConfig();
  const [phase, setPhase] = useState<'loading' | 'done'>('loading');
  const done = phase === 'done';
  const left = useRef(false);

  // writing hold → done (sweep) → hand-off; timers cleared if the user stops or leaves
  useEffect(() => {
    if (phase === 'loading') {
      const t = setTimeout(() => {
        haptic('pop'); // the check badge appearing
        setPhase('done');
      }, M.timing.loaderHoldMs);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      if (left.current) return;
      left.current = true;
      reviewsNav.finishGenerating(nav);
    }, M.timing.loaderDoneMs);
    return () => clearTimeout(t);
  }, [phase, nav]);

  const stop = () => {
    if (left.current) return;
    left.current = true;
    reviewsNav.stopGenerating(nav);
  };

  const label = done ? copy.loaderDone : copy.loaderWriting;

  return (
    <Screen background="reviewsPage" safeTop={false} contentStyle={{ paddingBottom: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* sweeping bloom: a 170%-tall layer with the colour pooled in its middle; translating it moves the pool
          from the bottom edge (y 0) to near the top (y −52%) — transform only */}
      <motion.div
        aria-hidden
        className={styles.bloom}
        style={{ left: reviewsAi.bloomInset, right: reviewsAi.bloomInset, height: reviewsAi.bloomHeight, filter: `blur(${reviewsAi.bloomBlur}px)` }}
        initial={false}
        animate={{ y: done ? reviewsAi.bloomRise : '0%' }}
        transition={reduce ? { duration: 0 } : { duration: M.timing.bloomSweep, ease: M.ease.inOut }}
      />

      <div className={styles.layer}>
        <ReviewHeader leading="back" onLeading={stop} />
      </div>

      <div className={styles.center}>
        <div className={styles.label}>
          <AnimatePresence mode="wait">
            {done ? (
              <motion.span
                key="check"
                className={styles.icon}
                initial={reduce ? { opacity: 0 } : { opacity: 0, scale: ICON_POP_FROM }}
                animate={{ opacity: 1, scale: 1 }}
                transition={M.spring.bouncy}
              >
                <OriginIcon name="check-circle-filled" size={20} color="var(--nk-color-reviews-ai-ink)" />
              </motion.span>
            ) : (
              <motion.span key="stars" className={styles.icon} initial={false} exit={reduce ? { opacity: 0 } : { opacity: 0, scale: ICON_POP_FROM }}>
                <Lottie src={reviewsLotties.starsLoading} loop size={18} />
              </motion.span>
            )}
          </AnimatePresence>
          <div className={styles.textSlot}>
            <AnimatePresence mode="wait">
              <motion.span
                key={label}
                className={styles.text}
                data-done={done || undefined}
                initial={reduce ? { opacity: 0 } : { opacity: 0, filter: `blur(${M.swap.blur}px)`, y: LABEL_SHIFT }}
                animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, filter: `blur(${M.swap.blur}px)`, y: -LABEL_SHIFT }}
                transition={{ duration: M.timing.labelSwap, ease: M.ease.out }}
              >
                {label}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>

        <AnimatePresence>
          {!done && (
            <motion.div key="stop" initial={false} exit={reduce ? { opacity: 0 } : { opacity: 0, y: STOP_EXIT_Y }} transition={{ duration: M.scrimFade }}>
              <Pressable
                className={styles.stop}
                onClick={() => {
                  haptic('tap');
                  stop();
                }}
              >
                {copy.stop}
              </Pressable>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Screen>
  );
}
