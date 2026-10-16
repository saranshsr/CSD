import type { TokenOverrides } from '../../foundations/tokens';

/**
 * Storefront PDP (Figma 2ldJbjmQq4RkhnrNFCfXQB · 3499:75115) flow tokens for the reviews card (3499:75703), the
 * product rails (3499:75876 / 3499:75877) and the Bottom Nav (3499:75904). Keys are prefixed `pdpSfe` (CSS `--nk-*-pdp-sfe-*`); merge into
 * pdpFlowTokens. Only values with no central token within tolerance live here.
 */
export const pdpSfEFlowTokens: TokenOverrides = {
  colors: {
    pdpSfeRecoMediaTint: 'rgba(0, 40, 136, 0.02)', // token-lint-ignore — Product card "Image container" fill (2% cobalt; skuMediaTint is 4%)
  },
  layout: {
    pdpSfeRecoImage: 156, // Product card image square: 87.5% of the 134 × 178.67 (3:4) box
  },
  type: {
    pdpSfeTitle: { size: 15, line: 17, weight: 700 }, // card titles "Ratings & Reviews", "Photo Reviews (n)", "Similar Products"
    pdpSfeScore: { size: 22, line: 24, weight: 800 }, // rating summary score
    pdpSfeChip: { size: 11, line: 14, weight: 500 }, // review variant chips / "View product"
    pdpSfePrice: { size: 15, line: 16, weight: 700 }, // rail card selling price
  },
};
