import { leafName, products as baseProducts, type Product } from '../../data';
import { phoneProducts } from '../../data';

/** The PLP's catalogue: the shared demo products plus the brand widget's phones (src/mocks/phones.ts). */
export const products: Product[] = [...baseProducts, ...phoneProducts];

export type SortId = 'recommended' | 'priceAsc' | 'priceDesc' | 'rating' | 'new' | 'discount';

export const sortOptions: { id: SortId; label: string }[] = [
  { id: 'recommended', label: 'Recommended' },
  { id: 'priceAsc', label: 'Price: Low to High' },
  { id: 'priceDesc', label: 'Price: High to Low' },
  { id: 'rating', label: 'Best Rated' },
  { id: 'new', label: 'New Arrivals' },
  { id: 'discount', label: 'Biggest Discount' },
];

export type FacetId = 'delivery' | 'arrives' | 'category' | 'brand' | 'price' | 'rating' | 'deals';

/** NoonFiltersV2 renderer per group (FilterPageRenderers / FilterGroupRenderers): fulfilment cards, pills, rating cards, range slider */
export type FacetKind = 'fulfillment' | 'pills' | 'cards' | 'range';

export interface FacetOption {
  id: string;
  label: string;
  test: (p: Product) => boolean;
  /** fulfilment card logo (FilterFulfillmentCard `image_url` + `background_color`) */
  logo?: 'supermall' | 'express' | 'global';
}

export interface Facet {
  id: FacetId;
  label: string;
  kind: FacetKind;
  options: FacetOption[];
}

/** leaf category name ("Smartphones"), the category the live filters list; falls back to the top category */
export const leafCategory = (p: Product) => leafName(p.categoryId) ?? p.category;

/** price facet value is one `"min-max"` string (FilterRangeSlider) */
export const priceRange = (v?: string) => {
  const [min, max] = (v ?? '').split('-').map(Number);
  return Number.isFinite(min) && Number.isFinite(max) ? { min, max } : null;
};
export const priceBounds = { min: Math.floor(Math.min(...products.map((p) => p.price))), max: Math.ceil(Math.max(...products.map((p) => p.price))) };

const uniq = <T,>(a: T[]) => [...new Set(a)];

/** Group order and copy follow the live search filters (bappzaar NoonFiltersScreenV2; "phone" search, 2026-10-14 reference). */
export const facets: Facet[] = [
  {
    id: 'delivery',
    label: 'Delivery',
    kind: 'fulfillment',
    options: [
      { id: 'supermall', label: 'Direct from brand', logo: 'supermall', test: (p) => !!p.supermall },
      { id: 'express', label: 'Fulfilled by noon', logo: 'express', test: (p) => !!p.express },
      { id: 'global', label: 'Sourced Globally', logo: 'global', test: (p) => !p.express && !p.supermall },
    ],
  },
  { id: 'arrives', label: 'Arrives by', kind: 'pills', options: [{ id: 'today', label: 'Today', test: (p) => /today|get in/i.test(p.delivery ?? '') }] },
  { id: 'category', label: 'Category', kind: 'pills', options: uniq(products.map(leafCategory)).map((c) => ({ id: c, label: c, test: (p) => leafCategory(p) === c })) },
  { id: 'brand', label: 'Brand', kind: 'pills', options: uniq(products.map((p) => p.brand)).map((b) => ({ id: b, label: b, test: (p) => p.brand === b })) },
  {
    id: 'price',
    label: 'Price',
    kind: 'range',
    options: [],
  },
  {
    id: 'rating',
    label: 'Product Rating',
    kind: 'cards',
    options: [
      { id: '4.5', label: '4.5 & above', test: (p) => p.rating >= 4.5 },
      { id: '4', label: '4 & above', test: (p) => p.rating >= 4 },
      { id: '3', label: '3 & above', test: (p) => p.rating >= 3 },
    ],
  },
  // deal_tag facet (the live "Deals" nav pill): products on a deal = with a was-price
  { id: 'deals', label: 'Deals', kind: 'pills', options: [{ id: 'sale', label: 'On sale', test: (p) => !!p.was && p.was > p.price }] },
];

export type Filters = Partial<Record<FacetId, string[]>>;

export function applyFilters(list: Product[], filters: Filters) {
  return list.filter((p) =>
    facets.every((f) => {
      const sel = filters[f.id];
      if (!sel?.length) return true;
      if (f.kind === 'range') {
        const r = priceRange(sel[0]);
        return !r || (p.price >= r.min && p.price <= r.max);
      }
      return f.options.filter((o) => sel.includes(o.id)).some((o) => o.test(p));
    }),
  );
}

export function applySort(list: Product[], sort: SortId) {
  const l = [...list];
  const off = (p: Product) => (p.was ? (p.was - p.price) / p.was : 0);
  switch (sort) {
    case 'priceAsc':
      return l.sort((a, b) => a.price - b.price);
    case 'priceDesc':
      return l.sort((a, b) => b.price - a.price);
    case 'rating':
      return l.sort((a, b) => b.rating - a.rating);
    case 'new':
      return l.reverse();
    case 'discount':
      return l.sort((a, b) => off(b) - off(a));
    default:
      return l;
  }
}

/** Generic phone searches ("phone", "mobiles", "smartphone"…) — they open the brand widget PLP. */
export const isPhoneQuery = (query?: string) => /^(mobile\s*)?(phone|phones|mobile|mobiles|smartphone|smartphones)$/.test(query?.trim().toLowerCase() ?? '');

/** One of each brand in turn (the Brand Widget PLP's "phone" mix), keeping each brand's own order. */
function byBrandInTurn(list: Product[]) {
  const groups = new Map<string, Product[]>();
  list.forEach((p) => groups.set(p.brand, [...(groups.get(p.brand) ?? []), p]));
  const out: Product[] = [];
  for (let k = 0; out.length < list.length; k++) groups.forEach((g) => g[k] && out.push(g[k]));
  return out;
}

/** Narrow the catalogue by query when it matches something, otherwise show everything (demo). */
export function searchProducts(query?: string) {
  const q = query?.trim().toLowerCase();
  if (!q) return products;
  if (isPhoneQuery(q)) return byBrandInTurn(products.filter((p) => p.category === 'Mobiles'));
  const hit = products.filter((p) => `${p.brand} ${p.title} ${p.category}`.toLowerCase().includes(q));
  return hit.length >= 2 ? hit : products;
}

export const countFilters = (f: Filters) => Object.values(f).reduce((n, v) => n + (v?.length ?? 0), 0);
