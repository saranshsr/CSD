import type { TokenOverrides } from '../../foundations/tokens';

/**
 * Homepage Revamp 2025 flow tokens for the feed modules: Offers for you (1337:5485), Keep shopping for (1337:5804),
 * the sponsored brand module (1337:6106) and NEW LAUNCHES (1337:6582). Merged into homeFlowTokens; keys are prefixed `home`.
 * Only values with no central token within tolerance live here (Figma iRE9RwO94eMAyW3j3XKNXW).
 */
export const homeModulesFlowTokens: TokenOverrides = {
  colors: {
    // Offer tickets: 2.5px gradient strokes (Figma linear paints, axis top-right → bottom-left ≈ 245deg)
    homeOfferBorderEnbd: 'linear-gradient(245deg, #B73428 0%, #B63428 50%, #601D17 100%)', // token-lint-ignore — flow token definition (Figma stroke)
    homeOfferBorderDash: 'linear-gradient(245deg, #15859B 0%, #14809B 50%, #105866 100%)', // token-lint-ignore — flow token definition (Figma stroke)
    homeOfferBorderOne: 'linear-gradient(245deg, #830034 0%, #EC4385 50%, #8D0038 100%)', // token-lint-ignore — flow token definition (Figma stroke)
    // Keep shopping
    homeKeepCollectionBg: '#EBEDFF', // token-lint-ignore — collection image box
    homeKeepPurple: '#AF33D9', // token-lint-ignore — Figma Purple/800, "10 Products" chip
    homeKeepTagSoft: 'rgba(255, 255, 255, 0.55)', // token-lint-ignore — "2 days ago" tag on tinted boxes
    // Sponsored brand module
    homeBrandBg: 'linear-gradient(90.5deg, #111111 0.45%, #414755 51.4%, #111111 99.49%)', // token-lint-ignore — flow token definition (Figma fill)
    homeBrandAdBg: 'rgba(255, 255, 255, 0.1)', // token-lint-ignore — "Ad" tag on the dark module (whiteAlpha10 missing)
    // NEW LAUNCHES
    homeLaunchBg: '#121212', // token-lint-ignore — inset dark card
    homeLaunchAccent: '#E5FF43', // token-lint-ignore — lime "LAUNCHES"
    homeLaunchSub: '#ACACAC', // token-lint-ignore — "Now available on noon"
  },
  type: {
    homeText11RegularLh12: { size: 11, line: 12, weight: 400 }, // offer sub copy (Figtree 11.26/12.38)
    homeText14MediumLh16: { size: 14, line: 16, weight: 500 }, // keep-shopping name (Label-3 Medium 14/16)
    homeText20MediumLh20: { size: 20, line: 20, weight: 500 }, // "NEW LAUNCHES" (Figtree Medium 20, lh 1)
    homeText16LightLh16: { size: 16, line: 16, weight: 300 }, // "Now available on noon" (display Thin 16, lh 1; kit font)
  },
};
