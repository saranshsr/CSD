import strip1 from '@assets/deals/strip-01.webp';
import strip2 from '@assets/deals/strip-02.gif';
import hero1 from '@assets/deals/hero-01.webp';
import hero2 from '@assets/deals/hero-02.webp';

// CMS creatives captured from noon.com/uae-en/noon-deals-ae (Oct 2026), the page the Deals tab opens.
export const strips = [
  { image: strip1, query: 'Cashback' },
  { image: strip2, query: 'Offers' },
];

export const heroes = [
  { image: hero1, query: "Today's top deals" },
  { image: hero2, query: 'Shop & win' },
];

/** Product rails, in page order. Products come from the shared demo catalogue. */
export const rails = [
  { title: 'Lowest prices of the year', offset: 0 },
  { title: 'Apple bestsellers', offset: 3 },
  { title: 'Mega deals', offset: 5 },
  { title: 'Bestselling deals', offset: 2 },
  { title: 'Trending deals', offset: 7 },
];

export const gridTitle = "Today's Offers & Deals";
