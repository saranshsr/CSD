// All copy + data for the BEAUTY10 flow. Currency: write "dhm" (Noontree renders the dirham glyph).
const P = '/assets/products/padded/';
export const coupon = { code: 'BEAUTY10', title: 'Extra 10% off on beauty', items: '2,341 items', eligibleCount: 2341 };

// Typeahead pool, in popularity order (earlier = more searched). thumb = product image
// (unpadded, square-cropped in UI); null thumb → the row shows a search glyph instead.
const T = '/assets/products/';
const E = '/assets/empty/';
const img = {
  nia1: T + '01_niacinamide-serum_1.jpg', nia2: T + '01_niacinamide-serum_2.jpg',
  vitc1: T + '02_vitamin-c-serum_1.jpg', vitc2: T + '02_vitamin-c-serum_2.jpg',
  sebamed: T + '03_sebamed-baby-lotion_1.jpg', spray: T + '04_makeup-setting-spray_1.jpg',
  palette1: T + '05_eyeshadow-palette_1.jpg', palette2: T + '05_eyeshadow-palette_2.jpg',
  tan: T + '06_self-tan-mousse_1.jpg', olaplex: T + '07_olaplex-no-7_1.jpg', bioderma: T + '08_bioderma_1.jpg',
  ipl1: T + '09_ipl-hair-removal-device_1.jpg', ipl2: T + '09_ipl-hair-removal-device_2.jpg',
  brush: T + '10_makeup-brush-set_1.jpg', seiko1: T + '11_seiko-5-watch_1.jpg', seiko2: T + '11_seiko-5-watch_2.jpg',
  presage: T + '12_seiko-presage_1.jpg', spf: T + '13_sunscreen-spf-50_1.jpg', shampoo: T + '14_shampoo_1.jpg',
  s24: E + 'recent-s24.png', s25: E + 'recent-s25-edge.png', ip17pm: E + 'recent-iphone-17-pro-max.png', ip17: E + 'recent-iphone-17.png',
};
const POOL = [
  // Figma 05 "se" order leads the pool so "s"/"se" read exactly like the frame
  ['serum', img.nia1], ['seiko watches for men', img.seiko1], ['sebamed baby lotion', img.sebamed],
  ['setting spray', img.spray], ['seiko 5', img.seiko2], ['seiko watch', img.seiko1],
  ['serum for face', img.nia2], ['niacinamide serum', img.nia2], ['vitamin c serum', img.vitc1],
  ['hair serum', img.olaplex], ['serum foundation', img.palette2], ['seiko 5 sports', img.seiko2],
  ['seiko presage', img.presage], ['seiko automatic watch', img.seiko2], ['sephora collection', img.palette1],
  ['self tan mousse', img.tan], ['sesame hair oil', img.olaplex], ['retinol serum', img.vitc2],
  ['sunscreen spf 50', img.spf], ['shampoo', img.shampoo], ['shower gel', img.shampoo], ['sheet mask', img.bioderma],
  ['lipstick', img.palette1], ['lip balm', img.sebamed], ['lip tint', img.palette1], ['liquid foundation', img.palette2],
  ['lash serum', img.nia1], ['eyeliner', img.brush], ['eyeshadow palette', img.palette1], ['face wash', img.bioderma],
  ['face cream', img.sebamed], ['foundation', img.palette2], ['moisturiser', img.sebamed], ['micellar water', img.bioderma],
  ['mascara', img.brush], ['makeup brush set', img.brush], ['makeup setting spray', img.spray], ['hair oil', img.olaplex],
  ['hair mask', img.shampoo], ['hair dryer', img.ipl2], ['hair removal device', img.ipl1], ['perfume', img.spray],
  ['perfume for women', img.spray], ['body lotion', img.sebamed], ['bioderma sensibio', img.bioderma], ['olaplex no 7', img.olaplex],
  // empty-state recents / trending, so tapping one still gets real suggestions
  ['iphone 17 pro max', img.ip17pm], ['iphone 17', img.ip17], ['iphone 16', img.ip17], ['s24', img.s24], ['s24 ultra', img.s24],
  ['s25 edge', img.s25], ['smartphone deals', img.s25], ['revlon', img.palette1], ['revlon lipstick', img.palette1],
  ['shoe rack', null], ['pillow', null], ['fridge', null], ["men's slippers", null],
];
export const suggestions = POOL.map(([label, thumb]) => ({ label, thumb }));

// Typeahead: labels that START with q first, then labels where q starts a word; max 5, case-insensitive.
// A trailing space is meaningful ("serum " → "serum for face"); if it matches nothing, retry without it.
export function suggestionsFor(q, max = 5) {
  const s = (q || '').toLowerCase().replace(/^\s+/, '').replace(/\s+/g, ' ');
  if (!s.trim()) return [];
  const rank = (needle) => {
    const pre = [], word = [];
    for (const r of suggestions) {
      const l = r.label.toLowerCase();
      if (l.startsWith(needle)) (l === needle.trim() ? pre.unshift(r) : pre.push(r));
      else if ((' ' + l).includes(' ' + needle)) word.push(r);
    }
    return [...pre, ...word].slice(0, max);
  };
  const out = rank(s);
  return out.length || !s.endsWith(' ') ? out : rank(s.trim());
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
// ── Catalogue for real typing ────────────────────────────────────────────────
// BEAUTY10-eligible beauty items (coupon tag) and noon-wide items (no tag). `k` = search keywords.
// Beauty prices from noon.com (manifest); phone/TV prices are placeholders.
const BEAUTY = [
  ...products.serum.map((p) => ({ ...p, k: 'serum face serum niacinamide vitamin c skincare skin care' + (p.id === 'olaplex' ? ' hair serum hair oil olaplex' : '') })),
  { id: 'vitc16', name: 'Minimalist 16% Vitamin C Face Serum with Ferulic Acid', price: '40.50', was: '45', off: '10%', size: '30ml', unit: 'dhm1.35/ml', img: P + '02_vitamin-c-serum_2.jpg', rating: '4.3', count: '540', coupon: true, k: 'serum vitamin c skincare minimalist' },
  { id: 'sebamed', name: 'Sebamed Baby Body Lotion for Delicate Skin, 400ml', price: '30', was: '46', off: '35%', size: '400ml', unit: 'dhm0.08/ml', img: P + '03_sebamed-baby-lotion_1.jpg', rating: '4.7', count: '3.4K', bestSeller: true, coupon: true, k: 'sebamed baby lotion body lotion moisturiser bath and body' },
  { id: 'nyx', name: 'NYX Professional Makeup Setting Spray Dewy Finish 60ml', price: '34.95', was: '60', off: '42%', size: '60ml', unit: 'dhm0.58/ml', img: P + '04_makeup-setting-spray_1.jpg', rating: '4.5', count: '1.1K', megaDeal: true, coupon: true, k: 'setting spray makeup nyx' },
  { id: 'rev', name: 'Revolution Re-Loaded Eyeshadow Palette Basic Mattes', price: '48.75', was: '65', off: '25%', img: P + '05_eyeshadow-palette_1.jpg', rating: '4.4', count: '920', coupon: true, k: 'eyeshadow palette makeup revolution eyes' },
  { id: 'kiko', name: 'KIKO Milano New Soft Nude Eyeshadow Palette 01', price: '73.77', was: '109', off: '32%', img: P + '05_eyeshadow-palette_2.jpg', rating: '4.3', count: '410', coupon: true, k: 'eyeshadow palette makeup kiko eyes' },
  { id: 'bondi', name: 'Bondi Sands Self Tanning Foam Dark 200ml', price: '66.99', was: '95', off: '29%', size: '200ml', unit: 'dhm0.33/ml', img: P + '06_self-tan-mousse_1.jpg', rating: '4.4', count: '780', coupon: true, k: 'self tan mousse tanning foam bondi sands' },
  { id: 'bioderma', name: 'Bioderma Sensibio H2O Micellar Water Makeup Remover', price: '79', was: '152.25', off: '48%', size: '500ml', unit: 'dhm0.16/ml', img: P + '08_bioderma_1.jpg', rating: '4.8', count: '5.2K', bestSeller: true, megaDeal: true, coupon: true, k: 'bioderma micellar water makeup remover skincare face wash cleanser' },
  { id: 'brush', name: 'DUcare Professional Makeup Brushes Set with Bag, 22 Pcs', price: '229', was: '291', off: '21%', img: P + '10_makeup-brush-set_1.jpg', rating: '4.5', count: '1.6K', coupon: true, k: 'makeup brush set brushes ducare' },
  { id: 'boj', name: 'Beauty of Joseon Relief Sun Rice + Probiotics SPF 50+', price: '35', was: '85', off: '59%', size: '50ml', unit: 'dhm0.70/ml', img: P + '13_sunscreen-spf-50_1.jpg', rating: '4.7', count: '4.8K', bestSeller: true, megaDeal: true, coupon: true, k: 'sunscreen spf 50 sun cream beauty of joseon skincare' },
  { id: 'dove', name: 'Dove Intensive Repair Shampoo 400ml', price: '16.60', was: '30.50', off: '46%', size: '400ml', unit: 'dhm0.04/ml', img: P + '14_shampoo_1.jpg', rating: '4.6', count: '2.9K', megaDeal: true, coupon: true, k: 'shampoo dove hair care haircare' },
  { id: 'fino', name: 'Shiseido Fino Premium Touch Hair Mask 230g', price: '42', was: '58', off: '28%', img: P + 'cat-hair-care-masks.jpg', rating: '4.7', count: '3.1K', coupon: true, k: 'hair mask fino shiseido hair care haircare' },
  ...products.plp.map((p) => ({ ...p, k: 'ipl hair removal laser device epilator philips mlay' })),
];
const NOON = [
  ...products.seiko.map((p) => ({ ...p, k: 'seiko watch watches men automatic analog presage 5 sports' })),
  { id: 'ip17pm', name: 'Apple iPhone 17 Pro Max 256GB Cosmic Orange', price: '5099', was: '5399', off: '6%', img: P + 'recent-iphone-17-pro-max.jpg', rating: '4.8', count: '1.9K', bestSeller: true, k: 'iphone 17 pro max apple mobile phone smartphone' },
  { id: 'ip17', name: 'Apple iPhone 17 256GB Black', price: '3399', was: '3599', off: '6%', img: P + 'recent-iphone-17.jpg', rating: '4.7', count: '1.2K', k: 'iphone 17 apple mobile phone smartphone' },
  { id: 'ip16', name: 'Apple iPhone 16 128GB Black', price: '2899', was: '3399', off: '15%', img: P + 'recent-iphone-16.jpg', rating: '4.7', count: '6.4K', k: 'iphone 16 apple mobile phone smartphone' },
  { id: 's24', name: 'Samsung Galaxy S24 Ultra 256GB Titanium Gray', price: '3999', was: '5099', off: '22%', img: P + 'recent-s24.jpg', rating: '4.6', count: '3.3K', k: 's24 samsung galaxy mobile phone smartphone' },
  { id: 's25e', name: 'Samsung Galaxy S25 Edge 256GB Titanium Silver', price: '4299', was: '4699', off: '9%', img: P + 'recent-s25-edge.jpg', rating: '4.5', count: '640', k: 's25 edge samsung galaxy mobile phone smartphone' },
  { id: 'tv', name: 'Hisense 65" 4K UHD Smart TV A6 Series', price: '1699', was: '2299', off: '26%', img: P + 'cat-televisions.jpg', rating: '4.4', count: '890', k: 'tv television televisions hisense smart tv 4k' },
];
function matches(item, q) {
  const words = q.split(/\s+/).filter(Boolean);
  const hay = (item.k + ' ' + item.name).toLowerCase().split(/[^a-z0-9]+/);
  return words.every((w) => hay.some((h) => h.startsWith(w)));
}
// Is this (partial) query beauty-related, i.e. does it match any BEAUTY10-eligible item? Drives the coupon nudge.
export function isBeautyQuery(q) {
  const s = q.trim().toLowerCase();
  return !!s && BEAUTY.some((it) => matches(it, s));
}
// Searched within BEAUTY10: eligible matches → coupon scope. No eligible match → fallback to
// noon-wide results ("Showing results for “q” in all categories"), or popular noon items if nothing matches.
export function resultsFor(q) {
  const s = q.trim().toLowerCase();
  if (!s) return { scope: 'coupon', items: products.serum };
  const eligible = BEAUTY.filter((it) => matches(it, s));
  if (eligible.length) return { scope: 'coupon', items: eligible.slice(0, 8) };
  const global = NOON.filter((it) => matches(it, s));
  return { scope: 'noon', items: (global.length ? global : NOON).slice(0, 8) };
}
// Scripted typing: each keyboard tap types the next character of the script for the current step.
export const scripts = { first: 'serum', second: 'seiko watch' };
