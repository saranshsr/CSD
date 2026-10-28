import { useMemo } from 'react';
import { useNav, useParams } from '../../kit/Navigator';
import { CouponListing } from './components/CouponListing';
import { copy, resultsFor, type Scope } from './data';
import { useCs, type CsVariant } from './store';
import { barMorph } from './transitions';
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
        Showing results for {q} in <b>{copy.results.inCouponStrong}</b>
      </>
    );
  else if (variant === 'h2')
    // F · No eligible match: the message over its caption, then the "From all of noon" heading over the results
    return (
      <div data-testid="cs-context" data-scope={scope} data-want={want}>
        <div className={styles.noMatch}>
          <span className={styles.noMatchTitle}>
            {copy.fallback.none} {copy.results.code} {copy.fallback.itemsFor} “{query}”
          </span>
          <span className={styles.noMatchCaption}>{copy.fallback.caption}</span>
        </div>
        <h3 className={styles.fromAll}>{copy.fallback.heading}</h3>
      </div>
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
  // every version carries the scope the search was made in (h2: BEAUTY10 rows and Enter → eligible; an all-of-noon
  // row, or a search after ✕ → all of noon)
  const ask: Scope = want;
  const { scope, items } = useMemo(() => resultsFor(query, ask), [query, ask]);

  // tapping the bar goes back to editing: pop to the coupon search it came from, or open one on this query
  const editQuery = () => {
    const at = nav.stack.map((e) => e.route).lastIndexOf(nav.route);
    if (nav.stack[at - 1]?.route === 'couponsearch/search') nav.back();
    else {
      barMorph.arm();
      nav.push('couponsearch/search', { q: query });
    }
  };

  // h2's all-of-noon search is a normal search: no coupon (beauty) pills
  const beauty = items.some((p) => !!p.coupon) && !(variant === 'h2' && scope === 'all');
  return <CouponListing key={variant} query={query} items={items} beauty={beauty} lead={<ContextLine variant={variant} want={ask} scope={scope} query={query} />} onBarPress={editQuery} />;
}
