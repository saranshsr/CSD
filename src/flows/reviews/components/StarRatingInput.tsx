import { motion } from 'motion/react';
import type { CSSProperties } from 'react';
import { OriginIcon, Pressable } from '../../../components';
import { ref } from '../../../foundations/tokens';
import { haptic } from '../../../motion/haptics';
import { reviewsMotion as M, reviewsTokens } from '../tokens';
import styles from './StarRatingInput.module.css';

export interface StarRatingInputProps {
  /** filled stars, 0–5 */
  value: number;
  /** makes the stars tappable; called with 1–5 (also on the current value — ignore it if you need to) */
  onChange?: (value: number) => void;
  /** star box in px. Repo sizes: 24 (headers, order list), 32 (past-order card), 33 (RatePastOrders panel), 20 (Submitted) */
  size?: number;
  /** gap in px (repo: 4 headers · 6 at 32/33px · 2 drafts B / Submitted) */
  gap?: number;
  /**
   * read-only rows pop in once on mount (ReviewDraft A: scale .3 → 1, 250ms + 70ms apart; B: 200ms + 60ms).
   * `true` uses the A timings; pass `{ delay, stagger }` for others.
   */
  appear?: boolean | { delay?: number; stagger?: number };
  /** accessible group label, e.g. `Rate ${product.name}` */
  label?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * StarRatingInput — R&R 2.0 star row (repo src/screens/ManualReviewScreen.tsx ProductHeader, NewReviewScreen
 * MorphingHeader, PastOrderRatingScreen OrderCard, RatePastOrdersScreen panel, ReviewDraftScreen(B) StarRow;
 * Figma KzR8dy12uT8CtgBRHHY6Qx · 6229:27913 "Product Container").
 *
 * Empty star = Origin `star` in `borderStrong` (#d0d4dd); the filled `star-filled` in `rating` green (#0f8857)
 * sits on top and pops in (scale .4 → 1, repo spring.bouncy) when it becomes active. Tap = press dip to .82
 * (.8 at ≥ 32px) on the same spring + `tick` haptic when the value changes. Without `onChange` the row is
 * read-only (role="img"); with `appear` it pops in star by star.
 */
export function StarRatingInput({ value, onChange, size = reviewsTokens.stars.header, gap, appear, label = 'Rating', className, style }: StarRatingInputProps) {
  const interactive = !!onChange;
  const pressScale = size >= reviewsTokens.stars.deck ? M.press.starLarge : M.press.star;
  const appearCfg = appear ? { delay: M.starAppear.delay, stagger: M.starAppear.stagger, ...(typeof appear === 'object' ? appear : {}) } : null;
  const rowStyle = { ...(gap !== undefined ? ({ '--reviews-star-gap': `${gap}px` } as CSSProperties) : {}), ...style };

  return (
    <div className={[styles.row, className].filter(Boolean).join(' ')} style={rowStyle} role={interactive ? 'radiogroup' : 'img'} aria-label={interactive ? label : `${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const active = n <= value;
        const glyphs = (
          <>
            <OriginIcon name="star" size={size} color={ref.color('borderStrong')} />
            <motion.span
              className={styles.fill}
              initial={false}
              animate={{ scale: active ? 1 : M.starPop.from, opacity: active ? 1 : 0 }}
              transition={M.spring.bouncy}
            >
              <OriginIcon name="star-filled" size={size} color={ref.color('rating')} />
            </motion.span>
          </>
        );
        const box = { width: size, height: size };
        if (!interactive) {
          return appearCfg ? (
            <motion.span
              key={n}
              className={styles.star}
              data-readonly
              style={box}
              initial={{ scale: M.starAppear.from, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ ...M.spring.bouncy, delay: appearCfg.delay + (n - 1) * appearCfg.stagger }}
            >
              {glyphs}
            </motion.span>
          ) : (
            <span key={n} className={styles.star} data-readonly style={box}>
              {glyphs}
            </span>
          );
        }
        return (
          <Pressable
            key={n}
            role="radio"
            aria-checked={n === value}
            aria-label={`${n} star${n > 1 ? 's' : ''}`}
            className={styles.star}
            style={box}
            scale={pressScale}
            transition={M.spring.bouncy}
            onClick={() => {
              if (n !== value) haptic('tick');
              onChange(n);
            }}
          >
            {glyphs}
          </Pressable>
        );
      })}
    </div>
  );
}
