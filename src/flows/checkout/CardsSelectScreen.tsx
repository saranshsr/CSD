import { motion } from 'motion/react';
import { useNav } from '../../kit/Navigator';
import { spring } from '../../motion/presets';
import { DEFAULT_CARD_SECTION, paymentIcons, paymentMethods, tp } from './data.payment';
import { PaymentCard } from './components/PaymentCard';
import { checkoutStore, useCheckout } from './store';
import styles from './payment.module.css';

/**
 * NoonCheckoutCardsSelectScreen (BottomSheet, dynamic height ≤ 70% screen): sticky title row with the
 * "Add New" secondary button, then the saved cards (large 54×34 art, card.message). Tapping a card closes the
 * sheet and confirms it (confirmPaymentMethod CC); "Add New" closes (150ms) and opens the add-card sheet.
 */
export function CardsSelectScreen() {
  const nav = useNav();
  const cards = useCheckout((s) => s.cards);
  const selectedCardId = useCheckout((s) => s.selectedCardId);

  return (
    <div className={styles.sheet} style={{ maxHeight: 'calc(0.7 * 844px)' }}>
      <div className={styles.cardsTitleWrapper}>
        <span className={styles.cardsTitle}>{paymentMethods.find((m) => m.code === DEFAULT_CARD_SECTION)?.name}</span>
        <button
          type="button"
          className={styles.addNewSecondary}
          onClick={() => {
            nav.back();
            setTimeout(() => nav.push('checkout/add-card'), 150);
          }}
        >
          <img className={styles.plus20} src={paymentIcons.oldPlus} alt="" />
          <span className={styles.addNewSecondaryText}>{tp.noon_checkout_add_new}</span>
        </button>
      </div>
      <div className={`${styles.scroll} ${styles.cardsContainer}`}>
        {cards.map((card) => {
          const isSelected = card.id === selectedCardId;
          return (
            <motion.button
              key={card.id}
              type="button"
              className={`${styles.selectCard} ${isSelected ? styles.selectCardSelected : ''}`}
              whileTap={{ scale: 0.98 }}
              transition={spring.press}
              onClick={() => {
                nav.back();
                if (!isSelected) checkoutStore.selectPayment('cc_noonpay', card.id, null);
              }}
            >
              <PaymentCard card={card} message={null} isLargeIcon />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
