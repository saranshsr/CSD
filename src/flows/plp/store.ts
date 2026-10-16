import { createStore } from '../../kit/createStore';
import type { Filters, SortId } from './data';

/**
 * Tiny module-level store shared by the PLP grid and its Filters / Sort sheets
 * (sheets are separate screens on the nav stack, so they can't share component state).
 */
interface PlpState {
  sort: SortId;
  filters: Filters;
  /** current PLP query, so sheets can compute counts against the same result set */
  query?: string;
}

const store = createStore<PlpState>({ sort: 'recommended', filters: {} });

export const plpStore = {
  get: store.get,
  set: (patch: Partial<PlpState>) => store.patch(patch),
  reset() {
    store.patch({ sort: 'recommended', filters: {} });
  },
  subscribe: store.subscribe,
};

export function usePlpStore() {
  return store.useStore();
}
