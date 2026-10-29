import { Fragment, StrictMode, useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { setWasmUrl } from '@lottiefiles/dotlottie-react';
import { allFlows } from '../flows';
import { NoonPrototype } from '../kit/NoonPrototype';
import { createRegistry } from '../kit/registry';
import { parsePageUrl } from '../kit/routes';
import { layout } from '../foundations/tokens';
import type { Route, StackEntry } from '../kit/types';
import '../motion/custom';
import { csStore, isCsVariant, useCs, type CsVariant } from '../flows/couponsearch/store';
import { VersionSwitch } from './VersionSwitch';
import './preview.css';

/**
 * Dev preview: the phone on its own. Every page is a URL — `/homepage`, `/plp?query=x`, `/orders` (see kit/routes.ts)
 * or the legacy `#/flow/screen`; `/` opens the cart (the coupon-scoped search demo starts there). Not part of the package.
 * The coupon search's version switch sits above the phone: `?v=h2|row|n5` deep-links a version (default h2) and stays
 * in the address bar on every page; switching keeps you on the same screen (the coupon screens remount in place).
 */
const registry = createRegistry(allFlows);

// Lottie player from our own server (cached with the app) instead of the jsdelivr CDN on the first animation. A path,
// not a package import: the wasm is not in dotlottie-web's exports map. Same installed version as the player JS.
setWasmUrl(new URL('../../node_modules/@lottiefiles/dotlottie-web/dist/dotlottie-player.wasm', import.meta.url).href);

// used by scripts/check-routes.mjs
(window as unknown as { __NK_ROUTES__: string[] }).__NK_ROUTES__ = registry.all().map((r) => r.route);

const readUrl = (): { route?: Route; params: Record<string, string> } => {
  const { route, params } = parsePageUrl(window.location);
  const { v, embed: _embed, solo: _solo, ...rest } = params;
  if (isCsVariant(v)) csStore.setVariant(v);
  return { route: route ? registry.resolve(route)?.route : 'couponsearch/cart', params: rest };
};
// `?embed=1`: for tools that put the prototype in their own phone frame (Prism, Figma embeds). No version switch,
// no backdrop or phone frame of ours, the screen fills the window, and the link stays locked to its `?v=`.
const embed = new URLSearchParams(window.location.search).get('embed') === '1';
if (embed) document.documentElement.classList.add('pg-embed');
// `?solo=1`: a review link for one version: our phone frame stays, the version switch goes, the link stays on its `?v=`.
const solo = new URLSearchParams(window.location.search).get('solo') === '1';
const withVersion = (search: string) => {
  const q = new URLSearchParams(search);
  q.set('v', csStore.get().variant);
  if (embed) q.set('embed', '1');
  if (solo) q.set('solo', '1');
  return `?${q.toString()}`;
};

// The kit's own capture tools (scripts/lib/capture.mjs, check-routes, visual:*) size their viewport to the phone and
// expect it at the stage's 24px offset: under automation the switch only shows when a test asks for it (`?v=`), and
// the phone is never scaled. People get the switch, and a phone scaled down to fit a short window.
const automated = !!navigator.webdriver;
const showSwitch = !embed && !solo && (!automated || new URLSearchParams(window.location.search).has('v'));
const SWITCH_H = 52; // VersionSwitch: 16 top + 36
const STAGE_PAD = 48; // .pg-stage padding, top + bottom
function useFitScale() {
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    if (embed) {
      // the app keeps its 390 layout (keyboard, grids) and scales to the host frame's width; its height fills the frame
      const fit = () => {
        const k = window.innerWidth / layout.deviceWidth;
        document.documentElement.style.setProperty('--emb-scale', String(k));
        setScale(k);
      };
      fit();
      window.addEventListener('resize', fit);
      return () => window.removeEventListener('resize', fit);
    }
    if (automated) return;
    const fit = () => {
      const h = (window.innerHeight - (showSwitch ? SWITCH_H : 0) - STAGE_PAD) / layout.deviceHeight;
      const w = (window.innerWidth - 32) / layout.deviceWidth;
      setScale(Math.max(0.5, Math.min(1, h, w)));
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);
  return scale;
}

function Preview() {
  const scale = useFitScale();
  const [page, setPage] = useState(() => ({ ...readUrl(), nonce: 0 }));

  useEffect(() => {
    const onUrl = () => setPage((p) => ({ ...readUrl(), nonce: p.nonce + 1 }));
    window.addEventListener('popstate', onUrl);
    window.addEventListener('hashchange', onUrl);
    return () => {
      window.removeEventListener('popstate', onUrl);
      window.removeEventListener('hashchange', onUrl);
    };
  }, []);

  // Keep the address bar on the page's clean URL, e.g. /homepage, /plp, /checkout/cards-select.
  const onRouteChange = useCallback((r: Route, s: StackEntry[]) => {
    const p = s.at(-1)?.params ?? {};
    // used by scripts/journeys.mjs: the current route and stack
    (window as unknown as { __NK_NAV__: unknown }).__NK_NAV__ = { route: r, stack: s.map((e) => e.route), params: p };
    const query = new URLSearchParams(Object.entries(p).flatMap(([k, v]) => (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean' ? [[k, String(v)]] : []))).toString();
    window.history.replaceState(null, '', `/${registry.pathFor(r)}${withVersion(query)}`);
  }, []);

  // the version switch: same screen, the other design (the coupon screens remount in place, the visit starts over)
  const variant = useCs((s) => s.variant);
  const onVersion = useCallback((v: CsVariant) => {
    if (v === csStore.get().variant) return;
    csStore.setVariant(v);
    window.history.replaceState(null, '', `${window.location.pathname}${withVersion(window.location.search)}`);
  }, []);

  return (
    <>
      {showSwitch && <VersionSwitch value={variant} onChange={onVersion} />}
      <div className="pg-stage">
        {/* PhoneFrame scales from its top centre; this box takes the scaled height so the page doesn't scroll */}
        <div style={embed ? undefined : scale < 1 ? { height: layout.deviceHeight * scale, overflow: 'clip', overflowClipMargin: 24 } : undefined}>
          <NoonPrototype key={page.nonce} flows={allFlows} initialRoute={page.route} initialParams={page.params} onRouteChange={onRouteChange} scale={scale} frame={!embed} />
        </div>
      </div>
    </>
  );
}

// StrictMode renders every screen twice in dev, which doubles the cost of each push. Opt in while debugging effects:
// `VITE_STRICT=1 npm run dev`.
const Root = import.meta.env.VITE_STRICT ? StrictMode : Fragment;
createRoot(document.getElementById('root')!).render(
  <Root>
    <Preview />
  </Root>,
);
