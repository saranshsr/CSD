import { defineProduct } from '../../define';

/** Coupon-scoped search demo (noon.com listing, BEAUTY10 flow; team file 04 · Eligible items, second card). */
export default defineProduct({
  id: 'cs-ipl-philips',
  brand: 'Philips',
  title: 'Lumea IPL 9000 Series SenseIQ, 4 Attachments',
  price: 1398,
  was: 2599,
  rating: 4.4,
  ratingCount: 860,
  emoji: '✨',
  tint: '#F7F7FA', // token-lint-ignore: mock catalog data (product tint / swatch)
  express: true,
  delivery: 'Get it <b>Tomorrow</b>',
  category: 'Beauty',
  coupon: 'Extra 10% Off',
  collection: 'coupon',
  order: -1,
});
