import type { TokenOverrides } from '../../foundations/tokens';

/**
 * New PDP (Figma Af34gfmhQ1D0wstXUEHSIF · 64:5571), section group E: the product rails "More from Apple" /
 * "Customer also viewed" (89:62853 / 89:62854, full-bleed white band) and "Products related to this" (89:62855, card).
 * Keys `pdpNpe…` (CSS `--nk-*-pdp-npe-*`). Only values with no central token live here. Merged in tokens.ts.
 */
export const pdpNpEFlowTokens: TokenOverrides = {
  colors: {
    pdpNpeNudgeUrgent: '#D62925', // token-lint-ignore — "Selling out fast" solid/bolt fill (Nudges - HP)
  },
};
