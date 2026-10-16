import { defineProduct } from '../../define';

/** Coupon-scoped search demo (noon.com listing, BEAUTY10 flow). */
export default defineProduct({
  id: 'cs-brush',
  brand: "DUcare",
  title: "Professional Makeup Brushes Set with Bag, 22 Pcs",
  price: 229,
  was: 291,
  rating: 4.5,
  ratingCount: 1600,
  emoji: '🧴',
  tint: '#F7F7FA', // token-lint-ignore: mock catalog data (product tint / swatch)
  express: true,
  delivery: 'Get it <b>Tomorrow</b>',
  category: 'Beauty',
  coupon: 'Extra 10% Off',
  collection: 'coupon',
  order: 10,
});
