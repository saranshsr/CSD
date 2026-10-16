import { motion } from 'motion/react';
import { memo, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Pressable, ProductBoxVertical, Screen, SearchInput, TabBar, Text } from '../../../components';
import type { Product } from '../../../data';
import { useIsTop, useNav } from '../../../kit/Navigator';
import { handoff } from '../../../motion/presets';
import { SkeletonReveal } from '../../../motion/recipes';
// the kit's listing pieces (src/flows/plp): pill row, skeleton card, scroll states and the results timeline
import { CatalogListHeader } from '../../plp/components/CatalogListHeader';
import { SkeletonCard } from '../../plp/components/SkeletonCard';
import { usePlpScrollStates } from '../../plp/scrollStates';
import { plpTokens } from '../../plp/tokens';
import { copy } from '../data';
import styles from '../listing.module.css';

const T = plpTokens.timeline;
type Quick = { brand?: string[]; category?: string[] };
const leaf = (p: Product) => p.category;
const keyOf = (f: Quick) => JSON.stringify(f);
const NONE: Quick = {};

/** `results-fade` shows the layer at once; everything under the search bar fades in here (S-curve 300ms), as on the kit's PLP. */
const belowBar = { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: handoff.fade.reveal, ease: handoff.easeInOut } } as const;
const ProductBox = memo(ProductBoxVertical);

/**
 * The kit's PLP (plp/listing → NoonCatalogList) for the coupon screens: the search bar block, the hidable pill row
 * (CatalogListHeader + RevealChip), the 2-column ProductBoxVertical grid rising out of its skeletons on the results
 * timeline, the scroll states (tab bar slides off, pills slide up) and the bottom tabs. `lead` sits under the pills
 * where the kit shows its count: the BEAUTY10 hero or one context line (item counts are never shown).
 * Brand / category quick pills filter in place; Filter, Sort and the facet dropdowns are not part of this demo.
 */
export function CouponListing({ query, placeholder, items, lead, onBarPress }: { query: string; placeholder?: string; items: Product[]; lead: ReactNode; onBarPress: () => void }) {
  const nav = useNav();
  const scroller = useRef<HTMLDivElement>(null);
  const isTop = useIsTop();
  const scroll = usePlpScrollStates(scroller, isTop);
  const [quick, setQuick] = useState<Quick>(NONE);
  // a new result set starts unfiltered (render as reset until the effect clears the old pills)
  const lastItems = useRef(items);
  const filters = lastItems.current === items ? quick : NONE;
  useEffect(() => {
    lastItems.current = items;
    setQuick(NONE);
  }, [items]);

  const list = useMemo(
    () => items.filter((p) => (!filters.brand?.length || filters.brand.includes(p.brand)) && (!filters.category?.length || filters.category.includes(leaf(p)))),
    [items, filters],
  );

  // a filter change dissolves the cards back into their skeletons and re-rises them (the kit's swap)
  const [shown, setShown] = useState({ list, key: keyOf(filters), items, epoch: 0 });
  const [reloading, setReloading] = useState(false);
  const latest = useRef(list);
  latest.current = list;
  useEffect(() => {
    const key = keyOf(filters);
    if (shown.items !== items) {
      setShown((s) => ({ list, key, items, epoch: s.epoch + 1 }));
      return;
    }
    if (key === shown.key) return;
    setReloading(true);
    const t = setTimeout(() => {
      setShown((s) => ({ list: latest.current, key, items, epoch: s.epoch + 1 }));
      setReloading(false);
      scroll.resetToTop();
    }, plpTokens.swap.revealAt * 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list]);

  const notInDemo = () => nav.toast(copy.notInDemo);
  const nFilters = (filters.brand?.length ?? 0) + (filters.category?.length ?? 0);

  const header = (
    <div className={styles.header}>
      <div className={styles.barBlock}>
        <div className={styles.barRow}>
          <SearchInput value={query} placeholder={placeholder} onChange={() => undefined} onBack={nav.back} onFieldPress={onBarPress} />
        </div>
      </div>
      <div className={styles.hidable}>
        <motion.div ref={scroll.headerRef} className={styles.hidableInner} style={{ '--plp-header-hide': scroll.headerHide } as never} {...belowBar}>
          <CatalogListHeader
            sortLabel="Sort"
            sorted={false}
            nFilters={nFilters}
            filters={filters}
            results={items}
            onFilter={notInDemo}
            onSort={notInDemo}
            onFacet={notInDemo}
            onQuick={(facet, id) => {
              const cur = filters[facet] ?? [];
              setQuick({ ...filters, [facet]: cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id] });
            }}
          />
        </motion.div>
      </div>
    </div>
  );

  const footer = (
    <motion.div className={styles.navDock} initial={{ y: T.navRise }} animate={{ y: 0 }} transition={{ ...handoff.spring, delay: T.navAt }}>
      <motion.div className={styles.navHide} style={{ '--plp-tab-hide': scroll.tabHide } as never}>
        <TabBar active="cart" />
      </motion.div>
    </motion.div>
  );

  const first = shown.epoch === 0;
  return (
    <Screen ref={scroller} header={header} footer={footer} background="bgSurface" onScroll={scroll.onScroll}>
      <div style={{ height: scroll.headerHeight }} aria-hidden />
      <motion.div {...belowBar}>
        {lead}
        <div className={styles.grid}>
          {shown.list.map((p, i) => {
            const rises = i < T.animateFirst;
            return (
              <motion.div key={`${shown.epoch}-${p.id}`} className={styles.cell}>
                <SkeletonReveal
                  skeleton={<SkeletonCard />}
                  animateIn={rises}
                  loading={reloading && rises}
                  delay={(first ? T.cardsAt : 0) + i * handoff.stagger.in}
                  rise={T.cardRise}
                  skeletonAfter={T.skeletonOutAfter}
                >
                  <ProductBox product={p} />
                </SkeletonReveal>
              </motion.div>
            );
          })}
        </div>
        {!reloading && shown.list.length === 0 && (
          <div className={styles.empty}>
            <Text variant="section">No results match your filters</Text>
            <Pressable onClick={() => setQuick(NONE)} className={styles.clear}>
              Clear all filters
            </Pressable>
          </div>
        )}
        <div className={styles.tabSpace} />
      </motion.div>
    </Screen>
  );
}
