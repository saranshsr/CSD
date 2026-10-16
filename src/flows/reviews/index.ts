import { defineFlow } from '../../kit/registry';
import { reviewsFlowTokens } from './tokens';
import { lazyScreen } from '../../kit/lazyScreen';

const AiLoaderScreen = lazyScreen(() => import('./AiLoaderScreen'), 'AiLoaderScreen');
const DeckScreen = lazyScreen(() => import('./DeckScreen'), 'DeckScreen');
const DraftBScreen = lazyScreen(() => import('./DraftBScreen'), 'DraftBScreen');
const DraftScreen = lazyScreen(() => import('./DraftScreen'), 'DraftScreen');
const NewReviewScreen = lazyScreen(() => import('./NewReviewScreen'), 'NewReviewScreen');
const PastOrdersScreen = lazyScreen(() => import('./PastOrdersScreen'), 'PastOrdersScreen');
const RateScreen = lazyScreen(() => import('./RateScreen'), 'RateScreen');
const SliderScreen = lazyScreen(() => import('./SliderScreen'), 'SliderScreen');
const SubmittedScreen = lazyScreen(() => import('./SubmittedScreen'), 'SubmittedScreen');

const FIGMA = 'Figma KzR8dy12uT8CtgBRHHY6Qx';
const REPO = 'repo vbirla789/R-R-2.0-with-checkbox src/screens';
const src = (node: string, file: string) => `${FIGMA} · ${node}; ${REPO}/${file}`;

/**
 * Ratings & reviews — R&R 2.0 (Figma KzR8dy12uT8CtgBRHHY6Qx "R&R 2.0", prototype repo vbirla789/R-R-2.0-with-checkbox).
 * Entered from a star tap on a delivered order in orders/list (`openReview(nav, { orderId, rating })` from ./store — wired by the orders agent). Flow graph, shared
 * components and phase-2 rules: README.md. Token / motion mapping: MAPPING.md.
 */
export const reviewsFlow = defineFlow({
  id: 'reviews',
  title: 'Ratings & reviews',
  group: 'Post-order',
  description: 'R&R 2.0: rate a delivered order with chips or Write with AI, AI draft, photos, thanks screen and one-tap past-order rating.',
  initial: 'rate',
  parent: 'orders/list', // Back target when a review screen is opened directly
  tokens: reviewsFlowTokens,
  screens: [
    {
      id: 'rate',
      title: 'Rate & pick',
      component: RateScreen,
      path: 'rate-review',
      defaultParams: { rating: 4, variant: 'A' },
      notes: 'Tap a star: the checkbox lists re-derive ((rating − 1) × 2 positives, the rest improvements) behind a short skeleton. Pick anything → Craft my review (AI on → loader) or toggle Write with AI off → write your own → Next. Try variant B (iPhone) and rating 1 or 5.',
      source: src('6042:140824', 'ManualReviewScreen.tsx'),
    },
    {
      id: 'aiLoader',
      title: 'AI writing',
      component: AiLoaderScreen,
      path: 'review-ai-loader',
      notes: 'The purple bloom pooled at the bottom sweeps to the top (1.1s) as "Finangling through your choices" becomes "Review draft generated", then fades into the draft. Stop processing goes back.',
      source: src('6305:167731', 'AILoaderScreen.tsx'),
    },
    {
      id: 'draft',
      title: 'Review draft',
      component: DraftScreen,
      path: 'review-draft',
      defaultParams: { rating: 4, variant: 'A' },
      notes: 'Long draft collapses with show more / show less. Hide Name anonymises to "Customer since 5 months". Edit review opens the floating edit sheet with the keyboard; the keys type. Submit review → thanks.',
      source: src('7116:43925', 'ReviewDraftScreen.tsx'),
    },
    {
      id: 'draftB',
      title: 'Review draft (B)',
      component: DraftBScreen,
      path: 'review-draft-b',
      defaultParams: { rating: 4, variant: 'B' },
      notes: 'Tap the review text to edit it in place: the Save bar and keyboard slide up, no sheet. Hide name / Show name toggles the attribution.',
      source: src('7159:44106', 'ReviewDraftScreenB.tsx'),
    },
    {
      id: 'new',
      title: 'Write a review',
      component: NewReviewScreen,
      path: 'new-review',
      defaultParams: { rating: 4, product: 'bike' },
      notes: 'One scroll: scroll and the product header docks into the nav. Pick chips → Craft my review: the draft card shimmers in below, then the text lands. Change a star or chip after that → Rewrite your review? Products: bike (pinned editor), iphone (grow editor), iphone16 (top-sheet editor).',
      source: src('7629:275417', 'NewReviewScreen.tsx'),
    },
    {
      id: 'pastOrders',
      title: 'Rate your past orders',
      component: PastOrdersScreen,
      path: 'rate-past-orders',
      transition: 'fade',
      notes: 'Reached after an iPhone review. Switch products in the strip: each keeps its own stars, chips, note and draft. Needs a rating and a chip to craft. Submit → thanks → orders.',
      source: src('9129:106814', 'RatePastOrdersScreen.tsx'),
    },
    {
      id: 'submitted',
      title: 'Review submitted',
      component: SubmittedScreen,
      path: 'review-submitted',
      transition: 'fade',
      defaultParams: { rating: 4 },
      notes: 'The success Lottie plays once and holds; the review card rises in, photos pop one after another; 1.5s later it moves on (bike → deck, iPhone → past orders, else orders).',
      source: src('6042:141658', 'SubmittedScreen.tsx'),
    },
    {
      id: 'deck',
      title: 'Rate past orders (deck)',
      component: DeckScreen,
      path: 'rate-orders-deck',
      transition: 'fade',
      notes: 'Two cards peek above the front one. Tap stars to rate (Tell us more appears), swipe left for the next card, right to bring one back; Next mirrors the left swipe, the last card says Continue shopping.',
      source: src('8842:127140', 'PastOrderRatingScreen.tsx'),
    },
    {
      id: 'slider',
      title: 'Rate past orders (slider)',
      component: SliderScreen,
      path: 'rate-orders-slider',
      transition: 'fade',
      notes: 'The strip glides one card per Next; neighbours peek at the edges, tap one to slide to it. Reached after a variant-B rate review.',
      source: src('8810:123358', 'PastOrderRatingScreenB.tsx'),
    },
  ],
});
