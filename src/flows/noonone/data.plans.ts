import bellIcon from '@assets/vip/reminder-bell.svg';
import userGroupIcon from '@assets/vip/user-group.svg';
import giftIcon from '@assets/vip/gift.svg';
import percentIcon from '@assets/vip/percent-badge.svg';
import shareIcon from '@assets/vip/share.svg';
import starIcon from '@assets/vip/star.svg';
import calendarIcon from '@assets/vip/calendar-check.svg';
import { CURRENCY, tiers, type VipPlan, type VipTierCode } from './data';

/**
 * Plans area demo content. All SERVER-DRIVEN on master: VIPService.getVIPTouchpoints('planSelectV2') (tiers →
 * VIPPlanSelectTierType), useVIPQuickPayment trialGuideData (VIPTrialGuideDataType: planSelect / landing / rows),
 * getVIPTouchpoints('familyPlans') and 'planOptionOverlay'. No fixtures exist in bappzaar — realistic UAE values.
 * Copy keys used on the client are in mapping/plans.md.
 */

/** VIPPlanSelectPlanType fields the V3 cards render on top of the shared VipPlan */
export interface V3Plan extends VipPlan {
  /** `trialMessage` / `offerMessage` badge html (bold tag = 600) */
  badge?: string;
  /** VIPPlanSelectPlanType.description html */
  descriptionHtml?: string;
  benefitsV2: { title: string }[];
  /** bundle component tile image (server CDN) */
  planImage?: string;
  /** bundle tile: VIPPlanSelectPlanType.bundleTag html */
  bundleTagHtml?: string;
}

export interface V3Bundle {
  isBundleComponent: true;
  planCode: string;
  title: string;
  plans: V3Plan[];
}

export interface V3Tier {
  tierCode: VipTierCode;
  name: string;
  discountTag?: string;
  plans: (V3Plan | V3Bundle)[];
}

export const isBundle = (p: V3Plan | V3Bundle): p is V3Bundle => 'isBundleComponent' in p;

const benefits = [
  { title: '<b>Free</b> delivery on noon, Minutes & Food' },
  { title: 'Extra <highlight>5% cashback</highlight> on every order' },
  { title: 'Members-only deals & early sale access' },
];

const byCode = (code: string) => tiers.flatMap((t) => t.plans).find((p) => p.planCode === code)!;
const badge = (p: VipPlan) => (p.isTrialValid ? `<p><bold>${p.trialDays} days free</bold>, then ${p.monthlyPrice}</p>` : undefined);

const individualMonthly: V3Plan = {
  ...byCode('ONE_MONTHLY'),
  title: 'Monthly',
  monthlyPrice: `${CURRENCY} 25/month`,
  descriptionHtml: '<p>Billed monthly, cancel anytime</p>',
  benefitsV2: benefits,
};
const individualAnnual: V3Plan = {
  ...byCode('ONE_ANNUAL'),
  title: 'Annual',
  monthlyPrice: `${CURRENCY} 250/year`,
  descriptionHtml: `<p>Just ${CURRENCY} 20.8/month, billed yearly</p>`,
  savingPct: 'Save 17%',
  benefitsV2: benefits,
};

/** One + streaming bundle (master: VIPPlanSelectBundlePlanType with partner plans, "Choose 1 of {{count}}:") */
const yango: V3Plan = {
  ...byCode('ONE_YANGO_MONTHLY'),
  title: 'Yango Play',
  monthlyPrice: `${CURRENCY} 39/month`,
  descriptionHtml: `<p><s>${CURRENCY} 54</s> ${CURRENCY} 39/month</p>`,
  savingPct: 'Save 28%',
  benefitsV2: [...benefits, { title: '<b>Yango Play</b> movies, series & music' }],
  bundleTagHtml: `<p><b>+${CURRENCY} 100</b> noon credits</p>`,
};
const osn: V3Plan = {
  ...yango,
  planCode: 'ONE_OSN_MONTHLY',
  title: 'OSN+',
  amount: 45,
  monthlyPrice: `${CURRENCY} 45/month`,
  descriptionHtml: `<p><s>${CURRENCY} 60</s> ${CURRENCY} 45/month</p>`,
  savingPct: 'Save 25%',
  partnerDetails: { name: 'OSN+' },
  bundleTag: 'OSN+',
  benefitsV2: [...benefits, { title: '<b>OSN+</b> HBO, Paramount+ & more' }],
  bundleTagHtml: undefined,
};

/** planSelectV2.tiers as live in prod (screenshot 2026-10-13): "One Bundle" | "One Standard", no discount tag; defaultTierCode = individual */
export const v3Tiers: V3Tier[] = [
  {
    tierCode: 'yango',
    name: 'One Bundle',
    plans: [{ isBundleComponent: true, planCode: 'ONE_BUNDLE', title: 'noon One + Streaming', plans: [yango, osn] }],
  },
  { tierCode: 'individual', name: 'One Standard', plans: [individualMonthly, individualAnnual] },
];

export const v3AllPlans: V3Plan[] = v3Tiers.flatMap((t) => t.plans.flatMap((p) => (isBundle(p) ? p.plans : [p])));
export const findV3Plan = (code?: string) => v3AllPlans.find((p) => p.planCode === code);
export const withBadge = (p: V3Plan): V3Plan => ({ ...p, badge: badge(p) });

/** VIPTrialGuideDataType (useVIPQuickPayment → VIPService trial guide touchpoint) */
export const trialGuideData = {
  entryText: '<p>How does the <b>free trial</b> work?</p>',
  title: 'How your free trial works',
  buttonText: '',
  rows: [
    { timeTitle: 'TODAY', timeValue: '1', title: 'Your free trial starts', subtitle: 'Enjoy free delivery, cashback and member deals' },
    { timeTitle: 'DAY', timeValue: '28', title: "We'll remind you", subtitle: "You'll get a reminder 2 days before your trial ends" },
    { timeTitle: 'DAY', timeValue: '30', title: 'Your membership starts', subtitle: `You'll be charged ${CURRENCY} 25/month. Cancel anytime` },
  ],
  /** VIPQuickPlanSelectV3Screen handleButtonPress → VIPUtil.showInfoOverlay */
  planSelect: {
    title: 'Review your plan',
    /** server text is per selected plan */
    text: (p: { amount: number; period: 'monthly' | 'yearly'; isTrialValid: boolean; trialDays: number }) =>
      p.isTrialValid
        ? `<p>Your free trial starts today. After ${p.trialDays} days you'll be charged <b>${CURRENCY} ${p.amount}/${p.period === 'yearly' ? 'year' : 'month'}</b> unless you cancel. Cancel anytime from Manage membership.</p>`
        : `<p>You'll be charged <b>${CURRENCY} ${p.amount}/${p.period === 'yearly' ? 'year' : 'month'}</b> today. Cancel anytime from Manage membership.</p>`,
    reminder: { iconUrl: bellIcon, title: 'Reminder', description: "We'll remind you 2 days before your trial ends" },
  },
  /** VIPLandingScreen → VIPPopupUtil.showPlanDetailDialog (VIPPlanDetailsPopup, REGULAR) */
  landing: {
    title: 'Start your free trial',
    subTitle: '<p>Get <highlight>30 days free</highlight>, cancel anytime</p>',
    text: `<p>We'll charge <b>${CURRENCY} 25/month</b> after your trial ends. You can cancel anytime before your next billing date.</p>`,
    reminder: { iconUrl: bellIcon, title: 'Reminder', description: "We'll remind you 2 days before your trial ends" },
  },
};

/** VIPFamilyPlansScreen → getVIPTouchpoints('familyPlans') (FamilyPlansTouchpointType) */
const duo = byCode('ONE_DUO_MONTHLY');
const family = byCode('ONE_FAMILY_MONTHLY');
export const familyPlansData = {
  plans: [
    { ...duo, title: 'Duo', monthlyPrice: `<p>${CURRENCY} 35<small>/mo</small></p>`, descriptionHtml: `<p>Just <b>${CURRENCY} 10</b> more than Individual</p>`, buttonText: 'Try Duo free' },
    { ...family, title: 'Family', monthlyPrice: `<p>${CURRENCY} 45<small>/mo</small></p>`, descriptionHtml: `<p>Just <b>${CURRENCY} 9</b> per member</p>`, buttonText: 'Try Family free', isDefaultForCheckout: true },
  ],
  benefitsSection: {
    headerIcon: starIcon,
    headerText: 'Everyone gets the full noon One',
    benefits: [
      { title: 'Free delivery for everyone', description: 'Each member gets unlimited free delivery on noon, Minutes & Food', iconUrl: giftIcon },
      { title: 'Their own cashback', description: 'Every member earns 5% cashback on their own orders', iconUrl: percentIcon },
      { title: 'Separate accounts', description: 'Orders, addresses and payment stay private to each member', iconUrl: userGroupIcon },
    ],
  },
  stepsSection: {
    headerIcon: calendarIcon,
    headerText: 'How it works',
    steps: [
      { title: 'Choose Duo or Family', description: 'Start with a free trial, cancel anytime' },
      { title: 'Invite your people', description: 'Share an invite link on WhatsApp or SMS' },
      { title: 'They join for free', description: 'Members enjoy every benefit as soon as they accept' },
    ],
  },
  shareSection: {
    headerIcon: shareIcon,
    headerText: 'Share the love',
    text: '<p>Invite up to 4 members once your plan is active</p>',
    button: { title: 'Share Invite' },
  },
  faqSection: {
    headerIcon: undefined as string | undefined,
    headerText: 'Frequently asked questions',
    rows: [
      { header: 'Who can I add to my plan?', body: 'Anyone with a noon account in the UAE. Duo covers you + 1 member, Family covers you + up to 4.' },
      { header: 'Do members pay anything?', body: 'No. Only the plan owner is charged. Members join for free.' },
      { header: 'Can I switch between Duo and Family?', body: 'Yes, you can switch plans anytime from Manage membership.' },
    ],
  },
  footerNote: `<p>Plans renew automatically. Prices include VAT. Terms & Conditions apply.</p>`,
  /** VIPFamilyPlanSheetType (plan.familyPlan) → VIPFamilyPlanDetailsPopup */
  familyPlanSheet: {
    title: 'Try 30 days free',
    subTitle: '<p>Then <highlight>{{price}}</highlight>. Cancel anytime</p>',
    text: '<p>Your members get access as soon as they accept your invite. You can remove members anytime.</p>',
    invoiceDetails: (p: VipPlan) => [
      { title: 'Due today', subtitle: '30-day free trial', value: `<p><highlight>${CURRENCY} 0</highlight></p>` },
      { title: 'From day 31', subtitle: 'Billed monthly', value: `<p>${CURRENCY} ${p.amount}</p>` },
    ],
  },
};

/** VIPPlanOptionOverlayTouchpointType (cancellation plan switch — management side, see mapping) */
export const planOptionData = {
  title: 'Switch instead of cancelling?',
  subTitle: "<p>Keep your benefits on a plan that suits you better. You won't be charged today.</p>",
  plan: [
    { planCode: 'ONE_ANNUAL', title: 'Annual', monthlyPrice: `${CURRENCY} 250/year`, description: `<p>${CURRENCY} 20.8/month</p>`, savingsAmount: 'Save 17%', isSelected: true },
    { planCode: 'ONE_MONTHLY', title: 'Monthly', monthlyPrice: `${CURRENCY} 25/month`, description: '<p>Cancel anytime</p>', tag: { text: 'Current plan' } },
  ],
  buttons: [
    { text: 'Continue', cta: '/continue', backgroundColor: undefined as string | undefined, textColor: 'var(--nk-palette-white)' },
  ],
};
