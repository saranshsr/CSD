import { createStore } from '../../kit/createStore';
import { membershipStore, noonOneJourneyActions } from '../../kit/membership';
import type { NavApi } from '../../kit/Navigator';
import { defaultPlan, savedCards, successMessage, toMembershipPlan, type VipCard, type VipPlan } from './data';

/**
 * Journey state shared between the noonone stack entries (landing → plans → payment → overlays are separate
 * entries). Mirrors bappzaar's vipPaymentDataReducer (selected payment, cvv, trial guide shown) and the
 * VIPEventEmitter.vipMembershipChanged → landing success animation hand-off.
 */
export interface NoononeState {
  /** plan carried through plans → payment (VIPPaymentV2Screen `plan` prop) */
  selectedPlan: VipPlan;
  /** vipPaymentDataReducer.selectedPaymentDetails — `applepay` / `boku` / saved card id / new card */
  paymentMethod: { type: 'card'; card: VipCard } | { type: 'applepay' } | { type: 'boku'; msisdn: string } | null;
  /** cards added through VIPAddCardOverlayScreen in this session */
  addedCards: VipCard[];
  /** useVIPQuickPayment.trialGuideShown (landing shows the plan-details sheet once) */
  trialGuideShown: boolean;
  /** voucher / referral / partner code applied via the offers overlay */
  voucherCode?: string;
  /** set by subscribe(); the landing consumes it and plays VIPTransitionAnim success */
  pendingSuccess?: { title: string; subtitle: string };
}

export const noononeStore = createStore<NoononeState>({
  selectedPlan: defaultPlan,
  paymentMethod: { type: 'card', card: savedCards[0] },
  addedCards: [],
  trialGuideShown: false,
});

export const useNoonone = noononeStore.useStore;

export const LANDING = 'noonone/landing';

/**
 * Navigator.popTo(rootComponentId) — pops back to the most recent landing entry (VIPPaymentV2Screen /
 * VIPQuickPlanSelectV3Screen success). Falls back to replacing the top with the landing.
 */
export function popToLanding(nav: Pick<NavApi, 'stack' | 'back' | 'replace'>) {
  const idx = nav.stack.map((e) => e.route).lastIndexOf(LANDING);
  if (idx < 0) {
    nav.replace(LANDING);
    return;
  }
  for (let i = nav.stack.length - 1; i > idx; i--) nav.back();
}

/**
 * Successful createSubscription: writes the shared membership store (flips every entry point to its subscribed
 * state), queues the landing success animation and pops back to the landing.
 */
export function completeSubscription(nav: Pick<NavApi, 'stack' | 'back' | 'replace'>, plan: VipPlan = noononeStore.get().selectedPlan) {
  const pm = noononeStore.get().paymentMethod;
  const card = pm?.type === 'card' ? { brand: pm.card.ccType, last4: pm.card.last4 } : membershipStore.get().paymentCard;
  noonOneJourneyActions.subscribe(toMembershipPlan(plan), { trial: plan.isTrialValid, card });
  noononeStore.patch({ pendingSuccess: successMessage(plan), selectedPlan: plan });
  popToLanding(nav);
}

/** VIPUtil.showLandingWithRedirect: push the landing, then (master: in useLayoutEffect) the redirect screen on top. */
export function showLandingWithRedirect(
  nav: Pick<NavApi, 'push'>,
  redirect?: { route: string; params?: Record<string, unknown> },
  { source = '/', animatePush = true }: { source?: string; animatePush?: boolean } = {},
) {
  nav.push(LANDING, { source, redirecting: !!redirect }, animatePush ? undefined : { transition: 'noonone-instant' });
  if (redirect) setTimeout(() => nav.push(redirect.route, redirect.params), 0);
}
