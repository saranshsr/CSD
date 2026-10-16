# Checkout: bappzaar master → kit mapping

> The default checkout screen now follows Figma "🚧 Checkout 2.0" — see FIGMA-MAPPING.md (it takes precedence for the screen layout, header, shipments, delivery / receiver, payment, summary and footer). This file documents the bappzaar master port that the sheets, behaviour and the hidden sections still follow.

Source: `bappzaar` `origin/master` @ `cc1f8a0d1f0` (2026-10-11), read through `git show` only. Every value below was
resolved from the component's `styles.ts`, then through `NoonThemeManager` / `NoonColors.ts` / `NoonTokens`
(`marketplaces/noon/theme/tokens/*`) / `src/theme/Metrics.ts` (EStyleSheet `$vars` are the method names of
`NoonColors` / `NoonMetrics`). Abbreviations: **M** = `marketplaces/noon`, **C** = `M/components`, **S** = `M/screens`.

Status: **✓** already matched (now on tokens), **fixed** = changed in this pass, **≈** = documented approximation.

Global metric values used throughout: `$edgeSpacing` 15 → `--nk-space-s15`, `$checkoutSectionsHorizontalPadding` /
`$paymentSectionHorizontalPadding` 12 → `s12`, `$increasedBaseFont` 14, `$increasedMediumFont` 12,
`$increasedLargeFont` 16, `$appFontTitleExtraSmall` 18, `$fontSizeXXLarge` 20. Base `Text` (`Styles.baseTextStyle`):
13px `$charcoalGreyColor` #404553 → `--nk-color-text-legacy`. HtmlView base tags: `h4` 18, `b` bold, `highlight`
greenColor bold, `steel` steelColor.

Token conventions in checkout:

- Central semantic colour where the meaning matches (`--nk-color-text-ink` #0E0E0E newTextPrimary, `--nk-color-link`
  #0076FF newAccentColor, `--nk-color-cta` #3866DF accentColor, `--nk-color-bg-subtle` #F9F9FB
  secondaryBackgroundColor, `--nk-color-text-primary` #1D2539 blueGray900, `--nk-color-text-strong` #101628
  charcoalNavy / blueGray1000, `--nk-color-text-body` #343D54 gray800, `--nk-color-text-secondary` #666D85 slateGray,
  `--nk-color-text-muted` #475067 blueGray700, `--nk-color-text-disabled` #0E0E0E3D, `--nk-color-bg-muted` #F3F4F8
  noonGrey4, `--nk-color-border` #EAECF0 lightGreyColor, `--nk-color-border-strong` #D0D4DD, `--nk-color-success`
  #0F8857 deepGreen …).
- Otherwise the palette entry named after the master colour (`--nk-palette-bright-grey-color`, `-alice-blue`,
  `-deep-red-color`, `-secondary-text-color`, `-noon-grey3`, `-anti-flash-white` …).
- Otherwise a checkout token in `tokens.ts` → `checkoutFlowTokens` (`--nk-color-chk-*`, `--nk-type-chk-*`,
  `--nk-shadow-chk-*`, `--nk-radius-chk-*`, `--nk-layout-chk-*`).
- **Scope note:** the flow overrides `bgPage` to `$noonGrey4` #F3F4F8 (checkout container). Master `antiFlashWhite`
  #F2F3F7 is therefore written as `--nk-palette-anti-flash-white` (backgrounds) / `--nk-color-border-subtle`
  (borders) inside checkout, never `--nk-color-bg-page`.
- JS-only values (Lottie colour filter, motion colour interpolation) come from `checkoutJs` (palette references);
  server colours that master concatenates with hex alpha (`${genericThemeColor}33`) live in `checkoutServerColors`.
- Spacing / radius: every padding / margin / gap / border-radius on the kit scale uses `--nk-space-sN` /
  `--nk-radius-rN` (173 values converted). Off-scale geometry is listed under *Literal exceptions*.

---

## 1. Main screen: `checkout/checkout`

### 1.1 Screen shell: `S/NoonCheckoutScreen/styles.ts`

| Property | Master | Kit token | Status |
|---|---|---|---|
| container bg | `$noonGrey4` #F3F4F8 | `--nk-color-bg-muted` (+ flow `bgPage`) | ✓ |
| list content padding | H `$checkoutSectionsHorizontalPadding` 12, bottom 12 | `--nk-space-s12` | ✓ |
| `section` card | radius 16, marginTop 12, overflow hidden | `section.module.css`: `--nk-radius-r16`, `--nk-space-s12` | ✓ |
| `oneSection` | radius 15 (18 toggled), marginTop 12 | `--nk-radius-chk-noon-one(-on)` | ✓ |
| invoice section | `section` + `removeBorderRadius` (inner `invoiceSectionContainer` r16) | `DynamicInvoice.module.css .wrapper/.card` | ✓ |
| sticky footer | `stickyButtonsWrapper` + `columnReverseWrapper`: column-reverse, paddingTop 16 (overrides 12), H `$edgeSpacing`, bottom safe area, rowGap 8, white | `--nk-space-s16/s15/s8`, `--nk-inset-bottom`, `--nk-color-bg-surface` | ✓ |
| footer shadow | offset (0,−4), `rgba(0,0,0,.06)`, opacity 1, iOS default radius 3 | `--nk-shadow-chk-sticky-footer` | ✓ (tokenised) |
| `overviewWrapper` | row, space-between, marginH 4 | `--nk-space-s4` | ✓ |
| `itemsCountText` | 19 / 700 `$steelColor` #7E859B | `--nk-type-text19-bold-lh24`, `--nk-palette-noon-grey1` | ✓ |
| `totalPrice` (Price → base Text) | 19 / 700 #404553 | `--nk-type-text19-bold-lh24`, `--nk-color-text-legacy` | ✓ |
| Apple Pay CTA | PKPaymentButton black/buy, 48h | `--nk-palette-black`, `--nk-type-chk-text19-medium-lh1` + SF family | ≈ (native button drawn in CSS) |

### 1.2 Header: `C/NoonSalesAnimatedHeader` + `headerDetachedAddress*`

| Property | Master | Kit token | Status |
|---|---|---|---|
| paddingTop | status bar + 14 | `calc(var(--nk-inset-top) + 14px)` | ✓ |
| bg animation | `HEADER_ANIMATION_COLORS` [antiFlashWhite, white] over scroll 0→50 | `checkoutJs.headerFrom/To` (palette) | ✓ (tokenised) |
| bottom radius | 0 → 12 over 0→50 (`addressRoundedCornerOverlay` bottom −12, h24) | motion, geometry | ✓ |
| drop gradient | `GRADIENT_COLORS` ['#00000019','#00000000'] locations [0.2,1], h24, bottom −22, fades 50→60 | `--nk-palette-black-alpha9p8` → `--nk-palette-black-alpha0` | ✓ (tokenised) |
| row | minHeight 48, centred | geometry | ✓ |
| back button | 40×40 white r20, left 12 / top 4, border 1 `$noonGrey4`, scaleX −1 (LTR) | `--nk-color-bg-surface`, `--nk-radius-r20`, `--nk-space-s12/s4`, `--nk-color-bg-muted` | ✓ |
| back icon | `icons.chevronThick` fill/stroke neutralBlack | `ChevronThick` (chevron-thick.svg path, md5-identical) `--nk-color-text-ink` | ✓ |
| title | 16 / 700 `$blueGray900` | `--nk-type-section`, `--nk-color-text-primary` | ✓ |

### 1.3 Detached address: `renderDetachedAddress` + `C/NoonCartAddressSelectorV2` (`checkoutDetached*`) + `C/NoonAddressSelector`

| Property | Master | Kit token | Status |
|---|---|---|---|
| wrapper padding | L12 R16 T12 B10, white | `--nk-space-s12/s16/s10` | ✓ |
| selector | flex 1, marginRight 10 + `selectorContainer` marginEnd 8 | `--nk-space-s10`, `--nk-space-s8` | ✓ |
| leading icon | 20×20 tint `$blueGray700` | mask, `--nk-color-text-muted` | ✓ |
| label | 16 / 700 `$blueGray900`, gap 4 | `--nk-type-section`, `--nk-color-text-primary`, `--nk-space-s4` | ✓ |
| address text | 13 / 500 `$slateGray`, lh 22, paddingStart 4, marginTop 2, 1 line | `--nk-type-chk-text13-medium-lh22`, `--nk-color-text-secondary` | ✓ |
| chevron | `chevronThick` fill slateGray, stroke transparent | `--nk-color-text-secondary` | ✓ |

### 1.4 Shipment: `C/NoonCheckoutShipment/{NoonCheckoutShipment.tsx,styles.ts}` (`$horizontalSpacing` 12)

| Property | Master | Kit token | Status |
|---|---|---|---|
| content gap | 9 | 9px | ✓ (exception) |
| header | row gap 8, padding T8 B2 H12 | `--nk-space-s8/s2/s12` | ✓ |
| title | 16 / 700 blueGray900 | `--nk-type-section` | ✓ |
| count pill | paddingH 7, `$noonGrey4`, r36, 12 / 500 slateGray | `--nk-color-bg-muted`, `--nk-type-text12-medium-lh18` | ✓ |
| items row | padding V6 H12; item width 1 item → screen−40, else screen×0.52; marginRight 20, gap 8 | `--nk-space-s6/s12/s20/s8` | ✓ |
| image | 64×88 r12, grey overlay black @ .03 r12 | `--nk-radius-r12`, `--nk-palette-black` | ✓ |
| qty badge | 20×20 right/bottom 6, pad 2, white r4, 0.5 `#D0D4DD`, `shadow(0.1)`, x 8 / value 10/600 gray800 | `--nk-color-border-strong`, `--nk-palette-black-alpha10`, `--nk-type-chk-text8-regular-lh10`, `--nk-type-text10-semibold-lh12` | ✓ |
| item title | 13 / 400 lh16 charcoalNavy, 2 lines | `--nk-type-text13-regular-lh16`, `--nk-color-text-strong` | ✓ |
| price / FREE | 14 / 700 charcoalNavy; 12 / 700 greenColor | `--nk-type-body-bold`; `--nk-type-text12-bold-lh16`, `--nk-palette-green-color` | ✓ |
| promise text | p 14 #404553, highlight 600 #1F7A74, steel slateGray | `--nk-type-body`, `--nk-color-chk-promise-highlight`, `--nk-color-text-secondary` | ✓ (tokenised) |
| selected strip | columnGap 40, paddingRight 12; left padding L12 V10 bg secondaryBackgroundColor; svg slope fill secondaryBackgroundColor | `--nk-color-bg-subtle` | ✓ |
| main callout | padding 12, secondaryBackgroundColor; arrow 90° / −90° (300ms), marginRight 6 | `--nk-space-s12/s6` | ✓ |
| lanes container | LinearGradient secondaryBackgroundColor → white, padding 12, bottom radii 16 | `--nk-color-bg-subtle` → `--nk-color-bg-surface`, `--nk-radius-r16` | ✓ |
| lane | padding V12 (first 0), radio 18 mr 11, info 20 mr 4 | `--nk-space-s12`, 11px exception | ✓ |
| dashed separator | Svg Line brightGreyColor, width 2, dash 5,4 | `--nk-palette-bright-grey-color` | ✓ |
| slot callout | padding V10 H12, 14 / 600 blueGray1000, chevronThick blueGray1000 | `--nk-type-body-semibold`, `--nk-color-text-strong` | ✓ |

### 1.5 noon One: `C/NoonCheckoutNoonOneSection` (behaviour unchanged)

| Property | Master | Kit token | Status |
|---|---|---|---|
| radius | 15 → 18 toggled | `--nk-radius-chk-noon-one(-on)` | ✓ |
| main gradient | darkGreenOcean @.95 → @1 (70%) → `#f3f4f8` | `--nk-color-chk-noon-one-ocean95/ocean`, `--nk-color-bg-muted` | ✓ |
| yellow glow | yellowGold .22 / .12 / 0 | `--nk-color-chk-noon-one-gold22/12/0` | ✓ |
| CTA strip | ottomanGreen | `--nk-color-chk-noon-one-cta-bg` | ✓ |
| `ctaRevealBackdrop` | antiFlashWhite #F2F3F7 | `--nk-palette-anti-flash-white` (was flow `bg-page` = #F3F4F8) | **fixed** |

### 1.6 Delivery instructions + receiver: `S/NoonCheckoutScreen/{DeliveryInstruction,ReceiverDetails,ItemContainer}/styles.ts`

| Property | Master | Kit token | Status |
|---|---|---|---|
| ItemContainer | padding 12, gap 12, white, `shadow(0.01)` | `--nk-space-s12`, `--nk-palette-black-alpha1` | ✓ |
| title | 16 / 700 blueGray900 | `--nk-type-text16-bold-lh20` | ✓ |
| info icon | 20, stroke #989FB3 1.5 | `--nk-color-text-tertiary` | ✓ |
| option card | width (screen−48)/2, secondaryBackgroundColor, r16, padding 12, mr 8, border 1 transparent, gap 16 | `--nk-color-bg-subtle`, `--nk-radius-r16`, `--nk-space-s12/s8/s16` | ✓ |
| option active | border `#BBDAFF`, bg `#EFF3FD` (fadedBlue); icon/checkbox accentBlue | `--nk-palette-light-blue`, `--nk-palette-faded-blue`, `--nk-color-brand-blue` | ✓ |
| option text | 14 / 500 gray800 | `--nk-type-product-title`, `--nk-color-text-body` | ✓ |
| receiver call chip | secondaryBackgroundColor r8 padding 6 | `--nk-color-bg-subtle`, `--nk-radius-r8`, `--nk-space-s6` | ✓ |
| name / phone | 15/600 gray800; 12/500 slateGray; gap 4 | `--nk-type-text15-semibold-lh19`, `--nk-type-text12-medium-lh15` | ✓ |
| Change receiver | NoonButton ghost, 13/600 | `<Button variant="noonGhost">` + `--nk-type-text13-semibold-lh16` | ✓ |
| loader | noon Loader #DADCE3 track, accentColor | `<Spinner>` `--nk-palette-noon-grey3`, `--nk-palette-accent-color` | ✓ |

### 1.7 Payment methods: `C/NoonCheckoutPaymentMethods/styles.ts` + `C/NoonCheckoutPaymentCard` + `C/NoonCheckoutTag`

| Property | Master | Kit token | Status |
|---|---|---|---|
| container | gap 16, white, padding 12; upper gap 12 | `--nk-space-s16/s12` | ✓ |
| title | 16 / bold blueGray900 | `--nk-type-text16-bold-lh20` | ✓ |
| credits switch | react-native-switch circle 15, bar 20, ×2.5, newAccentColor / grayColor | `<Switch width 37.5 knob 15>` `--nk-color-link` / `--nk-palette-gray-color` | ✓ |
| credits text | 14 / 500 newTextPrimary; sufficient 12 darkGreen; insufficient 12 lh18 dimTextPrimary (+700 value) | `--nk-type-product-title`; `--nk-type-caption` `--nk-palette-dark-green`; `--nk-type-text12-regular-lh18` `--nk-palette-dim-text-primary` | ✓ |
| method wrapper | secondaryBackgroundColor r12, border 1 secondaryBackgroundColor; selected border newAccentColor | `--nk-color-bg-subtle`, `--nk-radius-r12`, `--nk-color-link` | ✓ |
| core padding | V10 H12; selected aliceBlue | `--nk-space-s10/s12`, `--nk-palette-alice-blue` | ✓ |
| EMI callout border | 1 `#0E0E0E12` | `--nk-palette-neutral-black-hex12` (inset ring) | ✓ |
| EMI selected | lavender #E1EFFF | `--nk-palette-lavender` | ✓ |
| method row | gap 8, minHeight 34, image 38×24 r4 | `--nk-space-s8`, `--nk-radius-r4` | ✓ |
| method name | 14 / 600 newTextPrimary; disabled disabledTextColor | `--nk-type-body-semibold`, `--nk-color-text-ink`, `--nk-color-text-disabled` | ✓ |
| subtext html | p 12 secondaryTextColor (disabled disabledTextColor) | `--nk-type-caption`, `--nk-palette-secondary-text-color` | ✓ (tokenised) |
| Add/Change | NoonButton ghost, 14/600, paddingLeft 10 | `<Button variant="noonGhost">`, `--nk-space-s10` | ✓ |
| EMI callout text | 12 / 500 newTextPrimary (no lh) | `--nk-font-size-body-small` + `--nk-font-weight-medium` | ✓ (tokenised) |
| selected plan | 12/500, installment sapphire, tenure 600 sapphire, padding H13 | `--nk-type-text12-medium-lh16`, `--nk-color-tab-active` | ✓ |
| cobrand row | padding V10 H12, r12, gradient server colours (default ['#FFFFFF','#F5F5F5']) | `checkoutServerColors.upselling*` | ✓ |
| cobrand title / cashback / right | p 600 14 #404553; base 13 + highlight darkGreen 400 12; p newAccentColor | font-size/weight tokens, `--nk-palette-dark-green`, `--nk-color-link` | ✓ (tokenised) |
| PaymentCard row | gap 12, minHeight 34; left gap 8 (10 no text); icon 38×24 (54×34 large) white r4 | `--nk-space-s12/s8/s10`, `--nk-radius-r4` | ✓ |
| separator | 1×14 r2 lighterSpanishGrayColor | `--nk-palette-lighter-spanish-gray-color` | ✓ |
| dots | 4×4 r2 newTextPrimary, gap 2 | `--nk-color-text-ink`, `--nk-space-s2` | ✓ |
| CVV input | border 1 `#0E0E0E24`, white, r8, padding H14 V8, minWidth 60, h34; placeholder lighterSpanishGrayColor; base text 13 #404553 | `--nk-palette-neutral-black-hex24`, `--nk-radius-r8`, `--nk-space-s14/s8`, `--nk-type-text13-regular-lh16` | ✓ |
| card message html | p 12/400 secondaryTextColor; highlight #38AE04; red redColor; orange orangeColor; green deepGreen | `--nk-color-success-strong`, `--nk-palette-red-color`, `--nk-palette-orange-color`, `--nk-color-success` | ✓ (tokenised) |
| Tag | absolute top −2 left −2, h16, paddingH 6, r12, 12/600 lh14 white; shimmer 15w secondaryBackgroundColor @.4, rotate 20°, scaleY 1.5, `withRepeat(withDelay(1500, withTiming(w+15, 800)))` (default easing inOut(quad)) | `rewards.module.css .tag*`, `--nk-type-text12-semibold-lh14` | **fixed**: the payment copy (inline styles, `easeInOut`) and the provider copy (`linear`, `inset-inline-start`) are merged into one `CheckoutTag` with in-out-quad easing and `left: −2` |

### 1.8 Points & vouchers: `C/NoonCheckoutBurnSection` + `C/NoonCheckoutProviderCallout`

| Property | Master | Kit token | Status |
|---|---|---|---|
| container | padding 12, gap 12 (r8 overridden by `section` r16) | `--nk-space-s12` | ✓ |
| title | 16 / bold blueGray900 | `--nk-type-text16-bold-lh20` | ✓ |
| callouts | gap 4; loyalty row gap 4 | `--nk-space-s4` | ✓ |
| voucher callout | padding H10 V7, secondaryBackgroundColor r12; text 12 blueGray700; right gap 8 | `--nk-space-s10`, 7px exception, `--nk-radius-r12` | ✓ |
| logos | 30 circle, overlap −7.5, border 1 `whiteColor(0.14)` | `--nk-palette-white-alpha14` | ✓ (tokenised) |
| chevron dot | 14×14 newBorderColor r20; `icons.chevronBlueGray` 4×7 | `--nk-palette-new-border-color`; **real asset** `rewards-chevron-blue-gray.webp` (= master `chevron-blue-gray@3x.webp`) | **fixed** (was a hand-drawn SVG) |
| provider callout | gap 8, secondaryBackgroundColor r8, paddingH 10; expanded padding 2/8/2/2 + border 1 brightGreyColor | `--nk-color-bg-subtle`, `--nk-radius-r8`, `--nk-palette-bright-grey-color` | ✓ |
| callout title | 14 / 600 lh18 newTextPrimary | `--nk-type-body-semibold` | ✓ |
| skeletons | 44 / 51 h r8 | `Skeleton` + `--nk-color-bg-muted` / `--nk-palette-skeleton-gray` | ✓ (tokenised) |

### 1.9 Coupon status: `C/NoonCheckoutCouponStatus`

| Property | Master | Kit token | Status |
|---|---|---|---|
| frame | padding 2 white; card r14 | `--nk-space-s2`, `--nk-radius-r14` | ✓ |
| gradients | error noonErrorSubtle→white; default/warning noonSuccessSubtle→white; banner paleMint→white | `--nk-color-danger-surface`, `--nk-color-success-surface`, `--nk-palette-pale-mint` | ✓ |
| banner | padding H12 T8 B6, 11 / 700 baseGreen800 | `--nk-type-chk-text11-bold-lh14`, `--nk-palette-base-green800` | ✓ |
| row | padding H12 T10 B12, gap 8; icon 20 | `--nk-space-s12/s10/s8` | ✓ |
| title | 14 / 700, deepGreen / dangerRed, 2 lines | `--nk-type-body-bold`, `--nk-color-success`, `--nk-palette-danger-red` | ✓ |
| message | 13 / 400 blueGray700, 2 lines | `--nk-type-text13-regular-lh17`, `--nk-color-text-muted` | ✓ |
| action | **NoonButton type="dotted"**, dottedColor blueGray900, text 12/600 blueGray900, hitSlop | `<Button variant="noonDotted" dottedColor=…>` + `--nk-type-caption-bold` | **fixed** (was a CSS `text-decoration: dotted` underline; now the real 0.5/3 round-dotted line 2px below) |

### 1.10 Earn: `C/NoonCheckoutEarnCallout`

| Property | Master | Kit token | Status |
|---|---|---|---|
| container | row, padding 16, gap 8, white | `--nk-space-s16/s8` | ✓ |
| title | 14 / 600 blueGray1000 | `--nk-type-body-semibold`, `--nk-color-text-strong` | ✓ |
| providers | gap 6, maxWidth 132, logo 40×15 | `--nk-space-s6` | ✓ |
| selected provider | gap 8, icon 38×24 r4; remove points ghost 12 | `--nk-radius-r4`, `--nk-type-caption-bold` | ✓ |

### 1.11 Invoice: `C/NoonDynamicInvoice/styles.ts` + `invoiceContentContainer` / `invoiceSectionContainer`

| Property | Master | Kit token | Status |
|---|---|---|---|
| card | white r16 overflow hidden; content paddingV 16 | `--nk-radius-r16`, `--nk-space-s16` | ✓ |
| section | marginH `$edgeSpacing`, paddingV 15 (first top 0, last bottom 0) | `--nk-space-s15` | ✓ |
| header | gap 8, marginBottom 8 | `--nk-space-s8` | ✓ |
| entry | marginTop 8 (first 0); left marginRight 20 colGap 4; right flexGrow colGap 4 | `--nk-space-s8/s20/s4` | ✓ |
| text sheet | p 15 slate600; highlight emeraldGreen bold; h4 charcoalNavy 18; steel slate600 | `--nk-font-size-body-medium`, `--nk-color-chk-invoice-text`, `--nk-color-chk-invoice-highlight`, `--nk-color-text-strong` | **fixed**: h4 no longer forces 700 (master h4 = size only; weight comes from `<b>` in the server copy) |
| amount sheet | p 15/500 charcoalNavy; highlight emeraldGreen bold; steel textTertiary; *no h4* (base h4 18 inherits p) | `--nk-font-weight-medium`, `--nk-color-chk-invoice-steel` | **fixed** (same: h4 size only) |
| title sheet | p blueGray900 only; highlight / steel as above | `--nk-color-text-primary` | **fixed** (size/weight from copy `<h4><b>…`) |
| subtitle sheet | p 11 slate600; highlight emeraldGreen | `--nk-font-size-caption`, `--nk-color-chk-invoice-text` | ✓ |
| dashed separator | Svg Line `#D0D4DD`, width 2, dash 5,4 | `--nk-color-chk-invoice-dash` | ✓ |
| special section | `$emerald100` + NoonDynamicInvoiceWave | `--nk-color-chk-invoice-special-bg` | ✓ |

### 1.12 Slide CTA: `C/NoonCheckoutSlideButton`

| Property | Master | Kit token | Status |
|---|---|---|---|
| track | LinearGradient ['#3866DF','#3454A8'] (RTL reversed), disabled grayColor; minHeight 48, padding 8, r14 | `--nk-color-cta` → `--nk-color-chk-slide-track-end`, `--nk-palette-gray-color`, `--nk-space-s8`, `--nk-radius-r14` | ✓ (tokenised) |
| label | 16 / 700; masked layer `#7394DE`, shimmer ['#7394DE','#DAE3F6','#7394DE'] (disabled white) | `--nk-type-text16-bold-lh20`, `--nk-color-chk-slide-label(-shine)`, `--nk-color-bg-surface` | ✓ (tokenised) |
| thumb | white 60×38 r9 left 7; lottie 48×48 arrow keypath #3866DF / #CED1DA | `checkoutJs.slideArrowEnabled/Disabled` | ✓ |
| thresholds | slow .85, fast .65 (velocity 500), lottie .62 | constants | ✓ |

### 1.13 Reloader / voucher toast

| Property | Master | Kit token | Status |
|---|---|---|---|
| FeedbackView reloader | overlay white @.6, spinkit Pulse 37 accentColor | `--nk-palette-white-alpha60`, `--nk-palette-accent-color` | ✓ |
| voucher toast | Toast bg `rgba(0,0,0,.83)`, r5, shadow 3/6 `rgba(0,0,0,.11)`; message row gap 8 padding 8 r8; text 14 bold white, max 80% | `--nk-palette-black-alpha83`, `--nk-palette-black-alpha11`, `--nk-type-body-bold` | ✓ |

---

## 2. Sheets

| Screen (route) | Master | Notable values → tokens | Status |
|---|---|---|---|
| Lane info `promise-info` | `src/screens/LearnMoreScreen` | padding T40 H37; title 32 bold #404553; html p 16 #404553 mb 64; button 48h accentColor r8, 14 bold white | `--nk-type-chk-text32-bold-lh38`, `--nk-color-text-legacy`, `--nk-color-cta`, `--nk-radius-r8`, `--nk-type-text14-bold-lh1`: ✓ (tokenised) |
| Select card `cards-select` | `S/NoonCheckoutCardsSelectScreen/styles.ts` | title wrapper T24 B12 H16, border-bottom brightGreyColor; title 18/700; Add New secondary aliceBlue r8 pad 4/8 gap 2; cards gap 4 pad T16 H12 B40; card secondaryBackgroundColor r12 pad 10/12, **no border**; selected border 1 newAccentColor + aliceBlue | **fixed**: unselected cards had a 1px border (2px taller than master) |
| Add card `add-card` | `S/NoonCheckoutAddPaymentCardScreen/styles.ts` | title 16/700, border borderPrimary #F5F5F5; input 48h r12 border brightGreyColor, pad 12/10/12/14; error deepRedColor + `#FEEBEB` glow; label 14/500; hint 12/500 lighterSpanishGray; checkbox label 12/600 charcoalGrey, sub 12 steel; footer `shadow3`; accepted cards 26×26 gap 2/8 | `--nk-palette-border-primary`, `--nk-palette-bright-grey-color`, `--nk-palette-deep-red-color`, `--nk-palette-red100`, `--nk-color-chk-input-placeholder`: ✓ |
| Special EMIs `special-emis` | `S/NoonCheckoutSpecialEMIsOverlayScreen/styles.ts` | header 16 (T24) border brightGrey; description p 14/500 newTextPrimary; card always border 1 (secondaryBackground → newAccentColor/aliceBlue); terms T36 B16 12 secondaryText | ✓ (tokenised) |
| EMI plans `emi-plans` | `S/NoonSalesEMIPlansOverlayScreen/styles.ts` | sheet bg **antiFlashWhite**; header T24 B12 H16; card+terms white r12 gap 12 m 16/12/12; plan border lightGreyColor r8 pad 10/8 gap 4, selected newAccentColor; tenure 12/600 (disabled filterDisabledText); fee 12 secondaryText, **error `errorMessageColor` #FB0B0B**; footer shadow (0,−2) .08 r4; Confirm = NoonButton | **fixed**: bg was #F3F4F8 (flow bg-page), fee error was #DE1C1C, Confirm was a local copy → shared `<Button variant="noon">` |
| Receiver `alternate-phone` | `S/NoonCheckoutAlternatePhoneScreen` (+ `SavedContact`) | `OverlayBottomSheet` via `useScrollToClose(…, true)` → `sheet: 'floating'`; container mH 15, maxHeight screen × 0.65; title 18 bold; note pad 10 r8; input row 45h r8 border noonGrey3; dial code 75×42 #F5F6F9; error fadedRedColor; OR noonGrey3; initials 40 r20 `#FFFCCF`; primary tag fadedBlue r8 14 bold `#3466EA` | `--nk-palette-noon-grey3`, `--nk-color-chk-dial-code-bg`, `--nk-palette-faded-red-color`, `--nk-color-chk-contact-initials-bg`, `--nk-palette-new-blue`: ✓ |
| Contacts `alternate-phone-contacts` | `S/NoonCheckoutAlternatePhoneContactsScreen` | modal white r8 pad 15; title 16 semibold; option border `#b3cce6` r6 pad 8, 16 blueColor | `--nk-color-chk-contact-option-border`: ✓ |
| Delivery instructions `learn-more` | `S/NoonCheckoutLearnMoreScreen` | `OverlayBottomSheet isFloating` → `sheet: 'floating'` (12 inset, r16, #B7B7B7 handle −18, scrim 30,30,30 × 0.7, bottom = safe area); m 20/15/15; title 18 bold; description 16; list title 18/600, desc 16 lh21; icons gray800 / accentBlue | `--nk-type-chk-text18-semibold-lh24`, `--nk-color-text-body`, `--nk-color-brand-blue`: ✓ |
| Financing options `burn-providers` | `S/NoonCheckoutBurnProvidersListOverlayScreen` | header pad 16 (T24) white; title 18/700; content pad 8/12/12 gap 8 | ✓ |
| Redeem `provider-burn` / OTP `provider-burn-otp` | `S/NoonProviderBurn(Otp)OverlayScreen`, `C/NoonCheckoutProvider/*` | main r20; header pad 12, title 14/600 white, CTA `#E9E8FC` r16; FormTitle gap 16 (40 loyalty) pad 24, 18 bold; form mH 20; input 48h r12 border `#DFDFDF` (gray400); error deepRedColor 12 mV15; amount error ring `#FCA5A5`; OTP box border gray400 / deepRed; OtpLoading `#3d3d3d` | `--nk-color-chk-provider-header-cta-bg`, `--nk-palette-gray400`, `--nk-palette-deep-red-color`, `--nk-color-chk-amount-error-ring`, `--nk-color-chk-otp-loader`; paste icon now the **real** `quara-paste.svg` (`rewards-paste.svg`, md5-identical): **fixed** (inline copy → asset) |
| Earn `earn` / `provider-earn` / `provider-earn-help` | `S/NoonCheckoutEarnOverlayScreen`, `S/NoonProviderEarn(Help)OverlayScreen` | header T24 B12 H16, title 16/700; content gap 32; providers pad 8/12 gap 8; terms 12 secondaryText; help terms pad 16 gap 16 mb 24; buttons gap 20 pad 12; T&C = **NoonButton dotted** 12/500 | **fixed**: T&C link was a CSS dotted underline → `<Button variant="noonDotted">` |
| Installation `installation` | `S/NoonCheckoutInstallationOverlayScreen/styles.ts` | overlay **antiFlashWhite**; container H12 T16 B32; title 16 bold blueGray1000; item pad 8 r12 colGap 10, image 34×44 r8 overlay black .03, name 12 lh18 slateGray; card mt 10 padV 12 r12; day 36w minH 44 r8, weekday/number 12/600 slateGray → selected bold blueGray900; slot pad 10/12 r8 border lightGreyColor; label 12/500; schedule mt 16 minH 52; reloading white .8; error 14/500 blueGray900, retry 14/500 accentBlue | **fixed**: bg was #F3F4F8; rest ✓ |
| Track steps `track-steps` | `S/NoonOrderConfirmationTrackStepsScreen` | pad T32 H16; title 19 bold mb 16; button accentColor pad 17 r8, 14 bold white | `--nk-type-text19-bold-lh24`, `--nk-color-cta`: ✓ |

---

## 3. Post-order

| Screen | Master | Notable values → tokens | Status |
|---|---|---|---|
| Placing `placing` | `C/NoonPostOrderLoader/styles.ts` | white container, paddingBottom 32; status header 20 bold black; text container bottom 35% paddingH 24; tick text bottom 37% paddingH 14; overlay white .5 | `--nk-type-title`, `--nk-palette-black`, `--nk-space-s24/s14/s32`: ✓ |
| Payment failed `payment-failure` | `S/NoonCheckoutPaymentFailureScreen/styles.ts` | scroll pad H32 B32; img 300×200; title 18/700 #000 mt15 mb7; message pad H7 V15 mt15 r12, error `#FFF2F2`, info `#F5F5F5`; text 14 #000 (info lh21); CTA container pt15 H32; need help 13 + **NoonButton dotted** newAccentColor 13 | `--nk-color-chk-failure-error-bg`, `--nk-palette-border-primary`, `--nk-palette-black`; need-help → `<Button variant="noonDotted" dottedColor=link>`: **fixed** (was a radial-gradient dot approximation) |
| Need help `payment-failure-help` | `S/NoonCheckoutPaymentFailureNeedHelpOverlayScreen` | pad T15 H24, bottom safe+28; title 24 bold lh33; description 16 lh22 mt8; contact title 18 bold; value 16/700 `#919191`, gap 6 | `--nk-type-chk-text24-bold-lh33`, `--nk-color-chk-help-value`: ✓ |
| Confirmation `confirmation` | `S/NoonOrderConfirmationV3Screen`, `C/NoonShipmentV2`, `C/NoonOrderConfirmationAddress`, `C/NoonNotificationsBanner` | bg antiFlashWhite; header pad statusBar/16/12, back + help pills `rgba(14,14,14,.45)` r100 pad 8 (help 8/10, gap 4), title 20/700 white; sticky CTA pad 15 + border-top antiFlashWhite, black r12 pad 14/24, 16 semibold white capitalize; ShipmentV2 h185 r18 border `#2F8E6D`, header 50h `#2F8E6D` pad H12 T7 justify flex-start (kit: the `<button>` is a flex column, else it centres the title under the body card), 18 bold white, body top 36 r16 white, content `#F6F7FA` r12 pad 10 gap 10 minH 115, promise b 17/700 #101628 lh24 + steel 13 #666D85, item 49.88×68 r8 shadow 0/0/4 .06, qty 10 gray800 on secondaryBackground r4, number 14 slateGray, separator 1×10 #D0D4DD | `--nk-palette-anti-flash-white`, `--nk-palette-primary-alpha45`, `--nk-color-chk-shipment-v2-green`, `--nk-color-chk-shipment-v2-content-bg`, `--nk-type-chk-text17-bold-lh24`, `--nk-type-chk-text10-regular-lh12`, `--nk-palette-black-alpha6`: ✓ (tokenised) |

---

## 4. Copy keys (`noon-en.json`)

- **Main:** `noon_checkout_header`, `noon_checkout_shipment_number`, `item` (plural), `noon_checkout_installation_callout`,
  `noon_checkout_not_returnable`, `noon_checkout_enter_cvv_cta`, `noon_checkout_select_payment_method_cta`,
  `noon_checkout_slide_to_order`, `noon_place_order_button`, `noon_credits`, `noon_free`, `noon_other_label`,
  `noon_take_action`, `noon_address_v2_changed_default_address_toast_message`.
- **Payment:** `noon_checkout_use_noon_credits`, `noon_checkout_credits_sufficient`, `noon_insufficient_noon_credit`,
  `noon_checkout_add_or_change_card`, `noon_checkout_add_new`, `noon_checkout_add_new_card`, `noon_checkout_select_card`,
  `noon_checkout_card_added_successfully`, `noon_selected_plan`, `noon_emi_for`, `noon_emi_installments`,
  `noon_emi_selected_plan_message`, `noon_installment_plans_available`, `noon_pay_in_full`, `noon_interest`, `noon_comma`,
  `noon_confirm`, `noon_cvv`, `noon_cvv_placeholder`, `noon_add_card`, `noon_card_placeholder`, `noon_enter_card_number`,
  `noon_expiry`, `noon_expiry_date_placeholder`, `noon_card_title_placeholder`, `noon_card_title_hint_text`,
  `noon_enter_card_title`, `noon_remember_payment_card_title`, `noon_remember_payment_card_description`, `noon_one_mashreq`.
- **Delivery / receiver:** `noon_checkout_delivery_instructions`, `noon_checkout_receiver_details`,
  `noon_checkout_change_receiver`, `noon_checkout_alternate_receiver_{add,done,previous_contact,primary_tag}`, `noon_name`,
  `noon_or`, `noon_got_it`.
- **Rewards:** `noon_checkout_change_card`, `noon_checkout_add_card`, `noon_checkout_discount_applied`,
  `noon_provider_financing_options`, `noon_provider_amount_input_label`, `noon_provider_amount_out_of_range`,
  `noon_provider_remove_points`, `noon_enter_voucher_code`, `noon_voucher_code`, `noon_otp_form_resend_code`,
  `noon_how_it_works`, `noon_primary_phone_number`, `noon_select_country_code`, `noon_checkout_installation_{error,
  schedule_cta,select_slot,updated_toast_message}`, `noon_retry`, `noon_common_something_went_wrong`, `noon_terms_and_conditions`.
- **Post-order:** `noon_order_processing_msg_1`, `noon_order_processing_card_wallet_msg_{2,3}`,
  `noon_order_processing_bnpl_msg_{2,3}`, `noon_order_confirmation_title`, `noon_shipment_nr`, `noon_how_to_track_update_order`,
  `noon_payment_failure_title`, `noon_payment_failure_need_help_{text,button,title,description,order_id}`, `noon_common_email`,
  `noon_gm_c_copied_clipboard`.

## 5. Assets (`src/assets/checkout/`)

All raster / vector icons are git copies from master (`M/theme/assets/icons/*@3x` or `.svg`). Added or newly wired in
this pass:

| Asset | Master source | Use |
|---|---|---|
| `rewards-chevron-blue-gray.webp` | `M/theme/assets/icons/chevron-blue-gray@3x.webp` (md5 match) | `ChevronDot` (burn voucher callout, provider callouts, earn), replacing a hand-drawn SVG |
| `rewards-paste.svg` | `M/theme/assets/icons/quara-paste.svg` (md5 match) | voucher paste button, replacing an inline copy |

Already in place and verified: `chevron-thick.svg` (= `icons/chevron-thick.svg`), `rewards-edit.svg` (= `icons/edit.svg`),
`arrow-to-checkmark-animation-en.json` (slide lottie), payment method / card brand art, delivery icons, post-order art.

## 6. Server-driven fields (demo values)

Colours are kept as data in `tokens.ts → checkoutServerColors` (master passes them straight from the API):

- `paymentMethodsV2[].tag.colors` (New `#7A3BFF→#3866DF`, Pay later `#3BFFC1→#14B87F`), `upsellingCards[].background.colors`
  (DEFAULT_UPSELLING_GRADIENT `#FFFFFF→#F5F5F5`).
- `burn.*.providers[].details.genericThemeColor` / page backgrounds / submit buttons (SHARE `#7B2CBF`, Skywards
  `#B08D57` / `#1D1D1B`, YOUGotaGift `#E5195E`, Flex `#0F61FF`, Gift+ `#13645F`), `earn.providers[]` same.
- `delivery_options[].note.backgroundHexa`, receiver note (`#FFF7ED`, `#EFF3FD`).
- Confirmation `notificationsBanner` (`#E8F1FF`, CTA `#0E0E0E` / white), `smartAssistConfig` (help pill).
- Invoice copy: `<h4><b>Order Summary</b></h4>`, `<h4><b>Total</b></h4> <steel>(Incl. VAT)</steel>` and
  `<h4><b>amount</b></h4>`. The section title / total markup is server HTML; the kit now renders it through master's
  stylesheets (h4 = 18, `<b>` = bold) instead of forcing 700 in the stylesheet.
- Shipments, promises (`message` / `price` HTML), EMI plans, coupon state, provider balances: see `data*.ts`.

## 7. Live variant / flag decisions

- `session.version ≥ 3` → detached address section + `headerDetachedAddress` header (no address selector in the header).
- `useSliderCta` = true, `isCvvRequired` = true (slider; "Enter CVV" until valid).
- `shouldCollapseShipmentSelections` = true (main callout toggles the lanes).
- `FeatureFlags.isCouponsOnCheckoutEnabled` = true → `coupon_status` section (no inline coupon message under the invoice).
- `payment_v3` off → `NoonCheckoutAddPaymentCardScreen` for Add card.
- `integrated_noonone` present (non-members), sticky noon One nudge not shown (no `stickyHeader` in the demo session).
- Post-order: `NoonPostOrderLoader` → `NoonOrderConfirmationV3Screen` (live). The CMS hero carousel is not ported.
- `receiver_phone_code` version 2 receiver details.

## 8. Literal exceptions (geometry only)

No colour or font-shorthand literal remains outside `tokens.ts` (`npm run lint:tokens -- -v src/flows/checkout` → 0).
These numeric values are master geometry with no scale token, so they stay as px:

- Spacing off-scale: 1, 3, 5 (alternate-phone marginH 5 / phoneErrorText mt 5 / list desc mt 5), 7 (shipment count pill
  paddingH 7, failure message paddingH 7 / title mb 7, voucher callout paddingV 7, ShipmentV2 header pt 7), 9 (shipment
  gap 9), 11 (radio mr 11), 13 (selected EMI paddingH 13), 17 (track steps button padding 17), 25 / 28 / 30 (learn-more
  list spacing, need-help bottom 28), 65 (provider phone input paddingStart 65).
- Radius off-scale: 5 (toast r5), 9 (slide thumb r9), 15 / 18 (noon One, ShipmentV2 r18), 36 (count pill r36), 40 (how
  it works pill), 100 (confirmation pills).
- Sizes: icon / image boxes (e.g. 64×88, 49.88×68, 60×38, 38×24, 20×20), heights (48, 45, 34, 185 …), `min-height`,
  positional offsets (`top: -2`, `bottom: 35%` …), the slope SVG ratio, `width: 171px` (= (390−48)/2).

## 9. Shared follow-ups (outside `src/flows/checkout`)

1. **`src/components/Button` — `noonDotted`:** the line is `<svg width="100%">`, so in a shrink-to-fit context (flex
   item, `align-self: center`) the button takes the SVG's 300px intrinsic width. Checkout works around it locally
   (`.x > span > svg { position: absolute; … }`). Suggested fix: make `.noonDottedLine` `position: absolute; left: 0;
   bottom: 0; width: 100%` and give `.noonDottedInner` `position: relative; padding-bottom: calc(gap + 1px)`.
2. **`src/foundations/palette.ts`:** auto-named entries that are real master colours should get master names (checkout
   aliases them for now): `kitBlue43` #3454A8, `kitBlue66` #7394DE, `kitBlue91` #DAE3F6 (slide button), `kitGray79`
   #C7C7CD, `kitGray97v3` #F5F6F9, `kitYellow91v2` #FFFCCF, `kitSky80` #B3CCE6, `kitRed82` #FCA5A5, `kitBlue95v3` #E9E8FC,
   `kitRed97` #FFF2F2, `kitGray57` #919191, `kitTeal37` #2F8E6D, `kitGray97v4` #F6F7FA, `kitGray24` #3D3D3D.
3. **Missing palette entries:** `errorMessageColor` #FB0B0B, `darkGreenOcean` #359761, `yellowGold` #FFC532,
   `ottomanGreen` #E5FAEC (currently flow tokens).
4. **`scripts/token-map.json`:** `#000000` resolves to `catalogTagGradientEnd`; it should prefer `black`.
5. **`src/components/HtmlText`:** stylesheet mode has no HtmlView base tag sizes (`h4` 18, `h5` 16, `small` 12 …); flows
   re-declare them per sheet. Consider merging the base tag map under `stylesheet` too.
6. **Type tokens worth promoting** if other flows need them: `chkText17BoldLh24`, `chkText18SemiboldLh24`,
   `chkText24BoldLh33`, `chkText10RegularLh12`, `chkText8RegularLh10`.
7. **`Skeleton`:** a `shimmer` prop (base / highlight colours) would remove checkout's custom gradient on provider callouts.

## 10. Remaining approximations

- **Provider logos** (SHARE, Skywards, YOUGotaGift, Flex, Gift+): CDN images from the providers API. The repo has no URLs
  for them, so `ProviderLogo` draws wordmarks in the brand colours (`checkoutServerColors`).
- **Product images** use the kit's `ProductImage` mocks.
- **Line heights:** RN text without `lineHeight` uses the font's natural height. The kit uses explicit line heights from the
  central type scale (closest value), or only size + weight where adding a line height would shift layout (HTML sheets).
- **Apple Pay** button: native `PKPaymentButton`, drawn in CSS (black, SF label).
- **Confirmation hero** CMS carousel (light status bar) not ported; the screen starts on antiFlashWhite with a dark status bar.
- `RewardsPrimitives.RichText` is kept next to the shared `HtmlText`: it renders tags as React nodes, which the provider
  forms rely on. Visually equivalent; swapping it is not 1:1 in behaviour.

## 11. Verification

- Screenshots: `…/scratchpad/checkout-ui/{before,after}/` (main screen at scroll 0/600/1200/1800/2400/3200, every sheet,
  placing at 0.2s / 2.5s, confirmation at 0/700/1400/2100, failure with CTA). Diffs only where listed above as fixed
  (cards-select border, EMI / installation bg, dotted links, tag easing).
- Click-through: Cart → (noon One intercept: Continue to checkout) → Checkout → CVV 123 → slide → placing → confirmation;
  failure path: Add/Change → Add New → 4000 0000 0000 0002, 12/29, 123 → Add Card → slide → payment failed. No console errors.
- `npx tsc -p tsconfig.json` and `tsconfig.lib.json` clean; `node scripts/check-routes.mjs` 133/133 clean (checkout 21/21);
  `lint:tokens` checkout 0 outside `tokens.ts` (was 393: 223 hex, 23 rgba, 147 font shorthands).
- Remaining pixel diffs vs the baseline are the intended fixes plus Lottie / typing animation frame timing (placing,
  noon One CTA reveal, failure message typewriter).
