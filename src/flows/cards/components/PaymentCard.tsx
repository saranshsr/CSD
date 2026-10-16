import { motion, type MotionValue } from 'motion/react';
import { cardsImages, type SavedCard } from '../data';
import { formatIssuerName } from '../utils';
import s from './components.module.css';

/** components/PaymentCard — card art (or the default metal skin) with the inner top shadow and issuer name. */
export function PaymentCard({ card, isLoading, onLoad }: { card: SavedCard; isLoading?: boolean; onLoad?: () => void }) {
  const art = card.cardArt?.url ?? cardsImages.defaultCard;
  return (
    <div className={s.card}>
      <div className={s.cardInnerShadowWrap}>
        <div className={s.cardInnerShadow} />
      </div>
      <div className={s.cardTop}>
        <img className={s.cardArt} src={art} alt="" draggable={false} onLoad={onLoad} onError={onLoad} />
        {(card.cardArt?.isDefault ?? true) && card.cardIssuerName && !isLoading && <span className={s.cardIssuer}>{formatIssuerName(card.cardIssuerName)}</span>}
      </div>
    </div>
  );
}

/** components/PaymentCardShimmer — default card under a 10% black cover with a diagonal light sweep (1600ms, linear, infinite). */
export function PaymentCardShimmer({ opacity }: { opacity: MotionValue<number> | number }) {
  return (
    <motion.div className={s.shimmerLayer} style={{ opacity }}>
      <div className={s.shimmer}>
        <img className={s.shimmerCard} src={cardsImages.defaultCard} alt="" draggable={false} />
        <div className={s.shimmerCover} />
        <motion.div className={s.shimmerGradient} initial={{ x: -300 }} animate={{ x: 350 + 150 }} transition={{ duration: 1.6, ease: 'linear', repeat: Infinity }} />
      </div>
    </motion.div>
  );
}
