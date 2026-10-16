import type { TokenOverrides } from '../../foundations/tokens';

/**
 * Home feed · bappzaar modules (master ba159e20). Values resolved from bappzaar `styles.ts` + NoonTokens / Colors /
 * Metrics, and the live CMS home payload (`/_svc/catalog/api/v3/u/`, Oct 2026). Keys are prefixed `homeBz`.
 * Colours with no central token stay here as literals.
 */
export const homeFeedFlowTokens: TokenOverrides = {
  colors: {
    // Sponsored (src/components/Sponsored): CMS label textColor
    homeBzAdLabel: '#828282', // token-lint-ignore — CMS label textColor
    // CMS bgColor of homepage-explore-more-icons
    homeBzExploreBg: '#F9F2A4', // token-lint-ignore — CMS bgColor
    // CMS bgColor of homepage-mega-deals
    homeBzMegaBg: '#EFEEFF', // token-lint-ignore — CMS bgColor
    // CMS timerBgColor / headerColor of homepage-mega-deals
    homeBzMegaTimer: '#0A0A0A', // token-lint-ignore — CMS timerBgColor
    homeBzMegaInk: '#141414', // token-lint-ignore — CMS link text colour
    // CMS slot tagBgColor of homepage-mega-deals
    homeBzMegaTag: '#9242F8', // token-lint-ignore — CMS tagBgColor
    // NoonMegaDealsSlotItem old price / discount
    homeBzMegaWas: '#989FB3', // token-lint-ignore — NoonMegaDealsModule styles
    homeBzMegaOff: '#2DAF32', // token-lint-ignore — NoonMegaDealsModule styles
    // NoonItemCarouselModule description pill
    homeBzItemPillBg: '#F1F7FD', // token-lint-ignore — NoonItemCarouselModule styles
    homeBzItemPillInk: '#0076FF', // token-lint-ignore — NoonItemCarouselModule styles
    homeBzItemTitle: '#101628', // token-lint-ignore — NoonItemCarouselModule styles
    // AdProductLedDisplayCard
    homeBzPldDivider: '#EAECF0', // token-lint-ignore — AdProductLedDisplayCard styles
    homeBzPldPrice: '#1D2539', // token-lint-ignore — AdProductLedDisplayCard styles
    homeBzPldOff: '#02A31E', // token-lint-ignore — AdProductLedDisplayCard styles
    homeBzPldAdBg: 'rgba(38, 38, 38, 0.3)', // token-lint-ignore — Sponsored dark tag
    homeBzPldAdInk: 'rgba(255, 255, 255, 0.64)', // token-lint-ignore — Sponsored dark tag
    homeBzPldAdBorder: 'rgba(255, 255, 255, 0.2)', // token-lint-ignore — Sponsored dark tag border
    // BannerModule scroller / ModuleHeader titles set by the CMS
    homeBzTitleGrey: '#313131', // token-lint-ignore — CMS titleColor (Explore More)
  },
  type: {
    homeBzTitle18: { size: 18, line: 22, weight: 700 }, // ModuleHeader title (18 bold, font default line)
    homeBzLink15: { size: 15, line: 20, weight: 700 }, // ModuleHeader "View all"
    homeBzAd13: { size: 13, line: 16, weight: 400 }, // Sponsored text (base text 13)
    homeBzMegaPrice: { size: 18, line: 22, weight: 700 },
    homeBzMegaWas: { size: 14, line: 18, weight: 600 },
    homeBzMegaTimer: { size: 14, line: 19, weight: 700 },
    homeBzPldTitle: { size: 20, line: 26, weight: 600 },
    homeBzPldPrice: { size: 26, line: 30, weight: 700 },
    homeBzPldSmall: { size: 11, line: 15, weight: 400 },
    homeBzPldSmallBold: { size: 11, line: 15, weight: 600 },
  },
};

/**
 * Geometry at the kit's 390pt device (W). bappzaar computes these from `Dimensions.get('window').width`;
 * the formulas are kept next to each number.
 */
const W = 390;
const PAD = 15; // Metrics.staticPagePadding
const r3 = (n: number) => Math.round(n * 3) / 3; // PixelRatio.roundToNearestPixel @3x

export const bz = {
  W,
  pad: PAD,
  radius: 20, // BannerContent roundedCornerStyles
  /** adBannerModule / bannerModule grid, numPerRow 1: floor(W − 2·15) wide, height = round3x(w · ratio / 100) */
  gridWidth: Math.floor(W - 2 * PAD), // 360
  /** snapped carousel (NoonSlider): ceil((W − slideSpaceCount·iS) / npv), npv 1.1, iS 15 → slideSpaceCount 1 */
  stripWidth: Math.ceil((W - 1 * 15) / 1.1), // 341
  sliderInterval: 3000, // NoonSlider slideDelayInMs
  sliderAdvance: 0.45, // AUTO_ADVANCE_DURATION_MS 450, Easing.out(cubic)
  sliderFade: 0.85, // NoonSliderSlot: off-centre slides fade to 0.85
  /** default (free) carousel: (W − ceil(npv)·iS) / npv, npv 3.5, iS 15 */
  carouselWidth: (W - Math.ceil(3.5) * 15) / 3.5, // 94.29
  /** bannerModuleScroller: floor((W − 2·iS − (n−1)·iS) / n) */
  scrollerWidth: (n: number, iS = 15) => Math.floor((W - 2 * iS - (n - 1) * iS) / n),
  /** easyBannerScroller: floor((W − 2·iS − (npv−1)·iS) / npv) */
  easyWidth: (npv: number, iS = 15) => Math.floor((W - 2 * iS - (npv - 1) * iS) / npv),
  easyPxPerSecond: 1000 / 96, // marquee: linear, 96 ms per px
  /** productCarousel: round((W − 15 − floor(2.6)·8) / 2.6) = 138; image round((138 − 12 − 2) · 1.361) = 169 */
  productWidth: Math.round((W - PAD - Math.floor(2.6) * 8) / 2.6),
  productImageHeight: Math.round((Math.round((W - PAD - Math.floor(2.6) * 8) / 2.6) - 12 - 2) * 1.361),
  productGap: 8,
  /** NoonDynamicCarousel with the live CMS layout (numPerView 1.4, gap 15, ratio 150) */
  hero: { width: r3(W / 1.4 - 15), height: r3((r3(W / 1.4 - 15) * 150) / 100), gap: 15 },
  /** hpMegaDealModule: floor((W − 12·3) / 2) = 177; image (3.85 / 3) · 177 */
  megaWidth: Math.floor((W - 12 * 3) / 2),
  megaImageHeight: ((3.85 / 3) * Math.floor((W - 12 * 3) / 2)),
  r3,
} as const;
