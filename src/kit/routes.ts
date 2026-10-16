import type { Route } from './types';

/**
 * Friendly page URLs → `flow/screen` routes. Open any page directly, e.g. `/homepage`, `/search`, `/plp`,
 * `/pdp`, `/cart`, `/checkout` (also `/#/plp`). Every screen is also reachable as `/<flow>/<screen>`, and
 * every flow as `/<flow>` (its initial screen). Screens can add their own with `ScreenDef.path`.
 * Query params become screen params: `/plp?query=iphone`, `/pdp?productId=p2`.
 */
export const pageAliases: Record<string, Route> = {
  homepage: 'home/home',
  home: 'home/home',
  search: 'search/search',
  categories: 'categories/categories',
  deals: 'deals/deals',
  plp: 'plp/listing',
  listing: 'plp/listing',
  filters: 'plp/filters',
  pdp: 'pdp/detail',
  product: 'pdp/detail',
  cart: 'cart/cart',
  checkout: 'checkout/checkout',
  'order-confirmation': 'checkout/confirmation',
  'payment-failure': 'checkout/payment-failure',
  orders: 'orders/list',
  'order-tracking': 'orders/tracking',
  returns: 'returns/details',
  reviews: 'reviews/rate',
  account: 'account/account',
  'edit-profile': 'account/editProfile',
  'account-security': 'account/security',
  notifications: 'account/notifications',
  addresses: 'address/select',
  'add-address': 'address/map',
  cards: 'cards/cards',
  'add-card': 'cards/add',
  wishlist: 'wishlist/wishlist',
};

/** Reads `/homepage`, `/plp/listing?query=x` or the legacy `#/plp/listing` from a URL. */
export function parsePageUrl(loc: { pathname: string; hash: string; search: string }): { route?: string; params: Record<string, string> } {
  const fromHash = decodeURIComponent(loc.hash.replace(/^#\/?/, ''));
  const [hashPath, hashQuery = ''] = fromHash.split('?');
  const path = decodeURIComponent(loc.pathname.replace(/^\/+|\/+$/g, '')).replace(/(^|\/)index\.html$/, '');
  const route = hashPath || path || undefined;
  const params = Object.fromEntries(new URLSearchParams(hashPath ? hashQuery : loc.search));
  return { route, params };
}
