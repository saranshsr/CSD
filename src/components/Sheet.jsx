import { useEffect, useRef } from 'react';
import { AnimatePresence, motion, animate, useMotionValue, useTransform, usePresence, useReducedMotion } from 'motion/react';
import { spring, FADE, TAP_SLOP, project, rubber, velocityTracker } from '../motion.js';
import './Sheet.css';

const SCREEN_H = 812;
const UP_V = 100;           // px/s: moving up faster than this always keeps the sheet
const DISMISS_AT = 0.5;     // dismiss when the projected resting point is past half the panel travel

/**
 * Sheet — iOS page sheet. The panel's y is a motion value; the backdrop opacity is derived from
 * it, so opening, closing and dragging all dim in lock-step. Drag from the grabber/header, or
 * from the content when it's scrolled to the top. Release is velocity-aware and every animation
 * is interruptible (grab the sheet mid-flight and it follows the finger).
 */
export default function Sheet({ open, onClose, onClosed, top = 96, inset = 0, bottomGap = 0, radius = 20, bg = '#fff', children }) {
  return (
    <AnimatePresence onExitComplete={() => onClosed?.()}>
      {open && <SheetBody key="sheet" top={top} inset={inset} bottomGap={bottomGap} radius={radius} bg={bg} onClose={onClose}>{children}</SheetBody>}
    </AnimatePresence>
  );
}

function SheetBody({ top, inset = 0, bottomGap = 0, radius = 20, bg = '#fff', onClose, children }) {
  const floating = inset > 0 || bottomGap > 0;
  const reduce = !!useReducedMotion();
  const [isPresent, safeToRemove] = usePresence();
  const H = SCREEN_H - top;
  const y = useMotionValue(reduce ? 0 : H);
  const fade = useMotionValue(reduce ? 0 : 1); // used for reduced motion only
  const backdrop = useTransform(() => fade.get() * Math.min(1, Math.max(0, 1 - y.get() / H)));
  const scroller = useRef(null);
  const panel = useRef(null);
  const drag = useRef(null);
  const vel = useRef(null);
  if (!vel.current) vel.current = velocityTracker();
  const releaseV = useRef(0);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Enter / exit / re-enter (if reopened mid-exit) — all from the current position.
  useEffect(() => {
    if (isPresent) {
      if (reduce) animate(fade, 1, FADE);
      else animate(y, 0, { ...spring.sheet, velocity: y.getVelocity() });
    } else if (reduce) {
      animate(fade, 0, { ...FADE, onComplete: safeToRemove });
    } else {
      // dismiss continues at the finger's release velocity when a drag triggered it
      const v = releaseV.current || y.getVelocity(); releaseV.current = 0;
      animate(y, H, { ...spring.sheetClose, velocity: v, restDelta: 1, onComplete: safeToRemove });
    }
  }, [isPresent]); // eslint-disable-line react-hooks/exhaustive-deps

  // Touch: stop native scroll from claiming a downward pull at scrollTop 0 (so pointer events keep flowing).
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    let startY = 0;
    const ts = (e) => { startY = e.touches[0].clientY; };
    const tm = (e) => {
      const pullingDown = e.touches[0].clientY > startY;
      if ((el.scrollTop <= 0 && pullingDown) || drag.current?.active) e.preventDefault();
    };
    el.addEventListener('touchstart', ts, { passive: true });
    el.addEventListener('touchmove', tm, { passive: false });
    return () => { el.removeEventListener('touchstart', ts); el.removeEventListener('touchmove', tm); };
  }, []);

  // --- drag to dismiss -------------------------------------------------------------------
  // device scale, from the full-width sheet layer (the floating panel itself is inset, so it can't be used)
  const scaleOf = () => { const r = panel.current?.closest('.sh')?.getBoundingClientRect(); return r ? r.width / 375 : 1; };
  const onPointerDown = (e, fromHandle) => {
    if (!isPresent || e.button > 0) return;
    drag.current = { id: e.pointerId, startX: e.clientX, startY: e.clientY, y0: y.get(), s: scaleOf(), fromHandle, active: false };
    // The grabber is only a drag affordance, so it catches the sheet at touch-down: any open/settle
    // animation stops under the finger, and the pointer is captured so moves off the tiny handle still track.
    if (fromHandle) {
      const d = drag.current;
      d.active = true; y.stop(); d.y0 = y.get(); vel.current.reset(); vel.current.add(d.y0, e.timeStamp || performance.now());
      try { panel.current.setPointerCapture(e.pointerId); } catch { /* noop */ }
    }
  };
  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    if (!d.active) {
      const dy = (e.clientY - d.startY) / d.s, dx = (e.clientX - (d.startX ?? e.clientX)) / d.s;
      if (Math.hypot(dx, dy) < TAP_SLOP) return;
      const atTop = (scroller.current?.scrollTop ?? 0) <= 0;
      // Needs mostly-vertical travel. Content drags only take over when pulling down from the very top of the scroll.
      if (Math.abs(dy) < Math.abs(dx) || (!d.fromHandle && !(atTop && dy > 0))) { drag.current = null; return; }
      d.active = true;
      d.startY = e.clientY; d.y0 = y.get();   // grab offset: track from here, no jump
      y.stop();                                // catch it mid-flight (opening or settling)
      vel.current.reset();
      try { panel.current.setPointerCapture(e.pointerId); } catch { /* noop */ }
      return;
    }
    const next = d.y0 + (e.clientY - d.startY) / d.s;
    // Rubber-band above the resting position, like UIKit.
    const ny = next >= 0 ? next : rubber(next, H);
    y.set(ny);
    vel.current.add(ny, e.timeStamp || performance.now());
  };
  const onPointerEnd = (e) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    if (!d.active) return;
    const v = vel.current.get(e.timeStamp || performance.now());
    const pos = y.get();
    const dismiss = !reduce && v > -UP_V && project(pos, v) > H * DISMISS_AT;
    if (dismiss) { releaseV.current = v; onCloseRef.current?.(); }
    else animate(y, 0, { ...spring.sheetRelease, velocity: v }); // momentum release: the one allowed small settle
  };

  return (
    <div className="sh" style={{ pointerEvents: isPresent ? 'auto' : 'none' }}>
      <motion.div className="sh-backdrop" style={{ opacity: backdrop }} onClick={() => onCloseRef.current?.()} />
      <motion.div
        ref={panel}
        className="sh-panel"
        role="dialog"
        aria-modal="true"
        style={{ top, y, opacity: reduce ? fade : 1, background: bg,
          ...(floating ? { left: inset, right: inset, bottom: bottomGap, paddingBottom: 0, borderRadius: radius, overflow: 'visible' } : null) }}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
      >
        <div className={floating ? 'sh-handle is-floating' : 'sh-handle'} onPointerDown={(e) => onPointerDown(e, true)}>
          <span className="sh-grabber" />
        </div>
        <div ref={scroller} className="sh-scroll" style={floating ? { borderRadius: radius } : null} onPointerDown={(e) => onPointerDown(e, false)}>
          {children}
        </div>
      </motion.div>
    </div>
  );
}
