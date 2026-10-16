import { createStore } from '../../../../kit/createStore';

/**
 * Checkout session `integratedNoonone.enrolled` (NoonCheckoutService.setOne) + the place-order response's
 * `enrollOneRequestStatus`, carried to the order confirmation (OCOneOverlayScreen) — checkout and confirmation are
 * separate stack entries, so this lives in a tiny store.
 */
export const checkoutEnrollmentStore = createStore<{ enrolled: boolean; orderStatus: 'succeeded' | 'failed' | null }>({ enrolled: false, orderStatus: null });
export const useCheckoutEnrollment = checkoutEnrollmentStore.useStore;
