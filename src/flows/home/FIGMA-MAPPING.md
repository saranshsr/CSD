# Home — Figma mapping

## Home top · Eid (All flows 89:34398)

Figma file `Af34gfmhQ1D0wstXUEHSIF` ("All flows"), frame `89:34398` (375 × 679). bappzaar = `~/bappzaar` `origin/master` (read-only). Values are Figma points on the 375 frame; the kit device is 390, so fixed sizes stay fixed and the rail peeks more. "Status" says what we did: **match**, **Figma** (Figma wins over bappzaar), **by request** (user deviation), **kept** (existing kit value).

### Sections

| Section | Figma node | Kit |
|---|---|---|
| Header background (teal gradient, pattern, 3 lanterns, mint band) | `89:34430` (`89:34431` mask group; lanterns `89:34436`, `89:34511`, `89:34586`; seam glow `89:34721`) | **by request: not used** — `HomeHeader` keeps the 2025 light-blue gradient + glow / swoosh / stars (`homeHeaderGradient`, Figma `iRE9RwO94eMAyW3j3XKNXW · 1337:6688`) |
| Marketplace switcher | `89:34666` (image "switcher 1", 15 MINUTES tile) | **by request: kept** — `ExperienceSwitcher` unchanged |
| Address row ("Home ⌄" + line, no wishlist) | `89:34668` | `HomeHeader` address row, `OriginIcon` `home` filled 18 + `chevron-down` 16 |
| Search ("Search for “Maybelline”" + camera) | `89:34685` | `SearchBarButton variant="2025" height={48}`, rotating brand |
| Hero Section Widgets carousel | `89:34722` (cards `89:34732`, `89:34742`, `89:34751`, …) | `EidBanners` (`components/EidBanners.tsx`, data `data.eid.ts`) |
| Nike video hero card | `89:34732` (`I89:34732;2600:18935` Tag, `;2600:18936` Video actions) | `HeroCard` |
| Areej brand module | `89:34742` | `BrandCard` tone `dark` |
| WHOOP brand module (off-canvas in the frame) | `89:34751` | `BrandCard` tone `light` (reuses `assets/home/tabs/content/all-cms/whoop-*`) |
| Soundcore full-width ad | `89:34782` / image `89:34783` | `EidAdBanner` |
| Cards 4–8 of the rail (`89:34755` … `89:34781`) | off-canvas placeholders, no renderable creative | not built |

### Header (kept, see Status)

| bappzaar component | Property | bappzaar value | Figma | Kit | Status |
|---|---|---|---|---|---|
| NoonApp.ts `noon.NoonHomeScreen` | status bar | `dark`, drawBehind, transparent | dark ink | `useStatusBar` default (tab-driven ink removed) | match |
| NoonHomeToggle `addressSelectorWrapper` | wishlist | 40×40, only when signed in | none | none | Figma |
| NoonAddressSelector | label / line | 18 bold `#1D2539` / 16 lh22 `#343D54` | 15.9/21 SemiBold / 13.9/18 Regular, black | `text16-semibold-lh20` (lh 21) / `body`, `--nk-palette-black` | Figma (kept) |
| NoonSearchBarButton `container` | h · r · border · pH · gap | 52 · 12 · 1 `#D7DAE3` · 12 · 8 | 48.5 · 12.25 · 1 `#E2E2E2` · 12.2 · 12.2 | `SearchBarButton variant="2025"` 48 | Figma (kept) |
| NoonSearchBarButton `text` | size / weight | 17 / 500 `#1D2539` | 15.2 / 500 `#1F1D1D` | 2025 variant | Figma (kept) |
| NoonHomeToggle / switcher | top padding motion | 300 ms `Easing.out(quad)` | — | `switcherMetrics.duration` 0.3, `[0.5,1,0.89,1]` | kept |
| react-native-collapsible | address fold | 300 ms easeOutCubic | — | `tween('medium','out')` | match |
| NoonHomeToggle (CMS `background`, `theme`) | festive look | CMS image / lottie / gradient; no hard-coded Eid code | teal `#3297AD → #EFFAF7` + lanterns | not used | by request |

### Hero Section Widgets carousel (`89:34722`)

| bappzaar component | Property | bappzaar value | Figma | Kit token / value | Status |
|---|---|---|---|---|---|
| useNoonDynamicCarouselLayout | card size | `W / numPerView − gap`, CMS numPerView 1.4, gap 15, ratio 150 → 263.67 × 395.67 @390 (hook default 1.7 / 12) | 220 × 330 | `homeEidCarousel.cardWidth/Height` 263.667 × 395.667 | match (live CMS; was Figma) |
| useNoonDynamicCarouselLayout | gap = side padding | CMS 15 | 12 (x 12, next at 244) | `homeEidCarousel.gap/gutter` 15 | match (live CMS) |
| NoonDynamicCarouselModule | snapping | `snapToOffsets` centring each card, `decelerationRate` fast | — | CSS `scroll-snap-align: center`, first card `start` at `scroll-padding` 12 | match |
| useNoonDynamicCarouselAutoScroll | autoplay | 3000 ms, only while viewable + app active, stops for good on first drag | — | `homeEidCarousel.interval` 3000, `IntersectionObserver` ≥ 0.5, stops on first pointer / wheel | match |
| (none in bappzaar) | reduced motion | not handled | — | `useReducedMotion()` → no autoplay | kit rule |
| NoonDynamicCarouselModule | infinite loop | 3 copies, rewind on momentum end | — | wraps to the first card at the end | simplified |
| NoonDynamicCarouselCard | card radius / clip | 16, overflow hidden, bg CMS or white, optional 1px border | r16, 1px `#F2F3F7` (light) | `--nk-radius-r16`, `--nk-palette-blue-gray200` | match |
| Pressable (cards) | press feedback | none (plain `Pressable`) | — | `Pressable scale={1}` | match |

#### Hero card (`I89:34732`)

| bappzaar component | Property | bappzaar value | Figma | Kit | Status |
|---|---|---|---|---|---|
| NoonDynamicCarouselCard Ad label | position · bg · text | top 8 right 8 · `rgba(38,38,38,.3)` + 0.2 border · `rgba(255,255,255,.64)`, r6 pH5 | top 8 right 8 · `rgba(255,255,255,.8)` · 10/11 Regular `#666D85`, r4 px4 py2 | `Badge bg=whiteAlpha80 color=textSecondary`, `text10RegularLh11` | Figma |
| NoonDynamicCarouselMedia play/pause | position · padding · bg · radius · icon | bottom 8 left 8 · 6 · `rgba(0,0,0,.6)` · 10 · 20 | bottom 6 left 6 · 6 · `rgba(0,0,0,.64)` + blur 3 · 10 · 20 | `.videoAction`, `homeEidVideoActionBg`, `OriginIcon` `pause-circle` / `play-circle` 20 white | Figma |
| NoonDynamicCarouselPlayableMedia | video | react-native-video, muted, no loop, no controls; plays while viewable unless manually paused; replay at the end | creative image only (no video file) | poster image + working pause / play toggle (`aria-pressed`) | no video asset |
| TouchableOpacity (pause) | press | opacity 0.8 | — | `Pressable scale={0.92}` | kit press feel |

#### Brand module (`I89:34742` Areej, `I89:34751` WHOOP)

| bappzaar component | Property | bappzaar value | Figma | Kit | Status |
|---|---|---|---|---|---|
| NoonDynamicCarouselCard `contentPadded` | padding · gap | 8 · `contentGap` 8 | p8 · gap 8 | `--nk-space-s8` | match |
| (CMS bg) | card fill | CMS | `#3B3207` (Areej) / white + `#F2F3F7` border (WHOOP) | `homeEidBrandBg` / `bgSurface` + `blue-gray200` | match |
| NoonDynamicCarouselMedia | header creative | radius 8 (non full-bleed) | slot 204×152 r8; image 204×255.3 at top −6.78 | `.banner` r8, inline geometry from `data.eid.ts` | match |
| NoonDynamicCarouselProductGrid | grid | 2 columns, `gridGap` 8, 4 products default | 2 × 1 detailed (Areej), 2 × 2 image-only (WHOOP), gap 8 | `.tiles` grid gap 8 | match |
| NoonDynamicCarouselProductCard | image panel | r8, white, `contain`, overlay `rgba(0,0,0,.04)` | 98×124 r8.34 `#F2F3F7`, picture 98×130.67 cover | `.tileImage` r8 `blue-gray200` | Figma |
| NoonCatalogTagV2 | tag notch | h20, pH 8, bottom-end r10, 12/600 white, bg `#0A4F4A` | px4 py2, bottom-end r6.53, 10/12 SemiBold white, `#0F8857` (Areej) / `#A5622B` (WHOOP) | `.notch` `text10SemiboldLh12`, `--nk-radius-r6`, `--nk-palette-deep-green` / `homeTabBadgeBrown` | Figma (local notch; `CatalogTag` is the bappzaar size) |
| NoonDynamicCarouselProductCard | title | 11 / 400 `#404553`, 1 line, mb 2 | B11 Regular white, ellipsis, gap 2 | `text11RegularLh14`, `textInverse` on dark | Figma |
| PriceDiscounted `isCompact` | price | 11, no currency, no "off" | B11 Bold white "dhm 129" + B11 Regular 80% struck "299", gap 3 | `currency` + `formatPrice`, `homeText11BoldLh14`, struck `whiteAlpha80` | Figma (dirham sign) |
| Ad label | position | top 8 right 8 | top 12 right 12 (Areej) | `Badge` at 12/12 | Figma |

### Full-width ad (`89:34782`)

| bappzaar component | Property | bappzaar value | Figma | Kit | Status |
|---|---|---|---|---|---|
| BannerModule | horizontal padding | 15 per side | 12; frame pt 12 pb 8 | `.adWrap` `s12 s12 s8` | Figma |
| BannerModule | ratio | CMS `banner.ratio` | 351 × 88.006 | `aspect-ratio: 351 / 88.006` (scales with the device width) | match |
| BannerContent | radius | 20 | 16.37 | `--nk-radius-r16` | Figma |
| AdBannerModuleV2 Ad tag | label | dark alpha tag, CMS position | baked into the creative (bottom-right) | creative as is | Figma |
| — | image crop | — | left −5.42% top −13.95% w 109.67% h 126.74% | `eidAdBanner.crop` | match |

### Feed order

> Superseded: the feed now follows the live bappzaar home payload — see "Home feed · bappzaar modules" below. Kept for history.

Carousel 4 under the header (its 18 bottom padding kept: 22 from the search bar vs 11 in the Figma), ad 12 below, then the 2025 feed 28 apart: `PromoTicker` → Shop by category → Offers → Bestsellers → Keep shopping → `BrandAdModule` → Selling out fast → `LaunchModule`. Neither the Eid frame (its ticker-like hero strips are hidden layers) nor bappzaar places the cashback ticker elsewhere, so it stays first in the feed after the ad. The old `HeroBanners` (Welcome / sale) and `DepartmentTabs` are not rendered.

### Assets (`src/assets/home/eid/`)

| File | Figma source | Use |
|---|---|---|
| `nike-eid-offer.webp` | `I89:34732;…;89:32750` fill "L" | hero card creative (660 w) |
| `areej-header.webp` | `I89:34742;…;89:32760` "image 350860" | brand header creative |
| `areej-al-oud.webp`, `areej-arabic-aroma.webp` | `…;2331:11784` tile fills | brand tiles |
| `soundcore-liberty-5-pro.webp` | `89:34783` | full-width ad |

## Home feed · bappzaar modules (master ba159e2038182a15f0207ac226e8e9c906a1b042)

Source: `~/bappzaar` `origin/master` (read-only, git objects). Render tree: `marketplaces/noon/screens/NoonHomeScreen/NoonHomeScreen.tsx` → `NoonHomeToggle` (flag `noon_homepage_toggle`; on error or flag off → `DynamicLoaderScreen unstructured="/"`, same feed) → `NoonHomeToggleContent` → `StaticPage` → `src/components/Module/Module.tsx` → `ModuleRenderer.tsx` (= `marketplaces/noon/components/NoonModule/NoonModuleRenderer.tsx`). The module list and order are the **live app home payload** (`GET https://api-app.noon.com/_svc/catalog/api/v3/u/`, page `CPN9LK8GVHVM` / `_homepage`, captured 2026-10-12, X-Locale en-ae); the repo has no home fixture. Kit data: `data.feed.ts` (`homeFeed`, one `switch` in `HomeScreen.tsx`), tokens `tokens.feed.ts` (`homeBz*`, merged in `tokens.ts`).

**Spacing rule (all modules):** `ModuleWrapper` noon branch: `paddingTop = innerPadding.top ?? 0`, `paddingBottom = innerPadding.bottom ?? 0`, `marginTop 0`, `marginBottom = removeExternalSpacing ? 0 : (bottomMargin ?? 24)`, `background = bgColor`; CMS `outerSpacing` and `moduleHeader.outerSpacing` are ignored. `ModuleHeader`: row padding 0 15, margin-bottom 12; title 18 bold `#262A33` (CMS `titleColor` wins), 1 line when `isTruncated`; "View all" 15 bold `#0057FF`, letter-spacing 0.2, + arrow 5 after. No feed gap: the kit's `.feed` has none.

**Status:** **1:1** = built to the bappzaar numbers; **differs** = exists, with the noted difference; **not rendered** = the payload gives it nothing to draw (ad slot filled at runtime, gated floating module) or a repeat of a module already shown.

| # | Module type (CMS name) | bappzaar component | Kit | Status |
|---|---|---|---|---|
| 1 | `interstitialDisplayAd` (homepage-interstitialDisplayAd) | `features/admon/utils/InterstitialDisplayAdUtil.ts` → `noon.AdDisplayAnnouncementScreen` overlay | — | not rendered: no imageUrl / size in the payload, so `presentIfValid` shows nothing |
| 2 | `floatingReviewReminderModule` | `marketplaces/noon/components/Module/NoonReviewReminderFloatingModule` | — | not rendered: signed-in + `new_review_reminder` + `hp-rr/check` API |
| 3 | `videoFloatingModule` (homepage-video-ad-unit) | `src/components/Module/VideoFloatingModule` | — | not rendered: no `videoUrl` in the payload |
| 4 | `adBannerModuleCarousel` (homepage-toggle) | `AdBannerModule` → `AdBannerModuleV1` → `BannerModule.renderSnappedBannerCarousel` → `NoonSlider` | `SnappedBannerCarousel` (`components/BannerCarousel.tsx`) | 1:1 — 341 × 36.9 (`ceil((390 − 15) / 1.1)`, ratio 10.81), inset 15, gap 15, r0 (removeCurvedCorners), 3000 ms auto, 450 ms out-cubic, 0.85 fade, loop; creatives `bz/welcome-strip-01` + `categories/ad-pre-search-banner` (the other 4 slots are ads) |
| 5 | `noonDynamicCarousel` (homepage-hero-slider-banner-vertical) | `marketplaces/noon/components/NoonDynamicCarouselModule` + `hooks/useNoonDynamicCarouselLayout.ts` | `EidBanners` | differs → fixed: geometry now the live CMS layout (numPerView 1.4, gap 15, ratio 150 → 263.67 × 395.67, gap = gutter 15); Nike / Areej / WHOOP creatives kept (user decision; the live slides are other campaigns) |
| 6 | `bannerModuleScroller` (homepage-category-icons) | `BannerModule.renderScroller` | `BannerScroller` | 1:1 — 2 rows, 86 × 119.6 (`floor((390 − 30 − 2.7 · 15) / 3.7)`), gaps 15, r20, free scroll; 20 of the 62 slots (kit captures `tile-01…20`, same ratio 139.08) — replaces the Figma `CategoryGrid` on home |
| 7 | `adBannerModule` (homepage-top-fold-2) | `AdBannerModule` → `AdBannerModuleV1` → `ModuleWrapper` + `BannerModule.renderGrid` + `BannerContent` + `Sponsored` | `AdBannerModule` (Soundcore) | 1:1 — **360 × 90, r20, x 15** (formula below); wrapper 0 / 16 / mb 0; the creative's own "Ad" sits where Sponsored draws it (bottom 16, right 22) |
| 8 | `productCarousel` (Best picks for you) | `ProductCarouselModuleSwitch` → `NoonOptimizedProductCarousel` → `NoonProductCard` (flag `optimized_p_box_pcm`; legacy `ProductCarouselModule` + `NoonProductBoxVertical` is the same box) | `ProductCarousel` + central `ProductCard carousel` | 1:1 — card 138, image 138 × 169, gap 8, insets 15, no snap; r8, no border; "n%" without OFF; wrapper 10 / 16 / 0 |
| 9 | `adEasyBannerScroller` (Offers for you) | `src/components/Module/EasyBannerScrollerModule` | `EasyBannerScroller` | 1:1 — 135 × 176 (`floor((390 − 30 − 1.5 · 15) / 2.5)`, ratio 130.3), r20, gap 15, marquee 96 ms/px; kit captures `offer-01…10` (slots are ads in the payload) — replaces the Figma `OfferTickets` |
| 10–12 | `adBannerModule` ×3 (homepage-sfu-monet) | as 7 | `AdBannerModule` | 1:1 for one slot (360 × 90, label bottom 8 right 22, `strip-01` ratio 25); the other two are unfilled ad slots |
| 13 | `productCarousel` (Bestsellers for you, titleColor #404553) | as 8 | `ProductCarousel` | 1:1 — wrapper 0 / 0 / 24 (replaces the Figma `ProductRail` "Bestsellers") |
| 14 | `easyBannerScroller` (In the spotlight) | as 9 | `EasyBannerScroller` | 1:1 — 135 × 188.7 (ratio 139.77), wrapper 5 / 10 / 0; kit captures `spotlight-01…10` |
| 15–16 | `productCarousel` (Up to 250 cashback · Lowest prices on top brands, "View all") | as 8 | `ProductCarousel` | 1:1 — wrapper 10 / 0 / 24; "AED" in the CMS title shown as the dirham sign |
| 17 | `hpMegaDealModule` (Mega deals) | `marketplaces/noon/components/Module/NoonMegaDealsModule` | `MegaDeals` | 1:1 — bg #efeeff, 138 × 35 countdown tab (recursive to 06:00 UTC), 2 × 2 slots 177 wide, image 165 × 227, tag #9242f8; title row shown (`mega_deals_new_design` assumed on) |
| 18 | `adProductLedDisplayModule` | `features/admon/components/AdProductLedDisplayModule` (stacked `AdProductLedDisplayCard`) | `AdProductLedDisplay` | differs: stacked card with a demo product (the slot is ad-filled server-side); no logo header, no rating tab, no price flip — replaces the Figma `BrandAdModule` |
| 19 | `adBannerModuleCarousel` (homepage-crossmp-slider) | as 4 | — | not rendered: 5 unfilled ad slots |
| 20 | `productCarousel` (Previously browsed products) | as 8 | `ProductCarousel` | 1:1 |
| 21 | `easyBannerScroller` (Maximize your savings, 2 rows) | as 9 | `EasyBannerScroller` | 1:1 — 92 × 173 (npv 3.5, ratio 188.29), row 2 offset −46, wrapper 5 / 10 / 24; kit captures `saving-*` |
| 22–23 | `productCarousel` (APPLIANCE10 · FRAGRANCE10, "View all") | as 8 | `ProductCarousel` | 1:1 |
| 24 | `productCarousel` (homepage-admon-carousel, image header + "View All" button) | as 8 + `CTAButtonFooter` | — | not rendered: ad carousel needs an ad fill |
| 25 | `itemCarousel` (Keep shopping for) | `marketplaces/noon/components/NoonItemCarouselModule` | `ItemCarousel` | 1:1 — 138 cards, image 138 × 169 r12, padding 0 16, gap 12, description pill #F1F7FD / #0076FF — replaces the Figma `KeepShopping` |
| 26 | `adBannerModuleCarousel` (homepage-strip-slider) | as 4 | `SnappedBannerCarousel` | 1:1 — 341 × 140.8 (ratio 41.29), r20, wrapper 10 / 10 / 0; `bz/strip-slider-01…02` + kit `banner-01…03` (ratio 41.25) |
| 27–28 | `productCarousel` (HOME50 · Top bulk deals in grocery) | as 8 | `ProductCarousel` | 1:1 |
| 29–31 | `adBannerModule` ×3 (upper-mid-monet) | as 7 | — | not rendered: unfilled ad slots |
| 32–34 | `bannerModuleCarousel` (Women's fashion, Men's fashion, Beauty) | `BannerModule.renderDefaultBannerCarousel` | `BannerCarousel` | 1:1 — 94.29 wide (`(390 − 4 · 15) / 3.5`), ratio 158.54 / 175.61, gap 15, r20, free scroll; `bz/women-*`, `men-*`, `beauty-*` |
| 35 | `adBannerModule` (mpu-monet) | as 7 | — | not rendered: unfilled ad slot |
| 36 | `googleAdBannerModule` (GAM-APP) | `features/admon/components/GoogleAdBannerModule` | — | not rendered: Google Ad Manager view (358.8 wide r20, 370 × 110 creative) — no web equivalent |
| 37 | `bannerModuleCarousel` (Home & kitchen) | as 32 | `BannerCarousel` | 1:1 — `bz/home-kitchen-*` |
| 38 | `bannerModuleCarousel` (Home appliances) | as 32 | — | not rendered (repeat of 37, assets budget) |
| 39 | `easyBannerScroller` (Explore More, bg #f9f2a4) | as 9 | `EasyBannerScroller` | 1:1 — 110 × 160.8 (npv 3), wrapper 0 / 10 / 0; `bz/explore-*` |
| 40 | `bannerModuleCarousel` (homepage-midscroll-out-app, media header) | as 32 + `ModuleHeader` image | `BannerCarousel mediaHeader` | 1:1 — header 360 × 26.7, tiles 94.29 × 161; `bz/midscroll-*` |
| 41 | `bannerModuleCarousel` (Electronics) | as 32 | `BannerCarousel` | 1:1 — `bz/electronics-*` |
| 42–43 | `bannerModuleCarousel` (Mobiles, Laptops) | as 32 | — | not rendered (repeats) |
| 44 | `bannerModuleScroller` (Kids' fashion, 1 row) | as 6 | `BannerScroller` | 1:1 — 92 × 145.9 (numPerRow 3.5) |
| 45–55 | `bannerModuleCarousel` ×10, more category sections | as 32 | — | not rendered (repeats) |
| 56 | `bannerModule` (homepage-emaar-strip) | `BannerModule.renderGrid` | `AdBannerModule` | 1:1 — 360 × 90.8 (ratio 25.22), wrapper 15 / 0 / 24; `bz/emaar-01` |
| 57 | `footerTextLinks` | — (not in `StaticModuleTypes`; `Module.tsx` returns null) | — | not rendered on master |

Figma 2025 modules that the live payload doesn't have and that are therefore no longer on `home/home` (files kept): `PromoTicker` (the cashback ticker; its slot is the homepage-toggle strip, row 4), `CategoryGrid`, `OfferTickets`, `ProductRail`, `KeepShopping`, `BrandAdModule`, `LaunchModule`, `HeroBanners`, `DepartmentTabs`, `EidAdBanner`.

### Product carousel card (NoonProductCard `isCarousel`)

`marketplaces/noon/components/NoonProductCard/{NoonProductCard.tsx,styles.ts}` via `NoonOptimizedProductCarousel/CarouselItem` → `ProductBox isCarousel isOptimizedProductBox`. Values resolved from `NoonTokens` (`marketplaces/noon/theme/tokens`) and `src/theme/Metrics.ts` at 390.

| bappzaar element | value | kit token / prop |
| --- | --- | --- |
| box (`carouselLayout` + `styles.box`, `container` + `carouselContainer`) | width 138, r8, border 0, white, paddingBottom 10 | `ProductCard carousel width={bz.productWidth}`, `--nk-radius-r8`, `--nk-space-s10` |
| image (`imageSizeStyle`) | 138 × `round((138 − 14) · 1.361)` = 169, `contain` | `ProductImage aspect` |
| `imageOverlay` + `carouselImage` | `rgba(0,0,0,.02)`, r8 (all corners) | `ProductImage radius={radius.r8}`, `--nk-color-image-overlay` |
| Best Seller (`NoonMarketplaceTag` + `catalogTag*`), copy `noon_best_seller` | top-left 0/0, 20h, px 8, `#0A4F4A` (darkGreenTeal), bottom-end r10, 12/600 lh14 white | `CatalogTag` (`--nk-color-best-seller-tag`, `text12SemiboldLh14`) |
| heart (`imageTopRightWrapperStyle` + `NoonFavourite` wrapper) | top 4 right 4, 24 circle, `whiteAlpha(0.7)` | `WishlistHeart box={24}` (icon 18) |
| quick add (`NoonCard.MediaBottom` padding 4 + `imageBottomWrapperCarousel` bottom 2, `NoonProductBoxAddToCart.roundButton`) | bottom 6 right 4, 36 × 36 r8, white, 1px `#F2F3F7` | `.card[data-carousel] .quick` `--nk-space-s6`, `QuickAdd` (`quickAdd` tokens) |
| `infoCarousel` | px 4, marginBottom 2 | `.info` padding `--nk-space-s4`, margin-bottom `--nk-space-s2` |
| title (`NoonCard.Title` + `nameAdjustedContainer`; the `marginTop={6}` prop is ignored by RN Text) | brand + name, 14/500 lh18 `#212121`, 2 lines, marginTop 4 | `Text variant="productTitle" color="textProduct" lines={2}` |
| `NoonProductRating` | marginTop 4, `#F7F8FA` r6, py 2 px 6, gap 4; 12/600 `#101628`; star 11 by score; count 12 `#666D85` | `RatingPill` |
| `PriceDiscounted` (`priceDiscountedStyles`, `showDiscountInline hideCurrency isCompact hideOffText`) | marginTop 6, wrap; sale + sign 16/700 `#0E0E0E` (`saleCurrency`), marginRight 4; was 12 `#7E859B` struck; discount 12/600 `#05AF25` "n%" (Discount px 3) | `Price offSuffix={false} currencySize="sale"`, wrapper `margin-top: --nk-space-s2` on top of the info gap 4 |
| `flagAndDiscountRow` + `flagAndDiscountRowCarousel`, `NoonEstimatedDelivery isCarousel` | marginTop 4, px 4, express flag 60 × 18, delivery text hidden | `.delivery` 18h, `ExpressBadge` |

Not matched: the prod screenshot shows the rating as "4.8 ★ (7.6K)" (kit order); bappzaar master's `NoonProductRating` puts the star before the score. The discount sits 4 from the struck price (bappzaar Discount px 3).

### Ad banner formula (row 7, homepage-top-fold-2)

`AdBannerModule` (no `shouldFetchAds`) → `AdBannerModuleV1` → `ModuleWrapper` → `BannerModule.renderGrid` (type is not strip / carousel / scroller) → `renderBannerRow` → `BannerContent` → `StaticImage`:

- width = `floor((W − 2 · staticPagePadding − (numPerRow − 1) · innerSpacing) / numPerRow)` = `floor((390 − 30 − 0) / 1)` = **360**, x = 15
- height = `PixelRatio.roundToNearestPixel(width · ratio / 100)` = 360 · 25 / 100 = **90** (4 : 1)
- radius **20** (`BannerContent` `roundedCornerStyles`, noon; `adBannerModule` is not in `nonRoundedBanners`, banner has no `removeCurvedCorners`)
- wrapper: paddingTop 0, paddingBottom 16 (innerPadding), marginBottom 0 (removeExternalSpacing), bg #ffffff
- Sponsored (V1, module `label`): absolute bottom 16 right 22 in the wrapper → the banner's bottom-right corner, 7 in; white at opacity 0.7, r6, padding 0 5; "Ad" 13 regular #828282, padding 2

Kit: `.grid { padding: 0 15 }` + `width: 100%` + `aspect-ratio: 100 / 25` → measured in the browser at 390: **360 × 90 at x 15, radius 20**.

### Assets (`src/assets/home/bz/`)

Downloaded from the payload's own `f.nooncdn.com/mpcms/...` URLs, resized to ≈ 3× the rendered width, then `npm run assets:optimize`: `welcome-strip-01` (animated, homepage-toggle), `strip-slider-01…02`, `women-01…07`, `men-01…07`, `beauty-01…07`, `home-kitchen-01…07`, `electronics-01…07`, `kids-01…07`, `explore-01…07`, `midscroll-01…05`, `midscroll-header-01`, `emaar-01`. Reused exact-ratio kit captures of the same CMS slots: `src/assets/home/tile-*`, `offer-*`, `spotlight-*`, `saving-*`, `strip-01`, `banner-01…03`, `src/assets/categories/ad-pre-search-banner.webp`.

### Not matched

- Ad / GAM slots and the floating / interstitial modules (rows 1–3, 19, 24, 29–31, 35, 36): nothing to draw without a runtime ad fill.
- Feature-flag variants whose live bucket isn't in the repo: `optimized_banner_carousel` (NoonSlider assumed), `optimized_p_box_pcm` (same box either way), `mega_deals_new_design` (title row assumed on).
- `adProductLedDisplayModule`: logo header, rating tab and the price flip animation are not built.
- Product data is the kit mock catalogue (the app fetches each carousel's `productUrl`).
