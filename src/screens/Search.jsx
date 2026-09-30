import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import StatusBar from '../components/StatusBar.jsx';
import SearchBar from '../components/SearchBar.jsx';
import Keyboard from '../components/Keyboard.jsx';
import CouponCard from '../components/CouponCard.jsx';
import SuggestionRow from '../components/SuggestionRow.jsx';
import { coupon, suggestionsFor } from '../data.js';
import { spring } from '../motion.js';
import './Search.css';

const commonPrefix = (a, b) => { let i = 0; while (i < a.length && i < b.length && a[i] === b[i]) i++; return i; };
const ROW_STAGGER = 0.025;
const ROWS_BASE_DELAY = 0.09; // rows start just after the card (60ms) begins

export default function Search({ nav, params = {} }) {
  const script = params.script || '';
  const [query, setQuery] = useState(params.query || '');
  const replacePending = useRef(!!params.replaceOnFirstKey);
  const [kbVisible, setKbVisible] = useState(false);
  const [settleKey, setSettleKey] = useState(0);
  const mounted = useRef(false);

  // keyboard slides up on mount; rows cascade only on the first render
  useEffect(() => {
    const id = requestAnimationFrame(() => setKbVisible(true));
    const t = setTimeout(() => { mounted.current = true; }, 0);
    return () => { cancelAnimationFrame(id); clearTimeout(t); };
  }, []);

  const goResults = useCallback((q) => {
    nav.replace('results', { query: (q || '').trim() || 'serum' }, { transition: 'push' });
  }, [nav]);

  // Scripted typing: every key appends the NEXT char of the script (whatever key was pressed).
  const onKey = useCallback(() => {
    if (!script) return;
    if (replacePending.current) {
      replacePending.current = false;
      setQuery(script[0]);
      setSettleKey(k => k + 1);
      return;
    }
    setQuery(q => {
      const p = commonPrefix(q, script);
      if (p !== q.length || p >= script.length) return q; // fully typed / diverged → no-op
      return q + script[p];
    });
    setSettleKey(k => k + 1);
  }, [script]);

  const onBackspace = useCallback(() => {
    replacePending.current = false;
    setQuery(q => q.slice(0, -1)); // script pointer = common prefix, so it moves back automatically
  }, []);

  const onClear = useCallback(() => { replacePending.current = false; setQuery(''); }, []);
  const onFill = useCallback((label) => { replacePending.current = false; setQuery(label); }, []);

  const rows = suggestionsFor(query);
  const empty = query.trim() === '';

  return (
    <div className="srch">
      <StatusBar tone="dark" />
      <div className="srch__header">
        <SearchBar layoutId="search-bar" value={query} placeholder="Search" state="typing"
          trailing="camera" onBack={() => nav.pop()} settleKey={settleKey} />
      </div>

      <div className="srch__body">
        <div className="srch__coupon">
          <CouponCard coupon={coupon} cta="View all" onTap={() => goResults(query)}
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring.snappy, delay: 0.06, opacity: { duration: 0.15, ease: 'linear', delay: 0.06 } }} />
        </div>

        <AnimatePresence initial={false}>
          {empty && (
            <motion.p key="hint" className="srch__hint"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.08 } }}
              transition={{ duration: 0.15, ease: 'linear' }}>
              Search within {coupon.eligibleCount.toLocaleString('en-US')} eligible items
            </motion.p>
          )}
        </AnimatePresence>

        <div className="srch__list">
          <AnimatePresence mode="popLayout" initial={true}>
            {rows.map((r, i) => {
              const delay = mounted.current ? 0 : ROWS_BASE_DELAY + i * ROW_STAGGER;
              return (
                <SuggestionRow key={r.label} label={r.label} thumb={r.thumb} query={query}
                  onTap={() => goResults(r.label)} onFill={onFill}
                  layout="position"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, transition: { duration: 0.08, ease: 'linear' } }}
                  transition={{ ...spring.snappy, delay, layout: spring.snappy, opacity: { duration: 0.15, ease: 'linear', delay } }} />
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      <div className="srch__kb">
        <Keyboard visible={kbVisible} onKey={onKey} onBackspace={onBackspace} onReturn={() => goResults(query)} />
      </div>
    </div>
  );
}
