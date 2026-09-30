import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import Icon from './Icon.jsx';
import { usePress } from './Pressable.jsx';
import { spring, SPR } from '../motion.js';
import { coupon as defaultCoupon } from '../data.js';
import './CouponCard.css';

// Figma: node "card" (343×68) inside 2328:97194 / 2328:97370 / 2328:96704.
// iOS card press: tint + scale 0.98 at touch-down (no delay), commit on release. Moving more than
// TAP_SLOP px cancels. No hold, no input lock.
const CARD_SCALE = 0.98;

// Figma “n5” (2361:152160): the nudge leads with the scoped search — “Search “q”” — and the coupon is the quiet subline.
// docked: S3 (Figma 2366:102476) — hangs off the search bar as one surface; count: S1 live result count.
export default function CouponCard({ coupon = defaultCoupon, query = '', count = null, docked = false, onTap, initial, animate, transition, className = '', popIcon = null }) {
  const reduce = !!useReducedMotion();
  const { pressed, handlers, shouldCommit } = usePress();
  const commit = () => { if (shouldCommit()) onTap && onTap(); };
  const pressT = pressed ? spring.pressIn : spring.pressOut;

  return (
    <motion.div
      role="button" tabIndex={0}
      className={`cc${docked ? ' cc--docked' : ''} ${pressed ? 'cc--hl' : ''} ${className}`}
      initial={initial}
      animate={{ ...(animate || {}), scale: pressed && !reduce ? CARD_SCALE : 1 }}
      transition={{ ...(transition || {}), scale: pressT }}
      {...handlers}
      onClick={commit}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onTap && onTap(); } }}
    >
      <div className="cc__tile">
        {/* one small pop of the search glyph as the nudge arrives (skipped when popIcon is null) */}
        <motion.span style={{ display: 'grid' }}
          initial={popIcon != null ? { scale: 0.5, opacity: 0 } : false}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ ...SPR.pop, delay: popIcon ?? 0, opacity: { duration: 0.12, delay: popIcon ?? 0 } }}>
          <Icon name="search" size={docked ? 18 : 20} color="#1d2539" />
        </motion.span>
      </div>
      <div className="cc__body">
        {docked ? (<>
          <div className="cc__title">Search <b>“{query}”</b> only in eligible items</div>
          <div className="cc__meta"><b>{coupon.code}</b> · extra 10% off{count != null ? <> · <span className="cc__count">{count.toLocaleString('en-US')} results</span></> : null}</div>
        </>) : (<>
          <div className="cc__title">Search <b>“{query}”</b></div>
          <div className="cc__meta">within <b>{coupon.code}</b> eligible items · extra 10% off</div>
        </>)}
      </div>
      <div className="cc__cta" aria-hidden>
        <Icon name="chevron-right" size={12} color="#0f61ff" />
      </div>
    </motion.div>
  );
}
