import type { TokenOverrides } from '../../foundations/tokens';

/**
 * Orders tokens. List + tracking follow the PDS reference (pds-noon-as.vercel.app one-flows, measured with
 * getComputedStyle — see MAPPING.md "PDS reference"); the cancel screen keeps the bappzaar O2D values.
 * Plain TS (gradients, geometry, timings) lives in `ordersTokens`; CSS variables in `ordersFlowTokens`.
 */
export const ordersTokens = {
  /** details page wash: `#EAECF0` at the top → `#F9F9FB` at one screen height (812) */
  trackingBg: 'linear-gradient(180deg, var(--nk-color-border) 0px, var(--nk-color-bg-subtle) 812px)',
  /** stepper progress fill (decoded from the reference's 275×2 PNG: #ACF0D5 → #70D6AD) */
  stepFill: 'linear-gradient(90deg, var(--nk-palette-pale-mint), #70D6AD)',
  /** refund / warranty note chips fade into the card */
  refundChip: 'linear-gradient(to right, var(--nk-color-success-surface), var(--nk-color-bg-surface))',
  warrantyChip: 'linear-gradient(to right, var(--nk-color-bg-page), var(--nk-color-bg-surface))',
  /** V2 "hot afternoon" wash (oklch values converted to sRGB), masked out from 820 → 1100px */
  heatTop:
    'radial-gradient(110% 250px at 50% -10%, rgba(248, 201, 112, 0.8), rgba(248, 201, 112, 0)), radial-gradient(60% 160px at 50% -6%, rgba(255, 252, 233, 0.85), rgba(255, 252, 233, 0)), linear-gradient(#F8DFA4 0px, rgba(248, 223, 164, 0.82) 99px, rgba(248, 223, 164, 0.52) 182px, rgba(248, 223, 164, 0.24) 257px, rgba(248, 223, 164, 0.08) 304px, rgba(248, 223, 164, 0) 330px)',
  /** V4 glow behind the top of the tracker card (y 307 → 485 of the page, masked 150 → 178) */
  heatGlow:
    'radial-gradient(220px 108px at 70% 150px, rgba(245, 236, 198, 0.3) 0%, rgba(245, 236, 198, 0.22) 28%, rgba(245, 236, 198, 0.13) 52%, rgba(245, 236, 198, 0.05) 76%, rgba(245, 236, 198, 0.02) 92%, rgba(245, 236, 198, 0) 100%), radial-gradient(400px 150px at 50% 150px, rgba(245, 198, 109, 0.46) 0%, rgba(245, 198, 109, 0.34) 28%, rgba(245, 198, 109, 0.2) 52%, rgba(245, 198, 109, 0.08) 76%, rgba(245, 198, 109, 0.02) 92%, rgba(245, 198, 109, 0) 100%)',
  /** V3 orange pill */
  heatPill: 'linear-gradient(180deg, #F9AA60 0%, #FADA99 100%)',
  heatPillGlow: '0 2px 18px rgba(255, 190, 110, 0.45)',
  /** image stack ring: 81×108 cards placed by offset from the centre card (translateX of the 295-wide box, scale) */
  stack: {
    box: { w: 295, h: 116 },
    card: { w: 81, h: 108, radius: 10 },
    slots: [
      { x: 107, s: 1 },
      { x: 46, s: 0.851852 },
      { x: 92, s: 0.703704 },
      { x: 127.5, s: 0.6 },
    ],
    tagTop: 100,
  },
  /** stack rotation period (V2–V4) */
  stackRotateMs: 1900,
  /** heat hero beats after the content appears (s), measured from the reference */
  heat: { pillAt: 0.7, lettersAt: 1.05, letterStagger: 0.018, letterMove: 0.3, adviceAt: 2.1, adviceMove: 0.4, blur: 6, letterY: 3, adviceY: 4 },
} as const;

export const ordersFlowTokens: TokenOverrides = {
  colors: {
    bgPage: '#F2F3F7',
    /** done step disc (reference `#F6FEFB`, no palette entry) */
    ordersStepDoneBg: '#F6FEFB',
    /** refund-credited row border (reference `#E3FCFA`) */
    ordersRefundBorder: '#E3FCFA',
    /** product thumb tint `rgba(0, 40, 136, 0.03)` (reference; kit skuMediaTint is 7,47,143 / .04) */
    ordersImageTint: 'rgba(0, 40, 136, 0.03)',
  },
  type: {
    ordersText12BoldLh24: { size: 12, line: 24, weight: 700 }, // legacy PIN digit
    ordersText32BoldLh40: { size: 32, line: 40, weight: 700 }, // headline
    ordersText13BoldLh18: { size: 13, line: 18, weight: 700 }, // cancel price
    ordersText14MediumLh20: { size: 14, line: 20, weight: 500 }, // search placeholder, bill labels, tiles
    ordersText13BoldLh20: { size: 13, line: 20, weight: 700 }, // card status word, "On time"
    ordersText13MediumLh20: { size: 13, line: 20, weight: 500 }, // card date, rating prompt
    ordersText13SemiboldLh20: { size: 13, line: 20, weight: 600 }, // rider buttons, Delivery PIN
    ordersText12BoldLh18: { size: 12, line: 18, weight: 700 }, // PIN digits, cancelled status, Refund credited
    ordersText12SemiboldLh18: { size: 12, line: 18, weight: 600 }, // status line, chips, step labels, Apple Pay
    ordersText12ExtraboldLh18: { size: 12, line: 18, weight: 800 }, // "ON TIME"
  },
  shadow: {
    ordersCard: '0 4px 12px var(--nk-palette-black-alpha2)',
    ordersBadge: '0 2px 8px rgba(14, 14, 14, 0.08)',
    ordersStackNear: '0 5.727px 34.363px rgba(14, 14, 14, 0.12)',
    ordersStackFar: '0 2px 16px rgba(14, 14, 14, 0.08)',
  },
};

/** typed `var()` handles for the flow keys above (ref.* is typed to central keys only) */
export const ordersVar = {
  imageTint: 'var(--nk-color-orders-image-tint)',
  stackNear: 'var(--nk-shadow-orders-stack-near)',
  stackFar: 'var(--nk-shadow-orders-stack-far)',
} as const;
