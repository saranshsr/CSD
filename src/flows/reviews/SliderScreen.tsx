import { motion } from 'motion/react';
import { useState, type CSSProperties } from 'react';
import { Button, Screen } from '../../components';
import { useNav } from '../../kit/Navigator';
import type { ScreenProps } from '../../kit/types';
import { haptic } from '../../motion/haptics';
import { PastOrderCard, ReviewFooter, ReviewHeader } from './components';
import { PastOrdersTitle } from './components/DeckScreenParts';
import { copy, SLIDER_CARDS } from './data';
import { reviewsNav, useReviewParams, type ReviewParams } from './store';
import { reviewsMotion as M } from './tokens';
import styles from './SliderScreen.module.css';

const STEP = M.slider.card + M.slider.gap; // 302

/**
 * Rate past orders — horizontal slider (repo src/screens/PastOrderRatingScreenB.tsx; Figma
 * KzR8dy12uT8CtgBRHHY6Qx · 8810:123358). Reached from Submitted after a variant-B rate review.
 *
 *   X (close) · "Thanks for sharing" / "Rate your other orders on a single tap"
 *   ◄ peek │ current PastOrderCard (286) │ peek ►  — cards 16 apart in one strip, the current one centred, its
 *   neighbours peeking at the edges; the strip glides ±302px per step on repo spring.gentle (.5s, bounce .12).
 *   [ Next ] — kit `outline`, always active; last card → "Continue shopping" → orders.
 *
 * No undo: the previous card stays visible on the left and tapping any peeking card slides straight to it
 * (`tap` haptic). Only the current card takes star taps. (Repo B never wires "Tell us more"; the deck does,
 * so it is wired here too → reviewsNav.tellUsMore.)
 */
export function SliderScreen({ params }: ScreenProps<ReviewParams>) {
  useReviewParams(params);
  const nav = useNav();
  const [current, setCurrent] = useState(0);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const last = current >= SLIDER_CARDS.length - 1;

  const next = () => {
    if (last) return reviewsNav.close(nav);
    setCurrent((i) => i + 1);
  };

  return (
    <Screen
      background="reviewsPage"
      header={<ReviewHeader leading="close" onLeading={() => reviewsNav.close(nav)} />}
      footer={
        <ReviewFooter gutter="tight">
          <Button
            variant="outline"
            size="lg"
            block
            onClick={() => {
              haptic('tap');
              next();
            }}
          >
            {last ? copy.continueShopping : copy.next}
          </Button>
        </ReviewFooter>
      }
    >
      <PastOrdersTitle />
      <div className={styles.stage} style={{ '--reviews-slider-card': `${M.slider.card}px`, '--reviews-slider-gap': `${M.slider.gap}px` } as CSSProperties}>
        <motion.div className={styles.strip} initial={false} animate={{ x: -current * STEP }} transition={M.spring.gentle}>
          {SLIDER_CARDS.map((card, k) => {
            const isCurrent = k === current;
            const rating = ratings[card.id] ?? 0;
            return (
              <div
                key={card.id}
                className={styles.slot}
                data-peek={!isCurrent || undefined}
                role={isCurrent ? undefined : 'button'}
                tabIndex={isCurrent ? undefined : 0}
                aria-label={isCurrent ? undefined : card.name}
                onClick={
                  isCurrent
                    ? undefined
                    : () => {
                        haptic('tap');
                        setCurrent(k);
                      }
                }
              >
                <PastOrderCard
                  card={card}
                  rating={rating}
                  onRate={(n) => setRatings((r) => ({ ...r, [card.id]: n }))}
                  onTellMore={() => reviewsNav.tellUsMore(nav, rating)}
                  interactive={isCurrent}
                />
              </div>
            );
          })}
        </motion.div>
      </div>
    </Screen>
  );
}
