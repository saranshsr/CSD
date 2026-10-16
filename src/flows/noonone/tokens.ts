import type { TokenOverrides } from '../../foundations/tokens';

/**
 * noon One flow tokens (bappzaar features/vip/theme + per-screen styles.ts), exposed as CSS variables on every
 * noonone screen: colors → var(--nk-color-vip-*), radius → var(--nk-radius-vip-*), layout → var(--nk-layout-vip-*),
 * type → var(--nk-type-vip-*). Only values with no equal global token live here. One section per area
 * (base · landing · plans · payment · offers · entry), merged into `noononeFlowTokens`. See MAPPING.md.
 */

/** RN Text without lineHeight → CSS `line-height: normal`. */
const t = (size: number, weight: number, line: number | string = 'normal') => ({ size, line, weight });

// ─── base ─────────────────────────────────────────────
/**
 * Shared noon One tokens (features/vip/theme): VIPColors values with no equal global token, the
 * VIPOverlayBottomSheet / OverlayBottomSheet chrome and VIPStyles type scale (h40…b11).
 * Area-specific tokens live next to this file (tokens/<area>.ts) and are merged in ../tokens.ts.
 */
export const baseTokens = {
  /** OverlayBottomSheetMetrics (src/constants/OverlayBottomSheet.ts) */
  overlay: {
    /** ARBITRARY_ANIMATION_HEIGHT: sheet starts 300px below its resting position */
    enterFrom: 300,
    /** ANIMATION_DAMPING / ANIMATION_STIFFNESS, mass 1 */
    spring: { type: 'spring' as const, damping: 15, stiffness: 110, mass: 1 },
    /** ANIMATION_DURATION 350, Easing.inOut(Easing.ease) — scrim + close */
    ms: 350,
    ease: [0.42, 0, 0.58, 1] as [number, number, number, number],
    /** POP_UP_CENTER_OFFSET */
    popupCenter: 0.5,
    /** drag-to-close: CLOSE_THRESHOLD_RATIO × height capped at MAX_DISTANCE_TO_CLOSE, or VELOCITY_TO_CLOSE */
    closeRatio: 0.5,
    closeMax: 250,
    closeVelocity: 2000,
  },
  /** VIPButton: press scale 1 → 0.97 (in 100ms / out 200ms), onPress fires after 200ms */
  button: { pressScale: 0.97, inMs: 100, outMs: 200, pressDelayMs: 200 },
} as const;

export const baseFlowTokens: TokenOverrides = {
  colors: {
    /** BACKDROP_BACKGROUND_COLOR_RGB 30,30,30 × BACKGROUND_MAX_OPACITY_PERCENTAGE 0.7 */
    vipScrim: 'rgba(30, 30, 30, 0.7)',
    /** OverlayBottomSheet handle */
    vipHandle: '#B7B7B7',
    /** VIPColors.yellowDark */
    vipYellowDark: '#A36200',
    /** VIPColors.successSurface */
    vipSuccessSurface: '#F1F9F6',
    /** VIPColors.lightGreen */
    vipLightGreen: '#CBF6E5',
    /** VIPColors.lightYellow */
    vipLightYellow: '#FFF7C2',
    /** VIPColors.darkGrey */
    vipDarkGrey: '#394152',
    /** VIPColors.stepsLineChevron */
    vipStepsLine: '#C8CDD5',
    /** VIPColors.elevationShadow */
    vipElevation: '#242424',
    /** VIPColors.black2 */
    vipBlack2: '#262626',
    /** VIPColors.memberInitialHexagonBackground / Text */
    vipHexagonBg: '#FED2D2',
    vipHexagonText: '#C45C5C',
    /** VIPColors.black */
    vipBlack: '#000000',
  },
  radius: {
    /** VIPOverlayBottomSheet OVERLAY_SHEET_RADIUS */
    vipSheet: 18,
  },
  layout: {
    /** VIPOverlayBottomSheet marginBottom = VIP_OVERLAY_SHEET_FLOAT_SPACING (12) + safe-area bottom */
    vipSheetFloat: 12,
    /** OverlayBottomSheet overlayWrapper paddingTop */
    vipSheetTop: 60,
    /** handle 36×4 r2 at top −18 */
    vipHandleW: 36,
    vipHandleH: 4,
    vipHandleTop: -18,
    /** OverlayBottomSheet containerPopup marginHorizontal / overlayFloating paddingHorizontal */
    vipPopupInset: 20,
    vipFloatingInset: 12,
  },
  type: {
    // VIPStyles type scale (fontSize / lineHeight; letterSpacing via --nk-layout-vip-tracking-*)
    vipH40: { size: 40, line: 48, weight: 700 },
    vipH32: { size: 32, line: 40, weight: 700 },
    vipH28: { size: 28, line: 36, weight: 700 },
    vipH24: { size: 24, line: 32, weight: 700 },
    vipH20: { size: 20, line: 28, weight: 700 },
    vipH18: { size: 18, line: 24, weight: 700 },
    vipH16: { size: 16, line: 20, weight: 700 },
  },
};

// ─── landing ─────────────────────────────────────────────
/**
 * Landing area (features/vip/screens/VIPLandingScreen + components/VIPModules/*, VIPTransitionAnim, VIPSlider,
 * VIPPlanMembers, VIPStatusIndicator, VIPSubscriptionButtonV2). Values only where no global token is equal.
 * JS motion constants: `landingTokens`.
 */
export const landingTokens = {
  /** VIPLandingScreen: headerOpacity scrollY [0, 20] → [0, 1]; bgOffset scrollY [0, 300] → [0, −300] */
  headerFadeEnd: 20,
  bgParallaxEnd: 300,
  /** demo: VIPService.getVIPTouchpoints('landingV2') round-trip under the VIPSkeletonLoader lottie */
  loadingMs: 600,
  /** demo: useVIPQuickPayment.handlePayment → createSubscription round-trip (button Loader) */
  quickPayMs: 1200,
  /** sticky footer translateY [stickyHeight + 12 → 0], 300ms Easing.ease */
  sticky: { extra: 12, ms: 300, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
  /** VIPTransitionAnim */
  transition: {
    successMs: 4000,
    introMs: 3000,
    fadeOutMs: 500,
    fadeOutDelayMs: 200,
    /** Easing.ease */
    fadeEase: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
    /** top / bottom text: delay successMs × 0.7 / × 0.725, 450ms Easing.out(Easing.sin), translateY 0 → −60, opacity 0 → 1 */
    topDelay: 0.7,
    bottomDelay: 0.725,
    textMs: 450,
    textEase: [0.61, 1, 0.88, 1] as [number, number, number, number],
    textRise: -60,
    /** contentAnim: content translateY [0,1] → [0,200], opacity [1,0]; spring back to 0 (mass 1, stiffness 80, RN default damping 10) */
    contentOffset: 200,
    contentSpring: { type: 'spring' as const, mass: 1, stiffness: 80, damping: 10 },
  },
  /** VIPExpandableTextModule EXPAND_ANIMATION_DURATION, Easing.out(Easing.cubic) chevron; LayoutAnimation easeInEaseOut */
  expand: { ms: 300, chevronEase: [0.215, 0.61, 0.355, 1] as [number, number, number, number], layoutEase: [0.42, 0, 0.58, 1] as [number, number, number, number] },
  /** VIPSlider: 400ms Easing.inOut(Easing.ease), autoplay every 3500ms, slideWidth 80, scaleFactor 0.5, label height 76 */
  slider: { ms: 400, ease: [0.42, 0, 0.58, 1] as [number, number, number, number], autoplayMs: 3500, slideWidth: 80, scale: 0.5, labelHeight: 76, swipeThreshold: 20 },
  /** VIPStatusIndicator: 91 frames @60fps loop; ring scale 0 → 1.25 by frame 60 (bezier 0,0,.667,1), opacity 1 → 0 frames 30–60 */
  status: { totalMs: (91 * 1000) / 60, scaleEndMs: 1000, opacityStartMs: 500, opacityEndMs: 1000, scaleEase: [0, 0, 0.667, 1] as [number, number, number, number], maxScale: 1.25 },
  /** VIPPlanMembers MEMBER_STROKE_WIDTH */
  memberStroke: 1.6,
  /** VIPPlanMemberColors (gradient pairs are flat) */
  memberColors: ['var(--nk-color-vip-member1)', 'var(--nk-color-vip-member2)', 'var(--nk-color-vip-member3)', 'var(--nk-color-vip-member4)', 'var(--nk-color-vip-member5)'],
  /** VIPMembershipOverviewModule headerAnimation height = screenWidth × ratio / 100 (ratio default 100 → 260 fallback in styles) */
  overviewAnimHeight: 260,
} as const;

export const landingFlowTokens: TokenOverrides = {
  colors: {
    /** VIPBenefitsModule description #02060CBF */
    vipInk75: '#02060CBF',
    /** dashed dividers #02060C26 */
    vipInk15: '#02060C26',
    /** VIPSubscriptionButtonV2 paymentRowHeaderText #02060c73 */
    vipInk45: '#02060C73',
    /** VIPTransitionAnim bottomText #02060C99 */
    vipInk60: '#02060C99',
    /** VIPMarketplaceBenefitsCarousel / VIPBannerModule title #171717 */
    vipInk171717: '#171717',
    /** VIPGuideStepsModule step border #E5E5E5 */
    vipStepBorder: '#E5E5E5',
    /** VIPLandingScreen backButton border #E3E3E3 */
    vipBackBorder: '#E3E3E3',
    /** VIPLandingScreen cancelledAnimationMessage #404040 */
    vipCancelledText: '#404040',
    /** VIPLandingScreen partnerCalloutContainer default #1C1C1B */
    vipFlyoutBg: '#1C1C1B',
    /** reminderToast border #EEEEEE */
    vipToastBorder: '#EEEEEE',
    /** paymentTermsContainer border #EDEDED */
    vipTermsBorder: '#EDEDED',
    /** VIPMembershipOverviewModule headerMessage gradient #F0FFF9 / bg #F7FFFC */
    vipMintFrom: '#F0FFF9',
    vipMintBg: '#F7FFFC',
    /** VIPFamilyPlanModule manageButton #FFFFFFCC */
    vipWhite80: '#FFFFFFCC',
    /** manageMembershipButtonContainer border #FFFFFF14 */
    vipWhite8: '#FFFFFF14',
    /** VIPSavingsOverviewModule centeredTitle / centeredSubtitle #787878 */
    vipSavingsGrey: '#787878',
    /** VIPSavingsOverviewModule overviewSubtitleContainer gradient #DFFEF3 → #FFFFFF */
    vipSavingsMint: '#DFFEF3',
    /** VIPPlanMemberColors */
    vipMember1: '#2F8E88',
    vipMember2: '#3392FF',
    vipMember3: '#3FA199',
    vipMember4: '#757ADB',
    vipMember5: '#C655EC',
    /** VIPStatusIndicator DEFAULT_COLOR rgb(15,136,87) ring: radial 0.37 color → 0.685 mixWithWhite(.55) → white, fill 0.3 / stroke 0.4 */
    vipStatusMid: 'rgb(135, 196, 171)',
    /** VIPLandingScreen shadow2: shadowColor grey, offset 3.2, opacity .1, radius 3.2 */
    vipHeaderShadow: 'rgba(128, 128, 128, 0.1)',
    /** member landing bgImg stand-in (server image): noon One banner peach → page */
    vipBgFrom: '#FEDEA9',
  },
  layout: {
    /** VIPLandingScreen backButton 39 × 39, header row 40 */
    vipBackSize: 39,
    vipHeaderRow: 40,
    /** chevron-left-rounded 9 × 18, marginStart scale(−2) */
    vipChevronW: 9,
    vipChevronH: 18,
    /** bgImage height 320 */
    vipBgHeight: 320,
    /** stickyButton height 60 / with payment 48 */
    vipStickyButton: 60,
    vipStickyButtonPay: 48,
    /** flyout minHeight 40 */
    vipFlyoutMin: 40,
    /** VIPSubscriptionButtonV2 cardType 44 × 40 */
    vipCardW: 44,
    vipCardH: 40,
    /** VIPBenefitsModule icon 44, leadingIcon 24, mpIcon 34 (−15 overlap), description maxWidth 230, button minWidth 127 */
    vipBenefitIcon: 44,
    vipBenefitMp: 34,
    vipBenefitMpOverlap: -15,
    vipBenefitDescMax: 230,
    vipBenefitButtonMin: 127,
    /** module header icon height 20, title row marginBottom −8 */
    vipModuleHeaderIcon: 20,
    vipModuleHeaderPull: -8,
    /** VIPGuideStepsModule step 43 / radius 22 */
    vipStep: 43,
    vipStepRadius: 22,
    /** VIPGuideStepsModule stepTitle fontSize 8 */
    vipStepUnitSize: 8,
    /** VIPMarketplaceBenefitsCarousel mpIcon 80, label 76 */
    vipMpIcon: 80,
    vipMpLabel: 76,
    /** VIPFamilyPlanModule cornerImage 122 × 107, manage 40, button 44 */
    vipFamilyCornerW: 122,
    vipFamilyCornerH: 107,
    vipFamilyManage: 40,
    vipFamilyButton: 44,
    /** VIPMembershipOverviewModule */
    vipOverviewAnimTop: -70,
    vipOverviewTitleTop: -162,
    vipOverviewPlanMin: 70,
    vipOverviewHeaderMsg: 52,
    vipOverviewSwitches: 36,
    vipOverviewFooterIcon: 32,
    vipOverviewFooterIconBox: 34,
    vipOverviewAction: 36,
    vipOverviewButton: 40,
    /** VIPSavingsOverviewModule button minHeight 45, centered amount height 32, mpImage 60 */
    vipSavingsButton: 45,
    vipSavingsAmount: 32,
    vipSavingsMpImage: 60,
    /** letterSpacing: VIPStyles h* −0.25, h18/h16/b16 −0.15, b14..b11 −0.1; overview name −0.42; savings centered title 3; VIPTransitionAnim −0.4 / −0.14; plan member −0.28 */
    vipTrackH: -0.25,
    vipTrackH18: -0.15,
    vipTrackB: -0.1,
    vipTrackTitle: -0.4,
    vipTrackSubtitle: -0.14,
    vipTrackWide: 3,
    /** VIPTransitionAnim textContainer top 62% */
    vipSuccessTextTop: '62%',
    /** pressed FAQ row scale .99 */
    vipRowPressScale: 0.99,
  },
  spacing: {
    /** VIPMembershipOverviewModule subtitle marginBottom 28; VIPSavingsOverviewModule centeredContent paddingTop 22 */
    vipS28: 28,
    vipS22: 22,
  },
  radius: {
    /** pills: VIPPlanMembers container r40, action button r100 */
    vipR40: 40,
    vipR100: 100,
  },
  type: {
    /** headerTitle 16 bold (RN Text default lineHeight) */
    vipHeaderTitle: { size: 16, line: 'normal', weight: 700 },
    /** stickyButtonText 18 bold; with payment (RTL 16) */
    vipSticky: { size: 18, line: 'normal', weight: 700 },
    /** viewPlansButtonText 14/600 */
    vipViewPlans: { size: 14, line: 'normal', weight: 600 },
    /** paymentTerms p 13 / 23 */
    vipTerms: { size: 13, line: 23, weight: 400 },
    /** flyout p 14/500 */
    vipFlyout: { size: 14, line: 'normal', weight: 500 },
    /** reminderToastText 14 */
    vipToast: { size: 14, line: 'normal', weight: 400 },
    /** VIPSubscriptionButtonV2 paymentRowHeaderText 13/500, paymentText 15/500 */
    vipPayLabel: { size: 13, line: 'normal', weight: 500 },
    vipPayText: { size: 15, line: 'normal', weight: 500 },
    /** VIPBenefitsModule header 12/500, title 16 bold, description 13, button 14 bold */
    vipModuleHeader: { size: 12, line: 18, weight: 500 },
    vipBenefitTitle: { size: 16, line: 'normal', weight: 700 },
    vipBenefitDesc: { size: 13, line: 'normal', weight: 400 },
    vipBenefitButton: { size: 14, line: 'normal', weight: 700 },
    /** VIPGuideStepsModule stepTitle 8 bold, stepValue h18 medium, row title b14 semibold, subtitle b12 */
    vipStepUnit: { size: 8, line: 'normal', weight: 700 },
    vipStepValue: { size: 18, line: 24, weight: 500 },
    vipB16Bold: { size: 16, line: 22, weight: 700 },
    vipB16Semibold: { size: 16, line: 22, weight: 600 },
    vipB14Semibold: { size: 14, line: 20, weight: 600 },
    vipB14: { size: 14, line: 20, weight: 400 },
    vipB13: { size: 13, line: 18, weight: 400 },
    vipB13Medium: { size: 13, line: 18, weight: 500 },
    vipB13Bold: { size: 13, line: 18, weight: 700 },
    vipB12: { size: 12, line: 18, weight: 400 },
    vipB12Medium: { size: 12, line: 18, weight: 500 },
    vipB11: { size: 11, line: 14, weight: 400 },
    vipB11Bold: { size: 11, line: 14, weight: 700 },
    vipH16Bold: { size: 16, line: 20, weight: 700 },
    vipH20Bold: { size: 20, line: 28, weight: 700 },
    vipH24Bold: { size: 24, line: 32, weight: 700 },
    vipH28Heavy: { size: 28, line: 36, weight: 800 },
    vipH32Bold: { size: 32, line: 40, weight: 700 },
    /** VIPMembershipOverviewModule shareInviteButtonText 12/16 semibold */
    vipOverviewAction: { size: 12, line: 16, weight: 600 },
    /** VIPFamilyPlanModule title b16 bold lh 22 */
    vipFamilyTitle: { size: 16, line: 22, weight: 700 },
    /** VIPSavingsOverviewModule button 17 bold */
    vipSavingsButton: { size: 17, line: 'normal', weight: 700 },
    /** VIPTransitionAnim topText 24/800, bottomText 15/500 */
    vipSuccessTitle: { size: 24, line: 'normal', weight: 800 },
    vipSuccessSubtitle: { size: 15, line: 'normal', weight: 500 },
    /** cancelled title 20 bold */
    vipCancelledTitle: { size: 20, line: 'normal', weight: 700 },
    /** VIPPlanMembers memberText: fontSize size/2, lineHeight 24, bold */
    vipMemberInitial14: { size: 14, line: 24, weight: 700 },
    vipMemberInitial16: { size: 16, line: 24, weight: 700 },
    /** VIPVideoCarousel / mp label subtitle */
    vipMpSubtitle: { size: 12, line: 18, weight: 400 },
  },
};

// ─── landing · non-member (prod Figma) ─────────────────────────────────────────────
/**
 * Non-member landing as shipped in prod: Figma Af34gfmhQ1D0wstXUEHSIF · 24:2604 ("113", 375 wide). Every value is
 * taken from the frame (get_design_context per section); behaviour from the bappzaar VIP modules (MAPPING.md ›
 * Non-member landing). CSS vars: --nk-color-vip-np-*, --nk-layout-vip-np-*, --nk-type-vip-np-*, --nk-shadow-vip-np-*.
 */
export const landingNpTokens = {
  /** VIPSlider in the savings widget: centre tile 80, neighbours ×0.5 (40), 26px gaps between tile edges */
  savingsSlider: { centre: 80, scale: 0.5, gap: 26 },
  /** VIPVideoCarouselModule (Slider isSlideSizeScrolling, slideSpacing 16): card 325 × 480 (Figma) */
  video: { cardW: 325, gap: 16, inset: 12 },
  /** PageControl (Scrolling indicator 24:396): current dot 6.5, others 3.96 white 43%, 5.73 apart */
  dots: { active: 6.5, size: 3.96, gap: 5.73 },
  /**
   * Logo art boxes (px, inside the 80px savings tile; the small Figma tiles are 40px = this × 0.5 under the slider
   * scale). `inset` = CSS inset in %, else a centred w × h box nudged by dx / dy.
   */
  tiles: {
    noon: { w: 60, h: 18, dx: 0.03, dy: 1.37 },
    food: { w: 44, h: 25, dx: 0, dy: 0 },
    nownow: { w: 46, h: 64, dx: -1, dy: -1 },
    minutes: { w: 60, h: 14, dx: 0, dy: 0 },
    supermallA: { inset: '31.18% 19.1% 50.19% 21.71%' },
    supermallB: { inset: '49.83% 36.35% 31.69% 21.71%' },
  },
  /** value-prop marketplace circles (35px; now now 32.94) */
  circles: {
    noon: { w: 19.721, h: 5.752, dx: 0 },
    food: { w: 26.132, h: 24.638, dx: 0 },
    nownow: { w: 18.653, h: 25.436, dx: -2.05 },
    minutes: { w: 28.172, h: 6.573, dx: 0 },
    supermallA: { inset: '36.89% 29.11% 49.96% 29.11%' },
    supermallB: { inset: '50.06% 41.28% 36.9% 29.11%' },
  },
  /** value-prop icon glyphs inside the 44px circle: x, y, w, h */
  glyphs: {
    gift: [[11.38, 11.79, 21.231, 20.427]],
    osn: [[5.63, 10.61, 31.293, 21.145]],
    /** coupon: b, a, c, d layers of the 27px group at (8.5, 8.5) + (0.25, 5.15) */
    coupon: [
      [8.75, 13.65, 6.905, 16.689],
      [15.66, 13.65, 19.586, 16.689],
      [20.11, 17.95, 8.098, 8.083],
      [31.99, 27.04, 3.255, 3.302],
    ],
  },
  /**
   * Partnership card textures (Figma mask group, clipped to the top-part shape): box left/top/width/height px, the
   * rotated image w × h centred in it, rotation, image opacity (the group is at .25 / STC .4 + blur 1).
   */
  partnerTex: {
    fab: [
      { left: 14.54, top: 56.13, w: 132.11, h: 126.03, iw: 112.5, ih: 71.0, rot: -39.05, opacity: 0.6, tex: 'a' },
      { left: -5.06, top: -91.72, w: 141.64, h: 158.63, iw: 134.18, ih: 84.69, rot: 120.95, opacity: 0.6, tex: 'a' },
      { left: 75.66, top: -25.03, w: 140.76, h: 158.79, iw: 134.38, ih: 84.81, rot: -120.1, opacity: 1, tex: 'b' },
    ],
    stc: [{ left: -38.66, top: -92.93, w: 262.49, h: 330.55, iw: 262.49, ih: 330.55, rot: 0, opacity: 1, tex: 'stc' }],
    /** logo boxes: FAB two layers, STC one (left, top, w, h) */
    fabLogo: [
      [53.85, 42.72, 50.155, 41.068],
      [102.83, 42.62, 19.28, 37.886],
    ],
    stcLogo: [[54.72, 45.95, 58.067, 34.469]],
  },
} as const;

export const landingNpFlowTokens: TokenOverrides = {
  colors: {
    /** page background gray/200 */
    vipNpPage: '#F5F5F5',
    /** landingV2.offerFlyout.backgroundColor (server hex; prod screenshot "Don't miss noon One at the lowest price") */
    vipNpOfferFlyout: '#52875D', // token-lint-ignore — flow token definition (server colour)
    /** value-prop sub text rgba(2,6,12,.75); value-prop title rgba(2,6,12,.92) */
    vipNpInk92: 'rgba(2, 6, 12, 0.92)',
    /** marketplace circle border rgba(2,6,12,.05) */
    vipNpInk5: 'rgba(2, 6, 12, 0.05)',
    /** priority-support strip gradient #EBFEFD → white */
    vipNpSupportFrom: '#EBFEFD',
    /** value-prop marketplace circles (35px) */
    vipNpMpNoon: '#F7E628',
    vipNpMpFood: '#E5004E',
    vipNpMpSupermall: '#2122B8',
    vipNpMpNownow: '#EF5227',
    vipNpMpMinutes: '#D22D29',
    /** savings widget marketplace tiles (Marketplaces component) */
    vipNpTileNoon: '#FFE600',
    vipNpTileFood: '#FC5190',
    vipNpTileSupermall: '#2122B8',
    vipNpTileNownow: '#EF5227',
    vipNpTileMinutes: '#BB4544',
    /** savings widget radial bg rgba(252,252,252) → white */
    vipNpSavingsFrom: '#FCFCFC',
    /** Black1 / Gray#1 / Gray#3 */
    vipNpText171717: '#171717',
    vipNpText404040: '#404040',
    vipNpChevron: '#737373',
    /** streaming card sub #CACACA */
    vipNpStreamSub: '#CACACA',
    /** streaming page control: inactive dot white 43% */
    vipNpDotInactive: 'rgba(255, 255, 255, 0.43)',
    /** partnership duration pill border / gradient start #D2D2D2 */
    vipNpPillGrey: '#D2D2D2',
    /** coupon container dashed border */
    vipNpCouponBorder: '#75DAB1',
    /** back button border #E3E3E3, icon #404040 */
    vipNpBackBorder: '#E3E3E3',
    /** VIPOfferPlanModule demo CMS colours (offerData.borderColors, tag.borderColors / backgroundColor / textColor); white fallback = palette white */
    vipNpOfferBorder: '#8EE0BE',
    vipNpOfferTagBorder: '#9FE5C8',
    vipNpOfferTagBorderTo: '#E6FAF1',
    vipNpOfferTagBg: '#EAFBF4',
    /** VIPSavingsOverviewModule overviewSubtitleContainer gradient #DFFEF3 → white (= vipSavingsMint) · subtitle #108757 */
    /** streaming poster stand-in (no CMS video in the frame): black → #1C1C1C */
    vipNpPosterTo: '#1C1C1C',
  },
  shadow: {
    /** Bottom section drop-shadow 0 −4 17.6 rgba(0,0,0,.1) */
    vipNpFooter: '0 -4px 17.6px rgba(0, 0, 0, 0.1)',
  },
  layout: {
    /** back button 39.92 circle, border 1.247 */
    vipNpBack: 40,
    vipNpBackBorderW: 1.25,
    /** header: logo 75.6 × 43, illustration 121.2 × 62.3; header column 241 wide, gap 12 / 6 */
    vipNpLogoW: 75.63,
    vipNpLogoH: 43.02,
    vipNpIllustrationW: 121.23,
    vipNpIllustrationH: 62.31,
    /** Header frame top 78 − status bar 44 */
    vipNpHeaderTop: 34,
    /** value props: icon circle 44, star 16, mp circles 35 (−14.93 overlap), nownow 32.94 */
    vipNpIcon: 44,
    vipNpStar: 16,
    vipNpMp: 35,
    vipNpMpOverlap: -14.93,
    vipNpMpNownow: 32.94,
    vipNpMpBorder: 0.75,
    vipNpRow: 40,
    /** savings tiles: 80 r12 centre */
    vipNpTile: 80,
    vipNpSavingsLabel: 38,
    /** streaming card 325 × 480; CTA 293 × 50 r11.3; top overlay 143.7, bottom overlay 179 */
    vipNpStreamW: 325,
    vipNpStreamH: 480,
    vipNpStreamCtaW: 293,
    vipNpStreamCtaH: 50,
    vipNpStreamCtaR: 11.31,
    vipNpStreamTop: 143.74,
    vipNpStreamBottom: 178.97,
    vipNpStreamLogoW: 40,
    vipNpStreamLogoH: 26,
    /** partnership card 167.5 × 252.77; View now pill 90 × 30; duration pill text box */
    vipNpPartnerW: 167.5,
    vipNpPartnerH: 252.77,
    vipNpPillW: 90,
    vipNpPillH: 30,
    vipNpPillChevron: 17,
    /** Figma letter-spacing −1% (label scale) */
    vipNpTrack: '-0.01em',
    vipNpTrackTitle: '-0.016em',
    vipNpTrackOsn: '-0.3px',
    /** sticky CTA 56; footer padding: top 12, bottom 43 below the CTA in the 812 frame = inset-bottom + 9 */
    vipNpCta: 56,
    vipNpFooterPadB: 9,
    /** VIPOfferPlanModule: tag 28 tall, maxWidth 170, left radius 24, icon 14; subtitle icon 18 */
    vipNpOfferTagH: 28,
    vipNpOfferTagMax: 170,
    vipNpOfferTagR: 24,
    vipNpOfferTagIcon: 14,
    vipNpOfferSubIcon: 18,
    /** streaming poster stand-in: OSN+ logo 120 wide */
    vipNpPosterLogo: 120,
    /** header block is 189.2 tall and the value props start 204 below its top → −5.2 against the 20 column gap */
    vipNpHeaderGap: -5.2,
    /** back button: 14.2 below the status bar, x 15.5 */
    vipNpBackTop: 14.2,
    vipNpBackLeft: 15.5,
  },
  type: {
    /** Primary/Title2/ExtraBold 40/42 */
    vipNpTitle: { size: 40, line: 42, weight: 800 },
    /** Label3/Medium 14/18 · Label3/Semibold 14/18 · Label3/Bold 14/18 */
    vipNpLabel3Medium: { size: 14, line: 18, weight: 500 },
    vipNpLabel3Semibold: { size: 14, line: 18, weight: 600 },
    vipNpLabel3Bold: { size: 14, line: 18, weight: 700 },
    /** Label2/Bold 16/20 · Label2/Semibold 16/20 */
    vipNpLabel2Bold: { size: 16, line: 20, weight: 700 },
    vipNpLabel2Semibold: { size: 16, line: 20, weight: 600 },
    /** Label4/Regular 12/14 */
    vipNpLabel4: { size: 12, line: 14, weight: 400 },
    /** Label5/Semibold 11/12 (View now) · Tiny/Medium 10/12 (duration pill) */
    vipNpLabel5Semibold: { size: 11, line: 12, weight: 600 },
    vipNpTinyMedium: { size: 10, line: 12, weight: 500 },
    /** streaming card: title 15.08/18.85 bold, sub 11.31/13.19, CTA 15.08/18.85 semibold */
    vipNpStreamTitle: { size: 15.077, line: 18.846, weight: 700 },
    vipNpStreamSub: { size: 11.308, line: 13.192, weight: 400 },
    vipNpStreamCta: { size: 15.077, line: 18.846, weight: 600 },
    /** Label1/Semibold 18/24 (Start Free Trial) */
    vipNpCta: { size: 18, line: 24, weight: 600 },
    /** VIPOfferPlanModule: title p 18 regular / b 18 bold (RN default line height), tag 13/600, subtitle 14 regular / b semibold */
    vipNpOfferTitle: { size: 18, line: 'normal', weight: 400 },
    vipNpOfferTag: { size: 13, line: 'normal', weight: 600 },
    vipNpOfferSub: { size: 14, line: 'normal', weight: 400 },
    /** VIPSavingsOverviewModule overview: savingsText 16/22 medium (with totalSavings) */
    vipNpB16Medium: { size: 16, line: 22, weight: 500 },
  },
};

// ─── plans ─────────────────────────────────────────────
/** RN Text without lineHeight → CSS `line-height: normal` */

/**
 * Plans area tokens: VIPQuickPlanSelectV3Screen (+ Plan / BundlePlan), VIPPlanDetailsPopup, VIPInfoOverlayScreen
 * (plan-select review), VIPTrialGuideOverlayScreen, VIPPlanOptionOverlayScreen, VIPFamilyPlansScreen, VIPPlanMembers.
 * Only literals with no equal global token. See mapping/plans.md.
 */
export const plansFlowTokens: TokenOverrides = {
  colors: {
    /** VIPQuickPlanSelectV3Screen container / pageTitleContainer / plansContainer, VIPTrialGuideOverlayScreen */
    vipPlansBg: '#F2F2F4',
    /** tabsContainer backgroundColor */
    vipTabsBg: '#EBE9E9',
    /** activeTab borderColor */
    vipTabActiveBorder: '#D5D5D5',
    /** paymentTermsContainer borderColor (also VIPLanding) */
    vipTermsBorder: '#EDEDED',
    /** header backButton borderColor */
    vipBackBorder: '#E3E3E3',
    /** offersButtonText */
    vipOffersText: '#171717',
    /** Plan trial-message gradient (selected: #29AE78 → successTag; unselected: #E0E4E7 → #EBECEE) */
    vipTrialGreen: '#29AE78',
    vipTrialGrey: '#E0E4E7',
    vipTrialGreyEnd: '#EBECEE',
    /** planContainerSelected borderColor */
    vipPlanSelectedBorder: '#329537',
    /** savingsText */
    vipSavingsText: '#12945F',
    /** trialMessageTextStyle (unselected) */
    vipTrialText: '#0E0E0EC8',
    /** bundle texts (#0e0e0ec9) */
    vipBundleText: '#0E0E0EC9',
    /** loadingTextStyle small */
    vipLoadingSmall: '#4E4E4E',
    /** VIPSubscriptionButtonV2 paymentRowHeaderText */
    vipPayWithLabel: '#02060C73',
    /** VIPPlanDetailsPopup trialMessage gradient end + border, monthlyPrice, dashed */
    vipMint: '#F7FFFC',
    vipMintBorder: '#E7F6F0',
    vipInk92: '#0E0E0EEB',
    vipDash15: '#02060C26',
    /** VIPPlanOptionOverlay legacy tag gradient */
    vipTagGreen: '#E8F8EF',
    /** VIPTrialGuideOverlayScreen */
    vipGuideBorder: '#E5E5E5',
    vipGuideLine: '#DCDEE2',
    /** VIPStyles.shadowSuccessGlow (#26B57C, 0 2 4, .4) */
    vipSuccessGlow: 'rgba(38, 181, 124, 0.4)',
    /** VIPPlanMemberColors */
    vipMember1: '#2F8E88',
    vipMember2: '#3392FF',
    vipMember3: '#3FA199',
    vipMember4: '#757ADB',
    vipMember5: '#C655EC',
    /** VIPUpgradePlanDetailsPopup upcoming tag (#F0FFF9) — family/upgrade review */
    vipMintSoft: '#F0FFF9',
    /** RN shadow black .4 r8 y7 (sticky button containers) */
    vipStickyShadow: 'rgba(0, 0, 0, 0.4)',
    /** VIPStyles.shadow2 grey .1 r3.2 y3.2 (scroll header) */
    vipHeaderShadow: 'rgba(128, 128, 128, 0.1)',
  },
  radius: {
    vipPlanInner: 14.5,
  },
  layout: {
    /** VIPQuickPlanSelectV3Screen tab width (LTR 140 / RTL 152) */
    vipTabWidth: 140,
    vipTabMinHeight: 44,
    vipBackButton: 39,
    vipStickyButton: 56,
    vipStickyButtonPay: 48,
    vipDetailsButton: 60,
    vipCardIconW: 44,
    vipCardIconH: 40,
    vipRadio: 21,
    vipBundleTile: 26,
    vipGuideTime: 43,
    vipGuideLineH: 25,
    vipFamilyLottieOverlap: -56,
    vipTrackingTitle: -0.4,
    vipTrackingDetails: -1,
    vipTrackingSub: -0.3,
    vipTrackingB16: -0.15,
    vipTrackingB14: -0.1,
    vipTrackingH: -0.25,
    vipSavingShimmerDuration: 1200,
  },
  type: {
    /** pageTitle 32/800, tracking −0.4 */
    vipPageTitle: t(32, 800),
    /** headerTitle 16 bold */
    vipHeaderTitle: t(16, 700),
    /** tierTabText 15 bold */
    vipTierTab: t(15, 700),
    /** tierDiscountText 12 bold */
    vipTierDiscount: t(12, 700),
    /** planTitle b16 bold */
    vipB16Bold: t(16, 700, 22),
    /** monthlyPrice b16 semibold */
    vipB16Semibold: t(16, 600, 22),
    /** description b14 regular / benefit b14 medium / b14 bold */
    vipB14Regular: t(14, 400, 20),
    vipB14Medium: t(14, 500, 20),
    vipB14Semibold: t(14, 600, 20),
    vipB14Bold: t(14, 700, 20),
    vipB13Regular: t(13, 400, 18),
    vipB13Semibold: t(13, 600, 18),
    vipB12Regular: t(12, 400, 18),
    vipB12Medium: t(12, 500, 18),
    vipB12Semibold: t(12, 600, 18),
    vipB12Bold: t(12, 700, 18),
    /** savingsText / trial msg 14/600, trial msg unselected 14/400 */
    vip14Semibold: t(14, 600),
    vip14Regular: t(14, 400),
    vip14Medium: t(14, 500),
    vip14Bold: t(14, 700),
    vip13Medium: t(13, 500),
    vip13Regular: t(13, 400),
    vip12Regular: t(12, 400),
    vip12Semibold: t(12, 600),
    vip15Bold: t(15, 700),
    vip15Medium: t(15, 500),
    /** VIPSubscriptionButtonV2 stickyButtonText 18 bold */
    vip18Bold: t(18, 700),
    /** paymentTermsTextStyle 13/23 */
    vipTerms: t(13, 400, 23),
    /** reviewBodyTextStyle / bodyTextStyle 14/20 */
    vipBody14: t(14, 400, 20),
    /** reviewTitleStyle 18 (bold from VIPInfoOverlay title) */
    vip18Title: t(18, 700),
    /** VIPPlanDetailsPopup planPopupTitle 28/800 −1 */
    vipPopupTitle: t(28, 800),
    /** VIPPlanDetailsPopup planTitle h18 bold */
    vipH18Bold: t(18, 700, 24),
    vipH16Bold: t(16, 700, 20),
    vipH16Semibold: t(16, 600, 20),
    vipH20Bold: t(20, 700, 28),
    /** reminderTitle 15/700, reminderDescription 13/20 */
    vipReminderTitle: t(15, 700),
    vipReminderBody: t(13, 400, 20),
    /** trial guide: time title 8 bold, value 18/500 */
    vipGuideTimeTitle: t(8, 700),
    vipGuideTimeValue: t(18, 500),
    /** family: step number 9/800 lh 13.91 */
    vipStepNumber: t(9, 800, '13.91px'),
    /** share text 13/18 semibold, footer 12/16 medium */
    vipShareText: t(13, 600, 18),
    vipFooterNote: t(12, 500, 16),
    /** VIPPlanMembers initial: size/2 bold lh 24 */
    vipMemberInitial: t(14, 700, 24),
  },
};

// ─── payment ─────────────────────────────────────────────
/** RN Text without lineHeight → CSS `line-height: normal`. */

/**
 * Payment area tokens — VIPPaymentV2Screen (+ CardSelect / MobileSelect / TrialGuideButton), VIPAddCardOverlayScreen,
 * VIPAddCvvOverlayScreen, VIPMobilePayOverlayScreen, VIPInfoOverlayScreen, VIPGenericOverlayScreen (VIPInfoPopup /
 * VIPUpdatePopup) and the legacy src/components/Overlay those three overlays still use. Values with no equal global
 * token only; see MAPPING.md.
 */
export const paymentTokens = {
  /** src/components/Overlay defaultProps: animationDuration 250, Animated.spring tension 40 / friction 7, ArbitraryHeight 300 */
  legacyOverlay: {
    enterFrom: 300,
    ms: 250,
    ease: [0.42, 0, 0.58, 1] as [number, number, number, number],
    // RN Animated.spring origami conversion: stiffness = (tension − 30) × 3.62 + 194, damping = (friction − 8) × 3 + 25
    spring: { type: 'spring' as const, stiffness: 230.2, damping: 22, mass: 1 },
    /** bounceMargin={0} on every VIP overlay; close button lives 18px above the card */
  },
  /** VIPPaymentV2Screen header bg: interpolateColor(scrollY, [0, 30], transparent → white) */
  headerFadePx: 30,
  /** demo createSubscription / payment-intent round trip */
  subscribeMs: 1500,
  /** demo card save / boku opt-in round trip */
  apiMs: 900,
  /** VIPMobilePayOverlayScreen OTP_LENGTH + demo boku response */
  otpLength: 6,
  otpCoolDown: 30,
  otpAttempts: 3,
} as const;

export const paymentFlowTokens: TokenOverrides = {
  colors: {
    /** VIPPaymentV2Screen container / VIPAddCardOverlayScreen feedbackView */
    vipPayPage: '#F2F2F4',
    /** VIPLandingScreen / VIPPaymentV2Screen backButton borderColor */
    vipBackBorder: '#E3E3E3',
    /** cardMethodWrapper / applePayWrapper border, VIPDashedBorder colour */
    vipPayMethodBorder: '#262A331A',
    /** methodSelected borderColor */
    vipPayMethodSelected: '#DEE7FE',
    /** cardTextWrapper borderBottom (#3866DF @ 20%) */
    vipPayCardHeaderBorder: '#3866DF33',
    /** dots / cardNumberText */
    vipPayInk80: '#262A33CC',
    /** VIPMobilePayOverlayScreen verifySubtitle / resendPrompt / coolDown, closeButton bg */
    vipPayInk60: '#262A3399',
    /** VIPTrialGuideButton text */
    vipPayInk92: '#0E0E0EEB',
    /** appliedReferralCodeContainer */
    vipPayReferralBg: '#DFF1DA',
    /** VIPAddCardOverlayScreen input border / label */
    vipPayInputBorder: '#CCD7E4',
    vipPayLabel: '#939393',
    /** VIPInfoOverlayScreen subscriptionButtonBorder */
    vipPayDivider: '#02060C26',
    /** VIPSubscriptionButtonV2 paymentRowHeaderText (#02060C @ 45%) */
    vipPayInk45: '#02060C73',
  },
  radius: {
    /** VIPAddCardOverlayScreen / VIPAddCvvOverlayScreen cvvInput radius 7 */
    vipR7: 7,
  },
  layout: {
    /** VIPLandingScreen/VIPPaymentV2Screen backButton 39 × 39 */
    vipBackButton: 39,
    /** header row height 32 */
    vipPayHeaderH: 32,
    /** sticky CTA height 56 */
    vipPayCta: 56,
    /** cardListContainer / phoneListContainer maxHeight */
    vipPayListMax: 300,
    /** card row minHeight 45 / mobile row + add rows 52 */
    vipPayRowMin: 45,
    vipPayRow: 52,
    /** card brand width 30, mobile carrier 32 × 22 */
    vipPayBrandW: 30,
    vipPayCarrierW: 32,
    vipPayCarrierH: 22,
    /** CVV inline input 48 × 26 */
    vipPayCvvW: 48,
    vipPayCvvH: 26,
    /** VIPAddCardOverlayScreen feedbackView height 420, header 60 */
    vipAddCardH: 420,
    vipAddCardHeader: 60,
    /** overlays: hero icon 55, OTP box 49 + gap 6, close button 44 at −60 */
    vipPayHeroIcon: 55,
    vipOtpBox: 49,
    vipOtpGap: 6,
    vipCloseButton: 44,
    vipCloseButtonTop: -60,
    /** legacy Overlay close button 37 at top −18 / right 30 */
    vipLegacyClose: 37,
    vipLegacyCloseTop: -18,
    vipLegacyCloseEnd: 30,
    /** VIPInfoOverlayScreen / VIPInfoPopup headerIcon height 139, VIPUpdatePopup icon 80 */
    vipInfoIconH: 139,
    vipUpdateIcon: 80,
    /** VIPButton disabled / CVV + boku CTA disabled opacity */
    vipDisabledOpacity: 0.2,
    vipDimOpacity: 0.5,
    /** dots letterSpacing −3 */
    vipDotsTracking: -3,
  },
  type: {
    /** headerTitleText 16 bold lh24 */
    vipPayHeaderTitle: t(16, 700, 24),
    /** cardHeader 600 14 (increasedBaseFont) */
    vipPay14Semibold: t(14, 600),
    vipPay14: t(14, 400),
    vipPay14Medium: t(14, 500),
    vipPay14Bold: t(14, 700),
    vipPay12: t(12, 400),
    vipPay12Bold: t(12, 700),
    vipPay13: t(13, 400),
    vipPay13Medium: t(13, 500),
    vipPay15Medium: t(15, 500),
    vipPay16: t(16, 400),
    vipPay16Bold: t(16, 700),
    vipPay18Bold: t(18, 700),
    vipPay20Bold: t(20, 700),
    vipPay22Bold: t(22, 700),
    vipPay24Bold: t(24, 700),
    vipPay25Bold: t(25, 700),
    /** dots 24 bold lh26 */
    vipPayDots: t(24, 700, 26),
    /** RN base text: 13 regular */
    vipPayBase: t(13, 400),
  },
};

// ─── offers ─────────────────────────────────────────────
/** RN Text without lineHeight → CSS `line-height: normal`. */

/**
 * Offers area tokens — VIPOffersOverlayScreen, VIPOffersV2Screen (+ VIPPartnerOfferPlanModule), VIPConfirmOfferPlanScreen,
 * VIPConfirmVoucherPlanScreen, VIPBundleV2Screen, VIPAcceptPlanInviteOverlayScreen (+ skeleton), VIPAcceptInviteErrorOverlayScreen.
 * Only values with no equal global token. CSS: var(--nk-color-vip-of-*), var(--nk-type-vip-of-*), var(--nk-layout-vip-of-*).
 */
export const offersTokens = {
  /** VIPOffersOverlayScreen SUCCESS_POPUP_AUTO_ADVANCE_MS */
  successPopupMs: 2000,
  /** placeholder label 200ms; list collapse 250 (≤1 offer) / 500 (more), iOS delay 100 */
  labelMs: 200,
  listMs: { one: 250, many: 500, delay: 100 },
  /** contentHeight by max items per tab: 0 → 186, 1 → 210, 2 → 290, ≥3 → 400 (+20 wrapper) */
  listHeights: [186, 210, 290, 400],
  /** redeem button container 0 → 80 */
  redeemHeight: 80,
  /** VIPWave in Voucher: height 8, 40 cycles, width screen − 48 */
  wave: { height: 8, cycles: 40, inset: 48 },
  /** demo createSubscription / verifyReferralCode round-trip */
  apiMs: 1200,
  verifyMs: 600,
  /** VIPOffersV2Screen header fade 0 → 20px scroll; sticky footer hide/show 300ms Easing.ease */
  headerFade: 20,
  stickyMs: 300,
  /** VIPAcceptPlanInviteOverlayScreen header lottie comp 654×412, hexagon comps (duo 135×143.5, family 97×103.5) */
  inviteLottie: { w: 654, h: 412, duo: { w: 135, h: 143.5, top: 38.7, left: 40.3 }, family: { w: 97, h: 103.5, top: 45, left: 49 } },
  /** demo touchpoint load (skeleton) */
  inviteLoadMs: 900,
  /** VIPAcceptInviteOverlaySkeleton hexagon 52 × 0.97 */
  skeletonHex: 52,
  /** VIPMemberInitialHexagon border 0.8, font = width / 2.3 */
  hexBorder: 0.8,
  hexFontDiv: 2.3,
} as const;

export const offersFlowTokens: TokenOverrides = {
  colors: {
    /** VIP chevronLeftRounded stroke #404040 */
    vipOfBack: '#404040',
    /** Voucher title #161A1F */
    vipOfInk: '#161A1F',
    /** Voucher button text #034EFC */
    vipOfVoucherBlue: '#034EFC',
    /** Voucher wave/button bg #EBF1FF; applied #E5F6E6 */
    vipOfVoucherBg: '#EBF1FF',
    vipOfVoucherApplied: '#E5F6E6',
    /** VIPConfirmVoucherPlanScreen buttonContainer borderColor #02060C26 (also VIPBenefitsModule dashes) */
    vipOfDivider: '#02060C26',
    /** VIPConfirmOfferPlanScreen description #939393, savings text #12945f */
    vipOfDescGrey: '#939393',
    vipOfSavingsGreen: '#12945F',
    /** VIPSubscriptionButtonV2 paymentRowHeaderText #02060c73 */
    vipOfPayLabel: '#02060C73',
    /** VIPOffersV2Screen backButton border #E3E3E3, payment terms border #EDEDED */
    vipOfBackBorder: '#E3E3E3',
    vipOfTermsBorder: '#EDEDED',
    /** VIPPartnerOfferPlanModule disabled text #0E0E0E72 */
    vipOfDisabledText: '#0E0E0E72',
    /** VIPBundleV2Screen buttonContainer #222222, statusBar #00000044, defaults */
    vipOfBundleBar: '#222222',
    vipOfBundleStatus: '#00000044',
    vipOfBundleCurrentHeader: '#DADADA',
    vipOfBundleCurrent: '#9D9D9D',
    vipOfBundleHighlight: '#27E87E',
    // Yango Play bundle `style` (server-driven, demo values)
    vipOfYangoBg: '#0B0B0D',
    vipOfYangoCard: '#16161A',
    vipOfYangoAltCard: '#1C1C21',
    vipOfYangoBorder: '#2A2A31',
    vipOfYangoAltText: '#B4B4BE',
    vipOfYangoGradFrom: '#FFFFFF',
    vipOfYangoGradTo: '#8E8E99',
    vipOfYangoBrand: '#FF3E33',
    /** VIPAcceptPlanInviteOverlayScreen benefits bg white(0.8); skeleton highlight */
    vipOfWhite80: 'rgba(255, 255, 255, 0.8)',
    /** partner hero gradients (stc / ENBD demo) */
    vipOfStc: '#4F008C',
    vipOfEnbd: '#003F87',
  },
  layout: {
    /** VIPStyles letterSpacing: b-scale −0.1, h18/h16 −0.15, h24 −0.25 */
    vipOfTrackB: -0.1,
    vipOfTrackH: -0.15,
    vipOfTrackXl: -0.25,
    /** confirm plan title letterSpacing 0.898; bundle title −0.8; trial pill −0.6 */
    vipOfTrackCaps: 0.898,
    vipOfTrackBundle: -0.8,
    vipOfTrackPill: -0.6,
    /** VIPOffersV2 backButton 39, VIPBundleV2 40 */
    vipOfBack39: 39,
    vipOfBack30: 30,
    vipOfVoucherBtnH: 41,
    vipOfBenefitMinH: 124,
    vipOfHeaderPadTop: 127,
    vipOfTitleLineW: 97,
    vipOfInviteOverlap: -86,
    vipOfAppliedOverlap: -10,
    vipOfModuleOverlap: -7,
    vipOfMessageOverlap: -18,
  },
  type: {
    vipOf12Regular: t(12, 400),
    vipOf12Medium: t(12, 500),
    vipOf12Bold: t(12, 700),
    vipOf13Regular: t(13, 400),
    vipOf13Medium: t(13, 500),
    vipOf13Semibold: t(13, 600),
    vipOf13Bold: t(13, 700),
    vipOf14Regular: t(14, 400),
    vipOf14Medium: t(14, 500),
    vipOf14Semibold: t(14, 600),
    vipOf14Bold: t(14, 700),
    vipOf15Medium: t(15, 500),
    vipOf15Semibold: t(15, 600),
    vipOf16Regular: t(16, 400),
    vipOf16Semibold: t(16, 600),
    vipOf16Bold: t(16, 700),
    vipOf17Bold: t(17, 700),
    vipOf18Medium: t(18, 500),
    vipOf18Semibold: t(18, 600),
    vipOf18Bold: t(18, 700),
    vipOf20Bold: t(20, 700),
    vipOf40Bold: t(40, 700),
    /** html sheets with lineHeight */
    vipOf13MediumLh19: t(13, 500, 19),
    vipOf13RegularLh23: t(13, 400, 23),
    vipOf14SemiboldLh24: t(14, 600, 24),
    vipOf18SemiboldLh24: t(18, 600, 24),
    vipOf12RegularLh20: t(12, 400, 20),
    vipOf16BoldLh22: t(16, 700, 22),
    vipOf14MediumLh20: t(14, 500, 20),
    vipOf12SemiboldLh18: t(12, 600, 18),
    vipOf14RegularLh19: t(14, 400, 19),
  },
};

// ─── entry ─────────────────────────────────────────────
/** Legacy src/components/Overlay motion (used by VIPCartOverlayScreen + OCOneOverlayScreen). */
export const entryTokens = {
  overlay: {
    /** animationArbitraryHeight: sheet starts 300px down */
    enterFrom: 300,
    /** Animated.spring tension 40 / friction 7 → stiffness (40−30)×3.62+194, damping (7−8)×3+25 */
    spring: { type: 'spring' as const, stiffness: 230.2, damping: 22, mass: 1 },
    /** animationDuration 250, Easing.inOut(Easing.ease) */
    ms: 250,
    ease: [0.42, 0, 0.58, 1] as [number, number, number, number],
  },
  /** NoonCheckoutNoonOneSection ANIMATION / NoonOneCtaReveal */
  checkout: { ms: 300, gradientMs: 600, gradientScale: 6, revealLottieMs: 2250, revealFadeMs: 300 },
} as const;

/** entry area tokens (cart overlay, OC One overlay). Prefix keys with `vip`. */
export const entryFlowTokens: TokenOverrides = {
  radius: {
    /** Overlay container borderRadius 5 (bottom corners) / VIPCartOverlayScreen $borderTopRadius 20 */
    vipLegacySheet: 5,
    vipCartSheetTop: 20,
  },
  layout: {
    /** Overlay closeButton 37×37 at top −18, right 30; close-overlay.webp 16×16 */
    vipCloseSize: 37,
    vipCloseTop: -18,
    vipCloseEnd: 30,
    vipCloseIcon: 16,
    /** VIPCartOverlayScreen headerIcon 126 × (1/3.71); item image 90; item icon 52×14; buttons 48 */
    vipCartLogoW: 126,
    vipCartLogoRatio: 3.71,
    vipCartItemImage: 90,
    vipCartItemIconW: 52,
    vipCartItemIconH: 14,
    vipCartButtonH: 48,
    vipCartButtonBorder: 2,
    /** OCOneOverlayScreen headerLogo 40×23, header maxWidth 292, confetti 103×48 (image 206×96 at −48) */
    vipOcLogoW: 40,
    vipOcLogoH: 23,
    vipOcHeaderMax: 292,
    vipOcConfettiW: 103,
    vipOcConfettiH: 48,
    vipOcButtonH: 48,
  },
  type: {
    /** VIPCartOverlayScreen titleText 32/bold (no lineHeight) */
    vipCartTitle: { size: 32, line: 'normal', weight: 700 },
    /** buttonText 14/bold uppercase; HtmlView subtitle 14 */
    vipText14Bold: { size: 14, line: 'normal', weight: 700 },
    vipText14: { size: 14, line: 'normal', weight: 400 },
    /** OCOneOverlayScreen header 24/bold, title 19/bold, footerNote 12 */
    vipOcHeader: { size: 24, line: 'normal', weight: 700 },
    vipOcTitle: { size: 19, line: 'normal', weight: 700 },
    vipText12: { size: 12, line: 'normal', weight: 400 },
  },
};

function merge(...ps: TokenOverrides[]): TokenOverrides {
  const out: Record<string, Record<string, unknown>> = {};
  for (const p of ps) for (const [g, v] of Object.entries(p)) out[g] = { ...(out[g] ?? {}), ...(v as Record<string, unknown>) };
  return out as TokenOverrides;
}

export const noononeFlowTokens: TokenOverrides = merge(baseFlowTokens, landingFlowTokens, landingNpFlowTokens, plansFlowTokens, paymentFlowTokens, offersFlowTokens, entryFlowTokens);
