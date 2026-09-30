import { createContext, useContext, useLayoutEffect, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, motionValue, useMotionValue, useTransform, usePresence, useReducedMotion, animate } from 'motion/react';
import { spring, FADE, PARALLAX, DIM, TAP_SLOP, project, velocityTracker } from '../motion.js';
import './NavStack.css';

const W = 375;
const EDGE = 20;          // px from the screen's leading edge that starts a back-swipe
const BACK_V = 100;       // px/s: moving back toward the edge faster than this always cancels
// Elements that dock to the bottom of a morph screen (the keyboard) slide away on pop instead of only fading.
const DOCK = '[data-ns-dock="bottom"], .srch__kb';

const StackCtx = createContext(null);
// Live stacking info. Removed routes ("ghosts") keep their stale props inside AnimatePresence,
// so z-order and "who covers me" come from context, which does reach them.
const OrderCtx = createContext({ z: new Map(), above: new Map() });

/**
 * NavStack — UINavigationController-style stack.
 *
 * Every route stays mounted. Each screen owns two motion values: `x` (its own slide) and `o`
 * (its opacity). The screen underneath never animates on its own — its parallax offset and dim
 * are *derived* from the x of the screen above it. So push, pop, an interrupted pop and a finger
 * dragging the top screen all produce the exact same choreography, and any of them can be
 * interrupted mid-flight (animate() on a motion value stops the previous animation and inherits
 * its velocity).
 *
 * Removed routes become "ghosts": AnimatePresence keeps them mounted while they animate out
 * (pop) or while the incoming screen covers them (replace). AnimatePresence also relegates their
 * shared layoutId elements so the search-bar morph plays back on pop.
 */
export default function NavStack({ routes, renderRoute, onBack }) {
  const reduce = !!useReducedMotion();
  const mvs = useRef(new Map());             // key -> { x, o }
  const [ghosts, setGhosts] = useState([]);  // { route, pos, mode: 'pop' | 'replace' }
  const [prevRoutes, setPrevRoutes] = useState(null);

  // Mutable runtime shared with screens (stable identity; read at call time).
  const rt = useRef(null);
  if (!rt.current) rt.current = { entering: new Set(), waiting: new Map(), ghosts: [], onBack, reduce };
  rt.current.onBack = onBack;
  rt.current.reduce = reduce;

  const firstRender = prevRoutes === null;
  const getMV = (r) => {
    let m = mvs.current.get(r.key);
    if (!m) {
      const animated = !firstRender && r.transition !== 'none';
      const slide = animated && !reduce && r.transition === 'push';
      const fade = animated && (reduce || r.transition === 'morph');
      m = { x: motionValue(slide ? W : 0), o: motionValue(fade ? 0 : 1) };
      mvs.current.set(r.key, m);
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

  // --- runtime callbacks used by screens -------------------------------------------------
  const api = useRef(null);
  if (!api.current) {
    const releaseReplaced = () => {
      const r = rt.current;
      r.waiting.forEach((done) => done());
      r.waiting.clear();
      const keep = r.ghosts.filter((g) => g.mode !== 'replace');
      if (keep.length !== r.ghosts.length) { r.ghosts = keep; setGhosts(keep); }
    };
    const dropGhost = (key) => {
      const r = rt.current;
      r.ghosts = r.ghosts.filter((g) => g.route.key !== key);
      setGhosts(r.ghosts);
    };
    api.current = {
      mv: (key) => mvs.current.get(key),
      forget: (key) => { if (!rt.current.ghosts.some((g) => g.route.key === key)) mvs.current.delete(key); },
      onBack: () => rt.current.onBack?.(),
      enter(route, first) {
        const r = rt.current;
        const m = mvs.current.get(route.key);
        const finish = () => { r.entering.delete(route.key); releaseReplaced(); };
        if (first || route.transition === 'none') { m.x.set(0); m.o.set(1); finish(); return; }
        r.entering.add(route.key);
        if (r.reduce || route.transition === 'morph') {
          animate(m.o, 1, { ...FADE, onComplete: finish });
        } else {
          animate(m.x, 0, { ...spring.push, delay: route.delay || 0, onComplete: finish });
        }
      },
      // an entering screen that was grabbed and let go (cancel) has still finished entering
      settled(key) { if (rt.current.entering.delete(key)) releaseReplaced(); },
      exit(route, safeToRemove) {
        const r = rt.current;
        const g = r.ghosts.find((gh) => gh.route.key === route.key);
        const m = mvs.current.get(route.key);
        const done = () => { safeToRemove(); dropGhost(route.key); };
        r.entering.delete(route.key);
        if (!g || !m) { safeToRemove(); return; }
        if (g.mode === 'replace') {
          // Stay put underneath until the incoming screen fully covers us.
          if (r.entering.size === 0) done(); else r.waiting.set(route.key, done);
          return;
        }
        // Pop: whatever was waiting under an interrupted entry can go now.
        const popDone = () => { done(); releaseReplaced(); };
        if (route.transition === 'none' && m.x.get() < 0.5) { popDone(); return; }
        if (r.reduce) { animate(m.o, 0, { ...FADE, onComplete: popDone }); return; }
        // Slide out if it's a push screen, or a morph screen the finger already dragged.
        // A committed edge swipe already started the slide-out at the finger's release velocity
        // (in the pointerup handler, so no frame is lost waiting on React). Just wait for it to land.
        if (m.leaving) { const l = m.leaving; m.leaving = null; l.then(popDone); return; }
        const v = m.x.getVelocity();
        if (route.transition === 'push' || m.x.get() > 0.5) {
          animate(m.x, W, { ...spring.push, velocity: v, onComplete: popDone });
        } else {
          // morph pop: content cross-fades out while a docked keyboard drops along its entry path
          const dock = m.el?.querySelector(DOCK);
          if (dock) animate(dock, { y: dock.offsetHeight }, spring.keyboard);
          animate(m.o, 0, { ...FADE, onComplete: popDone });
        }
      },
    };
  }

  const topKey = routes[routes.length - 1]?.key;
  const isFirst = useRef(true);
  useEffect(() => { isFirst.current = false; }, []);

  const orderInfo = { z: new Map(), above: new Map() };
  order.forEach((o, i) => {
    orderInfo.z.set(o.route.key, i);
    const a = order[i + 1]?.route;
    if (a && a.transition === 'push') orderInfo.above.set(o.route.key, a.key);
  });

  return (
    <StackCtx.Provider value={api.current}>
     <OrderCtx.Provider value={orderInfo}>
      <div className="ns">
        <AnimatePresence initial={false}>
          {routes.map((r, i) => {
            return (
              <Screen
                key={r.key}
                route={r}
                first={isFirst.current}
                isRoot={i === 0}
                isTop={r.key === topKey}
              >
                {renderRoute(r)}
              </Screen>
            );
          })}
        </AnimatePresence>
      </div>
     </OrderCtx.Provider>
    </StackCtx.Provider>
  );
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

  // Enter once on mount; release motion values on unmount.
  useLayoutEffect(() => { m.el = el.current; api.enter(route, first); return () => api.forget(route.key); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Exit when AnimatePresence says we've been removed.
  useEffect(() => { if (!isPresent) api.exit(route, safeToRemove); }, [isPresent]); // eslint-disable-line react-hooks/exhaustive-deps

  // Follow the screen above: parallax + dim are a pure function of its x.
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
  // finger's velocity going into the spring.
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
      d.x0 = x.get();
      x.stop();
      vel.current.reset();
      try { el.current.setPointerCapture(e.pointerId); } catch { /* noop */ }
    }
    const nx = Math.max(0, d.x0 + (e.clientX - d.sx) / d.s);
    x.set(nx);
    vel.current.add(nx, e.timeStamp || performance.now());
  };
  const endDrag = (e, cancelled) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    if (!d.claimed) return;
    suppressClick.current = true;
    const v = vel.current.get(e.timeStamp || performance.now());
    const pos = x.get();
    const commit = !cancelled && v > -BACK_V && project(pos, v) > W / 2;
    if (commit) { m.leaving = animate(x, W, { ...spring.push, velocity: v }); api.onBack(); }
    else animate(x, 0, { ...spring.push, velocity: v, onComplete: () => api.settled(route.key) });
  };
  const onClickCapture = (e) => {
    if (suppressClick.current) { e.stopPropagation(); e.preventDefault(); suppressClick.current = false; }
  };

  const shadow = !isRoot && route.transition === 'push';

  return (
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
  );
}
