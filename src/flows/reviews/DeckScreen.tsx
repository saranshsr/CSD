import { motion, type PanInfo } from 'motion/react';
import { useState } from 'react';
import { Button, Screen } from '../../components';
import { useNav } from '../../kit/Navigator';
import type { ScreenProps } from '../../kit/types';
import { haptic } from '../../motion/haptics';
import { PastOrderCard, ReviewFooter, ReviewHeader } from './components';
import { PastOrdersTitle } from './components/DeckScreenParts';
import { copy, DECK_CARDS } from './data';
import { reviewsNav, useReviewParams, type ReviewParams } from './store';
import { reviewsMotion as M, reviewsTokens } from './tokens';
import styles from './DeckScreen.module.css';

const D = M.deck;

/**
 * Rate past orders — stacked deck (repo src/screens/PastOrderRatingScreen.tsx; Figma KzR8dy12uT8CtgBRHHY6Qx ·
 * 8842:127140 "Past order rating- option3"). Reached from Submitted after a bike review (`reviewsNav.afterSubmit`).
 *
 *   X (close) · "Thanks for sharing" / "Rate your other orders on a single tap"
 *   Deck: the front PastOrderCard (286 wide) with two cards peeking ABOVE it — y 0 / −8 / −15, scale 1 / .9 / .8,
 *   origin top centre, so the lips stay put while the front card grows at the bottom ("Tell us more" unfolds).
 *   [ Next ] — kit `outline` (white, #d6e9ff border, blue label), always active; last card → "Continue shopping".
 *
 * Mechanics 1:1 with the repo: the deck never re-orders, a `current` pointer walks the list. Cards before it are
 * history, thrown off to the left (x −440, −8°, faded) and spring back with their rating intact. Every card
 * animates to its slot on repo spring.gentle (.5s, bounce .12). Swipe the front card left (> 90px or > 500px/s)
 * = next, right = previous (no undo button); `dragElastic` .7, snaps back to origin otherwise. Next mirrors the
 * left swipe. Haptics: `snap` when a swipe changes the card, `tap` on Next; star changes `tick` (StarRatingInput).
 */
export function DeckScreen({ params }: ScreenProps<ReviewParams>) {
  useReviewParams(params);
  const nav = useNav();
  const [current, setCurrent] = useState(0);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const last = current >= DECK_CARDS.length - 1;

  const next = () => {
    if (last) return reviewsNav.close(nav);
    setCurrent((i) => i + 1);
  };
  const undo = () => setCurrent((i) => Math.max(0, i - 1));

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -D.swipeDist || info.velocity.x < -D.swipeVelocity) {
      if (!last) haptic('snap');
      next();
    } else if (info.offset.x > D.swipeDist || info.velocity.x > D.swipeVelocity) {
      if (current > 0) haptic('snap');
      undo();
    }
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
      <div className={styles.stage}>
        <div className={styles.deck}>
          {DECK_CARDS.map((card, k) => {
            const pos = k - current; // < 0 history · 0 front · 1, 2 behind · ≥ 3 hidden
            const slot = Math.min(Math.max(pos, 0), 2);
            const front = pos === 0;
            const target =
              pos < 0
                ? { x: D.throwX, y: 0, rotate: D.throwRotate, scale: 1, opacity: 0 }
                : { x: 0, y: D.y[slot], rotate: 0, scale: D.scale[slot], opacity: pos > 2 ? 0 : 1 };
            const rating = ratings[card.id] ?? 0;
            return (
              <motion.div
                key={card.id}
                className={styles.slot}
                data-front={front || undefined}
                style={{ width: reviewsTokens.deckCard.width, zIndex: DECK_CARDS.length - pos }}
                initial={false}
                animate={target}
                transition={M.spring.gentle}
                drag={front ? 'x' : false}
                dragSnapToOrigin
                dragElastic={D.elastic}
                onDragEnd={front ? onDragEnd : undefined}
                aria-hidden={!front || undefined}
              >
                <PastOrderCard
                  card={card}
                  rating={rating}
                  onRate={(n) => setRatings((r) => ({ ...r, [card.id]: n }))}
                  onTellMore={() => reviewsNav.tellUsMore(nav, rating)}
                  interactive={front}
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </Screen>
  );
}
