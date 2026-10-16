import type { Transition } from 'motion/react';
import { supermall } from '../../motion/presets';

const R = supermall.reveal;

/** Page content arriving after the push (motion.md "arrives as page content"): rises `reveal.y`, 30ms apart top → bottom. */
export const reveal = (i: number, on = true) => {
  if (!on) return {};
  const delay = R.delay + i * R.stagger;
  return {
    initial: { opacity: 0, y: R.y },
    animate: { opacity: 1, y: 0 },
    transition: { y: { duration: R.move, ease: supermall.ease.soft, delay }, opacity: { duration: R.fade, ease: supermall.ease.soft, delay } } as Transition,
  };
};

/** chip / tile press dip (`supermall.press`: 96% at 30%, release on `ease.standard`, 340ms) */
export const pressDip = {
  whileTap: { scale: [...supermall.press.scale] },
  transition: { duration: supermall.press.duration, times: [...supermall.press.times], ease: supermall.ease.standard } as Transition,
};
