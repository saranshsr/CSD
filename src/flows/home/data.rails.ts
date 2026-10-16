import { productById, type Product } from '../../data';
import type { SkuFulfilment } from '../../components';
import forYouIcon from '@assets/home/2025/tabs/for-you.svg';
import electronicsIcon from '@assets/home/2025/tabs/electronics.svg';
import beautyIcon from '@assets/home/2025/tabs/beauty.svg';
import fashionIcon from '@assets/home/2025/tabs/fashion.svg';
import homeIcon from '@assets/home/2025/tabs/home.svg';
import hyaluronicMask from '@assets/home/2025/categories/hyaluronic-mask.webp';
import pinkCleanser from '@assets/home/2025/categories/pink-cleanser.webp';
import wasabi from '@assets/home/2025/categories/wasabi.webp';
import pringles from '@assets/home/2025/categories/pringles.webp';
import mapleSyrup from '@assets/home/2025/categories/maple-syrup.webp';
import espressoMachine from '@assets/home/2025/categories/espresso-machine.webp';
import leverEspresso from '@assets/home/2025/categories/lever-espresso.webp';
import cardsGame from '@assets/home/2025/categories/cards-game.webp';
import zeldaGame from '@assets/home/2025/categories/zelda-game.webp';
import headphones from '@assets/home/2025/categories/headphones.webp';
import smartwatch from '@assets/home/2025/categories/smartwatch.webp';
import hairStraightener from '@assets/home/2025/categories/hair-straightener.webp';
import shampoo from '@assets/home/2025/categories/shampoo.webp';
import pinkDress from '@assets/home/2025/categories/pink-dress.webp';
import sneakers from '@assets/home/2025/categories/sneakers.webp';

/* ───────────── Shop by category (Figma 1337:5151 › Cat Grid) ───────────── */

/**
 * One product cut-out inside a 92×128 category tile. `x / y / w / h` are the Figma layer box (tile coordinates,
 * rotated layers already centred in their rotation bounds); `shadow` is the Figma drop-shadow stack
 * (`a` = soft downward, `b` = soft leftward); `fit: 'coverBottom'` = object-fit cover anchored bottom.
 */
export interface CategoryLayer {
  src: string;
  x: number;
  y: number;
  w: number;
  h: number;
  rotate?: number;
  flipY?: boolean;
  shadow?: 'a' | 'b';
  fit?: 'coverBottom';
}

export interface CategoryTileData {
  id: string;
  /** live label, 2 lines max (`\n` = Figma line break) */
  label: string;
  /** PLP query on tap */
  query: string;
  sale?: boolean;
  layers: CategoryLayer[];
}

const beauty = (dx: number, dy: number): CategoryLayer[] => [
  { src: hyaluronicMask, x: 3.21 + dx, y: 18.15 + dy, w: 66.3, h: 66.3, shadow: 'a' },
  { src: pinkCleanser, x: 37.47 + dx, y: 28.31 + dy, w: 53.04, h: 53.04, shadow: 'b' },
];
const toys = (x2: number): CategoryLayer[] => [
  { src: cardsGame, x: -4.42, y: 12.16, w: 70.72, h: 70.72, shadow: 'a' },
  { src: zeldaGame, x: x2, y: 27.63, w: 32.71, h: 53.04, shadow: 'b' },
];

/** Row 1 (1337:5167) then row 2 (1337:5207), in Figma order. */
export const categoryRows: CategoryTileData[][] = [
  [
    { id: 'beauty', label: 'Beauty & Skin Care', query: 'Beauty & Skin Care', sale: true, layers: beauty(0, 0) },
    {
      id: 'grocery',
      label: 'Grocery \n& Kitchen',
      query: 'Grocery & Kitchen',
      layers: [
        { src: wasabi, x: -2.75, y: 32.25, w: 56.99, h: 56.99, rotate: -17.5, shadow: 'a' },
        { src: pringles, x: 34, y: 13, w: 26, h: 76 },
        { src: mapleSyrup, x: 36, y: 25, w: 67, h: 68, shadow: 'b' },
      ],
    },
    {
      id: 'home-appliances',
      label: 'Home Appliances',
      query: 'Home Appliances',
      layers: [
        { src: espressoMachine, x: -16, y: 2, w: 99, h: 99 },
        { src: leverEspresso, x: 34, y: 8, w: 74, h: 84 },
      ],
    },
    { id: 'beauty-2', label: 'Beauty & Skin Care', query: 'Beauty & Skin Care', layers: beauty(-1, -6) },
    {
      id: 'grocery-2',
      label: 'Grocery \n& Kitchen',
      query: 'Grocery & Kitchen',
      layers: [
        { src: wasabi, x: -2.31, y: 18.04, w: 65.08, h: 65.08, rotate: -8.28, shadow: 'a' },
        { src: mapleSyrup, x: 7.73, y: 0, w: 90.61, h: 90.61, shadow: 'b' },
      ],
    },
  ],
  [
    { id: 'toys', label: 'Toys \n& Games', query: 'Toys & Games', layers: toys(49.52) },
    {
      id: 'electronics',
      label: 'Electronics & Tools',
      query: 'Electronics & Tools',
      layers: [
        { src: headphones, x: -3.94, y: 6.74, w: 77.89, h: 78.1 },
        { src: smartwatch, x: 32.84, y: 25, w: 54.15, h: 54.15, shadow: 'a' },
      ],
    },
    {
      id: 'hair-care',
      label: 'Hair Care',
      query: 'Hair Care',
      layers: [
        { src: hairStraightener, x: 4.36, y: 9.8, w: 63.24, h: 71.11, rotate: 102.83, flipY: true, shadow: 'a' },
        { src: shampoo, x: 29.08, y: 5.07, w: 67.97, h: 83.33, rotate: 0.77, shadow: 'b' },
      ],
    },
    {
      id: 'fashion',
      label: 'Shoes & Clothes',
      query: 'Shoes & Clothes',
      layers: [
        { src: pinkDress, x: -4.74, y: -1.11, w: 80.67, h: 75.14, fit: 'coverBottom', shadow: 'a' },
        { src: sneakers, x: 19.79, y: 5.52, w: 80.67, h: 80.67, rotate: -90, shadow: 'b' },
      ],
    },
    { id: 'toys-2', label: 'Toys \n& Games', query: 'Toys & Games', layers: toys(47.52) },
  ],
];

/* ───────────── SKU rails (Figma 1337:5233 · 1337:5572 · 1337:6349) ───────────── */

/** A product in a home rail plus the SKU variations the Figma shows on it. */
export interface RailItem {
  id: string;
  badge?: string | null;
  sponsored?: boolean;
  fulfilment?: SkuFulfilment | null;
  imageSize?: number;
  /** defaults to "Free Delivery" */
  deliveryNote?: string;
}

/** The three Figma SKUs: Best Seller + express Today · sponsored ("Ad") + express · express Today. */
const figmaTrio: RailItem[] = [
  { id: 'home-airpods-pro-2', badge: 'Best Seller', fulfilment: 'expressToday' },
  { id: 'home-whirlpool-7kg', sponsored: true, fulfilment: 'express', imageSize: 142 },
  { id: 'home-maynos-mount', badge: null, fulfilment: 'expressToday' },
];

export interface RailTab {
  id: string;
  label: string;
  icon: string;
  items: RailItem[];
}

/** "Recommended for you" icon tabs (Figma 1337:5239): For you · Electronics · Beauty · Fashion · Home. */
export const recommendedTabs: RailTab[] = [
  {
    id: 'for-you',
    label: 'For you',
    icon: forYouIcon,
    items: [...figmaTrio, { id: 'N70211593V', fulfilment: 'expressToday' }, { id: 'N70283860V', badge: null }, { id: 'Z49C27F88DD3370F190CAZ', badge: null }],
  },
  {
    id: 'electronics',
    label: 'Electronics',
    icon: electronicsIcon,
    items: [{ id: 'home-airpods-pro-2', fulfilment: 'expressToday' }, { id: 'N70283855V', sponsored: true }, { id: 'N70187031V', fulfilment: 'expressToday' }, { id: 'Z49C27F88DD3370F190CAZ' }, { id: 'N70142941V' }],
  },
  { id: 'beauty', label: 'Beauty', icon: beautyIcon, items: [{ id: 'p7', fulfilment: 'expressToday' }, { id: 'p12' }, { id: 'p6', sponsored: true }] },
  { id: 'fashion', label: 'Fashion', icon: fashionIcon, items: [{ id: 'p3', fulfilment: 'expressToday' }, { id: 'p6' }, { id: 'p12', sponsored: true }] },
  {
    id: 'home',
    label: 'Home',
    icon: homeIcon,
    items: [{ id: 'home-whirlpool-7kg', imageSize: 142, fulfilment: 'expressToday' }, { id: 'p8', sponsored: true }, { id: 'p4' }, { id: 'p13' }, { id: 'p14' }],
  },
];

/** Bestsellers (1337:5572) and Selling out fast (1337:6349): the Figma trio, then more of the catalogue. */
export const productRails: Record<'bestsellers' | 'sellingOutFast', RailItem[]> = {
  bestsellers: [...figmaTrio, { id: 'N70211592V', badge: 'Best Seller', fulfilment: 'expressToday' }, { id: 'N70306064V', badge: null }, { id: 'ZF1A24406870D3964331CZ', badge: null }],
  sellingOutFast: [...figmaTrio, { id: 'N70140492V', badge: null, fulfilment: 'expressToday' }, { id: 'Z7D7DFFC169EA7DE817A2Z', badge: null }, { id: 'N70270614V', badge: null }],
};

/** Resolve a rail item to its product (unknown ids fall back to the first product, as `productById` does). */
export const railProduct = (item: RailItem): Product => productById(item.id);
