import { registerTransition } from '../../motion/transitions';
import { handoff } from '../../motion/presets';

/** The coupon screens that share the search bar: BEAUTY10 / results ⇄ the coupon search. */
export const BAR_MORPH = 'cs-bar-morph';

/**
 * The search bar as one object (BEAUTY10 → search → back). Both screens draw the kit's SearchInput at the same box
 * (inset + 4, 16 gutters, 52 high, r12) with the same placeholder, so the screens never slide: the search layer
 * cross-fades on the handoff S-curve over the page under it (which holds still) and the bar, pixel-identical in both
 * layers, stays put. What moves is the bar's own context: h2's band opens above it once the page under has cleared
 * (BandHeader `enter`), and closes again before the layer lets go on back (SearchScreen `back`), so two bars are never
 * seen apart. Reduced motion: the same cross-fade, no band movement.
 */
registerTransition(BAR_MORPH, {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: handoff.fade.io, ease: handoff.easeInOut },
});

/**
 * h2: the band opens on arrival only when the search was opened from a bar (not on a direct load). Set by the bar's
 * push and read once by the search screen as it mounts (a module flag, not a param: it never reaches the URL).
 */
let armed = false;
export const barMorph = {
  arm: () => void (armed = true),
  armed: () => armed,
  disarm: () => void (armed = false),
};
