import payInstallments from '@assets/products/iphone-17-pro/pay-installments.webp';
import payNoonOne from '@assets/products/iphone-17-pro/pay-noon-one-card.webp';
import paySplit from '@assets/products/iphone-17-pro/pay-split.webp';
import review1 from '@assets/products/iphone-17-pro/review-1.webp';
import review2 from '@assets/products/iphone-17-pro/review-2.webp';
import review3 from '@assets/products/iphone-17-pro/review-3.webp';
import review4 from '@assets/products/iphone-17-pro/review-4.webp';
import review5 from '@assets/products/iphone-17-pro/review-5.webp';
import swatchDeepBlue from '@assets/products/iphone-17-pro/swatch-deep-blue.webp';
import swatchOrange from '@assets/products/iphone-17-pro/swatch-cosmic-orange.webp';
import swatchSilver from '@assets/products/iphone-17-pro/swatch-silver.webp';
import { palette } from '../../foundations/palette';
import { leafName } from '../../data';
import { fbtFor, IPHONE_17_PRO_ID, products, variantFamilies, type Product, type ProductAttributes } from '../../data';
import { money, type PdpContent, type VariantGroup } from './data';

/**
 * Server-driven PDP content for LIVE noon products (src/mocks/products.ts `liveProducts`), captured from
 * noon.com/uae-en for iPhone 17 Pro 1TB Silver (N70211593V, Oct 2026). Field-by-field mapping:
 * MAPPING.md → "Live data mapping". Product-level data (title, price, rating, images, specs, category, rank,
 * nudges, attributes) comes from the Product; offer-level SD content (coupons, delivery, payments, badges,
 * seller metrics, reviews) is here, keyed by product id. Family members without their own capture reuse the
 * family's reviews / AI summary (noon reviews are per product group) and get offer content derived from their card.
 */

/** Live colour swatches (62×85 tiles on the page) for the iPhone 17 Pro family. */
const swatches: Record<string, string> = { Silver: swatchSilver, 'Cosmic Orange': swatchOrange, 'Deep Blue': swatchDeepBlue };

/** mp-trust-api product-reviews/ai-summary/get (showSummary: true) */
const iphoneAiSummary = [
  'This phone is praised for its premium build, stunning display, and lightning-fast performance.',
  'Its camera system consistently delivers sharp, vibrant photos, especially in low-light conditions.',
  'Many people are happy with the strong battery life, which easily lasts through a full day of use.',
  'Some buyers received a different regional version (e.g., Japanese) than expected, so check this.',
];

/** product-reviews/sku/images-list (English reviews with photos; family-level, variant chips = productGroupVariant). */
const iphoneReviews: PdpContent['reviews'] = [
  {
    name: 'Hamza R.',
    rating: 5,
    ago: '9 months ago', // updatedAt 2025-12-29
    title: "\"It is the first iPhone to feature an 'All-48MP' triple-camera system and a massive 6.9-inch display",
    body: '"I am beyond happy with my purchase! I ordered the iPhone 17 Pro Max expecting it to arrive in a few days, but Noon delivered it well before the scheduled time. The packaging was secure and the device is 100% genuine. The phone itself is a masterpiece—the performance is lightning fast and the camera is incredible. Highly recommend buying from Noon if you want fast delivery and authentic products!',
    verified: true,
    helpful: 575,
    variants: ['Silver', '512 GB', 'iPhone 17 Pro Max', 'International Version (eSIM)'],
    images: [review1],
  },
  {
    name: 'Alcris Buaron P.',
    rating: 5,
    ago: '10 months ago', // updatedAt 2025-12-09
    title: 'A powerful, smooth, and premium-feeling device with outstanding camera performance.',
    body: 'The iPhone 17 Pro Max 512GB has exceeded my expectations. The performance is super smooth, apps load instantly, and the new camera system takes sharp, vibrant photos in any lighting condition. The silver finish looks very elegant, and the build feels premium. Battery life is strong, easily lasting a full day of heavy use. If you’re looking for a reliable flagship phone with top-tier features, this is an excellent choice.',
    verified: true,
    helpful: 341,
    variants: ['Silver', '512 GB', 'iPhone 17 Pro Max', 'International Version (eSIM)'],
    images: [review2, review3],
  },
  {
    name: 'Jul Ajim J.',
    rating: 5,
    ago: '3 months ago', // updatedAt 2026-06-26
    title: 'Very awesome items and stunning services noon🫡',
    body: 'Noon is very helpful all the way..unbeatable expectation from items solding online. Awesome and good quality phone i purchase and the delivery was so fast more than the estimated time schedule.  There for i give five stars⭐️⭐️⭐️⭐️⭐️ the delivery company naquel is awesome and friendly driver as well and on time. The next level noon thank you🫡🤝',
    verified: true,
    helpful: 19,
    variants: ['Cosmic Orange', '256 GB', 'iPhone 17 Pro Max', 'Middle East Version (eSIM)'],
    images: [review4, review5],
  },
];

/** Offer-level SD content captured for the default product (page text, N70211593V / offer edbc4677f7e4775c). */
/** built lazily: data.ts ↔ data.live.ts import each other */
const captured = (): Record<string, Partial<PdpContent>> => ({
  [IPHONE_17_PRO_ID]: {
    // "Coupons" row (page text) → discount_tags
    discountTags: [
      { title: 'Extra 10% off', code: 'CODE: SALE200' },
      { title: 'Extra 10% off', code: 'CODE: FAB10' },
      { title: 'Extra 15% off', code: 'CODE: RAK50' },
    ],
    // "Get it by 12 Oct · Order in 16h 26m"
    delivery: 'Get it by <b>12 Oct</b>',
    orderWithinMin: 16 * 60 + 26,
    // "or GET IN 1 HR 22 MINS  6549.00 ↗" (supermall / rocket offer) → buying_options
    buyingOptions: [{ code: 'rocket', html: 'GET IN <b>1 HR 22 MINS</b>', price: 6549 }],
    // "Payment Discount"
    payments: {
      title: 'Payment Discount',
      items: [
        { logo: payNoonOne, html: `Earn <b>${money(327.45)}</b> cashback with the noon One Credit Card. <a>Apply now</a>` },
        { logo: payNoonOne, html: `Earn <b>${money(327.45)}</b> cashback with the Mashreq noon Credit Card. <a>Apply now</a>` },
        { logo: paySplit, html: 'Split in up to 6 payments <a>View details</a>' },
        { logo: payInstallments, html: 'Buy now, pay in monthly installments later with select cards. <a>View details</a>' },
      ],
    },
    // reinforcement badges (icons inferred: the page's badge icons were not captured)
    offerBadges: [
      { icon: 'verified', title: 'Delivery by noon' },
      { icon: 'tick', title: 'High Rated Seller' },
      { icon: 'returnable', title: 'Low Returns' },
      { icon: 'verified', title: 'Secure Transaction' },
      { icon: 'warranty', title: '1 year manufacturer warranty' },
      { icon: 'returnable', title: 'Easy and Hassle Free Returns' },
    ],
    // "Sold by KKGSM 4.9 · 98% Positive Ratings · Item as shown 100% · Partner since 2+ Years · Low return seller"
    seller: {
      name: 'KKGSM',
      rating: 4.9,
      ratingCount: 171,
      positive: 98,
      metrics: [
        { kind: 'percent', title: 'Item as shown', value: 100, color: palette.greenOff },
        { kind: 'years', title: 'Partner since', value: 2 },
        { kind: 'badge', title: 'Low return seller' },
      ],
    },
    fbt: [IPHONE_17_PRO_ID, ...(fbtFor[IPHONE_17_PRO_ID] ?? [])],
  },
});

/** Variant matrix (noon `groups`) for a family member: exact attribute match → link + price; otherwise the closest member. */
export function familyGroups(p: Product): VariantGroup[] {
  const fam = variantFamilies.find((f) => f.id === p.variantFamily);
  if (!fam || !p.attributes) return [];
  const members = products.filter((m) => m.variantFamily === fam.id && m.attributes);
  const keys = fam.dimensions.map((d) => d.key);
  const score = (m: Product, want: ProductAttributes) => keys.filter((k) => m.attributes?.[k] === want[k]).length;
  return fam.dimensions.map((dim) => {
    const options = dim.options.map((value) => {
      const want: ProductAttributes = { ...p.attributes, [dim.key]: value };
      const exact = members.find((m) => score(m, want) === keys.length);
      const closest = exact ?? members.filter((m) => m.attributes?.[dim.key] === value).sort((a, b) => score(b, want) - score(a, want))[0];
      return {
        name: value,
        productId: closest?.id,
        image: dim.key === 'color' ? (swatches[value] ?? closest?.image) : undefined,
        // NoonOptionsSelection: every option is a SKU with its own price, so show the price of the SKU a tap switches to
        // (exact match, else the closest member) — the tiles keep their content whatever else is selected
        salePrice: closest?.price,
        price: closest?.was,
        available: !!closest,
      };
    });
    return { name: dim.name, options, versionGuide: dim.versionGuide, selected: dim.options.indexOf(p.attributes?.[dim.key] ?? '') };
  });
}

const rankHtml = (rank: number, categoryId: string) => `<b>#${rank}</b> in <a>${leafName(categoryId) ?? ''}</a>`;

/** PdpContent for a live product: product fields + captured offer content (or a derivation from its card). */
export function liveContent(p: Product): PdpContent {
  const c = captured()[p.id] ?? {};
  const inFamily = p.variantFamily === 'iphone-17-pro';
  const leaf = p.categoryId;
  const base: PdpContent = {
    brand: p.brand,
    officialStore: false, // the live page shows no official-store tick for Apple
    keyHighlights: undefined,
    dealTag: undefined,
    nudges: (p.nudges ?? []).filter((n) => n.kind !== 'rank').map((n) => n.text),
    bestPrice: undefined,
    discountTags: [],
    images: p.images ?? (p.image ? [p.image] : []),
    bestSellerTag: p.rank && leaf ? { html: rankHtml(p.rank, leaf), categoryId: leaf } : undefined,
    bestSellerCta: leaf && leafName(leaf) ? { html: `Explore other <b>bestsellers</b> in <a>${leafName(leaf)}</a>`, categoryId: leaf } : undefined,
    wasPriceSource: false,
    delivery: p.delivery,
    deliveryLogo: /GET IN/i.test(p.delivery) ? 'rocket' : 'express',
    orderWithinMin: undefined,
    isMember: true,
    payments: undefined,
    sizes: undefined,
    groups: familyGroups(p),
    offerBadges: [],
    description: p.description ?? '',
    featureBullets: p.featureBullets ?? [],
    specs: p.specs ?? [],
    additional: [
      { icon: 'warranty', text: '1 year manufacturer warranty' },
      { icon: 'returnable', text: 'Free 15 days returns. Learn more' }, // JSON-LD hasMerchantReturnPolicy: 15 days, free
    ],
    seller: { name: p.seller ?? 'noon', rating: p.sellerRating?.value ?? 4.8, ratingCount: p.sellerRating?.count, positive: 90, metrics: [] },
    reviews: inFamily ? iphoneReviews : [],
    commentCount: p.ratingCount,
    aiSummary: inFamily ? iphoneAiSummary : undefined,
  };
  return { ...base, ...c } as PdpContent;
}

