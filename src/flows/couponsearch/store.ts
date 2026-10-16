import { createStore } from '../../kit/createStore';

/**
 * Coupon-scoped search (BEAUTY10) state. Screens are separate stack entries, so the visit lives here:
 *  · `variant` — which of the three designs runs (Context band · Eligible row · Auto-suggestion), set by the
 *    version switch above the phone (`?v=h2|row|n5`)
 *  · `band` — h2: the context band is still up (✕ / a flick dismisses it for the rest of the visit)
 *  · `eligibleOnly` — row: the "Search within BEAUTY10" toggle, remembered for the visit
 * Every Shop more starts a new visit: band back, toggle on.
 */
export type CsVariant = 'h2' | 'row' | 'n5';
export const csVariants: { id: CsVariant; label: string; short: string }[] = [
  { id: 'h2', label: 'Context band', short: 'Band' },
  { id: 'row', label: 'Eligible row', short: 'Row' },
  { id: 'n5', label: 'Auto-suggestion', short: 'Auto' },
];
export const isCsVariant = (v: unknown): v is CsVariant => v === 'h2' || v === 'row' || v === 'n5';

interface CsState {
  variant: CsVariant;
  band: boolean;
  eligibleOnly: boolean;
}

const store = createStore<CsState>({ variant: 'h2', band: true, eligibleOnly: true });

export const csStore = {
  get: store.get,
  subscribe: store.subscribe,
  /** a new coupon visit (Shop more, or a version switch): band back, toggle on */
  newVisit: () => store.patch({ band: true, eligibleOnly: true }),
  /** the version switch: the visit starts over in the other design */
  setVariant: (variant: CsVariant) => store.patch({ variant, band: true, eligibleOnly: true }),
  setBand: (band: boolean) => store.patch({ band }),
  setEligibleOnly: (eligibleOnly: boolean) => store.patch({ eligibleOnly }),
};

export function useCs<T>(select: (s: CsState) => T): T {
  return store.useStore(select);
}
