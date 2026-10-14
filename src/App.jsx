import React, { useCallback, useMemo, useRef, useState } from 'react';
import { MotionConfig } from 'motion/react';
import DeviceFrame from './components/DeviceFrame.jsx';
import NavStack from './components/NavStack.jsx';
import Sheet from './components/Sheet.jsx';
import Cart from './screens/Cart.jsx';
import Coupons from './screens/Coupons.jsx';
import PLP from './screens/PLP.jsx';
import Search from './screens/Search.jsx';
import Results from './screens/Results.jsx';
import { newVisit } from './session.js';

const SCREENS = { cart: Cart, plp: PLP, search: Search, results: Results };
let k = 0; const route = (id, params = {}, transition = 'push', delay = 0) => ({ key: `${id}-${++k}`, id, params, transition, delay });
// Sheet → push hand-off: the next screen is mounted at the tap (so its first-render cost lands before
// anything moves) and starts sliding this long after the sheet begins to drop. Both read as one gesture.
const SHEET_TO_PUSH = 0.1;

// Capture/deep-link mode for fidelity checks: ?s=plp | ?s=search&q=se | ?s=results&q=serum  (+ &bare=1 = unscaled 375×812, no device chrome)
const QS = new URLSearchParams(location.search);
const BARE = QS.get('bare') === '1';
// One prototype, both directions: H2 context band · Eligible row toggle (?v= deep-links one; ?v=n5 = the old
// nudge; ?v=v1 = the retired scope-bar pill, kept only for old links)
const VARIANTS = [{ id: 'h2', label: 'H2 · Context band' }, { id: 'row', label: 'Eligible row' }];
const VARIANT0 = QS.get('v') === 'n5' ? null : (['v1', 'h2', 'row'].includes(QS.get('v')) ? QS.get('v') : 'h2');
function initialRoutes() {
  const s = QS.get('s'); const q = QS.get('q') || '';
  if (!s || s === 'cart') return [route('cart', {}, 'none')];
  const params = s === 'search' ? { query: q, script: q.startsWith('sei') ? 'seiko watch' : 'serum' } : { query: q };
  return [route(s, params, 'none')];
}

export default function App() {
  const [routes, setRoutes] = useState(initialRoutes);
  const [variant, setVariant] = useState(VARIANT0);
  const [epoch, setEpoch] = useState(0);
  // switching keeps you on the same screen: the stack re-mounts in place with the other variant
  const switchVariant = useCallback((v) => {
    if (v === variant) return;
    newVisit(); setSheetOpen(false); setVariant(v);
    setRoutes((rs) => rs.map((r) => ({ ...r, key: `${r.id}-${++k}`, transition: 'none', params: { ...r.params, variant: v, scope: undefined } })));
    setEpoch((e) => e + 1);
    try { const u = new URL(location.href); u.searchParams.set('v', v); history.replaceState(null, '', u); } catch { /* noop */ }
  }, [variant]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const pending = useRef(null);
  const overlap = useRef(0);

  const nav = useMemo(() => ({
    push: (id, params, o = {}) => { const d = o.delay ?? overlap.current; setRoutes(r => [...r, route(id, params, o.transition || 'push', d)]); },
    pop: () => setRoutes(r => (r.length > 1 ? r.slice(0, -1) : r)),
    replace: (id, params, o = {}) => setRoutes(r => [...r.slice(0, -1), route(id, params, o.transition || 'push')]),
    openSheet: () => setSheetOpen(true),
    // overlap: the next screen starts pushing while the sheet is still sliding away (no dead pause).
    // `then` runs now (same commit as the close) and any push it makes carries the overlap delay.
    closeSheet: (then) => { setSheetOpen(false); if (then) { overlap.current = SHEET_TO_PUSH; try { then(); } finally { overlap.current = 0; } } },
    reset: () => { newVisit(); setSheetOpen(false); setRoutes([route('cart', {}, 'none')]); },
    variant,
  }), [variant]);

  const onSheetClosed = useCallback(() => { const f = pending.current; pending.current = null; f && f(); }, []);

  const Frame = BARE ? BareFrame : DeviceFrame;
  return (
    <Frame onReset={nav.reset} variants={variant ? VARIANTS : null} variant={variant} onVariant={switchVariant}>
      <NavStack key={epoch} routes={routes} onBack={nav.pop}
        renderRoute={(r) => { const S = SCREENS[r.id]; return <S nav={{ ...nav, sheetOpen }} params={r.params} />; }} />
      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} onClosed={onSheetClosed} top={183} inset={12} bottomGap={29} radius={16} bg="#f2f3f7">
        <Coupons nav={{ ...nav, sheetOpen }} open={sheetOpen} />
      </Sheet>
    </Frame>
  );
}
function BareFrame({ children }) {
  return (
    <MotionConfig reducedMotion="user">
      <div style={{ position: 'relative', width: 375, height: 812, overflow: 'hidden', background: '#fff' }}>{children}</div>
    </MotionConfig>
  );
}
