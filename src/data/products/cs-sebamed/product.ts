import { defineProduct } from '../../define';

/** Coupon-scoped search demo (noon.com listing, BEAUTY10 flow). */
export default defineProduct({
  id: 'cs-sebamed',
  brand: "Sebamed",
  title: "Baby Body Lotion for Delicate Skin, 400ml",
  price: 30,
  was: 46,
  rating: 4.7,
  ratingCount: 3400,
  emoji: '🧴',
  tint: '#F7F7FA', // token-lint-ignore: mock catalog data (product tint / swatch)
  express: true,
  tag: 'Best Seller',
  delivery: 'Get it <b>Tomorrow</b>',
  category: 'Beauty',
  coupon: 'Extra 10% Off',
  collection: 'coupon',
  order: 5,
});
