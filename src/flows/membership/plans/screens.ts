import type { ScreenDef } from '../../../kit/types';
import { lazyScreen } from '../../../kit/lazyScreen';
import { overlayScreen } from '../transitions';
const ChangePlanScreen = lazyScreen(() => import('./ChangePlanScreen'), 'ChangePlanScreen');
const InfoOverlay = lazyScreen(() => import('./InfoOverlay'), 'InfoOverlay');
const InvoiceScreen = lazyScreen(() => import('./InvoiceScreen'), 'InvoiceScreen');
const ReviewPlanOverlay = lazyScreen(() => import('./ReviewPlanOverlay'), 'ReviewPlanOverlay');
const SwitchPlanOverlay = lazyScreen(() => import('./SwitchPlanOverlay'), 'SwitchPlanOverlay');
const UpgradePlanScreen = lazyScreen(() => import('./UpgradePlanScreen'), 'UpgradePlanScreen');

/** plans screens of the membership flow (see plans/MAPPING.md). */
export const plansScreens: ScreenDef[] = [
  {
    id: 'upgrade',
    title: 'Change plan',
    component: UpgradePlanScreen,
    path: ['noon-one-upgrade', 'upgrade-plan'],
    notes:
      'VIPUpgradePlanV2 (vip_upgrade_v2). Pick another plan → "Change plan" → review sheet → confirm: more seats apply now (changePlan), annual/smaller apply from the next billing date (scheduleUpgrade); manage plays the success Lottie. ?state=familyOwner shows the Switch-plan warning for Duo / Individual. Scroll 16px to fade in the header.',
    source: 'features/vip/screens/VIPUpgradePlanV2Screen',
  },
  {
    id: 'reviewPlan',
    title: 'Review and confirm',
    component: ReviewPlanOverlay,
    ...overlayScreen,
    defaultParams: { planId: 'ONE_ANNUAL' },
    notes: 'VIPGenericOverlay + VIPReviewCancelUpgradeScreen (change-plan mode) with the /payment-page reviewPage: payment terms card, "Pay with ••••4521" (→ acquisition payment) and the confirm button.',
    source: 'features/vip/screens/VIPCancelMembershipV2Screen/VIPReviewCancelUpgradeScreen (via VIPUpgradePlanV2Screen showReviewOverlay)',
  },
  {
    id: 'switchPlan',
    title: 'Switch plan',
    component: SwitchPlanOverlay,
    ...overlayScreen,
    defaultParams: { planId: 'ONE_DUO_MONTHLY' },
    notes: 'Family → Duo / Individual warning. "Switch Plan" continues to the review sheet, "Keep Family Plan" closes.',
    source: 'features/vip/screens/VIPSwitchPlanOverlayScreen',
  },
  {
    id: 'info',
    title: 'Info overlay',
    component: InfoOverlay,
    ...overlayScreen,
    notes: 'Generic VIPInfoOverlayScreen. Opened directly it shows the VIPSubscriptionButtonV2 trial-not-eligible popup. Params: { data: { headerIcon, title, body, infoList, reminder, buttons }, isPopup }.',
    source: 'features/vip/screens/VIPInfoOverlayScreen',
  },
  {
    id: 'changePlan',
    title: 'Choose your plan',
    component: ChangePlanScreen,
    path: ['change-plan'],
    notes: 'Legacy VIPChangePlanScreen (availablePlans; V1 cancel → "Plan Selection"). Tap a banner to expand it (500ms exp). Cancel membership → confirm popup → cancel flow.',
    source: 'features/vip/screens/VIPChangePlanScreen',
  },
  {
    id: 'invoice',
    title: 'View invoice',
    component: InvoiceScreen,
    path: ['invoices', 'invoice'],
    notes: 'VIPInvoiceScreen (PDF of invoiceUrl). Download → "PDF saved successfully".',
    source: 'features/vip/screens/VIPInvoiceScreen',
  },
];
