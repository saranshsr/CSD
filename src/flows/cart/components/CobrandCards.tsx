import { useCallback, useEffect, useRef } from 'react';
import { HtmlText, Pressable } from '../../../components';
import { useNav } from '../../../kit/Navigator';
import diamond from '@assets/cart/cobrand/diamond.svg';
import diamondLight from '@assets/cart/cobrand/diamond-light.svg';
import diamondShade from '@assets/cart/cobrand/diamond-shade.svg';
import type { CobrandCard } from '../data';
import styles from './cobrand.module.css';
import { useReduceMotion } from '../../../motion/reducedMotion';

const AUTO_SCROLL_INTERVAL = 3000; // NoonCartCobrandCards AUTO_SCROLL_INTERVAL

/**
 * NoonCartCobrandCards (master), styled to All flows "Cobrand" (Af34gfmhQ1D0wstXUEHSIF · 127:40071):
 * a paging row of 351×138 white r16 cards — title B16/Bold, diamond-bullet terms B12/Regular #475067, the
 * M-NeutralButton CTA (#101628, h36, r8, A12/SemiBold) and the card artwork on the right.
 * Behaviour from master: with more than one card the list is tripled and starts on the middle copy, auto-advances
 * every 3s while on screen, snaps back into the middle copy after each move, and stops for good once the user drags.
 * Tapping a card follows `linkUrl` (ModuleHelper.handlePress → here a toast, the kit has no cobrand flow).
 */
export function CobrandCards({ cards }: { cards: CobrandCard[] }) {
  const nav = useNav();
  const listRef = useRef<HTMLDivElement>(null);
  const multi = cards.length > 1;
  const pages = multi ? [...cards, ...cards, ...cards] : cards;
  const index = useRef(multi ? cards.length : 0);
  const stopped = useRef(false);

  const scrollToIndex = useCallback((i: number, smooth: boolean) => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: smooth ? 'smooth' : 'auto' });
  }, []);

  // initialScrollIndex = cards.length
  useEffect(() => {
    if (multi) scrollToIndex(index.current, false);
  }, [multi, scrollToIndex]);

  const reduce = useReduceMotion();
  useEffect(() => {
    // reduced motion: no auto-scroll (still swipeable)
    if (!multi || reduce) return;
    const id = window.setInterval(() => {
      if (stopped.current) return;
      if (index.current < cards.length || index.current >= cards.length * 2) {
        index.current = cards.length + (index.current % cards.length);
        scrollToIndex(index.current, false);
      }
      index.current += 1;
      scrollToIndex(index.current, true);
    }, AUTO_SCROLL_INTERVAL);
    return () => window.clearInterval(id);
  }, [multi, cards.length, scrollToIndex, reduce]);

  // onScrollBeginDrag: the user takes over and auto-scroll stops for good
  const onUserScroll = () => {
    stopped.current = true;
  };

  // onMomentumScrollEnd: keep the visible page inside the middle copy
  const onScrollEnd = () => {
    const el = listRef.current;
    if (!el || !multi) return;
    index.current = Math.round(el.scrollLeft / el.clientWidth);
    if (index.current >= cards.length && index.current < cards.length * 2) return;
    index.current = cards.length + (index.current % cards.length);
    scrollToIndex(index.current, false);
  };

  if (!cards.length) return null;
  return (
    <div
      ref={listRef}
      className={styles.list}
      data-scrollable={multi || undefined}
      onPointerDown={onUserScroll}
      onTouchStart={onUserScroll}
      onWheel={onUserScroll}
      onScroll={(e) => {
        const el = e.currentTarget;
        window.clearTimeout(Number(el.dataset.t));
        el.dataset.t = String(window.setTimeout(onScrollEnd, 120));
      }}
    >
      {pages.map((card, i) => (
        <div key={`card-${i}`} className={styles.page}>
          <Pressable className={styles.card} scale={0.98} disabled={!card.linkUrl} onClick={() => nav.toast(`${card.cta.message}: ${card.title}`)}>
            <span className={styles.art}>
              <img src={card.imageUrl} alt="" />
            </span>
            <span className={styles.info}>
              <span className={styles.title}>{card.title}</span>
              {card.terms.length > 0 && (
                <span className={styles.terms}>
                  {card.terms.map((term, j) => (
                    <span key={`${term}-${j}`} className={styles.term}>
                      <span className={styles.bullet} aria-hidden>
                        <img src={diamond} alt="" className={styles.bulletBase} />
                        <img src={diamondLight} alt="" className={styles.bulletLight} />
                        <img src={diamondShade} alt="" className={styles.bulletShade} />
                      </span>
                      <HtmlText base value={term} lines={2} className={styles.termText} />
                    </span>
                  ))}
                </span>
              )}
              <span className={styles.cta}>{card.cta.message}</span>
            </span>
          </Pressable>
        </div>
      ))}
    </div>
  );
}
