import type { TokenOverrides } from '../../foundations/tokens';
import { palette } from '../../foundations/palette';
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
    sheetPad: 16,
    /** the band slot starts this far above the status bar's bottom edge, so the closed sheet puts the bar at the kit's spot */
    tuck: 12,
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
    /* springs: the kit's roles (EligibleRow): knob `fieldMotion.spring.springLight`, stretch `spring.press` in /
       `supermall.springs.return` out */
    /** the surface the row sits on: 343 wide, min 56 high */
    rowWidth: 343,
    /** scope change: suggestions cross-dissolve, no direction */
    dissolve: 0.2,
  },
  /** Eligible row v2 (Figma Typing · on/off): the DS switch one step up, 42×24 (knob 20, inset 2), on a 64-high row */
  toggleV2: {
    track: { w: 42, h: 24 },
    knob: 20,
    inset: 2,
    stretch: 6,
    rowWidth: 343,
  },
  gesture: {
    /** px of travel before a press turns into a drag */
    slop: 10,
    /** UIScrollView normal deceleration (Apple `project()`) */
    decel: 0.998,
    /** UIKit rubber-band constant */
    rubber: 0.55,
  },
  /** the on-screen keyboard (team file M-Keyboard: iOS 26 light, 295.7 high on a 375 frame) */
  keyboard: {
    /** docks a beat after the screen arrives, on the dock spring (a touch of settle, no bounce) */
    dock: appleSpring(0.47, 0.94),
    dockDelay: 0.06,
    /** drops on the recede spring (never overshoots) */
    drop: appleSpring(0.37, 1),
    /** key popup grows out of the key, critically damped */
    popup: appleSpring(0.29, 1),
    /** the QuickType bar: off, as the frames draw the keyboard without it */
    quickType: false,
    /** wheel / trackpad travel that dismisses (keyboardDismissMode .onDrag) */
    wheelDismiss: 12,
  },
  scoped: {
    /** the scoped row leaves with the suggestion rows on a pick */
    exitTravel: 12,
  },
} as const;

/**
 * Flow overrides. Everything here is a value copied from the team Figma file that no Field DS / kit token carries
 * (checked against `palette.ts` / `tokens.ts` by exact value and by meaning); values the kit does carry are used
 * straight from the kit in the CSS / TSX and are not repeated here.
 */
export const couponsearchFlowTokens: TokenOverrides = {
  colors: {
    // this flow's page is white (kit default is the grey #F2F3F7); same value as the kit's `bgSurface`
    bgPage: palette.white,
    /** Figma value, no kit token: base/colour/green/50, end of the Eligible row "on" gradient */
    csGreen50: '#F6FEFB',
    /** Figma value, no kit token: start of the Eligible row "on" gradient (Typing · on) */
    csGreenOnStart: '#E7FAF2',
    /** Figma value, no DS token: Eligible row v2 "on" stroke, a vertical #CBF6E5 gradient (10% top → 40% bottom) */
    csBorderOnTop: 'rgba(203, 246, 229, 0.1)',
    csBorderOnBottom: 'rgba(203, 246, 229, 0.4)',
    /** Figma value, no DS token: eligible row coupon icon, off */
    csIconOff: '#9AA0B4',
    /** Figma value, no DS token: white over the band green, ✕ circle 18% (the 90% value copy is `palette.whiteAlpha90`) */
    csOnGreen18: 'rgba(255, 255, 255, 0.18)',
    /** Figma value, no DS token (currently unused): chip border */
    csChipBorder: '#EBEAEA',
    /** Figma value, no DS token (currently unused): card image placeholder */
    csCardImageBg: 'rgba(0, 40, 136, 0.03)',
    /** Figma value, no DS token (currently unused): ETA strip */
    csEta: '#1F20B7',
    csEtaShade: '#0E0E60',
    /** Figma value, no DS token: "viewed" chip on the presearch */
    csViewedBg: '#EBF2FF',
    csViewedInk: '#2959EB',
    /** Figma value, no DS token: category circle border */
    csCircleBorder: '#EDF0F2',
    /* M-Keyboard (iOS 26 light): iOS system colours, not noon DS, so no kit token applies (white keys use `palette.white`) */
    csKbBg: '#E6E9ED',
    csKbKeyDown: '#ABB0BC',
    csKbGlyph: '#595959',
    csKbReturn: '#0088FF',
    csKbReturnDown: '#0067D1',
    csKbReturnOff: '#A4A8B0',
    csKbBarGlyph: '#5E6B85',
    csKbSep: 'rgba(60, 60, 67, 0.22)',
    /** iOS: QuickType slot while pressed; key popup hairline edge and soft shadow */
    csKbQtDown: 'rgba(255, 255, 255, 0.72)',
    csKbPopEdge: 'rgba(0, 0, 0, 0.35)',
    csKbPopShadow: 'rgba(0, 0, 0, 0.14)',
  },
  type: {
    /** Figma value, no DS token: band / hero code tag */
    csText11BoldLh15: { size: 11, line: 15, weight: 700 },
    /** Figma value, no DS token (currently unused): card selling price */
    csText15BoldLh16: { size: 15, line: 16, weight: 700 },
    /** Figma value, no DS token (currently unused): Figtree chips (14 / 19.6 medium) */
    csText14MediumLh20: { size: 14, line: 20, weight: 500 },
  },
};
