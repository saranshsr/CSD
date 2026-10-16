/**
 * Moved to the data layer (src/data). This file keeps the old import path and the package's public names
 * (`export * from './mocks/products'` in src/index.ts) working; new code imports from src/data.
 */
export type { Product, ProductNudge, ProductAttributes, VariantFamily } from '../data/types';
export { currency, discountPct, formatPrice } from '../data/money';
export { products, liveProducts, homeFeedProducts, productById, fbtFor, IPHONE_17_PRO_ID } from '../data/catalog';
export { variantFamilies } from '../data/variants';
export { user } from '../data/users';
export { categories } from '../data/categories';
