# Ratings & reviews (R&R 2.0)

Port of the R&R 2.0 prototype (repo **vbirla789/R-R-2.0-with-checkbox**, Figma **`KzR8dy12uT8CtgBRHHY6Qx`**) into the flow kit.
Phase 1 delivered the flow skeleton (session store + navigation helpers, verbatim data, tokens + motion mapping, assets and
the shared R&R components); phase 2 built every screen. All nine screens are complete.

Read first: `.claude/skills/noon-ui/SKILL.md` (house rules), `MAPPING.md` (repo → kit values), the repo screen you port.

## Files

| File | What |
|---|---|
| `index.ts` | `reviewsFlow` — 9 screens, group Post-order, parent `orders/list`, alias `/reviews` → `reviews/rate` |
| `store.ts` | `reviewsStore` / `useReviews(select?)`, `reviewsActions`, `useReviewParams(params)`, `openReview()`, `reviewsNav`, derived helpers |
| `data.ts` | products (`BIKE_PRODUCT`, `IPHONE_REVIEW_PRODUCT`, `EXCHANGED_IPHONE_PRODUCT`, `MANUAL_BIKE_PRODUCT`, `IPHONE_PRODUCT`, `PAST_ORDER_PRODUCTS`, `DECK_CARDS`, `SLIDER_CARDS`), `getAttributes` / `attributesFor`, `makeCollapsed`, drafts, `reviewer`, `reviewPhotos`, `copy`, order → entry mapping |
| `tokens.ts` (+ `tokens.ai.ts`, `tokens.keyboard.ts`, `tokens.motion.ts`) | `reviewsFlowTokens` (merged, passed to `defineFlow`), `reviewsTokens` (metrics), `reviewsMotion`, `reviewsAi`, `reviewsKeyboard` |
| `assets.ts` | `reviewsImages`, `reviewsLotties` (`starsLoading`, `reviewSuccess` → `<Lottie src>`) |
| `components/` | shared R&R components (below) |
| `*Screen.tsx` | one per screen (with its own `*.module.css` where needed) |

## Flow graph (repo App.tsx)

```
orders/list ──★ openReview()──► reviews/rate (variant A bike | B iPhone)
     │                             ├─ craft, AI on ──► reviews/aiLoader ──done (replace, fade)──► reviews/draft | reviews/draftB
     │                             └─ Next, AI off ─────────────────────────────────────────────► reviews/draft | reviews/draftB
     └──★ openReview()──► reviews/new (product bike | iphone | iphone16)

draft / draftB / new ──submit (reset)──► reviews/submitted ──auto (replace, fade)──►
      product bike, variant A → reviews/deck · bike, variant B → reviews/slider* · iphone → reviews/pastOrders · iphone16 | past → orders/list
reviews/pastOrders ──submit──► reviews/submitted (product 'past') ──auto──► orders/list
X on new / pastOrders / deck / slider, deck + slider "Continue shopping" ──► orders/list (reset)
```
\* App.tsx never reaches PastOrderRatingScreenB; we route rate-variant-B reviews there so both carousels are reachable.

Every arrow is a helper in `store.ts` — screens never hard-code routes:

| Call | Does |
|---|---|
| `openReview(nav, { orderId?, rating, product?, variant? })` | the one entry (orders list). `product` wins over `variant` wins over `orderId`. Resets the session |
| `reviewsNav.openRate(nav, { rating, variant })` / `openNew(nav, { rating, product })` | explicit entries |
| `reviewsNav.craft(nav, aiEnabled)` | rate → `aiLoader` (AI on) or straight to `draftRoute()` |
| `reviewsNav.finishGenerating(nav)` / `stopGenerating(nav)` | loader → its draft (replace, fade) / back to rate |
| `reviewsNav.submit(nav, { hideName })` | → `submitted` (stack reset, no back) |
| `reviewsNav.submitPastOrders(nav, hideName)` | pastOrders → submitted with product `'past'` |
| `reviewsNav.afterSubmit(nav)` | Submitted's auto-advance per the graph |
| `reviewsNav.close(nav)` | → `orders/list` (reset) |
| `reviewsNav.tellUsMore(nav, rating)` | past-order card → rate A (repo left `onTellMore` unwired) |
| `draftRoute(variant?)` | `'reviews/draft'` or `'reviews/draftB'` |

### Order kinds → entry (`openReview` with `orderId`)

From repo `OrderListScreen.tsx` (star taps) + App.tsx; table in `data.ts` (`orderKindEntries`, `orderReviewEntries`):

| Order kind (repo card) | Opens | Our order (`src/flows/orders/data.ts`) |
|---|---|---|
| Delivered, still returnable (card 1, bike holder) | `reviews/new`, product `bike` (pinned editor) | `o3` |
| Delivered, return window closed (card 2, iPhone 16 Pro) | `reviews/new`, product `iphone` (grow editor) | `o4` |
| Exchanged (card 4, iPhone 16) | `reviews/new`, product `iphone16` (top-sheet editor) | `o8` (`reviewProduct: 'iphone16'`) |
| Returned / cancelled | no rating row | `o5` |
| ManualReview entry (App.tsx, older design) | `reviews/rate`, variant `A` (bike) / `B` (iPhone) | `o6` → A; unknown ids → A; pass `variant: 'B'` for B |

The review screens show the **repo products** (chips and drafts are product-specific), not the order's mock product.
The orders list wiring itself is owned by the orders agent: on a star tap, let the star pop land
(`reviewsMotion.timing.orderStarPushMs`, 220ms) then call `openReview(nav, { orderId: order.id, rating })`.

## Session store

`ReviewsState`: `rating` (1–5, 0 = unrated, default 4) · `hideName` · `variant` `'A' | 'B'` · `product` `'bike' | 'iphone' | 'iphone16' | 'past'`
· `aiEnabled` · `picks { positives[], improvements[] }` · `note` · `manualText` · `draft` (`''` = use the product's canned text) · `photos[]`.

`reviewsActions`: `start(opts)`, `setRating`, `rate(n, product, 'clear' | 'prune')` (ManualReview clears picks, NewReview prunes),
`togglePick(kind, item)`, `setPicks`, `clearPicks`, `setNote`, `setManualText`, `setDraft`, `setHideName`, `toggleHideName`,
`setAiEnabled`, `setVariant`, `setProduct`, `addPhotos(urls, max = 5)`, `removePhoto(i)`, `reset`.
Derived: `pickCount(s)`, `rateProductFor(variant)`, `newProductFor(key)`, `editVariantOf(key)`, `pastOrderProducts`.

Every screen calls `useReviewParams(params)` first (writes URL / sidebar params into the store on mount — direct URLs like
`/reviews/rate?rating=2&variant=B` work). Per-screen UI state (phase, editing, keyboard, open sheet, deck index, per-product
state on pastOrders) stays in the screen.

## Shared components (`components/`, owned by phase 1)

| Component | Props (main) | Used by |
|---|---|---|
| `StarRatingInput` | `value`, `onChange?` (absent = read-only), `size` 24/32/33/20, `gap`, `appear?`, `label` | all screens |
| `AttributeChips` / `AttributeChip` | `title?`, `items`, `selected`, `onToggle(item)`, `size` `'md'` 40 / `'sm'` 36 | new, pastOrders |
| `ReviewProductHeader` | `product {image,name}`, `rating`, `onRate?`, `variant` `'rate' \| 'compact' \| 'docked'` | rate, draftB, new (docked), pastOrders (docked) |
| `AiToggle` | `enabled`, `onChange`, `look` `'outline'` (rate) / `'raised'` (new) | rate, new |
| `DraftCard` | `text`, `phase`, `look` `'inline' \| 'review' \| 'field'`, `reviewerName`, `hideName`, `onToggleName`, `onEdit?`, `editing?`, `collapsible?`, `header?`, `body?` | new, pastOrders (inline) · draft (review) · draftB (field) |
| `CraftingShimmer`, `DraftAction`, `NameToggle` | parts of DraftCard, exported | new, pastOrders, drafts |
| `AddPhotos` / `PhotoThumbs` | `photos`, `onCamera`, `onGallery`, `onRemove`, `max` / `photos`, `appear`, `onRemove` | draft, draftB, new, pastOrders / submitted |
| `ReviewTextField` | `value`, `onChange`, `placeholder`, `size` `'note' \| 'optional' \| 'large'`, `surface`, `autoGrow`, `min/maxHeight`, `maxLength`, `counter`, `inputMode`, `inputRef`, focus handlers | rate, new, pastOrders, sheets |
| `MockKeyboard` / `KeyboardDock` / `applyKey` | `onKey?` / `visible`, `onKey?` / `(text, key, max)` | every screen with a field |
| `ReviewHeader` | `title`, `titleWeight`, `leading` `'back' \| 'close' \| 'none'`, `onLeading`, `center`, `right`, `bordered` | all screens |
| `ReviewFooter` | `children` (CTAs), `keyboard? { visible, onKey }`, `hideBar` | all screens with a CTA |
| `ReviewSheet` / `RewriteSheet` / `EditReviewSheet` | `open`, `onDismiss` … / `open`, `onKeepReview`, `onEditPicks` / `open`, `text`, `onChange`, `onSave`, `onDismiss?`, `look` `'docked' \| 'floating'` | new, pastOrders · draft (floating) |
| `PastOrderCard` | `card`, `rating`, `onRate`, `onTellMore?`, `interactive`, `imageHeight` | deck, slider |
| `EyeIcon`, `SparkleIcon`, `ExclamationIcon` | glyphs Origin lacks | components, loader |

CTAs are kit buttons: `<Button variant="dark" size="lg" block disabled={…}>` (flow tokens make `dark` = `#101628` with the
R&R disabled colours) and `<Button variant="outline" size="lg" block>` for the past-order "Next" (re-pointed to white +
`#d6e9ff` + blue). Pages use `<Screen background="reviewsPage">` (the repo gradient).

## Phase-2 instructions

**File ownership.** Each agent owns exactly its screen file(s) and may add `components/<Screen>*.tsx` (+ `.module.css`)
for screen-only parts (e.g. `components/RateChecklist.tsx`, `components/NewReviewMorphHeader.tsx`, `components/DeckStack.tsx`).
Do not edit `index.ts`, `store.ts`, `data.ts`, `tokens*.ts`, `assets.ts` or the shared components — they are phase 1's.
Need a change there? Extend **by props only** (new optional prop, defaults unchanged), say so in the doc comment
(`@extended-by <Screen>: …`) and in your report; never change an existing prop's behaviour. A new flow token goes in
`tokens.<screen>.ts` merged by the coordinator — or, if you must, add one key to `tokens.ts` under a comment with your screen
name. Keep screen ids, routes and `path`s unchanged.

| Screen file | Repo source | Figma | Owner notes |
|---|---|---|---|
| `RateScreen.tsx` | `ManualReviewScreen.tsx` | 6042:140824 | `ReviewProductHeader rate` + `rate(n, product, 'clear')`, 600ms skeleton (`Skeleton`), checkbox rows = central `Checkbox` in a `Pressable` row (screen-local), `AiToggle outline`, `ReviewTextField optional` / `large`, footer Craft my review / Next → `reviewsNav.craft` |
| `AiLoaderScreen.tsx` | `AILoaderScreen.tsx` | 6305:167731 | bloom `--nk-color-reviews-bloom` + `reviewsAi`, `<Lottie src={reviewsLotties.starsLoading} loop size={18}>`, `check-circle-filled` in `reviewsAiInk`, timings `reviewsMotion.timing.loader*` → `finishGenerating` |
| `DraftScreen.tsx` | `ReviewDraftScreen.tsx` | 7116:43925 | grey top + tilted polaroid (screen-local), `DraftCard look="review"`, `AddPhotos`, `EditReviewSheet look="floating"`, `reviewsNav.submit` |
| `DraftBScreen.tsx` | `ReviewDraftScreenB.tsx` | 7159:44106 | `DraftCard look="field"` with `ReviewProductHeader compact` + `ReviewTextField surface="subtle"` as `body`, Save bar + `MockKeyboard` slide-up |
| `NewReviewScreen.tsx` | `NewReviewScreen.tsx` | 7629:275417 (+ 8194-101662, 9782-207423, 9802-54954, 10562-228822) | morphing header (screen-local, use `reviewsTokens.morphHeader`), `AttributeChips`, note focus morph, `DraftCard inline`, edit pattern `editVariantOf(product)`, `RewriteSheet`, `KeyboardDock` |
| `PastOrdersScreen.tsx` | `RatePastOrdersScreen.tsx` | 9129:106814 | strip (screen-local), 33px `StarRatingInput`, `AttributeChips size="sm"`, `attributesFor(p, rating, { unratedAs: 4 })`, `DraftCard`, `EditReviewSheet docked`, `RewriteSheet`, `submitPastOrders` |
| `SubmittedScreen.tsx` | `SubmittedScreen.tsx` | 6042:141658 | `<Lottie src={reviewsLotties.reviewSuccess} onComplete>` full page, review card (`reviewsGlass`, `StarRatingInput size={20} gap={2}`, `PhotoThumbs appear`, `SUBMITTED_REVIEW_TEXT`, `reviewer.hiddenNameSubmitted`), `success` haptic, `afterSubmit` |
| `DeckScreen.tsx` | `PastOrderRatingScreen.tsx` | 8842:127140 | `DECK_CARDS`, `PastOrderCard`, `reviewsMotion.deck` drag + springs, `Button outline`, `close` |
| `SliderScreen.tsx` | `PastOrderRatingScreenB.tsx` | 8810:123358 | `SLIDER_CARDS`, `PastOrderCard`, strip on `reviewsMotion.spring.gentle` / `slider` |

Rules that bite here: tokens only (lint 0 for `src/flows/reviews`), `<Screen>` + `ReviewHeader` / `Header`, CTAs in
`<Screen footer={<ReviewFooter …>}>`, no in-screen push animations (the Navigator transitions), motion values from
`reviewsMotion` / presets (no literals that equal a preset), Origin icons, copy from `data.ts` `copy`, haptics per motion.md.
No status bar or home indicator drawing — the phone frame owns them. The mock keyboard is the keyboard in the preview: show it
(via `KeyboardDock` / `ReviewFooter keyboard`) whenever a field is focused, and use `inputMode="none"` where the repo did.
Verify: `npm run typecheck`, `npm run lint:tokens`, `PORT=5182 npm run check:routes`, screenshot with
`PORT=5182 node scripts/shot.mjs reviews/<id> <png>`.
