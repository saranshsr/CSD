import type { CSSProperties } from 'react';
import allIcon from '@assets/home/tabs/nav/all.svg';
import allActive from '@assets/home/tabs/nav/all-active.svg';
import electronicsIcon from '@assets/home/tabs/nav/electronics.svg';
import electronicsActive from '@assets/home/tabs/nav/electronics-active.svg';
import groceryIcon from '@assets/home/tabs/nav/grocery.svg';
import groceryActive from '@assets/home/tabs/nav/grocery-active.svg';
import beautyIcon from '@assets/home/tabs/nav/beauty.svg';
import beautyActive from '@assets/home/tabs/nav/beauty-active.svg';
import fashionIcon from '@assets/home/tabs/nav/fashion.svg';
import fashionActive from '@assets/home/tabs/nav/fashion-active.svg';
import wellnessIcon from '@assets/home/tabs/nav/wellness.svg';
import homeIcon from '@assets/home/tabs/nav/home.svg';
import starAll from '@assets/home/tabs/content/star-all.svg';
import starElectronics from '@assets/home/tabs/content/star-electronics.svg';
import starBeauty from '@assets/home/tabs/content/star-beauty.svg';
import starGrocery from '@assets/home/tabs/content/star-grocery.svg';
import elecHeadphone from '@assets/home/tabs/content/elec-headphone.webp';
import elecMobiles from '@assets/home/tabs/content/elec-mobiles.webp';
import elecLaptop from '@assets/home/tabs/content/elec-laptop.webp';
import cutSmartwatch from '@assets/home/tabs/content/cut-smartwatch.webp';
import beautySkincare from '@assets/home/tabs/content/beauty-skincare.webp';
import beautyHaircare from '@assets/home/tabs/content/beauty-haircare.webp';
import beautyMakeup from '@assets/home/tabs/content/beauty-makeup.webp';
import cutSkinsense from '@assets/home/tabs/content/cut-skinsense.webp';
import nikeHero from '@assets/home/tabs/content/all-cms/nike-hero.webp';
import whoopBanner from '@assets/home/tabs/content/all-cms/whoop-banner-overlay.webp';
import whoopBlack from '@assets/home/tabs/content/all-cms/whoop-black.webp';
import whoopGrey from '@assets/home/tabs/content/all-cms/whoop-grey.webp';
import whoopBlue from '@assets/home/tabs/content/all-cms/whoop-blue.webp';
import whoopSilver from '@assets/home/tabs/content/all-cms/whoop-silver.webp';
import nikeBanner from '@assets/home/tabs/content/all-cms/nike-banner.webp';
import nikeRevolution from '@assets/home/tabs/content/all-cms/nike-revolution.webp';
import nikeDownshifter from '@assets/home/tabs/content/all-cms/nike-downshifter.webp';
import ajmalBanner from '@assets/home/tabs/content/all-cms/ajmal-banner.webp';
import ajmalOud from '@assets/home/tabs/content/all-cms/ajmal-oud.webp';
import ajmalLeatherNoir from '@assets/home/tabs/content/all-cms/ajmal-leather-noir.webp';
import ajmalSilverShade from '@assets/home/tabs/content/all-cms/ajmal-silver-shade.webp';
import ajmalYearn from '@assets/home/tabs/content/all-cms/ajmal-yearn.webp';
import pauseIcon from '@assets/home/tabs/content/all-cms/pause.svg';
import spotlightLogo from '@assets/home/tabs/content/fashion/spotlight-logo.webp';
import argentinaJersey from '@assets/home/tabs/content/fashion/argentina-jersey.webp';
import brazilJersey from '@assets/home/tabs/content/fashion/brazil-jersey.webp';
import realMadridJersey from '@assets/home/tabs/content/fashion/real-madrid-jersey.webp';
import fashionHeart from '@assets/home/tabs/content/fashion/heart.svg';
import fashionDivider from '@assets/home/tabs/content/fashion/divider.svg';
import laundryBack from '@assets/home/tabs/content/grocery-grid/laundry-back.webp';
import laundryMiddle from '@assets/home/tabs/content/grocery-grid/laundry-middle.webp';
import laundryFront from '@assets/home/tabs/content/grocery-grid/laundry-front.webp';
import hydratedLeft from '@assets/home/tabs/content/grocery-grid/hydrated-left.webp';
import hydratedRight from '@assets/home/tabs/content/grocery-grid/hydrated-right.webp';
import tissueLeft from '@assets/home/tabs/content/grocery-grid/tissue-left.webp';
import tissueRight from '@assets/home/tabs/content/grocery-grid/tissue-right.webp';
import juices from '@assets/home/tabs/content/grocery-grid/juices.webp';
import chipsLeft from '@assets/home/tabs/content/grocery-grid/chips-left.webp';
import chipsRight from '@assets/home/tabs/content/grocery-grid/chips-right.webp';
import beveragesLeft from '@assets/home/tabs/content/grocery-grid/beverages-left.webp';
import beveragesRight from '@assets/home/tabs/content/grocery-grid/beverages-right.webp';
import eidCenter from '@assets/home/tabs/content/grocery-grid/eid-center.webp';
import eidBack from '@assets/home/tabs/content/grocery-grid/eid-back.webp';
import eidFront from '@assets/home/tabs/content/grocery-grid/eid-front.webp';
import bulk from '@assets/home/tabs/content/grocery-grid/bulk.webp';

/**
 * Department tabs + their CMS content, 1:1 with ashbun/noon-app `experiments/marketplace-switcher`
 * (sections/TabLayout.jsx, TabContent.jsx, AllCmsContent.jsx, GroceryGridContent.jsx, FashionSponsoredSection.jsx,
 * tabThemes.js). Geometry is Figma's ("Sponsored real estate on app"). Every tile / card opens a PLP for `query`.
 */
export const homeTabs = [
  { id: 'all', label: 'All', icon: allIcon, activeIcon: allActive, size: 24 },
  { id: 'electronics', label: 'Electronics', icon: electronicsIcon, activeIcon: electronicsActive, size: 24, isNew: true },
  { id: 'grocery', label: 'Grocery', icon: groceryIcon, activeIcon: groceryActive, size: 24 },
  { id: 'beauty', label: 'Beauty', icon: beautyIcon, activeIcon: beautyActive, size: 24 },
  { id: 'fashion', label: 'Fashion', icon: fashionIcon, activeIcon: fashionActive, size: 24 },
  { id: 'wellness', label: 'Wellness', icon: wellnessIcon, size: 20 },
  { id: 'home', label: 'Home', icon: homeIcon, size: 20 },
] as const;
export type HomeTabId = (typeof homeTabs)[number]['id'];

type Box = { x: number; y: number; w: number; h: number };
export interface TabTile {
  id: string;
  label: string[];
  query: string;
  labelTop?: number;
  leading?: number;
  /** strip cropped out of Figma's render: carries the tile fill + theme gradient, from `bandTop` to the bottom */
  band?: string;
  bandTop?: number;
  /** transparent cut-out in its Figma clip `box` (`img` = the artwork's own box inside it) */
  cut?: string;
  box?: Box;
  img?: Box;
}

/** Headline + sub-category rail tabs (TabContent). */
export const tabRails: Partial<Record<HomeTabId, { headline: string; star: string; tiles: TabTile[] }>> = {
  electronics: {
    headline: 'Latest Tech Essentials',
    star: starElectronics,
    tiles: [
      { id: 'headphone', label: ['Headphone'], query: 'headphones', labelTop: 10.79, band: elecHeadphone, bandTop: 28 },
      { id: 'mobiles', label: ['Mobiles'], query: 'phone', labelTop: 10.79, band: elecMobiles, bandTop: 28 },
      { id: 'laptop', label: ['Laptop'], query: 'laptop', labelTop: 10.79, band: elecLaptop, bandTop: 28 },
      { id: 'smartwatch', label: ['Smartwatch'], query: 'watch', labelTop: 10.79, cut: cutSmartwatch, box: { x: 12.78, y: 38.61, w: 58.45, h: 58.45 } },
    ],
  },
  beauty: {
    headline: 'Glow Beauty Picks',
    star: starBeauty,
    tiles: [
      { id: 'skincare', label: ['Skincare'], query: 'skincare', band: beautySkincare, bandTop: 28 },
      { id: 'haircare', label: ['Haircare'], query: 'haircare', leading: 14, band: beautyHaircare, bandTop: 28 },
      { id: 'makeup', label: ['Makeup'], query: 'makeup', band: beautyMakeup, bandTop: 28 },
      // the artwork is taller than its clip box and rides up out of it
      { id: 'skinsense', label: ['Skinsense'], query: 'skinsense', cut: cutSkinsense, box: { x: 11.68, y: 42, w: 60.63, h: 50.71 }, img: { x: 3.61, y: -7.99, w: 53.64, h: 80.47 } },
    ],
  },
};
export const tabStars = { all: starAll, grocery: starGrocery };

/** Grocery Essentials 4 × 2 grid: each tile's artwork is a few Figma crops (frame = clip box, image = artwork in it). */
export interface Crop {
  src: string;
  frame: CSSProperties;
  image: CSSProperties;
  blur?: boolean;
  /** rotate the clip 90° inside a box of this size (chips) */
  rotateIn?: CSSProperties;
}
export const groceryTiles: { id: string; label: string[]; leading: number; query: string; wrap?: CSSProperties; crops: Crop[] }[] = [
  {
    id: 'laundry', label: ['Laundry', 'care'], leading: 14, query: 'laundry',
    crops: [
      { src: laundryBack, frame: { left: 'calc(50% + 11.59px)', bottom: -5.49, width: 33.66, height: 43.37, transform: 'translateX(-50%)' }, image: { left: '-10.48%', top: '-21.6%', width: '120.95%', height: '128%' } },
      { src: laundryMiddle, blur: true, frame: { left: 'calc(50% + 2.95px)', bottom: -5.49, width: 12.74, height: 40.34, transform: 'translateX(-50%)' }, image: { inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'bottom' } },
      { src: laundryFront, frame: { left: 'calc(50% - 10.55px)', bottom: -7.91, width: 39.12, height: 59.14, transform: 'translateX(-50%)' }, image: { left: '-17.83%', top: '-3.27%', width: '117.83%', height: '106.05%' } },
    ],
  },
  {
    id: 'hydrated', label: ['Stay', 'hydrated'], leading: 14, query: 'water', wrap: { left: 6.59, top: 46.9, width: 69.23, height: 57.9 },
    crops: [
      { src: hydratedLeft, frame: { left: 'calc(50% - 13.21px)', top: -1.26, width: 26, height: 64.83, transform: 'translateX(-50%)' }, image: { left: '-86.06%', top: '-21.36%', width: '272.13%', height: '148.66%' } },
      { src: hydratedRight, frame: { left: 'calc(50% + 13.07px)', bottom: -2.35, width: 30.52, height: 52.55, transform: 'translateX(-50%)' }, image: { left: '-32.99%', top: '-17.26%', width: '169.07%', height: '133.91%' } },
    ],
  },
  {
    id: 'tissue', label: ['Tissue &', 'rolls'], leading: 16, query: 'tissue',
    crops: [
      { src: tissueLeft, frame: { left: 'calc(50% - 8.69px)', bottom: -10.06, width: 38.12, height: 57.62, transform: 'translateX(-50%)' }, image: { inset: 0, width: '100%', height: '100%', objectFit: 'cover' } },
      { src: tissueRight, frame: { left: 'calc(50% + 7.12px)', bottom: -8.29, width: 47.97, height: 34.57, transform: 'translateX(-50%)' }, image: { left: 0, top: '-46.02%', width: '100%', height: '190.78%' } },
    ],
  },
  {
    id: 'juices', label: ['Juices &', 'drinks'], leading: 16, query: 'juice',
    crops: [{ src: juices, frame: { left: -4.41, top: 41.6, width: 95.61, height: 63.68 }, image: { inset: 0, width: '100%', height: '100%', objectFit: 'cover' } }],
  },
  {
    id: 'chips', label: ['Chips and', 'snacks'], leading: 14, query: 'snacks',
    crops: [
      { src: chipsLeft, rotateIn: { left: 10.13, top: 46.23, width: 42.97, height: 64.65 }, frame: { width: 64.65, height: 42.97 }, image: { left: '-13.29%', top: '-44.29%', width: '124.05%', height: '186.67%' } },
      { src: chipsRight, frame: { left: 41.44, bottom: -7.13, width: 26.27, height: 41.08 }, image: { left: '-27.02%', top: '-14.43%', width: '154.84%', height: '135.37%' } },
    ],
  },
  {
    id: 'beverages', label: ['Beverages'], leading: 14, query: 'beverages', wrap: { left: 5.59, top: 46.9, width: 68.91, height: 57.63 },
    crops: [
      { src: beveragesLeft, frame: { left: 'calc(50% - 12.21px)', top: -0.94, width: 31.81, height: 62.33, transform: 'translateX(-50%)' }, image: { left: '-21.64%', top: '-1.03%', width: '145.31%', height: '101.03%' } },
      { src: beveragesRight, frame: { left: 'calc(50% + 16.3px)', top: 0, width: 23.26, height: 64.21, transform: 'translateX(-50%)' }, image: { inset: 0, width: '100%', height: '100%' } },
    ],
  },
  {
    id: 'eid', label: ['Eid', 'essentials'], leading: 16, query: 'eid',
    crops: [
      { src: eidCenter, frame: { left: 'calc(50% - 9.01px)', bottom: -11.38, width: 51.87, height: 68.17, transform: 'translateX(-50%)' }, image: { left: 0, top: '1.15%', width: '100%', height: '103.67%' } },
      { src: eidBack, blur: true, frame: { left: 33.93, bottom: -11.06, width: 16.71, height: 44.44 }, image: { inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'bottom' } },
      { src: eidFront, frame: { left: 35.26, bottom: -11.06, width: 37.89, height: 49.12 }, image: { left: '-40.74%', top: '-38.1%', width: '176.54%', height: '185.71%' } },
    ],
  },
  {
    id: 'bulk', label: ['Bulk deals'], leading: 16, query: 'bulk', wrap: { left: 5.59, top: 42.6, width: 70.08, height: 58.62 },
    crops: [{ src: bulk, frame: { left: 'calc(50% + 0.17px)', bottom: 0.17, width: 61.15, height: 58.62, transform: 'translateX(-50%)' }, image: { left: '-3.12%', top: '-22.3%', width: '104.18%', height: '148.2%' } }],
  },
];

/** "All" tab CMS widgets (AllCmsContent): Nike video hero, WHOOP, Nike and Ajmal brand cards, 204×324, gap 12. */
export interface PromoItem {
  id: string;
  image: string;
  badge: string;
  title?: string;
  price?: string;
  was?: string;
}
export const cmsWidgets = {
  hero: { image: nikeHero, alt: 'Nike Eid offer', query: 'nike', pause: pauseIcon },
  whoop: {
    banner: whoopBanner, alt: 'WHOOP — Add more life to your years', query: 'whoop', badge: 'var(--nk-color-home-tab-badge-brown)',
    items: [
      { id: 'black', image: whoopBlack, badge: 'Flash Deal' },
      { id: 'grey', image: whoopGrey, badge: 'Flash Deal' },
      { id: 'blue', image: whoopBlue, badge: 'Selling fast' },
      { id: 'silver', image: whoopSilver, badge: 'Selling fast' },
    ] as PromoItem[],
  },
  nike: {
    banner: nikeBanner, alt: 'Nike Eid collection', query: 'nike', badge: 'var(--nk-color-home-tab-badge-blue)',
    items: [
      { id: 'revolution', image: nikeRevolution, badge: 'Eid offer', title: 'NIKE REVOLUTION 8 EASYON', price: '129', was: '299' },
      { id: 'downshifter', image: nikeDownshifter, badge: 'Eid offer', title: 'NIKE DOWNSHIFTER 14', price: '129', was: '299' },
    ] as PromoItem[],
  },
  ajmal: {
    banner: ajmalBanner, alt: 'Ajmal perfumes', query: 'ajmal', badge: 'var(--nk-color-home-tab-badge-red)',
    items: [
      { id: 'oud', image: ajmalOud, badge: 'Flash Deal' },
      { id: 'leather-noir', image: ajmalLeatherNoir, badge: 'Flash Deal' },
      { id: 'silver-shade', image: ajmalSilverShade, badge: 'Flash Deal' },
      { id: 'yearn', image: ajmalYearn, badge: 'Flash Deal' },
    ] as PromoItem[],
  },
};

/** Fashion tab: "Pick your side" sponsored spotlight (FashionSponsoredSection), 133×259 cards. */
export const sponsored = {
  logo: spotlightLogo,
  brand: 'Adidas',
  headline: 'Pick your side',
  heart: fashionHeart,
  divider: fashionDivider,
  items: [
    { id: 'argentina', title: 'Argentina men team jersey Fifa 26', image: argentinaJersey, price: '86', was: '123', off: '45%', box: { left: 10.76, top: 28, width: 99.94, height: 155.86 } },
    { id: 'brazil', title: 'Brazil original team jersey Fifa 26 with world cup', image: brazilJersey, price: '86', was: '123', off: '45% off', box: { left: 8.06, top: 28, width: 109.45, height: 153.54 } },
    { id: 'real-madrid', title: 'Real Madrid original away Jersey for men', image: realMadridJersey, price: '76', was: '123', off: '45%', box: { left: -7.51, top: 22, width: 121.32, height: 157 } },
  ],
};
