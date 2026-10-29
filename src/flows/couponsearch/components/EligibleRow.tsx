import { animate, motion, useMotionValue, useSpring, useTransform, type AnimationPlaybackControls, type MotionStyle, type MotionValue, type Transition } from 'motion/react';
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode, type RefObject, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react';
import { colors, field } from '../../../foundations/tokens';
import couponIcon from '@assets/icons/origin/coupon-discount-filled.svg';
import badgeIcon from '@assets/icons/origin/discount-filled.svg';
import badgeSvg from '@assets/icons/origin/discount-filled.svg?raw';
import { haptic } from '../../../motion/haptics';
import { fieldMotion, spring, supermall } from '../../../motion/presets';
import { useReduceMotion } from '../../../motion/reducedMotion';
import { copy } from '../data';
import { useCoupon } from '../couponContext';
import { project, rubber, velocityTracker } from '../gesture';
import { couponsearchFlowTokens, csTokens } from '../tokens';
import styles from '../search.module.css';

const T1 = csTokens.toggle;
const T2 = csTokens.toggleV2;
const { slop } = csTokens.gesture;
const flow = couponsearchFlowTokens.colors as Record<string, string>;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (v: number) => {
  const t = clamp01(v);
  return t * t * (3 - 2 * t);
};
const px = (v: number) => `${v.toFixed(2)}px`;

/** `&tg=1..5` picks the v2 choreography (default 5, spread + stamp). Read once; main.tsx keeps it in the URL on every page. */
const TG = (() => {
  const n = typeof window === 'undefined' ? 5 : Number(new URLSearchParams(window.location.search).get('tg'));
  return n >= 1 && n <= 5 ? n : 5;
})();

/**
 * Eligible row: "Search within BEAUTY10" just under the search bar, from the empty state on. The whole row is the
 * hit target (an iOS settings cell); an Origin M-Toggle is its state.
 *
 * UISwitch, translated: ONE progress value `p` (1 = on) drives the knob's travel and the track green ⇄ grey, so a double
 * tap reverses mid-flight from where it is, with its velocity. The knob stretches 6px toward its travel on touch-down
 * on `spring.press` and relaxes on `supermall.springs.return` (critically damped) as it lands. Dragging along the row
 * scrubs the knob 1:1 (rubber band past the ends); the release projects momentum to pick the side. A haptic tick on
 * commit. Reduced motion: the knob snaps. Pointer-down never takes focus from the search field.
 *
 * v1 (`?v=row`, Origin H20 34×20): the row's tint, hairline, icon and value colour all ride `p`.
 * v2 (`?v=row2`, 42×24 on a 64-high row): the knob is critically damped (`toggleV2.knobSpring`) and the row answers
 * with one of five choreographies, `&tg=1..5` (tokens: `toggleV2.morph | sheen | stamp | depth | mix`):
 *   1 the track becomes the row · 2 a light sweep delivers the value · 3 the seal stamps it · 4 the card pops up ·
 *   5 (default) the green spreads out of the switch and the seal quietly stamps it as it arrives.
 * Each one rests on exactly the same on / off looks. Reduced motion (all five): the row cross-fades for 150ms.
 */
export function EligibleRow({ on, onChange, v2 = false }: { on: boolean; onChange: (on: boolean) => void; v2?: boolean }) {
  return v2 ? <EligibleRowV2 on={on} onChange={onChange} /> : <EligibleRowV1 on={on} onChange={onChange} />;
}

type Pt = { x: number; y: number };

/** What a v2 choreography does with the switch's events, and what it paints. */
interface Look {
  /** the switch settles on a side; `moment` when the state actually changed (the choreography's one-time beats) */
  settle(to: 0 | 1, moment: boolean): void;
  /** the knob is being dragged: `v` is its progress */
  scrub(v: number): void;
  /** touch-down / up, with the touch point in the row's own px */
  press(down: boolean, at?: Pt): void;
  /** jump to a resting side (reduced motion keeps the hidden choreography in step) */
  snap(to: 0 | 1): void;
  row?: MotionStyle;
  /** layers under the content (z -1) */
  under: ReactNode;
  /** layers over the content */
  over?: ReactNode;
  badgeClass?: string;
  badge: MotionStyle;
  icon: ReactNode;
  sub: MotionStyle;
}

interface SwitchSize {
  track: { w: number };
  inset: number;
  knob: number;
  stretch: number;
  rowWidth: number;
}

/** The switch: knob progress, press stretch, tap / drag / keyboard. Shared by v1 and v2. */
function useSwitch(T: SwitchSize, on: boolean, onChange: (on: boolean) => void, p: MotionValue<number>, knobSpring: Transition, look?: Look) {
  const TRAVEL = T.track.w - T.inset * 2 - T.knob; // v1: 14, v2: 18
  const reduce = useReduceMotion();
  const press = useMotionValue(0);
  const run = useRef<AnimationPlaybackControls | null>(null);
  const drag = useRef<{ id: number; x0: number; y0: number; s: number; p0: number; active: boolean; cancelled: boolean } | null>(null);
  const vt = useRef(velocityTracker());
  const [held, setHeld] = useState(false);
  // the look's side, so its one-time beats fire once per change (a drag release and the `on` effect both settle)
  const side = useRef<0 | 1>(on ? 1 : 0);
  const scrubbed = useRef(false);

  const glide = (to: number, velocity = 0) => {
    run.current?.stop();
    if (reduce) {
      p.jump(to);
      return;
    }
    run.current = animate(p, to, { ...knobSpring, velocity });
  };
  const settle = (to: 0 | 1) => {
    const moment = side.current !== to;
    side.current = to;
    if (!look || (!moment && !scrubbed.current)) return;
    scrubbed.current = false;
    look.settle(to, moment);
  };
  useEffect(() => {
    if (!drag.current?.active) {
      glide(on ? 1 : 0, p.getVelocity());
      settle(on ? 1 : 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on]);

  const knobW = useTransform(press, (v) => T.knob + v * T.stretch);
  const knobX = useTransform(() => Math.min(1.08, Math.max(-0.08, p.get())) * (TRAVEL - press.get() * T.stretch));

  const stretch = (v: number) => {
    if (!reduce) animate(press, v, v ? spring.press : supermall.springs.return);
  };
  const commit = (next: boolean) => {
    haptic('tick');
    onChange(next);
  };
  const release = () => {
    setHeld(false);
    stretch(0);
    look?.press(false);
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button > 0) return;
    e.preventDefault(); // the row never takes focus from the search field
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    drag.current = { id: e.pointerId, x0: e.clientX, y0: e.clientY, s: r.width / T.rowWidth || 1, p0: p.get(), active: false, cancelled: false };
    vt.current.reset();
    setHeld(true);
    stretch(1);
    look?.press(true, { x: ((e.clientX - r.left) * el.offsetWidth) / (r.width || 1), y: ((e.clientY - r.top) * el.offsetHeight) / (r.height || 1) });
    try {
      el.setPointerCapture(e.pointerId);
    } catch {
      /* capture is a nicety */
    }
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId || d.cancelled) return;
    const dx = (e.clientX - d.x0) / d.s;
    const dy = (e.clientY - d.y0) / d.s;
    if (!d.active) {
      if (Math.abs(dy) > slop && Math.abs(dy) > Math.abs(dx)) {
        // a scroll, not a switch
        d.cancelled = true;
        release();
        return;
      }
      if (Math.abs(dx) < slop) return;
      d.active = true;
      run.current?.stop();
      d.p0 = p.get(); // x0 stays: the knob catches up with the finger, no dead slop
    }
    let x = d.p0 * TRAVEL + dx;
    if (x < 0) x = rubber(x, TRAVEL);
    else if (x > TRAVEL) x = TRAVEL + rubber(x - TRAVEL, TRAVEL);
    p.set(x / TRAVEL);
    if (look) {
      scrubbed.current = true;
      look.scrub(x / TRAVEL);
    }
    vt.current.add(x, e.timeStamp);
  };
  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    drag.current = null;
    release();
    if (!d || d.id !== e.pointerId || d.cancelled) return;
    if (!d.active) {
      commit(!on);
      return;
    }
    const v = vt.current.get(e.timeStamp);
    const next = project(p.get() * TRAVEL, v) > TRAVEL / 2;
    glide(next ? 1 : 0, v / TRAVEL);
    settle(next ? 1 : 0);
    if (next !== on) commit(next);
  };

  const bind = {
    role: 'switch' as const,
    'aria-checked': on,
    tabIndex: 0,
    'data-held': held || undefined,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel: () => {
      drag.current = null;
      release();
      glide(on ? 1 : 0);
      settle(on ? 1 : 0);
    },
    onKeyDown: (e: ReactKeyboardEvent<HTMLDivElement>) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        commit(!on);
      }
    },
  };
  return { bind, knobX, knobW };
}

const useLabel = () => {
  const coupon = useCoupon();
  return { coupon, label: `${coupon.rowLead ?? copy.row.lead} ${coupon.code} ${coupon.rowTail ?? copy.row.tail}`.trim() };
};

/** v1 (`?v=row`): everything rides the knob's progress. */
function EligibleRowV1({ on, onChange }: { on: boolean; onChange: (on: boolean) => void }) {
  const { coupon, label } = useLabel();
  const p = useMotionValue(on ? 1 : 0);
  const sw = useSwitch(T1, on, onChange, p, fieldMotion.spring.springLight);
  const track = useTransform(p, [0, 1], [colors.border, colors.success]);
  // on: the Figma gradient (base/colour/green/100 → green/50) fades in over white with the toggle
  const onBg = useTransform(p, [0, 1], [0, 1]);
  // off: the borderSubtle hairline, fading out as the on look (gradient + its success-surface hairline) fades in
  const offRing = useTransform(p, [0, 1], [1, 0]);
  const ink = useTransform(p, [0, 1], [flow.csIconOff, colors.success]);
  const valueInk = useTransform(p, [0, 1], [colors.textSecondary, colors.success]);
  return (
    <motion.div className={styles.er} {...sw.bind} aria-label={label} style={{ backgroundColor: colors.bgSurface }}>
      <motion.span className={styles.erOnBg} style={{ opacity: onBg }} aria-hidden />
      <motion.span className={styles.erOffRing} style={{ opacity: offRing }} aria-hidden />
      <motion.span className={styles.erIcon} style={{ backgroundColor: ink, WebkitMaskImage: `url("${couponIcon}")`, maskImage: `url("${couponIcon}")` }} aria-hidden />
      <span className={styles.erCopy}>
        <span className={styles.erText}>
          {coupon.rowLead ?? copy.row.lead} <b>{coupon.code}</b>
          {(coupon.rowTail ?? copy.row.tail) && <span className={styles.erTail}> {coupon.rowTail ?? copy.row.tail}</span>}
        </span>
        <motion.span className={styles.erValue} style={{ color: valueInk }}>
          {coupon.value}
        </motion.span>
      </span>
      <motion.span className={styles.erTrack} style={{ backgroundColor: track }} aria-hidden>
        <motion.span className={styles.erKnob} style={{ x: sw.knobX, width: sw.knobW, background: field.surfacePrimary, boxShadow: field.shadowSm }} />
      </motion.span>
    </motion.div>
  );
}

/* ------------------------------------------------------------------------------------------------------------------ */
/* v2 */

interface Box {
  l: number;
  t: number;
  r: number;
  b: number;
}
interface Geo {
  w: number;
  h: number;
  radius: number;
  badge: Box;
  sub: Box;
  track: Box;
}
interface Parts {
  row: RefObject<HTMLDivElement | null>;
  badge: RefObject<HTMLSpanElement | null>;
  sub: RefObject<HTMLSpanElement | null>;
  track: RefObject<HTMLSpanElement | null>;
}
const boxOf = (el: HTMLElement | null, fallback: Box): Box =>
  el ? { l: el.offsetLeft, t: el.offsetTop, r: el.offsetLeft + el.offsetWidth, b: el.offsetTop + el.offsetHeight } : fallback;
/** the resting 343 × 64 row, until the first measure */
const GEO0: Geo = { w: 343, h: 64, radius: 12, badge: { l: 12, t: 14, r: 48, b: 50 }, sub: { l: 60, t: 32, r: 277, b: 48 }, track: { l: 289, t: 20, r: 331, b: 44 } };
/** where the row's parts sit, in the row's own px (layout boxes: transforms don't move them) */
function useGeo(parts: Parts) {
  const geo = useRef<Geo>(GEO0);
  const measure = () => {
    const row = parts.row.current;
    if (!row) return geo.current;
    const g = geo.current;
    geo.current = {
      w: row.offsetWidth || g.w,
      h: row.offsetHeight || g.h,
      radius: parseFloat(getComputedStyle(row).borderTopLeftRadius) || g.radius,
      badge: boxOf(parts.badge.current, g.badge),
      sub: boxOf(parts.sub.current, g.sub),
      track: boxOf(parts.track.current, g.track),
    };
    return geo.current;
  };
  useLayoutEffect(() => {
    measure();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return { geo, measure };
}

/** spring a value to `to`, from where it is, with its velocity */
const go = (mv: MotionValue<number>, to: number, t: Transition, delay = 0) => animate(mv, to, { ...t, velocity: mv.getVelocity(), delay });
const atRest = (mv: MotionValue<number>, v: number) => Math.abs(mv.get() - v) < 0.001 && Math.abs(mv.getVelocity()) < 0.01;

/** badge and subtitle inks for an on-ness 0..1 */
function useInks(badgeOn: MotionValue<number>, subOn: MotionValue<number>) {
  return {
    badgeBg: useTransform(badgeOn, [0, 1], [colors.bgMuted, colors.successSurface]),
    iconInk: useTransform(badgeOn, [0, 1], [flow.csIconOff, colors.success]),
    // Field text-tertiary is #666D85 = kit `textSecondary`; the kit's literal is used because `field.*` resolves to a CSS
    // var, which motion can't interpolate (the subtitle would snap instead of turning green)
    subInk: useTransform(subOn, [0, 1], [colors.textSecondary, colors.success]),
  };
}
const BADGE_MASK = `url("${badgeIcon}")`;
const masked = (url: string) => ({ WebkitMaskImage: url, maskImage: url });
/** the badge seal split in two (stamp): the scalloped seal turns, the % stays upright */
const SEAL = (() => {
  const d = /\sd="([^"]+)"/.exec(badgeSvg)?.[1] ?? '';
  const cut = d.search(/z/i) + 1;
  const url = (path: string) =>
    `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill-rule="evenodd" d="${path}"/></svg>`)}")`;
  return { ring: url(d.slice(0, cut)), pct: url(d.slice(cut)) };
})();

const OnSurface = ({ style }: { style: MotionStyle }) => <motion.span className={`${styles.erOnBg} ${styles.erOnBg2}`} style={style} aria-hidden />;
const OffRing = ({ style }: { style: MotionStyle }) => <motion.span className={styles.erOffRing} style={style} aria-hidden />;
const Icon = ({ ink }: { ink: MotionValue<string> }) => <motion.span className={styles.erBadgeIcon} style={{ backgroundColor: ink, ...masked(BADGE_MASK) }} />;

/** reduced motion: one uniform value, a 150ms linear cross-fade */
function useUniformLook(on: boolean): Look {
  const u = useMotionValue(on ? 1 : 0);
  const inks = useInks(u, u);
  const offRing = useTransform(u, (v) => 1 - v);
  return {
    settle: (to) => {
      animate(u, to, { duration: T2.fade, ease: 'linear' });
    },
    scrub: (v) => u.set(clamp01(v)),
    press: () => {},
    snap: (to) => u.jump(to),
    under: (
      <>
        <OnSurface style={{ opacity: u }} />
        <OffRing style={{ opacity: offRing }} />
      </>
    ),
    badge: { backgroundColor: inks.badgeBg },
    icon: <Icon ink={inks.iconInk} />,
    sub: { color: inks.subInk },
  };
}

/** tg=1 · the track becomes the row */
function useMorphLook(on: boolean, parts: Parts): Look {
  const K = T2.morph;
  const { geo, measure } = useGeo(parts);
  const mx = useMotionValue(on ? 1 : 0); // the leading (left) end, across the row
  const my = useMotionValue(on ? 1 : 0); // the swell: top, bottom and the switch-side end
  const tint = useMotionValue(on ? 1 : 0); // the switch's green in the material: on while it grows, off while it recedes
  const shape = () => {
    const g = geo.current;
    const ex = clamp01(mx.get());
    const ey = clamp01(my.get());
    const l = g.track.l * (1 - ex);
    const r = (g.w - g.track.r) * (1 - ey);
    const t = g.track.t * (1 - ey);
    const b = (g.h - g.track.b) * (1 - ey);
    const h = g.h - t - b;
    const a0 = Math.max(1, (g.track.r - g.track.l) * (g.track.b - g.track.t));
    return { ex, ey, l, r, t, b, h, rel: Math.max(1, (g.w - l - r) * h) / a0, full: (g.w * g.h) / a0, done: ex >= 0.9995 && ey >= 0.9995 };
  };
  const body = useTransform(() => {
    const s = shape();
    return s.done ? 1 : clamp01((s.rel - 1) / (K.body - 1));
  });
  const clip = useTransform(() => {
    const s = shape();
    if (s.done) return 'none';
    const R = geo.current.radius;
    const cap = s.h / 2;
    const rl = cap + (R - cap) * smooth((s.ex - (1 - K.conform)) / K.conform);
    const rr = cap + (R - cap) * smooth((s.ey - (1 - K.conform)) / K.conform);
    return `inset(${px(s.t)} ${px(s.r)} ${px(s.b)} ${px(s.l)} round ${px(rl)} ${px(rr)} ${px(rr)} ${px(rl)})`;
  });
  const dye = useTransform(() => {
    const s = shape();
    if (s.done) return 0;
    // thins with its size (area ratio ^ dilute), 0 once it covers the row
    const k = (1 / s.full) ** K.dilute;
    const conc = clamp01(((1 / s.rel) ** K.dilute - k) / (1 - k));
    return conc * clamp01(tint.get()) * clamp01((s.rel - 1) / (K.body - 1));
  });
  // the off hairline shows wherever the material isn't; it goes as the leading end meets the far corners
  const ring = useTransform(() => 1 - smooth((clamp01(mx.get()) - (1 - K.conform)) / K.conform));
  const lead = () => geo.current.track.l * (1 - clamp01(mx.get()));
  const subOn = useTransform(() => clamp01((geo.current.sub.l + K.subSpan - lead()) / K.subSpan));
  const badgeOn = useTransform(() => {
    const b = geo.current.badge;
    const from = b.r + (geo.current.sub.l - b.r);
    return clamp01((from - lead()) / (from - b.l));
  });
  // the inks follow the edge on a short spring, so a fast retract never pops a colour
  const inks = useInks(useSpring(badgeOn, K.inkFollow), useSpring(subOn, K.inkFollow));
  return {
    settle: (to) => {
      measure();
      if (to) {
        const delay = atRest(mx, 0) && atRest(my, 0) ? K.lead : 0;
        go(tint, 1, K.tint.on);
        go(my, 1, K.swell, delay);
        go(mx, 1, K.reach, delay);
      } else {
        go(tint, 0, K.tint.off);
        go(mx, 0, K.retract);
        go(my, 0, K.sink, atRest(my, 1) ? K.sinkDelay : 0);
      }
    },
    scrub: (v) => {
      go(tint, 1, K.tint.on);
      go(mx, clamp01(v), T2.chase);
      go(my, clamp01(v), T2.chase);
    },
    press: () => {},
    snap: (to) => {
      mx.jump(to);
      my.jump(to);
      tint.jump(to);
    },
    under: (
      <>
        <OffRing style={{ opacity: ring }} />
        <OnSurface style={{ opacity: body, clipPath: clip, WebkitClipPath: clip }} />
        <motion.span className={styles.erInk} style={{ opacity: dye, clipPath: clip, WebkitClipPath: clip, backgroundColor: colors.success }} aria-hidden />
      </>
    ),
    badge: { backgroundColor: inks.badgeBg },
    icon: <Icon ink={inks.iconInk} />,
    sub: { color: inks.subInk },
  };
}

/** a subtitle ink for an on-ness, mixed by the browser from the kit's tokens (exact token at the ends) */
const subMix = (v: number) =>
  v >= 0.9995 ? colors.success : v <= 0.0005 ? colors.textSecondary : `color-mix(in srgb, var(--nk-color-success) ${(v * 100).toFixed(2)}%, var(--nk-color-text-secondary))`;
const PASSED = 1e4;
/** the subtitle's glint under the light: the green lifted toward white, by how lit it is */
const glint = (v: number) => `color-mix(in srgb, var(--nk-color-success) ${(100 - T2.sheen.glint * v).toFixed(2)}%, var(--nk-palette-white))`;

/** tg=2 · a light sweep delivers the value */
function useSheenLook(on: boolean, parts: Parts): Look {
  const K = T2.sheen;
  const { geo, measure } = useGeo(parts);
  const q = useMotionValue(on ? 1 : 0); // the surface; also the copy's on-ness behind the light
  const ahead = useMotionValue(on ? 1 : 0); // the copy's on-ness ahead of the light
  const band = useMotionValue(PASSED); // the light's centre, px from the row's left; PASSED: no light on the row
  const glow = useMotionValue(0);
  const sweep = useRef<AnimationPlaybackControls | null>(null);
  const crossed = (x: number) => clamp01((band.get() - x) / K.soft + 0.5);
  const onAt = (x: number) => ahead.get() + (q.get() - ahead.get()) * crossed(x);
  const badgeOn = useTransform(() => {
    const b = geo.current.badge;
    return onAt((b.l + b.r) / 2);
  });
  const inks = useInks(badgeOn, q);
  const offRing = useTransform(q, (v) => 1 - v);
  // the subtitle: a hard-stop gradient clipped to the text while the light is inside it, its plain colour otherwise
  const subLit = () => {
    const s = geo.current.sub;
    const x = band.get() - s.l;
    return Math.abs(q.get() - ahead.get()) > 0.001 && x + K.soft / 2 > 0 && x - K.soft / 2 < s.r - s.l;
  };
  const subColor = useTransform(() => (subLit() ? 'transparent' : subMix(onAt(geo.current.sub.l))));
  // the stops lean with the band (skewX → a gradient at 90° − skew), measured along the gradient line
  const lean = ((90 - K.skew) * Math.PI) / 180;
  const subImage = useTransform(() => {
    if (!subLit()) return 'none';
    const s = geo.current.sub;
    const w = s.r - s.l;
    const h = s.b - s.t;
    const len = Math.abs(w * Math.sin(lean)) + Math.abs(h * Math.cos(lean));
    const at = (x: number) => (x - w / 2) * Math.sin(lean) + len / 2;
    const x = band.get() - s.l;
    const half = (K.soft / 2) * Math.sin(lean);
    const lit = Math.min(q.get(), glow.get());
    return `linear-gradient(${90 - K.skew}deg, ${subMix(q.get())} ${px(at(x) - half)}, ${glint(lit)} ${px(at(x))}, ${subMix(ahead.get())} ${px(at(x) + half)})`;
  });
  const subClip = useTransform(() => (subLit() ? 'text' : 'border-box'));
  const bandX = useTransform(band, (b) => b - K.width / 2);
  // out of the render tree while there is no light: even at opacity 0 a blend layer re-rasterises the row
  const bandShown = useTransform(glow, (v) => (v > 0.0005 ? 'block' : 'none'));
  return {
    settle: (to, moment) => {
      const g = measure();
      const end = g.w + K.width;
      if (to) {
        const fresh = !(band.get() > -K.width && band.get() < end);
        if (moment && fresh) {
          // a new pass: the copy waits at what it shows now, the light enters from the left
          ahead.jump(onAt(g.sub.l));
          band.jump(-K.width);
        }
        const delay = moment && fresh ? K.delay : 0;
        go(q, 1, K.surface);
        if (moment || !fresh) {
          sweep.current?.stop();
          const from = band.get();
          const duration = (K.sweep * (end - from)) / (end + K.width);
          glow.jump(glow.get());
          animate(glow, 1, { duration: 0.08, delay });
          sweep.current = animate(band, end, {
            duration,
            delay,
            ease: from <= -K.width + 0.5 ? fieldMotion.ease.easeInOut : fieldMotion.ease.decelerate,
            onComplete: () => {
              glow.jump(0);
              band.jump(PASSED);
              ahead.jump(q.get());
            },
          });
        } else {
          go(ahead, 1, K.surface);
        }
      } else {
        sweep.current?.stop();
        animate(glow, 0, { duration: K.fadeOut, ease: fieldMotion.ease.decelerate });
        go(ahead, 0, K.off);
        animate(q, 0, {
          ...K.off,
          velocity: q.getVelocity(),
          onComplete: () => {
            if (q.get() <= 0.001) band.jump(PASSED);
          },
        });
      }
    },
    scrub: (v) => {
      sweep.current?.stop();
      glow.jump(0);
      band.jump(PASSED);
      go(q, clamp01(v), T2.chase);
      go(ahead, clamp01(v), T2.chase);
    },
    press: () => {},
    snap: (to) => {
      sweep.current?.stop();
      q.jump(to);
      ahead.jump(to);
      glow.jump(0);
      band.jump(PASSED);
    },
    under: (
      <>
        <OnSurface style={{ opacity: q }} />
        {/* the light on the card: a bright core in a faint green halo (a white glint alone vanishes on the mint) */}
        <span className={`${styles.erSheen} ${styles.erSheenUnder}`} aria-hidden>
          <motion.span className={styles.erSheenLight} style={{ x: bandX, skewX: K.skew, width: K.width, opacity: glow, display: bandShown }} />
        </span>
        <OffRing style={{ opacity: offRing }} />
      </>
    ),
    // …and its glint on the inked parts (seal, green copy, track): soft-light lifts saturated colour, leaves dark type
    over: (
      <span className={styles.erSheen} aria-hidden>
        <motion.span className={styles.erSheenBand} style={{ x: bandX, skewX: K.skew, width: K.width, opacity: glow, display: bandShown }} />
      </span>
    ),
    badge: { backgroundColor: inks.badgeBg },
    icon: <Icon ink={inks.iconInk} />,
    sub: { color: subColor, backgroundImage: subImage, WebkitBackgroundClip: subClip, backgroundClip: subClip },
  };
}

/** a feathered linear wash from the left edge: `front` px, `feather` px soft */
const wash = (front: number, feather: number, invert: boolean) =>
  invert
    ? `linear-gradient(to right, transparent ${px(front - feather)}, black ${px(front)})`
    : `linear-gradient(to right, black ${px(front - feather)}, transparent ${px(front)})`;

/** tg=3 · the seal stamps it */
function useStampLook(on: boolean, parts: Parts): Look {
  const K = T2.stamp;
  const { geo, measure } = useGeo(parts);
  const rot = useMotionValue(on ? 90 : 0); // deg; 90 ≡ 0 for the 8-lobed seal
  const squash = useMotionValue(1);
  const seal = useMotionValue(on ? 1 : 0); // the seal's ink
  const bg = useMotionValue(on ? 1 : 0); // the badge's own fill
  const flood = useMotionValue(0); // the ink spreading out of the seal across the badge, 0..1
  const floodA = useMotionValue(0);
  const q = useMotionValue(on ? 1 : 0); // the wash, from the badge side
  const ring = useMotionValue(0);
  const ringA = useMotionValue(0);
  const ringAt = { left: useMotionValue(px(30 - K.ring.r)), top: useMotionValue(px(32 - K.ring.r)) };
  const turning = useTransform(rot, (r) => (Math.abs(r - Math.round(r / 90) * 90) > 0.05 ? 1 : 0));
  const still = useTransform(turning, (t) => 1 - t);
  const F = K.spread.feather;
  const front = () => clamp01(q.get()) * (geo.current.w + F);
  const onMask = useTransform(() => (q.get() >= 0.9995 ? 'none' : wash(front(), F, false)));
  const offMask = useTransform(() => (q.get() <= 0.0005 ? 'none' : wash(front(), F, true)));
  const onOp = useTransform(q, (v) => (v <= 0.0005 ? 0 : 1));
  const offOp = useTransform(q, (v) => (v >= 0.9995 ? 0 : 1));
  const subOn = useTransform(() => clamp01((front() - geo.current.sub.l - 30) / F));
  const inks = useInks(bg, subOn);
  const sealInk = useTransform(seal, [0, 1], [flow.csIconOff, colors.success]);
  // the % is a knockout painted in what shows under it: the badge fill, or the flood once it is under the seal
  const hole = useTransform(() => Math.max(bg.get(), floodA.get()));
  const holeInk = useTransform(hole, [0, 1], [colors.bgMuted, colors.successSurface]);
  const floodImage = useTransform(() => {
    const R = K.flood.from + (K.flood.to - K.flood.from) * clamp01(flood.get());
    return `radial-gradient(circle at 50% 50%, var(--nk-color-success-surface) ${px(R - K.flood.crest)}, color-mix(in srgb, var(--nk-color-success) 12%, var(--nk-color-success-surface)) ${px(R - 1)}, transparent ${px(R + 0.5)})`;
  });
  const floodShown = useTransform(floodA, (v) => (v > 0.0005 ? 'block' : 'none'));
  const ringScale = useTransform(ring, (v) => K.ring.scale[0] + (K.ring.scale[1] - K.ring.scale[0]) * v);
  const ringShown = useTransform(ringA, (v) => (v > 0.0005 ? 'block' : 'none'));
  return {
    settle: (to, moment) => {
      const g = measure();
      ringAt.left.set(px((g.badge.l + g.badge.r) / 2 - K.ring.r));
      ringAt.top.set(px((g.badge.t + g.badge.b) / 2 - K.ring.r));
      if (to) {
        go(rot, 90, K.turn);
        if (moment) {
          animate(squash, 1, { ...K.press, velocity: -K.kick });
          go(seal, 1, K.ink, K.impact);
          // the flood: from under the seal to past the badge's corners, then it becomes the badge's fill
          bg.stop();
          flood.jump(0);
          let landed = false;
          animate(flood, 1, {
            ...K.flood.spring,
            delay: K.impact,
            onUpdate: () => {
              if (landed) return;
              landed = true;
              floodA.jump(1);
            },
            onComplete: () => {
              bg.jump(1);
              floodA.jump(0);
            },
          });
          go(q, 1, K.spread.on, K.impact);
          animate(ring, [0, 1], { duration: K.ring.duration, ease: K.ring.ease, delay: K.impact });
          animate(ringA, [0, K.ring.alpha, 0], { duration: K.ring.duration, times: [0, 0.14, 1], ease: ['easeOut', 'easeOut'], delay: K.impact });
        } else {
          go(seal, 1, K.ink);
          go(bg, 1, K.ink);
          go(q, 1, K.spread.on);
        }
      } else {
        flood.stop();
        go(rot, 0, K.unturn);
        go(squash, 1, K.unturn);
        go(seal, 0, K.inkOff, K.inkOffDelay);
        go(bg, 0, K.inkOff, K.inkOffDelay);
        go(floodA, 0, K.inkOff, K.inkOffDelay);
        go(q, 0, K.spread.off);
        animate(ringA, 0, { duration: 0.12 });
      }
    },
    scrub: (v) => {
      flood.stop();
      go(floodA, 0, T2.chase);
      go(rot, 90 * clamp01(v), T2.chase);
      go(seal, clamp01(v), T2.chase);
      go(bg, clamp01(v), T2.chase);
      go(q, clamp01(v), T2.chase);
    },
    press: (down) => {
      animate(squash, down ? K.preload : 1, down ? spring.press : supermall.springs.return);
    },
    snap: (to) => {
      flood.stop();
      rot.jump(to * 90);
      squash.jump(1);
      seal.jump(to);
      bg.jump(to);
      floodA.jump(0);
      q.jump(to);
      ringA.jump(0);
    },
    under: (
      <>
        <OnSurface style={{ opacity: onOp, WebkitMaskImage: onMask, maskImage: onMask }} />
        <OffRing style={{ opacity: offOp, WebkitMaskImage: offMask, maskImage: offMask }} />
        {/* the ring leaves from behind the badge */}
        <motion.span className={styles.erRing} style={{ ...ringAt, width: K.ring.r * 2, height: K.ring.r * 2, scale: ringScale, opacity: ringA, display: ringShown }} aria-hidden />
      </>
    ),
    badgeClass: styles.erBadgeStamp,
    badge: { backgroundColor: inks.badgeBg },
    icon: (
      <>
        <motion.span className={styles.erFlood} style={{ backgroundImage: floodImage, opacity: floodA, display: floodShown }} />
        <motion.span className={styles.erSeal} style={{ scale: squash }}>
          <motion.span className={styles.erBadgeIcon} style={{ backgroundColor: sealInk, opacity: still, ...masked(BADGE_MASK) }} />
          <motion.span className={styles.erBadgeIcon} style={{ backgroundColor: sealInk, opacity: turning, rotate: rot, ...masked(SEAL.ring) }} />
          <motion.span className={styles.erBadgeIcon} style={{ backgroundColor: holeInk, opacity: turning, ...masked(SEAL.pct) }} />
        </motion.span>
      </>
    ),
    sub: { color: inks.subInk },
  };
}

/** tg=4 · the card pops up */
function useDepthLook(on: boolean, parts: Parts): Look {
  const K = T2.depth;
  const { geo, measure } = useGeo(parts);
  const q = useMotionValue(on ? 1 : 0); // the radial fill
  const lift = useMotionValue(0);
  const sink = useMotionValue(0);
  const origin = useRef<Pt>({ x: 310, y: 32 });
  const touch = useRef<Pt | null>(null);
  const F = K.fill.feather;
  const reach = () => {
    const { w, h } = geo.current;
    const o = origin.current;
    return Math.max(Math.hypot(o.x, o.y), Math.hypot(w - o.x, o.y), Math.hypot(o.x, h - o.y), Math.hypot(w - o.x, h - o.y));
  };
  const radius = () => clamp01(q.get()) * (reach() + F);
  const disc = (invert: boolean) => {
    const r = radius();
    const o = origin.current;
    const at = `circle at ${px(o.x)} ${px(o.y)}`;
    return invert ? `radial-gradient(${at}, transparent ${px(r - F)}, black ${px(r)})` : `radial-gradient(${at}, black ${px(r - F)}, transparent ${px(r)})`;
  };
  const onMask = useTransform(() => (q.get() >= 0.9995 ? 'none' : disc(false)));
  const offMask = useTransform(() => (q.get() <= 0.0005 ? 'none' : disc(true)));
  const onOp = useTransform(q, (v) => (v <= 0.0005 ? 0 : 1));
  const offOp = useTransform(q, (v) => (v >= 0.9995 ? 0 : 1));
  // a part turns as the middle of the soft front crosses it; exactly 0 / 1 at rest wherever the touch was (the inks'
  // follow spring smooths the first frame when the touch is on the part itself)
  const reached = (b: Box) => {
    const v = q.get();
    if (v <= 0.0005 || v >= 0.9995) return v >= 0.9995 ? 1 : 0;
    return clamp01((radius() - Math.hypot((b.l + b.r) / 2 - origin.current.x, (b.t + b.b) / 2 - origin.current.y) + F / 2) / F);
  };
  const badgeOn = useTransform(() => reached(geo.current.badge));
  const subOn = useTransform(() => {
    const s = geo.current.sub;
    return reached({ l: s.l, r: s.l + 120, t: s.t, b: s.b });
  });
  // the inks follow the front on a short spring, so a fast retract never pops a colour
  const inks = useInks(useSpring(badgeOn, K.inkFollow), useSpring(subOn, K.inkFollow));
  const y = useTransform(lift, (v) => -K.lift.px * v);
  const scale = useTransform(() => 1 + K.lift.grow * lift.get() - K.sink * sink.get());
  const shadow = useTransform(lift, (v) => clamp01(v));
  // out of the render tree while flat: even at opacity 0 the blurred shadow re-rasterises the row
  const shadowShown = useTransform(lift, (v) => (v > 0.0005 ? 'block' : 'none'));
  return {
    settle: (to, moment) => {
      const g = measure();
      // a fresh fill starts from the touch (keyboard: the switch); a reversal keeps its centre
      if (atRest(q, to ? 0 : 1)) {
        const t = g.track;
        origin.current = touch.current ?? { x: (t.l + t.r) / 2, y: (t.t + t.b) / 2 };
      }
      touch.current = null;
      if (to) {
        go(q, 1, K.fill.on);
        if (moment) {
          // a kick that peaks at 1: x(t) = v·t·e^(−ωt) peaks at v ÷ (ω·e)
          const omega = Math.sqrt(K.lift.spring.stiffness);
          animate(lift, 0, { ...K.lift.spring, velocity: omega * Math.E });
        }
      } else {
        go(q, 0, K.fill.off);
        go(lift, 0, K.settle);
      }
    },
    scrub: (v) => go(q, clamp01(v), T2.chase),
    press: (down, at) => {
      if (down && at) touch.current = at;
      animate(sink, down ? 1 : 0, down ? spring.press : supermall.springs.return);
    },
    snap: (to) => {
      q.jump(to);
      lift.jump(0);
      sink.jump(0);
    },
    row: { y, scale },
    under: (
      <>
        <motion.span className={styles.erLift} style={{ opacity: shadow, display: shadowShown }} aria-hidden />
        <OnSurface style={{ opacity: onOp, WebkitMaskImage: onMask, maskImage: onMask }} />
        <OffRing style={{ opacity: offOp, WebkitMaskImage: offMask, maskImage: offMask }} />
      </>
    ),
    badge: { backgroundColor: inks.badgeBg },
    icon: <Icon ink={inks.iconInk} />,
    sub: { color: inks.subInk },
  };
}

/** tg=5 · the green spreads out of the switch and the seal stamps it as it arrives (the default) */
function useSpreadStampLook(on: boolean, _parts: Parts): Look {
  const S = T2.mix.spread;
  const K = T2.mix.stamp;
  const q = useMotionValue(on ? 1 : 0); // the fill, from the switch
  const target = useRef<0 | 1>(on ? 1 : 0);
  const armed = useRef(false); // the stamp fires once, as the front reaches the badge
  const rot = useMotionValue(on ? 90 : 0); // deg; 90 ≡ 0 for the 8-lobed seal
  const squash = useMotionValue(1);
  const seal = useMotionValue(on ? 1 : 0); // the seal's ink
  const bg = useMotionValue(on ? 1 : 0); // the badge's own fill
  const flood = useMotionValue(0);
  const floodA = useMotionValue(0);
  // how far the front has reached a point `at` along the row (0 = switch edge, 1 = far edge), through its feather
  const reach = (v: number, at: number) => clamp01((clamp01(v) * (1 + S.feather) - at) / S.feather);
  const mask = (v: number, invert: boolean) => {
    const f = clamp01(v) * (1 + S.feather);
    const a = `${((f - S.feather) * 100).toFixed(2)}%`;
    const b = `${(f * 100).toFixed(2)}%`;
    return invert ? `linear-gradient(to left, transparent ${a}, black ${b})` : `linear-gradient(to left, black ${a}, transparent ${b})`;
  };
  // at rest both layers drop their masks, so the resting looks are exactly the shared ones
  const onMask = useTransform(q, (v) => (v >= 0.9995 ? 'none' : mask(v, false)));
  const offMask = useTransform(q, (v) => (v <= 0.0005 ? 'none' : mask(v, true)));
  const onOp = useTransform(q, (v) => (v <= 0.0005 ? 0 : 1));
  const offOp = useTransform(q, (v) => (v >= 0.9995 ? 0 : 1));
  const subOn = useTransform(q, (v) => reach(v, S.at.value));
  const inks = useInks(bg, subOn);
  const turning = useTransform(rot, (r) => (Math.abs(r - Math.round(r / 90) * 90) > 0.05 ? 1 : 0));
  const still = useTransform(turning, (t) => 1 - t);
  const sealInk = useTransform(seal, [0, 1], [flow.csIconOff, colors.success]);
  const hole = useTransform(() => Math.max(bg.get(), floodA.get()));
  const holeInk = useTransform(hole, [0, 1], [colors.bgMuted, colors.successSurface]);
  const F = K.flood;
  const floodImage = useTransform(() => {
    const R = F.from + (F.to - F.from) * clamp01(flood.get());
    return `radial-gradient(circle at 50% 50%, var(--nk-color-success-surface) ${px(R - F.crest)}, color-mix(in srgb, var(--nk-color-success) ${F.crestMix}%, var(--nk-color-success-surface)) ${px(R - 1)}, transparent ${px(R + 0.5)})`;
  });
  const floodShown = useTransform(floodA, (v) => (v > 0.0005 ? 'block' : 'none'));

  /** the full stop: the barest dip, the turn, the ink and its soft flood (no ring: the flood's crest is the pulse) */
  const stamp = () => {
    armed.current = false;
    go(rot, 90, K.turn);
    animate(squash, 1, { ...K.press, velocity: -K.kick });
    go(seal, 1, K.ink, K.impact);
    bg.stop();
    flood.jump(0);
    let landed = false;
    animate(flood, 1, {
      ...F.spring,
      delay: K.impact,
      onUpdate: () => {
        if (landed) return;
        landed = true;
        floodA.jump(1);
      },
      onComplete: () => {
        bg.jump(1);
        floodA.jump(0);
      },
    });
  };
  /** no stamp (a drag, or a reversal that is already past the badge): the seal just turns and inks */
  const quietOn = () => {
    armed.current = false;
    go(rot, 90, K.turn);
    go(squash, 1, K.press);
    go(seal, 1, K.ink);
    go(bg, 1, K.ink);
  };
  useEffect(
    () =>
      q.on('change', (v) => {
        if (armed.current && target.current === 1 && reach(v, S.at.badge) >= K.at) stamp();
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [q],
  );

  return {
    settle: (to) => {
      const fromRest = atRest(q, to ? 0 : 1);
      target.current = to;
      if (to) {
        animate(q, 1, { ...S.on, velocity: q.getVelocity(), delay: fromRest ? S.lead : 0 });
        if (reach(q.get(), S.at.badge) >= K.at) quietOn();
        else armed.current = true;
      } else {
        armed.current = false;
        flood.stop();
        go(rot, 0, K.unturn);
        go(squash, 1, K.unturn);
        go(seal, 0, K.inkOff);
        go(bg, 0, K.inkOff);
        go(floodA, 0, K.inkOff);
        animate(q, 0, { ...S.off, velocity: q.getVelocity(), delay: fromRest ? S.offDelay : 0 });
      }
    },
    scrub: (v) => {
      armed.current = false;
      target.current = v >= 0.5 ? 1 : 0;
      flood.stop();
      go(floodA, 0, T2.chase);
      go(q, clamp01(v), T2.chase);
      go(rot, 90 * clamp01(v), T2.chase);
      go(seal, clamp01(v), T2.chase);
      go(bg, clamp01(v), T2.chase);
    },
    press: () => {},
    snap: (to) => {
      armed.current = false;
      target.current = to;
      flood.stop();
      q.jump(to);
      rot.jump(to * 90);
      squash.jump(1);
      seal.jump(to);
      bg.jump(to);
      floodA.jump(0);
    },
    under: (
      <>
        <OnSurface style={{ opacity: onOp, WebkitMaskImage: onMask, maskImage: onMask }} />
        <OffRing style={{ opacity: offOp, WebkitMaskImage: offMask, maskImage: offMask }} />
      </>
    ),
    badgeClass: `${styles.erBadgeStamp} ${styles.erBadgeClip}`,
    badge: { backgroundColor: inks.badgeBg },
    icon: (
      <>
        <motion.span className={styles.erFlood} style={{ backgroundImage: floodImage, opacity: floodA, display: floodShown }} />
        <motion.span className={styles.erSeal} style={{ scale: squash }}>
          <motion.span className={styles.erBadgeIcon} style={{ backgroundColor: sealInk, opacity: still, ...masked(BADGE_MASK) }} />
          <motion.span className={styles.erBadgeIcon} style={{ backgroundColor: sealInk, opacity: turning, rotate: rot, ...masked(SEAL.ring) }} />
          <motion.span className={styles.erBadgeIcon} style={{ backgroundColor: holeInk, opacity: turning, ...masked(SEAL.pct) }} />
        </motion.span>
      </>
    ),
    sub: { color: inks.subInk },
  };
}

const useLook: (on: boolean, parts: Parts) => Look = [useMorphLook, useSheenLook, useStampLook, useDepthLook, useSpreadStampLook][TG - 1];

/** v2 (`?v=row2`): the switch leads, the row answers with the `&tg=` choreography. */
function EligibleRowV2({ on, onChange }: { on: boolean; onChange: (on: boolean) => void }) {
  const { coupon, label } = useLabel();
  const reduce = useReduceMotion();
  const parts: Parts = { row: useRef<HTMLDivElement>(null), badge: useRef<HTMLSpanElement>(null), sub: useRef<HTMLSpanElement>(null), track: useRef<HTMLSpanElement>(null) };
  const p = useMotionValue(on ? 1 : 0);
  const track = useTransform<number, string>(p, [0, 1], [colors.border, colors.success]);
  const look = useLook(on, parts);
  const uniform = useUniformLook(on);
  // reduced motion swaps in the cross-fade; the choreography is kept in step underneath so a switch back is seamless
  const L: Look = reduce
    ? {
        ...uniform,
        settle: (to, moment) => {
          look.snap(to);
          uniform.settle(to, moment);
        },
      }
    : {
        ...look,
        settle: (to, moment) => {
          uniform.snap(to);
          look.settle(to, moment);
        },
      };
  const sw = useSwitch(T2, on, onChange, p, T2.knobSpring, L);
  return (
    <motion.div ref={parts.row} className={`${styles.er} ${styles.er2}`} {...sw.bind} aria-label={label} style={{ backgroundColor: colors.bgSurface, ...L.row }}>
      {L.under}
      <motion.span ref={parts.badge} className={L.badgeClass ? `${styles.erBadge} ${L.badgeClass}` : styles.erBadge} style={L.badge} aria-hidden>
        {L.icon}
      </motion.span>
      <span className={styles.erCopy}>
        <span className={styles.erText}>
          {coupon.rowTail === '' ? `${coupon.rowLead ?? copy.row.lead} ` : null}
          <b>{coupon.code}</b>
          {coupon.rowTail !== '' && ` ${coupon.rowTail ?? copy.row.tail}`}
        </span>
        <motion.span ref={parts.sub} className={styles.erValue} style={L.sub}>
          {coupon.value}
        </motion.span>
      </span>
      <motion.span ref={parts.track} className={styles.erTrack} style={{ backgroundColor: track }} aria-hidden>
        <motion.span className={styles.erKnob} style={{ x: sw.knobX, width: sw.knobW, background: field.surfacePrimary, boxShadow: field.shadowSm }} />
      </motion.span>
      {L.over}
    </motion.div>
  );
}
