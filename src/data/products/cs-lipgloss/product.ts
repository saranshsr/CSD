import { defineProduct } from '../../define';

/** Coupon-scoped search demo (noon.com listing, BEAUTY10 flow). */
export default defineProduct({
  id: 'cs-lipgloss',
  brand: "Essence",
  title: "Extreme Shine Volume Lipgloss 102 Sweet Dreams",
  price: 8.75,
  was: 13,
  rating: 4.5,
  ratingCount: 720,
  emoji: '🧴',
  tint: '#F7F7FA', // token-lint-ignore: mock catalog data (product tint / swatch)
  express: true,
  delivery: 'Get it <b>Tomorrow</b>',
  category: 'Beauty',
  coupon: 'Extra 10% Off',
  collection: 'coupon',
  order: 21,
});
