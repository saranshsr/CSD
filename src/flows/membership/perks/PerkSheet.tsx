import { animate, motion, useMotionValue, type PanInfo } from 'motion/react';
import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, type ReactNode } from 'react';
import { useNav } from '../../../kit/Navigator';
import closeOverlayIcon from '@assets/vip/close-overlay.webp';
import styles from './perks.module.css';

/**
 * The two non-VIP sheet chromes these overlays use on master (VipOverlay covers VIPOverlayBottomSheet only):
 *
 *  kind 'overlay' — src/components/Overlay (VIPReferralsInputOverlay, VIPPartnerOverlay): sheet flush to the bottom
 *    (bounceMargin 0), rgba(30,30,30,.7) backdrop (250ms inOut ease), Animated.spring(tension 40, friction 7 ≈
 *    stiffness 230 / damping 22) from 300px, timing close 250ms; default close = 37px white circle top -18 / right 30
 *    with close-overlay.webp (screens may pass `closeButton`). No drag.
 *  kind 'bottomSheet' — src/components/BottomSheet (@gorhom, VIPYangoCreditsOverlay): black 0.5 backdrop, 36×4 #B7B7B7
 *    handle 18px above, pan-down to close, gorhom default iOS spring (damping 500, stiffness 1000, mass 3, overshoot clamped).
 */
export type PerkSheetApi = { close: (after?: () => void, callDismiss?: boolean) => void };
const Ctx = createContext<PerkSheetApi | null>(null);
export const usePerkSheet = () => useContext(Ctx)!;

const overlaySpring = { type: 'spring', stiffness: 230, damping: 22, mass: 1 } as const;
const overlayTiming = { duration: 0.25, ease: [0.42, 0, 0.58, 1] } as const;
// gorhom iOS default spring (damping 500, stiffness 1000, mass 3, overshootClamping) is heavily overdamped and settles in ~300ms
const gorhomSpring = { duration: 0.3, ease: [0.215, 0.61, 0.355, 1] } as const;
const gorhomClose = { duration: 0.25, ease: [0.42, 0, 0.58, 1] } as const;

export function PerkSheet({
  kind,
  children,
  onDismiss,
  closeButton,
  className,
}: {
  kind: 'overlay' | 'bottomSheet';
  children: ReactNode;
  onDismiss?: () => void;
  /** Overlay renderCloseButton(close) */
  closeButton?: (close: () => void) => ReactNode;
  className?: string;
}) {
  const nav = useNav();
  const sheetRef = useRef<HTMLDivElement>(null);
  const height = useRef(300);
  const y = useMotionValue(kind === 'overlay' ? 300 : 600);
  const backdrop = useMotionValue(0);
  const closing = useRef(false);

  useLayoutEffect(() => {
    if (sheetRef.current) height.current = sheetRef.current.offsetHeight;
    if (kind === 'bottomSheet') y.set(height.current);
  }, [kind, y]);

  useEffect(() => {
    const a = animate(y, 0, kind === 'overlay' ? overlaySpring : gorhomSpring);
    const b = animate(backdrop, 1, overlayTiming);
    return () => {
      a.stop();
      b.stop();
    };
  }, [backdrop, kind, y]);

  const close = useCallback<PerkSheetApi['close']>(
    (after, callDismiss = true) => {
      if (closing.current) return;
      closing.current = true;
      if (callDismiss) onDismiss?.();
      animate(backdrop, 0, overlayTiming);
      animate(y, height.current, kind === 'overlay' ? overlayTiming : gorhomClose).then(() => {
        nav.back();
        after?.();
      });
    },
    [backdrop, kind, nav, onDismiss, y],
  );

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > height.current * 0.3 || info.velocity.y > 800) close();
    else animate(y, 0, gorhomClose);
  };

  return (
    <Ctx.Provider value={{ close }}>
      <div className={styles.sheetRoot} data-kind={kind}>
        <motion.div className={styles.sheetBackdrop} data-kind={kind} style={{ opacity: backdrop }} onClick={() => close()} />
        <motion.div
          ref={sheetRef}
          className={[styles.sheetBody, className].filter(Boolean).join(' ')}
          data-kind={kind}
          style={{ y }}
          drag={kind === 'bottomSheet' ? 'y' : false}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0, bottom: 1 }}
          dragMomentum={false}
          onDragEnd={onDragEnd}
        >
          {kind === 'bottomSheet' && (
            <div className={styles.gorhomHandleZone}>
              <span className={styles.gorhomHandle} />
            </div>
          )}
          {kind === 'overlay' &&
            (closeButton ? (
              closeButton(() => close())
            ) : (
              <button type="button" className={styles.overlayClose} onClick={() => close()} aria-label="Close">
                <img src={closeOverlayIcon} alt="" />
              </button>
            ))}
          <div className={styles.sheetChildren}>{children}</div>
        </motion.div>
      </div>
    </Ctx.Provider>
  );
}
