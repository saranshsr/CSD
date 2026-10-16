import { animate, cubicBezier, useMotionValue, type MotionValue } from 'motion/react';
import { useReduceMotion } from '../../motion/reducedMotion';
import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { duration } from '../../motion/presets';
import { TabBarScrollVisibility } from '../../kit/tabBarScroll';
import { plpTokens } from './tokens';

const S = plpTokens.scroll;

/** RN Animated.timing's default easing, Easing.inOut(Easing.ease) with ease = bezier(0.42, 0, 1, 1) (HidableView) */
const easeIn = cubicBezier(0.42, 0, 1, 1);
const animatedTimingDefault = (t: number) => (t < 0.5 ? easeIn(t * 2) / 2 : 1 - easeIn((1 - t) * 2) / 2);

/** bappzaar src/components/HidableView/HidableView.tsx onScroll, 1:1 */
class HidableHeader {
  hidden = false;
  height: number = S.header.initialHeight;
  private prevY = 0;
  private prevDir: 'up' | 'down' = 'up';
  private downStart = 0;
  private upStart = 0;
  constructor(private onHide: () => void, private onShow: () => void) {}

  onScroll(y: number) {
    const h = this.height || 20;
    const dir = y > this.prevY ? 'down' : 'up';
    if (dir === 'down' && this.prevDir === 'up') this.downStart = y;
    if (dir === 'up' && this.prevDir === 'down') this.upStart = y;
    if (!this.hidden && dir === 'down' && y - this.downStart > h && y > h) {
      this.onHide();
      this.hidden = true;
    }
    if (this.hidden && dir === 'up' && (y - this.upStart < -h || y < h)) {
      this.onShow();
      this.hidden = false;
    }
    this.prevY = y;
    this.prevDir = dir;
  }
}

export interface PlpScrollStates {
  /** 0 = tab bar shown, 1 = slid off by its height (`--plp-tab-hide`) */
  tabHide: MotionValue<number>;
  /** 0 = header in place, 1 = slid up by its height (`--plp-header-hide`) */
  headerHide: MotionValue<number>;
  /** measured header height, for the list's top spacer */
  headerHeight: number;
  /** ref for the hidable header (measured with a ResizeObserver) */
  headerRef: RefObject<HTMLDivElement | null>;
  onScroll: (y: number) => void;
  /** NoonCatalogList onContentResetToTop + HidableView dataChange: list back to the top, bar shown, header snapped in */
  resetToTop: () => void;
}

/**
 * The noon PLP's two scroll controllers (bappzaar master, src/flows/plp/MAPPING.md → "PLP scroll states"): the bottom
 * tab bar (ScrollVisibilityProvider → native bar, 0.15s ease-out) and the hidable header (HidableView, 300ms
 * inOut(ease)). Both run off `<Screen onScroll>` and write motion values, so scrolling never re-renders the screen.
 * `active` = this screen is the top entry; when something is pushed over it the tab bar provider is released
 * (bar back, unanimated), as navigationWrapper's push does.
 */
export function usePlpScrollStates(scrollRef: RefObject<HTMLDivElement | null>, active: boolean): PlpScrollStates {
  const reduce = useReduceMotion();
  const tabHide = useMotionValue(0);
  const headerHide = useMotionValue(0);
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = useState<number>(S.header.initialHeight);

  const ctl = useRef<{ tab: TabBarScrollVisibility; header: HidableHeader } | null>(null);
  const reduceRef = useRef(reduce);
  reduceRef.current = reduce;
  if (!ctl.current) {
    const to = (mv: MotionValue<number>, v: number, d: number, ease: [number, number, number, number] | ((t: number) => number)) =>
      animate(mv, v, { duration: reduceRef.current ? 0 : d, ease });
    ctl.current = {
      tab: new TabBarScrollVisibility(
        S.tab,
        () => to(tabHide, 1, duration.fast, S.tab.ease),
        () => to(tabHide, 0, duration.fast, S.tab.ease),
      ),
      header: new HidableHeader(
        () => to(headerHide, 1, duration.medium, animatedTimingDefault),
        () => to(headerHide, 0, duration.medium, animatedTimingDefault),
      ),
    };
  }

  // HidableView onLayout
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const h = el.offsetHeight;
      if (!h) return;
      ctl.current!.header.height = h;
      setHeaderHeight(h);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // drag end (touch release): velocity from the last ~60ms of scroll samples
  const samples = useRef<{ t: number; y: number }[]>([]);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onEnd = () => {
      const s = samples.current;
      const now = performance.now();
      const recent = s.filter((p) => now - p.t <= 60);
      if (recent.length < 2) return;
      const a = recent[0];
      const b = recent[recent.length - 1];
      if (b.t > a.t) ctl.current!.tab.onDragEnd((b.y - a.y) / (b.t - a.t));
    };
    el.addEventListener('touchend', onEnd, { passive: true });
    return () => el.removeEventListener('touchend', onEnd);
  }, [scrollRef]);

  // a screen pushed on top: release the provider and restore the bar without animation
  useEffect(() => {
    if (active) return;
    ctl.current!.tab.release();
    tabHide.jump(0);
  }, [active, tabHide]);

  const onScroll = useCallback(
    (y: number) => {
      const el = scrollRef.current;
      const now = performance.now();
      const s = samples.current;
      s.push({ t: now, y });
      while (s.length && now - s[0].t > 120) s.shift();
      ctl.current!.tab.onScroll({ y, contentHeight: el?.scrollHeight ?? 0, layoutHeight: el?.clientHeight ?? 0 });
      ctl.current!.header.onScroll(y);
    },
    [scrollRef],
  );

  const resetToTop = useCallback(() => {
    const el = scrollRef.current;
    if (el && el.scrollTop > 0) el.scrollTop = 0;
    ctl.current!.tab.reveal();
    const h = ctl.current!.header;
    h.hidden = false;
    headerHide.jump(0);
  }, [scrollRef, headerHide]);

  return { tabHide, headerHide, headerHeight, headerRef, onScroll, resetToTop };
}
