import { motion } from 'motion/react';
import { useState } from 'react';
import chevronUp from '@assets/vip/chevron-up-rounded.svg';
import amexIcon from '@assets/shared/payment/brand-card-amex.webp';
import mastercardIcon from '@assets/shared/payment/brand-card-mastercard.webp';
import visaIcon from '@assets/shared/payment/brand-card-visa.webp';
import applePayIcon from '@assets/shared/payment/apple-pay.webp';
import { HtmlText, MaskIcon } from '../../../../components';
import type { VipCard } from '../../data';
import { flyout as flyoutData, landingCopy, type FlyoutData } from '../../data.landing';
import { VIPButton } from '../VIPButton';
import { DashedLine } from './DashedLine';
import styles from './landing.module.css';

const cardIcon = { visa: visaIcon, mastercard: mastercardIcon, amex: amexIcon };

/**
 * VIPLandingScreen Flyout (VIPPartnerCalloutType): optional 16px leading icon (me 8) and 18px trailing icon (ms 8), both
 * tinted textColor; tap → internalUrl (onNavigate) or copies couponCode (trailing text → "Code copied").
 */
export function Flyout({ data = flyoutData, onNavigate }: { data?: FlyoutData; onNavigate?: (url: string) => void }) {
  const [copied, setCopied] = useState(false);
  const color = data.textColor;
  return (
    <motion.button
      type="button"
      className={`nk-pressable ${styles.flyout}`}
      style={data.backgroundColor ? { background: data.backgroundColor } : undefined}
      disabled={!!data.couponCode && copied}
      onClick={() => {
        if (data.internalUrl) return onNavigate?.(data.internalUrl);
        if (!data.couponCode) return;
        void navigator.clipboard?.writeText(data.couponCode).catch(() => {});
        setCopied(true);
      }}
    >
      {data.iconUrl && <MaskIcon src={data.iconUrl} size={16} color={color} className={styles.flyoutIcon} />}
      <HtmlText value={data.text} className={[styles.flyoutText, data.trailingText && styles.flyoutTextFlex].filter(Boolean).join(' ')} style={{ color }} />
      {data.trailingText && (
        <span className={styles.flyoutTrailing} style={{ color }}>
          {copied ? landingCopy.codeCopied : data.trailingText}
        </span>
      )}
      {data.trailingIconUrl && <MaskIcon src={data.trailingIconUrl} size={18} color={color} className={styles.flyoutTrailingIcon} />}
    </motion.button>
  );
}

export type PayDetails = { type: 'card'; card: VipCard } | { type: 'applepay' } | { type: 'boku'; msisdn: string } | null;

/**
 * features/vip/components/VIPSubscriptionButtonV2: optional "Pay with ▾ ••••4242" row (cardType 44 × 40, gap 20) +
 * black r12 button with the server html title (p white bold, <s> 400 line-through, size − 2).
 */
export function SubscriptionButton({
  title,
  showPayment,
  payment,
  isLoading,
  onPress,
  onPaymentPress,
  buttonClassName = styles.stickyButton,
  buttonPayClassName = styles.stickyButtonPay,
  textClassName = styles.stickyButtonText,
}: {
  title: string;
  showPayment: boolean;
  payment: PayDetails;
  isLoading?: boolean;
  onPress: () => void;
  onPaymentPress: () => void;
  /** non-member landing restyle (Figma 24:2745) passes its own button look */
  buttonClassName?: string;
  buttonPayClassName?: string;
  textClassName?: string;
}) {
  const withPay = showPayment && !!payment;
  return (
    <div className={styles.subRow}>
      {withPay && payment && (
        <motion.button type="button" className={`nk-pressable ${styles.payRow}`} whileTap={{ opacity: 0.2 }} onClick={onPaymentPress}>
          <img className={styles.payCard} src={payment.type === 'card' ? cardIcon[payment.card.ccType] : applePayIcon} alt="" />
          <span>
            <span className={styles.payHeader}>
              <span className={styles.payLabel}>{landingCopy.payWith}</span>
              <span className={styles.payChevron}>
                <img src={chevronUp} alt="" />
              </span>
            </span>
            <span className={styles.payText}>{payment.type === 'card' ? `${'•'.repeat(4)}${payment.card.last4}` : payment.type === 'applepay' ? landingCopy.applePay : payment.msisdn}</span>
          </span>
        </motion.button>
      )}
      <VIPButton
        className={[buttonClassName, withPay && buttonPayClassName].filter(Boolean).join(' ')}
        htmlTitle={title}
        textClassName={textClassName}
        isLoading={isLoading}
        disabled={isLoading}
        onPress={onPress}
      />
    </div>
  );
}

/** VIPLandingScreen.renderStickyFooter: flyout + '/create' button + dashed "View all plans" link; slides out with stickyButtonAnim. */
export function StickyFooter({
  showFlyout,
  subscription,
  viewPlansTitle,
  onViewPlans,
}: {
  showFlyout: boolean;
  subscription: Parameters<typeof SubscriptionButton>[0];
  viewPlansTitle?: string;
  onViewPlans: () => void;
}) {
  return (
    <div className={[styles.stickyFooter, showFlyout && styles.noRadius].filter(Boolean).join(' ')}>
      {showFlyout && <Flyout />}
      <div className={styles.stickyButtons}>
        <div className={styles.stickyItem}>
          <SubscriptionButton {...subscription} />
        </div>
        {viewPlansTitle && (
          <div className={styles.viewPlansWrap}>
            <DashedLine className={styles.viewPlansDash} strokeWidth={4} strokeSpacing={5} strokeHeight={1} color="var(--nk-color-text-body)" />
            <VIPButton className={styles.viewPlans} textClassName={styles.viewPlansText} title={viewPlansTitle} onPress={onViewPlans} />
          </div>
        )}
      </div>
    </div>
  );
}
