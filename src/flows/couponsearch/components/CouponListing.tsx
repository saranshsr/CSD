import { motion } from 'motion/react';
import { memo, useRef, type ReactNode } from 'react';
import { ProductBoxVertical, Screen, TabBar } from '../../../components';
import type { Product } from '../../../data';
import { useIsTop, useNav } from '../../../kit/Navigator';
import { handoff } from '../../../motion/presets';
import { SkeletonReveal } from '../../../motion/recipes';
import priceActive from '@assets/plp/navpills/price-active.png';
import priceInactive from '@assets/plp/navpills/price-inactive.png';
// the kit's listing pieces (src/flows/plp): nav pills, skeleton card, scroll states, the results timeline and its CSS
import { CatalogNavPill } from '../../plp/components/CatalogNavPill';
import { RevealChip } from '../../plp/components/NavPills';
import { SkeletonCard } from '../../plp/components/SkeletonCard';
import { usePlpScrollStates } from '../../plp/scrollStates';
import { plpTokens } from '../../plp/tokens';
import plp from '../../plp/plp.module.css';
import { copy } from '../data';
import { CsSearchBar } from './CsSearchBar';
import { MarketplaceTabs, SortFilterPill } from './ListingParts';

const T = plpTokens.timeline;
/** `results-fade` shows the layer at once; everything under the search bar fades in here (S-curve 300ms), as on the kit's PLP. */
const belowBar = { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: handoff.fade.reveal, ease: handoff.easeInOut } } as const;
const ProductBox = memo(ProductBoxVertical);

/**
 * The frames' pill row on the kit's nav pills (CatalogNavPill, in the PLP's `.pills` row, each dropping in with the
 * handoff RevealChip): Filter · Sort · Price (facet) and, for beauty results, the Face · Eyes quick pills.
 */
function Pills({ beauty, onPress }: { beauty: boolean; onPress: () => void }) {
  let i = 0;
  return (
    <div className={`nk-hscroll ${plp.pills}`}>
      <RevealChip index={i++}>
        <CatalogNavPill kind="filter" label={copy.chips.filter} onPress={onPress} />
      </RevealChip>
      <RevealChip index={i++}>
        <CatalogNavPill kind="sort" label={copy.chips.sort} onPress={onPress} />
      </RevealChip>
      <RevealChip index={i++}>
        <CatalogNavPill kind="facet" label={copy.chips.price} icon={{ active: priceActive, inactive: priceInactive }} onPress={onPress} />
      </RevealChip>
      {beauty &&
        [copy.chips.face, copy.chips.eyes].map((l) => (
          <RevealChip key={l} index={i++}>
            <CatalogNavPill kind="plain" label={l} onPress={onPress} />
          </RevealChip>
        ))}
    </div>
  );
}

/**
 * The coupon listings on the kit's PLP (plp/listing → NoonCatalogList), laid out as the team file's frames: the search
 * bar block; the hidable layer under it (the marketplace tabs on the eligible page, the pill row) that slides up on
 * scroll; `lead` (the BEAUTY10 hero and category circles, or one context line: never a count); the 2-column
 * ProductBoxVertical grid rising out of its skeletons on the results timeline; the floating Sort | Filter pill; and the
 * kit's Liquid Glass bottom tabs, sliding off on scroll as on the PLP. Filter, Sort and the pills are not part of this
 * demo (a toast says so), so no sheet with counts ever opens.
 */
export function CouponListing({ query, items, lead, marketplaces, beauty, onBarPress }: { query: string; items: Product[]; lead: ReactNode; marketplaces?: boolean; beauty: boolean; onBarPress: () => void }) {
  const nav = useNav();
  const scroller = useRef<HTMLDivElement>(null);
  const isTop = useIsTop();
  const scroll = usePlpScrollStates(scroller, isTop);
  const notInDemo = () => nav.toast(copy.notInDemo);

  const header = (
    <div className={plp.header}>
      <div className={plp.barBlock}>
        <div className={plp.barRow}>
          <CsSearchBar value={query} onChange={() => undefined} onBack={nav.back} onFieldPress={onBarPress} />
        </div>
      </div>
      {/* HidableView: hangs under the search bar over the list, clipped as it slides up */}
      <div className={plp.hidable}>
        <motion.div ref={scroll.headerRef} className={plp.hidableInner} style={{ '--plp-header-hide': scroll.headerHide } as never} {...belowBar}>
          {marketplaces && <MarketplaceTabs />}
          <Pills beauty={beauty} onPress={notInDemo} />
        </motion.div>
      </div>
    </div>
  );

  const footer = (
    <motion.div className={plp.navDock} initial={{ y: T.navRise }} animate={{ y: 0 }} transition={{ ...handoff.spring, delay: T.navAt }}>
      <motion.div className={plp.navHide} style={{ '--plp-tab-hide': scroll.tabHide } as never}>
        <SortFilterPill onPress={notInDemo} />
        <TabBar active="cart" />
      </motion.div>
    </motion.div>
  );

  return (
    <Screen ref={scroller} header={header} footer={footer} background="bgSurface" onScroll={scroll.onScroll}>
      <div style={{ height: scroll.headerHeight }} aria-hidden />
      <motion.div {...belowBar}>
        {lead}
        <div className={plp.grid}>
          {items.map((p, i) => {
            const rises = i < T.animateFirst;
            return (
              <motion.div key={p.id} className={plp.cell}>
                <SkeletonReveal skeleton={<SkeletonCard />} animateIn={rises} delay={T.cardsAt + i * handoff.stagger.in} rise={T.cardRise} skeletonAfter={T.skeletonOutAfter}>
                  <ProductBox product={p} />
                </SkeletonReveal>
              </motion.div>
            );
          })}
        </div>
        <div className={plp.tabSpace} />
      </motion.div>
    </Screen>
  );
}

