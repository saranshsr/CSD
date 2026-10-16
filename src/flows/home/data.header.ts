// Homepage Revamp 2025 — header, cashback ticker and hero content (Figma iRE9RwO94eMAyW3j3XKNXW · 1337:6688 / 1337:5131 / 1337:5106).
import welcomeDryer from '@assets/home/2025/hero/welcome-dryer.webp';
import welcomeWatch from '@assets/home/2025/hero/welcome-watch.webp';
import welcomeMakeup from '@assets/home/2025/hero/welcome-makeup.webp';
import welcomeShadow from '@assets/home/2025/hero/welcome-shadow.svg';
import saleImage from '@assets/home/2025/hero/sale.webp';
import saleLogo from '@assets/home/2025/hero/sale-logo.svg';
import { currency, user } from '../../data';

/** Address row: the demo user's saved address (Figma shows a placeholder Bengaluru address). */
export const addressRow = { label: user.address.label, line: `${user.address.line}, ${user.address.city}` };

/** Search placeholder "Search for “Maybelline”" — the brand rotates. */
export const searchPrefix = 'Search for';
export const searchBrands = ['“Maybelline”', '“Apple”', '“Nike”', '“Samsung”', '“Dyson”'];

/** Cashback ticker 1337:5131: five rotating messages ("n/5"). */
export type TickerMessage = { title: string; subtitle: string; query: string };
export const tickerMessages: TickerMessage[] = [
  { title: '10% cashback', subtitle: 'on every E-Commerce spends', query: 'Cashback offers' },
  { title: 'Free delivery', subtitle: `on orders above ${currency} 100`, query: 'Free delivery' },
  { title: '5% back in noon credits', subtitle: 'with the noon One card', query: 'noon One' },
  { title: 'Extra 15% off', subtitle: 'with code FREE50 on first order', query: 'Welcome offer' },
  { title: 'Express delivery', subtitle: 'get it today in 2 hours', query: 'Express' },
];

/** Hero 1337:5106: landscape creatives. Card 1 is composed live (copy is text); card 2 is artwork. */
export type HeroSlide =
  | {
      kind: 'welcome';
      query: string;
      ad?: boolean;
      eyebrow: string;
      amount: string;
      strong: string;
      line: string;
      code: string;
      art: { dryer: string; watch: string; makeup: string; shadow: string };
    }
  | { kind: 'image'; query: string; ad?: boolean; image: string; logo: string };

export const heroSlides2025: HeroSlide[] = [
  {
    kind: 'welcome',
    query: 'Welcome offer',
    ad: true,
    eyebrow: 'Welcome! Earn',
    amount: '50',
    strong: 'Cashback',
    line: 'on your first order',
    code: 'Use Code: FREE50',
    art: { dryer: welcomeDryer, watch: welcomeWatch, makeup: welcomeMakeup, shadow: welcomeShadow },
  },
  { kind: 'image', query: 'Mega sale', image: saleImage, logo: saleLogo },
];

export const heroInterval2025 = 4000;
export const tickerInterval = 3500;
