# Checkout → Figma "🚧 Checkout 2.0" mapping

Source: file `zURu7GI7sq77fjdXKrouvo`, frame `14288:183972` "Checkout" (375×2309; the 403×2337 screenshot includes the
device bezel). The Figma takes precedence over `MAPPING.md` (bappzaar master port) for the default checkout screen.
Styling, structure, order, assets and UI copy follow the frame; item data (products, prices, quantities, totals) stays
driven by DemoStore `cart` / `cartTotals` through `totals.ts`. Figma assets live in `src/assets/checkout/figma/`
(downloaded through the Figma MCP — no remote URLs in code).

Token legend: `c.` = `--nk-color-*`, `p.` = `--nk-palette-*`, `t.` = `--nk-type-*`, `s.`/`r.` = space / radius,
`sh.` = `--nk-shadow-*`. Checkout-only tokens are `c.chk-fig-*`, `t.chk-fig-*`, `sh.chk-fig-*` in `tokens.ts`.
New global palette entry (appended, named after the Figma variable): `grayA1000` (Alpha/GrayA/1000 #0E0E0EEB).
Letter-spacing has no token group — kept as px literals next to each `font:` (like the Cart 2.0 pass).
Fonts: Figma uses Noontree, Figtree (summary / header) and Proxima Nova (footer, NEW badge); the kit renders all of them
with the kit font stack (Noontree first) at the Figma size / line / weight.

## Figma variable → kit token

| Figma variable | Value | Kit token |
|---|---|---|
| Blue-Gray/1000 | #101628 | c.text-strong |
| Blue-Gray/900 | #1D2539 | c.text-primary |
| Blue-Gray/800 | #343D54 | c.text-body |
| Blue-Gray/700 | #475067 | c.text-muted |
| Blue-Gray/600 | #666D85 | c.text-secondary |
| Blue-Gray/400 | #D0D4DD | c.border-strong |
| Blue-Gray/200, ✅ BG/tertiary | #F2F3F7 | p.blue-gray200 (→ c.chk-fig-page) |
| Blue-Gray/100, ✅ BG/secondary(-hover) | #F9F9FB | c.bg-subtle |
| ✅ Text/primary, Icon/primary | #0E0E0E | c.text-ink |
| ✅ Text/secondary | #5D5D5D | p.secondary-text-color |
| ✅ Text/secondary-alpha | #0E0E0EA7 | p.dim-text-primary |
| ✅ Text/tertiary, Gray/600 | #959595 | p.lighter-spanish-gray-color |
| ✅ Text/accent, Icon/accent, Border/accent-secondary | #0076FF | c.link |
| ✅ Text/positive-secondary | #26732C | p.success-green |
| ✅ BG/accent-primary, Blue/50, Accent/50 | #EFF7FF | p.alice-blue |
| Accent/200 | #BBDAFF | p.light-blue |
| Accent/700, Blue/700 | #0057FF | c.brand-blue |
| ✅ Border/secondary | #EBEBEB | p.bright-grey-color |
| ✅ Border/primary | #F5F5F5 | p.border-primary (inside the logo exports) |
| ✅ Border/secondary-alpha | #0E0E0E12 | p.new-border-color |
| ✅ Border/quantarary | #C0C0C0 | p.silver |
| Alpha/GrayA/400 | #0E0E0E24 | p.neutral-black-hex24 |
| Alpha/GrayA/1000 | #0E0E0EEB | **p.gray-a1000** (new, palette.ts) |
| alpha$/light/100 | #02060C1A | p.dark-navy-alpha10 (in sh.chk-fig-qty-badge) |
| 🚧 text/👀 primary · secondary | #02060CEB · #02060C99 | p.dark-navy-alpha92 · alpha60 (c.chk-fig-text-primary-alpha · -secondary-alpha) |
| 🚧 text/👀 tertiary | #02060C73 | **c.chk-fig-text-tertiary-alpha** (new) |
| Emerald/800 · /1000 · /100 | #13645F · #033D38 · #D1FAE5 | p.emerald-green · p.emerald1000 · p.emerald100 |
| System Colors/Red | #FA0000 | p.red-color |
| Primary. Colors/noon Blue | #3866DF | c.cta (credits toggle) |
| Gray Shades/Grey 3 · Grey 1 | #DADCE3 · #7E859B | p.noon-grey3 · p.noon-grey1 |
| Primary. Colors/noon Black | #404553 | c.text-legacy |
| #212121 ("Get it") · #EAF4FE (combo tag) · #2122B8 (supermall) · #241AFC (Mokafaa) | — | c.text-product · p.light-sky-blue · p.rocket-blue-sapphire · p.mokafaa-blue |
| unbound fills: #FFF7E5 warranty chip, #ECFFD1 noon One row, #373773 Emkan, QUARA 4-stop gradient, rgba(242,243,247,0) | — | **c.chk-fig-warranty-end / -noon-one-card-end / -emkan-bg / -quara1…4 / -need-today-end** (new) |
| Primary/Label2/Bold 16/20 | | t.text16-bold-lh20 |
| h4 Bold 16/24 (-0.2) | | **t.chk-fig-text16-bold-lh24** |
| Primary/Label3 Bold · Semibold · Medium 14/18 | | t.body-bold · t.body-semibold · t.product-title |
| Primary/Body2/Regular 14/18 | | t.body |
| Primary/Body3/Regular 12/16 | | t.caption |
| Primary/Label4 Medium · Regular 12/14 | | t.text12-medium-lh14 · t.text12-regular-lh14 |
| Primary/Label5 Medium · Regular 11/12 | | **t.chk-fig-text11-medium-lh12 · -regular-lh12** |
| Primary/Tiny/Medium 10/12 | | t.text10-medium-lh12 |
| Primary/Label-1/Bold 17/20 | | **t.chk-fig-text17-bold-lh20** |
| Primary/Label-2 Semi Bold · Medium · Bold 15/18 | | **t.chk-fig-text15-semibold-lh18** · t.text15-medium-lh18 · **t.chk-fig-text15-bold-lh18** |
| Primary/Label-3 Medium · Semi Bold 13/16 | | t.text13-medium-lh16 · t.text13-semibold-lh16 |
| Primary/Label-4/Medium 12/14 | | t.text12-medium-lh14 |
| unbound: 13/20 ExtraBold, 8/1.1, 10/1.1 SemiBold, 11/16, 12/16.6 SemiBold, 15/16 Medium · SemiBold, 16/21.1 Bold, 19/26.6 Bold | | **t.chk-fig-text13-extrabold-lh20, -text8-regular-lh1p1, -text10-semibold-lh1p1, -text11-regular-lh16, -text12-semibold-lh16p6, -text15-medium-lh16, -text15-semibold-lh16, -text16-bold-lh21, -text19-bold-lh26p6** |
| Gap / Radius 1…24, full | | s.s2…s24 / r.r2…r48, r.full (1px, 7px, 9px gaps kept literal) |
| drop-shadows | 0 −4 3.5 rgba(0,0,0,.13) · 0 8.043 16.086 rgba(0,0,0,.07) · 0 2.462 4.923 alpha$/light/100 | **sh.chk-fig-dock · sh.chk-fig-header-label · sh.chk-fig-qty-badge** |

## Sections (default order = Figma)

`CheckoutScreen.tsx` renders `params.sections ?? FIGMA_SECTIONS` = `shipments, delivery_instructions, receiver_details,
payment, payment_summary`. Page: Screen background c.chk-fig-page (#F2F3F7), content px s12, pt s8 (Main Container),
sections gap 12.

### Header — `14288:184316` → `components/CheckoutHeader.tsx`, `CheckoutHeader.module.css`
| Property | Figma | Kit |
|---|---|---|
| layout | status bar → gap 16 → header stack px12 py4 space-between → pb 10 | `calc(inset-top + s.s16)`, s.s4/s.s12, s.s10 |
| back | 40 white, 1.139px Blue-Gray/200, r48, icon 22.778 | `.back`, p.blue-gray200, r.r48, `figma/header-back.svg` |
| address block | 223×41 column gap 2 | `.address` (button → address/select modal) |
| type icon | 20 slot, glyph 16.25×14.58 at inset 13.54/9.37% | `figma/header-home.svg` (Work / Other: kit webp masked c.text-primary) |
| label | "Delivering to Home" Figtree Bold 16/21.1 −0.3016, Blue-Gray/900, text-shadow | t.chk-fig-text16-bold-lh21, c.text-primary, sh.chk-fig-header-label (`tf.deliveringTo`) |
| chevron | 16 | `figma/header-chevron.svg` |
| address line | 13/18.1 −0.3016 Blue-Gray/700, ellipsis | t.text13-regular-lh18, c.text-muted |
| right slot | 40×40 empty pill | `.rightSlot` |
| scroll | — | kept NoonSalesAnimatedHeader (bg #F2F3F7 → white, corner radius, drop gradient); corner overlay fades in over the first 8px so the first card sits 8px under the header |

### Shipments — `14288:183975 / 183976 / 183977 / 183978` → `components/CheckoutShipment.tsx`, `CheckoutShipment.module.css`, `data.shipment.ts`
| Property | Figma | Kit |
|---|---|---|
| card | white r16, clip, column gap 9 | `.shipment` r.r16, 9px |
| header | pt8 pb2 px12 gap8; "SHIPMENT n" 13/20 ExtraBold +0.2 uppercase Blue-Gray/800 | t.chk-fig-text13-extrabold-lh20, c.text-body |
| count pill | Blue-Gray/100 px7 r32, Label4/Medium Blue-Gray/600 | c.bg-subtle, r.r32, t.text12-medium-lh14, c.text-secondary (`t.item(n)`, Figma's "1 Items" typo not copied) |
| items | px6; item p6 gap8 r10; 211 wide + gap 8 + horizontal scroll when > 1 line | `.items[data-multiple]`, `.item` |
| image | 52×70 Blue-Gray/200 r8 p4 clip, 64×88.6 art | `ProductImage` 64×88.615 (multiply blend) in `.imageInner` p.blue-gray200 |
| qty badge | 20×20 white, 0.5px Blue-Gray/400, r4, shadow; "X" 8/1.1 +0.6154 · "2" 10/1.1 SemiBold | `.qty`, sh.chk-fig-qty-badge, t.chk-fig-text8-regular-lh1p1 / -text10-semibold-lh1p1 (always shown, like the frame) |
| title | Body3 12/16 Blue-Gray/1000, 2 lines | t.caption, c.text-strong, line-clamp 2 |
| price row | Label3 Bold · 12/16 struck Blue-Gray/600 · Label5 Medium Emerald/800 "47% OFF" | t.body-bold · t.caption · t.chk-fig-text11-medium-lh12, p.emerald-green |
| warranty chip | gradient −88.7° white→#FFF7E5, px8 py4 r4, Label5 Medium | `.warrantyChip` (cart line `warranty` → `cartAddOns` price) |
| combo chip | #EAF4FE px8 py2 r4, Tiny/Medium | `.comboChip` (`COMBO_PRODUCT_IDS` in data.ts — demo) |
| discount row | 16 coupon_cashback icon + Label5 Regular Blue-Gray/600 | `figma/item-discount.svg` (cart line `foupon` → FOUPON_VALUE) |
| footer | white h36 clip; Vector 6919 tab (#F9F9FB, gradient stroke, drop shadow); pl14 pr12 gap8; "Get it" Body2 #212121 + Label3 Bold black | `figma/footer-wave.svg` (215 frame) / `footer-wave-wide.svg` (242 frame), offset from the measured text end (Figma ≈ text + 26px); t.body / t.body-bold |
| pill | supermall 63×20 r4.185 #2122B8 + 2 wordmark layers; express 57×17.1 in 63×20 pr2 | `figma/supermall-a.svg`, `supermall-b.svg`, `pill-express.svg`; global → shared `MarketplaceTag kind="global"` (not in the frame) |
| expander | gradient Blue-Gray/100 → #F2F3F7@0, px12 py12, bottom r20; row pl2 gap8, Body2 Blue-Gray/700 + 16 chevron | `.needToday`, c.chk-fig-need-today-end, `figma/footer-chevron-down.svg` (rotates) |
| lanes (expanded) | not drawn | radio + "Get it **…**" + ⓘ + fee/FREE rows in the Figma type styles; pick → setShipmentOption reload |

Grouping: one shipment per cart group (`buildShipments`): marketplace → supermall pill, xborder → global, express →
express, in Figma order (supermall first). Promise copy (`buildPromises`, Figma style): express "in 1hrs 12mins" (₫7, alt
"Today before 8pm" free, expander "Save on fees with later delivery"); supermall "{Sat, 17 September}" (+3 days, alt
"Today before 8pm" ₫15, expander "Need it today?"); global "{+5 days}" single lane.

### Delivery instructions — `14288:184005` → `components/DeliveryInstruction.tsx`, `delivery.module.css`, `data.delivery.ts`
| Property | Figma | Kit |
|---|---|---|
| card | white r16 p12 gap12 | `.section` |
| title | h4 16/24 Bold −0.2 Blue-Gray/900 + 20 info icon | t.chk-fig-text16-bold-lh24, `figma/di-info.svg` (→ learn-more list) |
| options | row gap 8, flex 1 each | `.options` |
| card | p12 gap16 r16 Blue-Gray/100; selected Blue/50 + 1px Accent/200 (inside) | 1px transparent border + p11, p.alice-blue / p.light-blue |
| icons | Food Icon / door 20 — Blue-Gray/800, selected Accent/700 | `figma/di-together.svg`, `di-door.svg` as masks tinted c.text-body / c.brand-blue |
| checkbox | 20 off #666D85 / on #0057FF | `figma/checkbox-off.svg`, `checkbox-on.svg` |
| label | Label-3 Medium 13/16 −0.26; Blue-Gray/800 · selected 🚧 text primary | t.text13-medium-lh16, c.chk-fig-text-primary-alpha |
| copy / state | "Get items together", "Leave at the door" (selected) | new option `gt` (field `getTogether`), `dd` copy updated, store default `leaveAtDoor: true`; `silent_delivery` / `sc` flagged `hidden` |

### Receiver details — `14288:184025` → `components/ReceiverDetails.tsx`, `delivery.module.css`
| Property | Figma | Kit |
|---|---|---|
| card / title | white r16 p12 gap12; h4 16/24 | `.section`, t.chk-fig-text16-bold-lh24 |
| avatar | 32 Blue-Gray/100 r8, call 20 (#2969FF) | `.callIcon`, `figma/receiver-call.svg` |
| name / phone | Label-2 SemiBold 15/18 Blue-Gray/800 · Label-4 Medium 12/14 Blue-Gray/600, gap 4 | t.chk-fig-text15-semibold-lh18 · t.text12-medium-lh14 |
| action | "Change receiver" Label-3 SemiBold 13/16 Accent/700 | `.changeReceiver` c.brand-blue (→ alternate-phone) |

### Points & Vouchers + Pay With — `14288:184048` "Cards" → `CheckoutScreen` `.cards` + `components/BurnSection.tsx` + `components/PaymentMethods.tsx`
| Property | Figma | Kit |
|---|---|---|
| card | white r16 p12 gap12; 1px #EBEBEB line between the blocks | `.cards`, `figma/points-separator.svg` |
| Points title / subtitle | Label2 Bold #0E0E0E · Label4 Medium secondary-alpha "Need credits? Top up now!" | t.text16-bold-lh20 · t.text12-medium-lh14 p.dim-text-primary (`tf`) |
| expanded program card | h49 #F9F9FB 1px #EBEBEB r8 pl2 pr8 py2 gap8; 45 tile #241AFC (r6 left) + Mokafaa logo; name Label3 SemiBold; "+96611234567 linked account" Label4 Regular #5D5D5D; 14 chevron | `.cardExpanded` (width = 100% − 2×53), `figma/provider-mokafaa.svg`, `mini-chevron-right.svg` |
| tiles | 49×49 p2; QUARA gradient 225° + logo at 5.22/20.07; Emkan #373773 + logo | `.card`, `figma/provider-quara.svg`, `provider-emkan.svg`; SHARE / Skywards / vouchers follow with the kit wordmark tiles |
| NEW badge | #FA0000 r12 px6, 12/16.6 SemiBold white, 40×16 texture 30% | `NewBadge` (BurnSection.tsx), `figma/new-badge-texture.gif` |
| dots | active 18×5 GrayA/1000, inactive 5×5 GrayA/400, 72%, gap 6, px16 py4 | `.dots` — page count from the scroller width |
| Pay With | Label2 Bold | t.text16-bold-lh20 (`paymentSectionTitle`) |
| credits | toggle 29.6×16 #3866DF knob 12.8; "Use my {₫x} noon credits" Label3 Medium; "Select another method to cover the remaining **{₫y}**" 12/16 secondary-alpha | `Switch` 29.6/16/12.8/1.6 c.cta / p.noon-grey3; store default `useCredits: true` (Figma state) |
| method row | #F9F9FB r12 h54 px12 py10 gap8; logo 38×24; name Label3 SemiBold; 2nd line Label4 Regular #5D5D5D | `.row` (1px transparent stroke + p 9/11), logos `figma/pay-tabby@3x.png`, `pay-tamara@3x.png`, `pay-applepay@3x.png`, `pay-cod.svg` |
| selected method | Accent/50 + 1px Accent/600 | `.rowSelected` p.alice-blue / c.link |
| Debit/Credit Card | selected box py12 gap12; title row px8 h26 (`pay-card@3x.png` + name) + "Add/Change" 14/18 SemiBold accent (h36 pl14 r8) | `.cc`, `.ccTitleRow`, `.addChange` (→ cards-select / add-card) |
| saved card | px8; art 38×24 white 1px Accent/50 r4; "name \| •••• last4" (4×4 r2 dots gap 2); "Installments Available ₫x/mo" | `.saved`, `figma/saved-card-art.png` for Visa (other brands: kit art), card nickname or "{holder}’s card" |
| CVV | Input field 58×34 white 1px #C0C0C0 r12 pl14 pr10, "CVV" 14/18 Medium #959595 | `.cvv` (password, digits only, amex 4) |
| EMI | #F9F9FB 1px secondary-alpha r12 under the card (z1, overlaps), px10 pb12, "Select an installment starting ₫x/mo" Label4 Medium + 14 blue chevron | `.emi` (margin −12, pt 24), `figma/emi-chevron.svg` (→ emi-plans; selected plan → "Selected plan: …") |
| noon One Credit Card | gradient white → #ECFFD1; logo; "Extra ₫x Cashback" #26732C; "Apply Now" pill 87w 14/18 SemiBold accent | `.rowNoonOne` (c.chk-fig-noon-one-card-end), `figma/pay-noonone-card@3x.png`, cashback = 5% of the order (`cashback.noonOneCard`) |
| list / copy | Tabby (NEW) "Pay 4 interest free payments of ₫x", Tamara "Pay ₫x or in 4 payments. no late fees", Apple Pay, Debit/Credit Card, noon One Credit Card, Cash on Delivery | `paymentMethods` reordered + Figma copy (x = order ÷ 4); special-EMI section flagged `hidden` |

### Payment summary — `14288:184228` → `components/PaymentSummary.tsx`, `PaymentSummary.module.css`
| Property | Figma | Kit |
|---|---|---|
| card | 355 wide at x −2, pb12; clip r12 top / r16 bottom; content py16 gap16 | `.wrapper` (margin-inline −2px), `.card` |
| title | h4 16/24 Bold Blue-Gray/900 px12 | t.chk-fig-text16-bold-lh24 |
| strips | px12 pb4 gap6, rows h28 space-between | `.strips`, `.strip` |
| Subtotal | label 15/18 Medium 🚧 secondary + dotted underline; "AED {MRP}" 15 Medium 🚧 tertiary struck + "{subtotal}" 15 SemiBold Blue-Gray/1000 | t.text15-medium-lh18, t.chk-fig-text15-medium-lh16 / -semibold-lh16 (MRP = Σ qty × was, `totals.mrp`) |
| Delivery fee | label Blue-Gray/700; "Free with" 12/16 Medium Blue/700 + noon One mini badge (28.35×19.44 window on the 56×15.7 logo) + "₫fee" | `figma/noonone-logo-a/b/c.svg` with the Figma insets; fee 0 → "Free" |
| extra rows | hidden strips in the frame | add-ons, donation, points redeemed, noon credits (same strip style) |
| dividers | 327 dashed #D0D4DD | `figma/summary-divider.svg` (width 100% − 28px) |
| Coupon discount | "– ₫x" | shown when the cart has a coupon / foupon discount |
| Total | Label-1 Bold 17/20 Blue-Gray/1000 px12 | t.chk-fig-text17-bold-lh20 (= orderPaymentAmount) |
| savings strip | Emerald/100 under the 355×5 wave; p12 gap8; 15/18 Emerald/1000 SemiBold label + Bold amount; note 11/16 | `figma/savings-wave.svg`, p.emerald100 / p.emerald1000; Coupon Cashback (2% of subtotal while a coupon is applied) + noon one credit card cashback (5%) — demo values in `cashback` (data.ts) |

### Footer — **bappzaar wins** (production, 2026-10-13) → `CheckoutScreen` footer, `checkout.module.css`, `components/SlideButton.tsx`
The Checkout 2.0 Figma footer (`14288:184317`) differs from production; on request the footer now follows bappzaar master
(`S/NoonCheckoutScreen/styles.ts` stickyButtonsWrapper + columnReverseWrapper, `C/NoonCheckoutSlideButton`). The Figma values are kept in the third column for reference.

| Property | bappzaar (kit) | Figma (not used) |
|---|---|---|
| dock | white; pt 16, pb safe area (16 without), px 15, row gap 8; shadow 0 −4 rgba(0,0,0,.06) → `.sticky`, sh.chk-sticky-footer | drop-shadow 0 −4 3.5 rgba(0,0,0,.13), gap 8, pt12 |
| slider | minHeight 48, p8, r14; gradient #3866DF → #3454A8, disabled #CED1DA; thumb white 60×38 r9 at left 7 with the 48×48 arrow-to-checkmark Lottie (arrow #3866DF / #CED1DA); label 16/700 as written ("Slide to Order", "Enter CVV"), centred across the track (left/right 10), #7394DE mask layer (white when disabled) + shimmer | 343×48 r12, #DADCE3; thumb 54×32 r8 + static arrow; "ENTER CVV" 19/26.6 uppercase after the thumb |
| summary | overviewWrapper mx 4, centred; items 19/700 steelColor #7E859B; total 19/700 → t.text19-bold-lh24, p.steel-color / c.text-legacy | 338 wide, 19/26.6 |

## Kit sections not in the frame (kept, hidden by default)

Add the id to `params.sections` (or `FIGMA_SECTIONS` in `CheckoutScreen.tsx`); `MASTER_SECTIONS` is the master order:
`detached_address` (DetachedAddress — the Figma header now carries the address), `integrated_noonone` (NoonOneSection),
`coupon_status` (CouponStatus), `earn` (EarnCallout), `dynamic_invoice` (master DynamicInvoice "Order Summary").
Also hidden through data flags: delivery options `silent_delivery` / `sc` (`hidden: true` in data.delivery.ts) and the
"0% Special installments" card section (`hidden: true` in data.payment.ts; SpecialEmisScreen still works).

## Not 1:1 / notes

- Kit device is 390 wide (Figma 375) and its status bar is 54 (Figma 47); widths are fluid, so the header sits 7px lower.
- Payment brand logos (Tabby, Tamara, Apple Pay, card, noon One card): the MCP returned the instance's default
  (Mastercard) SVG for every swapped variant, so these are @3x PNG exports of each Molecule/BrandLogo node. COD is SVG.
- The saved-card row uses the Figma HSBC Visa art for Visa cards; other brands keep the kit card art.
- Figma mixes the SAR glyph (, noon_sar font) into some amounts; the kit uses its AED glyph (`currency`) everywhere.
- Delivery-instruction icons are tinted via CSS mask (state colours from the Figma variants), the asset shapes unchanged.
- Expanded lane list and the unselected Debit/Credit Card state are not drawn in the frame — composed from the same
  Figma styles. "Combo item" chips are demo data (`COMBO_PRODUCT_IDS`).
- Shared follow-up: `MarketplaceTag` has no 63×20 r4.185 supermall / 57×17.1 express pill variant (it renders 60×18
  fully-rounded pills), so the Figma pills are flow-local in CheckoutShipment; consider adding them to
  `src/components/Tag/MarketplaceTag.tsx`.

---

## All flows · 127:44077

Source: file `Af34gfmhQ1D0wstXUEHSIF` ("All flows"), frame `127:44077` "Checkout" (375×2601). This is now the default
checkout layout (`ALL_FLOWS_SECTIONS` in `CheckoutScreen.tsx`); the Checkout 2.0 layout above stays available as
`FIGMA_SECTIONS`. Precedence: Figma for visuals, bappzaar master (`origin/master`, read via `git show`) for behaviour,
data and copy keys. New checkout tokens are `chkAf*` in `tokens.ts`; new assets in `src/assets/checkout/figma/`.

Section order: `address_card, integrated_noonone, delivery_instructions, receiver_details, shipments, burn, pay_with,
donation, payment_summary` (Main Container y 8, sections 12 apart → `.sections > :first-child { margin-top: 0 }`).
This matches master `sectionsOrder` ids `address, integrated_noonone, delivery_options, receiver_details, shipment,
burn, payment, donation, invoice` (the session decides the order on master).

| Figma section | bappzaar master | Kit component · tokens · assets |
|---|---|---|
| Header 127:44446 (back 127:44453, "Checkout", 40px right pill) | `NoonSalesAnimatedHeader` + `headerDetachedAddress*` (session v3: title, no address) — `noon_checkout_header` | `CheckoutHeader title` → `.title` `t.chk-fig-text16-bold-lh21`, `sh.chk-fig-header-label`; back icon = existing `figma/header-back.svg` (same path); scroll behaviour unchanged |
| Address card 127:44080 | `renderDetachedAddress` → `NoonCartAddressSelectorV2` (checkout-detached), `showAddressSelectScreen` | `components/AddressCard.tsx` · white r16, p 12/16/10/12, gap 10; label `t.text16-bold-lh20` (-0.15) `c.text-primary`; line `t.chk-af-text13-medium-lh20` (-0.1) `c.text-secondary`; home glyph `shared/icons/addr-home.svg` (same as the Figma group); chevron **`figma/address-chevron-right.svg`** (new, 18) · tap → `address/select` modal → "Address updated" |
| Banner/.base 127:44088 | `NoonCheckoutNoonOneSection` (`integrated_noonone`, `setOne` → reloader) | `NoonOneSection variant="banner"` · `.banner` overrides: pt12 px4 pb4 gap12, row px12, title `t.text16-bold-lh20` with `<green>` = `c.best-price-ink` #108757; "one" lozenge = existing `noonone-logo-a.svg` + `-b.svg` in a 35×24 window (Figma insets); `Switch` 34×20 knob 16, off `c.border` #EAECF0; strip `c.chk-noon-one-cta-bg` #E5FAEC py7, `t.text12-semibold-lh14`, struck amount `t.text12-medium-lh14` `c.chk-af-banner-struck` (#108757 @ 64%) + **`figma/noonone-banner-strike.svg`** (new, −12°). Enrolled state, reveal Lottie and nudge unchanged (master) |
| Delivery Instructions 127:44089 | `NoonCheckoutScreen/DeliveryInstruction` | unchanged (`DeliveryInstruction`); all Figma glyphs match the existing `figma/di-*.svg`, `checkbox-*.svg` |
| Receiver Details 127:44109 | `NoonCheckoutScreen/ReceiverDetails` | unchanged; `figma/receiver-call.svg` matches |
| Shipments 127:44132 / 133 / 134 | `NoonCheckoutShipment` | unchanged (`CheckoutShipment`, `data.shipment.ts` incl. the cart's supermall shipment) |
| 🇸🇦 Points & Vouchers 143:13577 (title, Points 143:13584, Finance 143:13586) | `NoonCheckoutBurnSection` (`burn.title`, `loyalty.providers` row of collapsed `NoonCheckoutProviderCallout`, `voucher` callout → single provider or `NoonCheckoutBurnProvidersListOverlayScreen`), skeletons | `components/PointsVouchers.tsx` · white r16 p12 gap4; title row h28 `t.text16-bold-lh20`; callouts h43 `c.bg-subtle` r8 pr10 py2 gap2 (gap 4); finance h44 p10 r12, text `t.text12-regular-lh14` `c.text-muted` + bold parts, rounded logos 29.145 (`p.white-alpha14`) −10 overlap, tiles `c.chk-af-tamam-bg` / `c.chk-fig-emkan-bg` / `c.chk-fig-quara2`. Assets (new): `figma/provider-mokafaa-wide.svg`, `provider-qitaf.svg`, `provider-tamam-mini.svg`, `provider-emkan-mini.svg`, `provider-quara-mini.svg`, `points-chevron.svg`. Data `topUpBurn` (`data.rewards.ts`: Mokafaa + new Qitaf; financing Tamam (new) + Emkan + QUARA) → `checkout/provider-burn`, `checkout/burn-providers { list: 'topup' }` |
| Pay With / Cards 143:13668 (credits 143:13683, cards 143:13685/704/723, card + EMI 143:13749/761, Pay Later 143:13766, COD 143:13788) | `NoonCheckoutPaymentMethods` (`payment`) | `PaymentMethods` on its own `.cards` card (`pay_with`); rows now pl8 pr12 (`padding-inline 7px 11px` inside the 1px stroke), noon One row px8. Credits toggle, NEW badge, CVV, Add/Change, EMI strip, Apply Now unchanged; logos are the existing @3x exports |
| Donations new 127:44334 | `NoonCheckoutDonation` (`donation`, `setDonation` → reloader; same pill tapped again → 0; hidden on iOS) + `NoonCheckoutDonationLearnMoreOverlay` | `components/Donation.tsx` · 2px white border, gradient 31° `c.bg-surface` 50.28% → `c.chk-af-donation-end` (#EBF4FF) 103.82%, r16, pt10 pb16; name `t.section` (-0.15); description `t.caption` `c.text-secondary` (2 lines); Learn more `Button variant="noonDotted"` `p.primary-blue` `t.chk-af-text13-semibold-lh20`; logo slot 106×86 p8 with **`figma/donation-dabs.webp`** (new, 192×255 = 3× of 64×86); pills min 64×40 r10 `c.border`, selected `p.border-gray` + `p.primary-blue`, `t.chk-af-text13-bold-lh20`; "1 MEAL" `t.chk-af-text8-bold-lh12` on `p.border-gray`; note `t.text11-regular-lh14` `c.text-tertiary`. Sheet `DonationLearnMoreScreen` (`checkout/donation-learn-more`, `donation.module.css`). Copy: `noon_donate_to`, `noon_learn_more`, `noon_donations_amount_note`, `noon_donation_got_it`, `noon_donation_permit` |
| Payment Summary 127:44358 (savings strip 127:44434) | `NoonDynamicInvoice` (invoice) | `PaymentSummary flush` · 351 wide (`.flush` drops the −2px bleed), **`figma/savings-wave-351.svg`** (new); rows / divider / savings unchanged; donation row shows when a pill is selected |
| Button Dock 127:44462 | `NoonCheckoutSlideButton`, sticky footer | unchanged (`SlideButton`, `.sticky`, `.overview`) |

### Behaviours kept

Address change (modal → "Address updated", clears CVV), delivery-instruction toggles + learn-more sheets, receiver change,
shipment lanes / need-today expander, points & vouchers redeem + OTP, credits toggle (`nopayment` when sufficient),
card select / add card / CVV / EMI plans / special EMIs, Tabby, Tamara, Apple Pay button swap, COD, noon One card
upsell toast, Verify Phone swap, slide to pay → placing → confirmation / payment failure, all route and screen ids.

### Not 1:1 / notes

- KSA variant: the frame uses the riyal glyph (`noon_sar` U+E800) and "AED" text in places; the kit uses the dirham
  `currency` everywhere. Points & Vouchers is flagged 🇸🇦 and shows KSA programmes (Mokafaa, Qitaf, Tamam, Emkan,
  QUARA). Master has no country gate on `burn` (providers are session data), so the section stays with these demo
  providers; the "Top up noon Credits" title and the financing callout copy are session copy, not translation keys.
- Donation: master returns `null` on iOS; the kit shows it as the frame does. "1 MEAL" is Figma-only (master's
  `charity.amounts` has no labels) and lives in `charity.labels`. The frame shows ₫15 selected; the kit starts at the
  master session default (no donation), so nothing is added to the total until the user taps a pill.
- noon One banner copy ("Get free delivery with", "On orders above ~~₫100~~ ₫50") is session copy taken from the
  frame (`taf`); master's mock (`integratedNoonone`) stays for the `master` variant.
- Tamara keeps its Checkout 2.0 / server line ("Pay ₫x or in 4 payments. no late fees"); the frame repeats Tabby's
  line as a placeholder.
- Address label / line, receiver and shipment items are user / cart data (frame: "Rahul's home", "Rahul Jaiswal").
