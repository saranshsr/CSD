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

export default function CouponCard({ coupon = defaultCoupon, cta = 'View all', onTap, initial, animate, transition, className = '', popIcon = null }) {
  const reduce = !!useReducedMotion();
  const { pressed, handlers, shouldCommit } = usePress();
  const commit = () => { if (shouldCommit()) onTap && onTap(); };
  const pressT = pressed ? spring.pressIn : spring.pressOut;

  return (
    <motion.div
      role="button" tabIndex={0}
      className={`cc ${pressed ? 'cc--hl' : ''} ${className}`}
      initial={initial}
      animate={{ ...(animate || {}), scale: pressed && !reduce ? CARD_SCALE : 1 }}
      transition={{ ...(transition || {}), scale: pressT }}
      {...handlers}
      onClick={commit}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onTap && onTap(); } }}
    >
      <div className="cc__tile">
        {/* one small pop of the % badge as the nudge arrives (skipped when popIcon is null) */}
        <motion.span style={{ display: 'grid' }}
          initial={popIcon != null ? { scale: 0.4, rotate: -30, opacity: 0 } : false}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ ...SPR.pop, delay: popIcon ?? 0, opacity: { duration: 0.12, delay: popIcon ?? 0 } }}>
          <Icon name="discount" size={22} color="#0f8857" />
        </motion.span>
      </div>
      <div className="cc__body">
        <div className="cc__title">{coupon.title}</div>
        <div className="cc__meta">
          <span className="cc__code">{coupon.code}</span>
          <span className="cc__items">{coupon.items}</span>
        </div>
      </div>
      <div className="cc__cta">
        <span>{cta}</span>
        <Icon name="chevron-right" size={12} color="#0f61ff" />
      </div>
    </motion.div>
  );
}
