/**
 * The data layer: products (one folder each in ./products), categories, variants, the demo user and money helpers.
 * Flows and components read data from here; flow folders keep only screen copy and layout feeds. See README.md.
 */
export * from './types';
export { defineProduct } from './define';
export * from './catalog';
export * from './categories';
export * from './variants';
export * from './users';
export * from './money';
export * from './eta';
