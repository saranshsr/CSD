import { motion, useMotionValue, useTransform } from 'motion/react';
import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { HtmlText, Screen } from '../../../components';
import { useNav } from '../../../kit/Navigator';
import { useMembershipEligibility } from '../../../kit/membership';
import { easing } from '../../../motion/presets';
import { CURRENCY, withEligibility } from '../data';
import { isBundle, trialGuideData, v3Tiers, withBadge, type V3Plan } from '../data.plans';
import { noononeStore, useNoonone } from '../store';
import { BundlePlanCard, PlanCard } from '../components/plans/PlanCard';
import { ChevronLeftRounded, ScrollHeader, SubscriptionButton } from '../components/plans/parts';
import { useQuickPay } from '../components/plans/useQuickPay';
import s from './PlanSelectScreen.module.css';

/** VIPQuickPlanSelectV3Screen tabWidth (152 in RTL); widened only when a label + discount pill can't fit on one line */
const TAB_WIDTH = 140;
const TAB_PAD = 12;
/** SegmentedControlTabSwitcher.animateToPosition: Animated.timing default 500ms, Easing.out(Easing.cubic) */
const TAB_MS = 0.5;

type Params = { preSelectedTierCode?: string; preSelectedPlanCode?: string; source?: string };

const flatten = (plans: (V3Plan | { isBundleComponent: true; plans: V3Plan[] })[]) => plans.flatMap((p) => (isBundle(p as V3Plan) ? (p as { plans: V3Plan[] }).plans : [p as V3Plan]));

/** VIPQuickPlanSelectV3Screen.getSelectedPlan: preSelectedTierCode → defaultTierCode → 0; preSelectedPlanCode → first plan */
function initialSelection({ preSelectedTierCode, preSelectedPlanCode }: Params): [number, string] {
  const pre = v3Tiers.findIndex((t) => t.tierCode === preSelectedTierCode);
  const def = v3Tiers.findIndex((t) => t.tierCode === 'individual');
  const idx = pre >= 0 ? pre : def >= 0 ? def : 0;
  const plans = flatten(v3Tiers[idx].plans);
  return [idx, (plans.find((p) => p.planCode === preSelectedPlanCode) ?? plans[0]).planCode];
}

/**
 * features/vip/screens/VIPQuickPlanSelectV3Screen — the live plan select (VIPUtil.showPlanSelectV2 always pushes V3).
 * Big "Choose Your Plan" title, tier switcher (only when > 1 tier), plan / bundle cards, "Explore all the offers"
 * (UAE), payment terms and the sticky VIPSubscriptionButtonV2. First CTA tap opens the plan-select review
 * (VIPInfoOverlayScreen with trialGuideData.planSelect); afterwards it quick-subscribes with the saved card.
 */
export function PlanSelectScreen({ params }: { params: Params }) {
  const nav = useNav();
  const trialEligible = useMembershipEligibility((st) => st.trialEligible);
  const { trialGuideShown, paymentMethod } = useNoonone();
  const [init] = useState(() => initialSelection(params ?? {}));
  const [tierIndex, setTierIndex] = useState(init[0]);
  const [planCode, setPlanCode] = useState(init[1]);
  const { pay, loading } = useQuickPay();

  const tiers = useMemo(
    () =>
      v3Tiers.map((t) => ({
        ...t,
        plans: t.plans.map((p) => (isBundle(p) ? { ...p, plans: p.plans.map((bp) => withBadge(withEligibility(bp, trialEligible) as V3Plan)) } : withBadge(withEligibility(p, trialEligible) as V3Plan))),
      })),
    [trialEligible],
  );
  const tier = tiers[tierIndex];
  const selectedPlan = flatten(tier.plans).find((p) => p.planCode === planCode) ?? flatten(tier.plans)[0];

  const scrollY = useMotionValue(0);
  const headerOpacity = useTransform(scrollY, [0, 20], [0, 1]);

  // keep each tab's label + pill on one line (RN measures them narrower than the web font does)
  const tabsRef = useRef<HTMLDivElement>(null);
  const [tabWidth, setTabWidth] = useState(TAB_WIDTH);
  useLayoutEffect(() => {
    const contents = tabsRef.current?.querySelectorAll<HTMLElement>('[data-tier-tab]');
    if (!contents?.length) return;
    const widest = Math.max(...[...contents].map((el) => el.scrollWidth));
    setTabWidth(Math.max(TAB_WIDTH, Math.ceil(widest) + TAB_PAD));
  }, [tiers]);

  const switchTab = (i: number) => {
    const first = flatten(tiers[i].plans)[0];
    setTierIndex(i);
    setPlanCode(first.planCode);
  };

  const showPayment = trialGuideShown && !!paymentMethod;

  const onButton = () => {
    if (!trialGuideShown && trialGuideData.planSelect) {
      noononeStore.patch({ trialGuideShown: true, selectedPlan });
      nav.push('noonone/planDetails', { planCode: selectedPlan.planCode, variant: 'planSelect' });
      return;
    }
    pay(selectedPlan);
  };

  const footer = (
    <div className={s.footer}>
      <SubscriptionButton
        title={selectedPlan.buttonText}
        showPayment={showPayment}
        paymentMethod={paymentMethod}
        onPress={onButton}
        onPayWith={() => {
          noononeStore.patch({ selectedPlan });
          nav.push('noonone/payment', { planCode: selectedPlan.planCode });
        }}
        isLoading={loading}
        className={showPayment ? s.stickyPay : s.sticky}
        textClassName={s.stickyText}
      />
    </div>
  );

  return (
    <Screen
      background="var(--nk-color-vip-plans-bg)"
      overlayHeader
      header={<ScrollHeader title="Choose Your Plan" opacity={headerOpacity} />}
      footer={footer}
      safeTop={false}
      onScroll={(y) => scrollY.set(y)}
      contentStyle={{ paddingBottom: 'var(--nk-space-s8)' }}
    >
      <div className={s.content}>
        <div className={s.pageTitleContainer}>
          <span className={s.pageTitle}>Choose Your Plan</span>
        </div>
        {tiers.length > 1 ? (
          <div className={s.tierDetails}>
            <div ref={tabsRef} className={s.tabs} style={{ width: tiers.length * tabWidth + 10 }}>
              <motion.div
                className={s.activePill}
                style={{ width: tabWidth, insetInlineStart: 4 }}
                initial={false}
                animate={{ x: tierIndex * tabWidth }}
                transition={{ duration: TAB_MS, ease: easing.out }}
              />
              {tiers.map((t, i) => (
                <button key={t.tierCode} type="button" className={`nk-pressable ${s.tab}`} style={{ width: tabWidth, flex: 'none' }} onClick={() => i !== tierIndex && switchTab(i)}>
                  <span className={s.tierTab} data-tier-tab>
                    <span className={s.tierTabText}>{t.name}</span>
                    {t.discountTag && <span className={s.tierDiscount}>{t.discountTag}</span>}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className={s.separator} />
        )}
        <div className={s.plans}>
          {tier.plans.map((p) =>
            isBundle(p) ? (
              <BundlePlanCard key={p.planCode} bundle={p} selectedPlanCode={selectedPlan.planCode} onSelect={(bp) => setPlanCode(bp.planCode)} onBundleTag={() => nav.toast(`Yango Play ${CURRENCY} 100 noon credits T&C`)} />
            ) : (
              <PlanCard key={p.planCode} plan={p} selected={p.planCode === selectedPlan.planCode} onSelect={(sp) => setPlanCode(sp.planCode)} />
            ),
          )}
        </div>
        <button type="button" className={`nk-pressable ${s.offersButton}`} onClick={() => nav.push('noonone/offers', { preselectedIndex: 'bank', source: '/plan-select' })}>
          <span className={s.offersText}>Explore all the offers</span>
          <span className={s.offersIcon}>
            <ChevronLeftRounded />
          </span>
        </button>
        {selectedPlan.paymentTerms && (
          <div className={s.terms}>
            <HtmlText value={selectedPlan.paymentTerms} className={s.termsText} />
          </div>
        )}
      </div>
    </Screen>
  );
}
