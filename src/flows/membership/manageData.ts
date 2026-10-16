import type { FamilyMember, MembershipPlan, MembershipState } from '../../kit/membership';
import type { MembershipManageState } from '../../kit/membership';
import { fmtDate, isFamilyPlan, memberSavingsText, money, ownerName, perPeriod, t } from './data';

/**
 * VIPManageMembershipV3Screen data — master: VIPService.getVIPTouchpoints('manageMembershipV2,planUpgrade')
 * → { manageMembershipV2: ManageMembershipTouchpointType, planUpgrade: VIPPlanUpgradeResponseType }.
 * Built here from the shared membership store so every state (trial / active / cancelled / family owner / family
 * member / upcoming plan change) renders the way the server would send it.
 */

export interface VipButton {
  cta: string;
  text?: string;
  title?: string;
  subtitle?: string;
}

/** VIPPlanUpgradePlanType (subset rendered by Plan.tsx) */
export interface UpgradePlan {
  title: string;
  planCode: string;
  headerMessage?: string;
  billingInfo?: string;
  cta?: string;
  buttonText?: string;
  isUpcoming?: boolean;
  onTrialPeriod?: boolean;
  benefits?: { title: string }[];
  maxNumMembers?: number;
  isRemoveCtaVisible?: boolean;
  activeMembers?: (FamilyMember & { savingsText?: string })[];
}

export interface ManageData {
  headerTitle: string;
  currentPlan: UpgradePlan;
  upgradePlan?: UpgradePlan;
  buttons: VipButton[];
  familyMembersSection?: { title: string; subtitle?: string; ownerSavingsText?: string };
  ownerName: string;
}

/** benefits on the current plan card (server HTML: `<b>` uppercased semibold, `<highlight>` successTag) */
export const individualBenefits = [
  { title: '<p><b>Free</b> delivery on noon, Minutes & Food orders</p>' },
  { title: '<p><highlight>Extra 5% cashback</highlight> on noon Food</p>' },
  { title: '<p>Exclusive member deals & <b>early</b> sale access</p>' },
  { title: '<p>Priority customer support</p>' },
];
export const familyBenefits = [
  { title: '<p><b>Free</b> delivery for you + 4 family members</p>' },
  ...individualBenefits.slice(0, 3),
];

const planTitle = (p: MembershipPlan) => p.name;

export function buildManageData(s: MembershipState & MembershipManageState): ManageData {
  const plan = s.plan!;
  const family = isFamilyPlan(plan);
  const isMember = s.role === 'member';
  const isOwnerFamily = family && !isMember;
  const renews = fmtDate(s.renewsOn);

  let billingInfo: string;
  let cta: string | undefined;
  let buttonText: string | undefined;
  if (isMember) billingInfo = `<p>Shared with you by <b>${s.ownerName}</b> · Renews on ${renews}</p>`;
  else if (s.status === 'trial') billingInfo = `<p>Your free trial ends on <b>${renews}</b>. You'll be charged ${money(plan.price)} after that.</p>`;
  else if (s.status === 'cancelled') {
    billingInfo = `<p>Your membership ends on <b>${renews}</b>. You won't be charged again.</p>`;
    cta = '/reactivate';
    buttonText = t('vip_renew_membership');
  } else billingInfo = `<p>Next billing on <b>${renews}</b> · ${perPeriod(plan)}</p>`;

  const upcoming = s.upcomingPlan;
  const currentPlan: UpgradePlan = {
    title: planTitle(plan),
    planCode: plan.id,
    billingInfo,
    cta,
    buttonText,
    onTrialPeriod: s.status === 'trial',
    benefits: family ? familyBenefits : individualBenefits,
    maxNumMembers: plan.seats,
    isRemoveCtaVisible: isOwnerFamily,
    activeMembers: isOwnerFamily ? s.family.map((m) => ({ ...m, savingsText: memberSavingsText(m) })) : [],
  };

  const upgradePlan: UpgradePlan | undefined = upcoming
    ? {
        title: planTitle(upcoming),
        planCode: upcoming.id,
        isUpcoming: true,
        headerMessage: `<p>${t('vip_upcoming_plan')} · starts <highlight>${renews}</highlight></p>`,
        billingInfo: `<p>${t('vip_renewal_date', { date: renews })} You'll be charged ${perPeriod(upcoming)}.</p>`,
        cta: '/cancelUpgrade',
        buttonText: 'cancel plan change',
      }
    : undefined;

  const buttons: VipButton[] = [];
  if (isMember) {
    buttons.push({ cta: '/leave-family', text: t('vip_leave_family_plan'), subtitle: t('vip_leave_family_plan_subtitle') });
  } else {
    if (s.status !== 'cancelled') buttons.push({ cta: '/plan-upgrade', text: 'change plan' });
    buttons.push({ cta: '/update-payment', text: 'update payment method' });
    if (s.status !== 'trial') buttons.push({ cta: '/pdf-link', text: 'view invoice' });
    if (s.status !== 'cancelled') buttons.push({ cta: '/cancel', text: 'cancel membership' });
  }

  return {
    headerTitle: isOwnerFamily ? t('vip_manage_family_plan') : t('vip_manage_membership'),
    currentPlan,
    upgradePlan,
    buttons,
    familyMembersSection: isOwnerFamily
      ? { title: 'Family members', subtitle: `Share your benefits with up to ${plan.seats - 1} people`, ownerSavingsText: 'Saved AED 176' }
      : undefined,
    ownerName,
  };
}

