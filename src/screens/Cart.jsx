import { useState } from 'react';
import { motion } from 'motion/react';
import './Cart.css';

// 01 Cart — full-bleed @3x export of Figma 2333:98074 (status bar + bottom nav baked in;
// the image's home indicator is painted out because DeviceFrame draws its own).
// "View all coupons & offers" row = node 2333:98173 (x12 y427 351×54). Its top 12px sits under
// the white "Got a coupon?" card, so the visible strip is y439→481 with the coupon card's
// 16px bottom corners — the pressed tint covers exactly that strip.
const HIT = { x: 12, y: 427, w: 351, h: 54 };      // generous tap target (whole row)
// Exact visible shape of the row, in HIT coords shifted down 4px (the white card's 16px bottom
// corners start 4px above the row): top edge follows the white card's corner curves, bottom
// follows the coupon card's 16px corners.
const SHAPE = 'M0 0 A16 16 0 0 0 16 16 H335 A16 16 0 0 0 351 0 V42 A16 16 0 0 1 335 58 H16 A16 16 0 0 1 0 42 Z';

export default function Cart({ nav }) {
  const [pressed, setPressed] = useState(false);
  const up = () => setPressed(false);
  return (
    <div className="cart-screen">
      <img className="cart-shot" src="/assets/screens/cart.png" width={375} height={812} alt="Cart" draggable={false} />
      {/* iOS table-row press: tint appears on touch-down (no delay), no scale, no focus ring */}
      <button
        type="button"
        className="cart-hotspot"
        aria-label="View all coupons & offers"
        style={{ left: HIT.x, top: HIT.y, width: HIT.w, height: HIT.h }}
        onPointerDown={() => setPressed(true)}
        onPointerUp={up} onPointerCancel={up} onPointerLeave={up}
        onClick={() => nav.openSheet()}
      >
        <motion.svg
          className="cart-hotspot-hl" width={HIT.w} height={HIT.h + 4} viewBox={`0 0 ${HIT.w} ${HIT.h + 4}`} aria-hidden
          initial={false}
          animate={{ opacity: pressed ? 1 : 0 }}
          transition={pressed ? { duration: 0 } : { duration: 0.18, ease: 'easeOut' }}
        >
          <path d={SHAPE} fill="rgba(29,37,57,0.08)" />
        </motion.svg>
      </button>
    </div>
  );
}
