import { useState } from 'react';
import { membershipActions, membershipManageActions, membershipStore, useMembershipManage } from '../../../kit/membership';
import { useNav } from '../../../kit/Navigator';
import type { VipOverlayApi } from '../components/VipOverlay';
import { t } from '../data';
import { membershipEvents } from '../store';
import { buildCancelPages, cancelResult, type CancelMode, type CancelPage } from './cancelData';

/** page → route. Master opens `isOverlay` pages with navigator.showOverlay, the rest with navigator.push. */
export const routeForPage = (p: CancelPage) => {
  switch (p.pageType) {
    case 'unused-seats':
      return 'membership/unusedSeats';
    case 'plan-options':
      return 'membership/planOptions';
    case 'group-savings':
      return 'membership/groupSavings';
    case 'lose-access':
      return 'membership/loseAccess';
    case 'leave-family':
      return 'membership/leaveFamilyOverlay';
    default:
      return p.isOverlay ? 'membership/cancelSheet' : 'membership/cancel';
  }
};

export interface CancelParams {
  mode?: CancelMode;
  index?: number;
  state?: string;
}

/** Pops back to the manage screen (master: mainNavigator.dismissModal()). `popped` = entries already popped (overlay close). */
export function useBackToManage() {
  const nav = useNav();
  return (popped = 0) => {
    const idx = nav.stack.map((e) => e.route).lastIndexOf('membership/manage');
    if (idx < 0) {
      nav.reset('membership/manage');
      return;
    }
    const n = nav.stack.length - 1 - idx - popped;
    for (let i = 0; i < n; i++) nav.back();
  };
}

/**
 * VIPCancelMembershipV2Screen.handleButtonPress / cancelMembership — shared by the full-screen pages and every
 * overlay page. Pass the overlay api from overlay pages so the sheet animates out before navigating (master closes
 * overlayRef first, then runs the action after interactions).
 */
export function useCancelFlow({ mode = 'cancel', index = 0 }: CancelParams, overlay?: VipOverlayApi) {
  const nav = useNav();
  const s = useMembershipManage();
  const backToManage = useBackToManage();
  const [loading, setLoading] = useState(false);
  const pages = buildCancelPages(s, mode);
  const page: CancelPage | undefined = pages[index];
  const popped = overlay ? 1 : 0;
  const after = (fn: () => void) => (overlay ? overlay.close(fn) : fn());

  const openPage = (i: number) => {
    const p = pages[i];
    if (p) nav.push(routeForPage(p), { mode, index: i });
  };

  const applyCancel = () => {
    const result = cancelResult(membershipStore.get(), mode);
    if (mode === 'leave') membershipActions.leaveFamily();
    else if (mode === 'cancelUpgrade') membershipManageActions.cancelUpgrade();
    else membershipActions.cancel();
    membershipEvents.notify(result.title, result.subTitle);
  };

  const cancelMembership = () => {
    if (overlay) {
      // overlay pages: the sheet closes first (wasOverlay → overlayRef.close()), then the cancel call resolves
      after(() => {
        applyCancel();
        backToManage(popped);
      });
      return;
    }
    // full screen: ScreenState.RELOADING while VIPService.cancelSubscription runs, then dismissModal
    setLoading(true);
    setTimeout(() => {
      applyCancel();
      backToManage(0);
    }, 700);
  };

  const handle = (cta: string) => {
    switch (cta) {
      case '/exit':
      case '/stay':
      case '/dismiss':
        after(() => backToManage(popped));
        break;
      case '/continue':
        after(() => openPage(index + 1));
        break;
      case '/reminder':
        membershipManageActions.setReminder(true);
        nav.toast(t('vip_one_reminder_set'), { tone: 'success' });
        after(() => backToManage(popped));
        break;
      case '/share-invite':
        after(() => nav.push('membership/shareInvite', { source: '/cancel-membership' }));
        break;
      case '/leave-family': {
        const li = pages.findIndex((p) => p.pageType === 'leave-family');
        if (li >= 0) openPage(li);
        break;
      }
      case '/cancel-membership':
      case '/cancelUpgrade':
      case 'cancelUpgrade': {
        // skipFamilyCancelOverlays (leave mode): the final confirm is the leave-family overlay
        const li = pages.findIndex((p) => p.pageType === 'leave-family');
        if (mode === 'leave' && page?.pageType !== 'leave-family' && li >= 0) {
          openPage(li);
          break;
        }
        cancelMembership();
        break;
      }
      case '/minutes':
        nav.push('home/home');
        break;
      default:
        break;
    }
  };

  return { pages, page, index, mode, handle, loading, backToManage, openPage };
}
