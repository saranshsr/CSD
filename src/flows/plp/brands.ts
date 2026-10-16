import type { Product } from '../../data';
import img_apple from '@assets/plp/brands/apple.webp';
import img_samsung from '@assets/plp/brands/samsung.webp';
import img_google from '@assets/plp/brands/google.webp';
import img_xiaomi from '@assets/plp/brands/xiaomi.webp';
import img_honor from '@assets/plp/brands/honor.webp';
import img_oneplus from '@assets/plp/brands/oneplus.webp';
import img_huawei from '@assets/plp/brands/huawei.webp';
import img_motorola from '@assets/plp/brands/motorola.webp';
import img_nothing from '@assets/plp/brands/nothing.webp';
import img_oppo from '@assets/plp/brands/oppo.webp';
import img_vivo from '@assets/plp/brands/vivo.webp';
import img_tecno from '@assets/plp/brands/tecno.webp';
import img_realme from '@assets/plp/brands/realme.webp';
import img_infinix from '@assets/plp/brands/infinix.webp';
import mark_apple from '@assets/plp/brands/mark-apple.svg';
import mark_google from '@assets/plp/brands/mark-google.svg';
import mark_honor from '@assets/plp/brands/mark-honor.svg';
import mark_huawei from '@assets/plp/brands/mark-huawei.svg';
import mark_motorola from '@assets/plp/brands/mark-motorola.svg';
import mark_oneplus from '@assets/plp/brands/mark-oneplus.svg';
import mark_oppo from '@assets/plp/brands/mark-oppo.svg';
import mark_samsung from '@assets/plp/brands/mark-samsung.svg';
import mark_vivo from '@assets/plp/brands/mark-vivo.svg';
import mark_xiaomi from '@assets/plp/brands/mark-xiaomi.svg';
import coin_apple from '@assets/plp/brands/coin-apple.svg';
import coin_samsung from '@assets/plp/brands/coin-samsung.svg';
import coin_google from '@assets/plp/brands/coin-google.svg';
import coin_xiaomi from '@assets/plp/brands/coin-xiaomi.svg';

export interface BrandCard {
  /** must equal the catalogue's `Product.brand` — "View {brand}" filters the grid to it */
  brand: string;
  /** media panel tint (the photo multiplies into it) */
  tint: string;
  image: string;
  /** Figma image box (left, top, width, height) inside the 204×139 media */
  box: [number, number, number, number];
  /** wordmark (`mark` + its size) or a letter badge; `label` is the name next to it */
  logo: { mark?: string; w?: number; h?: number; letter?: string; label?: string };
  name: string;
  /** sale price, formatted (the dirham sign is added by the card) */
  now: string;
  was?: string;
  off?: string;
  /** shown instead of was / off */
  note?: string;
  /** values for `BrandWidgetConfig.spec` (the last is the rating) */
  specs: [string, string, string, string];
}

export interface BrandWidgetConfig {
  title: string;
  /** "Showing all {brand} {noun}" */
  noun: string;
  spec: [string, string, string, string];
  cards: BrandCard[];
  /** the selected bar's coin mark per brand, where the Figma has one (12px marks, the 19px Samsung wordmark) */
  coins: Record<string, [string, number, number]>;
}

/**
 * "Shop phones by brand" (Brand Widget PLP, Figma 1214:145919 / State 16 "Cards" rail 1232:10203): 14 brand
 * flagships, 1:1 with github.com/saswata2002/Brand-Widget-PLP app.js PHONE_CARDS. Photos and marks:
 * src/assets/plp/brands (resized from the repo's assets/brands).
 */
export const phoneBrands: BrandWidgetConfig = {
  title: 'Shop phones by brand',
  noun: 'phones',
  spec: ['Best for', 'Storage', 'Colour', 'Rating'],
  coins: { Apple: [coin_apple, 12, 12], Samsung: [coin_samsung, 19.2455, 2.9], Google: [coin_google, 12, 12], Xiaomi: [coin_xiaomi, 12, 12] },
  cards: [
    { brand: 'Apple', tint: '#fff3ea', image: img_apple, box: [52.281, 1.624, 98.992, 134.996], logo: { mark: mark_apple, w: 11, h: 11, label: 'Apple' }, name: 'iPhone 17 Pro Max', now: '4,649', was: '5,099', off: '8% off', specs: ['Pro camera', '256GB', 'Cosmic Orange', '4.5'] }, // token-lint-ignore: per-brand mock tint (server data)
    { brand: 'Samsung', tint: '#f2f3f7', image: img_samsung, box: [36.259, -23.319, 136.251, 185.806], logo: { mark: mark_samsung, w: 52.56, h: 7.92 }, name: 'Galaxy S25 Ultra', now: '2,799', was: '5,099', off: '45% off', specs: ['S Pen & work', '256GB', 'Titanium Grey', '4.7'] }, // token-lint-ignore: per-brand mock tint (server data)
    { brand: 'Google', tint: '#eff6f0', image: img_google, box: [38.203, -18.036, 126.833, 172.962], logo: { mark: mark_google, w: 11, h: 11, label: 'Google' }, name: 'Pixel 10 Pro', now: '3,584', note: 'Lowest in 7 days', specs: ['Google AI', '256GB', 'Jade', '5.0'] }, // token-lint-ignore: per-brand mock tint (server data)
    { brand: 'Xiaomi', tint: '#f8f1ee', image: img_xiaomi, box: [44.296, -11.39, 117.727, 160.544], logo: { mark: mark_xiaomi, w: 11, h: 11, label: 'Xiaomi' }, name: 'Xiaomi 15T', now: '1,679', was: '1,999', off: '16% off', specs: ['Max storage', '512GB', 'Rose Gold', '4.4'] }, // token-lint-ignore: per-brand mock tint (server data)
    { brand: 'Honor', tint: '#eef6f6', image: img_honor, box: [53.498, 3.358, 97.004, 132.285], logo: { mark: mark_honor, w: 41.597, h: 8 }, name: 'Magic 8 Pro', now: '3,499', was: '5,448', off: '35% off', specs: ['AI camera', '512GB', 'Sky Cyan', '4.7'] }, // token-lint-ignore: per-brand mock tint (server data)
    { brand: 'OnePlus', tint: '#f3f3f5', image: img_oneplus, box: [39.492, -13.568, 121.694, 165.953], logo: { mark: mark_oneplus, w: 11, h: 11, label: 'OnePlus' }, name: 'OnePlus 15', now: '3,199', note: 'Selling out fast', specs: ['Performance', '512GB', 'Infinite Black', '4.2'] }, // token-lint-ignore: per-brand mock tint (server data)
    { brand: 'HUAWEI', tint: '#fff4ec', image: img_huawei, box: [59.548, 7.098, 91.118, 124.258], logo: { mark: mark_huawei, w: 14.602, h: 11, label: 'HUAWEI' }, name: 'Pura 90s Pro Max', now: '3,999', was: '4,499', off: '11% off', specs: ['Tele zoom', '512GB', 'Orange Ocean', '4.3'] }, // token-lint-ignore: per-brand mock tint (server data)
    { brand: 'motorola', tint: '#f6f1ec', image: img_motorola, box: [46.996, -5.165, 107.241, 146.244], logo: { mark: mark_motorola, w: 11, h: 11, label: 'motorola' }, name: 'Edge 70 Pro', now: '2,499', was: '2,999', off: '16% off', specs: ['Pantone design', '512GB', 'Chicory Coffee', '4.7'] }, // token-lint-ignore: per-brand mock tint (server data)
    { brand: 'Nothing', tint: '#f4f4f5', image: img_nothing, box: [37.464, -16.009, 126.393, 172.362], logo: { letter: 'N', label: 'Nothing' }, name: 'Phone (3)', now: '2,098', was: '2,799', off: '25% off', specs: ['Unique design', '256GB', 'Black', '4.6'] }, // token-lint-ignore: per-brand mock tint (server data)
    { brand: 'OPPO', tint: '#f3f3f6', image: img_oppo, box: [52.37, 1.718, 99.41, 135.565], logo: { mark: mark_oppo, w: 33.6547, h: 8 }, name: 'Reno13 Pro', now: '1,499', was: '1,899', off: '21% off', specs: ['Portraits', '512GB', 'Graphite Grey', '3.7'] }, // token-lint-ignore: per-brand mock tint (server data)
    { brand: 'vivo', tint: '#f8f4ee', image: img_vivo, box: [56.566, 5.445, 91.004, 124.102], logo: { mark: mark_vivo, w: 30.5018, h: 8 }, name: 'X300 Pro', now: '3,829', was: '4,699', off: '18% off', specs: ['ZEISS camera', '512GB', 'Dune Brown', '4.2'] }, // token-lint-ignore: per-brand mock tint (server data)
    { brand: 'TECNO', tint: '#f3f4f6', image: img_tecno, box: [37.485, -17.926, 128.644, 175.432], logo: { letter: 'T', label: 'TECNO' }, name: 'POVA Slim 5G', now: '949', note: 'Selling out fast', specs: ['Slim design', '256GB', 'Cool Black', '4.3'] }, // token-lint-ignore: per-brand mock tint (server data)
    { brand: 'realme', tint: '#f6f2fb', image: img_realme, box: [45.798, -7.425, 112.067, 152.826], logo: { letter: 'r', label: 'realme' }, name: 'C100i', now: '529', was: '649', off: '18% off', specs: ['Big battery', '128GB', 'Dawn Purple', '4.1'] }, // token-lint-ignore: per-brand mock tint (server data)
    { brand: 'Infinix', tint: '#eff6f1', image: img_infinix, box: [52.125, 3.019, 97.393, 132.815], logo: { letter: 'X', label: 'Infinix' }, name: 'GT 50 Pro', now: '2,079', note: 'Free Delivery', specs: ['Gaming', '512GB', 'Black Abyss', '4.6'] }, // token-lint-ignore: per-brand mock tint (server data)
  ],
};

/** The widget for a results page, if its query has one, limited to brands the results actually have. */
export function brandWidgetFor(isPhone: boolean, results: Product[]): BrandWidgetConfig | undefined {
  if (!isPhone) return undefined;
  const have = new Set(results.map((p) => p.brand));
  const cards = phoneBrands.cards.filter((c) => have.has(c.brand));
  return cards.length > 1 ? { ...phoneBrands, cards } : undefined;
}
