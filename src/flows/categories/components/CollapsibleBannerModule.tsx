import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useRef, useState, type RefObject } from 'react';
import { Pressable } from '../../../components';
import { asset, type CmsMainBanner, type CmsSubBanner } from '../data';
import { categoriesTokens as k } from '../tokens';
import styles from '../categories.module.css';

/**
 * Port of src/components/Module/CollapsibleBannerModule (+ MainBanner, SubBanner) as rendered for the live
 * `category-nav-all-categories` module inside ModuleWrapper (header "Categories").
 *
 * - Banners are chunked into rows of `numPerRow` (3). Tapping a main banner opens its sub-banner list under that
 *   row (height = (55 + 7) × n + 15 × 2, 300ms); tapping it again closes it, tapping another banner in the row
 *   swaps the list, tapping a banner in another row closes this one (`selectedRowIndex` effect on master).
 * - After the expansion finishes, if the row is above the fold or the expanded row doesn't fit, the page scrolls
 *   so the row starts 10px below the top (`animateScrollingComponent`).
 */
const timing = { duration: k.timingMs / 1000, ease: k.timingEase };

type Selection = { row: number; index: number } | null;

export function CollapsibleBannerModule({
  title,
  banners,
  numPerRow,
  initialOpen,
  scrollerRef,
  onSubBannerPress,
}: {
  title: string;
  banners: CmsMainBanner[];
  numPerRow: number;
  /** index of a main banner to open on mount (deep link / sidebar state) */
  initialOpen?: number;
  scrollerRef: RefObject<HTMLDivElement | null>;
  onSubBannerPress: (main: CmsMainBanner, sub: CmsSubBanner) => void;
}) {
  const perRow = Math.max(1, numPerRow);
  const rows: CmsMainBanner[][] = [];
  for (let i = 0; i < banners.length; i += perRow) rows.push(banners.slice(i, i + perRow));

  const [selected, setSelected] = useState<Selection>(
    initialOpen !== undefined && initialOpen >= 0 ? { row: Math.floor(initialOpen / perRow), index: initialOpen % perRow } : null,
  );

  const onMainBannerPress = (row: number, index: number) =>
    setSelected((s) => (s && s.row === row && s.index === index ? null : { row, index }));

  return (
    <section className={styles.collapsibleModule}>
      <div className={styles.moduleHeader}>
        <h2 className={styles.moduleTitle}>{title}</h2>
      </div>
      {rows.map((rowBanners, row) => (
        <CollapsibleBannerRow
          key={row}
          banners={rowBanners}
          numPerRow={perRow}
          selectedIndex={selected?.row === row ? selected.index : null}
          onMainBannerPress={(index) => onMainBannerPress(row, index)}
          onSubBannerPress={onSubBannerPress}
          scrollerRef={scrollerRef}
        />
      ))}
    </section>
  );
}

function CollapsibleBannerRow({
  banners,
  numPerRow,
  selectedIndex,
  onMainBannerPress,
  onSubBannerPress,
  scrollerRef,
}: {
  banners: CmsMainBanner[];
  numPerRow: number;
  selectedIndex: number | null;
  onMainBannerPress: (index: number) => void;
  onSubBannerPress: (main: CmsMainBanner, sub: CmsSubBanner) => void;
  scrollerRef: RefObject<HTMLDivElement | null>;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const parent = selectedIndex !== null ? banners[selectedIndex] : undefined;
  const subBanners = parent?.subBanners ?? [];
  const height = parent ? (k.subBannerHeight + k.subBannersGap) * subBanners.length + k.graceSpace * 2 : 0;

  /** CollapsibleBannerRow.animateScrollingComponent (runs when the open animation finishes) */
  const afterExpanded = useCallback(() => {
    const scroller = scrollerRef.current;
    const row = rowRef.current;
    const main = mainRef.current;
    if (!scroller || !row || !main || selectedIndex === null) return;
    const spaceBeforeRow = row.getBoundingClientRect().top - scroller.getBoundingClientRect().top;
    const collapsedRowHeight = main.offsetHeight + k.rowBottomMargin;
    const isRowAboveTheFold = spaceBeforeRow < 0;
    const isRowVisibleAfterExpansion = scroller.clientHeight - spaceBeforeRow > height + collapsedRowHeight;
    if (isRowAboveTheFold || !isRowVisibleAfterExpansion) {
      scroller.scrollTo({ top: scroller.scrollTop + spaceBeforeRow - k.rowBottomMargin, behavior: 'smooth' });
    }
  }, [scrollerRef, selectedIndex, height]);

  return (
    <div ref={rowRef} className={styles.row}>
      <div ref={mainRef} className={styles.mainBanners} style={{ gridTemplateColumns: `repeat(${numPerRow}, minmax(0, 1fr))` }}>
        {banners.map((b, i) => (
          <MainBanner key={b.image} banner={b} selected={selectedIndex === i} onPress={() => onMainBannerPress(i)} />
        ))}
      </div>
      <motion.div
        className={styles.subBanners}
        initial={false}
        animate={{ height }}
        transition={timing}
        onAnimationComplete={() => height > 0 && afterExpanded()}
      >
        <div className={styles.graceSpace} />
        <AnimatePresence mode="popLayout" initial={false}>
          {parent &&
            subBanners.map((s, i) => (
              <SubBanner key={`${s.image}-${selectedIndex}`} subBanner={s} index={i} onPress={() => onSubBannerPress(parent, s)} />
            ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

/** MainBanner: RN Pressable (no press feedback); image + white/selected 2px border layers + 2-line title. */
function MainBanner({ banner, selected, onPress }: { banner: CmsMainBanner; selected: boolean; onPress: () => void }) {
  return (
    <Pressable scale={1} className={styles.mainBanner} onClick={onPress} aria-expanded={selected}>
      <motion.span
        className={styles.mainMedia}
        initial={false}
        animate={{ scaleY: selected ? k.selectedScaleY : 1, y: selected ? k.graceSpace : 0 }}
        transition={timing}
      >
        <span className={styles.mainImageBox}>
          <img src={asset(banner.image)} alt="" className={styles.mainImage} style={{ aspectRatio: `100 / ${k.mainBannerRatio}` }} draggable={false} />
        </span>
        <motion.span className={`${styles.mainBorder} ${styles.mainBorderUnselected}`} initial={false} animate={{ opacity: selected ? 0 : 1 }} transition={{ duration: k.borderFadeMs / 1000, ease: k.timingEase }} />
        <motion.span className={`${styles.mainBorder} ${styles.mainBorderSelected}`} initial={false} animate={{ opacity: selected ? 1 : 0 }} transition={{ duration: k.borderFadeMs / 1000, ease: k.timingEase }} />
      </motion.span>
      <span className={styles.mainTitleBox}>
        <motion.span
          className={styles.mainTitle}
          initial={false}
          animate={{ scale: selected ? k.selectedTitleScale : 1, y: selected ? k.selectedTitleShift : 0 }}
          transition={timing}
        >
          {banner.title}
        </motion.span>
      </span>
    </Pressable>
  );
}

/** SubBanner: enters with opacity 0→1 + translateX −25→0 (300ms), exits FadeOutRight. */
function SubBanner({ subBanner, index, onPress }: { subBanner: CmsSubBanner; index: number; onPress: () => void }) {
  return (
    <motion.button
      type="button"
      className={`nk-pressable ${styles.subBanner}`}
      data-index={index}
      initial={{ opacity: 0, x: -k.subEnterX }}
      animate={{ opacity: 1, x: 0, transition: { duration: k.subEnterMs / 1000, ease: k.timingEase } }}
      exit={{ opacity: 0, x: k.subEnterX, transition: { duration: k.subExitMs / 1000, ease: k.timingEase } }}
      onClick={onPress}
    >
      <img src={asset(subBanner.image)} alt="" className={styles.subImage} draggable={false} />
      <span className={styles.subText}>{subBanner.title}</span>
    </motion.button>
  );
}
