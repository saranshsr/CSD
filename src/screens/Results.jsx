import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import StatusBar from '../components/StatusBar.jsx';
import SearchBar from '../components/SearchBar.jsx';
import BottomNav from '../components/BottomNav.jsx';
import Pressable from '../components/Pressable.jsx';
import Icon from '../components/Icon.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { ProductGrid, SortFilterPill } from './PLP.jsx';
import { resultsFor } from '../data.js';
import { spring, stagger } from '../motion.js';
import './Results.css';

// Figma 07 · Results — serum (2327:96495) and 09 · noon.com fallback (2328:96969)
const CHIPS = {
  coupon: ['Sort', 'Price', 'Brand', 'Skin type'],
  noon: ['Sort', 'Price', 'Brand', 'Strap'],
};

function NoonScope() {
  // brief highlight so the scope switch (BEAUTY10 → noon.com) is noticed
  const [hl, setHl] = useState(false);
  useEffect(() => {
    const a = setTimeout(() => setHl(true), 220);
    const b = setTimeout(() => setHl(false), 1300);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, []);
  return (
    <span className="rs-scope">
      <motion.span className="rs-scope-hl" aria-hidden="true" initial={{ opacity: 0, scaleX: 0.6 }}
        animate={{ opacity: hl ? 1 : 0, scaleX: hl ? 1 : 1.04 }} transition={spring.snappy} />
      <span className="rs-scope-text rs-scope-plain">all categories</span>
    </span>
  );
}

export default function Results({ nav, params = {} }) {
  const query = params.query || '';
  const { scope, items } = resultsFor(query);
  const isNoon = scope === 'noon';
  // noon fallback: the context line lands first, then the grid
  const gridDelay = isNoon ? 0.16 : 0.06;

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
          {CHIPS[scope].map((c) => (
            <Pressable key={c} className="rs-chip">
              <span>{c}</span>
              <Icon name="caret-down" size={12} color="#1d2539" />
            </Pressable>
          ))}
        </div>

        <motion.div className="rs-context" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={spring.snappy}>
          Showing results for <b>“{query}”</b> in {isNoon ? <NoonScope /> : 'BEAUTY10 items'}
        </motion.div>

        <ProductGrid
          items={items}
          renderItem={(p, i) => (
            <motion.div key={p.id} className="rs-cell" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring.snappy, ...stagger(i, 0.04, gridDelay) }}>
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
