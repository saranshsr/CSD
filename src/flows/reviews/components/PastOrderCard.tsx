import { AnimatePresence, motion } from 'motion/react';
import { OriginIcon, Pressable } from '../../../components';
import { ref } from '../../../foundations/tokens';
import { copy, type PastOrder } from '../data';
import { reviewsMotion as M, reviewsTokens } from '../tokens';
import { StarRatingInput } from './StarRatingInput';
import styles from './PastOrderCard.module.css';

export interface PastOrderCardProps {
  card: PastOrder;
  /** 0 = not rated yet */
  rating: number;
  onRate: (n: number) => void;
  /** "Tell us more" (shown once rated) */
  onTellMore?: () => void;
  /** only the front / current card takes taps */
  interactive?: boolean;
  /** image box height (repo 301 at a 286-wide card) */
  imageHeight?: number;
}

/**
 * PastOrderCard — one past order to rate in a single tap (repo src/screens/PastOrderRatingScreen.tsx OrderCard,
 * shared by the stacked deck and PastOrderRatingScreenB's slider; Figma KzR8dy12uT8CtgBRHHY6Qx · 8842:127140,
 * 8810:123358). White r16 card (0 1px 8px black 4%), 301h `bgSubtle` image box, 14/20 Medium name, 32px stars
 * 6 apart; once rated a blue "✎ Tell us more" text button unfolds (0 → 28px on repo spring.snappy). Width is
 * the caller's (repo 286).
 */
export function PastOrderCard({ card, rating, onRate, onTellMore, interactive = true, imageHeight = reviewsTokens.deckCard.image }: PastOrderCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.media} style={{ height: imageHeight }}>
        <img src={card.image} alt="" draggable={false} />
      </div>
      <div className={styles.info}>
        <span className={styles.name}>{card.name}</span>
        <StarRatingInput value={rating} onChange={interactive ? onRate : undefined} size={reviewsTokens.stars.deck} gap={6} label={`Rate ${card.name}`} />
      </div>
      <AnimatePresence initial={false}>
        {rating > 0 && (
          <motion.div key="more" className={styles.more} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 28 }} exit={{ opacity: 0, height: 0 }} transition={M.spring.snappy}>
            <Pressable className={styles.moreBtn} scale={interactive ? undefined : 1} onClick={interactive ? onTellMore : undefined}>
              <OriginIcon name="edit" size={20} color={ref.color('primary')} />
              {copy.tellUsMore}
            </Pressable>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
