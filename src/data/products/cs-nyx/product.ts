import { defineProduct } from '../../define';

/** Coupon-scoped search demo (noon.com listing, BEAUTY10 flow). */
export default defineProduct({
  id: 'cs-nyx',
  brand: "NYX Professional Makeup",
  title: "Setting Spray Dewy Finish 60ml",
  price: 34.95,
  was: 60,
  rating: 4.5,
  ratingCount: 1100,
  emoji: '🧴',
  tint: '#F7F7FA', // token-lint-ignore: mock catalog data (product tint / swatch)
  express: true,
  delivery: 'Get it <b>Tomorrow</b>',
  category: 'Beauty',
  coupon: 'Extra 10% Off',
  collection: 'coupon',
  order: 6,
});
