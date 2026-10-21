import { animate, motion, useMotionValue, useMotionValueEvent, useTransform, type AnimationPlaybackControls } from 'motion/react';
import { forwardRef, useImperativeHandle, useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import { Pressable } from '../../../components';
import { layout } from '../../../foundations/tokens';
import { useStatusBar } from '../../../kit/statusBar';
import { haptic } from '../../../motion/haptics';
import { useReduceMotion } from '../../../motion/reducedMotion';
import { copy } from '../data';
import { useCoupon } from '../couponContext';
import { clamp, project, rubber, velocityTracker } from '../gesture';
import { csTokens } from '../tokens';
import styles from '../search.module.css';

const B = csTokens.band;
const { slop } = csTokens.gesture;
/** the band slot starts here (the closed sheet then puts the bar where the kit's search and results draw it) */
const TOP = layout.statusBar - B.tuck;

export interface BandHeaderHandle {
  /** results hand-off: the band makes way (the sheet rises over it, not a dismissal); returns seconds until the bar is at rest */
  makeWay: () => number;
  /** back from results: the band returns if it was never dismissed */
  comeBack: () => void;
}

/**
 * H2 Context band: a green band (halftone pattern pinned to the top) over the white search sheet. It is part of the
 * screen, final from the first frame. ONE progress value `p` (1 = open) drives the slot height, the sheet corners and
 * the green, so ✕, a drag and a flick are the same path:
 *  · ✕ — the band shifts up and vanishes: the sheet rises over the copy and covers it (the copy only drifts, nothing
 *    clips it); the green's bottom edge stays `lip` under the sheet so the corners sit on green, then wipes up behind
 *    the status bar before the spring's tail. Critically damped, 0.85s, with a haptic tick. The status-bar ink flips
 *    as the green passes under it.
 *  · touch-down on the green mid-close catches it where it is; a drag follows the finger 1:1 (rubber band past open),
 *    and the release projects momentum (decel 0.998) to pick the side, handing its velocity to the spring.
 *  · the white sheet is never a grab area (it belongs to the search bar).
 */
export const BandHeader = forwardRef<BandHeaderHandle, { children: ReactNode; band: boolean; onBand: (band: boolean) => void }>(function BandHeader({ children, band, onBand }, ref) {
  const reduce = useReduceMotion();
  const coupon = useCoupon();
  const bandRef = useRef(band);
  bandRef.current = band;
  const p = useMotionValue(band ? 1 : 0);
  const H = useMotionValue(77);
  const copyRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  // measured, and re-measured whenever the band resizes (fonts landing late, a host frame that resizes: Prism)
  useLayoutEffect(() => {
    const el = copyRef.current;
    if (!el) return;
    const measure = () => { if (el.offsetHeight) H.set(el.offsetHeight); };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [H]);

  const slotH = useTransform(() => Math.max(0, p.get()) * H.get());
  const drift = useTransform(() => -(1 - clamp(p.get(), 0, 1)) * B.drift);
  const copyO = useTransform(() => clamp((p.get() - 0.3) / 0.7, 0, 1));
  const radius = useTransform(p, [B.cornersFrom, 1], [0, B.sheetRadius], { clamp: true });
  const greenH = useTransform(() => {
    const t = clamp(p.get(), 0, 1.4);
    const h = H.get();
    if (t >= B.wipeAt) return TOP + t * h + B.lip;
    return clamp((t - B.goneAt) / (B.wipeAt - B.goneAt), 0, 1) * (TOP + B.wipeAt * h + B.lip);
  });

  // the status-bar ink follows the green actually behind it
  const [tone, setTone] = useState<'light' | 'dark'>(band ? 'light' : 'dark');
  useMotionValueEvent(greenH, 'change', (h) => {
    const next = h > B.inkAt ? 'light' : 'dark';
    setTone((t) => (t === next ? t : next));
  });
  useStatusBar(tone === 'light' ? 'light-top' : tone); // green on top, white page at the bottom: keep the home indicator dark

  const run = useRef<AnimationPlaybackControls | null>(null);
  const move = (to: number, spring: object, velocity = 0, delay = 0) => {
    run.current?.stop();
    if (reduce) {
      p.jump(to);
      run.current = null;
      return;
    }
    run.current = animate(p, to, { ...spring, velocity, delay });
  };

  const dismiss = () => {
    onBand(false);
    haptic('tick');
    move(0, B.close);
  };

  useImperativeHandle(ref, () => ({
    makeWay: () => {
      if (p.get() < 0.02) return 0;
      move(0, B.makeWay);
      return reduce ? 0 : 0.3;
    },
    comeBack: () => {
      if (bandRef.current && p.get() < 0.98) move(1, B.makeWay, 0, B.returnDelay);
    },
  }));

  // ---- gestures: catch, drag, flick ------------------------------------------------------------------------
  const drag = useRef<{ id: number; y0: number; s: number; p0: number; active: boolean; caught: boolean } | null>(null);
  const vt = useRef(velocityTracker());
  const onDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button > 0 || sheetRef.current?.contains(e.target as Node)) return;
    if (!bandRef.current && p.get() < 0.04) return; // fully gone: nothing to grab
    e.preventDefault(); // never take focus from the search field
    const caught = !!run.current && Math.abs(p.getVelocity()) > 0.05;
    if (caught) run.current?.stop(); // stops where it is (the presentation value)
    // the preview may scale the phone: finger travel in screen px → phone px, so the band follows it 1:1
    const el = e.currentTarget;
    drag.current = { id: e.pointerId, y0: e.clientY, s: el.getBoundingClientRect().height / el.offsetHeight || 1, p0: p.get(), active: false, caught };
  };
  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const h = H.get();
    if (!d.active) {
      if (Math.abs(e.clientY - d.y0) / d.s < slop) return;
      d.active = true;
      d.p0 = p.get();
      d.y0 = e.clientY;
      vt.current.reset();
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        /* capture is a nicety */
      }
      return;
    }
    let px = d.p0 * h + (e.clientY - d.y0) / d.s;
    if (px > h) px = h + rubber(px - h, h);
    else if (px < 0) px = 0;
    p.set(px / h);
    vt.current.add(px, e.timeStamp);
  };
  const onUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    if (!d.active) {
      // a tap on a caught band: it carries on to where it was going
      if (d.caught) move(bandRef.current ? 1 : 0, bandRef.current ? B.release : B.close);
      return;
    }
    const h = H.get();
    const v = vt.current.get(e.timeStamp);
    const gone = project(p.get() * h, v) < h / 2;
    if (gone && bandRef.current) {
      onBand(false);
      haptic('tick');
    }
    if (!gone && !bandRef.current) onBand(true); // caught mid-close and pulled back open
    move(gone ? 0 : 1, B.release, v / h);
  };

  return (
    <div className={styles.h2} style={{ paddingTop: TOP }} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
      <motion.div className={styles.h2Green} style={{ height: greenH }} aria-hidden />
      <motion.div className={styles.h2Slot} style={{ height: slotH }}>
        <motion.div ref={copyRef} className={styles.band} style={{ opacity: copyO, y: drift, paddingTop: B.tuck + 8 }}>
          <div className={styles.bandCopy}>
            <span className={styles.bandTitle}>{copy.band.title}</span>
            <span className={styles.bandSub}>
              <span className={styles.codeTag}>{coupon.code}</span>
              <span className={styles.bandValue}>{coupon.bandValue ?? coupon.value}</span>
            </span>
          </div>
          <Pressable className={styles.bandRemove} aria-label={copy.band.dismissLabel} scale={0.95} onClick={dismiss}>
            {copy.band.dismiss}
          </Pressable>
        </motion.div>
      </motion.div>
      <motion.div ref={sheetRef} className={styles.h2Sheet} style={{ borderTopLeftRadius: radius, borderTopRightRadius: radius, paddingTop: B.sheetPad }}>
        {children}
      </motion.div>
    </div>
  );
});
