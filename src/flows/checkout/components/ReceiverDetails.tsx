import { useNav } from '../../../kit/Navigator';
import { useAddressStore } from '../../address/store';
import callIcon from '@assets/checkout/figma/receiver-call.svg';
import { deliveryOptions, td } from '../data.delivery';
import { useCheckout } from '../store';
import { useDelivery } from '../store.delivery';
import { Spinner } from '../../../components';
import styles from './delivery.module.css';

/** selectedAddress contact (firstName lastName + phone) — the default address of the address book */
export function useAddressContact() {
  const address = useAddressStore((s) => s.addresses.find((a) => a.id === s.defaultId) ?? s.addresses[0]);
  return address ? { contactName: `${address.firstName} ${address.lastName}`, phone: `${address.dialCode} ${address.phone}` } : null;
}

/**
 * Figma "🚧 Checkout 2.0" Receiver Details (14288:184025): white r16 p12, gap 12 — "Receiver details" 16/24 Bold;
 * 32px Blue-Gray/100 r8 avatar with the call icon, name 15/18 SemiBold Blue-Gray/800, phone 12/14 Medium
 * Blue-Gray/600, "Change receiver" 13/16 SemiBold Accent/700 (→ alternate-phone). While the receiver is being
 * set the left side shows the Loader (contactState LOADING) instead of the page reloader.
 */
export function ReceiverDetails() {
  const nav = useNav();
  const receiver = useCheckout((s) => s.receiver);
  const loading = useDelivery((s) => s.receiverLoading);
  const addressContact = useAddressContact();
  const isV2 = deliveryOptions.find((o) => o.key === 'receiver_phone_code')?.version === 2;
  if (!isV2 || !addressContact) return null;

  const contact = receiver.name && receiver.phone ? { contactName: receiver.name, phone: receiver.phone } : addressContact;

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionTitle}>{td.noon_checkout_receiver_details}</span>
      </div>
      <div className={styles.receiver}>
        <div className={styles.receiverLeft}>
          {loading ? (
            <Spinner track="var(--nk-palette-noon-grey3)" color="var(--nk-palette-accent-color)" />
          ) : (
            <>
              <span className={styles.callIcon}>
                <img src={callIcon} width={20} height={20} alt="" />
              </span>
              <span className={styles.receiverText}>
                <span className={styles.receiverName}>{contact.contactName}</span>
                <span className={styles.receiverPhone}>{`\u200e${contact.phone}`}</span>
              </span>
            </>
          )}
        </div>
        <button type="button" className={styles.changeReceiver} disabled={loading} onClick={() => nav.push('checkout/alternate-phone', { mode: 'receiver' })}>
          {td.noon_checkout_change_receiver}
        </button>
      </div>
    </div>
  );
}
