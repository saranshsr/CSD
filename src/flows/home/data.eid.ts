// Eid home top (Figma Af34gfmhQ1D0wstXUEHSIF · 89:34398): hero / brand banner carousel (89:34722) and the full-width ad (89:34782).
import nikeEidOffer from '@assets/home/eid/nike-eid-offer.webp';
import areejHeader from '@assets/home/eid/areej-header.webp';
import areejAlOud from '@assets/home/eid/areej-al-oud.webp';
import areejArabicAroma from '@assets/home/eid/areej-arabic-aroma.webp';
import soundcore from '@assets/home/eid/soundcore-liberty-5-pro.webp';
import whoopBanner from '@assets/home/tabs/content/all-cms/whoop-banner-overlay.webp';
import whoopBlack from '@assets/home/tabs/content/all-cms/whoop-black.webp';
import whoopGrey from '@assets/home/tabs/content/all-cms/whoop-grey.webp';
import whoopBlue from '@assets/home/tabs/content/all-cms/whoop-blue.webp';
import whoopSilver from '@assets/home/tabs/content/all-cms/whoop-silver.webp';

/** A brand-module tile: image box 98×124 with a notch; `title` + prices only on the one-row (detailed) variant. */
export interface EidTile {
  id: string;
  image: string;
  tag: string;
  title?: string;
  price?: number;
  was?: number;
}

export type EidSlide =
  /** "Hero Section Widgets" full-bleed creative (image or video); `video` shows the pause / play action */
  | { kind: 'hero'; id: string; image: string; alt: string; query: string; ad: boolean; video?: boolean }
  /** "Hero Section Widgets" brand banner: header creative + 2 tiles with details, or 4 image-only tiles */
  | {
      kind: 'brand';
      id: string;
      tone: 'dark' | 'light';
      alt: string;
      query: string;
      ad: boolean;
      banner: { image: string; left: number; top: number; width: number; height: number };
      tagBg: string;
      tiles: EidTile[];
    };

export const eidSlides: EidSlide[] = [
  // I89:34732 — Nike "EID OFFER 30% OFF", a video banner (no video file in the Figma: poster image + pause toggle)
  { kind: 'hero', id: 'nike', image: nikeEidOffer, alt: 'Nike Eid offer, 30% off on select styles', query: 'nike', ad: true, video: true },
  // I89:34742 — Areej dark brand module: header creative (204×255 at top −6.78 in the 204×152 slot) + 2 detailed tiles
  {
    kind: 'brand',
    id: 'areej',
    tone: 'dark',
    alt: 'Areej perfumes, Eid special',
    query: 'areej perfume',
    ad: true,
    banner: { image: areejHeader, left: 0, top: -6.78, width: 204, height: 255.28 },
    tagBg: 'var(--nk-palette-deep-green)',
    tiles: [
      { id: 'al-oud', image: areejAlOud, tag: 'Eid Special', title: 'Haramain Areej Al Oud EDP 100ml', price: 129, was: 299 },
      { id: 'arabic-aroma', image: areejArabicAroma, tag: 'Eid Special', title: 'AREEJ the arabic aroma EDP 100ml', price: 239, was: 399 },
    ],
  },
  // I89:34751 — WHOOP light brand module: banner crop as the Figma "S" frame + 4 image-only tiles
  {
    kind: 'brand',
    id: 'whoop',
    tone: 'light',
    alt: 'WHOOP, add more life to your years',
    query: 'whoop',
    ad: false,
    banner: { image: whoopBanner, left: -9.88, top: -217.57, width: 247.107, height: 535.712 },
    tagBg: 'var(--nk-color-home-tab-badge-brown)',
    tiles: [
      { id: 'black', image: whoopBlack, tag: 'Flash Deal' },
      { id: 'grey', image: whoopGrey, tag: 'Flash Deal' },
      { id: 'blue', image: whoopBlue, tag: 'Selling fast' },
      { id: 'silver', image: whoopSilver, tag: 'Selling fast' },
    ],
  },
];

/** 89:34783 — Soundcore full-width ad (the creative carries its own "Ad" mark, as in the Figma). Image crop from the Figma fill. */
export const eidAdBanner = {
  image: soundcore,
  alt: 'Soundcore Liberty 5 Pro Series, sponsored',
  query: 'soundcore liberty 5 pro',
  crop: { left: '-5.42%', top: '-13.95%', width: '109.67%', height: '126.74%' },
};
