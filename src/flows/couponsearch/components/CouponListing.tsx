import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import { Screen, TabBar } from '../../../components';
import type { Product } from '../../../data';
import { useNav } from '../../../kit/Navigator';
import { handoff } from '../../../motion/presets';
import { copy } from '../data';
import { CsProductCard } from './CsProductCard';
import { CsSearchBar } from './CsSearchBar';
import { FilterChips, MarketplaceTabs, SortFilterPill } from './ListingParts';
import styles from '../listing.module.css';

/** `results-fade` shows the layer at once; everything under the search bar fades in here (S-curve 300ms). */
const belowBar = { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: handoff.fade.reveal, ease: handoff.easeInOut } } as const;
/** the first cards rise 12px into place, one after another (the kit's results timeline, without skeletons) */
const cardIn = (i: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { y: { ...handoff.spring, delay: 0.08 + Math.min(i, 5) * handoff.stagger.in }, opacity: { duration: handoff.fade.out, ease: handoff.easeOut, delay: 0.08 + Math.min(i, 5) * handoff.stagger.in } },
});

/**
 * The coupon listings in the team file's look: the M-SearchBar block (fixed), then — scrolling — the marketplace tabs
 * (eligible page only), the filter chips (Face / Eyes only for beauty results), `lead` (the BEAUTY10 hero and the
 * category circles, or one context line: never a count), the 2-column product grid, the floating Sort | Filter pill
 * and the Field DS bottom nav (Cart active). Filter, Sort and the chips are not part of this demo (a toast says so).
 */
export function CouponListing({ query, items, lead, marketplaces, beauty, onBarPress }: { query: string; items: Product[]; lead: ReactNode; marketplaces?: boolean; beauty: boolean; onBarPress: () => void }) {
  const nav = useNav();
  const notInDemo = () => nav.toast(copy.notInDemo);

  const header = (
    <div className={styles.barBlock}>
      <CsSearchBar camera={!query} value={query} onChange={() => undefined} onBack={nav.back} onFieldPress={onBarPress} />
    </div>
  );

  const footer = (
    <div className={styles.footer}>
      <motion.div {...belowBar}>
        <SortFilterPill onPress={notInDemo} />
      </motion.div>
      <div className={styles.tabDock}>
        <TabBar active="cart" variant="field" />
      </div>
    </div>
  );

  return (
    <Screen header={header} footer={footer} background="bgSurface">
      <motion.div {...belowBar}>
        {marketplaces && <MarketplaceTabs />}
        <FilterChips beauty={beauty} onPress={notInDemo} />
        {lead}
        <div className={styles.grid}>
          {items.map((p, i) => (
            <motion.div key={p.id} className={styles.cell} {...(i < 6 ? cardIn(i) : {})}>
              <CsProductCard product={p} />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </Screen>
  );
}
