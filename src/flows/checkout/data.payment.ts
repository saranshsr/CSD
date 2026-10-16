import { currency, formatPrice } from '../../data';
import type { CardType, CheckoutCard, CheckoutEmiPlan, PaymentCode } from './data';

import iconCardVisa from '@assets/shared/payment/card-visa.webp';
import iconCardMastercard from '@assets/shared/payment/card-mastercard.webp';
import iconCardAmex from '@assets/shared/payment/card-amex.webp';
import iconCardMada from '@assets/shared/payment/card-mada.webp';
import iconCard from '@assets/checkout/payment-card.webp';
import iconCardFallback from '@assets/checkout/payment-card-fallback.webp';
import iconCod from '@assets/checkout/payment-cod.webp';
import iconTabby from '@assets/checkout/payment-tabby.webp';
import iconTamara from '@assets/checkout/payment-tamara.webp';
import iconApplePay from '@assets/shared/payment/apple-pay.webp';
import iconNoonCredit from '@assets/checkout/payment-noon-credit.webp';
import iconChevronRight from '@assets/checkout/payment-chevron-right.webp';
import iconOldPlus from '@assets/checkout/payment-old-plus.webp';
import iconOldPlusGray from '@assets/checkout/payment-old-plus-gray.webp';
import iconRadioChecked from '@assets/checkout/payment-radio-checked.webp';
import iconRadioUnchecked from '@assets/checkout/payment-radio-unchecked.webp';
import iconInfoGray from '@assets/checkout/payment-info-gray.webp';
import iconCheckboxChecked from '@assets/shared/icons/checkbox-checked.webp';
import iconCheckboxUnchecked from '@assets/shared/icons/checkbox-unchecked.webp';
import iconInfoCircleRed from '@assets/checkout/payment-info-circle-red.svg';
import brandVisa from '@assets/shared/payment/brand-card-visa.webp';
import brandMastercard from '@assets/shared/payment/brand-card-mastercard.webp';
import brandAmex from '@assets/shared/payment/brand-card-amex.webp';
import brandJaywan from '@assets/checkout/payment-brand-jaywan.webp';
import figTabby from '@assets/checkout/figma/pay-tabby@3x.png';
import figTamara from '@assets/checkout/figma/pay-tamara@3x.png';
import figApplePay from '@assets/checkout/figma/pay-applepay@3x.png';
import figCard from '@assets/checkout/figma/pay-card@3x.png';
import figCod from '@assets/checkout/figma/pay-cod.svg';
import figNoonOneCard from '@assets/checkout/figma/pay-noonone-card@3x.png';
import figSavedCardArt from '@assets/checkout/figma/saved-card-art.png';
import figNewBadgeTexture from '@assets/checkout/figma/new-badge-texture.gif';
import figEmiChevron from '@assets/checkout/figma/emi-chevron.svg';
import { checkoutServerColors as sc } from './tokens';

/**
 * Payment section mock (NoonCheckoutSessionType.paymentMethodsV2) + payment copy.
 * Copy from origin/master translations (noon-en.json / en.json / payment-en.json); strings marked
 * `server:` are session API copy (paymentMethodsV2 name/message/tag/upsellingCards) that isn't in the
 * translation files.
 */

export const paymentIcons = {
  /** ThemeManager.icons via getPaymentMethodData — all 38×24 @1x (114×72 @3x) */
  method: {
    cc_noonpay: iconCard,
    cod: iconCod,
    tabby: iconTabby,
    tamara: iconTamara,
    apple_pay: iconApplePay,
    nopayment: iconNoonCredit,
  } satisfies Record<PaymentCode, string>,
  card: { VISA: iconCardVisa, MASTERCARD: iconCardMastercard, AMEX: iconCardAmex, MADA: iconCardMada } satisfies Record<CardType, string>,
  cardFallback: iconCardFallback,
  chevronRight: iconChevronRight, // 14×14 (updatedEMIArrow)
  oldPlus: iconOldPlus, // 16×16 / 20×20
  oldPlusGray: iconOldPlusGray,
  infoGray: iconInfoGray, // 12×12 (special EMI terms)
  radioChecked: iconRadioChecked, // 12×12 (EMI plans)
  radioUnchecked: iconRadioUnchecked,
  checkboxChecked: iconCheckboxChecked, // 15×15
  checkboxUnchecked: iconCheckboxUnchecked,
  infoCircleRed: iconInfoCircleRed, // 16×17 svg
};

/**
 * Figma "🚧 Checkout 2.0" Molecule/BrandLogo exports (38×24 incl. the 1px #F5F5F5 / Accent/50 r4 frame; @3x PNG
 * where the MCP returned the wrong SVG variant) + the saved-card art and the NEW badge texture.
 */
export const paymentFigmaIcons = {
  method: {
    cc_noonpay: figCard,
    cod: figCod,
    tabby: figTabby,
    tamara: figTamara,
    apple_pay: figApplePay,
    nopayment: iconNoonCredit,
  } satisfies Record<PaymentCode, string>,
  noonOneCard: figNoonOneCard,
  /** saved Visa card art (Figma ACTIVE card row); other brands fall back to paymentIcons.card */
  savedCard: { VISA: figSavedCardArt } as Partial<Record<CardType, string>>,
  newBadgeTexture: figNewBadgeTexture,
  emiChevron: figEmiChevron,
};

/** features/payment PaymentCardBrand CardToIcon — accepted brands (noonConfig.cardBrandConfigs for AE) */
export const acceptedBrands = [
  { id: 'visa', src: brandVisa },
  { id: 'mastercard', src: brandMastercard },
  { id: 'amex', src: brandAmex },
  { id: 'jaywan', src: brandJaywan },
];

export const tp = {
  // marketplaces/noon/locale/translations/noon-en.json
  noon_checkout_use_noon_credits: (price: string) => `Use my ${price} noon credits`,
  noon_checkout_credits_sufficient: 'Your credits balance is sufficient for the order',
  noon_insufficient_noon_credit: 'Your noon credits are not sufficient to pay for the order, please select an additional payment method to cover the balance of ',
  noon_checkout_add_or_change_card: 'Add/Change',
  noon_checkout_add_new: 'Add New',
  noon_cvv: 'CVV',
  noon_selected_plan: 'Selected Plan',
  noon_emi_for: 'for',
  noon_checkout_select_card: 'Select Card',
  noon_checkout_enter_cvv_cta: 'Enter CVV',
  noon_confirm: 'Confirm',
  noon_checkout_add_new_card: 'Add New Card',
  noon_enter_card_number: 'Card Number',
  noon_card_placeholder: 'Enter your card number',
  noon_expiry: 'Expiry',
  noon_expiry_date_placeholder: 'MM/YY',
  noon_cvv_placeholder: 'Secure Code',
  noon_enter_card_title: 'Card Nickname',
  noon_card_title_placeholder: 'e.g. My Cashback Card',
  noon_card_title_hint_text: 'This can help you identify cards easier',
  noon_remember_payment_card_title: 'Remember this card',
  noon_remember_payment_card_description: 'noon will securely store this card for a faster payment experience. Your CVV number will not be stored.',
  noon_add_card: 'Add Card',
  noon_checkout_card_added_successfully: 'Card added successfully!',
  noon_emi_installments: 'Easy Monthly Installments',
  noon_installment_plans_available: 'Installment Plans Available',
  noon_pay_in_full: 'Pay in Full',
  noon_interest: '% interest',
  noon_comma: ',',
  noon_free: 'FREE',
  // src/locale/translations/en.json
  optional: 'Optional',
  payment_COD: 'Cash on Delivery',
  apple_pay: 'Apple Pay',
  form_validation_required_field: 'Hold up, this field is required.',
  form_validation_card_field: 'Oops! This card number is invalid.',
  form_validation_expiry_date_field: 'Oops! This expiry date is invalid.',
  form_validation_cvv_field: 'Oops! This CVV is invalid.',
  no_special_characters_only_validation: "Special characters aren't allowed",
  /** en.json noon_emi_selected_plan_message (plural "other") */
  emi_selected_message: (installment: string, count: number, fee: string) =>
    `You’ve selected to pay for your order with an EMI of ${installment} per month for ${count} months, including a one time fee of ${fee}`,
};

/** "55" / "55.50" — Figma second-line amounts (no trailing .00) */
export const formatShort = (n: number) => (Number.isInteger(Math.round(n * 100) / 100) ? formatPrice(Math.round(n)) : n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));

export const aed = (n: number) => `${currency} ${Number.isInteger(Math.round(n * 100) / 100) ? formatPrice(Math.round(n)) : n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** getCVVErrorFromType: amex → 4 digits, everything else 3 */
export const cvvLength = (type?: string) => (type?.toLowerCase() === 'amex' ? 4 : 3);
export const isCvvValid = (cvv: string, type?: string) => new RegExp(`^\\d{${cvvLength(type)}}$`).test(cvv);

export interface PaymentTag {
  message: string;
  colors: string[];
}

export interface UpsellingCard {
  analyticsCardType: string;
  title: string;
  subtitle: string;
  rightMessage: string;
  icon: string;
  colors: string[];
  shouldAddCard: boolean;
}

export interface GenericMethod {
  kind: 'generic';
  code: Exclude<PaymentCode, 'cc_noonpay' | 'nopayment'>;
  name: string;
  /** html: <b>, <highlight>, <a> */
  message?: (orderPaymentAmount: number) => string | null;
  /** server status 'disabled' */
  disabled?: boolean;
  tag?: PaymentTag;
  /** Figma red "NEW" badge (top-right of the row) */
  isNew?: boolean;
  upsellingCards?: UpsellingCard[];
}

export interface CardSection {
  kind: 'card_section';
  code: string;
  sectionType: 'default' | 'special_emi';
  name: string;
  message?: string | null;
  icon?: string;
  tag?: PaymentTag;
  description?: string;
  terms?: string[];
  /** which saved cards are eligible in this section */
  eligible: (card: CheckoutCard) => boolean;
  upsellingCards?: UpsellingCard[];
  /** not on the Figma checkout (kept for SpecialEmisScreen; drop the flag to show it again) */
  hidden?: boolean;
}

export type PaymentMethodDef = GenericMethod | CardSection;

export const DEFAULT_CARD_SECTION = 'cc_default';
export const SPECIAL_EMI_SECTION = 'cc_special_emi_enbd';

/** paymentMethodsV2.title — Figma "Pay With" */
export const paymentSectionTitle = 'Pay With';

/** Figma noon One Credit Card upsell row (paymentMethodsV2 upsellingCards on the default card section) */
export const noonOneCardUpsell = {
  title: 'noon One Credit Card', // Figma
  /** "Extra {amount} Cashback" (Figma) */
  extra: 'Extra',
  cashback: 'Cashback',
  cta: 'Apply Now', // Figma
};

export const paymentMethods: PaymentMethodDef[] = [
  {
    kind: 'generic',
    code: 'tabby',
    name: 'Tabby', // Figma
    message: (amount) => `Pay 4 interest free payments of ${currency}${formatShort(amount / 4)}`, // Figma
    isNew: true,
  },
  {
    kind: 'generic',
    code: 'tamara',
    name: 'Tamara', // Figma
    message: (amount) => `Pay ${currency}${formatShort(amount / 4)} or in 4 payments. no late fees`, // Figma
  },
  { kind: 'generic', code: 'apple_pay', name: tp.apple_pay },
  {
    kind: 'card_section',
    code: DEFAULT_CARD_SECTION,
    sectionType: 'default',
    name: 'Debit/Credit Card', // Figma
    message: null,
    eligible: () => true,
  },
  {
    kind: 'card_section',
    code: SPECIAL_EMI_SECTION,
    sectionType: 'special_emi',
    hidden: true,
    name: '0% Special installments', // server:
    message: 'Up to 12 months on <b>Visa</b> cards, no processing fee', // server:
    tag: { message: 'New', colors: [sc.tagNewFrom, sc.tagNewTo] }, // server:
    description: 'Pay for your order in 0% monthly installments with no processing fee. Select an eligible card to continue.', // server:
    terms: [
      'Installments are converted by your bank within 7 working days.', // server:
      'Available on eligible Visa credit cards only.', // server:
      'Cancelling an item will cancel the installment plan for that order.', // server:
    ],
    eligible: (c) => c.type === 'VISA',
    upsellingCards: [
      {
        analyticsCardType: 'noon_one_mashreq',
        title: '<p>noon One Mashreq Credit Card</p>', // server:
        subtitle: '<p><highlight>Get up to 10% cashback</highlight> on this order</p>', // server:
        rightMessage: '<p>Apply</p>', // server:
        icon: iconCardFallback,
        colors: [sc.upsellingFrom, sc.upsellingTo], // DEFAULT_UPSELLING_GRADIENT
        shouldAddCard: false,
      },
    ],
  },
  {
    kind: 'generic',
    code: 'cod',
    name: tp.payment_COD,
  },
];

/**
 * Card EMI plans (NoonCheckoutPaymentMethodCardType.emiPlans + emiCalloutMessage). Only Visa/Mastercard
 * credit cards from EMI banks get plans.
 */
export type EmiPlan = CheckoutEmiPlan & { interestPercentage: number; terms: string[] };

export function emiPlansFor(card: CheckoutCard | undefined, amount: number): { callout?: string; plans: EmiPlan[] } {
  if (!card || (card.type !== 'VISA' && card.type !== 'MASTERCARD') || amount < 500) return { plans: [] };
  const bank = card.type === 'VISA' ? 'Emirates NBD' : 'Mashreq';
  const plans: EmiPlan[] = [3, 6, 12].map((m) => ({
    id: `${card.id}-${m}`,
    bank,
    tenure: `${m} months`, // server:
    fee: m === 3 ? 'no processing fee' : `${aed(49)} processing fee`, // server:
    installment: aed(amount / m), // server:
    interestPercentage: 0,
    terms: [`${bank} converts the order into installments within 7 working days.`, 'Cancelling or returning items may cancel the installment plan.'], // server:
    ...(m === 12 && amount < 1500 ? { isDisabled: true, disabledMessage: `Available for orders above ${aed(1500)}` } : {}), // server:
  }));
  return {
    callout: `<p>Pay in installments from <b>${aed(amount / 12)}</b>/month</p>`, // server:
    plans,
  };
}
