import { defineProduct } from '../../define';

/** Coupon-scoped search demo (noon.com listing, BEAUTY10 flow). */
export default defineProduct({
  id: 'cs-mascara',
  brand: "L’Oreal Paris",
  title: "Extensionist Lengthening Mascara, Washable Black",
  price: 35.65,
  was: 69.55,
  rating: 4.6,
  ratingCount: 2400,
  emoji: '🧴',
  tint: '#F7F7FA', // token-lint-ignore: mock catalog data (product tint / swatch)
  express: true,
  tag: 'Best Seller',
  delivery: 'Get it <b>Tomorrow</b>',
  category: 'Beauty',
  coupon: 'Extra 10% Off',
  collection: 'coupon',
  order: 14,
});
