# Cart → Figma "✅ Cart 2.0" mapping

Source: file `BaWAAGW7zmdSTkXNXqPcAJ`, frame `10575:94058` "Phase I Default - regular user" (383×4324).
Styling follows Figma; product data, titles, prices and copy stay the kit's (`data.ts`, `src/mocks/products.ts`).
Figma assets live in `src/assets/cart/figma/` (downloaded through the Figma MCP, no remote URLs in code).

Token legend: `c.` = `--nk-color-*`, `p.` = `--nk-palette-*`, `t.` = `--nk-type-*`, `s.`/`r.` = space / radius.
Cart-only tokens (`c.cart-*`, `t.cart-*`) are in `tokens.ts` (`cartFigmaColors`, `cartFlowTokens.type/shadow`, `groupTheme`).
New global palette entries, appended to `src/foundations/palette.ts` and named after the Figma variable:
`yellow200` (Yellow/200 #FDF69B), `purple100` (#F9E9FE), `purple200` (Purple/200 #EFC9FB), `green200` (Green/200 #BEEFCC),
`persianBlue50` (#EDEDFD), `persianBlue100` (#CECFF8).

## Figma variable → kit token

| Figma variable | Value | Kit token |
|---|---|---|
| Blue-Gray/1000 | #101628 | c.text-strong |
| Blue-Gray/900, colour/text-n-icon/primary | #1D2539 | c.text-primary |
| Blue-Gray/800 | #343D54 | c.text-body |
| Blue-Gray/700 | #475067 | c.text-muted |
| Blue-Gray/600 | #666D85 | c.text-secondary |
| Blue-Gray/500 | #989FB3 | c.text-tertiary |
| Blue-Gray/400 | #D0D4DD | c.border-strong |
| Blue-Gray/300 | #EAECF0 | c.border |
| Blue-Gray/200 | #F2F3F7 | c.border-subtle / c.bg-page |
| Blue-Gray/100, Sementic/BG/secondary | #F9F9FB | c.bg-subtle |
| Blue-Gray/50 | #FCFCFD | p.blue-gray50 |
| Sementic/Text/primary, Icon/primary | #0E0E0E | c.text-ink |
| Sementic/Text/secondary | #5D5D5D | p.secondary-text-color |
| Sementic/Text/tertiary | #959595 | p.lighter-spanish-gray-color |
| Sementic/Text/primary-hover | #212121 | c.text-product |
| Sementic/Border/secondary | #EBEBEB | p.bright-grey-color |
| Sementic/Border/primary | #F5F5F5 | p.border-primary |
| Sementic/Border/secondary-alpha, Alpha/GrayA/300 | #0E0E0E12 | p.neutral-black-hex12 |
| Alpha/GrayA/400 | #0E0E0E24 | p.neutral-black-hex24 |
| Alpha/GrayA/200 | #0E0E0E0A | c.bg-disabled |
| Emerald/700 | #1F7A74 | p.emerald-green700 |
| Grass/700 | #108757 | c.best-price-ink |
| Accent/700 | #0057FF | c.brand-blue |
| Blue/600, Accent/600 | #0076FF | c.link |
| Blue/50 | #EFF7FF | p.alice-blue |
| Red/700 | #DE1C1C | c.danger |
| Persian-Blue/600 | #2F33C0 | p.persian-blue |
| Yellow/200 / Purple/200 / Green/200 / Green/100 | — | p.yellow200 / p.purple200 / p.green200 / p.green100 |
| Primary/Body2/Medium 14/18 | | t.product-title |
| Primary/Label2/Bold 16/20 (-0.16) | | t.text16-bold-lh20 |
| Primary/Label3/Bold · Semibold · Regular 14/18 | | t.body-bold · t.body-semibold · t.body |
| Primary/Label-3 Medium 13/16 (-0.26) | | t.text13-medium-lh16 |
| Primary/Body3/Regular · Medium 12/16 | | t.caption · t.text12-medium-lh16 |
| Primary/Label4 Semibold · Medium · Regular 12/14 (-0.12) | | t.text12-semibold-lh14 · t.text12-medium-lh14 · t.text12-regular-lh14 |
| Primary/Label5/Regular 11/12 (-0.12) | | **t.cart-label5** (new) |
| Primary/Tiny/Medium 12/18 (+0.12) | | t.text12-medium-lh18 |
| h4 Bold 20/24 (-0.2) | | t.text20-bold-lh24 |
| Primary/Label-1/Semi Bold 17/20 (-0.26) | | t.text17-semibold-lh20 |
| Gap/Radius 2…36 | | s.s2…s36 / r.r2…r16, r.full |

Letter-spacing values have no kit token group; they are kept as px literals next to each `font:` (geometry, like sizes).

## Sections

### Nav Header — `10575:94722` → `components/CartHeader.tsx`, `header.module.css`
| Property | Figma | Kit |
|---|---|---|
| layout | status bar + gap 4; row gap 24, px 12, pb 8 | `calc(inset-top + s.s4)`, s.s24 / s.s12 / s.s8 |
| address block | 41px, two lines | `.selector` column |
| icon | 20px slot, Address type (home) | `figma/addr-home.svg` (Work/Other keep kit webp) |
| label | Figtree Bold 16/21.1 -0.30 #1D2539, text-shadow 0 8 16 rgba(0,0,0,.07) | t.cart-header-label, c.text-primary, shadow.cart-header-label |
| chevron | 16px #1D2539 | `figma/addr-chevron.svg` |
| address | 13/18.1 -0.30 #475067, ellipsis, w266, ml 2 | t.text13-regular-lh18, c.text-muted |
| wishlist | 36px white circle, 1px #F2F3F7, heart #035794 | `figma/header-wishlist.svg` |

### Marketplace groups — Express `10575:94104`, Global `10575:94090`, market `10575:94119` (Supermall `10575:94060` reference) → `components/CartGroup.tsx`, `group.module.css`, `tokens.ts#groupTheme`
| Element | Figma | Kit |
|---|---|---|
| group | col, r16, gap 12 between groups | `.group` margin s.s12, r.r16 |
| Glass effect Container | fill express #FDFDF1 · Global #F5F2F7 · market #EFFAEA; 1px Blue-Gray/100; r16; pt 8; gap 6; mb -24; z2 | c.cart-glass-express/-global/-market, c.bg-subtle |
| Color waves 🌊 | 206×53.5 at 1/0 (3 layers, group colour) | `figma/waves-express.svg` · `waves-global.svg` · `waves-market.svg` |
| fulfilment type | h20, px 20 | `.fulfilment` |
| logo | express wordmark 64.6×12.7 · Global icon 26.6×24.7 + "Global" Figtree Bold 14.45 #3D4048 · market store icon (19.3 box) + wordmark 52.2×10.9 | `logo-express.svg` · `logo-global-icon.svg` + t.cart-global-logo, c.cart-global-logo-ink · `logo-market-store-icon.svg` + `logo-market-wordmark.svg` |
| items | white, 1px border express Yellow/200 · Global Purple/200 · market Green/200, r16, pt 12, gap 16, clip | p.yellow200 / p.purple200 / p.green200 |
| divider | Dividers type=dotted 335×1, #EBEBEB dash 5/5 | `.divider` background `figma/dotted-divider.svg` (repeat-x) |
| Stacks rows | h40, p12, gap 8, top 1px Blue-Gray/200; 20px icon + Body3/Regular #343D54 | `.stack`, `figma/clock.svg`, html.groupCallout (kit `groupCallouts` copy) |
| One callout | 20px noon One logo; "Save with noon One." 12/16 500 · "Try it now for" 12/16 · "Free" 12/14 600 Emerald/700 | **new** `NoonOneNudge.tsx` + `NoonOneLogo.tsx` (`noon-one-logo-base.svg` + `-text.svg`); hidden for members, opens `noonone/landing` |
| Progress bars | gradient -1.08deg white 6.77% → express #FEFDD4 · Global Purple/200 · market Green/100 at 264%; pt 36 pb 16; bottom r16 | `groupTheme.progressEnd` (c.cart-progress-express, p.purple200, p.green100) |
| message | Medium 13/16 -0.26 #101628 | html.progress (t.text13-medium-lh16) |
| bar | 4px; track Blue-Gray/300 r6; fill #101628 (Global #000) r2 | `groupTheme.track/fill`, `cartTokens.progress.barHeight = 4` |
| Add | 57×26 white, 1px Alpha/GrayA/400, r6, py4 pl6 pr12, gap 2, 16px plus, Label3/Semibold #101628 | `.progressButton`, `figma/add-plus-16.svg` |

### Cart item — Component 120 (`I10575:94083`, `10575:94114`, `17193:23867`, `10575:94116`) → `components/CartItem.tsx`, `ItemPoint.tsx`, `QuantitySelector.tsx`, `DiscountTags.tsx`, `item.module.css`
| Element | Figma | Kit |
|---|---|---|
| card | 335 wide (7px inside the card border), col gap 12; row gap 12 | `.card`, `.container` |
| image box | 104×144, BG/secondary #F9F9FB, r12, p8, mb -16 | `.imageBox` c.bg-subtle |
| M-Checkbox | 24px at 8/8 (selected #1D2539) | `figma/checkbox-checked.svg` (local select toggle; no store behaviour) |
| side tag ("CUSTOMIZABLE", market mug) | vertical tab on the image edge (baked into the Figma photo) | `.sideTag` with the kit `catalogTag` copy, c.cart-slate600 (approximation) |
| Stepper Button | 92×38, white, 1px Border/secondary #EBEBEB, r8, gap 8; 16px minus/trash/plus; value Bold 14/18 -0.14 #0E0E0E w20 | `.qty*`, `figma/minus.svg` `plus.svg` `trash.svg`, t.body-bold |
| title | Body2/Medium 14/18 Blue-Gray/1000, 2 lines | t.product-title, c.text-strong |
| wishlist | Blue-Gray/50, 1px Blue-Gray/200, r8, p8, 16px icon | p.blue-gray50, c.border-subtle, `figma/wishlist.svg` |
| customization ("Aliaa · Edit") | #F9F9FB r4 px6 py2; 14 regular #343D54; Edit 14 600 #0057FF | `.customization` c.bg-subtle, c.brand-blue |
| variants row | #F9F9FB r6 px6 py2; 12/14; chevron 16 #0057FF | `.variantChip`, `figma/variants-chevron-right.svg` (SalesCallout `chevron`) |
| Subtitle Block (Combo / bundle) | gradient #EAF4FE → white, r6, px6 py2 | `.subtitleChip`, c.cart-combo-bg |
| price | Label2/Bold 16/20 -0.16 #101628 · old Body3 12/16 #666D85 strike · % Label4/Semibold Emerald/700; gap 4, pb 1 | `.price*` |
| ETA pill | gradient express #FDF9C4 (Global/market #F5F5F5) → white, px6 py4 r6; 13/18 regular #1D2539 + bold #101628 | `groupTheme.eta`, html.eta |
| ETA second line | h20 px6, Label4 12/14 #343D54 (+600) | `.etaExpiry`, html.etaExpiry |
| Coupons bar | #F6FEFD, 1px dashed Emerald/700 40%, r8, px10 py8, gap 2; 12/14 600 #1D2539 + 12px chevron #666D85; 30px white fade | `.discountTag` p.mint-cream, p.emerald-green700-alpha40, `figma/chevron-right.svg` |
| USPs Urgency | #F3F5FC → white (107%), px6 py4 r4, gap 4, 16px arrow-down-circle; Label4/Medium #475067 | `.urgency` c.cart-urgency-bg, `figma/arrow-down-circle.svg`; kit `usps` reuse the pill |
| Item points | wrap gap 6, each pl6 gap 4; 16px icons; Label5 11/12 #1D2539 | `ItemPoint.tsx`, `refunds.svg` `non-returnable.svg` `card.svg` `fast-delivery.svg` `warranty-shield.svg`+`warranty-tick.svg`, t.cart-label5 |
| notes ("* While stock lasts") | Blue-Gray/100 → transparent, h24 px6 r4, 12/14 #666D85 | `.note` |
| Extended warranty row | px8 wrapper; 1px Blue-Gray/300 r12 px12 py8 gap 4, gradient 178.7deg white 24% → Blue-Gray/200 167%; 20px shield; 12/16.8 500 #343D54; "Add" 12/16.8 600 #0E0E0E dotted underline | `.ewRow`, `figma/ew-shield.svg`, t.cart-ew-text / t.cart-ew-cta |
| Protection added (Protect4less) | 1px #FCF4DE r12 p12, white → #FFF7E5; 16px cross #FFF5DF at 11/9 (12px x-mark #475067); 38px creative; name 12/14 500 #5D5D5D; title/price 14/18 600 | `.warranty*`, c.cart-protect-*, `figma/x-mark.svg`, `figma/warranty-creative.svg` |

### Cart Sticky footer — `10984:103787` → `components/CartFooter.tsx`, `footer.module.css`
| Element | Figma | Kit |
|---|---|---|
| savings tab | Color waves 239×48 #E7FBF3, label ml12 mt4 px4 py2; Label3 14/18 Emerald/700 (amount SemiBold) + noon One logo | kit patch + `CartWave` filled with c.cart-savings-wave; html.savings. Kit copy kept ("You're saving … on this order"), so the tab is built from patch + wave instead of the fixed 239px Figma wave |
| footer | white, r12 top, h72, px12 py10, gap 12, shadow 0 -4 10 rgba(0,0,0,.08) | `.footer`, shadow.cart-footer |
| Total | w131 pl4 gap 4; "Total" Label4/Medium #666D85; price h4 Bold 20/24 -0.2 #0E0E0E dotted underline | `.totalLabel` (kit adds the item count) / `.totalPrice` |
| Checkout | Accent/700, h52, r12, px16 py12; Label-1 17/20 -0.26 white | `.cta` c.brand-blue, t.text17-semibold-lh20 |

### Product Carousels — offers `10575:94169`, wishlist `10575:94308` → **new** `components/CartCarousel.tsx`, `sections.module.css`
Card white r16, py12. Cards Header px12: Label2/Bold #0E0E0E + "Sponsored" Label4/Medium Text/tertiary. Row gap 12.
SKU 134 wide, gap 4: image 134×174 Blue-Gray/300, 1px Blue-Gray/200, r10; heart 24px (white 20%, full radius, p4) at 3/3 (`heart-outline-offers.svg`);
"+" 32px white, 1.2px Blue/600, r8, p4 at 95/135 (`add-plus-blue.svg`); info p4 gap 8: title 14/18 500 #212121 2 lines; price Bold 15/20 #0E0E0E,
old 12/14 #848391 strike (p.gray), % 12/14 600 Grass/700; express pill (`pill-express.svg`). Offers use kit products not in the cart; wishlist uses `useDemoStore().wishlist`.
The empty cart's "Customers Also Viewed" (kit copy) uses the same carousel.

### OOS style freebies — `11316:46017` → **new** `components/FreeGifts.tsx`
1px Border/secondary-alpha r16, gradient 179.3deg #F6FEFD 12% → white 20%; header p12 gap 8 (20px `gift-green.svg`, Figtree Bold 16/24 #101628 → t.cart-gifts-title);
body pt4 pb12; image 80×109 #F5F7FB r12 (c.cart-freebie-image-bg), photo 40% + 34px lock badge (`lock-badge-freebie.svg`);
title 14/18 500; FREE Label3/Bold Grass/700 + strike; "<b>AED x</b> left to unlock" 14/14; 4px Grass/700 bar on Blue-Gray/300; 57×26 Add.
Demo data: `freeGift` in `data.ts` (kit product p5, unlocks at an AED 5,000 cart total).

### Coupons → `components/CouponInput.tsx`, `coupon.module.css` — **bappzaar master wins** (exception to this frame)
The user chose master over the Figma frame `10575:94148` for the whole coupon block (2026-10-14). Source: `marketplaces/noon/components/NoonCouponInput/{NoonCouponInput,styles}.tsx` + `NoonCartScreen/styles.ts` `couponInputContainer`.
Outer card #EAECF0 (lightGreyColor), mt 12 mx 12, r16, 1px #EAECF0 → white container r16, pt 10 pb 18 px 16; title 16 bold #0E0E0E mb 10;
input row #F9F9FB, 1px #F2F3F7, r12, min-height 54; applied tag icon 16 (`applied-coupon.svg`, min-height 52, pl 12) tinted per state; input 14 semibold #0E0E0E, pl 12, placeholder #666D85;
APPLY / REMOVE uppercase 12 semibold #343D54 (disabled #989FB3), px 12; feedback pt 2 px 2, HTML 12 −0.12.
States: success border #9EE9E4, text + icon #13645F · error #FECACA / #B22424 / icon #B22424 · warning #FDE68A / #B45309 / icon #F5AF39.
Offers row on the grey, mx 16 my 12, gap 8: `discount-icon.svg` #1F7A74, `noon_view_more_available_offers` 14 semibold #0E0E0E, `chevron-thick.svg` #1D2539 (RTL flipped).
Apply / remove: `CART_APPLY_COUPON` / `CART_REMOVE_COUPON` set `screenState: RELOADING` → FeedbackView `overlayLoader` (absolute fill, `rgba(255,255,255,0.6)`, centred Loader) over the cart (`CartScreen` `.reloading`); no inline spinner, shake or icon pop-in.
Not modelled: the best-price `trayButtonMessage` (mintGreen300 → mintGreen200 gradient fading in over 1500 ms + HTML message in the offers row; the demo tray sends none) and the offers-row loading skeleton (`isCouponTrayLoading`).

### Payment offers — `11008:110900`
Screenshot export of this instance was empty; the kit `paymentCallouts` (incl. the noon One callout owned by the noon One work) keep their content and get the
shared Figma card treatment (white r16, Cards Header title style). Callout internals unchanged.

## Not reproduced / deviations
- **Supermall group** (`10575:94060`): superseded — shipped from All flows `127:39689` (see "All flows · 127:39687" below).
- **Freebies (Lucid Air promo, `10575:94167`)**: campaign-specific artwork with no kit equivalent; skipped.
- **Free item row (“Free Samsung soundbar”, grey disabled checkbox, gift stepper)**: kit has no freebie line type; `checkbox-disabled.svg`
  and `gift-stepper.svg` are downloaded for when one exists.
- **"Ad" tag, "express Today" pill**: kit products carry no ad / same-day flag.
- **Fonts**: Figma header label, Global wordmark, free-gifts title and coupon placeholder use Figtree; the kit's primary face is Noontree
  (Figtree fallback). Only the Global wordmark / free-gifts title set Figtree explicitly.
- **Group-header logo pills**: Figma uses the colour-waves tab as the pill with a bare logo; shared `MarketplaceTag` renders a standalone
  pill shape, so the group headers use the Figma logo assets instead (no shared-component change made).
- **Cart updates banner** and **Unavailable items** (InactiveGroup) are kit/master sections absent from this Figma frame: kept, tokenised only.
- Item image box shows kit photos with `mix-blend-mode: multiply` so white-background photos sit on #F9F9FB like the transparent Figma PNGs.

## Shared-component follow-ups (not edited)
- `src/components/TabBar`: Figma tab bar (Home / Categories / Deals / Account / Cart, active Cart #0076FF with a top indicator) differs slightly from the kit tab bar.
- `src/components/Tag/MarketplaceTag`: could gain a "logo only" variant (`express`, Global icon + wordmark, market store + wordmark) matching the Figma fulfilment-type logos.
- `src/components/ProductCard`: a "SKU 134" compact variant (grey image box, outlined blue +) would let PLP / home carousels share `CartCarousel`'s card.

### Sticky footer — remapped to bappzaar 1:1 (Oct 2026)

`components/CartFooter.tsx` + `footer.module.css` now follow bappzaar `NoonCartScreen` `renderFooterSavings` / `renderInvoice` / `renderFooter` and its `styles.ts` instead of the Figma rows above:
- footer: paddingTop 10, paddingBottom = safe-area inset (10 without one / above the tab bar), r12 top; shadow 0 7 8 black at 0.3, off while the invoice is open; content row px 12, space-between.
- nudges (left): no min width or left padding, marginRight 32, rows 4 apart; message colours p #0E0E0E, steel 500 slateGray; total not underlined.
- Checkout: flexGrow, min 148 × 52, accentBlue #0057FF, r12, 17 semibold white, pressed opacity 0.6.
- savings tab: bottom on the footer top (translateY −footerHeight), left 12, max width screen − 55, shadow3 0 7 8 black 0.4; callout py 8 px 0, gap 4; patch 50 wide, 120% + 16 high; wave height = tab height + 2.
- invoice sheet unchanged (already NoonCartScreen invoiceContainer: max 400, pt 12, pb 24, r20 top; 300ms slide, 0.5 backdrop in 200ms, swipe down > 50 closes).

### Sticky footer — back to the Figma (All flows Af34gfmhQ1D0wstXUEHSIF · 127:40209)

Supersedes the bappzaar remap above for the visuals (behaviour unchanged):
- savings: "Color waves 🌊" 239 × 48 #E7FBF3 wave (`src/assets/cart/footer/savings-wave.svg`), overlapping the footer by 16; label at ml 12 mt 4, px 4 py 2, gap 8 — "₫{savings}" SemiBold + " saved!" Regular, Label3 14/18 −0.14 Emerald/700, then the 20px noon One logo (`NoonOneLogo`).
- footer: white, r12 top, 72 high (py 10), px 12, gap 12, drop shadow 0 −4 10 black 8%.
- Total: 131 wide, pl 4; "Total" Label4 12/14 Medium #666D85; price H4 20/24 Bold #0E0E0E −0.2 with a dotted underline, two decimals.
- Button: flex 1, 52 high, px 16 py 12, Accent/700 #0057FF, r12, Label-1 SemiBold 17/20 −0.26 white.

## All flows · 127:39687

Source: file `Af34gfmhQ1D0wstXUEHSIF` ("All flows"), frame `127:39687` "Cart" (375 × 4085), named by the user as the current cart design.
Precedence (`truth: 'mixed'`): this frame for visuals; bappzaar master `NoonCartScreen` for behaviour, copy keys and section logic.
Kit screenshots (top and every 700pt) were compared with the frame section by section.

### Section → kit

| Figma section | Node | Kit | Tokens / assets |
|---|---|---|---|
| Nav Header | `127:40185` | `CartHeader` (unchanged, already this design) | — |
| Page container | `127:39688` | `CartScreen` `SECTIONS`; sections **8 apart** (was 12), 12 gutters; carousels 12 apart (`.carousel + .carousel`) | s.s8 / s.s12 |
| Supermall | `127:39689` | `CartGroup` type `supermall` (first in `GROUP_ORDER`) | `groupTheme.supermall`: glass c.cart-glass-supermall #E8E8F3, items border p.persian-blue100, track c.cart-track-supermall #E3E3FC, fill p.rocket-blue-sapphire #2122B8, progress fill `linear-gradient(0deg, white, c.cart-progress-supermall #EBEBFE 84.375%)`; `figma/waves-supermall.svg`, `figma/logo-supermall-super.svg` + `logo-supermall-mall.svg` (76×18, layer boxes 0/4.12 and 44.82/0) |
| supermall ETAs | `89:44427` | `CartItem` ETA pill, `deliveryInfo.icon: 'flash'` | gradient c.cart-eta-supermall #F5F5FC → white, gap 4, `figma/eta-flash.svg` 14px, text + bold `etaInk` p.rocket-blue-sapphire |
| supermall "+ Add" | `127:39717` (`10248:86043`) | `GroupProgressBar addVariant="supermall"` | border p.persian-blue50, ink p.persian-blue #2F33C0, pl 4 pr 8 py 4, t.text13-semibold-lh18, `figma/add-plus-supermall.svg` 14px |
| Stacks | `127:39715` | `CartGroup` stack row | supermall copy "Save on fees at checkout with later delivery!" (`groupCallouts.supermall`) |
| Global / Express / market | `127:39718` / `127:39732` / `127:39747` | `CartGroup` (unchanged Cart 2.0 theming; `groupTheme.*.progressBg` now holds the −1.08deg gradient) | progress copy per group: "Add ₫ X from Global / Express / Market for free shipping", supermall "… for free service fees" (`progressMessage(…, group)`) |
| express ETA nudge | `89:44435` | `html.etaExpiry` `<red>` | "Order within" + SemiBold c.danger #DE1C1C |
| Product Carousel ×2 | `127:39775`, `127:39914` | `CartCarousel` + central `SkuCard look="cart"` (card unchanged) | card 1px c.border-subtle; header px 16; title t.section 16/22 −0.15 c.text-primary |
| Coupons | `127:40052` | `CouponInput` — **bappzaar master** (see Coupons above) | master layout, not this frame |
| Cobrand | `127:40071` | **new** `components/CobrandCards.tsx`, `cobrand.module.css` | 351×138 white r16; title t.section c.text-primary at 12/14; terms t.text12-regular-lh18 −0.1 c.text-muted with the 8px diamond bullet (`cobrand/diamond.svg` + `diamond-light.svg` hard-light + `diamond-shade.svg` multiply); M-NeutralButton h36 px16 py10 r8 c.text-strong, t.caption-bold c.text-inverse; art 257×138 at the right (`cobrand/noon-one-card.webp`, Figma render of `127:40073` incl. its white fades) |
| Offers for you | `127:40114` | **new** `components/PaymentOffers.tsx` → `SalesCallout` | card pt 12 pb 14 gap 12, title px 14 t.section; row gap 8 px 12; entries 259 wide, 1px c.border-subtle r16 p8 gap 8; tiles 48 r12 (`payment/tamara-tile.webp`, `payment/tabby-tile.webp` = Figma renders; `payment/bank-installments.svg` on c.cart-noon50 → p.pale-yellow-gradient with 1px c.cart-noon300; `payment/tax-refund.svg` on white with 1px p.black-alpha4); copy `html.paymentOffer` (t.caption-bold −0.1 c.text-primary, `<highlight>` "Learn more" c.primary) / `html.paymentOfferRegular` for the bank + tax tiles |
| Footer · Color waves · Sticky footer | `127:40208`–`127:40220` | `CartFooter` (unchanged, mapped in the section above) | — |
| Bottom Nav | `127:40230` | shared kit `TabBar` (not restyled) | — |

### Behaviour kept from bappzaar master

- Section order is the server `sectionsOrder`: `updates → groups → secondary_groups → cms_bottom → wishlist → free_gifts → coupon_tray → cobrand_cards → callouts`. `cobrand_cards` is master's `renderCobrandCards` (`NoonCartCobrandCards`); the Figma has no cart-updates banner, unavailable items or free gifts, so those stay where master renders them.
- Cobrand cards: master `NoonCartCobrandCards` — tripled list starting on the middle copy, auto-advance every 3000 ms, snap back into the middle copy, auto-scroll stops for good once the user drags/touches/wheels, single card = no scroll; tap follows `linkUrl` (a toast in the kit: no cobrand flow exists). Hidden on the empty cart.
- Payment offers: master `NoonCartScreenCallouts` horizontal entries (259 wide, 48px icon, 2-line message). noon One entry still opens `noonone/landing` and is hidden for members; the other entries follow their deeplink (toast).
- Groups: totals, shipping, free-delivery threshold (`FREE_DELIVERY_THRESHOLD` 100, per group) and progress only from `useDemoStore().cartTotals`; supermall is one more `cartTotals.groups` entry (so a fourth group can waive its own shipping, which the savings tab includes). Stepper, trash at qty 1, wishlist move + snackbar, chips → sheets, warranty add/remove, foupon, coupons (NOON10 / SAVE50), invoice, Checkout (→ noon One VIP push once per session for non-members, else checkout) unchanged.
- Checkout keeps its three shipments: supermall cart lines join checkout's supermall shipment (`shipmentGroupOf` in `src/flows/checkout/data.shipment.ts`).

### Not matched exactly

- **Item data**: product titles, photos, prices, chips and points are the kit mocks (p6 / p1 / p8 / p11), not the Figma placeholders (AirPods photos titled "Apple Watch…", "Comes with a free soundbar", "Combo"). The Figma's free soundbar line (grey checkbox, "FREE … 100% OFF") still has no kit line type.
- **Progress state**: the Figma shows every group under the threshold; the kit computes it from the cart, so supermall / express / market show master's "Yay! You get FREE …" state at their subtotals, Global shows "+ Add".
- **Copy from master kept**: "View available coupons & offers" (`noon_view_more_available_offers`) instead of the frame's "View all coupons & discounts"; "Sponsored" spelling (frame: "Sponsord").
- **Card width**: the kit phone is 390pt, so 351-wide Figma cards render 366 wide; the cobrand art stays pinned right at 257×138.
- **Second cobrand card** repeats the first (the frame shows the same card twice).
- Bank-installments and tax-refund tiles: their Figma PNG exports were empty, so the vector logo is shown on the tile fill/border from the frame instead of a single render.
