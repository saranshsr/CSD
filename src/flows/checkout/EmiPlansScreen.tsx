import { motion } from 'motion/react';
import { useState } from 'react';
import { Button } from '../../components';
import { useNav } from '../../kit/Navigator';
import { spring } from '../../motion/presets';
import { aed, emiPlansFor, paymentIcons, tp, type EmiPlan } from './data.payment';
import { PaymentCard } from './components/PaymentCard';
import { checkoutStore, useCheckout } from './store';
import { useCheckoutTotals } from './totals';
import styles from './emiPlans.module.css';

const PAY_IN_FULL = 'pay-in-full';

/**
 * NoonSalesEMIPlansOverlayScreen (BottomSheet on antiFlashWhite, dynamic ≤ 70%): sticky "Installment Plans
 * Available" header, the selected card (aliceBlue, #0076FF border) + the selected plan's terms, then
 * "Pay in Full" + the card's plans as radio rows; Confirm → setEMIPlan (null for pay in full).
 */
export function EmiPlansScreen() {
  const nav = useNav();
  const { cards, selectedCardId, emiPlanId } = useCheckout((s) => s);
  const { orderPaymentAmount } = useCheckoutTotals();
  const card = cards.find((c) => c.id === selectedCardId) ?? cards[0];
  const { plans } = emiPlansFor(card, orderPaymentAmount);
  const [selected, setSelected] = useState<string>(plans.some((p) => p.id === emiPlanId) ? (emiPlanId as string) : PAY_IN_FULL);
  const selectedPlan = plans.find((p) => p.id === selected);
  if (!card) return null;

  const all: (EmiPlan | null)[] = [null, ...plans];

  return (
    <div className={styles.sheet}>
      <div className={styles.header}>
        <span className={styles.title}>{tp.noon_installment_plans_available}</span>
      </div>
      <div className={styles.scroll}>
        <div className={styles.cardAndTerms}>
          <div className={styles.card}>
            <PaymentCard card={card} />
          </div>
          {!!selectedPlan?.terms.length && (
            <div className={styles.terms}>
              {selectedPlan.terms.map((term) => (
                <div key={term} className={styles.term}>
                  <img className={styles.infoCircle} src={paymentIcons.infoGray} alt="" />
                  <span className={styles.termText}>{term}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className={styles.plans}>
          {all.map((plan) => {
            const id = plan?.id ?? PAY_IN_FULL;
            const isSelected = id === selected;
            return (
              <motion.button
                key={id}
                type="button"
                className={`${styles.plan} ${isSelected ? styles.planSelected : ''}`}
                disabled={plan?.isDisabled}
                whileTap={plan?.isDisabled ? undefined : { scale: 0.98 }}
                transition={spring.press}
                onClick={() => setSelected(id)}
              >
                <img className={styles.radio} src={isSelected ? paymentIcons.radioChecked : paymentIcons.radioUnchecked} alt="" />
                <span className={styles.planContent}>
                  {plan ? (
                    <>
                      <span className={`${styles.tenure} ${plan.isDisabled ? styles.tenureDisabled : ''}`}>{`${plan.tenure}, ${plan.installment}`}</span>
                      <span className={`${styles.fee} ${plan.isDisabled ? styles.feeError : ''}`}>
                        {plan.isDisabled ? plan.disabledMessage : `${plan.interestPercentage}${tp.noon_interest}${tp.noon_comma} ${plan.fee}`}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className={styles.tenure}>{`${tp.noon_pay_in_full} ${aed(orderPaymentAmount)}`}</span>
                      <span className={styles.fee}>{tp.noon_free}</span>
                    </>
                  )}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
      <div className={styles.buttonContainer}>
        <Button
          variant="noon"
          block
          titleCase
          onClick={() => {
            nav.back();
            checkoutStore.update({ emiPlanId: selected === PAY_IN_FULL ? null : selected });
          }}
        >
          {tp.noon_confirm}
        </Button>
      </div>
    </div>
  );
}
