import { createStore } from '../../kit/createStore';
import { initialAddresses, type Place, type SavedAddress } from './data';

/**
 * Flow-local address book (the kit's DemoStore has no address slice, and this flow may not edit it).
 * Module-level so it survives navigation between the Select / Map / Success screens; a page refresh resets it.
 */
interface AddressState {
  addresses: SavedAddress[];
  /** whoami selectedAddress — the default address (doesChangeDefaultAddress: true) */
  defaultId: number;
  /** device location permission (LocationProviderV2) */
  locationGranted: boolean;
  /** address code currently showing the card loader */
  loadingCode: string | null;
  /** AddressToastScreen overlay */
  toast: { id: number; message: string } | null;
  /** SearchScreen → Map handoff (onSelectAddress) */
  searchSelection: { id: number; place: Place } | null;
  /** LocationAccess "Allow access" / SearchScreen "Use my current location" → map moves to the user */
  locateRequest: number;
}

const store = createStore<AddressState>({
  addresses: initialAddresses,
  defaultId: initialAddresses[0].id,
  locationGranted: true,
  loadingCode: null,
  toast: null,
  searchSelection: null,
  locateRequest: 0,
});
const set = (patch: Partial<AddressState>) => store.patch(patch);

export const addressStore = {
  get: store.get,
  subscribe: store.subscribe,
  setDefault(id: number) {
    set({ defaultId: id });
  },
  setLoading(code: string | null) {
    set({ loadingCode: code });
  },
  setLocationGranted(locationGranted: boolean) {
    set({ locationGranted });
  },
  /** onAddressCreate — the new address is created as default (doesChangeDefaultAddress) */
  add(address: SavedAddress) {
    set({ addresses: [...store.get().addresses, address], defaultId: address.id });
  },
  update(address: SavedAddress) {
    set({ addresses: store.get().addresses.map((a) => (a.id === address.id ? address : a)) });
  },
  remove(id: number) {
    set({ addresses: store.get().addresses.filter((a) => a.id !== id) });
  },
  verify(phone: string) {
    set({ addresses: store.get().addresses.map((a) => (a.phone === phone ? { ...a, isPhoneVerified: true } : a)) });
  },
  /** AddressUtils.addressV2ShowToast */
  toast(message: string) {
    set({ toast: { id: Date.now(), message } });
  },
  clearToast(id: number) {
    if (store.get().toast?.id === id) set({ toast: null });
  },
  selectSearchResult(place: Place) {
    set({ searchSelection: { id: Date.now(), place } });
  },
  consumeSearchSelection() {
    const s = store.get().searchSelection;
    if (s) set({ searchSelection: null });
    return s;
  },
  requestLocate() {
    set({ locateRequest: Date.now() });
  },
  nextId() {
    return Math.max(0, ...store.get().addresses.map((a) => a.id)) + 1;
  },
};

export function useAddressStore<T>(select: (s: AddressState) => T): T {
  return store.useStore(select);
}
