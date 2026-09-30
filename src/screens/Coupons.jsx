import { useEffect, useRef, useState } from 'react';
import { motion, useAnimationControls, useReducedMotion } from 'motion/react';
import Pressable from '../components/Pressable.jsx';
import { spring, HIGHLIGHT } from '../motion.js';
import './Coupons.css';

// 02/03 Coupons tray — one tall @3x image stitched from Figma 2333:363127 (top, redeem 2333:363134)
// and 2333:370512 (scrolled, redeem 2333:370519, BEAUTY10 edit). 375 CSS px wide, grey #F2F3F7 bg.
// Content y = Figma frame-03 y + 273. The list ends after the "Buy 2 Get 1 Free" coupon
// (the "Payment offer" tail in Figma is clipped in the source and can't be exported).
const IMG = { src: '/assets/screens/coupons-sheet.png', w: 375, h: 1027 };
const CARD = { x: 24, y: 585, w: 327, h: 237 };     // BEAUTY10 coupon (2333:377284)
const SHOP = { x: 267, y: 687, w: 84, h: 40 };      // "Shop more" label 279,699 60×16 (2333:377291), padded tap target
// The label's visible ink (text plus dotted underline), relative to SHOP. iOS text buttons dim their
// text on press, so a veil of the card's own cream (#FFFAF5) over exactly this box shows the text at ≈55%.
const INK = { left: 278 - 267, top: 700 - 687, w: 61, h: 16 };
const OPEN_DELAY = 350;

function scrollParent(el) {
  for (let p = el?.parentElement; p; p = p.parentElement) {
    const oy = getComputedStyle(p).overflowY;
    if ((oy === 'auto' || oy === 'scroll') && p.scrollHeight > p.clientHeight) return p;
  }
  return null;
}

export default function Coupons({ nav, open: openProp }) {
  const open = openProp ?? nav?.sheetOpen ?? true;
  const rootRef = useRef(null);
  const cardRef = useRef(null);
  const ring = useAnimationControls();
  const [pressed, setPressed] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    // One soft glow, not a pulse. It eases on, holds briefly, then fades slowly. Opacity only, no scale.
    const glow = async () => {
      if (cancelled) return;
      await ring.start({ opacity: 1, transition: spring.glowIn });
      if (!cancelled) ring.start({ opacity: 0, transition: { ...spring.glowOut, delay: 0.5 } });
    };
    // No guided scroll: the user scrolls naturally. The glow plays once,
    // the first time the BEAUTY10 card comes fully into view.
    let io;
    const t = setTimeout(() => {
      const card = cardRef.current;
      if (!card) return;
      io = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.intersectionRatio >= 0.9)) { io.disconnect(); if (!reduce) glow(); }
      }, { root: scrollParent(rootRef.current), threshold: [0.9] });
      io.observe(card);
    }, OPEN_DELAY);
    return () => { cancelled = true; clearTimeout(t); io?.disconnect(); ring.stop(); };
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const onShopMore = () => nav.closeSheet(() => nav.push('plp', {}, { transition: 'push' }));

  return (
    <div className="coupons-sheet" ref={rootRef}>
      <div className="coupons-canvas" style={{ height: IMG.h }}>
        <img className="coupons-shot" src={IMG.src} width={IMG.w} height={IMG.h} alt="Coupons & offers" draggable={false} />

        {/* BEAUTY10 card: a soft glow that plays once (see the effect above) */}
        <div ref={cardRef} className="coupons-card" style={{ left: CARD.x, top: CARD.y, width: CARD.w, height: CARD.h }}>
          <motion.div className="coupons-card-ring" initial={{ opacity: 0 }} animate={ring} />
        </div>

        {/* iOS text-button press: the label dims on touch-down (no delay, no scale, no focus ring) */}
        <Pressable
          feedback="none"
          className="coupons-shopmore"
          aria-label="Shop more — BEAUTY10"
          style={{ left: SHOP.x, top: SHOP.y, width: SHOP.w, height: SHOP.h }}
          onPressChange={setPressed}
          onTap={onShopMore}
        >
          <motion.span className="coupons-shopmore-hl" initial={false}
            style={{ left: INK.left, top: INK.top, width: INK.w, height: INK.h }}
            animate={{ opacity: pressed ? 1 : 0 }} transition={pressed ? HIGHLIGHT.in : HIGHLIGHT.out} />
        </Pressable>
      </div>
    </div>
  );
}
