import { defineProduct } from '../../define';

/** Coupon-scoped search demo (noon.com listing, BEAUTY10 flow). */
export default defineProduct({
  id: 'cs-nails',
  brand: "Essie",
  title: "Speed Setter Nail Polish Top Coat 13.5ml",
  price: 50,
  was: 66.7,
  rating: 4.6,
  ratingCount: 1800,
  emoji: '🧴',
  tint: '#F7F7FA', // token-lint-ignore: mock catalog data (product tint / swatch)
  express: true,
  delivery: 'Get it <b>Tomorrow</b>',
  category: 'Beauty',
  coupon: 'Extra 10% Off',
  collection: 'coupon',
  order: 22,
});
