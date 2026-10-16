import { animate, cubicBezier, motion, useMotionValue, useTransform, type MotionValue } from 'motion/react';
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Lottie } from '../../../components';
import greenContainer from '@assets/noonone/entry/checkout-noon-one-green-container.lottie';
import styles from './NoonOneCtaReveal.module.css';

/**
 * marketplaces/noon/components/NoonCheckoutNoonOneSection/NoonOneCtaReveal (bappzaar master) — the first-show reveal
 * of the checkout noon One CTA. One clock (`t`, 0 → 2850ms, linear) starts when the green-container lottie has loaded;
 * every property is derived from it, so nothing drifts:
 *
 *   0      lottie plays (2250); "Save Đ 05" → "Save Đ 15" odometer (VIPAnimatedDigits 400ms, bezier .21 .16 0 1.2),
 *          white text at 34/13 scale on the green container
 *   700    squeeze → 35/13 (200)            1000  expand → 18/13 (800); "Save" bold → regular; the phrase slides left
 *   1500   suffix words fade in one by one (300, linear)
 *   2150   text scale → 1 (300)
 *   2250   lottie + antiFlashWhite backdrop off; a brightEmeraldGreen block takes the container's place and settles
 *          onto the CTA strip (300): top / height / inset, top radius 15 → 0, colour → ottomanGreen; text white → grass —
 *          the strip's own copy is the same "Save Đ 15 on this order", so the text simply lands in it
 *   2550   pulse 1 → 1.01 → 1 (300), then done (2850)
 */

const T = 2850;
const LOTTIE_MS = 2250;
const SETTLE_MS = 300;
const EXPAND_AT = 1000;
const EXPAND_MS = 800;
const SUFFIX_AT = EXPAND_AT + EXPAND_MS - 300;
const SUFFIX_MS = 300;
const PULSE_AT = LOTTIE_MS + SETTLE_MS;
const BASE = 13;
const DIGIT_H = 12;
const DIGIT_FONT = 12;
const DIGITS_MS = 400;
const SOURCE = 5;
const RADIUS = 15;
const INSET = 2;
const CANVAS = { w: 1120, h: 190 };
const CONTAINER = { w: 1065, h: 180 };
/** CTA_REVEAL_LOTTIE_LOAD_TIMEOUT (300 on device; the web player initialises its wasm first) */
const LOAD_TIMEOUT_MS = 1500;
/** AnimatedDigit width = fontSize × 0.6786 × per-digit ratio of the target digit */
const DIGIT_RATIO: Record<string, number> = { '0': 0.95, '1': 0.65, '2': 0.8, '3': 0.85, '4': 0.8, '5': 0.8, '6': 0.85, '7': 0.8, '8': 0.8, '9': 0.85 };

/** Reanimated withTiming default = Easing.inOut(Easing.quad) */
const inOutQuad = cubicBezier(0.455, 0.03, 0.515, 0.955);
const digitsEase = cubicBezier(0.21, 0.16, 0, 1.2);

type Rect = { x: number; y: number; w: number; h: number };

/** flow tokens are scoped to the flow's container, so resolve them on an element inside it */
function cssVar(el: Element | null, name: string) {
  if (!el) return 'transparent';
  return getComputedStyle(el).getPropertyValue(name).trim() || 'transparent';
}

/** VIPAnimatedDigits.AnimatedDigit column: source → target, wrapping through 9 → 0 */
function digitColumn(source: string, target: string) {
  const d = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  const s = d.indexOf(source);
  const e = d.indexOf(target);
  return s < e ? d.slice(s, e + 1) : [...d.slice(s), ...d.slice(0, e + 1)];
}

function DigitSlot({ t, source, target, className }: { t: MotionValue<number>; source: string; target: string; className: string }) {
  const col = digitColumn(source, target);
  const y = useTransform(t, [0, DIGITS_MS], [0, -(col.length - 1) * DIGIT_H], { ease: digitsEase, clamp: false });
  const yClamped = useTransform(y, (v) => Math.max(-(col.length - 1) * DIGIT_H - DIGIT_H * 0.4, Math.min(0, v)));
  return (
    <span className={styles.slot} style={{ height: DIGIT_H, width: DIGIT_FONT * 0.6786 * (DIGIT_RATIO[target] ?? 1) }}>
      <motion.span className={styles.column} style={{ y: yClamped }}>
        {col.map((c, k) => (
          <span key={k} className={className} style={{ height: DIGIT_H, lineHeight: `${DIGIT_H}px` }}>
            {c}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

function SuffixWord({ t, index, count, word, className }: { t: MotionValue<number>; index: number; count: number; word: string; className: string }) {
  const a0 = SUFFIX_AT + (SUFFIX_MS / count) * index;
  const opacity = useTransform(t, [a0, a0 + SUFFIX_MS / count], [0, 1]);
  return (
    <motion.span className={className} style={{ opacity }}>
      &nbsp;{word}
    </motion.span>
  );
}

function RevealText({ t, prefix, currency, savings, words, suffixWidth, tone, suffixRef }: { t: MotionValue<number>; prefix: string; currency: string; savings: number; words: string[]; suffixWidth: number; tone: 'green' | 'white'; suffixRef?: React.Ref<HTMLSpanElement> }) {
  const text = tone === 'white' ? styles.textWhite : styles.textGreen;
  const digits = tone === 'white' ? styles.digitsWhite : styles.digitsGreen;
  const expand = useTransform(t, [EXPAND_AT, EXPAND_AT + EXPAND_MS], [0, 1], { ease: inOutQuad });
  const boldOpacity = useTransform(expand, (e) => 1 - e);
  const x = useTransform(expand, (e) => (-e * suffixWidth) / 2);
  const target = String(savings);
  const source = String(SOURCE).padStart(target.length, '0');
  return (
    <span className={styles.row}>
      <motion.span className={styles.saveGroup} style={{ x }}>
        {prefix && (
          <span className={styles.prefix}>
            <motion.span className={`${text} ${styles.bold}`} style={{ opacity: boldOpacity }}>
              {prefix}&nbsp;
            </motion.span>
            <motion.span className={`${text} ${styles.prefixNormal}`} style={{ opacity: expand }}>
              {prefix}&nbsp;
            </motion.span>
          </span>
        )}
        <span className={digits} style={{ lineHeight: `${DIGIT_H}px` }}>
          {currency}&nbsp;
        </span>
        <span className={styles.digits}>
          {[...target].map((d, i) => (
            <DigitSlot key={i} t={t} source={source[i]} target={d} className={digits} />
          ))}
        </span>
        <span ref={suffixRef} className={styles.suffix}>
          {words.map((w, i) => (
            <SuffixWord key={`${w}-${i}`} t={t} index={i} count={words.length} word={w} className={text} />
          ))}
        </span>
      </motion.span>
    </span>
  );
}

export function NoonOneCtaReveal({
  card,
  cta,
  animation,
  onDone,
}: {
  /** card box the overlay covers (initialHeight = cta bottom + container padding) */
  card: { w: number; h: number };
  /** CTA strip rect inside the card */
  cta: Rect;
  animation: { prefix: string; suffix: string; savings: number; currency: string };
  onDone: () => void;
}) {
  const [loaded, setLoaded] = useState(false);
  const [suffixWidth, setSuffixWidth] = useState(0);
  const suffixRef = useRef<HTMLSpanElement>(null);
  const words = useMemo(() => animation.suffix.trim().split(/\s+/).filter(Boolean), [animation.suffix]);
  const t = useMotionValue(0);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useLayoutEffect(() => {
    if (suffixRef.current) setSuffixWidth(suffixRef.current.offsetWidth);
  }, [words]);

  // the clock: starts on lottie load and ends the reveal; no load in time → skip
  useEffect(() => {
    if (!loaded) {
      const skip = setTimeout(() => doneRef.current(), LOAD_TIMEOUT_MS);
      return () => clearTimeout(skip);
    }
    const run = animate(t, T, { duration: T / 1000, ease: 'linear', onComplete: () => doneRef.current() });
    return () => run.stop();
  }, [loaded, t]);

  // onCtaLayout geometry
  const w = card.w;
  const lottieW = (w * CANVAS.w) / CONTAINER.w;
  const lottieH = (lottieW * CANVAS.h) / CANVAS.w;
  const lottieStyle: CSSProperties = { left: (w - lottieW) / 2, top: (card.h - lottieH) / 2, width: lottieW, height: lottieH };
  const boxH = (lottieH * CONTAINER.h) / CANVAS.h;
  const boxTop = (card.h - boxH) / 2;
  const toX = cta.x || INSET;

  const rootRef = useRef<HTMLDivElement>(null);
  const [colours, setColours] = useState<string[]>(['transparent', 'transparent']);
  useLayoutEffect(() => {
    setColours([cssVar(rootRef.current, '--nk-color-chk-noon-one-reveal-green'), cssVar(rootRef.current, '--nk-color-chk-noon-one-cta-bg')]);
  }, []);
  const settle = [LOTTIE_MS, PULSE_AT];
  const ease = { ease: inOutQuad };

  const cover = useTransform(t, [LOTTIE_MS, LOTTIE_MS + 1], [1, 0]);
  const overlayOpacity = useTransform(t, [LOTTIE_MS, LOTTIE_MS + 1], [0, 1]);
  const left = useTransform(t, settle, [0, toX], ease);
  const width = useTransform(t, settle, [w, cta.w], ease);
  const top = useTransform(t, settle, [boxTop, cta.y], ease);
  const height = useTransform(t, settle, [boxH, cta.h], ease);
  const radius = useTransform(t, settle, [RADIUS, 0], ease);
  const background = useTransform(t, settle, colours, ease);
  const pulse = useTransform(t, [PULSE_AT, PULSE_AT + 150, T], [1, 1.01, 1]);
  const scale = useTransform(t, [0, EXPAND_AT - 300, EXPAND_AT - 100, EXPAND_AT + EXPAND_MS, LOTTIE_MS - 100, LOTTIE_MS + 200], [34 / BASE, 34 / BASE, 35 / BASE, 18 / BASE, 18 / BASE, 1], ease);
  const textScale = useTransform([scale, pulse] as MotionValue<number>[], ([s, p]: number[]) => s * p);
  const white = useTransform(t, settle, [1, 0], ease);

  return (
    <div ref={rootRef} className={styles.root} style={{ opacity: loaded ? 1 : 0 }} aria-hidden>
      <motion.span className={styles.backdrop} style={{ opacity: cover }} />
      <motion.span className={styles.lottie} style={{ ...lottieStyle, opacity: cover }}>
        <Lottie src={greenContainer} style={{ width: '100%', height: '100%' }} onLoad={() => setLoaded(true)} />
      </motion.span>
      <motion.span
        className={styles.overlay}
        style={{ opacity: overlayOpacity, left, width, top, height, borderTopLeftRadius: radius, borderTopRightRadius: radius, backgroundColor: background, scale: pulse }}
      />
      <motion.span className={styles.textLayer} style={{ top, height }}>
        <motion.span className={styles.scale} style={{ scale: textScale }}>
          <RevealText t={t} prefix={animation.prefix} currency={animation.currency} savings={animation.savings} words={words} suffixWidth={suffixWidth} tone="green" suffixRef={suffixRef} />
          <motion.span className={styles.whiteCopy} style={{ opacity: white }}>
            <RevealText t={t} prefix={animation.prefix} currency={animation.currency} savings={animation.savings} words={words} suffixWidth={suffixWidth} tone="white" />
          </motion.span>
        </motion.span>
      </motion.span>
    </div>
  );
}
