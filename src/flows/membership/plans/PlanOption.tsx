import { HtmlText, MaskIcon } from '../../../components';
import { ref } from '../../../foundations/tokens';
import { icons } from '../assets';
import { DashedLine } from '../components/primitives';
import type { OtherPlan } from './plansData';
import styles from './plans.module.css';

/** QuickPlanSelectV3 Plan/styles.ts upgradeDescriptionTextStyle (B12 medium textMuted, <s> line-through) */
const strike = { textDecorationLine: 'line-through' as const };
const descriptionSheet = {
  p: { color: ref.color('textTertiary'), font: ref.type('text12MediumLh18'), letterSpacing: 'var(--nk-space-mb-ls10)' },
  s: strike,
  strike,
  del: strike,
};
/** upgradeBenefitTextStyle (B12 medium textSecondary · <b> bold uppercase · <highlight> successTag bold) */
const benefitSheet = {
  p: { color: ref.color('textMuted'), font: ref.type('text12MediumLh18'), letterSpacing: 'var(--nk-space-mb-ls10)' },
  b: { fontWeight: 700, textTransform: 'uppercase' as const },
  highlight: { color: ref.color('bestPriceInk'), fontWeight: 700 },
};

/**
 * VIPQuickPlanSelectV3Screen/Plan/Plan.tsx with isUpgradeScreen (static price, no animatePrice). Wrapped like
 * VIPUpgradePlanV2 planWrapper: 4px padding, r20, #EBF4F1 when selected.
 */
export function PlanOption({ plan, selected, onSelect }: { plan: OtherPlan; selected: boolean; onSelect: () => void }) {
  return (
    <div className={styles.optionWrapper} data-selected={selected || undefined}>
      <button type="button" className={styles.option} data-selected={selected || undefined} disabled={selected} onClick={onSelect}>
        <div className={styles.optionInner}>
          <div className={styles.optionBody}>
            <div className={styles.optionTitleRow}>
              <span className={styles.optionTitle}>{plan.title}</span>
              <img className={styles.optionRadio} src={selected ? icons.radioGreenSelected : icons.radioGreenUnselected} width={21} height={21} alt="" />
            </div>
            <div className={styles.optionPrice}>
              <span className={styles.optionMonthly}>{plan.monthlyPrice}</span>
              {plan.description && (
                <div className={styles.optionPriceRow}>
                  <HtmlText className={styles.optionDescription} value={plan.description} stylesheet={descriptionSheet} />
                  {plan.savingPct && <span className={styles.optionSavings}>{plan.savingPct}</span>}
                </div>
              )}
            </div>
            {!!plan.benefitsV2?.length && (
              <div className={styles.optionBenefits}>
                <div className={styles.optionDashed}>
                  <DashedLine strokeWidth={2} strokeSpacing={5} color={ref.palette('blackAlpha10')} />
                </div>
                {plan.benefitsV2.map((b, i) => (
                  <div key={i} className={styles.optionBenefit}>
                    <MaskIcon src={icons.check} size={16} color={ref.color('textBody')} />
                    <HtmlText className={styles.flex1} value={b.title} stylesheet={benefitSheet} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </button>
    </div>
  );
}
