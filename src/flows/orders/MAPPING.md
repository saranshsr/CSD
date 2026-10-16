# Orders — mapping

Screens: `orders/list` (`/orders`), `orders/tracking` (`/order-tracking?orderId=o1`), `orders/cancel`. The cancel screen is the
bappzaar port (`features/o2d/screens/O2DOrderCancelItemsScreen`); list and tracking follow the PDS reference below.

## PDS reference (pds-noon-as.vercel.app one-flows)

Source: `https://pds-noon-as.vercel.app/one-flows?screen=orderlisting` (Account → My Orders → "Arriving today" card), read
2026-10-12 with Playwright + `getComputedStyle` on a 375×812 frame (values below are measured, not eyeballed). Assets
downloaded to `src/assets/orders/pds/` (≈3× display, imported through `src/flows/orders/assets.ts`).

Status: **reuse** = existing kit piece, **flow** = flow-local component / token, **asset** = downloaded file.

### Listing (`orders/list`)

| Section | Reference element (measured) | Kit piece | Token / variant | Status |
|---|---|---|---|---|
| Page | bg `#F9F9FB`; header scrolls with the page (not sticky, no scroll reaction) | `Screen background="bgSubtle"` | `bgSubtle` | reuse |
| Header | 40 back circle (white, 1px `#F2F3F7`), 8 gap, 40 search pill (padding 8/12, gap 8, r full), 20 search icon, 14/500/20 "Search all orders" | `Pressable` circles, `OriginIcon chevron-left / search` | `borderSubtle`, flow type `ordersText14MediumLh20` | reuse + flow type |
| Filter row | padding 4 12 0, gap 6, horizontal scroll; chips 32h, padding 8 (Filter 8/10, gap 4), r8, 1px `#F2F3F7`, 12/600/16; Filter = `preferences` 16 + caret 16 | `Pressable` chips in `.nk-hscroll`, `OriginIcon preferences / caret-down`, `MarketplaceWordmark supermall` (59×14, `#2122B8`), express wordmark (`#1D2539`) | `captionBold`, `borderSubtle`; selected = `primary` border + `filterSelectedBackground` | reuse + asset (`express-wordmark.svg`) |
| Section titles | "Active" / "Order history" 18/700/24, padding-left 4; sections padding 16 12 0 / 24 12 96, gap 12; history cards gap 16 | `Text variant="titleSmall"` | `titleSmall` | reuse |
| Card shell | white, r16, overflow hidden; active card 3px white ring; history shadow `0 4px 12px rgba(0,0,0,.02)`; return card 1px `#F2F3F7` | flow `OrderCard` (in `components/OrderCards.tsx`) | `bgSurface`, flow shadow `ordersCard` | flow |
| Card header strip | `#F9F9FB`, padding 12 10 10 (active) / 12 10 / 10, r16 16 0 0; 16 status disc + 13/20 "**Ordered** on April 16, 2026" (700 colour + 500); express pill 54×16 / 60×18 | flow `StatusHeader`, `MarketplaceTag kind="express"` | `bgSubtle`, flow `ordersText13BoldLh20` / `ordersText13MediumLh20`; cancelled 12/18 (`ordersText12BoldLh18`, `text12MediumLh18`) | flow |
| Status discs | Ordered `#0F7EFF` disc + `order-box-filled` 12 white · Delivered `check-circle-filled` 16 `#0F8857` · Return completed `#101628` disc + `rewind` · Exchanged `#1F7A74` disc + `refresh` · Cancelled 14 `#D92626` disc + `cross` | `OriginIcon` | `primaryBright`, `success`, `textStrong`, `--nk-palette-emerald-green700`, `--nk-palette-danger-red` | reuse |
| Active body | padding 10, gap 12; 57×76 r8 thumb (`#F9F9FB` + `rgba(0,40,136,.03)` tint); "Arriving today" 16/700/22; "1 item · Out for delivery" 13/400/20 `#666D85` (2px dot, gap 6); "On time" 13/700/20 `#0F8857`; 36 chevron circle | flow `Thumb`, `OriginIcon chevron-right` | `section`, `text13RegularLh20`, `success`, flow colour `ordersImageTint` | flow |
| Rider actions | padding 2 10 12, gap 8; 40h buttons, padding 10 16, r10, 1px `#BDDBFF`, 20 icon + 13/600/20 `#0F61FF` | `Button variant="outline"` re-skinned via class (`borderInfo` / `primary`); `OriginIcon call`, WhatsApp | `borderInfo`, `primary`, flow `ordersText13SemiboldLh20` | reuse + asset (`whatsapp.svg`) |
| Delivery PIN | `#F9F9FB` bar, padding 10 12 12 14, r 0 0 14 14; dial-pad 20 + 13/600/20; 6 tiles 20×26, gap 2, r6, `#0F61FF`, 12/700/18 white | flow `PinTiles` | `primary`, `textInverse`, flow `ordersText12BoldLh18` | flow + asset (`delivery-pin.svg`, no Origin dial-pad) |
| History body | padding 10 12 12, gap 12; title 13/400/20 `#475067` 2 lines; price 14/700/20 with dirham sign; 36 chevron | flow `ItemRow` | `text13RegularLh20`, `textMuted`, `text14BoldLh20` | flow |
| Installation badge | 20×20 `#0F7EFF`, radius 8 0 10 0, `installation-filled` 12 white, top-left of the washer thumb | `OriginIcon installation-filled` | `primaryBright` | reuse |
| Rating row | dashed `#EAECF0` 5/5, inset 4; row padding 0 2 0 4; 13/500/20 "What would you rate it?"; 5 × 24 stars, gap 2, outline `#D0D4DD` | `DashedDivider dash={5}`, `OriginIcon star / star-filled` | `border`, `borderStrong`, `starMid` when rated, flow `ordersText13MediumLh20` | reuse |
| Refund chip | padding 4, r8, gradient `#E3FCF2 → #FFF`, `rewind-alt` 16 + 12/600/18 `#0F8857` | flow `NoteChip` | `successSurface`, `success`, flow `ordersText12SemiboldLh18` | flow |
| Warranty chip | gradient `#F2F3F7 → #FFF`, `star-shield` 16 + 12/600/14 | flow `NoteChip` | `bgPage`, `text12SemiboldLh14` | flow |
| Track my refund | 40h full width, padding 10 16, r10, 1px `#BDDBFF`, 12/600/16 `#0F61FF` | `Button variant="outline"` (class) | `borderInfo`, `captionBold` | reuse |
| Qty badge | "x2" padding 1 3 2, r4, `#F9F9FB`, shadow `0 2 8 rgba(14,14,14,.08)`, 12/600/16, bottom-right 4 | flow `Thumb` | flow shadow `ordersBadge`, `captionBold` | flow |
| Refund credited row | 41h, padding 4 6 4 8, r12, `#EDFDFB` + 1px `#E3FCFA`; `currency-note-wave-rewind-circle-filled` 24 `#1F7A74`; 12/700/18 + 11/400/14 `#475067` with a Mastercard mark; chevron 16 `#1F7A74` | flow `RefundRow`, `OriginIcon` | `--nk-palette-emerald50`, flow colour `ordersRefundBorder` | flow + asset (`mastercard.svg`) |
| Chat FAB | 48 circle, 2px `#BBDAFF`, shadow `0 -4px 32px rgba(34,34,34,.12)`, `message` 20 brand blue, right 14 / bottom 22 | `NeedHelpButton collapsed aboveTabBar={false}` as `Screen overlay` | `needHelp` tokens | reuse |

### Details (`orders/tracking`)

| Section | Reference element (measured) | Kit piece | Token / variant | Status |
|---|---|---|---|---|
| Page | gradient `#EAECF0 0 → #F9F9FB 812px`; content padding 16 12 96, gap 16 | `Screen` + flow background | flow `trackingBg` (updated values) | flow |
| Header | 56 row, padding 8 12; 40 back / ⋯ circles (1px `#F2F3F7`); "032983823 - 1" 12/600/16 + `copy` 14; "8 items" 11/500/14 `#666D85` | `Pressable` circles, `OriginIcon chevron-left / horizontal-three-dot-menu / copy` | `captionBold`, `micro` | reuse |
| Image stack | 8-card ring in a 295×116 box: every card 81×108 r10 at (0,0), origin centre; offset 0 → x 107 s 1 · ±1 → 61 / 153 s .852 · ±2 → 15 / 199 s .704 · ±3 → −20.5 / 234.5 s .6 opacity 0. Borders 2px `#FFF` / `#EBEBEB` / `#CCC`, overlays 0 / .08 / .2 black, shadows `0 5.7 34.4 rgba(14,14,14,.12)` (|d|≤1) / `0 2 16 rgba(14,14,14,.08)`; express pill 54×16 under the centre card (top 100) | flow `ImageStack` (rewritten) | `--nk-palette-bright-grey-color`, `--nk-palette-filter-checkbox-border`, `blackAlpha8/20`, flow shadows `ordersStackNear/Far` | flow |
| Stack motion | V1 static; V2–V4 rotate (cards move on a 700 ms critically damped spring) | `supermall.springs.return` (≈0.54 s, no overshoot), interval `ordersTokens.stackRotateMs` | — | flow |
| Status | "OUT FOR DELIVERY · ON TIME" 12/600/18 +0.24 tracking `#666D85`, 3px dot, "ON TIME" 12/800/18 `#0F8857` | flow `.statusLine` | flow `ordersText12SemiboldLh18`, `ordersText12ExtraboldLh18` | flow |
| Headline | "Arriving today" 32/700/40, −0.25 tracking | `.headline` | `ordersText32BoldLh40` (existing) | reuse (flow) |
| Time window (V1) | pill 40h, padding 10 10 10 14, gap 6, white, r full; 14/600/20 + `info-circle` 20 | flow `WindowPill` | `text14SemiboldLh20` | flow |
| Time window (V2–V4) | pill 36h, padding 8 8 8 14, gap 8, 13/600/18; V2/V4 `rgba(255,255,255,.64)` + 1px `.8` white; V3 gradient `#F9AA60 → #FADA99`, 1px `.6` white, glow `0 2 18 rgba(255,190,110,.45)`; message 12/400/18 `#475067` (lead 600 `#1D2539`), max-width 300, top 10; area grows 46 → 92 | flow `WindowPill variant` | `whiteAlpha64/80/60`, `textMuted`, flow colours `ordersHeat*`, `text13SemiboldLh18` (central) | flow |
| Heat backdrops | V2 top wash: radial `#F8C970` .8 + `#FFFCE9` .85 + linear `#F8DFA4` fading by 330px; V4 radial glow `#F5C66D` .46 / `#F5ECC6` .3 at y 307–485 behind the tracker card | flow `HeatBackdrop` | flow `ordersHeatTop`, `ordersHeatGlow` (in `ordersTokens`) | flow |
| Tracker card | white r16; stepper padding 12 12 10; 4 steps (first start / middle centred 102 / last end); 36 circles, done `#F6FEFB` + 1px `#ADF0D5`, pending white + 1px `#EAECF0`; icons `check-circle-filled`, `delivery-box-filled`, `shop-filled` (`#0F8857`), `location-filled` (`#D0D4DD`); labels 12/600/18 `#475067`, dates 11/400/14 `#989FB3`, pending 12/400/18 `#989FB3`; track 2px `#EAECF0` at top 17, fill gradient `#ADF0D5 → #70D6AD` | flow `Stepper` (replaces `Timeline`) | `--nk-palette-pale-mint`, `border`, `textMuted`, `textTertiary`, flow colours `ordersStepDoneBg`, flow `ordersTokens.stepFill` | flow |
| Rider block | inset 4, `#F9F9FB`; row padding 10 12 12, gap 6; 36 white avatar disc (26 art), name 13/600/18, "3,000+ perfect deliveries" 12/400/18 `#666D85`; 36 circles WhatsApp 18 + `call-filled` 20 | flow `RiderRow` | `text13SemiboldLh18`, `text12RegularLh18` | flow + asset (`rider-avatar.svg`, `whatsapp.svg`) |
| Share PIN | dashed `#EAECF0` 4/4 inset 14.5; row padding 12 12 12 16; 13/600/18 + `PinTiles` | `DashedDivider`, flow `PinTiles` | `text13SemiboldLh18` | flow |
| Tracker CTAs | padding 12, gap 10; 48h, padding 14 16, r10, 1px `#EAECF0`, 14/600/20 | `Button variant="secondary"` (class: 48h) | `border`, `text14SemiboldLh20` | reuse |
| Delivering to | section padding 14 12 12, gap 16, r16; title 16/700/20; rows gap 16: 32 `#F9F9FB` disc + `home` / `user-circle` 20, 14/600/20 + 13/400/20 `#666D85`; 13px `#D0D4DD` divider; 36 edit circle `edit-filled`; dashed `#EAECF0`; 2 tiles 62h, padding 10 8, r12, 1px `#F2F3F7`, 24 icon + 14/500/20 `#475067` + 24 checkbox | `Checkbox size={24}`, `Divider vertical`, `OriginIcon door-open-filled` | `text14SemiboldLh20`, `text13RegularLh20`, flow `ordersText14MediumLh20` | reuse + asset (`items-together.svg`) |
| Order summary | section padding 12 12 20, gap 8; title + "Cancel items" 14/600/20 `#D92626` → `orders/cancel`; dashed `#F2F3F7`; items gap 16: 57×76 thumb (tinted, image inset) + express pill 54×16 at the bottom; title 12/500/18 `#666D85` 2 lines; price 16/700/22; notes `rewind-check` / `star-shield` (`#0F8857`) / `rewind-cross` (`#1D2539`) 16 + 12/500/18 | flow `SummaryItem` | `text12MediumLh18`, `section`, `--nk-palette-danger-red` | flow |
| Bill summary | header padding 14 12 16; "Paid with" 12/400/18 `#475067` + Apple Pay mark (1px black box r2.667) + 12/600/18; box 1px `#F2F3F7` r12, padding-top 16, gap 12, rows padding 0 12, 14/500/20 `#475067` labels, 14/600/20 values, struck 14/400/20 `#666D85` | flow `BillSummary` | `text12RegularLh18`, `text14SemiboldLh20`, `text14RegularLh20` | flow + asset (`apple-pay.svg`) |
| noon One strip | 30h, padding 6 6 6 8, r10, `#FFF3C0` + line art (20% screen); 12/700/16 + noon One logo 28×15; 18 chevron disc (`.5` white, 1px `.64` white) | flow strip, `noon-one-logo-{base,text}.svg` (cart, exact match) | `noonOneSurface`, `text12BoldLh16` | reuse asset + asset (`banner-lines.svg`) |
| Coupon / Total | 14/500/20 `#0F8857` + `coupon-discount-filled` 16, "– ⃀ 2.00" 14/600/20; dashed `#F2F3F7` inset 12; "Total paid" 14/500/20 + 18/700/24 amount | `DashedDivider` | `success`, `titleSmall` | reuse |
| Savings footer | 4px zig-zag edge then `#E3FCF2`, padding 12, `#0B623F`: 14/700/18 + 11/500/14 | flow strip | `successSurface`, `--nk-palette-base-green800`, `bodyBold`, `micro` | flow + asset (`savings-zigzag.svg`) |
| Download invoice | padding 0 12 12; 48h, r10, 1px `#EAECF0`, `download` 20 + 14/600/20 | `Button variant="secondary"` | `border` | reuse |
| Chat FAB | same as listing | `NeedHelpButton collapsed` | | reuse |

### States (bappzaar master `features/o2d/screens/O2DOrderTrackingScreen`)

The details page keeps the PDS look, but what each state shows follows O2D. On master it is all server data: the active `timeline[]` step's `status` (`highStatus`, `subStatus`, `highStatusColor`, `cancelReason`), `summary.deliveryMessageTracking`, `trackActions` + `subStatusActions`, `summary.type`, `return_info`, `item.returnable`. The client only picks layout and colour (`o2dOrderTracking{Core,Timeline,Cta,Summary}Selectors.ts`). The kit derives it from `status` in `trackingFor()` (`data.ts`). `orders/tracking` is therefore `truth: 'mixed'`: the PDS look and bappzaar per-state content.

| State (order) | Status line (`O2DOrderTrackingEddBlock`) | Headline | Tracker card | CTA row | Other sections |
|---|---|---|---|---|---|
| Active (`o1`) | `highStatus` · **On time** (`success`) | ETA | delivery timeline, rider, PIN | Reschedule · See all updates | Delivering to (+ receiver, instruction tiles), Cancel items, bill |
| Delivered (`o3`) | DELIVERED · **COMPLETED** | Delivered on … | delivery timeline | Get help · See all updates | Order summary: "Return & exchange available" |
| Delivered, return enabled (`o9`) | same | Delivered on April 18 | same | **Return** (return-details API `buttonType: 'return_submit'`, `o2d_order_return_cta`) · See all updates | Delivered to (address only), item notes, bill |
| Return window closed (`o4`) | same | same | same | Get help · See all updates | item "Return window closed" (`item.returnable` not valid → CLOSED_RETURN_WINDOW) |
| Returned (`o7`, return card) | RETURNED · **REFUNDED** | Returned on … | **return** timeline (Requested · Picked up · Inspected · Refunded) + status message "Refund of … sent to …" | **Track refund** (`view_refund_tracking`, dark #101628 → `text-strong`) · Get help | **Quick actions** (`summary.quickActions`: Return details, Return policy); **no bill** (`isReturnCard`) |
| Exchanged (`o8`) | EXCHANGED · **COMPLETED** | Exchanged on … | **exchange** timeline (Requested · Picked up · Dispatched · Delivered) | Get help · See all updates | warranty note |
| Cancelled (`o5`) | only `cancelReason`, grey ("Cancelled by you") | **red** (`dangerRed` #D92626) | **timeline hidden**; status message "Refund of … credited to …" | Track refund · Get help (history actions dropped: `CANCELLED_EXCLUDED_ACTION_CODE_SET`) | image stack dimmed; "Delivery information" title |

Status message: HTML 13/20 `text-secondary`, bold parts `text-primary`, 14 side padding (`O2DOrderTrackingStatusCard`). Timeline labels and icons are API data on master; the return and exchange sets in `data.ts` (`returnSteps`, `exchangeSteps`) are demo values built from Origin icons.

Actions (`useOrderAction`, after `useO2DOrderTrackingActions`):

| Code | Master | Kit |
|---|---|---|
| `see_all_actions` / `view_shipment_history` | overlay `NoonOrderDeliveryProgressOverlay` (steps newest first) | sheet `orders/updates` ("Delivery progress" / "Return progress") |
| `return_initiate` / Return | push `AFSReturnsReturnSubmissionScreen` (`mpItemNr`) | push `returns/submit` with the order's `returnItem` |
| `view_refund_tracking` | push `OrderRefundDetailsScreen` | return card → `returns/details`; cancelled → toast (not ported) |
| `view_return_details` | deep link `/account/returns/{id}` | push `returns/details` |
| `view_return_policy` | overlay `AFSReturnsPolicyScreen` | toast |
| `contact_customer_support`, `reschedule` | help screen / reschedule overlay | toasts |

Deliberate difference: master draws the returnable note as a chip (gradient `#E3FCF2` → white, 13/600 `#0F8857`). The kit keeps the PDS row (16px icon + 12/500 secondary text), because that is the visual reference for this screen.

### Variants V1–V4 (tabs above the reference frame)

| Ref | What it switches | Ours |
|---|---|---|
| V1 | calm hero: static stack, white "Likely to arrive between 1 pm - 6 pm" pill | `orders/tracking?orderId=o1` (default, `variant=1`) |
| V2 | "hot afternoon" hero: warm wash behind the header and hero, glass pill "Expected today between 11 am - 5 pm" that grows from a dot, letters blur in, heat advice line, stack rotates | `?variant=2` |
| V3 | as V2, but no wash: the pill itself is an orange gradient with a soft glow | `?variant=3` |
| V4 | as V2, but the warmth is a glow behind the top of the tracker card | `?variant=4` |

V2–V4 reload with a skeleton (≈0.4 s) in the reference; ours reveals content on `supermall.reveal` instead. Timeline
measured from the content appearing: pill grows +0.7 s (width/height spring with ≈3% overshoot, opacity 0.2 s), letters
+1.05 s (≈18 ms apart, opacity 0 → 1, blur 6 → 0, y 3 → 0, ≈0.3 s), advice line +2.1 s (blur 6 → 0, y 4 → 0, ≈0.4 s).

### Motion (kit presets)

| Moment | Motion | Haptic |
|---|---|---|
| Listing / details content after the push | `supermall.reveal` (y 12, 30 ms stagger, `ease.soft`) | — |
| Card press | `Pressable` (`spring.press`, scale 0.98) | — |
| Star tap | star pops on `spring.bouncy` (1 → 1.25 → 1), stars up to it fill; review opens after `reviewsMotion.timing.orderStarPushMs` | `tick` |
| PIN tiles | rise in one by one (`handoff.spring`, `handoff.stagger.in`) | — |
| Stepper fill | track fill scales from 0 on `supermall.ease.soft` (`supermall.reveal.move`), step discs pop on `spring.bouncy` as the fill passes | — (none: it plays on mount, before any user gesture, so browsers block vibration) |
| Image stack | V2–V4 rotate on `supermall.springs.return` | — |
| Heat pill | grow `handoff.springs.pop`-like spring (`appleSpring(0.42, 0.78)`), letters `supermall.ease.textIn` | — (plays on mount, see Stepper) |
| Checkbox tiles | press dip `supermall.press`, glyph swap `spring.bouncy` | `tap` |
| FAB | `NeedHelpButton` mount pop (`spring.bouncy`) | — |

### Data

`data.ts` holds the reference orders: o1 active (8 items, PIN 124500, rider Ahmed M. Mohammed, Home · 676D, Downtown,
Dubai, receiver Anurag +971 (0) 412 3456, Apple Pay bill ⃀ 80.60 → 45.60, delivery 7.00, coupon −2.00, total 50.60,
"⃀ 2 saved + ⃀ 2.53 cashback"), o3 delivered washer (returnable), o4 delivered bottle (return window closed), o7 return
completed (AirPods case), o8 exchanged (iPhone 16), o5 cancelled storage bag ×2 (refund to Mastercard XX 5832). Ids o3 /
o4 / o5 keep their meaning for `returns` and `reviews`.

### Review entry

Star tap → `openReview(nav, { orderId, rating })` from `src/flows/reviews/store.ts` after the pop lands; the exchanged
order passes `product: 'iphone16'` (README "Order kinds"). Returned / cancelled orders have no rating row.

## List header and filter pills (bappzaar master `features/o2d/screens/O2DOrdersV2Screen`)

| Master | Value | Kit |
|---|---|---|
| `headerArea` (outside the list, zIndex 10) | pinned; the list scrolls under it | `Screen header` (`.listTop`) |
| `useO2DOrdersListingAnimation` `headerBackdropStyle` | bg antiFlashWhite #F2F3F7 → white over 0–16 px, bottom radius 0 → 10 over 0–16, shadow opacity 0 → 0.1 over 0–20 (slateGray, offset 0 3.2, radius 3.2) | `.headerWhite` / `.headerShadow` opacity + `borderBottom*Radius` from `useScroll` → `useTransform`; `--nk-color-bg-page` screen bg |
| `headerFilterBar` + `O2DOrderHistoryFilterBar` | ps 10 + 2, pt 4, pb 12; gap 6, pe 12 | `.filterRow` |
| `O2DOrderFilterChip` `chip` | 32 high, `borderRadiusRound`, px 9, gap 4, white, 1px lightGreyColor #EAECF0; label 13/600/16 blueGray900 | `.chip` (`--nk-radius-full`, `--nk-color-border`, `--nk-type-text13-semibold-lh16`) |
| `chipSelected` / `labelSelected` | primaryBlue #0F61FF border and label, no fill | `.chip[data-on]` |
| `chipTag` + `logo` (service facets) | px 7, logo 60 × 18 | `.chip[data-logo]`, wordmarks 60 × 18 |

