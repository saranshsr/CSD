import React, { forwardRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Icon from './Icon.jsx';
import './SuggestionRow.css';

// Split label into [before, match, after]. Bold = first case-insensitive occurrence of the typed
// query (prefix preferred). If the whole query isn't found, fall back to the longest query prefix that is.
export function splitMatch(label, query) {
  const q = (query || '').trim().toLowerCase();
  const l = label.toLowerCase();
  for (let n = q.length; n > 0; n--) {
    const part = q.slice(0, n);
    const i = l.startsWith(part) ? 0 : l.indexOf(part);
    if (i >= 0) return [label.slice(0, i), label.slice(i, i + n), label.slice(i + n)];
  }
  return [label, '', ''];
}

// Figma "Suggestion" row: 375×52, padding 6/16, gap 12; thumb 40×40 r8 image cover;
// label 14/20 — match Bold #1d2539, rest Regular #475067; trailing arrow-up-left 20 #666d85.
const SuggestionRow = forwardRef(function SuggestionRow({ label, thumb, query, onTap, onFill, ...motionProps }, ref) {
  const [a, b, c] = splitMatch(label, query);
  return (
    <motion.div ref={ref} className="sr" role="button" tabIndex={0} onClick={onTap}
      whileTap={{ backgroundColor: '#f5f6fa' }} {...motionProps}>
      <div className="sr__thumb">
        <AnimatePresence initial={false}>
          <motion.img key={thumb} src={thumb} alt="" draggable={false}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: 'linear' }} />
        </AnimatePresence>
      </div>
      <div className="sr__label">
        {a && <span className="sr__rest">{a}</span>}
        {b && <span className="sr__match">{b}</span>}
        {c && <span className="sr__rest">{c}</span>}
      </div>
      <button className="sr__fill" aria-label={`Fill ${label}`}
        onClick={(e) => { e.stopPropagation(); onFill && onFill(label); }}>
        <Icon name="arrow-up-left" size={20} color="#666d85" />
      </button>
    </motion.div>
  );
});
export default SuggestionRow;
