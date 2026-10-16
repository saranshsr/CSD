import { createStore } from '../../kit/createStore';
import { CURRENCY, type VipCard, type VipPlan } from './data';

/**
 * Payment area copy + demo data. Copy = features/vip/locale/translations/vip-en.json (key in the comment).
 * Server-driven (VIPService.getVIPTouchpoints('payment'), VIPService.getTrialGuide, PaymentCardService,
 * VIPBokuService, loyalty.touchpoints.misc) → realistic UAE demo values, flagged `server:`.
 */
export const payCopy = {
  paymentMethod: 'Payment method', // _.capitalize(vip_payment_method 'Payment Method')
  payWithCard: 'Debit/Credit Card', // vip_one_pay_with_card
  addNewCardRow: 'Add New Card', // vip_one_add_new_card
  cvv: 'CVV', // vip_cvv
  applePay: 'Apple Pay', // vip_apple_pay
  payWithMobile: 'Pay with Mobile', // vip_pay_with_mobile
  addMobile: 'Add Mobile Number', // vip_add_mobile_number
  changeMobile: 'Change Mobile Number', // vip_change_mobile_number
  cardNotCompatible: "This card can't be used with this offer.", // vip_card_not_compatible
  phoneNotCompatible: "This phone number can't be used with this offer.", // vip_phone_not_compatible
  // VIPAddCardOverlayScreen
  addCardTitle: 'Add a new card', // vip_add_new_card
  cardNumber: 'Card Number', // vip_enter_card_number
  cardPlaceholder: 'Enter your card number', // vip_card_placeholder
  expiry: 'Expiry date', // vip_instant_add_new_card_expiry
  expiryPlaceholder: 'MM/YY', // literal in VIPAddCardOverlayScreen
  remember: 'Remember this card', // vip_remember_payment_card_title
  rememberDesc: 'noon will securely store this card for a faster payment experience. Your CVV number will not be stored.', // vip_remember_payment_card_description
  addCard: 'Add Card', // vip_one_add_card
  // VIPAddCvvOverlayScreen
  verificationTitle: 'Additional Verifiation', // vip_additional_verification_title (sic, master typo)
  verificationSubtitle: 'Enter cvv for', // vip_additional_verification_subtitle
  verify: 'Verify', // vip_spl_verify
  // VIPMobilePayOverlayScreen
  bokuOptinTitle: 'Add Mobile Number', // vip_boku_optin_title
  bokuOptinSubtitle: "We'll send a verification\ncode to verify this number", // vip_boku_optin_subtitle
  bokuField: 'Enter Mobile Number', // vip_verify_number_field
  bokuVerifyTitle: 'Enter Code', // vip_boku_verify_title
  bokuVerifySubtitle: 'Enter the OTP sent at', // vip_boku_verify_subtitle
  change: 'Change', // vip_change
  continue: 'Continue', // vip_continue
  missingOtp: "Didn't get the OTP?", // vip_missing_login_otp
  resendOtp: 'Resend OTP', // vip_resend_otp
  secondsUnit: 's', // vip_seconds_unit
  // VIPSubscriptionButtonV2 trial warning (VIPInfoOverlayScreen)
  trialWarningTitle: "Looks like you're not eligible for noon one Free Trial", // vip_one_trial_warning_title
  changeNumber: 'CHANGE NUMBER', // vip_change_number_button
  goBack: 'Go Back', // vip_go_back
  // VIPUpdatePopup
  updateTitle: 'A new version is available', // vip_update_available_title
  updateSubtitle: 'Install the latest app version now to keep enjoying noon One benefits', // vip_update_available_subtitle
  updateNow: 'Update Now', // vip_update_now
  // src/utils/Validation (getCVVErrorFromType / card errors), en.json
  cvvError: 'Oops! This CVV is invalid.', // form_validation_cvv_field (src/locale/translations/en.json, getCVVErrorFromType)
  wrongOtp: 'The code you entered is incorrect. Please try again.', // server: VIPBokuService validate error
};

/** server: loyalty.touchpoints.misc */
export const payMisc = {
  isApplePayEnabled: true,
  isMobilePayEnabled: true,
  isReferralEligible: true,
};

/** server: payment touchpoint `button.subscribe.text` fallback when no trial guide buttonText */
export const subscribeButtonText = (p: VipPlan) => p.buttonText;

/** server: VIPService.getTrialGuide({ planCode, paymentMethodCode, idPaymentCard }) → entryText (VIPTrialGuideButton) */
export const trialGuideEntry = (p: VipPlan) => {
  if (!p.isTrialValid) return undefined;
  const end = new Date(Date.now() + p.trialDays * 864e5).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  return `<p>Free for ${p.trialDays} days. <b>${CURRENCY} ${p.amount}</b> will be charged on <b>${end}</b></p>`;
};

/** demo: saved cards whose payment intent comes back `verificationRequired` (master shows the inline CVV + CVV overlay) */
export const cvvRequiredCards = new Set(['card_2']);

/** VIPBokuService registered number (VIPMobilePaymentType) */
export interface BokuNumber {
  idOptin: string;
  carrierCode: 'stc';
  msisdnMask: string;
}

/** Payment-screen local state shared with its overlays (vipPaymentDataReducer slice: cvv, verificationRequired, numbers). */
export interface PaymentLocalState {
  /** cvv typed per card id (inline field / CVV overlay / new-card form) */
  cvv: Record<string, string>;
  numbers: BokuNumber[];
  /** bumped by the CVV overlay "Verify" → payment screen resumes getPaymentIntent → createSubscription */
  cvvVerified: number;
}

export const paymentLocalStore = createStore<PaymentLocalState>({ cvv: {}, numbers: [], cvvVerified: 0 });

/** src/utils/Validation getCVVErrorFromType: amex 4 digits, else 3 */
export const cvvError = (cvv: string, ccType?: string) => {
  const len = ccType === 'amex' ? 4 : 3;
  return /^\d+$/.test(cvv) && cvv.length === len ? '' : payCopy.cvvError;
};

/** PaymentCardBrand bin detection (demo subset) */
export const brandOf = (num: string): VipCard['ccType'] | undefined => {
  const n = num.replace(/\D/g, '');
  if (/^4/.test(n)) return 'visa';
  if (/^(5[1-5]|2[2-7])/.test(n)) return 'mastercard';
  if (/^3[47]/.test(n)) return 'amex';
  return undefined;
};

/** src/utils/Validation getCardNumberError (Luhn) + getExpiryDateError */
export const luhn = (num: string) => {
  const d = num.replace(/\D/g, '');
  if (d.length < 13) return false;
  let sum = 0;
  for (let i = 0; i < d.length; i++) {
    let x = Number(d[d.length - 1 - i]);
    if (i % 2) x = x * 2 > 9 ? x * 2 - 9 : x * 2;
    sum += x;
  }
  return sum % 10 === 0;
};
export const expiryValid = (v: string) => {
  const m = /^(\d{2})\/(\d{2})$/.exec(v);
  if (!m) return false;
  const mm = Number(m[1]);
  const yy = 2000 + Number(m[2]);
  const now = new Date();
  return mm >= 1 && mm <= 12 && (yy > now.getFullYear() || (yy === now.getFullYear() && mm >= now.getMonth() + 1));
};

/** VIPInfoOverlayScreen params (VIPInfoOverlayDataType + isPopup/reasonCode) */
export interface InfoOverlayParams {
  isPopup?: boolean;
  reasonCode?: string;
  headerIcon?: 'oneTrialAlert';
  title?: { text: string; style?: 'warning' };
  body?: { text: string; style?: 'warning' | 'default' };
  infoList?: string[];
  reminder?: { title: string; description: string };
  buttons?: { text: string; cta: '/ok' | '/changeNumber' | '/noon-one' | '/openLink' | '/back' }[];
}

/** VIPSubscriptionButtonV2.showWarningPopup (reasonText server: plan.reasonText) */
export const trialWarningPopup: InfoOverlayParams = {
  isPopup: true,
  reasonCode: 'invalid_trial_primary_phone',
  headerIcon: 'oneTrialAlert',
  title: { text: payCopy.trialWarningTitle, style: 'warning' },
  body: { text: '<p>A free trial has already been used with this phone number. You can still join noon One and start saving today.</p>', style: 'warning' },
  buttons: [
    { text: payCopy.changeNumber, cta: '/changeNumber' },
    { text: payCopy.continue, cta: '/ok' },
  ],
};

/** VIPGenericOverlayScreen params */
export type GenericOverlayParams =
  | { variant?: 'info'; isPopup?: boolean; popupData?: { title?: string; body?: string; headerIcon?: 'oneTrialAlert'; buttons?: { text: string; cta: string; backgroundColor?: string; textColor?: string }[] } }
  | { variant: 'update'; isPopup?: boolean };

/** VIPPopupUtil.showTouchpointErrorPopup demo (server: touchpoint errorPopup) */
export const touchpointErrorPopup = {
  headerIcon: 'oneTrialAlert' as const,
  title: 'Offer not available',
  body: '<p>This offer is no longer available on your account. You can still join noon One with any plan.</p>',
  buttons: [{ text: 'Okay, got it', cta: '/ok' }],
};
