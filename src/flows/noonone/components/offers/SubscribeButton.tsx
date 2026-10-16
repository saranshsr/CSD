import type { CSSProperties } from 'react';
import { Pressable } from '../../../../components';
import chevronUp from '@assets/vip/chevron-up-rounded.svg';
import visa from '@assets/shared/payment/brand-card-visa.webp';
import mastercard from '@assets/shared/payment/brand-card-mastercard.webp';
import amex from '@assets/shared/payment/brand-card-amex.webp';
import { VIPButton } from '../VIPButton';
import type { NoononeState } from '../../store';
import styles from './subscribe.module.css';

const cardImage = { visa, mastercard, amex } as const;

/**
 * features/vip/components/VIPSubscriptionButtonV2 (quick-subscribe usage): optional "Pay with •••• 4242" row
 * (tap → payment screen) + black 48px r12 VIPButton with the html title (`<s>` = 400 line-through, size − 2).
 */
export function SubscribeButton({
  title,
  onPress,
  onPaymentPress,
  loading,
  disabled,
  payment,
  className,
  textClassName,
  style,
}: {
  title: string;
  onPress: () => void;
  onPaymentPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  /** shouldShowPayment && selectedPaymentDetails */
  payment?: NoononeState['paymentMethod'];
  className?: string;
  textClassName?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={styles.container}>
      {payment && (
        <Pressable className={styles.paymentRow} scale={1} onClick={onPaymentPress}>
          {payment.type === 'card' && <img className={styles.cardType} src={cardImage[payment.card.ccType]} alt="" />}
          <span className={styles.paymentCol}>
            <span className={styles.paymentHeader}>
              <span className={styles.paymentLabel}>Pay with</span>
              <img className={styles.chevron} src={chevronUp} alt="" />
            </span>
            <span className={styles.paymentText}>{payment.type === 'card' ? `${'•'.repeat(4)}${payment.card.last4}` : payment.type === 'applepay' ? 'Apple Pay' : payment.msisdn}</span>
          </span>
        </Pressable>
      )}
      <VIPButton
        className={[styles.button, disabled && styles.buttonDisabled, className].filter(Boolean).join(' ')}
        style={style}
        disabled={disabled || loading}
        isLoading={loading}
        onPress={onPress}
        htmlTitle={title}
        textClassName={[styles.text, textClassName].filter(Boolean).join(' ')}
      />
    </div>
  );
}
