import type { TokenOverrides } from '../../foundations/tokens';

/**
 * Eid home banners (Figma Af34gfmhQ1D0wstXUEHSIF "All flows" · 89:34398): the hero / brand banner carousel
 * ("Hero Section Widgets", 89:34722) and the full-width ad (89:34782). Merged into homeFlowTokens; keys are prefixed
 * `homeEid`. Literals live here by design — Figma fills with no central token in tolerance. The frame's festive
 * teal + lantern header is not used (by request): the header keeps the Homepage Revamp 2025 gradient.
 */
export const homeEidFlowTokens: TokenOverrides = {
  colors: {
    // I89:34742;2600:18867 — Areej brand module card
    homeEidBrandBg: '#3B3207', // token-lint-ignore — Figma fill
    // I89:34732;2600:18936 — "Video actions" pill: base/colour/alpha-dark/64 (bappzaar NoonDynamicCarouselMedia: 0.6)
    homeEidVideoActionBg: 'rgba(0, 0, 0, 0.64)', // token-lint-ignore — Figma variable alpha-dark/64 (blackAlpha64 missing centrally)
  },
  type: {
    homeText11BoldLh14: { size: 11, line: 14, weight: 700 }, // B11/Bold — brand tile price
  },
};

/**
 * Hero Section Widgets (89:34722) at the live home CMS layout (homepage-hero-slider-banner-vertical: numPerView 1.4,
 * gap 15, ratio 150): bappzaar useNoonDynamicCarouselLayout cardWidth = round3x(W / numPerView − gap) = 263.667,
 * cardHeight = round3x(cardWidth · ratio / 100) = 395.667 at W 390; gap = side padding = 15; auto-advance every 3s
 * (useNoonDynamicCarouselAutoScroll interval 3000). The Figma frame's 220×330 / 12 was the hook's default (1.7, 12).
 */
export const homeEidCarousel = {
  cardWidth: 263.667,
  cardHeight: 395.667,
  gap: 15,
  gutter: 15,
  interval: 3000,
} as const;
