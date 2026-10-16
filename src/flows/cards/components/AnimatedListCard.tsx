import { animate, motion, useMotionValue, useTransform, type MotionValue } from 'motion/react';
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { t, type SavedCard } from '../data';
import { cardsEasing, cardsMetrics, cardsTimings } from '../tokens';
import { formatMasked } from '../utils';
import { PaymentCard, PaymentCardShimmer } from './PaymentCard';
import s from './components.module.css';

const ms = (n: number) => n / 1000;
const H = cardsMetrics.cardHeight;
const FINAL_CARD_SCALE = 0.9;
const PHASE1_END = cardsTimings.firstRound / cardsTimings.full;
const PHASE2_END = (cardsTimings.firstRound + cardsTimings.waitBetweenRounds) / cardsTimings.full;
/** PaymentAnimationMetrics.interpolationMax() = window height − 200 */
export const INTERPOLATION_MAX = 844 - 200;

/** Extrapolation.CLAMP piecewise-linear interpolate (reanimated `interpolate`). */
function lerp(v: number, input: number[], output: number[]) {
  if (v <= input[0]) return output[0];
  for (let i = 1; i < input.length; i++) {
    if (v <= input[i]) {
      const span = input[i] - input[i - 1] || 1;
      return output[i - 1] + ((v - input[i - 1]) / span) * (output[i] - output[i - 1]);
    }
  }
  return output[output.length - 1];
}

export interface AnimatedListCardHandle {
  /** element used to measure the card's on-screen position */
  el: HTMLDivElement | null;
}

type Props = {
  card: SavedCard;
  index: number;
  isInFirstSection: boolean;
  isLastInSection: boolean;
  firstSectionCount: number;
  /** id of the card whose actions overlay is open */
  activeId: string | null;
  /** listHeight / scroll metrics captured when this card was selected */
  selection: { moveUp: number; moveDown: number } | null;
  overScroll: MotionValue<number>;
  /** scroll position ≤ listHeight / 4 — only then do the other cards fold up */
  topStackVisible: boolean;
  isLoading: boolean;
  onLoad: () => void;
  onSelect: () => void;
};

/**
 * components/PaymentAnimatedListCard + animatedStyles.ts.
 *  • selection: 160ms fly to the top with a −20° tilt and 0.9 scale, 40ms hold, 170ms drop above the actions panel
 *  • other first-section cards fold up by 30% of a card height per index, other sections fade out
 *  • pull-down over-scroll fans the stack open (rotateX up to −50°, +30pt per index)
 *  • shimmer fades from the front card backwards (120ms stagger) followed by a 5pt bounce
 */
export const AnimatedListCard = forwardRef<AnimatedListCardHandle, Props>(function AnimatedListCard(
  { card, index, isInFirstSection, isLastInSection, firstSectionCount, activeId, selection, overScroll, topStackVisible, isLoading, onLoad, onSelect },
  ref,
) {
  const el = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => ({
    get el() {
      return el.current;
    },
  }));

  const isSelected = activeId === card.id;
  const isOtherSelected = !!activeId && !isSelected;

  const phase = useMotionValue(0); // transitionPhaseAmount
  const selectedOverlay = useMotionValue(0);
  const other = useMotionValue(0); // nonSelectedPhase
  const shimmer = useMotionValue(isLoading ? 1 : 0);
  const bounce = useMotionValue(0);
  const dest = useRef({ moveUp: 0, moveDown: 0 });
  if (selection && isSelected) dest.current = selection;

  useEffect(() => {
    const c1 = animate(phase, isSelected ? 1 : 0, { duration: ms(cardsTimings.full), ease: cardsEasing.inOutQuad });
    const c2 = animate(selectedOverlay, isSelected ? 1 : 0, { duration: ms(cardsTimings.firstRound), ease: cardsEasing.inOutQuad });
    return () => {
      c1.stop();
      c2.stop();
    };
  }, [isSelected, phase, selectedOverlay]);

  useEffect(() => {
    if (!topStackVisible) {
      other.set(0);
      return;
    }
    const c = isOtherSelected
      ? animate(other, 1, { delay: ms(cardsTimings.firstRound), duration: ms(cardsTimings.waitBetweenRounds + cardsTimings.secondRound), ease: cardsEasing.inOutQuad })
      : animate(other, 0, { duration: ms(cardsTimings.full), ease: cardsEasing.inOutQuad });
    return () => c.stop();
  }, [isOtherSelected, topStackVisible, other]);

  // useAnimatedReaction on isLoading
  const wasLoading = useRef(isLoading);
  useEffect(() => {
    if (isLoading) {
      shimmer.set(1);
      bounce.set(0);
    } else if (wasLoading.current) {
      if (isInFirstSection) {
        const reverseIndex = firstSectionCount - 1 - index;
        const delay = ms(reverseIndex * cardsTimings.bounceStagger);
        animate(shimmer, 0, { delay, duration: ms(cardsTimings.shimmerFade) });
        animate(bounce, [0, -5, 0], { delay: delay + ms(cardsTimings.shimmerFade), duration: 0.3, ease: cardsEasing.outEase, times: [0, 0.5, 1] });
      } else {
        animate(shimmer, 0, { duration: ms(cardsTimings.shimmerFade) });
      }
    } else {
      shimmer.set(0);
    }
    wasLoading.current = isLoading;
  }, [isLoading, isInFirstSection, firstSectionCount, index, shimmer, bounce]);

  const transform = useTransform(() => {
    const p = phase.get();
    const { moveUp, moveDown } = dest.current;
    const up = isLastInSection ? 0 : moveUp;
    const selectionRotation = isLastInSection ? 0 : -20;
    const selY = lerp(p, [0, PHASE1_END, PHASE2_END, 1], [0, up, up, moveDown]);
    const selRot = lerp(p, [0, PHASE1_END * 0.4, PHASE1_END], [0, selectionRotation, 0]);
    const scale = lerp(p, [0, PHASE1_END * 0.5, PHASE1_END], [1, 0.98, FINAL_CARD_SCALE]);

    let overY = 0;
    let overRot = 0;
    const o = overScroll.get();
    if (!activeId) {
      const ai = isInFirstSection ? index : 1;
      overY = lerp(o, [-INTERPOLATION_MAX, 0, INTERPOLATION_MAX], [isInFirstSection ? 0 : 15 * -ai, 0, 30 * ai]);
      if (isInFirstSection) overRot = -lerp(o, [0, INTERPOLATION_MAX], [0, 50]);
    }
    const otherPhase = isSelected ? 0 : other.get();
    const nonSelY = lerp(otherPhase, [0, 1], [0, isInFirstSection ? -H * 0.3 * index : 30]);
    return `perspective(1000px) translateY(${overY + selY + nonSelY + bounce.get()}px) rotateX(${overRot + selRot}deg) scale(${scale})`;
  });
  const opacity = useTransform(() => (isInFirstSection ? 1 : 1 - (isSelected ? 0 : other.get())));
  const titleOpacity = useTransform(selectedOverlay, (v) => 1 - v);
  const masked = formatMasked(card.ccMasked);

  return (
    <motion.div
      ref={el}
      role="button"
      tabIndex={0}
      aria-label={`${card.isDefault ? `${t.default} ` : ''}${masked}`}
      data-card-id={card.id}
      className={s.listCard}
      style={{ transform, opacity, zIndex: isSelected ? 8 : 1 }}
      onClick={onSelect}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect()}
    >
      <motion.div className={s.listCardBorder} style={{ opacity: selectedOverlay }} />
      <PaymentCard card={card} onLoad={onLoad} />
      <motion.div className={s.listCardTitle} style={{ opacity: titleOpacity }}>
        <span className={s.listCardTitleText}>{card.isDefault ? `${t.default}  |  ${masked}` : masked}</span>
      </motion.div>
      {card.isDefault && (
        <motion.div className={s.listCardTitle} style={{ opacity: selectedOverlay }}>
          <span className={s.listCardTitleText}>{t.default}</span>
        </motion.div>
      )}
      <PaymentCardShimmer opacity={shimmer} />
    </motion.div>
  );
});

export { lerp };
