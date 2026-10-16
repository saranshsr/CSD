import { createStore } from '../../kit/createStore';
import { initialAccountState, type AccountState } from './data';

/**
 * Tiny flow-local store so the account sheets/screens share state (country, language,
 * haptics, marketing prefs, saved profile, active devices) without touching the kit's DemoStore.
 */
const store = createStore<AccountState>(initialAccountState);

export const setAccountState = store.patch;

export function useAccountState(): AccountState {
  return store.useStore();
}
