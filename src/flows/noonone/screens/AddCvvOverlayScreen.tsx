import { useState } from 'react';
import { useParams } from '../../../kit/Navigator';
import addCvvIcon from '@assets/vip/add-cvv.webp';
import { LegacyOverlay, useLegacyOverlay } from '../components/payment/LegacyOverlay';
import { savedCards } from '../data';
import { cvvError, payCopy, paymentLocalStore } from '../data.payment';
import { useNoonone } from '../store';
import { brandIcon } from './PaymentScreen';
import styles from './AddCvvOverlayScreen.module.css';

function Content({ cardId }: { cardId?: string }) {
  const { close } = useLegacyOverlay();
  const { addedCards } = useNoonone();
  const card = [...savedCards, ...addedCards].find((c) => c.id === cardId) ?? savedCards[1];
  const [cvv, setCvv] = useState(paymentLocalStore.get().cvv[card.id] ?? '');
  const error = cvvError(cvv, card.ccType);
  const hasError = !!cvv && !!error;

  return (
    <div className={styles.container}>
      <img src={addCvvIcon} alt="" className={styles.icon} />
      <span className={styles.header}>{payCopy.verificationTitle}</span>
      <div className={styles.row}>
        <span className={styles.subtitle}>{payCopy.verificationSubtitle}</span>
        <img src={brandIcon[card.ccType]} alt="" className={styles.cardIcon} />
        <span className={styles.subtitle}>{`${'•'.repeat(4)} ${card.last4}`}</span>
      </div>
      <input
        className={`${styles.input} ${hasError ? styles.inputError : ''}`}
        value={cvv}
        onChange={(e) => {
          const v = e.target.value.replace(/\D/g, '');
          setCvv(v);
          paymentLocalStore.patch((s) => ({ cvv: { ...s.cvv, [card.id]: v } })); // onEditCVV
        }}
        placeholder={payCopy.cvv}
        type="password"
        inputMode="numeric"
        maxLength={4}
        autoFocus
      />
      <span className={styles.error}>{cvv ? error : ''}</span>
      <button
        type="button"
        className={`nk-pressable ${styles.button}`}
        disabled={hasError || !cvv}
        onClick={() => close(() => paymentLocalStore.patch((s) => ({ cvvVerified: s.cvvVerified + 1 })))}
      >
        {payCopy.verify}
      </button>
    </div>
  );
}

/** VIPAddCvvOverlayScreen — legacy Overlay; "Verify" closes and resumes getPaymentIntent({ cvv }) on the payment screen. */
export function AddCvvOverlayScreen() {
  const { cardId } = useParams<{ cardId?: string }>();
  return (
    <LegacyOverlay className={styles.overlay}>
      <Content cardId={cardId} />
    </LegacyOverlay>
  );
}
