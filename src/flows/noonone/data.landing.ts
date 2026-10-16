import familyHeaderLottie from '@assets/vip/vip-family-plans-header.lottie';
import foodIcon from '@assets/switcher/food.png';
import minutesIcon from '@assets/switcher/rocket.png';
import noonIcon from '@assets/switcher/noon.png';
import instantIcon from '@assets/switcher/nooninstant-compact.png';
import nownowIcon from '@assets/switcher/noonnownow.png';
import vipSparkle from '@assets/vip/star.svg';
import { user } from '../../data';
import { CURRENCY } from './data';

/**
 * Landing CMS content — SERVER-DRIVEN on master: VIPService.getVIPTouchpoints('landingV2') → landingV2.cms.data
 * (VIP_* modules), landingV2.buttons / viewPlansButton / flyout / plan / bgImg. No fixtures exist in bappzaar, so
 * these are realistic UAE demo values. Real copy keys (vip-en.json / en.json) are noted inline.
 * Module shapes: features/vip/types/VIPModuleDataTypes.ts.
 */

/** I18n.t('vip_noon_one') */
export const NOON_ONE = 'noon One';

export const landingCopy = {
  /** vip_one_reminder_set */
  reminderSet: "We'll remind you 2 days before your trial ends.",
  /** vip_coupon_code_copied */
  codeCopied: 'Code copied',
  /** vip_gc_pay_with */
  payWith: 'Pay with',
  /** vip_apple_pay */
  applePay: 'Apple Pay',
  /** vip_one_landing_title / vip_one_landing_subtitle (VIPMembershipOverviewModule showDefault) */
  defaultTitle: 'Free Delivery',
  defaultSubtitle: 'On everything, anytime.',
  /** vip_manage_your_membership */
  manageYourMembership: '<b>Manage</b> your membership',
};

/** landingV2.buttons (cta '/create' → VIPSubscriptionButtonV2) + viewPlansButton */
export const stickyButtons = {
  /** title comes from the plan (buttonText) on master: '/create' button.title */
  viewPlans: { title: 'View all plans', cta: '/plan-select' },
};

/** VIPPartnerCalloutType (landingV2.flyout / offerFlyout) */
export interface FlyoutData {
  text: string;
  iconUrl?: string;
  trailingIconUrl?: string;
  trailingText?: string;
  couponCode?: string;
  internalUrl?: string;
  backgroundColor?: string;
  textColor: string;
}

/** landingV2.flyout (VIPPartnerCalloutType) — coupon variant: tap copies the code, trailing text → "Code copied" */
export const flyout: FlyoutData = {
  text: `<p>Extra month free with code <b>ONE2026</b></p>`,
  trailingText: 'Copy code',
  couponCode: 'ONE2026',
  backgroundColor: undefined,
  textColor: 'var(--nk-palette-white)',
};

/** landingV2.offerFlyout — wins over `flyout` when present (renderStickyFooter); prod non-member: sparkle · text · sparkle, opens plan select */
export const offerFlyout: FlyoutData = {
  iconUrl: vipSparkle,
  trailingIconUrl: vipSparkle,
  text: `<p>Don't miss noon One at the <b>lowest</b> price</p>`,
  internalUrl: '/plan-select',
  backgroundColor: 'var(--nk-color-vip-np-offer-flyout)',
  textColor: 'var(--nk-palette-white)',
};

export interface MpBenefit {
  id: string;
  iconUrl: string;
  title: string;
  subtitle: string;
}

/** VIP_MARKETPLACE_BENEFITS_CAROUSEL_MODULE.mpBenefits (highlighted mp = noon first) */
export const mpBenefits: MpBenefit[] = [
  { id: 'noon', iconUrl: noonIcon, title: 'Free delivery on noon', subtitle: 'On all orders above AED 50, plus extra cashback on top brands' },
  { id: 'rocket', iconUrl: minutesIcon, title: 'Free delivery on Minutes', subtitle: 'Groceries in minutes, with zero delivery fees on orders above AED 25' },
  { id: 'food', iconUrl: foodIcon, title: 'Free delivery on Food', subtitle: 'From your favourite restaurants, with no delivery fee' },
  { id: 'instant', iconUrl: instantIcon, title: 'Free delivery on Instant', subtitle: 'Your daily essentials, delivered free' },
  { id: 'nownow', iconUrl: nownowIcon, title: 'Free delivery on NowNow', subtitle: 'Fast deliveries with no extra fees' },
];

export interface Benefit {
  title: string;
  description: string;
  iconUrl?: string;
  mpIcons?: string[];
  buttonText?: string;
  cta?: string;
}

/** VIP_BENEFITS_MODULE */
export const benefitsModule = {
  moduleHeader: { title: 'Everything you get with noon One' },
  benefits: [
    { title: 'Unlimited free delivery', description: 'Across noon, Minutes and Food with no minimum on most orders', mpIcons: [minutesIcon, foodIcon, noonIcon] },
    { title: 'Extra 5% cashback', description: 'On top brands every day, credited straight to your noon wallet', iconUrl: noonIcon },
    { title: 'Members-only deals', description: 'Early access to sales events and exclusive prices', iconUrl: foodIcon },
    { title: 'Yango Play included', description: 'Stream movies, series and music on selected plans', iconUrl: nownowIcon },
  ] as Benefit[],
};

/** VIP_FAMILY_PLAN_MODULE (non-member: '/view-sharing-plans') */
export const familyPlanModule = {
  title: 'Share noon One with your family',
  subtitle: 'Up to 5 members on one plan',
  members: [{ name: user.firstName }],
  maxNumMembers: 5,
  tags: [
    { text: 'Duo', textColor: 'var(--nk-color-text-body)', backgroundColors: ['var(--nk-palette-white)', 'var(--nk-palette-white)'] },
    { text: 'Family', textColor: 'var(--nk-color-text-body)', backgroundColors: ['var(--nk-palette-white)', 'var(--nk-palette-white)'] },
  ],
  button: { text: 'View family plans', cta: '/view-sharing-plans' },
};

/** VIP_GUIDE_STEPS_MODULE */
export const guideStepsModule = {
  moduleHeader: { title: 'How your free trial works' },
  stepUnit: 'STEP',
  rows: [
    { stepValue: '1', stepTitle: 'Start your 30-day free trial', stepSubtitle: 'Enjoy every benefit right away' },
    { stepValue: '2', stepTitle: "We'll remind you before it ends", stepSubtitle: '2 days before you get charged' },
    { stepValue: '3', stepTitle: `${CURRENCY} 25/month after the trial`, stepSubtitle: 'Cancel anytime from Manage membership' },
  ],
};

/** VIP_EXPANDABLE_TEXT_MODULE (variant grouped, rows start collapsed); title = vip_frequently_asked_questions */
export const faqModule = {
  title: 'Frequently asked questions',
  rows: [
    { header: 'What is noon One?', body: 'noon One is a membership that gives you unlimited free delivery across noon, Minutes and Food, extra cashback and members-only deals.' },
    { header: 'How does the free trial work?', body: "Your 30-day free trial starts as soon as you join. We'll remind you 2 days before it ends, and you can cancel anytime before then at no cost." },
    { header: 'Can I share my membership?', body: 'Yes. With a Duo or Family plan you can invite up to 4 members to enjoy the same benefits.' },
    { header: 'How do I cancel?', body: 'Go to Account → noon One → Manage membership and tap Cancel membership. Your benefits stay active until the end of the billing period.' },
  ],
};

/** VIP_BANNER_MODULE hero — lottie banner (ratio 100) */
export const heroBanner = { lottieUrl: familyHeaderLottie, ratio: 100 };

/**
 * member landing — VIP_MEMBERSHIP_OVERVIEW_MODULE. `lottieUrl` is a server animation drawn around the name (title sits
 * at marginTop −162 inside the 260px box); no URL is known, so the box stays empty (the full-bleed logo lottie
 * covered the name). Set a .lottie here to preview one.
 */
export const membershipOverview = {
  lottieUrl: undefined as string | undefined,
  name: `${user.firstName} ${user.lastName}`,
  message: 'Welcome to noon One',
  status: { trial: '<p><highlight>Free trial</highlight> active</p>', active: '<p><highlight>Active</highlight></p>', highlightColor: 'var(--nk-color-best-price-ink)' },
};

/** member landing — VIP_SAVINGS_BREAKDOWN_MODULE (V1, customerState 'new' → centered potential variant) */
export const savingsModule = {
  title: 'YOUR SAVINGS POTENTIAL',
  savingsText: 'Save up to {multiplier}x',
  savingsMultiplier: '5',
  subtitle: 'the cost of your membership every month',
};

export const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

// ─── non-member landing (prod) ─────────────────────────────────────────────
/**
 * Non-member landing as shipped in prod (Figma Af34gfmhQ1D0wstXUEHSIF · 24:2604). Kept CMS-shaped: an ordered list of
 * landingV2.cms.data modules, each rendered by NpModuleRenderer (port of VIPModuleRenderer). Copy is the Figma copy
 * (sentence / title case as in the frame); amounts use the dirham sign. MAPPING.md › Non-member landing.
 */
export type NpAction = { route: string; params?: Record<string, unknown> } | { cta: '/create' };

export interface NpValueProp {
  title: string;
  description: string;
  /** leadingIconUrl (sparkle) is the same for every row */
  icon?: 'gift' | 'osn' | 'coupon';
  /** mpIcons: VIP_BENEFITS_MODULE mpIcons (35px circles, overlapping) */
  mpIcons?: ('noon' | 'food' | 'supermall' | 'nownow' | 'minutes')[];
}

export type NpTileId = 'noon' | 'food' | 'supermall' | 'nownow' | 'minutes';
export interface NpMpBenefit {
  id: NpTileId;
  title: string;
  subtitle: string;
}

export interface NpVideoBanner {
  title: string;
  subTitle: string;
  buttonText: string;
  cta: '/create';
  /** server video / poster — none in the frame ("Replace this"); set to preview one */
  videoUrl?: string;
  placeholderUrl?: string;
}

export interface NpPartnerBanner {
  id: 'fab' | 'stc';
  title: [string, string];
  durationText: string;
  buttonText: string;
  action: NpAction;
}

export interface NpOfferData {
  title: string;
  subtitle: string;
  /** subtitleIconUrl / tag.iconUrl stand-ins (kit vip/gift.svg, vip/star.svg, tinted) */
  subtitleIcon: 'gift';
  borderColors: string[];
  tag: { text: string; textColor: string; backgroundColor: string; borderColors: string[]; icon: 'sparkle' };
}

export type NpModule =
  | { type: 'VIP_MEMBERSHIP_OVERVIEW_MODULE'; showDefault: true; title: string; subtitle: string }
  | { type: 'VIP_BENEFITS_MODULE'; benefits: NpValueProp[]; footer: { text: string } }
  | { type: 'VIP_MARKETPLACE_BENEFITS_CAROUSEL_MODULE'; mpId: NpTileId; mpBenefits: NpMpBenefit[] }
  | { type: 'VIP_VIDEO_MODULE_CAROUSEL'; banners: NpVideoBanner[] }
  | { type: 'VIP_BANNER_MODULE_CAROUSEL'; title: string; banners: NpPartnerBanner[] }
  | { type: 'VIP_COUPON_ENTRY'; title: string; actionText: string; action: NpAction }
  | { type: 'VIP_EXPANDABLE_TEXT_MODULE'; title: string; collapsible: boolean; rows: { header: string; body: string }[] }
  /** VIPOfferPlanModuleDataType.offerData (colours are server hex on master → flow tokens here) */
  | { type: 'VIP_OFFER_PLAN_MODULE'; offerData: NpOfferData }
  /** VIP_SAVINGS_BREAKDOWN_MODULE → VIPSavingsOverviewModule (V1) savingsData, non-'new' customerState (overview variant) */
  | { type: 'VIP_SAVINGS_BREAKDOWN_MODULE'; savingsData: { customerState: string; title: string; savingsText: string; savingsMultiplier?: string; subtitle: string } };

export const npLanding: { modules: NpModule[]; buttonText: string; viewPlans: { title: string; cta: string }; flyout: FlyoutData } = {
  /** Sticky CTA as live in prod (screenshot 2026-10-13; Figma 24:2745 had "Start Free Trial"); plan.buttonText when not trial-eligible */
  buttonText: 'Start your 15 days trial',
  /** landingV2.viewPlansButton (prod copy) */
  viewPlans: { title: 'View other plans', cta: '/plan-select' },
  /** landingV2.offerFlyout */
  flyout: offerFlyout,
  modules: [
    // Header 24:2637 — VIPMembershipOverviewModule showDefault (vip_one_landing_title; subtitle as in the frame)
    { type: 'VIP_MEMBERSHIP_OVERVIEW_MODULE', showDefault: true, title: 'Free Delivery', subtitle: 'on everything, anytime' },
    // Prod screenshot (not in frame 24:2604): offer plan card, then savings overview — placed after the header
    {
      type: 'VIP_OFFER_PLAN_MODULE',
      offerData: {
        title: '<p><b>Get One at 20% Off</b></p>',
        subtitle: `<p>${CURRENCY} 19.00/month for 2 month, then at ${CURRENCY} 24.99</p>`,
        subtitleIcon: 'gift',
        borderColors: ['var(--nk-color-vip-np-offer-border)', 'var(--nk-palette-white)'],
        tag: {
          text: '<p>15 days free trial</p>',
          textColor: 'var(--nk-color-best-price-ink)',
          backgroundColor: 'var(--nk-color-vip-np-offer-tag-bg)',
          borderColors: ['var(--nk-color-vip-np-offer-tag-border)', 'var(--nk-color-vip-np-offer-tag-border-to)'],
          icon: 'sparkle',
        },
      },
    },
    {
      type: 'VIP_SAVINGS_BREAKDOWN_MODULE',
      savingsData: {
        customerState: 'potential',
        title: 'ON AVERAGE, USERS LIKE YOU',
        // the non-'new' branch prints savingsText as-is (no {multiplier} split), so the server sends the final copy
        savingsText: 'Save 6x',
        savingsMultiplier: '6x',
        subtitle: `of the membership price, worth ${CURRENCY} 928/year`,
      },
    },
    // Value props 24:2627
    {
      type: 'VIP_BENEFITS_MODULE',
      benefits: [
        { title: 'Try for FREE, then decide', description: 'Risk free, you can cancel anytime', icon: 'gift' },
        { title: 'Unlimited Free Delivery', description: 'On food, groceries, & shopping', mpIcons: ['noon', 'food', 'supermall', 'nownow', 'minutes'] },
        { title: 'OSN+ Streaming Included', description: 'HBO, Discovery+ & family favourites', icon: 'osn' },
        { title: 'Member-Only Deals', description: 'Big savings, every month', icon: 'coupon' },
      ],
      footer: { text: 'Priority Support for One Customer' },
    },
    // Savings widget 24:2628 — highlighted mp first (the marketplace the user came from)
    {
      type: 'VIP_MARKETPLACE_BENEFITS_CAROUSEL_MODULE',
      mpId: 'noon',
      mpBenefits: [
        { id: 'noon', title: 'Free Same-Day Delivery', subtitle: `on orders above ${CURRENCY} 100 or ${CURRENCY} 50 for next-day delivery` },
        { id: 'nownow', title: 'Free Delivery in Minutes', subtitle: `on NowNow orders above ${CURRENCY} 30` },
        { id: 'minutes', title: 'Free 15-Minute Delivery', subtitle: `on Minutes groceries above ${CURRENCY} 25` },
        { id: 'supermall', title: 'Free Delivery on supermall', subtitle: `on premium brands above ${CURRENCY} 100` },
        { id: 'food', title: 'Free Food Delivery', subtitle: `on noon Food orders above ${CURRENCY} 30` },
      ],
    },
    // Streaming carousel 24:2629
    {
      type: 'VIP_VIDEO_MODULE_CAROUSEL',
      banners: [
        { title: 'Watch HBO & OSN+ Originals', subTitle: 'Original, award-winning dramas & blockbusters', buttonText: 'Start 15-days trial', cta: '/create' },
        { title: 'Watch HBO & OSN+ Originals', subTitle: 'Original, award-winning dramas & blockbusters', buttonText: 'Activate OSN+ Now', cta: '/create' },
      ],
    },
    // Partnerships 24:2632
    {
      type: 'VIP_BANNER_MODULE_CAROUSEL',
      title: 'Partnerships and Benefits',
      banners: [
        { id: 'fab', title: ['noon One', 'with FAB Z card'], durationText: '1 year free', buttonText: 'View now', action: { route: 'noonone/offers', params: { tab: 'bank' } } },
        { id: 'stc', title: ['noon One', 'with STC network'], durationText: '3 months free', buttonText: 'View now', action: { route: 'noonone/partnerOffer', params: { campaignCode: 'stc' } } },
      ],
    },
    // Coupon row 24:2635 — vip_have_coupon_code → VIPOffersOverlayScreen (voucher input)
    { type: 'VIP_COUPON_ENTRY', title: 'Have a coupon code?', actionText: 'Apply', action: { route: 'noonone/offers', params: { tab: 'vouchers' } } },
    // FAQ 24:2636 — VIPExpandableTextModule grouped, collapsible title
    {
      type: 'VIP_EXPANDABLE_TEXT_MODULE',
      title: 'Frequently asked question',
      collapsible: true,
      rows: [
        { header: 'What is noon One?', body: 'noon One is a membership that gives you unlimited free delivery across noon, Food, Minutes, NowNow and supermall, OSN+ streaming, member-only deals and priority support.' },
        { header: 'How much does noon One cost?', body: `noon One is ${CURRENCY} 25/month after your free trial. Duo and Family plans let you share every benefit with up to 4 members.` },
        { header: 'Do I get a free trial? If yes, What does it include?', body: "Yes. New members get a 30-day free trial with every noon One benefit. We'll remind you 2 days before it ends, and you can cancel anytime." },
        { header: 'What does free delivery on noon express include?', body: `Free same-day delivery on express orders above ${CURRENCY} 100, or free next-day delivery on orders above ${CURRENCY} 50.` },
      ],
    },
  ],
};
