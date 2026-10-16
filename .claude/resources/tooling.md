# Kit infrastructure and tooling

What the kit gives a flow beyond components and tokens, and the checks that prove a change works. The details come from the branch as of 2026-10-13. When this file and the code disagree, the code wins: fix this file.

## Lazy screens: `src/kit/lazyScreen.ts`

- `lazyScreen(() => import('./XScreen'), 'XScreen')` returns a `React.lazy` screen with `.preload()`. The preload and the first render share one download.
  - Use it for every screen in a flow's `index.ts`. `npm run new-flow` generates screens this way.
  - Keep the screen a page opens on eager only when it must paint first. `home/home` is the one example; only `ClassicHomeScreen` is lazy.
- `nav.preload('flow/screen', …)` (or `preloadRoutes(...loads)` with raw imports) fetches the screens a page is about to open. A screen whose module is loaded renders without suspending (`lazyScreen`), so a sheet or hand-off opened after the preload never shows an empty `<Suspense>` frame (React holds a suspended commit ~300ms: a lazy sheet opened cold rises empty and its content pops in mid-spring). Example: `plp/listing` preloads `plp/filters` and `plp/sort` on mount.
  - Example: `src/flows/search/SearchScreen.tsx` preloads `plp/listing` and `pdp/detail` on mount.
  - Add this whenever a screen pushes another screen straight away (search → results, CTA → sheet).
- `preloadScreens()` is called once by `src/kit/Navigator.tsx`. 1.5 s after first paint it fetches every lazy screen, one per idle slot.
- The Navigator wraps each stacked screen in `<Suspense fallback={null}>`. A screen that suspends renders nothing, never a spinner.

## Tab bar hide on scroll: `src/kit/tabBarScroll.ts`

- This is a port of bappzaar `ScrollVisibilityProvider`. The defaults live in `tabBarScroll`: top 10, activation 150, dead zone 4, hide after 64, show after 24, flick velocity 2.
- Call `useTabBarScrollHide(scrollRef, active, cfg?)`. It returns `{ tabHide, onScroll, reveal, rebase }`.
  - `tabHide` is a MotionValue from 0 to 1 that drives the bar's transform.
  - Pass `onScroll` to `<Screen onScroll>`.
  - Call `rebase(y)` after a programmatic scroll correction. Without it, a variant switch makes the page jump.
- In use: `src/flows/pdp/DetailScreen.tsx` (`useTabBarScrollHide(scrollRef, isTop)`). It came out of the PLP.
- `TabBar` (`src/components/TabBar/TabBar.tsx`) is now bappzaar's native bar 1:1, with no animation.
  - Icons swap selected/unselected instantly, and the label is semibold 14.
  - `layout.tabBar` is 49.
  - Don't add an indicator animation back. The older CHANGELOG line that describes one is stale.

## Source of truth per screen: `screenTruth()` in `src/kit/registry.ts`

- `ScreenDef.truth` takes one of: `bappzaar`, `figma`, `mixed`, `reference`.
- When `truth` isn't set, it is inferred from `source`:
  - a Figma frame plus bappzaar paths → `mixed`
  - a Figma frame only → `figma`
  - a link or `reference:` → `reference`
  - anything else → `bappzaar`
- `verified: 'YYYY-MM-DD'` records the last side-by-side check.
- `npm run skill:check` enforces two rules:
  - every screen has a `source`;
  - an explicit `figma` or `mixed` truth needs the flow's `MAPPING.md` or `FIGMA-MAPPING.md`.
- See `screens.md` for the current value of every screen.

## Smaller kit changes to know

- `haptic(kind)` (`src/motion/haptics.ts`) does nothing before the user's first interaction, so there's no console noise from `vibrate()`.
- Transition `results-fade` (`src/motion/custom/index.ts`) does not fade the incoming layer in. Only the content below the search bar fades. That keeps the search bar steady during search → results.
- `vite.config.ts` sets `assetsInlineLimit: 0`, so images ship as files. Don't import large images expecting base64.
- The dev preview exposes `window.__NK_NAV__ = { route, stack, params }` (`src/app/main.tsx`). The journey tests read it.
- `ProductCard` has a `carousel` prop for home rails. It is compact, uses an image ratio of 1.361 and shows no coupon.
  - Its QuickAdd on a Fashion product with sizes opens `pdp/variants` instead of adding to cart.
- `ProductBoxVertical` (`src/components/ProductBoxVertical`) is the bappzaar PLP grid box. Use it for any listing grid.
- `SearchInput` back / clear / camera are bappzaar artwork in `src/assets/shared/search-bar/`.

## Checks: which one proves what

| Command | Proves | Notes |
|---|---|---|
| `npm run verify` | typecheck (app + lib), token lint, asset budget, lib build | run before you hand over |
| `npm run check:routes` | every registered route renders with no console errors | needs `npm run dev` on 5180 (or `PORT=`); `-- <word>` checks only matching routes; ends with a per-category summary and writes `test-results/check-routes.json` |
| `npm run test:journeys` | critical journeys behave (routes, stack, shared state, visible UI), with no console or page errors | starts its own Vite on 5199 (or `PORT=` reuses one); `-- <name or area>` runs a subset; report in `test-results/journeys/report.md` (see "Journey tests" below) |
| `npm run visual:ref` | fidelity against external references: PASS / NEEDS-REVIEW / FAIL (exit 0 / 2 / 1) with geometry, pixel share, colour ΔE, worst regions and element checks | Vite on 5198 unless `PORT`; `-- <name>`, `--coverage`, `--accept`, `--set-ref`; report in `test-results/visual-ref/report.{md,json}` + `<name>.{kit,ref,diff,compare}.png`. Full workflow: `.claude/skills/noon-ui/references/verify.md` → Reference-backed validation |
| `npm run skill:check` | skills and resources match the code; `screens.md` is current | run after changing flows, screens, components, tokens |
| `npm run resources:build` | regenerates `screens.md` | after adding or renaming a screen, or changing `source` / `truth` / `verified` |
| `node scripts/shot.mjs <route> <out.png>` | one screenshot to read | `--scroll y`, `--click sel`, `--type`, `--wait` |

### Journey tests: `scripts/journeys.mjs`

The runner lives in `scripts/journeys.mjs`. Journeys are in `scripts/journeys/<area>.mjs`, the helpers in `scripts/journeys/lib.mjs` and the report writer in `scripts/journeys/report.mjs`. Each journey drives the dev preview the way a finger would (taps at element centres, drags). It asserts the Navigator state from `window.__NK_NAV__` (`route`, `stack`, `params`) and what is visible on screen. Every checkpoint saves a screenshot of the phone viewport and runs the accessibility scan.

| Journey | Area | Asserts |
|---|---|---|
| `search-to-plp` | shopping | Search → results hand-off: a search bar is on screen in every frame, at the same spot. Lands on `plp/listing` with the query, stack search → plp, ≥ 4 results. |
| `plp-filter` | filters | The Samsung quick pill leaves only Samsung results and puts a count on Filter. Tapping it again restores the full grid. |
| `plp-filter-sheet` | filters | `plp/filters` "Show N results" tracks the draft. Show commits: the grid has exactly N results, starts at the top and Filter shows 1. Clear All → Show restores the grid and drops the count. |
| `plp-sort-sheet` | filters | Sort sheet → "Price: Low to High" closes it. The pill reads the sort, prices ascend and the grid starts at the top again. |
| `pdp-add-to-cart` | shopping | PLP → PDP is pushed onto the stack. Add to cart bumps the badge or opens the quick cart. Back returns to the same results and query. |
| `pdp-variant-in-place` | pdp | A variant tile switches the SKU in place: same route and stack, new title. The picker stays within ±4px in every sampled frame. |
| `cart-checkout` | checkout | The footer summary opens and closes (`aria-expanded`). Checkout (through the noon One push for non-members) lands on `checkout/*` on top of the cart. |
| `tab-bar-switching` | navigation | Home → Categories → Deals → Account → Cart → Home. Each tab is a one-entry stack with exactly one tab bar, and `aria-current` is on the right tab. |
| `back-from-pushed` | navigation | Account → My Orders → Back. Home rail card → PDP → Back. Each Back pops to a one-entry stack. |
| `back-direct-url` | navigation | Opened by URL, Back goes to the logical parent. Covers `orders/list`→account, `checkout/checkout`→cart, `pdp/deliveryVariants`→pdp, `wishlist/wishlist`→home and `noonone/landing`→account. |
| `cart-add-from-card` | state | A home rail QuickAdd + raises the badge by 1. The Cart tab has a new line for that product, and the total grows by its price (± one shipping fee). |
| `cart-add-from-pdp` | state | PDP Add to cart → `pdp/added` with the badge +1. View cart → `cart/cart` lists the product. |
| `cart-qty-totals` | state | The + stepper changes the total by the unit price and the badge by 1. − restores both. The trash removes the line (badge −1, total down). |
| `cart-coupon` | state | APPLY is disabled while empty. An invalid code leaves the total and shows Remove. NOON10 lowers the total (≤ 150 cap). Remove restores the total. |
| `wishlist-toggle` | state | Heart a home card → it is on `wishlist/wishlist`. Un-heart it there → it is gone, and back on home the card is un-hearted. |
| `sheet-dismiss` | sheets | Filters and Sort sheets close via the Close button, a scrim tap and a drag down on the grabber. Each close leaves a one-entry stack, no sheet layer and a tappable screen. |
| `pdp-variants-size-warning` | sheets | `pdp/variants` ADD TO CART without a size shows "Please select the size" and adds nothing. After picking a size, ATC closes the sheet, toasts and bumps the badge. |
| `checkout-slide-to-pay` | checkout | Slide to pay is gated: disabled, enabled on Tabby, disabled again on the card, still disabled with a 2-digit CVV, enabled with 3 digits. Sliding goes placing → confirmation ("Order placed"). Continue Shopping → home, badge 0. |
| `checkout-payment-failure` | checkout | `?failPayment=1` → `checkout/payment-failure`. "Try another payment method" returns to checkout with the slider reset. |
| `noonone-start-trial` | noonone | Account strip → non-member landing → Start trial → `planDetails` → Start free trial. Back on the landing, "Free trial active" shows and the footer is gone. Account no longer offers Start Trial. |
| `noonone-plans-tabs` | noonone | View other plans → `noonone/plans`. One Bundle and One Standard swap the plan cards. Tapping the other plan moves the selection. |
| `cart-empty-state` | states | Removing every line shows "Your cart is empty", badge 0 and no Checkout. The empty cart's carousel + adds a line back. |
| `cart-empty-param` | states | **Known failure.** `cart/empty` badge reads 4 (see the journey's `known`). |
| `wishlist-empty-cta` | states | `wishlist/empty`: "Start adding items" pushes `search/search`. |
| `categories-error-retry` | states | `categories/error`: Retry → loader → the category grid. |
| `cards-empty-cta` | states | `cards/empty`: Add card pushes the add-card screen. |
| `account-orders-empty` | states | `account/account?orders=none`: the My Orders card shows no items and opens `orders/list`. |
| `noonone-invite-error` | states | `noonone/acceptInviteError`: Got it closes it to the landing. Explore noon One stays in the noon One flow. |
| `orders-pinned-filter` | orders | The header stays pinned while the list scrolls (same y, not covered, white backdrop). Delivered shows only delivered or exchanged orders and hides the active card. Cancelled replaces it. Tapping again restores the list. |

**Running a subset.** Each word after `--` matches a journey whose name contains it or whose area equals it.

- `npm run test:journeys -- cart-coupon`
- `npm run test:journeys -- state sheets`
- `npm run test:journeys -- --list` lists every journey with its area and any known failure.
- `--retry` reruns a failed journey once. A pass on the retry is reported as `flaky`. Use it while other people are saving files: a Vite reload in the middle of a journey resets the in-memory store.
- `--no-a11y` skips the scans.
- `PORT=5182 npm run test:journeys` reuses a running dev server.

**Reading the report.** Each run rewrites `test-results/journeys/report.md` and `test-results/journeys/report.json` for the journeys it ran. The terminal ends with the same summary.

- **Status per journey**:
  - `pass`
  - `fail`
  - `flaky` (passed on the retry)
  - `known-fail` (the journey has a `known` reason and still fails)
  - `unexpected-pass` (it has a `known` reason but now passes; remove `known`)
- **Categories**:
  - **Build / startup**: Vite did not start, the app did not boot (`__NK_NAV__` / `__NK_ROUTES__` missing), or `open()` landed on another route. Fix these first: nothing else is meaningful.
  - **Behavioural**: an `expect()` failed or a control the journey needs is missing. The message says what was expected and what happened. The journey's last screenshot is `<nn>-failure.png`.
  - **Console / page errors**: any `console.error` or uncaught error during a journey. Each one fails its journey, as before.
  - **Visual capture**: no phone viewport found, an empty top layer (a blank frame), a screenshot under 2.5 KB, or a screenshot that threw. These are warnings.
  - **Accessibility**: warnings from the checkpoint scans, de-duplicated across journeys by rule + route + element. The rules:
    - `interactive-no-name`: a button, link, input or role control with no accessible name.
    - `focusable-no-role`: a `tabindex` element with no role.
    - `img-no-alt`: an `<img>` with no `alt` that isn't inside an `aria-hidden` subtree. `alt=""` counts as decorative and is fine.
    - `duplicate-id`: the same id more than once in the document.
    - `focusable-behind-sheet`: the screens under an open sheet are still focusable, because they are not `inert` or `aria-hidden`.
- Exit code 1 means a journey failed (known failures excepted) or there was a startup failure. Visual and accessibility findings never fail the run.

**Adding a journey.** Add `{ name, area, title, async run(page, shot) }` to the default export of the matching `scripts/journeys/<area>.mjs`. If you add a new module, import it in `scripts/journeys.mjs`.

- `open(page, 'flow/screen?x=y', { settle, expectRoute })` opens the route in a fresh app. The DemoStore lives in memory, so every `open` resets cart and wishlist. After the first `open`, navigate with taps only.
- `top(page)` is a locator for the top-most layer (screen, modal or sheet), so lookups never hit screens mounted underneath. `isSheetOnTop(page)` and `scroller(page)` are helpers on it.
- `tap(page, locator, { scroll })` does a finger tap at the element's centre. It scrolls the element into view and waits for it to stop moving. Prefer it to `.click()` on animated chrome.
- `drag(page, locator, dx)`, `scrimTap(page)`, `backTo(page, route)`.
- `waitRoute(page, route | (route, nav) => bool, label)`, `waitFor(fn, msg)`, `expect(cond, msg)`, `nav(page)`.
- `cartBadge(page)`, `money(text)`.
- `shot(label)` saves a checkpoint and runs the accessibility scan. Take one at every state a reviewer would want to see.
- Use resilient selectors: `getByRole` with the accessible name, visible text, `data-*` attributes (`data-route`, `data-testid`, `aria-pressed`, `aria-current`). Match CSS-module classes only by a stable fragment (`[class*=_cartChip_]`). Never use hashes.
- Don't call `history.back()`. The preview keeps the URL with `replaceState`, so browser Back leaves the app. Use the app's Back, Close or scrim.
- If a journey exposes a real app bug, don't work around it. Add `known: '<what is wrong, where, how to fix>'`. The run stays green, the report lists it, and the run flags it as `unexpected-pass` once it's fixed.
- Add a journey for any new flow that changes cross-flow state (cart, wishlist, coupon, membership) or hands off between flows.

### Adding a visual reference

1. Put a PNG **exported from Figma or captured from the real app** in `visual/refs/`. Never use a kit screenshot.
2. Add an entry to `visual/refs/manifest.json`:
   - `name`, `file`, `source` (origin + date), `route` (with query)
   - `select`: CSS selectors; the capture is the union of their boxes
   - `viewport`, `scale`
   - optional `refCrop` and `masks` (prices, counts)
   - `threshold`, `sizeTolerance`
3. Run `npm run visual:ref -- <name>` and read `test-results/visual-ref/report.md` and the `compare.png`. Over threshold is NEEDS-REVIEW for a human (`--accept <name> --by <you> --note <why>`); a new reference image goes in with `--set-ref <name> --from <png> --source "<origin> YYYY-MM-DD"`. See `.claude/skills/noon-ui/references/verify.md`.

The seeded references are `account-action-cards-empty` (Figma 8886:66691, threshold 0.08) and `cart-sticky-footer` (Figma 127:40209, threshold 0.03).
