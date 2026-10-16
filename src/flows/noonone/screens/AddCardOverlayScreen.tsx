import { useState } from 'react';
import cardAmex from '@assets/shared/payment/card-amex.webp';
import cardMada from '@assets/shared/payment/card-mada.webp';
import cardMastercard from '@assets/shared/payment/card-mastercard.webp';
import cardVisa from '@assets/shared/payment/card-visa.webp';
import checkboxChecked from '@assets/shared/icons/checkbox-checked.webp';
import checkboxUnchecked from '@assets/shared/icons/checkbox-unchecked.webp';
import { LegacyOverlay, useLegacyOverlay } from '../components/payment/LegacyOverlay';
import { Reloader } from '../components/payment/Reloader';
import type { VipCard } from '../data';
import { brandOf, cvvError, expiryValid, luhn, payCopy, paymentLocalStore } from '../data.payment';
import { noononeStore } from '../store';
import { paymentTokens } from '../tokens';
import styles from './AddCardOverlayScreen.module.css';

/** FormUtils.normalizeCardNumber(4, ' ') */
const formatCard = (v: string) => v.replace(/\D/g, '').slice(0, 19).replace(/(\d{4})(?=\d)/g, '$1 ');
/** FormUtils.addCharacterAtPositions(2, '/') */
const formatExpiry = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};

function Field({ label, value, onChange, placeholder, maxLength, secure, error, autoFocus }: { label: string; value: string; onChange: (v: string) => void; placeholder: string; maxLength: number; secure?: boolean; error?: boolean; autoFocus?: boolean }) {
  const [touched, setTouched] = useState(false);
  return (
    <label>
      <span className={styles.label}>
        {label}
        <span className={styles.required}> *</span>
      </span>
      <input
        className={`${styles.input} ${touched && error ? styles.inputError : ''}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setTouched(true)}
        placeholder={placeholder}
        maxLength={maxLength}
        inputMode="numeric"
        type={secure ? 'password' : 'text'}
        autoFocus={autoFocus}
      />
    </label>
  );
}

function Form() {
  const { close } = useLegacyOverlay();
  const [card, setCard] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [rememberCard, setRememberCard] = useState(true);
  const [saving, setSaving] = useState(false);
  const brand = brandOf(card);
  const errors = { card: !luhn(card) || !brand, expiry: !expiryValid(expiry), cvv: !!cvvError(cvv, brand) };
  const isValid = !errors.card && !errors.expiry && !errors.cvv;

  // PaymentCardService.createPaymentCard → onCreateCard(idCreated, cvv, cards) → overlayRef.close()
  const onSubmit = () => {
    setSaving(true);
    setTimeout(() => {
      const digits = card.replace(/\D/g, '');
      const last4 = digits.slice(-4);
      const newCard: VipCard = { id: `card_new_${Date.now()}`, ccType: brand ?? 'visa', ccMasked: `${digits.slice(0, 6)}•• •••• ${last4}`, last4, expiry, name: brand ?? 'Card', paymentMethodCode: 'cc_noonpay' };
      noononeStore.patch((s) => ({ addedCards: [...s.addedCards, newCard], paymentMethod: { type: 'card', card: newCard } }));
      paymentLocalStore.patch((s) => ({ cvv: { ...s.cvv, [newCard.id]: cvv } }));
      setSaving(false);
      close();
    }, paymentTokens.apiMs);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.headerText}>{payCopy.addCardTitle}</span>
        <span className={styles.cards}>
          <img src={cardVisa} alt="" className={styles.cardIcon} />
          <img src={cardMastercard} alt="" className={styles.cardIcon} />
          <img src={cardAmex} alt="" className={styles.cardIcon} />
          <img src={cardMada} alt="" className={styles.cardIcon} />
        </span>
      </div>
      <div className={styles.scroll}>
        <div className={styles.form}>
          <Field label={payCopy.cardNumber} value={card} onChange={(v) => setCard(formatCard(v))} placeholder={payCopy.cardPlaceholder} maxLength={24} error={errors.card} autoFocus />
          <div className={styles.row}>
            <div className={styles.rowItem}>
              <Field label={payCopy.expiry} value={expiry} onChange={(v) => setExpiry(formatExpiry(v))} placeholder={payCopy.expiryPlaceholder} maxLength={5} error={errors.expiry} />
            </div>
            <div className={styles.rowItem}>
              <Field label={payCopy.cvv} value={cvv} onChange={(v) => setCvv(v.replace(/\D/g, ''))} placeholder={payCopy.cvv} maxLength={4} secure error={errors.cvv} />
            </div>
          </div>
          <button type="button" className={styles.checkbox} onClick={() => setRememberCard((r) => !r)}>
            <img src={rememberCard ? checkboxChecked : checkboxUnchecked} alt="" className={styles.checkboxIcon} />
            <span className={styles.checkboxLabel}>{payCopy.remember}</span>
          </button>
          <span className={styles.remember}>{payCopy.rememberDesc}</span>
        </div>
      </div>
      <div className={styles.buttonWrapper}>
        <button type="button" className={`nk-pressable ${styles.button}`} disabled={!isValid} onClick={onSubmit}>
          {payCopy.addCard}
        </button>
      </div>
      <Reloader visible={saving} />
    </div>
  );
}

/** VIPAddCardOverlayScreen — legacy src/components/Overlay (bounceMargin 0, shouldHandleKeyboard), Formik card form. */
export function AddCardOverlayScreen() {
  return (
    <LegacyOverlay className={styles.overlay}>
      <Form />
    </LegacyOverlay>
  );
}
