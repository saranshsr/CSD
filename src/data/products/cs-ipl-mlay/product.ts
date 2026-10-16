import { defineProduct } from '../../define';

/** Coupon-scoped search demo (noon.com listing, BEAUTY10 flow; team file 04 · Eligible items, first card). */
export default defineProduct({
  id: 'cs-ipl-mlay',
  brand: 'MLAY',
  title: 'T4 Ice Compress Laser Hair Removal Device, Pink',
  price: 299,
  was: 956,
  rating: 4.6,
  ratingCount: 2100,
  emoji: '✨',
  tint: '#F7F7FA', // token-lint-ignore: mock catalog data (product tint / swatch)
  express: true,
  tag: 'Best Seller',
  delivery: 'Get it <b>Tomorrow</b>',
  category: 'Beauty',
  coupon: 'Extra 10% Off',
  collection: 'coupon',
  order: -2,
});
