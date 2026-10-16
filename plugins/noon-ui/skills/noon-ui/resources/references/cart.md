# Cart

The cart answers three questions at once: what am I buying, how much will it cost, and what am I one step away from (free
delivery, a discount, a free item). Average carts list lines and a total. Great carts keep every line editable in place
with a compact stepper, turn the next threshold into a concrete amount with a progress cue, show savings as their own
line and not as small print, and pin one checkout CTA that already carries the total.

## References

| App · screen | What it does | Why it's world-class |
|---|---|---|
| [Instacart · cart](https://mobbin.com/screens/7a0bfe43-0c19-419e-91cc-24f207ff3e48) | Store row with subtotal and a green "Delivery by 8:32–9:02am" window; a "Buy $25, get $5 off · Add $21.86 to get this offer" strip with an "Eligible items" pill; lines with a pill stepper (trash icon at qty 1, "2 ct" label), sale price over struck price, "Replace with best match" and "Edit instructions" links; a "Deals on related products" rail with + buttons; "$0 delivery fee with Instacart+ and saving $7.74" above a full-width "Go to checkout" with the total in a chip inside the button | The offer gap is a number ("Add $21.86"), not a vague nudge; the stepper changes its leading glyph from − to trash at 1 so removal needs no extra button; the savings sentence sits directly above the CTA, the last thing read before tapping |
| [talabat · mart cart](https://mobbin.com/screens/b4d8f566-28a7-46a0-9552-c1200a4b6e81) | "+ Add items" pill in the header; a free-item unlock card ("Add an eligible item and get this free"); line with − 1 + stepper and a "Save 20%" chip; "Payment summary" where Discount and Free delivery ("Welcome gift" tag, struck QAR 10.00) are highlighted; a progress bar "Add QAR 19.60 and get QAR 20.00 off" sits right above the Checkout button | Savings are rendered as their own highlighted rows inside the summary, so the user sees the value before the total; the next-threshold progress bar lives in the sticky footer, visible at every scroll position |
| [Amazon · shopping cart](https://mobbin.com/screens/136ec09d-4587-4c6c-bab3-40257fa39e7b) | Subtotal and "Add $18.50 of eligible items … to get FREE delivery" at the top, then "Proceed to checkout (1 item)"; lines with a selection checkbox, "Limited time deal" + "-25%" badge, struck List price, delivery date, In Stock; stepper with trash, then Delete / Save for later / Compare / Share as outline pills | Item count is in the CTA label; per-line secondary actions are demoted to quiet outline pills so the stepper stays the one obvious control; delivery promise is printed on every line |
| [Uber Eats · cart](https://mobbin.com/screens/2307b55d-35c1-4a2e-a1ab-9bb136e407e0) | Line with customisations listed as label/value pairs, a grey pill stepper (trash · 1 · +), an "+ Add items" pill under the lines, "Offers for you" card, "Gift for Sam" row, Subtotal row, black "Go to checkout" | Extremely short: one line group, one upsell card, one subtotal, one CTA. Fees are deferred to checkout instead of a half-known total; "Add items" is placed where the list ends, exactly where the thumb is after reviewing |
| [Target · cart summary](https://mobbin.com/screens/8ac1f657-3836-46f0-bd68-a0dcf1703ae8) | Large "Cart" title with "$43.74 subtotal • 6 items" under it; a collapsible "Order summary" headed by the bold total; Discounts in red with the reason under it ("$4.49 price on select Oreo cookies"); Same Day Delivery "Free"; info icon on fees; red "Check out" above the tab bar | Each discount explains itself in a sub-line; the summary leads with its answer (total) and expands for detail; subtotal and count are in the title area, so the header alone tells the story |

## What great looks like (the bar)

- One primary CTA, pinned to the bottom, full width, with the total (or item count) inside or directly beside the label;
  nothing else in the footer competes with it (Instacart, talabat, Uber Eats).
- The stepper is compact (pill ≈ 32–36 tall, ≤ 110 wide), sits on the line's trailing edge, and swaps − for a trash
  glyph at quantity 1, so there is no separate Remove button on the line (Instacart, Uber Eats, Amazon, talabat).
- Every threshold is a specific amount to add plus a progress cue: "Add QAR 19.60 and get QAR 20.00 off", "Add $21.86 to
  get this offer"; the strip lives either just above the CTA or at the top of its group, never mid-list.
- Savings get their own row or sentence in the success colour (talabat's highlighted Discount / Free delivery rows,
  Instacart's "saving $7.74"), and struck "was" prices are shown next to the paid price on lines and fees.
- Each line shows: image ≈ 56–72, two-line title, paid price bold over struck price, one status chip at most
  ("Save 20%", "-25%"), stepper. Secondary actions (save for later, delete, compare) are quiet text or outline pills.
- Summary rows are two-column label / amount, 14–15 regular, total row bold and separated by a hairline; fees carry an
  info icon instead of a paragraph (Target, talabat).
- Upsell is a single horizontal rail with quick-add +, placed after the lines, never between them (Instacart,
  talabat, Uber Eats).
- "Add items" / continue shopping is a small pill near the lines or header, not a second full-width button.

## Build it with noon

| Element | noon component / token | Note |
|---|---|---|
| Shipment groups (express, supermall, global, market) | flow-local `CartGroup` (`src/flows/cart/components/`) | One card per fulfilment; the group header carries the delivery promise like Instacart's store row |
| Free-delivery / threshold progress | `GroupProgressBar` (`message`, `current`, `threshold`, `showButton`, `onAdd`) | Message must name the amount ("Add {currency}19 more for free delivery"); keep it at the group top or in the footer, not both |
| Cart line | `CartItem` (`src/flows/cart/components/CartItem.tsx`) with `Price` / `Money`, `ProductImage` | Paid price bold, struck was price via `Price`; prices use `currency` from `src/data`, never "AED" |
| Quantity control | `QuantityStepper` (shared) / flow-local `QuantitySelector` | Trash at qty 1; no separate remove button |
| Line chips ("Save 20%", deal, low stock) | `StatusChip` (`variant="field"` for Origin screens), `CouponTag`, `DiscountTags` (cart) | One chip per line; savings in `var(--nk-color-success)` (Field screens: `var(--nk-field-text-success)`) |
| Delivery promise per line / group | `EtaBadge` + `etaFor(product)`; `ExpressBadge` outside the ETA slot | Follow the ETA default (memory: EtaBadge in the product delivery slot) |
| Upsell rail | flow-local `CartCarousel` + `SkuCard look="cart"` / `QuickAdd` | After the groups, one rail per context (offers, wishlist) |
| Coupon entry, best-price strip | flow-local `CouponInput`, `couponTray/`, `PaymentOffers` | One row with chevron, like Airbnb/Uber "Add promo code" |
| Free gift unlock | flow-local `FreeGifts` | talabat's free-item card is the bar: what you get, what unlocks it |
| Summary | flow-local `DynamicInvoice` | Two-column rows, savings rows in success colour, total `Text variant="section"` |
| Sticky checkout | flow-local `CartFooter` / `CartGlassFooter` (savings tab + total + Checkout); generic: `ActionBar layout="leadingTrailing" leading={<Money … />}` | Savings sentence sits on top of the CTA (`ActionBar top`), total beside the label |
| noon One nudge | flow-local `NoonOneNudge`, `useMembership()` | One line above the CTA, like Instacart's "$0 delivery fee with Instacart+" |
| Undo after remove / move to wishlist | `nav.toast(title, { action })` (Origin M-Toast) | Never a confirm dialog for removing a line |
| Cross-flow cart state | `useDemoStore()` | Never local cart state in the screen |

## Avoid

- Two full-width CTAs (Checkout + Continue shopping) of equal weight; "Add items" is a pill, checkout is the button.
- A Remove / Delete button on every line next to the stepper; use the trash state of the stepper.
- "You're close to free delivery!" with no amount, or a progress bar without the remaining amount in words.
- Savings only implied by struck prices; say the total saved once, in the success colour, near the CTA.
- A summary that lists estimated taxes and fees the cart cannot know yet; defer them to checkout (Uber Eats shows
  subtotal only).
- Upsell rails between cart lines, or more than two rails before the summary.
- Coupons, gift options and payment offers as three separate cards; group them as rows in one section.

Last researched: 2026-10-14
