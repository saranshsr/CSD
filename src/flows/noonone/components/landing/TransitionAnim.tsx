import { animate, motion, useMotionValue } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import successLottie from '@assets/vip/vip-landing-success-animation.lottie';
import { landingTokens } from '../../tokens';
import { LottieBox } from './modules';
import styles from './landing.module.css';

const t = landingTokens.transition;

/**
 * features/vip/components/VIPTransitionAnim (success): full-screen lottie (cover); title / subtitle rise 60px and fade in at
 * 70% / 72.5% of 4s (450ms out-sine); on lottie end (fallback 4s + 700ms) fade out 500ms after 200ms, then `onComplete`
 * (the landing springs its content back: contentAnim → 0, stiffness 80).
 */
export function TransitionAnim({ message, onFadeStart, onComplete }: { message?: { title: string; subtitle: string }; onFadeStart?: () => void; onComplete: () => void }) {
  const opacity = useMotionValue<number>(1);
  const [done, setDone] = useState(false);
  const fading = useRef(false);

  const fadeOut = () => {
    if (fading.current) return;
    fading.current = true;
    animate(opacity, 0, { duration: t.fadeOutMs / 1000, delay: t.fadeOutDelayMs / 1000, ease: t.fadeEase }).then(() => {
      setDone(true);
      onFadeStart?.();
      onComplete();
    });
  };

  useEffect(() => {
    const id = setTimeout(fadeOut, t.successMs + t.fadeOutDelayMs + t.fadeOutMs);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (done) return null;
  const text = (delay: number) => ({
    initial: { opacity: 0, y: 0 },
    animate: { opacity: 1, y: t.textRise },
    transition: { duration: t.textMs / 1000, ease: t.textEase, delay: (t.successMs * delay) / 1000 },
  });
  return (
    <motion.div className={styles.transition} style={{ opacity }}>
      <LottieBox src={successLottie} fit="cover" onComplete={fadeOut} className={styles.fill} />
      {message && (message.title || message.subtitle) && (
        <div className={styles.transitionText}>
          {message.title && (
            <motion.span className={styles.transitionTitle} {...text(t.topDelay)}>
              {message.title}
            </motion.span>
          )}
          {message.subtitle && (
            <motion.span className={styles.transitionSubtitle} {...text(t.bottomDelay)}>
              {message.subtitle}
            </motion.span>
          )}
        </div>
      )}
    </motion.div>
  );
}
