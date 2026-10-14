import { useEffect, useRef, useState } from 'react';
import { motion, animate, useMotionValue, useTransform, useReducedMotion } from 'motion/react';
import { SPR, TAP_SLOP } from '../motion.js';
import './EligibleRow.css';

// Eligible row (Figma "Row · 01–08", team file · Iteration 2): a BEAUTY10-items-only toggle just under
// the search bar. The whole 44px row is the hit target (iOS settings cell); the Origin M-Toggle (H20)
// is its state. ONE progress value `p` (1 = on) drives everything, so the row reads its state at a
// glance and a quick double tap reverses mid-flight instead of restarting:
//   knob travel + track green ⇄ #eaecf0 · row tint #edf7f2 ⇄ white with the search bar's hairline ·
//   coupon icon green ⇄ grey · the "extra 10% off" value green ⇄ grey
// UISwitch details: the knob widens toward the side it will travel on touch-down, dims nothing
// (the knob IS the feedback), and commits on touch-up.
const GREEN = '#0f8857';
const TRACK_W = 34, KNOB = 16, PAD = 2;
const TRAVEL = TRACK_W - PAD * 2 - KNOB; // 14

export default function EligibleRow({ code, value = 'extra 10% off', on, onChange, entrance }) {
  const reduce = !!useReducedMotion();
  const p = useMotionValue(on ? 1 : 0);
  const press = useMotionValue(0); // 0..1 knob stretch while held
  const run = useRef(null);
  useEffect(() => {
    run.current?.stop();
    run.current = reduce ? (p.set(on ? 1 : 0), null) : animate(p, on ? 1 : 0, { ...SPR.move, velocity: p.getVelocity() });
  }, [on]); // eslint-disable-line react-hooks/exhaustive-deps

  const knobW = useTransform(press, [0, 1], [KNOB, KNOB + 5]);
  // the knob grows toward its destination: anchored left when off, right when on
  const knobX = useTransform(() => p.get() * TRAVEL - (p.get() > 0.5 ? press.get() * 5 : 0));
  const track = useTransform(p, [0, 1], ['#eaecf0', GREEN]);
  const rowBg = useTransform(p, [0, 1], ['#ffffff', '#edf7f2']);
  const ring = useTransform(p, [0, 1], ['inset 0 0 0 1px rgba(242,243,247,1)', 'inset 0 0 0 1px rgba(237,247,242,0)']);
  const ink = useTransform(p, [0, 1], ['#9aa0b4', GREEN]);
  const valueC = useTransform(p, [0, 1], ['#666d85', GREEN]);

  const down = useRef(null);
  const [held, setHeld] = useState(false);
  const holdTo = (v) => { setHeld(v > 0); if (!reduce) animate(press, v, v ? SPR.clear : SPR.rise); };
  // preventDefault: the row must never take focus from the search field (Enter / space would toggle it)
  const onPointerDown = (e) => { if (e.button > 0) return; e.preventDefault(); down.current = { x: e.clientX, y: e.clientY, id: e.pointerId }; holdTo(1); };
  const onPointerMove = (e) => {
    const d = down.current; if (!d || d.id !== e.pointerId) return;
    if (Math.hypot(e.clientX - d.x, e.clientY - d.y) > TAP_SLOP) { down.current = null; holdTo(0); }
  };
  const onPointerUp = (e) => {
    const d = down.current; down.current = null; holdTo(0);
    if (d && d.id === e.pointerId) onChange(!on);
  };

  return (
    <motion.div className="er-wrap" {...entrance}>
      <motion.div className={`er${held ? ' is-held' : ''}`} role="switch" aria-checked={on} tabIndex={0}
        aria-label={`${code} items only`} style={{ backgroundColor: rowBg, boxShadow: ring }}
        onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={() => { down.current = null; holdTo(0); }}
        onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); onChange(!on); } }}>
        <motion.span className="er-icon" style={{ backgroundColor: ink }} aria-hidden="true" />
        <span className="er-text">
          <b>{code}</b> items only<motion.span style={{ color: valueC }}> · {value}</motion.span>
        </span>
        <motion.span className="er-track" style={{ backgroundColor: track }} aria-hidden="true">
          <motion.span className="er-knob" style={{ x: knobX, width: knobW }} />
        </motion.span>
      </motion.div>
    </motion.div>
  );
}
