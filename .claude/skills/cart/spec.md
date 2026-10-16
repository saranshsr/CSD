<!-- planned: cart/error -->
<!-- planned: cart/best-price -->
# Cart — flow specification

The contract a cart build must meet. Measurements are Figma points on a 375pt frame (the kit device is 390pt; keep the 12px gutters and let widths flow). Full measurements and token mappings: `../checkout/references/figma-cart-checkout.md` (§2.1 anatomy, §3 tokens) and `src/flows/cart/FIGMA-MAPPING.md`.

## Screens

| Route | Path | Presentation | What it is | Status |
|---|---|---|---|---|
| `cart/cart` | `/cart` | tab root (`cart`); push when opened from PDP (back button, no tab bar) | bappzaar 1:1 port, visuals from All flows `Af34gfmhQ1D0wstXUEHSIF · 127:39687` (Cart 2.0 Phase I `10575:94058` before) | exists — don't restyle unless asked |
| `cart/empty` | `/cart/empty` | tab root, `{ state: 'empty' }` | Empty-generic image, "Your cart is empty" + recommendations carousel, no footer | exists |
| `cart/loading` | `/cart/loading` | tab root, `{ state: 'loading' }` | `CartLoading`: pale page + 4px sweeping bar | exists |
| `cart/variants` | `/cart/variants` | sheet, `{ productId: 'p6' }` | Variant chips → Update Item | exists |
| `cart/customize` | `/cart/customize` | sheet, `{ productId: 'p1' }` | Engraving text with counter, Save Message → toast | exists |
| `cart/discount` | `/cart/discount` | sheet, `{ productId, tagId, copyOnly? }` | Apply coupon, terms, eligible items | exists |
| `cart/couponTray` | `/cart/couponTray` | sheet, `{ state?: 'loading' \| 'error' \| 'empty' }` | Coupon tray (NoonSalesCouponTrayOverlayScreen): best price, coupons, payment offers; Apply / Remove; loading, error, empty | exists |
| `cart/bundles` | `/cart/bundles` | sheet, `{ productId: 'p8' }` | Bundle header + Lottie, items, Combo Total | exists |
| `cart/updates` | `/cart/updates` | sheet | Price-drop / out-of-stock list | exists |
| `cart/error` | `/cart/error` | tab root, `{ state: 'error' }` | Cart error (`12112:209179`) | to build |
| `cart/best-price` | `/cart/best-price` | tab root, `{ state: 'best-price' }` | Best price variant (`14812:276687`), own section order | to build |

All `cart/*` routes are tab-bar screens only when listed in `tabBar.screens` (`src/flows/cart/index.ts`); add the new states there too.

## Header

| # | Part | Kit | Spec |
|---|---|---|---|
| 1 | Bar | `CartHeader` (`src/flows/cart/components/CartHeader.tsx`) | transparent on `--nk-color-bg-page`, white with bottom radius 12 and a soft shade after 50px of scroll |
| 2 | Back | `CartHeader showBackButton` | only when pushed (not the tab root) |
| 3 | Address | `CartHeader` selector → `address/select` | 20px glyph + label `--nk-type-cart-header-label` + chevron; address line 13/18 `--nk-color-text-muted`, ellipsis |
| 4 | Wishlist | 36px white circle → `wishlist/wishlist` | 1px `--nk-color-border-subtle` |

## Sections

Default order (`SECTIONS` in `src/flows/cart/CartScreen.tsx`). Page `background="bgPage"` (`--nk-color-bg-page`), every card 12 from the screen edge (`cartTokens.horizontalPadding`), 8 apart (the two carousels 12 apart), radius 16 (`--nk-radius-r16`) — All flows `127:39688`.

| # | Section id | Kit (reuse → build) | Spec |
|---|---|---|---|
| 1 | `updates` | inline banner in `CartScreen.tsx` → `cart/updates` sheet | orange tint `--nk-color-cart-orange-tint`, "Your cart’s been updated · Tap to review", dismiss × (`dismissCartUpdates`) |
| 2 | `groups` | `CartGroup` per type in `GROUP_ORDER` → `CartItem`, `QuantitySelector`, `DiscountTags`, `ItemPoint`, `NoonOneNudge`, `GroupProgressBar` | glass container + waves + logo, white items card in the group border colour, dotted dividers, stacks rows, progress footer; theming below |
| 3 | `secondary_groups` | `InactiveGroup` | "Unavailable items", collapsible, Find Similar → `plp/listing` |
| 4 | `cms_bottom` | `CartCarousel` | "Don’t miss out on these offers" + "Sponsored"; empty cart: "Customers Also Viewed"; 1px `--nk-color-border-subtle` card, header px 16 `--nk-type-section`; SKU tiles 134 wide, gap 12 |
| 5 | `wishlist` | `CartCarousel` | "From your wishlist" from `useDemoStore().wishlist` |
| 6 | `free_gifts` | `FreeGifts` | mint → white card, 80×109 locked image, "left to unlock" bar in `--nk-color-best-price-ink` |
| 7 | `coupon_tray` | `CouponInput` | bappzaar master `NoonCouponInput` (not the Figma frame): lightGrey outer card → white r16 card with "Got a coupon?", 54px input on `--nk-color-bg-subtle`, applied tag icon + APPLY / REMOVE, success / error / warning borders and colours, HTML feedback; "View available coupons & offers" on the grey below (green discount icon, thick chevron) → `cart/couponTray` |
| 8 | `cobrand_cards` | `CobrandCards` | bappzaar NoonCartCobrandCards: paging 351×138 cards (noon One Credit Card: title, diamond-bullet terms, dark "Apply now", card art right), auto-advance 3s until swiped; hidden when empty |
| 9 | `callouts` | `PaymentOffers` → `SalesCallout` | "Payment offers" (`--nk-type-section`, px 14); row of 259-wide entries (1px `--nk-color-border-subtle`, r16, p8) with 48px r12 tiles: tamara, tabby, bank installments, tax refund + "Learn more"; noon One entry hidden for members |
| — | Snackbar | `CartSnackBar` (sibling of `<Screen>`) | "Item moved to Wishlist" → `wishlist/wishlist`, 3s |

### Ordering rules

1. Shipment groups first, in `GROUP_ORDER` (supermall → xborder (Global) → express → marketplace (market)). A group with no lines renders nothing.
2. Upsell after the items: offers carousel → wishlist carousel → free gifts.
3. Coupon → cobrand cards → payment offers in the default; the best-price variant uses groups → free gifts → payment offers → coupon with strip → carousels, as its own order list, never by changing `SECTIONS`.
4. Empty cart: only `EmptyCart` + the recommendations carousel; no coupon, cobrand cards, callouts, wishlist or footer.

### Best-price coupon variant (to build)

`CouponInput` with a best-price option: the white coupon block sits `-12px` over a mint card (`--nk-color-cart-mint-green300` → `--nk-palette-mint-cream`, z2); under it a strip "Best price **X** with offers" (`HtmlText`, amount in `--nk-color-cart-emerald800`) + chevron → `cart/discount` sheet. Placeholder "Enter your coupon code or select one", box h46, no "View all" row.

## Group theming

Every colour comes from `groupTheme[type]` (`src/flows/cart/tokens.ts`); logos and waves from `src/assets/cart/figma/`.

| Group (`CartGroupType`) | Glass | Items border | Progress end | Track / fill | ETA pill start | Logo | Status |
|---|---|---|---|---|---|---|---|
| `express` | `--nk-color-cart-glass-express` | `--nk-palette-yellow200` | `--nk-color-cart-progress-express` | `--nk-color-border` / `--nk-color-text-strong` | `--nk-color-cart-eta-express` | `logo-express.svg`, `waves-express.svg` | exists |
| `xborder` (Global) | `--nk-color-cart-glass-global` | `--nk-palette-purple200` | `--nk-palette-purple200` | `--nk-color-border` / `--nk-palette-black` | `--nk-palette-border-primary` | `logo-global-icon.svg` + "Global" (`--nk-type-cart-global-logo`), `waves-global.svg` | exists |
| `marketplace` (market) | `--nk-color-cart-glass-market` | `--nk-palette-green200` | `--nk-palette-green100` | `--nk-color-border` / `--nk-color-text-strong` | `--nk-palette-border-primary` | `logo-market-store-icon.svg` + `logo-market-wordmark.svg`, `waves-market.svg` | exists |
| `supermall` | `--nk-color-cart-glass-supermall` | `--nk-palette-persian-blue100` | `--nk-color-cart-progress-supermall` (straight `0deg` fade to 84.375%) | `--nk-color-cart-track-supermall` / `--nk-palette-rocket-blue-sapphire` | `--nk-color-cart-eta-supermall`, flash icon, ink `--nk-palette-rocket-blue-sapphire` | `logo-supermall-super.svg` + `logo-supermall-mall.svg`, `waves-supermall.svg` | exists (All flows `127:39689`): `'supermall'` in `CartGroupType` / `cartGroupOf` (`Product.supermall`), first in `GROUP_ORDER`; "+ Add" border `--nk-palette-persian-blue50`, text `--nk-palette-persian-blue`; progress copy "for free service fees"; checkout ships it with its supermall shipment |

Shared per group: progress bar 4 tall (`cartTokens.progress.barHeight`), "+ Add" 57×26 → `plp/listing`, message from `progressMessage(remaining, …)` against `FREE_DELIVERY_THRESHOLD`. Keep checkout's shipment mapping (`src/flows/checkout/data.shipment.ts`) in sync when a group is added.

## Footer

`CartFooter` (`src/flows/cart/components/CartFooter.tsx`), hidden when empty:

| Part | Spec |
|---|---|
| Savings tab | `CartWave` in `--nk-color-cart-savings-wave`, overlapping the footer by 16; "You’re saving **X** on this order" from `cartTotals.totalSavings`; hidden at 0 |
| Footer | white, top radius 12 (`--nk-radius-r12`), shadow `--nk-shadow-cart-footer`, padding 10 + `--nk-inset-bottom` |
| Footer on the Cart tab (Liquid Glass) | `CartGlassFooter` (bappzaar liquid-upgrade `isLiquidGlass`): floating card as wide as the glass tab bar (`--nk-tab-bar-glass-inset-x`), r16, the shared glass, docked `--nk-tab-bar-floating-gap` above the bar and following it on scroll; `GlassFade` under it. Tap Total: one continuous motion — the savings tab and the "You’re saving" panel share a spot, so one green surface grows from the 239 × 32 tab into the full-width 50-high panel (width / height / margin on one spring, stiffness 340 / damping 36, no overshoot; wave outline → flat emerald fill + scallops; label cross-fades, never stretches) while the card's top edge rises (+60ms) to reveal the summary, which fades / settles in (+140ms); card glass → white, page dims. Closing reverses: summary folds first, panel shrinks back after 80ms |
| Total | "Total · N items" + price `--nk-type-text20-bold-lh24`, dotted underline; tap slides `DynamicInvoice` up (`buildDynamicInvoice`, `src/flows/cart/invoice.ts`) with a backdrop; swipe down / backdrop closes |
| Checkout | `--nk-color-brand-blue`, h52, r12, `--nk-type-text17-semibold-lh20`; locked 1.75s after a press |
| Height | `onHeightChange` → content `paddingBottom`, so the last section clears the bar |

## Data

- State: `useDemoStore()` — `cart` (`CartLine[]`), `cartTotals` (`itemCount, subtotal, savings, addOns, foupons, shipping, freeDelivery, groups[], coupon, couponDiscount, total, totalSavings`), `coupon` / `applyCoupon` / `removeCoupon`, `inactiveCart`, `wishlist`, `cartUpdatesDismissed`. Constants `FREE_DELIVERY_THRESHOLD` (100), `SHIPPING_FEE` (10), `FOUPON_VALUE` (15); coupons `NOON10`, `SAVE50` (`cartCoupons`). Seed cart p1, p6, p8, p11; inactive p7.
- Copy and content in `src/flows/cart/data.ts`: `t` (each string commented with its translation key), `groupMeta`, `groupCallouts`, `progressMessage`, `cartItemExtras`, `itemPoints`, `freeGift`, `paymentCallouts`, `cartUpdates`, `inactiveHeader`; variants in `data.variants.ts`, bundles in `data.bundles.ts`.
- Products from `src/data`; prices through `Price` / `Money` / `currency` (dirham sign), never "AED" in new UI. Server-style rich copy (`<b>`, `<highlight>`) through `HtmlText`.
- New copy (to build): error title "Something went wrong!", message "It’s not you, it’s us! Please try again.", button "Try again"; best-price placeholder and strip. Sentence case.

## Navigation

| From | Action |
|---|---|
| Checkout | `nav.push('checkout/checkout', { coupon })`, or `noonone/cartOverlay` once per session for non-members (`takeCartVipPush`) |
| Item card, inactive item, carousel tile | `nav.push('pdp/detail', { productId })` |
| Size / variant chip | `nav.sheet('cart/variants', { productId })` |
| "Text … Edit" | `nav.sheet('cart/customize', { productId })` |
| Discount tag | `nav.sheet('cart/discount', { productId, tagId })` |
| "View available coupons & offers" | `nav.sheet('cart/couponTray')`; in the tray: Apply → applies the cart coupon and closes · Shop more / Add products → `plp/listing` · Join One → `noonone/landing` |
| "Bundle & save · View" | `nav.sheet('cart/bundles', { productId })` |
| Updates banner | `nav.sheet('cart/updates')` |
| "+ Add" (progress, free gifts), Find Similar, "View all" | `nav.push('plp/listing')` |
| Address | `nav.push('address/select')` |
| Wishlist button, snackbar | `nav.push('wishlist/wishlist')` |
| noon One nudge / callout | `nav.push('noonone/landing', { source: '/cart' })` |
| Error "Try again" (to build) | swap to the loader, then the cart (local state, `fade`) |

## Motion

| Moment | Kit |
|---|---|
| Header on scroll | `CartHeader`: `useTransform(scrollY, [0, 50])` background + radius, shade 50–60 (motion.md "Headers that react to scroll") |
| Page load | `CartLoading`: bar `x: '-100%' → '100%'` 0.8s, `repeat: Infinity`, 450ms before content |
| Progress fill | `GroupProgressBar`: spring `cartTokens.progress.spring`, shimmer 1.8s × 7 after `delayMs`, on first view (`useInView`) |
| Qty change | `QuantitySelector` value swap `AnimatePresence mode="popLayout"` (y 8 → 0, exit −8, 0.16s); icons `whileTap={{ scale: 0.85 }}`; commit after `cartTokens.qtyDebounceMs` with the inline `Spinner` |
| Item removed / warranty added | `CartGroup` `AnimatePresence` height + opacity 0.3s, `layout="position"` |
| Coupon apply / remove | `CouponInput` → `CartScreen` `.reloading`: master's FeedbackView overlay loader (60% white, centred spinner) while the request runs; no shake, icon spring or feedback reveal (master has none) |
| Invoice | `CartFooter`: slide `cartTokens.invoice.slideMs` + backdrop `backdropMs`, drag down > 50 closes |
| Moved to wishlist | `CartSnackBar` spring from below (120/16/0.7), 3s |
| "+ Add" / Checkout press | `whileTap` scale 0.95 / opacity 0.6 |
| Sheets | `presentation: 'sheet'` (`spring.sheet`); Cart → Checkout `push` |
| Empty / error content | rise in once, `initial={{ opacity: 0, y: 12 }}` as `EmptyCart` does; never on every re-render |

## States

| State | Spec |
|---|---|
| Loading | `CartLoading` (`cart/loading`, and 450ms on every appear) |
| Empty | `EmptyCart` + "Customers Also Viewed" carousel, tab bar on the tab root, no footer (`cart/empty`; also when the last item is removed) |
| Error (to build) | header unchanged, centred "Something went wrong!" (bold 18/24 `--nk-color-text-strong`) + message (14/18 `--nk-color-text-muted`) + an illustration in `src/assets/cart/` + `Button variant="dark" size="sm"` "Try again" → loading → cart; no footer (`12112:209179`) |
| Best price (to build) | best-price section order + coupon strip (`14812:276687`) |
| Coupon | success / invalid / below-minimum feedback from `couponFeedback` (`data.ts`) |
| Unavailable items | `InactiveGroup` while `inactiveCart` has lines |

## Acceptance

- [ ] Routes registered (planned states added to `index.ts` and `tabBar.screens`); `/cart` opens `cart/cart`; `check:routes` clean.
- [ ] Section order as `SECTIONS` (or the variant's own list); 12 gutter, 12 between cards, r16 cards on `--nk-color-bg-page`.
- [ ] Every group coloured through `groupTheme`; glass, border, waves, logo, ETA pill and progress colours match the theming table.
- [ ] The four overlaps kept (glass −24, stepper −16, savings wave −16, best-price coupon −12).
- [ ] Every total, savings, shipping and progress value read from `useDemoStore().cartTotals`; stepper, remove, coupon and warranty update footer, invoice and progress together.
- [ ] Every item, chip, tile, "+ Add" and link navigates or opens its sheet; nothing dead.
- [ ] Tokens only (`lint:tokens` 0 for `src/flows/cart`); new values are `cart*` flow tokens with a `FIGMA-MAPPING.md` row.
- [ ] Empty, loading and error open by URL and render without touching the store.
- [ ] Screenshots read at top and scrolled (`--scroll 1200` and further), compared with `10575:94058` (and `12112:209179` / `14812:276687` for the new states).
- [ ] `source` = `Figma BaWAAGW7zmdSTkXNXqPcAJ · <node>` on new ScreenDefs.
