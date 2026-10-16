import type { TokenOverrides } from '../../foundations/tokens';

/**
 * Storefront PDP (Figma 2ldJbjmQq4RkhnrNFCfXQB · 3499:75115) tokens for the delivery card (3499:75275), the newer-model
 * card (3499:75229) and the variant picker (3499:75276). Merged into pdpFlowTokens by the lead; keys are prefixed `pdpSfb`
 * → var(--nk-color-pdp-sfb-*) / var(--nk-type-pdp-sfb-*). Only values with no central token within tolerance live here.
 */
export const pdpSfBFlowTokens: TokenOverrides = {
  colors: {
    /** selected variant tile drop shadow 0 6 12 rgba(14,14,14,.02) (no 2% ink alpha in the palette) */
    pdpSfbShadowTint: 'rgba(14, 14, 14, 0.02)', // token-lint-ignore — flow token definition (Figma effect)
    /** Delivery information (PDP Redesign xPr9Ln37JGSBGvNtrsyD0y · 3583:109620): noon One banner light streak (8238:299801) */
    pdpSfbStreak: 'linear-gradient(180deg, rgba(217, 217, 217, 0.15) 0%, rgba(255, 255, 255, 0) 100%)', // token-lint-ignore — Figma fill
    pdpSfbStreakShadow: 'rgba(0, 0, 0, 0.25)', // token-lint-ignore — Figma drop shadow 0 4 4
    /** Global "Free Shipping over …" strip (3583:110256) */
    pdpSfbGlobalStrip: 'linear-gradient(-79.19deg, #E9DEF2 4.41%, #FFFFFF 35.98%)', // token-lint-ignore — Figma fill
  },
  layout: {
    /** express artwork 59 × 19.6 (Figma 3583:109486 › express) */
    pdpSfbExpressW: 59,
    /** newer-model thumb 55 × 68 (3499:75237) */
    pdpSfbThumbW: 55,
    pdpSfbThumbH: 68,
    /** colour tile image box 80 (3499:75313 / 75322; selected 88 h snapped) */
    pdpSfbSwatchImage: 80,
    /** marketplace pill height in the compact delivery rows (market / Global 22) */
    pdpSfbPill: 22,
  },
  type: {
    /** card title 15/700/17 (no Figma style) */
    pdpSfbSectionTitle: { size: 15, line: 17, weight: 700 },
    /** delivery estimate Noontree Regular 14 / 16.8 */
    pdpSfbText14Lh17: { size: 14, line: 17, weight: 400 },
    /** accordion titles Noontree SemiBold 14 / 16.8 */
    pdpSfbText14SemiboldLh17: { size: 14, line: 17, weight: 600 },
    /** B14/Medium 14/500/20: newer-model title, unselected variant pills */
    pdpSfbText14MediumLh20: { size: 14, line: 20, weight: 500 },
    /** Body/B11/SemiBold 11/600/14: variant "% OFF" */
    pdpSfbText11SemiboldLh14: { size: 11, line: 14, weight: 600 },
    /** "Order in 21 hrs" chip Noontree SemiBold 12 / 19.6 */
    pdpSfbText12SemiboldLh20: { size: 12, line: 19.6, weight: 600 },
    /** Global strip Label4 Medium 13/14 */
    pdpSfbText13MediumLh14: { size: 13, line: 14, weight: 500 },
  },
};
