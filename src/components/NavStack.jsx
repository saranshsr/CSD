import { createContext, useContext, useLayoutEffect, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, motionValue, useMotionValue, useTransform, usePresence, useReducedMotion, animate } from 'motion/react';
import { spring, SPR, at, FADE, PARALLAX, DIM, TAP_SLOP, project, velocityTracker } from '../motion.js';
import BarFlight, { makeFaces, readLook, lookDistance, FACES_DONE } from './BarFlight.jsx';
import './NavStack.css';

const W = 375;
const EDGE = 20;          // px from the screen's leading edge that starts a back-swipe
const BACK_V = 100;       // px/s: moving back toward the edge faster than this always cancels
// Elements that dock to the bottom of a morph screen (the keyboard) drop away on pop.
const DOCK = '[data-ns-dock="bottom"], .srch__kb';
// A morph screen with a docked keyboard holds this long on pop, so the keyboard's drop is seen
// before the screen lets go (LSN: content clears before its container moves).
const DOCK_HOLD = at(0.1);
// the dock wrapper can be zero-height (its keyboard is absolutely placed): measure what it holds
const dockHeight = (d) => Math.max(d.offsetHeight, ...[...d.children].map((c) => c.offsetHeight), 0);
const LAND_TIMEOUT = 1600; // ms — a flight that somehow never meets its landing test lands anyway

const StackCtx = createContext(null);
const RouteCtx = createContext(null);
// Live stacking info. Removed routes ("ghosts") keep their stale props inside AnimatePresence,
// so z-order and "who covers me" come from context, which does reach them.
const OrderCtx = createContext({ z: new Map(), above: new Map() });

/**
 * True once the shared search bar has landed on this screen (immediately if it did not fly in).
 * Screens use it to form their content after the bar settles — LSN's "containers settle before
 * content forms".
 */
export function useBarLanded() {
  const api = useContext(StackCtx);
  const key = useContext(RouteCtx);
  const [landed, setLanded] = useState(() => !api || !key || api.isLanded(key));
  useEffect(() => {
    if (!api || !key || landed) return undefined;
    if (api.isLanded(key)) { setLanded(true); return undefined; }
    return api.onLanded(key, () => setLanded(true));
  }, [api, key, landed]);
  return landed;
}

/**
 * NavStack — the navigation stack, with two kinds of hop.
 *
 * 'push' (cart → PLP etc.): UINavigationController push/pop. The top screen slides on
 * `spring.push`; the covered screen's parallax + dim are *derived* from the top screen's x.
 *
 * 'morph' (PLP ⇄ Search ⇄ Results — the hops that share the search bar), LSN's model exactly:
 * screens never slide. The top screen cross-fades on SPR.fade, nothing else moves except the
 * search bar, which flies between its two positions in a BarFlight on SPR.move, lifted above both
 * screens and handed back on landing. The keyboard docks after the screen arrives and drops
 * before it leaves. The edge-swipe back scrubs that same cross-fade + flight with the finger.
 *
 * Every route stays mounted. Each screen owns two motion values: `x` (its own slide) and `o`
 * (its opacity); any animation on them can be interrupted and inherits velocity.
 *
 * Removed routes become "ghosts": AnimatePresence keeps them mounted while they animate out
 * (pop) or while the incoming screen covers them (replace).
 */
export default function NavStack({ routes, renderRoute, onBack }) {
  const reduce = !!useReducedMotion();
  const mvs = useRef(new Map());             // key -> { x, o, el, leaving }
  const [ghosts, setGhosts] = useState([]);  // { route, pos, mode: 'pop' | 'replace' }
  const [prevRoutes, setPrevRoutes] = useState(null);
  const [flight, setFlight] = useState(null);
  const stage = useRef(null);

  // Mutable runtime shared with screens (stable identity; read at call time).
  const rt = useRef(null);
  if (!rt.current) {
    rt.current = {
      entering: new Set(), waiting: new Map(), ghosts: [], onBack, reduce,
      order: [], routes: [], pending: new Set(), listeners: new Map(), flight: null, scrub: null, flightId: 0,
    };
  }
  rt.current.onBack = onBack;
  rt.current.reduce = reduce;
  rt.current.routes = routes;
  rt.current.setFlight = setFlight;

  const firstRender = prevRoutes === null;
  const getMV = (r) => {
    let m = mvs.current.get(r.key);
    if (!m) {
      const animated = !firstRender && r.transition !== 'none';
      const slide = animated && !reduce && r.transition === 'push';
      const fade = animated && (reduce || r.transition === 'morph');
      m = { x: motionValue(slide ? W : 0), o: motionValue(fade ? 0 : 1) };
      mvs.current.set(r.key, m);
      // the bar will fly in: the screen's content waits for it to land (see useBarLanded)
      if (animated && !reduce && r.transition === 'morph') rt.current.pending.add(r.key);
    }
    return m;
  };

  // Diff routes during render (derived-state pattern) → push / pop / replace detection.
  let liveGhosts = ghosts;
  if (prevRoutes !== routes) {
    const now = new Set(routes.map((r) => r.key));
    const before = prevRoutes || [];
    const beforeKeys = new Set(before.map((r) => r.key));
    const added = routes.some((r) => !beforeKeys.has(r.key));
    liveGhosts = ghosts.filter((g) => !now.has(g.route.key));
    before.forEach((r, i) => {
      if (!now.has(r.key)) liveGhosts.push({ route: r, pos: i, mode: added ? 'replace' : 'pop' });
    });
    rt.current.ghosts = liveGhosts;
    setGhosts(liveGhosts);
    setPrevRoutes(routes);
  }
  routes.forEach(getMV);

  // Visual order: live routes + ghosts at their old position (a ghost sits below a route with the same pos).
  const order = [
    ...routes.map((r, i) => ({ route: r, pos: i, tie: 1 })),
    ...liveGhosts.map((g) => ({ route: g.route, pos: g.pos, tie: 0 })),
  ].sort((a, b) => a.pos - b.pos || a.tie - b.tie);
  rt.current.order = order.map((o) => o.route.key);

  // --- runtime callbacks used by screens -------------------------------------------------
  const api = useRef(null);
  if (!api.current) {
    const r = () => rt.current;
    const releaseReplaced = () => {
      const s = r();
      s.waiting.forEach((done) => done());
      s.waiting.clear();
      const keep = s.ghosts.filter((g) => g.mode !== 'replace');
      if (keep.length !== s.ghosts.length) { s.ghosts = keep; setGhosts(keep); }
    };
    const dropGhost = (key) => {
      const s = r();
      s.ghosts = s.ghosts.filter((g) => g.route.key !== key);
      setGhosts(s.ghosts);
    };

    // ---- the shared search bar ------------------------------------------------------------
    const elOf = (key) => mvs.current.get(key)?.el || null;
    const barOf = (key) => elOf(key)?.querySelector('.sbar') || null;
    const hideBar = (key, on) => { const el = elOf(key); if (el) { if (on) el.setAttribute('data-bar-away', ''); else el.removeAttribute('data-bar-away'); } };
    const notifyLanded = (key) => {
      const s = r();
      if (!s.pending.delete(key)) return;
      const fns = s.listeners.get(key);
      s.listeners.delete(key);
      fns?.forEach((fn) => fn());
    };
    // A bar can be handed back only when nothing is drawing over it: its screen is fully in and
    // every screen above it is fully gone — otherwise the real bar would show dimmed.
    const clean = (key) => {
      const m = mvs.current.get(key);
      if (!m || m.o.get() < 0.995) return false;
      const ord = r().order;
      for (let i = ord.indexOf(key) + 1; i < ord.length; i++) {
        const a = mvs.current.get(ord[i]);
        if (a && a.o.get() > 0.005 && a.x.get() < W - 1) return false;
      }
      return true;
    };
    const land = (f, key) => {
      const s = r();
      if (s.flight !== f) return;
      s.flight = null;
      f.run?.stop();
      hideBar(key, false);
      s.setFlight(null);
      notifyLanded(key);
    };
    const live = (el) => {
      let last = null;
      return () => {
        if (el.isConnected && stage.current) last = readLook(el, stage.current);
        return last;
      };
    };
    /** Lift the bar out of `fromKey` and fly it to `toKey`. `p` defaults to a spring 0 → 1. */
    const startFlight = (fromKey, toKey, { p, scrub = false } = {}) => {
      const s = r();
      const cur = s.flight;
      // A reversal mid-flight (back tapped while the bar is still in the air) continues the same
      // flight backwards from where it is, with its velocity — no restart, no pop.
      if (cur && !cur.scrub && !scrub && cur.fromKey === toKey && cur.toKey === fromKey) {
        cur.target = 0;
        cur.t0 = performance.now();
        cur.run?.stop();
        cur.run = animate(cur.p, 0, { ...SPR.move, velocity: cur.p.getVelocity() });
        return cur;
      }
      if (cur) land(cur, cur.target === 0 ? cur.fromKey : cur.toKey);
      const a = barOf(fromKey), b = barOf(toKey);
      if (!a || !b || !stage.current) return null;
      const faces = makeFaces(a, b);
      const f = {
        id: ++s.flightId, fromKey, toKey, scrub, target: 1, t0: performance.now(),
        p: p || motionValue(0),
        a: live(a), b: live(b),
        srcScroll: a.querySelector('.sbar-field')?.scrollLeft || 0,
        dstScroll: b.querySelector('.sbar-field')?.scrollLeft || 0,
        ...faces,
      };
      f.onPlace = (t, la, lb) => {
        if (s.flight !== f) return;
        if (f.target === 1) {
          if (t >= FACES_DONE && lookDistance(lb, lerpLook(la, lb, t)) < 0.5 && clean(toKey)) land(f, toKey);
        } else if (t <= 0.02 && lookDistance(la, lerpLook(la, lb, t)) < 0.5 && clean(fromKey)) land(f, fromKey);
        if (!f.scrub && performance.now() - f.t0 > LAND_TIMEOUT) land(f, f.target === 1 ? toKey : fromKey);
      };
      // the real bars hide on the frame the shell first paints (BarFlight's layout effect) —
      // never a frame with no bar, even when a pointer event starts the flight
      f.mount = () => { if (s.flight === f) { hideBar(fromKey, true); hideBar(toKey, true); } };
      s.flight = f;
      if (!p) f.run = animate(f.p, 1, { ...SPR.move, restDelta: 0.004, restSpeed: 0.05 });
      s.setFlight(f);
      return f;
    };

    api.current = {
      mv: (key) => mvs.current.get(key),
      forget: (key) => { if (!rt.current.ghosts.some((g) => g.route.key === key)) mvs.current.delete(key); },
      onBack: () => rt.current.onBack?.(),
      isLanded: (key) => !r().pending.has(key),
      onLanded: (key, fn) => {
        const s = r();
        if (!s.listeners.has(key)) s.listeners.set(key, new Set());
        s.listeners.get(key).add(fn);
        return () => s.listeners.get(key)?.delete(fn);
      },
      // called from NavStack's layout effect once the new top screen has laid out its header
      routeChanged(prev, next, added) {
        const s = r();
        const morph = (added ? next.transition : prev.transition) === 'morph';
        let f = null;
        if (morph && !s.reduce) {
          const cur = s.flight;
          if (cur && cur.fromKey === prev.key && cur.toKey === next.key) f = cur; // e.g. a committed edge-swipe
          else f = startFlight(prev.key, next.key);
        }
        if (!f) notifyLanded(next.key);
        // a screen that becomes top without the bar landing on it must show its own bar
        const fl = s.flight;
        if (!fl || (fl.toKey !== next.key && fl.fromKey !== next.key)) hideBar(next.key, false);
      },
      enter(route, first) {
        const s = r();
        const m = mvs.current.get(route.key);
        const finish = () => { s.entering.delete(route.key); releaseReplaced(); };
        if (first || route.transition === 'none') { m.x.set(0); m.o.set(1); finish(); return; }
        s.entering.add(route.key);
        if (s.reduce) animate(m.o, 1, { ...FADE, onComplete: finish });
        else if (route.transition === 'morph') animate(m.o, 1, { ...SPR.fade, delay: route.delay || 0, onComplete: finish });
        else animate(m.x, 0, { ...spring.push, delay: route.delay || 0, onComplete: finish });
      },
      // an entering screen that was grabbed and let go (cancel) has still finished entering
      settled(key) { if (rt.current.entering.delete(key)) releaseReplaced(); },
      exit(route, safeToRemove) {
        const s = r();
        const g = s.ghosts.find((gh) => gh.route.key === route.key);
        const m = mvs.current.get(route.key);
        const done = () => { safeToRemove(); dropGhost(route.key); };
        s.entering.delete(route.key);
        s.pending.delete(route.key);
        if (!g || !m) { safeToRemove(); return; }
        if (g.mode === 'replace') {
          // Stay put underneath until the incoming screen fully covers us.
          if (s.entering.size === 0) done(); else s.waiting.set(route.key, done);
          return;
        }
        // Pop: whatever was waiting under an interrupted entry can go now.
        const popDone = () => { done(); releaseReplaced(); };
        if (route.transition === 'none' && m.x.get() < 0.5) { popDone(); return; }
        if (s.reduce) { animate(m.o, 0, { ...FADE, onComplete: popDone }); return; }
        // A committed edge swipe already started the exit at the finger's release velocity
        // (in the pointerup handler, so no frame is lost waiting on React). Just wait for it to land.
        if (m.leaving) { const l = m.leaving; m.leaving = null; l.then(popDone); return; }
        const v = m.x.getVelocity();
        if (route.transition === 'push' || m.x.get() > 0.5) {
          animate(m.x, W, { ...spring.push, velocity: v, onComplete: popDone });
        } else {
          // morph pop (LSN): the keyboard drops first, then the screen lets go on the fade spring
          // while the bar flies home above it.
          const dock = m.el?.querySelector(DOCK);
          const kbGone = !!m.el?.querySelector('.kb-wrap[aria-hidden="true"]'); // the screen already dropped it
          if (dock && !kbGone) animate(dock, { y: dockHeight(dock) }, SPR.recede);
          animate(m.o, 0, { ...SPR.fade, delay: dock ? DOCK_HOLD : 0, onComplete: popDone });
        }
      },
      // ---- edge-swipe back on a morph screen: the finger scrubs the cross-fade + bar flight ----
      scrub(route, px) {
        const s = r();
        const m = mvs.current.get(route.key);
        let sc = s.scrub;
        if (!sc || sc.key !== route.key) {
          const i = s.routes.findIndex((x) => x.key === route.key);
          const below = s.routes[i - 1];
          const dock = m.el?.querySelector(DOCK) || null;
          sc = s.scrub = { key: route.key, g: motionValue(0), dock, dockH: dock ? dockHeight(dock) : 0, flight: null };
          sc.unsub = sc.g.on('change', (v) => {
            m.o.set(Math.min(1, Math.max(0, 1 - v)));
            // the keyboard clears ahead of the screen
            if (sc.dock) sc.dock.style.transform = `translateY(${Math.min(1, Math.max(0, v * 1.6)) * sc.dockH}px)`;
          });
          if (!s.reduce && below) sc.flight = startFlight(route.key, below.key, { p: sc.g, scrub: true });
        }
        sc.g.stop();
        sc.g.set(Math.min(1, Math.max(0, px / W)));
      },
      scrubRelease(route, commit, vPx) {
        const s = r();
        const sc = s.scrub;
        if (!sc || sc.key !== route.key) return Promise.resolve();
        const f = sc.flight;
        if (f) { f.scrub = false; f.t0 = performance.now(); f.target = commit ? 1 : 0; }
        return new Promise((resolve) => {
          animate(sc.g, commit ? 1 : 0, {
            ...SPR.move, velocity: vPx / W, restDelta: 0.002,
            onComplete: () => {
              sc.unsub();
              if (s.scrub === sc) s.scrub = null;
              if (!commit) {
                const m = mvs.current.get(route.key);
                m.o.set(1);
                if (sc.dock) sc.dock.style.transform = '';
                api.current.settled(route.key);
              }
              resolve();
            },
          });
        });
      },
    };
  }

  const topKey = routes[routes.length - 1]?.key;
  const isFirst = useRef(true);
  useEffect(() => { isFirst.current = false; }, []);

  // Shared bar hand-off. Runs after the incoming screen has laid out (child layout effects run
  // first) and before paint, so the flight and the hiding of the real bars land on one frame.
  const lastTop = useRef(null);
  useLayoutEffect(() => {
    const prev = lastTop.current;
    const next = routes[routes.length - 1];
    lastTop.current = next;
    if (!prev || !next || prev.key === next.key) return;
    const added = !prevKeysRef.current?.has(next.key);
    api.current.routeChanged(prev, next, added);
  }, [topKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const prevKeysRef = useRef(null);
  useLayoutEffect(() => { prevKeysRef.current = new Set(routes.map((x) => x.key)); }, [routes]);

  const orderInfo = { z: new Map(), above: new Map() };
  order.forEach((o, i) => {
    orderInfo.z.set(o.route.key, i);
    const a = order[i + 1]?.route;
    if (a && a.transition === 'push') orderInfo.above.set(o.route.key, a.key);
  });

  return (
    <StackCtx.Provider value={api.current}>
     <OrderCtx.Provider value={orderInfo}>
      <div className="ns" ref={stage}>
        <AnimatePresence initial={false}>
          {routes.map((r, i) => (
            <Screen key={r.key} route={r} first={isFirst.current} isRoot={i === 0} isTop={r.key === topKey}>
              {renderRoute(r)}
            </Screen>
          ))}
        </AnimatePresence>
        {flight ? <BarFlight key={flight.id} flight={flight} /> : null}
      </div>
     </OrderCtx.Provider>
    </StackCtx.Provider>
  );
}

function lerpLook(a, b, t) {
  const m = (u, v) => u + (v - u) * t;
  return { x: m(a.x, b.x), y: m(a.y, b.y), w: m(a.w, b.w), h: m(a.h, b.h), radius: m(a.radius, b.radius) };
}

function Screen({ route, first, isRoot, isTop, children }) {
  const api = useContext(StackCtx);
  const ord = useContext(OrderCtx);
  const z = ord.z.get(route.key) ?? 0;
  const aboveKey = ord.above.get(route.key) ?? null;
  const reduce = !!useReducedMotion();
  const [isPresent, safeToRemove] = usePresence();
  const m = api.mv(route.key);
  const { x, o } = m;
  // Never show the screen left of its resting x, even if a flick back overshoots the spring.
  const xShown = useTransform(x, (v) => Math.max(0, v));
  const px = useMotionValue(0);   // parallax offset driven by the screen above
  const dim = useMotionValue(0);  // dim overlay opacity driven by the screen above
  const el = useRef(null);
  const drag = useRef(null);
  const vel = useRef(null);
  if (!vel.current) vel.current = velocityTracker();
  const suppressClick = useRef(false);
  const morph = route.transition === 'morph';

  // Enter once on mount; release motion values on unmount.
  useLayoutEffect(() => { m.el = el.current; api.enter(route, first); return () => api.forget(route.key); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Exit when AnimatePresence says we've been removed.
  useEffect(() => { if (!isPresent) api.exit(route, safeToRemove); }, [isPresent]); // eslint-disable-line react-hooks/exhaustive-deps

  // Follow the screen above: parallax + dim are a pure function of its x (push screens only —
  // a morph screen never slides, so the one under it never moves).
  useLayoutEffect(() => {
    const a = aboveKey && api.mv(aboveKey);
    if (!a || reduce) { px.set(0); dim.set(0); return; }
    const update = (v) => {
      const p = Math.min(1, Math.max(0, 1 - v / W));
      px.set(-PARALLAX * W * p);
      dim.set(DIM * p);
    };
    update(a.x.get());
    return a.x.on('change', update);
  }, [aboveKey, reduce]); // eslint-disable-line react-hooks/exhaustive-deps

  // --- edge swipe back (UIScreenEdgePanGestureRecognizer) ---------------------------------
  // Starts within EDGE px of the screen's *current* leading edge, so a screen that is still
  // pushing in can be caught mid-flight. It's claimed only after TAP_SLOP px of mostly-horizontal
  // travel, then tracks 1:1 from the grab point. On release it projects the throw and keeps the
  // finger's velocity going into the spring. On a morph screen the finger drives the cross-fade
  // and the bar's flight home instead of a slide.
  const canSwipe = isTop && !isRoot && isPresent; // direct manipulation stays on under reduced motion
  const onPointerDownCapture = (e) => {
    suppressClick.current = false;
    if (!canSwipe || e.button > 0 || !el.current) return;
    const stack = el.current.closest('.ns')?.getBoundingClientRect();
    if (!stack) return;
    const s = stack.width / W;                         // device scale
    const left = el.current.getBoundingClientRect().left;
    if ((e.clientX - left) / s > EDGE) return;
    drag.current = { id: e.pointerId, sx: e.clientX, sy: e.clientY, s, claimed: false };
  };
  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    if (!d.claimed) {
      const dx = (e.clientX - d.sx) / d.s, dy = (e.clientY - d.sy) / d.s;
      if (Math.hypot(dx, dy) < TAP_SLOP) return;
      if (dx <= 0 || Math.abs(dx) < Math.abs(dy)) { drag.current = null; return; } // vertical / leftward: not ours
      d.claimed = true;
      d.sx = e.clientX;            // grab offset: track from here, no jump
      d.x0 = morph ? 0 : x.get();
      x.stop();
      vel.current.reset();
      try { el.current.setPointerCapture(e.pointerId); } catch { /* noop */ }
    }
    const nx = Math.max(0, d.x0 + (e.clientX - d.sx) / d.s);
    d.nx = nx;
    if (morph) api.scrub(route, nx); else x.set(nx);
    vel.current.add(nx, e.timeStamp || performance.now());
  };
  const endDrag = (e, cancelled) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    if (!d.claimed) return;
    suppressClick.current = true;
    const v = vel.current.get(e.timeStamp || performance.now());
    const pos = d.nx ?? x.get();
    const commit = !cancelled && v > -BACK_V && project(pos, v) > W / 2;
    if (morph) {
      const done = api.scrubRelease(route, commit, v);
      if (commit) { m.leaving = done; api.onBack(); }
      return;
    }
    if (commit) { m.leaving = animate(x, W, { ...spring.push, velocity: v }); api.onBack(); }
    else animate(x, 0, { ...spring.push, velocity: v, onComplete: () => api.settled(route.key) });
  };
  const onClickCapture = (e) => {
    if (suppressClick.current) { e.stopPropagation(); e.preventDefault(); suppressClick.current = false; }
  };

  const shadow = !isRoot && route.transition === 'push';

  return (
    <RouteCtx.Provider value={route.key}>
      <motion.div className="ns-layer" style={{ zIndex: z, x: px }}>
        <motion.div
          ref={el}
          className={`ns-screen${shadow ? ' has-shadow' : ''}`}
          style={{ x: xShown, opacity: o, pointerEvents: isPresent ? 'auto' : 'none' }}
          aria-hidden={!isTop}
          onPointerDownCapture={onPointerDownCapture}
          onPointerMove={onPointerMove}
          onPointerUp={(e) => endDrag(e, false)}
          onPointerCancel={(e) => endDrag(e, true)}
          onClickCapture={onClickCapture}
        >
          {children}
          <motion.div className="ns-dim" style={{ opacity: dim }} aria-hidden="true" />
        </motion.div>
      </motion.div>
    </RouteCtx.Provider>
  );
}
