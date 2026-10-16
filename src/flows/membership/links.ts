import { noononeFlow } from '../noonone';

/**
 * Links from management into the ACQUISITION journey (flow `noonone`, owned by the other port). Master targets:
 *   payment   — noon.VIPPaymentV2Screen (VIPUtil.showChangePayment isUpdatePayment / VIPSubscriptionButtonV2 → reactivate)
 *   planSelect — noon.VIPQuickPlanSelectV3Screen (VIPUtil.showPlanSelectV2)
 *   addCard   — noon.VIPAddCardOverlayScreen
 *   landing   — noon.VIPLandingScreen (re-subscribe after cancel)
 * Resolves to the noonone screen when it is registered, else `noonone/landing`.
 */
export type AcquisitionTarget = 'payment' | 'planSelect' | 'addCard' | 'landing' | 'trialGuide';

const candidates: Record<AcquisitionTarget, string[]> = {
  payment: ['payment', 'paymentV2', 'pay'],
  planSelect: ['planSelect', 'plans', 'quickPlanSelect', 'planSelectV3'],
  addCard: ['addCard', 'add-card'],
  trialGuide: ['trialGuide'],
  landing: ['landing'],
};

const findId = (target: AcquisitionTarget) => {
  const ids = new Set(noononeFlow.screens.map((s) => s.id));
  return candidates[target].find((c) => ids.has(c));
};

export function acquisitionRoute(target: AcquisitionTarget): string {
  return `noonone/${findId(target) ?? 'landing'}`;
}

/** true when the acquisition flow has registered a screen for `target` (not just the landing fallback). */
export const hasAcquisition = (target: AcquisitionTarget) => target === 'landing' || findId(target) !== undefined;
