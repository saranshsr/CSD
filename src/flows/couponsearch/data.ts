import { couponProducts, getProduct, products as noonCatalogue, type Product } from '../../data';
import recentS24 from '@assets/couponsearch/recent-s24.webp';
import recentS25 from '@assets/couponsearch/recent-s25-edge.webp';
import recentIp17pm from '@assets/couponsearch/recent-iphone-17-pro-max.webp';
import recentIp17 from '@assets/couponsearch/recent-iphone-17.webp';
import recentIp16 from '@assets/couponsearch/recent-iphone-16.webp';
import viewedHair from '@assets/couponsearch/viewed-hair-care-masks.webp';
import viewedMobiles from '@assets/couponsearch/viewed-mobiles.webp';
import viewedTv from '@assets/couponsearch/viewed-televisions.webp';
import catMakeup from '@assets/couponsearch/cat-makeup.webp';
import catSkincare from '@assets/couponsearch/cat-skincare.webp';
import catHaircare from '@assets/couponsearch/cat-haircare.webp';
import catBath from '@assets/couponsearch/cat-bath-and-body.webp';
import catGrooming from '@assets/couponsearch/cat-grooming.webp';

/**
 * Copy and mock content for the coupon-scoped search (BEAUTY10). Products come from src/data (`couponProducts`:
 * the beauty items carry `coupon: 'Extra 10% Off'` and are BEAUTY10-eligible, the Seiko watches are not).
 * Item counts are never shown anywhere (stakeholder rule), so nothing here exposes one.
 */
export const coupon = {
  code: 'BEAUTY10',
  title: 'Extra 10% off on beauty',
  value: 'Extra 10% off at checkout',
  /** scoped row subline: "BEAUTY10 · extra 10% off" */
  short: 'extra 10% off',
} as const;

/** The cart the journey starts from (team file 01 · Cart). */
export const cartCopy = {
  savingsTitle: 'Savings & benefits',
  installments: '0% Installments',
  bankInstallments: 'Bank\nInstallments',
  earn: 'Earn',
  cashback: '105 cashback',
  withCard: 'with the noon One credit card.',
  apply: 'Apply',
  raffleAlt: 'Join our Yellow Friday Sale to win a brand new Lucid Air car! Raffle code IPHONE17. Add 700 to unlock the raffle code.',
  checkoutToast: 'Checkout is not part of this demo',
};

export const copy = {
  band: { title: 'Shop eligible products', dismiss: 'Dismiss' },
  hero: { title: 'Extra 10% off', body: 'Skincare, haircare, makeup & more', use: 'Use code' },
  search: { placeholder: 'Search', recent: 'Recently searched', trending: 'Trending searches', viewed: 'Recently viewed categories', banner: 'OSN+ exclusives with noon One' },
  chips: { filter: 'Filter', sort: 'Sort', price: 'Price', face: 'Face', eyes: 'Eyes' },
  pill: { sort: 'Sort', filter: 'Filter', share: 'Share' },
  marketplaces: [
    { id: 'noon', label: 'Wide assortment' },
    { id: 'minutes', label: 'In minutes' },
    { id: 'supermall', label: 'Direct from brand' },
    { id: 'express', label: 'Fulfilled by noon' },
  ],
  row: { lead: 'Search within', tail: '', label: `Search within ${coupon.code}` },
  scoped: { lead: 'Searching within', strong: 'eligible items', viewAll: 'View all', label: `Search within ${coupon.code} eligible items` },
  results: {
    inCoupon: `in ${coupon.code} items`,
    inCouponStrong: `${coupon.code} items`,
    allOfNoon: 'across all of noon',
    noCoupon: `No ${coupon.code} items for`,
    showingAll: 'showing all of noon',
    allCategories: 'in all categories',
  },
  notInDemo: 'Filters and sort are not in this demo',
};

/** The search page's presearch (team file "05 · Search — empty", Iteration 2 empty frames): real product photos. */

export interface RecentTile {
  id: string;
  label: string;
  image: string;
}
export const recentSearches: RecentTile[] = [
  { id: 'r1', label: 's24', image: recentS24 },
  { id: 'r2', label: 's25 edge', image: recentS25 },
  { id: 'r3', label: 'iphone 17 pro max', image: recentIp17pm },
  { id: 'r4', label: 'iPhone 17', image: recentIp17 },
  { id: 'r5', label: 'iPhone 16', image: recentIp16 },
];

/** Always "Trending searches", in every version (never "Popular in BEAUTY10"): two rows, as the frames. */
export const trending: string[][] = [
  ['iphone 17 pro max', 'revlon', 'smartphone deals'],
  ['shoe rack', 'pillow', 'fridge', "men's slippers"],
];

/** "Recently viewed categories" under the OSN+ banner (never a count of items: these are visits). */
export const viewedCategories = [
  { id: 'hair-care-masks', label: 'Hair Care Masks', viewed: '1 Viewed', image: viewedHair },
  { id: 'mobiles', label: 'Mobiles', viewed: '11 Viewed', image: viewedMobiles },
  { id: 'televisions', label: 'Televisions', viewed: '6 Viewed', image: viewedTv },
];

/** The eligible page's category circles (04 · Eligible items). */
export const beautyCategories = [
  { id: 'makeup', label: 'Makeup', image: catMakeup, query: 'makeup' },
  { id: 'skincare', label: 'Skincare', image: catSkincare, query: 'serum' },
  { id: 'haircare', label: 'Haircare', image: catHaircare, query: 'hair serum' },
  { id: 'bath', label: 'Bath and body', image: catBath, query: 'body lotion' },
  { id: 'grooming', label: 'Grooming', image: catGrooming, query: 'shampoo' },
];


/** Search keywords per product (what a shopper types), on top of brand + title. */
const keywords: Record<string, string> = {
  'cs-tord': 'serum face serum niacinamide skincare skin care',
  'cs-vitc': 'serum face serum vitamin c skincare skin care',
  'cs-vitc16': 'serum vitamin c retinol skincare minimalist',
  'cs-mini5': 'serum face serum niacinamide skincare skin care',
  'cs-olaplex': 'serum hair serum hair oil olaplex haircare hair care',
  'cs-sebamed': 'sebamed baby lotion body lotion moisturiser bath and body',
  'cs-nyx': 'setting spray makeup setting spray nyx',
  'cs-rev': 'eyeshadow palette makeup revolution eyes',
  'cs-bondi': 'self tan mousse tanning foam bondi sands',
  'cs-bioderma': 'bioderma sensibio micellar water makeup remover skincare face wash cleanser sheet mask',
  'cs-brush': 'makeup brush set brushes ducare',
  'cs-boj': 'sunscreen spf 50 sun cream beauty of joseon skincare',
  'cs-dove': 'shampoo shower gel dove hair care haircare hair mask',
  'cs-lipstick': 'lipstick lip makeup matte maybelline',
  'cs-mascara': 'mascara eyes lashes makeup waterproof loreal paris',
  'cs-eyeliner': 'eyeliner eyes makeup liner maybelline',
  'cs-kajal': 'kajal kohl eyes makeup essence',
  'cs-foundation': 'foundation liquid foundation serum foundation face makeup base maybelline',
  'cs-concealer': 'concealer face makeup maybelline',
  'cs-blush': 'blush cheek makeup essence',
  'cs-lipbalm': 'lip balm lips sebamed',
  'cs-lipgloss': 'lip gloss lip tint lips makeup essence',
  'cs-nails': 'nail polish nails essie',
  'cs-perfume': 'perfume perfume for women fragrance eau de parfum scent',
  'cs-facewash': 'face wash cleanser skincare cerave',
  'cs-moist': 'moisturiser moisturizer face cream skincare cerave',
  'cs-toner': 'toner skincare face toner medicube',
  'cs-seiko5a': 'seiko watch watches men automatic analog 5 sports',
  'cs-seiko5b': 'seiko watch watches men automatic analog 5 sports',
  'cs-presage': 'seiko watch watches men automatic presage',
};

const words = (s: string) =>
  s
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
const hayOf = new Map<string, string[]>();
const hay = (p: Product) => {
  let h = hayOf.get(p.id);
  if (!h) hayOf.set(p.id, (h = words(`${keywords[p.id] ?? ''} ${p.brand} ${p.title} ${p.category}`)));
  return h;
};
/** every typed word starts a word of the product (typing letter by letter keeps matching) */
const matches = (p: Product, q: string) => {
  const w = words(q);
  return !!w.length && w.every((x) => hay(p).some((h) => h.startsWith(x)));
};

/** The BEAUTY10-eligible items: the eligible-items PLP, in catalogue order. */
export const eligibleProducts: Product[] = couponProducts.filter((p) => !!p.coupon);
const notEligible: Product[] = [...couponProducts.filter((p) => !p.coupon), ...noonCatalogue];

/** Does this (partial) query match any BEAUTY10-eligible item? */
export const isEligibleQuery = (q: string) => eligibleProducts.some((p) => matches(p, q));

export type Scope = 'eligible' | 'all';

/** The typeahead pool, in popularity order (earlier = more searched); `product` shows its photo in the row. */
const pool: [string, string?][] = [
  // the team file's "se" order leads, so "s" / "se" read like the frame
  ['serum', 'cs-tord'],
  ['seiko watches for men', 'cs-seiko5a'],
  ['sebamed baby lotion', 'cs-sebamed'],
  ['setting spray', 'cs-nyx'],
  ['seiko 5', 'cs-seiko5b'],
  ['seiko watch', 'cs-seiko5a'],
  ['serum for face', 'cs-mini5'],
  ['niacinamide serum', 'cs-mini5'],
  ['vitamin c serum', 'cs-vitc'],
  ['hair serum', 'cs-olaplex'],
  ['serum foundation', 'cs-foundation'],
  ['seiko 5 sports', 'cs-seiko5b'],
  ['seiko presage', 'cs-presage'],
  ['seiko automatic watch', 'cs-seiko5b'],
  ['sephora collection'],
  ['self tan mousse', 'cs-bondi'],
  ['sesame hair oil'],
  ['retinol serum', 'cs-vitc16'],
  ['sunscreen spf 50', 'cs-boj'],
  ['shampoo', 'cs-dove'],
  ['shower gel', 'cs-dove'],
  ['sheet mask', 'cs-bioderma'],
  ['lipstick', 'cs-lipstick'],
  ['lip balm', 'cs-lipbalm'],
  ['lip tint', 'cs-lipgloss'],
  ['liquid foundation', 'cs-foundation'],
  ['eyeliner', 'cs-eyeliner'],
  ['eyeshadow palette', 'cs-rev'],
  ['face wash', 'cs-facewash'],
  ['face cream', 'cs-moist'],
  ['foundation', 'cs-foundation'],
  ['moisturiser', 'cs-moist'],
  ['micellar water', 'cs-bioderma'],
  ['mascara', 'cs-mascara'],
  ['makeup brush set', 'cs-brush'],
  ['makeup setting spray', 'cs-nyx'],
  ['hair oil', 'cs-olaplex'],
  ['hair mask', 'cs-dove'],
  ['perfume', 'cs-perfume'],
  ['perfume for women', 'cs-perfume'],
  ['body lotion', 'cs-sebamed'],
  ['bioderma sensibio', 'cs-bioderma'],
  ['olaplex no 7', 'cs-olaplex'],
  ['lip gloss', 'cs-lipgloss'],
  ['lipstick matte', 'cs-lipstick'],
  ['mascara waterproof', 'cs-mascara'],
  ['kajal', 'cs-kajal'],
  ['concealer', 'cs-concealer'],
  ['blush', 'cs-blush'],
  ['nail polish', 'cs-nails'],
  ['toner', 'cs-toner'],
  ['makeup', 'cs-brush'],
  ['maybelline', 'cs-lipstick'],
  ['loreal paris', 'cs-mascara'],
  ['cerave', 'cs-facewash'],
  ['essence', 'cs-blush'],
  // presearch recents / trending, so tapping one still gets real suggestions
  ['iphone 17 pro max'],
  ['iphone 17'],
  ['iphone 16'],
  ['s24'],
  ['s24 ultra'],
  ['s25 edge'],
  ['smartphone deals'],
  ['revlon'],
  ['revlon lipstick'],
  ['shoe rack'],
  ['pillow'],
  ['fridge'],
  ["men's slippers"],
  ['running shoes'],
  ['coffee machine'],
  ['perfume men'],
  ['lego'],
];

export interface Suggestion {
  text: string;
  product?: Product;
  category?: string;
}
const suggestions: (Suggestion & { eligible: boolean })[] = pool.map(([text, id]) => ({ text, product: getProduct(id), category: undefined, eligible: isEligibleQuery(text) }));

/**
 * The typeahead the team file shows, row for row (thumbnails included), for the queries the frames draw: "se" (all of
 * noon / BEAUTY10 only), "serum" and "seiko watch". `eligible` lists the BEAUTY10-only rows when they are not simply
 * the eligible subset of `all`.
 */
const curated: Record<string, { all: [string, string][]; eligible?: [string, string][] }> = {
  se: {
    all: [
      ['serum', 'cs-tord'],
      ['seiko watches for men', 'cs-seiko5a'],
      ['sebamed baby lotion', 'cs-sebamed'],
      ['setting spray', 'cs-nyx'],
      ['seiko 5', 'cs-seiko5b'],
    ],
    eligible: [
      ['serum', 'cs-tord'],
      ['sebamed baby lotion', 'cs-sebamed'],
      ['setting spray', 'cs-nyx'],
      ['hair serum', 'cs-olaplex'],
      ['serum foundation', 'cs-rev'],
    ],
  },
  serum: {
    all: [
      ['serum', 'cs-tord'],
      ['niacinamide serum', 'cs-mini5'],
      ['vitamin c serum', 'cs-vitc'],
      ['hair serum', 'cs-olaplex'],
      ['serum foundation', 'cs-rev'],
    ],
  },
  'seiko watch': {
    all: [
      ['seiko watch', 'cs-seiko5a'],
      ['seiko watches for men', 'cs-seiko5a'],
      ['seiko 5 sports', 'cs-seiko5b'],
      ['seiko presage', 'cs-presage'],
      ['seiko automatic watch', 'cs-seiko5b'],
    ],
  },
};
const row = ([text, id]: [string, string]): Suggestion => ({ text, product: getProduct(id) });

/** At most this many suggestion rows (every typing frame shows five). */
export const MAX_ROWS = 5;

/**
 * Typeahead: the curated frame rows for the frames' queries; otherwise labels that START with the query first, then
 * labels where it starts a word. `eligible` keeps only suggestions that match a BEAUTY10 item. A trailing space
 * counts ("serum " → "serum for face").
 */
export function suggest(q: string, scope: Scope, max = MAX_ROWS): Suggestion[] {
  const s = q.toLowerCase().replace(/^\s+/, '').replace(/\s+/g, ' ');
  if (!s.trim()) return [];
  const c = curated[s.trim()];
  if (c && s === s.trim()) {
    const rows = scope === 'eligible' ? (c.eligible ?? c.all.filter(([t]) => isEligibleQuery(t))) : c.all;
    return rows.slice(0, max).map(row);
  }
  const list = scope === 'eligible' ? suggestions.filter((r) => r.eligible) : suggestions;
  const rank = (needle: string) => {
    const pre: Suggestion[] = [];
    const word: Suggestion[] = [];
    for (const r of list) {
      const l = r.text.toLowerCase();
      if (l.startsWith(needle)) l === needle.trim() ? pre.unshift(r) : pre.push(r);
      else if ((' ' + l).includes(' ' + needle)) word.push(r);
    }
    return [...pre, ...word].slice(0, max).map(({ text, product, category }) => ({ text, product, category }));
  };
  const out = rank(s);
  return out.length || !s.endsWith(' ') ? out : rank(s.trim());
}

/**
 * Results. `eligible`: the BEAUTY10 items that match → `coupon`; none → all of noon (`fallback`), or popular noon
 * items when nothing matches at all. `all`: everything on noon that matches.
 */
export function resultsFor(q: string, want: Scope): { scope: 'coupon' | 'fallback' | 'all'; items: Product[] } {
  const s = q.trim();
  const popular = noonCatalogue.slice(0, 12);
  if (want === 'all') {
    const all = [...eligibleProducts, ...notEligible].filter((p) => matches(p, s));
    return { scope: 'all', items: all.length ? all : popular };
  }
  const eligible = eligibleProducts.filter((p) => matches(p, s));
  if (eligible.length) return { scope: 'coupon', items: eligible };
  const global = notEligible.filter((p) => matches(p, s));
  return { scope: 'fallback', items: global.length ? global : popular };
}
