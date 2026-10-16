import { categoryById } from '../../data';
import emptyErrorImage from '@assets/categories/empty-error@3x.webp';
import { liveCategoriesPage } from './data.live';

/**
 * Categories tab content. On master the whole page is CMS (`DynamicLoaderScreen unstructured="/categories"` →
 * `type: "static"` → StaticPage modules). The live UAE page is two modules:
 *   1. adBannerModule "pre-search-banner-ocm" (one banner, shouldFetchAds false, no `isAdBanner` → no "Ad" tag)
 *   2. collapsibleBannerModule "category-nav-all-categories" (29 main banners × 5–7 sub banners, numPerRow 3)
 * The snapshot lives in data.live.ts; swap `categoriesPage` for your own content.
 */
export interface CmsSubBanner {
  title: string;
  /** CMS linkUrl (app deep link / static page / catalog). The kit pushes the PLP instead. */
  linkUrl: string;
  /** webp file name in src/assets/categories */
  image: string;
}

export interface CmsMainBanner {
  title: string;
  /** CMS `label` (analytics category code); null for Mahali / Gift Cards */
  label: string | null;
  image: string;
  subBanners: CmsSubBanner[];
}

export interface CmsCategoriesPage {
  adBanner: { image: string; linkUrl: string; ratio: number };
  moduleHeader: { titleText: string };
  numPerRow: number;
  banners: CmsMainBanner[];
}

export const categoriesPage: CmsCategoriesPage = liveCategoriesPage;

const assets = import.meta.glob<string>('../../assets/categories/*.webp', { eager: true, import: 'default' });
/** webp URL for a CMS image name */
export const asset = (name: string) => assets[`../../assets/categories/${name}.webp`] ?? '';

/** Main banner id used for `?open=` deep links: the image slug (`cat-mobiles-accessories` → `mobiles-accessories`). */
export const bannerId = (b: CmsMainBanner) => b.image.replace(/^cat-/, '');

/** "View all" / "Shop All" sub banners open the parent category. */
const isViewAll = (s: CmsSubBanner) => /^(view|shop) all$/i.test(s.title.trim());

/** PLP query for a sub banner tap (the app opens `linkUrl` in a DynamicLoaderScreen — a store page or catalog). */
export const plpQuery = (main: CmsMainBanner, sub: CmsSubBanner) => (isViewAll(sub) ? main.title : sub.title);

/**
 * Taxonomy node for a main banner (src/mocks/categories.ts). Mobiles & Accessories reuses the PDP breadcrumb node;
 * the rest are the `nav-*` nodes appended there from the CMS "View all" links.
 */
export const taxonomyFor = (main: CmsMainBanner) => categoryById(bannerId(main) === 'mobiles-accessories' ? 'mobiles-and-accessories' : `nav-${bannerId(main)}`);

/** Copy: marketplaces/noon/locale/translations/noon-en.json + src/locale/translations/en.json (master). */
export const copy = {
  /** noon-en `noon_search_placeholder` (StaticPage.renderTopSection passes no animatedSearchConfig) */
  searchPlaceholder: 'What are you looking for?',
  /** en `empty_view_error_title` / `empty_view_error_message` / `retry` (EmptyView default branch) */
  errorTitle: 'Oops! Something went wrong.',
  errorMessage: "This doesn't seem right! Let us try to sort this out.",
  retry: 'Retry',
  /** demo-only toast for the pre-search banner (static CMS page, not in the kit) */
  adToast: 'Opens the Emirates NBD noon One Credit Card page (CMS static page)',
};

export const images = { emptyError: emptyErrorImage };
