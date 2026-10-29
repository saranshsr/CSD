import { createStore } from '../../kit/createStore';

/**
 * Coupon-scoped search (BEAUTY10) state. Screens are separate stack entries, so the visit lives here:
 *  · `variant` — which of the three designs runs (Context band · Eligible row · Auto-suggestion), set by the
 *    version switch above the phone (`?v=h2|row|row2|n5`)
 *  · `eligibleOnly` — row: the "Search within BEAUTY10" toggle, remembered for the visit
 * Every Shop more starts a new visit: toggle on. The h2 band lives with its search (SearchScreen): ✕ lasts for that
 * search (results and back keep it dismissed); opening the search again from the eligible page brings it back.
 */
export type CsVariant = 'h2' | 'row' | 'row2' | 'n5';
export const csVariants: { id: CsVariant; label: string; short: string }[] = [
  { id: 'h2', label: 'Context band', short: 'Band' },
  { id: 'row', label: 'Eligible row', short: 'Row' },
  { id: 'row2', label: 'Eligible row v2', short: 'Row v2' },
  { id: 'n5', label: 'Auto-suggestion', short: 'Auto' },
];
export const isCsVariant = (v: unknown): v is CsVariant => v === 'h2' || v === 'row' || v === 'row2' || v === 'n5';
/** row2 (Eligible row v2) behaves exactly like row: only the row's look and copy differ */
export const isRowVariant = (v: CsVariant) => v === 'row' || v === 'row2';

interface CsState {
  variant: CsVariant;
  eligibleOnly: boolean;
}

const store = createStore<CsState>({ variant: 'h2', eligibleOnly: true });

export const csStore = {
  get: store.get,
  subscribe: store.subscribe,
  /** a new coupon visit (Shop more, or a version switch): toggle on */
  newVisit: () => store.patch({ eligibleOnly: true }),
  /** the version switch: the visit starts over in the other design */
  setVariant: (variant: CsVariant) => store.patch({ variant, eligibleOnly: true }),
  setEligibleOnly: (eligibleOnly: boolean) => store.patch({ eligibleOnly }),
};

export function useCs<T>(select: (s: CsState) => T): T {
  return store.useStore(select);
}
