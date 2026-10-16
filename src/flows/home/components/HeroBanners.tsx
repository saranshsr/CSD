import { useEffect, useRef, useState } from 'react';
import { Badge, Pressable } from '../../../components';
import { ref as tok } from '../../../foundations/tokens';
import { useNav } from '../../../kit/Navigator';
import { currency } from '../../../data';
import { heroInterval2025, heroSlides2025, type HeroSlide } from '../data.header';
import styles from './HeroBanners.module.css';
import { useReduceMotion } from '../../../motion/reducedMotion';

/** 330×150 landscape cards, 9 apart (Figma 1337:5106). */
const W = 330;
const GAP = 9;

/**
 * Hero banners, Homepage Revamp 2025 (Figma 1337:5106): landscape 330×150 r20 cards, gap 9, padding 12, so the next card
 * peeks. Snap scrolling, auto-advance every 4s, paused while touched (as HeroCarousel). Sponsored creatives carry an
 * "Ad" badge top-right; the welcome card is composed live (copy as text over the product cut-outs).
 */
export function HeroBanners() {
  const nav = useNav();
  const ref = useRef<HTMLDivElement>(null);
  const [held, setHeld] = useState(false);
  const reduce = useReduceMotion();

  useEffect(() => {
    // no auto-advance under reduced motion (still swipeable)
    if (held || reduce) return;
    const t = setInterval(() => {
      const el = ref.current;
      if (!el) return;
      const next = (Math.round(el.scrollLeft / (W + GAP)) + 1) % heroSlides2025.length;
      el.scrollTo({ left: next * (W + GAP), behavior: 'smooth' });
    }, heroInterval2025);
    return () => clearInterval(t);
  }, [held, reduce]);

  return (
    <div
      ref={ref}
      className={`${styles.rail} nk-hscroll`}
      onPointerDown={() => setHeld(true)}
      onPointerUp={() => setHeld(false)}
      onPointerLeave={() => setHeld(false)}
    >
      {heroSlides2025.map((s) => (
        <Pressable key={s.query} className={styles.card} data-kind={s.kind} onClick={() => nav.push('plp/listing', { query: s.query })} scale={0.98} aria-label={s.query}>
          {s.kind === 'welcome' ? <WelcomeCard slide={s} /> : <ImageCard slide={s} />}
          {s.ad && (
            <Badge bg="var(--nk-color-home-hero-ad-bg)" color={tok.color('textInverse')} style={{ position: 'absolute', left: 301, top: 8 }}>
              Ad
            </Badge>
          )}
        </Pressable>
      ))}
    </div>
  );
}

function WelcomeCard({ slide: s }: { slide: Extract<HeroSlide, { kind: 'welcome' }> }) {
  return (
    <>
      <span className={styles.dryer}>
        <img src={s.art.dryer} alt="" draggable={false} />
      </span>
      <span className={styles.shadow}>
        <img src={s.art.shadow} alt="" />
      </span>
      <span className={styles.watch}>
        <img src={s.art.watch} alt="" draggable={false} />
      </span>
      <span className={styles.makeup}>
        <img src={s.art.makeup} alt="" draggable={false} />
      </span>
      <span className={styles.copy}>
        <span className={styles.eyebrow}>{s.eyebrow}</span>
        <span className={styles.amount}>
          {currency}
          {s.amount}
        </span>
        <span className={styles.line}>
          <b>{s.strong}</b>
          <br />
          {s.line}
        </span>
        <span className={styles.code}>{s.code}</span>
      </span>
      <span className={styles.terms}>*T&amp;C Apply</span>
    </>
  );
}

function ImageCard({ slide: s }: { slide: Extract<HeroSlide, { kind: 'image' }> }) {
  return (
    <>
      <span className={styles.saleImage}>
        <img src={s.image} alt="" draggable={false} />
      </span>
      <span className={styles.saleLogoBox}>
        <span className={styles.saleLogo}>
          <img src={s.logo} alt="" />
        </span>
      </span>
    </>
  );
}
