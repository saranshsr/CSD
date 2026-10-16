import type { RefObject } from 'react';
import type { CheckoutCard } from '../data';
import { cvvLength, paymentIcons, tp } from '../data.payment';
import { HtmlText, type HtmlStylesheet } from '../../../components';
import styles from './PaymentCard.module.css';

/** updatedCobrandSelectedCardMessageStyle */
const messageSheet = (disabled: boolean): HtmlStylesheet => ({
  p: { fontSize: 'var(--nk-font-size-body-small)', fontWeight: 'var(--nk-font-weight-regular)', color: disabled ? 'var(--nk-color-text-disabled)' : 'var(--nk-palette-secondary-text-color)' },
  highlight: { color: 'var(--nk-color-success-strong)' },
  red: { color: 'var(--nk-palette-red-color)' },
  orange: { color: 'var(--nk-palette-orange-color)' },
  green: { color: 'var(--nk-color-success)' },
});

/**
 * NoonCheckoutPaymentCard: 38×24 card art (54×34 large), nickname | ••••  last4, optional info/message html and
 * the CVV input (34h, r8, border #0E0E0E24, min width 60).
 */
export function PaymentCard({
  card,
  showCVV = false,
  isDisabled = false,
  cvv = '',
  onUpdateCvv,
  isLargeIcon = false,
  message,
  cvvInputRef,
  onCvvInputPress,
}: {
  card: CheckoutCard;
  showCVV?: boolean;
  isDisabled?: boolean;
  cvv?: string;
  onUpdateCvv?: (v: string) => void;
  isLargeIcon?: boolean;
  /** isInfoMessage ? card.infoMessage : card.message */
  message?: string | null;
  cvvInputRef?: RefObject<HTMLInputElement | null>;
  onCvvInputPress?: () => void;
}) {
  const { nickname } = card;
  const text = message ?? card.infoMessage;
  return (
    <div className={styles.card}>
      <div className={`${styles.left} ${!nickname && !text ? styles.leftNoText : ''}`}>
        <span className={styles.iconWrap}>
          <img className={`${styles.icon} ${isLargeIcon ? styles.iconLarge : ''} ${isDisabled ? styles.iconDisabled : ''}`} src={paymentIcons.card[card.type] ?? paymentIcons.cardFallback} alt={card.type} />
        </span>
        <div className={styles.textWrap}>
          <div className={styles.textRow}>
            {nickname && (
              <>
                <span className={`${styles.nickname} ${isDisabled ? styles.textDisabled : ''}`}>{nickname}</span>
                <span className={`${styles.separator} ${isDisabled ? styles.bgDisabled : ''}`} />
              </>
            )}
            <span className={styles.number}>
              <span className={styles.dots}>
                {[0, 1, 2, 3].map((i) => (
                  <span key={i} className={`${styles.dot} ${isDisabled ? styles.dotDisabled : ''}`} />
                ))}
              </span>
              <span className={`${styles.cardText} ${isDisabled ? styles.textDisabled : ''}`}>{card.mask}</span>
            </span>
          </div>
          {text ? <HtmlText value={text} stylesheet={messageSheet(isDisabled)} /> : null}
        </div>
      </div>
      {showCVV && (
        <input
          ref={cvvInputRef}
          className={styles.cvv}
          value={cvv}
          type="password"
          inputMode="numeric"
          autoComplete="cc-csc"
          placeholder={tp.noon_cvv}
          maxLength={cvvLength(card.type)}
          onClick={(e) => {
            e.stopPropagation();
            onCvvInputPress?.();
          }}
          onChange={(e) => onUpdateCvv?.(e.target.value.replace(/\D/g, ''))}
        />
      )}
    </div>
  );
}
