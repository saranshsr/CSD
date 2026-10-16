import type { TokenOverrides } from '../../foundations/tokens';

/**
 * New PDP (Figma Af34gfmhQ1D0wstXUEHSIF · 64:5571), section group A — gallery 64:5573, Main-Info 64:5587, bundle card
 * 84:8457, footer 104:20387. Keys are prefixed `pdpNpa` (CSS --nk-color-pdp-npa-*, --nk-type-pdp-npa-*, --nk-layout-pdp-npa-*).
 * Only values with no central / pdp token live here. Merged in tokens.ts.
 */
export const pdpNpAFlowTokens: TokenOverrides = {
  colors: {
    /** "Buy now" fill (Figma #041F62; bappzaar buyNowNavy is #162D68) */
    pdpNpaBuyNow: '#041F62', // token-lint-ignore — flow token definition (Figma fill)
    /** "Đ20 off" in the bundle title (Figma #0A49B8) */
    pdpNpaBundleHighlight: '#0A49B8', // token-lint-ignore — flow token definition (Figma text)
    /** bundle card: white → brand-blue/100 #EBF4FF at 99.7° */
    pdpNpaBundleFill: 'linear-gradient(99.71deg, #FFFFFF 0%, #EBF4FF 100%)', // token-lint-ignore — flow token definition (Figma fill)
    /** "Saving Đ45 with Combo" banner: lightSkyBlue #EAF4FE → white at 51% */
    pdpNpaComboFill: 'linear-gradient(90deg, #EAF4FE 0%, #FFFFFF 51.07%)', // token-lint-ignore — flow token definition (Figma fill)
    /** "noon's Pick" text: #FEF6D6 → #FDCA2B (70%) → #FEF6D6 (108%) */
    pdpNpaPickText: 'linear-gradient(90deg, #FEF6D6 0%, #FDCA2B 70.42%, #FEF6D6 108.26%)', // token-lint-ignore — flow token definition (Figma text fill)
  },
  type: {
    /** "noon's Pick" 14 Medium, normal line height */
    pdpNpaText14MediumLh17: { size: 14, line: 17, weight: 500 },
    /** "Saving Đ45 with Combo" 14 Medium, normal line height */
    pdpNpaText14MediumLh18: { size: 14, line: 18, weight: 500 },
    /** key highlights chip "500ml | Đ2.35/ml" 14/14 regular */
    pdpNpaText14Lh14: { size: 14, line: 14, weight: 400 },
    /** bestseller badge rank digit 10/12 bold */
    pdpNpaText10BoldLh12: { size: 10, line: 12, weight: 700 },
  },
  layout: {
    /** "Saving with Combo" banner 32h; its icon box 20 (gif 18) */
    pdpNpaComboHeight: 32,
    pdpNpaComboIcon: 18,
    /** "noon's Pick" tag 87 × 24 */
    pdpNpaPickWidth: 87,
    /** bundle card icon box 40 (gif 30) */
    pdpNpaBundleIconBox: 40,
    pdpNpaBundleIcon: 30,
    /** footer ATC: Buy now is 47 tall in a 48 row */
    pdpNpaBuyNowHeight: 47,
  },
};
