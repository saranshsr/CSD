import { createStore } from '../../kit/createStore';
import { savedReceiverContacts, type ReceiverContact } from './data.delivery';

/**
 * Delivery-area local state (not part of the checkout session):
 * - saved receiver contacts (CustomerService.saveReceiverPhone appends)
 * - the contact picked in the device-contacts overlay, handed back to NoonCheckoutAlternatePhoneScreen
 * - ReceiverDetails' own contactState loader (session v2 receiver flow doesn't use the page reloader)
 */
interface DeliveryState {
  contacts: ReceiverContact[];
  /** receiverPhoneCode of the session receiver ('primary' / null = address owner) */
  receiverPhoneCode: string | null;
  pickedContact: { id: number; name: string; phone: string } | null;
  receiverLoading: boolean;
}

const store = createStore<DeliveryState>({ contacts: savedReceiverContacts, receiverPhoneCode: null, pickedContact: null, receiverLoading: false });

export const deliveryStore = {
  get: store.get,
  subscribe: store.subscribe,
  set: (patch: Partial<DeliveryState>) => store.patch(patch),
  /** CustomerService.saveReceiverPhone */
  saveContact(contactName: string, phone: string): ReceiverContact {
    const existing = store.get().contacts.find((c) => c.phone.replace(/\D/g, '') === phone.replace(/\D/g, ''));
    if (existing) return existing;
    const contact = { contactName, phone, receiverPhoneCode: `rpc-${Date.now()}` };
    deliveryStore.set({ contacts: [contact, ...store.get().contacts] });
    return contact;
  },
};

export function useDelivery<T>(select: (s: DeliveryState) => T): T {
  return store.useStore(select);
}
