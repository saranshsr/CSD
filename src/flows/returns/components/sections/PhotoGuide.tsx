import { motion } from 'motion/react';
import { useEffect, useState, type ReactNode } from 'react';
import { easing } from '../../../../motion/presets';
import { icons } from '../../assets';
import { copy } from '../../data';
import { Svg, Tap } from '../AFSButton';
import styles from '../../submit.module.css';
import { useReduceMotion } from '../../../../motion/reducedMotion';

/** constants/afsReturnsPhotoGuideCarousel.ts slot geometry (front 69 at 12/0, next 57 at 14/6 · 0.2, prev 57 at 0/8 · 0.2) */
const SLOTS = [
  { x: 12, y: 0, size: 69, opacity: 1, z: 3, border: 1.2 },
  { x: 14, y: 6, size: 57, opacity: 0.2, z: 2, border: 1 },
  { x: 0, y: 8, size: 57, opacity: 0.2, z: 1, border: 1 },
];
const HIDDEN = { x: -8, y: 8, size: 57, opacity: 0, z: 0, border: 1 };
const INTERVAL = 3000;
const DURATION = 0.45;

function useAutoIndex(count: number, interval: number) {
  const [i, setI] = useState(0);
  const reduce = useReduceMotion();
  useEffect(() => {
    // reduced motion: the first tip / photo stays (no auto-advance)
    if (count <= 1 || reduce) return;
    const t = setInterval(() => setI((v) => v + 1), interval);
    return () => clearInterval(t);
  }, [count, interval, reduce]);
  return i;
}

/** sections/AFSReturnsEvidenceSection/components/AFSReturnsPhotoGuideCarousel — stacked photos + "Tips" caption + chevron */
export function PhotoGuideCarousel({ photos, captions, onPress }: { photos: ReactNode[]; captions: string[]; onPress: () => void }) {
  const n = photos.length;
  const active = useAutoIndex(n, INTERVAL);
  const caption = captions[active % captions.length];
  return (
    <Tap className={styles.guide} onPress={onPress}>
      <span className={styles.guideStack}>
        {photos.map((ph, i) => {
          const rel = (((i - active) % n) + n) % n; // 0 front, 1 next, n-1 prev
          const s = rel === 0 ? SLOTS[0] : rel === 1 ? SLOTS[1] : rel === n - 1 ? SLOTS[2] : HIDDEN;
          return (
            <motion.span
              key={i}
              className={styles.guideFrame}
              initial={false}
              animate={{ x: s.x, y: s.y, width: s.size, height: s.size, opacity: s.opacity, borderWidth: s.border }}
              transition={{ duration: DURATION, ease: easing.out }}
              style={{ zIndex: s.z, borderRadius: s.size === 69 ? 12 : 10 }}
            >
              {ph}
            </motion.span>
          );
        })}
      </span>
      <span className={styles.guideContent}>
        <span className={styles.guideTips}>{copy.photoGuideTips}</span>
        <motion.span key={caption} className={styles.guideCaption} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: DURATION, ease: easing.out }}>
          {caption}
        </motion.span>
      </span>
      <span className={styles.guideChevron}>
        <Svg src={icons.chevronRightPrimary} size={20} flipRtl />
      </span>
    </Tap>
  );
}

/** features/afs/common/components/AFSDepthCarousel (cards 108×108, autoSwipe 2000 ms) — simplified depth stack */
export function DepthCarousel({ items }: { items: ReactNode[] }) {
  const n = items.length;
  const active = useAutoIndex(n, 2000);
  return (
    <div className={styles.depth}>
      <div className={styles.depthStage}>
        {items.map((it, i) => {
          const rel = (((i - active) % n) + n) % n;
          const pos = rel === 0 ? 0 : rel === 1 ? 1 : rel === n - 1 ? -1 : 2;
          return (
            <motion.div
              key={i}
              className={styles.depthCard}
              initial={false}
              animate={{ x: pos * 64, scale: pos === 0 ? 1 : 0.8, opacity: Math.abs(pos) > 1 ? 0 : pos === 0 ? 1 : 0.5, zIndex: pos === 0 ? 3 : 1 }}
              transition={{ duration: DURATION, ease: easing.out }}
            >
              {it}
            </motion.div>
          );
        })}
      </div>
      <div className={styles.depthDots}>
        {items.map((_, i) => (
          <span key={i} className={[styles.depthDot, i === active % n && styles.depthDotOn].filter(Boolean).join(' ')} />
        ))}
      </div>
    </div>
  );
}
