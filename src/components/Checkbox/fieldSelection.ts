import { animate, useMotionValue, useReducedMotion, useTransform, type MotionValue } from 'motion/react';
import { useEffect, useRef } from 'react';
import { fieldMotion } from '../../motion/presets';

/**
 * Shared driver for the Field M-Checkbox / M-Radio selection (internal, not exported from the package).
 * 0 = off, 1 = on. Select-in `emphasized` 220ms, recede 180ms, `ease.standard`; reduced motion snaps.
 * Outline fades out over [0, .6], fill fades in over [0, .5], tick draws after `delay.beat` (120ms).
 */
export function useFieldSelection(on: boolean) {
  const progress = useMotionValue(on ? 1 : 0);
  const reduced = useReducedMotion();
  const first = useRef(true);
  useEffect(() => {
    const target = on ? 1 : 0;
    if (first.current || reduced) {
      first.current = false;
      progress.set(target);
      return;
    }
    const controls = animate(progress, target, {
      duration: on ? fieldMotion.duration.emphasized : fieldMotion.duration.recede,
      ease: fieldMotion.ease.standard,
    });
    return () => controls.stop();
  }, [on, reduced, progress]);

  const tickStart = fieldMotion.delay.beat / fieldMotion.duration.emphasized;
  const outlineOpacity = useTransform(progress, [0, 0.6], [1, 0], { clamp: true });
  const fillOpacity = useTransform(progress, [0, 0.5], [0, 1], { clamp: true });
  const tickOffset = useTransform(progress, [tickStart, 1], [tickLength, 0], { clamp: true });
  // hide the tick until it starts drawing (a zero-length dash with round caps would leave a dot)
  const tickOpacity = useTransform(progress, (p: number) => (p > tickStart ? 1 : 0));
  return { outlineOpacity, fillOpacity, tickOffset, tickOpacity } as Record<'outlineOpacity' | 'fillOpacity' | 'tickOffset' | 'tickOpacity', MotionValue<number>>;
}

/** Field check tick centreline in the 24×24 viewBox (same for Checkbox and Radio). */
export const tickPath = 'M 8 12 L 10.5 14.5 L 16 9.5';
export const tickLength = 11;
