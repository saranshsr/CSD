import { animate, motion, useMotionValue, useTransform, type AnimationPlaybackControls, type MotionStyle, type MotionValue } from 'motion/react';
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { handoff, supermall } from '../../motion/presets';
import { useReduceMotion } from '../../motion/reducedMotion';
import { csTokens } from './tokens';

/**
 * `&ne=1|2|3`: how the coupon nudge appears, the same system on both of its screens (row v2 only): the search page's
 * Eligible row v2 (EligibleRow) and the results' scope chip (ScopeChip). Read once; main.tsx keeps it on every page.
 * No `ne` (0): nothing here runs and nothing is wrapped, so today's behaviour is untouched.
 *   1 · seal leads: the seal turns in (the 90° + dip of the toggle), the words and the fill fade up 80ms behind it
 *   2 · fill wipe: the toggle's feathered front reveals the nudge left → right from the seal, which turns as it starts
 *   3 · settle after content: the page lands without the nudge, then its space opens (no bounce) and it fades in
 * Each plays once per mount, after the screen's own transition has settled (`csTokens.entrance`). Reduced motion: the
 * resting look at once.
 */
export const NE: 0 | 1 | 2 | 3 = (() => {
  const n = typeof window === 'undefined' ? 0 : Number(new URLSearchParams(window.location.search).get('ne'));
  return n === 1 || n === 2 || n === 3 ? n : 0;
})();

const E = csTokens.entrance;
/** the toggle's own tween: the fill's 0.5s spread and the seal's turn share it */
const TURN = csTokens.toggleV2.mix.spread.on;

export interface Entrance {
  /** 0 → 1: one extra 90° turn of the seal (with the toggle's dip); stays 0 unless ne=1 / 2 plays */
  turn: MotionValue<number>;
  /** ne=1: the seal's fade */
  seal?: MotionStyle;
  /** ne=1: the words, the fill (and the switch) fading up behind the seal */
  body?: MotionStyle;
  /** ne=2: the wipe, as a mask on the whole nudge */
  mask?: MotionStyle;
}

/** the toggle's feathered front (EligibleRow `useSpreadStampLook` mask) in % of the nudge: opaque behind it */
const front = (v: number) => {
  const F = E.wipe.feather;
  const f = Math.min(1, Math.max(0, v)) * (1 + F);
  return `linear-gradient(to right, black ${((f - F) * 100).toFixed(2)}%, transparent ${(f * 100).toFixed(2)}%)`;
};

/** ne=1 / 2, played `at` s after mount (once). Anything else returns `turn` at 0 and no styles. */
export function useEntrance(at: number): Entrance {
  const reduce = useReduceMotion();
  const kind = reduce ? 0 : NE;
  const turn = useMotionValue(0);
  const sealO = useMotionValue(kind === 1 ? 0 : 1);
  const bodyO = useMotionValue(kind === 1 ? 0 : 1);
  const bodyY = useMotionValue(kind === 1 ? E.seal.rise : 0);
  const wipe = useMotionValue(kind === 2 ? 0 : 1);
  // at rest the mask drops, so the resting look is exactly today's
  const mask = useTransform(wipe, (v) => (v >= 0.9995 ? 'none' : front(v)));

  useEffect(() => {
    if (kind !== 1 && kind !== 2) return;
    const runs: AnimationPlaybackControls[] = [];
    const tween = { duration: TURN.duration, ease: TURN.ease, delay: at };
    turn.jump(0);
    runs.push(animate(turn, 1, tween));
    if (kind === 1) {
      sealO.jump(0);
      bodyO.jump(0);
      bodyY.jump(E.seal.rise);
      runs.push(animate(sealO, 1, { duration: E.seal.fade, ease: handoff.easeOut, delay: at }));
      runs.push(animate(bodyO, 1, { duration: E.seal.bodyFade, ease: handoff.easeOut, delay: at + E.seal.lag }));
      runs.push(animate(bodyY, 0, { duration: E.seal.bodyMove, ease: supermall.ease.soft, delay: at + E.seal.lag }));
    } else {
      wipe.jump(0);
      runs.push(animate(wipe, 1, tween));
    }
    return () => runs.forEach((r) => r.stop());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (kind === 1) return { turn, seal: { opacity: sealO }, body: { opacity: bodyO, y: bodyY } };
  if (kind === 2) return { turn, mask: { WebkitMaskImage: mask, maskImage: mask } };
  return { turn };
}

/**
 * ne=3: the nudge's slot opens from 0 to its height `at` s after mount on the toggle's eased tween (no bounce, and no
 * spring tail creeping the last px), so what is under it eases down (never jumps), and the nudge fades in over the last
 * px of it, once only its padding is left under the edge. Imperative (motion values, not `initial`), so it also plays on a page opened directly, where the navigator's
 * first screen skips `initial`. Any other `ne` (and reduced motion): the children as they are, unwrapped.
 */
export function EntranceSlot({ at, children }: { at: number; children: ReactNode }) {
  if (NE !== 3) return <>{children}</>;
  return <Slot at={at}>{children}</Slot>;
}

function Slot({ at, children }: { at: number; children: ReactNode }) {
  const reduce = useReduceMotion();
  const inner = useRef<HTMLDivElement>(null);
  const p = useMotionValue(0); // how open, 0..1
  const natural = useMotionValue(0); // the content's live height (layout px), so it lands on what is there at the end
  // the nudge fades in over the last `reveal` px of the opening: by then only its bottom padding is still under the
  // edge, so the clip never cuts the nudge itself
  const o = useTransform(() => Math.min(1, Math.max(0, 1 - (natural.get() * (1 - p.get())) / E.settle.reveal)));
  // `auto` once it has opened (the copy can reflow), and clipped only while it opens (a focus ring is never cut at rest)
  const [landed, setLanded] = useState(false);
  const height = useTransform(() => `${(p.get() * natural.get()).toFixed(2)}px`);

  useLayoutEffect(() => {
    const el = inner.current;
    if (!el || reduce) return;
    natural.jump(el.offsetHeight); // the observer refines it to fractional px on its first callback
    const ro = new ResizeObserver(([e]) => natural.set(e.borderBoxSize?.[0]?.blockSize ?? e.contentRect.height));
    ro.observe(el);
    p.jump(0);
    setLanded(false);
    const open = animate(p, 1, { duration: E.settle.open, ease: TURN.ease, delay: at });
    void open.then(() => setLanded(true));
    return () => {
      ro.disconnect();
      open.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce]);

  if (reduce) return <>{children}</>;
  return (
    <motion.div style={{ height: landed ? 'auto' : height, opacity: o, overflow: landed ? 'visible' : 'hidden' }} data-testid="cs-entrance-slot">
      <div ref={inner}>{children}</div>
    </motion.div>
  );
}
