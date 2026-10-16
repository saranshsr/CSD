import type { Transition } from 'motion/react';
import { reviewsMotion } from './tokens.motion';

/**
 * Review draft A / B (DraftScreen, DraftBScreen) — repo values with no kit preset (src/screens/ReviewDraftScreen.tsx
 * ProductPhoto, ReviewDraftScreenB.tsx editing bar). JS values (not CSS variables), imported directly by
 * DraftScreen, DraftBScreen and DraftProductTop; deliberately not merged into `reviewsFlowTokens`.
 */
export const reviewsDraft = {
  /** ReviewDraft A tilted polaroid (Figma 7116:43969): 61.5×82 card, product 55×73 inset ~3px, resting tilt 7.67° */
  polaroid: {
    width: 62,
    height: 82,
    image: { width: 55, height: 73 },
    rotate: 7.67,
    /** paperclip (Figma 7116:43973): 11×19, rotated 15°, top −7 / right 8 on the card */
    clip: { width: 11, height: 19, rotate: 15 },
    /** entrance: opacity 0, scale .6, rotate −8, y −10 → rest; spring.bouncy with bounce .58, 180ms in */
    from: { scale: 0.6, rotate: -8, y: -10 },
    spring: { ...reviewsMotion.spring.bouncy, bounce: 0.58 } as Transition,
    delay: 0.18,
    /** hover lift (spring.gentle) / press dip (spring.snappy) */
    hover: { scale: 1.06, rotate: 3 },
    press: 0.95,
  },
  /** FadeRise delay of the "Add photos" card under the review card (both drafts) */
  photosDelay: 0.08,
} as const;
