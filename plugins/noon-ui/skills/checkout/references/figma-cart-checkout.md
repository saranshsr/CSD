# Cart 2.0 + Checkout: design reference

Read this before building or restyling a cart or checkout screen. It records what the noon Figma designs show, how each part maps onto the kit, and where the shipped `cart` and `checkout` flows still differ from the design. The flows already ship most of the design, so for any part below marked "matches", copy the flow-local component instead of rebuilding it.

## 1. Sources

| Source | Node | Frame name | What it is |
|---|---|---|---|
| Figma `BaWAAGW7zmdSTkXNXqPcAJ` "✅ Cart 2.0" | `10575:94058` | Phase I Default - regular user | Full cart page, 375×4316 (page container 4637 tall). Nav header → Supermall group → Global group → Express group → Global/"market" group → 2 product carousels → OOS-style free gifts → Coupons → Freebies promo (Lucid Air) → Payment Offers; sticky savings tab + Cart footer + tab bar. |
| same file | `14812:276687` | Best price | The same cart as an 812-tall viewport scrolled to the bottom (page container at y −2927). Section order changes: groups → free gifts → **Payment Offers** → **coupon card with "Best price ₫X with offers" strip** → Freebies promo → 3 carousels. This is the "best price with offers" coupon variant. |
| same file | `12112:209179` | Error | Cart error state, 375×812: one-line address header ("Home - BDA Complex…" + wishlist), centred "Something went wrong!" / "It's not you, it's us! please try again.", 256×251 illustration (3-D yellow cart), dark "Try Again" button 158×36, tab bar (Home active, yellow). |
| User screenshot `images/1.png` | — | Checkout | Checkout page: "Delivering to Home" header, Shipments 1–4 (supermall / express pills, "Save on fees with later delivery" and "Need it today?" expanders), Delivery instructions (2 option cards, "Leave at the door" selected), Receiver details, Points & Vouchers carousel (Mokafaa card, QUARA tile with NEW, Emkan), Pay With (noon credits toggle, Tabby NEW, Tamara, Apple Pay, selected Debit/Credit Card with CVV field and installment strip, noon One Credit Card "Apply Now", Cash on Delivery), Payment summary, sticky "ENTER CVV" slider (disabled) + "4 Items · AED 1,643.00". It matches Figma `zURu7GI7sq77fjdXKrouvo` "🚧 Checkout 2.0" frame `14288:183972`, which `src/flows/checkout/FIGMA-MAPPING.md` documents node by node. |

Section nodes used (Cart 2.0): header `10575:94722`; groups Supermall `10575:94060`, Global `10575:94090`, Express `10575:94104`, market `10575:94119`; carousels `10575:94168`; free gifts `11316:46017`; coupons `10575:94148` and coupon card `14812:276775`; promo `10575:94167`; payment offers `11008:110900` / `14812:276774`; sticky footer `10984:103786`.

## 2. Screen anatomy

Device in Figma is 375 wide; the kit's phone is 390, so treat widths as fluid and keep the 12px gutters.

### 2.1 Cart (Phase I)

Page: background Blue-Gray/200 `#F2F3F7`; every section is a 351-wide card at x 12 (**12px gutter**), **12px between sections**, card radius **16**.

1. **Nav header** (100 tall incl. 47 status bar). Gap 4 under the status bar; row px 12, pb 8, gap 24. Left: address block 41 tall: 20px home glyph + "Home" (Figtree Bold 16/21.1, −0.30, `#1D2539`, soft text shadow) + 16px chevron; second line the address (13/18.1, `#475067`, ellipsis). Right: 36px round wishlist button (white, 1px `#F2F3F7`, navy heart). On scroll the header picks up a white background and rounded bottom corners (r16 on the frame).
2. **Shipment groups**, one per fulfilment (Supermall, Global, Express, market). Each group is two stacked layers:
   - **Glass effect container**: tinted fill, 1px Blue-Gray/100 border, r16, pt 8, gap 6, `margin-bottom: -24px` and `z-index: 2` so it overlaps the progress footer. Top-left carries the **Color waves 🌊** shape (206×53.5, the group colour) behind the fulfilment logo row (h20, px 20). Fills: Supermall `#E8E8F3`, Express `#FDFDF1`, Global lavender, market mint. Logos: supermall wordmark (76×18), express wordmark (64.6×12.7), Global globe icon + "Global", market store icon + wordmark.
   - **Items card** inside the glass: white, 1px border in the group colour (Supermall Persian-Blue/100 `#CECFF8`, Express Yellow/200 `#FDF69B`, Global Purple/200 `#EFC9FB`, market Green/200 `#BEEFCC`), r16, pt 12, gap 16, clipped.
   - **Cart item** (335 wide, gap 12): left column 104 wide, with the image box 104×144 on BG/secondary `#F9F9FB`, r12, p8 and a 24px M-Checkbox at 8/8 (selected `#1D2539`; a freebie line shows a disabled grey one). The **stepper** overlaps the image bottom by 16 (`mb −16`): white, 1px `#EBEBEB`, r8, px 12 py 10, min-h 32, gap 8, 16px minus/trash (at qty 1)/plus, value Bold 14/18 w20. Right column, gap 16:
     - Primary info: title Body2/Medium 14/18 `#101628`, 2 lines, plus a 32px square wishlist chip (Blue-Gray/50, 1px Blue-Gray/200, r8, p8).
     - Optional subtitle chip: Combo (gradient `#EAF4FE` → white, r6, px6 py2, 12px + ⓘ), gift ("Comes with a free soundbar"), variants row ("256 GB · Natur… · WiFi+…", chevron), customisation ("Aliaa · Edit").
     - Price row: Label2/Bold 16/20 `#101628` · was 12/16 `#666D85` struck · "47% OFF" Label4/Semibold 12/14 Emerald/700 `#1F7A74`; gap 4.
     - ETA pill, gradient from the group tint to white, px6 py4 r6, 13/18. Supermall shows a 14px flash icon and "Get in **1 hour 12 mins**" in `#2122B8` on `#F5F5FC`. Express shows "Get by **7th Sep, Saturday**" on `#FDF9C4`. Global and market use a grey pill. A second line reads "Order within 1 hrs 20 mins" (12/14; the urgent part is red on Express).
     - Coupons bar: horizontally scrolling dashed chips "Extra 10% Off - Code ›" (`#F6FEFD`, 1px dashed Emerald/700 40%, r8, px10 py8, 12/14 600) with a 30px white fade on the right edge.
     - "Lowest Price in 30 days" urgency chip (`#F3F5FC` → white, r4, px6 py4, 16px red arrow-down-circle, Label4/Medium `#475067`).
     - Item points: wrapped row, gap 6, 16px icon + Label5 11/12 `#1D2539` ("2x Refund", "non-returnable", "1 year warranty", "Prepaid only", "Faster Delivery at checkout").
     - Extended warranty row (px 8 wrapper): 1px `#EAECF0`, r12, px12 py8, a white → Blue-Gray/200 gradient, 20px shield, "Protect with extended warranty" 12/16.8 500 and a dotted-underline "Add". Once added it becomes the Protect4less card: 1px `#FCF4DE`, r12, p12, a 38px creative, a 16px × close button and the price.
     - Items are separated by a dotted 1px `#EBEBEB` divider.
   - **Stacks** (callout rows at the bottom of the items card): h40, p12, gap 8, 1px top border `#F2F3F7`, 20px icon + Body3 12/16 `#343D54`. Rows shown: "Save on fees at checkout with later delivery!" (clock; Supermall only) and the noon One row "Save with noon One. Try it now for **Free**" (Free is Emerald/700 600).
   - **Progress footer** sits under the glass container, overlapped by 24: pt 36, pb 16, bottom r16, gradient from white up to the group tint (Supermall `#EBEBFE`, Express `#FEFDD4`, Global Purple/200, market Green/100). The message "Add ₫12 from {group} for free service fees / free shipping" is Medium 13/16 `#101628`. The bar is 4 tall (r6 track, r2 fill): Supermall uses track `#E3E3FC` with fill `#2122B8`; the others use track `#EAECF0` with fill `#101628`. On the right is a 57×26 "+ Add" button (white, r6, py4 pl6 pr12, Label3/Semibold). On Supermall its border is Persian-Blue/50 and its text Persian-Blue/600 `#2F33C0`; on the others the border is GrayA/400 and the text `#101628`.
3. **Product carousels**: white r16 card, py 12; header px12 with Label2/Bold title and an optional "Sponsored" (Label4/Medium tertiary). Tiles are 134 wide with gap 12: image 134×174 on a grey box (r10, 1px border), 24px heart at the top-right, 32px outlined blue "+" at the bottom-right, an optional "Best Seller" corner tag and "Ad" tag; title 14/18 500 in 2 lines; price Bold 15/20 + struck + %; an express / "express Today" pill. The two carousels are "Don't miss out on these offers" (Sponsored) and "From your wishlist".
4. **Free gifts** ("OOS style freebies"): 1px GrayA alpha border, r16, mint (`#F6FEFD`) → white gradient. Header p12 with a 20px green gift icon and "Free gifts for you" (Bold 16/24). Body: an 80×109 image tile (`#F5F7FB`, r12) with the photo at 40% opacity and a 34px lock badge; title 14/18; "FREE" Label3/Bold Grass/700 + struck price; "**₫120** left to unlock" 14/14; a 4px Grass/700 bar on `#EAECF0`; "+ Add" 57×26.
5. **Coupons**: white r16, py 10. Title px12 "Got a coupon?" Label2/Bold `#0E0E0E`. Tray px12 py8 holds an input box (`#F9F9FB`, r12, h56, px12, gap 10) with the placeholder "Enter your coupon code here" 13/18 `#666D85` and "APPLY" Tiny/Medium 12/18 +0.12 `#989FB3`. Below a dashed divider sits the "View all coupons & offers" row: a 32px Blue/50 circle with a percent badge, Label3/Semibold text and a chevron.
   - **Best-price variant** (`14812:276775`): the white coupon block (`mb −12`, z2, a soft inset shadow at the bottom) sits on a mint card (gradient `#EBFFF4` → 10% over `#F6FEFB`, r16). Under it a strip (pt 24, pb 12, px 16) shows a 16px percent-badge, "Best price **₫1,540** with offers" (14/18 500 `#0E0E0E`; the amount is Bold Emerald/800 `#115A56`) and a 16px chevron. The placeholder becomes "Enter your coupon code or select one" and the box is h46. The "View all" row is gone, because the strip replaces it.
6. **Freebies promo** (Lucid Air): campaign banner with artwork, a "Join our Yellow Friday Sale…" line and a code chip ("IPHONE17 | +"). Campaign-specific.
7. **Payment offers**: white r16, py12, gap 12; section header px12. First a row of 3 molecules (each `#F9F9FB`, r12, p8, gap 8, flex 1): Tabby / Tamara logo + chevron, "₫375 * 4" and "0% Installments" (Emerald/800); the third tile is "Bank Installments" with a calendar-card icon. Then 2 full-width rows (`#F9F9FB`, r12): a card art tile, "Earn **₫105 cashback** with the noon One credit card" and an "Apply ›" link in Accent/700 `#0057FF`.
8. **Sticky footer** (`10984:103786`): first the savings tab, a mint colour-waves shape (239×48, overlapping the footer by 16) with "₫130 saved!" (Label3, amount SemiBold, Emerald/700) and the noon One logo. Then the footer itself: white, top r12, h72, px12 py10, gap 12, shadow `0 −4px 10px rgba(0,0,0,.08)`. On the left "Total" (Label4/Medium `#666D85`) over "₫ 1,760.00" (h4 Bold 20/24, dotted underline, which opens the invoice); on the right the "Checkout" button (Accent/700 `#0057FF`, h52, r12, Label-1 17/20 SemiBold white, flex 1). A red "40 PX" text in the frame is a designer redline, not UI.
9. **Tab bar**: Home · Categories · Deals · Account · Cart. The active tab (Cart) is blue `#0057FF` with a 56×4 top indicator, the labels are 12px, and a count badge sits on the cart icon.

### 2.2 Cart error (`12112:209179`)

Page `#F2F3F7`, address header and tab bar unchanged. Centred block: title "Something went wrong!" (bold ~18/24 `#101628`), 4px gap, subtitle 14/18 `#475067`, then the 256×251 illustration 24px below, then "Try Again" (dark fill `#0E0E0E`, white Semibold 14, 158×36, r8) 24px below.

### 2.3 Checkout (screenshot = Checkout 2.0)

Page `#F2F3F7`, content px 12, sections gap 12, cards white r16 p12. In order:

1. Header: 40px round back button, "Delivering to Home ⌄" (Bold 16/21) + address line; transparent → white on scroll.
2. **Shipment cards**: "SHIPMENT n" 13/20 ExtraBold uppercase + an "n Items" count pill (r32, `#F9F9FB`). Items are 52×70 image tiles with a ×n qty badge, a 12/16 two-line title, price row, and warranty / combo / discount chips; two or more lines scroll horizontally (211-wide items). The footer row "Get it **Today before 8pm**" sits on a wave tab, with the supermall (blue `#2122B8`) or express (yellow) pill at the right. A collapsible expander ("Save on fees with later delivery ⌄" / "Need it today? ⌄") opens the delivery lanes.
3. **Delivery instructions**: title + ⓘ; two equal option cards (r16, p12, `#F9F9FB`) with an icon and a checkbox. The selected card is Blue/50 `#EFF7FF` with a 1px `#BBDAFF` border, a blue icon and a filled blue checkbox.
4. **Receiver details**: 32px call tile, name 15/18 SemiBold, phone 12/14, and a "Change receiver" link (13/16 SemiBold `#0057FF`).
5. **Points & Vouchers** (same card as Pay With, split by a 1px `#EBEBEB` line): "Need credits? Top up now!" subtitle, then a horizontal carousel. The expanded program card (Mokafaa: 45px blue tile, name and linked account, chevron) is followed by 49px logo tiles (QUARA gradient, Emkan) and page dots (active 18×5, inactive 5×5). A red **NEW** badge (r12, 12/16.6 SemiBold white) overlaps the top-right of new tiles.
6. **Pay With**: the credits row is a 29.6×16 toggle in `#3866DF` with "Use my ₫50.50 noon credits" and "Select another method to cover the remaining **₫139.50**". Method rows are `#F9F9FB`, r12, h54, with a 38×24 logo, name Label3 SemiBold and a second line Label4 `#5D5D5D`; a NEW badge appears on Tabby. The **selected** method (Debit/Credit Card) is Blue/50 with a 1px `#0076FF` border and shows "Add/Change", the saved card row ("name | •••• 6280", "Installments Available ₫200/mo") and a 58×34 CVV input (r12, 1px `#C0C0C0`). An installment strip below it overlaps the card ("Select an installment starting ₫590/mo" + blue chevron). The noon One Credit Card row uses a white → `#ECFFD1` gradient, "Extra ₫110.20 Cashback" in green and an "Apply Now" pill. Cash on Delivery comes last.
7. **Payment summary**: title 16/24 Bold. Rows are h28 with the label in 15/18 Medium (dotted underline) and the value on the right: Subtotal shows the struck MRP + subtotal, Delivery fee shows "Free with [one] ₫7.00". Dashed dividers separate the groups (Coupon discount "– ₫2.00"), then Total in 17/20 Bold. A savings strip with a wave appears when there are savings.
8. **Sticky dock**: white, shadow `0 −4px 3.5px rgba(0,0,0,.13)`. The slide-to-pay control is 343×48 r12: disabled it is `#DADCE3` with a white 54×32 thumb + arrow and "ENTER CVV" 19/26.6 Bold white. Under it, "4 Items" (`#7E859B`) and "AED 1,643.00" (`#404553`) in 19/26.6 Bold.

States shown or implied: selected payment row, NEW badges, CVV empty → slider disabled, delivery-instruction selected, expander collapsed (chevron down), credits toggle on, shipment with multiple items (scroll), coupon applied (discount row).

## 3. Figma variables → kit tokens

Variables bound in `10575:94058` (from `get_variable_defs`). The checkout frame's variables are already tabled in `src/flows/checkout/FIGMA-MAPPING.md`; they use the same library.

| Figma variable | Value | Kit token | Note |
|---|---|---|---|
| Blue-Gray/1000 | #101628 | `--nk-color-text-strong` | titles, prices, progress copy |
| Blue-Gray/900, colour/text-n-icon/primary | #1D2539 | `--nk-color-text-primary` | |
| Blue-Gray/800 | #343D54 | `--nk-color-text-body` | stack copy |
| Blue-Gray/700 | #475067 | `--nk-color-text-muted` | address line, urgency chip |
| Blue-Gray/600 | #666D85 | `--nk-color-text-secondary` | struck price, "Total" |
| Blue-Gray/500, colour/text-n-icon/muted | #989FB3 | `--nk-color-text-tertiary` | APPLY |
| Blue-Gray/400 | #D0D4DD | `--nk-color-border-strong` | |
| Blue-Gray/300 | #EAECF0 | `--nk-color-border` | progress track, EW row border |
| Blue-Gray/200 | #F2F3F7 | `--nk-color-bg-page` / `--nk-color-border-subtle` | page bg; stack top border |
| Blue-Gray/100, ✅ Sementic/BG/secondary | #F9F9FB | `--nk-color-bg-subtle` | image box, coupon box, offer tiles |
| Blue-Gray/50 | #FCFCFD | `--nk-palette-blue-gray50` | wishlist chip |
| ✅ Sementic/BG/primary, Neutral/White, White/White, 🚧 bg/primary | #FFFFFF | `--nk-color-bg-surface` | |
| ✅ Sementic/Text/primary, Icon/primary | #0E0E0E | `--nk-color-text-ink` | |
| ✅ Sementic/Text/primary-hover | #212121 | `--nk-color-text-product` | |
| ✅ Sementic/Text/secondary, Icon/secondary | #5D5D5D | `--nk-palette-secondary-text-color` | |
| ✅ Sementic/Text/tertiary | #959595 | `--nk-palette-lighter-spanish-gray-color` | "Sponsored" |
| 🚧 text/👀 primary | #02060CEB | `--nk-palette-dark-navy-alpha92` (= `--nk-color-chk-fig-text-primary-alpha` in checkout) | |
| ✅ Sementic/Border/secondary | #EBEBEB | `--nk-palette-bright-grey-color` | stepper border, dotted divider |
| ✅ Sementic/Border/primary | #F5F5F5 | `--nk-palette-border-primary` | grey ETA pill |
| ✅ Sementic/Border/secondary-alpha, Alpha/GrayA/300 | #0E0E0E12 | `--nk-palette-neutral-black-hex12` | free-gifts border; shadow/sm colour |
| Alpha/GrayA/400 | #0E0E0E24 | `--nk-palette-neutral-black-hex24` | "+ Add" border |
| Alpha/GrayA/200, ✅ Border/primary-alpha | #0E0E0E0A | `--nk-color-bg-disabled` | |
| Emerald/700 | #1F7A74 | `--nk-palette-emerald-green700` (cart: `--nk-color-cart-emerald700`) | % OFF, "Free", savings tab |
| Emerald/800 | #13645F | `--nk-palette-emerald-green` (`--nk-color-cart-emerald`) | offer tiles copy |
| Emerald/1000 | #033D38 | `--nk-palette-emerald1000` | |
| (unbound) Emerald 800 dark | #115A56 | `--nk-color-cart-emerald800` (= `--nk-palette-emerald-green800`) | best-price amount |
| Grass/700 | #108757 | `--nk-color-best-price-ink` | FREE, gift bar |
| Green/800 | #329537 | missing | not used in visible layers; snap to `--nk-color-success` if needed |
| Accent/700, ◆ Utility/Text/blue-secondary | #0057FF | `--nk-color-brand-blue` | Checkout CTA, Apply, Edit |
| Accent/600, Blue/600, ✅ Icon/accent | #0076FF | `--nk-color-link` | carousel "+" outline |
| Blue/50 | #EFF7FF | `--nk-palette-alice-blue` | coupon icon circle, focus ring |
| Red/700 | #DE1C1C | `--nk-color-danger` | urgent ETA text |
| Persian-Blue/600 | #2F33C0 | `--nk-palette-persian-blue` | supermall "Add" text |
| Persian-Blue/100 | #CECFF8 | `--nk-palette-persian-blue100` | supermall items border |
| Persian-Blue/50 | #EDEDFD | `--nk-palette-persian-blue50` | supermall "Add" border |
| (unbound) supermall ink | #2122B8 | `--nk-palette-rocket-blue-sapphire` | supermall ETA text, progress fill, pill |
| Yellow/200 | #FDF69B | `--nk-palette-yellow200` | express items border |
| Yellow/100 | #FEFDC8 | `--nk-palette-pale-yellow-gradient` | |
| Purple/100 · Purple/200 | #F9E9FE · #EFC9FB | `--nk-palette-purple100` · `--nk-palette-purple200` | Global |
| Green/100 · Green/200 | #CEF3DA · #BEEFCC | `--nk-palette-green100` · `--nk-palette-green200` | market |
| Primary. Colors/noon Yellow | #FEEE00 | `--nk-color-brand` | |
| Primary. Colors/noon Black | #404553 | `--nk-color-text-legacy` | home bar |
| (unbound) mint chips | #F6FEFD | `--nk-palette-mint-cream` | coupon chips, free-gifts gradient |
| (unbound) combo chip | #EAF4FE | `--nk-palette-light-sky-blue` / `--nk-color-cart-combo-bg` | |
| (unbound) best-price card | #EBFFF4 | `--nk-palette-placebo-turquoise` / `--nk-color-cart-mint-green300` | |
| (unbound) glass fills | #FDFDF1 / #F5F2F7 / #EFFAEA | `--nk-color-cart-glass-express` / `-global` / `-market` | flow tokens in `cartFigmaColors` |
| (unbound) supermall glass, ETA, progress | #E8E8F3, #F5F5FC, #E3E3FC, #EBEBFE | **missing** | add as `cartGlassSupermall`, `cartEtaSupermall`, `cartProgressTrackSupermall`, `cartProgressSupermall` in `src/flows/cart/tokens.ts` `cartFigmaColors` |
| (unbound) urgency chip, freebie tile, savings wave | #F3F5FC, #F5F7FB, #E7FBF3 | `--nk-color-cart-urgency-bg`, `--nk-color-cart-freebie-image-bg`, `--nk-color-cart-savings-wave` | |
| shadow/sm | 0 1 3 GrayA/300 | missing (closest `--nk-shadow-card`) | not visible on the main page |
| focust-shadow/accent/sm | 0 0 0 1 Blue/50 | missing | input focus ring; build as `box-shadow: 0 0 0 1px var(--nk-palette-alice-blue)` |
| Primary/Body2/Medium 14/18 | | `--nk-type-product-title` | item title |
| Primary/Label2/Bold 16/20 (−0.16) | | `--nk-type-text16-bold-lh20` | price, card titles |
| Primary/Label3 Bold · Semibold · Medium · Regular 14/18 | | `--nk-type-body-bold` · `-body-semibold` · `-product-title` · `-body` | |
| Primary/Label-3 Medium / Semibold 13/16 (−0.26) | | `--nk-type-text13-medium-lh16` · `-text13-semibold-lh16` | progress copy |
| Primary/Body3 Regular · Medium 12/16 | | `--nk-type-caption` · `-text12-medium-lh16` | stacks |
| Primary/Label4 Semibold · Medium · Regular 12/14 (−0.12) | | `--nk-type-text12-semibold-lh14` · `-text12-medium-lh14` · `-text12-regular-lh14` | |
| Primary/Label5/Regular 11/12 | | `--nk-type-cart-label5` (flow) | item points |
| Primary/Tiny/Medium 12/18 (+0.12) | | `--nk-type-text12-medium-lh18` | APPLY |
| h4 Bold 20/24 (−0.2) | | `--nk-type-text20-bold-lh24` | footer total |
| Primary/Label-1/Semi Bold 17/20 | | `--nk-type-text17-semibold-lh20` | Checkout CTA |
| Gap/0…36, space/4…8, Radius/4…16, full | | `--nk-space-s0…s36`, `--nk-radius-r4…r16`, `--nk-radius-full` | Gap/1 = 1px hairline (literal); Gap/36 = `s36` |
| letterSpacing/* | −0.12…−0.26, +0.12 | missing (no token group) | keep px literals next to the `font:` as the flows do |

## 4. Design components → kit

| Design component | Kit | Where / status |
|---|---|---|
| Nav Header (address + wishlist) | flow-local `CartHeader` | `src/flows/cart/components/CartHeader.tsx`: matches |
| Checkout header | flow-local `CheckoutHeader` | `src/flows/checkout/components/CheckoutHeader.tsx`: matches |
| Shipment group (glass + waves + items + stacks + progress) | flow-local `CartGroup` + `GroupProgressBar` + `NoonOneNudge` | `src/flows/cart/components/`; express / Global / market match. **Supermall theme missing** |
| Fulfilment logos / pills | central `MarketplaceTag`, `MarketplaceWordmark` (supermall wordmark exists) + Figma SVGs in `src/assets/cart/figma/` | the group header uses the Figma logo assets; the checkout pills are flow-local in `CheckoutShipment.tsx` (63×20 r4.185). Proposed: a `MarketplaceTag` variant for the 63×20 pill, in `src/components/Tag/MarketplaceTag.tsx` |
| Cart item (Component 120) | flow-local `CartItem`, `ItemPoint`, `DiscountTags`, `QuantitySelector` | matches. Use these in cart, not `QuantityStepper` |
| Stepper Button | flow-local `QuantitySelector` (cart); central `QuantityStepper variant="cart"` elsewhere | |
| M-Checkbox (item select) | central `Checkbox` is the squircle glyph; cart uses `figma/checkbox-checked.svg` | item select is visual only (no store behaviour) |
| Coupons bar chip ("Extra 10% Off - Code") | flow-local `DiscountTags` (cart); central `CouponTag` is the 24h r4 variant | |
| ETA pill / Subtitle Block / USPs Urgency | inside `CartItem` (`groupTheme.eta`, `.subtitleChip`, `.urgency`) | supermall flash variant missing |
| Extended warranty row / Protect4less | inside `CartItem` (`.ewRow`, `.warranty*`) | matches |
| Progress bars | flow-local `GroupProgressBar` (`trackColor`, `fillColor` props) | matches; needs supermall colours |
| Stacks (callout rows) | `CartGroup` `.stack` + `NoonOneNudge` | matches |
| Product Carousel SKU 134 | flow-local `CartCarousel` | matches. Proposed: compact `ProductCard` variant in `src/components/ProductCard` |
| Free gifts (OOS style freebies) | flow-local `FreeGifts` | matches |
| Freebie line ("Free Samsung soundbar", FREE, disabled checkbox) | missing | proposed `FreebieLine` in `src/flows/cart/components/`; needs a freebie line type in DemoStore |
| Coupons | flow-local `CouponInput` | matches Phase I |
| Coupon card with Best price strip | missing (style `.bestPrice` exists in `src/flows/cart/components/html.module.css`) | proposed: a `bestPrice` prop / variant of `CouponInput` |
| Freebies promo (Lucid Air) | missing | campaign artwork; skip unless asked |
| Payment Offers (installment tiles + noon One card rows) | flow-local `SalesCallout` list (different layout) | proposed `PaymentOffers` in `src/flows/cart/components/` built from `SectionCard` + `Pressable` tiles + `Money` |
| Savings tab + Cart sticky footer + invoice | flow-local `CartFooter`, `CartWave`, `DynamicInvoice` | matches |
| Checkout button | `CartFooter` `.cta` (brand-blue) / central `Button variant="checkout"` | |
| Error state | missing in cart; pattern = `src/flows/categories/components/ErrorView.tsx` | proposed: `CartError` in `CartScreen.tsx` + ScreenDef `{ state: 'error' }`; button `Button variant="dark" size="sm"` |
| Tab bar | central `TabBar` (rendered by the Navigator) | differs: Figma active `#0057FF` + top indicator vs kit `--nk-color-tab-active` |
| Shipment card (checkout) | flow-local `CheckoutShipment` | matches |
| Delivery instruction option card | flow-local `DeliveryInstruction` | matches |
| Receiver row | flow-local `ReceiverDetails` | matches |
| Points & Vouchers carousel + NEW badge | flow-local `BurnSection`, `NewBadge` (`BurnSection.tsx`) | matches |
| Pay With rows, credits toggle, CVV, EMI strip | flow-local `PaymentMethods` + central `Switch` | matches |
| Payment summary | flow-local `PaymentSummary` | matches |
| Slide-to-pay | flow-local `SlideButton` | matches |

## 5. Motion and interaction cues

| Cue in the design | Kit expression |
|---|---|
| Header: transparent over the page, then a white rounded bar on scroll (blur rectangles hidden in the frame) | `Screen onScroll` → `useMotionValue` → `useTransform` background / radius (as in `CartHeader`, `CheckoutHeader`; motion.md "Headers that react to scroll") |
| Progress bar filling toward the free-delivery threshold, shimmer on the fill | `GroupProgressBar` (spring `cartTokens.progress.spring`, shimmer 1.8s × 7) |
| "+ Add" / "Apply" / stepper presses | `Pressable` (`spring.press`) or `whileTap={{ scale: 0.95 }}` as in `GroupProgressBar`; stepper icons `whileTap={{ scale: 0.85 }}` |
| Quantity value change | `AnimatePresence mode="popLayout"` value swap (`QuantitySelector`) |
| Item removed / warranty added | `CartGroup` `AnimatePresence` height + opacity, 0.3s |
| Coupon apply / error | `CouponInput`: shake `x` keyframes 0.35s, applied icon spring, feedback height reveal |
| Horizontal scrollers (coupon chips, carousels, shipment items, provider tiles) with an edge fade | `.nk-hscroll` + a gradient fade div; no motion |
| Expander "Need it today?" / "Save on fees with later delivery" | `CheckoutShipment`: chevron rotate 180 + `AnimatePresence` height `auto` |
| Selecting a payment method / delivery instruction | instant fill + border swap (no layout motion); `Switch` knob with `spring.press` |
| NEW badge | static badge with texture (`NewBadge`); for a shine, `ShimmerText` or the `CheckoutTag` sweep |
| Total with dotted underline → invoice | `CartFooter` sliding `DynamicInvoice` (0.3s `easing.standard` + backdrop) |
| Sticky "ENTER CVV" slider | `SlideButton` (drag threshold, Lottie arrow); disabled press → scroll to payment (`guideToPayment`) |
| Cart → Checkout | `push` (default); Checkout → Placing `none`; Placing → Confirmation `checkout-alpha` |
| Sheets from items (variants, discount, bundles) and checkout (EMI plans, add card, receiver) | `presentation: 'sheet'` (`spring.sheet`) |
| Error → Try Again | swap to the loader with `fade`; content `FadeIn` |
| Section entry on first load | none in the design; if added use `FadeIn` / `Stagger` once, never on every re-render |

## 6. Delta vs current implementation

### Already matches
- **Cart** (`src/flows/cart`): header, express / Global / market groups (glass, waves, borders, ETA pills, coupons bar, urgency, item points, warranty rows, stacks, progress footer), both carousels, free gifts, Phase I coupon card, savings tab + sticky footer + invoice. Section order in `CartScreen.tsx` `SECTIONS` follows Phase I (groups → carousels → free gifts → coupon → payment offers).
- **Checkout** (`src/flows/checkout`): every section in the screenshot (header, shipments with pills and expanders, delivery instructions, receiver, Points & Vouchers with NEW, Pay With incl. CVV / EMI strip / noon One card / COD, payment summary, ENTER CVV slider + item total), ordered by `FIGMA_SECTIONS`. Nothing is missing for the default state.

### Differs or missing (cart)
1. **Supermall group.** Its theme is unmapped because `CartGroupType` (`src/kit/DemoStore.tsx`) has no `supermall` entry. Change: add `'supermall'` to `CartGroupType`, `cartGroupOf` and `GROUP_ORDER` in `CartScreen.tsx` (first). Add `groupTheme.supermall` in `src/flows/cart/tokens.ts` with glass `#E8E8F3`, border `--nk-palette-persian-blue100`, progressEnd `#EBEBFE`, track `#E3E3FC`, fill `--nk-palette-rocket-blue-sapphire`, eta `#F5F5FC` (new `cartFigmaColors` keys). Also: a supermall wordmark (`MarketplaceWordmark kind="supermall"` or the Figma SVG), and a `waves-supermall.svg` asset. The ETA variant needs a 14px flash icon and `#2122B8` text; the "+ Add" button needs Persian-Blue/50 border and `--nk-palette-persian-blue` text; the stack row "Save on fees at checkout with later delivery!" goes in `groupCallouts`. The progress copy for supermall is "for free service fees". In checkout, `data.shipment.ts` already maps marketplace → supermall; keep the two in sync.
2. **Best-price coupon variant.** It is not built, although `html.module.css` `.bestPrice` already exists. Change `CouponInput.tsx`: an optional mint wrapper (`--nk-color-cart-mint-green300` → `--nk-palette-mint-cream`) where the white block gets `margin-bottom: -12px` + z2, and a strip "Best price **₫X** with offers" (`HtmlText` with `<highlight>`) + chevron → `nav.sheet('cart/discount', …)`. Add `t.couponPlaceholderSelect` = "Enter your coupon code or select one" and a demo `bestPrice` value in `data.ts`.
3. **Payment offers layout.** Figma shows 3 installment tiles (Tabby / Tamara / Bank: "₫x * 4", "0% Installments") and 2 noon One credit card cashback rows with "Apply ›". The kit renders `paymentCallouts` through `SalesCallout`. Change: a new `PaymentOffers` component in `src/flows/cart/components/` plus `paymentOffers` data (amount = total ÷ 4, cashback = 5%), replacing the `callouts` branch in `CartScreen.tsx`. Hide the noon One rows for members, as now.
4. **Error state.** It is missing. Add `CartError` (title / subtitle / illustration / `Button variant="dark" size="sm"` "Try Again" → loading → cart) and a ScreenDef `error` with `defaultParams: { state: 'error' }` in `src/flows/cart/index.ts`. Add `'error'` to the `state` param type in `CartScreen.tsx`. Put the illustration in `src/assets/cart/`.
5. **Freebie line item** ("Free Samsung soundbar worth ₫209", FREE, disabled checkbox, no stepper, "* While stock lasts" note) is not modelled. `checkbox-disabled.svg` and `gift-stepper.svg` are already in `src/assets/cart/figma/`.
6. **Best-price page order.** Free gifts → payment offers → coupon → promo → carousels. If you build that variant, register it as a separate ScreenDef with its own `SECTIONS` order rather than changing the default.
7. **Freebies promo** (Lucid Air) is not built (campaign art). **"Ad" tag / "express Today" pill** on carousel tiles are not built (no mock data flags).
8. **Tab bar.** The Figma active colour is `#0057FF` with a 56×4 top indicator; `src/components/TabBar` uses `--nk-color-tab-active` `#1155CB` with no indicator. This is a shared change, so check every tab flow before making it.

### Differs (checkout)
- `MarketplaceTag` has no 63×20 r4.185 supermall / express pill, so `CheckoutShipment.tsx` keeps flow-local pills. Moving them into `src/components/Tag/MarketplaceTag.tsx` would let the cart supermall group and checkout share one.
- The kit device is 390 wide with a 54 status bar (Figma 375 / 47), so the header sits 7px lower. Accepted.

## 7. Build guidance

1. **Start from the flows, not from scratch.** Base a cart screen on `src/flows/cart/CartScreen.tsx` (`SECTIONS.map(renderSection)`) and a checkout screen on `src/flows/checkout/CheckoutScreen.tsx` (`params.sections ?? FIGMA_SECTIONS`). A new section is a new id in that list plus a flow-local component.
2. **Page rhythm:** `background="bgPage"` (`#F2F3F7`), 12px gutter, 12px between cards, cards white r16 with p12 (use `SectionCard` for new plain cards, passing `margin={0}` inside the flow's padded content). Inner tiles are `--nk-color-bg-subtle` r12. Chips are r4–r8.
3. **Shipments are themed, not recoloured by hand.** Every group colour comes from `groupTheme[type]` in `src/flows/cart/tokens.ts` (glass, border, progressEnd, track, fill, eta). Add a new fulfilment as one more `groupTheme` entry and `cartFigmaColors` keys, never as inline hex.
4. **Overlap is part of the look.** Glass container `margin-bottom: −24px` over the progress footer (pt 36). Stepper `margin-bottom: −16px` over the image. Coupon block `−12px` over the best-price strip. Savings wave `−16px` over the footer. The checkout EMI strip `−12px` under the selected card. Keep these overlaps with z-index rather than flattening them into separate cards.
5. **Item cards:** use `CartItem` in cart and `CheckoutShipment` in checkout. Prices use `Price` / `Money` / `currency` (dirham glyph), never "AED" in new UI (the Figma footer "AED 1,643.00" is rendered with the glyph in the kit). Discount % is Emerald/700, FREE is Grass/700.
6. **One primary per page:** cart Checkout (`--nk-color-brand-blue`, h52 r12) and checkout `SlideButton`. Everything else is a link (`--nk-color-brand-blue` / `--nk-color-link`), a "+ Add" outline mini button, or a tile.
7. **Selected states:** selected payment or option = `--nk-palette-alice-blue` fill + 1px `--nk-color-link` (payment) or `--nk-palette-light-blue` (instructions) border, swapped instantly. Keep a 1px transparent border on the unselected state so nothing shifts. NEW = `NewBadge` from `BurnSection.tsx`, top-right, overlapping the row edge.
8. **Collapsibles** (lanes, unavailable items, invoice) animate height with `AnimatePresence` + a rotating chevron (`CheckoutShipment` pattern), 0.25–0.3s, never a CSS keyframe.
9. **States as ScreenDefs:** `empty`, `loading` exist; add `error` (and `best-price` if needed) the same way, with `defaultParams`, so each opens by URL and can be screenshotted.
10. **Copy:** sentence case, short ("Got a coupon?", "Free gifts for you", "Try Again" → write "Try again"), group names as wordmarks, not text. Server-style rich copy (bold amounts, highlights) goes through `HtmlText`.
11. **Tokens:** every value above has a token or a `cart*` / `chkFig*` flow token. A new raw value goes in the flow's `tokens.ts` with the Figma node in a comment, and `FIGMA-MAPPING.md` gets a row.
