import keepCaret from '@assets/home/2025/keep/caret.svg';
import keepDualsense from '@assets/home/2025/keep/dualsense.webp';
import keepJacket from '@assets/home/2025/keep/jacket.webp';
import keepPlaystation from '@assets/home/2025/keep/playstation.webp';
import keepSerum from '@assets/home/2025/keep/serum.webp';
import keepSneakers from '@assets/home/2025/keep/sneakers.webp';
import brandLogo from '@assets/home/2025/brand/nike-logo.webp';
import brandPoster from '@assets/home/2025/brand/video-poster.webp';
import launchPs5 from '@assets/home/2025/launches/ps5-pro.webp';
import offerDash from '@assets/home/2025/offers/delivery-dash.webp';
import offerEnbd from '@assets/home/2025/offers/enbd-cashback.webp';
import offerOne from '@assets/home/2025/offers/noon-one.webp';
import { currency, productById } from '../../data';

/**
 * Homepage Revamp 2025 module data (Figma iRE9RwO94eMAyW3j3XKNXW): Offers for you 1337:5485, Keep shopping for 1337:5804,
 * the sponsored brand module 1337:6106 and NEW LAUNCHES 1337:6582. Copy is live text; only artwork is in the images.
 */

/* ── Offers for you ── */

export type OfferTicket = {
  id: string;
  /** panel artwork (campaign colour, texture, glow and logo; no copy) */
  art: string;
  /** 2.5px ticket stroke (flow gradient token) */
  border: string;
  title: string;
  /** sub copy, one entry per line */
  sub: string[];
  /** `sm` = 11/12 (two-line copy), `md` = 12/14 (wrapping copy) */
  subSize: 'sm' | 'md';
  cta: string;
  query: string;
};

export const offerTickets: OfferTicket[] = [
  { id: 'enbd', art: offerEnbd, border: 'var(--nk-color-home-offer-border-enbd)', title: '10% Cashback', sub: ['on all spends with', 'noon ENBD card'], subSize: 'sm', cta: 'Apply Now', query: 'noon ENBD credit card' },
  { id: 'dash', art: offerDash, border: 'var(--nk-color-home-offer-border-dash)', title: `Win ${currency} 100`, sub: ['Play & win', 'instant rewards'], subSize: 'sm', cta: 'Play Now', query: 'Delivery Dash' },
  { id: 'one', art: offerOne, border: 'var(--nk-color-home-offer-border-one)', title: '10% Cashback', sub: ['on noon, supermall, food & minutes'], subSize: 'md', cta: 'Try Now', query: 'noon One' },
];

/* ── Keep shopping for ── */

export type RecentItem = {
  id: string;
  /** search = recently searched (search icon, "n Viewed"); viewed = viewed list ("2 days ago", purple chip); collection = saved collection */
  kind: 'search' | 'viewed' | 'collection';
  label: string;
  chip: string;
  /** collection chips: tinted (bg) or plain text */
  chipTinted?: boolean;
  tag?: string;
  image: string;
  /** image box (Figma sizes) */
  box: { width: number; height: number };
  /** image placement inside the box: width/height and offset from the box centre (Figma) */
  img: { width: number; height: number; dx: number; dy: number };
  query: string;
};

const searchBox = { width: 114, height: 130 };
const collectionImg = { width: 86, height: 75, dx: 0, dy: 7.5 };

export const recentItems: RecentItem[] = [
  { id: 'ps5', kind: 'search', label: 'Playstation 5', chip: '2 Viewed', image: keepDualsense, box: searchBox, img: { width: 129, height: 67, dx: -2.5, dy: 7.1 }, query: 'Playstation 5' },
  { id: 'adidas', kind: 'search', label: 'Adidas Rivalry', chip: '5 Viewed', image: keepSneakers, box: searchBox, img: { width: 100, height: 100, dx: 3, dy: 2.6 }, query: 'Adidas Rivalry' },
  { id: 'serum', kind: 'search', label: 'Body serum', chip: '1 Viewed', image: keepSerum, box: searchBox, img: { width: 80, height: 82, dx: -2.78, dy: 3.53 }, query: 'Body serum' },
  { id: 'evo', kind: 'viewed', label: 'Evo Sl', chip: '10 Products', tag: '2 days ago', image: keepJacket, box: { width: 107, height: 122 }, img: { width: 100, height: 100, dx: -3.5, dy: 1.5 }, query: 'Evo SL' },
  { id: 'col-1', kind: 'collection', label: 'Playstation 5', chip: '2 Products', chipTinted: true, tag: '2 days ago', image: keepPlaystation, box: { width: 100, height: 114 }, img: collectionImg, query: 'Playstation 5' },
  { id: 'col-2', kind: 'collection', label: 'Playstation 5', chip: '2 Products', chipTinted: true, tag: '2 days ago', image: keepPlaystation, box: { width: 100, height: 114 }, img: collectionImg, query: 'Playstation 5' },
  { id: 'col-3', kind: 'collection', label: 'Playstation 5', chip: '2 Products', tag: '2 days ago', image: keepPlaystation, box: { width: 100, height: 114 }, img: collectionImg, query: 'Playstation 5' },
  { id: 'col-4', kind: 'collection', label: 'Playstation 5', chip: '4 Products', image: keepPlaystation, box: { width: 100, height: 114 }, img: collectionImg, query: 'Playstation 5' },
];

export { keepCaret };

/* ── Sponsored brand module ── */

export const brandAd = {
  title: 'SUMMER ESSENTIALS',
  sub: 'Enjoy extra 30% off with no min. spend.',
  logo: brandLogo,
  logoAlt: 'Nike',
  poster: brandPoster,
  /** no video asset in the Figma; set a URL here to play it muted and looped over the poster */
  video: undefined as string | undefined,
  query: 'Nike summer essentials',
  /** Figma SKUs 1337:6123 / 6203 / 6270 (shared catalogue entries, images from the same Figma fills) */
  products: ['home-airpods-pro-2', 'home-whirlpool-7kg', 'home-maynos-mount'].map(productById),
  deliveryNote: 'Free Delivery',
  /** SkuCard options per product (Figma 1337:6123 / 6203 / 6270): fulfilment pill, image box, sponsored "Ad" tag */
  cards: {
    'home-airpods-pro-2': { fulfilment: 'expressToday', imageSize: 122 },
    'home-whirlpool-7kg': { fulfilment: 'express', imageSize: 142 },
    'home-maynos-mount': { fulfilment: 'expressToday', imageSize: 122, sponsored: true },
  } as Record<string, { fulfilment: 'express' | 'expressToday'; imageSize: number; sponsored?: boolean }>,
};

/* ── NEW LAUNCHES ── */

export type LaunchItem = { id: string; title: string; body: string; cta: string; image: string; query: string };

export const launches = {
  title: ['NEW', 'LAUNCHES'] as const,
  sub: 'Now available on noon',
  items: [
    { id: 'ps5-pro', title: 'The best Playstation!', body: 'Limitless entertainment with the new Playstation 5 Pro', cta: 'Shop Now', image: launchPs5, query: 'Playstation 5 Pro' },
    { id: 'ps5-game', title: 'Ready to game on?', body: 'Limitless entertainment with the new Playstation 5 Pro', cta: 'Shop Now', image: launchPs5, query: 'Playstation 5 Pro' },
  ] satisfies LaunchItem[],
};
