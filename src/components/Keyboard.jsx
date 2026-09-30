import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { spring } from '../motion.js';
import './Keyboard.css';

// iOS light keyboard, laid out on Figma M-Keyboard (2328:97221). 291px tall incl. emoji/mic bar.
// Keys are absolutely positioned from a single geometry table so popups can be placed exactly.
export const KEYBOARD_HEIGHT = 291;
const PAD = 4, GAP = 6, KH = 42, TOP = 12, PITCH = 54;
const KW = (375 - PAD * 2 - GAP * 9) / 10; // ≈31.3

function buildKeys() {
  const keys = [];
  const row = (letters, x0, r) => letters.split('').forEach((ch, i) =>
    keys.push({ id: ch, ch, type: 'letter', x: x0 + i * (KW + GAP), y: TOP + r * PITCH, w: KW }));
  row('qwertyuiop', PAD, 0);
  row('asdfghjkl', PAD + (KW + GAP) / 2, 1);
  const r3w = 7 * KW + 6 * GAP;
  row('zxcvbnm', (375 - r3w) / 2, 2);
  keys.push({ id: 'shift', type: 'shift', x: PAD, y: TOP + 2 * PITCH, w: 44 });
  keys.push({ id: 'back', type: 'back', x: 375 - PAD - 44, y: TOP + 2 * PITCH, w: 44 });
  const y4 = TOP + 3 * PITCH;
  keys.push({ id: 'abc', type: 'mode', label: 'ABC', x: PAD, y: y4, w: 88 });
  keys.push({ id: 'space', type: 'space', x: 98, y: y4, w: 144 });
  keys.push({ id: '.', ch: '.', type: 'punct', x: 248, y: y4, w: 34 });
  keys.push({ id: 'return', type: 'return', x: 288, y: y4, w: 375 - PAD - 288 });
  return keys;
}
const KEYS = buildKeys();

export default function Keyboard({ visible, onKey, onBackspace, onReturn }) {
  const reduce = useReducedMotion();
  const [pressed, setPressed] = useState(null);
  const [shift, setShift] = useState(false);

  const fire = (k) => {
    if (k.type === 'letter') { onKey?.(shift ? k.ch.toUpperCase() : k.ch); if (shift) setShift(false); }
    else if (k.type === 'punct') onKey?.(k.ch);
    else if (k.type === 'space') onKey?.(' ');
    else if (k.type === 'back') onBackspace?.();
    else if (k.type === 'return') onReturn?.();
    else if (k.type === 'shift') setShift((s) => !s);
  };

  // iOS commits on touch-up; the popup shows for as long as the finger is down.
  const handlers = (k) => ({
    onPointerDown: (e) => { e.preventDefault(); setPressed(k.id); },
    onPointerUp: () => { if (pressed === k.id) fire(k); setPressed(null); },
    onPointerLeave: () => setPressed((p) => (p === k.id ? null : p)),
    onPointerCancel: () => setPressed(null),
  });

  const pk = KEYS.find((k) => k.id === pressed);

  return (
    <div className="kb-wrap" style={{ pointerEvents: visible ? 'auto' : 'none' }} aria-hidden={!visible}>
      <motion.div
        className="kb"
        initial={reduce ? { opacity: 0 } : { y: KEYBOARD_HEIGHT }}
        animate={reduce ? { opacity: visible ? 1 : 0 } : { y: visible ? 0 : KEYBOARD_HEIGHT }}
        transition={reduce ? { duration: 0.15 } : spring.keyboard}
      >
        {KEYS.map((k) => {
          const down = pressed === k.id;
          const cls = `kb-key kb-${k.type}${down ? ' is-down' : ''}${k.type === 'shift' && shift ? ' is-on' : ''}`;
          return (
            <button key={k.id} type="button" className={cls} style={{ left: k.x, top: k.y, width: k.w, height: KH }}
              aria-label={k.ch || k.label || k.type} {...handlers(k)}>
              {k.type === 'letter' && (shift ? k.ch.toUpperCase() : k.ch)}
              {k.type === 'punct' && k.ch}
              {k.type === 'mode' && <span className="kb-small">{k.label}</span>}
              {k.type === 'shift' && <ShiftGlyph filled={shift} />}
              {k.type === 'back' && <BackGlyph />}
              {k.type === 'return' && <ReturnGlyph />}
            </button>
          );
        })}

        {pk && pk.type === 'letter' && <Popup k={pk} label={shift ? pk.ch.toUpperCase() : pk.ch} />}

        <div className="kb-bar">
          <span className="kb-glyph" style={{ left: 30 }}><EmojiGlyph /></span>
          <span className="kb-glyph" style={{ right: 30 }}><MicGlyph /></span>
        </div>
      </motion.div>
    </div>
  );
}

// Key-press bubble: wider head above the key, stem over the key, one unified drop shadow.
function Popup({ k, label }) {
  const head = KW + 22;
  let shift = -(head - k.w) / 2;
  if (k.x + shift < 1) shift = -k.x + 1;                         // left edge keys
  if (k.x + shift + head > 374) shift = 374 - head - k.x;        // right edge keys
  return (
    <div className="kb-pop" style={{ left: k.x, top: k.y, width: k.w, height: KH }} aria-hidden="true">
      <div className="kb-pop-head" style={{ left: shift, width: head }}>{label}</div>
      <div className="kb-pop-stem" />
    </div>
  );
}

const ShiftGlyph = ({ filled }) => (
  <svg width="20" height="18" viewBox="0 0 20 18" aria-hidden="true">
    <path d="M10 1.5 1.8 10h4.4v6.2h7.6V10h4.4L10 1.5Z" fill={filled ? '#000' : 'none'} stroke="#000" strokeWidth="1.5" strokeLinejoin="round" />
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
    <path d="M21 1.5v6.5a2 2 0 0 1-2 2H3.5m0 0L8 5.5M3.5 10 8 14.5" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
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
