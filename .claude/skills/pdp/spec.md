<!-- planned: pdp/oos -->

# Product detail page — flow specification

The contract a PDP build must meet. Measurements are Figma points on a 375pt frame (the kit device is 390pt; widths stretch, gutters and fixed sizes stay). Full measurements and token mappings: `references/figma-storefront-pdp.md`; bappzaar values: `src/flows/pdp/MAPPING.md`.

## Screens

| Route | Path | Presentation | What it is | Status |
|---|---|---|---|---|
| `pdp/detail` | `/pdp` (also `/product`, `/pdp/detail`) | push (`push`); delivery-lane SKU switch `replace` (`fade`); variant options switch in place | Current PDP: "New PDP" look (All flows `Af34gfmhQ1D0wstXUEHSIF · 64:5571`, built on Storefront `2ldJbjmQq4RkhnrNFCfXQB · 3499:75115`) over bappzaar master behaviour; `truth: 'mixed'`, verified 2026-10-12; default `{ productId: IPHONE_17_PRO_ID }`, `?delivery=<variant>` forces a delivery card | exists — don't restyle unless asked |
| `pdp/deliveryVariants` | `/pdp/deliveryVariants` | push, `parent: 'pdp/detail'` | All five `SfDeliveryCard` variants (crossSell, noCrossSell, market, express, global) stacked (PDP Redesign `xPr9Ln37JGSBGvNtrsyD0y · 3583:109620`) | exists |
| `pdp/variants` | `/pdp/variants` | sheet | Size picker from a product card +: SIZE chips (none preselected), QTY + ADD TO CART; ATC without a size warns and shakes; success → back + toast | exists |
| `pdp/added` | `/pdp/added` | sheet | Quick cart after ATC: check Lottie, CONTINUE SHOPPING / VIEW CART; `recsVariant` adds recommendations | exists |
| `pdp/oos` | `/pdp/oos` | push (`push`) | Storefront 2025 PDP (`930:259766`): `{ productId, state?: 'oos' \| 'unavailable' \| 'inStock' }`, default `oos` (Case 3); `unavailable` = Case 2, `inStock` = Case 1 | to build |

## Sections (top to bottom)

Every section is a white card: `Card` (`src/flows/pdp/components/Sections.tsx`) — `--nk-color-bg-surface`, `--nk-radius-r16`, padding `--nk-space-s12`, margin `0 12px 12px`, so cards sit inset 12 and 12 apart on `--nk-color-bg-page`. Card titles `--nk-color-text-strong`, 15/700/17 (`--nk-type-pdp-sfb-section-title`, `--nk-type-pdp-sfc-section-title`, `--nk-type-pdp-sfd-section-title` from `tokens.sfB`–`sfD`).

### Current screen (`pdp/detail`, render order of `src/flows/pdp/DetailScreen.tsx`)

All in `src/flows/pdp/components/storefront/`; values per section in `src/flows/pdp/FIGMA-MAPPING.md` (Storefront table + "New PDP" groups A–E).

| # | Section | Kit |
|---|---|---|
| 1 | Header: back · expandable search · wishlist · share (40px round buttons); solid white after 100px, search pill springs open | `SfHeader` |
| 2 | Pinned, shrinking gallery (512/375), catalog tag, 360° button (toast), dots | `SfGallery` |
| 3 | Brand strip (Visit Store) + info card: title, rating pill → reviews, price, deal tag, nudge, coupon chips, bestseller row | `SfMainInfo` |
| 4 | Bundle / combo card | `SfBundleCard` |
| 5 | Sponsored product (78-high Big Ad + "Ad") | `SfSponsoredRow` |
| 6 | Delivery information (5 variants, `deliveryVariantFor`) | `SfDeliveryCard` |
| 7 | Newer model available (`successorFor(product)`) | `SfNewerModelCard` |
| 8 | Free gifts for you | `SfFreeGifts` (`freebiesFor`) |
| 9 | Variants (first in-stock size preselected; option tap → loader, in-place switch) | `SfVariantsCard` |
| 10 | Payment offers | `SfPaymentOffers` |
| 11 | Trust markers | `SfTrustCard` |
| 12 | Product Overview: AI summary + Description · Highlights · Specifications accordions | `SfProductDetails` |
| 13 | Additional Information | `SfAdditionalInfo` |
| 14 | Category bestseller row | `SfBestsellerRow` |
| 15 | Seller + other offers | `SfSellerCard` |
| 16 | Product Features (A+, capped 610 + View More) | `SfProductFeatures` |
| 17 | Sponsored brand carousel | `SfSponsoredBrandCard` |
| 18 | Extended warranty | `SfExtendedWarranty` |
| 19 | Frequently bought together | `SfFbtCard` |
| 20 | Ratings & Reviews (AI summary, photo reviews) | `SfReviewsCard` |
| 21 | "More from {brand}" · "Customers Also Viewed" (bleed bands) · "Products related to this" (card) | `SfRecommendations` + `SfRecoCard` |
| — | Sticky footer: QTY · Buy now · Add to cart, Back to top, `TabBar active="home"` under it | `SfAtcBar` (in `Screen overlay`) |

The port's earlier section components (`DeliveryCard`, `PaymentsCard`, `ReinforcementCard`, `OverviewCard`, `AdditionalInfoCard`, `CategoryBestSellerCta`, `SellerCard`, `FbtCard` in `components/Sections.tsx`; `VariantsCard` in `components/Variants.tsx`) remain in the folder but are not rendered; reuse `Card` from `Sections.tsx`.

### Storefront 2025 (`pdp/oos`, `930:259766`)

| # | Section | Kit (reuse → build) | Spec |
|---|---|---|---|
| 1 | Header | `SfHeader` (exists) | 40px buttons: back; search · wishlist · share (gap 8); white → transparent gradient, solid on scroll |
| 2 | Gallery | `SfGallery` (360 button exists, toasts) | 512 tall at 375; "noon's exclusive" tag start, 40px 360 button end, footer row 12 from the sides, dots 20 from the bottom |
| 3 | Main info | `SfMainInfo` | strip `--nk-palette-lavender`, brand `--nk-type-body-bold` `--nk-color-brand-blue`, 24px verified badge, "Visit Store" + chevron; title `--nk-type-pdp-title`; 26h rating pill "4.6 (34244 reviews)"; no overlap. **OOS: no price, deal tags or coupons** |
| 4 | Sponsored product row | `SfSponsoredRow` (exists; on `pdp/detail` it is now the New PDP 78-high Big Ad) | Storefront: 351×35 white r8, one line, opens that PDP |
| 5 | Newer model available | `SfNewerModelCard` (exists; successor from `successorFor`) | header strip gradient `--nk-palette-lavender-mist` → white, label `--nk-type-caption-bold` `--nk-palette-deep-purple`; 55×68 image, 2-line title, price `--nk-type-text13-semibold-lh18`, 34px round chevron. Shown in all three cases |
| 6 | Delivery · variants · reinforcement · payments | `SfDeliveryCard`, `SfVariantsCard`, `SfTrustCard`, `SfPaymentOffers` | `inStock` and `unavailable` only, in this order (payments move after variants) |
| 7 | Product Details | `SfProductDetails` | title "Product Details"; Overview · Highlights · Specifications; card padding 16·12; rows 44h `--nk-color-bg-subtle` `--nk-radius-r12`, `--nk-type-body-semibold`, 20px chevron; all collapsed |
| 8 | Bestseller | `SfBestsellerRow` | 119° white → `--nk-palette-mint-cyan-light`, 40px rosette, "Bestseller #1 in {category}", sub "Explore other bestsellers" |
| 9 | Seller | `SfSellerCard` | 48 logo box (`Icon name="store"`), "Sold by" + name, rating and positive pills, trust chips r18 (`--nk-radius-pdp-r18`), brand subtitle row, dashed divider, offers row `--nk-palette-alice-blue` r10 "{n} offers from other sellers from {price}" |
| 10 | Product Features (A+) | `SfProductFeatures` (exists) | collapsed 610 tall, 229 white fade, View More expands |
| 11 | Sponsored brand carousel | `SfSponsoredBrandCard` (exists) | outer `--nk-color-bg-subtle` r16, logo tile, "Shop {brand}", `Badge` "Ad", 216-wide cards, h-scroll |
| 12 | Frequently bought together | `SfFbtCard` | sentence-case title, three equal tiles, "Buy all for {total}" |
| 13 | Ratings & Reviews | `SfReviewsCard` | score 22/800, AI summary, Photo Reviews strip, each review its own bordered r16 card (`--nk-color-border`), "Verified Buy" |
| 14 | Similar Products · Top products in {category} | `SfRecommendations` + 134-wide `SfRecoCard` | "Ad" tag on sponsored cards; h-scroll |
| — | Footer | see Footer per state | |

`SfAdditionalInfo` has no counterpart in the Storefront OOS design: leave it out of `pdp/oos`. Still to build for `pdp/oos`: `OosBanner`, `SuccessorChin` and the OOS / unavailable content flags (none exist in `src/flows/pdp` today).

## Footer per state

| State | Footer | Spec |
|---|---|---|
| In stock (`pdp/detail`) | `SfAtcBar` | QTY · Buy now (adds, then `nav.push('checkout')`) · Add to cart (loading Lottie) → `pdp/added`; "Back to top" past one screen; yellow "added in your cart" strip when in cart; `<TabBar active="home" />` drawn under the bar |
| In stock (Storefront Case 1 `2316:17084`) | `SfAtcBar buyNow={false}` | QTY + full-width Add to cart, then the tab bar |
| Out of stock (Case 3 `930:259766`) | build `OosBanner` + `SuccessorChin` — **no `SfAtcBar`** | banner 40h white, top radius 16, "This item is currently out of stock" `--nk-type-text12-semibold-lh14` `--nk-palette-danger-red`; chin 100h: label `--nk-palette-deep-purple`, title and price `--nk-type-text13-medium-lh18`, 55×70 image, 34px chevron; slides in once the in-page newer-model card leaves the viewport |
| Not available at location (Case 2 `908:251666`) | same as out of stock | banner copy "This item is not available at your current location"; the in-stock sections stay |
| Alt OOS (`1644:39023`) | one compact row | red OOS icon tile + "OUT OF STOCK" / "View Newer model"; build only when asked |

The tab bar under the footer is drawn by `SfAtcBar` itself (`<TabBar active="home" />`), not by the Navigator (which shows `TabBar` only on tab roots); it hides on scroll with `useTabBarScrollHide`.

## Data (`data.ts`)

- `pdpContent(product)` returns `PdpContent` (live products via `liveContent` in `src/flows/pdp/data.live.ts`, mock ones via `mockContent`); `productById(id)` from `src/data` (falls back to the first product). Default product `IPHONE_17_PRO_ID`; `p3` is the fashion product that needs a size.
- Add to `PdpContent` for the Storefront design: `outOfStock?`, `unavailableAtLocation?`, `sponsoredRow?`, `aplusImages?`, `sponsoredBrand?`, `seller.subtitle?`, `seller.offerCount` / `seller.offerFrom` (Figma analysis §6 → `data.ts`). The successor is derived today by `successorFor(product)` (`src/flows/pdp/components/storefront/SfNewerModelCard.tsx`: same brand + line, next generation / tier), so it is always a real product in `src/data`.
- Copy lives in `copy` (`data.ts`): reuse the existing keys; add the Storefront strings ("Product Details", "Overview", "Visit Store", "Newer model available", "This item is currently out of stock", "Product Features", "View More", "Ad", "Similar Products", "Top products in {category}"). Prices through `Price`, `Money` or `money()`; counts not abbreviated in "(34244 reviews)".

## Navigation

| From | Action |
|---|---|
| Back · search | `nav.back` · `nav.push('search/search')` |
| Brand strip / Visit Store | `nav.push('plp/listing', { query: content.brand })` |
| Variant option of another SKU | options loader, then `setProductId` in place (no navigation, scroll kept) |
| Other delivery option | `nav.replace('pdp/detail', { productId })` (`fade`) |
| Add to cart | `addToCart` (`useDemoStore()`) → `nav.sheet('pdp/added', { productId, qty })` (a size is always preselected on the PDP) |
| Buy Now · View cart (added sheet) | `nav.push('checkout/checkout')` · `nav.push('cart/cart')` |
| Newer model card, successor chin | `nav.push('pdp/detail', { productId: successor.productId })` (`push`, so back returns to the old model) |
| Sponsored row, recommendation card | `nav.push('pdp/detail', { productId })` |
| Delivery card noon One banner | `nav.push('noonone/landing', { source: '/pdp' })` |
| Free gift "View eligible products" | `nav.push('plp/listing', { query })` |
| Bestseller CTA / tag | `nav.push('plp/listing', { query: leafName(categoryId) })` |
| Share, seller name, offers row, 360, size guide | `nav.toast(...)` until a target screen exists |

## Motion

| Moment | Kit |
|---|---|
| Header turns solid | `useScroll({ container: scrollRef })` + `useMotionValueEvent`, threshold `pdpTokens.headerChangeAfter − headerInnerHeight`, fade `pdpTokens.headerFadeMs` |
| Scroll (bappzaar 1:1, `src/flows/pdp/MAPPING.md` → PDP scroll) | gallery pinned by CSS sticky for one image height + shrink `pdpTokens.parallax`; tab bar hides on scroll (`useTabBarScrollHide`, `src/kit/tabBarScroll.ts`) and the sticky ATC bar (`Screen overlay`, `.stickyBar`) follows it; Back to top after one screen height, no transition; overview accordion open → +120 / 150ms |
| Gallery pager | `SfGallery` drag + spring 300/34, `PageController` dots (`pdpTokens.dots.ms`); port parallax `pdpTokens.parallax` |
| Accordions | local `Accordion` in `components/Sections.tsx`: height auto + chevron 180°, `pdpTokens.accordionMs` |
| Successor chin | `useInView` (motion/react) on the in-page newer-model card; `AnimatePresence` `y: '100%'` → 0 on `spring.sheet`; the OOS banner stays put |
| A+ View More | height 610 → auto with `tween('medium', 'out')`, fade the gradient out |
| ATC | loading Lottie for `pdpTokens.atcLoadingMs`, then the sheet (`spring.sheet` from the Navigator's `SheetLayer`) |
| Back to top / in-cart strip | `spring.press` / `spring.gentle` in `SfAtcBar` |
| Presses | `Pressable` (`spring.press`) or `.iconBtn:active` opacity |
| Section entry | none: no `Stagger` on PDP sections |

## States

| State | Spec |
|---|---|
| In stock | full section list, `SfAtcBar` |
| Out of stock | no price block, no delivery / variants / payments, OOS footer with chin |
| Not available at location | in-stock sections, OOS footer with the location copy |
| Size missing (fashion, `p3`) | ATC opens `pdp/variants` with the warning |
| In cart | yellow strip above the ATC bar with the count |
| Sponsored | `Badge` "Ad" on the sponsored row, brand carousel and sponsored cards |
| Empty section data | hide the card (no empty title) |

## Acceptance

- [ ] Routes registered; `/pdp` opens `pdp/detail`, `/pdp/oos` opens the new screen; `check:routes` clean.
- [ ] Section order as above for the target; every section a white r16 card inset 12, 12 apart.
- [ ] Size taps switch locally; option taps show the options loader and switch in place (`src/flows/pdp/MAPPING.md` → Variant selection behaviour); ATC → `addToCart` → `pdp/added` sheet; newer model and chin `push` the successor.
- [ ] Out of stock / not available: no `SfAtcBar`, no price; banner + chin; chin appears only after the in-page card scrolls out.
- [ ] `pdp/detail`, `pdp/variants` and `pdp/added` unchanged unless the user asked to restyle them.
- [ ] Tokens only (`lint:tokens` 0 for `src/flows/pdp`); new values are `pdp*` flow tokens.
- [ ] Every sponsored element badged "Ad"; prices with the dirham sign.
- [ ] Screenshots read at top and scrolled (`--scroll 1500` and further), compared with `930:259766` (and `2316:17084` / `908:251666` for the other states).
- [ ] `source` = `Figma 2ldJbjmQq4RkhnrNFCfXQB · 930:259766`.
