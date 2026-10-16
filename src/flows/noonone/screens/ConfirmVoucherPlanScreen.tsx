import { useState } from 'react';
import { HtmlText } from '../../../components';
import { useNav } from '../../../kit/Navigator';
import giftIcon from '@assets/vip/gift.svg';
import percentBadge from '@assets/vip/percent-badge.svg';
import { VIPOverlay, useVipOverlay } from '../components/VIPOverlay';
import { SubscribeButton } from '../components/offers/SubscribeButton';
import { ChevronLeft, VIPDashedBorder } from '../components/offers/Primitives';
import { oneColorIcon, voucherPlans, type VoucherCode } from '../data.offers';
import { completeSubscription, useNoonone } from '../store';
import { offersTokens as T } from '../tokens';
import styles from './ConfirmVoucherPlanScreen.module.css';

type Params = { offer?: VoucherCode; code?: string };

function Content({ params }: { params: Params }) {
  const nav = useNav();
  const { close } = useVipOverlay();
  const payment = useNoonone((s) => s.paymentMethod);
  const [loading, setLoading] = useState(false);
  const plan = voucherPlans[params.offer ?? 'ONE3FOR1'] ?? voucherPlans.ONE3FOR1;
  const { monthlyPrice, description, savingPct, title, paymentTerms, trialMessage, reminderMessage } = plan;
  const voucherCode = params.code;

  // useVIPQuickPayment.handlePayment → createSubscription with the saved card (demo round-trip)
  const subscribe = () => {
    setLoading(true);
    setTimeout(() => completeSubscription(nav, plan), T.apiMs);
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.headerRow}>
          {/* onBackPress → close + reopen the offers overlay */}
          <button type="button" className={`nk-pressable ${styles.backButton}`} onClick={() => close(() => nav.push('noonone/offers'))}>
            <span className={styles.backIcon}>
              <ChevronLeft width={7} height={14} />
            </span>
          </button>
          <span className={styles.header}>Review and confirm</span>
        </div>

        <div>
          <div className={styles.planCard}>
            <div className={styles.planHeader}>
              <span className={styles.planTitle}>{title}</span>
            </div>
            {!!trialMessage && (
              <div className={styles.planContent}>
                <span className={styles.planImageBox}>
                  <img src={giftIcon} width={27} height={27} alt="" />
                </span>
                <div className={styles.planDetails}>
                  <div className={styles.priceRow}>
                    <span className={styles.monthlyPrice}>{trialMessage}</span>
                  </div>
                  {!!reminderMessage && <HtmlText value={reminderMessage} className={styles.description} />}
                </div>
                <VIPDashedBorder className={styles.dashed} strokeWidth={4} strokeSpacing={8} color="var(--nk-color-bg-page)" />
              </div>
            )}
            <div className={styles.planContent}>
              <span className={styles.planImageBox}>
                <img className={styles.planImage} src={oneColorIcon} alt="" />
              </span>
              <div className={styles.planDetails}>
                <div className={styles.priceRow}>
                  <span className={styles.monthlyPrice}>{monthlyPrice.replace(/<br>|<\/?b>/g, '')}</span>
                  {!!savingPct && (
                    <span className={styles.savings}>
                      <span className={styles.savingsText}>{savingPct}</span>
                    </span>
                  )}
                </div>
                {!!description && <HtmlText value={description} className={styles.description} />}
              </div>
              <VIPDashedBorder className={styles.dashed} strokeWidth={4} strokeSpacing={8} color="var(--nk-color-bg-page)" />
            </div>
          </div>
          {!!voucherCode && (
            <div className={styles.appliedStrip}>
              <img src={percentBadge} width={20} height={20} alt="" />
              <span className={styles.appliedText}>{voucherCode} applied</span>
            </div>
          )}
        </div>

        <div className={styles.terms}>
          <HtmlText value={paymentTerms} className={styles.termsText} />
        </div>
      </div>

      <div className={styles.buttonContainer}>
        <SubscribeButton
          title="Confirm"
          className={styles.button}
          textClassName={styles.buttonText}
          loading={loading}
          payment={payment}
          onPaymentPress={() => close(() => nav.push('noonone/payment', { planCode: plan.planCode, voucherCode }))}
          onPress={subscribe}
        />
      </div>
    </div>
  );
}

/**
 * VIPConfirmVoucherPlanScreen — "Review and confirm" sheet opened after applying a voucher / bank offer in
 * VIPOffersOverlayScreen. Plan card (trial row + price row with dashed separators), "<CODE> applied" strip, payment terms,
 * VIPSubscriptionButtonV2 quick-subscribe with the saved card ("Pay with •••• 4242" → payment screen).
 */
export function ConfirmVoucherPlanScreen({ params }: { params: Params }) {
  return (
    <VIPOverlay sheetClassName={styles.sheet}>
      <Content params={params} />
    </VIPOverlay>
  );
}
