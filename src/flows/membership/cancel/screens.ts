import type { ScreenDef } from '../../../kit/types';
import { lazyScreen } from '../../../kit/lazyScreen';
import { overlayScreen } from '../transitions';
const CancelScreen = lazyScreen(() => import('./CancelScreen'), 'CancelScreen');
const CancelSheetScreen = lazyScreen(() => import('./overlays'), 'CancelSheetScreen');
const ConfirmOfferOverlayScreen = lazyScreen(() => import('./overlays'), 'ConfirmOfferOverlayScreen');
const GroupSavingsOverlayScreen = lazyScreen(() => import('./overlays'), 'GroupSavingsOverlayScreen');
const LeaveFamilyOverlayScreen = lazyScreen(() => import('./overlays'), 'LeaveFamilyOverlayScreen');
const LoseAccessOverlayScreen = lazyScreen(() => import('./overlays'), 'LoseAccessOverlayScreen');
const PlanOptionsOverlayScreen = lazyScreen(() => import('./overlays'), 'PlanOptionsOverlayScreen');
const UnusedSeatsOverlayScreen = lazyScreen(() => import('./overlays'), 'UnusedSeatsOverlayScreen');

const src = 'features/vip/screens';

/** Cancellation (VIPCancelMembershipV2Screen and its pages / owner family-cancel overlays). See cancel/MAPPING.md. */
export const cancelScreens: ScreenDef[] = [
  {
    id: 'cancel',
    title: 'Cancel membership',
    component: CancelScreen,
    path: ['cancel-membership'],
    defaultParams: { mode: 'cancel' },
    notes:
      'VIPCancelMembershipV2 (vip_cancel_v2). Pages come from cancelMembershipV2.pages for the current membership: active → benefits → discount offer (accept → confirm offer) → survey; trial → benefits → reminder sheet → survey; family owner → unused seats → plan options → group savings → lose access → benefits → survey. ?mode=leave (family member, skipFamilyCancelOverlays) ends on the leave-family sheet; ?mode=cancelUpgrade opens the review sheet. &index=N jumps to a page. Scroll 60px to fade in the header.',
    source: `${src}/VIPCancelMembershipV2Screen (BenefitsScreen, DiscountOfferScreen, SurveyScreen)`,
  },
  {
    id: 'cancelSheet',
    title: 'Cancel – overlay page',
    component: CancelSheetScreen,
    ...overlayScreen,
    defaultParams: { mode: 'cancel', index: 1, state: 'trial' },
    notes: 'renderOverlayScreen of VIPCancelMembershipV2: reminder (trial, index 1), review-cancel-upgrade (?mode=cancelUpgrade) and the plan-options change-plan review (?review=changePlan&planCode=…).',
    source: `${src}/VIPCancelMembershipV2Screen (ReminderScreen, VIPReviewCancelUpgradeScreen)`,
  },
  {
    id: 'unusedSeats',
    title: 'Unused seats',
    component: UnusedSeatsOverlayScreen,
    ...overlayScreen,
    defaultParams: { mode: 'cancel' },
    notes: 'Owner cancel overlay: seat rings (VIPPlanMembers 40/overlap 10), reminder card, Continue / Share invite (→ membership/shareInvite).',
    source: `${src}/VIPUnusedSeatsOverlayScreen`,
  },
  {
    id: 'planOptions',
    title: 'Switch plan instead',
    component: PlanOptionsOverlayScreen,
    ...overlayScreen,
    defaultParams: { mode: 'cancel' },
    notes: 'Owner cancel overlay: pick Duo / Individual (savings tag shimmers every 1.5s). Switch plan → loading → review sheet → Pay → plan change scheduled + success animation on manage. Cancel anyway → next page.',
    source: `${src}/VIPPlanOptionOverlayScreen`,
  },
  {
    id: 'groupSavings',
    title: 'Family group savings',
    component: GroupSavingsOverlayScreen,
    ...overlayScreen,
    defaultParams: { mode: 'cancel' },
    source: `${src}/VIPCancelGroupSavingsOverlayScreen`,
  },
  {
    id: 'loseAccess',
    title: 'Lose access warning',
    component: LoseAccessOverlayScreen,
    ...overlayScreen,
    defaultParams: { mode: 'cancel' },
    source: `${src}/VIPLoseAccessWarningOverlayScreen`,
  },
  {
    id: 'leaveFamilyOverlay',
    title: 'Leave family plan – confirm',
    component: LeaveFamilyOverlayScreen,
    ...overlayScreen,
    defaultParams: { mode: 'leave' },
    notes: 'Final confirm of the member leave-family flow: Stay → manage; Leave Family → membershipActions.leaveFamily().',
    source: `${src}/VIPLeaveFamilyPlanOverlayScreen`,
  },
  {
    id: 'confirmOffer',
    title: 'Confirm retention offer',
    component: ConfirmOfferOverlayScreen,
    ...overlayScreen,
    defaultParams: { mode: 'cancel' },
    notes: 'Accept offer from the discount-offer page: quick subscribe with the saved card → success animation on manage.',
    source: `${src}/VIPConfirmOfferPlanScreen`,
  },
];
