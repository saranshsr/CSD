# checkout: flow brief

Read with `../screens.md`, `src/flows/checkout/FIGMA-MAPPING.md` (wins for the main layout) and `src/flows/checkout/MAPPING.md` (bappzaar `cc1f8a0d1f0`: sheets, behaviour, hidden sections). Skill: `/checkout`. Snapshot from 2026-10-13.

## Screens

- `checkout/checkout` (`/checkout`; parent `cart/cart`).
  - Its source is Figma zURu7GI7sq77fjdXKrouvo · 14288:183972 plus bappzaar, so truth is inferred as `mixed`.
  - It has no explicit `truth` or `verified` yet.
- **Sheets**:
  - `checkout/promise-info`
  - `checkout/cards-select`, `checkout/add-card`
  - `checkout/special-emis`, `checkout/emi-plans`
  - `checkout/alternate-phone` (`mode` receiver | instruction), `checkout/alternate-phone-contacts`
  - `checkout/learn-more`
  - `checkout/burn-providers`, `checkout/provider-burn`, `checkout/provider-burn-otp`
  - `checkout/earn`, `checkout/provider-earn`, `checkout/provider-earn-help`
  - `checkout/installation`
  - `checkout/track-steps` (registered, never opened)
  - `checkout/payment-failure-help`
- **Result screens**:
  - `checkout/placing` (`transition: 'none'`)
  - `checkout/confirmation` (`checkout-alpha`, dark status bar)
  - `checkout/payment-failure` (modal)

## Sections

- **Default** `ALL_FLOWS_SECTIONS` (Figma All flows 127:44077): address card → noon One banner → delivery instructions → receiver details → shipments → Points & Vouchers ("Top up noon Credits") → Pay With → donation → payment summary; header shows "Checkout".
- **`FIGMA_SECTIONS`** (Checkout 2.0): shipments → delivery instructions → receiver details → payment (points + Pay With in one card) → payment summary; address in the header.
- **`params.sections`** (e.g. `MASTER_SECTIONS`) brings back the master-only sections: detached address, integrated noon One (→ `noonone/plans`), coupon status, earn, dynamic invoice.

| Component | Notes |
|---|---|
| `CheckoutHeader` | address; background, radius and gradient follow scroll |
| `CheckoutShipment` | lanes; ⓘ → `checkout/promise-info` |
| `DeliveryInstruction` | → `checkout/learn-more` or `checkout/alternate-phone` |
| `ReceiverDetails` | → `checkout/alternate-phone` (receiver) |
| `BurnSection` | points & vouchers → `checkout/provider-burn` |
| `PaymentMethods` | cards-select / add-card, special EMIs, EMI plans; CVV input ref |
| `PaymentSummary` | Figma summary block |
| `SlideButton` | completes past 85 % slow / 65 % fast; 48 high, r12, disabled #DADCE3 |

## State: three `createStore` stores, plus DemoStore

- **`checkoutStore` / `useCheckout`** (`src/flows/checkout/store.ts`)
  - State:
    - payment: `paymentCode` (default `cc_noonpay`), cards, selected card, EMI plan, CVV, `useCredits` (true)
    - delivery: promise and slot per shipment, delivery instructions, receiver
    - rewards: burn / earn
    - order: coupon, `failNextPayment`, `lastOrder`
  - **Every change goes through `update(patch, delay = 450)`**. It shows `<Reloader>`, then applies the patch, and returns a Promise. Keep that pattern for new settings.
- **`deliveryStore`** (`store.delivery.ts`): contacts and the receiver phone.
- **`rewardsStore`** (`store.rewards.ts`): the voucher toast. Providers load in 900 ms, once per session.
- **Totals**: `useCheckoutTotals()` combines DemoStore `cart` + `cartTotals` with the checkout state.
- **Coupon order**: a successful DemoStore coupon, then DemoStore `coupon`, then `params.coupon`.
- **Address**: comes from `src/flows/address/store.ts`. Changing the default address goes back, clears the CVV and shows a toast.

## Order placement

1. **Place order** writes `lastOrder`, then pushes `checkout/placing`.
2. **Fail case**: the order fails if `failNextPayment` is set or the card ends **0002** (`FAILING_CARD_LAST4`). Placing then replaces itself with `checkout/payment-failure` (modal).
3. **Success case**: `clearCart()`, then a replace to `checkout/confirmation`.
4. **Confirmation** resets to `home/home` or `orders/list`.
5. **Back on checkout**: when it is top again after placing, `resetSignal` resets the slider.

- **Disabled slider**: a tap scrolls to and focuses the CVV, or scrolls to the payment section.
- **CTA**: becomes Verify Phone when the address is unverified. Apple Pay gets a CSS button.
- **OTP**: `FAILING_OTP` 000000 fails.

## Gotchas

- The flow's `bgPage` is #F3F4F8. Write master antiFlashWhite #F2F3F7 as `var(--nk-palette-anti-flash-white)`, never as `bg-page`.
- `isCvvValid` exists twice, in `src/flows/checkout/utils.ts` and `data.payment.ts`. `CheckoutScreen` uses the `utils` one.
- `checkout-alpha` is registered by a side-effect import in the flow's `transitions.ts`.
- Live flags assumed: session v3, slider CTA, CVV required, collapsed shipment selections, coupons on checkout. `payment_v3` is off, so Add card is a local screen.
- Approximations: provider logos are drawn wordmarks, Apple Pay is CSS, and the confirmation hero carousel isn't ported.
- Supermall / express pills are flow-local, because `MarketplaceTag` lacks them.
