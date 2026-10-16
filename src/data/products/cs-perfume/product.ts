import { defineProduct } from '../../define';

/** Coupon-scoped search demo (noon.com listing, BEAUTY10 flow). */
export default defineProduct({
  id: 'cs-perfume',
  brand: "Lattafa",
  title: "Ameerat Al Arab EDP 100ml",
  price: 42.7,
  was: 75,
  rating: 4.7,
  ratingCount: 4400,
  emoji: '🧴',
  tint: '#F7F7FA', // token-lint-ignore: mock catalog data (product tint / swatch)
  express: true,
  delivery: 'Get it <b>Tomorrow</b>',
  category: 'Beauty',
  coupon: 'Extra 10% Off',
  collection: 'coupon',
  order: 23,
});
