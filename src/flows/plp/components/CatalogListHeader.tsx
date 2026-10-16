import { useEffect, useMemo, useRef } from 'react';
import type { Product } from '../../../data';
import dealsActive from '@assets/plp/navpills/deals-active.png';
import dealsInactive from '@assets/plp/navpills/deals-inactive.png';
import brandActive from '@assets/plp/navpills/brand-active.png';
import brandInactive from '@assets/plp/navpills/brand-inactive.png';
import priceActive from '@assets/plp/navpills/price-active.png';
import priceInactive from '@assets/plp/navpills/price-inactive.png';
import type { FacetId, Filters } from '../data';
import { leafCategory } from '../data';
import { CatalogNavPill, type CatalogNavPillHandle } from './CatalogNavPill';
import { RevealChip } from './NavPills';
import styles from '../plp.module.css';

/** The live search API's facet nav pills (navPills with filter "facets"), in its order, with their CMS icons. */
const facetPills: { id: FacetId; name: string; icon: { active: string; inactive: string } }[] = [
  { id: 'deals', name: 'Deals', icon: { active: dealsActive, inactive: dealsInactive } },
  { id: 'brand', name: 'Brand', icon: { active: brandActive, inactive: brandInactive } },
  { id: 'price', name: 'Price', icon: { active: priceActive, inactive: priceInactive } },
];

/**
 * The PLP header with the fulfilment tabs on (NoonCatalogList.renderHeader → NoonCatalogListHeader): the custom pills
 * Filter · Sort · divider (getCustomNavPills), then the API navPills — the facet dropdowns Deals · Brand · Price and the
 * quick pills (brands by result count, the top category after the third, as in the live "phone" response:
 * Apple, Samsung, Xiaomi, Mobiles & Accessories, Motorola …). No express pill: the tabs carry fulfilment.
 * Row: gap 8, padding 12 15, on rgba(255, 255, 255, 0.95). The idle Filter pill plays its attention animation once,
 * two frames + 200ms after the header lays out. Chips keep the handoff reveal (RevealChip) from the search → PLP motion.
 */
export function CatalogListHeader({
  sortLabel,
  sorted,
  nFilters,
  filters,
  results,
  onFilter,
  onSort,
  onFacet,
  onQuick,
}: {
  sortLabel: string;
  sorted: boolean;
  nFilters: number;
  filters: Filters;
  results: Product[];
  onFilter: () => void;
  onSort: () => void;
  onFacet: (facet: FacetId) => void;
  onQuick: (facet: 'brand' | 'category', id: string) => void;
}) {
  const filterPill = useRef<CatalogNavPillHandle>(null);
  const played = useRef(false);

  useEffect(() => {
    let raf = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    raf = requestAnimationFrame(() => {
      raf = requestAnimationFrame(() => {
        // the RevealChip drop lands first; bappzaar waits for layout + 200ms
        timer = setTimeout(() => {
          if (!played.current) played.current = filterPill.current?.play() ?? false;
        }, 200 + 900);
      });
    });
    return () => {
      cancelAnimationFrame(raf);
      if (timer) clearTimeout(timer);
    };
  }, []);

  const quick = useMemo(() => quickPills(results), [results]);
  let i = 0;
  return (
    <div className={`nk-hscroll ${styles.pills}`}>
      <RevealChip index={i++}>
        <CatalogNavPill ref={filterPill} kind="filter" label="Filter" selected={nFilters > 0} count={nFilters} onPress={onFilter} />
      </RevealChip>
      <RevealChip index={i++}>
        <CatalogNavPill kind="sort" label={sortLabel} selected={sorted} onPress={onSort} />
      </RevealChip>
      <RevealChip index={i++} skeleton={false}>
        <span className={styles.pillDivider} aria-hidden />
      </RevealChip>
      {facetPills.map((f) => {
        const n = filters[f.id]?.length ?? 0;
        return (
          <RevealChip key={f.id} index={i++}>
            <CatalogNavPill kind="facet" label={f.name} icon={f.icon} count={n} onPress={() => onFacet(f.id)} />
          </RevealChip>
        );
      })}
      {quick.map((q) => (
        <RevealChip key={`${q.facet}-${q.id}`} index={i++}>
          <CatalogNavPill kind="plain" label={q.name} selected={!!filters[q.facet]?.includes(q.id)} onPress={() => onQuick(q.facet, q.id)} />
        </RevealChip>
      ))}
    </div>
  );
}

/** brands by result count (up to 8) with the top category slotted in after the third */
function quickPills(results: Product[]): { facet: 'brand' | 'category'; id: string; name: string }[] {
  const count = (key: (p: Product) => string) => {
    const m = new Map<string, number>();
    for (const p of results) m.set(key(p), (m.get(key(p)) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]).map(([k]) => k);
  };
  const brands = count((p) => p.brand)
    .slice(0, 8)
    .map((b) => ({ facet: 'brand' as const, id: b, name: b }));
  const [category] = count(leafCategory);
  if (!category) return brands;
  return [...brands.slice(0, 3), { facet: 'category' as const, id: category, name: category }, ...brands.slice(3)];
}
