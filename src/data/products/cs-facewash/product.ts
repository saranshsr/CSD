import { defineProduct } from '../../define';

/** Coupon-scoped search demo (noon.com listing, BEAUTY10 flow). */
export default defineProduct({
  id: 'cs-facewash',
  brand: "CeraVe",
  title: "Hydrating Cleanser with Hyaluronic Acid 236ml",
  price: 44.8,
  was: 56,
  rating: 4.8,
  ratingCount: 6100,
  emoji: '🧴',
  tint: '#F7F7FA', // token-lint-ignore: mock catalog data (product tint / swatch)
  express: true,
  tag: 'Best Seller',
  delivery: 'Get it <b>Tomorrow</b>',
  category: 'Beauty',
  coupon: 'Extra 10% Off',
  collection: 'coupon',
  order: 24,
});
