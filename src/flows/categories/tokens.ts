import { palette } from '../../foundations/palette';
import type { TokenOverrides } from '../../foundations/tokens';

/**
 * Categories tab tokens, values from bappzaar master (see MAPPING.md for the component → value → token table).
 * - `categoriesTokens`: JS-only numbers (ratios, motion, CollapsibleBannerModule constants).
 * - `categoriesFlowTokens`: exposed as CSS variables on every Categories screen
 *   (`--nk-type-cat-*`, `--nk-layout-cat-*`, `--nk-space-cat-*`, `--nk-color-cat-*`). Only values with no equal
 *   global token live here; everything else uses --nk-color-* / --nk-palette-* / --nk-space-* / --nk-radius-*.
 */
export const categoriesTokens = {
  /** CollapsibleBannerModule/MainBanner: MAIN_BANNERS_GAP, MAIN_BANNER_BOTTOM_GRACE_SPACE, BANNER_BORDER_WIDTH */
  mainBannersGap: 5,
  graceSpace: 15,
  bannerBorderWidth: 2,
  /** CollapsibleBannerModule: BANNER_ROW_BOTTOM_MARGIN (also the auto-scroll top offset) */
  rowBottomMargin: 10,
  /** SubBanner: SUB_BANNER_HEIGHT, SUB_BANNERS_GAP, ENTER_TRANSLATE_X, ENTER_DURATION */
  subBannerHeight: 55,
  subBannersGap: 7,
  subEnterX: 25,
  subEnterMs: 300,
  /** Reanimated FadeOutRight default (300ms, translateX → +25) */
  subExitMs: 300,
  /** MainBanner selected: scaleY 1.02 + translateY 15; title scale 1.1 + translateY 15 − 3 */
  selectedScaleY: 1.02,
  selectedTitleScale: 1.1,
  selectedTitleShift: 12,
  /** reanimated withTiming() default: 300ms, Easing.inOut(Easing.quad); border cross-fade 200ms */
  timingMs: 300,
  borderFadeMs: 200,
  timingEase: [0.455, 0.03, 0.515, 0.955] as [number, number, number, number],
  /** live CMS ratios: main banner 131.31 (396×520), sub banner 100, pre-search ad 10.81 (740×80) */
  mainBannerRatio: 131.31313131313132,
  /** ProgressLoader: 800ms loop, Easing.ease (bezier .42,0,1,1), bar width 70% */
  loaderMs: 800,
  loaderEase: [0.42, 0, 1, 1] as [number, number, number, number],
  loaderBarWidth: 0.7,
  /** demo: DynamicLoaderScreen fetch of /categories on the first visit of the session */
  demoLoadMs: 700,
} as const;

/** RN Text without lineHeight → CSS `line-height: normal`. */
const t = (size: number, weight: number, line: number | string = 'normal') => ({ size, line, weight });

export const categoriesFlowTokens: TokenOverrides = {
  colors: {
    /** StaticPage / DynamicLoaderScreen container: white */
    bgPage: palette.white,
    /** CMS collapsibleBannerModule.borderColor → MainBanner borderColorSelected (server-driven) */
    catBorderSelected: '#DBDBDB',
  },
  spacing: {
    catS5: 5, // MAIN_BANNERS_GAP, sub-banner image marginLeft / paddingVertical, title paddingHorizontal
    catS7: 7, // SUB_BANNERS_GAP
    catS30: 30, // EmptyView container paddingHorizontal
    catS35: 35, // NoonEmptyView title / button marginTop
  },
  radius: {
    catR5: 5, // SubBanner container + image
  },
  layout: {
    catBannerBorder: 2, // BANNER_BORDER_WIDTH
    catGrace: 15, // MAIN_BANNER_BOTTOM_GRACE_SPACE
    catSubBannerHeight: 55, // SUB_BANNER_HEIGHT
    catSubImageWidth: 50, // SubBanner subBannerImage width
    catLoaderHeight: 4, // ProgressLoader bar
    catRetryHeight: 50, // PrimaryButton height
    catRetryMinWidth: 100, // NoonEmptyView button minWidth
    catErrorImageWidth: 264, // empty-error.webp @1x (792×552 @3x)
  },
  type: {
    /** ModuleHeader title: CMS titleFontSize 18 / titleFontWeight "500" */
    catModuleTitle: t(18, 500),
    /** MainBanner title + SubBanner text: CMS titleTextFontSize 13 / titleTextFontWeight "bold" */
    catBannerTitle: t(13, 700),
    /** NoonEmptyView title 16 bold / message 14 / PrimaryButton text 14 bold */
    catErrorTitle: t(16, 700),
    catErrorMessage: t(14, 400),
    catRetry: t(14, 700),
  },
};
