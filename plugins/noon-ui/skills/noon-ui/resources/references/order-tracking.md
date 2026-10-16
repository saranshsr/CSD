# Order tracking

After paying, the user wants one answer: when will it arrive. Then: where is it now, who is bringing it, and can I
still change something. Average order screens lead with an order number and a status word. Great ones lead with the
arrival time as the headline, show progress as a short fixed stepper, keep the rider and the delivery PIN one tap away,
put the change / cancel actions next to the status, and move the full event history into a timestamped timeline sheet.

## References

| App · screen | What it does | Why it's world-class |
|---|---|---|
| [talabat · live tracking](https://mobbin.com/screens/4418e499-c89b-49ff-8205-9d37c0c6af8a) | Full-bleed map with an "Apartment" destination pin and the rider; a floating card "Arrives in 9 mins" with an "On time" chip, a 4-node progress line with icons (check, store, scooter, pin), "Your order is on the way · Mohammed is on their way to you now" with chevron; rider row with chat and call buttons | ETA is the title, the punctuality chip answers "is it late?", the progress line uses stage icons so it reads without labels; contacting the rider is two icon buttons, not a menu |
| [talabat · order timeline sheet](https://mobbin.com/screens/f0f6b08a-203e-4c0b-9a97-023b309213ab) | Sheet "Here's how your order is going": vertical timeline Order placed → store confirmed → Rider assigned → Rider arrived → Order ready and picked up → Order on the way → Rider dropping off, each done step with a time on the right, current step as a hollow node, future step greyed | The detailed history is one tap away but off the main screen; times are right-aligned for scanning; three node states (done, current, upcoming) without colour noise |
| [Uber Eats · order status](https://mobbin.com/screens/3eedd74f-9224-4cad-bfec-040121ebb5dc) | Map on top; sheet with centred "Picking up your order…", "Now arriving 2:55 – 3:00 PM", segmented progress bar, "Latest arrival by 3:25 PM"; blue "Share delivery PIN" card with digit tiles 5 8 0 9; courier row with car and "Top-rated courier"; "Send a message" field, call and "+ Tip" | Window plus a "latest arrival" promise sets expectations honestly; the PIN is a high-contrast card with large tiles, the most prominent element after the ETA; messaging is an inline field, not a hidden screen |
| [Amazon · order status](https://mobbin.com/screens/6080910d-e873-41da-89f7-10502a194ab0) | "Arriving Wednesday" headline with the product image; card titled "Ordered" with a 4-step stepper (Ordered, Shipped, Out for delivery, Delivered); action buttons "Update delivery instructions" and "Cancel order" in the same card; Address info; "View or Change this order" row | The date is the headline, not the order number; the actions you can still take sit inside the status card, so they disappear naturally as the order moves on |
| [Walmart · order details](https://mobbin.com/screens/da5c3b1c-2ff5-424f-ab22-dd8009a58e7f) | Order number header; card "Delivery · Arrives today by 10pm" with stepper Placed / Preparing / On the way / Delivered; "1 item" collapsed with thumbnail; "Need to make a change?" with "Cancel delivery" and help rows; Delivery address; collapsed Delivery instructions; Payment method below | Clear vertical order: promise, progress, items, change, address, payment; secondary detail is collapsed by default; the "Need to make a change?" heading frames cancel as help, not a red button |
| [Blue Apron · orders list](https://mobbin.com/screens/d1a35bd9-27c7-4dde-b80f-c96699e5a286) | Upcoming / Past orders tabs; "UPCOMING ORDERS" label; card with the date "Sunday, Aug 2" as the title, "Order #B5180578 · 1 item", a tinted stepper block (Confirmed, On the way, Out for delivery, Delivered) with "Estimated delivery: End of day Sun Aug 2", item photo | Active orders in the list already show the stepper and ETA, so most users never need to open the detail; the order number is secondary meta under the date |

## What great looks like (the bar)

- The arrival time or date is the largest text on the screen ("Arrives in 9 mins", "Arriving Wednesday", "Arrives today
  by 10pm"); the order number is small meta, never the title.
- Progress is a fixed 4–5 step stepper or segmented bar, the same steps for every order of the type; the current step
  is visibly distinct (filled vs hollow), labels ≤ 2 words (Amazon, Walmart, Blue Apron, talabat).
- A status sentence under the stepper says what is happening now in plain words ("Mohammed is on their way to you
  now"), and a punctuality signal ("On time", "Latest arrival by 3:25 PM") answers the lateness question.
- Live orders put the rider row (avatar, name, chat + call icon buttons) and the delivery PIN directly under the
  status; the PIN uses large digit tiles on a high-contrast surface (Uber Eats, talabat).
- Actions still possible (update instructions, cancel, change address) live inside or right under the status card and
  disappear when they no longer apply (Amazon, Walmart).
- Full history is a timestamped vertical timeline in a sheet, times right-aligned, future steps greyed (talabat).
- The list shows active orders with stepper and ETA inline; past orders compact (Blue Apron).
- The delivered state flips the headline to the outcome ("Delivered right on time"), completes the stepper and offers
  the next action (rate, reorder) instead of a dead end.

## Build it with noon

| Element | noon component / token | Note |
|---|---|---|
| Orders list | `OrdersListScreen` with flow-local `ActiveOrderCard` / `HistoryOrderCard` (`src/flows/orders/components/OrderCards.tsx`) | Active cards carry status, ETA, rider actions and PIN; history compact with refund / warranty chips and `StarRating` |
| List filters / search | `SearchInput variant="field"`, `Pill variant="fieldChip"` in a `PillRow` | Status chips, not tabs, when there are more than two states |
| Status header (disc + word + ETA) | flow-local `StatusHeader` (`size="active" \| "regular" \| "compact"`) | ETA is the headline; order number as `Text variant="caption"` meta |
| Delivery window / heat | flow-local `WindowPill` (V1–V4 heat variants) | The noon equivalent of "On time" / "Latest arrival by" |
| Stepper tracker | flow-local `Stepper` (`step`, `dates`, `enRoute`, `gray`) | Fixed steps from `trackingSteps`; don't invent per-order steps |
| Delivery PIN | flow-local `PinTiles` | Rise-in tiles on the move spring; keep it right under the status |
| Rider row | `ListRow variant="field"` with `IconButton variant="fieldDefault"` for chat / call | Two icon buttons, no overflow menu |
| Item stack | flow-local `ImageStack`, `Thumb` | Collapsed by default when > 1 item |
| All updates timeline | sheet (`presentation: 'sheet'`) with `SheetHeader` / `SheetBody` | Origin sheet with grabber, no close button; times right-aligned `Text variant="caption"` |
| Change / cancel | `OrderCancelScreen`; actions as `Button variant="fieldSecondaryNeutral" fieldSize="H36"` in the status card | Frame as "Need to make a change?", not a red primary |
| Bill summary | flow-local `BillSummary` (with the noon One strip) | Below address, collapsed detail |
| Delivered moment | `Lottie` (order confirmed / box), then rate via the reviews flow | Headline becomes the outcome |
| Express / marketplace label | `ExpressBadge` / `MarketplaceTag` | Outside the product ETA slot (memory rule) |

## Avoid

- "Order #123456789" or "Processing" as the headline; lead with the arrival.
- A stepper with 7+ tiny labelled steps on the main screen; put that granularity in the timeline sheet.
- Hiding the PIN or rider contact behind a "Details" button while the rider is minutes away.
- Cancel as a red primary button at the bottom of a long page; place it with the status while it is possible.
- Colour-only step states; use filled / hollow / greyed nodes so they survive grayscale.
- Showing the map for orders without live tracking; a static map with no rider is noise.
- Promo modules above the status; upsell goes below the order information (talabat and Uber Eats both keep it under).

Last researched: 2026-10-14
