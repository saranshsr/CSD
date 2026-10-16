import { motion } from 'motion/react';
import { useState } from 'react';
import { useNav } from '../../kit/Navigator';
import type { ScreenProps } from '../../kit/types';
import { spring } from '../../motion/presets';
import { SPECIAL_EMI_SECTION, isCvvValid, paymentIcons, paymentMethods, tp, type CardSection } from './data.payment';
import { PaymentCard } from './components/PaymentCard';
import { checkoutStore, useCheckout } from './store';
import { Button, HtmlText } from '../../components';
import styles from './payment.module.css';

export interface SpecialEmisParams {
  sectionCode?: string;
}

/**
 * NoonCheckoutSpecialEMIsOverlayScreen (OverlayBottomSheet, max height = screen − 20%): title, description html,
 * the section's eligible cards (selected → aliceBlue/#0076FF, shows the CVV input when isCvvRequired), info terms
 * and an absolute footer button whose title is Select Card → Enter CVV → Confirm.
 * Confirm → confirmPaymentMethod(CC, card, cvv, sectionCode).
 */
export function SpecialEmisScreen({ params }: ScreenProps<SpecialEmisParams>) {
  const nav = useNav();
  const cards = useCheckout((s) => s.cards);
  const state = useCheckout((s) => s);
  const sectionCode = params.sectionCode ?? SPECIAL_EMI_SECTION;
  const section = paymentMethods.find((m): m is CardSection => m.kind === 'card_section' && m.code === sectionCode);
  const eligible = section ? cards.filter(section.eligible) : [];
  const isActive = state.paymentCode === 'cc_noonpay' && state.cardSectionCode === sectionCode;
  const initialSelectedCardId = isActive ? (state.selectedCardId ?? undefined) : undefined;
  const initialCvv = isActive ? state.cvv : '';
  const isCvvRequired = true; // sessionData.isCvvRequired

  const [selectedCardId, setSelectedCardId] = useState<number | null>(initialSelectedCardId ?? (eligible.length === 1 ? eligible[0].id : null));
  const [cvv, setCvv] = useState(initialCvv);
  const selectedCard = eligible.find((c) => c.id === selectedCardId);
  const validCvv = isCvvValid(cvv, selectedCard?.type);
  const disabled = !selectedCardId || (isCvvRequired && !validCvv);
  const title = !selectedCardId ? tp.noon_checkout_select_card : isCvvRequired && !validCvv ? tp.noon_checkout_enter_cvv_cta : tp.noon_confirm;

  function handleConfirm() {
    if (!selectedCard) return;
    if (selectedCard.id === initialSelectedCardId && cvv === initialCvv) {
      nav.back();
      return;
    }
    nav.back();
    checkoutStore.selectPayment('cc_noonpay', selectedCard.id, sectionCode).then(() => checkoutStore.setCvv(cvv));
  }

  if (!section) return null;

  return (
    <div className={styles.sheet} style={{ maxHeight: 'calc(0.8 * 844px)' }}>
      <div className={styles.emiHeader}>
        <span className={styles.cardsTitle}>{section.name}</span>
      </div>
      <div className={styles.scroll}>
        <div className={styles.emiContent}>
          {section.description && (
            <div className={styles.emiDescription}>
              <HtmlText value={section.description} stylesheet={{ p: { fontSize: 14, lineHeight: '18px', fontWeight: 500, color: 'var(--nk-color-text-ink)' } }} />
            </div>
          )}
          <div className={styles.emiCards}>
            {eligible.map((card) => {
              const isSelected = card.id === selectedCardId;
              return (
                <motion.div
                  key={card.id}
                  role="button"
                  className={`${styles.emiCard} ${isSelected ? styles.emiCardSelected : ''}`}
                  whileTap={isSelected ? undefined : { scale: 0.98 }}
                  transition={spring.press}
                  onClick={() => {
                    if (isSelected) return;
                    setCvv('');
                    setSelectedCardId(card.id);
                  }}
                >
                  <PaymentCard card={card} message={null} isLargeIcon showCVV={isSelected && isCvvRequired} cvv={cvv} onUpdateCvv={setCvv} />
                </motion.div>
              );
            })}
          </div>
          {!!section.terms?.length && (
            <div className={styles.terms}>
              {section.terms.map((term) => (
                <div key={term} className={styles.term}>
                  <img className={styles.infoCircle} src={paymentIcons.infoGray} alt="" />
                  <span className={styles.termText}>{term}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className={styles.emiFooter}>
        <Button variant="noon" block disabled={disabled} onClick={handleConfirm} whileTap={{ scale: 0.98 }} transition={undefined}>
          {title}
        </Button>
      </div>
    </div>
  );
}
