import type { ScreenDef } from '../../kit/types';
import { lazyScreen } from '../../kit/lazyScreen';

const LandingScreen = lazyScreen(() => import('./screens/LandingScreen'), 'LandingScreen');

const V = 'features/vip';
const SRC = `${V}/screens/VIPLandingScreen (+ ${V}/components/VIPModules/{VIPBannerModule, VIPMarketplaceBenefitsCarouselModule, VIPBenefitsModule, VIPFamilyPlanModule, VIPGuideStepsModule, VIPExpandableTextModule, VIPMembershipOverviewModule, VIPSavingsOverviewModule}, VIPSubscriptionButtonV2, VIPButton, VIPDashedBorder, VIPSlider, VIPPlanMembers, VIPStatusIndicator, VIPSkeletonLoader, VIPTransitionAnim)`;

const SRC_NP = `${V}/components/VIPModules/{VIPMembershipOverviewModule (showDefault), VIPOfferPlanModule, VIPSavingsOverviewModule (V1 overview), VIPBenefitsModule, VIPMarketplaceBenefitsCarouselModule + VIPSlider, VIPVideoCarouselModule, VIPBannerCarouselModule, VIPExpandableTextModule (grouped)}, VIPModuleRenderer, VIPOffersOverlayScreen (coupon), VIPSubscriptionButtonV2`;

/** landing screens — owned by the landing area (see MAPPING.md). */
export const landingScreens: ScreenDef[] = [
  {
    id: 'landing',
    title: 'noon One',
    component: LandingScreen,
    path: ['noon-one', 'noonvip'],
    statusBar: 'dark',
    source: `Figma Af34gfmhQ1D0wstXUEHSIF · 24:2604 (non-member) · ${SRC_NP} · member view: ${SRC}`,
    truth: 'mixed',
    notes:
      'Non-member view (prod, Figma 24:2604; look from Figma, behaviour from bappzaar — MAPPING.md › Non-member landing). Shimmer lottie while landingV2 loads, then the CMS modules: One logo header; offer plan card ("Get One at 20% Off", 15 days free trial tag); savings overview ("Save 6x"); value props (gift, marketplace circles, OSN+ and coupon icons, priority support strip); savings widget (VIPSlider: marketplace tiles autoplay every 3.5s, swipe them, labels cross-fade); OSN+ streaming carousel (scroll-snap, page dots, the CTA starts the trial); Partnerships (FAB Z → bank offers, STC → partner offer page); "Have a coupon code? Apply" → offers overlay with the voucher input; FAQ (the title collapses the list, rows expand). Scroll: the header fades in white with "noon One". Sticky "Start Free Trial": the first tap opens the plan-details sheet, later taps quick-subscribe with the saved card ("Pay with ••••4242" row → payment). After subscribing the success animation plays and the landing switches to the member view (membership overview, savings, benefits, FAQ; manage → membership/manage).',
  },
  {
    id: 'success',
    title: 'Subscribed (success animation)',
    component: LandingScreen,
    defaultParams: { demo: 'success' },
    statusBar: 'dark',
    source: `${V}/components/VIPTransitionAnim (VIPLandingScreen VIPEventEmitter.onVipMembershipChanged → showSuccessAnimation), ${V}/components/VIPModules/VIPMembershipOverviewModule, VIPSavingsOverviewModule`,
    notes:
      'Subscribes the demo user (monthly, 30-day trial) and plays vip-landing-success-animation: "Welcome to noon One" / trial copy rise in at 70% / 72.5% of 4s, the overlay fades, the member landing springs back up. Every noon One entry point now shows its subscribed state.',
  },
];
