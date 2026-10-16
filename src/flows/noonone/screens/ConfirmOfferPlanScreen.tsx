import { useState } from 'react';
import { HtmlText } from '../../../components';
import { useNav } from '../../../kit/Navigator';
import { VIPOverlay, useVipOverlay } from '../components/VIPOverlay';
import { SubscribeButton } from '../components/offers/SubscribeButton';
import { oneColorIcon, voucherPlans, type VoucherCode } from '../data.offers';
import { completeSubscription, useNoonone } from '../store';
import { offersTokens as T } from '../tokens';
import styles from './ConfirmOfferPlanScreen.module.css';

type Params = { offer?: VoucherCode };

function Content({ params }: { params: Params }) {
  const nav = useNav();
  const { close } = useVipOverlay();
  const payment = useNoonone((s) => s.paymentMethod);
  const [loading, setLoading] = useState(false);
  const plan = voucherPlans[params.offer ?? 'ONE30'] ?? voucherPlans.ONE30;
  const { monthlyPrice, description, savingPct, title, paymentTerms } = plan;

  /** handlePayment: no saved card / verification → VIPPaymentV2Screen ("Confirm Membership"); else createSubscription */
  const onPress = () => {
    if (!payment) {
      close(() => nav.push('noonone/payment', { planCode: plan.planCode, buttonTitle: 'Confirm Membership' }));
      return;
    }
    setLoading(true);
    setTimeout(() => completeSubscription(nav, plan), T.apiMs);
  };

  return (
    <div className={styles.container}>
      <span className={styles.header}>Confirm your membership</span>
      <div className={styles.planCard}>
        <div className={styles.planHeader}>
          <span className={styles.planTitle}>{title}</span>
          <img className={styles.planImage} src={oneColorIcon} alt="" />
        </div>
        <div className={styles.priceRow}>
          <span className={styles.monthlyPrice}>{monthlyPrice.replace(/<br>|<\/?b>/g, '')}</span>
          {!!savingPct && (
            <span className={styles.savings}>
              <span className={styles.savingsText}>{savingPct}</span>
            </span>
          )}
        </div>
        <HtmlText value={description} className={styles.description} />
      </div>
      <HtmlText value={paymentTerms} className={styles.terms} />
      <SubscribeButton title="Confirm Membership" className={styles.button} textClassName={styles.buttonText} loading={loading} onPress={onPress} />
    </div>
  );
}

/**
 * VIPConfirmOfferPlanScreen — "Confirm your membership" sheet for a retention / partner offer plan (master opens it from
 * VIPCancelMembershipV2Screen's offer step and partner flows). Quick-subscribes with the saved card, else pushes payment.
 */
export function ConfirmOfferPlanScreen({ params }: { params: Params }) {
  return (
    <VIPOverlay sheetClassName={styles.sheet}>
      <Content params={params} />
    </VIPOverlay>
  );
}
