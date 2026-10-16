import giftHamper from '@assets/pdp/new-pdp/b/gift-hamper.webp';
import type { Product } from '../../data';
import type { PdpContent } from './data';

/**
 * New PDP (Figma Af34gfmhQ1D0wstXUEHSIF · 64:5571) group B copy + mock data: free gifts (64:5591) and the
 * "Faster Delivery Options" lanes of the delivery card (64:5590). Copy from noon-en.json where it exists.
 */
export const npbCopy = {
  /** noon_free_gifts_freebie */
  freeGifts: 'Free gifts for you',
  /** noon_free_freebie */
  free: 'Free',
  /** noon_view_eligible_products_text */
  viewEligible: 'View eligible products',
  fasterDeliveryOptions: 'Faster Delivery Options',
  selectOnCheckout: 'Select these options on checkout',
  getBy: 'Get by',
} as const;

/** NoonFreebieItemType (bappzaar): image, title, subtitle, link to the eligible products (a catalog → PLP). */
export interface PdpFreebie {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  /** PLP query the "View eligible products" link opens (bappzaar link_url → DynamicLoaderScreen) */
  eligibleQuery?: string;
}

/** Mock freebies: phones get the Figma Pepsi hamper offer (two of them, like the Figma rail); other products none. */
export function freebiesFor(product: Product): PdpFreebie[] {
  if (product.category !== 'Mobiles') return [];
  const one = { title: 'Pepsi Gift Hamper', subtitle: 'Pack of 6 cans & Hoodie or tote bag', image: giftHamper, eligibleQuery: product.brand };
  return [
    { id: 'pepsi-hamper-1', ...one },
    { id: 'pepsi-hamper-2', ...one },
  ];
}

/** A faster lane under the express estimate: "Get it {day}" (+ optional note) and the surcharge. */
export interface FasterLane {
  day: string;
  note?: string;
  price: number;
  /** another SKU / offer for this lane (bappzaar buying option) → nav.replace */
  productId?: string;
  /** bappzaar NoonBuyingOptionItem: the lane is another offer at its own full price ("Get in 1 hr 22 mins · 6549.00"), not a "+" delivery fee */
  offer?: boolean;
}

/**
 * Faster delivery lanes: the product's rocket buying options when it has them, else (express lane) the Figma pair
 * "Get it Today + 14.00" / "Get it Tomorrow [before 12pm] + 12.00". Picked at checkout, not here.
 */
export function fasterLanesFor(content: PdpContent): FasterLane[] {
  const rocket = (content.buyingOptions ?? []).filter((o) => o.code === 'rocket');
  if (rocket.length) {
    return rocket.map((o) => {
      // "GET IN <b>1 HR 22 MINS</b>" → "in 1 hr 22 mins" (rendered after "Get")
      const text = o.html.replace(/<[^>]+>/g, '').replace(/^Get\s*(it\s*)?/i, '').toLowerCase();
      const m = /^(.*?)(\s*\[.*\])?$/.exec(text);
      return { day: (m?.[1] ?? text).trim(), note: m?.[2]?.trim(), price: o.price, productId: o.productId, offer: true };
    });
  }
  if (content.deliveryLogo === 'rocket') return [];
  return [
    { day: 'Today', price: 14 },
    { day: 'Tomorrow', note: '[before 12pm]', price: 12 },
  ];
}
