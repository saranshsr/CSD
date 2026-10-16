# reviews: flow brief (R&R 2.0)

Read with `../screens.md`, `src/flows/reviews/README.md` (the flow graph and the helpers) and `src/flows/reviews/MAPPING.md`. The flow is new and untracked on this branch, as of 2026-10-13.

## Sources

- The prototype repo **vbirla789/R-R-2.0-with-checkbox** @ab185b3 (CRA + framer-motion)
- Figma **KzR8dy12uT8CtgBRHHY6Qx**

Every `source` names a Figma node and a repo screen, so truth is inferred as `mixed`. The flow's group is Post-order and its parent is `orders/list`. The alias `/reviews` opens `reviews/rate`.

## Screens and how they relate

There are two entries:

- **Entry A, rate first.** `reviews/rate`, then either:
  - **AI on**: `reviews/aiLoader`, replaced with a fade by the draft;
  - **AI off**: straight to the draft.

  The draft is `reviews/draft` for variant A (bike) or `reviews/draftB` for variant B (iPhone).
- **Entry B, a single scroll.** `reviews/new`, with three editor patterns chosen by `editVariantOf`:
  - bike: pinned editor
  - iphone: grow editor (fold spring, 320 floor)
  - iphone16: top-sheet editor

  It drafts inline with `RewriteSheet`.

Every submit goes to `reviews/submitted` (stack reset). That screen then auto-advances:

| Product / variant | Goes to |
|---|---|
| past, iphone16 | `orders/list` |
| iphone | `reviews/pastOrders` |
| variant B | `reviews/slider` |
| otherwise | `reviews/deck` |

`reviews/deck` and `reviews/slider` are two carousels for rating past orders:

- **Deck**: drag the front card; left = next, right = previous; `snap` haptic.
- **Slider**: a spring strip where neighbours peek and can be tapped.

The repo never reaches the slider. The kit routes variant B there so it can be reached.

## Rules

- **Never hard-code a reviews route.** Every arrow is a helper in `src/flows/reviews/store.ts`:
  - `openReview(nav, { orderId?, rating, product?, variant? })` is the one entry. `product` beats `variant`, which beats `orderId`. It resets the session.
  - `reviewsNav.craft`, `finishGenerating`, `stopGenerating`, `submit`, `submitPastOrders`, `afterSubmit`, `close`, `tellUsMore`
  - `draftRoute(variant)`
- **Session state** is `reviewsStore` (`createStore`). It holds:
  - rating (default 4), hideName, variant A|B, product
  - aiEnabled, picks, note, manualText, draft, photos

  `useReviewParams(params)` writes URL params into the store. Per-screen UI state (deck index, per-product ratings) stays in the screen. There is no DemoStore use.
- **Shared components** are exported from `src/flows/reviews/components/index.ts`:
  - `StarRatingInput`, `AttributeChips`, `ReviewProductHeader`, `AiToggle`
  - `DraftCard` (look inline | review | field), `AddPhotos`, `ReviewTextField`
  - `MockKeyboard` / `KeyboardDock`, `ReviewHeader` / `ReviewFooter`
  - `ReviewSheet` / `RewriteSheet` / `EditReviewSheet`, `PastOrderCard`

  Extend them with props only, tagged `@extended-by`. Don't fork them.
- **Motion**: the repo springs (snappy, gentle, bouncy, sheet, fold) live in `reviewsMotion`. Timings live in `reviewsMotion.timing`, e.g. `loaderHoldMs`, `loaderDoneMs`, `submittedAdvanceMs` and `orderStarPushMs`. Haptics are kit additions: `tick`, `pop`, `success`, `snap`.

## Value mapping gotchas (from MAPPING)

- Text colours are renamed: repo `secondary / tertiary / muted` = kit `textMuted / textSecondary / textTertiary`.
- Repo error `#d92626` maps to `dangerRed`, not kit `danger`.
- Letter-spacing is dropped.
- Screen pushes use the Navigator, not the repo's ScreenShell spring.
- Documented exceptions:
  - the sheets are in-screen overlays, not `nav.sheet`;
  - `KeyboardDock` animates `height`;
  - chips animate palette values.

## Draft tokens

`src/flows/reviews/tokens.draft.ts` (`reviewsDraft`: polaroid 62×82 with a 7.67° tilt, entrance spring) holds JS values, not CSS variables. DraftScreen, DraftBScreen and DraftProductTop import it directly; it is deliberately not merged into the flow tokens.
