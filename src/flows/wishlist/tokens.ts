import type { TokenOverrides } from '../../foundations/tokens';

/** Wishlist V2 values with no global token (bappzaar NoonWishlistV2* styles; see MAPPING.md). */
export const wishlistTokens = {
  /** useNoonWishlistV2HeaderAnimation TITLE_SWITCH_OFFSET: the swap runs over scrollY ∈ [bottom − 8, bottom + 8] */
  titleSwitchOffset: 8,
  /** NoonWishlistV2CollectionImageBackground size={67}: card 3:4, radius 18 % of the card width, box 1.45 × card width */
  stack: { size: 67, aspect: 3 / 4, radius: 0.18, boxWidth: 1.45 },
  /** NoonProductBoxWishlistAddToCart: LinearTransition springify mass 1 damping 16 stiffness 180; FadeIn 140 / FadeOut 90 */
  atc: { layout: { type: 'spring', mass: 1, damping: 16, stiffness: 180 } as const, fadeIn: 0.14, fadeOut: 0.09 },
  /** NoonWishlistV2FloatingCartButton: SlideInDown / SlideOutDown springify damping 16 stiffness 120 mass 0.7 */
  viewCart: { spring: { type: 'spring', damping: 16, stiffness: 120, mass: 0.7 } as const },
  /** NoonWishlistV2Empty: Lottie W × W / 0.75, text block at 55 % of its height */
  empty: { aspect: 3 / 4, textTop: 0.55 },
  /** NoonWishlistV2ScreenSkeleton: card height = image height + 146 */
  skeleton: { cardExtra: 146 },
} as const;

export const wishlistFlowTokens: TokenOverrides = {
  colors: { bgPage: '#FFFFFF' },
  // one-off type combos (token lint cleanup)
  type: {
    wishlistText15RegularLh21: { size: 15, line: 21, weight: 400 }, // empty-state subtitle (bodyMedium 400)
    wishlistText18MediumLh1: { size: 18, line: '1', weight: 500 }, // ATC stepper quantity
  },
};
