import { motion } from 'motion/react';
import StatusBar from '../components/StatusBar.jsx';
import SearchBar from '../components/SearchBar.jsx';
import BottomNav from '../components/BottomNav.jsx';
import Pressable from '../components/Pressable.jsx';
import Icon from '../components/Icon.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { ProductGrid, SortFilterPill } from './PLP.jsx';
import { resultsFor } from '../data.js';
import { spring, FADE } from '../motion.js';
import './Results.css';

// Figma 07 · Results — serum (2327:96495) and 09 · noon.com fallback (2328:96969)
const CHIPS = {
  coupon: ['Sort', 'Price', 'Brand', 'Skin type'],
  noon: ['Sort', 'Price', 'Brand', 'Strap'],
};
// last chip follows the query's category on the noon-wide fallback (Figma 10 shows "Strap" for watches)
function chipsFor(scope, q) {
  if (scope !== 'noon') return CHIPS.coupon;
  const s = q.toLowerCase();
  const last = /watch|seiko/.test(s) ? 'Strap' : /phone|iphone|galaxy|s2\d/.test(s) ? 'Storage' : /tv|televi/.test(s) ? 'Screen size' : 'Category';
  return ['Sort', 'Price', 'Brand', last];
}

function NoonScope() {
  // plain text, no attention-seeking highlight: the scope switch is carried by the copy itself
  return (
    <span className="rs-scope">
      <span className="rs-scope-text rs-scope-plain">all categories</span>
    </span>
  );
}

// Restrained entrance: the context line and the first cards fade up ≤8px on a critically damped
// spring with a short stagger. Everything settles within ~400ms. Cards below the fold don't wait.
const RISE = 8;
const STEP = 0.03;
const enter = (delay) => ({ y: { ...spring.snappy, delay }, opacity: { ...FADE, delay } });

export default function Results({ nav, params = {} }) {
  const query = params.query || '';
  const { scope, items } = resultsFor(query);
  const isNoon = scope === 'noon';
  // the context line leads by one step, then the grid
  const gridDelay = STEP;

  return (
    <div className="rs">
      <div className="rs-top">
        <StatusBar tone="dark" />
        <div className="rs-searchwrap">
          <SearchBar
            layoutId="search-bar"
            value={query}
            state="typed"
            trailing="none"
            onBack={() => nav.pop()}
            onTap={() => nav.push('search', { query, script: 'seiko watch', replaceOnFirstKey: true }, { transition: 'morph' })}
          />
        </div>
      </div>

      <div className="rs-scroll">
        <div className="rs-chips">
          <Pressable className="rs-chip">
            <Icon name="preferences" size={16} color="#1d2539" />
            <span>Filters</span>
          </Pressable>
          {chipsFor(scope, query).map((c) => (
            <Pressable key={c} className="rs-chip">
              <span>{c}</span>
              <Icon name="caret-down" size={12} color="#1d2539" />
            </Pressable>
          ))}
        </div>

        <motion.div className="rs-context" initial={{ opacity: 0, y: RISE / 2 }} animate={{ opacity: 1, y: 0 }} transition={enter(0)}>
          Showing results for <b>“{query}”</b> in {isNoon ? <NoonScope /> : 'BEAUTY10 items'}
        </motion.div>

        <ProductGrid
          items={items}
          renderItem={(p, i) => (
            <motion.div key={p.id} className="rs-cell" initial={{ opacity: 0, y: RISE }} animate={{ opacity: 1, y: 0 }}
              transition={enter(gridDelay + Math.min(i >> 1, 2) * STEP)}>
              <ProductCard product={p} />
            </motion.div>
          )}
        />
        <div className="rs-foot" />
      </div>

      <SortFilterPill />
      <div className="plp-nav"><BottomNav active="cart" cartCount={0} /></div>
    </div>
  );
}
