import enbdCard from '@assets/noonone/offers/enbd-card-no-name.webp';
import enbdCardSm from '@assets/noonone/offers/enbd-card-no-name-sm.webp';
import mashreqCardSm from '@assets/noonone/offers/mashreq-card-no-name-sm.webp';
import noonOneIcon from '@assets/noonone/entry/noon-one.webp';
import gift from '@assets/vip/gift.svg';
import percentBadge from '@assets/vip/percent-badge.svg';
import stcIcon from '@assets/noonone/icons/stc.webp';
import alertIcon from '@assets/vip/one-trial-alert.webp';
import { CURRENCY, findPlan, type VipPlan } from './data';

/**
 * Offers-area demo data. All SERVER-DRIVEN on master: VIPService.getVIPTouchpoints('offersOverlay' | 'offers' {campaignCode} |
 * 'stc' | 'bundle' {bundlePartnerCode} | 'acceptInviteOverlay' {inviteCode}) and VIPService.verifyReferralCode.
 * No fixtures exist in bappzaar, so values are realistic UAE demo content. Copy keys used by the screens are listed in
 * mapping/offers.md; the strings below are the server payload stand-ins.
 */

/** misc.colorIcon — the noon One logo shown when a plan has no planImage */
export const oneColorIcon = noonOneIcon;

/** VIPVoucherType */
export interface VipVoucher {
  title: string;
  description: string;
  planCode: string;
  voucherCode?: string;
  iconUrl?: string;
  activeButtonText?: string;
  disabledButtonText?: string;
  appliedDescription: string;
  plan: VipPlan;
  details?: string[];
}

const offerPlan = (code: string, o: Partial<VipPlan>): VipPlan => ({ ...findPlan(code), ...o });

const terms = (body: string) => `<p>${body} Cancel anytime from <a href="/noon-one-manage-membership">Manage membership</a>. <a href="https://www.noon.com/uae-en/noon-one-terms">Terms & Conditions</a> apply.</p>`;

/** plans returned with a voucher (VIPVoucherType.plan / verifyReferralCode.plan) */
export const voucherPlans = {
  ONE3FOR1: offerPlan('ONE_MONTHLY', {
    planCode: 'ONE_MONTHLY_V3FOR1',
    title: 'Monthly plan',
    monthlyPrice: `${CURRENCY} 1 for 3 months`,
    savingPct: 'Save 99%',
    description: `<p>Then ${CURRENCY} 25/month. Billed monthly</p>`,
    trialMessage: undefined,
    reminderMessage: undefined,
    isTrialValid: false,
    paymentTerms: terms(`You'll be charged <b>${CURRENCY} 1</b> today for your first 3 months, then <b>${CURRENCY} 25/month</b> until you cancel.`),
  }),
  SARA25: offerPlan('ONE_MONTHLY', {
    planCode: 'ONE_MONTHLY_REF',
    title: 'Monthly plan',
    monthlyPrice: `${CURRENCY} 25/month`,
    description: '<p>Billed monthly after your free month</p>',
    trialMessage: '1 month free',
    reminderMessage: "<p>We'll remind you 2 days before you start getting charged</p>",
    paymentTerms: terms(`Your free month starts today. After that you'll be charged <b>${CURRENCY} 25/month</b> until you cancel.`),
  }),
  ONE30: offerPlan('ONE_ANNUAL', {
    planCode: 'ONE_ANNUAL_30',
    title: 'Annual plan',
    monthlyPrice: `${CURRENCY} 175/year`,
    savingPct: '30% off',
    description: `<p><s>${CURRENCY} 250</s> billed yearly</p>`,
    trialMessage: undefined,
    isTrialValid: false,
    paymentTerms: terms(`You'll be charged <b>${CURRENCY} 175</b> today for your first year, then <b>${CURRENCY} 250/year</b> until you cancel.`),
  }),
  ENBD12: offerPlan('ONE_ANNUAL', {
    planCode: 'ONE_ANNUAL_ENBD',
    title: 'Annual plan',
    monthlyPrice: `${CURRENCY} 0 for 12 months`,
    savingPct: 'Free',
    description: '<p>Complimentary with your Emirates NBD noon One Credit Card</p>',
    trialMessage: undefined,
    isTrialValid: false,
    paymentTerms: terms(`Pay with your Emirates NBD noon One Credit Card to get 12 months free, then <b>${CURRENCY} 250/year</b>.`),
  }),
  MASHREQ50: offerPlan('ONE_ANNUAL', {
    planCode: 'ONE_ANNUAL_MASHREQ',
    title: 'Annual plan',
    monthlyPrice: `${CURRENCY} 125/year`,
    savingPct: '50% off',
    description: `<p><s>${CURRENCY} 250</s> billed yearly with your Mashreq noon Credit Card</p>`,
    trialMessage: undefined,
    isTrialValid: false,
    paymentTerms: terms(`You'll be charged <b>${CURRENCY} 125</b> today with your Mashreq noon Credit Card, then <b>${CURRENCY} 250/year</b>.`),
  }),
} satisfies Record<string, VipPlan>;

export type VoucherCode = keyof typeof voucherPlans;

/** offersOverlay.vouchers */
export const vouchers: VipVoucher[] = [
  {
    title: '3 months for AED 1',
    description: 'Exclusive welcome offer',
    planCode: voucherPlans.ONE3FOR1.planCode,
    voucherCode: 'ONE3FOR1',
    iconUrl: gift,
    activeButtonText: 'Apply offer',
    disabledButtonText: 'Applied',
    appliedDescription: `<p>3 months of noon One for <b>${CURRENCY} 1</b></p>`,
    plan: voucherPlans.ONE3FOR1,
    details: ['Valid for new noon One members only', `${CURRENCY} 25/month after the offer period`, 'Offer valid until 31 Dec 2026'],
  },
  {
    title: '1 month free from Sara',
    description: 'Referral reward',
    planCode: voucherPlans.SARA25.planCode,
    voucherCode: 'SARA25',
    iconUrl: percentBadge,
    activeButtonText: 'Apply offer',
    disabledButtonText: 'Applied',
    appliedDescription: '<p>Your first month of noon One is <b>free</b></p>',
    plan: voucherPlans.SARA25,
  },
];

/** offersOverlay.bankOffers */
export const bankOffers: VipVoucher[] = [
  {
    title: '12 months free noon One',
    description: 'Emirates NBD noon One Credit Card',
    planCode: voucherPlans.ENBD12.planCode,
    iconUrl: enbdCardSm,
    activeButtonText: 'Apply offer',
    disabledButtonText: 'Applied',
    appliedDescription: '<p>12 months of noon One for <b>free</b></p>',
    plan: voucherPlans.ENBD12,
    details: ['Pay with an eligible Emirates NBD noon One Credit Card', 'Auto-renews at AED 250/year after 12 months'],
  },
  {
    title: '50% off the annual plan',
    description: 'Mashreq noon Credit Card',
    planCode: voucherPlans.MASHREQ50.planCode,
    iconUrl: mashreqCardSm,
    activeButtonText: 'Apply offer',
    disabledButtonText: 'Applied',
    appliedDescription: `<p>noon One annual for <b>${CURRENCY} 125</b></p>`,
    plan: voucherPlans.MASHREQ50,
  },
];

/** VIPService.verifyReferralCode → { isValid, message, plan } (typed code). Any listed voucher code + ONE30 are valid. */
export function verifyCode(code: string): { isValid: boolean; message: string; plan?: VipPlan } {
  const c = code.trim().toUpperCase() as VoucherCode;
  const plan = voucherPlans[c];
  if (!plan) return { isValid: false, message: 'This code is invalid or has expired' };
  const v = [...vouchers, ...bankOffers].find((x) => x.voucherCode === c);
  return { isValid: true, message: v?.appliedDescription ?? `<p>${plan.monthlyPrice} with <b>${c}</b></p>`, plan };
}

/** VIPOffersV2Screen campaigns ('offers' {campaignCode} / 'stc' page) */
export interface PartnerCampaign {
  campaignCode: string;
  /** VIPPartnerOfferPlanModule.animationUrl (image / lottie) + ratio (height = width × ratio/100) */
  animationUrl: string;
  ratio: number;
  /** hero tint behind the partner art (demo) */
  heroColor: 'enbd' | 'stc';
  plan: VipPlan;
  voucherCode?: string;
  buttonSection: { button: { title: string; cta: '/create' }; footerNote: string; headerText: string; message: string };
  showPlansButton: boolean;
  /** data.buttons — sticky footer */
  stickyButtonText: string;
}

export const partnerCampaigns: Record<string, PartnerCampaign> = {
  enbd: {
    campaignCode: 'enbd',
    animationUrl: enbdCard,
    ratio: 70,
    heroColor: 'enbd',
    plan: voucherPlans.ENBD12,
    voucherCode: 'ENBD12',
    buttonSection: {
      button: { title: 'Activate my 12 months free', cta: '/create' },
      headerText: 'Code {voucher_code} applied',
      message: 'Your Emirates NBD noon One Credit Card unlocks 12 months of noon One at no cost.',
      footerNote: 'Renews at AED 250/year. Cancel anytime.',
    },
    showPlansButton: true,
    stickyButtonText: 'Activate offer',
  },
  stc: {
    campaignCode: 'stc',
    animationUrl: stcIcon,
    ratio: 50,
    heroColor: 'stc',
    plan: offerPlan('ONE_MONTHLY', {
      planCode: 'ONE_MONTHLY_STC',
      title: 'Monthly plan',
      monthlyPrice: `${CURRENCY} 0 for 3 months`,
      savingPct: 'Free',
      isTrialValid: false,
      paymentTerms: terms(`3 months of noon One on stc, then <b>${CURRENCY} 25/month</b> until you cancel.`),
    }),
    buttonSection: {
      button: { title: 'Claim 3 months free', cta: '/create' },
      headerText: '',
      message: 'Exclusive for stc customers in the UAE.',
      footerNote: 'Then AED 25/month. Cancel anytime.',
    },
    showPlansButton: false,
    stickyButtonText: 'Claim offer',
  },
};

/** VIPBundleV2ScreenResponseType for bundlePartnerCode=yango */
export const yangoBundle = {
  headerTitle: 'noon One + Yango Play',
  benefitsTitle: '<p>One plan, <b>double</b> the <highlight>perks</highlight></p>',
  benefits: [
    { icon: 'truck', text: '<p><highlight>Free</highlight> delivery on noon, Food & Minutes</p>' },
    { icon: 'zap', text: '<p>Yango Play <highlight>movies</highlight> & series</p>' },
    { icon: 'sparkles', text: '<p>Ad-free <highlight>music</highlight> streaming</p>' },
    { icon: 'gift', text: `<p><highlight>${CURRENCY} 100</highlight> noon credits</p>` },
  ] as { icon: 'truck' | 'zap' | 'sparkles' | 'gift'; text: string }[],
  planTitle: 'New plan',
  pillText: '1 month free',
  plan: offerPlan('ONE_YANGO_MONTHLY', {
    title: 'One + Yango Play',
    monthlyPrice: `<p><b>${CURRENCY} 39</b><br>/month</p>`,
    description: '<p>Billed monthly after trial</p>',
    trialMessage: '1 month free',
    buttonText: 'Start free trial',
  }),
};

/** acceptInviteOverlay (owner_name / plan / benefits / button / footerNote) */
export const invite = {
  family: {
    ownerName: 'Sara',
    title: 'Sara invited you to her Family plan',
    subtitle: 'Join for free and enjoy every noon One benefit',
    planCode: 'ONE_FAMILY_MONTHLY',
  },
  duo: {
    ownerName: 'Omar',
    title: 'Omar invited you to his Duo plan',
    subtitle: 'Join for free and enjoy every noon One benefit',
    planCode: 'ONE_DUO_MONTHLY',
  },
  benefits: [
    { title: 'Free delivery', description: 'On noon, Food, Minutes & more', icon: 'truck' },
    { title: 'Extra cashback', description: 'Up to 5% back on every order', icon: 'percent' },
    { title: 'Member-only deals', description: 'Early access to sales', icon: 'star' },
  ] as { title: string; description: string; icon: 'truck' | 'percent' | 'star' }[],
  footerNote: '<p>By joining you agree to the noon One <a href="https://www.noon.com/uae-en/noon-one-terms">Terms & Conditions</a></p>',
};

/** errorPopup (VIPTouchpointErrorPopupType) — expired invite */
export const inviteError = {
  headerIconUrl: alertIcon,
  title: 'This invite has expired',
  body: '<p>Ask Sara to send you a new invite link, or start your own noon One plan.</p>',
  buttons: [
    { text: 'Explore noon One', cta: '/noon-one' },
    { text: 'Got it', cta: '/got-it', backgroundColor: 'white', textColor: 'dark' },
  ] as { text: string; cta: string; backgroundColor?: string; textColor?: string }[],
};
