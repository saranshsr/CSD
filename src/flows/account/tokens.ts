import type { TokenOverrides } from '../../foundations/tokens';

/**
 * Account-only tokens (values from bappzaar NoonAccount/* styles).
 * `accountTokens` is used directly by this flow's components; `accountFlowTokens`
 * is applied to the whole flow through `flow.tokens` (every key becomes a CSS var,
 * e.g. colors.acctSubtitle → var(--nk-color-acct-subtitle)).
 */
export const accountTokens = {
  edge: 15, // edgeSpacing
  sectionGap: 12,
  cardRadius: 16,
  menuRadius: 14,
  /** NoonAccountProfileHeader: noon One avatar = LinearGradient [paleYellow, noonOneBannerAmber(0.3)] {0,1}→{1,2} — on the 135° line the box spans 50%…150% */
  avatar: { size: 51, bg: '#F2F2F2', noonOneFrom: '#FFF3C0', noonOneTo: 'rgba(255,168,45,0.3)', noonOneInk: '#794000', noonOneGradient: 'linear-gradient(135deg, #FFF3C0 50%, rgba(255,168,45,0.3) 150%)' },
  ring: { bg: '#FFF1E0', border: '#FEDBB4', fill: '#FF9741', idle: '#666D85', counter: '#E5641A' },
  noonOne: { surface: '#FFF3C0', from: '#FEDEA9', to: '#FEF8EC' },
  heroBlue: 'linear-gradient(160deg, #0F61FF 0%, #3D7BFF 55%, #7CA8FF 100%)',
  heroHeight: 320,
  footerMuted: '#989FB3',
  subtitle: '#8B8FA8',
  /** NoonAccountLanguageSwitcher ITEM_WIDTH */
  langItem: 59,
  /** react-native-switch config used by Preferences + Notifications */
  switch: { circle: 16, barHeight: 20, width: 46, inset: 2, active: '#1D2539', inactive: '#EAECF0' },
} as const;

export const accountFlowTokens: TokenOverrides = {
  colors: {
    bgPage: '#F2F3F7',
    // NoonColors values with no matching kit token
    acctSubtitle: '#8B8FA8', // blueGray500
    acctOutline: '#E5E7EB', // gray200
    acctSlate: '#6B7280', // slate500
    acctNightfall: '#02060CEB', // nightFall
    acctDisabled: '#CED1DA', // grayColor
    acctInputBg: '#F5F7FA', // AddressV2FormInput bg
    acctFieldBg: '#FCFCFD', // blueGray50
    acctOrangeTint: '#FFF8EC', // noonSystemOrangeTint
    acctRed: '#FA0000', // redColor
    acctBadgeFrom: '#FDBA74', // orange300
    acctBadgeTo: '#F36302', // pumpkinOrange
    acctBadgeRingFrom: '#FFBE88', // lightApricot
    acctBadgeRingTo: '#F8913E', // tangerine
    acctLegacyBorder: '#F0F2F7', // $borderColor (deletion screen)
    acctPasswordBorder: '#7F8599',
    acctPasswordMuted: '#B5B7BD',
    acctTabText: 'rgba(2, 6, 12, 0.6)',
    acctTabTextActive: 'rgba(2, 6, 12, 0.92)',
  },
  // noon One strip (NoonAccountNoonOne*: RN Text without lineHeight → normal)
  type: {
    acctNoonOneTitle: { size: 15, line: 'normal', weight: 700 }, // NotSubscribed title
    acctNoonOneCta: { size: 14, line: 'normal', weight: 700 }, // joinButtonText / Subscribed title
    // NoonAccountProfileHeader name / email (no lineHeight → normal)
    acctProfileName: { size: 17, line: 'normal', weight: 700 },
    acctProfileEmail: { size: 12, line: 'normal', weight: 400 },
    // NoonAccountActionCard title
    acctActionTitle: { size: 16, line: 22, weight: 700 },
    // one-off master styles (token lint cleanup)
    acctText24BoldLh1: { size: 24, line: '1', weight: 700 },
    acctText15MediumLh25: { size: 15, line: 25, weight: 500 },
    acctText11BoldLh1: { size: 11, line: '1', weight: 700 },
    acctText14MediumLh22: { size: 14, line: 22, weight: 500 },
    acctText16MediumLh20: { size: 16, line: 20, weight: 500 }, // language tab (with 'Cairo' family override)
    acctText17BoldLh20: { size: 17, line: 20, weight: 700 },
    acctText13SemiboldLh22: { size: 13, line: 22, weight: 600 },
    acctText13BoldLh16: { size: 13, line: 16, weight: 700 },
    acctText18SemiboldLh20: { size: 18, line: 20, weight: 600 },
    acctText16BoldLh18: { size: 16, line: 18, weight: 700 },
    acctText21RegularLh1: { size: 21, line: '1', weight: 400 },
  },
  radius: {
    acctNoonOne: 16, // NoonAccountNoonOneLayout bannerContainer borderBottom radii
    acctTile: 9, // NoonAccountActionCard imageWrapper
  },
  layout: {
    acctNoonOneLogoW: 48,
    acctNoonOneLogoH: 36,
    acctNoonOneChevronW: 6,
    acctNoonOneChevronH: 11,
    // NoonAccountActionCard imageWrapper 48×68, imageWrapperOuter marginHorizontal −5
    acctTileW: 48,
    acctTileH: 68,
    acctTileOverlap: -5,
  },
};
