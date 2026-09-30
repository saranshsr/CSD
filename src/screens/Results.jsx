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
// Figma 08 / 10 (updated): same chip row as the eligible-items page — Filter, Sort ▾, Price ▾ (+ Face, Eyes on BEAUTY10 results)
const CHIPS = {
  coupon: [{ label: 'Filter', lead: 'preferences' }, { label: 'Sort', trail: true }, { label: 'Price', trail: true }, { label: 'Face' }, { label: 'Eyes' }],
  noon: [{ label: 'Filter', lead: 'preferences' }, { label: 'Sort', trail: true }, { label: 'Price', trail: true }],
};

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
        <div className="plp-chips rs-chips">
          {CHIPS[scope].map((c) => (
            <Pressable key={c.label} className={`plp-chip${c.lead ? ' has-lead' : ''}${c.trail ? ' has-trail' : ''}`}>
              {c.lead && <Icon name={c.lead} size={16} color="#0f172a" />}
              <span className="plp-chip-label">{c.label}</span>
              {c.trail && <Icon name="caret-down" size={20} color="#0f172a" />}
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
