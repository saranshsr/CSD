import { defineProduct } from '../../define';

/** Coupon-scoped search demo (noon.com listing, BEAUTY10 flow). */
export default defineProduct({
  id: 'cs-foundation',
  brand: "Maybelline New York",
  title: "Fit Me Matte + Poreless Foundation 110 Beige",
  price: 29.61,
  was: 69.38,
  rating: 4.5,
  ratingCount: 5600,
  emoji: '🧴',
  tint: '#F7F7FA', // token-lint-ignore: mock catalog data (product tint / swatch)
  express: true,
  tag: 'Best Seller',
  delivery: 'Get it <b>Tomorrow</b>',
  category: 'Beauty',
  coupon: 'Extra 10% Off',
  collection: 'coupon',
  order: 17,
});
