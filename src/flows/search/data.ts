import { products } from '../../data';
import { phoneProducts } from '../../data';

export const recentSearches = [
  { id: 'r1', label: 'AirPods Pro', emoji: '🎧', tint: '#EEF2F8' }, // token-lint-ignore: per-item mock tint (server data)
  { id: 'r2', label: 'Running shoes', emoji: '👟', tint: '#F4F1EC' }, // token-lint-ignore: per-item mock tint (server data)
  { id: 'r3', label: 'Perfume men', emoji: '🧴', tint: '#F2EFEA' }, // token-lint-ignore: per-item mock tint (server data)
  { id: 'r4', label: 'PS5', emoji: '🎮', tint: '#EDF0F7' }, // token-lint-ignore: per-item mock tint (server data)
  { id: 'r5', label: 'Coffee machine', emoji: '☕️', tint: '#F3EEEA' }, // token-lint-ignore: per-item mock tint (server data)
  { id: 'r6', label: 'LEGO', emoji: '🏎️', tint: '#FBEEEE' }, // token-lint-ignore: per-item mock tint (server data)
];

export const trending = ['phone', 'iphone 17', 'air fryer', 'samsung s25', 'perfumes', 'gaming chair', 'watch', 'sneakers', 'skincare'];

const terms = [
  // the Brand Widget PLP design's "phone" rows (920:15423), then the catalogue
  ...['phone', 'phone charging cable', 'phone charger', 'phone 256gb', 'phone fast charger'].map((t) => ({ text: t, category: t === 'phone' ? 'Mobiles' : undefined, product: undefined })),
  ...[...products, ...phoneProducts].map((p) => ({ text: `${p.brand} ${p.title.replace(/[()]/g, '').split(' ').slice(0, 3).join(' ')}`.toLowerCase(), category: p.category, product: p })),
  ...['airpods', 'airpods pro', 'air fryer', 'air purifier', 'apple watch', 'iphone 17 pro max', 'iphone case', 'samsung galaxy', 'sauvage dior', 'shoes for men', 'ps5 games', 'laptop bag', 'lego technic', 'espresso machine'].map(
    (t) => ({ text: t, category: undefined, product: undefined }),
  ),
].filter((t, i, all) => all.findIndex((x) => x.text === t.text) === i);

export type Suggestion = (typeof terms)[number];

/** Up to 8 suggestions containing the query; ones that start with it come first (as you type, letter by letter). */
export function suggest(q: string) {
  const s = q.trim().toLowerCase();
  if (!s) return [];
  const hit = terms.filter((t) => t.text.includes(s));
  return [...hit.filter((t) => t.text.startsWith(s)), ...hit.filter((t) => !t.text.startsWith(s))].slice(0, 8);
}
