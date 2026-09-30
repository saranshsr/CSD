import { motion, useReducedMotion } from 'motion/react';
import StatusBar from '../components/StatusBar.jsx';
import SearchBar from '../components/SearchBar.jsx';
import BottomNav from '../components/BottomNav.jsx';
import Pressable from '../components/Pressable.jsx';
import Icon from '../components/Icon.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { ProductGrid, SortFilterPill } from './PLP.jsx';
import { resultsFor } from '../data.js';
import { riseAt, FADE } from '../motion.js';
import { useBarLanded } from '../components/NavStack.jsx';
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

// Entrance (LSN ResultsScreen): the bar settles into the header first; once it has LANDED the
// content arrives in groups on the `rise` look — chips, the context line, then the grid, first
// rows a step apart. Cards below the fold don't wait.
const STEP = 0.035;

export default function Results({ nav, params = {} }) {
  const query = params.query || '';
  const { scope, items } = resultsFor(query);
  const isNoon = scope === 'noon';
  const landed = useBarLanded();
  const reduce = !!useReducedMotion();
  const FADE_ONLY = { hidden: { opacity: 0 }, shown: { opacity: 1, transition: FADE } };
  const form = (delay) => ({ initial: 'hidden', animate: landed ? 'shown' : 'hidden', variants: reduce ? FADE_ONLY : riseAt(delay) });
  const gridDelay = 2 * STEP;

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
        <motion.div className="plp-chips rs-chips" {...form(0)}>
          {CHIPS[scope].map((c) => (
            <Pressable key={c.label} className={`plp-chip${c.lead ? ' has-lead' : ''}${c.trail ? ' has-trail' : ''}`}>
              {c.lead && <Icon name={c.lead} size={16} color="#0f172a" />}
              <span className="plp-chip-label">{c.label}</span>
              {c.trail && <Icon name="caret-down" size={20} color="#0f172a" />}
            </Pressable>
          ))}
        </motion.div>

        <motion.div className="rs-context" {...form(STEP)}>
          Showing results for <b>“{query}”</b> in {isNoon ? <NoonScope /> : 'BEAUTY10 items'}
        </motion.div>

        <ProductGrid
          items={items}
          renderItem={(p, i) => (
            <motion.div key={p.id} className="rs-cell" {...form(gridDelay + Math.min(i >> 1, 2) * STEP)}>
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
