import { useLayoutEffect } from 'react';
import { Screen } from '../../../components';
import { membershipStore, useMembershipManage } from '../../../kit/membership';
import { useNav } from '../../../kit/Navigator';
import { VipBackButton, VipButton } from '../components/primitives';
import { applyDemo, t } from '../data';
import { useEnsureMembership } from '../store';
import styles from './family.module.css';

/**
 * VIPLeaveFamilyPlanScreen (VIPUtil.showLeaveFamilyPlanScreen) — surfaceGrey page: back button, centred savings title
 * (h24 bold blueGrey) + "Leave and you'll start paying delivery fees again", Keep membership (buttonPrimary, r14) and
 * Leave Family (outline). Master pops on both CTAs; in the kit "Leave Family" continues into the leave-family cancel
 * flow (membership/cancel { mode: 'leave' }), the same flow Manage's "/leave-family" opens.
 */
export function LeaveFamilyPlanScreen({ params }: { params: { state?: string; ownerName?: string; savingsText?: string } }) {
  useEnsureMembership(params.state);
  useLayoutEffect(() => {
    if (!params.state && membershipStore.get().role !== 'member') applyDemo('familyMember');
  }, [params.state]);
  const nav = useNav();
  const m = useMembershipManage();
  const back = () => (nav.canGoBack ? nav.back() : nav.reset('membership/manage'));
  const savingsText = params.savingsText ?? `You've saved AED ${m.savings} with ${params.ownerName ?? m.ownerName ?? 'your'}'s Family plan`;

  return (
    <Screen background="bgSubtle" safeTop={false} contentStyle={{ paddingBottom: 0 }}>
      <div className={styles.leave}>
        <div className={styles.leaveHeader}>
          <VipBackButton onPress={back} className={styles.leaveBack} />
        </div>
        <div className={styles.leaveContent}>
          <span className={styles.leaveTitle}>{savingsText}</span>
          <span className={styles.leaveSubtitle}>{t('vip_leave_family_savings_subtitle')}</span>
        </div>
        <div className={styles.leaveFooter}>
          <VipButton className={styles.keepButton} onPress={back}>
            {t('vip_keep_membership')}
          </VipButton>
          <VipButton className={styles.leaveButton} onPress={() => nav.push('membership/cancel', { mode: 'leave' })}>
            {t('vip_leave_family')}
          </VipButton>
        </div>
      </div>
    </Screen>
  );
}
