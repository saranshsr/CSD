import React, { useCallback, useMemo, useRef, useState } from 'react';
import { LayoutGroup, MotionConfig } from 'motion/react';
import DeviceFrame from './components/DeviceFrame.jsx';
import NavStack from './components/NavStack.jsx';
import Sheet from './components/Sheet.jsx';
import Cart from './screens/Cart.jsx';
import Coupons from './screens/Coupons.jsx';
import PLP from './screens/PLP.jsx';
import Search from './screens/Search.jsx';
import Results from './screens/Results.jsx';

const SCREENS = { cart: Cart, plp: PLP, search: Search, results: Results };
let k = 0; const route = (id, params = {}, transition = 'push', delay = 0) => ({ key: `${id}-${++k}`, id, params, transition, delay });
// Sheet → push hand-off: the next screen is mounted at the tap (so its first-render cost lands before
// anything moves) and starts sliding this long after the sheet begins to drop. Both read as one gesture.
const SHEET_TO_PUSH = 0.1;

// Capture/deep-link mode for fidelity checks: ?s=plp | ?s=search&q=se | ?s=results&q=serum  (+ &bare=1 = unscaled 375×812, no device chrome)
const QS = new URLSearchParams(location.search);
const BARE = QS.get('bare') === '1';
function initialRoutes() {
  const s = QS.get('s'); const q = QS.get('q') || '';
  if (!s || s === 'cart') return [route('cart', {}, 'none')];
  const params = s === 'search' ? { query: q, script: q.startsWith('sei') ? 'seiko watch' : 'serum' } : { query: q };
  return [route(s, params, 'none')];
}

export default function App() {
  const [routes, setRoutes] = useState(initialRoutes);
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
    reset: () => { setSheetOpen(false); setRoutes([route('cart', {}, 'none')]); },
  }), []);

  const onSheetClosed = useCallback(() => { const f = pending.current; pending.current = null; f && f(); }, []);

  const Frame = BARE ? BareFrame : DeviceFrame;
  return (
    <Frame onReset={nav.reset}>
      <LayoutGroup>
        <NavStack routes={routes} onBack={nav.pop}
          renderRoute={(r) => { const S = SCREENS[r.id]; return <S nav={{ ...nav, sheetOpen }} params={r.params} />; }} />
      </LayoutGroup>
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
