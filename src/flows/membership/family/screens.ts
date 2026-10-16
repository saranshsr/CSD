import type { ScreenDef } from '../../../kit/types';
import { lazyScreen } from '../../../kit/lazyScreen';
import { overlayScreen } from '../transitions';
const FamilyPlansScreen = lazyScreen(() => import('./FamilyPlansScreen'), 'FamilyPlansScreen');
const FamilyReviewOverlay = lazyScreen(() => import('./FamilyReviewOverlay'), 'FamilyReviewOverlay');
const LeaveFamilyPlanScreen = lazyScreen(() => import('./LeaveFamilyPlanScreen'), 'LeaveFamilyPlanScreen');
const RemoveMemberOverlay = lazyScreen(() => import('./RemoveMemberOverlay'), 'RemoveMemberOverlay');
const SharePlanInviteScreen = lazyScreen(() => import('./SharePlanInviteScreen'), 'SharePlanInviteScreen');

/** family screens of the membership flow (see family/MAPPING.md). */
export const familyScreens: ScreenDef[] = [
  {
    id: 'familyPlans',
    title: 'Family plans',
    component: FamilyPlansScreen,
    path: ['family-plan', 'family-plans'],
    notes:
      'VIPFamilyPlansScreen (/noon-one-sharing). Tap Duo / Family: card border + price box + check spring (damping 12, stiffness 107) and the header Lottie plays Family→Duo (0–81f) / Duo→Family (81–161f). Sections rise 24px on scroll. "Upgrade for free" opens the review sheet. Opened as a family owner/member it shows the server blocking error (try ?state=familyOwner).',
    source: 'features/vip/screens/VIPFamilyPlansScreen',
  },
  {
    id: 'familyReview',
    title: 'Family plan review',
    component: FamilyReviewOverlay,
    ...overlayScreen,
    defaultParams: { planCode: 'ONE_FAMILY_MONTHLY' },
    notes: 'VIPPopupUtil.showPlanDetailDialog(type FAMILY_PLAN). Confirm switches the shared plan and returns to Manage with the success animation; "Pay with" goes to the acquisition payment screen.',
    source: 'features/vip/components/VIPPopups/VIPPlanDetailsPopup (VIPFamilyPlanDetailsPopup)',
  },
  {
    id: 'shareInvite',
    title: 'Share plan invite',
    component: SharePlanInviteScreen,
    path: ['share-invite'],
    notes: 'VIPSharePlanInviteScreen. Skeleton, then hero card (press scale .97) + seats title. "Share Invite" copies the invite link and adds the next invitee to the family (shows on Manage as "Invite sent"). Seeds a family owner when opened directly.',
    source: 'features/vip/screens/VIPSharePlanInviteScreen',
  },
  {
    id: 'removeMember',
    title: 'Remove family member',
    component: RemoveMemberOverlay,
    ...overlayScreen,
    defaultParams: { memberId: 'Z8K2M4' },
    notes: 'VIPRemoveFamilyMemberOverlayScreen (params { memberId }). Remove shows the loader, closes the sheet and removes the member from the shared store.',
    source: 'features/vip/screens/VIPRemoveFamilyMemberOverlayScreen',
  },
  {
    id: 'leaveFamily',
    title: 'Leave family plan',
    component: LeaveFamilyPlanScreen,
    path: ['leave-family'],
    notes: 'VIPLeaveFamilyPlanScreen (params { ownerName?, savingsText? }). Seeds a family member. "Leave Family" → membership/cancel { mode: "leave" }.',
    source: 'features/vip/screens/VIPLeaveFamilyPlanScreen',
  },
];
