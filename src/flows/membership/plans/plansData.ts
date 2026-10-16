import type { MembershipPlan, MembershipState } from '../../../kit/membership';
import type { MembershipManageState } from '../../../kit/membership';
import { CURRENCY, fmtDate, isFamilyPlan, money, perPeriod, planById, plans, t } from '../data';
import { familyBenefits, individualBenefits } from '../manageData';

/**
 * Plans area demo data — master: VIPService.getVIPTouchpoints('planUpgrade') → VIPPlanUpgradeResponseType
 * { currentPlan, upgradePlan, otherPlans: VIPPlanUpgradeCategoryType[], defaultPaymentDetails }, then
 * VIPPaymentService /payment-page → trialGuideData.reviewPage (review & confirm sheet) and
 * getVIPTouchpoints('availablePlans') for the legacy VIPChangePlanScreen. All server-driven; values are realistic
 * UAE demo values with the same plan codes / prices as data.ts `plans` and the noonone flow.
 */

type Full = MembershipState & MembershipManageState;

/** VIPSwitchPlanOverlayDataType */
export interface SwitchPlanData {
  headerIconUrl?: string;
  title: string;
  description: string;
  buttons: { cta: string; text: string }[];
}

/** VIPPlanUpgradeCategoryType (fields Plan.tsx [QuickPlanSelectV3, isUpgradeScreen] renders) */
export interface OtherPlan {
  planCode: string;
  title: string;
  monthlyPrice: string;
  description?: string;
  savingPct?: string;
  offerMessage?: string;
  benefitsV2?: { title: string }[];
  paymentTerms: string;
  buttonText?: string;
  switchPlanData?: SwitchPlanData;
  /** kit: when the change applies — 'now' (more seats, prorated today) or 'renewal' (next billing date) */
  applies: 'now' | 'renewal';
}

const switchToSmaller = (to: MembershipPlan): SwitchPlanData =>
  to.seats === 2
    ? {
        title: t('vip_switch_to_duo_title'),
        description: t('vip_switch_to_duo_body'),
        buttons: [
          { cta: '/dismiss', text: t('vip_keep_family_plan') },
          { cta: '/change', text: t('vip_switch_plan') },
        ],
      }
    : {
        title: 'Switch to the {plan_name}?',
        description: 'The individual plan covers only you. When you switch, all family members lose access to noon One benefits.',
        buttons: [
          { cta: '/dismiss', text: t('vip_keep_family_plan') },
          { cta: '/change', text: t('vip_switch_plan') },
        ],
      };

const benefitsFor = (p: MembershipPlan) =>
  p.seats >= 5
    ? [{ title: '<p>Free delivery for <b>you + 4</b> members</p>' }, { title: '<p>Each member gets <highlight>their own</highlight> benefits</p>' }]
    : p.seats === 2
      ? [{ title: '<p>Free delivery for <b>you + 1</b> member</p>' }, { title: '<p>Share all noon One benefits</p>' }]
      : p.period === 'yearly'
        ? [{ title: '<p>All noon One benefits for <b>12 months</b></p>' }, { title: '<p><highlight>2 months free</highlight> vs monthly</p>' }]
        : [{ title: '<p>All noon One benefits, billed monthly</p>' }, { title: '<p>Cancel anytime</p>' }];

const priceLine = (p: MembershipPlan) => (p.period === 'yearly' ? `${CURRENCY} ${(p.price / 12).toFixed(1)}/month` : `${CURRENCY} ${p.price}/month`);
const descriptionFor = (p: MembershipPlan) => (p.period === 'yearly' ? `<p><s>${CURRENCY} ${p.price * 1.2}</s> ${CURRENCY} ${p.price} billed yearly</p>` : '<p>Billed monthly</p>');
const titleFor = (p: MembershipPlan) => (p.seats >= 5 ? 'Family plan' : p.seats === 2 ? 'Duo plan' : p.period === 'yearly' ? 'Annual plan' : 'Individual plan');
const periodTitle = (p: MembershipPlan) => `${titleFor(p)}${p.seats > 1 ? ` · ${p.period === 'yearly' ? 'Annual' : 'Monthly'}` : ''}`;

function toOther(p: MembershipPlan, current: MembershipPlan, renewsOn?: string): OtherPlan {
  const more = p.seats > current.seats;
  const smaller = p.seats < current.seats;
  const applies: OtherPlan['applies'] = more ? 'now' : 'renewal';
  const paymentTerms = more
    ? `<p>Your ${titleFor(p)} starts <b>today</b>. You'll be charged <b>${perPeriod(p)}</b> from now on, minus the unused part of your current plan. Cancel anytime.</p>`
    : `<p>Your current plan stays active until <b>${fmtDate(renewsOn)}</b>. From then you'll be charged <b>${perPeriod(p)}</b>. Cancel anytime.</p>`;
  return {
    planCode: p.id,
    title: periodTitle(p),
    monthlyPrice: priceLine(p),
    description: descriptionFor(p),
    savingPct: p.period === 'yearly' ? 'Save 17%' : undefined,
    benefitsV2: benefitsFor(p),
    paymentTerms,
    buttonText: more ? `Pay ${money(p.price)}` : _cap(t('vip_change_plan')),
    switchPlanData: smaller ? switchToSmaller(p) : undefined,
    applies,
  };
}
const _cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

/** VIPPlanUpgradeResponseType for the current store state */
export function buildPlanUpgrade(s: Full) {
  const current = s.plan ?? plans.monthly;
  const family = isFamilyPlan(current);
  const options: MembershipPlan[] = family
    ? [current, plans.monthly, plans.duoMonthly, current.period === 'yearly' ? plans.familyMonthly : plans.familyAnnual]
    : [current, current.period === 'yearly' ? plans.monthly : plans.annual, plans.duoMonthly, plans.familyMonthly];
  return {
    currentPlan: {
      title: periodTitle(current),
      planCode: current.id,
      headerMessage: undefined as string | undefined,
      billingInfo: s.status === 'trial' ? `<p>Free trial ends on ${fmtDate(s.renewsOn)}</p>` : `<p>Renews on ${fmtDate(s.renewsOn)} · ${perPeriod(current)}</p>`,
      benefits: family ? familyBenefits : individualBenefits,
    },
    otherPlans: options.map((p) => toOther(p, current, s.renewsOn)),
  };
}

export const planFromCode = (code?: string) => planById(code);

/** /payment-page reviewPage (CancelMembershipV2ReviewCancelUpgradePageType, confirmMode 'change-plan') */
export const reviewPageFor = (o: OtherPlan) => ({
  title: t('vip_review_confirm'),
  subTitle: o.paymentTerms,
  planCode: o.planCode,
  buttons: [{ cta: '/change', text: o.buttonText ?? _cap(t('vip_change_plan')) }],
});

/** success copy sent back through VIPEventEmitter.vipMembershipChanged (server title / subTitle) */
export const successCopy = (o: OtherPlan, p: MembershipPlan, renewsOn?: string) =>
  o.applies === 'now'
    ? { title: 'Plan upgraded', subtitle: `You're now on the ${titleFor(p)}` }
    : { title: 'Plan change scheduled', subtitle: `Your ${titleFor(p)} starts on ${fmtDate(renewsOn)}` };

// ── VIPChangePlanScreen (availablePlans) ───────────────────────────────────────────────────────────────────────
/** AvailablePlansTouchpointPlanType — bannerConfig.imageUrl is a server banner; the kit draws it (see ChangePlanScreen). */
export interface AvailablePlan {
  planCode: string;
  isSubscribed: boolean;
  isTrialValid: boolean;
  buttonText: string;
  footerNote?: string;
  bannerConfig: { aspectRatio: number; collapsedPct: number };
}
export function buildAvailablePlans(s: Full) {
  const current = s.plan ?? plans.monthly;
  const list = [current, ...[plans.monthly, plans.annual, plans.familyMonthly].filter((p) => p.id !== current.id)];
  return {
    note: 'Prices include VAT. Plan changes apply from your next billing date.',
    disclaimer: 'Your new plan will start after your current billing period',
    plans: list.map<AvailablePlan>((p) => ({
      planCode: p.id,
      isSubscribed: p.id === current.id,
      isTrialValid: false,
      buttonText: p.id === current.id ? 'Current plan' : `Switch to ${titleFor(p).toLowerCase()}`,
      footerNote: p.id === current.id ? undefined : `You'll be charged ${perPeriod(p)} from ${fmtDate(s.renewsOn)}`,
      bannerConfig: { aspectRatio: 58, collapsedPct: 0.42 },
    })),
    buttons: [
      { cta: '/create', text: 'Change plan' },
      { cta: '/cancel', text: 'Cancel membership', color: 'transparent', textColor: 'var(--nk-color-text-primary)', borderColor: 'var(--nk-color-border)' },
    ],
    referralPrompt: 'Have a referral code?',
  };
}
export const bannerFor = (code: string) => {
  const p = planById(code) ?? plans.monthly;
  return { title: periodTitle(p), price: perPeriod(p), benefits: benefitsFor(p) };
};

// ── VIPInvoiceScreen (invoiceUrl PDF) ──────────────────────────────────────────────────────────────────────────
export function buildInvoice(s: Full) {
  const p = s.plan ?? plans.monthly;
  const end = s.renewsOn ? new Date(s.renewsOn) : new Date();
  const start = new Date(end);
  if (p.period === 'yearly') start.setFullYear(start.getFullYear() - 1);
  else start.setMonth(start.getMonth() - 1);
  const net = p.price / 1.05;
  return {
    number: 'NO1-AE-2026-0418231',
    issued: fmtDate(start.toISOString()),
    period: `${fmtDate(start.toISOString())} – ${fmtDate(new Date(end.getTime() - 864e5).toISOString())}`,
    seller: ['noon.com', 'noon One subscriptions', 'Dubai, United Arab Emirates'],
    plan: p.name,
    net: money(net),
    vat: money(p.price - net),
    total: money(p.price),
    card: s.paymentCard,
  };
}
