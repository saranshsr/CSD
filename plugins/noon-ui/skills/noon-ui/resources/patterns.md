# Cross-flow patterns

These are patterns the flows on this branch share. Reuse them before inventing a new mechanism. Each pattern names where it lives; open that file before copying it. Snapshot from 2026-10-13.

## The shopping journey and its hand-offs

```
home / deals / categories / pdp header ──push──► search/search
search/search ──push results-fade (+ preloadRoutes)──► plp/listing ──push──► pdp/detail
pdp/detail ──QuickAdd / Add to cart──► pdp/added (sheet) ──push──► cart/cart
                       └─ Buy now ──push──► checkout/checkout
cart/cart ──push { coupon } (once: noonone/cartOverlay first)──► checkout/checkout
checkout/checkout ──push none──► checkout/placing ──replace──► checkout/confirmation | checkout/payment-failure
checkout/confirmation ──reset──► home/home | orders/list
orders/list ──★ openReview()──► reviews/*        orders/list ──Track my refund──► returns/details
```

`npm run test:journeys` covers these hand-offs end to end (navigation, cart / wishlist state, filters, sheets, PDP variants, checkout, noon One, empty / error states, orders; full table in `resources/tooling.md` → journeys). When you change a hand-off, run it. When you add one, add a journey for it (`resources/tooling.md`).

## State: where it goes

| Kind | Where | Example |
|---|---|---|
| Cross-flow (cart, wishlist, coupon, totals) | `useDemoStore()` (`src/kit/DemoStore.tsx`) | cart has no store of its own |
| noon One membership | `useMembership()`, `useIsNoonOneMember`, `useMembershipEligibility` (`src/kit/membership.ts`) | account `ProfileCard`, noonone, membership |
| Flow session shared with its sheets | `createStore` in `<flow>/store.ts` | `plpStore`, `checkoutStore`, `reviewsStore`, `accountStore` |
| Per-screen UI | component state | deck index, search phase |

- **Sheets are separate stack entries.** Anything a sheet edits must live in a flow store, not in the screen.
- **Draft-then-commit** for multi-field sheets: `plp/filters` clones the filters and commits on "Show N results".
- **Fake latency** goes through one helper: checkout `update(patch, 450)` + `<Reloader>`, and cards `API_DELAY = 450`.
- **Navigation helpers**: when a flow has many arrows, put them in the store and keep screens free of hard-coded routes. See `reviewsNav` and `openReview()` in `src/flows/reviews/store.ts`.

## Tokens: area files, not variants

home (`tokens.feed.ts`, `tokens.eid.ts`, …) and pdp (`tokens.sfA`–`sfE`, `tokens.npA`–`npE`) split their flow tokens by **area or section group**. All of them are always merged by `mergeTokens` in the flow's `tokens.ts`.

- A new file must be added to that merge, or its CSS vars don't exist. `src/flows/reviews/tokens.draft.ts` shows the other route: imported directly, not merged.
- Prefix keys with the flow and area (`homeBz…`, `pdpNpa…`). camelCase becomes kebab: `homeBzMegaBg` → `var(--nk-color-home-bz-mega-bg)`.
- Values with no central equivalent carry `// token-lint-ignore — <reason>`.
- JS-only numbers (thresholds, timings, geometry) go in a plain object (`pdpTokens`, `bz`, `plpTokens.timeline`, `reviewsMotion.timing`), not in the CSS-var token set.
- Real runtime variants are **params**, e.g. `pdp/detail?delivery=`, `orders/tracking?variant=1..4`, `cart/empty`, `membership/manage?state=`, `account/account?orders=none`. Add new demo states as params or as extra `ScreenDef`s with `defaultParams`, not as forks of a screen.

## Data-driven screens

- Module feeds are a typed union + an ordered array + one `switch`. Order changes then stay data-only.
  - home: `homeFeed` / `FeedModule`
  - cart: `SECTIONS` / `renderSection`
  - checkout: `FIGMA_SECTIONS` / `MASTER_SECTIONS`
- A section hides itself when its data is empty: PDP `SfFreeGifts`, the bundle card, the AI overview.
- Live captures are kept as `data.live.ts`: pdp iPhone 17 Pro, the categories CMS. Mocks stay in `data.ts`.

## Scroll and the tab bar

- **Tab bar hide**: use `useTabBarScrollHide` / `TabBarScrollVisibility` from `src/kit/tabBarScroll.ts`.
  - Drive transforms from MotionValues and CSS vars (`--plp-tab-hide`), so scrolling never re-renders.
  - Call `rebase(y)` after any programmatic scroll (PDP variant switch).
- **Header shade or collapse**: `useTransform` of `scrollY` (cart and checkout headers). For home, collapse at ≥100 and `memo` the feed so only the header re-renders.
- **Sticky footer**: report its height (`onHeightChange`) and pad the content, rather than guessing the height (cart).

## Motion reuse

- Post-order reveal: `reveal(i)` / `pressDip` in `src/flows/orders/motion.ts`, which wrap `supermall.reveal` / `supermall.press`.
- Search → results: `results-fade` + `preloadRoutes` + the bar drawn at the same position on both screens.
- Lists that animate in: animate only the first 8 items (PLP `animateFirst`). Changed content uses an `epoch` key (`BlurSwap`, the PLP grid swap).
- Haptics: `haptic('tick' | 'snap' | 'pop' | 'success' …)`. Calls before the first user gesture are ignored, so don't add guards.
- Respect `useReducedMotion`, and stop autoplay on touch (home carousels).

## Truth and drift

- Every screen has `source`; `truth` says which reference wins (`resources/tooling.md`). Before restyling a screen, check its truth in `resources/screens.md`. If the request contradicts it, **ask**.
- Several mapping docs record a reversal: the cart footer went bappzaar → Figma, and PDP Buy Now was dropped and then restored. Trust the latest section of the mapping doc, and the code over both.
- Each flow brief in `flows/` ends with the known stale comments and doc drift. Fix them when you touch that code, and update the brief.
