import type { TokenOverrides } from '../../foundations/tokens';

/**
 * Address-only tokens (values copied from bappzaar origin/master AddressV2 / MapV2 `styles.ts`,
 * `src/constants/AddressConstants.ts` and NoonColors). Anything that already exists as a kit
 * token (#3866DF accent → --nk-color-cta, #1D2539 → --nk-color-text-primary, …) is used from the
 * kit directly; only the values below are flow-local.
 *
 * Each colour is exposed as `var(--nk-color-addr-<kebab>)` on every screen of this flow.
 */
export const addressColors = {
  // page + cards
  addrPage: '#F9F9FB', // SelectScreen container / header / statusbar
  addrCardHeaderSelected: '#EFF7FF', // $addressCardHeaderBackgroundColor
  addrCardBorderSelected: '#E1EFFF', // $addressCardBorderColor / lavender
  addrNickname: '#0E0E0E',
  addrTabTrack: '#F2F3F7',
  addrTabText: 'rgba(2, 6, 12, 0.6)',
  addrTabTextActive: 'rgba(2, 6, 12, 0.92)',
  addrDistanceBg: '#EFF7FF',
  addrCover: 'rgba(255, 255, 255, 0.6)', // #FFFFFF99 loading cover

  // form
  addrFormHeader: '#F6F7F9',
  addrInputBg: '#F5F7FA',
  addrInputBorder: '#F9F9FB',
  addrInputError: '#F43333',
  addrTagBorder: '#F5F6F9',
  addrRequired: '#FA0000', // $redColor
  addrDisabled: '#CED1DA', // $grayColor
  addrNoonGrey1: '#7E859B',
  addrNoonGrey2: '#9BA0B1',

  // map
  addrMapBg: '#DEDFE2',
  addrTooltipErrorBg: '#FCE9EF', // AddressColors.lightRed
  addrTooltipErrorText: '#C30A42', // AddressColors.pinkText
  addrTooltipWarnBg: '#FFEDD5', // AddressColors.lightYellow
  addrTooltipWarnText: '#B93D14', // AddressColors.lightOrange
  addrTooltipArrowError: '#FAEDED',
  addrOverlayBorder: 'rgba(242, 243, 247, 1)',
  addrSearchText: '#101628',
  addrPrimaryText: '#02060C',
  addrLightGrayish: '#EAECF0',

  // controls / delete
  addrControlText: '#262A33',
  addrDeleteBox: '#FCFCFD',
  addrHairline: 'rgba(14, 14, 14, 0.07)', // #0E0E0E12
  addrSuccessBg: 'rgb(251, 251, 251)',
  addrToastBorder: 'rgba(255, 255, 255, 0.8)',
} as const;

/** Numbers used from TS (AddressOverlayStylings + component metrics). */
export const addressMetrics = {
  overlayEdge: 12, // AddressOverlayStylings.EDGE_SPACING
  fixedActionHeight: 68, // AddressOverlayStylings.FIXED_ACTION_HEIGHT
  pinLift: -12, // MapPinTooltip translateY while dragging
  pinWidth: 40,
  pinHeight: 52,
  tabWidth: 390 / 2 - 25, // TabSwitcher: screenWidth / tabs - 25
  mapZoomOverlay: 1.25, // Map scale while the form overlay is open
  mapZoomSearch: 1.2, // startZoomInAnimation
} as const;

/** Stylised map palette (Google Maps light style, drawn locally — no tiles). */
export const mapPalette = {
  land: '#F5F3EE',
  block: '#ECEAE4',
  blockStroke: '#E2DFD8',
  tower: '#E6E3DC',
  road: '#FFFFFF',
  roadCasing: '#E3E1DB',
  highway: '#FCE8A6',
  highwayCasing: '#EFCF73',
  water: '#AAD3F5',
  waterDeep: '#9CCBF2',
  park: '#CFE8C6',
  golf: '#BFE2B3',
  sand: '#F4ECD8',
  label: '#5F6368',
  labelWater: '#4A86C5',
  labelPark: '#3E7D3A',
  poi: '#8E8E93',
  metro: '#E94B3C',
  polygonStroke: 'rgba(0, 87, 255, 1)',
  polygonFillStart: 'rgba(0, 87, 255, 0.5)',
  polygonFillEnd: 'rgba(0, 87, 255, 0.2)',
} as const;

export const addressFlowTokens: TokenOverrides = {
  colors: { ...addressColors },
};
