import { motion } from 'motion/react';
import { MaskIcon } from '../../../components';
import { ref } from '../../../foundations/tokens';
import paperclip from '@assets/reviews/paperclip.svg';
import { reviewsDraft as D } from '../tokens.draft';
import { reviewsMotion as M } from '../tokens';
import { StarRatingInput } from './StarRatingInput';
import styles from './DraftProductTop.module.css';

/**
 * DraftProductTop — the grey top of ReviewDraft A's review card (repo src/screens/ReviewDraftScreen.tsx ReviewCard
 * top + ProductPhoto + StarRow; Figma KzR8dy12uT8CtgBRHHY6Qx · 7116:43933 / 7116:43969): product name 14/20 Medium
 * `textMuted` on one line, read-only 24px stars that pop in (250ms + 70ms apart), and the tilted polaroid with its
 * paperclip springing in (scale .6 / −8° → 7.67°, bouncy .58, 180ms). Sits above `DraftCard look="review"` via `header`.
 */
export function DraftProductTop({ product, rating }: { product: { image: string; name: string }; rating: number }) {
  const P = D.polaroid;
  return (
    <div className={styles.top}>
      <div className={styles.text}>
        <span className={styles.name}>{product.name}</span>
        <StarRatingInput value={rating} gap={4} appear />
      </div>
      <motion.div
        className={styles.polaroid}
        style={{ width: P.width, height: P.height }}
        initial={{ opacity: 0, ...P.from }}
        animate={{ opacity: 1, scale: 1, rotate: P.rotate, y: 0 }}
        transition={{ ...P.spring, delay: P.delay }}
        whileHover={{ ...P.hover, transition: M.spring.gentle }}
        whileTap={{ scale: P.press, transition: M.spring.snappy }}
      >
        <div className={styles.photo}>
          <img src={product.image} alt="Product" style={{ width: P.image.width, height: P.image.height }} />
        </div>
        <MaskIcon src={paperclip} width={P.clip.width} height={P.clip.height} color={ref.color('textSecondary')} className={styles.clip} style={{ rotate: `${P.clip.rotate}deg` }} />
      </motion.div>
    </div>
  );
}
