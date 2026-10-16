import { useEffect } from 'react';
import { createStore } from '../../kit/createStore';
import type { NavApi } from '../../kit/Navigator';
import {
  attributesFor,
  editVariantFor,
  newReviewProducts,
  PAST_ORDER_PRODUCTS,
  rateProducts,
  reviewEntryFor,
  type EditVariant,
  type ReviewProduct,
  type ReviewProductKey,
  type ReviewVariant,
} from './data';

/**
 * R&R session state — what repo App.tsx keeps in `useState` and passes between screens:
 * `rating`, `hideName`, `variant` ('A' | 'B'), `reviewProduct` ('bike' | 'iphone' | 'iphone16' | 'past'),
 * plus the picks, note, draft text and photos so pushed screens (rate → loader → draft → submitted) share them.
 * Per-screen UI state (phase, editing, keyboard, sheet open) stays in the screen.
 */
export interface ReviewPicks {
  positives: string[];
  improvements: string[];
}

export interface ReviewsState {
  /** star rating 1–5 (0 = not rated). App.tsx default 4 */
  rating: number;
  /** attribution anonymised ("Customer since 5 months"). App.tsx default true; `start()` resets it to false like the draft screens */
  hideName: boolean;
  /** rate screen layout + its draft: 'A' bike → reviews/draft, 'B' iPhone → reviews/draftB */
  variant: ReviewVariant;
  /** which entry started the review — NewReview content + where Submitted advances */
  product: ReviewProductKey;
  /** "Write with AI" on (picks → AI loader) or off (write your own) */
  aiEnabled: boolean;
  picks: ReviewPicks;
  /** optional note ("Add anything we missed" / "Anything else you would like to add") */
  note: string;
  /** manual-mode review text (Write with AI off) */
  manualText: string;
  /** the review text shown on the draft / submitted cards ('' = use the product's canned draft) */
  draft: string;
  /** attached photo URLs (max 5) */
  photos: string[];
}

const initial: ReviewsState = {
  rating: 4,
  hideName: false, // the repo shows the name by default (start() sets the same)
  variant: 'A',
  product: 'bike',
  aiEnabled: true,
  picks: { positives: [], improvements: [] },
  note: '',
  manualText: '',
  draft: '',
  photos: [],
};

export const reviewsStore = createStore<ReviewsState>(initial);

/** Subscribe to the session: `useReviews()` (whole state) or `useReviews((s) => s.rating)`. Selectors must return a stable slice. */
export const useReviews = reviewsStore.useStore;

const toggleIn = (list: string[], item: string) => (list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);

export const reviewsActions = {
  /** Start a fresh review (clears picks / note / draft / photos, hideName false, AI on). */
  start(opts: { rating?: number; variant?: ReviewVariant; product?: ReviewProductKey } = {}) {
    reviewsStore.set({
      ...initial,
      hideName: false,
      rating: opts.rating ?? reviewsStore.get().rating,
      variant: opts.variant ?? 'A',
      product: opts.product ?? 'bike',
    });
  },
  setRating: (rating: number) => reviewsStore.patch({ rating }),
  /**
   * Rating change that re-derives the pools. `mode: 'clear'` drops every pick (ManualReview handleRate);
   * `mode: 'prune'` keeps picks still in the new pools (NewReview applyRating).
   */
  rate(rating: number, product: ReviewProduct, mode: 'clear' | 'prune' = 'prune') {
    if (mode === 'clear') return reviewsStore.patch({ rating, picks: { positives: [], improvements: [] } });
    const next = attributesFor(product, rating);
    reviewsStore.patch((s) => ({
      rating,
      picks: { positives: s.picks.positives.filter((x) => next.positives.includes(x)), improvements: s.picks.improvements.filter((x) => next.improvements.includes(x)) },
    }));
  },
  togglePick: (kind: keyof ReviewPicks, item: string) => reviewsStore.patch((s) => ({ picks: { ...s.picks, [kind]: toggleIn(s.picks[kind], item) } })),
  setPicks: (picks: ReviewPicks) => reviewsStore.patch({ picks }),
  clearPicks: () => reviewsStore.patch({ picks: { positives: [], improvements: [] } }),
  setNote: (note: string) => reviewsStore.patch({ note }),
  setManualText: (manualText: string) => reviewsStore.patch({ manualText }),
  setDraft: (draft: string) => reviewsStore.patch({ draft }),
  setHideName: (hideName: boolean) => reviewsStore.patch({ hideName }),
  toggleHideName: () => reviewsStore.patch((s) => ({ hideName: !s.hideName })),
  setAiEnabled: (aiEnabled: boolean) => reviewsStore.patch({ aiEnabled }),
  setVariant: (variant: ReviewVariant) => reviewsStore.patch({ variant }),
  setProduct: (product: ReviewProductKey) => reviewsStore.patch({ product }),
  /** Append photos, capped at `max` (5). */
  addPhotos: (urls: readonly string[], max = 5) => reviewsStore.patch((s) => ({ photos: [...s.photos, ...urls].slice(0, max) })),
  removePhoto: (index: number) => reviewsStore.patch((s) => ({ photos: s.photos.filter((_, i) => i !== index) })),
  reset: () => reviewsStore.set(initial),
};

// ───────────────────────────────────────── derived ─────────────────────────────────────────

/** Total picks — "Craft my review" enables at ≥ 1 pick or a non-empty note (ManualReview / NewReview). */
export const pickCount = (s: Pick<ReviewsState, 'picks'>) => s.picks.positives.length + s.picks.improvements.length;

/** The product the rate screen shows (variant A bike / B iPhone). */
export const rateProductFor = (variant: ReviewVariant) => rateProducts[variant];

/** The product NewReview shows for the entry key ('past' falls back to the bike). */
export const newProductFor = (key: ReviewProductKey): ReviewProduct => (key === 'past' ? newReviewProducts.bike : newReviewProducts[key]);

/** NewReview's edit pattern for the entry key. */
export const editVariantOf = (key: ReviewProductKey): EditVariant => (key === 'past' ? 'pinned' : editVariantFor[key]);

/** Strip products of the "Rate your past orders" screen. */
export const pastOrderProducts = PAST_ORDER_PRODUCTS;

// ───────────────────────────────────────── params → store ─────────────────────────────────────────

/** Screen params a review screen accepts (URL query params arrive as strings). */
export interface ReviewParams {
  rating?: number | string;
  variant?: ReviewVariant | string;
  product?: ReviewProductKey | string;
}

const asRating = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 && n <= 5 ? Math.round(n) : undefined;
};
const asVariant = (v: unknown): ReviewVariant | undefined => (v === 'A' || v === 'B' ? v : undefined);
const asProduct = (v: unknown): ReviewProductKey | undefined => (v === 'bike' || v === 'iphone' || v === 'iphone16' || v === 'past' ? v : undefined);

/**
 * Call once at the top of each review screen: `useReviewParams(params)`. When the screen was opened with
 * params (sidebar defaultParams, `/reviews/rate?rating=2&variant=B`, or a nav helper below) they are written
 * into the store, so the store is always the source of truth and direct URLs work.
 */
export function useReviewParams(params: ReviewParams | undefined) {
  const rating = asRating(params?.rating);
  const variant = asVariant(params?.variant);
  const product = asProduct(params?.product);
  useEffect(() => {
    const patch: Partial<ReviewsState> = {};
    const s = reviewsStore.get();
    if (rating !== undefined && rating !== s.rating) patch.rating = rating;
    if (variant && variant !== s.variant) patch.variant = variant;
    if (product && product !== s.product) patch.product = product;
    if (Object.keys(patch).length) reviewsStore.patch(patch);
    // run on mount only: later rating changes on the screen go through the actions
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

// ───────────────────────────────────────── navigation (App.tsx graph) ─────────────────────────────────────────

/**
 * The repo flow graph (App.tsx), as helpers so screens never hand-code routes:
 *
 *   orders/list ──★──► reviews/rate (A|B) ──craft(ai)──► reviews/aiLoader ──done──► reviews/draft | draftB
 *        │                    └──craft(manual)──────────────────────────────────► reviews/draft | draftB
 *        └──★──► reviews/new (bike | iphone | iphone16)
 *   draft / draftB / new ──submit──► reviews/submitted ──auto──► bike → reviews/deck (rate B → reviews/slider)
 *                                                              iphone → reviews/pastOrders · iphone16 | past → orders/list
 *   reviews/pastOrders ──submit──► reviews/submitted (product 'past') ──auto──► orders/list
 *   reviews/deck · reviews/slider ──X / done──► orders/list
 */
export const reviewsNav = {
  /** Same as the top-level `openReview`. */
  open: (nav: NavApi, opts: OpenReviewOptions) => openReview(nav, opts),
  /** → reviews/rate (ManualReview). App.tsx: setRating, setVariant, go('ManualReview'). */
  openRate(nav: NavApi, { rating, variant = 'A' }: { rating: number; variant?: ReviewVariant }) {
    reviewsActions.start({ rating, variant, product: 'bike' }); // App.tsx leaves reviewProduct at 'bike' here
    nav.push('reviews/rate', { rating, variant });
  },
  /** → reviews/new (single-scroll chips flow). App.tsx: setRating, setReviewProduct, go('NewReview'). */
  openNew(nav: NavApi, { rating, product = 'bike' }: { rating: number; product?: Exclude<ReviewProductKey, 'past'> }) {
    reviewsActions.start({ rating, product });
    nav.push('reviews/new', { rating, product });
  },
  /** rate → "Craft my review" (AI on → loader) / "Next" (AI off → straight to the draft). */
  craft(nav: NavApi, aiEnabled = reviewsStore.get().aiEnabled) {
    reviewsActions.setAiEnabled(aiEnabled);
    if (aiEnabled) nav.push('reviews/aiLoader');
    else nav.push(draftRoute());
  },
  /** AI loader finished → its draft, replacing the loader (Back from the draft returns to rate, like the repo). */
  finishGenerating(nav: NavApi) {
    nav.replace(draftRoute(), {}, { transition: 'fade' });
  },
  /** AI loader "Stop processing" / back → rate. */
  stopGenerating(nav: NavApi) {
    nav.back();
  },
  /** draft / draftB / new / pastOrders → Submitted. The review is done: the stack resets to Submitted (no back). */
  submit(nav: NavApi, opts: { hideName?: boolean; product?: ReviewProductKey } = {}) {
    reviewsStore.patch({ ...(opts.hideName !== undefined ? { hideName: opts.hideName } : {}), ...(opts.product ? { product: opts.product } : {}) });
    nav.reset('reviews/submitted');
  },
  /** "Rate your past orders" submit: marks the loop as finished so Submitted goes back to the orders list. */
  submitPastOrders(nav: NavApi, hideName?: boolean) {
    reviewsNav.submit(nav, { hideName, product: 'past' });
  },
  /**
   * Submitted auto-advance (App.tsx onAdvance): bike → reviews/deck · iphone → reviews/pastOrders ·
   * iphone16 | past → orders/list. Addition: a variant-B rate review (bike key) lands on reviews/slider —
   * App.tsx never navigates to PastOrderRatingScreenB, this makes both carousels reachable.
   */
  afterSubmit(nav: NavApi) {
    const { product: p, variant } = reviewsStore.get();
    if (p === 'past' || p === 'iphone16') return nav.reset('orders/list');
    const next = p === 'iphone' ? 'reviews/pastOrders' : variant === 'B' ? 'reviews/slider' : 'reviews/deck';
    nav.replace(next, {}, { transition: 'fade' });
  },
  /** X on new / pastOrders / deck / slider, and deck "Continue shopping" → orders list. */
  close(nav: NavApi) {
    nav.reset('orders/list');
  },
  /** Past-order card "Tell us more" → the rate screen for that order (repo: onTellMore deep-link, not wired there). */
  tellUsMore(nav: NavApi, rating: number) {
    reviewsNav.openRate(nav, { rating: rating || 4, variant: 'A' });
  },
};

export interface OpenReviewOptions {
  /** our orders id (o3 / o4 / o9 …) — used when neither `product` nor `variant` is given */
  orderId?: string;
  /** the star the user tapped, 1–5 */
  rating: number;
  /** 'bike' | 'iphone' | 'iphone16' → reviews/new; 'past' → reviews/pastOrders */
  product?: ReviewProductKey;
  /** 'A' | 'B' → reviews/rate (ManualReview) */
  variant?: ReviewVariant;
}

/**
 * The single entry from the orders list (repo OrderListScreen → ManualReview / NewReview, App.tsx onNavigate):
 *   openReview(nav, { orderId: order.id, rating })            // mapped by order (data.ts orderReviewEntries)
 *   openReview(nav, { rating, product: 'iphone' })            // explicit NewReview product
 *   openReview(nav, { rating, variant: 'B' })                 // explicit ManualReview variant
 * `product` wins over `variant`, which wins over `orderId`. Resets the session (picks, note, draft, photos).
 */
export function openReview(nav: NavApi, { orderId, rating, product, variant }: OpenReviewOptions) {
  if (product === 'past') {
    reviewsActions.start({ rating, product: 'past' });
    return nav.push('reviews/pastOrders');
  }
  if (product) return reviewsNav.openNew(nav, { rating, product });
  if (variant) return reviewsNav.openRate(nav, { rating, variant });
  const entry = reviewEntryFor(orderId);
  if (entry.route === 'reviews/new') return reviewsNav.openNew(nav, { rating, product: entry.product });
  if (entry.route === 'reviews/pastOrders') return openReview(nav, { rating, product: 'past' });
  return reviewsNav.openRate(nav, { rating, variant: entry.variant });
}

/** Draft route for the current variant. */
export const draftRoute = (variant: ReviewVariant = reviewsStore.get().variant) => (variant === 'B' ? 'reviews/draftB' : 'reviews/draft');
