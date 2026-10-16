import { createStore } from '../../kit/createStore';
import { initialCards, type CheckoutCard, type PaymentCode } from './data';

/**
 * Flow-local stand-in for the checkout session (NoonCheckoutService.getSession / set* responses).
 * The real screen keeps `sessionData` in state and every overlay (cards select, add card, alternate phone,
 * burn providers …) calls an API that returns a fresh session. Here those overlays are separate stack entries,
 * so they share the session through this module store. Cart lines + totals stay in DemoStore.
 * A page refresh resets it.
 */
export interface DeliveryInstructionsState {
  /** "gt" — get items together (Figma "Get items together") */
  getTogether: boolean;
  /** "dd" — leave at the door */
  leaveAtDoor: boolean;
  /** "silent_delivery" — don't ring the bell */
  silentDelivery: boolean;
  /** "sc" — security checks / call before */
  securityCheck: boolean;
}

export interface ReceiverState {
  /** null → the address owner receives the order */
  name: string | null;
  phone: string | null;
}

export interface OrderSnapshot {
  orderId: string;
  items: { id: string; qty: number }[];
  total: number;
  paymentCode: PaymentCode;
  addressId: number | null;
  promiseLabel: string;
}

export interface CheckoutState {
  /** active payment method (`status: 'active'` in paymentMethodsV2) */
  paymentCode: PaymentCode;
  /** saved cards of the default card section */
  cards: CheckoutCard[];
  /** `card.isSelected` */
  selectedCardId: number | null;
  /** special EMI card section picked from NoonCheckoutSpecialEMIsOverlayScreen (null = default section) */
  cardSectionCode: string | null;
  /** NoonCheckoutEMIPlan.isSelected on the selected card */
  emiPlanId: string | null;
  cvv: string;
  /** setUseCredits */
  useCredits: boolean;
  /** shipmentId → selected promise deliveryDate */
  promiseByShipment: Record<string, string>;
  /** shipmentId → installation slot id */
  slotByShipment: Record<string, number>;
  deliveryInstructions: DeliveryInstructionsState;
  receiver: ReceiverState;
  /** burn: redeemed provider points (amount in AED) */
  burn: { providerCode: string; amount: number } | null;
  /** earn: linked earn provider */
  earn: { providerCode: string; phone: string } | null;
  /** coupon code (comes from cart) */
  coupon: string | null;
  /** donation amount */
  donation: number;
  /** ScreenState.RELOADING — shows the translucent reloader over the checkout */
  reloading: boolean;
  /** demo: next order attempt fails the payment (NoonCheckoutPaymentFailureScreen) */
  failNextPayment: boolean;
  /** last placed order (confirmation screen) */
  lastOrder: OrderSnapshot | null;
}

const initialState = (): CheckoutState => ({
  paymentCode: 'cc_noonpay',
  cards: initialCards,
  selectedCardId: initialCards[0]?.id ?? null,
  cardSectionCode: null,
  emiPlanId: null,
  cvv: '',
  useCredits: true, // Figma default: credits toggle on
  promiseByShipment: {},
  slotByShipment: {},
  deliveryInstructions: { getTogether: false, leaveAtDoor: true, silentDelivery: false, securityCheck: false }, // Figma default: "Leave at the door" selected
  receiver: { name: null, phone: null },
  burn: null,
  earn: null,
  coupon: null,
  donation: 0,
  reloading: false,
  failNextPayment: false,
  lastOrder: null,
});

const store = createStore<CheckoutState>(initialState());

/** simulated API latency (ms) for set* session calls */
export const API_DELAY = 450;

export const checkoutStore = {
  get: store.get,
  subscribe: store.subscribe,
  set: (patch: Partial<CheckoutState>) => store.patch(patch),
  reset() {
    store.set(initialState());
  },
  /**
   * Mimics `setScreenState(RELOADING)` → API → `setSessionData(response)`: shows the reloader for API_DELAY,
   * then applies the patch. Returns a promise that resolves after the patch is applied.
   */
  update(patch: Partial<CheckoutState> | ((s: CheckoutState) => Partial<CheckoutState>), delay = API_DELAY) {
    checkoutStore.set({ reloading: true });
    return new Promise<void>((resolve) =>
      setTimeout(() => {
        const p = typeof patch === 'function' ? patch(store.get()) : patch;
        checkoutStore.set({ ...p, reloading: false });
        resolve();
      }, delay),
    );
  },
  /** NoonCheckoutPaymentUtil.confirmPaymentMethod — selecting a method clears the CVV */
  selectPayment(paymentCode: PaymentCode, cardId?: number | null, cardSectionCode: string | null = null) {
    return checkoutStore.update((s) => ({
      paymentCode,
      cvv: '',
      selectedCardId: cardId === undefined ? s.selectedCardId : cardId,
      cardSectionCode: paymentCode === 'cc_noonpay' ? cardSectionCode : null,
      emiPlanId: cardId === undefined || cardId === s.selectedCardId ? s.emiPlanId : null,
    }));
  },
  /** onCreateCardSuccess → confirmPaymentMethod(CC, card, cardCvv) */
  addCard(card: CheckoutCard, cvv = '') {
    return checkoutStore.update((s) => ({ cards: [...s.cards, card], selectedCardId: card.id, paymentCode: 'cc_noonpay', cardSectionCode: null, emiPlanId: null, cvv }));
  },
  setCvv(cvv: string) {
    checkoutStore.set({ cvv });
  },
};

export function useCheckout<T>(select: (s: CheckoutState) => T): T {
  return store.useStore(select);
}
