import { createStore } from '../../kit/createStore';
import { user } from '../../data';
import { addresses, resolveProduct, returnNumberFor, type HistoryItem } from './data';

/**
 * Flow-local stand-in for the returns API (getReturnsHistoryList / createReturn / getReturnItemDetails /
 * cancelReturn / submitReturnFeedback). History, submission, details and summary are separate stack
 * entries, so they share the returns through this module store.
 */
export interface ReturnRecord {
  returnItemNr: string;
  productId: string;
  requestedAt: string;
  reason: string;
  subReason: string | null;
  comment: string | null;
  images: string[];
  pickupDateTime: string;
  addressCode: string;
  currentStage: number;
  cancelled: boolean;
  feedbackRate: number | null;
  status: HistoryItem['status'];
  trackingAction?: HistoryItem['trackingAction'];
  /** SD allowActions.cancelReturn: only until the item is picked up */
  allowCancel: boolean;
}

/** marker for an uploaded photo drawn with <ProductImage> (products without a real image) */
export const PRODUCT_PHOTO = 'product-photo';

const pickupStatus: HistoryItem['status'] = { label: 'Pickup scheduled', colorCode: 'blue', group: 'in_progress', icon: 'truck' };
const cancelledStatus: HistoryItem['status'] = { label: 'Return cancelled', colorCode: 'gray', group: 'cancelled', icon: 'close' };

function seed(productId: string, patch: Partial<ReturnRecord> = {}): ReturnRecord {
  const p = resolveProduct(productId);
  return {
    returnItemNr: returnNumberFor(p),
    productId: p.id,
    requestedAt: 'Oct 10, 2026',
    reason: 'Item is defective',
    subReason: 'Stopped working',
    comment: 'It turns off by itself after a few minutes of use.',
    images: [p.image ?? PRODUCT_PHOTO, PRODUCT_PHOTO],
    pickupDateTime: 'Sat, Oct 11 · 8 AM - 12 PM',
    addressCode: 'home',
    currentStage: 2,
    cancelled: false,
    feedbackRate: null,
    allowCancel: true,
    status: pickupStatus,
    ...patch,
  };
}

const initial = (): ReturnRecord[] => [
  seed('p5'),
  seed('p3', { requestedAt: 'Sep 28, 2026', currentStage: 4, allowCancel: false, status: { label: 'Refunded', colorCode: 'green', group: 'completed', icon: 'checkCircle' }, trackingAction: { title: 'Track refund', actionCode: 'refunded', deepLink: 'noon://refund-tracking' } }),
  seed('p7', { requestedAt: 'Sep 24, 2026', currentStage: 3, allowCancel: false, status: { label: 'Item under inspection', colorCode: 'amber', group: 'in_progress', icon: 'clock' } }),
  seed('p8', { requestedAt: 'Sep 15, 2026', cancelled: true, allowCancel: false, status: cancelledStatus }),
];

const store = createStore<{ returns: ReturnRecord[] }>({ returns: initial() });

export const returnsStore = {
  useReturns: () => store.useStore((s) => s.returns),
  get: (productId?: string, returnNr?: string) =>
    store.get().returns.find((r) => (returnNr ? r.returnItemNr === returnNr : r.productId === productId)),
  /** createReturn (action create_return) — newest first, like getReturnsHistoryList */
  create(rec: Omit<ReturnRecord, 'status' | 'currentStage' | 'cancelled' | 'feedbackRate' | 'requestedAt' | 'allowCancel'>) {
    const next: ReturnRecord = { ...rec, requestedAt: 'Oct 10, 2026', currentStage: 1, cancelled: false, allowCancel: true, feedbackRate: null, status: { label: 'Return requested', colorCode: 'blue', group: 'in_progress', icon: 'clock' } };
    store.patch((s) => ({ returns: [next, ...s.returns.filter((r) => r.returnItemNr !== rec.returnItemNr)] }));
    return next;
  },
  /** cancelReturn */
  cancel(returnItemNr: string) {
    store.patch((s) => ({ returns: s.returns.map((r) => (r.returnItemNr === returnItemNr ? { ...r, cancelled: true, allowCancel: false, status: cancelledStatus } : r)) }));
  },
  /** submitReturnFeedback */
  rate(returnItemNr: string, rate: number) {
    store.patch((s) => ({ returns: s.returns.map((r) => (r.returnItemNr === returnItemNr ? { ...r, feedbackRate: rate } : r)) }));
  },
  reset: () => store.set({ returns: initial() }),
};

/** record for a product that has none yet (deep link `/returns?productId=…`) */
export const recordFor = (productId?: string, returnNr?: string) => returnsStore.get(productId, returnNr) ?? seed(resolveProduct(productId).id);

export const pickupAddress = (code: string) => {
  const a = addresses.find((x) => x.code === code) ?? addresses[0];
  return { name: `${user.firstName} ${user.lastName}`, address: a.area, phone: a.phone };
};
