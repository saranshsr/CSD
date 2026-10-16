import type { TokenOverrides } from '../../foundations/tokens';

/**
 * New PDP (Figma Af34gfmhQ1D0wstXUEHSIF · 64:5571), section group B: sponsored "Big Ad" row (64:5589), delivery
 * information (64:5590), newer model (84:8406), free gifts (64:5591), variant picker (64:5592). Keys are prefixed
 * `pdpNpb` → var(--nk-color-pdp-npb-*) / var(--nk-layout-pdp-npb-*) / var(--nk-type-pdp-npb-*). Merged in tokens.ts.
 * Only values with no central token within tolerance live here.
 */
export const pdpNpBFlowTokens: TokenOverrides = {
  colors: {
    /** image container tint: 3% cobalt over white (Big Ad thumb, free-gift image) */
    pdpNpbMediaTint: 'rgba(0, 40, 136, 0.03)', // token-lint-ignore — Figma fill
    /** "Free" ribbon drop shadow 0 4 5 */
    pdpNpbRibbonShadow: 'rgba(122, 122, 122, 0.25)', // token-lint-ignore — Figma effect
    /** "[before 12pm]" Noontree Light, ink at 80% */
    pdpNpbSlotNote: 'rgba(14, 14, 14, 0.8)', // token-lint-ignore — Figma fill
  },
  layout: {
    /** Big Ad thumb 51.345 × 70 (r9), image inset 3.42 / 4.67 → 44.5 × 60.67 */
    pdpNpbAdThumbW: 51.345,
    pdpNpbAdThumbH: 70,
    pdpNpbAdImageW: 44.5,
    pdpNpbAdImageH: 60.67,
    /** Big Ad express artwork 46.94 × 14 */
    pdpNpbAdExpressW: 46.94,
    /** free gift card 284 wide when more than one (bappzaar NoonFreebie: full − gap − 40 peek) */
    pdpNpbGiftCardW: 284,
    /** free gift image box 56 × 55, "Free" ribbon at 37.5 */
    pdpNpbGiftImageW: 56,
    pdpNpbGiftImageH: 55,
    pdpNpbGiftRibbonTop: 37.5,
    /** variant colour tile image: selected 88 high (full width), others 78, unavailable 80 */
    pdpNpbSwatchSelectedH: 88,
    pdpNpbSwatch: 78,
    pdpNpbSwatchDisabled: 80,
  },
  radius: {
    pdpNpbR9: 9,
  },
  type: {
    /** variant memory price B13/SemiBold 13/600/20 */
    pdpNpbText13SemiboldLh20: { size: 13, line: 20, weight: 600 },
    /** variant "% OFF" B12/SemiBold 12/600/18; faster-delivery "+ ₳ 14.00" Label5 SemiBold 12/18 */
    pdpNpbText12SemiboldLh18: { size: 12, line: 18, weight: 600 },
    /** free gift title Label-2 SemiBold 15/18 */
    pdpNpbText15SemiboldLh18: { size: 15, line: 18, weight: 600 },
    /** free gift "Free" ribbon Label-3 Bold 13/16 */
    pdpNpbText13BoldLh16: { size: 13, line: 16, weight: 700 },
    /** "[before 12pm]" Noontree Light 13 */
    pdpNpbText13LightLh16: { size: 13, line: 16, weight: 300 },
  },
};
