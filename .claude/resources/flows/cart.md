# cart: flow brief

Read with `../screens.md` and `src/flows/cart/FIGMA-MAPPING.md` (Cart 2.0, Figma BaWAAGW7zmdSTkXNXqPcAJ · 10575:94058). Skill: `/cart`. Snapshot from 2026-10-13.

## Screens

- `cart/cart` (`/cart`) is the tab root.
  - Truth `mixed`: NoonCartScreen behaviour, with the sticky footer from Figma 127:40209.
  - Verified 2026-10-12.
- `cart/empty` and `cart/loading` force their state through params and leave the store alone.
- Sheets:
  - `cart/variants` (p6), `cart/customize` (p1), `cart/discount` (p1 + `tagId`)
  - `cart/bundles` (p8), `cart/updates`
  - `cart/couponTray`: "View available coupons & offers" → the coupon tray revamp (NoonSalesCouponTrayOverlayScreen). Mock tray built from the cart (`data.couponTray.ts`), codes in `cartCoupons`; mapping in `src/flows/cart/components/couponTray/MAPPING.md`.

## State: all in `useDemoStore()`, no flow store

From `src/kit/DemoStore.tsx`:

- **Cart**: `cart`, `addToCart`, `setQty`, `removeFromCart`, `updateLine`, `moveToWishlist`, `clearCart`.
- **Coupon**: `coupon`, `applyCoupon`, `removeCoupon`.
- **Totals**: `cartTotals` (groups, coupon, shipping, savings, total).
- **Other**: `inactiveCart`, `removeInactive`, `cartUpdatesDismissed`.
- **Constants**:
  - `FREE_DELIVERY_THRESHOLD` 100, `SHIPPING_FEE` 10.
  - `CartGroupType` is `express | marketplace | xborder`.
  - There is **no supermall group**. Adding one is a DemoStore change; ask first.

## Anatomy (server-ordered `SECTIONS` + a `renderSection` switch)

- **`CartHeader`**: address (→ `address/select`) and wishlist.
  - Its background, radius and shade are `useTransform`s of scroll, over 0→50 and 50→60.
- **`CartGroup`** per shipment:
  - glass colours: express #FDFDF1, global #F5F2F7, market #EFFAEA;
  - `GroupProgressBar` 4 high with fill #101628;
  - `NoonOneNudge` (→ `noonone/landing`);
  - "Add" → `plp/listing`.
- **`CartItem`**:
  - image 104×144;
  - `QuantitySelector` 92×38, which commits after a 1.2 s debounce;
  - chips open the variants, bundles, customize and discount sheets;
  - a tap opens `pdp/detail`.
- **Other sections**:
  - `InactiveGroup`
  - `CouponInput` (bappzaar master `NoonCouponInput` layout; the offers row opens `cart/couponTray`; apply / remove show the cart screen loader)
  - `CartCarousel` (SKU 134)
  - `FreeGifts` (p5 unlocks at 5000)
  - payment callouts
- **`CartFooter`**
  - A 239×48 #E7FBF3 savings wave (`src/assets/cart/footer/`) overlaps the footer by 16 and carries "saved!" plus the noon One logo.
  - The footer is 72 high, r12, with shadow 0 −4 10 8 %. Total is 131 wide with a dotted underline. The CTA is 52 high, #0057FF.
  - The sliding invoice moves y 400→12 over 300 ms, and a swipe down of more than 50 closes it.
  - It reports its height through `onHeightChange`. Content padding is max(16, footerH − 40).

## Hand-offs

- **In**: `pdp/added` and the wishlist `ViewCartPill` push `cart/cart`. The tab bar opens it as a root.
  - `isTabRoot = nav.stack[0].route === nav.route` picks between tab bar and back button.
- **Out**: `nav.push('checkout/checkout', { coupon })`.
  - Once per session, a non-member first sees `noonone/cartOverlay` (`takeCartVipPush`), which then pushes checkout.
- A 450 ms fake load runs on every mount. `CartLoading` is a 4 px sweeping bar.

## Mapping rules

- Styling follows Figma; data and copy stay the kit's.
- Cart-only tokens are `cart*`. The palette added `yellow200`, `purple100`, `purple200`, `green200`, `persianBlue50` and `persianBlue100`.
- The sticky footer went to bappzaar 1:1 and then **back to Figma 127:40209** (current). Behaviour didn't change.
  - The visual reference `cart-sticky-footer` guards it: `npm run visual:ref -- cart`.
- Skipped: Lucid Air freebies, the free-item row, the Ad tag and the "express Today" pill.
- Item photos use `mix-blend-mode: multiply`.
- Listed follow-ups: a logo-only `MarketplaceTag` and a SKU-134 `ProductCard` variant.
