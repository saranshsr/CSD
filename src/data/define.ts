import type { ProductInput } from './types';

/** Typed identity: `export default defineProduct({ … })` in src/data/products/<id>/product.ts. */
export const defineProduct = (p: ProductInput): ProductInput => p;
