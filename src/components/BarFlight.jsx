import { useLayoutEffect, useRef } from 'react';
import { useAnimationFrame } from 'motion/react';
import './BarFlight.css';

/**
 * The search bar as ONE object across PLP → Search → Results (ported from LSN src/shell/BarFlight).
 *
 * During a search hop the bar is lifted out of both screens into this layer, placed every frame at
 *   lerp(source look, destination look AS IT IS RIGHT NOW, p)
 * — box, radius, border colour, fill — read off the real bars, and handed back on landing. The
 * shell is the one opaque surface, so the bar never ghosts (two bars) and never dims with the
 * screens cross-fading underneath it. Only its contents change inside it.
 *
 * One progress value `p` drives everything, so the same flight is played by a spring (tap) or
 * scrubbed by a finger (edge-swipe back), and a reversal mid-flight just sends `p` back to 0.
 *
 * Contents: the faces are clones of the two real bars. Parts that are pixel-identical at both
 * ends (the back chevron, the camera, a query that stays put) are drawn once and never fade;
 * parts that change cross-fade LSN-style — leaving content clears early, arriving content
 * settles in once the bar is under way.
 */
export const W = 375;
const ATOMS = '.sbar-back, .sbar-trail, .sbar-field > *';

const rgba = (c) => {
  const n = (c.match(/[\d.]+/g) || []).map(Number);
  return [n[0] ?? 0, n[1] ?? 0, n[2] ?? 0, n[3] ?? 1];
};

/** A bar's box and chrome in the stage's own 375-wide coordinates. */
export function readLook(el, stage) {
  const d = stage.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  const s = d.width / W || 1;
  const cs = getComputedStyle(el);
  return {
    x: (r.x - d.x) / s, y: (r.y - d.y) / s, w: r.width / s, h: r.height / s,
    radius: parseFloat(cs.borderTopLeftRadius) || 0,
    border: rgba(cs.borderTopColor), bg: rgba(cs.backgroundColor),
  };
}

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const smooth = (v) => { const t = clamp01(v); return t * t * (3 - 2 * t); };
const mix = (a, b, t) => a + (b - a) * t;
const mixC = (a, b, t) => {
  const tc = clamp01(t);
  const c = a.map((v, i) => mix(v, b[i], tc));
  return `rgba(${c[0].toFixed(1)}, ${c[1].toFixed(1)}, ${c[2].toFixed(1)}, ${clamp01(c[3]).toFixed(3)})`;
};
export const lookDistance = (a, b) => Math.max(
  Math.abs(a.x - b.x), Math.abs(a.y - b.y), Math.abs(a.w - b.w), Math.abs(a.h - b.h), Math.abs(a.radius - b.radius));

// Face timing, in flight progress. At SPR.move these land where LSN's time-based fades do:
// leaving content is gone by ~160ms, arriving content fades 60ms → ~280ms.
const OUT_END = 0.27, IN_START = 0.05, IN_END = 0.57, OVER_END = 0.45;
/** Progress at which every face has reached its end state (the earliest the flight may land). */
export const FACES_DONE = 0.6;
const ROLE = {
  out: (p) => 1 - smooth(p / OUT_END),
  in: (p) => smooth((p - IN_START) / (IN_END - IN_START)),
  keep: () => 1,
  skip: () => 0,
  over: (p) => smooth(p / OVER_END),            // same glyphs, new style: fades in over the old one
  under: (p) => (p < OVER_END ? 1 : 0),         // …which holds until it is fully covered
};

function atomsOf(bar) {
  const br = bar.getBoundingClientRect();
  return [...bar.querySelectorAll(ATOMS)].map((el) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    const geo = `${el.textContent}|${Math.round(r.x - br.x)},${Math.round(r.y - br.y)},${Math.round(r.width)},${Math.round(r.height)}`;
    const look = `${el.className}|${cs.color}|${cs.backgroundColor}|${el.innerHTML}`;
    return { geo, look, empty: r.width < 0.5 || r.height < 0.5 };
  });
}

/**
 * Clones both bars into faces and decides, part by part, how each changes.
 * Must run while both real bars are laid out (before they are hidden is not required —
 * hiding is visibility-only, so their boxes stay measurable).
 */
export function makeFaces(srcBar, dstBar) {
  const sa = atomsOf(srcBar), da = atomsOf(dstBar);
  const src = srcBar.cloneNode(true), dst = dstBar.cloneNode(true);
  for (const c of [src, dst]) {
    c.classList.add('sbar--face');
    c.removeAttribute('role');
    c.querySelectorAll('button').forEach((b) => b.setAttribute('tabindex', '-1'));
  }
  const sEls = [...src.querySelectorAll(ATOMS)], dEls = [...dst.querySelectorAll(ATOMS)];
  const sRole = sa.map(() => 'out'), dRole = da.map(() => 'in');
  const used = new Set();
  da.forEach((d, i) => {
    if (d.empty) return;
    const j = sa.findIndex((s, k) => !used.has(k) && !s.empty && s.geo === d.geo);
    if (j < 0) return;
    used.add(j);
    if (sa[j].look === d.look) { dRole[i] = 'keep'; sRole[j] = 'skip'; } else { dRole[i] = 'over'; sRole[j] = 'under'; }
  });
  const atoms = [
    ...sEls.map((el, i) => ({ el, fn: ROLE[sRole[i]] })),
    ...dEls.map((el, i) => ({ el, fn: ROLE[dRole[i]] })),
  ];
  return { src, dst, atoms };
}

/**
 * flight = { id, a(): look, b(): look, p: MotionValue, atoms, src, dst, onPlace(t, dist) }
 * `a` / `b` are read live every frame; the shell is placed at lerp(a, b, p).
 */
export default function BarFlight({ flight }) {
  const shell = useRef(null);
  const srcFace = useRef(null);
  const dstFace = useRef(null);

  const place = () => {
    const el = shell.current;
    if (!el) return;
    const a = flight.a(), b = flight.b();
    if (!a || !b) return;
    const t = flight.p.get(); // may pass 1 briefly — the spring's settle, carried through
    el.style.left = `${mix(a.x, b.x, t)}px`;
    el.style.top = `${mix(a.y, b.y, t)}px`;
    el.style.width = `${mix(a.w, b.w, t)}px`;
    el.style.height = `${mix(a.h, b.h, t)}px`;
    el.style.borderRadius = `${mix(a.radius, b.radius, t)}px`;
    el.style.borderColor = mixC(a.border, b.border, t);
    el.style.backgroundColor = mixC(a.bg, b.bg, t);
    for (const at of flight.atoms) at.el.style.opacity = String(at.fn(t));
    flight.onPlace?.(t, a, b);
  };

  useLayoutEffect(() => {
    srcFace.current.replaceChildren(flight.src);
    dstFace.current.replaceChildren(flight.dst);
    // clones lose the field's scroll position (a long query keeps its caret end in view)
    const sf = flight.src.querySelector('.sbar-field'), df = flight.dst.querySelector('.sbar-field');
    if (sf) sf.scrollLeft = flight.srcScroll || 0;
    if (df) df.scrollLeft = flight.dstScroll || 0;
    place();
    flight.mount?.();
    return flight.p.on('change', place);
  }, [flight]); // eslint-disable-line react-hooks/exhaustive-deps
  useAnimationFrame(place);

  return (
    <div ref={shell} className="bf" aria-hidden="true">
      <div ref={srcFace} className="bf-face" />
      <div ref={dstFace} className="bf-face" />
    </div>
  );
}
