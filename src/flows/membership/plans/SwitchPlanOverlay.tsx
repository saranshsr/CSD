import { layout } from '../../../foundations/tokens';
import { useNav } from '../../../kit/Navigator';
import { useMembershipManage } from '../../../kit/membership';
import { icons } from '../assets';
import { VipOverlay, useVipOverlay } from '../components/VipOverlay';
import { VipButton } from '../components/primitives';
import { plans } from '../data';
import { useEnsureMembership } from '../store';
import { buildPlanUpgrade } from './plansData';
import styles from './plans.module.css';

const DISMISS = new Set(['dismiss', '/dismiss', 'cancel', '/cancel']);
const CHANGE = new Set(['change', '/change']);

function SwitchContent({ planId }: { planId: string }) {
  const nav = useNav();
  const { close } = useVipOverlay();
  const s = useMembershipManage();
  // opened directly on a non-family member → preview with the demo family plan (store untouched)
  const find = (st: typeof s) => buildPlanUpgrade(st).otherPlans.find((o) => o.planCode === planId && o.switchPlanData);
  const option = find(s) ?? find({ ...s, plan: plans.familyMonthly });
  const data = option?.switchPlanData;
  if (!option || !data) return null;
  // VIPUpgradePlanV2 showSwitchPlanWarning: planName = title lower-cased, "+ plan" when missing
  const raw = option.title.split(' · ')[0];
  const planName = raw.toLowerCase().includes('plan') ? raw.toLowerCase() : `${raw} plan`.toLowerCase().trim();
  const title = data.title.replace(/\{\s*plan_name\s*\}/gi, planName);

  const onPress = (cta: string) => {
    const c = cta.trim().toLowerCase();
    if (CHANGE.has(c) && !DISMISS.has(c)) close(() => nav.push('membership/reviewPlan', { planId }));
    else close();
  };

  return (
    <div className={styles.switchCard}>
      <div className={styles.switchContainer}>
        <div className={styles.switchContent}>
          <img className={styles.switchIcon} src={data.headerIconUrl ?? icons.switches} alt="" />
          <span className={styles.switchTitle}>{title}</span>
          <span className={styles.switchDescription}>{data.description}</span>
        </div>
        <div className={styles.switchButtons}>
          {data.buttons.map((b, i) => (
            <VipButton key={`${b.cta}_${i}`} className={CHANGE.has(b.cta) ? styles.switchPrimary : styles.switchSecondary} onPress={() => onPress(b.cta)}>
              {b.text}
            </VipButton>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * VIPSwitchPlanOverlayScreen — family → smaller plan warning. Transparent sheet (animationArbitraryHeight 75% of the
 * screen) holding a white r16 card inset 6px: 56px icon, H18 bold blueGrey title, B14 medium textTertiary body,
 * "Keep Family Plan" (white, #EAECF0 border) + "Switch Plan" (#101628) 52px buttons.
 */
export function SwitchPlanOverlay({ params }: { params: { planId?: string; state?: string } }) {
  useEnsureMembership(params.state);
  return (
    <VipOverlay className={styles.transparentSheet} startY={layout.deviceHeight * 0.75}>
      <SwitchContent planId={params.planId ?? 'ONE_DUO_MONTHLY'} />
    </VipOverlay>
  );
}
