import { useState } from 'react';
import { HtmlText } from '../../../components';
import { ref } from '../../../foundations/tokens';
import { membershipActions, useMembershipManage } from '../../../kit/membership';
import { useNav } from '../../../kit/Navigator';
import { VipOverlay } from '../components/VipOverlay';
import { DashedLine } from '../components/primitives';
import { ownerName, plans } from '../data';
import { acquisitionRoute } from '../links';
import { membershipEvents, useEnsureMembership } from '../store';
import { PlanMembers, Reminder, SubscriptionButton } from './components';
import { familyPlansTouchpoint } from './familyData';
import styles from './family.module.css';

const hl = { highlight: { color: ref.color('success') } };

/**
 * VIPFamilyPlanDetailsPopup (VIPPopupUtil.showPlanDetailDialog type FAMILY_PLAN, isPopup false) — surfaceGrey sheet
 * (margin 12, radius 16): green title, subtitle, plan card with member seats + invoice rows, note, reminder,
 * separator and VIPSubscriptionButtonV2 (showPayment, quick subscribe). Confirm → plan switches, manage plays
 * VIPTransitionAnim (vipMembershipChanged with animation) and the family page pops back to manage.
 */
export function FamilyReviewOverlay({ params }: { params: { planCode?: string } }) {
  useEnsureMembership();
  const nav = useNav();
  const m = useMembershipManage();
  const plan = familyPlansTouchpoint.plans.find((p) => p.planCode === params.planCode) ?? familyPlansTouchpoint.plans[1];
  const sheet = plan.familyPlan;
  const [loading, setLoading] = useState(false);

  return (
    <VipOverlay className={styles.reviewSheet} canBeClosed={!loading} startY={600}>
      {({ close }) => (
        <div className={styles.review}>
          <div className={styles.reviewHeader}>
            <HtmlText value={sheet.title} className={styles.reviewTitle} />
            {sheet.subTitle && <HtmlText value={sheet.subTitle} className={styles.reviewSubtitle} stylesheet={hl} />}
          </div>
          <div className={styles.reviewCard}>
            <div className={styles.reviewCardTitleRow}>
              <span className={styles.reviewCardTitle}>{`noon One ${plan.title}`}</span>
              <span className={styles.reviewMembers}>
                <PlanMembers names={[ownerName.split(' ')[0]]} size={32} max={plan.maxNumMembers} overlap={12} />
              </span>
            </div>
            {sheet.invoiceDetails && (
              <div className={styles.reviewInvoice}>
                <DashedLine strokeWidth={3} strokeSpacing={5} />
                <div className={styles.reviewInvoiceRows}>
                  {sheet.invoiceDetails.map((row, i) => (
                    <div key={i} className={styles.reviewInvoiceRow}>
                      <span className={styles.reviewInvoiceText}>
                        <HtmlText value={row.title} className={styles.reviewInvoiceTitle} />
                        <HtmlText value={row.subtitle} className={styles.reviewInvoiceSubtitle} />
                      </span>
                      <HtmlText value={row.value} className={styles.reviewInvoiceValue} stylesheet={{ highlight: { color: ref.color('success'), fontWeight: 700 } }} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <HtmlText value={sheet.text} className={styles.reviewNote} />
          {sheet.reminder && <Reminder reminder={sheet.reminder} />}
          <div className={styles.reviewSeparator} />
          <div className={styles.reviewButtonWrap}>
            <SubscriptionButton
              title={plan.buttonText}
              card={m.paymentCard}
              loading={loading}
              onPaymentPress={() => close(() => nav.push(acquisitionRoute('payment'), { isUpdatePayment: true }))}
              onPress={() => {
                setLoading(true);
                window.setTimeout(() => {
                  membershipActions.changePlan(plans[plan.planKey]);
                  membershipEvents.membershipChanged(`Welcome to noon One ${plan.title}`, 'Share your invite to add members');
                  close(() => (nav.canGoBack ? nav.back() : nav.reset('membership/manage')));
                }, 900);
              }}
            />
          </div>
        </div>
      )}
    </VipOverlay>
  );
}
