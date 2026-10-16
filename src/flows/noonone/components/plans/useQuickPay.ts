import { useCallback, useEffect, useRef, useState } from 'react';
import { useNav } from '../../../../kit/Navigator';
import type { VipPlan } from '../../data';
import { completeSubscription, noononeStore } from '../../store';

/** demo createSubscription round-trip (master: VIPPaymentService.createSubscription → poll intent status) */
export const QUICK_PAY_MS = 1200;

/**
 * useVIPQuickPayment.handlePayment at demo fidelity: with a saved payment method the subscription is created in
 * place (button loader), then `completeSubscription` writes the membership store and pops to the landing, which
 * plays the success animation. Without one, master pushes VIPPaymentV2Screen.
 */
export function useQuickPay() {
  const nav = useNav();
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const pay = useCallback(
    (plan: VipPlan) => {
      noononeStore.patch({ selectedPlan: plan });
      if (!noononeStore.get().paymentMethod) {
        nav.push('noonone/payment', { planCode: plan.planCode });
        return;
      }
      setLoading(true);
      timer.current = setTimeout(() => completeSubscription(nav, plan), QUICK_PAY_MS);
    },
    [nav],
  );

  return { pay, loading };
}
