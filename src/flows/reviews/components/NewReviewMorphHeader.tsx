import { AnimatePresence, motion, useTransform, type MotionValue } from 'motion/react';
import { useLayoutEffect, useRef } from 'react';
import { OriginIcon, Pressable } from '../../../components';
import { layout } from '../../../foundations/tokens';
import { haptic } from '../../../motion/haptics';
import type { ReviewProduct } from '../data';
import { reviewsMotion as M, reviewsTokens as T } from '../tokens';
import { StarRatingInput } from './StarRatingInput';
import { newReviewMotion as NM, newReviewTokens as NT } from './NewReviewTokens';
import styles from './NewReviewMorphHeader.module.css';

export interface NewReviewMorphHeaderProps {
  /** 0 = expanded product row, 1 = docked into the nav bar (scroll progress) */
  progress: MotionValue<number>;
  product: ReviewProduct;
  rating: number;
  onRate: (n: number) => void;
  onClose: () => void;
  /** pinned editor open (Figma 9782-204273): product hides, hairline shows, X → back chevron (exits the editor) */
  editing?: boolean;
  onBack?: () => void;
  /** grow editor / focused note: the X and the product block recede (2px blur, 40%) */
  blurred?: boolean;
}

const mix = (a: number, b: number, p: number) => a + (b - a) * p;

/**
 * NewReview MorphingHeader (repo src/screens/NewReviewScreen.tsx MorphingHeader; Figma 8194-101662). The product
 * (image · name · ★) starts as a full-width row under the X and morphs *in place* into the nav bar as the page scrolls:
 * tile 56×64 r12 → 28×32 r8, name fades out by half-way, stars stay 24px, the block stays centred and rises beside the X.
 * One scroll-progress motion value drives it (no re-render while scrolling). An opaque `border`-grey strip fades in
 * behind the bar so content scrolling under it is masked once docked. The image tile is ReviewProductHeader's look.
 * Sits in `<Screen overlayHeader>`; the root is absolute so only its own parts take taps.
 */
export function NewReviewMorphHeader({ progress, product, rating, onRate, onClose, editing = false, onBack, blurred = false }: NewReviewMorphHeaderProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const width = useRef<number>(layout.deviceWidth);
  useLayoutEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const measure = () => (width.current = el.clientWidth || width.current);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const g = T.gutter;
  const m = NT.morph;
  const top = useTransform(progress, [0, 1], [...m.top]);
  const left = useTransform(progress, (p) => mix(g, (width.current - m.dockedWidth) / 2, p));
  const blockWidth = useTransform(progress, (p) => mix(width.current - 2 * g, m.dockedWidth, p));
  const imgW = useTransform(progress, [0, 1], [T.headerImage.width, T.dockedImage.width]);
  const imgH = useTransform(progress, [0, 1], [T.headerImage.height, T.dockedImage.height]);
  const imgR = useTransform(progress, [0, 1], [...m.imageRadius]);
  const gap = useTransform(progress, [0, 1], [...m.rowGap]);
  const nameOpacity = useTransform(progress, [0, 0.5], [1, 0]);
  const nameHeight = useTransform(progress, [0, 1], [m.nameHeight, 0]);
  const nameGap = useTransform(progress, [0, 1], [m.nameGap, 0]);
  const stripOpacity = progress;

  const dim = blurred ? { filter: `blur(${NM.dim.blur}px)`, opacity: NM.dim.opacity } : { filter: 'blur(0px)', opacity: 1 };

  return (
    <div ref={hostRef} className={styles.host}>
      <motion.div className={styles.strip} style={{ opacity: stripOpacity }} />
      <div className={styles.stage}>
        <motion.div className={styles.hairline} initial={false} animate={{ opacity: editing ? 1 : 0 }} transition={{ duration: M.duration.fast, ease: M.ease.out }} />

        <motion.div className={styles.leadWrap} initial={false} animate={dim} transition={NM.dimFade}>
          <Pressable
            className={styles.lead}
            aria-label={editing ? 'Back' : 'Close'}
            onClick={() => {
              haptic('tap');
              (editing ? onBack : onClose)?.();
            }}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={editing ? 'back' : 'close'}
                className={styles.leadIcon}
                initial={{ opacity: 0, scale: NM.iconSwapFrom }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: NM.iconSwapFrom }}
                transition={{ duration: M.duration.fast, ease: M.ease.out }}
              >
                <OriginIcon name={editing ? 'chevron-left' : 'cross'} size={20} className={editing ? 'nk-flip-rtl' : undefined} />
              </motion.span>
            </AnimatePresence>
          </Pressable>
        </motion.div>

        <motion.div
          className={styles.product}
          data-editing={editing || undefined}
          style={{ top, left, width: blockWidth, gap }}
          initial={false}
          animate={editing ? { opacity: 0, filter: 'blur(0px)' } : dim}
          transition={{ duration: M.duration.fast, ease: M.ease.out }}
        >
          <motion.div className={styles.image} style={{ width: imgW, height: imgH, borderRadius: imgR }}>
            <img src={product.image} alt="" />
          </motion.div>
          <div className={styles.info}>
            <motion.span className={styles.name} style={{ opacity: nameOpacity, height: nameHeight, marginBottom: nameGap }}>
              {product.name}
            </motion.span>
            <StarRatingInput value={rating} onChange={onRate} gap={4} label={`Rate ${product.name}`} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
