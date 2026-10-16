import { defineProduct } from '../../define';

/** Coupon-scoped search demo (noon.com listing, BEAUTY10 flow). */
export default defineProduct({
  id: 'cs-eyeliner',
  brand: "Maybelline New York",
  title: "Hyper Easy Liquid Eyeliner 800 Pitch Black",
  price: 21,
  was: 46.07,
  rating: 4.7,
  ratingCount: 860,
  emoji: '🧴',
  tint: '#F7F7FA', // token-lint-ignore: mock catalog data (product tint / swatch)
  express: true,
  delivery: 'Get it <b>Tomorrow</b>',
  category: 'Beauty',
  coupon: 'Extra 10% Off',
  collection: 'coupon',
  order: 15,
});
