import { forwardRef } from 'react';
import { motion } from 'motion/react';
import Icon from './Icon.jsx';
import { spring } from '../motion.js';
import './SearchBar.css';

// SearchBar — shared element for the PLP → Search morph (layoutId="search-bar").
// Only the container carries layoutId; inner rows use layout="position" so text and icons
// are counter-scaled and never stretch while the container morphs.
const SearchBar = forwardRef(function SearchBar(
  { layoutId, value = '', placeholder = 'Search', state = 'placeholder', onBack, onTap, onClear, trailing = 'camera', settleKey, style, className },
  ref,
) {
  const hasText = value && value.length > 0;
  return (
    <motion.div
      ref={ref}
      layoutId={layoutId}
      transition={spring.morph}
      className={`sbar${className ? ' ' + className : ''}`}
      style={{ borderRadius: 12, ...style }}
      onClick={onTap}
      role="search"
    >
      <motion.button layout="position" transition={spring.morph} type="button" className="sbar-back" aria-label="Back"
        onClick={(e) => { e.stopPropagation(); onBack?.(); }}>
        <Icon name="chevron-left" size={20} color="var(--text-primary)" />
      </motion.button>

      <motion.div layout="position" transition={spring.morph} className="sbar-field">
        <motion.span
          key={settleKey ?? 'static'}
          className={hasText ? 'sbar-text' : 'sbar-text is-ph'}
          initial={settleKey != null ? { y: 1, opacity: 0.85 } : false}
          animate={{ y: 0, opacity: 1 }}
          transition={spring.press}
        >
          {hasText ? value : state === 'typing' ? '' : placeholder}
        </motion.span>
        {state === 'typing' && <span className="sbar-caret" aria-hidden="true" />}
        {state === 'typing' && !hasText && <span className="sbar-text is-ph sbar-ph-after">{placeholder}</span>}
      </motion.div>

      {trailing !== 'none' && (
        <motion.div layout="position" transition={spring.morph} className="sbar-trail">
          {trailing === 'camera' && <Icon name="camera" size={24} color="var(--text-primary)" />}
          {trailing === 'clear' && (
            <button type="button" className="sbar-clear" aria-label="Clear"
              onClick={(e) => { e.stopPropagation(); onClear?.(); }}>
              <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden="true">
                <path d="M1 1l6 6M7 1L1 7" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
});
export default SearchBar;
