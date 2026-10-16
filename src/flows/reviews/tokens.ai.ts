import type { TokenOverrides } from '../../foundations/tokens';

/**
 * R&R 2.0 "Write with AI" palette — the purple / pink / orange family the repo uses for the AI toggle track,
 * the "Crafting your draft" shimmer and the AI loader bloom. None of these exist in the kit palette (closest:
 * `purpleGradient #6E51FF`, `gradientPurpleStart/End #9047E9 / #E33FB9`, which are different hues), so they are
 * flow tokens. Sources: repo src/assets/icons.ts (toggleGradient), src/screens/NewReviewScreen.tsx
 * (SparkleIcon, CraftingLines, DraftCard), src/screens/AILoaderScreen.tsx (GradientField, CheckBadge).
 */
export const reviewsAiFlowTokens: TokenOverrides = {
  colors: {
    // AI toggle track (icons.ts toggleGradient stops 0 / .5 / 1)
    reviewsAiOrange: '#FF9A3D',
    reviewsAiPink: '#E34BA9',
    reviewsAiViolet: '#7B5CFF',
    reviewsAiTrack: 'linear-gradient(90deg, var(--nk-color-reviews-ai-orange) 0%, var(--nk-color-reviews-ai-pink) 50%, var(--nk-color-reviews-ai-violet) 100%)',
    // sparkle + "Crafting your draft" label gradient (NewReviewScreen SparkleIcon / DraftCard)
    reviewsAiPurple: '#8B3FF0',
    reviewsAiLabel: 'linear-gradient(90deg, var(--nk-color-reviews-ai-purple), var(--nk-color-reviews-ai-pink))',
    // crafting shimmer lines (CraftingLines): base gradient + white sweep (whiteAlpha80 exists in the palette)
    reviewsCraftFrom: '#F7D6EC',
    reviewsCraftTo: '#E7D6FB',
    reviewsCraftLine: 'linear-gradient(90deg, var(--nk-color-reviews-craft-from), var(--nk-color-reviews-craft-to))',
    reviewsCraftSweep: 'linear-gradient(90deg, transparent, var(--nk-palette-white-alpha80), transparent)',
    // AI loader (AILoaderScreen): label + check badge #7c3aed, bloom stops
    reviewsAiInk: '#7C3AED',
    reviewsBloom1: '#9A5CEE',
    reviewsBloom2: '#B483F2',
    reviewsBloom3: 'rgba(180, 131, 242, 0.46)',
    reviewsBloom4: 'rgba(180, 131, 242, 0.14)',
    reviewsBloom:
      'radial-gradient(82% 54% at 50% 50%, var(--nk-color-reviews-ai-purple) 0%, var(--nk-color-reviews-bloom1) 20%, var(--nk-color-reviews-bloom2) 40%, var(--nk-color-reviews-bloom3) 58%, var(--nk-color-reviews-bloom4) 75%, transparent 88%)',
  },
};

/** Plain numbers for the AI moments (TS only; `TokenOverrides` would turn them into px). */
export const reviewsAi = {
  /** AILoaderScreen GradientField: layer 170% tall, blur 34px, pool rises from y 0% → −52% */
  bloomHeight: '170%',
  bloomInset: '-20%',
  bloomBlur: 34,
  bloomRise: '-52%',
  /** CraftingLines: line widths that make the shimmer card as tall as the generated card */
  craftWidths: ['100%', '52%', '85%', '41%', '100%', '68%', '90%', '55%', '76%', '38%', '62%'],
} as const;
