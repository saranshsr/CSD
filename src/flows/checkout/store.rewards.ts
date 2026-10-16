import { createStore } from '../../kit/createStore';

/**
 * Rewards-only UI state that is not part of the checkout session:
 * - `voucherToast` — NoonCheckoutScreen `voucherToast` state (renderVoucherToast, 2s top toast with confetti)
 * - `providersLoaded` — NoonCheckoutProvidersService.getProviderList has resolved once (skeletons before that)
 */
export interface VoucherToastData {
  id: number;
  provider: string;
  message: string;
  logo: string;
}

interface RewardsState {
  voucherToast: VoucherToastData | null;
  providersLoaded: boolean;
}

const store = createStore<RewardsState>({ voucherToast: null, providersLoaded: false });

export const rewardsStore = {
  get: store.get,
  subscribe: store.subscribe,
  set: (patch: Partial<RewardsState>) => store.patch(patch),
  showVoucherToast(provider: string, message: string, logo: string) {
    rewardsStore.set({ voucherToast: { id: Date.now(), provider, message, logo } });
  },
  hideVoucherToast(id: number) {
    if (store.get().voucherToast?.id === id) rewardsStore.set({ voucherToast: null });
  },
};

export function useRewards<T>(select: (s: RewardsState) => T): T {
  return store.useStore(select);
}

/** getProviderList latency on first checkout open */
export const PROVIDERS_DELAY = 900;
let loadingTimer: ReturnType<typeof setTimeout> | null = null;
/** Called by BurnSection / EarnCallout on mount: providers resolve once per session. */
export function ensureProvidersLoading() {
  if (store.get().providersLoaded || loadingTimer) return;
  loadingTimer = setTimeout(() => {
    loadingTimer = null;
    rewardsStore.set({ providersLoaded: true });
  }, PROVIDERS_DELAY);
}
