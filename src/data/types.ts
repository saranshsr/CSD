import type { CategoryRef } from './categories';

/**
 * Data-layer types. A product is one folder in src/data/products/<id>/ (product.ts + its photos); see README.md.
 * `Product` is the shape every flow and component reads (unchanged from the old src/mocks/products.ts).
 */
export interface Product {
  id: string;
  brand: string;
  title: string;
  price: number;
  was?: number;
  rating: number;
  ratingCount: number;
  emoji: string;
  /** placeholder background tint behind the emoji */
  tint: string;
  image?: string;
  express?: boolean;
  /** sold through supermall (bappzaar cart group serviceMode 'rocket') — lands in the cart's supermall group */
  supermall?: boolean;
  tag?: 'Best Seller' | 'Top Rated' | 'New' | 'Selling out fast';
  delivery: string;
  category: string;
  coupon?: string;
  colors?: string[];
  sizes?: string[];
  highlights?: string[];
  seller?: string;
  /* ── Live-data fields (optional; used by the PDP for real noon products, see src/flows/pdp/MAPPING.md) ── */
  /** noon sku_config, e.g. N70211593V */
  sku?: string;
  /** selected offer code (?o=…) */
  offerCode?: string;
  /** gallery images (real photos); `image` stays the first / card image */
  images?: string[];
  /** leaf category id in src/mocks/categories.ts */
  categoryId?: string;
  /** root → leaf breadcrumb (categoryPath(categoryId)) */
  categoryPath?: CategoryRef[];
  /** best_seller_rank in the leaf category → "#38 in Smartphones" */
  rank?: number;
  /** SD nudges (product box ticker / PDP nudge tag) */
  nudges?: ProductNudge[];
  /** low_stock_nudge_value → "Only 1 left in stock" */
  stockLeft?: number;
  freeDelivery?: boolean;
  /** model / colour / storage / version attributes (variant matrix keys) */
  attributes?: ProductAttributes;
  /** id of the variant matrix this product belongs to (variantFamilies) */
  variantFamily?: string;
  sellerRating?: { value: number; count: number };
  description?: string;
  /** feature_bullets */
  featureBullets?: string[];
  /** specifications (name, value) */
  specs?: [string, string][];
}

export interface ProductNudge {
  text: string;
  kind: 'rank' | 'lowestPrice' | 'freeDelivery' | 'lowStock' | 'sellingFast' | 'soldRecently' | 'info';
}

export interface ProductAttributes {
  model?: string;
  color?: string;
  storage?: string;
  version?: string;
}

/** A product family's variant matrix (noon `groups`): one row per dimension, options in the live page order. */
export interface VariantFamily {
  id: string;
  dimensions: { key: keyof ProductAttributes; name: string; options: string[]; versionGuide?: boolean }[];
}

/** Which list a product belongs to: `products` (demo + live + home, the shared catalogue), `phoneProducts` (PLP phone
 *  listing), `orders` (order-history items). Every product is findable by id through getProduct / productById. */
export type ProductCollection = 'demo' | 'live' | 'home' | 'phones' | 'orders' | 'coupon';

/** What a product.ts file declares. Photos in the product's folder fill `image` (card.*) and `images`
 *  (card + gallery-N.*) automatically; set them here only for photos that live elsewhere. `categoryPath` is derived
 *  from `categoryId` unless given. */
export type ProductInput = Omit<Product, 'image' | 'images' | 'categoryPath'> &
  Partial<Pick<Product, 'image' | 'images' | 'categoryPath'>> & {
    collection: ProductCollection;
    /** sort key inside its collection (lists keep this order); new products without one go last */
    order?: number;
  };
