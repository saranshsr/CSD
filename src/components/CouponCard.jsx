import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import Icon from './Icon.jsx';
import { spring } from '../motion.js';
import { coupon as defaultCoupon } from '../data.js';
import './CouponCard.css';

// Figma: node "card" (343×68) inside 2328:97194 / 2328:97370 / 2328:96704.
// Press: scale 0.98 on spring.press. Tap: 120ms highlight so the tap reads, then onTap().
const HIGHLIGHT_MS = 120;

export default function CouponCard({ coupon = defaultCoupon, cta = 'View all', onTap, initial, animate, transition, className = '' }) {
  const [hl, setHl] = useState(false);
  const busy = useRef(false);

  const handleTap = () => {
    if (busy.current) return;
    busy.current = true;
    setHl(true);
    setTimeout(() => { onTap && onTap(); setTimeout(() => { busy.current = false; setHl(false); }, 400); }, HIGHLIGHT_MS);
  };

  return (
    <motion.div
      role="button" tabIndex={0}
      className={`cc ${hl ? 'cc--hl' : ''} ${className}`}
      initial={initial} animate={animate} transition={transition}
      whileTap={{ scale: 0.98, transition: spring.press }}
      onTap={handleTap}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleTap(); } }}
    >
      <div className="cc__tile"><Icon name="discount" size={22} color="#0f8857" /></div>
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
