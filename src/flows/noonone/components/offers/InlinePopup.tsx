import { animate, motion, useMotionValue } from 'motion/react';
import { useEffect, useRef, type ReactNode } from 'react';
import { baseTokens } from '../../tokens';
import styles from './inlinePopup.module.css';

const { overlay: o } = baseTokens;

/**
 * A second VIPGenericOverlayScreen popup (OverlayBottomSheet isPopup) layered over the current overlay without pushing a
 * stack entry: scrim rgba(30,30,30,.7) 350ms, card springs up from 300px, handle above. `closing` animates it out
 * (back down by half screen + half card, 350ms ease-in-out) and then calls `onClosed`.
 */
export function InlinePopup({ children, closing, onClosed, onScrimPress, className }: { children: ReactNode; closing: boolean; onClosed: () => void; onScrimPress?: () => void; className?: string }) {
  const y = useMotionValue<number>(o.enterFrom);
  const scrim = useMotionValue<number>(0);
  const card = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const a = animate(scrim, 1, { duration: o.ms / 1000, ease: o.ease });
    const b = animate(y, 0, o.spring);
    return () => {
      a.stop();
      b.stop();
    };
  }, [scrim, y]);
  useEffect(() => {
    if (!closing) return;
    const h = card.current?.offsetHeight ?? 0;
    const H = card.current?.parentElement?.offsetHeight ?? 0;
    const t = { duration: o.ms / 1000, ease: o.ease };
    animate(scrim, 0, t);
    animate(y, H * o.popupCenter + h * o.popupCenter, t).then(onClosed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closing]);
  return (
    <div className={styles.root}>
      <motion.div className={styles.scrim} style={{ opacity: scrim }} onClick={onScrimPress} />
      <motion.div ref={card} className={[styles.card, className].filter(Boolean).join(' ')} style={{ y }}>
        <div className={styles.handleZone}>
          <div className={styles.handle} />
        </div>
        {children}
      </motion.div>
    </div>
  );
}
