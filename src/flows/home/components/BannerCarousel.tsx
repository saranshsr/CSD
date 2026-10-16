import { animate, motion, useInView, useMotionValue } from 'motion/react';
import { useReduceMotion } from '../../../motion/reducedMotion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable } from '../../../components';
import { useNav } from '../../../kit/Navigator';
import { easing } from '../../../motion/presets';
import type { BzBanner, BzHeader, BzWrap } from '../data.feed';
import { bz } from '../tokens.feed';
import { BzModuleWrapper } from './BzModuleWrapper';
import styles from './BannerModules.module.css';

/**
 * adBannerModuleCarousel with autoScroll → BannerModule `renderSnappedBannerCarousel` → NoonSlider
 * (optimized_banner_carousel; the legacy Slider has the same geometry and timing):
 *   slideWidth = ceil((W − slideSpaceCount · iS) / npv), npv 1.1, iS 15 → slideSpaceCount 1 → ceil(375 / 1.1) = 341
 *   height = width · ratio / 100 (homepage-toggle 10.81 → 36.9; strip-slider 41.29 → 140.8)
 * Leading inset = iS (15, noon), slides iS apart, infinite loop, auto-advance every 3000 ms with a 450 ms
 * Easing.out(cubic) step, paused while dragging and resumed after; slides off the active one fade to 0.85; no dots
 * (showScrollingIndicator false). Media radius 0 when the banner sets removeCurvedCorners (homepage-toggle), else 20.
 * No autoplay under reduced motion.
 */
export function SnappedBannerCarousel({ wrap, banners, flat }: { wrap: BzWrap; banners: BzBanner[]; flat?: boolean }) {
  const nav = useNav();
  const w = bz.stripWidth;
  const gap = 15;
  const step = w + gap;
  const n = banners.length;
  const looping = n > 1;
  const slots = looping ? [...banners, ...banners, ...banners] : banners;
  const [index, setIndex] = useState(looping ? n : 0);
  const indexRef = useRef(index);
  const x = useMotionValue(-index * step);
  const [dragging, setDragging] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.5 });
  const reduced = useReduceMotion();

  const go = useCallback(
    (to: number) => {
      indexRef.current = to;
      setIndex(to);
      animate(x, -to * step, {
        // reduced motion: swipes land at once (autoplay is off below)
        duration: reduced ? 0 : bz.sliderAdvance,
        ease: easing.out,
        onComplete: () => {
          if (!looping) return;
          // jump back into the middle copy so the loop never runs out (NoonSlider recycles its slots the same way)
          let i = indexRef.current;
          if (i >= 2 * n) i -= n;
          if (i < n) i += n;
          if (i !== indexRef.current) {
            indexRef.current = i;
            setIndex(i);
            x.set(-i * step);
          }
        },
      });
    },
    [looping, n, step, x],
  );

  useEffect(() => {
    if (!looping || !inView || dragging || reduced) return;
    const t = window.setTimeout(() => go(indexRef.current + 1), bz.sliderInterval);
    return () => window.clearTimeout(t);
  }, [index, inView, dragging, reduced, looping, go]);

  return (
    <BzModuleWrapper wrap={wrap}>
      <div ref={ref} className={styles.slider} role="region" aria-roledescription="carousel" aria-label="Offers">
        <motion.div
          className={styles.sliderTrack}
          style={{ x, gap, paddingInlineStart: gap }}
          drag={looping ? 'x' : false}
          dragMomentum={false}
          onDragStart={() => setDragging(true)}
          onDragEnd={(_, info) => {
            setDragging(false);
            const moved = -x.get() / step;
            const dir = info.velocity.x < -200 ? 1 : info.velocity.x > 200 ? -1 : 0;
            go(Math.max(0, Math.min(slots.length - 1, dir ? indexRef.current + dir : Math.round(moved))));
          }}
        >
          {slots.map((s, i) => (
            <motion.div key={i} className={styles.slide} style={{ width: w }} animate={{ opacity: i === index ? 1 : bz.sliderFade }} transition={{ duration: bz.sliderAdvance, ease: easing.out }}>
              <Pressable
                className={styles.slideMedia}
                data-flat={flat || undefined}
                scale={1}
                aria-label={s.alt}
                onClick={() => !dragging && nav.push('plp/listing', { query: s.query })}
                style={{ aspectRatio: `100 / ${s.ratio}` }}
              >
                <img src={s.image} alt="" draggable={false} className={styles.fill} />
              </Pressable>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </BzModuleWrapper>
  );
}

/**
 * bannerModuleCarousel without autoScroll → BannerModule `renderDefaultBannerCarousel`: free horizontal scroll, no
 * snap, no dots, no autoplay. slideWidth = (W − ceil(npv) · iS) / npv → (390 − 4 · 15) / 3.5 = 94.29; height =
 * width · ratio / 100 (158.54 → 149.5, 175.61 → 165.6); first slide 15 from the edge, every slide iS (15) margin-end.
 * Radius 20. An optional media header (CMS moduleHeader.imageUrl, 390 − 30 wide at its ratio) replaces the title.
 */
export function BannerCarousel({
  wrap,
  header,
  banners,
  numPerView,
  mediaHeader,
}: {
  wrap: BzWrap;
  header?: BzHeader;
  banners: BzBanner[];
  numPerView: number;
  mediaHeader?: { image: string; ratio: number; query: string };
}) {
  const nav = useNav();
  const iS = 15;
  const w = (bz.W - Math.ceil(numPerView) * iS) / numPerView;
  return (
    <BzModuleWrapper wrap={wrap} header={header}>
      {mediaHeader && (
        <Pressable className={styles.mediaHeader} scale={1} aria-label={mediaHeader.query} onClick={() => nav.push('plp/listing', { query: mediaHeader.query })} style={{ aspectRatio: `100 / ${mediaHeader.ratio}` }}>
          <img src={mediaHeader.image} alt="" draggable={false} className={styles.fill} />
        </Pressable>
      )}
      <div className={`nk-hscroll ${styles.freeRail}`} style={{ gap: iS }}>
        {banners.map((s, i) => (
          <Pressable key={i} className={styles.tile} scale={1} aria-label={s.alt} onClick={() => nav.push('plp/listing', { query: s.query })} style={{ width: w, aspectRatio: `100 / ${s.ratio}` }}>
            <img src={s.image} alt="" loading="lazy" draggable={false} className={styles.fill} />
          </Pressable>
        ))}
      </div>
    </BzModuleWrapper>
  );
}
