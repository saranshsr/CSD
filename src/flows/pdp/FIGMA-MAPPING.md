# PDP — Storefront Figma → kit mapping

Source: Figma **Storefront** `2ldJbjmQq4RkhnrNFCfXQB` · `3499:75115` "PDP" (in stock, 375 wide). `pdp/detail` renders this design over the bappzaar `NoonProductDetails` behaviour (see `MAPPING.md` for the port): same data (`pdpContent`), sheets (`pdp/variants`, `pdp/added`), in-place variant switching (MAPPING.md → Variant selection behaviour), wishlist / share, Visit Store (`plp/listing { query: brand }`).

Components: `src/flows/pdp/components/storefront/Sf*.tsx` (one CSS module each). Tokens: `pdpFlowTokens` = the port's values merged with `tokens.sfA` … `tokens.sfE` (keys `pdpSfa…` … `pdpSfe…` → `--nk-{color,type,layout,shadow}-pdp-sf{a..e}-*`). Every system icon is `OriginIcon` (Origin Design System); the only non-Origin glyphs are brand marks (express / rocket / noon One, MarketplaceTag), the 360° glyph (`src/assets/pdp/storefront/a/rotate-360.svg`) and the AI sparkle (`Asset aiSummarySparkle`).

## Sections, top to bottom

| Figma node | Section | Component (replaces) | Notes |
|---|---|---|---|
| 3499:75879 | Header: back · search · wishlist · share, 40px round white-90% buttons | `SfHeader` | gradient white → transparent; solid white + 1px border after 100px; search keeps bappzaar's `NoonExpandableSearch`: the 40px round button springs open (400 / 30 / 1) to a full-width "Search" pill (14/600 blue-gray/900) when the header turns solid and folds back at the top (→ `search/search`) |
| 3499:75118 | Gallery 375×512, dots (6 / 14×6 active), "noon's exclusive" catalog tag, 360° button | `SfGallery` | `pdpSfATokens.galleryRatio` 512/375; pager + scroll-linked pin/shrink kept; 360° toasts |
| 3499:75133 | Main info: lavender brand strip (verified · brand · Visit Store), white info card r20 top-end: title 16/500, rating pill + "(N reviews)", Prepaid Only, price 22/700 + strike + % + "(incl. of VAT)", deal tag + lowest-price nudge, dashed coupon chips, bestseller row | `SfMainInfo` | coupon tap copies the code; Prepaid Only when price ≥ 3000; nudge falls back to "Lowest Price in 30 days" when `was` |
| 3499:75228 | Sponsored product row 351×35 + Ad tag | `SfSponsoredRow` (new) | item = first FBT id, else an express product from another category |
| 3499:75275 → PDP Redesign `xPr9Ln37JGSBGvNtrsyD0y` · 3583:109620 | Delivery Information component set (5 variants, below) | `SfDeliveryCard` (`DeliveryCard`) | `variant` prop, auto from data (`deliveryVariantFor`); force with `pdp/detail?delivery=<variant>`; all five on `pdp/deliveryVariants` |
| 3499:75229 | "Newer model available" strip (lavender → white), 55×68 thumb, title, price, round chevron | `SfNewerModelCard` (new) | `successorFor(product)` (same brand + line, higher generation / next tier); `nav.push` |
| 3499:75276 | Variant picker: Model pills, Colour image tiles, Memory tiles (% OFF · price · was), Version pills + Learn more; dashed unavailable | `SfVariantsCard` (`VariantsCard`) | same selection logic and props |
| 3499:75389 | Trust markers: 80-tall tiles, blue `#2567E7` Origin glyphs, 12/600 labels | `SfTrustCard` (`ReinforcementCard`) | ≤ 3 tiles share the row, ≥ 4 scroll at 94 |
| 3499:75412 | Payment offers: 253×64 cards (ENBD cashback, tabby …) | `SfPaymentOffers` (`PaymentsCard`) | ENBD card is a demo constant; logos from data |
| 3499:75478 | Product Details: Overview / Highlights / Specifications accordions (`--nk-color-bg-subtle` rows, 44h) | `SfProductDetails` (`OverviewCard`) | height 0 ↔ auto, chevron rotates |
| 3499:75479 | Extended warranty: two plan cards on alice-blue, USP rows, Select | `SfExtendedWarranty` (new) | shown when `content.additional` has a warranty row; demo plans priced off `product.price`; partner/USP ticker 2.5s |
| 3499:75536 | Additional Information rows (#F9F9FB, 44 min) | `SfAdditionalInfo` (`AdditionalInfoCard`) | same rows + toasts |
| 3499:75632 | Bestseller row: mint gradient, medal, "Bestseller #N in {category}" | `SfBestsellerRow` (`CategoryBestSellerCta`) | rank parsed from `bestSellerTag`; → category PLP |
| 3499:75647 | Seller widget: 48 logo box, "Sold by", rating + positive pills, trust chips, subtitle row, "N offers from other sellers" | `SfSellerCard` (`SellerCard`) | offers row → `onOffers` |
| 3499:75700 | Product Features (A+): banners + copy capped at 610, fade + View More | `SfProductFeatures` (new) | images from `aplusImages` → gallery images; View More / Less |
| 3499:75701 | Sponsored brand carousel ("Top quality products · Shop {brand}" + Ad) | `SfSponsoredBrandCard` (new) | `sponsoredBrandProducts(product)`; header → brand PLP |
| 3499:75702 | Frequently bought together: tiles with check discs and + joins, "Buy all for …" | `SfFbtCard` (`FbtCard`) | toggle tiles, add selected to cart |
| 3499:75703 | Reviews: score 22/800 + emerald stars, AI summary (collapsible), Photo Reviews, Top Reviews cards (Verified Buy, variant chips, Helpful), All customer reviews | `SfReviewsCard` (`ReviewsCard`) | more/less, helpful votes kept |
| 3499:75876 / 75877 | "Similar products", "Top products in {category}" rails: 134-wide cards, 3:4 media, Ad, quick add, rating, price, nudge, express ETA | `SfRecommendations` + `SfRecoCard` (`Recommendations` / `RecoCard`) | Similar = other brands, Top = same brand/category; `sponsored` shows the Ad tag |
| 3499:75904 | Bottom: QTY 48 box + "Add to cart" (cta, r10), tab bar | `SfAtcBar` | `interceptAdd` → variants sheet, add → `pdp/added`; `<TabBar active="home" />` under the ATC; Buy Now dropped (not in the design) |
| 3499:75878 | Back to top pill | inside `SfAtcBar` | floats above the bar once scrolled past `pdpTokens.backToTopAfter` |

## Delivery information variants (PDP Redesign `xPr9Ln37JGSBGvNtrsyD0y` · `3583:109620`)

| Figma variant | `variant` | Body | Auto when |
|---|---|---|---|
| Variant6 (8238:299758) | `crossSell` | white express box (1px `--nk-color-border-subtle`, r12, pt12): logo + estimate (+ kept countdown chip) · "Faster Delivery Options" grey foot · noon One banner (`--nk-color-text-primary` 44h r12, 14/600 `--nk-color-bg-subtle` "Get it today for free with" + noon One logo + chevron, light streak) · "Other Delivery Options" grey r12 box | buying options include another marketplace lane |
| No MP cross sell (3583:109621) | `noCrossSell` | the same without "Other Delivery Options" | only faster (rocket) options |
| market (3583:110101) | `market` | grey r12 box py12: `MarketplaceTag kind="market"` + "Get by **{date}**" (14/400 + 600) · chip | not express / rocket |
| express only (3583:110533) | `express` | the same with the express artwork | express / rocket, no buying options |
| Global (3583:110179) | `global` | bordered grey box: `MarketplaceTag kind="global"` row + "Free Shipping over Ð99" strip (`--nk-color-pdp-sfb-global-strip`, 13/500 `--nk-color-text-muted`, world map `src/assets/pdp/storefront/b/global-map.webp` at 20%) | forced only (no Global data yet) |

Shared: card `Card` (white r16 p12, gap 12), title 15/700/17 `--nk-color-text-strong`; "member" mark (noon One logo + 12/400 `--nk-color-text-secondary`) for members in the cross-sell variants; countdown chip "Order in N hrs" = `--nk-palette-light-brown-shade` bg, `--nk-palette-dark-orange` 12/600/19.6, r4, px3; chevrons `OriginIcon chevron-down / chevron-right` 20. Behaviour kept: buying-option rows `nav.replace` to their SKU or toast, accordions start closed and expand (height auto), the banner opens `noonone/landing` (replaces the old `VipPreference` banner).

## Values

Per-section measurements (node → kit token → value) are in the header comment of each `Sf*.tsx` and its tokens file; the shared rules:

- Cards: white, `--nk-radius-r16`, padding `--nk-space-s12`, margin `0 12px 12px` (`Card` from `components/Sections.tsx`); titles 15/700/17 `--nk-color-text-strong` (`--nk-type-pdp-sf*-section-title`).
- Sub-surfaces: `--nk-color-bg-subtle` (accordion rows, info rows), `--nk-palette-alice-blue` (offers, warranty), `--nk-color-bg-pill` (rating pills).
- Selected tiles: 1px `--nk-color-border-info`; unavailable: dashed `--nk-color-border-strong` on `--nk-color-bg-subtle`, `--nk-color-text-tertiary`.
- Ad tags: `Badge` bg `--nk-palette-border-color`, colour `--nk-color-price-old`.
- Prices: `money()` / `currency` (dirham sign).

## Known gaps

- Figma italics (Figtree Italic) and letter-spacing are dropped (kit font, no tracking tokens).
- Data the design shows but the mocks don't have: real successor field, A+ artwork, warranty plans, seller offer counts, "Other Delivery Options", brand logo for the sponsored brand card — all derived with fallbacks (see each component).
- Icon sizes off the 24/20/16 grid were kept where the Figma draws them (medal 40, store 30, chevrons 12/14).
- The live default iPhone 17 Pro has no `was` price or catalog tag, so the struck price / % and "noon's exclusive" show on mock products (e.g. `p2`) only.

## New PDP (All flows 64:5571) — group E

Figma `Af34gfmhQ1D0wstXUEHSIF` · 64:5571 "New PDP", product rails. Component: `SfRecommendations` (`variant`), card `SfRecoCard`.

| Figma | Kit | Values |
|---|---|---|
| 89:62853 "More from Apple", 89:62854 "Customer also viewed" (frame 89:62852, 375 wide, white) | `SfRecommendations variant="bleed"` | full-width `--nk-color-bg-surface` band, py12; title 15/17/700 `text-strong` −0.28, 14 from the screen edge (12 + px2); cards from 12, gap 12, pt16, scroll to the screen edge (Figma clips the third card at 363; the app rail scrolls full width). Two consecutive bleed rails join into one band: 12 white between them (`.bleed:has(+ .bleed)`), then 12 page gap before the next card |
| 89:62855 "Products related to this" (layer "Top products in chargers") | `SfRecommendations` (default `card`) | white r16 card (Sections `Card`), p12; title px2; cards from 12 inside the card |
| Product card (134, 0.5 Blue-Gray/200, r10) | `SfRecoCard` (unchanged structure) | 3:4 media (2% cobalt), Best Seller / catalog tag 20h Emerald/900 br-r10, heart 16 in white-20% circle 6/6, Ad 10/11 Blue-Gray/200 r4 6/6, quick add 24 plus white 1.2 border r8; name 13/17 500 #212121 −0.14, 2 lines; rating 18h pill; price 15/16 700 Blue-Gray/900 +0.07, was 12 Blue-Gray/500 struck, % 12/600 Emerald/800 (−0.12); nudge flipper 16h 12/16 Blue-Gray/700 −0.12; ETA "express Today" 122 × 18 (`src/assets/pdp/new-pdp/eta-express-today.svg`) |
| Nudge icons (Nudges - HP) | `nudgeIcon` | lowest price `arrow-down-circle-filled` #DE1C1C (`danger`, was emerald), free delivery `truck-filled` Emerald/800, selling out fast `flash-thunder` #D62925 (`pdpNpeNudgeUrgent`), units sold `cart-check-filled` Emerald/800 (was text-secondary), bestseller `verified-filled` Emerald/800 |

bappzaar (NoonRecommendations): `same_brand` → "More from {{brandName}}" (`copy.moreFrom`), `other_brands` → "Customers Also Viewed" (`copy.customersAlsoViewed`), sponsored → "Products related to this" (`railCopy.relatedSponsored`, `data.npE.ts`, `noon_recommended_sponsored_pdp`). Card tap → `pdp/detail` (push), heart → wishlist toast, "+" → add to cart toast, catalog tag (`product.tag`, e.g. Best Seller) top-left.

## New PDP (All flows 64:5571) — group D

Figma Af34gfmhQ1D0wstXUEHSIF · New PDP: Product features 64:5729, sponsored brand 64:5730, Extended warranty 64:5731, FBT 64:5732, Ratings & Reviews 64:5733. These are the same components as the Storefront file (3499:757xx), so the Storefront `Sf*` builds stay; deltas applied:

| Section | Delta → change |
|---|---|
| Product features 64:5729 | Body is A+ brand creatives (two 1799 × 4096 banners, r8), not product photos → `SfProductFeatures` uses `content.aplusImages`, else `demoAplusImages` (`data.npD.ts`, `src/assets/pdp/new-pdp/aplus-{1,2}.webp`, 984 wide). bappzaar A+ is SD rich content (MAPPING.md §14), so this stays demo content. Cap 610, white fade, "View More ⌄" / "View Less" unchanged. `product` prop now optional (unused). |
| Sponsored brand 64:5730 | No delta (logo tile shows the brand name; Figma has the TECV wordmark image). |
| Extended warranty 64:5731 | Plan 2 USP icons: Date (`calendar-check`) · accident (`warning-triangle`) · Delivery (`truck-noon`), as plan 1 (was check-shield / infinity). Ticker "by PROTECT4LESS → Chosen by 100+ people → Authorised repair centers → Genuine parts guaranteed" unchanged. |
| FBT 64:5732 | "HP ETA" is the express · Today pill → `eta-express-today.svg` at 15 high (same artwork as the rails' 122 × 18) instead of `ExpressBadge`. |
| Ratings & Reviews 64:5733 | AI title "{n} reviews, summarised by noon AI" ("summarised by" solid indigo 92%, " noon AI" gradient), no chevron (the row still toggles). Comment toggle ".. More" / "Less" 12/14 500 Blue/700 (was 14/500 dark "… more"). Helpful: 12px thumb, outline → filled when voted, label stays Blue-Gray/1000 (was 16 filled, blue when voted). Verified Buy tick 12. |

## New PDP (All flows 64:5571) — group B

Figma Af34gfmhQ1D0wstXUEHSIF · 64:5571 "New PDP". Tokens in `tokens.npB.ts` (`pdpNpb*`), copy / mock data in `data.npB.ts`, asset `src/assets/pdp/new-pdp/b/gift-hamper.webp`.

| Figma node | Component | Mapping |
|---|---|---|
| 64:5589 Ads (Big Ad) | `SfSponsoredRow` | now the 78-high Big Ad: white r14 card, inner 1px gray/200 frame, p4 / end 12, gap 12; 51.3 × 70 r9 thumb on 3% cobalt (image multiplied at 3.42 / 4.67); title 14/500/18 #212121 two lines; price 16/700 + struck was 12/400 bluish grey + "% OFF" 12/600 irish green + express 47 × 14; "Ad" 6 from the bottom-end corner. Tap → that PDP (unchanged). Was the 35-high Storefront row. |
| 64:5590 Delivery information | `SfDeliveryCard` | same component / `variant` prop. `deliveryVariantFor` now returns `noCrossSell` for an express lane too (faster lanes from `fasterLanesFor`: rocket buying options, else the Figma Today + 14.00 / Tomorrow [before 12pm] + 12.00). Express row reads "Get by **date**" with the countdown chip at the end; "Faster Delivery Options" starts **open** (chevron up) and lists lanes as text rows (14 regular + 14/600 day, 13 light note, "+ ₳ 14.00" 12/600) over a rule, then the white "Select these options on checkout" callout (info-circle 16). A lane that is another offer still `nav.replace`s. noon One banner / member mark unchanged. `?delivery=` variants unchanged. |
| 84:8406 Newer model available | `SfNewerModelCard` | already matches (same instance as Storefront 3499:75229); no change. |
| 64:5591 Free gifts for you | `SfFreeGifts` (new) | bappzaar `NoonFreebie`: white r16 card pt16 pb12 gap 12, 16/700 title; rail px12 gap 8 of 284-wide cards (one card fills the row), 1px blue-gray/300 r12 p8: 56 × 55 image box with the sapphire "Free" ribbon (13/16 bold, drop shadow), 15/600 title, 12/500 subtitle, "View eligible products ›" 13/600 accent → `plp/listing` (bappzaar link_url → catalog). Data `freebiesFor(product)` (phones: two Pepsi hampers). Copy: noon_free_gifts_freebie, noon_free_freebie, noon_view_eligible_products_text. |
| 64:5592 Variant picker | `SfVariantsCard` | same props / selection; options refetch under a loader and switch in place (MAPPING.md → Variant selection behaviour). Group titles 14/600/20; card pb 16. Model Name and Version are text pills even when options carry prices (hug, 14/500, padding 12, scroll); colour cards: 78 image (selected 88 full-width, 12/600 label; unavailable 80, muted); memory tiles r16 in all states: name 14/600 · dashed rule · price 13/600/20 + was 12 struck (no currency) · "% OFF" 12/600/18 success; unavailable "OUT OF STOCK" 11/600 muted. Selected border 1.5px pale azure + shadow. |

Not drawn in Figma but kept: noon One "member" mark only for members, the countdown chip only when the API sends `orderWithinMin`, "Other Delivery Options" accordion in the crossSell variant, size group + Size Guide for fashion.

## New PDP (All flows 64:5571) — group C

Figma `Af34gfmhQ1D0wstXUEHSIF` · `64:5571` "New PDP"; tokens `tokens.npC.ts` (`pdpNpc*`), copy / mock `data.npC.ts`, assets `src/assets/pdp/new-pdp/`.

| Section (node) | Delta vs Storefront → change |
|---|---|
| Payment offers 64:5693 | First card's logo is the ENBD noon VISA card image (`pay-enbd-card.png`, 63 × 42 cover in a 60 × 40 r6 box, 1px below centre) instead of the payment-card-clock glyph. Rest unchanged (253 × 64 cards, SD payment items with their logos). |
| Trust markers 64:5694 | Icon 20 (was 24); tiles, 12/600/14 label and the ≥ 4-scroll rule unchanged. |
| Product Overview 84:8031 | Title "Product Overview" (`noon_product_overview`), first accordion "Description" (`noon_description`), shown only with a description. New `AiSummary` = bappzaar `NoonAiOverviewSummary` + `NoonAiOverviewTitle`: r12 block, 117.94deg persian-blue → purple 5% over white, py 12 gap 8; "Summarised by AI" 14/700 in the 90deg #4146CE → #BF3DEB text gradient with a 20px white shimmer sweeping −20 → width + 20 every 2 s (ease-in-out; off under reduced motion); items gap 10, px 12, 16 × 20 sparkle (`overview-ai-star.svg`) + "**{title}:** {description}" 14/20 (title 600 blue-gray/900, text blue-gray/700). Data = `ai_overview` (mock `aiOverviewFor(product)` by category: Mobiles, Mobile Accessories); without one only the accordions render, as in the app. `SfProductDetails` takes an optional `product` (and `aiOverview`). |
| Additional Information 64:5696 | Exact Figma glyphs in `src/assets/pdp/new-pdp/icons/` (MaskIcon, tinted with tokens): `verified-filled-24.svg` (#2567E7 `--nk-color-pdp-sfc-trust-icon`) for TDRA, lsicon `sales-return-filled-21.svg` (#0076FF `--nk-color-link`) for the warranty / delivery / returns rows, `mini-chevron-right-20.svg`. |
| Bestseller 64:5727 | Padding 6 · 12 · 6 · 4, gap 10; 52 × 50 medal frame with the streamline star badge (`bestseller-badge.svg`, #0A4F4A, 32 at 10 / 9) and the rank 16/700 white in the disc; "in" upright (was italic); text block 2 from the medal. |
| Seller widget 64:5728 | Seller logo restored (`seller-logo.webp`, NoonSeller: 48, 1px #F3F5F7 r10, cover) instead of the shop glyph; card shadow/sm 0 1 3 rgba(14,14,14,.07); exact Figma glyphs (`src/assets/pdp/new-pdp/icons/`): rating star `rating-star-12.svg` (12 × 11.5, emerald), chips `sales-return-filled-16.svg` for low returns and `solid-star-16.svg` for the rest (blue-gray/700), offers row `micro-tag-16.svg` mirrored, `mini-chevron-right-16/20.svg`. Logo: the Figma image (`seller-logo-apple.png`, Apple mark) for Apple's official store, NoonSeller's shop glyph otherwise. |

## New PDP (All flows 64:5571) — group A

Figma `Af34gfmhQ1D0wstXUEHSIF` · header 64:5737, gallery 64:5573, Main-Info 64:5587, bundle card 84:8457, footer 104:20387 / back to top 64:5736. Tokens `tokens.npA.ts` (`pdpNpa*`), copy + combo rule `data.npA.ts`, assets `src/assets/pdp/new-pdp/` (`bundle-combo.gif`, `pick-sparkle-1…4.svg`, `bestseller-badge.svg` shared with group C).

| Figma | Code | bappzaar behaviour |
|---|---|---|
| Header 64:5737 (40px round buttons, white → transparent 40%) | `SfHeader` unchanged (already this anatomy) | NoonExpandableSearch, wishlist, share |
| Gallery tag "noon's Pick" 64:5584: 24h r8 #666 → black, 1px #4C4C4C, 14/500 gold gradient #FEF6D6 → #FDCA2B → #FEF6D6, four sparkles | `SfGallery` `.tag` + `.sparkle[data-n]` (insets in % of the tag box) | catalog tag = `product.tag` |
| Main-Info brand strip: 17px verified | `SfMainInfo` | Visit Store → brand PLP |
| Rating pill: 12px star, "4.3" 13/600 + "(" 13/600 + "126 reviews)" 13/500 #343D54 | `.score` / `.count` / `.countParen` | tap → reviews |
| Price "47% OFF" (was "47%") + "(incl. of VAT)" | `sfCopy.pct` | PdpPrice |
| "Saving Đ45 with Combo" 32h r8, #EAF4FE → white 51%, 18px combo glyph, 14/500, info 16 | `.combo` (shown when `combosFor()` has a combo) | NoonBundleBanner (banner_text, savings) → NoonBundleHelpScreen; here a toast |
| "500ml \| Đ2.35/ml" chip: bg-subtle r4, px 6 py 4, 14/14 #343D54, 12px #D0D4DD dividers | `.highlights` from `content.keyHighlights` | **NoonKeyHighlights restored** |
| Mega Deal + "Lowest Price in 30 days" (14px arrow-down-circle #CC285C) | `.deal` / `.nudge` | deal_tag + NoonNudgeTag ticker |
| Coupon chips: #F6FEFD, dashed emerald-700 40%, percent badge 24 #1F7A74, "Extra 15%, CODE: ENDD15" 14/600 one line, 12px chevron | `.coupon` | discount_tags, tap copies the code |
| Bestseller row: pl 12 pr 8, 16px star badge #0A4F4A with the rank 10/700 white | `.bestseller` / `.rankBadge` | best_seller_tag → category PLP |
| "Bundle up & Save upto Đ20 off · 2 combos available" 84:8457: r16, 1px white, white → #EBF4FF 99.7°, p 8·8·8·12, 40 icon box (30 glyph), 15/600 + 15/700 #0A49B8, 13/20 #475067, 20 chevron | new `SfBundleCard` | NoonAvailableBundlesTag → NoonAvailableBundlesOverlayScreen; here `onPress` (default toast) |
| Footer: QTY 48 · "Buy now" #041F62 47h r10 14/700 · "Add to cart" accent | `SfAtcBar` `.buyNow` (`buyNow` prop, default on) | **Buy Now restored**: NoonAddToCartQuantity.onBuyNowPress (Buy Now overlay) → adds qty, `nav.push('checkout')`; size missing → variants sheet first |

Combos (demo rule, `data.npA.ts`): one per FBT accessory (`content.fbt`, max 3), saving = 15% of the accessory price; "upto" = the largest. Not shown in this Figma, so not restored: the best-price block (`content.bestPrice` still feeds the derived "Extra n% off" coupon chip), the gallery video slot in the dots.
