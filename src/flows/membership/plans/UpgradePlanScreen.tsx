import { useMemo, useState } from 'react';
import { Screen } from '../../../components';
import { useNav } from '../../../kit/Navigator';
import { useMembershipManage } from '../../../kit/membership';
import { capitalize, t } from '../data';
import { VipButton } from '../components/primitives';
import { useEnsureMembership } from '../store';
import { PlanOption } from './PlanOption';
import { buildPlanUpgrade } from './plansData';
import { UpgradeCurrentPlan, VipPageHeader, useHeaderFade } from './shared';
import styles from './plans.module.css';

/**
 * VIPUpgradePlanV2Screen (FeatureFlags vip_upgrade_v2) — "Change plan": current plan card, "Explore other plans"
 * radio cards, sticky black CTA once another plan is selected. Family → smaller plan opens VIPSwitchPlanOverlay
 * first; then the /payment-page reviewPage sheet (VIPGenericOverlay + VIPReviewCancelUpgradeScreen, change-plan mode).
 */
export function UpgradePlanScreen({ params }: { params: { state?: string } }) {
  useEnsureMembership(params.state);
  const nav = useNav();
  const s = useMembershipManage();
  const data = useMemo(() => (s.plan ? buildPlanUpgrade(s) : undefined), [s]);
  const [selected, setSelected] = useState<string>();
  const selectedCode = selected ?? data?.otherPlans[0]?.planCode;
  const selectedPlan = data?.otherPlans.find((p) => p.planCode === selectedCode);
  const header = useHeaderFade(16);

  const onChange = () => {
    if (!selectedPlan) return;
    if (selectedPlan.planCode === data?.currentPlan.planCode) return nav.back();
    if (selectedPlan.switchPlanData) nav.push('membership/switchPlan', { planId: selectedPlan.planCode });
    else nav.push('membership/reviewPlan', { planId: selectedPlan.planCode });
  };

  const isCurrent = selectedCode === data?.currentPlan.planCode;
  return (
    <Screen
      overlayHeader
      background="bgPage"
      safeTop={false}
      onScroll={header.onScroll}
      header={<VipPageHeader title={capitalize(t('vip_change_plan'))} onBack={nav.back} opacity={header.opacity} />}
      contentStyle={{ paddingInline: 'var(--nk-space-s16)' }}
      footer={
        selectedPlan && !isCurrent ? (
          <div className={styles.stickyFooter}>
            <VipButton className={styles.stickyButton} onPress={onChange}>
              {capitalize(isCurrent ? t('vip_keep_current_plan') : t('vip_change_plan'))}
            </VipButton>
          </div>
        ) : undefined
      }
    >
      <div className={styles.upgradeContent}>
        {data && <UpgradeCurrentPlan plan={data.currentPlan} />}
        {!!data?.otherPlans.length && (
          <div className={styles.otherPlans}>
            <span className={styles.sectionTitle}>{t('vip_explore_other_plans')}</span>
            <div className={styles.plansList}>
              {data.otherPlans.map((p) => (
                <PlanOption key={p.planCode} plan={p} selected={p.planCode === selectedCode} onSelect={() => setSelected(p.planCode)} />
              ))}
            </div>
          </div>
        )}
      </div>
    </Screen>
  );
}
