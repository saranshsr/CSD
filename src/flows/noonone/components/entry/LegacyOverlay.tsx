import { animate, motion, useMotionValue } from 'motion/react';
import { createContext, useCallback, useContext, useEffect, useRef, type ReactNode } from 'react';
import { useNav } from '../../../../kit/Navigator';
import closeOverlayIcon from '@assets/vip/close-overlay.webp';
import { entryTokens } from '../../tokens';
import styles from './LegacyOverlay.module.css';

const { overlay: o } = entryTokens;

const Ctx = createContext<{ close: (shouldCallDismiss?: boolean, then?: () => void) => void }>({ close: () => {} });
/** Overlay ref.close(shouldCallDismiss = true) */
export const useLegacyOverlay = () => useContext(Ctx);

/**
 * src/components/Overlay: scrim rgba(30,30,30,.7) over 250ms ease-in-out, sheet springing up from 300px
 * (tension 40), white 37px close button 18px above the top-right corner, tap outside / close → 250ms back down.
 * `close()` calls onDismiss right away (as master) unless shouldCallDismiss is false, then pops the overlay.
 */
export function LegacyOverlay({ children, onDismiss, sheetClassName }: { children: ReactNode; onDismiss?: () => void; sheetClassName?: string }) {
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
    (shouldCallDismiss = true, then?: () => void) => {
      if (closing.current) return;
      closing.current = true;
      const h = sheetRef.current?.offsetHeight ?? o.enterFrom;
      const t = { duration: o.ms / 1000, ease: o.ease };
      animate(scrim, 0, t);
      animate(y, h, t).then(() => {
        nav.back();
        if (shouldCallDismiss) onDismiss?.();
        then?.();
      });
    },
    [nav, onDismiss, scrim, y],
  );

  return (
    <Ctx.Provider value={{ close }}>
      <div className={styles.root}>
        <motion.div className={styles.scrim} style={{ opacity: scrim }} />
        <div className={styles.empty} onClick={() => close()} />
        <motion.div ref={sheetRef} className={[styles.sheet, sheetClassName].filter(Boolean).join(' ')} style={{ y }}>
          <button type="button" className={`nk-pressable ${styles.close}`} onClick={() => close()} aria-label="Close">
            <img src={closeOverlayIcon} alt="" />
          </button>
          <div className={styles.children}>{children}</div>
        </motion.div>
      </div>
    </Ctx.Provider>
  );
}
