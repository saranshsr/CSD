import { forwardRef, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import Icon from './Icon.jsx';
import { spring } from '../motion.js';
import './SearchBar.css';

// SearchBar — shared element for the PLP → Search morph (layoutId="search-bar").
// Only the container carries layoutId; inner rows use layout="position" so text and icons
// are counter-scaled and never stretch while the container morphs.
//
// state="typing" = first responder (UITextField editing):
//  - caret: 2px #0f7eff, solid while keys are landing, starts blinking 500ms after the last edit
//    (pass a changing `activity` value on every edit). `focused={false}` hides it (keyboard dismissed).
//  - `selected`: the whole value is selected (iOS select-all on focus) → selection tint, no caret.
//  - text never animates per letter (iOS doesn't); the field keeps the caret end in view.
const CARET_IDLE_MS = 500;

const SearchBar = forwardRef(function SearchBar(
  { layoutId, value = '', placeholder = 'Search', state = 'placeholder', onBack, onTap, onClear, trailing = 'camera',
    activity, focused = true, selected = false, style, className },
  ref,
) {
  const hasText = value && value.length > 0;
  const editing = state === 'typing';
  const fieldRef = useRef(null);

  const [solid, setSolid] = useState(false);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return undefined; }
    setSolid(true);
    const t = setTimeout(() => setSolid(false), CARET_IDLE_MS);
    return () => clearTimeout(t);
  }, [activity]);

  // keep the insertion point visible when the text is wider than the field
  useLayoutEffect(() => {
    const f = fieldRef.current;
    if (editing && f) f.scrollLeft = f.scrollWidth;
  }, [value, editing]);

  const showCaret = editing && focused && !selected;
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

      <motion.div layout="position" transition={spring.morph} className={`sbar-field${editing ? ' is-editing' : ''}`} ref={fieldRef}>
        <span className={`${hasText ? 'sbar-text' : 'sbar-text is-ph'}${selected && hasText ? ' is-selected' : ''}`}>
          {hasText ? value : editing ? '' : placeholder}
        </span>
        {showCaret && <span className={`sbar-caret${solid ? ' is-solid' : ''}`} aria-hidden="true" />}
        {editing && !hasText && <span className="sbar-text is-ph sbar-ph-after">{placeholder}</span>}
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
