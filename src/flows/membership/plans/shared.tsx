import { motion, useMotionValue, useTransform } from 'motion/react';
import type { ReactNode } from 'react';
import { HtmlText, MaskIcon } from '../../../components';
import { ref } from '../../../foundations/tokens';
import type { MembershipState } from '../../../kit/membership';
import { icons } from '../assets';
import { cardImage, t } from '../data';
import { DashedLine, VipBackButton } from '../components/primitives';
import styles from './plans.module.css';

/**
 * Absolute VIP page header (VIPUpgradePlanV2 / VIPManageMembershipV3 renderHeader): padding 12, top = status bar,
 * 40px row (back button + H16 bold title, gap 12); white + shadow2 background fades in over `fadeOver` px of scroll.
 */
export function useHeaderFade(fadeOver: number) {
  const scrollY = useMotionValue(0);
  const opacity = useTransform(scrollY, [0, fadeOver], [0, 1]);
  return { onScroll: (y: number) => scrollY.set(y), opacity };
}

export function VipPageHeader({ title, onBack, opacity }: { title?: ReactNode; onBack: () => void; opacity: ReturnType<typeof useHeaderFade>['opacity'] }) {
  return (
    <div className={styles.pageHeader}>
      <motion.div className={styles.pageHeaderBg} style={{ opacity }} />
      <div className={styles.pageHeaderRow}>
        <VipBackButton onPress={onBack} />
        {title && <span className={styles.pageHeaderTitle}>{title}</span>}
      </div>
    </div>
  );
}

/** VIPManageMembershipV3Screen/Plan/styles.ts benefitTextStyle (B12 medium textSecondary, <b> semibold uppercase) */
export const currentBenefitSheet = {
  p: { color: ref.color('textMuted'), font: ref.type('text12MediumLh18'), letterSpacing: 'var(--nk-space-mb-ls10)' },
  b: { fontWeight: 600, textTransform: 'uppercase' as const },
  highlight: { color: ref.color('bestPriceInk'), fontWeight: 500 },
};
const billingSheet = { p: { color: ref.color('textSecondary'), font: ref.type('text12MediumLh18'), letterSpacing: 'var(--nk-space-mb-ls10)' } };

/** VIPManageMembershipV3Screen/Plan/Plan.tsx with isUpgradeScreen + isCurrent + showBenefits (no CTA). */
export function UpgradeCurrentPlan({ plan }: { plan: { title: string; headerMessage?: string; billingInfo?: string; benefits?: { title: string }[] } }) {
  return (
    <div className={styles.currentWrapper}>
      <div className={styles.currentTagRow}>
        <span className={styles.currentTag}>{t('vip_current_plan')}</span>
      </div>
      {plan.headerMessage && (
        <div className={styles.currentHeaderMessage}>
          <img src={icons.star} width={18} height={18} alt="" />
          <HtmlText base value={plan.headerMessage} stylesheet={{ p: { fontSize: 15 }, highlight: { color: ref.color('bestPriceInk') } }} />
        </div>
      )}
      <div className={styles.currentTitleRow}>
        <span className={styles.currentTitle}>{plan.title}</span>
      </div>
      {!!plan.benefits?.length && (
        <div>
          <div className={styles.inset12}>
            <DashedLine />
          </div>
          <div className={styles.currentBenefits}>
            {plan.benefits.map((b, i) => (
              <div key={i} className={styles.currentBenefit}>
                <MaskIcon src={icons.check} size={16} color={ref.color('textBody')} />
                <HtmlText className={styles.flex1} value={b.title} stylesheet={currentBenefitSheet} />
              </div>
            ))}
          </div>
        </div>
      )}
      <div className={styles.inset12}>
        <DashedLine />
      </div>
      {plan.billingInfo && (
        <div className={styles.currentBilling}>
          <HtmlText value={plan.billingInfo} stylesheet={billingSheet} />
        </div>
      )}
    </div>
  );
}

/**
 * VIPReviewCancelUpgradeScreen renderPayment / VIPSubscriptionButtonV2 renderPayment: 40×40 card icon,
 * "Pay with" (13/16 medium, rgba(2,6,12,.45)) + chevron-up rotated 180°, "••••4521" (15/18 bold, nightFall).
 * variant 'subscription' = VIPSubscriptionButtonV2 paymentRow: 44×40 cardType, number 15 medium.
 */
export function PayWithRow({ card, onPress, variant = 'review' }: { card?: MembershipState['paymentCard']; onPress?: () => void; variant?: 'review' | 'subscription' }) {
  return (
    <button type="button" className={styles.payRow} data-variant={variant} disabled={!onPress} onClick={onPress}>
      <span className={styles.payIconBox}>
        <img className={styles.payIcon} src={cardImage(card?.brand)} alt="" />
      </span>
      <span className={styles.payCopy}>
        <span className={styles.payHeader}>
          {t('vip_gc_pay_with')}
          {onPress && <img className={styles.payChevron} src={icons.chevronUpRounded} width={13} height={13} alt="" />}
        </span>
        <span className={styles.payText}>
          {'•'.repeat(4)}
          {card?.last4}
        </span>
      </span>
    </button>
  );
}
