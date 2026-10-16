import type { TokenOverrides } from '../../foundations/tokens';

/**
 * Homepage Revamp 2025 flow tokens for the category grid, the "Recommended for you" icon tabs and the SKU rails
 * (Figma iRE9RwO94eMAyW3j3XKNXW · 1337:5151 / 1337:5233 / 1337:5572 / 1337:6349). Merged into homeFlowTokens; keys are
 * prefixed `home`. The SKU card itself uses central tokens (colors.sku*, type.text15BoldLh20).
 */
export const homeRailsFlowTokens: TokenOverrides = {
  colors: {
    homeTabGlow: '#E0EFFF', // token-lint-ignore — flow token definition: active icon tab bottom glow (white 25.5% → #E0EFFF 117.5%)
    homeSaleFrom: '#E11111', // token-lint-ignore — flow token definition: category "SALE" ribbon gradient start
    homeSaleTo: '#FF5959', // token-lint-ignore — flow token definition: category "SALE" ribbon gradient end
  },
  type: {
    homeText13SemiboldLh14: { size: 13, line: 14, weight: 600 }, // category tile label
    homeText13BoldLh16: { size: 13, line: 16, weight: 700 }, // active icon tab label
    homeText11BoldLh13: { size: 11, line: 13, weight: 700 }, // "SALE" ribbon
  },
};
