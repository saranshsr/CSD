import { defineFlow } from '../../kit/registry';
import './transitions';
import { cancelScreens } from './cancel/screens';
import { familyScreens } from './family/screens';
import { perksScreens } from './perks/screens';
import { plansScreens } from './plans/screens';
import { membershipFlowTokens } from './tokens';
import { lazyScreen } from '../../kit/lazyScreen';

const ManageMembershipScreen = lazyScreen(() => import('./ManageMembershipScreen'), 'ManageMembershipScreen');

/**
 * noon One membership management — bappzaar features/vip (master). Live variants: VIPManageMembershipV3Screen
 * (FeatureFlags vip_cancel_v2 + vip_upgrade_v2), VIPCancelMembershipV2Screen, VIPUpgradePlanV2Screen. See MAPPING.md.
 * Overlays (navigator.showOverlay on master) are `presentation: 'modal'` + transition 'mb-overlay' and draw their own
 * VIPOverlayBottomSheet chrome (components/VipOverlay).
 */
export const membershipFlow = defineFlow({
  id: 'membership',
  title: 'noon One membership',
  group: 'Profile',
  description: 'Manage noon One: plan card + benefits, change / upgrade plan, payment method, invoice, cancel with retention, family plan seats, referrals and partner perks.',
  initial: 'manage',
  parent: 'account/account', // Back target when opened directly (no history)
  tokens: membershipFlowTokens,
  screens: [
    {
      id: 'manage',
      title: 'Manage membership',
      component: ManageMembershipScreen,
      path: ['manage-membership', 'noon-one-manage-membership'],
      transition: 'mb-modal',
      notes:
        'VIPManageMembershipV3 (vip_cancel_v2 + vip_upgrade_v2). Opened directly with no membership it seeds an active demo member. Demo states via ?state=: active · trial · cancelled · familyOwner (2 of 4 seats used) · familyMember · upcoming (plan change scheduled). Scroll 1px to fade in the white header.',
      source: 'features/vip/screens/VIPManageMembershipV3Screen',
    },
    ...plansScreens,
    ...cancelScreens,
    ...familyScreens,
    ...perksScreens,
  ],
});
