import { defineProduct } from '../../define';

/** Coupon-scoped search demo (noon.com listing, BEAUTY10 flow). */
export default defineProduct({
  id: 'cs-toner',
  brand: "Medicube",
  title: "Salmon DNA PDRN Pink Cica Soothing Toner 250ml",
  price: 38.89,
  was: 110.1,
  rating: 4.6,
  ratingCount: 1500,
  emoji: '🧴',
  tint: '#F7F7FA', // token-lint-ignore: mock catalog data (product tint / swatch)
  express: true,
  delivery: 'Get it <b>Tomorrow</b>',
  category: 'Beauty',
  coupon: 'Extra 10% Off',
  collection: 'coupon',
  order: 26,
});
