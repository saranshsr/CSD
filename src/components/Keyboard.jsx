import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { spring, SPR } from '../motion.js';
import { useTap } from './SuggestionRow.jsx';
import './Keyboard.css';

// iOS light keyboard, laid out on Figma M-Keyboard (2328:97221) + the QuickType predictive bar.
// Keys are absolutely positioned from a single geometry table so hit-testing and popups are exact.
//
// Touch model (UIKit keyboard):
//  - letter / punctuation / space / return commit on touch-UP; the popup shows from touch-DOWN.
//  - the finger can slide across keys — the popup follows, the key under the finger commits.
//  - a second finger landing while one is down commits the first (rollover typing).
//  - shift acts on touch-down (double-tap = caps lock). Delete acts on touch-down and repeats:
//    after 450ms every 90ms, accelerating; after ~20 characters it switches to whole words.
//  - letter keys never scale or darken (iOS shows the popup only); function keys darken.
// Hardware keys (Mac keyboard) drive the same code path and flash the matching key/popup.
export const QT_HEIGHT = 42;                 // predictive bar
const KEYS_TOP = QT_HEIGHT + 6;              // first key row
export const KEYBOARD_HEIGHT = 291 + KEYS_TOP - 12; // 327: keys + emoji/mic bar + home-indicator area
const PAD = 4, GAP = 6, KH = 42, PITCH = 54;
const KW = (375 - PAD * 2 - GAP * 9) / 10; // ≈31.3
const REPEAT_DELAY = 450, REPEAT_START = 90, REPEAT_MIN = 45, REPEAT_ACCEL = 0.94, WORD_AFTER = 20, WORD_EVERY = 180;
const CAPS_TAP_MS = 300;
const HW_MIN_MS = 90; // a hardware tap shows its popup at least this long (synthetic taps are ~0ms)

function buildKeys() {
  const keys = [];
  const row = (letters, x0, r) => letters.split('').forEach((ch, i) =>
    keys.push({ id: ch, ch, type: 'letter', x: x0 + i * (KW + GAP), y: KEYS_TOP + r * PITCH, w: KW }));
  row('qwertyuiop', PAD, 0);
  row('asdfghjkl', PAD + (KW + GAP) / 2, 1);
  const r3w = 7 * KW + 6 * GAP;
  row('zxcvbnm', (375 - r3w) / 2, 2);
  keys.push({ id: 'shift', type: 'shift', x: PAD, y: KEYS_TOP + 2 * PITCH, w: 44 });
  keys.push({ id: 'back', type: 'back', x: 375 - PAD - 44, y: KEYS_TOP + 2 * PITCH, w: 44 });
  const y4 = KEYS_TOP + 3 * PITCH;
  keys.push({ id: 'abc', type: 'mode', label: 'ABC', x: PAD, y: y4, w: 88 });
  keys.push({ id: 'space', type: 'space', x: 98, y: y4, w: 144 });
  keys.push({ id: '.', ch: '.', type: 'punct', x: 248, y: y4, w: 34 });
  keys.push({ id: 'return', type: 'return', x: 288, y: y4, w: 375 - PAD - 288 });
  return keys;
}
const KEYS = buildKeys();
const BY_ID = Object.fromEntries(KEYS.map((k) => [k.id, k]));
const SLIDES = new Set(['letter', 'punct', 'space', 'return', 'mode']); // keys a finger may slide between
const HAS_POPUP = new Set(['letter', 'punct']);

// nearest key to a point (UIKit has no dead zones between keys)
function keyAt(x, y) {
  let best = null, bd = Infinity;
  for (const k of KEYS) {
    const dx = Math.max(k.x - x, 0, x - (k.x + k.w));
    const dy = Math.max(k.y - y, 0, y - (k.y + KH));
    const d = Math.hypot(dx, dy);
    if (d < bd) { bd = d; best = k; }
  }
  return bd <= 22 ? best : null;
}

export default function Keyboard({
  visible, y, opacity, onKey, onBackspace, onReturn, onEscape, returnDisabled = false,
  predictions, onPredict, hardware = false,
}) {
  const reduce = useReducedMotion();
  const plane = useRef(null);
  // pressed = { id, label, n }  (n = press counter; the popup grows once per press, not per slide)
  const [pressed, setPressedState] = useState(null);
  const pressedRef = useRef(null);
  const setPressed = (v) => { pressedRef.current = v; setPressedState(v); };
  const pressN = useRef(0);
  const active = useRef(null); // { pointerId, id }
  const [shift, setShiftState] = useState(false);
  const [caps, setCaps] = useState(false);
  const shiftRef = useRef({ on: false, caps: false, lastTap: 0 });
  const setShift = (on) => { shiftRef.current.on = on; setShiftState(on); };

  // latest callbacks (listeners below are long-lived)
  const cb = useRef({});
  cb.current = { onKey, onBackspace, onReturn, onEscape, returnDisabled };

  // --- delete: fire on down, then auto-repeat with acceleration ---------------------------
  const repeat = useRef(null);
  const stopRepeat = () => { if (repeat.current) clearTimeout(repeat.current.t); repeat.current = null; };
  const startRepeat = () => {
    stopRepeat();
    cb.current.onBackspace?.('char');
    const r = { n: 0, gap: REPEAT_START, t: 0 };
    const tick = () => {
      r.n += 1;
      const word = r.n > WORD_AFTER;
      cb.current.onBackspace?.(word ? 'word' : 'char');
      r.gap = word ? WORD_EVERY : Math.max(REPEAT_MIN, r.gap * REPEAT_ACCEL);
      r.t = setTimeout(tick, r.gap);
    };
    r.t = setTimeout(tick, REPEAT_DELAY);
    repeat.current = r;
  };
  useEffect(() => () => stopRepeat(), []);
  useEffect(() => { if (!visible) { stopRepeat(); active.current = null; setPressed(null); } }, [visible]);

  const tapShift = () => {
    const s = shiftRef.current, now = performance.now();
    if (s.caps) { s.caps = false; setCaps(false); setShift(false); }
    else if (s.on && now - s.lastTap < CAPS_TAP_MS) { s.caps = true; setCaps(true); setShift(true); }
    else setShift(!s.on);
    s.lastTap = now;
  };

  const labelFor = (k) => (k.type === 'letter' && shiftRef.current.on ? k.ch.toUpperCase() : k.ch);
  const commit = (k) => {
    const c = cb.current;
    if (k.type === 'letter') { c.onKey?.(labelFor(k)); if (shiftRef.current.on && !shiftRef.current.caps) setShift(false); }
    else if (k.type === 'punct') c.onKey?.(k.ch);
    else if (k.type === 'space') c.onKey?.(' ');
    else if (k.type === 'return') { if (!c.returnDisabled) c.onReturn?.(); }
  };

  // --- pointer (touch / mouse) on the key plane -------------------------------------------
  const pointToKey = (e) => {
    const r = plane.current.getBoundingClientRect();
    const s = r.width / 375 || 1;
    return keyAt((e.clientX - r.left) / s, (e.clientY - r.top) / s);
  };
  const onPointerDown = (e) => {
    if (e.button > 0) return;
    e.preventDefault();
    const k = pointToKey(e);
    if (!k) return;
    const prev = active.current;
    if (prev) { stopRepeat(); const pk = BY_ID[prev.id]; if (SLIDES.has(pk.type)) commit(pk); } // rollover
    try { plane.current.setPointerCapture(e.pointerId); } catch { /* synthetic */ }
    active.current = { pointerId: e.pointerId, id: k.id };
    pressN.current += 1;
    setPressed({ id: k.id, label: labelFor(k), n: pressN.current });
    if (k.type === 'back') startRepeat();
    else if (k.type === 'shift') tapShift();
  };
  const onPointerMove = (e) => {
    const a = active.current;
    if (!a || a.pointerId !== e.pointerId || !SLIDES.has(BY_ID[a.id].type)) return;
    const k = pointToKey(e);
    if (!k || k.id === a.id || !SLIDES.has(k.type)) return;
    a.id = k.id;
    setPressed({ id: k.id, label: labelFor(k), n: pressedRef.current?.n ?? pressN.current });
  };
  const onPointerUp = (e) => {
    const a = active.current;
    if (!a || a.pointerId !== e.pointerId) return;
    active.current = null;
    stopRepeat();
    const k = BY_ID[a.id];
    if (SLIDES.has(k.type)) commit(k);
    setPressed(null);
  };
  const onPointerCancel = () => { active.current = null; stopRepeat(); setPressed(null); };

  // --- hardware keyboard -----------------------------------------------------------------
  const hw = useRef({ id: null, at: 0, t: 0 });
  const flash = useCallback((id, label) => {
    clearTimeout(hw.current.t);
    pressN.current += 1;
    hw.current = { id, at: performance.now(), t: 0 };
    setPressed({ id, label, n: pressN.current });
  }, []);
  const unflash = useCallback((id) => {
    const h = hw.current;
    if (h.id !== id) return;
    const wait = Math.max(0, HW_MIN_MS - (performance.now() - h.at));
    h.t = setTimeout(() => { if (hw.current.id === id && !active.current) { hw.current.id = null; setPressed(null); } }, wait);
  }, []);
  useEffect(() => {
    if (!hardware) return undefined;
    const idFor = (e) => {
      if (e.key === 'Backspace') return 'back';
      if (e.key === 'Enter') return 'return';
      if (e.key === ' ') return 'space';
      if (e.key === 'Shift') return 'shift';
      if (e.key === '.') return '.';
      if (/^[a-z]$/i.test(e.key)) return e.key.toLowerCase();
      return null;
    };
    const down = (e) => {
      if (e.metaKey || e.ctrlKey) return;
      const t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      const c = cb.current;
      if (e.key === 'Escape') { e.preventDefault(); c.onEscape?.(); return; }
      const id = idFor(e);
      if (e.key === 'Shift') { if (!e.repeat) flash('shift'); return; }
      if (e.altKey && e.key !== 'Backspace') return; // ⌥-letters are symbols on a Mac
      if (id) { e.preventDefault(); if (!e.repeat || id === 'back') flash(id, e.key); }
      if (e.key === 'Backspace') { e.preventDefault(); c.onBackspace?.(e.altKey ? 'word' : 'char'); }
      else if (e.key === 'Enter') { e.preventDefault(); if (!c.returnDisabled) c.onReturn?.(); }
      else if (e.key.length === 1) { e.preventDefault(); c.onKey?.(e.key); }
    };
    const up = (e) => { const id = idFor(e); if (id) unflash(id); };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, [hardware, flash, unflash]);

  const pk = pressed && BY_ID[pressed.id];
  const own = y === undefined; // no external motion values → animate on `visible` ourselves
  const hidden = reduce ? { opacity: 0 } : { y: KEYBOARD_HEIGHT };
  const shown = reduce ? { opacity: 1 } : { y: 0 };

  return (
    <div className="kb-wrap" style={{ height: KEYBOARD_HEIGHT, pointerEvents: visible ? 'auto' : 'none' }} aria-hidden={!visible}>
      <motion.div
        className="kb"
        style={own ? undefined : { y, opacity }}
        initial={own ? hidden : false}
        animate={own ? (visible ? shown : hidden) : undefined}
        transition={reduce ? { duration: 0.15, ease: 'linear' } : spring.keyboard}
      >
        <QuickType predictions={predictions} onPredict={onPredict} />

        <div ref={plane} className="kb-plane" onPointerDown={onPointerDown} onPointerMove={onPointerMove}
          onPointerUp={onPointerUp} onPointerCancel={onPointerCancel} onContextMenu={(e) => e.preventDefault()}>
          {KEYS.map((k) => {
            const down = pressed?.id === k.id;
            const cls = `kb-key kb-${k.type}${down ? ' is-down' : ''}${k.type === 'shift' && shift ? ' is-on' : ''}${k.type === 'return' && returnDisabled ? ' is-disabled' : ''}`;
            return (
              <div key={k.id} className={cls} style={{ left: k.x, top: k.y, width: k.w, height: KH }} data-key={k.id}>
                {k.type === 'letter' && (shift ? k.ch.toUpperCase() : k.ch)}
                {k.type === 'punct' && k.ch}
                {k.type === 'mode' && <span className="kb-small">{k.label}</span>}
                {k.type === 'shift' && <ShiftGlyph filled={shift} caps={caps} />}
                {k.type === 'back' && <BackGlyph />}
                {k.type === 'return' && <ReturnGlyph />}
              </div>
            );
          })}
          {pk && HAS_POPUP.has(pk.type) && <Popup key={pressed.n} k={pk} label={pressed.label || pk.ch} />}
        </div>

        <div className="kb-bar">
          <span className="kb-glyph" style={{ left: 30 }}><EmojiGlyph /></span>
          <span className="kb-glyph" style={{ right: 30 }}><MicGlyph /></span>
        </div>
      </motion.div>
    </div>
  );
}

// QuickType: three equal slots separated by hairlines. predictions = [typed, best, alt]
// each { text, value, quoted? } or null. The middle slot is the emphasised (best) candidate.
function QuickType({ predictions = [], onPredict }) {
  const slots = [0, 1, 2].map((i) => predictions[i] || null);
  const [downIdx, setDownIdx] = useState(-1);
  return (
    <div className="kb-qt">
      {slots.map((p, i) => (
        <Slot key={i} i={i} p={p} onPredict={onPredict} onDown={setDownIdx} />
      ))}
      {[1, 2].map((i) => (
        <span key={i} className="kb-qt-sep" style={{ left: (375 / 3) * i, opacity: downIdx === i || downIdx === i - 1 ? 0 : 1 }} />
      ))}
    </div>
  );
}
function Slot({ i, p, onPredict, onDown }) {
  const [down, tap] = useTap(() => p && onPredict?.(p.value));
  useEffect(() => { onDown(down && p ? i : -1); }, [down]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className={`kb-qt-slot${i === 1 ? ' is-best' : ''}${down && p ? ' is-down' : ''}`} {...tap}
      onPointerDown={(e) => { e.preventDefault(); tap.onPointerDown(e); }}>
      {p && <span className="kb-qt-text">{p.quoted ? `“${p.text}”` : p.text}</span>}
    </div>
  );
}

// Key-press bubble: wider head above the key, stem over the key, one unified drop shadow.
// Grows out of the key (origin = key top centre) on a critically-damped spring; vanishes instantly.
function Popup({ k, label }) {
  const head = KW + 22;
  let shift = -(head - k.w) / 2;
  if (k.x + shift < 1) shift = -k.x + 1;                         // left edge keys
  if (k.x + shift + head > 374) shift = 374 - head - k.x;        // right edge keys
  const originX = k.w / 2 - shift;
  return (
    <div className="kb-pop" style={{ left: k.x, top: k.y, width: k.w, height: KH }} aria-hidden="true">
      <motion.div className="kb-pop-head" style={{ left: shift, width: head, transformOrigin: `${originX}px 100%` }}
        initial={{ scale: 0.72 }} animate={{ scale: 1 }} transition={SPR.clear}>
        {label}
      </motion.div>
      <div className="kb-pop-stem" />
    </div>
  );
}

const ShiftGlyph = ({ filled, caps }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
    <path d={caps ? 'M10 1.5 1.8 9.5h4.4v4.7h7.6V9.5h4.4L10 1.5Z' : 'M10 1.5 1.8 10h4.4v6.2h7.6V10h4.4L10 1.5Z'}
      fill={filled ? '#000' : 'none'} stroke="#000" strokeWidth="1.5" strokeLinejoin="round" />
    {caps && <rect x="6.2" y="16.2" width="7.6" height="1.8" rx="0.6" fill="#000" />}
  </svg>
);
const BackGlyph = () => (
  <svg width="24" height="18" viewBox="0 0 24 18" aria-hidden="true">
    <path d="M7.5 1.5H21a1.5 1.5 0 0 1 1.5 1.5v12a1.5 1.5 0 0 1-1.5 1.5H7.5L1.5 9l6-7.5Z" fill="none" stroke="#000" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="m11 5.5 7 7m0-7-7 7" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
const ReturnGlyph = () => (
  <svg width="24" height="16" viewBox="0 0 24 16" aria-hidden="true">
    <path d="M21 1.5v6.5a2 2 0 0 1-2 2H3.5m0 0L8 5.5M3.5 10 8 14.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const EmojiGlyph = () => (
  <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
    <circle cx="13" cy="13" r="11.5" fill="none" stroke="#50555c" strokeWidth="1.6" />
    <circle cx="9.2" cy="10.5" r="1.4" fill="#50555c" /><circle cx="16.8" cy="10.5" r="1.4" fill="#50555c" />
    <path d="M7.6 15a5.8 5.8 0 0 0 10.8 0Z" fill="#50555c" />
  </svg>
);
const MicGlyph = () => (
  <svg width="18" height="26" viewBox="0 0 18 26" aria-hidden="true">
    <rect x="5" y="1" width="8" height="15" rx="4" fill="#50555c" />
    <path d="M2 12a7 7 0 0 0 14 0M9 19v5M5.5 24.5h7" fill="none" stroke="#50555c" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);
