import { defineProduct } from '../../define';

/** Coupon-scoped search demo (noon.com listing, BEAUTY10 flow). */
export default defineProduct({
  id: 'cs-seiko5b',
  brand: "Seiko",
  title: "5 Sports Analog Watch SRPD55K1",
  price: 611,
  was: 699,
  rating: 4.4,
  ratingCount: 860,
  emoji: '⌚️',
  tint: '#F7F7FA', // token-lint-ignore: mock catalog data (product tint / swatch)
  express: true,
  delivery: 'Get it <b>Tomorrow</b>',
  category: 'Watches',
  collection: 'coupon',
  order: 28,
});
