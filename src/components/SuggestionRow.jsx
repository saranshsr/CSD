import React, { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import Icon from './Icon.jsx';
import './SuggestionRow.css';

// Split label into [before, match, after]. Bold = exactly the typed characters where they match:
// a prefix match first, else a word-start match. If the whole query isn't found, fall back to the
// longest query prefix that matches at a word start.
export function splitMatch(label, query) {
  const q = (query || '').toLowerCase().replace(/^\s+/, '');
  const l = label.toLowerCase();
  for (let n = q.length; n > 0; n--) {
    const part = q.slice(0, n);
    if (!part.trim()) break;
    const i = l.startsWith(part) ? 0 : (() => { const j = (' ' + l).indexOf(' ' + part); return j < 0 ? -1 : j; })();
    if (i >= 0) return [label.slice(0, i), label.slice(i, i + n), label.slice(i + n)];
  }
  return [label, '', ''];
}

// iOS-style tap: highlight on pointer-DOWN (instant), commit on pointer-UP, cancel once the finger
// travels > 10px (so a scroll/drag never becomes a tap) or the surrounding list scrolls.
export const TAP_SLOP = 10;
export function useTap(onTap) {
  const [down, setDown] = useState(false);
  const st = useRef(null);
  const cancel = useCallback(() => { st.current = null; setDown(false); }, []);
  useEffect(() => {
    if (!down) return undefined;
    const onScroll = () => cancel();
    window.addEventListener('scroll', onScroll, true); // any scroller (capture) cancels the press
    return () => window.removeEventListener('scroll', onScroll, true);
  }, [down, cancel]);
  const handlers = {
    onPointerDown: (e) => { if (e.button > 0) return; st.current = { x: e.clientX, y: e.clientY, id: e.pointerId }; setDown(true); },
    onPointerMove: (e) => {
      const s = st.current; if (!s || s.id !== e.pointerId) return;
      if (Math.hypot(e.clientX - s.x, e.clientY - s.y) > TAP_SLOP) cancel();
    },
    onPointerUp: (e) => { const s = st.current; cancel(); if (s && s.id === e.pointerId) onTap?.(e); },
    onPointerCancel: cancel,
    onPointerLeave: cancel,
    onKeyDown: (e) => { if (e.key === 'Enter') onTap?.(e); },
  };
  return [down, handlers];
}

// Figma "Suggestion" row: 375×52, padding 6/16, gap 12; thumb 40×40 r8 image cover;
// label 14/20 — match Bold #1d2539, rest Regular #475067; trailing arrow-up-left 20 #666d85.
// kind="search" → the no-match row: search glyph + Search “q”, no fill arrow.
const SuggestionRow = forwardRef(function SuggestionRow({ label, thumb, query, kind, onTap, onFill, ...motionProps }, ref) {
  const [down, tap] = useTap(onTap);
  const [a, b, c] = kind === 'search' ? ['Search ', `“${query.trim()}”`, ''] : splitMatch(label, query);
  return (
    <motion.div ref={ref} className={`sr${down ? ' is-down' : ''}`} role="button" tabIndex={-1} {...tap} {...motionProps}>
      <div className={`sr__thumb${thumb ? '' : ' is-glyph'}`}>
        {thumb ? <img src={thumb} alt="" draggable={false} /> : <Icon name="search" size={20} color="#666d85" />}
      </div>
      <div className="sr__label">
        {a && <span className="sr__rest">{a}</span>}
        {b && <span className="sr__match">{b}</span>}
        {c && <span className="sr__rest">{c}</span>}
      </div>
      {kind !== 'search' && (
        <button type="button" className="sr__fill" aria-label={`Fill ${label}`} tabIndex={-1}
          onPointerDown={(e) => e.stopPropagation()} onPointerUp={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); onFill && onFill(label); }}>
          <Icon name="arrow-up-left" size={20} color="#666d85" />
        </button>
      )}
    </motion.div>
  );
});
export default SuggestionRow;
