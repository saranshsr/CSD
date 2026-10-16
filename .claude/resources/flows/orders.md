# orders: flow brief

Read with `../screens.md` and `src/flows/orders/MAPPING.md`. This brief reflects the branch as of 2026-10-13. The flow is a rewrite on this branch: `Timeline`, `OrderThumbs` and `StatusTag` were removed, and `Stepper`, `StatusHeader`, `ImageStack` and others were added.

## Screens

| Route | Built from | Notes |
|---|---|---|
| `orders/list` | PDS `pds-noon-as.vercel.app/one-flows?screen=orderlisting` (+ bappzaar O2DOrdersV2Screen) | URL `/orders`; filter pills; active + history cards |
| `orders/tracking` | PDS one-flows V1–V4 (+ O2DOrderTrackingScreen) | `?orderId=o1&variant=1..4`; V2 top wash, V4 glow; stack rotates only when active and variant ≠ 1 |
| `orders/updates` | bappzaar NoonOrderDeliveryProgressOverlay | sheet: the timeline newest first ("Return progress" on return cards) |
| `orders/cancel` | bappzaar O2DOrderCancelItemsScreen | refund banner, reason picker with spring height, red outline on a missing reason |

**Truth.** `orders/list` sets `truth: 'reference'`; `orders/tracking` is `mixed` (PDS look, per-state content from bappzaar O2D, MAPPING.md → States). For the list: PDS is what was measured (Playwright `getComputedStyle` at 375×812), bappzaar only supplies data and behaviour. Their `source` strings also name bappzaar paths, so without the explicit field `screenTruth` would infer `bappzaar`. `orders/cancel` is a bappzaar port.

## Data (`src/flows/orders/data.ts`; there is no store)

- `Order` holds:
  - status, statusWord, step (0..3) and stepDates
  - the image stack, PIN, rider
  - window / heatWindow, marketplace, bill
  - optional `reviewProduct`
- Helpers:
  - `orderById`, `activeOrders`, `historyOrders`
  - `orderFilters` + `matchesFilter`
  - `heroVariant`, `heatAdvice`, `cancelReasons`
- **Stable ids used by other flows**:
  - o1: active
  - o9: delivered, return enabled (Return → `returns/submit`)
  - o3, o4: delivered; reviews opens bike and iPhone from these
  - o5: cancelled
  - o7: returned
  - o8: exchanged, with `reviewProduct: 'iphone16'`
- Returns and reviews depend on these meanings. Don't renumber them.

## Per-state details (`trackingFor` in `src/flows/orders/data.ts`)

`orders/tracking` renders each state the way bappzaar O2D does. The table is in `src/flows/orders/MAPPING.md` → States.

- `trackingFor(order)` returns the status line (highStatus · badge + tone), the headline tone, the timeline kind (`delivery | return | exchange | null`), the status message, the CTA row, Quick actions, `returnCard` (no bill) and the delivery card title.
- Add a state by adding a `case`. Add an order by giving it `status` plus the fields that state reads: `returnItem` (Return CTA), `refund` (refund message), `cancelReason` (cancelled status line), `returnPolicy: 'available' | 'closed' | 'none'` (item notes).
- `useOrderAction` in the screen maps action codes to navigation. Never hard-code a CTA.
- **o9** is the delivered order with returns enabled. Its fridge resolves in the returns flow (`resolveProduct` includes `pdsProducts`; `orderIdFor('pds-fridge')` is `o9`).

## Components (`src/flows/orders/components/`)

- `StatusHeader({ order, size })`
  - Lookup table per status for the disc, icon and express tag.
  - The tag is 16 high on active and cancelled cards, 18 otherwise.
- `ActiveOrderCard`
  - Rider Call / WhatsApp actions show toasts, and the card shows PIN tiles.
  - A tap opens tracking.
- `HistoryOrderCard`
  - "Track my refund" opens `returns/details`.
- `Stepper({ step, dates, enRoute?, gray? })`
  - A 4-step tracker. Disc centres sit at fixed fractions of 301 (5, 100, 201, 301), with en route at 275.
  - The fill scales from 0 to 1 on `supermall.ease.soft`.
  - Done discs pop on `spring.bouncy`.
  - `gray` is for cancelled orders.
- `ImageStack`: an 8-card ring that rotates every `ordersTokens.stackRotateMs` on `supermall.springs.return`.
- `WindowPill`
  - V1 is a white pill; V2–V4 are heat pills. V3 adds a gradient and glow.
  - It grows on `appleSpring(0.42, 0.78)`, and its letters blur in.
- `PinTiles`, `Thumb`, `BillSummary`. The noon One strip in `BillSummary` opens `noonone/landing`.
- `StarRating`: a tap fires a `tick` haptic, then calls `openReview` from `src/flows/reviews/store.ts`. This is the only cross-flow call.

## Motion (`src/flows/orders/motion.ts`)

- `reveal(i, on)` reuses `supermall.reveal`: each block rises at `delay + i·stagger` on `ease.soft`.
- `pressDip` reuses `supermall.press`.
- A filter change re-keys the list and cross-fades it on `handoff.fade`.
- Reuse these for any new post-order screen rather than adding new springs.

## Haptics

Only `tap` (card / tracking presses) and `tick` (star tap) fire. Stepper and heat-pill animations play on mount, before any user gesture, so they deliberately have no haptic (browsers block vibration then).
