<!-- planned: ../noon-ui/references/motion-matrix.md -->
# Ratings & reviews — flow specification

The contract a reviews build must meet. Read from the code on 2026-10-13 (`src/flows/reviews/*`, `src/flows/orders/components/StarRating.tsx`). Design source: Figma `KzR8dy12uT8CtgBRHHY6Qx` "R&R 2.0" + prototype repo `vbirla789/R-R-2.0-with-checkbox` @ `ab185b3`; value tables in `src/flows/reviews/MAPPING.md`. No screen has a `verified` date; truth is inferred `mixed` (every `source` names a Figma node and a repo file). Measurements are Figma points on a 375pt frame: cards 351 wide, 12 gutter (`reviewsTokens.gutter`), 16 between cards (`reviewsTokens.cardGap`).

## Screens

Flow `reviews` · group Post-order · initial `rate` · `parent: 'orders/list'` (Back when opened directly) · flow tokens `reviewsFlowTokens` · alias `/reviews` → `reviews/rate` (`src/kit/routes.ts`). No tab bar. Every screen is `presentation: 'screen'`; none is a `nav.sheet` route.

| Route | Path | Transition | defaultParams | Figma node · repo screen | Status |
|---|---|---|---|---|---|
| `reviews/rate` | `/rate-review` (`/reviews`) | `push` | `{ rating: 4, variant: 'A' }` | `6042:140824` · ManualReviewScreen | exists |
| `reviews/aiLoader` | `/review-ai-loader` | `push` | — | `6305:167731` · AILoaderScreen | exists |
| `reviews/draft` | `/review-draft` | `push` (from the loader: `replace` + `fade`) | `{ rating: 4, variant: 'A' }` | `7116:43925`, edit sheet `7125:36853` · ReviewDraftScreen | exists |
| `reviews/draftB` | `/review-draft-b` | `push` (from the loader: `replace` + `fade`) | `{ rating: 4, variant: 'B' }` | `7159:44106`, in-place edit `7159:44296` · ReviewDraftScreenB | exists |
| `reviews/new` | `/new-review` | `push` | `{ rating: 4, product: 'bike' }` | `7629:275417` (+ `8194-101662` header, `10562-228822` note, `9782-204273` / `9782-207423` / `9802-54954` editors) · NewReviewScreen | exists |
| `reviews/pastOrders` | `/rate-past-orders` | `fade` | — | `9129:106814` · RatePastOrdersScreen | exists |
| `reviews/submitted` | `/review-submitted` | `fade` (reached by `nav.reset`) | `{ rating: 4 }` | `6042:141658` · SubmittedScreen | exists |
| `reviews/deck` | `/rate-orders-deck` | `fade` | — | `8842:127140` · PastOrderRatingScreen | exists |
| `reviews/slider` | `/rate-orders-slider` | `fade` | — | `8810:123358` · PastOrderRatingScreenB | exists (the repo never reaches it; the kit routes variant B there) |

Params (all optional, strings when opened by URL, validated in `useReviewParams`): `rating` 0–5, `variant` `'A' | 'B'` (A = bike phone holder `MANUAL_BIKE_PRODUCT`, B = iPhone 16 Pro `IPHONE_PRODUCT`), `product` `'bike' | 'iphone' | 'iphone16' | 'past'`.

## Screen anatomy

Every screen: `<Screen background="reviewsPage">` (gradient `--nk-palette-light-grey-color` → `--nk-palette-secondary-background-color`), header `ReviewHeader` (56h, 40px white circle with `chevron-left` or `cross`; default tap `nav.back`), footer `ReviewFooter` around one `Button variant="dark" size="lg" block` (past-order carousels: `variant="outline"`, `gutter="tight"`).

### `reviews/rate` (`RateScreen`)
1. Header (fixed): `ReviewHeader leading="back"` → `ReviewProductHeader variant="rate"` (56×64 tile, name, tappable 24px stars) → `AiToggle look="outline"` ("Write with AI" card, central `Switch` 42×24).
2. Body swaps with a blur cross-fade (`AnimatePresence mode="wait"`):
   - AI on: `RateFeedbackCard` "What went well?" ((rating − 1) × 2 rows) and "What could have been better?" (checkbox rows with central `Checkbox`, `components/RateChecklist.tsx`) → `ReviewTextField size="optional"` note. A rating change clears the picks (`reviewsActions.rate(n, product, 'clear')`) and shows `RateQuestionsSkeleton` for `timing.recomputeMs` (600ms).
   - AI off: one `ReviewTextField size="large"` focused, mock keyboard up.
3. Footer: `ReviewFooter keyboard` + CTA "Craft my review" (AI on, enabled at ≥ 1 pick or a note) / "Next" (AI off, any text); disabled CTA scales 0.985.

### `reviews/aiLoader` (`AiLoaderScreen`)
Full-bleed blurred purple bloom (`reviewsAi.bloom*`) pooled at the bottom; `ReviewHeader` back = stop; centred label: sparkle `Lottie` (`reviewsLotties.starsLoading`) + "Finangling through your choices" for `loaderHoldMs` (2400) → bloom sweeps up (`bloomSweep` 1.1s, `ease.inOut`), label blur-swaps to "Review draft generated" with `check-circle-filled` in `--nk-color-reviews-ai-ink` (`haptic('pop')`), "Stop processing" `Pressable` fades → after `loaderDoneMs` (1300) the draft replaces the loader. No footer.

### `reviews/draft` (`DraftScreen`, variant A)
`ReviewHeader title="Your review"` → `DraftCard look="review"` with `DraftProductTop` (grey top, tilted polaroid, `reviewsDraft` in `tokens.draft.ts`), text collapsing with show more / show less (`makeCollapsed`, 240 → 229), Hide Name ⇄ Show name (anonymised to "Customer since 5 months"), Edit review → `AddPhotos` (camera / gallery add canned `reviewPhotos`, max 5). Overlay `EditReviewSheet look="floating"` over a scrim with the mock keyboard: Save keeps the edit (`setDraft`), scrim tap discards. Footer "Submit review".

### `reviews/draftB` (`DraftBScreen`, variant B)
`ReviewHeader title` → `DraftCard look="field"`: `ReviewProductHeader variant="compact"` (48×64, stars pop in), the review as an in-place `ReviewTextField surface="subtle"` (`inputMode="none"`, max `editMax` 1000), "Written by" + Hide / Show name pill → `AddPhotos`. Focusing the field slides a Save bar + `MockKeyboard` up together (`spring.sheet`, no scrim) as the `<Screen overlay>`. Footer "Submit review".

### `reviews/new` (`NewReviewScreen`)
One scroll, nothing pushed: `NewReviewMorphHeader` (product image · name · stars; docks into the 56 nav as the page scrolls, close → `reviewsNav.close`) → `AiToggle look="raised"` → `NewReviewPicks` (AI on: `AttributeChips` + note) or `NewReviewManual` (AI off) → `DraftCard` (appears on Craft: `CraftingShimmer` for `generateMs` 2200 → generated text) → `AddPhotos` (with the draft; always in manual mode). Editors by product (`editVariantOf`): bike `PinnedEditor`, iphone `GrowEditor` (fold spring), iphone16 `SheetEditor` (top sheet). A star or chip change after a draft exists opens `RewriteSheet` (Keep review / Edit picks). Footer label cycles: Craft my review → Submit review (disabled while generating) · manual: Continue → Submit review · editing: Save.

### `reviews/pastOrders` (`PastOrdersScreen`)
`ReviewHeader leading="close"` with "Rate your past orders" cross-fading into a docked product (28×32 + 24px stars) past scroll 60–170 → product strip (88-wide tiles, `PAST_ORDER_PRODUCTS`, selected = dark border) → panel: 33px `StarRatingInput` · `Divider` · two `AttributeChips size="sm"` groups (an unrated product shows the 4★ arrangement) · `ReviewTextField` note → `DraftCard` + `AddPhotos` below on craft. Overlays `EditReviewSheet look="docked"`, `RewriteSheet`. Each product keeps its own rating, picks, note, draft and photos (screen state). Footer: Craft my review (needs a star and a chip) → Submit review.

### `reviews/submitted` (`SubmittedScreen`)
No header (spacer; dead end, no back). Full-page `Lottie` `reviewsLotties.reviewSuccess` plays once and holds; on `complete` (backstop `submittedBackstopMs` 2600) the glass review card rises 28px on `spring.gentle`: 20px stars, `SUBMITTED_REVIEW_TEXT` clamped to 3 lines with show more / less, `PhotoThumbs appear` popping in, "Written by:" + name or anonymised name; `haptic('success')`; after `submittedAdvanceMs` (1500) → `reviewsNav.afterSubmit`. The hero ("Thanks, you star!") only shows under reduced motion.

### `reviews/deck` (`DeckScreen`) and `reviews/slider` (`SliderScreen`)
`ReviewHeader leading="close"` → `PastOrdersTitle` ("Thanks for sharing" / "Rate your other orders on a single tap") → cards (`PastOrderCard`, 286 wide; stars, "Tell us more" unfolds after a rating) → footer `Button variant="outline"` Next / Continue shopping on the last card.
- Deck (`DECK_CARDS`): two cards peek above the front one (`reviewsMotion.deck` y 0 / −8 / −15, scale 1 / .9 / .8); drag the front card left (> 90px or > 500px/s) = next, right = previous; history thrown to x −440, −8°.
- Slider (`SLIDER_CARDS`): one strip moving ±302 (`slider.card` 286 + `gap` 16); tap a peeking neighbour to slide to it; no undo.

## Navigation

| From | Call | Goes to |
|---|---|---|
| orders list star (`StarRating`, delivered or exchanged history cards) | after `timing.orderStarPushMs` (220): `openReview(nav, { orderId, rating, product? })` | o3 → `reviews/new` bike · o4 → `reviews/new` iphone · o8 (`reviewProduct: 'iphone16'`) → `reviews/new` iphone16 · any other id → `reviews/rate` variant A |
| `openReview` with `variant` / `product: 'past'` | `reviewsNav.openRate` / `nav.push('reviews/pastOrders')` | `reviews/rate` / `reviews/pastOrders` |
| rate CTA | `reviewsNav.craft(nav, aiEnabled)` | AI on: `nav.push('reviews/aiLoader')`; AI off: `nav.push(draftRoute())` |
| loader done | `reviewsNav.finishGenerating` | `nav.replace(draftRoute(), {}, { transition: 'fade' })` (Back returns to rate) |
| loader back / Stop processing | `reviewsNav.stopGenerating` | `nav.back()` |
| draft / draftB / new Submit | `reviewsNav.submit(nav, { hideName })` | `nav.reset('reviews/submitted')` |
| pastOrders Submit | `reviewsNav.submitPastOrders` | same, product `'past'` |
| submitted auto-advance | `reviewsNav.afterSubmit` | past / iphone16 → `nav.reset('orders/list')`; iphone → `reviews/pastOrders`; variant B → `reviews/slider`; else `reviews/deck` (all `nav.replace(…, { transition: 'fade' })`) |
| close (new, pastOrders, deck, slider), last-card Continue shopping | `reviewsNav.close` | `nav.reset('orders/list')` |
| past-order card "Tell us more" | `reviewsNav.tellUsMore(nav, rating)` | `reviews/rate` variant A |

## State

- `reviewsStore` (`src/flows/reviews/store.ts`, `createStore`), read with `useReviews(select?)`, written only through `reviewsActions`: `rating` (default 4), `hideName`, `variant`, `product`, `aiEnabled`, `picks { positives, improvements }`, `note`, `manualText`, `draft` (`''` = the product's canned text), `photos` (max 5).
- `reviewsActions.start()` (called by every entry helper) resets picks / note / draft / photos, AI on, name shown. `rate(n, product, 'clear' | 'prune')`: rate clears, new prunes picks no longer in the pools.
- `useReviewParams(params)` writes `rating` / `variant` / `product` from params once on mount, so the store stays the source of truth for direct URLs.
- Derived: `pickCount`, `rateProductFor`, `newProductFor`, `editVariantOf`, `pastOrderProducts`, `draftRoute`.
- Screen-local: loader phase; new / pastOrders `phase` (`input → generating → generated`), editing, keyboard, pending rewrite; per-product state on pastOrders; deck / slider `current` and `ratings`. Submitting doesn't persist anywhere outside the session store (no orders or PDP update).

## States

| State | Where | Status |
|---|---|---|
| Loading (AI writing) | `reviews/aiLoader`; inline `CraftingShimmer` in `DraftCard` on new / pastOrders; `RateQuestionsSkeleton` after a rating change on rate | exists |
| Success | `reviews/submitted` (Lottie + card, auto-advance) | exists |
| Disabled CTA | rate (no pick / note / text), new while generating, pastOrders until a star and a chip | exists |
| Unrated | `rating: 0` via `?rating=0`: rate shows no positives; pastOrders shows the 4★ chip arrangement | exists |
| Error (AI draft failed, submit failed, photo upload failed) | — | **does not exist**; no screen, param or copy. Add as a ScreenDef with `defaultParams` if asked (pattern: categories `ErrorView`) |
| Empty (nothing to rate on deck / slider / pastOrders) | — | **does not exist**; the card lists are fixed in `data.ts` |
| Already reviewed / edit a submitted review | — | **does not exist**; the orders star row always opens a fresh session |
| Reduced motion | every screen (`useReducedMotionConfig`): blur swaps become fades, Submitted shows the hero and card at once | exists |

## Data

- `src/flows/reviews/data.ts`: products (`BIKE_PRODUCT`, `IPHONE_REVIEW_PRODUCT`, `EXCHANGED_IPHONE_PRODUCT`, `MANUAL_BIKE_PRODUCT`, `IPHONE_PRODUCT`, `newReviewProducts`, `rateProducts`, `editVariantFor`, `PAST_ORDER_PRODUCTS`, `DECK_CARDS`, `SLIDER_CARDS`), pools via `getAttributes` / `attributesFor`, drafts (`REVIEW_DRAFT_A`, `REVIEW_DRAFT_B`, `SUBMITTED_REVIEW_TEXT`), `makeCollapsed`, `reviewer`, `reviewPhotos`, `copy` (verbatim from the repo), `orderKindEntries`, `orderReviewEntries`, `reviewEntryFor`.
- Images and Lotties: `src/flows/reviews/assets.ts` (`reviewsImages`, `reviewsLotties`) from `src/assets/reviews/`. The review screens show the repo products, not the order's mock product.
- Tokens: `tokens.ts` (`reviewsTokens` metrics, `reviewsFlowTokens` merged with `tokens.ai.ts` and `tokens.keyboard.ts`), `tokens.draft.ts` (JS only, not merged), `components/NewReviewTokens.ts`.
- Not from `src/data` and no prices: reviews has no `currency` use.

## Motion

All values in `reviewsMotion` (`src/flows/reviews/tokens.motion.ts`), mapped onto kit presets where they match (`supermall.ease.soft`, `easing.ios`, `duration.medium`); table in `MAPPING.md` §3; cross-flow overview in `../noon-ui/references/motion-matrix.md`.

| Moment | Kit |
|---|---|
| Screen pushes | Navigator `push`; post-submit screens `fade` (never animate a screen's own entry) |
| In-place swaps (AI ⇄ manual, skeleton ⇄ list, product switch, loader label) | blur cross-fade `reviewsMotion.swap` (blur 4, y ±6), `duration.base` / `fast`, `ease.out` |
| List entry | `reviewsMotion.stagger` (40ms + 50ms, y 12) on `spring.gentle`; drafts `<FadeIn y={10}>` (kit recipe) |
| Stars | tap scale `press.star` .82; fill pop `starPop`; read-only rows `starAppear` / `starAppearB`; `haptic('tick')` on change |
| Toggles, chips | `spring.snappy`; chip colour cross-fade with `palette` values (MAPPING §6) |
| In-screen sheets, DraftB save dock | `spring.sheet` (.5s, bounce .14), scrim `scrimFade` .2s |
| Mock keyboard | `reviewsMotion.keyboard` (height, .34s `easing.ios`) |
| Crafting / skeleton | `craftSweep` 1.2s / `skeletonSweep` 1.1s linear loops |
| AI loader | bloom `timing.bloomSweep` on `ease.inOut`; check badge `spring.bouncy` |
| Deck / slider | `spring.gentle`, `reviewsMotion.deck` / `slider`; `haptic('snap')` on a swipe that changes the card |
| Submitted | Lottie, card rise 28 on `spring.gentle`, `photoPop` |
| Presses | `Pressable` / `Button` (kit `pressScale`) |

## Acceptance

- [ ] New screens registered in `src/flows/reviews/index.ts` with `title`, `notes`, `path`, `defaultParams`, `source` via `src(node, file)`; `check:routes` clean; `/reviews` still opens `reviews/rate`.
- [ ] Every screen calls `useReviewParams(params)` and opens by URL with sensible defaults, without coming from the orders list.
- [ ] Every navigation goes through `openReview` / `reviewsNav` / `draftRoute`; no route string in a screen.
- [ ] Submit resets to `reviews/submitted`; Submitted has no back and advances per the graph; close returns to `orders/list`.
- [ ] Shared components reused (no forked header, footer, chips, stars, draft card); sheets stay in-screen overlays.
- [ ] `<Screen background="reviewsPage">`, 12 gutter, 16 between cards, dark CTA (`--nk-color-text-strong` fill), outline Next border `--nk-color-pill-selected-border`.
- [ ] Tokens only (`lint:tokens` 0 for `src/flows/reviews`); new values are `reviews*` flow tokens with a `MAPPING.md` row.
- [ ] Motion only from `reviewsMotion` and kit presets / recipes; reduced motion handled.
- [ ] Star taps on o3, o4 and o8 in `orders/list` land on the right `reviews/new` product.
- [ ] Screenshots of every screen read against its Figma node (rate in A and B, rating 1 and 5; new scrolled; submitted after the Lottie).
