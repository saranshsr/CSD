import { forwardRef, useEffect, useRef, useState } from 'react';
import { motion, animate, useMotionValue, useReducedMotion } from 'motion/react';
import { spring, HIGHLIGHT, PRESS_SCALE, PRESS_DIM, TAP_SLOP } from '../motion.js';

/**
 * usePress: iOS touch handling (UIControl-style).
 * - Highlight turns on at pointer-DOWN, instantly.
 * - The action commits on pointer-UP (click). It's cancelled if the finger travels more than
 *   TAP_SLOP px (it became a scroll or drag) or the pointer is cancelled.
 * - There's no delay and no lock on the input path.
 * Returns { pressed, handlers, shouldCommit() }. Call shouldCommit() in onClick.
 */
export function usePress({ disabled, onPressChange } = {}) {
  const [pressed, setPressedState] = useState(false);
  const st = useRef({ id: null, x: 0, y: 0, cancelled: false });
  const set = (v) => { setPressedState(v); onPressChange?.(v); };
  const end = () => { if (st.current.id !== null) { st.current.id = null; set(false); } };
  const handlers = {
    onPointerDown: (e) => {
      if (disabled || e.button > 0) return;
      st.current = { id: e.pointerId, x: e.clientX, y: e.clientY, cancelled: false };
      set(true);
    },
    onPointerMove: (e) => {
      const s = st.current;
      if (s.id !== e.pointerId) return;
      if (Math.hypot(e.clientX - s.x, e.clientY - s.y) > TAP_SLOP) { s.cancelled = true; end(); }
    },
    onPointerUp: end,
    onPointerCancel: (e) => { st.current.cancelled = true; end(e); },
    onPointerLeave: (e) => { if (st.current.id === e.pointerId) { st.current.cancelled = true; end(); } },
  };
  const shouldCommit = () => { const ok = !st.current.cancelled; st.current.cancelled = false; return ok && !disabled; };
  return { pressed, handlers, shouldCommit };
}

const compose = (a, b) => (a && b ? (e) => { a(e); b(e); } : a || b);

/**
 * Pressable: iOS press feedback.
 *   feedback="dim"   (default) buttons, chips, tabs and icons dim to PRESS_DIM
 *   feedback="scale" card-like surfaces scale to PRESS_SCALE (dims instead under reduced motion)
 *   feedback="none"  the caller draws its own highlight via onPressChange (e.g. image hotspots)
 */
const Pressable = forwardRef(function Pressable(
  { as = 'button', feedback = 'dim', onTap, onClick, onPressChange, className, style, children, disabled, ...rest }, ref,
) {
  const reduce = !!useReducedMotion();
  const { pressed, handlers, shouldCommit } = usePress({ disabled, onPressChange });
  const Comp = as === 'div' ? motion.div : motion.button;
  const extra = as === 'div' ? { role: rest.role || 'button' } : { type: rest.type || 'button' };
  const mode = feedback === 'scale' && reduce ? 'dim' : feedback;

  // Driven through motion values on the main thread: no WAAPI hand-off at the end of the release
  // fade, and every press re-targets from the live value (interruptible).
  const opacity = useMotionValue(1);
  const scale = useMotionValue(1);
  useEffect(() => {
    if (mode === 'scale') animate(scale, pressed ? PRESS_SCALE : 1, pressed ? spring.pressIn : spring.pressOut);
    else if (mode === 'dim') animate(opacity, pressed ? PRESS_DIM : 1, pressed ? HIGHLIGHT.in : HIGHLIGHT.out);
  }, [pressed, mode]); // eslint-disable-line react-hooks/exhaustive-deps

  const h = {};
  for (const k of Object.keys(handlers)) h[k] = compose(rest[k], handlers[k]);

  return (
    <Comp
      ref={ref}
      {...extra}
      {...rest}
      {...h}
      disabled={as === 'div' ? undefined : disabled}
      className={className}
      style={mode === 'scale' ? { scale, ...style } : mode === 'dim' ? { opacity, ...style } : style}
      onClick={(e) => { onClick?.(e); if (shouldCommit()) onTap?.(e); }}
    >
      {children}
    </Comp>
  );
});
export default Pressable;
