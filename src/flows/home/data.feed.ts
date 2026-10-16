// Home feed · bappzaar modules (master ba159e20). Module order, types, titles, links, ratios and spacing follow the
// live noon UAE app home CMS payload (`api-app.noon.com/_svc/catalog/api/v3/u/`, captured Oct 2026), rendered by
// NoonHomeToggleContent → StaticPage → Module → ModuleRenderer. Creatives: the payload's own f.nooncdn.com images
// (src/assets/home/bz/) or the kit's earlier captures of the same CMS slots (src/assets/home/*.webp, exact ratios).
// Ad slots that the payload leaves empty (filled at runtime by AdsService / GAM) are listed but not rendered, except
// top-fold-2 (the Soundcore creative) and one sfu slot (strip-01, ratio 25) so the ad geometry shows.
import { currency, getProduct, IPHONE_17_PRO_ID, type Product } from '../../data';
import welcomeStrip from '@assets/home/bz/welcome-strip-01.webp';
import preSearchStrip from '@assets/categories/ad-pre-search-banner.webp';
import soundcore from '@assets/home/eid/soundcore-liberty-5-pro.webp';
import midscrollHeader from '@assets/home/bz/midscroll-header-01.webp';
import emaar from '@assets/home/bz/emaar-01.webp';

const kit = import.meta.glob<string>('../../assets/home/*.webp', { eager: true, import: 'default' });
const bzAssets = import.meta.glob<string>('../../assets/home/bz/*.webp', { eager: true, import: 'default' });
const k = (name: string) => kit[`../../assets/home/${name}.webp`];
const b = (name: string) => bzAssets[`../../assets/home/bz/${name}.webp`];
const nn = (n: number) => String(n).padStart(2, '0');

/** A CMS banner: creative + where it goes (plp query or a route). */
export interface BzBanner {
  image: string;
  alt: string;
  query: string;
  /** CMS ratio = height / width · 100 */
  ratio: number;
}

/** ModuleWrapper (noon branch): paddingTop / paddingBottom = innerPadding, marginBottom = removeExternalSpacing ? 0 : bottomMargin (24). */
export interface BzWrap {
  pt: number;
  pb: number;
  mb: number;
  /** CMS bgColor (css value) */
  bg?: string;
}

/** ModuleHeader: CMS titleText, optional titleColor, linkText + linkUrl ("View all"), isTruncated. */
export interface BzHeader {
  title: string;
  color?: string;
  link?: { text: string; query: string };
  truncate?: boolean;
}

/** `hidden`: kept in the payload order but not rendered (a kit choice, not a CMS field) */
export type BzModule = { key: string; wrap: BzWrap; header?: BzHeader; hidden?: boolean } & (
  | { type: 'adBannerModuleCarousel'; banners: BzBanner[]; /** banner-level removeCurvedCorners */ flat?: boolean }
  | { type: 'noonDynamicCarousel' }
  | { type: 'bannerModuleScroller'; rows: number; numPerRow: number; banners: BzBanner[] }
  | { type: 'adBannerModule' | 'bannerModule'; banner: BzBanner; ad?: { bottom: number; right: number }; creativeAd?: boolean; crop?: Record<string, string> }
  | { type: 'productCarousel'; products: Product[] }
  | { type: 'easyBannerScroller' | 'adEasyBannerScroller'; numPerView: number; rows: number; banners: BzBanner[] }
  | { type: 'hpMegaDealModule' }
  | { type: 'adProductLedDisplayModule'; product: Product }
  | { type: 'itemCarousel' }
  | { type: 'bannerModuleCarousel'; numPerView: number; mediaHeader?: { image: string; ratio: number; query: string }; banners: BzBanner[] }
);

const banners = (prefix: string, count: number, ratio: number, queries: string[], pick: (n: number) => string = (n) => b(`${prefix}-${nn(n)}`)): BzBanner[] =>
  Array.from({ length: count }, (_, i) => ({ image: pick(i + 1), alt: queries[i] ?? prefix, query: queries[i] ?? prefix, ratio }));

const wrap = (pt: number, pb: number, mb: number, bg?: string): BzWrap => ({ pt, pb, mb, bg });
const viewAll = (query: string) => ({ text: 'View all', query });
// demo pool: one of each product family (real photos first where the mock has one), so neighbouring rails differ
const poolIds = [
  'home-airpods-pro-2', 'N70283860V', 'p3', 'home-whirlpool-7kg', IPHONE_17_PRO_ID, 'p7', 'Z49C27F88DD3370F190CAZ', 'p5', 'N70187031V', 'p8',
  'home-maynos-mount', 'p12', 'N70211592V', 'p9', 'N70270614V', 'p10', 'ZF1A24406870D3964331CZ', 'p4', 'p6', 'p11', 'N70140492V', 'p2', 'p13', 'p1',
];
const pool = poolIds.map((id) => getProduct(id)).filter((p): p is Product => !!p);
const withImage = pool.filter((p) => p.image);
const slice = (from: number, n = 8) => Array.from({ length: n }, (_, i) => pool[(from + i) % pool.length]);

// category icons: the kit's capture of the same CMS slot (tile-01…20, ratio 139.08, labels baked in)
const categoryIcons = [
  'Deals', 'Mobiles', 'Beauty', "Women's fashion", 'Home appliances', 'Wearables', 'Grocery', 'Televisions', 'Cameras', "Men's care",
  'Electronics', 'Laptops', 'Gift cards', "Men's fashion", 'Health & nutrition', 'Backpacks', 'Handbags', 'Footwear', 'Gaming', 'Personal care',
];
const categoryTiles: number[] = [2, 12, 3, 13, 4, 14, 5, 15, 6, 16, 1, 17, 7, 11, 8, 18, 9, 19, 10, 20];

export const homeFeed: BzModule[] = [
  // 1–3 interstitialDisplayAd, floatingReviewReminderModule, videoFloatingModule: overlay / floating, nothing in the payload to show
  // 4 homepage-toggle: adBannerModuleCarousel, npv 1.1, iS 15, autoScroll, removeCurvedCorners, innerPadding 0/10, removeExternalSpacing
  {
    key: 'homepage-toggle',
    type: 'adBannerModuleCarousel',
    hidden: true, // hidden on request (2026-10-13): the FIRST15 cashback + Emirates NBD strips under the search bar
    wrap: wrap(0, 10, 0),
    flat: true,
    banners: [
      { image: welcomeStrip, alt: 'Welcome to noon, code FIRST15', query: 'Welcome offer', ratio: 10.81 },
      { image: preSearchStrip, alt: 'Emirates NBD noon One credit card', query: 'noon One credit card', ratio: 10.81 },
    ],
  },
  // 5 homepage-hero-slider-banner-vertical: noonDynamicCarousel (Figma creatives kept, live CMS geometry)
  { key: 'hero', type: 'noonDynamicCarousel', wrap: wrap(0, 0, 24) },
  // 6 homepage-category-icons: bannerModuleScroller, numPerRow 3.7, 2 rows, innerPadding 0/10, removeExternalSpacing
  {
    key: 'homepage-category-icons',
    type: 'bannerModuleScroller',
    wrap: wrap(0, 10, 0),
    rows: 2,
    numPerRow: 3.7,
    banners: categoryTiles.map((n, i) => ({ image: k(`tile-${nn(n)}`), alt: categoryIcons[i], query: categoryIcons[i], ratio: 139.08 })),
  },
  // 7 homepage-top-fold-2: adBannerModule, numPerRow 1, ratio 25, innerPadding 0/16, removeExternalSpacing, label bottom 16 right 22
  {
    key: 'homepage-top-fold-2',
    type: 'adBannerModule',
    wrap: wrap(0, 16, 0),
    banner: { image: soundcore, alt: 'Soundcore Liberty 5 Pro Series, sponsored', query: 'soundcore liberty 5 pro', ratio: 25 },
    // the Soundcore creative (Figma 89:34783) carries the "Ad" mark where Sponsored draws it (bottom-right)
    creativeAd: true,
    crop: { left: '-5.42%', top: '-13.95%', width: '109.67%', height: '126.74%' },
  },
  // 8 Best picks for you (innerPadding 10/16, removeExternalSpacing)
  { key: 'best-picks', type: 'productCarousel', wrap: wrap(10, 16, 0), header: { title: 'Best picks for you', truncate: true }, products: slice(0) },
  // 9 homepage-offers-for-you-section: adEasyBannerScroller npv 2.5, 1 row
  {
    key: 'offers-for-you',
    type: 'adEasyBannerScroller',
    wrap: wrap(10, 10, 24),
    header: { title: 'Offers for you', color: 'var(--nk-color-text-product)', truncate: true },
    numPerView: 2.5,
    rows: 1,
    banners: banners('offer', 10, 130.3, ['Bank offers', 'Cashback', 'noon One', 'Credit card offers', 'Tabby', 'Electronics deals', 'Beauty deals', 'Fashion deals', 'Home deals', 'Grocery deals'], (n) => k(`offer-${nn(n)}`)),
  },
  // 10–12 homepage-sfu-monet ×3: adBannerModule ratio 25 (ad slots; one shown with a captured ratio-25 creative)
  {
    key: 'sfu-monet',
    type: 'adBannerModule',
    wrap: wrap(0, 0, 24),
    banner: { image: k('strip-01'), alt: 'Outdoor season, sponsored', query: 'Outdoor season', ratio: 25 },
    ad: { bottom: 8, right: 22 },
  },
  // 13 Bestsellers for you (titleColor #404553)
  { key: 'bestsellers', type: 'productCarousel', wrap: wrap(0, 0, 24), header: { title: 'Bestsellers for you', color: 'var(--nk-color-text-legacy)', truncate: true }, products: slice(6) },
  // 14 homepage-in-the-spotlight-section: easyBannerScroller npv 2.5, innerPadding 5/10, removeExternalSpacing
  {
    key: 'in-the-spotlight',
    type: 'easyBannerScroller',
    wrap: wrap(5, 10, 0),
    header: { title: 'In the spotlight', color: 'var(--nk-color-text-product)', truncate: true },
    numPerView: 2.5,
    rows: 1,
    banners: banners('spotlight', 10, 139.77, ['AI laptops', 'Halloween', 'Outdoor', 'Dettol', 'Laptop accessories', 'Mahali', 'Perfumes', 'Sneakers', 'Gaming', 'Kitchen'], (n) => k(`spotlight-${nn(n)}`)),
  },
  // 15 Extra 250 · 16 Lowest prices on top brands
  { key: 'extra-250', type: 'productCarousel', wrap: wrap(10, 0, 24), header: { title: `Up to ${currency} 250 cashback | Code: EXTRA250`, link: viewAll('EXTRA250') }, products: slice(12) },
  { key: 'lowest-prices', type: 'productCarousel', wrap: wrap(10, 0, 24), header: { title: 'Lowest prices on top brands', link: viewAll('Lowest prices') }, products: slice(3) },
  // 17 homepage-mega-deals
  { key: 'mega-deals', type: 'hpMegaDealModule', wrap: wrap(10, 0, 24, 'var(--nk-color-home-bz-mega-bg)'), header: { title: 'Mega deals', color: 'var(--nk-color-home-bz-mega-ink)', link: viewAll('Mega deals'), truncate: true } },
  // 18 Homepage-adProductLedDisplay (stacked card; the slot is ad-filled server-side)
  { key: 'pld', type: 'adProductLedDisplayModule', wrap: wrap(10, 0, 24), product: withImage[1] },
  // 19 homepage-crossmp-slider: ad slots, not filled → nothing
  // 20 Previously browsed products
  { key: 'previously-browsed', type: 'productCarousel', wrap: wrap(0, 0, 24), header: { title: 'Previously browsed products', truncate: true }, products: slice(9) },
  // 21 homepage-discount-zone: easyBannerScroller npv 3.5, 2 rows (brick offset 0.5), titleColor #404553
  {
    key: 'discount-zone',
    type: 'easyBannerScroller',
    wrap: wrap(5, 10, 24),
    header: { title: 'Maximize your savings', color: 'var(--nk-color-text-legacy)', truncate: true },
    numPerView: 3.5,
    rows: 2,
    banners: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 16, 17, 18, 19, 20, 21, 22, 23].map((n) => ({ image: k(`saving-${nn(n)}`), alt: 'Savings', query: 'Savings', ratio: 188.29 })),
  },
  // 22 Top deals in large appliances · 23 homepage-beauty-carousel
  { key: 'appliances', type: 'productCarousel', wrap: wrap(0, 0, 24), header: { title: `Extra 10% off up to ${currency} 150 | Code: APPLIANCE10`, link: viewAll('Large appliances') }, products: slice(15) },
  { key: 'fragrance', type: 'productCarousel', wrap: wrap(0, 0, 24), header: { title: 'Buy 2 Get 10% off  |  Code : FRAGRANCE10', link: viewAll('Fragrance') }, products: slice(18) },
  // 24 homepage-admon-carousel: ad carousel, needs an ad fill → nothing
  // 25 homepage-keep-shopping
  { key: 'keep-shopping', type: 'itemCarousel', wrap: wrap(0, 0, 24), header: { title: 'Keep shopping for', truncate: true } },
  // 26 homepage-strip-slider: adBannerModuleCarousel npv 1.1, ratio 41.25, innerPadding 10/10, removeExternalSpacing
  {
    key: 'strip-slider',
    type: 'adBannerModuleCarousel',
    wrap: wrap(10, 10, 0),
    banners: [
      { image: b('strip-slider-01'), alt: 'Halloween pumpkins', query: 'Halloween', ratio: 41.29 },
      { image: k('banner-01'), alt: 'Featured', query: 'Featured', ratio: 41.25 },
      { image: b('strip-slider-02'), alt: 'ISDIN iPhone raffle', query: 'ISDIN', ratio: 41.29 },
      { image: k('banner-02'), alt: 'Featured', query: 'Featured', ratio: 41.25 },
      { image: k('banner-03'), alt: 'Featured', query: 'Featured', ratio: 41.25 },
    ],
  },
  // 27 Extra 10% off | HOME50 · 28 Top bulk deals in grocery
  { key: 'home50', type: 'productCarousel', wrap: wrap(0, 0, 24), header: { title: 'Extra 10% off | Use code HOME50', link: viewAll('Home') }, products: slice(21) },
  { key: 'grocery', type: 'productCarousel', wrap: wrap(0, 10, 24), header: { title: 'Top bulk deals in grocery', link: viewAll('Grocery') }, products: slice(24) },
  // 29–31 upper-mid-monet: ad slots → nothing
  // 32–34 category sections (bannerModuleCarousel, npv 3.5, iS 15, free scroll)
  category('women', "Women's fashion", 158.54, ['Tops', 'Dresses', 'Activewear', 'Pants & leggings', 'Sandals', 'Shoes', 'Handbags'], "Women's fashion"),
  category('men', "Men's fashion", 158.54, ['T-shirts & polos', 'Pants', 'Luggage', 'Sportswear', 'Shoes', 'Accessories', 'Jackets'], "Men's fashion"),
  category('beauty', 'Beauty', 175.61, ['Makeup', 'Skincare', 'Personal care devices', 'Hair care', 'Styling tools', "Men's grooming", 'Bath & body'], 'Beauty', wrap(0, 0, 24)),
  // 35 mpu-monet, 36 googleAdBannerModule (GAM): ad slots → nothing
  category('home-kitchen', 'Home & kitchen', 175.61, ['Cookware', 'Storage', 'Serveware', 'Lighting', 'Bedding', 'Tools', 'Furniture'], 'Home & kitchen'),
  // 38 home appliances: same module as 37 (omitted)
  // 39 homepage-explore-more-icons: easyBannerScroller npv 3, bg #f9f2a4, innerPadding 0/10, removeExternalSpacing
  {
    key: 'explore-more',
    type: 'easyBannerScroller',
    wrap: wrap(0, 10, 0, 'var(--nk-color-home-bz-explore-bg)'),
    header: { title: 'Explore More', color: 'var(--nk-color-home-bz-title-grey)', truncate: true },
    numPerView: 3,
    rows: 1,
    banners: banners('explore', 7, 146.15, ['Supermarket', 'Mashreq savings account', 'noon One credit card', 'Gift cards', 'Deals', 'Mahali', 'Highly rated']),
  },
  // 40 homepage-midscroll-out-app: bannerModuleCarousel with a media header (food dine-out)
  {
    key: 'midscroll',
    type: 'bannerModuleCarousel',
    wrap: wrap(10, 10, 0),
    numPerView: 3.5,
    mediaHeader: { image: midscrollHeader, ratio: 7.43, query: 'Dine out' },
    banners: banners('midscroll', 5, 170.73, ['Dine out', 'Dine out', 'Dine out', 'Dine out', 'Dine out']),
  },
  category('electronics', 'Electronics', 175.61, ['Audio & video', 'Gaming', 'Cameras', 'Tablets', 'Gaming accessories', 'Games', 'Projectors'], 'Electronics', wrap(0, 0, 24)),
  // 42–43 mobiles, laptops: same module (omitted)
  // 44 homepage-kids-fashion-category-section: bannerModuleScroller, 1 row, numPerRow 3.5
  {
    key: 'kids',
    type: 'bannerModuleScroller',
    wrap: wrap(0, 0, 24),
    header: { title: "Kids' fashion", link: viewAll("Kids' fashion"), truncate: true },
    rows: 1,
    numPerRow: 3.5,
    banners: banners('kids', 7, 158.54, ['Kids t-shirts', 'All kids t-shirts', 'Clothing sets', 'Girls dresses', 'Kids sportswear', 'Boys shoes', 'Backpacks']),
  },
  // 45–55 further category sections: same module as 32 (omitted)
  // 56 homepage-emaar-strip: bannerModule grid, ratio 25.22, innerPadding top 15
  { key: 'emaar', type: 'bannerModule', wrap: wrap(15, 0, 24), banner: { image: emaar, alt: 'Emaar properties', query: 'Emaar', ratio: 25.22 } },
  // 57 footerTextLinks: not a StaticModuleTypes type on master → renders nothing
];

function category(slug: string, title: string, ratio: number, labels: string[], query: string, w: BzWrap = wrap(0, 0, 24)): BzModule {
  return { key: slug, type: 'bannerModuleCarousel', wrap: w, header: { title, link: viewAll(query), truncate: true }, numPerView: 3.5, banners: banners(slug, 7, ratio, labels) };
}

/** hpMegaDealModule slots (POST dynamic-widget/megadeals-ae in the app): 4 SKU call-outs, the first with the CMS tag. */
export const megaDeals = withImage.slice(2, 6).map((p, i) => ({ product: p, tag: i === 0 ? 'Mobile deals' : undefined }));

/** itemCarousel "Keep shopping for" (user_search_history hits): the searched term + a result image + description pill. */
const searches = ['airpods pro', 'galaxy s26 ultra', 'washing machine', 'iphone 17 pro', 'airpods max', 'galaxy z fold 7', 'tv wall mount', 'huawei mate xt'];
export const keepShoppingItems = withImage.slice(0, searches.length).map((p, i) => ({ id: p.id, title: searches[i], image: p.image as string, description: 'Shop now', query: searches[i] }));
