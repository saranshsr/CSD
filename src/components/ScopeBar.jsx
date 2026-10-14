import { useEffect, useRef, useState } from 'react';
import { motion, animate, useMotionValue, useTransform, useVelocity, useSpring, useReducedMotion } from 'motion/react';
import { SPR, TAP_SLOP, project, rubber, velocityTracker } from '../motion.js';
import './ScopeBar.css';

// V1 scope bar (Figma D2 / section 16: Origin M-Switch, two slots). UISegmentedControl behaviour:
//  · the white thumb travels on SPR.move — retargeting mid-flight keeps velocity (interruptible)
//  · press the thumb and drag it: it follows 1:1, rubber-bands past the ends, and on release the
//    projected landing point (UIScrollView decel) picks the side; the spring takes the finger's velocity
//  · a tap on the other label moves the thumb there (highlight on touch-down, commit on touch-up)
//  · labels cross-fade weight/colour with the thumb's position, not on a timer
//  · the thumb is a physical object: it shrinks under the finger on touch-down (UISegmentedControl)
//    and stretches along its travel with speed, settling round as the spring comes to rest
const W = 343, PAD = 4, H = 40;
const SEG = (W - PAD * 2) / 2;

export default function ScopeBar({ value, onChange, options, entrance }) {
  const reduce = !!useReducedMotion();
  const idx = value === options[0].value ? 0 : 1;
  const x = useMotionValue(idx * SEG);
  const anim = useRef(null);
  const drag = useRef(null);
  const vt = useRef(velocityTracker());
  const [down, setDown] = useState(-1); // label under the finger (dims on touch-down)

  // press: 0.95 on touch-down over the thumb, back on release (fast in, soft out)
  const press = useMotionValue(1);
  const pressTo = (v) => { if (!reduce) animate(press, v, v < 1 ? SPR.clear : SPR.rise); };
  // speed stretch: |v| → up to +9% length, -4% height, smoothed so finger jitter never shows
  const speed = useSpring(useTransform(useVelocity(x), (v) => Math.min(Math.abs(v) / 2600, 1)), { stiffness: 1400, damping: 80 });
  const sx = useTransform(() => press.get() * (1 + (reduce ? 0 : speed.get() * 0.09)));
  const sy = useTransform(() => press.get() * (1 - (reduce ? 0 : speed.get() * 0.04)));

  useEffect(() => {
    if (drag.current?.active) return;
    anim.current?.stop();
    anim.current = reduce ? (x.set(idx * SEG), null) : animate(x, idx * SEG, { ...SPR.move, velocity: x.getVelocity() });
  }, [idx]); // eslint-disable-line react-hooks/exhaustive-deps

  // label emphasis follows the thumb (0 → left selected, 1 → right selected)
  const p = useTransform(x, [0, SEG], [0, 1]);
  const leftC = useTransform(p, [0, 1], ['#1d2539', '#666d85']);
  const rightC = useTransform(p, [0, 1], ['#666d85', '#1d2539']);

  const rel = (e) => { const r = e.currentTarget.getBoundingClientRect(); return { s: r.width / W || 1, left: r.left }; };
  const onPointerDown = (e) => {
    if (e.button > 0) return;
    const { s, left } = rel(e);
    const local = (e.clientX - left) / s;
    const onThumb = local >= x.get() + PAD && local <= x.get() + PAD + SEG;
    drag.current = { id: e.pointerId, x0: e.clientX, s, startX: x.get(), onThumb, active: false, hit: local < W / 2 ? 0 : 1 };
    if (onThumb) pressTo(0.95); else setDown(local < W / 2 ? 0 : 1);
    vt.current.reset(); vt.current.add(x.get(), e.timeStamp);
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* noop */ }
  };
  const onPointerMove = (e) => {
    const d = drag.current; if (!d || d.id !== e.pointerId) return;
    const dx = (e.clientX - d.x0) / d.s;
    if (!d.active) { if (!d.onThumb || Math.abs(dx) < TAP_SLOP) return; d.active = true; setDown(-1); anim.current?.stop(); d.startX = x.get(); d.x0 = e.clientX; return; }
    let nx = d.startX + dx;
    if (nx < 0) nx = rubber(nx, SEG); else if (nx > SEG) nx = SEG + rubber(nx - SEG, SEG);
    x.set(nx); vt.current.add(nx, e.timeStamp);
  };
  const onPointerUp = (e) => {
    const d = drag.current; if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    pressTo(1); setDown(-1);
    if (!d.active) { const next = d.hit; if (options[next].value !== value) onChange(options[next].value); return; }
    const v = vt.current.get(e.timeStamp);
    const land = project(x.get(), v) > SEG / 2 ? 1 : 0;
    anim.current = animate(x, land * SEG, { ...SPR.move, velocity: v });
    if (options[land].value !== value) onChange(options[land].value);
  };

  return (
    <motion.div className="scb" {...entrance}>
      <div className="scb-track" role="tablist" style={{ width: W, height: H, padding: PAD }}
        onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}>
        <motion.div className="scb-thumb" style={{ x, width: SEG, scaleX: sx, scaleY: sy }} />
        {options.map((o, i) => (
          <motion.span key={o.value} role="tab" aria-selected={o.value === value} className="scb-label" style={{ color: i === 0 ? leftC : rightC, fontWeight: o.value === value ? 600 : 500, opacity: down === i && o.value !== value ? 0.6 : 1, transition: down === i ? 'none' : 'opacity .18s ease-out' }}>
            {o.label}
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
}
