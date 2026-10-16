import tabbyLogo from '@assets/checkout/payment-tabby.webp';
import tamaraLogo from '@assets/checkout/payment-tamara.webp';
import { palette } from '../../foundations/palette';
import { currency, formatPrice, type Product } from '../../data';
import { liveContent } from './data.live';

/**
 * PDP copy + server-driven demo content.
 * Copy: bappzaar master `marketplaces/noon/locale/translations/noon-en.json` (+ `src/locale/translations/en.json`).
 * Server-driven values (PDP API `product` / `offer`) are marked SD; MAPPING.md lists them per section.
 */
export const copy = {
  search: 'Search', // noon_search
  deliveryInfo: 'Delivery Information', // noon_delivery_info
  member: 'member', // noon_member
  orderIn: 'Order in', // noon_delivery_text_order_in
  hours: (n: number) => `${n}h`, // noon_delivery_text_hours
  minutes: (n: number) => `${n}m`, // noon_delivery_text_minutes
  ratings: 'ratings', // noon_rating (other)
  off: (v: number) => `${v}% OFF`, // off
  vat: '(Incl. VAT)', // vat_message
  size: 'Size', // noon_size
  sizeGuide: 'Size Guide', // noon_size_guide
  learnMore: 'Learn more', // noon_learn_more
  outOfStock: 'Out of stock', // noon_out_of_stock_item
  productOverview: 'Product Overview', // noon_product_overview
  description: 'Description', // noon_description
  highlights: 'Highlights', // noon_highlights
  specifications: 'Specifications', // noon_specifications
  additionalInfo: 'Additional Information', // noon_additional_info
  soldBy: 'Sold by', // noon_sold_by
  positive: (v: number) => `${v}% Positive`, // noon_rating_value_phrase
  sellerRatings: 'Seller Ratings', // noon_seller_ratings_label
  partnerSince: (v: number) => `${v}+ Years`, // noon_partner_since_years
  percent: (v: number) => `${v}%`, // noon_rating_value_percent
  moreOffers: 'More offers from other sellers', // noon_more_offers_from_sellers
  reviewsTitle: 'Ratings & Reviews', // noon_reviews_title
  avgRating: (count: string) => `Avg. rating based on ${count} ratings from trusted sources`, // noon_avg_rating_based_on_reviews
  allReviews: 'All reviews', // noon_reviews_all
  allCustomerReviews: 'All customer reviews', // noon_all_customer_reviews
  verifiedPurchase: 'Verified Purchase', // noon_verified_purchase
  fromTrustedSources: 'from trusted sources', // noon_from_trusted_sources
  helpful: 'Helpful', // noon_helpful
  showMore: 'more', // noon_product_review_show_more_text
  showLess: 'Less', // noon_product_review_show_less
  moreFrom: (brandName: string) => `More from ${brandName}`, // noon_brand_recommendations_title
  customersAlsoViewed: 'Customers Also Viewed', // noon_recommended_products_pdp
  qty: 'QTY', // noon_QTY
  quantity: 'Quantity', // noon_quantity
  buyNow: 'Buy Now', // noon_buy_now
  addToCart: 'Add to cart', // noon_add_to_cart_v2
  addToCartCaps: 'ADD TO CART', // add_to_cart (NoonOfferAddToCartQuantity)
  addedInCart: 'added in your cart', // noon_added_in_your_cart_message
  backToTop: 'Back to top', // noon_back_top
  addedToCart: 'Added to cart', // noon_added_to_cart
  continueShopping: 'CONTINUE SHOPPING', // noon_quick_cart_continue_shopping
  viewCart: 'View cart', // noon_quick_cart_view_cart (uppercased by style)
  sizeMissing: 'Please select the size', // noon_size_missing_add_to_cart
  frequentlyBought: 'Frequently Bought Together', // noon_frequently_bought_together_pdp
  buyTogether: (n: number) => (n === 0 ? 'Buy' : n === 1 ? 'Buy now' : `Buy ${n} items together`), // noon_frequently_bought_buy_together_noon
  aiSummary: (count: string) => `${count} reviews, summarised by noon AI`, // noon_ai_summary_text
  otherDeliveryOptions: 'Other Delivery Options', // noon_other_delivery_options
  linkCopied: 'Link copied to clipboard',
  addedToWishlist: 'Added to Wishlist',
  removedFromWishlist: 'Removed from Wishlist',
} as const;

/** noonAbbreviateNumber: 3240 → 3.2K */
export const abbreviate = (n: number) => (n >= 1000 ? `${(Math.round(n / 100) / 10).toString()}K` : `${n}`);
/** getNoonScoreRating */
export const score = (n: number) => (Math.round(n * 10) / 10).toFixed(1);
/** PriceDiscountUtil.getDiscountPercent (floored) + shouldShowDiscount (≥ 4%) */
export const discountPercent = (price: number, sale?: number) => (sale !== undefined ? Math.floor(((price - sale) / price) * 100) : 0);
export const showDiscount = (price: number, sale?: number) => discountPercent(price, sale) >= 4;
/** Price isCompact: integers lose their decimals */
export const money = (n: number) => `${currency} ${formatPrice(n)}`;

/** Gallery slides: real photos when the product has them, else the emoji with different tints/zoom. */
export const gallerySlides = (p: Product): (Product & { emojiScale?: number })[] =>
  p.images?.length ? p.images.map((image) => ({ ...p, image })) : emojiSlides(p);

const emojiSlides = (p: Product) => [
  { ...p, emojiScale: 0.46 },
  { ...p, tint: palette.kitGray94, emojiScale: 0.62 },
  { ...p, tint: palette.installationInfoBg, emojiScale: 0.34 },
  { ...p, tint: palette.antiFlashWhite, emojiScale: 0.52 },
];

export interface VariantOption {
  name: string;
  /** colour swatch tint for the image tile (stand-in for SD image_url) */
  swatch?: string;
  /** SD image_url (real product photo) */
  image?: string;
  /** product this option opens (noon onSelectOption → load that sku) */
  productId?: string;
  price?: number;
  salePrice?: number;
  available: boolean;
  tag?: string;
}
export interface VariantGroup {
  name: string;
  options: VariantOption[];
  /** has a version guide → "Learn more" */
  versionGuide?: boolean;
  /** option of the current product (family groups); otherwise local selection state */
  selected?: number;
}

const colorNames: Record<string, string> = {
  '#2B2B2E': 'Titanium Black', // token-lint-ignore: swatch hex → colour-name lookup (server data key)
  '#C9C8C3': 'Titanium Silver', // token-lint-ignore: swatch hex → colour-name lookup (server data key)
  '#5C6D8A': 'Titanium Blue', // token-lint-ignore: swatch hex → colour-name lookup (server data key)
  '#111111': 'Black', // token-lint-ignore: swatch hex → colour-name lookup (server data key)
  '#F2F2F2': 'White', // token-lint-ignore: swatch hex → colour-name lookup (server data key)
  '#B23A3A': 'Red', // token-lint-ignore: swatch hex → colour-name lookup (server data key)
  '#F5F5F7': 'White', // token-lint-ignore: swatch hex → colour-name lookup (server data key)
  '#1D1D1F': 'Midnight', // token-lint-ignore: swatch hex → colour-name lookup (server data key)
  '#C7D3C2': 'Eucalyptus', // token-lint-ignore: swatch hex → colour-name lookup (server data key)
  '#F2D7D9': 'Rose Quartz', // token-lint-ignore: swatch hex → colour-name lookup (server data key)
};
export const colorName = (c: string) => colorNames[c] ?? c;

/** demo: each larger storage / size option adds this to the price (SD option prices) */
export const storageStep = 400;

export interface PdpContent {
  brand: string;
  officialStore: boolean;
  keyHighlights?: string[];
  dealTag?: string;
  nudges: string[];
  /** SD best_price.tag_v2 */
  bestPrice?: { price: number; html: string };
  /** SD discount_tags (shown only when there is no best price): title + discount_code_display_text */
  discountTags: { title: string; code?: string }[];
  /** gallery images (real photos); empty → emoji slides */
  images: string[];
  /** NoonCategoryBestSellerTag (top, SD best_seller_tag): "#38 in Smartphones" */
  bestSellerTag?: { html: string; categoryId: string };
  /** NoonCategoryBestSeller CTA (bottom, SD best_seller_explore_cta) */
  bestSellerCta?: { html: string; subText?: string; categoryId: string };
  /** buying_options → "Other Delivery Options" accordion (NoonBuyingOption) */
  buyingOptions?: { code: 'rocket' | 'express'; html: string; price: number; was?: number; productId?: string }[];
  /** fbt_offers (product ids, current product first) */
  fbt?: string[];
  /** mp-trust-api product-reviews/ai-summary */
  aiSummary?: string[];
  /** SD was_price_source → info icon */
  wasPriceSource: boolean;
  delivery: string;
  /** ProductFlag image in NoonDeliveryInfoItem: rocket (supermall) or express */
  deliveryLogo?: 'rocket' | 'express';
  /** minutes until estimated_delivery_expires */
  orderWithinMin?: number;
  isMember: boolean;
  payments?: { title: string; items: { logo: string; html: string }[] };
  /** NoonSizeVariantSelection (fashion `variants`) */
  sizes?: { options: VariantOption[]; sizeGuide: boolean };
  /** NoonOptionsSelection `groups` */
  groups: VariantGroup[];
  offerBadges: { icon: 'returnable' | 'warranty' | 'verified' | 'tick' | 'offer'; title: string }[];
  description: string;
  featureBullets: string[];
  specs: [string, string][];
  additional: { icon: 'warranty' | 'returnable' | 'verified'; text: string }[];
  seller: {
    name: string;
    rating: number;
    /** partner_ratings_sellerlab.num_of_rating */
    ratingCount?: number;
    positive: number;
    metrics: { kind: 'years' | 'percent' | 'badge'; title: string; value?: number; color?: string }[];
  };
  reviews: { name: string; rating: number; ago: string; title: string; body: string; verified: boolean; helpful: number; variant?: string; variants?: string[]; images?: string[] }[];
  commentCount: number;
}

export function pdpContent(p: Product): PdpContent {
  return p.sku ? liveContent(p) : mockContent(p);
}

function mockContent(p: Product): PdpContent {
  const sale = p.price;
  const fashion = p.category === 'Fashion';
  const groups: VariantGroup[] = [];
  if (p.colors) groups.push({ name: 'Colour Name', options: p.colors.map((c) => ({ name: colorName(c), swatch: c, available: true })) });
  if (p.sizes && !fashion) {
    groups.push({
      name: p.category === 'Mobiles' ? 'Internal Memory' : 'Size',
      versionGuide: p.category === 'Mobiles',
      options: p.sizes.map((s, i) => ({
        name: s,
        salePrice: sale + i * storageStep,
        price: p.was ? p.was + i * storageStep : undefined,
        available: i < p.sizes!.length - 1 || p.category !== 'Mobiles' ? true : false,
        tag: i === 1 && p.category === 'Mobiles' ? 'Best value' : undefined,
      })),
    });
  }
  const isPhone = p.category === 'Mobiles';
  return {
    brand: p.brand,
    officialStore: ['Samsung', 'Apple', 'Sony'].includes(p.brand),
    keyHighlights: p.highlights,
    dealTag: p.was ? 'Limited Time Deal' : undefined,
    nudges: p.ratingCount > 1000 ? ['Only 3 left in stock', `${abbreviate(Math.round(p.ratingCount / 3))}+ sold recently`] : [],
    bestPrice: isPhone ? { price: Math.round(sale * 0.95), html: 'Get it for <highlight>5% less</highlight> with coupon' } : undefined,
    discountTags: !isPhone ? [{ title: p.coupon ?? 'Extra 10% off on ADCB cards' }] : [],
    images: [],
    wasPriceSource: !!p.was && isPhone,
    delivery: p.delivery,
    orderWithinMin: 3 * 60 + 12,
    isMember: true,
    payments: {
      title: 'Payments for you',
      items: [
        { logo: tabbyLogo, html: `Pay 4 interest-free payments of <b>${money(Math.ceil(sale / 4))}</b>. <a>Learn more</a>` },
        { logo: tamaraLogo, html: `Split in 3 payments of <b>${money(Math.ceil(sale / 3))}</b>. No late fees. <a>Learn more</a>` },
      ],
    },
    sizes: fashion && p.sizes ? { sizeGuide: true, options: p.sizes.map((s, i) => ({ name: s, available: i !== 2 })) } : undefined,
    groups,
    offerBadges: [
      { icon: 'returnable', title: 'Free 15 days returns' },
      { icon: 'warranty', title: isPhone ? '1 year warranty' : 'Warranty included' },
      { icon: 'verified', title: 'Secure transaction' },
    ],
    description: isPhone
      ? 'Meet the new standard for mobile performance. A titanium frame, an all-day battery and a pro-grade camera system that captures detail in any light. Galaxy AI helps you edit, translate and search like never before, right from your phone.'
      : `${p.title}. Designed for everyday use with premium materials and a finish that lasts.`,
    featureBullets: [...(p.highlights ?? []), 'Official UAE version with local warranty'],
    specs: isPhone
      ? [
          ['Model Number', 'SM-S938B'],
          ['Display Size', '6.9 inch'],
          ['Processor', 'Snapdragon 8 Elite for Galaxy'],
          ['Battery Capacity', '5000 mAh'],
          ['Operating System', 'Android 15'],
        ]
      : [
          ['Brand', p.brand],
          ['Category', p.category],
          ['Model Name', p.title.split(' ').slice(0, 3).join(' ')],
        ],
    additional: [
      { icon: 'warranty', text: isPhone ? '1 Year Brand Warranty' : '1 Year Warranty' },
      { icon: 'returnable', text: 'Free 15 days returns. Learn more' },
      ...(isPhone ? [{ icon: 'verified' as const, text: 'TDRA approved' }] : []),
    ],
    seller: {
      name: p.seller ?? 'noon',
      rating: 4.3,
      positive: 92,
      metrics: [
        { kind: 'years', title: 'Partner Since', value: 5 },
        { kind: 'percent', title: 'Item as Shown', value: 90, color: palette.greenOff },
        { kind: 'badge', title: 'Low Return Seller' },
      ],
    },
    reviews: [
      { name: 'omar k.', rating: 5, ago: '2 weeks ago', title: 'Worth every dirham', body: 'Delivered next morning, original box sealed. The camera is unreal at night and the battery easily lasts a full day of heavy use.', verified: true, helpful: 24, variant: p.sizes?.[0] },
      { name: 'sara m.', rating: 4, ago: '1 month ago', title: 'Great, but heavy', body: 'Battery easily lasts two days. A bit heavy for one-hand use but the screen is gorgeous.', verified: true, helpful: 8 },
      { name: 'ahmed', rating: 5, ago: '2 months ago', title: 'Excellent', body: 'Fast delivery and genuine product.', verified: false, helpful: 3 },
    ],
    commentCount: Math.round(p.ratingCount * 0.38),
  };
}
