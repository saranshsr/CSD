import { useLayoutEffect } from 'react';
import { motion, MotionConfig, useMotionValue } from 'motion/react';
import './DeviceFrame.css';

export const SCREEN_W = 375;
export const SCREEN_H = 812;
const BEZEL = 12;   // device body around the screen
const MARGIN = 24;  // page margin top/bottom

// DeviceFrame — the 375×812 screen, scaled to fit the window.
// The scale lives on a motion.div (motion value) on purpose: shared-layout (layoutId) measurements
// remove ancestor motion transforms, so morphs stay correct at any scale. A plain CSS transform
// on a non-motion ancestor would distort them.
export default function DeviceFrame({ children, onReset }) {
  const scale = useMotionValue(1);

  useLayoutEffect(() => {
    const fit = () => {
      const s = Math.min(1, (window.innerHeight - MARGIN * 2) / (SCREEN_H + BEZEL * 2),
        (window.innerWidth - MARGIN * 2) / (SCREEN_W + BEZEL * 2));
      scale.set(Math.max(0.3, s));
      document.documentElement.style.setProperty('--device-scale', String(Math.max(0.3, s)));
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [scale]);

  return (
    <MotionConfig reducedMotion="user">
      <div className="df-page">
        {onReset && (
          <button type="button" className="df-reset" onClick={onReset}>
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
              <path d="M2.2 7a4.8 4.8 0 1 0 1.5-3.5M2 1.5v2.8h2.8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Restart
          </button>
        )}
        <motion.div className="df-device" style={{ scale }}>
          <div className="df-screen" data-device-screen>
            {children}
            <div className="df-home" aria-hidden="true" />
          </div>
        </motion.div>
      </div>
    </MotionConfig>
  );
}
