// Shared motion language — ported from the LSN prototype (saranshsr/LSN, src/motion/springs.ts).
//
// ONE base spring (response 0.52 s, damping fraction 0.92) and every animation in the prototype
// is a multiple of it, so the whole flow retunes from `BASE` in one place. Nothing runs on a
// duration + curve (except opacity fades ≤150ms), so everything is interruptible: retargeting
// keeps velocity, a reversal mid-flight continues instead of restarting.
//
// Roles, not magic numbers — the same roles move the same way everywhere:
//   move    containers and the shared search bar travelling through space
//   layout  surfaces that push content around (critically damped)
//   dock    panels that dock to an edge: keyboard, sheet. A touch of settle, no bounce
//   clear   content getting out of the way
//   rise    content rising into place (rows, cards, context lines)
//   form    surfaces forming before their labels (soft overshoot)
//   recede  leaving as one layer — dismissals, keyboard drop. Never overshoots
//   fade    screen-level cross-fades
// Choreography follows LSN too: content clears before its container moves, containers settle
// before content forms, delays are seconds at response 0.52, scaled with the base (`at()`).
export const BASE = { response: 0.52, dampingFraction: 0.92 };

// Apple's (response, dampingFraction) → motion's stiffness/damping (mass 1).
const solve = (response, dampingFraction) => ({
  stiffness: Math.pow((2 * Math.PI) / response, 2),
  damping: (4 * Math.PI * dampingFraction) / response,
});
const R = BASE.response, Z = BASE.dampingFraction;
const s = (responseMul, damping) => {
  const c = solve(R * responseMul, Math.min(1, Math.max(0.35, damping)));
  return { type: 'spring', mass: 1, stiffness: +c.stiffness.toFixed(3), damping: +c.damping.toFixed(3) };
};
/** Any spring in the system, as a multiple of the base response. */
export const lsnSpring = (responseMul, damping) => s(responseMul, damping);
/** Kept for callers that think in absolute Apple terms: response in seconds. */
export const ios = (response, dampingFraction = 1) => s(response / R, dampingFraction);

export const SPR = {
  move: s(1, Z),
  layout: s(1.2, 1),
  dock: s(0.9, 0.94),
  clear: s(0.55, 1),
  rise: s(0.95, 1),
  form: s(0.75, 0.68),
  pop: s(0.7, 0.62),
  recede: s(0.72, 1),
  fade: s(0.6, 1),
  sheet: s(0.9, 0.86),
};

/** Delay in seconds at response 0.52, scaled with the base like LSN's plans. */
export const at = (sec) => sec * (R / 0.52);

// Legacy preset names — every existing caller keeps working, now on the LSN roles.
export const spring = {
  // screen push / pop and edge-swipe completion/cancel: a container travelling
  push: SPR.move,
  // sheet present: docks with a whisper of settle; dismiss recedes (never overshoots)
  sheet: SPR.sheet,
  sheetClose: SPR.recede,
  // momentum release (sheet flung back to rest): the dock settle
  sheetRelease: SPR.dock,
  // small UI appearing (rows, cards, context lines)
  snappy: SPR.rise,
  // shared search bar + key popups
  morph: SPR.move,
  // press feedback on card-like surfaces: fast in, quick settle out, no wobble
  press: s(0.42, 1),
  pressIn: s(0.27, 1),
  pressOut: s(0.58, 1),
  // keyboard docking (interactive dismissal releases on this too)
  keyboard: SPR.dock,
  keyboardHide: SPR.recede,
  // soft one-off glow (Coupons BEAUTY10 highlight)
  glowIn: s(0.77, 1),
  glowOut: s(1.73, 1),
};

// LSN shared looks. `shown` is always the resting style, so nothing here changes a screen at rest.
/** A word, row or item rising into place: 9px up, sharpening as it lands. */
export const rise = {
  hidden: { opacity: 0, y: 9, filter: 'blur(4px)' },
  shown: { opacity: 1, y: 0, filter: 'blur(0px)', transition: SPR.rise },
  gone: { opacity: 0, filter: 'blur(4px)', transition: SPR.clear },
};
/** `rise` with its own delay (seconds at base response). */
export const riseAt = (delay = 0) => ({
  hidden: rise.hidden,
  shown: { ...rise.shown, transition: { ...SPR.rise, delay: at(delay) } },
  gone: rise.gone,
});

// iOS highlight: on at touch-down with no delay, eased off on release. Opacity only.
export const HIGHLIGHT = { in: { duration: 0 }, out: { duration: 0.18, ease: 'easeOut' } };
export const FADE = { duration: 0.15, ease: 'easeOut' }; // the only other tween: short opacity cross-fades
export const PRESS_SCALE = 0.97; // cards only
export const PRESS_DIM = 0.6;    // buttons, rows, chips, icons: dim instead of scale
export const TAP_SLOP = 10;      // px of travel before a press turns into a drag and is cancelled

export const stagger = (i, step = 0.03, base = 0) => ({ delay: at(base + i * step) });
// iOS push parallax: the covered screen moves this fraction of the width and dims.
export const PARALLAX = 0.3;
export const DIM = 0.1;

// --- gesture helpers ------------------------------------------------------------------------
// UIScrollView-style projection: where a release at velocity v (px/s) would coast to.
export const DECEL = 0.998;
export const project = (pos, v, decel = DECEL) => pos + (v / 1000) * decel / (1 - decel);
// UIKit rubber band: rb(o, d, c) = o·d·c / (d + c·|o|), which gives diminishing returns past the edge.
export const rubber = (o, d, c = 0.55) => (o * d * c) / (d + c * Math.abs(o));

// Pointer velocity from the last ~80ms of samples (px/s). Returns 0 if the finger stopped before release.
export function velocityTracker() {
  let s = [];
  return {
    reset() { s = []; },
    add(v, t = performance.now()) { s.push({ v, t }); while (s.length > 2 && t - s[0].t > 80) s.shift(); },
    get(now = performance.now()) {
      if (s.length < 2) return 0;
      const a = s[0], b = s[s.length - 1];
      if (now - b.t > 60) return 0;
      const dt = (b.t - a.t) / 1000;
      return dt > 0 ? (b.v - a.v) / dt : 0;
    },
  };
}
