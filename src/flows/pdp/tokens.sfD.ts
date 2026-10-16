import type { TokenOverrides } from '../../foundations/tokens';

/**
 * Storefront PDP (Figma 2ldJbjmQq4RkhnrNFCfXQB · 3499:75115) tokens for the seller widget (3499:75647), Product
 * Features / A+ (3499:75700), the sponsored brand carousel (3499:75701) and Frequently bought together (3499:75702).
 * Merged into pdpFlowTokens by the lead; keys are prefixed `pdpSfd` → var(--nk-type-pdp-sfd-*), var(--nk-layout-pdp-sfd-*),
 * var(--nk-shadow-pdp-sfd-*). Only values with no central token within tolerance live here.
 */
export const pdpSfDFlowTokens: TokenOverrides = {
  type: {
    /** card title 15/700/17 (no Figma style) */
    pdpSfdSectionTitle: { size: 15, line: 17, weight: 700 },
    /** seller "74%" Noontree Bold 12/14 */
    pdpSfdText12BoldLh14: { size: 12, line: 14, weight: 700 },
    /** sponsored brand "Shop {brand}" Noontree Bold 13 / 18 */
    pdpSfdText13BoldLh18: { size: 13, line: 18, weight: 700 },
  },
  layout: {
    /** seller logo box 48 (r10, p12) */
    pdpSfdSellerLogo: 48,
    /** seller pills / offers row heights */
    pdpSfdPill: 24,
    pdpSfdRow: 36,
    /** A+ bottom fade height */
    pdpSfdAplusFade: 229,
    /** sponsored brand: logo tile 44, card 216, image 64×71, text column 132 */
    pdpSfdBrandLogo: 44,
    pdpSfdBrandCardW: 216,
    pdpSfdBrandImageW: 64,
    pdpSfdBrandImageH: 71,
    /** FBT: image 140 tall, tiles ≥ 101 wide, "+" column 24 with the disc at pt 64, tiles overlap the column by 6 */
    pdpSfdFbtImageH: 140,
    pdpSfdFbtTileMin: 101,
    pdpSfdFbtPlusTop: 64,
    pdpSfdFbtOverlap: -6,
    pdpSfdFbtCheckOffset: -5,
    /** express ETA artwork height under card prices */
    pdpSfdEta: 15,
  },
  shadow: {
    /** FBT "Buy all" button: drop-shadow 0 0 4 rgba(0,118,255,.1) */
    pdpSfdBuyAll: '0 0 4px rgba(0, 118, 255, 0.1)', // token-lint-ignore — flow token definition (Figma effect)
  },
};
