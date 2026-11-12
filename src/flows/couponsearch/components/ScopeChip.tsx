import { animate, cubicBezier, motion, useMotionValue, useTransform, type MotionStyle } from 'motion/react';
import { useEffect, type ReactNode } from 'react';
import badgeIcon from '@assets/icons/origin/discount-filled.svg';
import badgeSvg from '@assets/icons/origin/discount-filled.svg?raw';
import { handoff } from '../../../motion/presets';
import { useReduceMotion } from '../../../motion/reducedMotion';
import { NE, useEntrance } from '../entrance';
import { csTokens } from '../tokens';
import styles from '../listing.module.css';

/** the nudge's seal motion (EligibleRow v2, tg=5): 90° turn (8 lobes, so it lands on its own outline) and the barest
    dip at mid-turn, on the spread's eased tween */
const TURN = csTokens.toggleV2.mix.spread.on;
const DIP = csTokens.toggleV2.mix.stamp.dip;
/** the chip arrives with the lead in CouponListing's `belowBar` fade (results-fade: `handoff.fade.reveal`, 0.3s
    S-curve); the turn sets off once that fade is ≈80% in (0.2s), so it is seen, not lost in the entrance */
const TURN_DELAY = handoff.fade.reveal * (2 / 3);

/**
 * `&na=1|2` (main.tsx keeps it on every page): one attention beat on the chip, on the same 0.2s delay as the turn
 * (`csTokens.attention`). 1 · code stamp: the turn, then the code takes one critically damped press. 2 · light pass:
 * one soft band of the fill's white end crosses the green with the turn. No match (both): the seal turns 45° and eases
 * home instead of the full turn. Only without `ne` (an entrance replaces the mount turn, so it wins); no `na`: today's
 * chip, untouched. `&nt=<ms>` (debug) freezes it at that many ms after mount, so frames can be captured.
 */
const search = typeof window === 'undefined' ? null : new URLSearchParams(window.location.search);
const NA: 0 | 1 | 2 = (() => {
  const n = Number(search?.get('na'));
  return !NE && (n === 1 || n === 2) ? n : 0;
})();
const NT: number | null = (() => {
  const raw = search?.get('nt');
  const n = raw == null || raw === '' ? NaN : Number(raw);
  return Number.isFinite(n) && n >= 0 ? n / 1000 : null;
})();

const A = csTokens.attention;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const turnEase = cubicBezier(...TURN.ease);
const lightEase = cubicBezier(...A.light.ease);
/** the attention clock is s after mount; each part reads it from the turn's start */
const since = (t: number) => t - TURN_DELAY;
/** the turn (0 → 1) on its own eased tween, as today's mount turn */
const naTurn = (t: number) => turnEase(clamp01(since(t) / TURN.duration));
/** na=1: the code's press, a kick on a critically damped spring (x·e^(1−x), peak 1 at x = 1), exactly 1 at rest */
const stampAt = (t: number) => {
  const tau = since(t) - A.stamp.at;
  if (tau <= 0 || tau >= A.stamp.settle) return 1;
  const x = tau / A.stamp.peak;
  return 1 + A.stamp.amp * x * Math.exp(1 - x);
};
/** no match: 0 → 1 → 0, a sine out to `peakAt` and a longer sine back; zero velocity at both ends and at the peak */
const nodAt = (t: number) => {
  const x = (since(t) - A.no.at) / A.no.duration;
  if (x <= 0 || x >= 1) return 0;
  const k = A.no.peakAt;
  return x < k ? 0.5 - 0.5 * Math.cos((Math.PI * x) / k) : 0.5 + 0.5 * Math.cos((Math.PI * (x - k)) / (1 - k));
};
/** the clock runs to the last part's rest */
const END = TURN_DELAY + Math.max(TURN.duration, A.stamp.at + A.stamp.settle, A.light.at + A.light.duration, A.no.at + A.no.duration);

/* the same discount-filled glyph as the nudge (`GLYPHS['discount-filled']`, EligibleRow), split like its SEAL: the
   scalloped ring turns, the % stays upright as a true hole onto the chip's gradient */
export const SEAL = (() => {
  const d = /\sd="([^"]+)"/.exec(badgeSvg)?.[1] ?? '';
  const cut = d.search(/z/i) + 1;
  const url = (path: string) =>
    `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill-rule="evenodd" d="${path}"/></svg>`)}")`;
  return { whole: `url("${badgeIcon}")`, ring: url(d.slice(0, cut)), pct: url(d.slice(cut)) };
})();
export const masked = (url: string) => ({ WebkitMaskImage: url, maskImage: url });
export const SEAL_CUT = {
  WebkitMaskImage: `${SEAL.pct}, linear-gradient(black, black)`,
  maskImage: `${SEAL.pct}, linear-gradient(black, black)`,
  WebkitMaskComposite: 'xor',
  maskComposite: 'exclude',
} as MotionStyle;

/**
 * Row v2 results context (Figma 359:390227 · Match 359:390230 / No match 359:390263): a full-width 13pt chip, r8, padding
 * 6, gap 4, no border, on a left → right gradient (match: success-subtle → surface-primary; no match: surface-tertiary →
 * surface-primary). The 20 seal sits top-aligned on line 1; the copy wraps, never truncates. The seal turns once on
 * every mount (every results load), as the nudge's does when it toggles on; reduced motion: it stays still.
 */
export function ScopeChip({ match, children }: { match: boolean; children: ReactNode }) {
  const reduce = useReduceMotion();
  const p = useMotionValue(0);
  // `&ne=1|2|3` (entrance.tsx) replaces the mount turn: 1 / 2 turn the seal on the entrance's own clock, 3 doesn't turn
  const entry = useEntrance(csTokens.entrance.resultsAt);
  const drive = NE ? entry.turn : p;
  const rot = useTransform(drive, (v) => v * 90);
  const scale = useTransform(drive, (v) => 1 - DIP * Math.sin(Math.PI * Math.min(1, Math.max(0, v))));
  // at rest the whole glyph shows (exact); while turning, the ring turns under the upright % hole
  const turning = useTransform(drive, (v) => (v > 0.0005 && v < 0.9995 ? 1 : 0));
  const still = useTransform(turning, (t) => 1 - t);

  // `&na=1|2`: every part is a function of one clock (s after mount), so `&nt=` can hold any frame
  // a frozen frame starts there: derived values first compute from it on render, so it shows without a frame tick
  // (they otherwise update on the next animation frame, which a hidden pane never runs)
  const clock = useMotionValue(NA && NT != null && !reduce ? NT : 0);
  const nod = NA > 0 && !match; // no match: the 45° turn and home replaces the full turn
  const naRot = useTransform(clock, (t) => (nod ? A.no.angle * nodAt(t) : naTurn(t) * 90));
  const naScale = useTransform(clock, (t) => (nod ? 1 : 1 - DIP * Math.sin(Math.PI * naTurn(t))));
  const naTurning = useTransform(naRot, (r) => (r > 0.01 && r < 89.99 ? 1 : 0));
  const naStill = useTransform(naTurning, (t) => 1 - t);
  const stamp = useTransform(clock, (t) => (NA === 1 && match ? stampAt(t) : 1));
  const lightQ = useTransform(clock, (t) => lightEase(clamp01((since(t) - A.light.at) / A.light.duration)));
  const lightX = useTransform(lightQ, (q) => `${((q - 1) * 100).toFixed(3)}%`);
  const lightO = useTransform(lightQ, (q) => (q > 0 && q < 1 ? A.light.opacity : 0));

  useEffect(() => {
    if (reduce || NE) return;
    if (NA) {
      if (NT != null) {
        clock.jump(NT);
        return;
      }
      clock.jump(0);
      const run = animate(clock, END, { duration: END, ease: 'linear' });
      return () => run.stop();
    }
    p.jump(0);
    const run = animate(p, 1, { duration: TURN.duration, ease: TURN.ease, delay: TURN_DELAY });
    return () => run.stop();
  }, [p, clock, reduce]);

  const light = NA === 2 && match;
  const cls = [styles.chip, match ? styles.chipMatch : styles.chipNone, entry.body && styles.chipLayered, NA === 1 && match && styles.chipStamp, light && styles.chipLit];
  const rootStyle = NA === 1 && match ? ({ ...entry.mask, '--cs-stamp': stamp } as MotionStyle) : entry.mask;

  return (
    <motion.div className={cls.filter(Boolean).join(' ')} style={rootStyle}>
      {entry.body && <motion.span className={styles.chipFill} style={entry.body} aria-hidden />}
      {light && (
        <span className={styles.chipLight} aria-hidden>
          <motion.span
            className={styles.chipLightRun}
            style={{ x: lightX, opacity: lightO, '--cs-light-w': `${A.light.width}px`, '--cs-light-skew': `${A.light.skew}deg` } as MotionStyle}
          />
        </span>
      )}
      <motion.span className={styles.chipSeal} style={{ scale: NA ? naScale : scale, ...entry.seal }} aria-hidden data-testid="cs-chip-seal">
        <motion.span className={styles.chipGlyph} style={{ opacity: NA ? naStill : still, ...masked(SEAL.whole) }} />
        <motion.span className={styles.chipCut} style={{ opacity: NA ? naTurning : turning, ...SEAL_CUT }}>
          <motion.span className={styles.chipGlyph} style={{ rotate: NA ? naRot : rot, ...masked(SEAL.ring) }} />
        </motion.span>
      </motion.span>
      <motion.span className={styles.chipText} style={entry.body}>
        {children}
      </motion.span>
    </motion.div>
  );
}
