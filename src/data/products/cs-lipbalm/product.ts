import { defineProduct } from '../../define';

/** Coupon-scoped search demo (noon.com listing, BEAUTY10 flow). */
export default defineProduct({
  id: 'cs-lipbalm',
  brand: "Sebamed",
  title: "Lip Defense Cherry 4.8g",
  price: 4.8,
  was: 10.91,
  rating: 4.8,
  ratingCount: 2200,
  emoji: '🧴',
  tint: '#F7F7FA', // token-lint-ignore: mock catalog data (product tint / swatch)
  express: true,
  delivery: 'Get it <b>Tomorrow</b>',
  category: 'Beauty',
  coupon: 'Extra 10% Off',
  collection: 'coupon',
  order: 20,
});
