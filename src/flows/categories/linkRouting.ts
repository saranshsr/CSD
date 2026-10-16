/**
 * Where a CMS `linkUrl` goes when a banner on the Categories tab is tapped — bappzaar master
 * `src/utils/ModuleHelper.ts` `handlePress` (prefix branches, then the default DynamicLoaderScreen push),
 * `features/giftcards/utils/GiftCardsUtil.ts` and `NavigationUtil.isProductUrl`.
 *
 * Only the branches a noon Categories link can hit are listed; everything else is the default:
 * `noon.DynamicLoaderScreen` (`GET /_svc/catalog/api/v3/u<linkUrl>`, rendered by the response `type`:
 * `static` → StaticPage, `catalog` → NoonCatalogList, `detail` → NoonProductDetails). The full linkUrl, query
 * included (`sort[by]`, `f[is_fbn]`, `limit`), goes to the server unchanged; the client never parses it.
 */
export type LinkDestination =
  | { kind: 'dynamicLoader'; screen: 'noon.DynamicLoaderScreen' | 'noon.DynamicLoaderBlankHeaderScreen'; product: boolean }
  | { kind: 'giftCards'; screen: 'noon.GiftCardsLandingScreen' | 'noon.GiftCardsCategoryScreen'; categoryCode?: string }
  | { kind: 'cobrand'; screen: 'noon.CobrandLandingScreen' }
  | { kind: 'deepLink'; link: string }
  | { kind: 'noonOne'; screen: 'noon.VIPLandingScreen' }
  | { kind: 'external'; url: string };

/** NavigationUtil.isProductUrl */
const PRODUCT_URL = /^.*\/[A-Z0-9_-]+\/p[/?]?.*$/;

export function destinationOf(linkUrl: string): LinkDestination {
  if (/^(https?:|mailto:)/.test(linkUrl)) return { kind: 'external', url: linkUrl };
  if (linkUrl.startsWith('noon:')) return { kind: 'deepLink', link: linkUrl };
  if (linkUrl.startsWith('/cobrand') || linkUrl.startsWith('/emirates-nbd-noon-one-credit-card')) return { kind: 'cobrand', screen: 'noon.CobrandLandingScreen' };
  if (linkUrl.startsWith('/noonvip') || linkUrl === '/noon-one') return { kind: 'noonOne', screen: 'noon.VIPLandingScreen' };
  if (linkUrl.startsWith('/gift-cards') && !linkUrl.startsWith('/gift-cards/orders')) {
    const path = linkUrl.split('?')[0].replace(/\/+$/, '');
    return path === '/gift-cards'
      ? { kind: 'giftCards', screen: 'noon.GiftCardsLandingScreen' }
      : { kind: 'giftCards', screen: 'noon.GiftCardsCategoryScreen', categoryCode: path.split('/').pop() };
  }
  const product = PRODUCT_URL.test(linkUrl);
  return { kind: 'dynamicLoader', screen: product ? 'noon.DynamicLoaderBlankHeaderScreen' : 'noon.DynamicLoaderScreen', product };
}

/**
 * Best guess at the DynamicLoaderScreen response type before fetching: catalog paths carry a sort / filter query or
 * a category path (`/beauty/makeup-16142`); single slugs (`/mobiles`, `/gaminghub`, `/skincare-store`) are
 * usually CMS store / hub pages. `npm run categories:fetch` replaces the guess with the real `type`.
 */
export function guessPageType(linkUrl: string): 'static' | 'catalog' | 'unknown' {
  const query = decodeURIComponent(linkUrl.split('?')[1] ?? '');
  const path = linkUrl.split('?')[0].replace(/^\/|\/$/g, '');
  if (/(^|&)(sort\[|f\[|limit=)/.test(query) || path.includes('/')) return 'catalog';
  if (/^[\w-]+$/.test(path)) return 'static';
  return 'unknown';
}
