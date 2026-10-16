import type { TokenOverrides } from '../../foundations/tokens';
import { easing } from '../../motion/presets';

/**
 * Returns (AFS) flow tokens. Values from bappzaar origin/master `features/afs/common/theme/AFSColors.ts`,
 * `AFSMetrics.ts`, `features/afs/returns/…/styles.ts`, `legacy/constants/AFSReturnsLegacyConstants.ts` and
 * `src/components/OverlayBottomSheet` (see MAPPING.md). Anything that already exists as a kit token is used
 * from the kit (`--nk-color-*` / `--nk-palette-*`); only values with no kit token are defined here.
 *
 * CSS: colours → `var(--nk-color-returns-<kebab>)`, type → `var(--nk-type-returns-<kebab>)`,
 * spacing → `var(--nk-space-returns-<kebab>)`.
 */
const colors = {
  bgPage: 'var(--nk-color-bg-subtle)', // $secondaryBackgroundColor #F9F9FB
  returnsOverlayScrim: 'rgba(30, 30, 30, 0.7)', // OverlayBottomSheetMetrics BACKDROP 30,30,30 × 0.7
  returnsOverlayHandle: '#B7B7B7', // OverlayBottomSheet styles.handle
  returnsHeaderBlur: '#F9F9FBCC', // AFS_BACK_OVERLAY_COLOR
  returnsBrandBlue50: 'var(--nk-palette-order-summary-installation-strip-bg)', // AFSColors.brandBlue50 #F5FAFF
  returnsBrandBlue400: '#85BDFF', // AFSColors.brandBlue400
  returnsSupermallLightBlue: '#EDEEFD', // AFSColors.supermallLightBlue
  returnsArrowBorder: '#F1F4FD', // $lightBlueColor (history chevron ring)
  returnsAddTileEnd: 'rgba(15, 97, 255, 0.04)', // add-photo tile gradient end
  returnsDimmedVeil: '#FFFFFF40', // AFS_RETURNS_REASON_DIMMED_BLUR_FALLBACK
  // ITEM_STATUS_GRADIENT_MAP (history / returnable status strips)
  returnsStatusBlue: 'var(--nk-color-bg-info)', // #EBF4FF
  returnsStatusGreen: 'var(--nk-color-success-surface)', // #E3FCF2
  returnsStatusAmber: 'var(--nk-color-warning-surface)', // #FFF1E0
  returnsStatusRed: 'var(--nk-color-danger-surface)', // #FFF0F0
  returnsStatusGray: 'var(--nk-color-border-subtle)', // #F2F3F7
} as const;

/** RN text without lineHeight → line 'normal' (see MAPPING.md). */
const type = {
  returnsText11MediumLh14: { size: 11, line: 14, weight: 500 },
  returnsText12: { size: 12, line: 'normal', weight: 400 },
  returnsText12Medium: { size: 12, line: 'normal', weight: 500 },
  returnsText12Semibold: { size: 12, line: 'normal', weight: 600 },
  returnsText12BoldLh14: { size: 12, line: 14, weight: 700 },
  returnsText12SemiboldLh18: { size: 12, line: 18, weight: 600 },
  returnsText12RegularLh17: { size: 12, line: 17, weight: 400 },
  returnsText10BoldLh12: { size: 10, line: 12, weight: 700 },
  returnsText13: { size: 13, line: 'normal', weight: 400 },
  returnsText13Medium: { size: 13, line: 'normal', weight: 500 },
  returnsText13Semibold: { size: 13, line: 'normal', weight: 600 },
  returnsText13MediumLh20: { size: 13, line: 20, weight: 500 },
  returnsText14: { size: 14, line: 'normal', weight: 400 },
  returnsText14Medium: { size: 14, line: 'normal', weight: 500 },
  returnsText14Semibold: { size: 14, line: 'normal', weight: 600 },
  returnsText14Bold: { size: 14, line: 'normal', weight: 700 },
  returnsText14MediumLh20: { size: 14, line: 20, weight: 500 },
  returnsText15Semibold: { size: 15, line: 'normal', weight: 600 },
  returnsText16: { size: 16, line: 'normal', weight: 400 },
  returnsText16Medium: { size: 16, line: 'normal', weight: 500 },
  returnsText16Semibold: { size: 16, line: 'normal', weight: 600 },
  returnsText16Bold: { size: 16, line: 'normal', weight: 700 },
  returnsText16SemiboldLh24: { size: 16, line: 24, weight: 600 },
  returnsText18Semibold: { size: 18, line: 'normal', weight: 600 },
  returnsText18Bold: { size: 18, line: 'normal', weight: 700 },
  returnsText20Semibold: { size: 20, line: 'normal', weight: 600 },
  returnsText20Bold: { size: 20, line: 'normal', weight: 700 },
  returnsText20BoldLh28: { size: 20, line: 28, weight: 700 },
} as const;

const spacing = {
  returnsContentTop: 62, // UIManager.contentTopOffset('header', 18) − statusBar = 44 + 18
  returnsLottieHeight: 240, // AFSReturnsDetailsScreen LOTTIE_HEIGHT (iOS)
  returnsSubmitTop: 52, // flatListContent paddingTop $statusBarHeightValue + 52
  returnsSubmitTopWithPrev: 66, // + completed sections
  returnsOverlayTop: 60, // OverlayBottomSheet overlayWrapper paddingTop
} as const;

export const returnsFlowTokens: TokenOverrides = { colors, type, spacing };

/** JS-side values (motion, thresholds, colour maps). */
export const returnsTokens = {
  /** AFS_PRESS_ACTIVE_SCALE + AFS_PRESS_SPRING_CONFIG */
  pressScale: 0.98,
  pressSpring: { type: 'spring', stiffness: 300, damping: 20, mass: 0.5 },
  /** AFS_RETURNS_REASON_DROPDOWN_SPRING_CONFIG (section height / translateY) */
  sectionSpring: { type: 'spring', damping: 14, stiffness: 180, mass: 0.8 },
  /** AFS_RETURNS_ANIMATION_DURATION 250 ms, Easing.out(cubic) */
  fadeIn: { duration: 0.25, ease: easing.out },
  fadeOut: { duration: 0.25, ease: easing.in },
  sectionOffset: 16,
  summaryOffset: 10,
  reasonDimmedOpacity: 0.2,
  reasonBlur: 2,
  footerDisabledOpacity: 0.72,
  footerDisabledScale: 0.99,
  /** useAFSReturnsDetailsAnimation */
  successMoveUpDelay: 1800,
  headerRevealDuration: 0.5,
  headerScrollScaleDistance: 160,
  headerMinScrollScale: 0.8,
  /** demo latency for getReturnItemDetails / submit */
  detailsFetchDelay: 900,
  submitDelay: 600,
  /** OverlayBottomSheet: open spring, close timing, drag-to-close */
  overlaySpring: { type: 'spring', damping: 15, stiffness: 110, mass: 1 },
  overlayClose: { duration: 0.35, ease: [0.42, 0, 0.58, 1] as [number, number, number, number] },
  overlayFadeDuration: 0.35,
  overlayDragOffset: 250,
  overlayDragVelocity: 2000,
  /** history search expand */
  searchDuration: 0.25,
  /** feedback overlay success Lottie speed */
  feedbackLottieSpeed: 0.85,
  /** AFSReturnsLegacyReturnDetailsSteps STEP_SIZE / PROGRESS_LINE_SIZE */
  stepSize: 36,
  progressLine: 2,
} as const;

/** TRACKING_COLORS / TRACKING_TEXT_COLORS / ITEM_STATUS_* (legacy/constants/AFSReturnsLegacyConstants.ts). */
export const trackingColors: Record<string, string> = {
  green: 'var(--nk-color-success)',
  red: 'var(--nk-color-border-strong)',
  gray: 'var(--nk-color-border)',
  amber: 'var(--nk-palette-sunset-orange)',
};
export const trackingTextColors: Record<string, string> = {
  green: 'var(--nk-color-success)',
  red: 'var(--nk-palette-danger-red)',
  gray: 'var(--nk-color-text-secondary)',
  amber: 'var(--nk-palette-sunset-orange)',
};
export const itemStatusText: Record<string, string> = {
  blue: 'var(--nk-color-primary)',
  green: 'var(--nk-color-success)',
  amber: 'var(--nk-palette-sunset-orange)',
  red: 'var(--nk-palette-danger-red)',
  gray: 'var(--nk-color-text-primary)',
};
export const itemStatusGradient: Record<string, string> = {
  blue: 'var(--nk-color-returns-status-blue)',
  green: 'var(--nk-color-returns-status-green)',
  amber: 'var(--nk-color-returns-status-amber)',
  red: 'var(--nk-color-returns-status-red)',
  gray: 'var(--nk-color-returns-status-gray)',
};
/** afsReturnsLegacyGetNormalizedColorCode */
export const normalizeColorCode = (code?: string | null) => {
  if (!code) return undefined;
  const c = code.toLowerCase();
  return c === 'ambar' ? 'amber' : c;
};
