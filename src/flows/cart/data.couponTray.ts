/**
 * Coupon tray data — shaped like master's `NoonCouponTrayType` (marketplaces/noon/types/NoonCouponType.ts) and the
 * copy of NoonSalesCouponTrayOverlayScreen (noon-en.json). The tray content is mock, derived from the cart so locked /
 * unlocked states, progress bars and Apply / Remove follow what is in it. Codes that apply live in `cartCoupons`
 * (src/kit/DemoStore.tsx). Mapping: components/couponTray/MAPPING.md.
 */
import { currency, formatPrice } from '../../data';
import { cartCoupons } from '../../kit/DemoStore';

export type TrayLockState = 'locked' | 'unlocked';
export type TrayOfferType = 'coupon_discount' | 'bank_discount_v2' | 'auto_applied_discount';

export type TrayUnlockCriteria =
  | { type: 'amount'; data: { currentAmount: number; totalAmount: number }; prompt: string }
  | { type: 'units'; data: { currentUnits: number; totalUnits: number }; prompt: string }
  | { type: 'bogo'; data: { toBuy: number; toGet: number; current: number }; prompt: string };

export interface TrayTiersProgressBar {
  prompt: string | null;
  /** 0–100 */
  current: number;
  tiers: Array<{ isUnlocked: boolean; label: string; milestone: number }>;
}

export interface TrayOffer {
  type: TrayOfferType;
  /** stable id (master: idCoupon / idDiscount) */
  id: string;
  code: string | null;
  isApplied?: boolean;
  /** header title (discountSummaryMessageV2) */
  title: string;
  header: string | null;
  body: string | null;
  promoType: 'discount' | 'cashback';
  state: TrayLockState;
  validCustomerType: 'all' | 'noon_one';
  expiryTime: string | null;
  tncUrl: string | null;
  /** "Shop more" / "Add products" target (master: plpUrl deeplink) → plp/listing query */
  plpQuery: string | null;
  unlockCriteria: TrayUnlockCriteria | null;
  tiersProgressBar: TrayTiersProgressBar | null;
}

export interface CouponTray {
  bestPrice: { header: string | null; offers: TrayOffer[] } | null;
  coupons: TrayOffer[];
  bankDiscounts: TrayOffer[];
}

export const trayCopy = {
  autoApplied: 'Automatically applies on checkout', // noon_coupon_tray_offer_auto_applied_subtitle
  apply: 'Apply', // noon_apply_cta
  remove: 'Remove', // noon_remove
  expiredCta: 'Expired', // noon_coupon_tray_expired_cta
  expired: 'This coupon has expired.', // noon_coupon_tray_expired
  endsIn: 'Ends in', // noon_ends_in
  exclusive: 'exclusive', // noon_exclusive
  tnc: 'T&C Apply', // noon_terms_and_condition_button_text
  getOneFree: 'Get noon One for FREE to unlock', // noon_coupon_tray_get_one_free
  getOne: 'Get noon One to unlock', // noon_coupon_tray_get_one
  joinOne: 'Join One', // noon_coupon_tray_join_one
  shopMore: 'Shop more', // noon_shop_more
  addProducts: 'Add products', // noon_add_products
  couponsTitle: 'Coupons', // noon_coupon_tray_coupons_section_title
  bankTitle: 'Payment offers', // noon_coupon_tray_bank_discounts_section_title
  errorTitle: 'Unable to load offers', // noon_coupon_tray_error_title
  errorSubtitle: 'Something went wrong, please try again!', // noon_coupon_tray_error_subtitle
  tryAgain: 'Try again', // noon_common_try_again
  emptyTitle: 'No coupons available', // noon_coupon_tray_empty_title
  emptySubtitle: 'It seems there are no coupons available for your cart', // noon_coupon_tray_empty_subtitle
  applyFailed: 'Failed to apply coupon', // noon_coupon_tray_apply_coupon_failure_toast_message
  removeFailed: 'Failed to remove coupon', // noon_coupon_tray_remove_coupon_failure_toast_message
  tncToast: 'The offer terms open on the bank page in the app', // kit stand-in for the T&C deeplink
};

const money = (n: number) => `${currency} ${formatPrice(Math.round(n))}`;
const pctOff = (code: string, subtotal: number) => {
  const r = cartCoupons[code];
  return r?.pct ? Math.min((subtotal * r.pct) / 100, r.cap ?? Infinity) : (r?.flat ?? 0);
};
/** one expiry per session, so the "Ends in" timer counts down between openings */
const WEEKEND_EXPIRY = new Date(Date.now() + (2 * 60 + 37) * 60_000).toISOString();

/** BEAUTY10 (coupon-scoped search demo): beauty spend that unlocks it */
const BEAUTY10_MIN = 150;

const base = { header: null, body: null, promoType: 'discount', state: 'unlocked', validCustomerType: 'all', expiryTime: null, tncUrl: null, plpQuery: null, unlockCriteria: null, tiersProgressBar: null } as const;

export interface TrayInputs {
  subtotal: number;
  units: number;
  appliedCode: string | null;
  isMember: boolean;
}

/** Build the tray for the current cart (stands in for NoonCartService.getCouponTray). */
export function buildCouponTray({ subtotal, units, appliedCode, isMember }: TrayInputs): CouponTray {
  const noon10 = pctOff('NOON10', subtotal);
  const bank = Math.min(subtotal * 0.1, 100);
  const cashbackCurrent = Math.min(100, Math.round((subtotal / 1500) * 100));
  const tiers = [
    { milestone: 33, label: '<p>5%</p>' },
    { milestone: 66, label: '<p>10%</p>' },
    { milestone: 100, label: '<p>15%</p>' },
  ].map((t) => ({ ...t, isUnlocked: cashbackCurrent >= t.milestone }));
  const nextTier = tiers.find((t) => !t.isUnlocked);
  const nextTierAmount = nextTier ? Math.max(0, (nextTier.milestone / 100) * 1500 - subtotal) : 0;

  return {
    bestPrice: {
      header: `Save ${money(noon10 + bank)}`,
      offers: [
        {
          ...base,
          type: 'coupon_discount',
          id: 'coupon-noon10',
          code: 'NOON10',
          isApplied: appliedCode === 'NOON10',
          title: `Save ${money(noon10)}`,
          header: 'Best price for your cart.',
          body: `Get 10% off up to ${money(150)} on electronics, home and fashion. Applies to the items in your cart; one coupon per order.`,
          tncUrl: 'noon://tnc/noon10',
        },
        {
          ...base,
          type: 'bank_discount_v2',
          id: 'bank-enbd',
          code: null,
          title: `Extra ${money(bank)} off`,
          header: 'With Emirates NBD credit cards.',
          body: `10% off up to ${money(100)} when you pay with an Emirates NBD credit card. Applied on the payment page.`,
          tncUrl: 'noon://tnc/enbd',
        },
      ],
    },
    coupons: [
      // coupon-scoped search demo (src/flows/couponsearch): locked until the cart has beauty; Shop more opens its eligible items
      {
        ...base,
        type: 'coupon_discount',
        id: 'coupon-beauty10',
        code: 'BEAUTY10',
        isApplied: appliedCode === 'BEAUTY10',
        title: 'Extra 10% off on beauty',
        header: 'On skincare, haircare, makeup & more.',
        body: 'Valid on eligible beauty items. One coupon per order.',
        state: 'locked',
        unlockCriteria: { type: 'amount', data: { currentAmount: 0, totalAmount: BEAUTY10_MIN }, prompt: `<p>Add <b>${money(BEAUTY10_MIN)}</b> of beauty to unlock</p>` },
        plpQuery: 'beauty10',
      },
      {
        ...base,
        type: 'coupon_discount',
        id: 'coupon-save50',
        code: 'SAVE50',
        isApplied: appliedCode === 'SAVE50',
        title: `${money(50)} off`,
        header: `On orders above ${money(300)}.`,
        body: 'Valid on everything sold by noon. Cannot be combined with other coupons.',
        state: subtotal >= 300 ? 'unlocked' : 'locked',
        unlockCriteria: subtotal >= 300 ? null : { type: 'amount', data: { currentAmount: subtotal, totalAmount: 300 }, prompt: `<p>Add <b>${money(300 - subtotal)}</b> more to unlock</p>` },
        plpQuery: subtotal >= 300 ? null : 'deals',
      },
      {
        ...base,
        type: 'coupon_discount',
        id: 'coupon-one20',
        code: 'ONE20',
        isApplied: appliedCode === 'ONE20',
        title: `20% off up to ${money(100)}`,
        header: 'For noon One members.',
        body: 'Members save more on every order. Valid once per day.',
        validCustomerType: 'noon_one',
        state: isMember ? 'unlocked' : 'locked',
      },
      {
        ...base,
        type: 'coupon_discount',
        id: 'coupon-weekend15',
        code: 'WEEKEND15',
        isApplied: appliedCode === 'WEEKEND15',
        title: `15% off up to ${money(75)}`,
        header: 'Weekend deal, today only.',
        body: 'Valid on fashion, beauty and home. Excludes gold, gift cards, mobiles and items already on a lightning deal. One use per customer; the discount is split across eligible items.',
        expiryTime: WEEKEND_EXPIRY,
        tncUrl: 'noon://tnc/weekend15',
      },
      {
        ...base,
        type: 'coupon_discount',
        id: 'coupon-buy3',
        code: 'BUY3',
        isApplied: appliedCode === 'BUY3',
        title: `5% off when you buy 3`,
        header: 'Mix and match any 3 items.',
        body: null,
        state: units >= 3 ? 'unlocked' : 'locked',
        unlockCriteria: units >= 3 ? null : { type: 'units', data: { currentUnits: Math.min(units, 3), totalUnits: 3 }, prompt: `<p>Add <b>${3 - units} more ${3 - units === 1 ? 'item' : 'items'}</b> to unlock</p>` },
        plpQuery: units >= 3 ? null : 'deals',
      },
      {
        ...base,
        type: 'auto_applied_discount',
        id: 'discount-cashback-tiers',
        code: null,
        title: 'Up to 15% cashback',
        header: 'Spend more, earn more noon credits.',
        body: 'Cashback lands in your noon credits after delivery.',
        promoType: 'cashback',
        state: tiers[0].isUnlocked ? 'unlocked' : 'locked',
        tiersProgressBar: {
          prompt: nextTier ? `<p>Add <orange>${money(nextTierAmount)}</orange> more for <orange>${nextTier.label.replace(/<\/?p>/g, '')}</orange> cashback</p>` : '<p>You unlocked the highest cashback</p>',
          current: cashbackCurrent,
          tiers,
        },
        plpQuery: nextTier ? 'deals' : null,
      },
    ],
    bankDiscounts: [
      {
        ...base,
        type: 'bank_discount_v2',
        id: 'bank-mashreq',
        code: null,
        title: `10% off up to ${money(150)}`,
        header: 'Mashreq credit cards.',
        body: 'Applied on the payment page when you pay with an eligible Mashreq credit card. Minimum spend applies.',
        tncUrl: 'noon://tnc/mashreq',
      },
      {
        ...base,
        type: 'bank_discount_v2',
        id: 'bank-adcb',
        code: null,
        title: '5% cashback',
        header: 'ADCB TouchPoints cards.',
        body: 'Cashback is credited by the bank within 30 days.',
        promoType: 'cashback',
        tncUrl: 'noon://tnc/adcb',
      },
    ],
  };
}

/** RAK50 "Ends in" on the BEAUTY10 tray: the team file's 08:23:56, counting down from when the module loads */
const RAK50_EXPIRY = new Date(Date.now() + (8 * 3600 + 23 * 60 + 56) * 1000).toISOString();
const beautyTerms = `10% off on all beauty products up to ${currency}50 with your FAB and Dubai first Mastercard credit card`;

/**
 * The coupon-scoped search demo's tray (src/flows/couponsearch, team file 02 / 03 · Coupons): Save 178 best offer
 * (WELCOME20 cashback + FAB), then RAK50 with its timer, the locked BEAUTY10 (Shop more opens its eligible items) and
 * B2G1PA. Fixed content, as the frames, whatever is in the kit's cart.
 */
export function buildBeauty10Tray({ appliedCode }: Pick<TrayInputs, 'appliedCode'>): CouponTray {
  return {
    bestPrice: {
      header: `Save ${currency}178`,
      offers: [
        { ...base, type: 'coupon_discount', id: 'coupon-welcome20', code: 'WELCOME20', isApplied: appliedCode === 'WELCOME20', title: `${currency}97.32 cashback`, promoType: 'cashback', header: beautyTerms },
        { ...base, type: 'bank_discount_v2', id: 'bank-fab', code: null, title: `${currency}97.32 cashback`, promoType: 'cashback', header: beautyTerms },
      ],
    },
    coupons: [
      { ...base, type: 'coupon_discount', id: 'coupon-rak50', code: 'RAK50', isApplied: appliedCode === 'RAK50', title: `${currency}50 off`, header: beautyTerms, expiryTime: RAK50_EXPIRY },
      {
        ...base,
        type: 'coupon_discount',
        id: 'coupon-beauty10',
        code: 'BEAUTY10',
        title: 'Extra 10% off on beauty',
        expiryTime: RAK50_EXPIRY,
        header: '10% off on all beauty products.',
        body: `Up to ${currency}50 with your FAB and Dubai first Mastercard credit card.`,
        state: 'locked',
        unlockCriteria: { type: 'amount', data: { currentAmount: 135, totalAmount: 265 }, prompt: `<p><b>Add ${currency}130 more</b> to unlock coupon</p>` },
        plpQuery: 'beauty10',
      },
      {
        ...base,
        type: 'coupon_discount',
        id: 'coupon-b2g1pa',
        code: 'B2G1PA',
        title: 'Buy 2 Get 1 Free',
        header: '10% off on all beauty products.',
        body: `Up to ${currency}50 with your FAB and Dubai first Mastercard credit card.`,
        state: 'locked',
        unlockCriteria: { type: 'bogo', data: { toBuy: 2, toGet: 1, current: 0 }, prompt: '<p><b>Add 2 items</b> for the price of 1</p>' },
        plpQuery: 'deals',
      },
    ],
    bankDiscounts: [],
  };
}
