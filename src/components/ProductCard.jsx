import { useState } from 'react';
import { motion, useMotionValue, animate } from 'motion/react';
import Pressable from './Pressable.jsx';
import Icon from './Icon.jsx';
import { spring } from '../motion.js';
import './ProductCard.css';

// Values from Figma DS "Product card / PLP Default" (2323:154300), 170.5 wide.
const VARIANTS = ['#f43333', '#05af25', '#0076ff'];
const DOTS = [6, 6, 4, 2]; // page-control dot sizes; first is active

const stop = (e) => e.stopPropagation();
// Noontree's "dhm" → dirham ligature is suppressed by non-zero letter-spacing, so isolate it.
const D = <span className="pc-dhm">dhm</span>;
const money = (t = '') => t.split('dhm').flatMap((part, i) => (i ? [<span key={i} className="pc-dhm">dhm</span>, part] : [part]));

function Wishlist() {
  const [on, setOn] = useState(false);
  const scale = useMotionValue(1);
  const toggle = (e) => {
    e.stopPropagation();
    setOn((v) => !v);
    // small spring pop: an outward velocity impulse that settles back to 1 (interruptible)
    animate(scale, 1, { ...spring.press, velocity: on ? -6 : 14 });
  };
  return (
    <motion.button type="button" className="pc-wish" aria-label="Wishlist" aria-pressed={on}
      onPointerDown={stop} onClick={toggle} whileTap={{ scale: 0.85 }} transition={spring.press}>
      <motion.svg width="16" height="16" viewBox="0 0 16 16" style={{ scale }} aria-hidden="true">
        <path
          d="M8 13.6s-5.6-3.2-5.6-7.2A3 3 0 0 1 8 4.6a3 3 0 0 1 5.6 1.8c0 4-5.6 7.2-5.6 7.2z"
          fill={on ? '#f43333' : '#ffffff'} stroke={on ? '#f43333' : '#475067'} strokeWidth="1"
          strokeLinejoin="round" style={{ transition: 'fill 120ms, stroke 120ms' }}
        />
      </motion.svg>
    </motion.button>
  );
}

export default function ProductCard({ product: p, onTap }) {
  return (
    <Pressable as="div" className="pc" onTap={onTap}>
      <div className="pc-top">
        <div className="pc-img">
          <img src={p.img} alt="" draggable={false} />
          {p.bestSeller && <div className="pc-tag">Best Seller</div>}
          <Wishlist />
          <div className="pc-variants" aria-hidden="true">
            <div className="pc-swatches">
              {VARIANTS.map((c) => <span key={c} style={{ background: c }} />)}
            </div>
            <span className="pc-vcount">4</span>
          </div>
          <div className="pc-dots" aria-hidden="true">
            {DOTS.map((s, i) => <span key={i} className={i === 0 ? 'is-on' : ''} style={{ width: s, height: s }} />)}
          </div>
          <Pressable className="pc-atc" aria-label="Add to cart" onPointerDown={stop} onTap={stop}>
            <Icon name="plus" size={24} color="#101628" />
          </Pressable>
        </div>
        {p.megaDeal && <div className="pc-deal">Mega Deal</div>}
      </div>

      <div className="pc-bottom">
        <div className="pc-head">
          <div className="pc-name">{p.name}</div>
          <div className="pc-rating">
            <Icon name="star" size={12} color="#42bd4c" />
            <span><b>{p.rating}</b> <i>({p.count})</i></span>
          </div>
        </div>

        <div className="pc-pricing">
          <div className="pc-price">
            <span className="pc-sell">{D}{p.price}</span>
            {p.was && <span className="pc-was">{p.was}</span>}
            {p.off && <span className="pc-off">{p.off}</span>}
          </div>
          {p.size && (
            <div className="pc-qty">
              <span>{p.size}</span><span className="pc-qty-sep" /><span>{money(p.unit)}</span>
            </div>
          )}
          <div className="pc-nudge">
            <Icon name="arrow-down-circle" size={14} color="#de1c1c" />
            <span>Lowest price in 30 days</span>
          </div>
        </div>

        {p.coupon && (
          <div className="pc-coupons">
            <span className="pc-cpn">Extra 10% Off</span>
            <span className="pc-cpn">+3</span>
          </div>
        )}

        <div className="pc-eta">
          <Icon name="bolt" size={13} color="#ffffff" />
          <span>Get in <b>1 Hr 15 Min</b></span>
          <svg width="13" height="13" viewBox="0 0 13 13" aria-hidden="true"><path d="M5 3.6 8.6 6.5 5 9.4z" fill="#fff" stroke="#fff" strokeWidth="1" strokeLinejoin="round" /></svg>
        </div>
      </div>
    </Pressable>
  );
}
