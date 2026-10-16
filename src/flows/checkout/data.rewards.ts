import { currency, user } from '../../data';
import { checkoutServerColors as sc } from './tokens';

/**
 * Rewards copy + mocks: coupon status, points burn (NoonCheckoutBurnSection → NoonProviderBurnOverlayScreen →
 * NoonProviderBurnOtpOverlayScreen), points earn (NoonCheckoutEarnCallout → NoonCheckoutEarnOverlayScreen →
 * NoonProviderEarnOverlayScreen) and installation slots (NoonCheckoutInstallationOverlayScreen).
 *
 * `t` = origin/master translations (noon-en.json / en.json). Everything under `server:` comes from the
 * checkout-providers / session APIs in the app (not in any translation file) and mirrors their shape.
 * Provider logos are CDN images in the app (`icons.checkout/rounded/mini/toast`) — the prototype draws neutral
 * wordmark placeholders instead (see components/RewardsPrimitives.tsx → ProviderLogo).
 */
export const rt = {
  noon_checkout_discount_applied: 'New discount applied!',
  noon_checkout_change_card: 'Change card',
  noon_checkout_add_card: 'Add card',
  noon_provider_financing_options: 'Financing Options',
  noon_provider_remove_points: 'Remove points',
  noon_provider_amount_input_label: 'Enter amount to redeem',
  noon_provider_amount_out_of_range: (min: string, max: string) => `Amount must be between ${min} and ${max}`,
  provider_available_amount: (providerName: string) => `Available ${providerName} balance`,
  noon_voucher_code: 'Voucher code',
  noon_enter_voucher_code: 'Enter Voucher code',
  noon_primary_phone_number: 'Phone number',
  noon_otp_form_resend_code: 'Resend OTP',
  noon_how_it_works: 'How it works?',
  noon_select_country_code: 'Select country code',
  noon_common_something_went_wrong: 'Oops! Something went wrong.',
  noon_retry: 'Retry',
  noon_checkout_installation_callout: 'Other available slots',
  noon_checkout_installation_error: 'We encountered an error while loading available slots',
  noon_checkout_installation_schedule_cta: 'Schedule',
  noon_checkout_installation_select_slot: 'Select a slot',
  noon_checkout_installation_updated_toast_message: 'Slot has been updated successfully',
} as const;

/* ───────────────────────── coupon (NoonCheckoutCouponType) ───────────────────────── */

export type CouponState = 'valid' | 'invalid' | 'warning';
export type CouponAction = 'change_card' | 'add_card' | null;

export interface CheckoutCoupon {
  code: string;
  /** server: */
  title: string;
  message: string;
  error?: string;
  state: CouponState;
  action: CouponAction;
}

/** server: coupon status for the cart coupon code (cart applies 10% off). Codes containing "BANK" need a card. */
export function couponFor(code: string, discount: number): CheckoutCoupon {
  const upper = code.toUpperCase();
  if (upper.includes('BANK')) {
    return {
      code,
      title: `${code} not applied`,
      message: '',
      error: 'This coupon is valid only on selected bank cards. Pay with an eligible card to get the discount.',
      state: 'invalid',
      action: 'change_card',
    };
  }
  if (upper.includes('BEST')) {
    return { code, title: `${code} applied`, message: discount > 0 ? `We swapped in a better offer — you save  ${discount.toFixed(2)}` : 'We swapped in a better offer for this order', state: 'warning', action: null };
  }
  return { code, title: `${code} applied`, message: discount > 0 ? `You're saving  ${discount.toFixed(2)} on this order` : 'Coupon discount applied to your order', state: 'valid', action: null };
}

/* ───────────────────────── providers (NoonCheckoutProvidersTypes) ───────────────────────── */

export interface ProviderPage {
  header: { title: string; cta: { text: string; action: string } | null; background: { colors: string[] } } | null;
  icon: string; // logo key
  title: string;
  background: { colors: string[] };
  fields: {
    voucher: { minLength: number; maxLength: number; placeholder: string } | null;
    phoneNumber: { countryCode: string | null; savedPhoneNumber: string | null; placeholder: string | null } | null;
    amount: { minAmount: number; maxAmount: number } | null;
    otp: { length: number } | null;
  };
  submitButton: { text: string; textColor: string; background: { colors: string[] } };
}

export interface BurnProvider {
  code: string;
  name: string;
  title: string;
  description: string | null;
  isDisabled: boolean;
  tag: { message: string; background: { colors: string[] } } | null;
  /** logo key used by ProviderLogo */
  logo: string;
  details: { redeemPage: ProviderPage; otpPage: ProviderPage; terms: string[]; genericThemeColor: string };
  /** server: getStatus balance / voucher amount */
  balance?: string;
  voucherAmount?: string;
  /** server: success message shown in the voucher toast */
  successMessage: (amount: string) => string;
}

export interface EarnProvider {
  code: string;
  name: string;
  title: string;
  description: string | null;
  isDisabled: boolean;
  tag: BurnProvider['tag'];
  logo: string;
  details: { earnPage: ProviderPage; terms: string[]; termsExternalUrl: string | null; genericThemeColor: string };
  successMessage: string;
}

const savedPhone = user.phone.replace('+971', '').replace(/\s/g, '');

const loyaltyPage = (o: { title: string; color: string; bg: string[]; otp?: boolean; amount?: { min: number; max: number }; submit: string; submitBg: string }): ProviderPage => ({
  header: null,
  icon: '',
  title: o.title,
  background: { colors: o.bg },
  fields: {
    voucher: null,
    phoneNumber: o.otp ? null : { countryCode: '971', savedPhoneNumber: savedPhone, placeholder: '5X XXX XXXX' },
    amount: o.amount ? { minAmount: o.amount.min, maxAmount: o.amount.max } : null,
    otp: o.otp ? { length: 6 } : null,
  },
  submitButton: { text: o.submit, textColor: sc.white, background: { colors: [o.submitBg] } },
});

const figmaLoyalty = (code: string, name: string, title: string, color: string, tint: string, extra: Partial<BurnProvider> = {}): BurnProvider => ({
  code,
  name,
  title,
  description: null,
  isDisabled: false,
  tag: null,
  logo: code,
  balance: '120.00',
  details: {
    genericThemeColor: color,
    terms: [`${name} points are deducted once the order is placed and refunded if it is cancelled.`],
    redeemPage: { ...loyaltyPage({ title: `Enter the phone number linked to your ${name} account`, color, bg: [tint, sc.white], submit: 'Continue', submitBg: color }), icon: code },
    otpPage: { ...loyaltyPage({ title: 'Enter the OTP sent to your phone', color, bg: [tint, sc.white], otp: true, amount: { min: 5, max: 400 }, submit: 'Redeem', submitBg: color }), icon: code },
  },
  successMessage: (amount) => ` ${amount} paid with ${name} points`,
  ...extra,
});

/**
 * server: burn.loyalty.providers. The first three are the Figma "🚧 Checkout 2.0" Points & Vouchers carousel
 * (Mokafaa with a linked account, QUARA with a NEW tag, Emkan); SHARE / Skywards follow in the carousel.
 */
export const loyaltyProviders: BurnProvider[] = [
  figmaLoyalty('mokafaa', 'Mokafaa', 'Mokafaa Points', sc.mokafaaBlue, sc.mokafaaTint, { description: '+96611234567 linked account', balance: '210.00' }),
  figmaLoyalty('quara', 'QUARA', 'QUARA Points', sc.quaraViolet, sc.quaraTint, { tag: { message: 'NEW', background: { colors: [sc.quaraViolet] } } }),
  figmaLoyalty('emkan', 'Emkan', 'Emkan Points', sc.emkanNavy, sc.emkanTint),
  {
    code: 'share',
    name: 'SHARE',
    title: 'SHARE points',
    description: 'Pay with your SHARE points',
    isDisabled: false,
    tag: { message: 'New', background: { colors: [sc.shareViolet, sc.shareVioletLight] } },
    logo: 'share',
    balance: '186.50',
    details: {
      genericThemeColor: sc.shareViolet,
      terms: ['Points are converted at 1 point =  0.005.', 'Redeemed points are refunded to your SHARE account if the order is cancelled.'],
      redeemPage: { ...loyaltyPage({ title: 'Enter the phone number linked to your SHARE account', color: sc.shareViolet, bg: [sc.shareTint, sc.white], submit: 'Continue', submitBg: sc.shareViolet }), icon: 'share' },
      otpPage: { ...loyaltyPage({ title: 'Enter the OTP sent to your phone', color: sc.shareViolet, bg: [sc.shareTint, sc.white], otp: true, amount: { min: 5, max: 500 }, submit: 'Redeem', submitBg: sc.shareViolet }), icon: 'share' },
    },
    successMessage: (amount) => ` ${amount} SHARE points redeemed successfully`,
  },
  {
    code: 'skywards',
    name: 'Skywards',
    title: 'Skywards Miles',
    description: 'Use Miles to pay for your order',
    isDisabled: false,
    tag: null,
    logo: 'skywards',
    balance: '74.20',
    details: {
      genericThemeColor: sc.skywardsGold,
      terms: ['Miles are deducted from your Skywards account once the order is placed.'],
      redeemPage: { ...loyaltyPage({ title: 'Enter the phone number linked to your Skywards account', color: sc.skywardsGold, bg: [sc.skywardsTint, sc.white], submit: 'Continue', submitBg: sc.skywardsInk }), icon: 'skywards' },
      otpPage: { ...loyaltyPage({ title: 'Enter the OTP sent to your phone', color: sc.skywardsGold, bg: [sc.skywardsTint, sc.white], otp: true, amount: { min: 10, max: 300 }, submit: 'Redeem', submitBg: sc.skywardsInk }), icon: 'skywards' },
    },
    successMessage: (amount) => ` ${amount} paid with Skywards Miles`,
  },
];

const voucherPage = (title: string, color: string, otp: boolean): ProviderPage => ({
  header: null,
  icon: '',
  title,
  background: { colors: [sc.voucherTint, sc.white] },
  fields: {
    voucher: otp ? null : { minLength: 8, maxLength: 20, placeholder: 'Enter Voucher code' },
    phoneNumber: null,
    amount: null,
    otp: otp ? { length: 6 } : null,
  },
  submitButton: { text: otp ? 'Redeem' : 'Continue', textColor: sc.white, background: { colors: [color] } },
});

/** server: burn.voucher.providers ("Financing Options") */
export const voucherProviders: BurnProvider[] = [
  {
    code: 'yougotagift',
    name: 'YOUGotaGift',
    title: 'YOUGotaGift',
    description: 'Redeem a digital gift card',
    isDisabled: false,
    tag: null,
    logo: 'yougotagift',
    voucherAmount: '100',
    details: {
      genericThemeColor: sc.yougotagiftPink,
      terms: ['Voucher balance cannot be refunded as cash.'],
      redeemPage: { ...voucherPage('Enter your voucher code', sc.yougotagiftPink, false), icon: 'yougotagift' },
      otpPage: { ...voucherPage('Enter the OTP sent to your registered phone', sc.yougotagiftPink, true), icon: 'yougotagift' },
    },
    successMessage: (amount) => ` ${amount} voucher applied to your order`,
  },
  {
    code: 'flexvoucher',
    name: 'Flex',
    title: 'Flex voucher',
    description: 'Use your company Flex benefits',
    isDisabled: false,
    tag: { message: 'Popular', background: { colors: [sc.flexBlue] } },
    logo: 'flex',
    voucherAmount: '50',
    details: {
      genericThemeColor: sc.flexBlue,
      terms: ['One voucher can be used per order.'],
      redeemPage: { ...voucherPage('Enter your voucher code', sc.flexBlue, false), icon: 'flex' },
      otpPage: { ...voucherPage('Enter the OTP sent to your registered phone', sc.flexBlue, true), icon: 'flex' },
    },
    successMessage: (amount) => ` ${amount} Flex voucher applied`,
  },
  {
    code: 'giftcardplus',
    name: 'Gift+',
    title: 'Gift+ card',
    description: null,
    isDisabled: true,
    tag: null,
    logo: 'giftplus',
    voucherAmount: '25',
    details: {
      genericThemeColor: sc.giftplusGreen,
      terms: [],
      redeemPage: { ...voucherPage('Enter your voucher code', sc.giftplusGreen, false), icon: 'giftplus' },
      otpPage: { ...voucherPage('Enter the OTP', sc.giftplusGreen, true), icon: 'giftplus' },
    },
    successMessage: (amount) => ` ${amount} applied`,
  },
];

/**
 * server: burn for the Figma "All flows" Checkout (127:44077, "🇸🇦 Points & Vouchers section" 143:13577) —
 * master NoonCheckoutBurnSection: `title`, `loyalty.providers` as a row of collapsed callouts (Mokafaa, Qitaf) and
 * the `voucher` callout (HTML text + overlapping 30px rounded logos + chevron) that opens the providers list.
 * The frame is the KSA market; the providers are session data (no country gate in master), kept as demo data.
 */
export const qitafProvider = figmaLoyalty('qitaf', 'Qitaf', 'Qitaf Points', sc.qitafPurple, sc.qitafTint, { description: 'Pay with your Qitaf points', balance: '95.00' });
export const tamamProvider: BurnProvider = {
  ...figmaLoyalty('tamam', 'Tamam', 'Tamam', sc.tamamYellow, sc.tamamTint, { description: 'Split in up to 36 monthly payments' }),
  balance: undefined,
  voucherAmount: '500',
};
export const topUpBurn = {
  title: 'Top up noon Credits',
  loyalty: [loyaltyProviders[0], qitafProvider] as BurnProvider[],
  voucher: {
    callout: `<p>Get up to <b>${currency} 30,000</b> & split in <b>36/mo</b></p>`,
    providers: [tamamProvider, loyaltyProviders[2], loyaltyProviders[1]] as BurnProvider[],
  },
};

/** server: burn */
export const burnSection = {
  title: 'Pay with points & vouchers',
  voucherCallout: 'Have a gift card or voucher? <b>Redeem it</b>',
};

/** server: earn (NoonCheckoutProviderEarnType) */
export const earnSection = {
  icon: 'earn',
  title: 'Earn points on this order',
  subtitle: 'Get rewarded with your favourite loyalty program',
  description: 'Choose a program to earn points',
  terms: ['Points are credited within 30 days after your order is delivered.', 'You can earn with one program per order.'],
};

export const earnProviders: EarnProvider[] = [
  {
    code: 'share',
    name: 'SHARE',
    title: 'SHARE',
    description: 'Earn <b>2 points</b> for every  1',
    isDisabled: false,
    tag: null,
    logo: 'share',
    details: {
      genericThemeColor: sc.shareViolet,
      terms: ['Points are credited within 30 days after delivery.', 'Returned items are not eligible for points.'],
      termsExternalUrl: null,
      earnPage: {
        header: null,
        icon: 'share',
        title: 'Earn SHARE points on this order',
        background: { colors: [sc.shareTint, sc.white] },
        fields: { voucher: null, phoneNumber: { countryCode: '971', savedPhoneNumber: savedPhone, placeholder: '5X XXX XXXX' }, amount: null, otp: null },
        submitButton: { text: 'Earn points', textColor: sc.white, background: { colors: [sc.shareViolet] } },
      },
    },
    successMessage: "You'll earn SHARE points on this order",
  },
  {
    code: 'skywards',
    name: 'Skywards',
    title: 'Emirates Skywards',
    description: 'Earn <b>1 Mile</b> for every  4',
    isDisabled: false,
    tag: null,
    logo: 'skywards',
    details: {
      genericThemeColor: sc.skywardsGold,
      terms: ['Miles are credited within 30 days after delivery.'],
      termsExternalUrl: null,
      earnPage: {
        header: null,
        icon: 'skywards',
        title: 'Earn Skywards Miles on this order',
        background: { colors: [sc.skywardsTint, sc.white] },
        fields: { voucher: null, phoneNumber: { countryCode: '971', savedPhoneNumber: savedPhone, placeholder: '5X XXX XXXX' }, amount: null, otp: null },
        submitButton: { text: 'Earn Miles', textColor: sc.white, background: { colors: [sc.skywardsInk] } },
      },
    },
    successMessage: "You'll earn Skywards Miles on this order",
  },
];

export const allBurnProviders = [...loyaltyProviders, ...voucherProviders, qitafProvider, tamamProvider];
export const findBurnProvider = (code: string) => allBurnProviders.find((p) => p.code === code);
export const findEarnProvider = (code: string) => earnProviders.find((p) => p.code === code);

/** demo: this OTP is rejected (server: useOtpStatus FAILED) */
export const FAILING_OTP = '000000';
export const otpErrorMessage = 'The OTP you entered is incorrect. Please try again.'; // server:
export const otpResendSeconds = 30;

/* ───────────────────────── installation slots (NoonCheckoutShipmentInstallationSlotsResponseType) ───────────────────────── */

export interface InstallationSlot {
  slotId: number;
  label: string;
}

const iso = (offset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const slotLabels = ['9 AM - 12 PM', '12 PM - 3 PM', '3 PM - 6 PM', '6 PM - 9 PM'];

/** server: getShipmentInstallationSlots — 14-day window, some days without slots */
export function buildInstallationSlots() {
  const availableSlots: Record<string, InstallationSlot[]> = {};
  for (let i = 2; i < 16; i++) {
    if (i % 5 === 1) continue; // fully booked days
    const labels = i % 3 === 0 ? slotLabels.slice(1, 3) : slotLabels;
    availableSlots[iso(i)] = labels.map((label, j) => ({ slotId: i * 10 + j, label }));
  }
  return { startDate: iso(2), endDate: iso(15), availableSlots };
}

export const installationSlots = buildInstallationSlots();

/** slotId → { isoDate, label } for the shipment callout / confirmation */
export function findInstallationSlot(slotId: number | undefined | null) {
  if (slotId == null) return null;
  for (const [isoDate, slots] of Object.entries(installationSlots.availableSlots)) {
    const s = slots.find((x) => x.slotId === slotId);
    if (s) return { isoDate, label: s.label, slotId };
  }
  return null;
}

/** server: installationInfo.selectedSlotId default (first slot of the first day) */
export const defaultInstallationSlotId = Object.values(installationSlots.availableSlots)[0]?.[0]?.slotId ?? null;
