import type { FamilyMember, MembershipPlan, MembershipState } from '../../../kit/membership';
import type { MembershipManageState } from '../../../kit/membership';
import { ref } from '../../../foundations/tokens';
import { fmtDate, isFamilyPlan, memberSavingsText, money, ownerName, perPeriod, plans, t } from '../data';
import { icons } from '../assets';
import { mb } from '../tokens';

/**
 * Cancel membership V2 demo content. Master: VIPService.getVIPTouchpoints('cancelMembershipV2'[, { isCancelUpgrade }])
 * → { pages: [...] } and VIPService.getCancellationReasons() → { cancelReasons }. Both SERVER-DRIVEN (no fixtures in
 * bappzaar), so the copy below is realistic UAE demo content shaped like TouchpointsTypes.ts
 * (CancelMembershipV2*PageType, VIPUnusedSeats/PlanOption/CancelGroupSavings/LoseAccessWarning/LeaveFamilyOverlay
 * TouchpointType). Server colours (`backgroundColor`, `textColor` …) are given as kit token vars.
 */

export type CancelMode = 'cancel' | 'leave' | 'cancelUpgrade';
export type PageType =
  | 'benefits'
  | 'reminder'
  | 'survey'
  | 'discount-offer'
  | 'unused-seats'
  | 'plan-options'
  | 'group-savings'
  | 'lose-access'
  | 'leave-family'
  | 'review-cancel-upgrade';

/** VIPButtonType */
export interface CButton {
  cta: string;
  text: string;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  iconAfterTextUrl?: string;
  planCode?: string;
}
export interface Member {
  name: string;
  customerCode: string;
  savingsText?: string;
}
export interface Reminder {
  title: string;
  description: string;
  iconUrl?: string;
  titleColor?: string;
  textColor?: string;
  backgroundColor?: string;
}
export interface PlanOption {
  planCode: string;
  title: string;
  description?: string;
  monthlyPrice?: string;
  savingsAmount?: string;
  tag?: { text: string; textColor?: string; backgroundColor?: string; borderColors?: string[] };
  cta?: string;
  isSelected?: boolean;
  amount?: number;
  paymentTerms?: string;
  buttonText?: string;
}

interface Base {
  pageType: PageType;
  isOverlay?: boolean;
  title?: string;
  subTitle?: string;
  buttons?: CButton[];
}
export interface BenefitsPage extends Base {
  pageType: 'benefits';
  benefits: { title: string; description: string; iconUrl?: string; iconRatio?: number }[];
  unusedBenefits?: { title: string; description: string; iconUrl?: string; button?: CButton }[];
}
export interface ReminderPage extends Base {
  pageType: 'reminder';
  plan?: { title: string; billingInfo?: string };
  status?: { text: string; highlightColor?: string; backgroundColor?: string; borderColor?: string };
  reminder: { title: string; description: string; iconUrl?: string };
}
export interface SurveyPage extends Base {
  pageType: 'survey';
  tip?: string;
}
export interface OfferPage extends Base {
  pageType: 'discount-offer';
  offerCallout?: string;
  timedPlanData: {
    headerText: string;
    headerIconUrl?: string;
    plan: { planCode: string; title: string; monthlyPrice: string; description: string; savingPct?: string; paymentTerms: string; isTrialValid?: boolean };
    timer?: { textColor: string; backgroundColor: string };
  };
}
export interface UnusedSeatsPage extends Base {
  pageType: 'unused-seats';
  maxNumMembers: number;
  availableSeats: number;
  activeMembers: Member[];
  planOwner?: Member;
  reminder?: Reminder;
  backgroundColor?: string;
  titleColor?: string;
  textColor?: string;
}
export interface PlanOptionsPage extends Base {
  pageType: 'plan-options';
  planCode?: string;
  plan: PlanOption[];
  backgroundColor?: string;
  titleColor?: string;
  textColor?: string;
}
export interface GroupSavingsPage extends Base {
  pageType: 'group-savings';
  membersTitle: string;
  planOwner: Member;
  activeMembers: Member[];
  reminder?: Reminder;
  backgroundColor?: string;
  titleColor?: string;
  textColor?: string;
}
export interface LoseAccessPage extends Base {
  pageType: 'lose-access';
  currentPlan: { title: string; planCode: string; headerMessage?: string; maxNumMembers?: number; planOwner?: Member; activeMembers: Member[] };
  backgroundColor?: string;
  titleColor?: string;
  textColor?: string;
}
export interface LeaveFamilyPage extends Base {
  pageType: 'leave-family';
  headerIconUrl?: string;
  ownerName?: string;
}
export interface ReviewPage extends Base {
  pageType: 'review-cancel-upgrade';
  planCode?: string;
  titleColor?: string;
  textColor?: string;
  backgroundColor?: string;
}
export type CancelPage = BenefitsPage | ReminderPage | SurveyPage | OfferPage | UnusedSeatsPage | PlanOptionsPage | GroupSavingsPage | LoseAccessPage | LeaveFamilyPage | ReviewPage;

/** VIPCancelReasonType[] — getCancellationReasons */
export const cancelReasons = [
  { reasonCode: 'not_ordering_enough', text: "I don't order often enough" },
  { reasonCode: 'too_expensive', text: "It's too expensive for me" },
  { reasonCode: 'not_using_benefits', text: "I'm not using the benefits" },
  { reasonCode: 'delivery_experience', text: 'Delivery times were not as expected' },
  { reasonCode: 'switching_service', text: "I'm switching to another membership" },
  { reasonCode: 'other', text: 'Other', isCommentRequired: true },
];
export type CancelReason = (typeof cancelReasons)[number] & { isCommentRequired?: boolean };

type Full = MembershipState & MembershipManageState;

// server button presets (colours sent by the API — here as kit tokens)
const dark = { backgroundColor: ref.color('textStrong'), textColor: ref.color('textInverse'), borderColor: ref.color('textStrong') };
const light = { backgroundColor: ref.color('bgSurface'), textColor: ref.color('textStrong'), borderColor: ref.color('border') };

const toMember = (m: FamilyMember): Member => ({ name: m.name, customerCode: m.id, savingsText: memberSavingsText(m) });

const benefitsPage = (s: Full, mode: CancelMode): BenefitsPage => {
  const family = isFamilyPlan(s.plan);
  const leave = mode === 'leave';
  return {
    pageType: 'benefits',
    title: leave ? `<p>You've saved <highlight> ${s.savings}</highlight> on ${s.ownerName}'s plan</p>` : `<p>You've saved <highlight> ${s.savings}</highlight> with noon One</p>`,
    subTitle: leave ? "<p>Here's what you'll lose when you leave the Family plan</p>" : `<p>Here's what ${family ? 'your family' : 'you'} will miss out on if you cancel</p>`,
    benefits: [
      { title: 'Free deliveries', description: '<p>42 orders</p>', iconUrl: icons.checkWavy },
      { title: 'Delivery fees saved', description: `<p> ${Math.round(s.savings * 0.6)}</p>`, iconUrl: icons.percentBadge },
      { title: 'Cashback earned', description: `<p> ${Math.round(s.savings * 0.4)}</p>`, iconUrl: icons.gift },
    ],
    unusedBenefits: leave
      ? undefined
      : [{ title: "You haven't tried yet", description: 'Free delivery on noon Minutes in 15 mins', iconUrl: icons.stopwatch, button: { cta: '/minutes', text: 'Try now' } }],
    buttons: [
      { cta: '/exit', text: t('vip_keep_membership'), ...dark },
      { cta: '/continue', text: leave ? 'Continue to leave' : 'Continue to cancel', ...light },
    ],
  };
};

const surveyPage = (mode: CancelMode): SurveyPage => ({
  pageType: 'survey',
  title: mode === 'leave' ? '<p>Why are you leaving?</p>' : '<p>Why are you cancelling?</p>',
  subTitle: '<p>Your feedback helps us make noon One better</p>',
  tip: mode === 'leave' ? undefined : '<p><highlight>Tip:</highlight> switch to the Annual plan and save 17% instead of cancelling.</p>',
  buttons: [
    { cta: '/exit', text: t('vip_keep_membership'), ...dark },
    { cta: '/cancel-membership', text: mode === 'leave' ? t('vip_leave_family_plan') : 'Cancel membership', ...light },
  ],
});

const offerPage = (s: Full): OfferPage => {
  const p = s.plan ?? plans.monthly;
  const half = (p.price / 2).toFixed(2);
  return {
    pageType: 'discount-offer',
    title: '<p>Wait! Stay for <highlight>50% off</highlight></p>',
    subTitle: '<p>An exclusive offer, just for you. Keep every benefit and pay half for 3 months.</p>',
    offerCallout: 'No extra steps — applied to your next bill',
    timedPlanData: {
      headerText: t('vip_exclusive_offer'),
      plan: {
        planCode: `${p.id}_RETAIN50`,
        title: `${p.name} · Special offer`,
        monthlyPrice: ` ${half}/month`,
        description: `<p>for your next 3 months, then ${perPeriod(p)}. Cancel anytime.</p>`,
        savingPct: '50% off',
        paymentTerms: `<p>You'll be charged <b> ${half}/month</b> for 3 months starting ${fmtDate(s.renewsOn)}, then ${perPeriod(p)} until you cancel. <a href="https://www.noon.com/uae-en/noon-one-terms">Terms & Conditions</a> apply.</p>`,
      },
      timer: { textColor: ref.palette('sunsetOrange'), backgroundColor: ref.color('warningSurface') },
    },
    buttons: [
      { cta: '/accept-offer', text: 'Accept offer', backgroundColor: ref.color('bestPriceInk'), textColor: ref.color('textInverse'), borderColor: ref.color('bestPriceInk') },
      { cta: '/continue', text: 'No thanks, continue', ...light },
    ],
  };
};

const reminderPage = (s: Full): ReminderPage => {
  const days = Math.max(1, Math.round((new Date(s.renewsOn ?? Date.now()).getTime() - Date.now()) / 864e5));
  const p = s.plan ?? plans.monthly;
  return {
    pageType: 'reminder',
    isOverlay: true,
    title: `<p>Your free trial ends in <highlight>${days} days</highlight></p>`,
    subTitle: "<p>You won't be charged until then — keep enjoying free delivery on everything.</p>",
    plan: { title: p.name, billingInfo: `<p>Trial ends on <b>${fmtDate(s.renewsOn)}</b>, then ${perPeriod(p)}</p>` },
    status: { text: '<p><highlight>Free trial</highlight></p>', highlightColor: ref.color('bestPriceInk'), backgroundColor: mb.color('mbSuccessSurface'), borderColor: mb.color('mbLightGreen') },
    reminder: { title: 'Get a reminder', description: t('vip_reminder_description'), iconUrl: icons.reminderBell },
    buttons: [
      { cta: '/continue', text: t('vip_continue'), ...light },
      { cta: '/reminder', text: 'Remind me', ...dark },
    ],
  };
};

const ownerMember = (_s: Full): Member => ({ name: ownerName, customerCode: 'OWNER1', savingsText: ' 176' });

const unusedSeatsPage = (s: Full): UnusedSeatsPage => {
  const max = s.plan?.seats ?? 5;
  const available = Math.max(max - 1 - s.family.length, 0);
  return {
    pageType: 'unused-seats',
    isOverlay: true,
    title: `You still have ${available} free ${available === 1 ? 'seat' : 'seats'}`,
    subTitle: '<p>Add family members at no extra cost before you decide to cancel.</p>',
    maxNumMembers: max,
    availableSeats: available,
    planOwner: ownerMember(s),
    activeMembers: s.family.map(toMember),
    reminder: { title: 'Did you know?', description: '<p>Every member gets <b>free delivery</b> and all noon One benefits — on your plan.</p>' },
    buttons: [
      { cta: '/continue', text: t('vip_continue'), ...light },
      { cta: '/share-invite', text: t('vip_share'), ...dark, iconAfterTextUrl: icons.share },
    ],
  };
};

const planOptionsPage = (s: Full): PlanOptionsPage => {
  const option = (p: MembershipPlan, title: string, description: string, savings: string, isSelected = false): PlanOption => ({
    planCode: p.id,
    title,
    description,
    monthlyPrice: ` ${p.price}/month`,
    savingsAmount: savings,
    isSelected,
    amount: p.price,
    cta: '/change-plan',
    buttonText: `Pay ${money(p.price)}`,
    paymentTerms: `<p>Your <b>${p.name}</b> plan starts on <b>${fmtDate(s.renewsOn)}</b>. You'll be charged <b>${perPeriod(p)}</b> until you cancel. Your family members will lose access when you switch.</p>`,
  });
  return {
    pageType: 'plan-options',
    isOverlay: true,
    title: 'Switch instead of cancelling?',
    subTitle: '<p>Keep free delivery on a plan that fits you better.</p>',
    planCode: plans.duoMonthly.id,
    plan: [option(plans.duoMonthly, 'Duo', 'You + 1 member', 'Save  10', true), option(plans.monthly, 'Individual', 'Just for you', 'Save  20')],
    buttons: [
      { cta: '/continue', text: 'Cancel anyway', ...light },
      { cta: '/change-plan', text: t('vip_switch_plan'), ...dark },
    ],
  };
};

const groupSavingsPage = (s: Full): GroupSavingsPage => ({
  pageType: 'group-savings',
  isOverlay: true,
  title: `Your family saved  ${s.savings} together`,
  subTitle: '<p>Cancelling ends noon One for <b>everyone</b> on your Family plan.</p>',
  membersTitle: 'Savings by member',
  planOwner: ownerMember(s),
  activeMembers: s.family.map((m) => ({ ...toMember(m), savingsText: memberSavingsText(m).replace('Saved ', '') })),
  reminder: { title: 'Heads up', description: `<p>Members lose free delivery on <b>${fmtDate(s.renewsOn)}</b>.</p>` },
  buttons: [
    { cta: '/continue', text: t('vip_continue'), ...light },
    { cta: '/exit', text: t('vip_keep_membership'), ...dark },
  ],
});

const loseAccessPage = (s: Full): LoseAccessPage => ({
  pageType: 'lose-access',
  isOverlay: true,
  title: 'Everyone will lose access',
  subTitle: `<p>All <b>${s.family.length + 1} members</b> lose free delivery and member deals on <b>${fmtDate(s.renewsOn)}</b>.</p>`,
  currentPlan: {
    title: s.plan?.name ?? plans.familyMonthly.name,
    planCode: s.plan?.id ?? plans.familyMonthly.id,
    headerMessage: t('vip_current_plan'),
    maxNumMembers: s.plan?.seats ?? 5,
    planOwner: ownerMember(s),
    activeMembers: s.family.map(toMember),
  },
  buttons: [
    { cta: '/continue', text: t('vip_continue'), ...light },
    { cta: '/exit', text: t('vip_keep_membership'), ...dark },
  ],
});

const leaveFamilyPage = (s: Full): LeaveFamilyPage => ({
  pageType: 'leave-family',
  isOverlay: true,
  headerIconUrl: icons.userGroup,
  ownerName: s.ownerName,
  title: t('vip_leave_family_confirm_title', { name: s.ownerName ?? 'the owner' }),
  subTitle: t('vip_leave_family_confirm_description'),
  buttons: [
    { cta: '/stay', text: t('vip_leave_family_stay'), ...light },
    { cta: '/cancel-membership', text: t('vip_leave_family'), backgroundColor: ref.palette('dangerRed'), textColor: ref.color('textInverse'), borderColor: ref.palette('dangerRed') },
  ],
});

const reviewCancelUpgradePage = (s: Full): ReviewPage => ({
  pageType: 'review-cancel-upgrade',
  isOverlay: true,
  title: 'Cancel your plan change?',
  subTitle: `<p>You'll stay on <b>${s.plan?.name}</b> (${s.plan ? perPeriod(s.plan) : ''}). Your <b>${s.upcomingPlan?.name ?? 'new'}</b> plan scheduled for <b>${fmtDate(s.renewsOn)}</b> won't start.</p>`,
  planCode: s.plan?.id,
  buttons: [{ cta: '/cancelUpgrade', text: 'Confirm' }],
});

/** cancelMembershipV2.pages for the current membership + entry mode. */
export function buildCancelPages(s: Full, mode: CancelMode): CancelPage[] {
  if (mode === 'cancelUpgrade') return [reviewCancelUpgradePage(s)];
  if (mode === 'leave') return [benefitsPage(s, mode), surveyPage(mode), leaveFamilyPage(s)];
  if (isFamilyPlan(s.plan) && s.role !== 'member') {
    const max = s.plan?.seats ?? 5;
    const free = max - 1 - s.family.length > 0;
    return [...(free ? [unusedSeatsPage(s)] : []), planOptionsPage(s), groupSavingsPage(s), loseAccessPage(s), benefitsPage(s, mode), surveyPage(mode)];
  }
  if (s.status === 'trial') return [benefitsPage(s, mode), reminderPage(s), surveyPage(mode)];
  return [benefitsPage(s, mode), offerPage(s), surveyPage(mode)];
}

/** review overlay for plan-options '/change-plan' (payment-page `reviewPage` + buttonText) */
export const changePlanReviewPage = (_s: Full, option: PlanOption): ReviewPage => ({
  pageType: 'review-cancel-upgrade',
  isOverlay: true,
  title: t('vip_review_confirm'),
  subTitle: option.paymentTerms,
  planCode: option.planCode,
  buttons: [{ cta: '/change-plan', text: option.buttonText ?? `Pay ${money(option.amount ?? 0)}` }],
});

/** VIPService.cancelSubscription response { title, subTitle } */
export const cancelResult = (s: Full, mode: CancelMode) =>
  mode === 'leave'
    ? { title: 'You left the Family plan', subTitle: `You no longer have noon One benefits from ${s.ownerName}'s plan` }
    : mode === 'cancelUpgrade'
      ? { title: 'Plan change cancelled', subTitle: `You'll stay on ${s.plan?.name}` }
      : { title: 'Membership cancelled', subTitle: `You'll keep your benefits until ${fmtDate(s.renewsOn)}` };
