# Checkout and payment

Checkout turns intent into a paid order with as few decisions as possible. The user needs to confirm where, when and how
they pay, see the final amount, and press one button. Average checkouts are long forms with every option expanded.
Great checkouts open with everything pre-filled from the last order, show each decision as a one-line summary with a
Change affordance, let delivery speed be a priced choice, put wallet / credit as a toggle on top of the payment list,
and end in a single pay button that states the amount.

## References

| App · screen | What it does | Why it's world-class |
|---|---|---|
| [Airbnb · confirm and pay](https://mobbin.com/screens/4379c3ee-9796-4e45-a03b-ef100454134d) | Sections "Payment method" (one bordered row: card logo, "Debit 4320", chevron; accepted brand logos under it), "Coupons" ("Enter a coupon" row), "Price details" (line item, hairline, "Total USD"), legal sentence with linked terms, full-width "Confirm and pay" | Every decision is one row; section titles are the only hierarchy; the legal copy is one sentence directly above the CTA, never a checkbox. The [summary variant](https://mobbin.com/screens/e9da847d-3b16-4b23-a21c-d750ea9dbf06) opens with a booking card (Date, Guests with "Change", Total price with "Details", Free cancellation) and a floating "Review" pill that scrolls to the pay section |
| [Shop · review and pay](https://mobbin.com/screens/13ff0746-f207-408f-8e82-dfefc0f1871b) | Collapsible sections in one card: "Ship to" (saved address with "Default" chip, overflow menu, "+ Use a different address"), "Shipping" (radio options with price and "Estimated delivery Tue, Aug 4 · 3-5 days"), "Plan" (info box "Installments unavailable" with the reason); pinned "Pay now │ $10.82" | Delivery options are priced and dated, so speed is a trade-off the user can read in one glance; the pay button splits label and amount; unavailable options explain why instead of disappearing |
| [Shop · payment methods sheet](https://mobbin.com/screens/14f695fd-1d52-4ed6-a1d5-72cd5ce09355) | Modal "Payment methods" with X; radio "Credit card" (brand logos + "+5") expanded into Card number (lock icon), Expiry, Security code (? icon), Name on card, Nickname (optional); radio "Apple Pay"; "Bill to" collapsed to the saved address; Cancel / Save | New-card entry happens inline under its radio, not on a new page; the billing address defaults to shipping and collapses; field hints are icons, not helper paragraphs |
| [talabat · pay with](https://mobbin.com/screens/f620dd70-aaa0-49a5-94a6-d3e6e602c31a) | Tip chips (QAR 5 / 10 / 15 / Custom), "Delivery instructions" as icon tiles (Call on arrival, Don't ring bell ✓, Leave at reception) with "Use my instructions for this address next time"; "Pay with" opens with "Use talabat pay credit · Available credit: QAR 4.00" toggle above the card radios; orange "Place order" | Credit is a toggle that stacks with a card, not a competing radio; instructions are one-tap tiles with a remember checkbox. The [pay-with list](https://mobbin.com/screens/8d173165-5f03-4472-8954-480b9449ba3d) ends with "Add new card" as a radio row and a "Protected by PCI Data Security Standard" strip |
| [Careem · review and pay sheet](https://mobbin.com/screens/10c17d33-2310-4b5f-90c1-04d10af614b0) | Sheet "Review and pay" with X; "Careem Pay Wallet · Balance 50" toggle on; card row "Personal · To Pay: 950" with "Change"; "Add a new payment method" row; "This payment is protected with Face ID"; "Pay 1,000" | The wallet split is visible: wallet covers 50, the card row says exactly what it will be charged ("To Pay: 950"); the CTA states the amount; the trust line names the actual mechanism (Face ID) |
| [Uber Eats · checkout delivery](https://mobbin.com/screens/a421b21b-0589-46a9-b747-4c2dafc3c7aa) | Delivery / Pickup segmented control with a "Lower fees" tag on Pickup; map with "Edit pin"; rows Home (address), "Meet at my door · Add delivery instructions & photos", phone, "Delivery time 8:04–8:19 PM"; horizontal option cards Priority (+$2.99, "Direct to you"), Standard (selected, bold border), Schedule; "Add $8.77 to save with Uber One" strip; "Next" | Delivery speed is a row of priced cards with the selected one outlined; the address is confirmed visually with a map pin, and the membership upsell is one strip above the CTA with an exact amount |

## What great looks like (the bar)

- Everything pre-selected: saved address, last payment method and the default delivery option are filled in on
  arrival; the user can pay without touching anything (Airbnb, Shop, talabat).
- Each decision is a single summary row (icon or logo, value, Change / chevron); options expand inline or in a sheet,
  never as a full form on the main page (Airbnb, Careem, Shop).
- Delivery options are priced and dated choices: name, time window or date, price or "+ fee"; the selected option has
  a stronger border, not just a radio (Shop, Uber Eats).
- Wallet / credit / points sit at the top of "Pay with" as a toggle with the available balance, and the remaining card
  charge is stated ("To Pay: 950") (talabat, Careem).
- Payment methods are radio rows inside one bordered group: logo, masked number or method name, optional one-line
  explainer, radio trailing; "Add new card" is the last row of the same group (talabat, Careem).
- The pay CTA states the amount ("Pay now │ $10.82", "Pay 1,000"), is pinned full width, and the terms are one sentence
  directly above or below it.
- Price details are two-column rows ending in a bold total behind a hairline; discounts and free delivery show the
  struck original.
- One trust signal near payment, specific not generic: "Protected by PCI Data Security Standard", "protected with Face
  ID".

## Build it with noon

| Element | noon component / token | Note |
|---|---|---|
| Address header / delivering to | flow-local `CheckoutHeader`, `AddressCard`, `DetachedAddress` (`src/flows/checkout/components/`) | One row with Change; edits open the address flow as a sheet |
| Shipment cards with delivery lanes | flow-local `CheckoutShipment` | Lanes are priced, dated choices like Shop's shipping radios; selected lane gets the strong border |
| Option rows (delivery, payment) | `Radio` (Field) inside `ListRow variant="field"` or a `Pressable` row | Radio trailing, logo leading, one-line explainer as subtitle |
| Delivery instructions, receiver | flow-local `DeliveryInstruction`, `ReceiverDetails`, `SavedContact` | Tiles with a "remember for this address" `Checkbox variant="field"` (talabat) |
| Credits / points toggle | flow-local `PaymentMethods` (credits toggle) with `Switch variant="field"`; `PointsVouchers`, `BurnSection` | Toggle first in Pay With, balance under the title; show the remaining card amount |
| Payment methods list | flow-local `PaymentMethods`, `PaymentCard` (saved card + CVV + installments) | Tabby / Tamara / Apple Pay / COD as rows of one group; "Add new card" last |
| New card entry | `AddPaymentCardScreen` as a sheet (`presentation: 'sheet'`, `SheetHeader` / `SheetBody` / `SheetFooter`), `TextField` | Inline under its radio or in a sheet, never a pushed full page for one card |
| Installments | `EmiPlansScreen`, `SpecialEmisScreen` | Unavailable plans explain why (Shop's info box) via `StatusChip variant="field"` |
| Coupons / vouchers | `PointsVouchers`, `CouponStatus`, `VoucherToast` | One row "Enter a coupon" with chevron |
| Payment summary | flow-local `PaymentSummary`, `DynamicInvoice` (checkout) | Two-column rows; struck original on free delivery; total bold |
| noon One upsell | flow-local `NoonOneSection`, `NoonOneCtaReveal`, `EarnCallout` | One strip with an exact saving, above the dock |
| Pay CTA | flow-local `SlideButton` (Checkout 2.0 slide-to-pay dock); generic: `ActionBar layout="leadingTrailing" leading={<Money value={total} bold />}` | Amount always visible in the dock; `Button loading` / `PlacingScreen` while placing |
| Trust / terms line | `Text variant="caption" color="textSecondary"` + `HtmlText` for links | One sentence, near the CTA |
| Failure | `PaymentFailureScreen`, `PaymentFailureHelpScreen` | Keep the cart and selected method; offer a different method in one tap |

## Avoid

- Asking for address, delivery and payment as three full forms in a stepper when saved values exist.
- Wallet / credits as a radio that excludes cards; they combine, so use a toggle and show the split.
- A pay button that says only "Place order" with the total buried in the summary above the fold.
- Hiding unavailable payment or delivery options without a reason.
- Terms acceptance as a mandatory checkbox, or legal text in a long block between the summary and the CTA.
- Delivery options as a plain dropdown without price or arrival date.
- Generic padlock "Secure checkout" badges repeated in several places; one specific trust line is enough.

Last researched: 2026-10-14
