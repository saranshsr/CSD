import { defineProduct } from '../../define';

/** Coupon-scoped search demo (noon.com listing, BEAUTY10 flow). */
export default defineProduct({
  id: 'cs-vitc16',
  brand: "Minimalist",
  title: "16% Vitamin C Face Serum with Ferulic Acid",
  price: 40.5,
  was: 45,
  rating: 4.3,
  ratingCount: 540,
  emoji: '🧴',
  tint: '#F7F7FA', // token-lint-ignore: mock catalog data (product tint / swatch)
  express: true,
  delivery: 'Get it <b>Tomorrow</b>',
  category: 'Beauty',
  coupon: 'Extra 10% Off',
  collection: 'coupon',
  order: 2,
});
