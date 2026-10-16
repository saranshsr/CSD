import { defineProduct } from '../../define';

/** Coupon-scoped search demo (noon.com listing, BEAUTY10 flow). */
export default defineProduct({
  id: 'cs-lipstick',
  brand: "Maybelline New York",
  title: "Super Stay Vinyl Ink Liquid Matte Lipstick 10 Lippy",
  price: 43,
  was: 80.43,
  rating: 4.5,
  ratingCount: 1200,
  emoji: '🧴',
  tint: '#F7F7FA', // token-lint-ignore: mock catalog data (product tint / swatch)
  express: true,
  tag: 'Best Seller',
  delivery: 'Get it <b>Tomorrow</b>',
  category: 'Beauty',
  coupon: 'Extra 10% Off',
  collection: 'coupon',
  order: 13,
});
