import { deliveryIcons, td } from '../data.delivery';
import styles from './alternatePhone.module.css';

/** NoonCheckoutAlternatePhoneScreen/SavedContact — initials circle #FFFCCF, name 16/600, phone 14, "Primary" tag, 24px radio. */
export function SavedContact({ contactInfo, isChecked, isPrimary = false, onPress }: { contactInfo: { contactName: string; phone: string }; isChecked: boolean; isPrimary?: boolean; onPress: () => void }) {
  return (
    <button type="button" className={styles.contact} onClick={onPress}>
      <span className={styles.initials}>{contactInfo.contactName[0]}</span>
      <span className={styles.contactInfo}>
        <span className={styles.contactTitle}>{contactInfo.contactName}</span>
        <span className={styles.contactSub}>{contactInfo.phone}</span>
      </span>
      {isPrimary && <span className={styles.primaryTag}>{td.noon_checkout_alternate_receiver_primary_tag}</span>}
      <img src={isChecked ? deliveryIcons.radioOn : deliveryIcons.radioOff} width={24} height={24} alt="" />
    </button>
  );
}
