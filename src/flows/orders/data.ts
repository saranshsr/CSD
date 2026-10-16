import { currency, getProduct, type Product } from '../../data';
import { productImages as img } from './assets';

/**
 * Orders content from the PDS reference (pds-noon-as.vercel.app one-flows → My Orders → "Arriving today"); see
 * MAPPING.md. Ids o3 / o4 / o5 keep their meaning for the returns and reviews flows (o3 delivered + returnable,
 * o4 delivered + return window closed, o5 cancelled). o9 is delivered with the return flow enabled ("Return" CTA).
 */
export type OrderStatus = 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'returned' | 'exchanged';

export interface OrderItem {
  product: Product;
  qty: number;
  price: number;
  /** express pill on the order-summary thumb */
  express?: boolean;
  /** blue installation badge on the thumb (washer) */
  installation?: boolean;
  /** return policy note in the order summary (bappzaar `item.returnable`: valid → available, else window closed / none) */
  returnPolicy?: 'available' | 'none' | 'closed';
  warranty?: string;
  returnable?: 'open' | 'closed';
  rating?: number;
}

export interface Order {
  id: string;
  number: string;
  status: OrderStatus;
  /** word in the card header ("Ordered", "Delivered", …) */
  statusWord: string;
  /** e.g. "Out for delivery" */
  statusLabel: string;
  /** "April 16, 2026" */
  date: string;
  /** "Arriving today" */
  eta: string;
  items: OrderItem[];
  /** item count shown in the details header ("8 items") */
  itemCount: number;
  /** listing card: count + thumb (the reference card summarises the active shipment) */
  listCount?: number;
  listThumb?: string;
  /** image-stack ring on the details page (left → right, centre card at `stackCentre`) */
  stack?: { image: string; title: string; qty?: number; installation?: boolean }[];
  stackCentre?: number;
  pin?: string;
  /** 0..3 index into trackingSteps */
  step: number;
  stepDates: string[];
  onTime?: boolean;
  window?: string;
  heatWindow?: string;
  marketplace: 'noon' | 'supermall' | 'express';
  rider?: { name: string; deliveries: string };
  address?: { label: string; line: string };
  receiver?: { name: string; phone: string; note: string };
  /** history card extras */
  refundChip?: string;
  warrantyChip?: string;
  refundCredited?: { date: string; card: string };
  /** the exchanged order opens the iPhone 16 review (reviews README "Order kinds") */
  reviewProduct?: 'iphone16';
  total: number;
  paidWith: string;
  bill?: Bill;
  /** the return-details API offers "Return" (`buttonType: 'return_submit'`) for this item → returns/submit */
  returnItem?: { productId: string };
  /** cancelled: `status.cancelReason` (the only eyebrow text) */
  cancelReason?: string;
  /** refund line in the tracker card (returned / cancelled) */
  refund?: { amount: number; to: string; on: string; credited?: boolean };
}

/**
 * What the details page shows for an order, by state. On master all of this is server data
 * (`timeline[].status`, `summary.deliveryMessageTracking`, `trackActions` / `subStatusActions`, `summary.type`,
 * `return_info`); the client only picks layout and colour (features/o2d `o2dOrderTracking*Selectors.ts`). Here it is
 * derived from `status` so each mock order renders the state the app would — see MAPPING.md → "States".
 */
export type OrderActionCode = 'reschedule' | 'see_all_actions' | 'contact_customer_support' | 'return_initiate' | 'view_refund_tracking' | 'view_return_details' | 'view_return_policy';
export interface OrderAction {
  code: OrderActionCode;
  label: string;
}
export type TimelineKind = 'delivery' | 'return' | 'exchange';
export interface OrderTracking {
  /** `status.highStatus` (grey, uppercase); omitted when it equals the badge or the order is cancelled */
  highStatus?: string;
  /** `subStatus || highStatus`, coloured by `highStatusColor` */
  badge: string;
  badgeTone: 'success' | 'danger' | 'muted';
  /** cancelled orders: the headline turns `dangerRed` */
  titleTone?: 'danger';
  /** null = timeline hidden (cancelled / pending cancellation) */
  timeline: TimelineKind | null;
  /** HTML status message under the timeline (`**bold**` = the API's <b>) */
  message?: string;
  /** CTA row: `trackActions` + `subStatusActions` + the return-details button, first two */
  actions: OrderAction[];
  /** "Quick actions" card (`summary.quickActions`, return cards) */
  quickActions?: (OrderAction & { icon: 'return-package' | 'rewind-alt' })[];
  /** `summary.type === 'return'`: no bill summary, help FAB on the RETURNS entry point */
  returnCard?: boolean;
  /** O2DOrderDeliveryInfoCard title */
  addressTitle: 'Delivering to' | 'Delivered to' | 'Delivery information';
}

const help: OrderAction = { code: 'contact_customer_support', label: 'Get help' };
const updates: OrderAction = { code: 'see_all_actions', label: 'See all updates' };
const trackRefund: OrderAction = { code: 'view_refund_tracking', label: 'Track refund' };

export function trackingFor(o: Order): OrderTracking {
  const refundMsg = o.refund && `Refund of **${currency} ${money2(o.refund.amount)}** ${o.refund.credited ? 'credited' : 'sent'} to **${o.refund.to}** on ${o.refund.on}.`;
  switch (o.status) {
    case 'cancelled':
      return { badge: o.cancelReason ?? 'Cancelled', badgeTone: 'muted', titleTone: 'danger', timeline: null, message: refundMsg, actions: [trackRefund, help], addressTitle: 'Delivery information' };
    case 'returned':
      return {
        highStatus: 'Returned',
        badge: 'Refunded',
        badgeTone: 'success',
        timeline: 'return',
        message: refundMsg,
        actions: [trackRefund, help],
        quickActions: [
          { code: 'view_return_details', label: 'Return details', icon: 'return-package' },
          { code: 'view_return_policy', label: 'Return policy', icon: 'rewind-alt' },
        ],
        returnCard: true,
        addressTitle: 'Delivered to',
      };
    case 'exchanged':
      return { highStatus: 'Exchanged', badge: 'Completed', badgeTone: 'success', timeline: 'exchange', actions: [help, updates], addressTitle: 'Delivered to' };
    case 'delivered':
      return { highStatus: 'Delivered', badge: 'Completed', badgeTone: 'success', timeline: 'delivery', actions: [o.returnItem ? { code: 'return_initiate', label: 'Return' } : help, updates], addressTitle: 'Delivered to' };
    default:
      return { highStatus: o.statusLabel, badge: 'On time', badgeTone: 'success', timeline: 'delivery', actions: [{ code: 'reschedule', label: 'Reschedule' }, updates], addressTitle: 'Delivering to' };
  }
}

export interface Bill {
  method: 'applePay';
  methodLabel: string;
  subtotal: number;
  subtotalWas: number;
  delivery: number;
  coupon: number;
  total: number;
  saved: number;
  cashback: number;
  note: string;
}

/** The order lines' products — catalogue entries `pds-*` (src/data/products, collection `orders`). */
const item = (id: string): Product => {
  const p = getProduct(id);
  if (!p) throw new Error(`orders: no product "${id}" in src/data/products`);
  return p;
};
export const pdsProducts = {
  fridge: item('pds-fridge'),
  jaguar: item('pds-jaguar'),
  washer: item('pds-washer'),
  bottle: item('pds-bottle'),
  airpods: item('pds-airpods-case'),
  iphone: item('pds-iphone'),
  storage: item('pds-storage'),
};

export const trackingSteps = [
  { id: 'placed', label: 'Placed', icon: 'check-circle-filled', size: 24 },
  /** taped box / storefront glyphs are not in the Origin set — PDS SVGs, tinted with MaskIcon */
  { id: 'packed', label: 'Packed', art: 'stepPacked', w: 18, h: 18 },
  { id: 'dispatched', label: 'Dispatched', art: 'stepDispatched', w: 21, h: 17 },
  { id: 'delivered', label: 'Delivered', icon: 'location-filled', size: 24 },
] as const;

/** server `timeline[]` per card type (labels + icons are API data on master; these are the demo set) */
export const returnSteps = [
  { id: 'requested', label: 'Requested', icon: 'return-package-filled', size: 20 },
  { id: 'picked', label: 'Picked up', icon: 'truck-filled', size: 20 },
  { id: 'inspected', label: 'Inspected', icon: 'search-check-filled', size: 20 },
  { id: 'refunded', label: 'Refunded', icon: 'currency-note-wave-rewind-filled', size: 20 },
] as const;
export const exchangeSteps = [
  { id: 'requested', label: 'Requested', icon: 'return-package-filled', size: 20 },
  { id: 'picked', label: 'Picked up', icon: 'truck-filled', size: 20 },
  trackingSteps[2],
  trackingSteps[3],
] as const;
export const stepsFor = (kind: TimelineKind) => (kind === 'return' ? returnSteps : kind === 'exchange' ? exchangeSteps : trackingSteps);

const DATE = 'April 16, 2026';


export const orders: Order[] = [
  {
    id: 'o1',
    number: '032983823 - 1',
    status: 'out_for_delivery',
    statusWord: 'Ordered',
    statusLabel: 'Out for delivery',
    date: DATE,
    eta: 'Arriving today',
    items: [
      { product: pdsProducts.fridge, qty: 1, price: 328, express: true, returnPolicy: 'available', warranty: '1-year warranty' },
      { product: pdsProducts.jaguar, qty: 1, price: 328, express: true, returnPolicy: 'none' },
    ],
    itemCount: 8,
    listCount: 1,
    listThumb: img.perfumeJaguarSm,
    stack: [
      { image: img.perfumeBlue, title: 'Perfume' },
      { image: img.jaguar, title: 'Classic Black EDT For Men 100ml' },
      { image: img.fridge, title: 'Single Door Refrigerator' },
      { image: img.bottle, title: 'Milton 1000ml Water Bottle' },
      { image: img.airpodsCase, title: 'AirPods Pro 3 case' },
      { image: img.washer, title: 'Samsung 8KG Washer', installation: true },
      { image: img.storage, title: 'Clothes Storage Bag', qty: 2 },
      { image: img.iphone, title: 'Apple iPhone 16' },
    ],
    stackCentre: 2,
    pin: '124500',
    step: 2,
    stepDates: ['Apr 26', 'Apr 28', 'Apr 29', ''],
    onTime: true,
    window: 'Likely to arrive between 1 pm - 6 pm',
    heatWindow: 'Expected today between 11 am - 5 pm',
    marketplace: 'express',
    rider: { name: 'Ahmed M. Mohammed', deliveries: '3,000+ perfect deliveries' },
    address: { label: 'Home', line: '676D, Downtown, Dubai' },
    receiver: { name: 'Anurag', phone: '+971 (0) 412 3456', note: 'Rider will contact this number if needed' },
    total: 50.6,
    paidWith: 'Apple Pay',
    bill: { method: 'applePay', methodLabel: 'Apple Pay', subtotal: 45.6, subtotalWas: 80.6, delivery: 7, coupon: 2, total: 50.6, saved: 2, cashback: 2.53, note: 'Cashback credits to the primary cardholder' },
  },
  {
    id: 'o3',
    number: '032983711 - 1',
    status: 'delivered',
    statusWord: 'Delivered',
    statusLabel: 'Delivered',
    date: DATE,
    eta: 'Delivered on April 16',
    items: [{ product: pdsProducts.washer, qty: 1, price: 23.99, express: true, installation: true, returnable: 'open', returnPolicy: 'available' }],
    itemCount: 1,
    step: 3,
    stepDates: ['Apr 12', 'Apr 13', 'Apr 14', 'Apr 16'],
    marketplace: 'express',
    total: 23.99,
    paidWith: 'Apple Pay',
  },
  {
    id: 'o9',
    number: '032983980 - 1',
    status: 'delivered',
    statusWord: 'Delivered',
    statusLabel: 'Delivered',
    date: 'April 18, 2026',
    eta: 'Delivered on April 18',
    items: [
      { product: pdsProducts.fridge, qty: 1, price: 328, returnable: 'open', returnPolicy: 'available', warranty: '1-year warranty' },
      { product: pdsProducts.jaguar, qty: 1, price: 328, returnPolicy: 'none' },
    ],
    itemCount: 2,
    step: 3,
    stepDates: ['Apr 14', 'Apr 15', 'Apr 16', 'Apr 18'],
    marketplace: 'noon',
    address: { label: 'Home', line: '676D, Downtown, Dubai' },
    returnItem: { productId: 'pds-fridge' },
    total: 656,
    paidWith: 'Apple Pay',
    bill: { method: 'applePay', methodLabel: 'Apple Pay', subtotal: 656, subtotalWas: 720, delivery: 0, coupon: 0, total: 656, saved: 64, cashback: 3.28, note: 'Cashback credits to the primary cardholder' },
  },
  {
    id: 'o4',
    number: '032983655 - 1',
    status: 'delivered',
    statusWord: 'Delivered',
    statusLabel: 'Delivered',
    date: DATE,
    eta: 'Delivered on April 16',
    items: [{ product: pdsProducts.bottle, qty: 1, price: 23.99, express: true, returnable: 'closed', returnPolicy: 'closed' }],
    itemCount: 1,
    step: 3,
    stepDates: ['Apr 12', 'Apr 13', 'Apr 14', 'Apr 16'],
    marketplace: 'express',
    total: 23.99,
    paidWith: 'Apple Pay',
  },
  {
    id: 'o7',
    number: '032983540 - 1',
    status: 'returned',
    statusWord: 'Return completed',
    statusLabel: 'Return completed',
    date: DATE,
    eta: 'Returned on April 16',
    items: [{ product: pdsProducts.airpods, qty: 1, price: 23.99, express: true }],
    itemCount: 1,
    step: 3,
    stepDates: ['Apr 12', 'Apr 13', 'Apr 15', 'Apr 16'],
    marketplace: 'express',
    refundChip: 'Refund triggered on April 21',
    refund: { amount: 23.99, to: 'Apple Pay', on: 'April 21' },
    total: 23.99,
    paidWith: 'Apple Pay',
  },
  {
    id: 'o8',
    number: '032983402 - 1',
    status: 'exchanged',
    statusWord: 'Exchanged',
    statusLabel: 'Exchanged',
    date: DATE,
    eta: 'Exchanged on April 16',
    items: [{ product: pdsProducts.iphone, qty: 1, price: 23.99, express: true, warranty: '1-year warranty' }],
    itemCount: 1,
    step: 3,
    stepDates: ['Apr 2', 'Apr 3', 'Apr 4', 'Apr 6'],
    marketplace: 'express',
    warrantyChip: 'Warranty valid till April 22, 2027',
    reviewProduct: 'iphone16',
    total: 23.99,
    paidWith: 'Apple Pay',
  },
  {
    id: 'o5',
    number: '032981007 - 1',
    status: 'cancelled',
    statusWord: 'Cancelled',
    statusLabel: 'Cancelled',
    date: 'Feb 16, 2026',
    eta: 'Cancelled on Feb 16',
    items: [{ product: pdsProducts.storage, qty: 2, price: 23.99, express: true }],
    itemCount: 2,
    step: 0,
    stepDates: ['Feb 16', '', '', ''],
    marketplace: 'express',
    refundCredited: { date: 'Feb 22, 2026', card: 'XX 5832' },
    cancelReason: 'Cancelled by you',
    refund: { amount: 47.98, to: 'Mastercard XX 5832', on: 'Feb 22, 2026', credited: true },
    total: 47.98,
    paidWith: 'Mastercard XX 5832',
  },
];

export const orderById = (id?: unknown) => orders.find((o) => o.id === id) ?? orders[0];
export const isActive = (o: Order) => o.status === 'processing' || o.status === 'shipped' || o.status === 'out_for_delivery';
export const activeOrders = orders.filter(isActive);
export const historyOrders = orders.filter((o) => !isActive(o));

/** filter chips, left → right as in the reference (Filter opens the full filter sheet — a toast in the demo) */
export const orderFilters = [
  { id: 'delivered', label: 'Delivered' },
  { id: 'cancelled', label: 'Cancelled' },
  { id: 'returns', label: 'Returns' },
  { id: 'supermall', label: 'supermall' },
  { id: 'express', label: 'express' },
] as const;
export type OrderFilter = (typeof orderFilters)[number]['id'] | null;

export const matchesFilter = (o: Order, f: OrderFilter) => {
  if (!f) return true;
  if (f === 'delivered') return o.status === 'delivered' || o.status === 'exchanged';
  if (f === 'cancelled') return o.status === 'cancelled';
  if (f === 'returns') return o.status === 'returned';
  return o.marketplace === f;
};

/** time-window / heat variants of the details hero (reference tabs V1–V4) */
export type HeroVariant = 1 | 2 | 3 | 4;
export const heroVariant = (v: unknown): HeroVariant => {
  const n = Number(String(v ?? '1').replace(/^v/i, ''));
  return n === 2 || n === 3 || n === 4 ? n : 1;
};
export const heatAdvice = { lead: "It'll be very hot this afternoon.", rest: 'Do offer your rider a glass of water.' };

/** 2-decimal amounts ("328.00", "2.53"); whole savings stay whole ("2 saved") */
export const money2 = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const money = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 2 });

export const cancelReasons = [
  'I ordered by mistake',
  'Found a better price elsewhere',
  'Delivery is taking too long',
  'I want to change the delivery address',
  'Other',
];
