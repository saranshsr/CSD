import type { TokenOverrides } from '../../foundations/tokens';
import { appleSpring } from '../../motion/presets';

/**
 * Coupon-scoped search (BEAUTY10) values with no central token: the three designs layered on the kit's search and
 * listing (Context band · Eligible row · Auto-suggestion, team file Iteration 1 / 2). Geometry in px, times in seconds.
 * Springs are Apple (response, dampingFraction) through `appleSpring`, critically damped unless they are a thrown object.
 */
export const csTokens = {
  band: {
    /** the white sheet's top radius while the band is up; it flattens before the closing green would meet it */
    sheetRadius: 20,
    /** the sheet's top padding: constant, so the search bar never shifts inside it */
    sheetPad: 12,
    /** the band slot starts this far above the status bar's bottom edge, so the closed sheet puts the bar at the kit's spot */
    tuck: 8,
    /** the green's bottom edge stays this far under the rising sheet (its corners always sit on green) */
    lip: 24,
    /** below this progress the green wipes up behind the status bar */
    wipeAt: 0.5,
    /** progress where the green is fully gone */
    goneAt: 0.1,
    /** corners flatten between these progress values */
    cornersFrom: 0.36,
    /** the copy drifts up this far as the sheet covers it (parallax, never clipped) */
    drift: 10,
    /** status-bar ink flips when the green behind it is taller than this */
    inkAt: 40,
    /** ✕: critically damped, unhurried, so the rise and the wipe read as one move */
    close: appleSpring(0.85, 1),
    /** a release after a drag: the dock settle, velocity handed over */
    release: appleSpring(0.47, 0.94),
    /** the band making way for results (and coming back): quick, no bounce */
    makeWay: appleSpring(0.38, 1),
    /** back from results: the band returns this long after the results layer has faded */
    returnDelay: 0.18,
  },
  toggle: {
    track: { w: 34, h: 20 },
    knob: 16,
    inset: 2,
    /** the knob stretches toward its travel direction while pressed */
    stretch: 6,
    /** the knob is a thrown object: its own short spring, a whisper of settle */
    spring: appleSpring(0.34, 0.84),
    stretchIn: appleSpring(0.18, 1),
    stretchOut: appleSpring(0.36, 1),
    /** the surface the row sits on: 343 wide, min 56 high */
    rowWidth: 343,
    /** scope change: suggestions cross-dissolve, no direction */
    dissolve: 0.2,
  },
  gesture: {
    /** px of travel before a press turns into a drag */
    slop: 10,
    /** UIScrollView normal deceleration (Apple `project()`) */
    decel: 0.998,
    /** UIKit rubber-band constant */
    rubber: 0.55,
  },
  scoped: {
    /** the scoped row leaves with the suggestion rows on a pick */
    exitTravel: 12,
  },
} as const;

export const couponsearchFlowTokens: TokenOverrides = {
  colors: {
    bgPage: '#FFFFFF',
    /** eligible row "on" tint (team file Eligible row · on) */
    csTint: '#EDF7F2',
    /** eligible row coupon icon, off */
    csIconOff: '#9AA0B4',
    /** scoped row divider */
    csDivider: '#ECEEF3',
    /** white over the band green: value copy 90%, ✕ circle 18% */
    csOnGreen90: 'rgba(255, 255, 255, 0.9)',
    csOnGreen18: 'rgba(255, 255, 255, 0.18)',
  },
  type: {
    /** band title */
    csText16BoldLh22: { size: 16, line: 22, weight: 700 },
    /** band / hero code tag */
    csText11BoldLh15: { size: 11, line: 15, weight: 700 },
  },
};
