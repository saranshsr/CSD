import { motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { useNav } from '../../kit/Navigator';
import type { ScreenProps } from '../../kit/types';
import { tween } from '../../motion/presets';
import { SavedContact } from './components/SavedContact';
import { useAddressContact } from './components/ReceiverDetails';
import { DIAL_CODES, deliveryIcons, deliveryOptions, td } from './data.delivery';
import { API_DELAY, checkoutStore } from './store';
import { deliveryStore, useDelivery } from './store.delivery';
import { Button, Spinner } from '../../components';
import styles from './components/alternatePhone.module.css';

export interface AlternatePhoneParams {
  /** 'receiver' = ReceiverDetails "Change receiver" (passes addressContact → Primary row); 'instruction' = v1 delivery option */
  mode?: 'receiver' | 'instruction';
}

const sanitize = (p: string) => {
  let s = p.replace(/[^+\d]/g, '');
  if (s.startsWith('00')) s = `+${s.slice(2)}`;
  return s;
};
const splitPhone = (phone: string) => {
  const s = sanitize(phone);
  const dial = DIAL_CODES.find((d) => s.startsWith(d)) ?? DIAL_CODES[0];
  return { dialCode: dial, phoneNumber: s.startsWith(dial) ? s.slice(dial.length) : s };
};

/**
 * NoonCheckoutAlternatePhoneScreen (OverlayBottomSheet): title (option.sheetTitle), note, "Add receiver contact" name field with
 * device-contacts button, NoonContactPhoneInput (dial code + number), OR, "Use previously saved contact" list (Primary first),
 * save-selection checkbox and SAVE (disabled until a contact is picked or name + number > 4 digits). The phone list loads
 * first (FeedbackView LOADING, 40% screen height).
 */
export function AlternatePhoneScreen({ params }: ScreenProps<AlternatePhoneParams>) {
  const nav = useNav();
  const option = deliveryOptions.find((o) => o.key === 'receiver_phone_code')!;
  const isV2 = option.version === 2;
  const addressContact = useAddressContact();
  const showPrimary = (params.mode ?? 'receiver') === 'receiver' && !!addressContact;
  const contacts = useDelivery((s) => s.contacts);
  const picked = useDelivery((s) => s.pickedContact);

  const [loading, setLoading] = useState(true);
  const [contactInfo, setContactInfo] = useState({ dialCode: DIAL_CODES[0], phoneNumber: '', name: '' });
  const [contactPhoneCode, setContactPhoneCode] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [isCheckboxEnabled, setIsCheckboxEnabled] = useState(!!option.shouldSaveSelection);
  const lastPicked = useRef(picked?.id);

  // CustomerService.getReceiverPhoneList
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  // reOpenAlternatePhoneOverlayScreen(receiverDetails) after the device contact picker
  useEffect(() => {
    if (!picked || picked.id === lastPicked.current) return;
    lastPicked.current = picked.id;
    setContactInfo({ ...splitPhone(picked.phone), name: picked.name });
    setContactPhoneCode(null);
  }, [picked]);

  const onContactPress = (code: string) => {
    setContactPhoneCode(code);
    setContactInfo((p) => ({ ...p, name: '', phoneNumber: '' }));
  };

  const isCtaDisabled = !contactPhoneCode && !(contactInfo.name && contactInfo.dialCode && contactInfo.phoneNumber.length > 4);

  /** onSubmit → setDeliveryOption(receiver_phone_code) — v2 shows ReceiverDetails' own loader */
  const submit = (code: string, contact: { name: string; phone: string } | null) => {
    nav.back();
    deliveryStore.set({ receiverPhoneCode: code === 'primary' ? null : code, receiverLoading: isV2 });
    const apply = () => {
      checkoutStore.set({ receiver: contact ? { name: contact.name, phone: contact.phone } : { name: null, phone: null } });
      deliveryStore.set({ receiverLoading: false });
    };
    if (isV2) setTimeout(apply, API_DELAY);
    else checkoutStore.update({ receiver: contact ? { name: contact.name, phone: contact.phone } : { name: null, phone: null } });
  };

  const onSubmitPress = () => {
    if (contactPhoneCode) {
      if (contactPhoneCode === 'primary') return submit('primary', null);
      const c = contacts.find((x) => x.receiverPhoneCode === contactPhoneCode);
      return submit(contactPhoneCode, c ? { name: c.contactName, phone: c.phone } : null);
    }
    if (!contactInfo.name || !contactInfo.phoneNumber) return;
    // CustomerService.saveReceiverPhone
    setSaving(true);
    setError('');
    setTimeout(() => {
      setSaving(false);
      if (!/^5\d{8}$|^\d{7,10}$/.test(contactInfo.phoneNumber)) {
        setError(td.vat_validation_phone_number);
        return;
      }
      const phone = `${contactInfo.dialCode} ${contactInfo.phoneNumber}`;
      const saved = deliveryStore.saveContact(contactInfo.name, phone);
      submit(saved.receiverPhoneCode, { name: contactInfo.name, phone });
    }, API_DELAY);
  };

  if (loading) {
    return (
      <div className={`${styles.sheet} ${styles.loading}`}>
        <Spinner track="var(--nk-palette-noon-grey3)" color="var(--nk-palette-accent-color)" />
      </div>
    );
  }

  return (
    <motion.div className={styles.sheet} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={tween('fast')}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.title}>{isV2 ? option.sheetTitle : option.message}</span>
        </div>
        {option.note && (
          <div className={styles.note} style={{ backgroundColor: option.note.backgroundHexa }}>
            <span className={styles.noteText}>{option.note.content}</span>
          </div>
        )}
        <div className={styles.addContact}>
          <span className={styles.sectionTitle}>{td.noon_checkout_alternate_receiver_add}</span>
        </div>
        <div className={styles.inputRow}>
          <input
            className={styles.input}
            value={contactInfo.name}
            placeholder={td.noon_name}
            onChange={(e) => {
              setContactInfo((p) => ({ ...p, name: e.target.value }));
              setContactPhoneCode(null);
            }}
          />
          <button type="button" className={styles.contactsIcon} aria-label="Open contacts" onClick={() => nav.push('checkout/alternate-phone-contacts')}>
            <img src={deliveryIcons.contacts} width={24} height={24} alt="" />
          </button>
        </div>
        <div className={styles.phoneWrap}>
          <div className={[styles.phone, error && styles.phoneError].filter(Boolean).join(' ')}>
            <span className={styles.dialCode}>
              <span className={styles.dialCodeText}>{contactInfo.dialCode || '+00'}</span>
              <img src={deliveryIcons.arrowDownBlue} width={16} height={16} alt="" />
              <select className={styles.dialSelect} value={contactInfo.dialCode} onChange={(e) => setContactInfo((p) => ({ ...p, dialCode: e.target.value }))} aria-label="Dial code">
                {DIAL_CODES.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </span>
            <input
              className={styles.phoneInput}
              inputMode="tel"
              placeholder={td.primary_phone_number}
              value={contactInfo.phoneNumber}
              onChange={(e) => {
                if (/^[0-9]*$/.test(e.target.value)) setContactInfo((p) => ({ ...p, phoneNumber: e.target.value }));
                setContactPhoneCode(null);
                setError('');
              }}
            />
          </div>
          {error && <div className={styles.errorText}>{error}</div>}
        </div>
        {(contacts.length > 0 || showPrimary) && (
          <>
            <div className={styles.or}>
              <span className={styles.orLine} />
              <span className={styles.orText}>{td.noon_or}</span>
              <span className={styles.orLine} />
            </div>
            <div className={styles.saved}>
              <span className={styles.sectionTitle}>{td.noon_checkout_alternate_receiver_previous_contact}</span>
              <div className={styles.savedList}>
                {showPrimary && addressContact && <SavedContact contactInfo={addressContact} isPrimary isChecked={contactPhoneCode === 'primary'} onPress={() => onContactPress('primary')} />}
                {contacts.map((c) => (
                  <SavedContact key={c.receiverPhoneCode} contactInfo={c} isChecked={contactPhoneCode === c.receiverPhoneCode} onPress={() => onContactPress(c.receiverPhoneCode)} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
      <div className={styles.bottom}>
        {option.showSelectionSaveCheckbox && (
          <button type="button" className={styles.checkboxRow} onClick={() => setIsCheckboxEnabled((v) => !v)}>
            <img src={isCheckboxEnabled ? deliveryIcons.checkboxOn : deliveryIcons.checkboxOff} width={18} height={18} alt="" />
            <span className={styles.checkboxText}>{option.shouldSaveSelectionMessage}</span>
          </button>
        )}
        <div className={styles.cta}>
          <Button variant="noon" titleCase disabled={isCtaDisabled || saving} loading={saving} onClick={onSubmitPress} style={{ width: '100%' }} spinner={{ size: 20, color: 'var(--nk-color-text-inverse)', track: 'var(--nk-palette-white-alpha40)' }} whileTap={{ opacity: 0.8 }} transition={{ duration: 0.12 }}>
            {td.noon_checkout_alternate_receiver_done}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
