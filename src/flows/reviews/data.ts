/**
 * R&R 2.0 content, ported verbatim from repo vbirla789/R-R-2.0-with-checkbox (src/App.tsx, src/screens/*).
 * Products, attribute pools (8 each, ordered by relevance to the star rating), canned AI drafts and copy.
 * No prices appear in the review flow (the repo's "dhm299 refund credited" lives on its order list, not ported);
 * if one is ever needed, render it as `${currency} ${formatPrice(n)}` from src/mocks/products.ts.
 */
import { reviewsImages as img } from './assets';

// ───────────────────────────────────────── products ─────────────────────────────────────────

/** A product the review screens can show: image, name, chip / checkbox pools and the canned AI draft. */
export interface ReviewProduct {
  id: string;
  image: string;
  name: string;
  /** 8 items, most → least positive */
  positives: string[];
  /** 8 items, most → least critical */
  improvements: string[];
  /** what "Craft my review" generates */
  generatedText: string;
}

/** Which flow entered the review (App.tsx `reviewProduct`) — decides NewReview content and where Submitted goes. */
export type ReviewProductKey = 'bike' | 'iphone' | 'iphone16' | 'past';
/** Which review-draft layout the rate screen lands on: A (bike, ReviewDraftScreen) or B (iPhone, ReviewDraftScreenB). */
export type ReviewVariant = 'A' | 'B';
/** NewReview edit pattern per product (App.tsx `editVariant`): bike → pinned, iPhone 16 Pro → grow, iPhone 16 → top sheet. */
export type EditVariant = 'pinned' | 'grow' | 'sheet';

const BIKE_NAME = 'Black Bike Phone Holder for Bicycle Motorcycle, Compatible with iPhone, Samsung & Xiaomi';
const IPHONE_PRO_NAME = 'Apple iPhone 16 Pro 256GB Ultramarine 5G With FaceTime - International Version';

const IPHONE_POSITIVES = ['Stunning display', 'Smooth performance', 'Excellent cameras', 'Long battery life', 'Premium build', 'Fast charging', 'Great for gaming', 'Great value for money'];
const IPHONE_IMPROVEMENTS = ['Battery drains fast', 'Heats up easily', 'Slippery to hold', 'Charges slowly', 'Screen scratches easily', 'Camera underwhelms', 'Feels heavy', 'Poor value for money'];
const IPHONE_DRAFT =
  'Really impressed with this iPhone. The display is bright and sharp, performance stays smooth with zero lag even on heavy apps, and the battery easily lasts a full day. The cameras are excellent in any light and the whole build feels premium.';
const BIKE_DRAFT =
  'Really happy with this bike phone holder. It mounts securely on my handlebars and doesn’t budge even on bumpy rides. My phone slots in easily, the touchscreen cover stays responsive, and the screen is clear enough for navigation.';

/** NewReviewScreen BIKE_PRODUCT — the single-scroll chips flow (Figma 7629:275417 "Rating with pills"). */
export const BIKE_PRODUCT: ReviewProduct = {
  id: 'bike',
  image: img.productCase,
  name: BIKE_NAME,
  positives: ['Stays secure', 'Easy to mount', 'Sturdy build', 'Clear screen view', 'Fits handlebars well', 'Looks professional', 'Lightweight', 'Great value for money'],
  improvements: ['Hard to see glare', 'Blocks buttons', 'Fiddly to install', 'Phone slips out', 'Rattles on bumps', 'Hard to reach charging port', 'Feels bulky', 'Poor value for money'],
  generatedText: BIKE_DRAFT,
};

/** NewReviewScreen IPHONE_REVIEW_PRODUCT (order card 2, iPhone 16 Pro). */
export const IPHONE_REVIEW_PRODUCT: ReviewProduct = {
  id: 'iphone',
  image: img.iphone,
  name: IPHONE_PRO_NAME,
  positives: IPHONE_POSITIVES,
  improvements: IPHONE_IMPROVEMENTS,
  generatedText: IPHONE_DRAFT,
};

/** NewReviewScreen EXCHANGED_IPHONE_PRODUCT (order card 5, exchanged iPhone 16) — same chips, top-sheet edit. */
export const EXCHANGED_IPHONE_PRODUCT: ReviewProduct = {
  ...IPHONE_REVIEW_PRODUCT,
  id: 'iphone16',
  name: 'Apple iPhone 16 128GB Ultramarine 5G With FaceTime - International Version',
};

/** ReviewDraftScreen REVIEW_TEXT (variant A): long, so it collapses with "show more". */
export const REVIEW_DRAFT_A =
  'I’ve been using this bike phone case for a few weeks and it has performed really well. The mount holds my Android smartphone firmly in place, even when riding over uneven roads and small bumps. The clear front cover keeps the screen. The protective case is well designed and provides good coverage from dust, splashes, and everyday wear. I was pleased to find that the touchscreen remains responsive through the clear cover, allowing me to follow navigation, monitor fitness apps, or answer quick notifications without removing the phone. Installation was straightforward, with clear mounting hardware and a secure locking mechanism. Overall, the product feels durable, practical, and dependable. For cyclists who want convenient access to their phone while riding, this case offers a solid balance of protection, visibility, and ease.';
/** ReviewDraftScreenB REVIEW_TEXT (variant B, iPhone). */
export const REVIEW_DRAFT_B = IPHONE_DRAFT;
/** SubmittedScreen REVIEW_TEXT (the bike review shown on the thanks card). */
export const SUBMITTED_REVIEW_TEXT = BIKE_DRAFT;

/**
 * ManualReviewScreen default product (variant A, bike) — note its pools differ from BIKE_PRODUCT's
 * (ALL_POSITIVES / ALL_IMPROVEMENTS in ManualReviewScreen.tsx). Draft text = REVIEW_DRAFT_A.
 */
export const MANUAL_BIKE_PRODUCT: ReviewProduct = {
  id: 'bike-manual',
  image: img.productCase,
  name: BIKE_NAME,
  positives: ['Stays secure', 'Easy to mount', 'Clear screen view', 'Sturdy build', 'Fits handlebars well', 'Lightweight', 'Easy to remove phone', 'Great value for money'],
  improvements: ['Hard to see glare', 'Hard to remove phone', 'Hard to mount', "Doesn't stay secure", 'Feels fragile', "Doesn't fit all handlebars", 'Feels heavy', 'Poor value for money'],
  generatedText: REVIEW_DRAFT_A,
};

/** App.tsx IPHONE_PRODUCT — ManualReview variant B (2nd order card). Draft text = REVIEW_DRAFT_B. */
export const IPHONE_PRODUCT: ReviewProduct = {
  id: 'iphone-manual',
  image: img.iphone,
  name: IPHONE_PRO_NAME,
  positives: IPHONE_POSITIVES,
  improvements: IPHONE_IMPROVEMENTS,
  generatedText: IPHONE_DRAFT,
};



/** NewReview product per entry key (App.tsx: iphone → IPHONE_REVIEW_PRODUCT, iphone16 → EXCHANGED, else BIKE). */
export const newReviewProducts: Record<Exclude<ReviewProductKey, 'past'>, ReviewProduct> = {
  bike: BIKE_PRODUCT,
  iphone: IPHONE_REVIEW_PRODUCT,
  iphone16: EXCHANGED_IPHONE_PRODUCT,
};

/** NewReview edit pattern per entry key (App.tsx `editVariant`). */
export const editVariantFor: Record<Exclude<ReviewProductKey, 'past'>, EditVariant> = {
  bike: 'pinned',
  iphone: 'grow',
  iphone16: 'sheet',
};

/** ManualReview product per variant (App.tsx: variant B → IPHONE_PRODUCT, else the bike defaults). */
export const rateProducts: Record<ReviewVariant, ReviewProduct> = { A: MANUAL_BIKE_PRODUCT, B: IPHONE_PRODUCT };

/** RatePastOrdersScreen PRODUCTS — the strip, each with its own pools and draft (Figma 9129:106814). */
export const PAST_ORDER_PRODUCTS: ReviewProduct[] = [
  {
    id: 'fridge',
    image: img.pastOrder1,
    name: 'Gross 122L/Net 93L Single Door Refrigerator Fridge RR122D4ASU, Adjustable Thermostat, Big Door Shelf,',
    positives: ['Cools quickly', 'Whisper quiet', 'Spacious for its size', 'Sturdy build', 'Easy to clean', 'Looks premium', 'Energy efficient', 'Great value for money'],
    improvements: ['Runs loud at night', 'Door feels flimsy', 'Freezer shelf is small', 'Thermostat is fiddly', 'Takes time to cool', 'Interior light is dim', 'Shelves feel cramped', 'Poor value for money'],
    generatedText:
      'Really pleased with this little fridge. It cools down fast, runs quietly even at night, and the inside is surprisingly spacious for its size. The adjustable thermostat keeps everything at the right temperature and the big door shelf easily fits bottles.',
  },
  {
    id: 'jaguar',
    image: img.pastOrder2,
    name: 'Jaguar Classic Black edit',
    positives: ['Long lasting scent', 'Fresh opening', 'Great for daily wear', 'Classy bottle', 'Not overpowering', 'Good projection', 'Layers well', 'Great value for money'],
    improvements: ['Fades too fast', 'Too strong at first', 'Scent feels generic', 'Cap sits loose', 'Sprayer clogs', 'Too subtle', 'Not as described', 'Poor value for money'],
    generatedText:
      'Jaguar Classic Black has become my daily signature. The opening is fresh and clean, it settles into a warm scent that lasts through the workday, and it never feels overpowering. The bottle looks classy on the shelf too.',
  },
  {
    id: 'airpods-case',
    image: img.pastOrder3,
    name: 'Apple airpods case',
    positives: ['Snug fit', 'Solid protection', 'Grippy texture', 'Easy to pocket', 'Charges through it', 'Looks sleek', 'Lightweight', 'Great value for money'],
    improvements: ['Attracts lint', 'Hard to open', 'Adds bulk', 'Hinge feels weak', 'Scratches easily', 'Slippery to hold', 'Discolours over time', 'Poor value for money'],
    generatedText:
      'This case fits the AirPods perfectly — snug without being tight. The rugged texture makes it easy to grip, wireless charging works right through it, and it has already survived a couple of drops without a mark.',
  },
  {
    id: 'milton-bottle',
    image: img.washer,
    name: 'Milton 1000ml Stainless Steel Water Bottle, Single-Walled, BPA-Free, Leak-Proof',
    positives: ['No leaks at all', 'Easy-grip finish', 'Lightweight', 'Sturdy steel build', 'Fits car holders', 'Easy to clean', 'Looks premium', 'Great value for money'],
    improvements: ['Dents easily', 'Cap is stiff', 'Paint chips off', 'Metallic aftertaste', 'Narrow to refill', 'Sweats when cold', 'Strap feels weak', 'Poor value for money'],
    generatedText:
      "Great everyday bottle. It's genuinely leak-proof — it has been tossed in my bag daily without a single spill. The grip finish feels nice, it's light enough to carry everywhere, and the steel keeps water tasting clean.",
  },
];

/** A past order on the one-tap rating carousels. */
export interface PastOrder {
  id: string;
  image: string;
  name: string;
}

/** PastOrderRatingScreen CARDS (stacked deck, Figma 8842:127140). */
export const DECK_CARDS: PastOrder[] = [
  { id: 'fridge', image: img.pastOrder1, name: 'Gross 122L/Net 93L Single Door Refrigerator Fridge RR122D4ASU, Adjustable Thermostat, Big Door Shelf,' },
  { id: 'jaguar', image: img.pastOrder2, name: 'Jaguar Classic Black edit' },
  { id: 'airpods-case', image: img.pastOrder3, name: 'Spigen Rugged Armor Cover Case for Apple Airpods Pro Charcoal Gray' },
  { id: 'milton-bottle', image: img.washer, name: 'Milton 1000ml Stainless Steel Water Bottle, Single-Walled, BPA-Free, Leak-Proof' },
];

/** PastOrderRatingScreenB CARDS (horizontal slider, Figma 8810:123358) — the fridge has a shorter name here. */
export const SLIDER_CARDS: PastOrder[] = [
  { id: 'fridge', image: img.pastOrder1, name: 'Gross 122L/Net 93L Single Door Refrigerator, Silver' },
  { id: 'jaguar', image: img.pastOrder2, name: 'Jaguar Classic Black edit' },
  { id: 'airpods-case', image: img.pastOrder3, name: 'Spigen Rugged Armor Cover Case for Apple Airpods Pro Charcoal Gray' },
  { id: 'milton-bottle', image: img.washer, name: 'Milton 1000ml Stainless Steel Water Bottle, Single-Walled, BPA-Free, Leak-Proof' },
];

// ───────────────────────────────────────── attributes ─────────────────────────────────────────

/**
 * Rating → chip distribution (ManualReviewScreen getAttributes): 8 slots,
 *   positiveCount = (rating − 1) × 2   (clamped 0…8)
 *   negativeCount = 8 − positiveCount
 * so 1★ = 0 + 8, 2★ = 2 + 6, 3★ = 4 + 4, 4★ = 6 + 2, 5★ = 8 + 0. Each list is the head of its pool.
 * `unratedAs` (RatePastOrders): an unrated product (rating 0) shows the 4★ arrangement.
 */
export function getAttributes(rating: number, positivesPool: string[], improvementsPool: string[], opts: { unratedAs?: number } = {}) {
  const effective = rating > 0 ? rating : (opts.unratedAs ?? rating);
  const positiveCount = Math.max(0, Math.min(8, (effective - 1) * 2));
  const negativeCount = 8 - positiveCount;
  return { positives: positivesPool.slice(0, positiveCount), improvements: improvementsPool.slice(0, negativeCount) };
}

/** Same, straight from a product. */
export const attributesFor = (product: ReviewProduct, rating: number, opts?: { unratedAs?: number }) => getAttributes(rating, product.positives, product.improvements, opts);

/**
 * ReviewDraftScreen makeCollapsed: texts over 240 chars collapse to the first ~229 chars, trimmed back to a
 * whole word (matches Figma's "...keeps the screen" cut). Returns null when no "show more" is needed.
 */
export function makeCollapsed(text: string, at = 240, to = 229): string | null {
  if (text.length <= at) return null;
  return text.slice(0, to).replace(/\s+\S*$/, '');
}

// ───────────────────────────────────────── people + photos ─────────────────────────────────────────

export const reviewer = {
  name: 'Abdelrahman Baher',
  /** drafts + NewReview: anonymised attribution */
  hiddenName: 'Customer since 5 months',
  /** SubmittedScreen: anonymised attribution */
  hiddenNameSubmitted: 'Customer from Aug 13, 2026',
} as const;

/** Photos: what the Submitted card shows, and what AddPhotos' Camera / Gallery tiles add in the demo. */
export const reviewPhotos = {
  submitted: [img.review1, img.review2],
  camera: [img.review1, img.review2],
  gallery: [img.reviewPhoto1, img.reviewPhoto2, img.reviewPhoto3],
  max: 5,
} as const;

// ───────────────────────────────────────── copy ─────────────────────────────────────────

/** Every string the screens show, verbatim from the repo (sentence case as there). */
export const copy = {
  // headers
  yourReview: 'Your review', // ReviewDraft A/B header
  ratePastOrders: 'Rate your past orders', // RatePastOrders header
  editReview: 'Edit review', // top-sheet editor title / action
  // rate (ManualReview) + new
  writeWithAi: 'Write with AI',
  writeWithAiSub: 'Turn your picks into a review',
  wentWell: 'What went well?',
  couldBeBetter: 'What could have been better?',
  optionalNote: 'Add anything we missed (Optional)', // ManualReview optional field
  noteNew: 'Anything else you would like to add', // NewReview / RatePastOrders note
  manualPlaceholderRate: 'e.g. "Sound quality blew me away, but the case feels cheap"', // ManualReview manual mode
  manualPlaceholderNew: 'e.g. "Battery easily lasts a full day and the cameras are superb."', // NewReview manual mode
  addNote: 'Add note',
  craft: 'Craft my review',
  next: 'Next',
  continue: 'Continue',
  submit: 'Submit review',
  save: 'Save',
  saveChanges: 'Save changes',
  rateLabel: 'What would you rate it?', // order list rating row (repo OrderListScreen)
  // AI
  crafting: 'Crafting your draft',
  loaderWriting: 'Finangling through your choices',
  loaderDone: 'Review draft generated',
  stop: 'Stop processing',
  // draft card
  writtenBy: 'Written by',
  writtenByColon: 'Written by:', // SubmittedScreen
  hideName: 'Hide name',
  hideNameA: 'Hide Name', // ReviewDraft A capitalises it
  showName: 'Show name',
  showMore: 'show more',
  showLess: 'show less',
  // photos
  addPhotos: 'Add photos',
  camera: 'Camera',
  gallery: 'Gallery',
  photosHint: 'You can attach up to 5 images',
  // rewrite guard sheet (NewReview ProgressSheet)
  rewriteTitle: 'Rewrite your review?',
  rewriteBody: 'Editing your rating or chips will clear this draft. You can generate a new review after.',
  keepReview: 'Keep review',
  editPicks: 'Edit picks',
  // submitted
  thanksTitle: 'Thanks, you star!',
  thanksBody: 'We’ll take a quick look and publish it shortly',
  // past orders (deck / slider)
  thanksForSharing: 'Thanks for sharing',
  rateOthers: 'Rate your other orders on a single tap',
  tellUsMore: 'Tell us more',
  continueShopping: 'Continue shopping',
} as const;

// ───────────────────────────────────────── entry from the orders list ─────────────────────────────────────────

/** Where a star tap on a delivered order opens. */
export type ReviewEntry =
  | { route: 'reviews/new'; product: Exclude<ReviewProductKey, 'past'> }
  | { route: 'reviews/rate'; variant: ReviewVariant }
  | { route: 'reviews/pastOrders' };

/**
 * Order kind → review entry, from repo OrderListScreen.tsx (star taps) + App.tsx:
 *   delivered, still returnable (card 1, bike holder)        → reviews/new  product 'bike'     (pinned editor)
 *   delivered, return window closed (card 2, iPhone 16 Pro)  → reviews/new  product 'iphone'   (grow editor)
 *   exchanged (card 4, iPhone 16)                             → reviews/new  product 'iphone16' (top-sheet editor)
 *   returned / cancelled                                      → no rating row in the repo
 *   App.tsx ManualReview entry (older design)                 → reviews/rate variant 'A' (bike) / 'B' (iPhone)
 */
export const orderKindEntries = {
  deliveredReturnable: { route: 'reviews/new', product: 'bike' },
  deliveredReturnClosed: { route: 'reviews/new', product: 'iphone' },
  exchanged: { route: 'reviews/new', product: 'iphone16' },
} as const satisfies Record<string, ReviewEntry>;

/**
 * Our orders (src/flows/orders/data.ts) by id: o3 (delivered, returnable) → bike · o4 (delivered, return closed)
 * → iPhone 16 Pro · o9 (delivered April 18) → rate A. Unknown ids → rate A. The review screens
 * show the repo products (chips and drafts are product-specific), not the order's mock product.
 */
export const orderReviewEntries: Record<string, ReviewEntry> = {
  o3: orderKindEntries.deliveredReturnable,
  o4: orderKindEntries.deliveredReturnClosed,
  o9: { route: 'reviews/rate', variant: 'A' },
};
export const reviewEntryFor = (orderId?: string): ReviewEntry => (orderId && orderReviewEntries[orderId]) || { route: 'reviews/rate', variant: 'A' };
