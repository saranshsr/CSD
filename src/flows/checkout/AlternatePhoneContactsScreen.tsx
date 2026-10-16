import { useNav } from '../../kit/Navigator';
import type { ScreenProps } from '../../kit/types';
import { deviceContact, deliveryIcons, td } from './data.delivery';
import { deliveryStore } from './store.delivery';
import styles from './components/alternatePhone.module.css';

export interface AlternatePhoneContactsParams {
  name?: string;
  phoneNumbers?: string[];
}

/**
 * NoonCheckoutAlternatePhoneContactsScreen — shown (Android) when the picked device contact has several unique numbers:
 * "Select a phone number for {name}" + bordered rows (#b3cce6, r6) in blueColor with a blue chevron. Picking one hands
 * the contact back to NoonCheckoutAlternatePhoneScreen. The device contact picker itself is mocked by `deviceContact`.
 */
export function AlternatePhoneContactsScreen({ params }: ScreenProps<AlternatePhoneContactsParams>) {
  const nav = useNav();
  const name = params.name ?? deviceContact.name;
  const phoneNumbers = params.phoneNumbers ?? deviceContact.phoneNumbers;

  const onPhoneNumberPress = (phone: string) => {
    deliveryStore.set({ pickedContact: { id: Date.now(), name, phone } });
    nav.back();
  };

  return (
    <div className={styles.contactsScreen}>
      <div className={styles.modal}>
        <span className={styles.modalTitle}>{td.selectPhoneFor(name)}</span>
        <div className={styles.numbers}>
          {phoneNumbers.map((n) => (
            <button key={n} type="button" className={styles.number} onClick={() => onPhoneNumberPress(n)}>
              <span>{n}</span>
              <img src={deliveryIcons.chevronRightBlue} width={14} height={14} alt="" className="nk-flip-rtl" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
