import type { TokenOverrides } from '../../foundations/tokens';
import { FREE_DELIVERY_THRESHOLD, type CartGroupType } from '../../kit/DemoStore';

/**
 * Cart-only tokens. Values from bappzaar master:
 *  NoonCartScreen/styles.ts, NoonCartGroup/styles.ts, NoonCartItem/styles.ts,
 *  NoonCartItemQuantitySelector, NoonCartItemDiscountTags, NoonCartGroupProgressBar,
 *  NoonCouponInput, NoonDynamicInvoice, NoonCartScreenCallouts (+ NoonColors / colorStatic).
 * Kit tokens are used where the value already exists (e.g. --nk-color-border = $lightGreyColor).
 */
export const cartTokens = {
  freeDeliveryThreshold: FREE_DELIVERY_THRESHOLD,
  horizontalPadding: 12, // NoonCartScreenMetrics.horizontalPadding / cartGroupHorizontalMargin
  borderRadius: 16, // NoonCartScreenMetrics.borderRadius
  itemImageWidth: 104,
  progress: {
    barHeight: 4, // Figma progress bar h4
    hiddenTranslateY: 20,
    visibleMarginTop: 8,
    delayMs: 1000,
    delayOffsetMs: 200,
    spring: { damping: 16, stiffness: 100, mass: 1 },
    shimmerMs: 1800,
    shimmerRepeat: 7,
    shimmerRatio: 0.35,
    shimmerMin: 28,
    shimmerMax: 56,
  },
  invoice: { slideMs: 300, backdropMs: 200, closedTranslateY: 400, openTranslateY: 12, maxHeight: 400 },
  qtyDebounceMs: 1200,
} as const;

/**
 * Figma Cart 2.0 (BaWAAGW7zmdSTkXNXqPcAJ / 10575:94058) values with no central token.
 * Names mirror the Figma variable where one is bound; see FIGMA-MAPPING.md.
 */
export const cartFigmaColors = {
  // group "Glass effect Container" fills (raw fills in Figma, no variable)
  cartGlassExpress: '#FDFDF1',
  cartGlassGlobal: '#F5F2F7',
  cartGlassMarket: '#EFFAEA',
  cartGlassSupermall: '#E8E8F3', // All flows 127:39690 supermall Glass effect Container
  // supermall Progress bars 127:39717: gradient end, track (fill = rocketBlueSapphire)
  cartProgressSupermall: '#EBEBFE',
  cartTrackSupermall: '#E3E3FC',
  cartEtaSupermall: '#F5F5FC', // supermall ETAs 89:44427 gradient start
  // progress-bar footer gradient end stops (Figma: Yellow/100-ish raw, Purple/200, Green/100)
  cartProgressExpress: '#FEFDD4',
  // ETA pill gradient starts
  cartEtaExpress: '#FDF9C4',
  cartUrgencyBg: '#F3F5FC', // "USPs Urgency" gradient start
  cartComboBg: '#EAF4FE', // "Subtitle Block" Combo gradient start
  cartGiftBg: '#E8FCF2', // "Subtitle Block" gift gradient start
  // added protection card ("Extended warranties" selected)
  cartProtectBorder: '#FCF4DE',
  cartProtectGradientEnd: '#FFF7E5',
  cartProtectCrossBg: '#FFF5DF',
  cartSavingsWave: '#E7FBF3', // footer "Color waves" savings tab fill
  cartWhiteAlpha0: 'rgba(255, 255, 255, 0)',
  cartWhiteAlpha20: 'rgba(255, 255, 255, 0.2)', // SKU heart chip
  cartWhiteAlpha80: 'rgba(255, 255, 255, 0.8)', // SKU "Ad" tag
  cartHeaderTextShadow: 'rgba(0, 0, 0, 0.07)',
  cartGlobalLogoInk: '#3D4048', // "Global" wordmark text
  cartFreebieImageBg: '#F5F7FB', // freebie image tile
  // Payment offers 127:40114 bank-installments tile (noon/50 → noon/100, border noon/300)
  cartNoon50: '#FEFEEB',
  cartNoon300: '#FFF77A',
} as const;

/**
 * Exposed as CSS vars: colors.cartEmerald → var(--nk-color-cart-emerald) etc.
 * Only values with no matching central token live here.
 */
export const cartFlowTokens: TokenOverrides = {
  colors: {
    bgPage: '#F2F3F7', // feedbackView backgroundColor
    cartEmerald: '#13645F', // emeraldGreen — <highlight>, success coupon
    cartEmerald700: '#1F7A74', // emeraldGreen700 — discount icon (coupon "available offers")
    cartSlate600: '#526075', // slate600 — invoice titles
    cartTextTertiary: '#8D8F92', // NoonColors.textTertiary — invoice <steel>
    cartSecondaryText: '#5D5D5D', // secondaryTextColor — qty selector icons
    cartQtyBorder: '#DADCE3', // $noonGrey3 — qty selector + disabled CTA
    cartBrightGrey: '#EBEBEB', // brightGreyColor — dashed item separator
    cartDashedInvoice: '#D0D4DD', // invoice dashed separator
    cartAccentBlue: '#0057FF', // $accentBlue — Checkout CTA
    cartWishlistPink: '#FF4869', // NoonTokens.colors.watermelonPink (wishlist v2 heart)
    cartMintWhite: '#E9FBF9', // $mintWhite — discount tag bg
    cartOliveGray: 'rgba(31, 122, 116, 0.4)', // $oliveGray #1F7A7466 — discount tag dashed border
    cartOrangeTint: '#FFF8EC', // $noonSystemOrangeTint — cart updates banner
    cartOrangeBorder: '#FED7AA',
    cartOrangeLink: '#E04E00',
    cartCouponError: '#B22424', // darkRed
    cartCouponErrorBorder: '#FECACA',
    cartCouponSuccessBorder: '#9EE9E4',
    cartCouponWarning: '#B45309', // copperColor
    cartCouponWarningBorder: '#FDE68A',
    cartToastBg: '#F0FDF1',
    cartEmerald100: '#D1FAE5', // invoice special section
    cartNoonGrey4: '#F3F4F8', // $noonGrey4 — customization pill
    cartBlue: '#3866DF', // $blueColor — customization "Edit"
    cartSteel: '#7E859B', // steelColor — HtmlView <steel>
    cartEmerald800: '#115A56', // emeraldGreen800 — best-price coupon <highlight>
    cartMintGreen300: '#EBFFF4',
    cartMintGreen200: '#F5FEFA',
    cartGreenCrystal: '#ECFEF6', // integrated noon One callout
    cartProgressTrack: '#EAECF0',
    cartProgressFill: '#000000',
    cartNewBorder: 'rgba(14, 14, 14, 0.07)', // $newBorderColor
    cartLoaderBg: '#F5F7FF', // ProgressLoader background
    // coupon tray (NoonSalesCouponTrayOverlayScreen, see components/couponTray/MAPPING.md)
    trayBlueGray400: '#9DA3C4', // blueGray400 — disabled dotted CTA text
    trayOrange50: '#FFFAF5', // orange50 — unlock criteria / join One banner
    traySeafoam: '#B7DDCE', // seafoam — added unit chip top shadow
    trayCloudGray: '#D3D4D8', // cloudGray — unit / tier chip top shadow
    trayGreen200: '#CBF6E5', // green200 — added unit chip border
    trayBrightTeal: '#F6FEFB', // brightTeal — tiers bar with an unlocked tier
    trayBestPriceBg: '#E9FAF3', // bestPriceGreenBackground — best price separator
    trayBestPriceBorder: '#D0F6E6', // bestPriceBorder — separator plus circle
    ...cartFigmaColors,
  },
  // Figma text styles with no central type token
  type: {
    cartHeaderLabel: { size: 16, line: 21.1, weight: 700 }, // Nav Header "Home" (Figtree Bold 16/21.1)
    cartLabel5: { size: 11, line: 12, weight: 400 }, // Primary/Label5/Regular
    cartEwText: { size: 12, line: 16.8, weight: 500 }, // Extended warranty row label
    cartEwCta: { size: 12, line: 16.8, weight: 600 }, // Extended warranty "Add"
    cartGlobalLogo: { size: 14.45, line: 'normal', weight: 700 }, // "Global" wordmark text (Figtree Bold)
    cartGiftsTitle: { size: 16, line: 24, weight: 700 }, // "Free gifts for you" (Figtree Bold 16/24)
    // one-off master styles (lint cleanup)
    cartText10ExtraboldLh1: { size: 10, line: '1', weight: 800 },
    cartText10RegularLh1: { size: 10, line: '1', weight: 400 },
    cartText10BoldLh12: { size: 10, line: 12, weight: 700 },
    cartText13SemiboldLh1p35: { size: 13, line: '1.35', weight: 600 },
  },
  shadow: {
    cartHeaderLabel: '0 8.043px 16.086px var(--nk-color-cart-header-text-shadow)',
    cartFooter: '0 -4px 10px var(--nk-palette-black-alpha8)', // Figma Cart Sticky footer drop shadow (All flows 127:40220)
  },
};

/**
 * Per-group Figma styling (Glass effect Container / items / Progress bars / ETA / "+ Add"). CSS vars only.
 * `progressBg` is the whole "Progress bars" fill; supermall (All flows 127:39717) is a straight white → #EBEBFE fade,
 * the others the −1.08deg Cart 2.0 gradient. `etaInk` / `add*` are set only where the group recolours them.
 */
type GroupTheme = { glass: string; border: string; progressEnd: string; progressBg: string; track: string; fill: string; eta: string; etaInk?: string; addBorder?: string; addInk?: string };
const cart20Progress = (end: string) => `linear-gradient(-1.08deg, var(--nk-color-bg-surface) 6.77%, ${end} 264.03%)`;
export const groupTheme: Record<CartGroupType, GroupTheme> = {
  supermall: {
    glass: 'var(--nk-color-cart-glass-supermall)',
    border: 'var(--nk-palette-persian-blue100)',
    progressEnd: 'var(--nk-color-cart-progress-supermall)',
    progressBg: 'linear-gradient(0deg, var(--nk-color-bg-surface) 0%, var(--nk-color-cart-progress-supermall) 84.375%)',
    track: 'var(--nk-color-cart-track-supermall)',
    fill: 'var(--nk-palette-rocket-blue-sapphire)',
    eta: 'var(--nk-color-cart-eta-supermall)',
    etaInk: 'var(--nk-palette-rocket-blue-sapphire)',
    addBorder: 'var(--nk-palette-persian-blue50)',
    addInk: 'var(--nk-palette-persian-blue)',
  },
  express: { glass: 'var(--nk-color-cart-glass-express)', border: 'var(--nk-palette-yellow200)', progressEnd: 'var(--nk-color-cart-progress-express)', progressBg: cart20Progress('var(--nk-color-cart-progress-express)'), track: 'var(--nk-color-border)', fill: 'var(--nk-color-text-strong)', eta: 'var(--nk-color-cart-eta-express)' },
  xborder: { glass: 'var(--nk-color-cart-glass-global)', border: 'var(--nk-palette-purple200)', progressEnd: 'var(--nk-palette-purple200)', progressBg: cart20Progress('var(--nk-palette-purple200)'), track: 'var(--nk-color-border)', fill: 'var(--nk-palette-black)', eta: 'var(--nk-palette-border-primary)' },
  marketplace: { glass: 'var(--nk-color-cart-glass-market)', border: 'var(--nk-palette-green200)', progressEnd: 'var(--nk-palette-green100)', progressBg: cart20Progress('var(--nk-palette-green100)'), track: 'var(--nk-color-border)', fill: 'var(--nk-color-text-strong)', eta: 'var(--nk-palette-border-primary)' },
};

/** Coupon tray motion (NoonSalesCouponTrayAnimatedItem, NoonSalesCouponTrayOffer, unlock criteria / tiers bars). */
export const couponTrayMotion = {
  ease: [0.33, 1, 0.68, 1] as [number, number, number, number], // Easing.bezier(0.33, 1, 0.68, 1)
  opacityS: 0.3,
  translateS: 0.55,
  startY: 10,
  staggerS: 0.1,
  delayS: 0.3, // when the tray opens with initialData
  maxAnimated: 10,
  expandS: 0.3, // withTiming default
  barS: 0.5, // progress bars
} as const;
