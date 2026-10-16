import { useEffect } from 'react';
import { useNav } from '../../../../kit/Navigator';
import { membershipStore, isNoonOneMember, noonOneJourneyActions, membershipEligibilityStore } from '../../../../kit/membership';
import { defaultPlan, toMembershipPlan, withEligibility } from '../../data';
import { checkoutEnrollmentStore } from './checkoutEnrollment';

/**
 * NoonOrderConfirmationScreenV3: placeOrderResponse.enrollOneRequestStatus → openOneSubscriptionOverlay(status)
 * (noon.OCOneOverlayScreen). Kit: an order placed with the checkout noon One toggle on activates the monthly plan
 * (trial if eligible) and opens `noonone/ocOne` once over the confirmation.
 */
export function useOcOneOverlay() {
  const nav = useNav();
  useEffect(() => {
    const { enrolled } = checkoutEnrollmentStore.get();
    if (!enrolled) return;
    checkoutEnrollmentStore.patch({ enrolled: false, orderStatus: 'succeeded' });
    if (!isNoonOneMember(membershipStore.get())) {
      const plan = withEligibility(defaultPlan, membershipEligibilityStore.get().trialEligible);
      noonOneJourneyActions.subscribe(toMembershipPlan(plan), { trial: plan.isTrialValid });
    }
    const id = setTimeout(() => nav.push('noonone/ocOne', { status: 'succeeded' }), 900);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
