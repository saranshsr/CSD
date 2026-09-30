import { createContext, useContext, useLayoutEffect, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, motionValue, useMotionValue, usePresence, useReducedMotion, animate } from 'motion/react';
import { spring, PARALLAX, DIM } from '../motion.js';
import './NavStack.css';

const W = 375;
const EDGE = 20;          // px from the left edge that starts a back-swipe
const COMMIT_V = 500;     // px/s
const COMMIT_X = 0.35;    // fraction of width
const FADE = { duration: 0.15, ease: 'easeOut' }; // the only tween: short opacity fades

const StackCtx = createContext(null);

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
  const zOf = (key) => order.findIndex((o) => o.route.key === key);

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
          animate(m.x, 0, { ...spring.push, onComplete: finish });
        }
      },
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
        if (route.transition === 'push' || m.x.get() > 0.5) {
          animate(m.x, W, { ...spring.push, velocity: m.x.getVelocity(), onComplete: popDone });
        } else {
          animate(m.o, 0, { ...FADE, onComplete: popDone });
        }
      },
    };
  }

  const topKey = routes[routes.length - 1]?.key;
  const isFirst = useRef(true);
  useEffect(() => { isFirst.current = false; }, []);

  return (
    <StackCtx.Provider value={api.current}>
      <div className="ns">
        <AnimatePresence initial={false}>
          {routes.map((r, i) => {
            const z = zOf(r.key);
            const above = order[z + 1]?.route;
            return (
              <Screen
                key={r.key}
                route={r}
                z={z}
                first={isFirst.current}
                isRoot={i === 0}
                isTop={r.key === topKey}
                aboveKey={above && above.transition === 'push' ? above.key : null}
              >
                {renderRoute(r)}
              </Screen>
            );
          })}
        </AnimatePresence>
      </div>
    </StackCtx.Provider>
  );
}

function Screen({ route, z, first, isRoot, isTop, aboveKey, children }) {
  const api = useContext(StackCtx);
  const reduce = !!useReducedMotion();
  const [isPresent, safeToRemove] = usePresence();
  const { x, o } = api.mv(route.key);
  const px = useMotionValue(0);   // parallax offset driven by the screen above
  const dim = useMotionValue(0);  // dim overlay opacity driven by the screen above
  const el = useRef(null);
  const drag = useRef(null);
  const suppressClick = useRef(false);

  // Enter once on mount; release motion values on unmount.
  useLayoutEffect(() => { api.enter(route, first); return () => api.forget(route.key); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Exit when AnimatePresence says we've been removed.
  useEffect(() => { if (!isPresent) api.exit(route, safeToRemove); }, [isPresent]); // eslint-disable-line react-hooks/exhaustive-deps

  // Follow the screen above: parallax + dim are a pure function of its x.
  useLayoutEffect(() => {
    const m = aboveKey && api.mv(aboveKey);
    if (!m || reduce) { px.set(0); dim.set(0); return; }
    const update = (v) => {
      const p = Math.min(1, Math.max(0, 1 - v / W));
      px.set(-PARALLAX * W * p);
      dim.set(DIM * p);
    };
    update(m.x.get());
    return m.x.on('change', update);
  }, [aboveKey, reduce]); // eslint-disable-line react-hooks/exhaustive-deps

  // --- edge swipe back -------------------------------------------------------------------
  const canSwipe = isTop && !isRoot && isPresent;
  const onPointerDownCapture = (e) => {
    suppressClick.current = false;
    if (!canSwipe || e.button > 0) return;
    const stack = el.current?.closest('.ns')?.getBoundingClientRect();
    if (!stack) return;
    const s = stack.width / W;                         // device scale
    if ((e.clientX - stack.left) / s > EDGE) return;
    x.stop();
    drag.current = { id: e.pointerId, startX: e.clientX, x0: x.get(), s, moved: false };
    try { el.current.setPointerCapture(e.pointerId); } catch { /* noop */ }
  };
  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = (e.clientX - d.startX) / d.s;
    if (Math.abs(dx) > 3) d.moved = true;
    x.set(Math.max(0, d.x0 + dx));
  };
  const endDrag = (e, cancelled) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    if (d.moved) suppressClick.current = true;
    const v = x.getVelocity();
    const commit = !cancelled && (v > COMMIT_V || (x.get() > COMMIT_X * W && v > -COMMIT_V));
    if (commit) api.onBack();
    else animate(x, 0, { ...spring.push, velocity: v });
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
        style={{ x, opacity: o, pointerEvents: isPresent ? 'auto' : 'none' }}
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
