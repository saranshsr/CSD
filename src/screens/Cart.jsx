import { useState } from 'react';
import { motion } from 'motion/react';
import Pressable from '../components/Pressable.jsx';
import { spring } from '../motion.js';
import './Cart.css';

// 01 Cart — full-bleed @3x export of Figma 2333:98074 (status bar + bottom nav baked in;
// the image's home indicator is painted out because DeviceFrame draws its own).
// Hotspot: "View all coupons & offers" row = node 2333:98173 "Price Description Container".
const ROW = { x: 12, y: 427, w: 351, h: 54 };

export default function Cart({ nav }) {
  const [pressed, setPressed] = useState(false);
  const up = () => setPressed(false);
  return (
    <div className="cart-screen">
      <img className="cart-shot" src="/assets/screens/cart.png" width={375} height={812} alt="Cart" draggable={false} />
      <Pressable
        className="cart-hotspot"
        aria-label="View all coupons & offers"
        style={{ left: ROW.x, top: ROW.y, width: ROW.w, height: ROW.h }}
        onPointerDown={() => setPressed(true)}
        onPointerUp={up} onPointerCancel={up} onPointerLeave={up}
        onTap={() => nav.openSheet()}
      >
        <motion.span
          className="cart-hotspot-hl"
          initial={false}
          animate={{ opacity: pressed ? 1 : 0 }}
          transition={spring.press}
        />
      </Pressable>
    </div>
  );
}
