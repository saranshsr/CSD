import type { TokenOverrides } from '../../foundations/tokens';

/**
 * Storefront PDP (Figma 2ldJbjmQq4RkhnrNFCfXQB · 3499:75115) tokens for the trust tiles (3499:75389), Payment offers
 * (3499:75412), Product Details (3499:75478), Extended warranty (3499:75479), Additional Information (3499:75536) and the
 * Bestseller row (3499:75632). Merged into pdpFlowTokens by the lead; keys are prefixed `pdpSfc`
 * → var(--nk-color-pdp-sfc-*) / var(--nk-type-pdp-sfc-*) / var(--nk-layout-pdp-sfc-*).
 * Only values with no central token within tolerance live here.
 */
export const pdpSfCFlowTokens: TokenOverrides = {
  colors: {
    /** trust-marker icon blue #2567E7 (tiles + Additional Information rows; no palette entry) */
    pdpSfcTrustIcon: '#2567E7', // token-lint-ignore — flow token definition (Figma fill)
    /** "Select" button glow 0 0 4 rgba(0,118,255,.1) (newAccentColor at 10%) */
    pdpSfcSelectGlow: 'rgba(0, 118, 255, 0.1)', // token-lint-ignore — flow token definition (Figma effect)
    /** Bestseller row fill: 119.33deg white 14.8% → emerald/50 #E8FCFA 141.3% */
    pdpSfcBestsellerBg: 'linear-gradient(119.33deg, #FFFFFF 14.816%, #E8FCFA 141.32%)', // token-lint-ignore — flow token definition (Figma fill)
  },
  type: {
    /** section titles Noontree Bold 15 / 17 */
    pdpSfcSectionTitle: { size: 15, line: 17, weight: 700 },
    /** warranty validity "1 YEAR" Noontree Bold 12 / 16.8 */
    pdpSfcText12BoldLh17: { size: 12, line: 17, weight: 700 },
    /** Bestseller "in" Figtree Italic 14 / 16 (kit font, italic in CSS) */
    pdpSfcText14Lh16: { size: 14, line: 16, weight: 400 },
    /** warranty USP ticker Figtree 13.12 / 15.3 (kit font) */
    pdpSfcText13Lh15: { size: 13, line: 15, weight: 400 },
  },
  layout: {
    /** trust tile 94 × 80 when it scrolls (≥ 4 tiles); ≤ 3 tiles share the row */
    pdpSfcTrustTileW: 94,
    pdpSfcTrustTileH: 80,
    /** payment offer card 253 × 64, logo box 60 × 40 */
    pdpSfcOfferW: 253,
    pdpSfcOfferH: 64,
    pdpSfcOfferLogoW: 60,
    pdpSfcOfferLogoH: 40,
    /** accordion header / Additional Information row height */
    pdpSfcRowH: 44,
    /** extended-warranty plan card width + creative size */
    pdpSfcWarrantyW: 270,
    pdpSfcWarrantyCreative: 40,
    /** USP ticker 23 high, partner logo 84 × 15 */
    pdpSfcTickerH: 23,
    pdpSfcPartnerLogoW: 84,
    pdpSfcPartnerLogoH: 15,
    /** warranty USP row height */
    pdpSfcUspH: 20,
    /** bestseller medal */
    pdpSfcBestsellerIcon: 40,
  },
};

/** JS-only values (not CSS variables). */
export const pdpSfcTokens = {
  /** USP ticker interval (ms) */
  tickerMs: 2500,
  /** extended-warranty plan prices as a share of the product price, and their floor */
  warrantyShare: [0.05, 0.08] as const,
  warrantyMin: 49,
  /** design fallback price (dhm 449) when no product price is passed */
  warrantyFallback: 449,
};
