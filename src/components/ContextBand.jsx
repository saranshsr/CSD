import { motion } from 'motion/react';
import Pressable from './Pressable.jsx';
import './ContextBand.css';

// H2 context band (Figma section 18, H2 · 01): why you're here + the value. Info only; the ✕ removes it.
// Copy forms after the screen lands (rise), the ✕ dims on touch-down like every icon button.
export default function ContextBand({ code, value, onDismiss, variants, animate }) {
  return (
    <motion.div className="cb" initial="hidden" animate={animate} variants={variants}>
      <div className="cb-copy">
        <div className="cb-title">Shop eligible products</div>
        <div className="cb-sub">
          <span className="cb-tag">{code}</span>
          <span className="cb-value">{value}</span>
        </div>
      </div>
      <Pressable className="cb-x" aria-label="Dismiss" onTap={onDismiss}>
        <span className="cb-x__circle">
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 2l8 8M10 2l-8 8" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" /></svg>
        </span>
      </Pressable>
    </motion.div>
  );
}
