import { getProduct, productById, user, type Product, currency } from '../../data';

/**
 * Copy from bappzaar origin/master translations (see MAPPING.md §13) and mock returns-API payloads
 * (server-driven, MAPPING.md §15). Product data always comes from src/mocks/products.ts.
 */
export const copy = {
  // features/afs/returns/locale/translations/returns-en.json
  continue: 'Continue',
  submitReturn: 'Submit Return',
  reasonQuestion: 'Why are you returning this item?',
  subReasonQuestion: 'What is the specific issue?',
  discardReturnQuestion: 'Discard this return?',
  discardReturnDesc: "Your details won't be saved.",
  discard: 'Discard',
  goBack: 'Go back',
  discardSectionQuestion: 'Discard section changes?',
  discardSectionDesc: "Your unsaved changes to this section won't be saved.",
  keepEditing: 'Keep editing',
  photosMin: (n: number) => (n === 1 ? `Upload at least ${n} photo` : `Upload at least ${n} photos`),
  photosRemaining: (n: number) => (n === 1 ? `Upload ${n} more photo` : `Upload ${n} more photos`),
  photosMax: (n: number) => (n === 1 ? `Upload up to ${n} photo` : `Upload up to ${n} photos`),
  photoGuide: 'Photo guide',
  photoGuideTips: 'Tips',
  photoGuideCta: 'Got it',
  skipStep: 'Skip this step',
  skipTitle: 'Add a note?',
  skipDesc: 'Help us understand the issue better',
  skipConfirm: 'Add note',
  camera: 'Camera',
  gallery: 'Gallery',
  openCamera: 'Open camera',
  uploadFromGallery: 'Upload from gallery',
  addPhotos: 'Add photos',
  noAddressTitle: 'No addresses found',
  noAddressSubtitle: 'Add an address for item pickup',
  addAddress: 'Add address',
  unnamedAddress: 'UNNAMED ADDRESS',
  confirm: 'Confirm',
  submitErrorTitle: 'We couldn’t fulfil your return',
  submitErrorDesc: 'We ran into an unexpected error. Please try again',
  tryAgain: 'Try again',
  contactSupport: 'Contact Support',
  chatWithSeller: 'Chat with seller',
  cancelReturn: 'Cancel return',
  returnId: 'Return ID',
  orderSummary: 'View order/invoice summary',
  policy: 'Return Policy',
  continueShopping: 'Continue Shopping',
  returnDetailsSmall: 'Return details',
  requestedDate: 'Requested date',
  dailyReturnId: 'Return ID',
  uploadedImages: 'Uploaded images',
  pickupDateTime: 'Pickup date & time',
  pickupAddress: 'Pickup address',
  cancelHeaderTitle: 'Return request cancelled',
  cancelHeaderDesc: 'You can still submit a new request if eligible',
  cancelOverlayTitle: 'Cancel return request?',
  cancelOverlayDesc: 'Your return request will be cancelled and pickup will not be processed.',
  titleSubmit: 'Return your item',
  titleDetails: 'Return details',
  titleRequestSummary: 'Return request summary',
  returnableHeader: 'Your recent purchases',
  feedbackQuestion: 'Based on your noon return experience, how likely are you to recommend noon to a friend or colleague?',
  feedbackNotLikely: 'Not at all likely',
  feedbackLikely: 'Extremely likely',
  feedbackTitle: 'Give us your valuable feedback',
  feedbackSubmit: 'Submit Feedback',
  feedbackSubmitting: 'Submitting',
  feedbackDislikeQ: 'What did you not like about noon?',
  feedbackSuggestionQ: 'How do you think we could improve?',
  feedbackLikeQ: 'What do you like the most about noon?',
  feedbackComment: 'Want to share anything else? Write it here.',
  feedbackSuccess: 'Thanks for your feedback',
  minChars: (n: number) => (n === 1 ? `${n} character minimum` : `${n} characters minimum`),
  remainingChars: (n: number) => (n === 1 ? `${n} character to go` : `${n} characters to go`),
  maxChars: (n: number) => (n === 1 ? `${n} character maximum` : `${n} characters maximum`),
  multipleSpaces: 'Please remove consecutive spaces',
  repeatedChars: 'Please avoid repeating characters',
  // src/locale/translations/en.json
  refundSummaryRow: 'Refund summary',
  refundSummaryDesc: 'Your total estimated refund is',
  requestSummaryRow: 'Return request summary',
  requestSummaryDesc: 'Return details, additional details and images',
  orderSummaryDesc: 'Find invoice, shipping details here',
  soldBy: 'Sold by',
  done: 'DONE',
  // marketplaces/noon/locale/translations/noon-en.json
  historyHeader: 'Returns',
  historySearchPlaceholder: 'Search all return requests',
  newReturnRequest: 'New return request',
  createNewReturn: 'Create a new return',
  emptyTitle: "We don't see any returns requested",
  emptyMessage: 'Need to submit a request? Just click on the button below!',
  noonSoldBy: 'sold by',
  noonItem: 'item',
  extendedWarranty: 'with additional protection',
  trackMyReturn: 'Track my return',
  noonCancelReturn: 'Cancel Return',
  noonRefundSummary: 'Refund summary',
  refundTotal: 'Refund Total',
} as const;

// ───────────────────────────── products ─────────────────────────────

/** productId → any catalogue product (demo products, the live iPhone page, its carousels), by id or sku. */
export function resolveProduct(id?: string): Product {
  // the whole catalogue (src/data) — incl. the orders items, so "Return" on an order (orders/tracking?orderId=o9)
  // opens the same product; unknown ids show the demo item p5
  return getProduct(id) ?? productById('p5');
}

/** order the demo item belongs to (src/flows/orders/data.ts: p5 → o3, the o9 fridge → o9) */
export const orderIdFor = (productId: string) => (productId === 'pds-fridge' ? 'o9' : 'o3');

const orderNumbers: Record<string, string> = { p5: 'NAEH40021571220', p3: 'NAEH40021588107', p8: 'NAEH40021530778', p7: 'NAEH40021544019' };
const orderNumberFor = (p: Product) => orderNumbers[p.id] ?? `NAEH4002${String(Math.abs(hash(p.id))).padStart(7, '0').slice(0, 7)}`;
function hash(s: string) {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0;
  return h;
}

/** SD `returnItemNr` */
export const returnNumberFor = (p: Product) => `R${orderNumberFor(p).slice(4)}`;

/** SD productDetails.flags → ProductFlag: 'fbn' renders the express pill */
export const isExpress = (p: Product) => !!p.express;

// ───────────────────────────── formatting ─────────────────────────────

/** `Price` (precision 2) → 1,699.00 */
export const price2 = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
/** AFSReturnsLegacyUtils.formatRefundAmount → getFormattedPrice(n, code, 2, stripInsignificantZeros) */
export const formatRefund = (n: number, code = currency) => `${code} ${n.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;

// ───────────────────────────── details payload (SD) ─────────────────────────────

export interface TrackingStage {
  shortName: string;
  desc: string;
  date: string;
  colorCode?: string;
}
export interface Tracking {
  stages: TrackingStage[];
  currentStage: number;
  colorCode: string;
}

/** days after the request each SD stage date falls on (Requested · Pickup · Inspection · Refund) */
const STAGE_DAY_OFFSETS = [0, 1, 3, 4];

/** "Oct 10, 2026" + n days → "Oct 11" (SD stage `date`) */
function stageDate(requestedAt: string, days: number) {
  const d = new Date(requestedAt);
  if (Number.isNaN(d.getTime())) return '';
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** SD tracking: a stage carries its date once it is reached (the pickup date is the scheduled one) */
export function trackingFor(currentStage: number, cancelled = false, requestedAt = 'Oct 10, 2026'): Tracking {
  const date = (stage: number) => (stage <= Math.max(currentStage, 2) ? stageDate(requestedAt, STAGE_DAY_OFFSETS[stage - 1]) : '');
  if (cancelled) {
    return {
      currentStage: 2,
      colorCode: 'red',
      stages: [
        { shortName: 'Requested', date: stageDate(requestedAt, 0), desc: 'We have received your return request.' },
        { shortName: 'Cancelled', date: stageDate(requestedAt, 0), desc: 'You cancelled this return request. Pickup will not be processed.', colorCode: 'red' },
      ],
    };
  }
  return {
    currentStage,
    colorCode: 'green',
    stages: [
      { shortName: 'Requested', date: date(1), desc: 'We have received your return request.' },
      { shortName: 'Pickup', date: date(2), desc: 'Our courier will collect the item from your pickup address. Keep it packed with all accessories.' },
      { shortName: 'Inspection', date: date(3), desc: 'Once the item reaches our warehouse, we check that it meets the return policy.' },
      { shortName: 'Refund', date: date(4), desc: 'Your refund is issued to the selected refund method after inspection.' },
    ],
  };
}

export interface RefundDetails {
  totalRefundAmount: number;
  currencyCode: string;
  desc: string;
  sections: { title: string; refundAmount: number }[];
}
export const refundDetailsFor = (p: Product): RefundDetails => ({
  totalRefundAmount: p.price,
  currencyCode: currency,
  desc: 'Your refund will be issued to your original payment method once the item passes inspection.',
  sections: [{ title: 'Item price', refundAmount: p.price }],
});

/** SD feedbackWidget — rates 0–10, options per rate band */
const dislike = [
  { code: 'pickup_delay', name: 'Pickup was delayed' },
  { code: 'refund_slow', name: 'Refund took too long' },
  { code: 'courier', name: 'Courier experience' },
  { code: 'process', name: 'Return process was confusing' },
  { code: 'support', name: 'Customer support' },
];
const suggest = [
  { code: 'faster_pickup', name: 'Faster pickup' },
  { code: 'faster_refund', name: 'Faster refund' },
  { code: 'updates', name: 'Better status updates' },
  { code: 'easier', name: 'Easier return steps' },
];
const like = [
  { code: 'easy', name: 'Easy to submit' },
  { code: 'quick_pickup', name: 'Quick pickup' },
  { code: 'quick_refund', name: 'Quick refund' },
  { code: 'courier_great', name: 'Friendly courier' },
];
export const feedbackWidget = Array.from({ length: 11 }, (_, rate) => ({ rate, options: rate <= 6 ? dislike : rate <= 8 ? suggest : like }));

/** SD return policy (getReturnConditionsList) */
export const returnPolicy = {
  title: 'Return Policy',
  firstDesc: 'You can return eligible items within 15 days of delivery.',
  secondDesc: 'To be eligible, the item must be:',
  lines: ['Unused and in the same condition you received it', 'In the original packaging with all tags and accessories', 'Accompanied by the invoice or proof of purchase'],
  button: { text: 'Read full policy', uri: '/return-policy' },
};

/** SD successHeader (create_return response) */
export const successHeader = {
  title: 'Return request submitted',
  description: "We'll pick up your item on the selected date.",
};

// ───────────────────────────── submission sections (SD) ─────────────────────────────

export interface SubReason {
  code: string;
  name: string;
}
export interface Reason extends SubReason {
  art: string;
  subReasonList: SubReason[];
}
export const reasons: Reason[] = [
  { code: 'damaged', name: 'Item is damaged', art: '📦', subReasonList: [{ code: 'arrived_broken', name: 'Arrived broken' }, { code: 'scratches', name: 'Scratches or dents' }, { code: 'packaging', name: 'Packaging was damaged' }] },
  { code: 'defective', name: 'Item is defective', art: '⚠️', subReasonList: [{ code: 'not_working', name: 'Stopped working' }, { code: 'doa', name: "Doesn't turn on" }, { code: 'performance', name: 'Poor performance' }] },
  { code: 'wrong_item', name: 'Received wrong item', art: '🔀', subReasonList: [{ code: 'different_product', name: 'Different product' }, { code: 'wrong_colour', name: 'Wrong colour or size' }, { code: 'wrong_qty', name: 'Wrong quantity' }] },
  { code: 'missing', name: 'Missing parts or accessories', art: '🧩', subReasonList: [] },
  { code: 'not_as_described', name: 'Not as described', art: '📝', subReasonList: [{ code: 'quality', name: 'Quality is not as expected' }, { code: 'features', name: 'Features are missing' }, { code: 'photos', name: 'Looks different from the photos' }] },
  { code: 'changed_mind', name: 'No longer needed', art: '🤷', subReasonList: [] },
];

export const evidenceConfig = {
  images: { title: 'Add photos of the item', minCount: 0, maxCount: 5 },
  comment: { title: 'Add a note (optional)', minLength: 10, maxLength: 500, mandatory: false },
  uploadGuideline: {
    title: 'How to take good photos',
    sectionsV2: ['Show the whole item in good light', 'Take a close-up of the damage or issue', 'Include the label or serial number'],
  },
};

export interface ResolutionMode {
  code: string;
  titleV2: string;
  subtitleV2: string;
  descV2: string;
  icon: 'wallet' | 'returns';
  amount: (p: Product) => string;
}
export const resolution = {
  titleV2: 'How would you like us to resolve this?',
  modes: [
    { code: 'refund', titleV2: 'Refund', subtitleV2: 'Get your money back', descV2: 'After pickup and inspection', icon: 'wallet', amount: (p: Product) => formatRefund(p.price) },
    { code: 'replacement', titleV2: 'Replacement', subtitleV2: 'Get the same item again', descV2: 'Delivered after pickup', icon: 'returns', amount: () => 'Free' },
  ] as ResolutionMode[],
};

export const estimatedRefund = (p: Product) => ({
  title: 'Estimated refund',
  amount: formatRefund(p.price),
  detailsTitle: 'Refund details',
  rows: [
    { title: 'Item price', amount: formatRefund(p.price) },
    { title: 'Shipping fee', amount: formatRefund(0) },
  ],
  total: { title: 'Total refund', amount: formatRefund(p.price) },
});

export interface RefundOption {
  refundFlow: string;
  desc: string;
  sources: { code: string; title: string; icon: 'card' | 'credits' }[];
  tag?: { title: string; color: string };
}
export const refundSection = {
  title: 'Where should we send your refund?',
  options: [
    { refundFlow: 'original', desc: 'Refunded in 5–7 business days after inspection', sources: [{ code: 'mastercard', title: 'Mastercard •••• 8890', icon: 'card' }] },
    { refundFlow: 'credits', desc: 'Use it on your next order', sources: [{ code: 'noon_credits', title: 'noon Credits', icon: 'credits' }], tag: { title: 'Instant refund after pickup', color: 'var(--nk-color-success)' } },
  ] as RefundOption[],
};

export interface PickupSlot {
  code: string;
  desc: string;
}
export interface PickupOption {
  date: { day: string; monthName: string; dayName: string };
  slots: PickupSlot[];
}
export const pickupSection = {
  addressHeader: 'Pickup from',
  pickupHeader: 'Select pickup date & time',
  options: [
    { date: { day: '11', monthName: 'Oct', dayName: 'Sat' }, slots: [{ code: 'rocket', desc: '8 AM - 12 PM' }, { code: 'pm', desc: '12 PM - 6 PM' }] },
    { date: { day: '12', monthName: 'Oct', dayName: 'Sun' }, slots: [{ code: 'am', desc: '8 AM - 12 PM' }, { code: 'pm', desc: '12 PM - 6 PM' }] },
    { date: { day: '13', monthName: 'Oct', dayName: 'Mon' }, slots: [{ code: 'day', desc: '8 AM - 6 PM' }] },
    { date: { day: '14', monthName: 'Oct', dayName: 'Tue' }, slots: [] },
    { date: { day: '15', monthName: 'Oct', dayName: 'Wed' }, slots: [{ code: 'am', desc: '8 AM - 12 PM' }, { code: 'pm', desc: '12 PM - 6 PM' }] },
  ] as PickupOption[],
};

export const addresses = [
  { code: 'home', label: 'Home', area: `${user.address.line}, ${user.address.city}`, distance: '', phone: user.phone, verified: true },
  { code: 'work', label: 'Work', area: 'Office 1204, Al Habtoor Business Tower, Dubai Marina, Dubai', distance: '2.1 km', phone: user.phone, verified: true },
];

/** SD info.cancelText */
export const cancelText = 'You can return this item until Oct 17';

export const sectionOrder = ['reason', 'comment_images', 'return_mode', 'refund_method', 'pickup_details'] as const;
export type SectionCode = (typeof sectionOrder)[number];

// ───────────────────────────── history (SD) ─────────────────────────────

export const yearFilters = [
  { key: 3, name: 'Last 3 months' },
  { key: 2026, name: '2026' },
  { key: 2025, name: '2025' },
];
export const statusFilters = [
  { key: 'in_progress', name: 'In progress' },
  { key: 'completed', name: 'Completed' },
  { key: 'cancelled', name: 'Cancelled' },
];

export interface HistoryItem {
  productId: string;
  returnItemNr: string;
  status: { label: string; colorCode: string; group: string; icon: 'truck' | 'checkCircle' | 'close' | 'clock' };
  /** SD trackingAction: the details screen shows it as an outline button only for actionCode 'refunded' (opens deepLink) */
  trackingAction?: { title: string; actionCode?: string; deepLink?: string };
}
