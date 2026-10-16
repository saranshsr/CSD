import { motion, type MotionValue } from 'motion/react';
import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { layout } from '../../../foundations/tokens';
import emojiGlyph from '@assets/couponsearch/kb-emoji.svg';
import micGlyph from '@assets/couponsearch/kb-mic.svg';
import { csTokens } from '../tokens';
import styles from '../keyboard.module.css';

/**
 * iOS light keyboard on the team file's M-Keyboard (Iteration 2 "Typing" frames, 295.7 high on a 375 frame), widened to
 * the kit's 390 device: keys 41.98 high, r 7.93, 5.6 apart, rows 10.26 apart from 22.4; row 2 inset 18.7; shift 41.7 and
 * delete 42 with 13.3 to the letters; ABC 85.5 · space · "." 39.2 · return 85.8; then the emoji / mic bar. Ported from
 * the coupon-search prototype (coupon-search-proto/src/components/Keyboard.jsx), keys laid out from one geometry table
 * so hit-testing and popups are exact.
 *
 * Touch model (UIKit keyboard):
 *  · letter / punctuation / space / return commit on touch-UP; the popup shows from touch-DOWN;
 *  · the finger can slide across keys: the popup follows, the key under the finger commits;
 *  · a second finger landing while one is down commits the first (rollover typing);
 *  · shift acts on touch-down (double-tap = caps lock); delete acts on touch-down and repeats (450ms, then every 90ms,
 *    accelerating; after 20 characters whole words);
 *  · letter keys never darken (the popup is the feedback); function keys darken.
 * Pointer-down never takes focus: the real search field keeps the caret, so physical typing goes straight into it.
 * `hardware` = 'type': the keyboard types for keys pressed outside a text field; 'flash': it only flashes the keys a
 * physical keyboard presses (the field types them itself).
 */
const W = layout.deviceWidth;
const PAD = 7.93;
const GAP = 5.6;
const KH = 41.98;
const ROW_GAP = 10.26;
const PITCH = KH + ROW_GAP;
const QT_HEIGHT = 42;
const KEYS_TOP = 22.38;
const BAR_H = 65.3;
const BOTTOM = 9.33;
/** total height without the QuickType bar (the frames): 295.7 */
const BASE_HEIGHT = KEYS_TOP + 3 * PITCH + KH + BAR_H + BOTTOM;
export const keyboardHeight = (quickType: boolean = csTokens.keyboard.quickType) => BASE_HEIGHT + (quickType ? QT_HEIGHT : 0);
export const KEYBOARD_HEIGHT = keyboardHeight();

const REPEAT_DELAY = 450;
const REPEAT_START = 90;
const REPEAT_MIN = 45;
const REPEAT_ACCEL = 0.94;
const WORD_AFTER = 20;
const WORD_EVERY = 180;
const CAPS_TAP_MS = 300;
const HW_MIN_MS = 90;

type KeyType = 'letter' | 'punct' | 'space' | 'return' | 'mode' | 'shift' | 'back';
interface Key {
  id: string;
  ch?: string;
  label?: string;
  type: KeyType;
  x: number;
  y: number;
  w: number;
}

function buildKeys(top: number): Key[] {
  const keys: Key[] = [];
  const row = (letters: string, x0: number, x1: number, r: number) => {
    const n = letters.length;
    const w = (x1 - x0 - (n - 1) * GAP) / n;
    letters.split('').forEach((ch, i) => keys.push({ id: ch, ch, type: 'letter', x: x0 + i * (w + GAP), y: top + r * PITCH, w }));
  };
  row('qwertyuiop', PAD, W - PAD, 0);
  row('asdfghjkl', PAD + 18.66, W - PAD - 18.66, 1);
  const shiftW = 41.67;
  const backW = KH;
  row('zxcvbnm', PAD + shiftW + 13.29, W - PAD - backW - 13.29, 2);
  keys.push({ id: 'shift', type: 'shift', x: PAD, y: top + 2 * PITCH, w: shiftW });
  keys.push({ id: 'back', type: 'back', x: W - PAD - backW, y: top + 2 * PITCH, w: backW });
  const y4 = top + 3 * PITCH;
  const retW = 85.82;
  const dotW = 39.18;
  const retX = W - PAD - retW;
  const dotX = retX - GAP - dotW;
  const spaceX = PAD + 85.51 + GAP;
  keys.push({ id: 'abc', type: 'mode', label: 'ABC', x: PAD, y: y4, w: 85.51 });
  keys.push({ id: 'space', type: 'space', x: spaceX, y: y4, w: dotX - GAP - spaceX });
  keys.push({ id: '.', ch: '.', type: 'punct', x: dotX, y: y4, w: dotW });
  keys.push({ id: 'return', type: 'return', x: retX, y: y4, w: retW });
  return keys;
}
const SLIDES = new Set<KeyType>(['letter', 'punct', 'space', 'return', 'mode']);
const HAS_POPUP = new Set<KeyType>(['letter', 'punct']);

export interface Prediction {
  text: string;
  value: string;
  quoted?: boolean;
}

export function Keyboard({
  visible,
  y,
  opacity,
  onKey,
  onBackspace,
  onReturn,
  onEscape,
  returnDisabled = false,
  predictions,
  onPredict,
  hardware = 'flash',
  quickType = csTokens.keyboard.quickType,
}: {
  visible: boolean;
  /** translateY of the keyboard (0 = docked, height = gone), driven by the screen (springs and the finger) */
  y: MotionValue<number>;
  /** reduced motion: the keyboard fades instead of sliding */
  opacity?: MotionValue<number>;
  onKey: (ch: string) => void;
  onBackspace: (kind: 'char' | 'word') => void;
  onReturn: () => void;
  onEscape?: () => void;
  returnDisabled?: boolean;
  predictions?: (Prediction | null)[];
  onPredict?: (value: string) => void;
  hardware?: 'type' | 'flash' | false;
  quickType?: boolean;
}) {
  const top = KEYS_TOP + (quickType ? QT_HEIGHT : 0);
  const height = keyboardHeight(quickType);
  const [keys] = useState(() => buildKeys(top));
  const byId = useRef(Object.fromEntries(keys.map((k) => [k.id, k]))).current;
  const plane = useRef<HTMLDivElement>(null);
  const [pressed, setPressedState] = useState<{ id: string; label?: string; n: number } | null>(null);
  const pressedRef = useRef(pressed);
  const setPressed = (v: typeof pressed) => {
    pressedRef.current = v;
    setPressedState(v);
  };
  const pressN = useRef(0);
  const active = useRef<{ pointerId: number; id: string } | null>(null);
  const [shift, setShiftState] = useState(false);
  const [caps, setCaps] = useState(false);
  const shiftRef = useRef({ on: false, caps: false, lastTap: 0 });
  const setShift = (on: boolean) => {
    shiftRef.current.on = on;
    setShiftState(on);
  };

  const cb = useRef({ onKey, onBackspace, onReturn, onEscape, returnDisabled });
  cb.current = { onKey, onBackspace, onReturn, onEscape, returnDisabled };

  // delete: fire on down, then auto-repeat with acceleration
  const repeat = useRef<{ t: number } | null>(null);
  const stopRepeat = () => {
    if (repeat.current) clearTimeout(repeat.current.t);
    repeat.current = null;
  };
  const startRepeat = () => {
    stopRepeat();
    cb.current.onBackspace('char');
    const r = { n: 0, gap: REPEAT_START, t: 0 };
    const tick = () => {
      r.n += 1;
      const word = r.n > WORD_AFTER;
      cb.current.onBackspace(word ? 'word' : 'char');
      r.gap = word ? WORD_EVERY : Math.max(REPEAT_MIN, r.gap * REPEAT_ACCEL);
      r.t = window.setTimeout(tick, r.gap);
    };
    r.t = window.setTimeout(tick, REPEAT_DELAY);
    repeat.current = r;
  };
  useEffect(() => () => stopRepeat(), []);
  useEffect(() => {
    if (!visible) {
      stopRepeat();
      active.current = null;
      setPressed(null);
    }
  }, [visible]);

  const tapShift = () => {
    const s = shiftRef.current;
    const now = performance.now();
    if (s.caps) {
      s.caps = false;
      setCaps(false);
      setShift(false);
    } else if (s.on && now - s.lastTap < CAPS_TAP_MS) {
      s.caps = true;
      setCaps(true);
      setShift(true);
    } else setShift(!s.on);
    s.lastTap = now;
  };

  const labelFor = (k: Key) => (k.type === 'letter' && shiftRef.current.on ? k.ch!.toUpperCase() : k.ch);
  const commit = (k: Key) => {
    const c = cb.current;
    if (k.type === 'letter') {
      c.onKey(labelFor(k)!);
      if (shiftRef.current.on && !shiftRef.current.caps) setShift(false);
    } else if (k.type === 'punct') c.onKey(k.ch!);
    else if (k.type === 'space') c.onKey(' ');
    else if (k.type === 'return' && !c.returnDisabled) c.onReturn();
  };

  // nearest key to a point (UIKit has no dead zones between keys)
  const keyAt = (x: number, yy: number) => {
    let best: Key | null = null;
    let bd = Infinity;
    for (const k of keys) {
      const dx = Math.max(k.x - x, 0, x - (k.x + k.w));
      const dy = Math.max(k.y - yy, 0, yy - (k.y + KH));
      const d = Math.hypot(dx, dy);
      if (d < bd) {
        bd = d;
        best = k;
      }
    }
    return bd <= 22 ? best : null;
  };
  const pointToKey = (e: ReactPointerEvent) => {
    const r = plane.current!.getBoundingClientRect();
    const s = r.width / W || 1;
    return keyAt((e.clientX - r.left) / s, (e.clientY - r.top) / s);
  };
  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button > 0) return;
    e.preventDefault(); // never take focus from the search field
    const k = pointToKey(e);
    if (!k) return;
    const prev = active.current;
    if (prev) {
      stopRepeat();
      const pk = byId[prev.id];
      if (SLIDES.has(pk.type)) commit(pk); // rollover
    }
    try {
      plane.current!.setPointerCapture(e.pointerId);
    } catch {
      /* synthetic pointer */
    }
    active.current = { pointerId: e.pointerId, id: k.id };
    pressN.current += 1;
    setPressed({ id: k.id, label: labelFor(k), n: pressN.current });
    if (k.type === 'back') startRepeat();
    else if (k.type === 'shift') tapShift();
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const a = active.current;
    if (!a || a.pointerId !== e.pointerId || !SLIDES.has(byId[a.id].type)) return;
    const k = pointToKey(e);
    if (!k || k.id === a.id || !SLIDES.has(k.type)) return;
    a.id = k.id;
    setPressed({ id: k.id, label: labelFor(k), n: pressedRef.current?.n ?? pressN.current });
  };
  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    const a = active.current;
    if (!a || a.pointerId !== e.pointerId) return;
    active.current = null;
    stopRepeat();
    const k = byId[a.id];
    if (SLIDES.has(k.type)) commit(k);
    setPressed(null);
  };
  const onPointerCancel = () => {
    active.current = null;
    stopRepeat();
    setPressed(null);
  };

  // hardware keyboard: flash the key it pressed (and type it when no text field has focus)
  const hw = useRef({ id: null as string | null, at: 0, t: 0 });
  const flash = useCallback((id: string, label?: string) => {
    clearTimeout(hw.current.t);
    pressN.current += 1;
    hw.current = { id, at: performance.now(), t: 0 };
    setPressed({ id, label, n: pressN.current });
  }, []);
  const unflash = useCallback((id: string) => {
    const h = hw.current;
    if (h.id !== id) return;
    const wait = Math.max(0, HW_MIN_MS - (performance.now() - h.at));
    h.t = window.setTimeout(() => {
      if (hw.current.id === id && !active.current) {
        hw.current.id = null;
        setPressed(null);
      }
    }, wait);
  }, []);
  useEffect(() => {
    if (!hardware || !visible) return undefined;
    const idFor = (e: KeyboardEvent) => {
      if (e.key === 'Backspace') return 'back';
      if (e.key === 'Enter') return 'return';
      if (e.key === ' ') return 'space';
      if (e.key === 'Shift') return 'shift';
      if (e.key === '.') return '.';
      if (/^[a-z]$/i.test(e.key)) return e.key.toLowerCase();
      return null;
    };
    const down = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) return;
      const t = e.target as HTMLElement | null;
      const inField = !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
      const id = idFor(e);
      if (id && (!e.repeat || id === 'back')) flash(id, id === 'shift' ? undefined : e.key);
      if (inField || hardware !== 'type') return; // the field types it (and handles Enter) itself
      const c = cb.current;
      if (e.key === 'Escape') {
        e.preventDefault();
        c.onEscape?.();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        c.onBackspace(e.altKey ? 'word' : 'char');
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (!c.returnDisabled) c.onReturn();
      } else if (e.key.length === 1 && !e.altKey) {
        e.preventDefault();
        c.onKey(e.key);
      }
    };
    const up = (e: KeyboardEvent) => {
      const id = idFor(e);
      if (id) unflash(id);
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [hardware, visible, flash, unflash]);

  const pk = pressed && byId[pressed.id];
  return (
    <div className={styles.wrap} style={{ height, pointerEvents: visible ? 'auto' : 'none' }} aria-hidden={!visible} data-testid="cs-keyboard" data-visible={visible || undefined}>
      <motion.div className={styles.kb} style={{ y, opacity }}>
        {quickType && <QuickType predictions={predictions ?? []} onPredict={onPredict} />}
        <div
          ref={plane}
          className={styles.plane}
          style={{ bottom: BAR_H + BOTTOM }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
          onContextMenu={(e) => e.preventDefault()}
        >
          {keys.map((k) => {
            const down = pressed?.id === k.id;
            return (
              <div
                key={k.id}
                className={styles.key}
                data-type={k.type}
                data-down={down || undefined}
                data-on={(k.type === 'shift' && shift) || undefined}
                data-disabled={(k.type === 'return' && returnDisabled) || undefined}
                style={{ left: k.x, top: k.y, width: k.w, height: KH }}
                data-key={k.id}
              >
                {k.type === 'letter' && (shift ? k.ch!.toUpperCase() : k.ch)}
                {k.type === 'punct' && k.ch}
                {k.type === 'mode' && <span className={styles.small}>{k.label}</span>}
                {k.type === 'shift' && <ShiftGlyph filled={shift} caps={caps} />}
                {k.type === 'back' && <BackGlyph />}
                {k.type === 'return' && <ReturnGlyph />}
              </div>
            );
          })}
          {pk && HAS_POPUP.has(pk.type) && <Popup key={pressed!.n} k={pk} label={pressed!.label || pk.ch!} />}
        </div>
        <div className={styles.bar} style={{ height: BAR_H, bottom: BOTTOM }}>
          <img className={styles.emoji} src={emojiGlyph} alt="" width={25.11} height={25.11} draggable={false} />
          <img className={styles.mic} src={micGlyph} alt="" width={17.6} height={26.32} draggable={false} />
        </div>
      </motion.div>
    </div>
  );
}

/** QuickType: three equal slots split by hairlines; [“typed word”, best completion, alternative]. */
function QuickType({ predictions, onPredict }: { predictions: (Prediction | null)[]; onPredict?: (value: string) => void }) {
  const [downIdx, setDownIdx] = useState(-1);
  return (
    <div className={styles.qt} style={{ height: QT_HEIGHT }}>
      {[0, 1, 2].map((i) => {
        const p = predictions[i] ?? null;
        return (
          <div
            key={i}
            className={styles.qtSlot}
            data-best={i === 1 || undefined}
            data-down={(downIdx === i && !!p) || undefined}
            onPointerDown={(e) => {
              e.preventDefault();
              setDownIdx(i);
            }}
            onPointerUp={() => {
              setDownIdx(-1);
              if (p) onPredict?.(p.value);
            }}
            onPointerLeave={() => setDownIdx(-1)}
          >
            {p && <span className={styles.qtText}>{p.quoted ? `“${p.text}”` : p.text}</span>}
          </div>
        );
      })}
      {[1, 2].map((i) => (
        <span key={i} className={styles.qtSep} style={{ left: (W / 3) * i, opacity: downIdx === i || downIdx === i - 1 ? 0 : 1 }} />
      ))}
    </div>
  );
}

/** Key-press bubble: wider head above the key, stem over it; grows from the key top on a critically damped spring. */
function Popup({ k, label }: { k: Key; label: string }) {
  const head = k.w + 22;
  let shift = -(head - k.w) / 2;
  if (k.x + shift < 1) shift = -k.x + 1;
  if (k.x + shift + head > W - 1) shift = W - 1 - head - k.x;
  const originX = k.w / 2 - shift;
  return (
    <div className={styles.pop} style={{ left: k.x, top: k.y, width: k.w, height: KH }} aria-hidden>
      <motion.div className={styles.popHead} style={{ left: shift, width: head, transformOrigin: `${originX}px 100%` }} initial={{ scale: 0.72 }} animate={{ scale: 1 }} transition={csTokens.keyboard.popup}>
        {label}
      </motion.div>
      <div className={styles.popStem} />
    </div>
  );
}

const ShiftGlyph = ({ filled, caps }: { filled: boolean; caps: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 20 20" aria-hidden>
    <path d={caps ? 'M10 1.5 1.8 9.5h4.4v4.7h7.6V9.5h4.4L10 1.5Z' : 'M10 1.5 1.8 10h4.4v6.2h7.6V10h4.4L10 1.5Z'} fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    {caps && <rect x="6.2" y="16.2" width="7.6" height="1.8" rx="0.6" fill="currentColor" />}
  </svg>
);
const BackGlyph = () => (
  <svg width="25" height="19" viewBox="0 0 24 18" aria-hidden>
    <path d="M7.5 1.5H21a1.5 1.5 0 0 1 1.5 1.5v12a1.5 1.5 0 0 1-1.5 1.5H7.5L1.5 9l6-7.5Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="m11 5.5 7 7m0-7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
const ReturnGlyph = () => (
  <svg width="22" height="15" viewBox="0 0 24 16" aria-hidden>
    <path d="M21 1.5v6.5a2 2 0 0 1-2 2H3.5m0 0L8 5.5M3.5 10 8 14.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
