import { HtmlText, MaskIcon } from '../../../components';
import { ref } from '../../../foundations/tokens';
import { icons } from '../assets';
import { t } from '../data';
import type { UpgradePlan } from '../manageData';
import { DashedLine, VipButton } from './primitives';
import styles from './ManagePlan.module.css';

/** HtmlView stylesheets from VIPManageMembershipV3Screen/Plan/styles.ts */
const planHeaderSheet = { p: { fontSize: 15 }, highlight: { color: ref.color('bestPriceInk'), fontWeight: 700 } };
const benefitSheet = {
  p: { color: ref.color('textMuted'), font: ref.type('text12MediumLh18'), letterSpacing: 'var(--nk-space-mb-ls10)' },
  b: { fontWeight: 600, textTransform: 'uppercase' as const },
  highlight: { color: ref.color('bestPriceInk'), fontWeight: 500 },
};
const billingSheet = { p: { color: ref.color('textSecondary'), font: ref.type('text12MediumLh18'), letterSpacing: 'var(--nk-space-mb-ls10)' } };

/**
 * VIPManageMembershipV3Screen/Plan/Plan.tsx (manage variant: isUpgradeScreen false, hideCancelButton).
 * Current plan: green "Current plan" tab (grey when an upcoming plan exists), optional headerMessage strip
 * (#F0FFF9 → white, star), title B16 bold, benefits (check.webp tinted blueGrey) when there's no upgrade plan,
 * dashed separator, billing info, and the plan CTA (VIPSubscriptionButtonV2: black r10 h45; /upgrade + /reactivate green).
 */
export function ManagePlan({
  plan,
  isCurrent,
  tagText = t('vip_current_plan'),
  showBenefits,
  hasUpcomingPlan,
  onCta,
}: {
  plan: UpgradePlan;
  isCurrent?: boolean;
  tagText?: string;
  showBenefits?: boolean;
  hasUpcomingPlan?: boolean;
  onCta?: (cta: string) => void;
}) {
  const { cta, buttonText, headerMessage, title, billingInfo, benefits } = plan;
  const isCancelUpgrade = cta === '/cancelUpgrade';
  const variant = cta === '/upgrade' || cta === '/reactivate' ? 'green' : isCancelUpgrade ? 'outline' : 'default';
  return (
    <div className={styles.wrapper}>
      {isCurrent && (
        <div className={styles.activeTagRow}>
          <span className={styles.activeTag} data-upcoming={hasUpcomingPlan || undefined}>
            {tagText}
          </span>
        </div>
      )}
      {headerMessage && (
        <div className={styles.headerMessage}>
          <img className={styles.headerMessageIcon} src={icons.star} width={18} height={18} alt="" />
          <HtmlText base value={headerMessage} stylesheet={planHeaderSheet} />
        </div>
      )}
      <div className={styles.titleContainer}>
        <span className={styles.planTitle}>{title}</span>
      </div>
      {showBenefits && !!benefits?.length && (
        <div>
          <div className={styles.inset}>
            <DashedLine />
          </div>
          <div className={styles.benefits}>
            {benefits.map((b, i) => (
              <div key={i} className={styles.benefit}>
                <MaskIcon src={icons.check} size={16} color={ref.color('textBody')} />
                <HtmlText className={styles.benefitText} value={b.title} stylesheet={benefitSheet} />
              </div>
            ))}
          </div>
        </div>
      )}
      <div className={styles.inset}>
        <DashedLine />
      </div>
      {billingInfo && (
        <div className={styles.billingInfo}>
          <HtmlText value={billingInfo} stylesheet={billingSheet} />
        </div>
      )}
      {cta && buttonText && !isCancelUpgrade && (
        <div className={styles.ctaRow}>
          <VipButton className={styles.cta} data-variant={variant} onPress={() => onCta?.(cta)}>
            <HtmlText value={buttonText} />
          </VipButton>
        </div>
      )}
    </div>
  );
}
