import type { TokenOverrides } from '../../foundations/tokens';

/**
 * Homepage Revamp 2025 flow tokens for the header, cashback ticker and hero (merged into homeFlowTokens).
 * Keys are prefixed `home`. Values are Figma iRE9RwO94eMAyW3j3XKNXW (1337:6688, 1337:5131, 1337:5106)
 * with no central token within tolerance. Gradients are the Figma radial fills converted to CSS ellipses
 * (gradientTransform axes × r10). The header gradient centre is shifted by the kit's taller status bar
 * (54 vs Figma 43) so it sits in the same place relative to the switcher.
 */
export const homeHeaderFlowTokens: TokenOverrides = {
  colors: {
    // 1337:6689 — light-blue radial over white (centre 188,-210.58 in a 266-tall layer, radii 703×499)
    homeHeaderGradient:
      'radial-gradient(703px 499px at 50% calc(var(--nk-inset-top) - 254px), rgba(212, 239, 246, 1) 10%, rgba(219, 225, 249, 1) 50%, rgba(235, 243, 249, 1) 70%, rgba(181, 228, 242, 0.5) 85%, rgba(128, 213, 234, 0) 100%), var(--nk-palette-white)', // token-lint-ignore — flow token definition (Figma fill)
    // 1337:6715 — white radial fade along the bottom edge (radii 1682×120)
    homeHeaderFade: 'radial-gradient(1682px 120px at 50% 100%, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 100%)', // token-lint-ignore — flow token definition (Figma fill)
    // Alpha/GrayA/900 — ticker pager, hero copy
    homeAlphaGray900: 'rgba(14, 14, 14, 0.79)', // token-lint-ignore — Figma variable Alpha/GrayA/900
    // 1337:5107 — welcome hero card (radial #FFF1D2 → #FFFEF5, radii 850×295 from bottom centre)
    homeHeroWelcomeBg: 'radial-gradient(850px 295px at 50% 100%, #FFF1D2 38.849%, #FFFEF5 100%)', // token-lint-ignore — flow token definition (Figma fill)
    homeHeroCodeInk: '#2D0802', // token-lint-ignore — promo code chip text
    homeHeroAdBg: 'rgba(0, 0, 0, 0.16)', // token-lint-ignore — hero "Ad" badge (blackAlpha16 missing centrally)
  },
  type: {
    homeText13BoldLh16: { size: 13, line: 16, weight: 700 }, // ticker pager "1/5" (13 Bold, lh 1.2)
    homeText12BoldLh13: { size: 12, line: 13, weight: 700 }, // hero "Welcome! Earn" (12 Bold, lh 1.1)
    homeText12BoldLh14: { size: 12, line: 14, weight: 700 }, // hero "Cashback" (12 Bold, lh 1.2)
    homeText36ExtraboldLh26: { size: 36, line: 26, weight: 800 }, // hero amount (Noontree ExtraBold 36/25.7)
    homeText10BoldLh16: { size: 10, line: 16, weight: 700 }, // hero code chip
    homeText6MediumLh7: { size: 6, line: 7, weight: 500 }, // "*T&C Apply" (6, lh 1.1)
  },
  spacing: {
    homeHeroGap: 9, // hero cards
  },
  shadow: {
    homeAddressLabel: '0 8px 16px rgba(0, 0, 0, 0.07)', // token-lint-ignore — "Home" text-shadow
  },
};
