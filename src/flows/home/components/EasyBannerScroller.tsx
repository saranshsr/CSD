import { useInView } from 'motion/react';
import { useReduceMotion } from '../../../motion/reducedMotion';
import { useEffect, useRef } from 'react';
import { Pressable } from '../../../components';
import { useNav } from '../../../kit/Navigator';
import type { BzBanner, BzHeader, BzWrap } from '../data.feed';
import { bz } from '../tokens.feed';
import { BzModuleWrapper } from './BzModuleWrapper';
import styles from './BannerModules.module.css';

/**
 * easyBannerScroller / adEasyBannerScroller → EasyBannerScrollerModule (own ModuleWrapper, header from ModuleHeader):
 *   width = floor((W − 2 · iS − (npv − 1) · iS) / npv), iS 15 → npv 2.5: 135 · npv 3: 110 · npv 3.5: 92
 *   height = width · ratio / 100 (min height = width)
 * Banners laid out in `rows` (rowsPerGroup) column-first; row k is shifted −k · rowOffset (0.5) · width (brick);
 * gaps iS, 15 from the start edge, radius 20. The rail is an endless marquee: linear, 96 ms per px (≈ 10.4 pt/s),
 * paused off-screen, while the finger is down, and under reduced motion. It is still a normal scroller.
 */
export function EasyBannerScroller({ wrap, header, numPerView, rows, banners }: { wrap: BzWrap; header?: BzHeader; numPerView: number; rows: number; banners: BzBanner[] }) {
  const nav = useNav();
  const railRef = useRef<HTMLDivElement>(null);
  const halfRef = useRef<HTMLDivElement>(null);
  const inView = useInView(railRef, { amount: 0.2 });
  const reduced = useReduceMotion();
  const holding = useRef(false);
  const w = bz.easyWidth(numPerView);
  const iS = 15;
  const perRow = Math.ceil(banners.length / rows);
  const rowList = Array.from({ length: rows }, (_, r) => banners.filter((_, i) => i % rows === r));

  useEffect(() => {
    const el = railRef.current;
    if (!el || !inView || reduced) return;
    let raf = 0;
    let last = performance.now();
    let carry = el.scrollLeft;
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      if (!holding.current) {
        carry += dt * bz.easyPxPerSecond;
        const loop = halfRef.current?.offsetWidth ?? 0;
        if (loop && carry >= loop) carry -= loop;
        el.scrollLeft = carry;
      } else carry = el.scrollLeft;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduced]);

  const copy = (key: string, ref?: React.Ref<HTMLDivElement>) => (
    <div key={key} ref={ref} className={styles.easyCopy} style={{ gap: iS, paddingInlineEnd: iS }}>
      {rowList.map((row, r) => (
        <div key={r} className={styles.easyRow} style={{ gap: iS, marginInlineStart: -r * 0.5 * w, width: perRow * (w + iS) - iS }}>
          {row.map((s, i) => (
            <Pressable key={i} className={styles.tile} scale={1} aria-label={s.alt} onClick={() => nav.push('plp/listing', { query: s.query })} style={{ width: w, minHeight: w, aspectRatio: `100 / ${s.ratio}` }}>
              <img src={s.image} alt="" loading="lazy" draggable={false} className={styles.fill} />
            </Pressable>
          ))}
        </div>
      ))}
    </div>
  );

  return (
    <BzModuleWrapper wrap={wrap} header={header}>
      <div
        ref={railRef}
        className={`nk-hscroll ${styles.easyRail}`}
        onPointerDown={() => (holding.current = true)}
        onPointerUp={() => (holding.current = false)}
        onPointerCancel={() => (holding.current = false)}
        onPointerLeave={() => (holding.current = false)}
      >
        {copy('a', halfRef)}
        {copy('b')}
      </div>
    </BzModuleWrapper>
  );
}
