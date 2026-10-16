import { useMemo } from 'react';
import { useNav, useParams } from '../../kit/Navigator';
import { CouponListing } from './components/CouponListing';
import { copy, resultsFor, type Scope } from './data';
import { useCs, type CsVariant } from './store';
import styles from './listing.module.css';

type Params = { query?: string; scope?: Scope };

/** One context line under the pills, instead of the kit's count (item counts are never shown). */
function ContextLine({ variant, want, scope, query }: { variant: CsVariant; want: Scope; scope: 'coupon' | 'fallback' | 'all'; query: string }) {
  const q = <b>“{query}”</b>;
  let line;
  if (scope === 'all')
    line =
      variant === 'row' ? (
        <>
          Showing results for {q} {copy.results.allOfNoon}
        </>
      ) : (
        <>Showing results for {q}</>
      );
  else if (scope === 'coupon')
    line = (
      <>
        Showing results for {q} {copy.results.inCoupon}
      </>
    );
  else if (variant === 'n5')
    line = (
      <>
        Showing results for {q} {copy.results.allCategories}
      </>
    );
  else
    line = (
      <>
        {copy.results.noCoupon} {q} · {copy.results.showingAll}
      </>
    );
  return (
    <div className={styles.context} data-testid="cs-context" data-scope={scope} data-want={want}>
      {line}
    </div>
  );
}

/**
 * Coupon search results in the kit's listing look, reached "in place" from the coupon search (`results-fade`: the
 * search bar sits where the search screen's does; only the page under it fades in). Tapping the bar goes back to the
 * search with the query. The context line says where the results come from:
 *  · eligible matches  → Showing results for "q" in BEAUTY10 items
 *  · none (h2 / row)   → No BEAUTY10 items for "q" · showing all of noon (+ all-of-noon results)
 *  · none (n5 row)     → Showing results for "q" in all categories
 *  · all of noon       → Showing results for "q" across all of noon (row, toggle off) / Showing results for "q" (n5)
 */
export function ResultsScreen() {
  const nav = useNav();
  const { query = 'serum', scope: want = 'eligible' } = useParams<Params>();
  const variant = useCs((s) => s.variant);
  // h2 is always eligible; the other two carry the scope the search was made in
  const ask: Scope = variant === 'h2' ? 'eligible' : want;
  const { scope, items } = useMemo(() => resultsFor(query, ask), [query, ask]);

  // tapping the bar goes back to editing: pop to the coupon search it came from, or open one on this query
  const editQuery = () => {
    const at = nav.stack.map((e) => e.route).lastIndexOf(nav.route);
    if (nav.stack[at - 1]?.route === 'couponsearch/search') nav.back();
    else nav.push('couponsearch/search', { q: query });
  };

  return <CouponListing key={variant} query={query} items={items} lead={<ContextLine variant={variant} want={ask} scope={scope} query={query} />} onBarPress={editQuery} />;
}
