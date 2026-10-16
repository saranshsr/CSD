<!-- planned: src/flows/pdp/components/NewerModel.tsx, --nk-type-pdp-section-title, --nk-color-pdp-store-strip, pdp/detail-v2, pdp/oos -->
# PDP (Storefront team): "Legacy-to-New Model Entry Point" design

Design reference for building or restyling the noon product page (PDP) to the Storefront team's current Figma. Read this together with `flows.md` (PDP blueprint), `src/flows/pdp/MAPPING.md` (bappzaar values) and `tokens.md`. When this file and bappzaar disagree, ask which source wins. The pdp flow is a 1:1 bappzaar master port, and this design is newer.

## 1. Sources

| What | Where |
|---|---|
| Figma file | `2ldJbjmQq4RkhnrNFCfXQB` "Storefront" (the file belongs to the Storefront team; it holds PDP work, not a brand-storefront page) |
| Page | `908:249350` "• Legacy-to-New Model Entry Point", section `908:249351` "Discovery: Legacy-to-New Model Entry Point" |
| **Main node** | `930:259766` "PDP" (375 × 2263 viewport, content 4762 tall). Label `930:262047`: "Link to prototype, Case 3 · Product is out of stock" |
| Case 1 · in stock | `2316:17084` "PDP" (label `908:249352` / `908:249353`, designer Sid). Same page with price block, delivery, variants, reinforcement, payment offers; footer = QTY + full-width Add to cart, then the tab bar |
| Case 2 · not available at location | `908:251666` / `1562:108506` "New PDP" (label `908:249356`). In-stock layout; footer = red "This item is not available at your current location" banner + newer-model chin + tab bar |
| Case 3 alt | `1644:39023` "PDP": OOS iteration with the price shown in grey and a compact footer ("OUT OF STOCK / View Newer model") |
| Screenshot shared by the user | `.../images/2.png`: the same Case 3 frame rendered whole (header, gallery, info, ad row, newer model, Product Details, Bestseller, seller, Product Features, OOS banner + successor chin, tab bar) |
| Local renders | `scratchpad/figma/pdp/full.png` (Case 3), `case1_*.png`, `newpdp*.png`, `pdpb1.png`, `variant12x.png` (sponsored brand row), `footer2x.png` |

Section node ids in `930:259766`: header `930:260500` · gallery `930:259768` · Main-Info `930:261886` · Ads `930:259895` · newer model `2371:17564` · Product Details `930:260099` · Bestseller `930:260253` · Seller widget `930:260268` · Product features (A+) `930:260321` · sponsored brand carousel `930:260322` · Frequently bought together `930:260323` · Ratings & Reviews `930:260324` · Similar products `930:260497` · "Top products in chargers" `930:260498` · footer (OOS banner + Successor chin + tab bar) `1644:43671`.

Not a storefront: no brand-store page is in this node or section. The only storefront element is the "Visit Store" link in the brand strip. Section 7 says how to handle it.

## 2. Screen anatomy (Case 3, out of stock), top to bottom

Frame width 375 (the kit device is 390, so widths scale and gutters stay fixed). Page background `#F2F3F7`. Every card is white, **r16**, inset **12** from both screen edges, with **12** between cards. Card titles share one style: **15/700/17, tracking −0.28, `#101628`, 2px inline padding**.

| # | Section | Measurements and type | Behaviour and states |
|---|---|---|---|
| 1 | **Header** (overlay, 47 status + 56 stack) | Background gradient: white from 0 to 40%, then transparent. Stack padding 8·12, gap 8. Four 40px round icon buttons (white 90%, 1px `#F2F3F7`, full radius, 20px glyph): back on the left; **search · wishlist · share** on the right (gap 8). No search pill. | Sits over the gallery. The design shows no scroll state, so keep the kit's solid-on-scroll behaviour. |
| 2 | **Gallery** | Full width, **512 tall at 375** (ratio 1.365), starting under the header. Footer row 12px from the sides: **"noon's exclusive"** catalog tag (114×24, r8, gradient `#666`→black, 1px `#4C4C4C`, 14/600 light gradient text) at the start; **360° button** at the end (40px white circle, 1px `rgba(2,6,12,.15)`, 22px rotate glyph). Dot indicator (≈51×6) centred 20 from the bottom. | Swipe between images; the 360 button opens a spin view (prototype: toast or a sheet). |
| 3 | **Main info** (brand strip + info card) | Wrapper bg **Accent/100 `#E1EFFF`**, r16, pt 10, gap 8. Strip px 12: 24px verified badge + brand **14/700/18 `#0057FF`**; end: **"Visit Store" 13/600/15 `#0057FF` + 12px chevron**. Info card: white r16 (top-end 20), padding 12/12/10, gap 4. Title **16/500/20 `#212121`**, 2 lines. Rating pill 26h r6 bg `#F9F9FB`, inner `#F7F8FA` r4: 14px green star, "4.6" 13/600/14 `#101628`, "(34244 reviews)" 13/600/14 `#343D54`. | **OOS: no price block.** Case 1 and Case 2 add "Prepaid Only" pill, price row (Đ 4429 · struck was · green %, "(incl. of VAT)"), "Mega Deal" tag + "Lowest Price in 30 days" nudge, a coupon carousel (dashed teal "Extra 10% off CODE: SAVEBIG") and an in-card grey "Bestseller #3 in Chargers" row. |
| 4 | **Sponsored product row** ("Ads") | 351×35, white r8; inner 1px `#F5F5F5` r6. 34×40 thumb on `#FCFCFD`, gap 8; title 12/14 `#404553` (italic), one line, 175 wide; price **16/700/20 `#404553`** + express artwork 53×16; "Ad" tag in the bottom-end corner (bg `#F0F2F7`, top-start r4, 11/12 italic `#7E859B`). | One-line ad for an accessory; tap opens that PDP. |
| 5 | **Newer model available** | White r16, 2px white border, pb 12, gap 10. Header strip gradient **`#FBF0FE` → white** (left to right), padding 10/12/8, gap 6: 18px thunder-square icon + **"Newer model available" 12/600/16 `#741B92`**. Row px 12, gap 12: 55×68 image (r8, 1px `#EAECF0`), gap 8; title **14/500/20 `#1D2539`** (2 lines), price **13/600/18**; trailing **34px round button** (white, 1px `#EAECF0`, 14px chevron). | Annotation: "Newer model, deliverable to you widget. View now takes the user to the PDP" → `nav.push('pdp/detail', { productId: successorId })`. Shown in all three cases. |
| 6 | **Product Details** (accordions) | White r16, **px 12 · py 16**, gap 12. Title "Product Details". Items gap 8, each **44h, bg `#F9F9FB`, r12, padding 12**, title **14/600/18** `rgba(2,6,12,.92)`, 20px chevron-down. Items: **Overview · Highlights · Specifications**. | All collapsed; tap expands. |
| 7 | **Bestseller** | r16, 1px white border, gradient 119° white (15%) → **Emerald/50 `#E8FCFA`**, padding 6/8/6/12, gap 10. 40px rosette icon, gap 6; "Bestseller #1" **14/700/18 `#242A34`** · "in" 14 italic `#5D5D5D` · "Chargers" **14/600/18 `#0A4F4A`**; sub "Explore other bestellers" **12/400/14 `#5D5D5D`**; 20px chevron. | Opens the category best-seller list. |
| 8 | **Seller widget** | White r16, py 12, gap 16. Top block px 12, gap 20. Logo box **48, r10, 1px `#F2F3F7`, p12** with a 30px store glyph; gap 8. "Sold by" **14/400/18** + name **14/700/18** + 16px chevron. Pills row gap 4: rating pill **24h r20 `#F7F8FA`** px 6 (12px star, "4.3" 12/600/14 + "(128)" 12/400 `#666D85`); positive pill **24h r20 `#F9F9FB`** px 8 ("74%" 12/700 + "Positive" 12/600 in `#13645F`, " Seller Ratings" 12/400 `#212121`). **Trust chips** wrap, gap 8: p8, 1px `#F5F5F5`, **r18**, 16px icon, gap 4, **12/400/14 `#475067`** (values such as "100%" 12/600 `#13645F`): Low Return Seller · Great Recent Ratings · Partner Since 5+ Years · Item as Described 100%. **Brand subtitle** row: 36h, `#F9F9FB`, r10, px 8, 12/400/14 `#475067`. Dashed full-width divider. **Offers row** px 12: 36h, **`#EFF7FF` r10**, pl 12 pr 8, gap 8, 16px icon, "5 offers from other sellers from " 14/400/18 `#475067` + "Đ649" 14/600 `#1D2539`, 20px chevron. | Seller name opens the seller page; the offers row opens the offers list. |
| 9 | **Product Features** (A+ content) | White r16, p12, gap 12, **collapsed height 610**. Title "Product Features". Full-width brand banners (r8). Bottom fade: 229 tall, white 0% → white 85%, with **"View More" 13/600/15 `#0057FF` + 12px chevron-down**, centred, pb 12. | Collapsed with a fade; View More expands to full height. |
| 10 | **Sponsored brand carousel** (`930:260322`) | Outer `#F9F9FB` r16, 1px white; inner white r12, pb 12, gap 4. Header px 12 py 12: 44px logo tile (`#FAFAFA`, 1px `#F5F5F5`, r10), "Top quality products" 14/400/18, **"Shop TECV" 13/700/18 `#0076FF`** + 14px chevron; "Ad" tag (`#F9F9FB` r4, px 5 py 2, 12/11 `#666D85`). Cards row px 12, gap 10: **216 wide, p4, r10, 1px `#F9F9FB`**; 64×71 image r8 with `rgba(53,60,115,.03)` overlay; text px 6, gap 4: title 12/500/15 `#383838` (2 lines), price 12/700/16 `#1D2539`, express ETA artwork 101×15. | Horizontal scroll. |
| 11 | **Frequently bought together** | White r16, p12, gap 12. Three equal tiles (~101 × 140 image, r8, 1px `#F2F3F7`, `rgba(53,60,115,.03)` tint), each with a 24px check circle at top/end −5 and a 24px "+" disc (white, 1px `#F4F5FB`) between tiles at pt 64. Text pt 6 px 4 pb 8, gap 4: title 12/500/15 `#212121`, price 12/700/16 `#1D2539`, express ETA. Button: **"Buy all for Đ460"**, white, 1px **`#96C6FF`**, r8, px 24 py 12, 14/600/18 `#0076FF`, glow `0 0 4px rgba(0,118,255,.1)`. | Toggle a tile → the button total updates. |
| 12 | **Ratings & Reviews** | White r16, p12. Score "4.8" **22/800/24** `#0E0E0E` + five 22px stars; "Avg. rating based on 64 reviews from trusted sources" 12/18 `#475067` + 14px info. **AI summary**: r8, 4% indigo → violet gradient, header 42h "64 reviews, summary by noon AI" gradient text 14/600/18 + sparkle + chevron; bullets 14/400/18 `#1D2539` with 6px dots, gap 8. **Photo Reviews**: title + 93×116 photos, gap 8, h-scroll. **Top reviews**: each review is its **own bordered card** (1px `#EAECF0`, r16, pt 14 px 12 pb 12, gap 12): name 14/700 · 16px stars + "• 8 days ago" 12 `#666D85` · "Verified Buy" chip (gradient `#F2F3F7`→white, full radius, 10/600/12 `#3C3C3C`) · variant chips (`#F9F9FB` r4 px 4 py 2, 11/500/14 `#343D54`) + "View product ›" chip (`#EFF7FF`, `#0057FF`) · title 14/600/18 `#1D2539` · body 14/400/18 `#475067`, 2 lines + "more" 14/500 `#101628` · "Translate to عربي" 12/500/14 `#0057FF` · photos 96×120 r8, gap 10 · "Helpful (15)" button (24h, `#FCFCFD`, 1px `#EAECF0`, r6, px 8, 16px thumb, 12/500/14). Footer: divider + centred text button. | "more" expands the body; Helpful toggles. |
| 13 | **Similar Products / Top products in {category}** | White r16, p12; title, then row pt 16, gap 12 of **134-wide cards** (0.5px `#F2F3F7`, r10, 3:4 image on `rgba(0,40,136,.02)`): Best Seller tag (`#0A4F4A`, bottom-end r10, 20h, 12/600), 24px heart (white 20%) top-end, 32px "+" ATC (white, 1.2px `#F2F3F7`, r8) bottom-end, "Ad" tag bottom-start, mini page dots; title, rating "(128)", price "Đ899 1399 33%", nudges ("Selling out fast", "Free delivery", "5k+ units sold", "Lowest price in 30 days"). | H-scroll. |
| 14 | **Footer: OOS banner + successor chin** | **Banner** 40h, white, **top radius 16**, border-bottom 1px `#EAECF0`, padding 10/12; 20px "not eligible" icon + **"This item is currently out of stock" 12/600/14 `#D92626`**, centred. **Successor chin** 100h white, p12: 55×70 image (r8, 1px `#EAECF0`), gap 8; "Newer model available" **11/600/14 `#741B92`**; title **13/500/18 `#1D2539`** (2 lines); price 13/500/18; 34px round chevron button. Then the **tab bar** (Home · Categories · Deals · Account · Cart, 4px indicator on top of the active tab). | Annotation on the chin: **"On scroll, as the first entry point goes out of the view"**: the chin appears once the in-page newer-model card (row 5) has scrolled out. **No ATC bar when out of stock.** Case 2 swaps the copy for "This item is not available at your current location". The 1644:39023 alternative shows one row instead: red OOS icon tile + "OUT OF STOCK" (14/700 red) / "View Newer model". |

Italics: the Figma uses Figtree *Italic* for meta text (Ad labels, "in", dates, review body, variant chips, verified tag, the "Avg. rating" note). The kit's Noontree has no italic face, and bappzaar renders this text upright. Render it upright on kit type tokens unless the user asks for italics.

## 3. Figma variables and styles → kit tokens

| Figma variable / style | Value | Kit token | Note |
|---|---|---|---|
| `colour/surface/primary`, `✅ bg/primary`, `Neutral/White` | `#FFFFFF` | `--nk-color-bg-surface` | cards |
| `Blue-Gray/200` | `#F2F3F7` | `--nk-color-bg-page` / `--nk-color-border-subtle` | page bg (the pdp flow overrides `bgPage` to `#F9F9FB`, see §6) and icon-button borders |
| `Blue-Gray/100` | `#F9F9FB` | `--nk-color-bg-subtle` (`bgPdp`) | accordion rows, pills, brand subtitle |
| `Blue-Gray/50` | `#FCFCFD` | `--nk-palette-blue-gray50` | ad thumb, Helpful button |
| `Blue-Gray/300`, `colour/border/primary` | `#EAECF0` | `--nk-color-border` | image borders, review cards |
| `Gray/200`, `✅ Sementic/Border/primary`, `✅ Sementic/BG/tertiary` | `#F5F5F5` | `--nk-palette-border-primary` | trust chips, ad border |
| `Accent/100` | `#E1EFFF` | `--nk-palette-lavender` (no semantic) | **brand strip bg; differs from `--nk-color-bg-store-strip` `#E8F1FF`** |
| `Accent/50`, `Blue/50` | `#EFF7FF` | `--nk-palette-alice-blue` | offers row, "View product" chip |
| `Accent/700`, `Blue/700`, `✅ …/accent-hover` | `#0057FF` | `--nk-color-brand-blue` | brand name, Visit Store, View More |
| `Blue/600`, `✅ Sementic/Text/accent` | `#0076FF` | `--nk-color-link` | "Shop TECV", FBT button text |
| `Blue/300` | `#96C6FF` | `--nk-palette-sky-blue` | FBT button border |
| `Blue-Gray/1000` | `#101628` | `--nk-color-text-strong` | titles, scores |
| `Blue-Gray/900`, `colour/text-n-icon/primary` | `#1D2539` | `--nk-color-text-primary` | |
| `Blue-Gray/800` | `#343D54` | `--nk-color-text-body` | |
| `Blue-Gray/700` | `#475067` | `--nk-color-text-muted` | trust chips, review body |
| `Blue-Gray/600` | `#666D85` | `--nk-color-text-secondary` | counts, dates |
| `Blue-Gray/500` | `#989FB3` | `--nk-color-text-tertiary` | |
| `Blue-Gray/400` | `#D0D4DD` | `--nk-color-border-strong` | review date dot |
| `✅ Sementic/Text/primary-hover` | `#212121` | `--nk-color-text-product` | product title, FBT titles |
| `✅ text/primary` | `#242A34` | `--nk-palette-dark-text-color` | "Bestseller #1" |
| `✅ Sementic/Text/secondary` | `#5D5D5D` | `--nk-palette-secondary-text-color` | bestseller sub text |
| `✅ Sementic/Text/secondary-hover` | `#3C3C3C` | `--nk-palette-dark-gray` | Verified Buy |
| `🚧 text/👀 primary` | `rgba(2,6,12,.92)` | `--nk-palette-dark-navy-alpha92` | accordion titles, Sold by |
| `🚧 border/secondary` | `rgba(2,6,12,.15)` | **missing** (only `darkNavyAlpha10/20`) | 360 button border; snap to `--nk-palette-dark-navy-alpha10` or add `pdpBorderNavy15` |
| `noon Black`, `Brand Secondary` | `#404553` | `--nk-color-text-legacy` | ad row text and price |
| `Neutral/Black`, `✅ Sementic/BG/solid` | `#0E0E0E` | `--nk-color-text-ink` | score, active dots |
| `✅ Sementic/BG/Overlay-alt` | `#0E0E0E3F` | `--nk-palette-primary-alpha25` | inactive dots |
| `✅ Sementic/BG/primary-alpha` | `#0E0E0E03` | **missing** | card dots pill; ignore or add flow token |
| `base/colour/purple/800` | `#741B92` | `--nk-palette-deep-purple` | "Newer model available" |
| `base/colour/purple/100` | `#FBF0FE` | `--nk-palette-lavender-mist` | newer-model strip gradient start |
| `Emerald/50` | `#E8FCFA` | `--nk-palette-mint-cyan-light` | bestseller gradient end |
| `Emerald/800` | `#13645F` | `--nk-palette-emerald-green` | "74% Positive", "100%" |
| `Emerald/900` | `#0A4F4A` | `--nk-color-best-seller-tag` | "Chargers", Best Seller tag |
| `Green/700` | `#02A31E` | `--nk-palette-irish-green` | rating star in the info pill (kit tints stars by score: `--nk-color-star-*`) |
| `colour/text-n-icon/error` | `#D92626` | `--nk-palette-danger-red` | OOS banner text (`--nk-color-danger` is `#DE1C1C`, `Red/700`) |
| `Persian-Blue/500`, `Purple/700` at 4% / 92% | `rgba(65,70,206,…)`, `rgba(191,61,235,…)` | `--nk-color-pdp-ai-indigo4`, `--nk-color-pdp-ai-violet4`, `--nk-palette-title-gradient-indigo`, `--nk-palette-title-gradient-violet` | AI summary |
| `Primary. Colors/noon Yellow` | `#FEEE00` | `--nk-color-brand` | express artwork |
| ad card tint | `rgba(53,60,115,.03)` | **missing** | snap to `--nk-color-image-overlay` (2% black) |
| `#F0F2F7` (ad tag) | | `--nk-palette-border-color` | |
| `#F4F5FB` (FBT "+" border) | | **missing** | snap to `--nk-color-border-subtle` |
| `#383838` (sponsored card title) | | **missing** | snap to `--nk-color-text-product` |
| `#FAFAFA` (logo tile) | | `--nk-palette-alabaster` | |
| `Radius/4·6·8·10·12·16`, `Corner Radius/full` | 4…16, 9999 | `--nk-radius-r4` … `r16`, `--nk-radius-full` | |
| `Radius/18` | 18 | `--nk-radius-pdp-r18` | trust chips (already the NoonSeller metric radius) |
| info card top-end 20 | 20 | `--nk-radius-r20` | |
| `Gap/1·2·4·6·8·10·12·14·16·24`, `space/*` | | `--nk-space-s2` … `s24` (`Gap/1` → `--nk-space-pdp-s1`) | |
| `Elevations/100` | `0 0 8px rgba(2,6,12,.1)` | **missing**; nearest `--nk-shadow-raised` | not used on visible cards here |
| `Primary/Label2/Medium` 16/500/20 | | `--nk-type-pdp-title` | product title |
| `Primary/Label3/Bold` 14/700/18 | | `--nk-type-body-bold` | brand, Bestseller #1, seller name |
| `Primary/Label3/Semibold` 14/600/18 | | `--nk-type-body-semibold` | accordion titles, review title |
| `Primary/Label3/Medium` 14/500/18 | | `--nk-type-product-title` | |
| `Primary/Label3/Regular`, `Primary/Body2/Regular` 14/400/18 | | `--nk-type-body` | Sold by, offers row, AI bullets |
| `Primary/Label4/Regular`, `Primary/Label_4/Regular` 12/400/14 | | `--nk-type-text12-regular-lh14` | trust chips, sub text |
| `Primary/Label4/Semibold` 12/600/14 | | `--nk-type-text12-semibold-lh14` | OOS banner |
| `Primary/Label_4/Medium` 12/500/14 | | `--nk-type-text12-medium-lh14` | Helpful, Translate |
| `Body/B12/SemiBold` 12/600/16 | | `--nk-type-caption-bold` | newer-model strip label |
| `B14/Medium` 14/500/20 | | **missing** → add `pdpText14MediumLh20` | newer-model title |
| `B13/SemiBold` 13/600/18 | | `--nk-type-text13-semibold-lh18` | newer-model price |
| `B13/Medium` 13/500/18 | | `--nk-type-text13-medium-lh18` | chin title and price |
| `Body/B11/SemiBold` 11/600/14 | | **missing** → add `pdpText11SemiboldLh14` | chin label |
| `Primary/Tiny/Semibold` 10/600/12 | | `--nk-type-text10-semibold-lh12` | Verified Buy |
| `Primary/Body3/Regular` 12/400/18 | | `--nk-type-text12-regular-lh18` | "Avg. rating" note |
| card title 15/700/17 (no style) | | **missing** → add `pdpSectionTitle` (15/700/17) | every card title |
| Visit Store / View More 13/600/15 | | **missing** → snap to `--nk-type-text13-semibold-lh16` | |
| review score 22/800/24 | | **missing** → add `pdpScore` (22/800/24); nearest `--nk-type-pdp-text24-extrabold` | |
| ad price 16/700/20 | | `--nk-type-text16-bold-lh20` | |
| FBT / sponsored price 12/700/16 | | `--nk-type-text12-bold-lh16` | |
| FBT / sponsored title 12/500/15 | | `--nk-type-text12-medium-lh15` | |
| letter-spacing −0.1 … −0.28 | | none | the kit carries no tracking tokens; leave it at 0 |
| `fontFamily/primary` Noontree / `font-family/primary` Figtree | | `--nk-font-family` | |

## 4. Design components → kit

| Figma component / block | Kit piece | Status |
|---|---|---|
| Icon Button (40, soft neutral) | `.iconBtn` in `src/flows/pdp/pdp.module.css` (used by `SfHeader`); central `IconButton variant="glass"` (`src/components/Header/Header.tsx`) | exists |
| Header search icon button | `SfHeader` renders an expandable search pill instead | differs (§6) |
| product-image + Carousel Indicator | `SfGallery` + `PageController` (`src/flows/pdp/components/storefront/SfGallery.tsx`) | exists |
| "noon's exclusive" tag | `.galleryTag` (catalog tag gradient) in `SfGallery` | exists |
| 360 Pill Button | none | **missing**: add a 40px round button to `SfGallery`'s footer row (flow-local) |
| Main-Info (store strip + Info Card) | `SfMainInfo` (`src/flows/pdp/components/storefront/SfMainInfo.tsx`) | exists; strip differs |
| Rating (info pill) | `.rating` in `SfMainInfo`; central `RatingPill size="lg"` | exists |
| Ads (sponsored product row) | none | **missing**: proposed `SponsoredProductRow` in `src/flows/pdp/components/Sections.tsx`, using `ProductImage`, `Money`, `ExpressBadge`, `Badge` ("Ad") |
| OrderHistoryItems "Newer model available" | none | **missing**: proposed `NewerModelCard` in `src/flows/pdp/components/NewerModel.tsx`, using `ProductImage`, `Money`, `Icon name="zap"`, `IconButton` / `Pressable` |
| Product Overview "Product Details" (Highlights ×3) | `OverviewCard` + local `Accordion` (`Sections.tsx`) | exists; copy and metrics differ |
| Bestseller | `CategoryBestSellerCta` (`Sections.tsx`) | exists; small deltas |
| Seller widget | `SellerCard` (`Sections.tsx`) | exists; several deltas |
| Divider / Seperator (type=full) | `DashedLine` (`src/flows/pdp/components/Asset.tsx`) or central `DashedDivider inset={0}` | exists |
| Product features (A+) | none | **missing**: proposed `ProductFeaturesCard` in `Sections.tsx`: `Card` + images + bottom fade + `Button variant="noonGhost"` "View More" |
| Sponsored brand carousel ("Top quality products · Shop TECV · Ad") | closest: `CartCarousel` (`src/flows/cart/components/CartCarousel.tsx`, has `sponsored`) | **missing** in the PDP: proposed `SponsoredBrandCard` in `Sections.tsx`; promote to `src/components` if cart and PDP share it |
| Frequently bought together | `FbtCard` (`Sections.tsx`) | exists; copy and metrics differ |
| Ratings & Reviews: overview, AI summary | `ReviewsCard`, `AiSummary` (`src/flows/pdp/components/storefront/SfReviewsCard.tsx`) | exists |
| Photo Reviews strip | none | **missing**: add to `ReviewsCard` |
| Review Card (bordered) | `ReviewItem` (`SfReviewsCard.tsx`, separated list) | differs |
| Verified Tag, Helpful Button | `.verified`, Helpful in `ReviewItem` | exists |
| Similar products / Top products in … | `Recommendations` + `RecoCard` (`SfReviewsCard.tsx`, `RecoCard.tsx`); 134px cards match `CartCarousel`'s `SkuCard` | exists; title style and width differ |
| OOS banner (`Not eligible for return` + text) | none | **missing**: proposed `OosBanner` in `src/flows/pdp/components/storefront/SfAtcBar.tsx` (or `OosFooter.tsx`) |
| Successor chin | none | **missing**: proposed `SuccessorChin` (same file), shares its layout with `NewerModelCard` (`compact` prop) |
| Bottom nav (tab bar) | central `TabBar` (`src/components/TabBar/TabBar.tsx`) | exists, but the Navigator shows it only on tab roots (§7) |
| QTY + Add to cart (Case 1) | `SfAtcBar` | exists (adds Buy Now by default) |
| HP ETA / express artwork | `ExpressBadge` / `MarketplaceTag kind="express"`; PDP `Asset name="expressPdp"` | exists |
| Best Seller corner tag | `CatalogTag` | exists |
| Wishlist / ATC on cards | `WishlistHeart`, `QuickAdd` | exists |

## 5. Motion and interaction cues

| Cue in the design | Kit expression |
|---|---|
| Successor chin appears "as the first entry point goes out of the view" | Watch the in-page `NewerModelCard` with `useInView` (motion/react) on the PDP scroll ref, or `useMotionValueEvent(scrollY, 'change', …)` the way `DetailScreen` already sets `showTop`. Animate the chin with `AnimatePresence` + `initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}` on `spring.sheet` (like the `SfAtcBar` back-to-top and in-cart strip, which use `spring.press` / `spring.gentle`). The OOS banner stays put. |
| Accordions open / close | Existing local `Accordion`: height auto + chevron rotate 180°, `pdpTokens.accordionMs` (150ms) |
| A+ "View More" expands | Animate height from the 610 cap to `auto` with `tween('medium', 'out')` (`src/motion/presets.ts`) and fade the white gradient out |
| Gallery swipe and dots | Existing `SfGallery` drag + spring 300/34 and `PageController` (150ms ease-out) |
| Tap on the newer-model card or chin | `Pressable` (`spring.press`), then `nav.push('pdp/detail', { productId })` with the default `push` transition. Use `push`, not `replace`: the user should be able to go back to the old model. |
| Variant chip in Case 1 | Existing `VariantsCard` → `nav.replace('pdp/detail', …)` (`fade`) |
| Header buttons | `.iconBtn:active` opacity (`--nk-layout-pdp-press-default-opacity`), or `IconButton` (Pressable) |
| Wishlist heart | Existing `HeaderHeart` pop on `spring.bouncy` |
| 360 button | `nav.toast` in the prototype, or `nav.sheet` to a viewer screen |
| Cards entering | None in the design. Keep the PDP static, with no `Stagger` on PDP sections. |
| FBT check toggle | Existing `FbtCard` (button label swaps; "Added to cart" for `pdpTokens.fbtAddedMs`) |

## 6. Delta vs the current `src/flows/pdp`

Already matches: the overlay header with 40px whiteAlpha90 buttons; the swipeable gallery with the gradient catalog tag and dot controller; the brand strip + white info card with a 2-line title and 26h rating pill; white r16 cards inset 12 with gap 12 (`.card`); `#F9F9FB` r12 accordions with a rotating chevron; the white → mint best-seller CTA; the seller card structure (sold by + chevron, rating and positive pills, r18 metric chips, dashed divider, offers row); the FBT tiles with check, "+" and a skyBlue outline button; the reviews overview + AI summary gradient (`pdpAiIndigo4/Violet4`); verified chip, Helpful, "more"; recommendation carousels; the QTY + ATC footer.

| File | Change |
|---|---|
| `src/flows/pdp/tokens.ts` | `colors.bgPage` is `secondaryBackgroundColor #F9F9FB`; the design page is `#F2F3F7` (central default). Under this design, drop the override or set it to `palette.antiFlashWhite`. Add `type`: `pdpSectionTitle {15, 700, 17}`, `pdpText14MediumLh20 {14, 500, 20}`, `pdpText11SemiboldLh14 {11, 600, 14}`, `pdpScore {22, 800, 24}`. Add `colors.pdpStoreStrip: 'var(--nk-palette-lavender)'` and `colors.pdpNewerModel: 'var(--nk-palette-deep-purple)'`. Add `layout`: `pdpNewerImageW 55`, `pdpNewerImageH 68`, `pdpChinImageH 70`, `pdpRoundBtn 34`, `pdpAplusCollapsed 610`, `pdpAplusFade 229`, `pdpSponsoredCardW 216`, `pdpAdRowH 35`. `galleryRatio` 1.2 → the design is 512/375 ≈ 1.365. Confirm with the user before changing it, because it changes every PDP. |
| `src/flows/pdp/pdp.module.css` `.cardTitle` | `--nk-type-pdp-text16-bold` → `var(--nk-type-pdp-section-title)` (15/700/17). `.recsTitle` (18/700 `textLegacy`, outside a card) → the recommendation carousels become white r16 cards with the same 15/700/17 title. |
| `SfMainInfo.tsx` + `.info` / `.store` / `.storeBrand` | Strip bg `--nk-color-bg-store-strip` (`#E8F1FF`) → `--nk-color-pdp-store-strip` (`#E1EFFF`); padding 12 → pt 10, gap 8; brand 16/700 → `--nk-type-body-bold`; 17px tick → 24px verified badge; add the **"Visit Store" text** (13/600) before the chevron. Rating count copy "(3.2K ratings)" → "(34244 reviews)", unabbreviated, 13/600. Score 14/700 → 13/600. **Hide the price block, deal tags and coupons when out of stock.** `.info` margin-top `--nk-layout-pdp-info-overlap` (−20): the design has no overlap (8px gap under the gallery). |
| `SfHeader.tsx` | The design has a search **icon** button (40px) next to wishlist and share, not the expanding search pill, and a white → transparent top gradient instead of a transparent bar. Keep the pill if the bappzaar behaviour must stay; otherwise render `IconButton`-style buttons for search, heart and share. |
| `SfGallery.tsx` | Add the **360 button** at the footer end; the footer row sits 12 from the edges (`.galleryFooter` uses `s20`) and the dots sit 20 from the bottom (`--nk-layout-pdp-gallery-footer-bottom` is 30). |
| `Sections.tsx` `OverviewCard` | Title `copy.productOverview` "Product Overview" → "Product Details"; first accordion `copy.description` "Description" → "Overview". Card padding → 16·12. `.accordionHead` padding 16·12 → fixed 44h with 12 padding; chevron 16 → 20. |
| `Sections.tsx` `SellerCard` + CSS | Logo 54 image → 48 box (r10, 1px `--nk-color-border-subtle`, p12) with a store glyph (`Icon name="store"`, or the seller logo); "Sold by" 16 → 14 (`--nk-type-body`, name `--nk-type-body-bold`); rating pill shows "4.3 (128)" at 12px; positive pill 12px (`--nk-type-text12-semibold-lh14`, `--nk-palette-emerald-green`); metric chips 14 → 12 (`--nk-type-text12-regular-lh14`), gap 6 → 8, border `--nk-palette-border-primary`; **add the brand subtitle row**; offers copy "More offers from other sellers" → "{n} offers from other sellers from {Đ min}" with the price in 14/600 `--nk-color-text-primary`; offers row r8 → r10, 36h, inside a px-12 wrapper. |
| `Sections.tsx` `CategoryBestSellerCta` | Icon 32 (+10 padding) → 40; gradient 90° → 119° (keep the RTL flip); "#1" bold in `--nk-palette-dark-text-color`. |
| `Sections.tsx` `FbtCard` | Title "Frequently Bought Together" → "Frequently bought together" (sentence case); button `copy.buyTogether(n)` → "Buy all for {Đ total}"; check 28 at −8 → 24 at −5; tiles stretch to equal widths (`pdpFbtW 100` fixed); add the express ETA under the price. |
| `SfReviewsCard.tsx` `ReviewsCard` / `ReviewItem` | Each review in a bordered r16 card (1px `--nk-color-border`, pt 14 px 12 pb 12) instead of `.reviewSep` lines; add **Photo Reviews** and "Top reviews" sub-headers; add the "View product" chip and "Translate to عربي"; score 24/800 → `pdpScore` 22/800; "Verified Purchase" → "Verified Buy" (10/600). |
| `SfReviewsCard.tsx` `Recommendations` + `RecoCard.tsx` | Wrap in a white r16 card (p12, row pt 16, gap 12); card width `pdpTokens.recoCardWidth` (≈144) → 134; add the "Ad" tag on sponsored cards; titles "Similar Products" and "Top products in {leaf category}". |
| `DetailScreen.tsx` order | The design order is gallery → info → sponsored row → **newer model** → (Case 1/2: delivery → variants → reinforcement → payment offers) → Product Details → Bestseller → seller → **Product Features (A+)** → **sponsored brand carousel** → FBT → reviews → Similar products → Top products in {category}. Current order: delivery and payments sit before variants, `AdditionalInfoCard` has no counterpart in the design, and FBT comes after seller. |
| `SfAtcBar.tsx` / `DetailScreen` footer | **Missing OOS state**: when `content.outOfStock` (new field), render `OosBanner` + `SuccessorChin` instead of the ATC row. Case 1 drops Buy Now (QTY + full-width Add to cart). The design shows the tab bar under the footer. |
| `data.ts` | Add `PdpContent` fields: `outOfStock?: boolean`, `unavailableAtLocation?: boolean`, `successor?: { productId: string; title: string; price: number }`, `sponsoredRow?: { productId: string }`, `aplusImages?: string[]`, `sponsoredBrand?: { name: string; tagline: string; productIds: string[] }`, `seller.subtitle?`, `seller.offerCount` / `seller.offerFrom`. Add copy: `productDetails: 'Product Details'`, `overview: 'Overview'`, `visitStore: 'Visit Store'`, `newerModel: 'Newer model available'`, `outOfStockBanner: 'This item is currently out of stock'`, `notAvailableHere: 'This item is not available at your current location'`, `productFeatures: 'Product Features'`, `viewMore: 'View More'`, `ad: 'Ad'`, `buyAll: (p) => \`Buy all for ${p}\``, `offersFrom: (n, p) => \`${n} offers from other sellers from ${p}\``, `similarProducts: 'Similar Products'`, `topProductsIn: (c) => \`Top products in ${c}\``, `photoReviews: 'Photo Reviews'`, `topReviews: 'Top reviews'`. Prices go through `money()`. The Figma shows "AED 5099" for the struck price; render it with the dirham sign like every other price. |
| `index.ts` | Add `ScreenDef` notes for the OOS case (e.g. `defaultParams` variant `?productId=<oos id>`) and put `source: 'Figma 2ldJbjmQq4RkhnrNFCfXQB 930:259766 (Case 3 OOS)'` next to the bappzaar source. |
| `MAPPING.md` | Add a `FIGMA-MAPPING.md` (from-reference.md format) for the sections above before changing code. |

## 7. Build guidance

**Which source.** This Figma is the Storefront team's newer PDP. Use it when the user shares this file or asks for "the new PDP", "newer model" or "out of stock". Otherwise the bappzaar-faithful `pdp/detail` stays the default. Restyling `pdp/detail` changes a shipped port, so confirm with the user first, or build the design as new screens in the same flow (`pdp/detail-v2`, `pdp/oos`) and keep the route ids stable.

**Skeleton** (reuse `DetailScreen`'s shell):
```tsx
<Screen ref={scrollRef} header={<SfHeader … />} overlayHeader safeTop={false} background="bgPage"
  contentStyle={{ paddingBottom: 0 }}
  footer={content.outOfStock || content.unavailableAtLocation
    ? <OosFooter content={content} showChin={!newerInView} />   // banner + SuccessorChin
    : <SfAtcBar product={product} … />}>
  <SfGallery …/>            {/* + 360 button */}
  <SfMainInfo …/>        {/* price block hidden when OOS */}
  <SponsoredProductRow …/>
  <div ref={newerRef}><NewerModelCard …/></div>
  {!oos && <><DeliveryCard/><VariantsCard/><ReinforcementCard/><PaymentsCard/></>}
  <OverviewCard/> <CategoryBestSellerCta/> <SellerCard/> <ProductFeaturesCard/>
  <SponsoredBrandCard/> <FbtCard/> <ReviewsCard/> <Recommendations/> <Recommendations/>
</Screen>
```

**Rules for this design**
- Every section is the flow's `Card` (or central `SectionCard`): white, `--nk-radius-r16`, padding `--nk-space-s12`, margin `0 12px 12px`, with the title in `--nk-type-pdp-section-title` (`--nk-color-text-strong`). Product Details uses padding 16·12.
- Sub-surfaces use `--nk-color-bg-subtle` (accordion rows, pills, subtitle row) and `--nk-palette-alice-blue` (offers row, info chips), with r10 / r12.
- The newer-model card and the chin share one component: the full variant has the purple gradient strip, 14/500 title and 55×68 image; the compact chin has an 11/600 purple label, 13/500 title and 55×70 image. Both end in a 34px round chevron button and push the successor PDP.
- Out of stock: no price and no ATC. Footer = OOS banner (top r16, `--nk-palette-danger-red`, `--nk-type-text12-semibold-lh14`) + chin that slides in once the in-page card leaves the viewport. Not available at location: the same footer with the location copy.
- Ads: tag every sponsored element with `Badge` "Ad" (bg `--nk-palette-border-color`, colour `--nk-color-price-old`). Never mix sponsored and organic cards without the tag.
- The tab bar on a pushed PDP is a design-mock detail. The Navigator renders `TabBar` only on tab roots (`defineFlow({ tabBar })`), and `TabBar`'s `.bar` is absolutely positioned. If the user wants it, render `<TabBar active="home" />` inside a footer wrapper with `position: relative; height: calc(var(--nk-layout-tab-bar) + var(--nk-inset-bottom))` beneath the ATC or OOS stack, and drop the stack's own bottom inset.
- Copy: sentence case ("Frequently bought together", "View More" as drawn); dirham sign everywhere; counts are not abbreviated in "(34244 reviews)".
- Verify with `node scripts/shot.mjs pdp/detail` and compare against `scratchpad/figma/pdp/full.png` (Case 3) and `case1_*.png` (Case 1).

**Storefront.** The design has no brand-storefront page. "Visit Store" keeps today's behaviour (`nav.push('plp/listing', { query: content.brand })`, as `SfMainInfo`'s store button does) until a storefront design exists. Do not invent a storefront flow from this node; ask for the storefront frames first.
