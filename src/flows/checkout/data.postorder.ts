import type { PaymentCode } from './data';

import iconShipmentTick from '@assets/checkout/postorder-shipment-tick.webp';
import iconChevronLeft from '@assets/checkout/postorder-chevron-left.webp';
import iconBack from '@assets/shared/search-bar/back.webp';
import iconFailureError from '@assets/checkout/postorder-payment-failure-error.webp';
import iconFailureInstructions from '@assets/checkout/postorder-payment-failure-instructions.webp';
import iconCopy from '@assets/checkout/postorder-copy.svg';
import imgTrackOrderSteps from '@assets/checkout/postorder-track-order-steps.webp';
import { checkoutServerColors as sc } from './tokens';

/**
 * Post-order copy (NoonPostOrderLoader, NoonOrderConfirmationV3Screen, NoonCheckoutPaymentFailureScreen,
 * NoonCheckoutPaymentFailureNeedHelpOverlayScreen, NoonOrderConfirmationTrackStepsScreen) from origin/master
 * noon-en.json / en.json. `server:` = sent by the order-status / place-order APIs (not in translations).
 */
export const tp = {
  // useNoonPostOrderMessage
  noon_order_processing_msg_1: 'Your order is being placed',
  noon_order_processing_bnpl_msg_2: (bnpl: string) => `Connecting to ${bnpl} to complete the payment`,
  noon_order_processing_card_wallet_msg_2: 'Connecting to your bank to complete the payment',
  noon_order_processing_bnpl_msg_3: (bnpl: string) => `We're processing the payment with ${bnpl}`,
  noon_order_processing_card_wallet_msg_3: "We're processing the payment with your bank",
  noon_order_confirmation_title: 'Yay! Your order has been placed!',
  // confirmation (en.json)
  order_placed: 'Order placed',
  continue_shopping: 'Continue Shopping',
  noon_shipment_nr: (n: number) => `Shipment ${n}`,
  item: (count: number) => (count === 1 ? `${count} Item` : `${count} Items`),
  // track steps
  noon_how_to_track_update_order: 'How to track/update your order',
  noon_CONTINUE_SHOPPING: 'CONTINUE SHOPPING',
  // payment failure
  noon_payment_failure_title: 'Sorry, we are unable to process your payment',
  noon_payment_failure_need_help_text: 'Still facing issues?',
  noon_payment_failure_need_help_button: 'Contact Us',
  noon_payment_failure_need_help_title: 'Still facing issues?',
  noon_payment_failure_need_help_description: 'Please reach out to us on the below email and mention your order id as reference.',
  noon_payment_failure_need_help_order_id: 'Order ID',
  noon_common_email: 'Email',
  noon_gm_c_copied_clipboard: 'Copied to clipboard',
} as const;

/** NOON_BNPL_CODES / NOON_BANK_CODES (marketplaces/noon/constants/NoonCheckoutStates.ts) → NoonCheckoutUtil.getPaymentFlowType */
export type PaymentFlowType = 'BNPL' | 'BANK' | 'OTHER';
export function getPaymentFlowType(code?: PaymentCode): PaymentFlowType {
  if (code === 'tabby' || code === 'tamara') return 'BNPL';
  if (code === 'cc_noonpay' || code === 'apple_pay') return 'BANK';
  return 'OTHER';
}
/** server: paymentMethodsV2 method `name` for BNPL */
export const bnplNames: Partial<Record<PaymentCode, string>> = { tabby: 'tabby', tamara: 'tamara' };

/** useNoonPostOrderMessage.postOrderMsg */
export function postOrderMessage(code: PaymentCode | undefined, index: 0 | 1 | 2) {
  const flow = getPaymentFlowType(code);
  if (flow === 'OTHER' || index === 0) return tp.noon_order_processing_msg_1;
  const name = code ? bnplNames[code] : undefined;
  if (flow === 'BNPL' && name) return index === 2 ? tp.noon_order_processing_bnpl_msg_3(name) : tp.noon_order_processing_bnpl_msg_2(name);
  return index === 2 ? tp.noon_order_processing_card_wallet_msg_3 : tp.noon_order_processing_card_wallet_msg_2;
}

/** server: getOrderStatus FAILED → paymentError (NoonPaymentFailureErrorType) + paymentErrorMsg + supportEmail */
export const mockPaymentError = {
  /** server illustration URL — not reproducible offline, so left empty (master hides the image when empty) */
  imgUrl: '',
  error: 'Your bank declined this transaction. Please try again with a different card or payment method.',
  instructions: 'Check that your card has sufficient balance and is enabled for online payments, or choose another payment method like Cash on Delivery.',
  ctaText: 'Try another payment method',
  showNeedHelpText: true,
};
export const supportEmail = 'care@noon.com';

/** server: banners.notificationBanner (NoonNotificationsBanner) */
export const mockNotificationBanner = {
  title: 'Never miss an update',
  subtitle: 'Turn on notifications to get live updates on your order',
  backgroundColor: sc.notificationsBg,
  cta: { text: 'Turn on', backgroundColor: sc.notificationsCtaBg, textColor: sc.white },
};

/** server: smartAssistConfig (need-help pill in the header) */
export const smartAssistConfig = { text: 'Help', textColor: sc.white, backgroundColor: sc.smartAssistBg };

export const postorderIcons = {
  shipmentTick: iconShipmentTick, // 20×20
  chevronLeft: iconChevronLeft, // 9×15 (rendered 12×12, mirrored)
  back: iconBack, // 16×16 (rendered 20×20, tinted white)
  failureError: iconFailureError, // 17×17
  failureInstructions: iconFailureInstructions, // 17×18
  copy: iconCopy, // 17×17 svg (rendered 12×12, fill accentColor)
};
export const postorderImages = {
  trackOrderSteps: imgTrackOrderSteps, // 355.67×310 @1x
};
