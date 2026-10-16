import { AnimatePresence, motion, type PanInfo } from 'motion/react';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { returnsTokens } from '../tokens';
import styles from './afs.module.css';

/**
 * src/components/OverlayBottomSheet as used by AFSOverlay / AFSReturnsLegacyOverlay: rgba(30,30,30,.7) backdrop,
 * card inset 12px (bottom = safe area, legacy + 4), r16, #F9F9FB, 36×4 #B7B7B7 handle 18px above the card.
 * Opens with a spring (damping 15 / stiffness 110), closes in 350 ms; tap the backdrop or drag down to close.
 *
 * Render it next to <Screen>; `children(close)` gets a close() that runs the exit animation first.
 */
export function ReturnsOverlay({
  open,
  onClosed,
  children,
  legacy,
  cardClassName,
  contentClassName,
  scroll = true,
  dismissable = true,
}: {
  open: boolean;
  onClosed: () => void;
  children: (close: () => void) => ReactNode;
  /** AFSReturnsLegacyOverlay bottom inset (safe area + 4) */
  legacy?: boolean;
  /** overlayChildren / contentContainerStyle (card background) */
  cardClassName?: string;
  /** scroll content padding (AFSOverlay `style`) */
  contentClassName?: string;
  scroll?: boolean;
  dismissable?: boolean;
}) {
  const [shown, setShown] = useState(open);
  useEffect(() => setShown(open), [open]);
  const close = useCallback(() => setShown(false), []);
  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (dismissable && (info.offset.y > returnsTokens.overlayDragOffset || info.velocity.y > returnsTokens.overlayDragVelocity)) close();
  };
  return (
    <AnimatePresence onExitComplete={onClosed}>
      {shown && (
        <motion.div key="overlay" className={styles.overlayLayer} initial="hidden" animate="shown" exit="hidden">
          <motion.div
            className={styles.overlayScrim}
            variants={{ hidden: { opacity: 0 }, shown: { opacity: 1 } }}
            transition={{ duration: returnsTokens.overlayFadeDuration }}
            onClick={dismissable ? close : undefined}
          />
          <motion.div
            className={[styles.overlayMargin, legacy && styles.overlayMarginLegacy].filter(Boolean).join(' ')}
            variants={{ hidden: { y: '110%', transition: returnsTokens.overlayClose }, shown: { y: 0, transition: returnsTokens.overlaySpring } }}
            drag={dismissable ? 'y' : false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.02, bottom: 0.8 }}
            onDragEnd={onDragEnd}
          >
            <div className={styles.overlayHandle} />
            <div className={[styles.overlayCard, cardClassName].filter(Boolean).join(' ')}>
              <div className={[scroll && 'nk-scroll', styles.overlayContent, contentClassName].filter(Boolean).join(' ')}>{children(close)}</div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
