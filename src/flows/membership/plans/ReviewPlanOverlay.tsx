import { HtmlText } from '../../../components';
import { ref } from '../../../foundations/tokens';
import { useNav } from '../../../kit/Navigator';
import { membershipActions, membershipManageActions, membershipStore, useMembershipManage } from '../../../kit/membership';
import { VipOverlay, useVipOverlay } from '../components/VipOverlay';
import { VipButton } from '../components/primitives';
import { acquisitionRoute } from '../links';
import { membershipEvents, useEnsureMembership } from '../store';
import { buildPlanUpgrade, planFromCode, reviewPageFor, successCopy } from './plansData';
import { PayWithRow } from './shared';
import styles from './plans.module.css';

/** getSubTitleTextStyle: regular 12/18, -0.1, resolvedTextColor (default textTertiary #666D85) */
const subTitleSheet = {
  p: { color: ref.color('textSecondary'), font: ref.type('text12RegularLh18'), letterSpacing: 'var(--nk-space-mb-ls10)' },
  b: { fontWeight: 700 },
};

/** Pops the overlay stack back to the manage screen (navigator.popTo(rootComponentId)), or opens it. */
export function useReturnToManage() {
  const nav = useNav();
  return () => {
    const idx = nav.stack.findIndex((e) => e.route === 'membership/manage');
    if (idx < 0) return nav.reset('membership/manage');
    // the overlay itself was already popped by VipOverlay.close()
    for (let n = nav.stack.length - 2; n > idx; n--) nav.back();
  };
}

function ReviewContent({ planId }: { planId: string }) {
  const nav = useNav();
  const { close } = useVipOverlay();
  const s = useMembershipManage();
  const toManage = useReturnToManage();
  const option = s.plan ? buildPlanUpgrade(s).otherPlans.find((o) => o.planCode === planId) : undefined;
  const plan = planFromCode(planId);
  if (!option || !plan) return null;
  const page = reviewPageFor(option);
  const confirmTitle = page.buttons[0].text;

  const onConfirm = () =>
    close(() => {
      // VIPReviewCancelUpgradeScreen handleChangePlanConfirm: closeOverlay(false) → setTimeout(onConfirm, 250) → handlePayment
      window.setTimeout(() => {
        const renewsOn = membershipStore.get().renewsOn;
        if (option.applies === 'now') {
          membershipActions.changePlan(plan);
          membershipManageActions.cancelUpgrade();
        } else membershipManageActions.scheduleUpgrade(plan);
        const copy = successCopy(option, plan, renewsOn);
        membershipEvents.membershipChanged(copy.title, copy.subtitle);
        toManage();
      }, 250);
    });

  return (
    <div className={styles.review}>
      <div className={styles.reviewHeader}>
        <span className={styles.reviewTitle}>{page.title}</span>
      </div>
      <div className={styles.reviewBody}>
        <div className={styles.reviewInfoCard}>
          <HtmlText value={page.subTitle} stylesheet={subTitleSheet} />
        </div>
        <div className={styles.reviewFooter}>
          <div className={styles.reviewDivider} />
          <div className={styles.reviewActionRow}>
            {/* VIPSubscriptionButtonV2 (isQuickSubscribe, showPayment): pay-with row + button, gap 20 */}
            <div className={styles.subButtonRow}>
              {s.paymentCard && (
                <PayWithRow variant="subscription" card={s.paymentCard} onPress={() => close(() => nav.push(acquisitionRoute('payment'), { planCode: planId, isUpdatePayment: true, source: '/planUpgradeV2' }))} />
              )}
              <VipButton className={styles.reviewConfirm} onPress={onConfirm}>
                {confirmTitle}
              </VipButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * VIPGenericOverlayScreen (canBeClosed, contentContainerStyle paymentBottomSheetReview: margin 0 16, radius 20/20/16/16,
 * white) rendering VIPReviewCancelUpgradeScreen in 'change-plan' mode with the /payment-page reviewPage.
 */
export function ReviewPlanOverlay({ params }: { params: { planId?: string; state?: string } }) {
  useEnsureMembership(params.state);
  return (
    <VipOverlay className={styles.reviewSheet} childrenClassName={styles.reviewSheetChildren}>
      <ReviewContent planId={params.planId ?? 'ONE_ANNUAL'} />
    </VipOverlay>
  );
}
