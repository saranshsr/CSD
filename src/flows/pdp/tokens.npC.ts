import type { TokenOverrides } from '../../foundations/tokens';

/**
 * New PDP (Figma Af34gfmhQ1D0wstXUEHSIF · 64:5571), section group C: Payment offers (64:5693), trust markers (64:5694),
 * Product Overview (84:8031), Additional Information (64:5696), Bestseller row (64:5727) and the seller widget (64:5728).
 * Keys are prefixed `pdpNpc` → var(--nk-color-pdp-npc-*) / var(--nk-shadow-pdp-npc-*) / var(--nk-layout-pdp-npc-*).
 * Merged in tokens.ts. Only values with no central token within tolerance live here.
 */
export const pdpNpCFlowTokens: TokenOverrides = {
  colors: {
    /** "Summarised by AI" block: 117.94deg persian-blue/500 5% → purple/700 5% over white (NoonAiOverviewSummary) */
    pdpNpcAiBg: 'linear-gradient(117.94deg, rgba(65, 70, 206, 0.05) 1.84%, rgba(191, 61, 235, 0.05) 98.68%), #FFFFFF', // token-lint-ignore — flow token definition (Figma fill)
    /** "Summarised by AI" title text: 90deg persian-blue/500 #4146CE → purple/700 #BF3DEB at 54.5% (NoonAiOverviewTitle) */
    pdpNpcAiTitle: 'linear-gradient(90deg, #4146CE 0%, #BF3DEB 54.541%)', // token-lint-ignore — flow token definition (Figma fill)
    /** title shimmer: transparent → white 70% → transparent at 115deg (NoonAiOverviewTitle shimmerGradient) */
    pdpNpcAiShimmer: 'linear-gradient(115deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.7) 50%, rgba(255, 255, 255, 0) 100%)', // token-lint-ignore — flow token definition
  },
  type: {
    /** bestseller rank in the badge: Figtree Bold 16 / 18.29 (kit font) */
    pdpNpcText16BoldLh18: { size: 16, line: 18, weight: 700 },
  },
  shadow: {
    /** seller widget shadow/sm: 0 1 3 Alpha/GrayA/300 rgba(14,14,14,.07) */
    pdpNpcSellerCard: '0 1px 3px rgba(14, 14, 14, 0.07)', // token-lint-ignore — flow token definition (Figma effect)
  },
  layout: {
    /** bestseller medal frame 52 × 50 with the 32px star badge at 10 / 9 */
    pdpNpcMedalW: 52,
    pdpNpcMedalH: 50,
    pdpNpcMedalBadge: 32,
    /** ENBD card image 63 × 42 inside the 60 × 40 r6 logo box (cover, 1px below centre) */
    pdpNpcEnbdW: 63,
    pdpNpcEnbdH: 42,
  },
};
