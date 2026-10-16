import { useEffect } from 'react';
import { useNav } from '../../kit/Navigator';
import { CouponListing } from './components/CouponListing';
import { Beauty10Hero, CategoryCircles } from './components/ListingParts';
import { eligibleProducts } from './data';
import { csStore, useCs } from './store';

/**
 * BEAUTY10 eligible items (team file 04 · Eligible items): the coupon tray's Shop more lands here. Search bar,
 * noon / Minutes / supermall / express tabs, Filter · Sort · Price · Face · Eyes chips, the "Extra 10% off · Use code
 * BEAUTY10" hero with its 1-2-3 steps, the category circles and the eligible grid. Tapping the search bar opens the
 * coupon search; a category searches it. Every visit starts fresh (band back, eligible toggle on).
 */
export function EligibleScreen() {
  const nav = useNav();
  const variant = useCs((s) => s.variant);
  // a new coupon visit: once per Shop more (this screen mounts once per visit)
  useEffect(() => csStore.newVisit(), []);
  useEffect(() => nav.preload('couponsearch/search', 'couponsearch/results'), [nav]);
  return (
    <CouponListing
      key={variant}
      query=""
      items={eligibleProducts}
      marketplaces
      beauty
      lead={
        <>
          <Beauty10Hero />
          <CategoryCircles onPress={(q) => nav.push('couponsearch/results', { query: q, scope: 'eligible' })} />
        </>
      }
      onBarPress={() => nav.push('couponsearch/search')}
    />
  );
}
