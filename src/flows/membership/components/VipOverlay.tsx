import { animate, motion, useMotionValue, type PanInfo } from 'motion/react';
import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { useNav } from '../../../kit/Navigator';
import { membershipMotion as m } from '../tokens';
import styles from './VipOverlay.module.css';

export interface VipOverlayApi {
  /** animate out (OverlayBottomSheet.animateClose), pop the overlay, then run `after` (e.g. push the next screen) */
  close: (after?: () => void) => void;
}

const OverlayCtx = createContext<VipOverlayApi | null>(null);

/** close() of the nearest <VipOverlay> (falls back to nav.back outside one). */
export function useVipOverlay(): VipOverlayApi {
  const nav = useNav();
  return useContext(OverlayCtx) ?? { close: (after) => (nav.back(), after?.()) };
}

/**
 * VIPOverlayBottomSheet → OverlayBottomSheet (src/components/OverlayBottomSheet). Full-width sheet with all four
 * corners at 18 and `overlayBottomSpacing()` (12 + safe-area) below it, a 36×4 #B7B7B7 handle 18px above the sheet,
 * rgba(30,30,30,.7) backdrop (350ms inOut ease), spring open from `startY` (mass 1, stiffness 110, damping 15),
 * timing close (350ms), drag down to dismiss past min(h × 0.5, 250px) or 2000px/s.
 *
 *   variant 'sheet'  — VIPOverlayBottomSheet default
 *   variant 'popup'  — OverlayBottomSheet isPopup (centred, margin 20, radius 10, enters from screen centre)
 */
export function VipOverlay({
  children,
  variant = 'sheet',
  canBeClosed = true,
  onDismiss,
  startY = m.sheetStartY,
  className,
  style,
  childrenClassName,
  childrenStyle,
  hideHandle,
}: {
  children: ReactNode | ((api: VipOverlayApi) => ReactNode);
  variant?: 'sheet' | 'popup';
  canBeClosed?: boolean;
  /** onDismiss — backdrop tap / drag / handle (and close() unless called with skipDismiss) */
  onDismiss?: () => void;
  /** animationArbitraryHeight — sheet starts this far below its resting position */
  startY?: number;
  /** contentContainerStyle */
  className?: string;
  style?: CSSProperties;
  /** childrenContainerStyle */
  childrenClassName?: string;
  childrenStyle?: CSSProperties;
  hideHandle?: boolean;
}) {
  const nav = useNav();
  const sheetRef = useRef<HTMLDivElement>(null);
  const height = useRef(startY);
  const y = useMotionValue(startY);
  const backdrop = useMotionValue(0);
  const closing = useRef(false);

  useLayoutEffect(() => {
    if (sheetRef.current) height.current = sheetRef.current.offsetHeight;
    if (variant === 'popup') y.set(window.innerHeight * 0.5 + height.current * 0.5);
  }, [variant, y]);

  useEffect(() => {
    const a = animate(y, 0, m.sheetSpring);
    const b = animate(backdrop, 1, m.sheetTiming);
    return () => {
      a.stop();
      b.stop();
    };
  }, [y, backdrop]);

  const close = useCallback<VipOverlayApi['close']>(
    (after) => {
      if (closing.current) return;
      closing.current = true;
      const to = variant === 'popup' ? (sheetRef.current?.parentElement?.offsetHeight ?? 800) * 0.5 + height.current * 0.5 : height.current;
      animate(backdrop, 0, m.sheetTiming);
      animate(y, to, m.sheetTiming).then(() => {
        nav.back();
        after?.();
      });
    },
    [backdrop, nav, variant, y],
  );

  const dismiss = useCallback(() => {
    if (!canBeClosed) return;
    onDismiss?.();
    close();
  }, [canBeClosed, close, onDismiss]);

  const onDrag = (_: unknown, info: PanInfo) => {
    const ty = Math.max(info.offset.y, 0);
    backdrop.set(Math.min(1 - ty / Math.max(height.current, 1), 1));
  };
  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (canBeClosed && (info.offset.y > Math.min(height.current * m.closeRatio, m.maxCloseDistance) || info.velocity.y > m.closeVelocity)) {
      dismiss();
      return;
    }
    animate(y, 0, m.sheetTiming);
    animate(backdrop, 1, m.sheetTiming);
  };

  const api = { close };
  return (
    <OverlayCtx.Provider value={api}>
      <div className={styles.root} data-variant={variant}>
        <motion.div className={styles.backdrop} style={{ opacity: backdrop }} onClick={dismiss} />
        <motion.div
          ref={sheetRef}
          className={[styles.sheet, className].filter(Boolean).join(' ')}
          style={{ y, ...style }}
          drag={canBeClosed ? 'y' : false}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0, bottom: 1 }}
          dragMomentum={false}
          onDrag={onDrag}
          onDragEnd={onDragEnd}
        >
          {!hideHandle && variant === 'sheet' && (
            <div className={styles.handleZone}>
              <button type="button" className={styles.handle} aria-label="Close" disabled={!canBeClosed} onClick={dismiss} />
            </div>
          )}
          <div className={[styles.children, childrenClassName].filter(Boolean).join(' ')} style={childrenStyle}>
            {typeof children === 'function' ? children(api) : children}
          </div>
        </motion.div>
      </div>
    </OverlayCtx.Provider>
  );
}
