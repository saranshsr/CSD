import { animate, motion, useDragControls, useMotionValue, type PanInfo } from 'motion/react';
import { createContext, useCallback, useContext, useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { useNav } from '../../../kit/Navigator';
import { baseTokens } from '../tokens';
import styles from './VIPOverlay.module.css';

const { overlay: o } = baseTokens;

interface OverlayCtx {
  /** OverlayBottomSheet ref.close(): animate out, then dismiss the overlay (nav.back) and run `then` */
  close: (then?: () => void) => void;
}
const Ctx = createContext<OverlayCtx>({ close: () => {} });
/** close the enclosing <VIPOverlay> with its exit animation */
export const useVipOverlay = () => useContext(Ctx);

export interface VIPOverlayProps {
  children: ReactNode;
  /** OverlayBottomSheet isPopup — centred card (r10, 20px side inset) */
  popup?: boolean;
  /** OverlayBottomSheet isFloating — r16 card, 12px side inset */
  floating?: boolean;
  /** canBeClosed (scrim tap / drag / handle) */
  canBeClosed?: boolean;
  /** VIP contentContainerStyle (e.g. defaultPopup: marginHorizontal 12) */
  sheetClassName?: string;
  sheetStyle?: CSSProperties;
  /** VIP childrenContainerStyle */
  childrenClassName?: string;
  /** onDismiss */
  onDismiss?: () => void;
  /** renderCustomHandle={() => null} */
  hideHandle?: boolean;
}

/**
 * Port of VIPOverlayBottomSheet (features/vip/components) over OverlayBottomSheet (src/components): scrim
 * rgba(30,30,30,.7) fading in over 350ms ease-in-out, the sheet springing up from 300px below (damping 15,
 * stiffness 110), 36×4 handle 18px above the card, drag/scrim/handle to close (350ms ease-in-out back down).
 * Register the screen with `presentation: 'modal', transition: 'noonone-overlay'` so the page underneath stays visible.
 */
export function VIPOverlay({ children, popup, floating, canBeClosed = true, sheetClassName, sheetStyle, childrenClassName, onDismiss, hideHandle }: VIPOverlayProps) {
  const nav = useNav();
  const drag = useDragControls();
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
      const el = sheetRef.current;
      const h = el?.offsetHeight ?? o.enterFrom;
      const parentH = el?.parentElement?.offsetHeight ?? h;
      // contentHeight (+ the float gap below the card, which RN keeps inside the sheet's margin)
      const to = popup ? parentH * o.popupCenter + h * o.popupCenter : parentH - (el?.offsetTop ?? 0);
      const t = { duration: o.ms / 1000, ease: o.ease };
      animate(scrim, 0, t);
      animate(y, to, t).then(() => {
        onDismiss?.();
        nav.back();
        then?.();
      });
    },
    [nav, onDismiss, popup, scrim, y],
  );

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const h = sheetRef.current?.offsetHeight ?? 0;
    if (canBeClosed && (info.offset.y > Math.min(h * o.closeRatio, o.closeMax) || info.velocity.y > o.closeVelocity)) close();
    else animate(y, 0, { duration: o.ms / 1000, ease: o.ease });
  };

  return (
    <Ctx.Provider value={{ close }}>
      <div className={[styles.root, popup && styles.popupRoot, floating && styles.floatingRoot].filter(Boolean).join(' ')}>
        <motion.div className={styles.scrim} style={{ opacity: scrim }} />
        <div className={styles.empty} onClick={() => canBeClosed && close()} />
        <motion.div
          ref={sheetRef}
          className={[styles.sheet, popup && styles.popup, floating && styles.floating, sheetClassName].filter(Boolean).join(' ')}
          style={{ y, ...sheetStyle }}
          drag={canBeClosed ? 'y' : false}
          dragControls={drag}
          dragListener={false}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0, bottom: 1 }}
          onDragEnd={onDragEnd}
        >
          {!hideHandle && (
            <div className={styles.handleZone} onPointerDown={(e) => canBeClosed && drag.start(e)} onClick={() => canBeClosed && close()}>
              <div className={styles.handle} />
            </div>
          )}
          <div className={[styles.children, childrenClassName].filter(Boolean).join(' ')}>{children}</div>
        </motion.div>
      </div>
    </Ctx.Provider>
  );
}
