# Orders — flow specification

The contract an orders build must meet. Everything here was read from `src/flows/orders/` on 2026-10-13 (verified) unless marked *assumption*. Measurements are PDS points on a 375pt frame (the kit device is 390pt; keep paddings and let widths flow). Full measurements and token mappings: `src/flows/orders/MAPPING.md`. Motion values: `../noon-ui/references/motion.md` and the flow-by-motion table in `../noon-ui/references/motion-matrix.md`.
<!-- planned: ../noon-ui/references/motion-matrix.md -->

## Screens

| Route | URL | Presentation | What it is | Truth | Status |
|---|---|---|---|---|---|
| `orders/list` | `/orders`, `/orders/list` | screen (push); parent `account/account` | My orders: pinned header, filter chips, Active + Order history | `reference` | exists |
| `orders/tracking` | `/order-tracking`, `/orders/tracking` | screen, `defaultParams { orderId: 'o1' }`, `?variant=1..4` | Order details / tracking, per-state content from `trackingFor` | `mixed` | exists |
| `orders/updates` | `/orders/updates` | sheet, `{ orderId: 'o3' }` | All updates: the order's timeline newest first | `bappzaar` | exists |
| `orders/cancel` | `/orders/cancel` | screen, `{ orderId: 'o1' }` | Select items to cancel: checkbox cards, reason picker, refund banner | `bappzaar` | exists |

The flow has no tab bar; `parent: 'account/account'` makes Back work when a screen is opened by URL. All screens are lazy (`lazyScreen`).

## Anatomy

### `orders/list` (`OrdersListScreen.tsx`)

`<Screen ref background="bgPage" safeTop={false} header overlay>`; the scroll container ref feeds `useScroll`.

| # | Part | Kit | Spec |
|---|---|---|---|
| 1 | Header backdrop (pinned) | `.listTop` with `.headerWhite` + `.headerShadow` `motion.span`s | bappzaar `useO2DOrdersListingAnimation`: white opacity 0 → 1 and bottom radius 0 → 10 over 0–16px of scroll, shadow 0 → 1 over 0–20px, over `--nk-color-bg-page` |
| 2 | Search row | `Pressable` 40 circle (`OriginIcon chevron-left`) → `nav.back`; search pill (`OriginIcon search`, "Search all orders") → toast | reveals `reveal(0)` |
| 3 | Filter row | `.filterRow nk-hscroll`: "Filter ▾" chip (`preferences` + `caret-down`, toast) + `orderFilters` chips: Delivered · Cancelled · Returns · supermall (`MarketplaceWordmark kind="supermall"`) · express (`MaskIcon` `art.expressWordmark`) | chip 32 high, `--nk-radius-full`, 1px `--nk-color-border`, `--nk-type-text13-semibold-lh16`; selected = primary border + label (`data-on`); `pressDip`; tap again clears |
| 4 | "Active" | `ActiveOrderCard` per `activeOrders` (filtered) | 3px white ring; `StatusHeader size="active"`; `Thumb`; ETA 16/700 + "N items · status"; "On time"; chevron; `Button variant="outline"` Call rider / Chat with rider (toasts); Delivery PIN bar with `PinTiles`. Card tap → tracking. Hidden when a filter excludes it |
| 5 | "Order history" | `HistoryOrderCard` per `historyOrders` (filtered) | `StatusHeader` (regular for delivered, compact otherwise); item row (`Thumb` with qty / installation badge, title, refund or warranty chip, price for delivered / exchanged) → tracking; returned: "Track my refund" outline button; cancelled: "Refund credited" row (toast); delivered / exchanged: `StarRating` |
| 6 | Empty filter result | inline `.empty` | `OriginIcon order-box` 40, "No orders match this filter", "Try another filter or clear it to see all your orders" |
| 7 | Chat FAB | `NeedHelpButton collapsed aboveTabBar={false} label="Chat with us"` as `Screen overlay` | toast "Connecting you to support…" |

### `orders/tracking` (`OrderTrackingScreen.tsx`)

`<Screen background="bgSubtle" safeTop={false} contentStyle={{ background: ordersTokens.trackingBg }} overlay={NeedHelpButton}>`; no `Header` (custom row inside the scroll).

| # | Part | Kit | Spec |
|---|---|---|---|
| 0 | Heat backdrop | `.backdrop` div | active + `variant=2`: `ordersTokens.heatTop` wash masked by 1100px; `variant=4`: `ordersTokens.heatGlow` at top 307, 178 high |
| 1 | Header row | `.trackHeader`: back circle, order number + `copy` icon (clipboard + toast "Order number copied"), "N items", ⋯ circle (toast) | `reveal(0)` |
| 2 | Hero | `ImageStack` (8-card ring, `rotate` when active and variant ≠ 1, `express`, `dim` when cancelled) → status line (`highStatus` · badge with `data-tone`) → `h1.headline` ETA (32/40, red when `titleTone: 'danger'`) → `WindowPill` (active only; V1 white, V2–V4 heat pill + advice) | `reveal(1)`, `reveal(2)` |
| 3 | Tracker card | `Stepper` (when `t.timeline`; `stepsFor(kind)`) → status message (`richText`, `**bold**`) → `RiderBlock` (avatar, name, deliveries, WhatsApp + call circles, dashed divider, "Share delivery PIN" + `PinTiles`) → CTA row of `Button variant="secondary"` from `t.actions` (Track refund dark) | `reveal(3)` |
| 4 | Delivering to | `DeliveringTo` (title from `t.addressTitle`: Delivering to / Delivered to / Delivery information): address row (`home`), receiver row (`user-circle`, `Divider vertical`, edit circle → toast) and two checkbox tiles "Get items together" / "Leave at the door" (`Checkbox size={24}`, `spring.bouncy` glyph swap, `pressDip`) — receiver and tiles only while active | `reveal(4)` |
| 5 | Order summary | title + "Cancel items" (active only) → `orders/cancel`; `DashedDivider`; per item `Thumb` (express pill) + title + price (`currency` + `money2`) + notes: Return & exchange available · warranty · Return window closed · Cannot be exchanged or returned | `reveal(5)` |
| 6 | Bill summary | `BillSummary` (Paid with Apple Pay, rows, noon One strip → `noonone/landing`, coupon, Total paid, savings zig-zag footer, Download invoice → toast) — hidden on return cards | `reveal(6)` |
| 7 | Quick actions | rows from `t.quickActions` (return card: Return details, Return policy) | `reveal(6)` |

Per-state content (`trackingFor` in `data.ts`; source table in `MAPPING.md` → States):

| Order | Status line | Timeline | Message | CTAs | Other |
|---|---|---|---|---|---|
| o1 active (out for delivery) | statusLabel · **On time** | delivery, en route | — | Reschedule · See all updates | rider, PIN, receiver, tiles, Cancel items, `WindowPill` |
| o3 delivered | Delivered · **Completed** | delivery | — | Get help · See all updates | "Return & exchange available" |
| o9 delivered, return enabled | same | delivery | — | **Return** · See all updates | Delivered to (address only) |
| o4 delivered, window closed | same | delivery | — | Get help · See all updates | "Return window closed" |
| o7 returned | Returned · **Refunded** | return | refund sent | Track refund · Get help | Quick actions, no bill |
| o8 exchanged | Exchanged · **Completed** | exchange | — | Get help · See all updates | warranty note |
| o5 cancelled | cancelReason only (muted) | none | refund credited | Track refund · Get help | red headline, dimmed stack, "Delivery information" |

### `orders/updates` (`UpdatesSheet.tsx`)

Bare sheet content (no `Screen`): title "Delivery progress" or "Return progress" (by `trackingFor(order).timeline`), ordered list of `stepsFor(kind)` reversed; done rows get `check-circle-filled` in `success` and their date, pending rows a grey dot. Rows `reveal(i)`.

### `orders/cancel` (`OrderCancelScreen.tsx`)

`<Screen background="bgSubtle" header={<Header title="Select items to cancel" variant="transparent" />} footer>`; content padding 8 15 24, gap 10.

| # | Part | Spec |
|---|---|---|
| 1 | Item cards | `motion.div layout`: `ProductImage` 64 r8, title, price, round checkbox (scale pulse); selecting expands (spring damping 20, stiffness 200) a `DashedDivider`, "Why do you want to cancel this item? *" + "Required", radio rows from `cancelReasons`, textarea for "Other" |
| 2 | Missing reason | after a confirm with a selected item and no reason: 1px `danger` outline on the card |
| 3 | Footer | refund banner ("⃀ N refund will be initiated to {paidWith}", fades up while > 0) + `Button variant="secondary" size="lg"` "Cancel all items" and `Button variant="checkout" size="lg"` "Cancel selected (N)" (disabled with none) |

## Navigation

| From | Action |
|---|---|
| Account → My Orders card | `nav.push('orders/list')` (`src/flows/account/components/ActionCards.tsx`) |
| Checkout confirmation → View order | `nav.reset('orders/list')` (`src/flows/checkout/ConfirmationScreen.tsx`) |
| Reviews submit / exit | `nav.reset('orders/list')` (`src/flows/reviews/store.ts`) |
| Returns details → Order summary row | `nav.push('orders/tracking', { orderId: orderIdFor(product.id) })` |
| List back / tracking back | `nav.back` (no history → `account/account`) |
| Active or history card | `nav.push('orders/tracking', { orderId })` |
| Star tap | `openReview(nav, { orderId, rating, product? })` after `reviewsMotion.timing.orderStarPushMs` |
| History "Track my refund" | `nav.push('returns/details')` |
| Tracking CTA / quick action | `useOrderAction`: `see_all_actions` → `nav.sheet('orders/updates', { orderId })`; `return_initiate` → `nav.push('returns/submit', { orderId, productId })`; `view_return_details` → `nav.push('returns/details')`; `view_refund_tracking` → `returns/details` on return cards, else toast; `view_return_policy`, `reschedule`, support → toasts |
| Cancel items | `nav.push('orders/cancel', { orderId })` |
| Bill noon One strip | `nav.push('noonone/landing')` |
| Cancel confirm | toast (`tone: 'success'`) + `nav.back` |
| Search, Filter, ⋯, invoice, rider call / chat, edit receiver, FAB | toasts (demo only) |

## State

- **No store.** Orders are static: `orders` in `data.ts`, with `activeOrders` / `historyOrders`, `orderById(id)` (falls back to o1).
- List: `filter` (`OrderFilter`, local `useState`) → `matchesFilter`; `swapped` turns the first reveal off after the first filter change.
- Tracking: `heroVariant(params.variant)`; delivery-instruction tiles are local `useState` (not persisted).
- Cancel: `selected` (`productId → reason | null`), `showErrors`; refund = Σ price × qty of selected items. Cancelling does **not** change the order (*demo; nothing persists*).
- Cross-flow: `openReview` (`src/flows/reviews/store.ts`) is the only store call.

## States

| State | How it opens | Status |
|---|---|---|
| Active / delivered / return-enabled / window closed / returned / exchanged / cancelled | `orders/tracking?orderId=o1 / o3 / o9 / o4 / o7 / o8 / o5` | exists |
| Hero variants V1–V4 | `?variant=1..4` (active order only) | exists |
| Empty filter result | inline in `orders/list` after a chip with no matches | exists (inline, not a route) |
| No orders at all (empty list) | — | **does not exist**; build as `orders/empty` with `defaultParams: { state: 'empty' }` |
| Loading | — | **does not exist**; content reveals on `supermall.reveal` instead of a skeleton (the PDS reference shows ≈0.4s skeleton on V2–V4) |
| Error | — | **does not exist**; reuse the categories `ErrorView` pattern if needed |
| Cancel success | toast + back | exists (no success screen) |
| Refund details, invoice, reschedule, return policy | toasts | **not ported** (bappzaar `OrderRefundDetailsScreen`, `AFSReturnsPolicyScreen`) |
<!-- planned: orders/empty -->

## Data

- `src/flows/orders/data.ts`: `Order` (status, statusWord, statusLabel, date, eta, items, itemCount, step 0..3, stepDates, stack, pin, rider, window / heatWindow, marketplace, address, receiver, bill, refund, refundChip, warrantyChip, refundCredited, returnItem, cancelReason, reviewProduct), `trackingFor`, `stepsFor` (`trackingSteps`, `returnSteps`, `exchangeSteps`), `orderFilters` + `matchesFilter`, `heroVariant`, `heatAdvice`, `cancelReasons`, `money` / `money2`, `pdsProducts` (catalogue `pds-*` products from `src/data`).
- Assets: `src/assets/orders/pds/` via `src/flows/orders/assets.ts` (`art.*`: wordmarks, rider avatar, WhatsApp, PIN, Apple Pay, Mastercard, zig-zag, product photos).
- Prices: `currency` (dirham sign) + `money2`; never "AED".
- Copy is inline in the components (no `t` object yet); new copy goes in `data.ts`.

## Design sources

| Area | Source | Recorded |
|---|---|---|
| List + tracking look | PDS one-flows (`orderlisting`, details tabs V1–V4), measured with `getComputedStyle` at 375×812 | read 2026-10-12 (`MAPPING.md`) |
| List header pinning, filter chips | bappzaar master `features/o2d/screens/O2DOrdersV2Screen`, `useO2DOrdersListingAnimation`, `O2DOrderFilterChip` | `MAPPING.md` → "List header and filter pills" |
| Per-state tracking content, actions | bappzaar master `features/o2d/screens/O2DOrderTrackingScreen`, `useO2DOrderTrackingActions` | `MAPPING.md` → "States" |
| Updates sheet | bappzaar `features/o2d/components/NoonOrderDeliveryProgressOverlay` | `index.ts` `source` |
| Cancel | bappzaar `features/o2d/screens/O2DOrderCancelItemsScreen` | `index.ts` `source` |

No `verified` date is set on any orders `ScreenDef` yet.
<!-- external: features/o2d/screens/O2DOrdersV2Screen, features/o2d/screens/O2DOrderTrackingScreen, features/o2d/screens/O2DOrderCancelItemsScreen, features/o2d/components/NoonOrderDeliveryProgressOverlay -->

## Motion

| Moment | Kit |
|---|---|
| Content after the push | `reveal(i)` (`src/flows/orders/motion.ts`) = `supermall.reveal`: y 12, delay 0.4 + i × 0.03, `supermall.ease.soft` |
| Chip / tile press | `pressDip` = `supermall.press` (96% at 30%, 340ms) |
| Filter change | list re-keyed, `AnimatePresence mode="popLayout"` cross-fade on `handoff.fade.io` / `handoff.easeInOut` |
| List header on scroll | `useScroll` → `useTransform` (0–16 / 0–20px) |
| Card press | `Pressable scale={0.98}` (`spring.press`) |
| Star tap | pop `spring.bouncy` (1 → 1.25 → 1), haptic `tick` |
| PIN tiles | rise one by one (`handoff.spring`, `handoff.stagger.in`) |
| Stepper | fill scales on `supermall.ease.soft`, discs pop on `spring.bouncy` |
| Image stack | rotate every `ordersTokens.stackRotateMs` (1900) on `supermall.springs.return` |
| Heat pill | grows on `appleSpring(0.42, 0.78)`, letters blur in on `supermall.ease.textIn` (`ordersTokens.heat` timeline) |
| Cancel reason picker | height spring (damping 20, stiffness 200); refund banner opacity + y 8 |
| Sheet | `presentation: 'sheet'` (`spring.sheet`) |

## Acceptance

- [ ] Routes registered; `/orders` and `/order-tracking` open; `check:routes` clean.
- [ ] Order ids keep their meaning (o1, o3, o4, o5, o7, o8, o9); new states are a new order + `trackingFor` case.
- [ ] List header is pinned and turns white with a radius 10 bottom and shadow over the first 16–20px.
- [ ] Every CTA is an action code through `useOrderAction`; every press navigates, opens a sheet or toasts — nothing dead.
- [ ] Prices with `currency`; tokens only (`lint:tokens` 0 for `src/flows/orders`); new measured values are `orders*` tokens with a `MAPPING.md` row.
- [ ] Motion only from `motion.ts` / presets; haptics only on gestures.
- [ ] Screenshots read for list (top + scrolled), tracking o1 V1–V4, o3, o5, o7, o9, updates sheet and cancel with a selected item.
- [ ] `source` and `truth` set on every new `ScreenDef`.
