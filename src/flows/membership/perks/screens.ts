import type { ScreenDef } from '../../../kit/types';
import { lazyScreen } from '../../../kit/lazyScreen';
import { overlayScreen } from '../transitions';
const PartnerOverlayScreen = lazyScreen(() => import('./PartnerOverlayScreen'), 'PartnerOverlayScreen');
const ReferralsInputOverlayScreen = lazyScreen(() => import('./ReferralsInputOverlayScreen'), 'ReferralsInputOverlayScreen');
const ReferralsScreen = lazyScreen(() => import('./ReferralsScreen'), 'ReferralsScreen');
const YangoCreditsOverlayScreen = lazyScreen(() => import('./YangoCreditsOverlayScreen'), 'YangoCreditsOverlayScreen');

/** perks screens of the membership flow — referrals + partner perks (see perks/MAPPING.md). */
export const perksScreens: ScreenDef[] = [
  {
    id: 'referrals',
    title: 'Refer & Earn',
    component: ReferralsScreen,
    path: ['referrals', 'noon-one-referrals'],
    notes: 'Tap "Copy code" (dashed green box turns light green "Code copied"). Invite opens WhatsApp, More options uses the Web Share API (or copies the link). "Have a referral code?" opens the input overlay on the voucher tab. Header image / stats / how-it-works are server CMS (demo placeholders).',
    source: 'features/vip/screens/VIPReferralsScreen',
  },
  {
    id: 'referralsInput',
    title: 'Referral code',
    component: ReferralsInputOverlayScreen,
    path: ['referral-code'],
    ...overlayScreen,
    notes: 'Bank offers ↔ Voucher codes switcher animates the sheet height (400 ↔ 500). Type a friend code (e.g. SARA10) → Apply → green success + info row; your own code ANKIT25 or anything else → red error. Tap the code to edit, ✕ to clear. Continue (enabled only when valid) stores the code (membershipManageActions.applyReferral). "Learn more" on a bank offer opens membership/info.',
    source: 'features/vip/screens/VIPReferralsInputOverlayScreen',
    defaultParams: { preselectedIndex: 1 },
  },
  {
    id: 'partner',
    title: 'Partner offer',
    component: PartnerOverlayScreen,
    ...overlayScreen,
    notes: 'Co-brand partner popup (VIPPartnerPopupType). Join → acquisition payment (Pay with saved card row shown when a card exists); View all plans → acquisition plan select. Banner is a server image (token placeholder).',
    source: 'features/vip/screens/VIPPartnerOverlayScreen',
  },
  {
    id: 'yangoCredits',
    title: 'Yango Play credits T&C',
    component: YangoCreditsOverlayScreen,
    ...overlayScreen,
    defaultParams: { isTrialValid: true },
    notes: 'Bottom sheet (drag down to close). Param isTrialValid switches step 1 copy (trial vs paid).',
    source: 'features/vip/screens/VIPYangoCreditsOverlayScreen',
  },
];
