import { palette } from '../../foundations/palette';
import type { TokenOverrides } from '../../foundations/tokens';

/**
 * Checkout-only tokens. Every value is resolved from bappzaar master (styles.ts → NoonColors / NoonTokens /
 * ThemeManager metrics); see MAPPING.md for the per-property table. Central tokens (src/foundations) are used
 * wherever the value already exists — this file only holds what has no central equal, plus semantic aliases for
 * auto-named palette entries (`kit*`) so the CSS reads with master's names.
 *
 * CSS: colors.chkFoo → var(--nk-color-chk-foo), type.chkFoo → var(--nk-type-chk-foo), etc.
 * Note: the flow overrides `bgPage` to $noonGrey4 (#F3F4F8), the checkout container background. Use
 * `--nk-color-border-subtle` / `--nk-palette-anti-flash-white` for master's antiFlashWhite (#F2F3F7) inside checkout.
 */
export const checkoutFlowTokens: TokenOverrides = {
  colors: {
    bgPage: '#F3F4F8', // NoonCheckoutScreen container: $noonGrey4

    // NoonCheckoutShipment promiseTextStyle.highlight '#1F7A74' (emeraldGreen700)
    chkPromiseHighlight: 'var(--nk-palette-emerald-green700)',
    // NoonDynamicInvoice stylesheets
    chkInvoiceText: 'var(--nk-palette-slate600)', // slate600 #526075 — p / steel / subtitle
    chkInvoiceHighlight: 'var(--nk-palette-emerald-green)', // emeraldGreen #13645F
    chkInvoiceSteel: 'var(--nk-palette-text-tertiary)', // NoonColors.textTertiary #8D8F92
    chkInvoiceDash: 'var(--nk-color-border-strong)', // Svg Line stroke '#D0D4DD'
    chkInvoiceSpecialBg: 'var(--nk-palette-emerald100)', // $emerald100 #D1FAE5
    // NoonCheckoutSlideButton constants
    chkSlideTrackEnd: 'var(--nk-palette-kit-blue43)', // ENABLED_GRADIENT_COLORS[1] #3454A8 (start #3866DF = --nk-color-cta)
    chkSlideLabel: 'var(--nk-palette-kit-blue66)', // enabledMaskedView / SHIMMER_ENABLED_COLORS #7394DE
    chkSlideLabelShine: 'var(--nk-palette-kit-blue91)', // SHIMMER_ENABLED_COLORS[1] #DAE3F6
    // NoonSalesEMIPlansOverlayScreen emiPlanFeeError: ThemeManager.colors.errorMessageColor()
    chkErrorMessage: '#FB0B0B',
    // NoonCheckoutAddPaymentCardScreen input placeholder (RN iOS default placeholderTextColor)
    chkInputPlaceholder: 'var(--nk-palette-kit-gray79)', // #C7C7CD
    // NoonContactPhoneInput dial-code cell
    chkDialCodeBg: 'var(--nk-palette-kit-gray97v3)', // #F5F6F9
    // SavedContact contactInitialsContainer '#FFFCCF'
    chkContactInitialsBg: 'var(--nk-palette-kit-yellow91v2)',
    // NoonCheckoutAlternatePhoneContactsScreen phoneNumberOption borderColor '#b3cce6'
    chkContactOptionBorder: 'var(--nk-palette-kit-sky80)',
    // NoonCheckoutProvider AmountEntry amountInputContainerError borderColor '#FCA5A5'; Header headerCta bg '#E9E8FC'
    chkAmountErrorRing: 'var(--nk-palette-kit-red82)',
    chkProviderHeaderCtaBg: 'var(--nk-palette-kit-blue95v3)',
    // NoonCheckoutPaymentFailureScreen errorMessageContainer '#FFF2F2'
    chkFailureErrorBg: 'var(--nk-palette-kit-red97)',
    // NoonCheckoutPaymentFailureNeedHelpOverlayScreen contactInfoValueText '#919191'
    chkHelpValue: 'var(--nk-palette-kit-gray57)',
    // NoonShipmentV2 container border / header '#2F8E6D', content '#F6F7FA'
    chkShipmentV2Green: 'var(--nk-palette-kit-teal37)',
    chkShipmentV2ContentBg: 'var(--nk-palette-kit-gray97v4)',
    // NoonCheckoutProviderOtpLoading ActivityIndicator color '#3d3d3d'
    chkOtpLoader: 'var(--nk-palette-kit-gray24)',

    // NoonCheckoutNoonOneSection (integrated noon One toggle)
    chkNoonOneOcean: '#359761', // darkGreenOcean (radial gradient 70–100%)
    chkNoonOneOcean95: 'rgba(53, 151, 97, 0.95)', // darkGreenOcean @ stopOpacity .95 (centre)
    chkNoonOneGold22: 'rgba(255, 197, 50, 0.22)', // yellowGold glow stops .22 / .12 / 0
    chkNoonOneGold12: 'rgba(255, 197, 50, 0.12)',
    chkNoonOneGold0: 'rgba(255, 197, 50, 0)',
    chkNoonOneCtaBg: '#E5FAEC', // ottomanGreen
    /** NoonOneCtaReveal CTA_REVEAL_START_COLOR = brightEmeraldGreen — the settling block starts in it */
    chkNoonOneRevealGreen: '#00C679', // token-lint-ignore — flow token definition (bappzaar colour)

    /* ── Figma "🚧 Checkout 2.0" (zURu7GI7sq77fjdXKrouvo · 14288:183972) — see FIGMA-MAPPING.md ── */
    chkFigPage: 'var(--nk-palette-blue-gray200)', // frame fill / header — Blue-Gray/200 #F2F3F7
    chkFigTextPrimaryAlpha: 'var(--nk-palette-dark-navy-alpha92)', // 🚧 text/👀 primary #02060CEB
    chkFigTextSecondaryAlpha: 'var(--nk-palette-dark-navy-alpha60)', // 🚧 text/👀 secondary #02060C99
    chkFigTextTertiaryAlpha: 'rgba(2, 6, 12, 0.45)', // 🚧 text/👀 tertiary #02060C73
    chkFigWarrantyEnd: '#FFF7E5', // "Extended warranties checkout" chip gradient end (start white)
    chkFigNoonOneCardEnd: '#ECFFD1', // noon One Credit Card row gradient end (start white)
    chkFigNeedTodayEnd: 'rgba(242, 243, 247, 0)', // Need Today container gradient end (#F2F3F7 @ 0; start Blue-Gray/100)
    chkFigEmkanBg: '#373773', // Redemption Programs images ATOM (Emkan)
    chkFigQuara1: '#C743D2', // QUARA tile gradient 225° stops 0 / 35 / 69 / 100 %
    chkFigQuara2: '#6E19BF',
    chkFigQuara3: '#2423A4',
    chkFigQuara4: '#12AAE2',

    /* ── Figma "All flows" Checkout (Af34gfmhQ1D0wstXUEHSIF · 127:44077) — FIGMA-MAPPING.md § All flows ── */
    chkAfBannerStruck: 'rgba(16, 135, 87, 0.64)', // Banner/.base secondary strip struck amount (#108757 @ 64%)
    chkAfDonationEnd: 'var(--nk-palette-border-gray)', // Donations new gradient end — colour/surface/action-subtle #EBF4FF
    chkAfTamamBg: '#FCB316', // Finance callout Tamam rounded tile
  },
  radius: {
    chkNoonOne: 15, // ANIMATION.borderRadius / animatedContainer
    chkNoonOneOn: 18, // ANIMATION.toggledBorderRadius
  },
  layout: {
    chkNoonOneIconW: 29,
    chkNoonOneIconH: 20,
    chkNoonOneSkeleton: 77,
  },
  // master text styles with no central type token (size / line / weight; RN has no line-height where `normal`)
  type: {
    chkNoonOneNudge: { size: 12, line: 'normal', weight: 600 }, // discountNudgeText
    chkNoonOnePlan: { size: 12, line: 'normal', weight: 400 }, // planAmountText
    chkText8RegularLh10: { size: 8, line: 10, weight: 400 }, // NoonCheckoutShipment itemQtytext
    chkText10RegularLh12: { size: 10, line: 12, weight: 400 }, // NoonShipmentV2 qtyText
    chkText11BoldLh14: { size: 11, line: 14, weight: 700 }, // NoonCheckoutCouponStatus overriddenCouponBannerText
    chkText12SemiboldLh15: { size: 12, line: 15, weight: 600 }, // installation calendarWeekday / dayNumber
    chkText13MediumLh22: { size: 13, line: 22, weight: 500 }, // checkoutDetachedAddressText (+ addressText lh 22)
    chkText14MediumLh20: { size: 14, line: 20, weight: 500 }, // NoonOrderConfirmationAddress delivery instruction item
    chkText17BoldLh24: { size: 17, line: 24, weight: 700 }, // NoonShipmentV2 promiseTextStyle.b
    chkText18SemiboldLh24: { size: 18, line: 24, weight: 600 }, // NoonCheckoutLearnMoreScreen listTitle
    chkText19MediumLh1: { size: 19, line: '1', weight: 500 }, // PKPaymentButton label (font-family overridden to SF)
    chkText20MediumLh24: { size: 20, line: 24, weight: 500 }, // provider OTP amount
    chkText24BoldLh33: { size: 24, line: 33, weight: 700 }, // NeedHelpOverlay title
    chkText32BoldLh38: { size: 32, line: 38, weight: 700 }, // LearnMoreScreen (promise info) title
    chkText34RegularLh40: { size: 34, line: 40, weight: 400 }, // provider amount entry input

    /* Figma "🚧 Checkout 2.0" text styles with no central equal (letter-spacing stays next to each `font:` in CSS) */
    chkFigText8RegularLh1p1: { size: 8, line: '1.1', weight: 400 }, // qty badge "X" (+0.6154, uppercase)
    chkFigText10SemiboldLh1p1: { size: 10, line: '1.1', weight: 600 }, // qty badge count (-0.0862)
    chkFigText11RegularLh12: { size: 11, line: 12, weight: 400 }, // Primary/Label5/Regular (-0.12)
    chkFigText11MediumLh12: { size: 11, line: 12, weight: 500 }, // Primary/Label5/Medium (-0.12)
    chkFigText11RegularLh16: { size: 11, line: 16, weight: 400 }, // savings strip info (-0.26)
    chkFigText12SemiboldLh16p6: { size: 12, line: 16.6, weight: 600 }, // NEW badge (Proxima Nova Semibold → Noontree)
    chkFigText13ExtraboldLh20: { size: 13, line: 20, weight: 800 }, // "SHIPMENT n" (+0.2, uppercase)
    chkFigText15SemiboldLh18: { size: 15, line: 18, weight: 600 }, // Primary/Label-2/Semi Bold (-0.26)
    chkFigText15BoldLh18: { size: 15, line: 18, weight: 700 }, // Primary/Label-2/Bold (-0.26)
    chkFigText15MediumLh16: { size: 15, line: 16, weight: 500 }, // summary struck value (cap-trimmed, -0.14)
    chkFigText15SemiboldLh16: { size: 15, line: 16, weight: 600 }, // summary values (cap-trimmed, -0.14)
    chkFigText16BoldLh21: { size: 16, line: 21.1, weight: 700 }, // header "Delivering to …" (-0.3016)
    chkFigText16BoldLh24: { size: 16, line: 24, weight: 700 }, // section titles — h4 16/24 (-0.2)
    chkFigText17BoldLh20: { size: 17, line: 20, weight: 700 }, // Primary/Label-1/Bold — summary total (-0.26)
    chkFigText19BoldLh26p6: { size: 19, line: 26.6, weight: 700 }, // footer slider label / items / total (Proxima Nova Bold → Noontree)

    /* Figma "All flows" Checkout (127:44077) */
    chkAfText13MediumLh20: { size: 13, line: 20, weight: 500 }, // B13/Medium — address card line (-0.1)
    chkAfText13SemiboldLh20: { size: 13, line: 20, weight: 600 }, // B13/SemiBold — donation "Learn more" (-0.1)
    chkAfText13BoldLh20: { size: 13, line: 20, weight: 700 }, // B13/Bold — donation amount pill (-0.1)
    chkAfText8BoldLh12: { size: 8, line: 12, weight: 700 }, // donation pill sub-label "1 MEAL" (-0.1)
  },
  shadow: {
    // stickyButtonsWrapper: shadowOffset (0,-4), rgba(0,0,0,0.06), opacity 1, iOS default radius 3
    chkStickyFooter: '0 -4px 3px var(--nk-palette-black-alpha6)',
    /* Figma "🚧 Checkout 2.0" */
    chkFigDock: '0 -4px 3.5px rgba(0, 0, 0, 0.13)', // Button Dock drop-shadow (filter: drop-shadow)
    chkFigHeaderLabel: '0 8.043px 16.086px rgba(0, 0, 0, 0.07)', // "Delivering to Home" text-shadow
    chkFigQtyBadge: '0 2.462px 4.923px var(--nk-palette-dark-navy-alpha10)', // qty badge — alpha$/light/100
  },
};

/**
 * Values needed as raw strings in JS (Lottie colour filters, motion colour interpolation, server colours that
 * master concatenates with hex alpha, e.g. `${genericThemeColor}33`). CSS should use the vars above instead.
 */
export const checkoutJs = {
  /** NoonSalesAnimatedHeader HEADER_ANIMATION_COLORS [antiFlashWhite, whiteColor] */
  headerFrom: palette.antiFlashWhite,
  headerTo: palette.white,
  /** NoonCheckoutSlideButton LOTTIE_VIEW_{ENABLED,DISABLED}_COLOR_FILTER (keypath "arrow") */
  slideArrowEnabled: palette.accentColor,
  slideArrowDisabled: palette.grayColor,
} as const;

/**
 * Demo server values (checkout session / providers / order-confirmation APIs). These are data, not design tokens:
 * master gets them from the backend and passes them straight to LinearGradient / Text colour props.
 */
export const checkoutServerColors = {
  white: '#FFFFFF',
  black: '#000000', // NoonCheckoutTag DEFAULT_SOLID / provider genericThemeColor fallback
  // loyalty / voucher providers (burn.*.providers, earn.providers)
  mokafaaBlue: '#241AFC', // Figma Checkout 2.0 Mokafaa tile
  mokafaaTint: '#EEEDFF',
  quaraViolet: '#6E19BF', // Figma QUARA gradient mid stop
  quaraTint: '#F4ECFB',
  emkanNavy: '#373773', // Figma Emkan tile
  emkanTint: '#EEEEF6',
  qitafPurple: '#4F008C', // Figma "All flows" Qitaf wordmark (STC purple)
  qitafTint: '#F3EBF9',
  tamamYellow: '#FCB316', // Figma "All flows" Tamam tile
  tamamTint: '#FFF6E3',
  shareViolet: '#7B2CBF',
  shareVioletLight: '#C04BE0',
  shareTint: '#F6EEFC',
  skywardsGold: '#B08D57',
  skywardsTint: '#FBF6EE',
  skywardsInk: '#1D1D1B',
  skywardsLogoInk: '#C9A86A',
  voucherTint: '#EEF4FF',
  yougotagiftPink: '#E5195E',
  flexBlue: '#0F61FF',
  giftplusGreen: '#13645F',
  earnGreen: '#0F8857',
  neutralLogo: '#404553',
  // paymentMethodsV2 tags / upselling cards
  tagNewFrom: '#7A3BFF',
  tagNewTo: '#3866DF',
  tagPayLaterFrom: '#3BFFC1',
  tagPayLaterTo: '#14B87F',
  upsellingFrom: '#FFFFFF', // DEFAULT_UPSELLING_GRADIENT
  upsellingTo: '#F5F5F5',
  // delivery_options / receiver notes backgroundHexa
  noteWarm: '#FFF7ED',
  noteBlue: '#EFF3FD',
  // order confirmation: notifications banner + smart assist
  notificationsBg: '#E8F1FF',
  notificationsCtaBg: '#0E0E0E',
  smartAssistBg: '#2F8E6D',
} as const;
