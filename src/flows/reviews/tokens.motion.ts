import type { Transition } from 'motion/react';
import { duration, easing, supermall } from '../../motion/presets';

/**
 * R&R 2.0 motion, mapped from repo src/tokens/motion.ts (+ the inline timings in src/screens/*) onto kit presets.
 * Rule (motion.md): use the preset when the repo value equals or is a near-identical stand-in for one; keep the
 * repo value here, with its source, when it is a deliberate R&R timing. Screen pushes are NOT here: the
 * Navigator's `push` transition (0.42s easing.ios, under −28%, brightness .92) replaces the repo's
 * `spring.screen` ScreenShell (x 100% → 0, under −28%, 12% black dim) 1:1 in intent.
 *
 * Full table: MAPPING.md → "Motion".
 */

/** repo `ease.inOut` [0.77, 0, 0.175, 1] (strong in-out) — no kit preset; AI loader bloom sweep only. */
const strongInOut: [number, number, number, number] = [0.77, 0, 0.175, 1];

export const reviewsMotion = {
  ease: {
    /** repo `ease.out` [0.23, 1, 0.32, 1] ≈ supermall.ease.soft [0.22, 1, 0.36, 1] */
    out: supermall.ease.soft,
    /** repo `ease.inOut` — kept (AILoaderScreen GradientField 1.1s sweep) */
    inOut: strongInOut,
    /** repo `ease.drawer` [0.32, 0.72, 0, 1] = easing.ios */
    drawer: easing.ios,
  },
  /** repo src/tokens/motion.ts `duration` (s). `slow` .3 = duration.medium; the rest are R&R values. */
  duration: {
    press: 0.13,
    fast: 0.18,
    base: 0.24,
    slow: duration.medium,
  },
  /**
   * repo springs, kept in motion's duration/bounce form (motion/react accepts it as is).
   * Press feedback does NOT use these: taps go through <Pressable>/<Button> (spring.press).
   */
  spring: {
    /** repo spring.snappy — toggles, checkbox, chip borders, crisp state (no overshoot) */
    snappy: { type: 'spring', duration: 0.32, bounce: 0 } as Transition,
    /** repo spring.gentle — cards, list items, deck / slider moves */
    gentle: { type: 'spring', duration: 0.5, bounce: 0.12 } as Transition,
    /** repo spring.bouncy — stars, check badge, thank-you moments */
    bouncy: { type: 'spring', duration: 0.55, bounce: 0.42 } as Transition,
    /** repo in-screen sheets (ProgressSheet / EditReviewSheet / DraftB save bar): duration .5, bounce .14 */
    sheet: { type: 'spring', duration: 0.5, bounce: 0.14 } as Transition,
    /** repo fold/unfold of card meta + note actions: duration .45, bounce 0 */
    fold: { type: 'spring', duration: 0.45, bounce: 0 } as Transition,
  },
  /** taps: repo `tap` .97 → kit pressScale .96 (Pressable default); `tapStrong` .94 → pill.pressScale (.94) */
  press: {
    /** star buttons: whileTap scale .82 (ManualReview / NewReview / OrderList), .8 on the 32–33px stars */
    star: 0.82,
    starLarge: 0.8,
    /** AI switch: whileTap .92 */
    toggle: 0.92,
  },
  /** star fill pop: filled star scales .4 → 1 with opacity (ProductHeader / OrderCard) */
  starPop: { from: 0.4 },
  /** read-only star rows pop in: scale .3 → 1, 70ms apart after 250ms (ReviewDraft A) / 60ms after 200ms (B) */
  starAppear: { from: 0.3, delay: 0.25, stagger: 0.07 },
  /** ReviewDraftB StarRow timings */
  starAppearB: { delay: 0.2, stagger: 0.06 },
  /** Submitted photo thumbs: scale .7 → 1, spring.gentle with bounce .5, 150ms + 50ms apart */
  photoPop: { from: 0.7, delay: 0.15, stagger: 0.05, spring: { type: 'spring', duration: 0.5, bounce: 0.5 } as Transition },
  /** CraftingLines white sweep: x −130% → 130%, 1.2s linear loop, 120ms apart per line */
  craftSweep: { from: '-130%', to: '130%', duration: 1.2, stagger: 0.12 },
  /** skeleton sweep (ManualReview SkeletonBlock): x −120% → 120%, 1.1s linear loop */
  skeletonSweep: { from: '-120%', to: '120%', duration: 1.1 },
  /** repo STAGGER (StaggerGroup / StaggerItem): 40ms delay, 50ms apart, y 12 on spring.gentle */
  stagger: { delay: 0.04, gap: 0.05, y: 12 },
  /** FadeRise: y 10, duration .3 ease.out → kit <FadeIn y={10}> (duration.medium, easing.out) */
  fadeRise: { y: 10 },
  /** blur cross-fade used for every in-place swap (AI ⇄ manual, skeleton ⇄ questions, product switch): blur 4px, y ±6 */
  swap: { blur: 4, y: 6 },
  /** mocked keyboard rises with its height: 0.34s easing.ios (= ease.drawer) */
  keyboard: { duration: 0.34, ease: easing.ios } as Transition,
  /** timeline (ms) */
  timing: {
    /** ManualReview: skeleton shown after a rating change */
    recomputeMs: 600,
    /** NewReview / RatePastOrders: "Crafting your draft" dwell */
    generateMs: 2200,
    /** AILoaderScreen: writing hold → "generated" hold → hand-off */
    loaderHoldMs: 2400,
    loaderDoneMs: 1300,
    /** AILoader bloom sweep (s) */
    bloomSweep: 1.1,
    /** AILoader label cross-fade (s) */
    labelSwap: 0.32,
    /** SubmittedScreen: Lottie backstop, then dwell before advancing */
    submittedBackstopMs: 2600,
    submittedAdvanceMs: 1500,
    /** NewReview: scroll the draft into view after craft */
    revealScrollMs: 90,
    /** orders list: let the star pop land (≈220ms) before calling openReview — suggestion for the orders wiring */
    orderStarPushMs: 220,
  },
  /** past-order deck (PastOrderRatingScreen): behind cards peek above, 10% smaller each */
  deck: { y: [0, -8, -15], scale: [1, 0.9, 0.8], throwX: -440, throwRotate: -8, swipeDist: 90, swipeVelocity: 500, elastic: 0.7 },
  /** horizontal slider (PastOrderRatingScreenB): card 286 + 16 gap */
  slider: { card: 286, gap: 16 },
  /** sheet / scrim fade (in-screen overlays): .2s */
  scrimFade: 0.2,
} as const;

export type ReviewsMotion = typeof reviewsMotion;
