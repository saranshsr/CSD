import { defineProduct } from '../../define';

/** Coupon-scoped search demo (noon.com listing, BEAUTY10 flow). */
export default defineProduct({
  id: 'cs-olaplex',
  brand: "Olaplex",
  title: "No.7 Bonding Hair Oil 30ml",
  price: 68.5,
  was: 170,
  rating: 4.5,
  ratingCount: 1300,
  emoji: '🧴',
  tint: '#F7F7FA', // token-lint-ignore: mock catalog data (product tint / swatch)
  express: true,
  delivery: 'Get it <b>Tomorrow</b>',
  category: 'Beauty',
  coupon: 'Extra 10% Off',
  collection: 'coupon',
  order: 4,
});
