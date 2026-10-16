import { defineProduct } from '../../define';

/** Coupon-scoped search demo (noon.com listing, BEAUTY10 flow). */
export default defineProduct({
  id: 'cs-seiko5a',
  brand: "Seiko",
  title: "5 Sports Automatic Men’s Watch SRPD53K1",
  price: 1079,
  was: 1150,
  rating: 4.6,
  ratingCount: 2100,
  emoji: '⌚️',
  tint: '#F7F7FA', // token-lint-ignore: mock catalog data (product tint / swatch)
  express: true,
  tag: 'Best Seller',
  delivery: 'Get it <b>Tomorrow</b>',
  category: 'Watches',
  collection: 'coupon',
  order: 27,
});
