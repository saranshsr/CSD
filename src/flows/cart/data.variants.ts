/**
 * Mock for NoonCartVariantsOverlayScreen (useVariantOverlay → catalog product fetch on master).
 * Shapes follow NoonVariantsSwitchDetailsType (attributes) + the product `groups[].options` / sizes the
 * overlay renders. Prices/sellers are demo values.
 */
export interface CartVariantOption {
  /** label stored in CartLine.variant */
  name: string;
  price: number;
  was?: number;
  /** colour swatch shown in place of the option image */
  swatch?: string;
  isAvailable: boolean;
}

export interface CartVariantGroup {
  /** group.name — rendered uppercase (e.g. SIZE, COLOUR) */
  name: string;
  options: CartVariantOption[];
}

export interface CartVariantsData {
  groups: CartVariantGroup[];
  /** NoonVariantsSwitchAttributeType[] — fixed attributes shown as a single selected chip */
  attributes: Array<{ code: string; name: string; value: string }>;
  /** partner_ratings_sellerlab */
  sellerRating?: { rating: number; count: number };
}

export const cartVariants: Record<string, CartVariantsData> = {
  p6: {
    groups: [
      {
        name: 'Size',
        options: [
          { name: '42mm', price: 1499, was: 1699, isAvailable: true },
          { name: '46mm', price: 1599, was: 1799, isAvailable: true },
        ],
      },
    ],
    attributes: [{ code: 'colour_name', name: 'Colour', value: 'Jet Black' }],
    sellerRating: { rating: 4.4, count: 18420 },
  },
  p12: {
    groups: [
      {
        name: 'Colour',
        options: [
          { name: 'Sage', price: 179, was: 219, swatch: 'var(--nk-palette-kit-green79)', isAvailable: true },
          { name: 'Black', price: 179, was: 219, swatch: 'var(--nk-palette-kit-gray12)', isAvailable: true },
          { name: 'Rose Quartz', price: 189, was: 229, swatch: 'var(--nk-palette-kit-red90)', isAvailable: false },
        ],
      },
    ],
    attributes: [{ code: 'size', name: 'Size', value: '40oz' }],
    sellerRating: { rating: 3.8, count: 640 },
  },
};
