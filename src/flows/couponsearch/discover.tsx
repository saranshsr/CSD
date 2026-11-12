import { animate, cubicBezier, motion, useMotionValue, useMotionValueEvent, useTransform, type AnimationPlaybackControls, type MotionValue } from 'motion/react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useNav } from '../../kit/Navigator';
import { easing } from '../../motion/presets';
import { useReduceMotion } from '../../motion/reducedMotion';
import { layout } from '../../foundations/tokens';
import { CsSearchBar } from './components/CsSearchBar';
import { SEAL, SEAL_CUT, masked } from './components/ScopeChip';
import { copy, coupon } from './data';
import { csTokens } from './tokens';
import styles from './listing.module.css';

/**
 * `&cn=1|2`: a discovery nudge on the coupon page (EligibleScreen, row / row v2) for the search's "Search within
 * BEAUTY10 items only" toggle, which starts off. Read once; main.tsx keeps it on every page. No `cn` (0): nothing here
 * renders and the page is today's.
 *   1 · Seal peek: a seal tab slides in at the right screen edge as the bar draws back, holds, and leaves. Tapped, it
 *       slides back out as the bar grows back and the search opens over it, its Eligible row sliding in from the right
 *       with the seal rolling
 *   2 · Placeholder: the bar reads "Search within **BEAUTY10** items" (copy.discover.placeholder)
 * Tapping the nudge (the tab, or the bar with cn=2) opens the search with the toggle on. Values: `csTokens.discover`.
 * Debug: `&nt=<ms>` freezes the peek clock that many ms after mount (a pure function of its clock, so a frozen rAF
 * still shows the frame).
 */
const search = typeof window === 'undefined' ? null : new URLSearchParams(window.location.search);
export const CN: 0 | 1 | 2 = (() => {
  const n = Number(search?.get('cn'));
  return n === 1 || n === 2 ? n : 0;
})();
const NT: number | null = (() => {
  const raw = search?.get('nt');
  const n = raw == null || raw === '' ? NaN : Number(raw);
  return Number.isFinite(n) && n >= 0 ? n / 1000 : null;
})();

const D = csTokens.discover;
const P = D.peek;
/** the seal's quarter-turn: the toggle's (EligibleRow v2 / ScopeChip) 0.5s eased tween, with its dip */
const TURN = csTokens.toggleV2.mix.spread.on;
const DIP = csTokens.toggleV2.mix.stamp.dip;
const turnEase = cubicBezier(...TURN.ease);
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** one critically damped spring, from rest to rest, as a function of time (ω = 2π ÷ response) */
const W = (2 * Math.PI) / P.response;
const settleIn = (tau: number) => (tau <= 0 ? 0 : 1 - (1 + W * tau) * Math.exp(-W * tau));
const IN_AT = D.settle;
const OUT_AT = D.settle + P.response + P.hold;
const END = OUT_AT + P.tail;
/** reduced motion: a moment in the hold, where the tab rests in place and the turn is done */
const REST = IN_AT + P.turnLag + TURN.duration + 0.2;
/** the bar's right edge draws back this far for the tab: 48 visible + the 8 gap − the row's 16 gutter */
const PEEK_SHRINK = P.visible + P.gap - 16;
/** the peek's progress (1 = tab fully in, bar drawn back), s after mount */
const peekAt = (t: number) => {
  const v = t < OUT_AT ? settleIn(t - IN_AT) : settleIn(OUT_AT - IN_AT) * (1 - settleIn(t - OUT_AT));
  return v < 0.0005 ? 0 : v > 0.9995 ? 1 : v;
};
const turnAt = (t: number) => turnEase(clamp01((t - IN_AT - P.turnLag) / TURN.duration));

/**
 * The tab's tap → the search, read by the search screen as it mounts (a module hand-off like `barMorph`: it never
 * reaches the URL). `x`: the bar's progress (1 = drawn back for the tab), still springing home, so the search's bar
 * grows on it in step with the page's; the search's row then slides in from the right (`csTokens.discover.slide`).
 */
export interface ScopedEntry {
  x: MotionValue<number>;
  /** `performance.now()` at the tap: the row's slide is timed from it, not from the search's (later) mount */
  at: number;
}
let scoped: ScopedEntry | null = null;
export const scopedEntry = {
  arm: (entry: ScopedEntry) => void (scoped = entry),
  peek: () => scoped,
  disarm: () => void (scoped = null),
};
/** the search's bar during a scoped entry: the page bar's right inset, on the same value */
export function useScopedBar(entry: ScopedEntry | null) {
  const zero = useMotionValue(0);
  return useTransform(entry?.x ?? zero, (v) => v * PEEK_SHRINK);
}
/**
 * The search's Eligible row during a scoped entry: in from one device width to the right on `slide.ease` over
 * `slide.duration`, `slide.delay` after the tap; its opacity eases out over the first `slide.fadeShare` of that; and
 * the seal's roll on the same value (`turn`, in quarter turns, for EligibleRow's extra-turn value: −roll ÷ 90 at rest,
 * a multiple of 45° so it lands on its own outline).
 */
export function useScopedSlide(entry: ScopedEntry | null) {
  const S = D.slide;
  const p = useMotionValue(entry ? 1 : 0); // 1 = one device width to the right, 0 = in place
  const o = useMotionValue(entry ? 0 : 1);
  useEffect(() => {
    if (!entry) return;
    p.jump(1);
    o.jump(0);
    const delay = Math.max(0, S.delay - (performance.now() - entry.at) / 1000);
    const runs = [
      animate(p, 0, { duration: S.duration, ease: S.ease, delay }),
      animate(o, 1, { duration: S.duration * S.fadeShare, ease: easing.out, delay }),
    ];
    return () => runs.forEach((r) => r.stop());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const x = useTransform(p, (v) => v * layout.deviceWidth);
  const turn = useTransform(p, (v) => (-S.roll / 90) * (1 - v));
  return { x, opacity: o, turn };
}

/* ── the copy ──────────────────────────────────────────────────────────────────────────────────────────────────── */

/** copy.discover.placeholder with `{code}` set in SemiBold */
function ScopedCopy() {
  const [lead, tail = ''] = copy.discover.placeholder.split('{code}');
  return (
    <>
      {lead}
      <b>{coupon.code}</b>
      {tail}
    </>
  );
}

/** cn=2: the placeholder drawn over the (empty-placeholder) field, on the input's own box and text inset */
function ScopedPlaceholder({ wrap: el }: { wrap: HTMLDivElement | null }) {
  const [box, setBox] = useState<{ left: number; top: number; width: number; height: number } | null>(null);
  useLayoutEffect(() => {
    const input = el?.querySelector('input');
    if (!el || !input) return;
    const measure = () => {
      const w = el.getBoundingClientRect();
      const r = input.getBoundingClientRect();
      const k = el.offsetWidth ? w.width / el.offsetWidth : 1; // the phone frame may be scaled
      setBox({ left: (r.left - w.left) / k, top: (r.top - w.top) / k, width: r.width / k, height: r.height / k });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [el]);
  if (!box) return null;
  return (
    <span className={styles.discPh} style={box} aria-hidden data-testid="cs-discover-placeholder">
      <ScopedCopy />
    </span>
  );
}

/* ── cn=1 · the peek ───────────────────────────────────────────────────────────────────────────────────────────── */

/** the seal tab at the right screen edge, and the bar drawing back for it on the same progress */
function useSealPeek() {
  const reduce = useReduceMotion();
  // a frozen frame starts there, so the first render already shows it (a hidden pane never ticks a frame)
  const first = reduce ? REST : (NT ?? 0);
  const clock = useMotionValue(first);
  const x = useMotionValue(peekAt(first));
  const handed = useRef(false);
  const run = useRef<AnimationPlaybackControls | null>(null);
  useMotionValueEvent(clock, 'change', (t) => !handed.current && x.set(peekAt(t)));
  useEffect(() => {
    if (reduce) return void clock.jump(REST); // at rest in place, tappable, and it stays
    if (NT != null) return void clock.jump(NT);
    clock.jump(0);
    run.current = animate(clock, END, { duration: END, ease: 'linear' });
    return () => run.current?.stop();
  }, [clock, reduce]);

  const barInset = useTransform(x, (v) => v * PEEK_SHRINK);
  const tabX = useTransform(x, (v) => (1 - v) * P.visible);
  const shown = useTransform(x, (v) => (v > 0.0005 ? 'visible' : 'hidden'));
  const q = useTransform(clock, turnAt);
  const rot = useTransform(q, (v) => v * P.turn);
  const scale = useTransform(q, (v) => 1 - DIP * Math.sin(Math.PI * v));
  // at rest the whole glyph shows (exact); while turning, the ring turns under the upright % hole
  const turning = useTransform(q, (v) => (v > 0.0005 && v < 0.9995 ? 1 : 0));
  const still = useTransform(turning, (v) => 1 - v);
  // the tab only takes taps while it is mostly in
  const [tappable, setTappable] = useState(() => x.get() > 0.5);
  useMotionValueEvent(x, 'change', (v) => setTappable(!handed.current && v > 0.5));

  /** the tap: the tab leaves to the right and the bar grows back, together on one ease weighted to leave, from where
      they are */
  const leave = () => {
    handed.current = true;
    run.current?.stop();
    setTappable(false);
    animate(x, 0, { duration: D.tap.duration, ease: D.tap.ease });
  };
  return { x, barInset, tabX, shown, rot, scale, turning, still, tappable, leave, reduce };
}

function SealTab({ peek, onPress }: { peek: ReturnType<typeof useSealPeek>; onPress: () => void }) {
  return (
    <span className={styles.discTabClip} aria-hidden={!peek.tappable}>
      <motion.button
        type="button"
        className={styles.discTab}
        style={{ x: peek.tabX, visibility: peek.shown, pointerEvents: peek.tappable ? 'auto' : 'none', borderRadius: `${P.radius}px 0 0 ${P.radius}px` }}
        // feedback on press, not on click: down presses in, up / cancel lets go
        whileTap={{ scale: P.press.scale }}
        transition={{ duration: P.press.duration, ease: easing.out }}
        onClick={onPress}
        tabIndex={peek.tappable ? 0 : -1}
        aria-label={copy.discover.tabLabel}
        data-testid="cs-discover-tab"
      >
        <motion.span className={styles.discSeal} style={{ scale: peek.scale }} aria-hidden>
          <motion.span className={styles.chipGlyph} style={{ opacity: peek.still, ...masked(SEAL.whole) }} />
          <motion.span className={styles.chipCut} style={{ opacity: peek.turning, ...SEAL_CUT }}>
            <motion.span className={styles.chipGlyph} style={{ rotate: peek.rot, ...masked(SEAL.ring) }} />
          </motion.span>
        </motion.span>
      </motion.button>
    </span>
  );
}

function PeekBar({ onBarPress, onScopedPress }: { onBarPress: () => void; onScopedPress: () => void }) {
  const nav = useNav();
  const peek = useSealPeek();
  const leaving = useRef(false);
  const onTap = () => {
    if (leaving.current) return;
    leaving.current = true;
    // reduced motion: the tab stays put and the kit's plain cross-fade opens the search
    if (peek.reduce) return onScopedPress();
    // one gesture: the tab leaves and the search opens on the same frame, its bar growing on the page bar's value
    peek.leave();
    scopedEntry.arm({ x: peek.x, at: performance.now() });
    onScopedPress();
  };
  return (
    <div className={styles.disc} data-cn="1">
      <motion.div style={{ marginRight: peek.barInset }}>
        <CsSearchBar value="" onChange={() => undefined} onBack={nav.back} onFieldPress={onBarPress} />
      </motion.div>
      <SealTab peek={peek} onPress={onTap} />
    </div>
  );
}

function PlaceholderBar({ onScopedPress }: { onScopedPress: () => void }) {
  const nav = useNav();
  // a state ref: the wrapper's ref attaches after its children's layout effects, so the placeholder gets the node itself
  const [wrap, setWrap] = useState<HTMLDivElement | null>(null);
  return (
    <div ref={setWrap} className={styles.disc} data-cn="2">
      <CsSearchBar value="" placeholder="" onChange={() => undefined} onBack={nav.back} onFieldPress={onScopedPress} />
      <ScopedPlaceholder wrap={wrap} />
    </div>
  );
}

/**
 * The coupon page's bar row with the `cn` nudge. `onBarPress`: today's search entry; `onScopedPress`: the search with
 * the toggle on (cn=1: the tab; cn=2: the whole bar, as its placeholder promises).
 */
export function DiscoverBar({ cn, onBarPress, onScopedPress }: { cn: 1 | 2; onBarPress: () => void; onScopedPress: () => void }) {
  return cn === 1 ? <PeekBar onBarPress={onBarPress} onScopedPress={onScopedPress} /> : <PlaceholderBar onScopedPress={onScopedPress} />;
}
