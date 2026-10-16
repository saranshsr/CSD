import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { Pressable } from '../../../components';
import { useNav } from '../../../kit/Navigator';
import { tween } from '../../../motion/presets';
import cardArt from '@assets/home/2025/ticker/card.webp';
import glowLeft from '@assets/home/2025/ticker/glow-left.svg';
import glowRight from '@assets/home/2025/ticker/glow-right.svg';
import notch from '@assets/home/2025/ticker/notch.svg';
import dot from '@assets/home/2025/ticker/dot.svg';
import dotActive from '@assets/home/2025/ticker/dot-active.svg';
import { tickerInterval, tickerMessages } from '../data.header';
import styles from './PromoTicker.module.css';
import { useReduceMotion } from '../../../motion/reducedMotion';

/** The pager shows 3 dots for any count: first message → dot 1, last → dot 3, everything between → dot 2. */
const dotFor = (i: number, n: number) => (i === 0 ? 0 : i === n - 1 ? 2 : 1);

/**
 * Cashback ticket strip (Figma 1337:5131): 62 tall, r12, white with peach / pink glows, 12pt notches half off both
 * edges, card artwork rotated −46.66°, centred copy (20/24 Bold over 12/14 Medium) and an "n/N" pager over 3 dots.
 * Auto-rotates the messages (`AnimatePresence popLayout`, y 8 → 0, `tween('fast', 'out')`), paused while pressed.
 */
export function PromoTicker() {
  const nav = useNav();
  const [i, setI] = useState(0);
  const [held, setHeld] = useState(false);
  const reduce = useReduceMotion();
  const n = tickerMessages.length;
  const m = tickerMessages[i];

  useEffect(() => {
    // reduced motion: the first message stays (no auto-rotation)
    if (held || reduce) return;
    const t = setInterval(() => setI((x) => (x + 1) % n), tickerInterval);
    return () => clearInterval(t);
  }, [held, n, reduce]);

  const swap = { initial: { y: 8, opacity: 0 }, animate: { y: 0, opacity: 1 }, exit: { y: -8, opacity: 0 }, transition: tween('fast', 'out') };
  const active = dotFor(i, n);

  return (
    <div className={styles.wrap}>
      <Pressable
        className={styles.ticket}
        onClick={() => nav.push('plp/listing', { query: m.query })}
        onPointerDown={() => setHeld(true)}
        onPointerUp={() => setHeld(false)}
        onPointerLeave={() => setHeld(false)}
        scale={0.98}
        aria-label={`${m.title} ${m.subtitle}`}
      >
        <span className={styles.glows} aria-hidden>
          <span className={styles.glowRight}>
            <span className={styles.glowRightShape}>
              <span className={styles.glowRightPad}>
                <img src={glowRight} alt="" />
              </span>
            </span>
          </span>
          <span className={styles.glowLeft}>
            <span className={styles.glowLeftShape}>
              <span className={styles.glowLeftPad}>
                <img src={glowLeft} alt="" />
              </span>
            </span>
          </span>
        </span>
        <img className={styles.notchStart} src={notch} alt="" />
        <img className={styles.notchEnd} src={notch} alt="" />

        <span className={styles.body}>
          <span className={styles.row}>
            <span className={styles.copy}>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span key={i} className={styles.copyInner} {...swap}>
                  <span className={styles.title}>{m.title}</span>
                  <span className={styles.subtitle}>{m.subtitle}</span>
                </motion.span>
              </AnimatePresence>
            </span>
            <span className={styles.pager}>
              <span className={styles.count}>
                {i + 1}/{n}
              </span>
              <span className={styles.dots}>
                {[0, 1, 2].map((d) => (
                  <img key={d} src={d === active ? dotActive : dot} alt="" width={4} height={4} />
                ))}
              </span>
            </span>
          </span>
        </span>

        <span className={styles.art} aria-hidden>
          <img src={cardArt} alt="" />
        </span>
      </Pressable>
    </div>
  );
}
