import { defineProduct } from '../../define';

/** Coupon-scoped search demo (noon.com listing, BEAUTY10 flow). */
export default defineProduct({
  id: 'cs-bioderma',
  brand: "Bioderma",
  title: "Sensibio H2O Micellar Water Makeup Remover 500ml",
  price: 79,
  was: 152.25,
  rating: 4.8,
  ratingCount: 5200,
  emoji: '🧴',
  tint: '#F7F7FA', // token-lint-ignore: mock catalog data (product tint / swatch)
  express: true,
  tag: 'Best Seller',
  delivery: 'Get it <b>Tomorrow</b>',
  category: 'Beauty',
  coupon: 'Extra 10% Off',
  collection: 'coupon',
  order: 9,
});
