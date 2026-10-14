import { motion } from 'motion/react';
import Pressable from './Pressable.jsx';
import Icon from './Icon.jsx';
import './ScopedRow.css';

// Auto-suggestion (team file · Iteration 1 · Flow B "Scoped row + View all", 06 · Search — se):
// the first row of the typeahead offers the scoped search, then a hairline, then the normal
// all-of-noon suggestions. Tapping the row (or View all) searches within the eligible items.
export default function ScopedRow({ code, value = 'extra 10% off', onTap, ...motionProps }) {
  return (
    <motion.div className="sq-wrap" {...motionProps}>
      <Pressable as="div" className="sq" onTap={onTap} aria-label={`Search within ${code} eligible items`}>
        <span className="sq-tile"><Icon name="search" size={20} color="#1d2539" /></span>
        <span className="sq-copy">
          <span className="sq-title">Searching within <b>eligible items</b></span>
          <span className="sq-sub"><b>{code}</b> · {value}</span>
        </span>
        <span className="sq-link">View all<Icon name="chevron-right" size={12} color="#0f61ff" /></span>
      </Pressable>
      <div className="sq-div" />
    </motion.div>
  );
}
