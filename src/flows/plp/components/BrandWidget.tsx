import { animate, motion, useMotionValue, type AnimationPlaybackControls } from 'motion/react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Icon, Pressable } from '../../../components';
import { currency } from '../../../data';
import { easing, handoff } from '../../../motion/presets';
import { SpringPager } from '../../../motion/recipes';
import type { BrandCard, BrandWidgetConfig } from '../brands';
import { plpTokens } from '../tokens';
import styles from './brandWidget.module.css';

const W = plpTokens.brandWidget;
type Mode = 'hidden' | 'panel' | 'busy' | 'sel';

function Mark({ card, coin, coins }: { card: BrandCard; coin?: boolean; coins?: BrandWidgetConfig['coins'] }) {
  const g = card.logo;
  if (coin && coins?.[card.brand]) {
    const [src, w, h] = coins[card.brand];
    return <img src={src} width={w} height={h} alt="" />;
  }
  if (g.letter) return <span className={styles.letter}>{g.letter}</span>;
  // a coin fits the card's own mark to ≤ 12px tall, ≤ 20px wide
  const k = coin ? Math.min(12 / (g.h ?? 11), 20 / (g.w ?? 11)) : 1;
  return <img src={g.mark} width={+((g.w ?? 11) * k).toFixed(2)} height={+((g.h ?? 11) * k).toFixed(2)} alt={coin ? '' : (g.label ?? card.brand)} draggable={false} />;
}

/**
 * Brand widget PLP panel (Figma 1214:145919, State 12 1214:145190 → State 13 1226:146640), between the chips
 * and the grid. `children` is the product grid: an opaque layer whose top edge is the panel's reveal line.
 *
 * Reveal, once the on-screen product cards have landed (`landed`):
 *   t = 0     the box grows 0 → 459 and the grid slides down with it on the handoff spring (a transform,
 *             not a height animation, so the cards never re-lay out)
 *   t = 0     the panel scales 90% → 100% and rises 20px on the SAME spring, fading in from 17ms (300ms)
 *   t = 33ms  the header rises 10px, fading in from 50ms
 *   t = 80ms  the first cards rise 16px (+3% scale, 4px → 0 blur), 40ms apart, on a soft spring
 * Select ("View {brand}" → `onSelect`, or the brand filter set elsewhere): panel 450 → 60 and box 459 → 75 on
 * one morph spring, the title glides into "{brand} selected", the coin pops with an overshoot, cards
 * dissolve (the tapped one shrinks toward the coin). Clear plays it back.
 */
export function BrandWidget({ config, selected, landed, onSelect, onClear, children }: { config?: BrandWidgetConfig; selected?: string; landed: boolean; onSelect: (brand: string) => void; onClear: () => void; children: ReactNode }) {
  const boxH = useMotionValue(0);
  const gridY = useMotionValue(0);
  const barH = useMotionValue<number>(W.bar);
  const [mode, setMode] = useState<Mode>('hidden');
  const [page, setPage] = useState({ i: 0, last: false });
  const [shownBrand, setShownBrand] = useState<string>();
  const modeRef = useRef<Mode>('hidden');
  const gridAnim = useRef<AnimationPlaybackControls>(undefined);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const r = {
    bar: useRef<HTMLDivElement>(null),
    head: useRef<HTMLDivElement>(null),
    hTitle: useRef<HTMLParagraphElement>(null),
    count: useRef<HTMLParagraphElement>(null),
    coin: useRef<HTMLSpanElement>(null),
    sTitle: useRef<HTMLSpanElement>(null),
    sSub: useRef<HTMLSpanElement>(null),
    clear: useRef<HTMLButtonElement>(null),
  };
  const cardEls = useRef<(HTMLElement | null)[]>([]);
  const cards = config?.cards ?? [];
  const go = (m: Mode) => {
    modeRef.current = m;
    setMode(m);
  };
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  /** the box jumps to its new height and the grid slides from where it was (compositor-only push) */
  const pushGrid = (to: number, spring: object) => {
    const d = boxH.get() - to + gridY.get();
    boxH.set(to);
    gridY.set(d);
    gridAnim.current?.stop();
    gridAnim.current = animate(gridY, 0, spring);
    return gridAnim.current;
  };
  const fade = (el: Element | null, from: number, to: number, duration: number, delay = 0, ease: typeof easing.ios | ((t: number) => number) = easing.ios, extra?: Record<string, [string | number, string | number]>) =>
    el ? animate(el, { opacity: [from, to], ...(extra ?? {}) }, { duration, delay, ease }) : undefined;
  const barRect = () => r.bar.current?.getBoundingClientRect();
  const onScreen = (i: number) => {
    const a = cardEls.current[i]?.getBoundingClientRect();
    const b = barRect();
    return !!a && !!b && a.left - b.left < b.width && a.right > b.left;
  };
  const riseCards = (base: number, order: number[]) =>
    order.forEach((k, n) => {
      const c = cardEls.current[k];
      if (!c) return;
      const delay = base + n * W.cards.stagger;
      animate(c, { y: [W.cards.rise, 0], scale: [W.cards.scale, 1] }, { ...handoff.springs.card, delay });
      animate(c, { opacity: [0, 1], filter: [`blur(${W.cards.blur}px)`, 'blur(0px)'] }, { duration: W.cards.fade, delay, ease: easing.ios });
    });

  function reveal() {
    go('panel');
    pushGrid(W.box, handoff.spring);
    const { reveal: R } = W;
    if (r.bar.current) {
      animate(r.bar.current, { y: [R.cardRise, 0], scale: [R.cardScale, 1] }, handoff.spring);
      animate(r.bar.current, { opacity: [0, 1] }, { duration: handoff.fade.reveal, delay: R.cardFadeAt, ease: handoff.revealFade });
    }
    if (r.head.current) {
      animate(r.head.current, { y: [R.headRise, 0] }, { ...handoff.spring, delay: R.headAt });
      animate(r.head.current, { opacity: [0, 1] }, { duration: handoff.fade.reveal, delay: R.headFadeAt, ease: handoff.revealFade });
    }
    // only the first few are on screen; the rest just land
    cardEls.current.forEach((c, i) => c && i >= W.cards.onScreen && (c.style.opacity = '1'));
    riseCards(W.cards.at, [...Array(Math.min(W.cards.onScreen, cards.length)).keys()]);
  }

  function collapse(brand: string) {
    const i = cards.findIndex((c) => c.brand === brand);
    go('busy');
    setShownBrand(brand);
    const { title: T } = W;
    const morph = handoff.springs.morph;
    const done = pushGrid(W.boxSelected, morph);
    animate(barH, W.barSelected, morph);
    if (r.hTitle.current) {
      animate(r.hTitle.current, { x: T.dx, y: T.dy, scale: T.k }, morph);
      fade(r.hTitle.current, 1, 0, 0.16, 0, handoff.io);
    }
    if (r.sTitle.current) {
      animate(r.sTitle.current, { x: [-T.dx, 0], y: [-T.dy, 0], scale: [1 / T.k, 1] }, morph);
      fade(r.sTitle.current, 0, 1, 0.2, 0.05, handoff.io);
    }
    fade(r.count.current, 1, 0, 0.12);
    // the coin pops up in place with an elastic overshoot; its mark pops a beat later
    if (r.coin.current) {
      animate(r.coin.current, { scale: [0, 1] }, { ...handoff.springs.pop, delay: W.popAt });
      fade(r.coin.current, 0, 1, 0.09, W.popAt);
    }
    // cards dissolve: the tapped one shrinks toward the coin, the rest sink and fade
    cardEls.current.forEach((c, k) => {
      if (!c) return;
      if (!onScreen(k)) {
        c.style.opacity = '0';
        return;
      }
      c.style.transformOrigin = k === i ? '0% 0%' : '';
      if (k === i) fade(c, 1, 0, 0.22, 0.03, easing.ios, { scale: [1, 0.92] });
      else fade(c, 1, 0, 0.17, 0, easing.ios, { y: [0, 10], scale: [1, 0.96] });
    });
    fade(r.sSub.current, 0, 1, 0.26, 0.14, easing.ios, { y: [4, 0] });
    fade(r.clear.current, 0, 1, 0.26, 0.18, easing.ios, { x: [6, 0] });
    done.finished.then(() => modeRef.current === 'busy' && go('sel'));
  }

  function expand() {
    go('busy');
    const { title: T } = W;
    const morph = handoff.springs.morph;
    const done = pushGrid(W.box, morph);
    animate(barH, W.bar, morph);
    if (r.sTitle.current) {
      animate(r.sTitle.current, { x: -T.dx, y: -T.dy, scale: 1 / T.k }, morph);
      fade(r.sTitle.current, 1, 0, 0.16, 0, handoff.io);
    }
    if (r.hTitle.current) {
      animate(r.hTitle.current, { x: 0, y: 0, scale: 1 }, morph);
      fade(r.hTitle.current, 0, 1, 0.2, 0.05, handoff.io);
    }
    fade(r.count.current, 0, 1, 0.26, 0.16);
    // the coin shrinks away in place (quick ease-in, no bounce on the way out)
    fade(r.coin.current, 1, 0, 0.16, 0, [0.4, 0, 1, 1], { scale: [1, 0.4] });
    fade(r.sSub.current, 1, 0, 0.12);
    fade(r.clear.current, 1, 0, 0.12);
    // cards rise back in, the ones on screen 40ms apart
    const visible = cards.map((_, k) => k).filter(onScreen);
    cardEls.current.forEach((c, k) => {
      if (!c) return;
      c.style.transformOrigin = '';
      if (!visible.includes(k)) c.style.opacity = '1';
    });
    riseCards(0.09, visible);
    done.finished.then(() => modeRef.current === 'busy' && go('panel'));
  }

  // reveal once the on-screen product cards have landed
  useEffect(() => {
    if (!config || !landed || modeRef.current !== 'hidden') return;
    reveal();
    if (selected) timers.current.push(setTimeout(() => collapse(selected), 500));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, landed]);

  // follow the selected brand (the widget's own CTA, Clear, or the Filters sheet)
  const prevSel = useRef(selected);
  useEffect(() => {
    const prev = prevSel.current;
    prevSel.current = selected;
    if (modeRef.current === 'hidden' || prev === selected) return;
    if (selected && !prev) collapse(selected);
    else if (!selected && prev) expand();
    else if (selected) {
      setShownBrand(selected);
      if (r.coin.current) animate(r.coin.current, { scale: [0.6, 1] }, handoff.springs.pop);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  if (!config) return <>{children}</>;
  const sel = cards.find((c) => c.brand === shownBrand);
  const isSel = mode === 'sel' || (mode === 'busy' && !!selected);

  return (
    <section aria-label={config.title}>
      <motion.div className={styles.box} style={{ height: boxH }}>
        <motion.div ref={r.bar} className={styles.bar} style={{ height: barH }}>
          <div ref={r.head} className={styles.head}>
            <p ref={r.hTitle} className={styles.hTitle}>
              {config.title}
            </p>
            <p ref={r.count} className={styles.count}>
              {page.last ? cards.length : page.i + 1} of {cards.length}
            </p>
          </div>
          <div className={`${styles.sel} ${isSel ? styles.selOn : ''}`} aria-hidden={!isSel}>
            <span ref={r.coin} className={styles.coin}>
              {sel && (
                // the mark pops 60ms behind its coin (and again when the brand changes)
                <motion.span key={sel.brand} style={{ display: 'flex' }} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ ...handoff.springs.pop, delay: W.popAt + W.markLag }}>
                  <Mark card={sel} coin coins={config.coins} />
                </motion.span>
              )}
            </span>
            <span className={styles.sTxt}>
              <span ref={r.sTitle} className={styles.sTitle}>
                {shownBrand} selected
              </span>
              <span ref={r.sSub} className={styles.sSub}>
                Showing all {shownBrand} {config.noun}
              </span>
            </span>
            <Pressable ref={r.clear} className={styles.clear} scale={0.97} onClick={onClear}>
              Clear
            </Pressable>
          </div>
          <SpringPager
            className={`${styles.rail} ${isSel ? styles.railOff : ''}`}
            trackClassName={styles.track}
            step={W.step}
            label={config.title}
            onPage={(i, n) => setPage({ i, last: i === n - 1 })}
          >
            {cards.map((c, i) => (
              <div key={c.brand} className={styles.slot}>
                <article ref={(el) => void (cardEls.current[i] = el)} className={styles.card}>
                  <div className={styles.media} style={{ background: c.tint }}>
                    <img className={styles.img} src={c.image} alt="" decoding="async" draggable={false} style={{ left: c.box[0], top: c.box[1], width: c.box[2], height: c.box[3] }} />
                    <span className={styles.heart}>
                      <Icon name="heart" size={17} />
                    </span>
                  </div>
                  <div className={styles.body}>
                    <div className={styles.logo}>
                      <Mark card={c} />
                      {c.logo.label && <b>{c.logo.label}</b>}
                    </div>
                    <p className={styles.name}>{c.name}</p>
                    <p className={styles.price}>
                      <span className={styles.now}>
                        {currency}
                        {c.now}
                      </span>
                      {c.was ? (
                        <>
                          <span className={styles.was}>{c.was}</span>
                          <span className={styles.off}>{c.off}</span>
                        </>
                      ) : (
                        c.note && <span className={styles.note}>{c.note}</span>
                      )}
                    </p>
                    <div className={styles.specs}>
                      {c.specs.map((v, k) => (
                        <p key={k} className={styles.spec}>
                          <span>{config.spec[k]}</span>
                          <b>{k === 3 ? `★ ${v}` : v}</b>
                        </p>
                      ))}
                    </div>
                    <span className={styles.ctaGap} aria-hidden />
                    <Pressable className={styles.cta} scale={0.97} onClick={() => mode === 'panel' && onSelect(c.brand)}>
                      View {c.brand}
                      <Icon name="chevronRight" size={16} />
                    </Pressable>
                  </div>
                </article>
              </div>
            ))}
          </SpringPager>
        </motion.div>
      </motion.div>
      <motion.div className={styles.grid} style={{ y: gridY }}>
        {children}
      </motion.div>
    </section>
  );
}
