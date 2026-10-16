<!-- planned: home/revamp -->

> **Status (2026-10-12):** `home/home` now renders the **noon app home feed 1:1 with bappzaar master** (`ba159e2038182a15f0207ac226e8e9c906a1b042`): the module types, order, titles, links, ratios and spacing of the live app home CMS payload (`api-app.noon.com/_svc/catalog/api/v3/u/`), each built to its bappzaar component's numbers (table below; full mapping in `src/flows/home/FIGMA-MAPPING.md` → "Home feed · bappzaar modules"). Kept by request: the classic `ExperienceSwitcher`; no department tabs; the light-blue 2025 header (no Ramadan / Eid background); no "Need help" button on home; the tab bar unchanged; the Figma hero creatives (Nike / Areej / WHOOP) — the carousel geometry is now bappzaar's live CMS layout (263.67 × 395.67, gap 15). The Figma 2025 modules that the live payload doesn't have are no longer rendered (files kept).
# Home page — flow specification

The contract a home or landing build must meet. Measurements are Figma points on a 375pt frame (the kit device is 390pt; keep fixed sizes, let rails peek). Full measurements and token mappings: `references/figma-homepage-2025.md`.

## Screens

| Route | Path | Presentation | What it is | Status |
|---|---|---|---|---|
| `home/home` | `/homepage` | tab root (`home`) | noon app home feed, bappzaar master `ba159e20` 1:1 (live payload order), 2025 header (`1337:5102`), Eid hero creatives (`89:34398`) | built (`HomeScreen.tsx`, `data.feed.ts`) |
| `home/classic` | `/home-classic` | push | Previous home, bappzaar 1:1 port | kept for reference (`ClassicHomeScreen.tsx`) |
| `<flow>/landing` | `/<campaign>` | push (`push`) | Campaign / seasonal landing page in the same module language | per request |

## Header (top to bottom)

| # | Part | Kit | Spec |
|---|---|---|---|
| 1 | Background | flow token `homeHeaderGradient` (+ glow, swoosh, stars, fade) | light-blue radial gradient, bottom corners `--nk-radius-r12`; not tab-driven (department tabs removed); the Eid frame's teal + lanterns are not used, by request |
| 2 | Experience switcher | `ExperienceSwitcher` (`src/flows/home/components/ExperienceSwitcher.tsx`) | tiles 73×76, r15, gap 6; selected tile `brand` fill |
| 3 | Address row | bappzaar `NoonAddressSelector` + `NoonHomeToggle` wishlist (1:1): `noon-delivery-home.webp` 20 + `noon-chevron-down.webp` 16, `noon-wishlist-home-v2.webp` 40 | row gap 40, padding 0 16 12; label 18 bold `textPrimary`; line 16/22 `textBody` in a 28 box, start padding 4; wishlist → `wishlist/wishlist` (bappzaar shows it signed in, the demo user is) |
| 4 | Search | `SearchBarButton` with camera | height 48, pinned when the header collapses |

Rows 2–3 collapse past 100px of scroll; the search bar stays.

## Feed modules · bappzaar (rendered on `home/home`)

Order = the live app home payload. Spacing per module (`ModuleWrapper`: paddingTop / paddingBottom = innerPadding, marginBottom = removeExternalSpacing ? 0 : 24); header row padding 0 15, margin-bottom 12, title 18 bold `new-black` (or CMS `titleColor`), "View all" 15 bold `brand-blue` + arrow. W = 390.

| # | CMS module (name) | Kit | Geometry at 390 |
|---|---|---|---|
| 4 | `adBannerModuleCarousel` (homepage-toggle) | `SnappedBannerCarousel` | `ceil((W − 15) / 1.1)` = 341 × 36.9, inset 15, gap 15, r0, auto 3000 ms / 450 ms out-cubic, 0.85 fade, loop |
| 5 | `noonDynamicCarousel` | `EidBanners` | `W / 1.4 − 15` = 263.67 × 395.67 r16, gap = gutter 15, centre snap, auto 3 s |
| 6 | `bannerModuleScroller` (category icons) | `BannerScroller` | 2 rows, `floor((W − 30 − 2.7 · 15) / 3.7)` = 86 × 119.6 r20, gaps 15 |
| 7 | `adBannerModule` (top-fold-2) | `AdBannerModule` | `W − 30` = 360 × 90 (ratio 25) r20 at x 15; wrapper 0 / 16 / 0; "Ad" bottom 16 right 22 |
| 8, 13, 15–16, 20, 22–23, 27–28 | `productCarousel` | `ProductCarousel` + `ProductCard carousel` | card `round((W − 15 − 16) / 2.6)` = 138, image 169, gap 8, insets 15 |
| 9, 14, 21, 39 | `(ad)easyBannerScroller` | `EasyBannerScroller` | `floor((W − 30 − (npv − 1) · 15) / npv)`: 135 / 92 / 110, r20, marquee 96 ms/px, 2-row brick offset 0.5 |
| 10 | `adBannerModule` (sfu-monet) | `AdBannerModule` | 360 × 90 + Sponsored bottom 8 right 22 |
| 17 | `hpMegaDealModule` | `MegaDeals` | bg #efeeff, 138 × 35 countdown tab, slots `floor((W − 36) / 2)` = 177, image 227 |
| 18 | `adProductLedDisplayModule` | `AdProductLedDisplay` | stacked card 366 wide r16, 16 : 9 image, footer title 20/26 + price 26/30 |
| 25 | `itemCarousel` (Keep shopping for) | `ItemCarousel` | 138 cards, image 169 r12, padding 0 16, gap 12 |
| 26 | `adBannerModuleCarousel` (strip-slider) | `SnappedBannerCarousel` | 341 × 140.8 r20 |
| 32–34, 37, 41 | `bannerModuleCarousel` (category sections) | `BannerCarousel` | `(W − 60) / 3.5` = 94.29 wide, ratio 158.54 / 175.61, gap 15, r20, free scroll |
| 40 | `bannerModuleCarousel` + media header | `BannerCarousel mediaHeader` | header 360 × 26.7 |
| 44 | `bannerModuleScroller` (Kids' fashion) | `BannerScroller` | 1 row, 92 × 145.9 |
| 56 | `bannerModule` (Emaar) | `AdBannerModule` | 360 × 90.8 |

Not rendered (nothing to draw without a runtime ad fill, or repeats): 1–3 interstitial / floating review reminder / floating video, 19 cross-MP slider, 24 admon carousel, 29–31 and 35 ad slots, 36 GAM banner, 38, 42–43, 45–55 further category sections, 57 `footerTextLinks` (not a module type on master).

## Feed modules (Homepage Revamp 2025, reference)

Default order for the 2025 home. Every module is an optional title row (`Text variant="heading"`, `var(--nk-palette-new-black)`, padding `0 14px`) plus content; modules are 28 apart (`homeModuleGap`).

| # | Module | Kit (reuse → build) | Spec |
|---|---|---|---|
| 1 | Hero Section Widgets carousel | `EidBanners` (`components/EidBanners.tsx`, data `data.eid.ts`) | 220×330 r16 cards, gap 12 = gutter, centre snap (first at the gutter), auto 3s while visible, stops on first touch, none under reduced motion. Hero card: full-bleed creative, "Ad" `Badge` 8/8, video → 32×32 r10 pause / play pill at 6/6 (`OriginIcon` pause-circle / play-circle). Brand card: p8 gap 8, header creative r8 + 2 detailed 98×124 tiles (notch 10/12, name 11/14, dirham price 11/14 bold + struck) or 4 image tiles |
| 2 | Full-width ad | `EidAdBanner` | 351×88 r16, padding 12 12 8; the creative carries its "Ad" mark |
| 3 | Promo ticker | `PromoTicker` | 351×62 ticket r12, 2–5 rotating messages, "n/N" + dots; kept after the ad (neither the Eid frame nor bappzaar places it elsewhere) |
| — | Hero banners (2025) | `HeroBanners` | 330×150 r20 Welcome / sale cards; replaced by the Eid carousel, file kept |
| 3 | Shop by category | `CategoryGrid` (exists, not rendered on `home/home`) | 2 rows, tiles 92×128, gap 16, live 13/14 600 labels, optional SALE ribbon |
| — | Recommended for you | `RecommendedRail` (icon tabs + `SkuCard` rail; exists, not rendered) | sticky icon tabs; not on `home/home` today (department tabs removed too) |
| 5 | Offers for you | `OfferTickets` (exists, not rendered) | ~137×172 live cards, gap 12 |
| 6 | Bestsellers | `ProductRail` (rail of `SkuCard`; exists, not rendered) | 134 cards, gap 12, "Best Seller" tag `bestSellerTag` |
| 7 | Keep shopping for | `KeepShopping` (exists, not rendered) | 100–114 wide, "n Viewed" caption |
| 8 | Sponsored brand module | `BrandAdModule` (exists, not rendered) | full-bleed dark, brand header, video tile, SKU rail, "Ad" badge |
| 9 | Selling out fast | rail of `SkuCard` | as Bestsellers |
| 10 | New launches | `LaunchModule` (exists, not rendered) | dark inset card r20 (351×420), cards 213×327, black CTA |
| — | Tab bar | Navigator `TabBar` (from `defineFlow({ tabBar })`) | unchanged defaults; the 2025 indicator style is a separate opt-in |

### Ordering rules

1. Navigation first: utility strip → hero → categories.
2. The tabbed personal rail is the first product module; at most one tabbed rail per page.
3. Alternate after offers: rail → personal → sponsored → rail → editorial dark.
4. Never two dark or two sponsored modules next to each other.
5. At most one brand ad and one launch module per page; every ad carries an "Ad" badge.
6. An endless feed may end with a 2-column `ProductCard` grid ("More for you").

## Landing / campaign variant

Pushed screen: `<Screen header={<Header title="…" />}>` with back + search, no switcher or address. Order: campaign hero (one full-width banner) → `PromoTicker` (campaign perks) → category grid → tabbed product rails by category → offer tickets → optional deal rail with `DealTimer` (`src/flows/home/components/DealTimer.tsx`). Campaign colours as flow tokens (`<flow>HeaderBg`, `<flow>Accent`).

## Data

- `home/home`: `homeFeed: BzModule[]` (`src/flows/home/data.feed.ts`, `{ key, type, wrap, header?, hidden? }` per CMS module type), rendered by one `switch` in `HomeScreen.tsx`; tokens `tokens.feed.ts` (`homeBz*`). A 2025 or campaign screen keeps the same pattern: one ordered module array (`{ type: 'promoTicker' | 'hero' | 'categories' | 'productRail' | 'offers' | 'keepShopping' | 'brandAd' | 'launches', title?, tabs?, items }`) and one `switch`.
- Products from `src/data`; prices through `Price` (dirham sign); creatives from `src/assets/home/`.
- Copy: short, sentence case; module titles as in the Figma ("Shop by category", "Recommended for you", "Offers for you", "Bestsellers", "Keep shopping for", "Selling out fast").

## Navigation

| From | Action |
|---|---|
| Category tile, hero, offer ticket | `nav.push('plp/listing', { query })` |
| SKU card | PDP (`pdp/detail` with `productId`, the card's default press) |
| Search bar | `nav.push('search/search')` |
| Wishlist | `nav.push('wishlist/wishlist')` |
| Experience tile | switch the header theme in place (no navigation) |

## Motion

For a top-sheet tease (page drops to reveal a campaign sheet), an icon arriving into the address / ETA label, a pill grown from a dot, or the delivery ticker, use the **Home drop · top sheet** choreography in `../noon-ui/references/motion.md` (`supermall.topSheet`, `supermall.bolt`, `supermall.nudge`, `supermall.ticker`).

| Moment | Kit |
|---|---|
| Header collapse past 100px | `motion.div` height/opacity as `HomeScreen.tsx` does |
| Hero carousel | `EidBanners` on `home/home` (centre snap, auto 3s while visible, stops on first touch); `HeroCarousel` on `home/classic` |
| Promo ticker message swap | `AnimatePresence mode="popLayout"`, `tween('fast', 'out')` |
| Tab underline + rail swap | `layoutId` underline (`duration.base`, `easing.out`); `AnimatePresence mode="wait"` + `Stagger` |
| Card press | `Pressable` / `ProductCard` press scale |

## States

| State | Spec |
|---|---|
| Loading | `Skeleton` blocks per module, as other CMS pages do |
| Empty rail | hide the module (never an empty title) |
| Sponsored | "Ad" `Badge` on the creative or SKU image |

## Acceptance

- [ ] Routes registered; page path opens the screen; `check:routes` clean.
- [ ] Module order and ordering rules as above; titles `heading` in `new-black`; 28 gap; rail gutter 12; category gutter 16.
- [ ] SKU rails use `SkuCard` (134), not `ProductCard`.
- [ ] Every tile, banner and card navigates; nothing dead.
- [ ] Tokens only (`lint:tokens` 0 for the flow); 2025-only values are `home*` flow tokens.
- [ ] Ads badged; no adjacent dark or sponsored modules.
- [ ] Screenshots read at top and scrolled, compared with `1337:5102`.
- [ ] `source` = `Figma iRE9RwO94eMAyW3j3XKNXW · 1337:5102`.
