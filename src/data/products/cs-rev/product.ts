import { defineProduct } from '../../define';

/** Coupon-scoped search demo (noon.com listing, BEAUTY10 flow). */
export default defineProduct({
  id: 'cs-rev',
  brand: "Revolution",
  title: "Re-Loaded Eyeshadow Palette Basic Mattes",
  price: 48.75,
  was: 65,
  rating: 4.4,
  ratingCount: 920,
  emoji: '🧴',
  tint: '#F7F7FA', // token-lint-ignore: mock catalog data (product tint / swatch)
  express: true,
  delivery: 'Get it <b>Tomorrow</b>',
  category: 'Beauty',
  coupon: 'Extra 10% Off',
  collection: 'coupon',
  order: 7,
});
