import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, animate, useMotionValue, useReducedMotion } from 'motion/react';
import StatusBar from '../components/StatusBar.jsx';
import SearchBar from '../components/SearchBar.jsx';
import Keyboard, { KEYBOARD_HEIGHT as KBH } from '../components/Keyboard.jsx';
import CouponCard from '../components/CouponCard.jsx';
import SuggestionRow, { useTap, TAP_SLOP } from '../components/SuggestionRow.jsx';
import { coupon, suggestionsFor } from '../data.js';
import { spring, SPR, at, stagger, rise } from '../motion.js';
import { useBarLanded } from '../components/NavStack.jsx';
import './Search.css';

// ---------------------------------------------------------------------------------------------
// Empty-search state — Figma "05 · Search — empty" (2345:100348). Images exported @3x.
const E = '/assets/empty/';
const RECENT = [
  { label: 's24', img: E + 'recent-s24.png' },
  { label: 's25 edge', img: E + 'recent-s25-edge.png' },
  { label: 'iphone 17 pro max', img: E + 'recent-iphone-17-pro-max.png' },
  { label: 'iPhone 17', img: E + 'recent-iphone-17.png' },
  { label: 'iPhone 16', img: E + 'recent-iphone-17.png' }, // Figma source crop runs off the reference screenshot
];
const TRENDING = [
  ['iphone 17 pro max', 'revlon', 'smartphone deals'],
  ['shoe rack', 'pillow', 'fridge', "men's slippers"],
];
const CATEGORIES = [
  { title: 'Hair Care Masks', viewed: 1, img: E + 'cat-hair-care-masks.png' },
  { title: 'Mobiles', viewed: 11, img: E + 'cat-mobiles.png' },
  { title: 'Televisions', viewed: 6, img: E + 'cat-televisions.png', partial: true },
];
// ---------------------------------------------------------------------------------------------

const SCREEN_H = 812;
const KB_TOP = SCREEN_H - KBH;       // keyboard's resting top edge, screen coords
const DECEL = 0.998;                 // UIScrollView normal deceleration rate
const project = (v) => (v / 1000) * DECEL / (1 - DECEL); // distance a release at v px/s travels
// The screen forms around the bar (LSN: containers settle before content forms). Everything below
// waits for the bar to LAND (useBarLanded), then: the coupon card 200ms after the landing, the rows /
// empty-state sections right behind it.
const COUPON_DELAY = 0.4; // nudge reveals 400ms after the bar lands
const ROW_STAGGER = 0.025, ROWS_BASE_DELAY = 0.04; // rows land first, right under the bar; the nudge then inserts above them
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const fade = (d = 0.15) => ({ duration: d, ease: 'linear' });

export default function Search({ nav, params = {} }) {
  const reduce = !!useReducedMotion();
  const [query, setQuery] = useState(params.query || '');
  // arriving from Results with the old query: it's "selected"; the first keystroke replaces it
  const [selected, setSelectedState] = useState(!!params.replaceOnFirstKey && !!params.query);
  const selRef = useRef(selected);
  const setSelected = (v) => { selRef.current = v; setSelectedState(v); };
  const [activity, setActivity] = useState(0);
  // first responder from the first frame: the caret is in the bar the flight lands on
  const [kbShown, setKbShown] = useState(true);
  const kbShownRef = useRef(kbShown);
  kbShownRef.current = kbShown;
  const leaving = useRef(false);
  const mounted = useRef(false);

  // ---- keyboard position: one motion value, driven by show/hide springs AND the finger -------
  const kbY = useMotionValue(reduce ? 0 : KBH);
  const kbO = useMotionValue(reduce ? 0 : 1);
  const kbAnim = useRef(null);
  // docks on SPR.dock, drops on SPR.recede (LSN Keyboard)
  const moveKb = useCallback((show, velocity = 0, delay = 0) => {
    kbAnim.current?.stop();
    setKbShown(show);
    if (reduce) {
      kbY.set(show ? 0 : kbY.get());
      kbAnim.current = animate(kbO, show ? 1 : 0, { ...fade(), onComplete: () => { if (!show) kbY.set(KBH); } });
    } else {
      kbO.set(1);
      kbAnim.current = animate(kbY, show ? 0 : KBH, { ...(show ? spring.keyboard : spring.keyboardHide), velocity, delay });
    }
  }, [reduce, kbY, kbO]);
  const showKb = useCallback(() => { if (!leaving.current) moveKb(true); }, [moveKb]);

  // The keyboard docks a beat after the screen arrives (LSN: at(0.06) on `dock`).
  useEffect(() => {
    const id = requestAnimationFrame(() => moveKb(true, 0, at(0.06)));
    return () => cancelAnimationFrame(id);
  }, [moveKb]);
  // Content forms once the bar has landed; after that first entrance, changes just fade.
  const landed = useBarLanded();
  useEffect(() => {
    if (!landed) return undefined;
    const t = setTimeout(() => { mounted.current = true; }, 0);
    return () => clearTimeout(t);
  }, [landed]);

  const leave = useCallback((go) => {
    if (leaving.current) return;
    leaving.current = true;
    moveKb(false);
    go();
  }, [moveKb]);
  const goResults = useCallback((q) => {
    leave(() => nav.replace('results', { query: (q || '').trim() || 'serum' }, { transition: 'morph' }));
  }, [nav, leave]);
  const goBack = useCallback(() => leave(() => nav.pop()), [nav, leave]);

  // ---- editing -------------------------------------------------------------------------------
  const edit = useCallback((next) => { setQuery(next); setActivity((a) => a + 1); }, []);
  const onKey = useCallback((ch) => {
    if (leaving.current) return;
    if (!kbShownRef.current) moveKb(true);
    if (selRef.current) { setSelected(false); edit(ch); return; }
    edit((q) => q + ch);
  }, [edit, moveKb]);
  const onBackspace = useCallback((kind = 'char') => {
    if (leaving.current) return;
    if (selRef.current) { setSelected(false); edit(''); return; }
    edit((q) => (kind === 'word' ? q.replace(/\S*\s*$/, '') : q.slice(0, -1)));
  }, [edit]);
  const fillWith = useCallback((text) => { setSelected(false); edit(text); showKb(); }, [edit, showKb]);
  // ---- derived -------------------------------------------------------------------------------
  const empty = query.trim() === '';
  const rows = useMemo(() => {
    if (empty) return [];
    const r = suggestionsFor(query);
    return r.length ? r : [{ label: '__search', kind: 'search' }];
  }, [query, empty]);
  const predictions = useMemo(() => quickType(query), [query]);

  // ---- interactive keyboard dismissal + drag-to-scroll (mouse/pen; touch scrolls natively) ---
  const body = useRef(null);
  const rootRef = useRef(null);
  const drag = useRef(null);
  const localY = (clientY) => {
    const r = rootRef.current.getBoundingClientRect();
    return (clientY - r.top) / (r.height / SCREEN_H || 1);
  };
  const scaleOf = () => { const r = rootRef.current.getBoundingClientRect(); return r.height / SCREEN_H || 1; };
  const trackKb = (d, clientY) => {
    if (!d.kb) return;
    // UIScrollView keyboardDismissMode = .interactive: once the finger reaches the keyboard it
    // carries the keyboard's top edge with it 1:1 (and lets it rise again if the finger goes back up).
    const off = clamp(localY(clientY) - KB_TOP, 0, KBH);
    if (off > 0 || kbY.get() > 0) { kbAnim.current?.stop(); kbO.set(1); kbY.set(off); d.moved = d.moved || off > 0; }
  };
  const releaseKb = (d) => {
    if (!d.kb || !d.moved) return;
    const v = kbY.getVelocity();
    const at = kbY.get();
    const hide = at + project(v) > KBH / 2;
    if (reduce) { if (hide) moveKb(false); else { kbY.set(0); setKbShown(true); } return; }
    kbAnim.current = animate(kbY, hide ? KBH : 0, { ...spring.keyboard, velocity: v });
    setKbShown(!hide);
  };

  const onPointerDown = (e) => {
    if (e.pointerType === 'touch' || e.button > 0) return;
    // the leading 20px belong to NavStack's edge-swipe back
    const rr = rootRef.current.getBoundingClientRect();
    if ((e.clientX - rr.left) / scaleOf() <= 20) return;
    drag.current = {
      id: e.pointerId, x0: e.clientX, y0: e.clientY, s: scaleOf(), axis: null, el: null, start: 0,
      kb: kbShownRef.current, moved: false, samples: [[performance.now(), e.clientX, e.clientY]],
      hEl: e.target.closest?.('[data-hscroll]') || null,
    };
    scrollAnim.current?.stop();
  };
  const scrollAnim = useRef(null);
  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x0, dy = e.clientY - d.y0;
    if (!d.axis) {
      if (Math.hypot(dx, dy) <= TAP_SLOP) return;
      d.axis = Math.abs(dx) > Math.abs(dy) && d.hEl ? 'x' : 'y';
      d.el = d.axis === 'x' ? d.hEl : body.current;
      d.start = d.axis === 'x' ? d.el.scrollLeft : d.el.scrollTop;
      try { body.current.setPointerCapture(e.pointerId); } catch { /* noop */ }
    }
    d.samples.push([performance.now(), e.clientX, e.clientY]);
    if (d.samples.length > 6) d.samples.shift();
    if (d.axis === 'x') d.el.scrollLeft = d.start - dx / d.s;
    else { d.el.scrollTop = d.start - dy / d.s; trackKb(d, e.clientY); }
  };
  const onPointerUp = (e) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    if (!d.axis) return;
    // content momentum: finger velocity from the last few samples, UIScrollView-style decay
    const [t0, x0, y0] = d.samples[0], [t1, x1, y1] = d.samples[d.samples.length - 1];
    const dt = Math.max(1, t1 - t0) / 1000;
    const recent = performance.now() - t1 < 80;
    const v = recent ? -((d.axis === 'x' ? x1 - x0 : y1 - y0) / d.s) / dt : 0;
    const el = d.el, key = d.axis === 'x' ? 'scrollLeft' : 'scrollTop';
    const max = d.axis === 'x' ? el.scrollWidth - el.clientWidth : el.scrollHeight - el.clientHeight;
    if (Math.abs(v) > 50 && !reduce) {
      scrollAnim.current = animate(el[key], el[key] + project(v), {
        type: 'inertia', velocity: v, power: 0.8, timeConstant: 325, min: 0, max,
        bounceStiffness: 400, bounceDamping: 40, onUpdate: (p) => { el[key] = p; },
      });
    }
    if (d.axis === 'y') releaseKb(d);
  };
  // touch: native scrolling moves the content; we only carry the keyboard with the finger
  const touch = useRef(null);
  const onTouchStart = (e) => {
    const t = e.touches[0];
    touch.current = { y0: t.clientY, s: scaleOf(), kb: kbShownRef.current, moved: false };
  };
  const onTouchMove = (e) => { if (touch.current) trackKb(touch.current, e.touches[0].clientY); };
  const onTouchEnd = () => { if (touch.current) releaseKb(touch.current); touch.current = null; };
  // wheel / trackpad has no finger to follow → .onDrag semantics: dismiss on the first scroll
  const wheelAcc = useRef(0);
  const onWheel = (e) => {
    if (!kbShownRef.current) { wheelAcc.current = 0; return; }
    wheelAcc.current += Math.abs(e.deltaY) + Math.abs(e.deltaX) * 0.5;
    if (wheelAcc.current > 12) { wheelAcc.current = 0; moveKb(false); }
  };

  const first = !mounted.current;
  // first entrance: LSN `rise` (9px up, sharpening), staggered behind the coupon card
  const entrance = (i) => (first && !reduce
    ? { initial: 'hidden', animate: landed ? 'shown' : 'hidden',
        variants: { hidden: rise.hidden, shown: { ...rise.shown, transition: { ...SPR.rise, ...stagger(i, 0.04, ROWS_BASE_DELAY) } } } }
    : { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: fade() });

  return (
    <div className="srch" ref={rootRef}>
      <StatusBar tone="dark" />
      <div className="srch__header">
        <SearchBar layoutId="search-bar" value={query} placeholder="Search" state="typing" trailing="camera"
          activity={activity} focused={kbShown} selected={selected}
          onTap={() => { if (!kbShownRef.current) showKb(); }} onBack={goBack} />
      </div>

      <div className="srch__body" ref={body} style={{ paddingBottom: KBH + 16 }}
        onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}
        onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} onTouchCancel={onTouchEnd} onWheel={onWheel}>
        {/* Coupon nudge reveal: its slot opens on the layout spring (content below shifts down, no jump),
            the card surface forms into it a beat later, and the % tile pops once. */}
        <motion.div className="srch__coupon-slot"
          initial={reduce ? false : { height: 0 }}
          animate={{ height: landed || reduce ? 'auto' : 0 }}
          transition={{ ...SPR.layout, delay: landed ? COUPON_DELAY : 0 }}>
          <div className="srch__coupon">
            <CouponCard coupon={coupon} cta="View all" onTap={() => goResults(query)} popIcon={landed && !reduce ? COUPON_DELAY + 0.16 : null}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: -4, scale: 0.97 }}
              animate={landed ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: -4, scale: 0.97 }}
              style={{ transformOrigin: '50% 0%' }}
              transition={reduce ? fade() : { ...SPR.form, delay: landed ? COUPON_DELAY + 0.06 : 0, opacity: { duration: 0.18, ease: 'easeOut', delay: landed ? COUPON_DELAY + 0.06 : 0 } }} />
          </div>
        </motion.div>

        <div className="srch__content">
          <AnimatePresence mode="popLayout" initial={false}>
            {empty ? (
              <motion.div key="empty" className="srch-empty"
                exit={{ opacity: 0, transition: fade(0.08) }}>
                <EmptyState entrance={entrance} onPick={fillWith} />
              </motion.div>
            ) : (
              <motion.div key="list" className="srch__list"
                initial={{ opacity: 1 }} exit={{ opacity: 0, transition: fade(0.08) }}>
                <AnimatePresence mode="popLayout" initial={true}>
                  {rows.map((r, i) => {
                    const delay = first ? at(ROWS_BASE_DELAY + i * ROW_STAGGER) : 0;
                    const show = landed || !first;
                    return (
                      <SuggestionRow key={r.label} label={r.label} thumb={r.thumb} kind={r.kind} query={query}
                        onTap={() => goResults(r.kind === 'search' ? query : r.label)} onFill={(l) => fillWith(l + ' ')}
                        layout="position"
                        initial={{ opacity: 0, y: 4 }}
                        animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y: 4 }}
                        exit={{ opacity: 0, transition: fade(0.08) }}
                        transition={{ ...SPR.rise, delay, layout: SPR.layout, opacity: { ...fade(), delay } }} />
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="srch__kb" data-ns-dock="bottom">
        <Keyboard visible={kbShown} y={kbY} opacity={kbO} hardware={!leaving.current}
          onKey={onKey} onBackspace={onBackspace} onReturn={() => goResults(query)} onEscape={goBack}
          returnDisabled={empty} predictions={predictions} onPredict={fillWith} />
      </div>
    </div>
  );
}

// QuickType slots: [“current word”, best completion, alternative]. Each completion comes from the
// suggestion pool; the slot shows what will replace the current word, tapping fills label + space.
function quickType(query) {
  if (!query.trim()) return [null, null, null];
  const word = query.match(/(\S*)$/)[1];
  const lq = query.toLowerCase();
  const seen = new Set([word.toLowerCase()]);
  const comps = [];
  for (const r of suggestionsFor(query, 8)) {
    const l = r.label.toLowerCase();
    if (l === lq.trim()) continue;
    const text = l.startsWith(lq) ? r.label.slice(query.length - word.length) : r.label;
    if (!text.trim() || seen.has(text.toLowerCase())) continue;
    seen.add(text.toLowerCase());
    comps.push({ text, value: r.label + ' ' });
    if (comps.length === 2) break;
  }
  return [word ? { text: word, quoted: true, value: query + ' ' } : null, comps[0] || null, comps[1] || null];
}

function EmptyState({ entrance, onPick }) {
  return (
    <>
      <motion.section className="se-sec se-recent" {...entrance(0)}>
        <h3 className="se-title">Recently searched</h3>
        <div className="se-hs se-tiles" data-hscroll>
          {RECENT.map((t) => <Tile key={t.label} t={t} onPick={onPick} />)}
        </div>
      </motion.section>

      <motion.section className="se-sec se-trending" {...entrance(1)}>
        <h3 className="se-title">Trending searches</h3>
        <div className="se-hs se-chips" data-hscroll>
          {TRENDING.map((row, i) => (
            <div className="se-chiprow" key={i}>{row.map((c) => <Chip key={c} label={c} onPick={onPick} />)}</div>
          ))}
        </div>
      </motion.section>

      <motion.div className="se-banner" {...entrance(2)}>
        <img src={E + 'banner.png'} alt="OSN+ A Knight of the Seven Kingdoms — with noon One" draggable={false} />
      </motion.div>

      <motion.section className="se-sec se-cats" {...entrance(3)}>
        <h3 className="se-title">Recently viewed categories</h3>
        <div className="se-hs se-catrow" data-hscroll>
          {CATEGORIES.map((c) => (
            <div className="se-cat" key={c.title}>
              <div className={`se-cat__img${c.partial ? ' is-partial' : ''}`}><img src={c.img} alt="" draggable={false} /></div>
              <div className="se-cat__title">{c.title}</div>
              <div className="se-cat__pill">{c.viewed} Viewed&nbsp;&nbsp;▸</div>
            </div>
          ))}
        </div>
      </motion.section>
    </>
  );
}

function Tile({ t, onPick }) {
  const [down, tap] = useTap(() => onPick(t.label));
  return (
    <div className={`se-tile${down ? ' is-down' : ''}`} role="button" {...tap}>
      <div className="se-tile__img"><img src={t.img} alt="" draggable={false} /></div>
      <div className="se-tile__label">{t.label}</div>
    </div>
  );
}
function Chip({ label, onPick }) {
  const [down, tap] = useTap(() => onPick(label));
  return (
    <div className={`se-chip${down ? ' is-down' : ''}`} role="button" {...tap}>
      <img className="se-chip__icon" src={E + 'trend.png'} alt="" draggable={false} />
      <span>{label}</span>
    </div>
  );
}
