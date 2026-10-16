import { createStore } from './createStore';

/**
 * noon One membership — cross-flow state read by every noon One entry point (account card, cart upsell,
 * checkout section, PDP member badge…) and written by the noon One flows (`noonone` subscribe journey,
 * `membership` management). Mirrors bappzaar features/vip reducers/vip state at demo fidelity.
 *
 * Extend by APPENDING fields/actions; keep existing ones stable (several flows depend on them).
 */
export type MembershipStatus = 'none' | 'trial' | 'active' | 'cancelled';
export type PlanPeriod = 'monthly' | 'yearly';

export interface MembershipPlan {
  id: string;
  name: string;
  period: PlanPeriod;
  /** price per period, AED */
  price: number;
  /** family / group plan seat count (1 = individual) */
  seats: number;
}

export interface FamilyMember {
  id: string;
  name: string;
  phone?: string;
  status: 'invited' | 'joined';
}

export interface MembershipState {
  status: MembershipStatus;
  plan?: MembershipPlan;
  /** ISO date the current period renews / trial ends */
  renewsOn?: string;
  /** lifetime savings shown on account card / manage screen, AED */
  savings: number;
  /** is the user the owner of a family plan, or a member invited into someone else's */
  role: 'owner' | 'member';
  family: FamilyMember[];
  /** saved payment card used for the subscription (masked) */
  paymentCard?: { brand: 'visa' | 'mastercard' | 'amex' | 'mada'; last4: string };
}

export const membershipStore = createStore<MembershipState>({
  status: 'none',
  savings: 0,
  role: 'owner',
  family: [],
});

export const useMembership = membershipStore.useStore;

export const membershipActions = {
  subscribe(plan: MembershipPlan, opts: { trial?: boolean; card?: MembershipState['paymentCard'] } = {}) {
    const days = opts.trial ? 30 : plan.period === 'yearly' ? 365 : 30;
    membershipStore.patch({ status: opts.trial ? 'trial' : 'active', plan, renewsOn: new Date(Date.now() + days * 864e5).toISOString(), paymentCard: opts.card ?? membershipStore.get().paymentCard });
  },
  changePlan(plan: MembershipPlan) {
    membershipStore.patch({ plan });
  },
  cancel() {
    membershipStore.patch({ status: 'cancelled' });
  },
  reactivate() {
    membershipStore.patch((s) => ({ status: s.plan ? 'active' : 'none' }));
  },
  inviteMember(m: Omit<FamilyMember, 'status'>) {
    membershipStore.patch((s) => ({ family: [...s.family, { ...m, status: 'invited' }] }));
  },
  removeMember(id: string) {
    membershipStore.patch((s) => ({ family: s.family.filter((f) => f.id !== id) }));
  },
  leaveFamily() {
    membershipStore.patch({ status: 'none', plan: undefined, role: 'owner', family: [] });
  },
  /** demo helper: jump to a state from the playground / notes */
  demo(state: Partial<MembershipState>) {
    membershipStore.patch(state);
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Appended by the `membership` flow (noon One management). Existing fields/actions above are unchanged.
// ─────────────────────────────────────────────────────────────────────────────

/** Extra state used by the management screens (all optional, so existing writers keep working). */
export interface MembershipManageState {
  /** plan change scheduled for the next renewal (VIPPlanUpgradeResponseType.upgradePlan with isUpcoming) */
  upcomingPlan?: MembershipPlan;
  /** role 'member': the family-plan owner's display name */
  ownerName?: string;
  /** "Remind me" set on the cancel flow reminder page */
  reminderSet?: boolean;
  /** referral code applied from VIPReferralsInputOverlayScreen */
  referralCode?: string;
  /** ISO date the membership started (invoices / savings period) */
  memberSince?: string;
}

/** Read the management extras (typed view over the same store). */
export const useMembershipManage = () => membershipStore.useStore() as MembershipState & MembershipManageState;
const patchManage = (p: Partial<MembershipState & MembershipManageState> | ((s: MembershipState & MembershipManageState) => Partial<MembershipState & MembershipManageState>)) =>
  membershipStore.patch(p as Partial<MembershipState>);

export const membershipManageActions = {
  /** VIPUpgradePlanV2 / plan-options "/change-plan": new plan applies from the next billing date */
  scheduleUpgrade(plan: MembershipPlan) {
    patchManage({ upcomingPlan: plan });
  },
  /** Manage "/cancel-upgrade" (VIPService.cancelSubscription({ isCancelUpgrade: true })) */
  cancelUpgrade() {
    patchManage({ upcomingPlan: undefined });
  },
  setReminder(on: boolean) {
    patchManage({ reminderSet: on });
  },
  /** VIPPaymentV2Screen isUpdatePayment → VIPEventEmitter.vipPaymentChanged */
  updatePaymentCard(card: MembershipState['paymentCard']) {
    patchManage({ paymentCard: card });
  },
  applyReferral(code: string) {
    patchManage({ referralCode: code });
  },
  /** invited family member accepted the invite */
  memberJoined(id: string) {
    patchManage((s) => ({ family: s.family.map((f) => (f.id === id ? { ...f, status: 'joined' as const } : f)) }));
  },
};

// ── appended by the noonone (subscribe journey) flow ─────────────────────────────────────────────────────────────

/**
 * loyalty.membership.isEligibleForTrialAcrossPlans — account strip shows "Start Trial" vs "Join Now", plans show
 * the free-trial CTA. Separate store so the MembershipState shape above stays untouched.
 */
export const membershipEligibilityStore = createStore<{ trialEligible: boolean }>({ trialEligible: true });
export const useMembershipEligibility = membershipEligibilityStore.useStore;

/** true while the user holds an active/trial noon One membership (loyalty.isNoonOneSubscribed) */
export const isNoonOneMember = (s: MembershipState) => s.status === 'active' || s.status === 'trial';
/** hook form of isNoonOneMember — every noon One entry point switches on this */
export const useIsNoonOneMember = () => membershipStore.useStore(isNoonOneMember);

export const noonOneJourneyActions = {
  /** createSubscription success from the noonone flow: membershipActions.subscribe + consume the trial eligibility */
  subscribe(plan: MembershipPlan, opts: { trial?: boolean; card?: MembershipState['paymentCard'] } = {}) {
    membershipActions.subscribe(plan, opts);
    if (opts.trial) membershipEligibilityStore.patch({ trialEligible: false });
  },
  /** playground/demo reset to a non-member who can still start a trial */
  resetToNonMember() {
    membershipStore.patch({ status: 'none', plan: undefined, renewsOn: undefined, savings: 0 });
    membershipEligibilityStore.patch({ trialEligible: true });
  },
};
