import { DotLottieReact, type DotLottie } from '@lottiefiles/dotlottie-react';
import { animate, motion, useMotionValue, useMotionValueEvent, useTransform, type PanInfo } from 'motion/react';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import arrowLottie from '@assets/checkout/arrow-to-checkmark-animation-en.json';
import { checkoutJs } from '../tokens';
import styles from './SlideButton.module.css';
import { useReduceMotion } from '../../../motion/reducedMotion';

/**
 * NoonCheckoutSlideButton (bappzaar master, marketplaces/noon/components/NoonCheckoutSlideButton) — production wins
 * over the Checkout 2.0 Figma slider here. Track: gradient #3866DF → #3454A8 (disabled #CED1DA), padding 8,
 * minHeight 48, r14. Thumb: white 60×38 r9 at left 7, holding the arrow-to-checkmark Lottie (48×48, `arrow` keypath
 * tinted #3866DF / #CED1DA) whose progress follows the slide past 62%. Label 16/700 (not upper-cased) centred across
 * the track (left/right 10 inside the masked view); it is a mask over a #7394DE layer (white when disabled) that moves
 * with the thumb (+5), so the text is wiped away as you slide; a ¼-width #7394DE→#DAE3F6→#7394DE shimmer sweeps it
 * every 4s. Idle: pulse 7px ×2 (300ms steps) every 4s, also on tap. Release past 85% (or 65% faster than 500px/s) completes.
 */
/** ENABLED_GRADIENT_COLORS ['#3866DF', '#3454A8'] (reversed in RTL) / DISABLED_GRADIENT_COLORS grayColor */
const TRACK_ENABLED = 'linear-gradient(90deg, var(--nk-color-cta) 0%, var(--nk-color-chk-slide-track-end) 100%)';
const TRACK_DISABLED = 'var(--nk-palette-gray-color)'; // DISABLED_GRADIENT_COLORS #CED1DA
const SLIDE_BUTTON_WIDTH = 60;
const GRADIENT_HORIZONTAL_PADDING = 14;
/** transparentMaskedView left 10 (label coords start 10px into the masked view) */
const LABEL_LEFT = 10;
const SLIDE_SLOW_THRESHOLD = 0.85;
const SLIDE_FAST_THRESHOLD = 0.65;
const SLIDE_LOTTIE_THRESHOLD = 0.62;
const SLIDE_VELOCITY_THRESHOLD = 500;

/** arrow-to-checkmark-animation-en.json with the `arrow` stroke recoloured (lottie colorFilters) */
function tintLottie(hex: string) {
  const rgb = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const clone = JSON.parse(JSON.stringify(arrowLottie));
  const walk = (o: unknown) => {
    if (Array.isArray(o)) o.forEach(walk);
    else if (o && typeof o === 'object') {
      const rec = o as Record<string, unknown>;
      if ((rec.ty === 'st' || rec.ty === 'fl') && rec.c && typeof rec.c === 'object') (rec.c as { k: number[] }).k = [...rgb, 1];
      Object.values(rec).forEach(walk);
    }
  };
  walk(clone);
  return clone;
}

export interface SlideButtonProps {
  disabled: boolean;
  ctaText: string;
  onSlideComplete: () => void;
  /** tapped / dragged while disabled (e.g. 'ENTER CVV') → guide the user to what's missing */
  onDisabledPress?: () => void;
  /** bump to spring the thumb back (ScreenState → SUCCESS after a placed order failed / was cancelled) */
  resetSignal?: number;
}

export function SlideButton({ disabled, ctaText, onSlideComplete, onDisabledPress, resetSignal = 0 }: SlideButtonProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [maxThreshold, setMaxThreshold] = useState(286);
  const x = useMotionValue(0);
  const shimmerX = useMotionValue(0);
  const lottieProgress = useMotionValue(0);
  const lottieRef = useRef<DotLottie | null>(null);
  const shimmerAnim = useRef<ReturnType<typeof animate> | null>(null);
  const done = useRef(false);
  const reduce = useReduceMotion();

  const enabledData = useMemo(() => tintLottie(checkoutJs.slideArrowEnabled), []);
  const disabledData = useMemo(() => tintLottie(checkoutJs.slideArrowDisabled), []);

  useLayoutEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const measure = () => setMaxThreshold(el.clientWidth - (SLIDE_BUTTON_WIDTH + GRADIENT_HORIZONTAL_PADDING));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useMotionValueEvent(lottieProgress, 'change', (p) => {
    const d = lottieRef.current;
    if (d?.totalFrames) d.setFrame(Math.max(0, Math.min(1, p)) * (d.totalFrames - 1));
  });

  const shimmerWidth = maxThreshold / 4;
  const startShimmer = useCallback(() => {
    shimmerAnim.current?.stop();
    shimmerX.set(0.05);
    shimmerAnim.current = animate(shimmerX, maxThreshold, { duration: 4, ease: 'linear', repeat: Infinity, repeatType: 'loop' });
  }, [maxThreshold, shimmerX]);

  const pulse = useCallback(() => {
    animate(x, [x.get(), 7, 0, 7, 0], { duration: 1.2, ease: 'easeInOut', times: [0, 0.25, 0.5, 0.75, 1] });
  }, [x]);

  // nudge every 4s + shimmer while enabled
  useEffect(() => {
    if (disabled) {
      shimmerAnim.current?.stop();
      shimmerX.set(0);
      x.set(0);
      return;
    }
    // reduced motion: no shimmer sweep and no 4s nudge; the slider waits still (dragging is unchanged)
    if (reduce) return;
    startShimmer();
    const id = setInterval(() => !done.current && pulse(), 4000);
    return () => {
      clearInterval(id);
      shimmerAnim.current?.stop();
    };
  }, [disabled, pulse, startShimmer, shimmerX, x, reduce]);

  // resetSlider(): x → 0 (500ms), lottie → 0 (300ms), shimmer restarts
  useEffect(() => {
    if (!resetSignal) return;
    done.current = false;
    animate(x, 0, { duration: 0.5, ease: 'easeInOut' });
    animate(lottieProgress, 0, { duration: 0.3, ease: 'easeInOut' });
  }, [resetSignal, x, lottieProgress]);

  const onSlideEnd = () => {
    done.current = true;
    animate(x, maxThreshold, { duration: 0.2, ease: 'easeInOut' });
    animate(lottieProgress, 1, { duration: 0.1, ease: 'easeInOut' });
    onSlideComplete();
  };

  const onPanStart = () => {
    if (disabled) {
      onDisabledPress?.();
      return;
    }
    if (done.current) return;
    shimmerAnim.current?.stop();
    x.stop();
  };
  const onPan = (_: PointerEvent, info: PanInfo) => {
    if (disabled || done.current) return;
    const tx = info.offset.x;
    if (Math.abs(tx) >= maxThreshold || tx < 0) return;
    const pct = tx / maxThreshold;
    if (pct > SLIDE_LOTTIE_THRESHOLD) lottieProgress.set(pct - SLIDE_LOTTIE_THRESHOLD);
    else lottieProgress.set(0);
    x.set(tx);
  };
  const onPanEnd = (_: PointerEvent, info: PanInfo) => {
    if (disabled || done.current) return;
    const pct = Math.min(1, Math.max(0, info.offset.x / maxThreshold));
    const fast = info.velocity.x > SLIDE_VELOCITY_THRESHOLD;
    if ((pct > SLIDE_FAST_THRESHOLD && fast) || pct > SLIDE_SLOW_THRESHOLD) {
      if (fast) {
        // withDecay({ velocity, clamp: [0, MAX] }) → then onSlideEnd
        animate(x, maxThreshold, { type: 'inertia', velocity: info.velocity.x, min: 0, max: maxThreshold, power: 0.8, bounceStiffness: 1000, bounceDamping: 100 }).then(onSlideEnd);
      } else onSlideEnd();
    } else {
      animate(x, 0, { duration: 0.5, ease: 'easeInOut' });
      animate(lottieProgress, 0, { duration: 0.3, ease: 'easeInOut' });
      startShimmer();
    }
  };

  // masked label: the coloured layer starts at thumb + 5 and carries the shimmer band
  const clip = useTransform(x, (v) => `inset(0 0 0 ${Math.max(0, v + 5 - LABEL_LEFT)}px)`);
  const labelBg = useTransform([x, shimmerX], ([xv, sv]: number[]) => {
    const base = disabled ? 'var(--nk-color-bg-surface)' : 'var(--nk-color-chk-slide-label)';
    const shine = disabled ? 'var(--nk-color-bg-surface)' : 'var(--nk-color-chk-slide-label-shine)';
    // the moving layer starts at x + 5 (masked-view coords) → label coords
    const left = xv + 5 + sv - LABEL_LEFT;
    const a = left + shimmerWidth * 0.3;
    const b = left + shimmerWidth * 0.5;
    const c = left + shimmerWidth * 0.7;
    return `linear-gradient(90deg, ${base} 0px, ${base} ${a}px, ${shine} ${b}px, ${base} ${c}px, ${base} 100%)`;
  });

  return (
    <div
      ref={trackRef}
      className={styles.track}
      style={{ background: disabled ? TRACK_DISABLED : TRACK_ENABLED }}
      onClick={() => (disabled ? onDisabledPress?.() : !done.current && pulse())}
      data-disabled={disabled || undefined}
    >
      <div className={styles.masked}>
        <motion.span className={styles.label} style={{ backgroundImage: labelBg, clipPath: clip }}>
          {ctaText}
        </motion.span>
      </div>
      <motion.div
        className={styles.thumb}
        style={{ x: disabled ? 0.01 : x }}
        onPanStart={onPanStart}
        onPan={onPan}
        onPanEnd={onPanEnd}
        onClick={(e) => {
          e.stopPropagation();
          if (disabled) onDisabledPress?.();
        }}
        role="slider"
        aria-label={ctaText}
        aria-disabled={disabled}
        aria-valuenow={0}
      >
        <DotLottieReact
          key={disabled ? 'off' : 'on'}
          data={disabled ? disabledData : enabledData}
          autoplay={false}
          loop={false}
          className={styles.lottie}
          dotLottieRefCallback={(d) => {
            lottieRef.current = d;
          }}
        />
      </motion.div>
    </div>
  );
}
