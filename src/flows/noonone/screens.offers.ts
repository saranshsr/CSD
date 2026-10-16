import type { ScreenDef } from '../../kit/types';
import { lazyScreen } from '../../kit/lazyScreen';

const AcceptInviteErrorOverlayScreen = lazyScreen(() => import('./screens/AcceptInviteErrorOverlayScreen'), 'AcceptInviteErrorOverlayScreen');
const AcceptInviteOverlayScreen = lazyScreen(() => import('./screens/AcceptInviteOverlayScreen'), 'AcceptInviteOverlayScreen');
const BundleScreen = lazyScreen(() => import('./screens/BundleScreen'), 'BundleScreen');
const ConfirmOfferPlanScreen = lazyScreen(() => import('./screens/ConfirmOfferPlanScreen'), 'ConfirmOfferPlanScreen');
const ConfirmVoucherPlanScreen = lazyScreen(() => import('./screens/ConfirmVoucherPlanScreen'), 'ConfirmVoucherPlanScreen');
const OffersOverlayScreen = lazyScreen(() => import('./screens/OffersOverlayScreen'), 'OffersOverlayScreen');
const OffersV2Screen = lazyScreen(() => import('./screens/OffersV2Screen'), 'OffersV2Screen');

const V = 'features/vip';
const overlay = { presentation: 'modal', transition: 'noonone-overlay' } as const;

/** offers screens — owned by the offers area (see MAPPING.md › Offers). */
export const offersScreens: ScreenDef[] = [
  {
    id: 'offers',
    title: 'noon One offers',
    component: OffersOverlayScreen,
    ...overlay,
    path: ['noon-one-vouchers', 'noon-one-bank-offers', 'noon-one-input-referrals', 'noon-one-referrals-input'],
    source: `${V}/screens/VIPOffersOverlayScreen (VIPUtil.showReferralsInputOverlay; components/VIPWave, VIPButton, VIPGenericOverlayScreen success popup)`,
    notes:
      'Tabs Voucher codes / Bank offers (params tab: vouchers | bank). Tap "Apply offer" on a card or type ONE3FOR1 / SARA25 / ONE30 / ENBD12 / MASHREQ50 and Redeem now → "Offer applied" popup (auto-advances after 2s) → Review and confirm. Any other code → error toast. Focus the field: the list collapses, the floating label shrinks and Redeem slides in. params empty=true → empty state, code=… → prefilled referral link.',
  },
  {
    id: 'partnerOffer',
    title: 'Partner offer',
    component: OffersV2Screen,
    defaultParams: { campaignCode: 'enbd' },
    path: ['noon-one-partner-offer', 'noon-one-stc'],
    source: `${V}/screens/VIPOffersV2Screen (+ components/VIPModules/VIPPartnerOfferPlanModule, VIPSubscriptionButtonV2)`,
    notes:
      'Partner campaign page (campaignCode enbd | stc). Scroll: the "Exclusive offer" header fades in; the sticky CTA slides up once the module CTA leaves the screen. Activate → quick subscribe with the saved card → pops back to the landing success animation. "Pay with •••• 4242" → payment; Explore other plans → plans.',
  },
  {
    id: 'confirmOffer',
    title: 'Confirm offer plan',
    component: ConfirmOfferPlanScreen,
    ...overlay,
    defaultParams: { offer: 'ONE30' },
    source: `${V}/screens/VIPConfirmOfferPlanScreen`,
    notes: 'Retention / partner offer confirmation sheet (master opens it from VIPCancelMembershipV2 offer step). Confirm Membership → createSubscription with the saved card (no card → payment screen) → landing success.',
  },
  {
    id: 'confirmVoucher',
    title: 'Confirm voucher plan',
    component: ConfirmVoucherPlanScreen,
    ...overlay,
    defaultParams: { offer: 'SARA25', code: 'SARA25' },
    source: `${V}/screens/VIPConfirmVoucherPlanScreen`,
    notes: 'Review and confirm after applying a code: trial row + price row, "<CODE> applied" strip, terms, Pay with •••• 4242 + Confirm → landing success. Back chevron reopens the offers overlay.',
  },
  {
    id: 'bundle',
    title: 'Bundle (Yango Play)',
    component: BundleScreen,
    presentation: 'modal',
    transition: 'sheet',
    statusBar: 'light',
    defaultParams: { bundlePartnerCode: 'yango' },
    path: ['noon-one-bundle'],
    source: `${V}/screens/VIPBundleV2Screen (live: VIPUtil.showBundleScreen always V2; /noon-one-bundle uses V1 VIPBundleScreen for non-yango codes — not ported)`,
    notes: 'Full-screen modal themed by the server style (Yango Play). Start free trial → quick subscribe → dismiss + landing success animation.',
  },
  {
    id: 'acceptInvite',
    title: 'Accept plan invite',
    component: AcceptInviteOverlayScreen,
    ...overlay,
    path: ['noon-one-share-invite'],
    source: `${V}/screens/VIPAcceptPlanInviteOverlayScreen (+ VIPAcceptInviteOverlaySkeleton, components/VIPMemberInitialHexagon, VIPModules/VIPBenefitsModule hideModuleWrapper)`,
    notes: 'Invitee entry (deep link /noon-one-share-invite?share_code=). Skeleton → family header lottie with the owner initial hexagon (params duo=true → Duo lottie). Join Family plan for free → member of the owner plan (role member) → landing success. params error=true → error overlay.',
  },
  {
    id: 'acceptInviteError',
    title: 'Accept invite error',
    component: AcceptInviteErrorOverlayScreen,
    ...overlay,
    source: `${V}/screens/VIPAcceptInviteErrorOverlayScreen`,
    notes: 'Server errorPopup (expired invite demo). Explore noon One → landing, Got it → dismiss.',
  },
];
