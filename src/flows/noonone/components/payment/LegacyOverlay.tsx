import { animate, motion, useMotionValue } from 'motion/react';
import { createContext, useCallback, useContext, useEffect, useRef, type ReactNode } from 'react';
import closeOverlayIcon from '@assets/vip/close-overlay.webp';
import { useNav } from '../../../../kit/Navigator';
import { paymentTokens } from '../../tokens';
import styles from './LegacyOverlay.module.css';

const { legacyOverlay: o } = paymentTokens;

const Ctx = createContext<{ close: (then?: () => void) => void }>({ close: () => {} });
/** close the enclosing <LegacyOverlay> (Overlay ref.close()) */
export const useLegacyOverlay = () => useContext(Ctx);

/**
 * Port of src/components/Overlay — the pre-OverlayBottomSheet sheet still used by VIPAddCardOverlayScreen,
 * VIPAddCvvOverlayScreen and VIPMobilePayOverlayScreen (bounceMargin 0): scrim rgba(30,30,30,0→0.7) over 250ms
 * ease-in-out, sheet springs up from 300px (Animated.spring tension 40), closes 250ms ease-in-out to its height,
 * 37px white close button 18px above the top-right corner (or `renderCloseButton`). No handle / drag.
 */
export function LegacyOverlay({ children, className, renderCloseButton, canBeClosed = true }: { children: ReactNode; className?: string; renderCloseButton?: (close: () => void) => ReactNode; canBeClosed?: boolean }) {
  const nav = useNav();
  const y = useMotionValue<number>(o.enterFrom);
  const scrim = useMotionValue<number>(0);
  const sheetRef = useRef<HTMLDivElement>(null);
  const closing = useRef(false);

  useEffect(() => {
    const a = animate(scrim, 1, { duration: o.ms / 1000, ease: o.ease });
    const b = animate(y, 0, o.spring);
    return () => {
      a.stop();
      b.stop();
    };
  }, [scrim, y]);

  const close = useCallback(
    (then?: () => void) => {
      if (closing.current) return;
      closing.current = true;
      const t = { duration: o.ms / 1000, ease: o.ease };
      animate(scrim, 0, t);
      animate(y, sheetRef.current?.offsetHeight ?? o.enterFrom, t).then(() => {
        nav.back();
        then?.();
      });
    },
    [nav, scrim, y],
  );

  return (
    <Ctx.Provider value={{ close }}>
      <div className={styles.root}>
        <motion.div className={styles.scrim} style={{ opacity: scrim }} />
        <div className={styles.empty} onClick={() => canBeClosed && close()} />
        <motion.div ref={sheetRef} className={[styles.sheet, className].filter(Boolean).join(' ')} style={{ y }}>
          <div className={styles.children}>{children}</div>
          {renderCloseButton ? (
            renderCloseButton(() => close())
          ) : (
            <button type="button" className={`nk-pressable ${styles.close}`} onClick={() => close()} aria-label="Close">
              <img src={closeOverlayIcon} alt="" className={styles.closeIcon} />
            </button>
          )}
        </motion.div>
      </div>
    </Ctx.Provider>
  );
}
