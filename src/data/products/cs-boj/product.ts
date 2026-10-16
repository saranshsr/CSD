import { defineProduct } from '../../define';

/** Coupon-scoped search demo (noon.com listing, BEAUTY10 flow). */
export default defineProduct({
  id: 'cs-boj',
  brand: "Beauty of Joseon",
  title: "Relief Sun Rice + Probiotics SPF 50+ 50ml",
  price: 35,
  was: 85,
  rating: 4.7,
  ratingCount: 4800,
  emoji: '🧴',
  tint: '#F7F7FA', // token-lint-ignore: mock catalog data (product tint / swatch)
  express: true,
  tag: 'Best Seller',
  delivery: 'Get it <b>Tomorrow</b>',
  category: 'Beauty',
  coupon: 'Extra 10% Off',
  collection: 'coupon',
  order: 11,
});
