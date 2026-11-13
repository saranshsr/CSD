import { AnimatePresence, animate, cubicBezier, motion, useMotionValue, useMotionValueEvent, useTransform, type AnimationPlaybackControls, type MotionValue } from 'motion/react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useNav } from '../../kit/Navigator';
import { easing } from '../../motion/presets';
import { useReduceMotion } from '../../motion/reducedMotion';
import { layout } from '../../foundations/tokens';
import { CsSearchBar } from './components/CsSearchBar';
import { SEAL, SEAL_CUT, masked } from './components/ScopeChip';
import { copy, coupon } from './data';
import { tipNudge } from './tipNudge';
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
 *   3 · Tooltip: the cn=1 seal tab slides in and holds under a dark tooltip pointing at it, "New: search only
 *       **BEAUTY10** items"; it goes after `tip.hold` s (or on a scroll, or a tap elsewhere) and the tab slides out. The
 *       first 3 coupon-page visits only, one counter for all coupons, ended early by using the coupon search
 *       (tipNudge.ts; `&nr=1` resets it). Seal or tooltip → the cn=1 scoped entry; the bar → today's search
 *   4 · Tooltip under the bar: no seal. The same tooltip hangs under the bar, its pointer on the placeholder word,
 *       "New in search: **BEAUTY10** items only · Tap search to try it". Same counter, timings and dismissal. While it
 *       shows, the tooltip and the bar (its target) open the search with the toggle on; once it has gone, the bar is
 *       today's search again
 * Tapping the nudge (the tab, or the bar with cn=2) opens the search with the toggle on. Values: `csTokens.discover`.
 * Debug: `&nt=<ms>` freezes the peek clock that many ms after mount (a pure function of its clock, so a frozen rAF
 * still shows the frame).
 */
const search = typeof window === 'undefined' ? null : new URLSearchParams(window.location.search);
export const CN: 0 | 1 | 2 | 3 | 4 = (() => {
  const n = Number(search?.get('cn'));
  return n === 1 || n === 2 || n === 3 || n === 4 ? n : 0;
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

/** the tab's and the bar's look from the peek's progress `x` (1 = tab in, bar drawn back) and the turn's `q` (0 → 1) */
function usePeekLook(x: MotionValue<number>, q: MotionValue<number>) {
  const barInset = useTransform(x, (v) => v * PEEK_SHRINK);
  const tabX = useTransform(x, (v) => (1 - v) * P.visible);
  const shown = useTransform(x, (v) => (v > 0.0005 ? 'visible' : 'hidden'));
  const rot = useTransform(q, (v) => v * P.turn);
  const scale = useTransform(q, (v) => 1 - DIP * Math.sin(Math.PI * v));
  // at rest the whole glyph shows (exact); while turning, the ring turns under the upright % hole
  const turning = useTransform(q, (v) => (v > 0.0005 && v < 0.9995 ? 1 : 0));
  const still = useTransform(turning, (v) => 1 - v);
  return { barInset, tabX, shown, rot, scale, turning, still };
}
type PeekLook = ReturnType<typeof usePeekLook> & { tappable: boolean };

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

  const q = useTransform(clock, turnAt);
  const look = usePeekLook(x, q);
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
  return { x, ...look, tappable, leave, reduce };
}

function SealTab({ peek, onPress }: { peek: PeekLook; onPress: () => void }) {
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

/* ── cn=3 · the tooltip nudge ──────────────────────────────────────────────────────────────────────────────────── */

const TIP = D.tip;
const snap = (v: number) => (v < 0.0005 ? 0 : v > 0.9995 ? 1 : v);

/** while `on`: a scroll anywhere, or a press outside `keep` (a selector), calls `dismiss` */
function useTipDismiss(on: boolean, dismiss: () => void, keep: string) {
  const latest = useRef(dismiss);
  latest.current = dismiss;
  useEffect(() => {
    if (!on) return;
    const onScroll = () => latest.current();
    const onDown = (e: PointerEvent) => {
      const el = e.target instanceof Element ? e.target : null;
      if (!el?.closest(keep)) latest.current();
    };
    window.addEventListener('scroll', onScroll, { capture: true, passive: true });
    document.addEventListener('pointerdown', onDown, true);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      document.removeEventListener('pointerdown', onDown, true);
    };
  }, [on, keep]);
}

/**
 * The cn=1 tab on its own clock, held for the tooltip: in on the peek's spring at `settle`, the tooltip `tip.at` s
 * later, the tooltip gone after `tip.hold` s (or a scroll, or a tap elsewhere: `dismiss`), and the tab out on the same
 * spring `tip.outLag` s after that, from wherever it is. Reduced motion: the tab at rest from the start, and it stays.
 */
function useTipPeek() {
  const reduce = useReduceMotion();
  const x = useMotionValue(reduce ? 1 : 0);
  const q = useMotionValue(reduce ? 1 : 0);
  const [tip, setTip] = useState(false);
  const stage = useRef<'in' | 'tip' | 'out' | 'handed'>('in');
  const slide = useRef<AnimationPlaybackControls | null>(null);
  const turn = useRef<AnimationPlaybackControls | null>(null);
  const timers = useRef<number[]>([]);
  const later = (s: number, fn: () => void) => void timers.current.push(window.setTimeout(fn, s * 1000));
  const clear = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };
  /** a closed-form spring run on a linear clock (as cn=1's), so in and out are the same critically damped curve */
  const run = (fn: (t: number) => number) => {
    slide.current?.stop();
    const T = P.response + P.tail;
    slide.current = animate(0, T, { duration: T, ease: 'linear', onUpdate: (t) => x.set(snap(fn(t))) });
  };
  const dismiss = () => {
    if (stage.current !== 'tip') return;
    stage.current = 'out';
    clear();
    setTip(false);
    if (reduce) return;
    later(TIP.outLag, () => {
      const from = x.get();
      run((t) => from * (1 - settleIn(t)));
    });
  };
  const show = () => {
    if (stage.current !== 'in') return;
    stage.current = 'tip';
    setTip(true);
    later(TIP.hold, dismiss);
  };
  useEffect(() => {
    if (reduce) {
      later(IN_AT, show);
      return clear;
    }
    later(IN_AT, () => run(settleIn));
    // the seal's quarter-turn on the page clock, as cn=1 (never stopped by the slide out: it ends long before)
    const turnEnd = IN_AT + P.turnLag + TURN.duration;
    turn.current = animate(0, turnEnd, { duration: turnEnd, ease: 'linear', onUpdate: (t) => q.set(turnAt(t)) });
    later(IN_AT + TIP.at, show);
    return () => {
      clear();
      slide.current?.stop();
      turn.current?.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // while the tooltip shows: the list scrolling, or a press anywhere but the seal or the tooltip, sends it away
  useTipDismiss(tip, dismiss, '[data-testid="cs-discover-tab"], [data-testid="cs-discover-tip"]');

  const look = usePeekLook(x, q);
  const [tappable, setTappable] = useState(() => x.get() > 0.5);
  useMotionValueEvent(x, 'change', (v) => setTappable(stage.current !== 'handed' && v > 0.5));
  /** the tap: the tooltip goes and the tab leaves to the right as the bar grows back, cn=1's tap */
  const leave = () => {
    stage.current = 'handed';
    clear();
    slide.current?.stop();
    setTip(false);
    setTappable(false);
    if (!reduce) animate(x, 0, { duration: D.tap.duration, ease: D.tap.ease });
  };
  return { x, ...look, tappable, tip, leave, reduce };
}

/**
 * The tooltip. `anchor: 'seal'` (cn=3): right-aligned `tip.edge` from the screen edge, its pointer on the seal, "New:
 * search only **CODE** items" over the coupon's value line. `anchor: 'field'` (cn=4): on the bar's left edge, its pointer
 * on the centre of the bar's placeholder word (measured from the input, so it follows the bar's own inset and font),
 * "New in search: **CODE** items only" over "Tap search to try it".
 */
function SealTip({ reduce, onPress, anchor = 'seal' }: { reduce: boolean; onPress: () => void; anchor?: 'seal' | 'field' }) {
  const text = anchor === 'seal' ? copy.discover.tip : copy.discover.barTip;
  const self = useRef<HTMLButtonElement>(null);
  const head = useRef<HTMLSpanElement>(null);
  // one line while it fits; otherwise the lead over "CODE items…", so the box hugs its longest line
  const [stack, setStack] = useState(false);
  // cn=4: the pointer's centre, px from the bar's left edge
  const [at, setAt] = useState<number | null>(null);
  useLayoutEffect(() => {
    const el = head.current;
    if (el && el.scrollWidth > TIP.maxWidth - 16) setStack(true);
    const wrap = self.current?.parentElement;
    const input = wrap?.querySelector('input');
    if (anchor !== 'field' || !wrap || !input) return;
    const k = wrap.offsetWidth ? wrap.getBoundingClientRect().width / wrap.offsetWidth : 1; // the phone frame may be scaled
    const ctx = document.createElement('canvas').getContext('2d');
    if (ctx) ctx.font = getComputedStyle(input).font;
    const word = ctx?.measureText(input.placeholder || copy.search.placeholder).width ?? 44;
    // the input's UA 2px text inset, then half the word
    setAt((input.getBoundingClientRect().left - wrap.getBoundingClientRect().left) / k + 2 + word / 2);
  }, [anchor]);
  const field = anchor === 'field';
  const ptrX = field ? (at ?? 0) - 6 : null;
  const tipAt = field ? `${(at ?? 0)}px -6px` : `calc(100% - ${TIP.pointerInset + 6}px) -6px`;
  const place = field ? { left: 0 } : { right: `calc(${TIP.edge}px - var(--nk-space-s16))` };
  const away = reduce ? { opacity: 0 } : { opacity: 0, scale: TIP.fromScale };
  return (
    <motion.button
      ref={self}
      type="button"
      className={styles.discTip}
      style={{ top: `calc(100% + ${TIP.gap + 6}px)`, ...place, maxWidth: TIP.maxWidth, transformOrigin: tipAt, visibility: field && at == null ? 'hidden' : undefined }}
      initial={away}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ ...away, transition: TIP.exit }}
      transition={reduce ? { duration: 0.2, ease: easing.out } : { ...TIP.enter, opacity: { duration: 0.2, ease: easing.out } }}
      onClick={onPress}
      aria-label={copy.discover.tabLabel}
      data-testid="cs-discover-tip"
    >
      <svg className={styles.discTipPtr} style={ptrX == null ? { right: TIP.pointerInset } : { left: ptrX }} viewBox="0 0 12 6" aria-hidden>
        <path d="M7.06 .49a1.4 1.4 0 0 0-2.12 0L0 6h12L7.06.49Z" fill="currentColor" />
      </svg>
      <span ref={head} className={styles.discTipHead} data-stack={stack || undefined}>
        <span>{text.lead} </span>
        <span>
          <b>{coupon.code}</b> {text.tail}
        </span>
      </span>
      <span className={styles.discTipSub}>{text.sub}</span>
    </motion.button>
  );
}

function TipPeekBar({ onBarPress, onScopedPress }: { onBarPress: () => void; onScopedPress: () => void }) {
  const nav = useNav();
  const peek = useTipPeek();
  const leaving = useRef(false);
  const onTap = () => {
    if (leaving.current) return;
    leaving.current = true;
    tipNudge.used();
    peek.leave();
    // reduced motion: the tab stays put and the kit's plain cross-fade opens the search
    if (!peek.reduce) scopedEntry.arm({ x: peek.x, at: performance.now() });
    onScopedPress();
  };
  return (
    <div className={styles.disc} data-cn="3">
      <motion.div style={{ marginRight: peek.barInset }}>
        <CsSearchBar value="" onChange={() => undefined} onBack={nav.back} onFieldPress={onBarPress} />
      </motion.div>
      <SealTab peek={peek} onPress={onTap} />
      <AnimatePresence>{peek.tip && <SealTip key="tip" reduce={peek.reduce} onPress={onTap} />}</AnimatePresence>
    </div>
  );
}

/** cn=3 / 4 on a visit the counter has used up (or after the coupon search was used): today's bar */
function TipBar({ cn, onBarPress, onScopedPress }: { cn: 3 | 4; onBarPress: () => void; onScopedPress: () => void }) {
  const nav = useNav();
  const [plays] = useState(() => tipNudge.claim());
  if (!plays) return <CsSearchBar value="" onChange={() => undefined} onBack={nav.back} onFieldPress={onBarPress} />;
  return cn === 3 ? <TipPeekBar onBarPress={onBarPress} onScopedPress={onScopedPress} /> : <BarTipBar onBarPress={onBarPress} onScopedPress={onScopedPress} />;
}

/* ── cn=4 · the tooltip under the bar ──────────────────────────────────────────────────────────────────────────── */

/** cn=3's tooltip clock without the seal: in at `settle` + `tip.at`, gone after `tip.hold` s, a scroll, or a press
    outside the tooltip and the bar */
function useBarTip() {
  const reduce = useReduceMotion();
  const [tip, setTip] = useState(false);
  const stage = useRef<'in' | 'tip' | 'out'>('in');
  useEffect(() => {
    const timers: number[] = [];
    timers.push(
      window.setTimeout(() => {
        stage.current = 'tip';
        setTip(true);
        timers.push(window.setTimeout(hide, TIP.hold * 1000));
      }, (IN_AT + TIP.at) * 1000),
    );
    return () => timers.forEach((t) => window.clearTimeout(t));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  function hide() {
    if (stage.current !== 'tip') return;
    stage.current = 'out';
    setTip(false);
  }
  useTipDismiss(tip, hide, '[data-testid="cs-discover-tip"], [data-cs-tip-bar]');
  return { tip, reduce, showing: () => stage.current === 'tip', hide };
}

function BarTipBar({ onBarPress, onScopedPress }: { onBarPress: () => void; onScopedPress: () => void }) {
  const nav = useNav();
  const t = useBarTip();
  // while the tooltip shows, the bar is the target it points at: tapping either takes the tip (search, toggle on)
  const onScoped = () => {
    tipNudge.used();
    t.hide();
    onScopedPress();
  };
  return (
    <div className={styles.disc} data-cn="4">
      <div data-cs-tip-bar>
        <CsSearchBar value="" onChange={() => undefined} onBack={nav.back} onFieldPress={() => (t.showing() ? onScoped() : onBarPress())} />
      </div>
      <AnimatePresence>{t.tip && <SealTip key="tip" anchor="field" reduce={t.reduce} onPress={onScoped} />}</AnimatePresence>
    </div>
  );
}

/**
 * The coupon page's bar row with the `cn` nudge. `onBarPress`: today's search entry; `onScopedPress`: the search with
 * the toggle on (cn=1 / 3: the tab, and cn=3's tooltip; cn=2: the whole bar, as its placeholder promises; cn=4: the
 * tooltip, and the bar while the tooltip shows).
 */
export function DiscoverBar({ cn, onBarPress, onScopedPress }: { cn: 1 | 2 | 3 | 4; onBarPress: () => void; onScopedPress: () => void }) {
  if (cn === 3 || cn === 4) return <TipBar cn={cn} onBarPress={onBarPress} onScopedPress={onScopedPress} />;
  return cn === 1 ? <PeekBar onBarPress={onBarPress} onScopedPress={onScopedPress} /> : <PlaceholderBar onScopedPress={onScopedPress} />;
}
