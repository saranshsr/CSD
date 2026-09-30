// Shared motion language: Apple "Designing Fluid Interfaces" (WWDC18) springs. They're critically
// damped by default and interruptible, with no linear tweens. Everyone imports from here, and values
// are tuned here only.
//
// Each preset is defined with Apple's two spring parameters:
//   response        : seconds for one undamped period (≈ how long it feels)
//   dampingFraction : 1 = critically damped (no overshoot); < 1 lets it overshoot a little
// They're written in motion's own form { type:'spring', visualDuration, bounce }. Motion's
// visualDuration maps to ω = 2π / (1.2·visualDuration), so visualDuration = response / 1.2
// gives exactly Apple's response. bounce = 1 − dampingFraction.
export const ios = (response, dampingFraction = 1) => ({
  type: 'spring',
  visualDuration: +(response / 1.2).toFixed(4),
  bounce: +(1 - dampingFraction).toFixed(3),
});

export const spring = {
  // UINavigationController push / pop (and edge-swipe completion/cancel): no overshoot
  push: ios(0.36),
  // sheet present / dismiss: no overshoot
  sheet: ios(0.4),
  sheetClose: ios(0.36),
  // momentum release only (sheet flung back to rest): the one place a small settle is allowed
  sheetRelease: ios(0.4, 0.82),
  // small UI appearing (rows, cards, context lines)
  snappy: ios(0.3),
  // shared-element morph (search bar)
  morph: ios(0.36),
  // press feedback on card-like surfaces: fast in, quick settle out, no wobble
  press: ios(0.22),
  pressIn: ios(0.14),
  pressOut: ios(0.3),
  // keyboard: stiff critically damped spring, ≈0.25s "ease-out" feel
  keyboard: ios(0.3),
  // soft one-off glow (Coupons BEAUTY10 highlight)
  glowIn: ios(0.4),
  glowOut: ios(0.9),
};

// iOS highlight: on at touch-down with no delay, eased off on release. Opacity only.
export const HIGHLIGHT = { in: { duration: 0 }, out: { duration: 0.18, ease: 'easeOut' } };
export const FADE = { duration: 0.15, ease: 'easeOut' }; // the only other tween: short opacity cross-fades
export const PRESS_SCALE = 0.97; // cards only
export const PRESS_DIM = 0.6;    // buttons, rows, chips, icons: dim instead of scale
export const TAP_SLOP = 10;      // px of travel before a press turns into a drag and is cancelled

export const stagger = (i, step = 0.03, base = 0) => ({ delay: base + i * step });
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
