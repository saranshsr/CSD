import { useEffect } from 'react';
import { useNav } from '../../kit/Navigator';
import { CouponListing } from './components/CouponListing';
import { CouponHero } from './components/CouponHero';
import { eligibleProducts } from './data';
import { csStore, useCs } from './store';

/**
 * BEAUTY10 eligible items: the coupon tray's Shop more lands here. The kit's listing (search bar, pill row, product
 * grid, bottom tabs) with the BEAUTY10 hero under the pills. Tapping the search bar opens the coupon search: the
 * search that knows it started from a coupon. Every visit starts fresh (band back, eligible toggle on).
 */
export function EligibleScreen() {
  const nav = useNav();
  const variant = useCs((s) => s.variant);
  // a new coupon visit: once per Shop more (this screen mounts once per visit)
  useEffect(() => csStore.newVisit(), []);
  useEffect(() => nav.preload('couponsearch/search', 'couponsearch/results'), [nav]);
  return <CouponListing key={variant} query="" items={eligibleProducts} lead={<CouponHero />} onBarPress={() => nav.push('couponsearch/search')} />;
}
