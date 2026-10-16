import { createStore } from '../../kit/createStore';
import { mockCards, type SavedCard } from './data';

/**
 * Flow-local stand-in for the `paymentCard` redux slice (reducers/paymentCardReducer.ts + sagas/paymentCardSaga.ts).
 * The list, add-card and success screens are separate stack entries, so they share state through this module store.
 */
interface CardsState {
  cards: SavedCard[];
}

const store = createStore<CardsState>({ cards: mockCards });
const current = () => store.get().cards;

/** simulated API latency (ms) for create / delete / set-default */
export const API_DELAY = 450;

export const cardsStore = {
  get: store.get,
  set: (patch: Partial<CardsState>) => store.patch(patch),
  reset(cards: SavedCard[] = mockCards) {
    cardsStore.set({ cards });
  },
  /** PAYMENT_CARD_CREATE_SUCCESS — the API returns the new card first when it is the default */
  add(card: SavedCard) {
    const others = card.isDefault ? current().map((c) => ({ ...c, isDefault: false })) : current();
    cardsStore.set({ cards: card.isDefault ? [card, ...others] : [...others, card] });
  },
  /** PAYMENT_CARD_DELETE_SUCCESS */
  remove(id: string) {
    cardsStore.set({ cards: current().filter((c) => c.id !== id) });
  },
  /** PAYMENT_CARD_SET_AS_DEFAULT_SUCCESS — default card is returned first */
  setDefault(id: string) {
    const cards = current().map((c) => ({ ...c, isDefault: c.id === id }));
    const card = cards.find((c) => c.id === id);
    cardsStore.set({ cards: card ? [card, ...cards.filter((c) => c.id !== id)] : cards });
  },
  /** PAYMENT_CARD_EDIT_NICKNAME_SUCCESS */
  rename(id: string, nickname: string) {
    cardsStore.set({ cards: current().map((c) => (c.id === id ? { ...c, nickname } : c)) });
  },
  subscribe: store.subscribe,
};

export function useCards() {
  return store.useStore().cards;
}
