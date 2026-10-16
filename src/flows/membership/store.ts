import { useLayoutEffect } from 'react';
import { createStore } from '../../kit/createStore';
import { ensureMembership } from './data';

/**
 * Flow-local UI events that outlive a screen — stand-ins for master's VIPEventEmitter:
 *   vipMembershipChanged(title, message, showAnimation) → `celebrate` (manage screen plays VIPTransitionAnim)
 *   vipMembershipCancelled(title, subTitle)             → `cancelled` (manage screen toasts + reloads)
 */
export interface MembershipUiState {
  celebrate?: { title: string; subtitle: string; key: number };
  notice?: { title: string; subtitle?: string; key: number };
}

export const membershipUi = createStore<MembershipUiState>({});

export const membershipEvents = {
  /** VIPEventEmitter.vipMembershipChanged(title, message, showAnimation = true) */
  membershipChanged(title: string, subtitle: string) {
    membershipUi.patch({ celebrate: { title, subtitle, key: Date.now() } });
  },
  /** VIPEventEmitter.vipMembershipCancelled / vipPaymentChanged etc. — manage screen shows it as a toast */
  notify(title: string, subtitle?: string) {
    membershipUi.patch({ notice: { title, subtitle, key: Date.now() } });
  },
  consumeCelebrate() {
    membershipUi.patch({ celebrate: undefined });
  },
  consumeNotice() {
    membershipUi.patch({ notice: undefined });
  },
};

/** Seed a demo membership before first paint (route param `state`, or 'active' when the shared store is empty). */
export function useEnsureMembership(state?: string) {
  useLayoutEffect(() => {
    ensureMembership(state);
  }, [state]);
}
