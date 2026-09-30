// All copy + data for the BEAUTY10 flow. Currency: write "dhm" (Noontree renders the dirham glyph).
const P = '/assets/products/padded/';
export const coupon = { code: 'BEAUTY10', title: 'Extra 10% off on beauty', items: '2,341 items', eligibleCount: 2341 };

// Typeahead suggestion sets per query. thumb = product image (unpadded, square-cropped in UI).
const T = '/assets/products/';
export const suggestions = {
  se: [
    { label: 'serum', thumb: T + '01_niacinamide-serum_1.jpg' },
    { label: 'seiko watches for men', thumb: T + '11_seiko-5-watch_1.jpg' },
    { label: 'sebamed baby lotion', thumb: T + '03_sebamed-baby-lotion_1.jpg' },
    { label: 'setting spray', thumb: T + '04_makeup-setting-spray_1.jpg' },
    { label: 'seiko 5', thumb: T + '11_seiko-5-watch_2.jpg' },
  ],
  serum: [
    { label: 'serum', thumb: T + '01_niacinamide-serum_1.jpg' },
    { label: 'niacinamide serum', thumb: T + '01_niacinamide-serum_2.jpg' },
    { label: 'vitamin c serum', thumb: T + '02_vitamin-c-serum_1.jpg' },
    { label: 'hair serum', thumb: T + '07_olaplex-no-7_1.jpg' },
    { label: 'serum foundation', thumb: T + '05_eyeshadow-palette_2.jpg' },
  ],
  seiko: [
    { label: 'seiko watch', thumb: T + '11_seiko-5-watch_1.jpg' },
    { label: 'seiko watches for men', thumb: T + '11_seiko-5-watch_1.jpg' },
    { label: 'seiko 5 sports', thumb: T + '11_seiko-5-watch_2.jpg' },
    { label: 'seiko presage', thumb: T + '12_seiko-presage_1.jpg' },
    { label: 'seiko automatic watch', thumb: T + '11_seiko-5-watch_2.jpg' },
  ],
};
// pick a suggestion set for any partial query
export function suggestionsFor(q) {
  const s = q.trim().toLowerCase();
  if (!s) return [];
  if (s.startsWith('sei')) return suggestions.seiko;
  if (s.startsWith('ser')) return suggestions.serum;
  if (s.startsWith('se') || s === 's') return suggestions.se;
  return suggestions.se;
}

export const products = {
  plp: [
    { id: 'ipl1', name: 'MLAY T4 Ice Compress Laser Hair Removal Device, Pink', price: '299', was: '956', off: '69%', img: P + '09_ipl-hair-removal-device_1.jpg', rating: '4.6', count: '2.1K', bestSeller: true, megaDeal: true, coupon: true },
    { id: 'ipl2', name: 'Philips Lumea IPL 9000 Series SenseIQ, 4 Attachments', price: '1,398', was: '2,599', off: '46%', img: P + '09_ipl-hair-removal-device_2.jpg', rating: '4.4', count: '860', megaDeal: true, coupon: true },
  ],
  serum: [
    { id: 'tord', name: 'The Ordinary Niacinamide 10% + Zinc 1% 30ml', price: '27.95', was: '55', off: '49%', size: '30ml', unit: 'dhm0.93/ml', img: P + '01_niacinamide-serum_1.jpg', rating: '4.6', count: '2.1K', bestSeller: true, megaDeal: true, coupon: true },
    { id: 'vitc', name: 'Minimalist 10% Vitamin C Serum for Skin Brightening', price: '45', was: '50', off: '10%', size: '30ml', unit: 'dhm1.50/ml', img: P + '02_vitamin-c-serum_1.jpg', rating: '4.4', count: '860', coupon: true },
    { id: 'olaplex', name: 'Olaplex No.7 Bonding Oil 30ml', price: '68.50', was: '170', off: '60%', size: '30ml', unit: 'dhm2.28/ml', img: P + '07_olaplex-no-7_1.jpg', rating: '4.5', count: '1.3K', megaDeal: true, coupon: true },
    { id: 'mini5', name: 'Minimalist Niacinamide 5% Face Serum', price: '39.25', was: '45', off: '13%', size: '30ml', unit: 'dhm1.31/ml', img: P + '01_niacinamide-serum_2.jpg', rating: '4.2', count: '310', coupon: true },
  ],
  seiko: [
    { id: 's1', name: "Seiko 5 Sports Automatic Men's Watch SRPD53K1", price: '1079', was: '1150', off: '6%', img: P + '11_seiko-5-watch_1.jpg', rating: '4.6', count: '2.1K', bestSeller: true },
    { id: 's2', name: 'Seiko 5 Sports Analog Watch SRPD55K1', price: '611', was: '699', off: '13%', img: P + '11_seiko-5-watch_2.jpg', rating: '4.4', count: '860' },
    { id: 's3', name: 'Seiko Presage Cocktail Automatic GMT Watch', price: '2240', img: P + '12_seiko-presage_1.jpg', rating: '4.5', count: '1.3K' },
  ],
};
// results for a query searched within BEAUTY10. Empty => fallback to noon.com
export function resultsFor(q) {
  const s = q.trim().toLowerCase();
  if (s.includes('serum')) return { scope: 'coupon', items: products.serum };
  return { scope: 'noon', items: products.seiko }; // 0 eligible → noon.com fallback
}
// Scripted typing: each keyboard tap types the next character of the script for the current step.
export const scripts = { first: 'serum', second: 'seiko watch' };
