import { useEffect, useRef, useState } from 'react';
import { motion, animate, useMotionValue, useTransform, useReducedMotion } from 'motion/react';
import { SPR, TAP_SLOP, ios, project, rubber, velocityTracker, tick } from '../motion.js';
import './EligibleRow.css';

// Eligible row (Figma "Eligible row · Empty · on … Normal search", team file · Iteration 2): a
// BEAUTY10-items-only toggle just under the search bar. The whole 44px row is the hit target (iOS
// settings cell); the Origin M-Toggle (H20) is its state.
//
// UISwitch, translated:
//  · ONE progress value `p` (1 = on) drives knob travel, track green ⇄ #eaecf0, the row tint ⇄ white
//    with the search bar's hairline, the coupon icon and the "extra 10% off" value — one curve, so
//    a double tap reverses mid-flight with its velocity instead of restarting
//  · the knob moves on its own short spring (response 0.34s, damping 0.84): a whisper of settle,
//    like the real switch landing — the only bounce here, because the knob is a thrown object
//  · touch-down: the knob stretches 6px toward the side it will travel (instant feedback); it stays
//    stretched while it travels and relaxes as it lands
//  · drag: slide a finger along the row and the knob follows it 1:1 across the track, rubber-banding
//    past the ends; on release the projected landing side wins (velocity carried into the spring)
//  · never takes focus from the search field
const GREEN = '#0f8857';
const TRACK_W = 34, KNOB = 16, PAD = 2, STRETCH = 6;
const TRAVEL = TRACK_W - PAD * 2 - KNOB; // 14
const KNOB_SPRING = ios(0.34, 0.84);

export default function EligibleRow({ code, value = 'Extra 10% off at checkout', on, onChange, entrance }) {
  const reduce = !!useReducedMotion();
  const p = useMotionValue(on ? 1 : 0);
  const press = useMotionValue(0); // 0..1 knob stretch
  const run = useRef(null);
  const glide = (to, velocity = 0) => {
    run.current?.stop();
    run.current = reduce ? (p.set(to), null) : animate(p, to, { ...KNOB_SPRING, velocity });
  };
  useEffect(() => { if (!drag.current?.active) glide(on ? 1 : 0, p.getVelocity()); }, [on]); // eslint-disable-line react-hooks/exhaustive-deps

  // the knob grows toward its destination: from the left edge when off, from the right when on
  const knobW = useTransform(press, (v) => KNOB + v * STRETCH);
  const knobX = useTransform(() => {
    const t = Math.min(1.08, Math.max(-0.08, p.get()));
    return t * (TRAVEL - press.get() * STRETCH);
  });
  const track = useTransform(p, [0, 1], ['#eaecf0', GREEN]);
  const rowBg = useTransform(p, [0, 1], ['#ffffff', '#edf7f2']);
  const ring = useTransform(p, [0, 1], ['inset 0 0 0 1px rgba(242,243,247,1)', 'inset 0 0 0 1px rgba(237,247,242,0)']);
  const ink = useTransform(p, [0, 1], ['#9aa0b4', GREEN]);
  const valueC = useTransform(p, [0, 1], ['#666d85', GREEN]);

  const stretch = (v) => { if (!reduce) animate(press, v, v ? ios(0.18, 1) : ios(0.36, 1)); };
  const drag = useRef(null);
  const vt = useRef(velocityTracker());
  const [held, setHeld] = useState(false);

  const onPointerDown = (e) => {
    if (e.button > 0) return;
    e.preventDefault(); // the row must never take focus from the search field (Enter / space would toggle it)
    const r = e.currentTarget.getBoundingClientRect();
    drag.current = { id: e.pointerId, x0: e.clientX, y0: e.clientY, s: r.width / 343 || 1, p0: p.get(), active: false, cancelled: false };
    vt.current.reset();
    setHeld(true); stretch(1);
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* noop */ }
  };
  const onPointerMove = (e) => {
    const d = drag.current; if (!d || d.id !== e.pointerId || d.cancelled) return;
    const dx = (e.clientX - d.x0) / d.s, dy = (e.clientY - d.y0) / d.s;
    if (!d.active) {
      if (Math.abs(dy) > TAP_SLOP && Math.abs(dy) > Math.abs(dx)) { d.cancelled = true; setHeld(false); stretch(0); return; } // a scroll, not a switch
      if (Math.abs(dx) < TAP_SLOP) return;
      d.active = true; run.current?.stop(); d.p0 = p.get(); // keep x0: the knob catches up to the finger, no dead slop
    }
    let px = d.p0 * TRAVEL + dx;
    if (px < 0) px = rubber(px, TRAVEL); else if (px > TRAVEL) px = TRAVEL + rubber(px - TRAVEL, TRAVEL);
    p.set(px / TRAVEL); vt.current.add(px, e.timeStamp);
  };
  const onPointerUp = (e) => {
    const d = drag.current; drag.current = null;
    setHeld(false); stretch(0);
    if (!d || d.id !== e.pointerId || d.cancelled) return;
    if (!d.active) { tick(); onChange(!on); return; }
    const v = vt.current.get(e.timeStamp);
    const next = project(p.get() * TRAVEL, v) > TRAVEL / 2;
    glide(next ? 1 : 0, v / TRAVEL);
    if (next !== on) { tick(); onChange(next); }
  };

  return (
    <motion.div className="er-wrap" {...entrance}>
      <motion.div className={`er${held ? ' is-held' : ''}`} role="switch" aria-checked={on} tabIndex={0}
        aria-label={`Search ${code} items only`} style={{ backgroundColor: rowBg, boxShadow: ring }}
        onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}
        onPointerCancel={() => { drag.current = null; setHeld(false); stretch(0); glide(on ? 1 : 0); }}
        onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); tick(); onChange(!on); } }}>
        <motion.span className="er-icon" style={{ backgroundColor: ink }} aria-hidden="true" />
        {/* two lines (Figma "Eligible row · two lines"): scope on one line, the offer under it — wraps to a
            second line for bigger offers instead of breaking the row */}
        <span className="er-copy">
          <span className="er-text">Search <b>{code}</b> items only</span>
          <motion.span className="er-offer" style={{ color: valueC }}>{value}</motion.span>
        </span>
        <motion.span className="er-track" style={{ backgroundColor: track }} aria-hidden="true">
          <motion.span className="er-knob" style={{ x: knobX, width: knobW }} />
        </motion.span>
      </motion.div>
    </motion.div>
  );
}
