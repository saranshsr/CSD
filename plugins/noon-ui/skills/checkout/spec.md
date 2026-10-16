<!-- planned: checkout/loading, checkout/error -->
# Checkout — flow specification

The contract a checkout build must meet. Measurements are Figma points on a 375pt frame (the kit device is 390pt with a 54 status bar; widths are fluid, so cards stretch and the header sits 7px lower). Full measurements and token mappings: `references/figma-cart-checkout.md` §2.3 and `src/flows/checkout/FIGMA-MAPPING.md`.

## Screens

Every screen also opens at `/checkout/<id>`; the flow opens at `/checkout`.

| Route | Path | Presentation | What it is | Status |
|---|---|---|---|---|
| `checkout/checkout` | `/checkout` | push (from cart) | All flows Checkout (`Af34gfmhQ1D0wstXUEHSIF · 127:44077`), sections from `ALL_FLOWS_SECTIONS`; Checkout 2.0 (`14288:183972`) via `FIGMA_SECTIONS` | exists — don't restyle unless asked |
| `checkout/promise-info` | `/checkout/promise-info` | sheet | Delivery lane ⓘ (`{ title, textContent }`) | exists |
| `checkout/cards-select` | `/checkout/cards-select` | sheet | Saved cards; Add New → add card | exists |
| `checkout/add-card` | `/checkout/add-card` | sheet | Card form + validation (test card 4000 0000 0000 0002 fails) | exists |
| `checkout/special-emis` | `/checkout/special-emis` | sheet | 0% special installments (Visa only) | exists |
| `checkout/emi-plans` | `/checkout/emi-plans` | sheet | Installment plans for the selected card | exists |
| `checkout/alternate-phone` | `/checkout/alternate-phone` | sheet | Receiver details form (`{ mode: 'receiver' \| 'instruction' }`) | exists |
| `checkout/alternate-phone-contacts` | `/checkout/alternate-phone-contacts` | sheet | Mocked device contacts | exists |
| `checkout/learn-more` | `/checkout/learn-more` | sheet | Delivery instructions list / one option (`{ isList }`) | exists |
| `checkout/burn-providers` | `/checkout/burn-providers` | sheet | Points & vouchers provider list (`{ list: 'topup' }` = the financing callout's providers) | exists |
| `checkout/donation-learn-more` | `/checkout/donation-learn-more` | sheet | Donation "Learn more" (NoonCheckoutDonationLearnMoreOverlay) | exists |
| `checkout/provider-burn` | `/checkout/provider-burn` | sheet | Redeem points / voucher code (`{ code }`) | exists |
| `checkout/provider-burn-otp` | `/checkout/provider-burn-otp` | sheet | Amount + OTP (000000 fails) | exists |
| `checkout/earn` | `/checkout/earn` | sheet | Earn programs | exists |
| `checkout/provider-earn` | `/checkout/provider-earn` | sheet | Earn with a provider (phone) | exists |
| `checkout/provider-earn-help` | `/checkout/provider-earn-help` | sheet | How it works | exists |
| `checkout/installation` | `/checkout/installation` | sheet | Installation slot picker (`{ shipmentId: 'shp-1' }`, `fail`) | exists |
| `checkout/placing` | `/checkout/placing` | screen, transition `none` | Post-order loader (box → tick Lottie) | exists |
| `checkout/confirmation` | `/order-confirmation` | screen, transition `checkout-alpha`, `statusBar: 'dark'` | Order confirmation V3 | exists |
| `checkout/track-steps` | `/checkout/track-steps` | sheet | How to track (registered, not linked) | exists |
| `checkout/payment-failure` | `/payment-failure` | modal | Payment failed | exists |
| `checkout/payment-failure-help` | `/checkout/payment-failure-help` | sheet | Need help (tap to copy) | exists |
| `checkout/loading` | `/checkout/loading` | screen | Session loading state (`Skeleton` per section) | to build |
| `checkout/error` | `/checkout/error` | screen | Session error with "Try again" (as the cart error, `12112:209179`) | to build |

Page aliases live in `src/kit/routes.ts` (`checkout`, `order-confirmation`, `payment-failure`). The flow's `parent` is `cart/cart`.

## Header (Checkout 2.0, `FIGMA_SECTIONS`)

| # | Part | Kit | Spec |
|---|---|---|---|
| 1 | Bar | `CheckoutHeader` (`src/flows/checkout/components/CheckoutHeader.tsx`) | transparent over `--nk-color-chk-fig-page`, white rounded bar on scroll (`checkoutJs.headerFrom` → `headerTo`) |
| 2 | Back | 40px round button | `nav.back` → `cart/cart` |
| 3 | Address | "Delivering to Home ⌄" `--nk-type-chk-fig-text16-bold-lh21` + address line | opens the Address Book modal (`address/select`) |

## Header (All flows, default)

`CheckoutHeader title="Checkout"` (127:44446): 40px back button, centred "Checkout" Figtree Bold 16/21.1 (`--nk-type-chk-fig-text16-bold-lh21`), empty 40px right pill; same scroll behaviour. The address is the first section (`address_card`). With `FIGMA_SECTIONS` the header carries the address (table below).

## Sections (All flows, default)

`CheckoutScreen` renders `params.sections ?? ALL_FLOWS_SECTIONS`; first card flush under the 8px top padding, then 12 apart. Full measurements: `src/flows/checkout/FIGMA-MAPPING.md` § All flows.

| # | Section id | Kit | Spec |
|---|---|---|---|
| 1 | `address_card` | `AddressCard` | white r16, p 12/16/10/12; type icon + label `--nk-type-text16-bold-lh20`, line `--nk-type-chk-af-text13-medium-lh20` `--nk-color-text-secondary`, 18px chevron; → `address/select` modal |
| 2 | `integrated_noonone` | `NoonOneSection variant="banner"` | "Get **free delivery** with [one]" + 34×20 `Switch`; strip `--nk-color-chk-noon-one-cta-bg` "On orders above ~~₫100~~ ₫50"; first show plays `NoonOneCtaReveal` (bappzaar NoonOneCtaReveal: one 2850ms clock — Lottie, "Save" odometer, text scale, block settles onto the CTA strip); toggle → reloader → enrolled (gradient, subtitle, nudge → `noonone/plans { source: '/checkout' }`); hidden for members |
| 3 | `delivery_instructions` | `DeliveryInstruction` | unchanged (see below) |
| 4 | `receiver_details` | `ReceiverDetails` | unchanged |
| 5 | `shipments` | `CheckoutShipment` per shipment | unchanged |
| 6 | `burn` | `PointsVouchers` | "Top up noon Credits" 16/20; two loyalty callouts h43 r8 (Mokafaa, Qitaf → `checkout/provider-burn`); financing callout h44 r12 ("Get up to ₫30,000 & split in 36/mo" + Tamam / Emkan / QUARA rounded logos → `checkout/burn-providers { list: 'topup' }`); skeleton while loading |
| 7 | `pay_with` | `.cards` + `PaymentMethods` | Pay With on its own white r16 p12 card (rows pl8 pr12) |
| 8 | `donation` | `Donation` | 2px white frame, gradient white → `--nk-palette-border-gray`; "Donate to Dar Al Ber Society", Learn more (`Button variant="noonDotted"`) → `checkout/donation-learn-more`; 64×40 r10 amount pills (selected border-gray + primary-blue); tap toggles `donation` (reloader) — it shows in the summary and the dock total |
| 9 | `payment_summary` | `PaymentSummary flush` | 351 wide (no −2 bleed), 351 savings wave |

## Sections (Checkout 2.0, `FIGMA_SECTIONS`)

`params.sections = FIGMA_SECTIONS`. Screen `background="var(--nk-color-chk-fig-page)"`, content `paddingInline: var(--nk-space-s12)`, `paddingTop: var(--nk-space-s8)`; cards white `--nk-radius-r16`, p12, 12 apart.

| # | Section id | Kit | Spec |
|---|---|---|---|
| 1 | `shipments` | `CheckoutShipment` per `totals.shipments` | "SHIPMENT n" `--nk-type-chk-fig-text13-extrabold-lh20` + "n Items" pill; 52×70 item tiles with ×n badge, horizontal scroll for 2+ lines; "Get it **Today before 8pm**" wave footer with the 63×20 supermall / express pill; "Save on fees with later delivery" / "Need it today?" expander opens the lanes; lane ⓘ → `checkout/promise-info` |
| 2 | `delivery_instructions` | `DeliveryInstruction` (`data.delivery.ts`) | title + ⓘ; two equal option cards `--nk-color-bg-subtle` r16; selected `.optionActive` (alice-blue + 1px light-blue, blue icon, filled checkbox); default "Leave at the door" |
| 3 | `receiver_details` | `ReceiverDetails` | 32px call tile, name `--nk-type-chk-fig-text15-semibold-lh18`, phone, "Change receiver" link `--nk-color-brand-blue` |
| 4 | `payment` | `.cards` card: `BurnSection` + `src/assets/checkout/figma/points-separator.svg` + `PaymentMethods` | Points & Vouchers carousel (expanded Mokafaa card, 49px QUARA / Emkan tiles, `NewBadge`, page dots 18×5 / 5×5), then Pay With (see Payment methods) |
| 5 | `payment_summary` | `PaymentSummary` | title `--nk-type-chk-fig-text16-bold-lh24`; h28 rows (Subtotal with struck MRP, Delivery fee "Free with [one]", coupon, credits), dashed dividers, Total `--nk-type-chk-fig-text17-bold-lh20`, savings strip `--nk-palette-emerald100` under a wave |
| — | `detached_address` | `DetachedAddress` | hidden by default (the header carries the address) |
| — | `integrated_noonone` | `NoonOneSection` | hidden; noon One toggle → `noonone/plans` |
| — | `coupon_status` | `CouponStatus` | hidden; needs a cart coupon |
| — | `earn` | `EarnCallout` | hidden; → `checkout/earn` |
| — | `dynamic_invoice` | `DynamicInvoice` | hidden; master "Order Summary" |

### Ordering rules

1. Default (`ALL_FLOWS_SECTIONS`): where it goes (address, noon One delivery banner, instructions, receiver), what you get (shipments), then how you pay (points, Pay With, donation, summary). `FIGMA_SECTIONS`: shipments → delivery instructions → receiver → payment → payment summary.
2. All flows: Points & Vouchers (`burn`) and Pay With (`pay_with`) are two cards; Checkout 2.0 (`payment`): one card split by the 1px separator. Never both layouts at once.
3. The payment summary is the last section; the dock repeats its total.
4. A new step goes where it acts: delivery-side steps after `shipments`, payment-side steps inside or after `payment`, never below `payment_summary`.
5. `MASTER_SECTIONS` is the bappzaar order (`detached_address, shipments, integrated_noonone, delivery_instructions, receiver_details, payment, coupon_status, earn, dynamic_invoice`); use it only for a master variant.

## Payment methods

Order and copy from `paymentMethods` (`src/flows/checkout/data.payment.ts`), rendered by `PaymentMethods`. Rows `--nk-color-bg-subtle` r12 h54, 38×24 logo, name + second line; selected `.rowSelected` = `--nk-palette-alice-blue` + 1px `--nk-color-link`.

| # | Method | Code | Row | On press |
|---|---|---|---|---|
| — | noon credits | `useCredits` | `Switch` 29.6×16 `--nk-color-cta`, "Use my ₫x noon credits" + "Select another method to cover the remaining **₫y**" | toggles (reloader); sufficient credits → `nopayment`, no other method needed |
| 1 | Tabby | `tabby` | `NewBadge`; "Pay 4 interest free payments of ₫x" | `checkoutStore.selectPayment('tabby')` |
| 2 | Tamara | `tamara` | "Pay ₫x or in 4 payments. no late fees" | select |
| 3 | Apple Pay | `apple_pay` | logo + name | select; dock shows the Apple Pay button |
| 4 | Debit/Credit Card | `cc_noonpay` (`cc_default`) | "Add/Change", saved card "name \| •••• last4", "Installments Available ₫x/mo", 58×34 CVV input (`--nk-palette-silver` border); installment strip overlaps below (−12) | select; Add/Change → `checkout/cards-select` (or `checkout/add-card` with no cards); strip → `checkout/emi-plans` |
| — | 0% Special installments | `cc_special_emi_enbd` | hidden by data flag | → `checkout/special-emis` |
| 5 | noon One Credit Card | upsell | gradient white → `--nk-color-chk-fig-noon-one-card-end`, "Extra ₫x Cashback" green, "Apply Now" | toast (not part of the prototype) |
| 6 | Cash on Delivery | `cod` | logo + name | select |

## Dock

Sticky footer `.sticky` in `src/flows/checkout/checkout.module.css` follows **bappzaar production**, not the Figma dock (FIGMA-MAPPING.md → Footer). It is white with `--nk-shadow-chk-sticky-footer`, padding `--nk-space-s16` `--nk-space-s15` and the safe area (16 without one), row gap 8, slider above the summary.

| Part | Kit | Spec |
|---|---|---|
| CTA | `SlideButton` (`src/flows/checkout/components/SlideButton.tsx`, bappzaar NoonCheckoutSlideButton 1:1) | min 48h, `--nk-radius-r14`, p8. Thumb: white 60×38 r9 at left 7, holding the 48px arrow-to-checkmark Lottie (arrow #3866DF, or #CED1DA when disabled). Label is 16/700 as written ("Slide to Order" / "Enter CVV"), centred across the track. Disabled: track `--nk-palette-gray-color`, label white. Enabled: gradient `--nk-color-cta` → `--nk-color-chk-slide-track-end`, `--nk-color-chk-slide-label` label with shimmer. Completes past 85% (or 65% faster than 500px/s) |
| CTA swaps | Apple Pay button · `Button variant="noon"` "Verify Phone" | `apple_pay` selected · address phone not verified |
| Overview | `.overview` | "N Items" `--nk-palette-noon-grey1` and total `--nk-color-text-legacy`, both `--nk-type-chk-fig-text19-bold-lh26p6`, total = `orderPaymentAmount` with the dirham glyph |

## Data

- `src/flows/checkout/store.ts`: `checkoutStore` / `useCheckout(select)` — `paymentCode`, `cards`, `selectedCardId`, `cardSectionCode`, `emiPlanId`, `cvv`, `useCredits` (default on), `promiseByShipment`, `slotByShipment`, `deliveryInstructions` (default `leaveAtDoor`), `receiver`, `burn`, `earn`, `coupon` (from the cart), `reloading`, `failNextPayment`, `lastOrder`. `update()` shows the `Reloader` for `API_DELAY` (450ms); `selectPayment()` clears the CVV.
- `src/flows/checkout/store.delivery.ts` (`useDelivery`), `src/flows/checkout/store.rewards.ts` (`useRewards`, `ensureProvidersLoading`, voucher toast).
- `src/flows/checkout/totals.ts`: `useCheckoutTotals()` — shipments from the DemoStore cart, `itemsCount`, `subtotal`, `mrp`, `shippingFee`, `discount`, `creditsUsed`, `isCreditsSufficient`, `orderPaymentAmount`, `savings`.
- Copy and mocks: `data.ts` (`t`, `tf`, `initialCards`, `FAILING_CARD_LAST4`, `cashback`), `data.shipment.ts` (`buildShipments`, `buildPromises`), `data.delivery.ts` (`deliveryOptions`, `savedReceiverContacts`), `data.payment.ts` (`paymentMethods`, `emiPlansFor`, `isCvvValid`), `data.rewards.ts` (`loyaltyProviders`, `voucherProviders`, `earnProviders`, installation slots), `data.postorder.ts` (`postOrderMessage`, `mockPaymentError`). Address from `useAddressStore` (`src/flows/address/store.ts`).
- Copy: short, sentence case; Figma strings as in the frame ("Delivery instructions", "Receiver details", "Points & Vouchers", "Pay With", "Payment summary").

## Navigation

| From | Action |
|---|---|
| Cart Checkout | `nav.push('checkout/checkout', { coupon })` (or `noonone/cartOverlay` first) |
| Header address | `nav.push('address/select', { skipLoading: false }, { presentation: 'modal' })`; picking an address closes it, clears the CVV and toasts "Address updated"; adding one goes through `address/map` |
| Lane ⓘ | `nav.push('checkout/promise-info', { title, textContent })` |
| Delivery instructions ⓘ / inactive info option / receiver-phone option | `checkout/learn-more` `{ isList: true }` / `{ isList: false, optionKey }` / `checkout/alternate-phone` `{ mode: 'instruction' }` |
| Change receiver | `nav.push('checkout/alternate-phone', { mode: 'receiver' })` → contacts icon → `checkout/alternate-phone-contacts` |
| Points & Vouchers card | `nav.push('checkout/provider-burn', { code, isVouchersProvider })` → `checkout/provider-burn-otp`; the list sheet is `checkout/burn-providers` |
| Card Add/Change | `checkout/cards-select` (Add New → `checkout/add-card`); no cards → `checkout/add-card` |
| Installment strip | `nav.push('checkout/emi-plans')` |
| Account card manager | `cards/cards`, `cards/add` (outside checkout; inside the flow `add-card` resolves to `checkout/add-card`) |
| Slide to pay | `nav.push('checkout/placing', { fail }, { transition: 'none' })` |
| Placing done | `nav.replace('checkout/confirmation', {}, { transition: 'checkout-alpha' })` · failure `nav.replace('checkout/payment-failure', …, { presentation: 'modal', transition: 'modal' })` |
| Payment failure | CTA → `nav.back()` to checkout (slider resets) · Contact Us → `checkout/payment-failure-help` |
| Confirmation | Continue shopping / back → `nav.reset('home/home')` · View order / shipment card → `nav.reset('orders/list')` |

## Motion

| Moment | Kit |
|---|---|
| Header on scroll | `Screen onScroll` → `useMotionValue` → `useTransform(scrollY, [0, 50], …)` in `CheckoutHeader` |
| Lane expander | `CheckoutShipment`: chevron rotate 180 + `AnimatePresence` height `auto`, 0.3s |
| Credits remaining line | `AnimatePresence` height + opacity, 0.2s `easing.out` |
| Selecting a method / instruction | instant fill + border swap; row `whileTap` scale 0.985 with `spring.press`; `Switch` knob `spring.press` |
| noon One CTA reveal | `NoonOneCtaReveal` inside `NoonOneSection`: every property derived from one linear 0 → 2850ms clock (`src/flows/checkout/components/NoonOneCtaReveal.tsx`); never split it into separate springs |
| Session update | `Reloader` over the screen for `API_DELAY` |
| Slide to pay | `SlideButton` drag, idle pulse every 4s, label shimmer, Lottie arrow → check; spring back on `resetSignal` |
| Placing | card slides up 0.4s, `Lottie name="boxAnim"` loop → `Lottie name="orderConf"` tick → confirmation |
| Confirmation | `checkout-alpha` (opacity 0.25s `easing.standard`) |
| Sheets | `presentation: 'sheet'` (`spring.sheet`) |
| Payment failure CTA | fades in after 2s |

## States

| State | Spec |
|---|---|
| CVV empty | slider disabled "Enter CVV"; press scrolls to and focuses the CVV input |
| No card | slider "Select payment method"; press scrolls to Pay With |
| Credits sufficient | method becomes `nopayment`; slider enabled without a CVV |
| Points loading | `BurnSection` `Skeleton` tiles until `ensureProvidersLoading` resolves |
| Placing | `checkout/placing`; status copy per method (`postOrderMessage`); clears the cart |
| Payment failure | card 0002 or `failPayment: true` → `checkout/payment-failure` modal; back resets the slider |
| Loading / error | to build: `checkout/loading`, `checkout/error` as ScreenDefs with `defaultParams` |

## Acceptance

- [ ] Routes registered; `/checkout`, `/order-confirmation`, `/payment-failure` open their screens; `check:routes` clean.
- [ ] Sections in `ALL_FLOWS_SECTIONS` order by default (`FIGMA_SECTIONS` or another documented `sections` list for variants); 12 gutter, 12 gap, white r16 p12 cards on `--nk-color-chk-fig-page`.
- [ ] Selected payment row and delivery option use alice-blue + 1px border; unselected rows don't shift.
- [ ] `SlideButton` disabled until a valid CVV; disabled press guides to the CVV; Apple Pay and Verify Phone swaps work.
- [ ] Slide → placing → confirmation (`none`, `checkout-alpha`); failure → modal → back resets the slider; exits reset to `home/home` / `orders/list`.
- [ ] Every row, link and tile navigates or toggles; nothing dead.
- [ ] Tokens only (`lint:tokens` 0 for the flow); new values are `chk*` / `chkFig*` flow tokens with a `src/flows/checkout/FIGMA-MAPPING.md` row.
- [ ] Prices with the dirham glyph; NEW badges are `NewBadge`.
- [ ] Screenshots read at top, mid (`--scroll 750`) and bottom (`--scroll 1500`), compared with All flows `127:44077` (and `14288:183972` for `FIGMA_SECTIONS`).
- [ ] `source` names `Figma Af34gfmhQ1D0wstXUEHSIF · 127:44077` (and `zURu7GI7sq77fjdXKrouvo · 14288:183972` for `FIGMA_SECTIONS`).
