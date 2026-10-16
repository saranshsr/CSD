import type { ScreenDef } from '../../kit/types';
import { lazyScreen } from '../../kit/lazyScreen';

const FamilyPlansScreen = lazyScreen(() => import('./screens/FamilyPlansScreen'), 'FamilyPlansScreen');
const PlanDetailsOverlayScreen = lazyScreen(() => import('./screens/PlanDetailsOverlayScreen'), 'PlanDetailsOverlayScreen');
const PlanOptionOverlayScreen = lazyScreen(() => import('./screens/PlanOptionOverlayScreen'), 'PlanOptionOverlayScreen');
const PlanSelectScreen = lazyScreen(() => import('./screens/PlanSelectScreen'), 'PlanSelectScreen');
const TrialGuideOverlayScreen = lazyScreen(() => import('./screens/TrialGuideOverlayScreen'), 'TrialGuideOverlayScreen');

const V = 'features/vip';

/** plans screens — owned by the plans area (see MAPPING.md). */
export const plansScreens: ScreenDef[] = [
  {
    id: 'plans',
    title: 'Choose your plan',
    component: PlanSelectScreen,
    path: ['noon-one-all-plans', 'vip-plans'],
    statusBar: 'dark',
    defaultParams: { source: '/noon-one-landingV2' },
    source: `${V}/screens/VIPQuickPlanSelectV3Screen (+ Plan/Plan.tsx, Plan/BundlePlan.tsx), components/VIPSubscriptionButtonV2, src/components/SegmentedControlTabSwitcher`,
    notes:
      'Live plan select (VIPUtil.showPlanSelectV2 always pushes V3; V1 VIPQuickPlanSelectScreen is legacy). Switch tiers (One Bundle ↔ One Standard, Standard selected by default as in prod; pill slides 500ms ease-out-cubic), pick Monthly / Annual or a streaming partner. First CTA tap opens the "Review your plan" sheet; after that the sticky button shows "Pay with ••••4242" and quick-subscribes (loader → success on the landing). "Pay with" → payment. Params: preSelectedTierCode (individual | yango), preSelectedPlanCode.',
  },
  {
    id: 'planDetails',
    title: 'Plan details (trial guide)',
    component: PlanDetailsOverlayScreen,
    presentation: 'modal',
    transition: 'noonone-overlay',
    defaultParams: { planCode: 'ONE_MONTHLY', variant: 'landing' },
    source: `${V}/utils/VIPPopupUtil.showPlanDetailDialog → screens/VIPGenericOverlayScreen + components/VIPPopups/VIPPlanDetailsPopup (REGULAR · FAMILY_PLAN); variant planSelect = screens/VIPInfoOverlayScreen via VIPUtil.showInfoOverlay`,
    notes:
      'variant landing (default): the sheet the landing "Start free trial" opens once — title, plan card with trial tag, body, reminder, CTA with Pay-with row. variant planSelect: plan-select review (VIPInfoOverlayScreen). variant family: family review with members + invoice. CTA quick-subscribes (1.2s loader) → membership active → pops to the landing success animation.',
  },
  {
    id: 'trialGuide',
    title: 'Trial guide',
    component: TrialGuideOverlayScreen,
    presentation: 'modal',
    transition: 'noonone-overlay',
    source: `${V}/screens/VIPTrialGuideOverlayScreen (opened by VIPPaymentV2Screen/VIPTrialGuideButton)`,
    notes: 'How the free trial works: day 1 / 28 / 30 timeline. GOT IT closes. Rows from data.plans.ts trialGuideData (server: trial guide touchpoint).',
  },
  {
    id: 'planOption',
    title: 'Plan options',
    component: PlanOptionOverlayScreen,
    presentation: 'modal',
    transition: 'noonone-overlay',
    source: `${V}/screens/VIPPlanOptionOverlayScreen (VIPUtil.showPlanOptionOverlay)`,
    notes: 'Only caller on master is VIPCancelMembershipV2Screen (switch-instead-of-cancel step, management). Select a plan (m-checkbox), Continue: for members it changes the plan + toast.',
  },
  {
    id: 'familyPlans',
    title: 'Family plans',
    component: FamilyPlansScreen,
    path: ['noon-one-sharing'],
    statusBar: 'dark',
    source: `${V}/screens/VIPFamilyPlansScreen (+ components/VIPPlanMembers, VIPBenefitsModule hideModuleWrapper, VIPExpandableTextModule grouped, VIPScrollEnterView)`,
    notes:
      'Tap Duo / Family: the header lottie plays the family→duo (0→81) / duo→family (81→161) segment and the tile border/price box spring to green. Sections fade-slide in on scroll (480ms). Sticky CTA opens the family review sheet → quick subscribe. Share invite → membership/manage when already a member.',
  },
];
