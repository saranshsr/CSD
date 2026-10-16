import { kebab, type TokenOverrides } from '../../foundations/tokens';

/**
 * noon One membership tokens — values from bappzaar origin/master `features/vip/theme/*` (VIPColors, VIPMetrics,
 * VIPStyles), `src/components/OverlayBottomSheet` + `src/constants/OverlayBottomSheet.ts`, and the per-screen `styles.ts`.
 *
 * VIPColors that already exist as kit tokens are used from the kit directly (see MAPPING.md §Theme):
 *   textPrimary #1D2539 → --nk-color-text-primary · textSecondary #475067 → --nk-color-text-muted
 *   textTertiary #666D85 → --nk-color-text-secondary · textMuted #989FB3 → --nk-color-text-tertiary
 *   action #0F61FF → --nk-color-primary · surfaceGrey #F9F9FB → --nk-color-bg-subtle
 *   surfaceTertiary #F2F3F7 → --nk-color-bg-page · surfaceMuted #EAECF0 → --nk-color-border
 *   successLight #0F8857 → --nk-color-success · successTag #108757 → --nk-color-best-price-ink
 *   error #D92626 → --nk-palette-danger-red · warning #E5641A → --nk-palette-sunset-orange
 *   lightGrey #D0D4DD → --nk-color-border-strong · blueGrey #343D54 → --nk-color-text-body
 *   buttonPrimary #101628 → --nk-color-text-strong · borderPrimary #F5F5F5 → --nk-palette-border-primary
 *   lightBlue #D6E9FF → --nk-palette-pale-blue · successDark #0B623F → --nk-palette-base-green800
 *   noonGrey1 #7E859B → --nk-palette-noon-grey1 · noonGrey2 #9BA0B1 → --nk-palette-noon-grey2
 *   charcoalGrey #404553 → --nk-color-text-legacy · black #000 → --nk-palette-catalog-tag-gradient-end
 *   supermallBlue #2122B8 → --nk-palette-rocket-blue-sapphire · noonYellow → --nk-color-brand
 *
 * Everything below is flow-local and exposed as `var(--nk-color-mb-<kebab>)`, `var(--nk-type-mb-<kebab>)`,
 * `var(--nk-space-mb-<kebab>)`, `var(--nk-radius-mb-<kebab>)`, `var(--nk-shadow-mb-<kebab>)` on every membership screen.
 */
export const membershipColors = {
  // ── VIPColors with no kit equivalent
  mbYellowDark: '#A36200', // VIPColors.yellowDark
  mbSuccessSurface: '#F1F9F6', // VIPColors.successSurface
  mbLightGreen: '#CBF6E5', // VIPColors.lightGreen
  mbLightYellow: '#FFF7C2', // VIPColors.lightYellow
  mbDarkGrey: '#394152', // VIPColors.darkGrey
  mbStepsLine: '#C8CDD5', // VIPColors.stepsLineChevron
  mbElevation: '#242424', // VIPColors.elevationShadow
  mbBlack2: '#262626', // VIPColors.black2
  mbHexagonBg: '#FED2D2', // VIPColors.memberInitialHexagonBackground
  mbHexagonText: '#C45C5C', // VIPColors.memberInitialHexagonText
  mbGlow: '#26B57C', // VIPStyles.shadowSuccessGlow shadowColor

  // ── VIPPlanMemberColors (avatar fills, index % 5)
  mbMember0: '#2F8E88',
  mbMember1: '#3392FF',
  mbMember2: '#3FA199',
  mbMember3: '#757ADB',
  mbMember4: '#C655EC',

  // ── OverlayBottomSheet chrome (BACKDROP rgb 30,30,30 @ BACKGROUND_MAX_OPACITY 0.7, handle #B7B7B7)
  mbBackdrop: 'rgba(30, 30, 30, 0.7)',
  mbHandle: '#B7B7B7',

  // ── Manage membership V3 (Plan/styles.ts, ManageFamilyMembersSection/styles.ts)
  mbPlanHeaderFrom: '#F0FFF9', // headerMessage LinearGradient ['#F0FFF9', 'white'] 90°
  mbPlanHeaderBg: '#F7FFFC',
  mbFamilyCard: '#FEFEFE',

  // ── VIPTransitionAnim (success text)
  mbAnimTitle: '#02060CEB',
  mbAnimSubtitle: '#02060C99',

  // ── Cancel membership V2 (VIPCancelMembershipV2Screen/styles.ts)
  mbCancelBg: '#F9F9F9', // container
  mbCancelGradTo: '#F4F3F3', // LinearGradient ['#FFFFFF', '#F4F3F3'] locations [0, 0.4]
  mbButtonTextDisabled: '#A0A0A0',
} as const;

/** VIPStyles type scale (fontSize / lineHeight) × weight. letterSpacing lives in `membershipSpacing.mbLs*`. */
export const membershipType = {
  mbH40Bold: { size: 40, line: 48, weight: 700 },
  mbH32Bold: { size: 32, line: 40, weight: 700 },
  mbH28Bold: { size: 28, line: 36, weight: 700 },
  mbH24Bold: { size: 24, line: 32, weight: 700 },
  mbH20Bold: { size: 20, line: 28, weight: 700 },
  mbH18Bold: { size: 18, line: 24, weight: 700 },
  mbB16Bold: { size: 16, line: 22, weight: 700 },
  mbB16Semibold: { size: 16, line: 22, weight: 600 },
  mbB16Medium: { size: 16, line: 22, weight: 500 },
  mbB16Regular: { size: 16, line: 22, weight: 400 },
  mbB14Medium: { size: 14, line: 20, weight: 500 },
  mbB13Bold: { size: 13, line: 18, weight: 700 },
  mbB12Bold: { size: 12, line: 18, weight: 700 },
  mbB12Semibold: { size: 12, line: 18, weight: 600 },
  mbB13Semibold: { size: 13, line: 18, weight: 600 },
  mbB11Regular: { size: 11, line: 14, weight: 400 },
  mbB11Medium: { size: 11, line: 14, weight: 500 },
  mbB11Semibold: { size: 11, line: 14, weight: 600 },
  // VIPTransitionAnim topText 24/800 (RN default line height ≈ 1.2) · bottomText 15/500
  mbAnimTitle: { size: 24, line: 29, weight: 800 },
  mbAnimSubtitle: { size: 15, line: 18, weight: 500 },
  // ManageFamilyMembersSection avatarText 24/30 bold
  mbAvatar: { size: 24, line: 30, weight: 700 },
  // Cancel V2 sticky buttons 16/600 (RN default line height)
  mbButton16: { size: 16, line: 20, weight: 600 },
  mbOfferCallout: { size: 14, line: 18, weight: 500 },
} as const;

export const membershipSpacing = {
  // VIPStyles.typeScale letterSpacing (0 in RTL — see membership.module.css)
  mbLs25: -0.25, // h40 / h32 / h28 / h24 / h20
  mbLs15: -0.15, // h18 / h16 / b16
  mbLs10: -0.1, // b14 / b13 / b12 / b11
  mbLsAvatar: -0.26,
  mbLsAnimTitle: -0.4,
  mbLsAnimSubtitle: -0.14,
  // VIPMetrics / vipBottomInset
  mbOverlayFloat: 12, // VIP_OVERLAY_SHEET_FLOAT_SPACING
  mbHeaderRow: 40,
  mbHandleTop: -18, // OverlayBottomSheet handleContainer top
  mbSheetTop: 60, // OverlayBottomSheet overlayWrapper paddingTop
} as const;

export const membershipRadius = {
  mbSheet: 18, // VIPOverlayBottomSheet OVERLAY_SHEET_RADIUS
  mbPopup: 10, // OverlayBottomSheet containerPopup
  mbPopupVip: 14, // VIPStyles.defaultPopup
} as const;

export const membershipShadow = {
  // VIPStyles.shadow2 (grey, 0 3.2, opacity .1, radius 3.2)
  mbShadow2: '0 3.2px 6.4px rgba(128, 128, 128, 0.1)',
  // VIPStyles.shadow3 (black, 0 7, opacity .4, radius 8) — sticky CTA containers
  mbShadow3: '0 7px 16px rgba(0, 0, 0, 0.4)',
  mbGlow: '0 2px 8px rgba(38, 181, 124, 0.4)',
} as const;

/** Motion values used from TS. */
export const membershipMotion = {
  /** OverlayBottomSheet: withSpring(mass 1, stiffness 110, damping 15) on open */
  sheetSpring: { type: 'spring', mass: 1, stiffness: 110, damping: 15 },
  /** OverlayBottomSheet: withTiming(350, Easing.inOut(Easing.ease)) for close + backdrop */
  sheetTiming: { duration: 0.35, ease: [0.42, 0, 0.58, 1] },
  /** OverlayBottomSheet ARBITRARY_ANIMATION_HEIGHT */
  sheetStartY: 300,
  /** close when dragged past min(h × 0.5, 250) or velocity > 2000 */
  closeRatio: 0.5,
  maxCloseDistance: 250,
  closeVelocity: 2000,
  /** VIPButton: scale 1 → 0.97 (100ms in / 200ms out), onPress fires after 200ms */
  pressScale: 0.97,
  pressIn: 0.1,
  pressOut: 0.2,
  pressDelay: 200,
} as const;

// ── Area tokens. Each area of the port owns ONE block below (edit only your own block). Same naming rules:
//    colors → --nk-color-mb-*, type → --nk-type-mb-*, spacing → --nk-space-mb-*, radius → --nk-radius-mb-*, shadow → --nk-shadow-mb-*.
type Area = { colors?: Record<string, string>; type?: Record<string, { size: number; line: number | string; weight: number }>; spacing?: Record<string, number>; radius?: Record<string, number>; shadow?: Record<string, string> };

// ── area: cancel (VIPCancelMembershipV2Screen + pages, owner family-cancel overlays, leave-family overlay)
export const cancelAreaTokens = {
  colors: {
    mbCBannerTagFrom: '#FFD7D7', // BenefitsScreen bannerHeaderTag LinearGradient ['#FFD7D7', white]
    mbCBannerNoteFrom: '#EDFEF0', // BenefitsScreen bannerNoteContainer LinearGradient ['#EDFEF0', white]
    mbCSoftShadow: '#ECECEC', // Reminder planContentContainer / Survey tip / unusedBenefitButton shadowColor
    mbCCommentBg: '#F7F7FA', // SurveyScreen commentsContainer
    mbCOfferPriceBorder: '#71B2FF', // VIPTimedExclusiveOfferModule priceContainer dashed border
    mbCConfirmDesc: '#939393', // VIPConfirmOfferPlanScreen descriptionTextStyle
    mbCConfirmSaving: '#12945F', // VIPConfirmOfferPlanScreen savingsText
    mbCTagBorder: '#E8F8EF', // VIPPlanOptionOverlay tagGradient default borderColors
    mbCPayLabel: 'rgba(2, 6, 12, 0.45)', // VIPReviewCancelUpgrade paymentRowHeaderText
    mbCShimmer: 'rgba(255, 255, 255, 0.75)', // VIPPlanOptionOverlay tagShimmer (white @ .75)
  },
  type: {
    mbCTitle30: { size: 30, line: 36, weight: 700 }, // DiscountOffer header (RN default line height ≈ 1.2)
    mbCTitle28: { size: 28, line: 34, weight: 700 }, // Benefits / Survey header
    mbCTitle22: { size: 22, line: 27, weight: 700 }, // Reminder header
    mbCSub17: { size: 17, line: 22, weight: 400 }, // DiscountOffer subtitle
    mbCSub14: { size: 14, line: 22, weight: 400 }, // Reminder subtitle
    mbCBig19: { size: 19, line: 23, weight: 700 }, // benefitDescriptionTextBig / offer headerText
    mbCBold15: { size: 15, line: 18, weight: 700 }, // unusedBenefitDescription / reminderTitle / review paymentText
    mbCBold17: { size: 17, line: 20, weight: 700 }, // ConfirmOffer header + monthlyPrice
    mbCBold18: { size: 18, line: 22, weight: 700 }, // bannerHeaderText
    mbCSemibold14: { size: 14, line: 17, weight: 600 }, // unusedBenefitButtonText / confirm savingsText
    mbCRegular12: { size: 12, line: 15, weight: 400 }, // unusedBenefitTitle / errorText
    mbCMedium13: { size: 13, line: 16, weight: 500 }, // bannerHeaderTagText / bannerNote
    mbCRegular16: { size: 16, line: 20, weight: 400 }, // bannerDescription
    mbCPrice24: { size: 24, line: 29, weight: 800 }, // offer priceText
    mbCTerms13: { size: 13, line: 23, weight: 400 }, // ConfirmOffer paymentTerms
    mbCButton18: { size: 18, line: 22, weight: 600 }, // ConfirmOffer button text
    mbCButton17: { size: 17, line: 20, weight: 600 }, // ReviewCancelUpgrade confirmButtonText
    mbCB12Semibold: { size: 12, line: 18, weight: 600 }, // b12 semibold (status tag, savings tag)
    mbCB13Regular: { size: 13, line: 18, weight: 400 }, // b13 regular (overlay subtitles)
    mbCMemberInitial: { size: 14, line: 24, weight: 700 }, // VIPPlanMembers memberText
  },
  spacing: {
    mbCLs68: -0.68,
    mbCLs28: -0.28,
    mbCLs26: -0.26,
    mbCLs16: -0.16,
    mbCLs14: -0.14,
    mbCLs12: -0.12,
  },
  radius: {},
  shadow: {
    mbCSoft: '0 0 16px #ECECEC', // shadowColor #ECECEC, opacity 1, radius 8
    mbCSurvey: '0 2px 60px #EAECF0', // optionsContainer shadow surfaceMuted, radius 30
    mbCTip: '0 2px 60px #ECECEC', // tipContainer
    mbCHairline: '0 0 16px rgba(236, 236, 236, 0.02)', // unusedBenefitButton (opacity .02)
  },
} satisfies Area;
// ── end area: cancel

// ── area: plans (VIPChangePlanScreen, VIPUpgradePlanV2Screen, VIPSwitchPlanOverlayScreen, VIPInfo/GenericOverlay, VIPInvoiceScreen)
export const plansAreaTokens = {
  colors: {
    mbPlanSelectedWrap: '#EBF4F1', // VIPUpgradePlanV2 selectedPlanWrapper
    mbPlanSelectedBorder: '#329537', // QuickPlanSelectV3 Plan planContainerSelected
    mbPlanDeselectedRadio: '#C5C5C5', // checkIconDeselected tint
    mbPayWithLabel: 'rgba(2, 6, 12, 0.45)', // VIPReviewCancelUpgrade paymentRowHeaderText
    mbInvoiceBorder: '#E3E3E3', // VIPInvoiceScreen backButton border
    mbInfoDivider: '#02060C26', // VIPInfoOverlay subscriptionButtonBorder
    mbReferralApplied: '#DFF1DA', // VIPChangePlan appliedReferralCodeContainer
    mbChevronDefault: '#404040', // chevron-left-rounded.svg own stroke (VIPInvoiceScreen passes no stroke)
    mbPdfBg: '#F4F4F4', // react-native-pdf page background
  },
  type: {
    mbB12Semibold: { size: 12, line: 18, weight: 600 }, // upgradeSavingsText (B12 SemiBold)
    mbPay15Bold: { size: 15, line: 18, weight: 700 }, // review paymentText
    mbInfoTitle: { size: 25, line: 30, weight: 700 }, // VIPInfoOverlay title 25 bold
    mbHeader16: { size: 16, line: 24, weight: 700 }, // VIPChangePlan headerTitle ($increasedLargeFont, lh 24)
  },
  spacing: {
    mbLs16: -0.16, // review title
    mbLs26: -0.26, // review payment + confirm
  },
  radius: {
    mbPlanInner: 14.5, // QuickPlanSelectV3 Plan planContainerInner
  },
  shadow: {},
} satisfies Area;
// ── end area: plans

// ── area: family (VIPFamilyPlansScreen, VIPSharePlanInviteScreen, VIPRemoveFamilyMemberOverlayScreen, VIPLeaveFamilyPlanScreen)
export const familyAreaTokens = {
  colors: {
    mbFamDash: '#02060C26', // VIPBenefitsModule / VIPPlanDetailsPopup dashed dividers
    mbFamPayLabel: '#02060C73', // VIPSubscriptionButtonV2 paymentRowHeaderText
    mbFamReminderTitle: '#F43333', // VIPPlanDetailsPopup reminderTitle
    mbFamShimmer: 'rgba(255, 255, 255, 0.55)', // VIPFamilyPlansSkeletonLoader highlight
    mbFamFaqDash: '#EBEBEB', // VIPExpandableTextModule grouped divider
  },
  type: {
    mbFamH24Semibold: { size: 24, line: 32, weight: 600 }, // SharePlanInvite title p (h24 semibold)
    mbFamH24Heavy: { size: 24, line: 32, weight: 800 }, // SharePlanInvite title <highlight>/<b>
    mbFamStepNumber: { size: 9, line: 13.91, weight: 800 }, // VIPFamilyPlans stepNumber
    mbFamB12Bold: { size: 12, line: 18, weight: 700 }, // planDescription <b>
    mbFamPayLabel: { size: 13, line: 16, weight: 500 }, // VIPSubscriptionButtonV2 "Pay with"
    mbFamMemberInitial: { size: 14, line: 24, weight: 700 }, // VIPPlanMembers memberText (fontSize = size / 2 inline)
    mbFamReminderTitle: { size: 15, line: 18, weight: 700 },
    mbFamButton18: { size: 18, line: 22, weight: 600 }, // buttonTextWithPayment (b16 semibold, fontSize 18)
  },
  spacing: {
    mbFamLsStep: -0.2,
    mbFamLsMember: -0.28,
    mbFamPlansOverlap: -56, // plansContainer marginTop
    mbFamBenefitsTop: 42.85, // SharePlanInvite benefitsRow marginTop
  },
  radius: {},
  shadow: {
    mbFamHero: '0 2px 18px rgba(0, 0, 0, 0.09)', // heroImageButton shadow (black, 0 2, .09, radius 9)
  },
} satisfies Area;
// ── end area: family

// ── area: perks (VIPReferralsScreen, VIPReferralsInputOverlayScreen, VIPPartnerOverlayScreen, VIPYangoCreditsOverlayScreen)
export const perksAreaTokens = {
  colors: {
    // VIPReferralsScreen (server stats colours in demo data: #3866DF/#EFF3FD → kit cta / palette fadedBlue)
    mbRefCopiedBg: '#DFF1DA', // copiedCodeContainer / inputSuccessContainer
    mbRefStatGreenBg: '#E6F6E0', // demo server backgroundColor for the "days earned" stat
    // VIPReferralsInputOverlayScreen
    mbRefOverlayBg: '#F1F1F2', // overlay / container / sliderContainer
    mbRefDim: '#0000003D', // tabsContainer + disabledButton backgroundColor
    mbRefOfferButton: '#1C1C1B', // offerButton
    mbRefLink: '#0000FF', // offerDescriptionStyle a: color 'blue'
    // VIPYangoCreditsOverlayScreen
    mbYangoBodyBorder: '#F0F0F0',
    mbYangoIconBorder: '#E5E5E5',
    mbYangoDesc: '#0E0E0EA6',
    mbYangoDescBottom: '#02060CBF',
    // demo partner banner (server `specialPlanBanner` image — rendered as a token-coloured placeholder)
    mbPartnerBannerFrom: '#0B2A4A',
    mbPartnerBannerTo: '#13487A',
    // VIPSubscriptionButtonV2 payment row
    mbSubPayHeader: '#02060C73', // paymentRowHeaderText
  },
  type: {
    // RN default line height (≈1.2) where master sets no lineHeight
    mbRefHeader: { size: 16, line: 24, weight: 700 }, // headerTitleText
    mbRefPageTitle: { size: 19, line: '1.2', weight: 700 }, // pageTitle
    mbRefStatTitle: { size: 14, line: '1.2', weight: 400 }, // statTitle ($increasedBaseFont)
    mbRefStatValue: { size: 32, line: '1.2', weight: 700 }, // statValue
    mbRefBase: { size: 13, line: '1.2', weight: 400 }, // baseTextStyle 13 #404553
    mbRefCode: { size: 13, line: '1.2', weight: 700 }, // referralCodeText
    mbRefLink14: { size: 14, line: '1.2', weight: 600 }, // copyCodeText / copiedCodeText
    mbRefButton: { size: 14, line: '1.2', weight: 700 }, // stickyButtonText / overlay buttonText (uppercase)
    mbRefOverlayTitle: { size: 30, line: '1.2', weight: 700 }, // overlay title (uppercase)
    mbRefSubtitle: { size: 16, line: '1.2', weight: 400 }, // subtitle ($increasedLargeFont)
    mbRefBenefits: { size: 24, line: '1.2', weight: 700 }, // benefitsMessage
    mbRefInput: { size: 14, line: '1.2', weight: 400 }, // codeInput / codeText / inputButtonText
    mbRefMessage: { size: 12, line: '1.2', weight: 400 }, // inputMessage / codeInfoText
    mbRefTab: { size: 14, line: '1.2', weight: 600 }, // tabText
    mbRefOfferDesc: { size: 16, line: '1.2', weight: 600 }, // offerDescriptionStyle p
    mbRefOfferLink: { size: 14, line: '1.2', weight: 400 }, // offerDescriptionStyle a
    mbRefOfferButton: { size: 14, line: '1.2', weight: 700 },
    mbPerkButton18: { size: 18, line: '1.2', weight: 700 }, // partner + yango buttons
    mbYangoTitle: { size: 16, line: '1.2', weight: 600 },
    mbYangoDesc: { size: 13, line: '1.2', weight: 400 },
    mbSubPayHeader: { size: 13, line: '1.2', weight: 500 },
    mbSubPayText: { size: 15, line: '1.2', weight: 500 },
    mbPartnerBannerTitle: { size: 28, line: 34, weight: 800 },
  },
  spacing: {},
  radius: {},
  shadow: {},
} satisfies Area;
// ── end area: perks

const areas: Area[] = [cancelAreaTokens, plansAreaTokens, familyAreaTokens, perksAreaTokens];
const merged = (g: keyof Area) => Object.assign({}, ...areas.map((a) => a[g] ?? {}));

export const membershipFlowTokens: TokenOverrides = {
  colors: { ...membershipColors, ...merged('colors') },
  type: { ...membershipType, ...merged('type') },
  spacing: { ...membershipSpacing, ...merged('spacing') },
  radius: { ...membershipRadius, ...merged('radius') },
  shadow: { ...membershipShadow, ...merged('shadow') },
};

type AreaKey<G extends keyof Area> = keyof (typeof cancelAreaTokens)[G] | keyof (typeof plansAreaTokens)[G] | keyof (typeof familyAreaTokens)[G] | keyof (typeof perksAreaTokens)[G];

/** Typed `var(--nk-…-mb-*)` references for TSX inline styles (typos fail tsc). */
export const mb = {
  color: (k: keyof typeof membershipColors | AreaKey<'colors'>) => `var(--nk-color-${kebab(k)})`,
  type: (k: keyof typeof membershipType | AreaKey<'type'>) => `var(--nk-type-${kebab(k)})`,
  space: (k: keyof typeof membershipSpacing | AreaKey<'spacing'>) => `var(--nk-space-${kebab(k)})`,
  radius: (k: keyof typeof membershipRadius | AreaKey<'radius'>) => `var(--nk-radius-${kebab(k)})`,
  shadow: (k: keyof typeof membershipShadow | AreaKey<'shadow'>) => `var(--nk-shadow-${kebab(k)})`,
};
