import { defineProduct } from '../../define';

/** Coupon-scoped search demo (noon.com listing, BEAUTY10 flow). */
export default defineProduct({
  id: 'cs-presage',
  brand: "Seiko",
  title: "Presage Cocktail Automatic GMT Watch",
  price: 2240,
  rating: 4.5,
  ratingCount: 1300,
  emoji: '⌚️',
  tint: '#F7F7FA', // token-lint-ignore: mock catalog data (product tint / swatch)
  express: true,
  delivery: 'Get it <b>Tomorrow</b>',
  category: 'Watches',
  collection: 'coupon',
  order: 29,
});
