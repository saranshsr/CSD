import foodImg from '@assets/switcher/food.png';
import foodSel from '@assets/switcher/food-selected.png';
import foodCmp from '@assets/switcher/food-compact.png';
import foodCmpSel from '@assets/switcher/food-compact-selected.png';
import moneyImg from '@assets/switcher/money.png';
import moneySel from '@assets/switcher/money-selected.png';
import moneyCmp from '@assets/switcher/money-compact.png';
import moneyCmpSel from '@assets/switcher/money-compact-selected.png';
import noonImg from '@assets/switcher/noon.png';
import noonCmp from '@assets/switcher/noon-compact.png';
import instantImg from '@assets/switcher/nooninstant.gif';
import instantCmp from '@assets/switcher/nooninstant-compact.png';
import nownowImg from '@assets/switcher/noonnownow.png';
import nownowCmp from '@assets/switcher/noonnownow-compact.png';
import rocketImg from '@assets/switcher/rocket.png';
import rocketSel from '@assets/switcher/rocket-selected.png';
import rocketCmp from '@assets/switcher/rocket-compact.png';
import rocketCmpSel from '@assets/switcher/rocket-compact-selected.png';
import servicesImg from '@assets/switcher/services.gif';
import servicesCmp from '@assets/switcher/services-compact.png';
import { palette } from '../../foundations/palette';

export const rotatingWords = ['iPhone 17', 'AirPods', 'perfumes', 'sneakers', 'air fryer'];

// Marketplace switcher: whoami.experiences[].switcherConfig (bappzaar __tests__/marketplaces/food/testing/Responses/WhoamiResponse.json).
// Logos are the CMS assets from that fixture, downloaded to src/assets/switcher. Live order/logos come from whoami.

export type Experience = { key: string; name: string; bkgColor: string; image: string; selectedImage: string; imageCompact: string; selectedImageCompact: string };

const exp = (key: string, name: string, bkgColor: string, image: string, imageCompact: string, selectedImage = image, selectedImageCompact = imageCompact): Experience => ({
  key, name, bkgColor, image, selectedImage, imageCompact, selectedImageCompact,
});

export const experiences: Experience[] = [
  exp('noon', 'noon', palette.yellowColor, noonImg, noonCmp),
  exp('rocket', 'supermall', palette.rocketBlueSapphire, rocketImg, rocketCmp, rocketSel, rocketCmpSel),
  exp('food', 'Food', palette.kitPink63, foodImg, foodCmp, foodSel, foodCmpSel),
  exp('nooninstant', 'Minutes', palette.yellowColor, instantImg, instantCmp),
  exp('noonnownow', 'Stores', palette.kitOrange50, nownowImg, nownowCmp),
  exp('services', 'Services', palette.kitYellow51, servicesImg, servicesCmp),
  exp('money', 'Pay', palette.kitIndigo51, moneyImg, moneyCmp, moneySel, moneyCmpSel),
];

// Feed modules: CMS assets captured from the noon.com/uae-en mobile home (Oct 2026), downloaded to src/assets/home.
// The app home feed is CMS-driven; these stand in for it with the same live creatives.
const homeAssets = import.meta.glob<string>('../../assets/home/*.webp', { eager: true, import: 'default' });
const asset = (name: string) => homeAssets[`../../assets/home/${name}.webp`];
const range = (prefix: string, ids: number[]) => ids.map((n) => asset(`${prefix}-${String(n).padStart(2, '0')}`));

export type FeedItem = { image: string; query: string };

/** NoonHeroCarousel slides (portrait cards, 244×366 at 390pt). */
export const heroSlides: FeedItem[] = [
  { image: asset('hero-01'), query: 'Welcome offer' },
  { image: asset('hero-02'), query: "Today's top deals" },
  { image: asset('hero-03'), query: 'Cashback' },
];

export const promoStrip: FeedItem = { image: asset('strip-01'), query: 'Outdoor season' };

/** Category tiles: two scrolling rows; labels are baked into the artwork. */
const tile = (n: number, query: string): FeedItem => ({ image: range('tile', [n])[0], query });
export const tileRows: FeedItem[][] = [
  [tile(2, 'Deals'), tile(3, 'Mobiles'), tile(4, 'Beauty'), tile(5, "Women's fashion"), tile(6, 'Home appliances'), tile(1, 'Wearables'), tile(7, 'Grocery'), tile(8, 'Televisions'), tile(9, 'Cameras'), tile(10, "Men's care")],
  [tile(12, 'Electronics'), tile(13, 'Laptops'), tile(14, 'Gift cards'), tile(15, "Men's fashion"), tile(16, 'Health & nutrition'), tile(17, 'Backpacks'), tile(11, 'Handbags'), tile(18, 'Footwear'), tile(19, 'Gaming'), tile(20, 'Personal care')],
];

const items = (prefix: string, ids: number[], query: string): FeedItem[] => range(prefix, ids).map((image) => ({ image, query }));
export const offers = items('offer', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 'Offers');
export const spotlight = items('spotlight', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 'Spotlight');
export const savingsRows = [items('saving', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], 'Savings'), items('saving', [12, 13, 15, 16, 17, 18, 19, 20, 21, 22, 23], 'Savings')];
export const banners = items('banner', [1, 2, 3], 'Featured');
