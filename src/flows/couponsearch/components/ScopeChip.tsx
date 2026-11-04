import { animate, motion, useMotionValue, useTransform, type MotionStyle } from 'motion/react';
import { useEffect, type ReactNode } from 'react';
import badgeIcon from '@assets/icons/origin/discount-filled.svg';
import badgeSvg from '@assets/icons/origin/discount-filled.svg?raw';
import { handoff } from '../../../motion/presets';
import { useReduceMotion } from '../../../motion/reducedMotion';
import { csTokens } from '../tokens';
import styles from '../listing.module.css';

/** the nudge's seal motion (EligibleRow v2, tg=5): 90° turn (8 lobes, so it lands on its own outline) and the barest
    dip at mid-turn, on the spread's eased tween */
const TURN = csTokens.toggleV2.mix.spread.on;
const DIP = csTokens.toggleV2.mix.stamp.dip;
/** the chip arrives with the lead in CouponListing's `belowBar` fade (results-fade: `handoff.fade.reveal`, 0.3s
    S-curve); the turn sets off once that fade is ≈80% in (0.2s), so it is seen, not lost in the entrance */
const TURN_DELAY = handoff.fade.reveal * (2 / 3);

/* the same discount-filled glyph as the nudge (`GLYPHS['discount-filled']`, EligibleRow), split like its SEAL: the
   scalloped ring turns, the % stays upright as a true hole onto the chip's gradient */
const SEAL = (() => {
  const d = /\sd="([^"]+)"/.exec(badgeSvg)?.[1] ?? '';
  const cut = d.search(/z/i) + 1;
  const url = (path: string) =>
    `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill-rule="evenodd" d="${path}"/></svg>`)}")`;
  return { whole: `url("${badgeIcon}")`, ring: url(d.slice(0, cut)), pct: url(d.slice(cut)) };
})();
const masked = (url: string) => ({ WebkitMaskImage: url, maskImage: url });
const SEAL_CUT = {
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
  const rot = useTransform(p, (v) => v * 90);
  const scale = useTransform(p, (v) => 1 - DIP * Math.sin(Math.PI * Math.min(1, Math.max(0, v))));
  // at rest the whole glyph shows (exact); while turning, the ring turns under the upright % hole
  const turning = useTransform(p, (v) => (v > 0.0005 && v < 0.9995 ? 1 : 0));
  const still = useTransform(turning, (t) => 1 - t);

  useEffect(() => {
    if (reduce) return;
    p.jump(0);
    const run = animate(p, 1, { duration: TURN.duration, ease: TURN.ease, delay: TURN_DELAY });
    return () => run.stop();
  }, [p, reduce]);

  return (
    <div className={[styles.chip, match ? styles.chipMatch : styles.chipNone].join(' ')}>
      <motion.span className={styles.chipSeal} style={{ scale }} aria-hidden data-testid="cs-chip-seal">
        <motion.span className={styles.chipGlyph} style={{ opacity: still, ...masked(SEAL.whole) }} />
        <motion.span className={styles.chipCut} style={{ opacity: turning, ...SEAL_CUT }}>
          <motion.span className={styles.chipGlyph} style={{ rotate: rot, ...masked(SEAL.ring) }} />
        </motion.span>
      </motion.span>
      <span className={styles.chipText}>{children}</span>
    </div>
  );
}
