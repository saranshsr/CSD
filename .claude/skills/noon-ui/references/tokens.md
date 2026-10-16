# Tokens reference

Sources: `src/foundations/tokens.ts` (semantic + component tokens), `src/foundations/palette.ts` (raw colours), `src/foundations/ThemeProvider.tsx` (CSS var generation, `TokenScope`), `src/foundations/global.css` (fonts, base styles), `scripts/token-lint.mjs`, `scripts/token-map.json`, `src/flows/*/tokens.ts`.

## 1. Token model

```
palette.ts (raw, bappzaar names)   palette.accentColor = '#3866DF'
  -> tokens.ts semantic            colors.cta = palette.accentColor
    -> tokens.ts component         button.primaryBg = ref.color('cta')  ->  'var(--nk-color-cta)'
      -> flow tokens.ts            cartFlowTokens.colors.cartEmerald = '#13645F'  (flow-scoped, or override bgPage etc.)
```

- **Palette** (`palette`, ~470 entries): every colour literal the kit uses, named after bappzaar `colorStatic` / `NoonTokens.colors` / `NoonColors`. Use only for exact one-off brand colours.
- **Semantic** (`colors`, `spacing`, `radius`, `fontSize`, `fontFamily`, `fontWeight`, `type`, `shadow`, `layout`): what screens and components use.
- **Component** (`button`, `iconButton`, `badge`, `pill`, `stepper`, `searchBar`, `tabBar`, `quickAdd`, `needHelp`, `sheet`, `snackbar`, `eta`): every visual value of a shared component. Colour/type/radius values are `var(--nk-…)` references (via `ref.*`), so overriding a semantic colour re-colours every component that uses it.
- **Flow tokens**: `src/flows/<id>/tokens.ts` exports a `TokenOverrides` object passed to `defineFlow({ tokens })`; it can override central keys and add flow-prefixed keys.

### CSS variable naming (`tokensToCssVars`)

Name = `--nk-<prefix>-<kebab(key)>`; `kebab` inserts `-` only between a lowercase letter/digit and an uppercase letter: `textPrimary` → `text-primary`, `blackAlpha8` → `black-alpha8`, `emeraldGreen700` → `emerald-green700`, `text16SemiboldLh20` → `text16-semibold-lh20`.

| Group | Prefix | Example | Value format |
|---|---|---|---|
| `colors` | `color` | `--nk-color-text-primary` | as is |
| `palette` | `palette` | `--nk-palette-black-alpha8` | as is |
| `spacing` | `space` | `--nk-space-s16` | number → `px` |
| `radius` | `radius` | `--nk-radius-r12`, `--nk-radius-full` | number → `px` |
| `fontSize` | `font-size` | `--nk-font-size-body` | `px` |
| `fontWeight` | `font-weight` | `--nk-font-weight-semibold` | unitless string |
| `fontFamily` | `font` | `--nk-font-primary`, `--nk-font-rtl` | string |
| (derived) | — | `--nk-font-family` | `fontFamily.primary`, or `.rtl` when `rtl` |
| `type` | `type` | `--nk-type-title-small` | font shorthand `700 18px/24px var(--nk-font-family)`; string `line` (`'1'`, `'1.35'`, `'normal'`) is emitted unitless |
| `shadow` | `shadow` | `--nk-shadow-card` | as is |
| `layout` | `layout` | `--nk-layout-tab-bar` | `px` |
| component groups | `kebab(group)` | `--nk-button-primary-bg`, `--nk-icon-button-size`, `--nk-search-bar-height`, `--nk-tab-bar-fg-active`, `--nk-quick-add-size` | `px` / as is |

Number rule (all groups): numbers → `px`, except keys ending in `Scale` or `Opacity` (unitless) and `Duration` (`ms`). A flow key like `delayMs: 1000` inside a `TokenOverrides` would become `1000px`; keep timings in the flow's plain TS object instead.

Not from `tokens.ts`: `--nk-inset-top` (= `layout.statusBar`, 54px) and `--nk-inset-bottom` (= `layout.homeIndicator`, 34px) are set by `PhoneFrame` on the viewport. `<Screen>`, `<Header>`, `<TabBar>` and the Navigator already pad with them; use them only for custom absolutely-positioned chrome, e.g. `bottom: calc(var(--nk-inset-bottom) + 72px)`.

### Using tokens

CSS modules (preferred for layout and styling):

```css
.card { background: var(--nk-color-bg-surface); border: 1px solid var(--nk-color-border); border-radius: var(--nk-radius-r12);
        padding: var(--nk-space-s12) var(--nk-space-s16); box-shadow: var(--nk-shadow-card); }
.title { font: var(--nk-type-title-small); color: var(--nk-color-text-strong); }
.flowOnly { color: var(--nk-color-cart-emerald); font: var(--nk-type-cart-text10-bold-lh12); }
```

TSX:

```tsx
import { ref, spacing, layout } from '../../foundations/tokens'; // package: '@noon/flow-kit' or '@noon/flow-kit/tokens'
<Text variant="titleSmall" color="textStrong">Title</Text>            // font: var(--nk-type-title-small); color: var(--nk-color-text-strong)
<div style={{ background: ref.color('bgPage'), padding: ref.space('s16'), borderRadius: ref.radius('r12') }} />
const w = layout.deviceWidth / 2.5;                                     // raw numbers when doing maths
```

- `ref.color | palette | space | radius | type | fontSize | fontWeight | shadow | layout(key)` return `var(--nk-…)` strings, typed to central keys (typos fail `tsc`). Prefer `ref` over raw `colors.x` values in styles so flow/brand overrides apply.
- Raw objects (`tokens`, `colors`, `spacing`, `layout`, `palette`, ...) give literal values; use for arithmetic (widths, motion), not for colours in styles.
- `<Text>`: `variant` is typed to central `type` keys only (default `body`); `color` accepts any camelCase colour key, including flow keys (`color="cartEmerald"` → `var(--nk-color-cart-emerald)`), or a raw CSS value (default `textPrimary`). Flow `type` tokens are used from CSS (`font: var(--nk-type-<flow>-…)`), not via `variant`.
- Some flows ship typed helpers for their own keys, e.g. `mb.color('mbYellowDark')` in `src/flows/membership/tokens.ts`.
- Package exports: `tokens, colors, spacing, radius, fontSize, fontFamily, fontWeight, type, shadow, layout, ref, kebab, TokenOverrides`, `palette`, component groups as `buttonTokens, iconButtonTokens, badgeTokens, pillTokens, stepperTokens, searchBarTokens, tabBarTokens, quickAddTokens, needHelpTokens, sheetTokens, snackbarTokens, etaTokens`, and `NoonThemeProvider, TokenScope, tokensToCssVars`.

## 2. Tables

### Semantic colours (`colors` → `--nk-color-*`)

| Token | CSS var | Value | Palette | Use |
|---|---|---|---|---|
| `brand` | `--nk-color-brand` | `#FEEE00` | `yellowColor` | noon yellow |
| `brandInk` | `--nk-color-brand-ink` | `#0E0E0E` | `neutralBlack` | text/icons on yellow |
| `textPrimary` | `--nk-color-text-primary` | `#1D2539` | `blueGray900` | default text; titles, names, menu rows |
| `textStrong` | `--nk-color-text-strong` | `#101628` | `charcoalNavy` | product titles, headings |
| `textBody` | `--nk-color-text-body` | `#343D54` | `gray800` | address, inputs |
| `textSecondary` | `--nk-color-text-secondary` | `#666D85` | `slateGray` | meta, captions |
| `textTertiary` | `--nk-color-text-tertiary` | `#989FB3` | `bluishGrey` | legal, counts |
| `textMuted` | `--nk-color-text-muted` | `#475067` | `slateBlueGray` | muted labels, pill text |
| `textLegacy` | `--nk-color-text-legacy` | `#404553` | `charcoalGreyColor` | older noon screens |
| `textInverse` | `--nk-color-text-inverse` | `#FFFFFF` | `white` | text on dark/blue fills |
| `textDisabled` | `--nk-color-text-disabled` | `#0E0E0E3D` | `disabledTextColor` | disabled text |
| `bgPage` | `--nk-color-bg-page` | `#F2F3F7` | `antiFlashWhite` | grey page behind cards (flows often override) |
| `bgSurface` | `--nk-color-bg-surface` | `#FFFFFF` | `white` | cards, sheets |
| `bgSubtle` | `--nk-color-bg-subtle` | `#F9F9FB` | `secondaryBackgroundColor` | pills, icon buttons |
| `bgMuted` | `--nk-color-bg-muted` | `#F3F4F8` | `ghostWhiteColor` | chips, image placeholders |
| `bgInverse` | `--nk-color-bg-inverse` | `#0E0E0E` | `neutralBlack` | dark CTA, toasts |
| `bgInfo` | `--nk-color-bg-info` | `#EBF4FF` | `borderGray` | soft blue ATC button |
| `bgChip` | `--nk-color-bg-chip` | `#F1F7FD` | `lightBabyBlue` | light blue chip |
| `bgDisabled` | `--nk-color-bg-disabled` | `#0E0E0E0A` | `disabledBackgroundColor` | NoonButton disabled fill |
| `border` | `--nk-color-border` | `#EAECF0` | `lightGreyColor` | default 1px border/divider |
| `borderSubtle` | `--nk-color-border-subtle` | `#F2F3F7` | `antiFlashWhite` | dashed separators |
| `borderInput` | `--nk-color-border-input` | `#D7DAE3` | `kitSlate87` | inputs, search bar |
| `borderStrong` | `--nk-color-border-strong` | `#D0D4DD` | `lightGrey` | stronger dividers |
| `borderInfo` | `--nk-color-border-info` | `#BDDBFF` | `paleAzure` | soft blue stepper border |
| `primary` | `--nk-color-primary` | `#0F61FF` | `primaryBlue` | links, text buttons, ATC text |
| `primaryBright` | `--nk-color-primary-bright` | `#0F7EFF` | `azureBlue` | filled blue pills (Create, View cart) |
| `link` | `--nk-color-link` | `#0076FF` | `newAccentColor` | carousel highlights; NoonButton primary fill |
| `tabActive` | `--nk-color-tab-active` | `#1155CB` | `sapphire` | tab bar active |
| `tabInactive` | `--nk-color-tab-inactive` | `#404553` | `charcoalGreyColor` | tab bar inactive |
| `badge` | `--nk-color-badge` | `#3866DF` | `accentColor` | count badges |
| `success` | `--nk-color-success` | `#0F8857` | `deepGreen` | success text |
| `successSurface` | `--nk-color-success-surface` | `#E3FCF2` | `noonSuccessSubtle` | success banner bg |
| `successStrong` | `--nk-color-success-strong` | `#38AE04` | `noonSystemGreen` | system green |
| `danger` | `--nk-color-danger` | `#DE1C1C` | `errorRed` | errors, destructive CTA |
| `dangerSurface` | `--nk-color-danger-surface` | `#FFF0F0` | `noonErrorSubtle` | error banner bg |
| `warning` | `--nk-color-warning` | `#FF9741` | `absoluteApricot` | warning |
| `warningSurface` | `--nk-color-warning-surface` | `#FFF1E0` | `warningSurface` | warning bg |
| `discount` | `--nk-color-discount` | `#0F8857` | `deepGreen` | "% off" text |
| `rating` | `--nk-color-rating` | `#0F8857` | `deepGreen` | rating |
| `cta` | `--nk-color-cta` | `#3866DF` | `accentColor` | Add to cart, quick-ATC, Buy now outline |
| `ctaNavy` | `--nk-color-cta-navy` | `#162D68` | `buyNowNavy` | navy CTA |
| `brandBlue` | `--nk-color-brand-blue` | `#0057FF` | `accentBlue` | store name, size guide, filter selected, Checkout CTA |
| `textInk` | `--nk-color-text-ink` | `#0E0E0E` | `neutralBlack` | sale price, icons |
| `textProduct` | `--nk-color-text-product` | `#212121` | `inkBlack` | PLP card title |
| `priceOld` | `--nk-color-price-old` | `#7E859B` | `noonGrey1` | struck-through price |
| `discountBright` | `--nk-color-discount-bright` | `#05AF25` | `greenOff` | "% OFF" |
| `bestPriceInk` | `--nk-color-best-price-ink` | `#108757` | `grass700` | best price tag |
| `bestSellerTag` | `--nk-color-best-seller-tag` | `#0A4F4A` | `darkGreenTeal` | best seller tag |
| `skuDiscount` | `--nk-color-sku-discount` | `#008200` | `homeGreen800` | SKU card "% off" (Figma Green/800) |
| `skuRatingBg` | `--nk-color-sku-rating-bg` | `#F2F8F8` | `mintWhite97` | SKU card flat rating pill |
| `skuMediaTint` | `--nk-color-sku-media-tint` | `rgba(7, 47, 143, 0.04)` | `cobaltAlpha4` | SKU card image box tint |
| `couponBorder` | `--nk-color-coupon-border` | `#BBE0DE` | `softTeal` | coupon border |
| `couponSurface` | `--nk-color-coupon-surface` | `#E9FBF9` | `mintWhite` | coupon bg |
| `bgPdp` | `--nk-color-bg-pdp` | `#F9F9FB` | `secondaryBackgroundColor` | PDP page bg |
| `bgPill` | `--nk-color-bg-pill` | `#F7F8FA` | `softGray` | rating / highlight pills |
| `bgStoreStrip` | `--nk-color-bg-store-strip` | `#E8F1FF` | `lightBlueInfoBg` | store strip |
| `pillBorder` | `--nk-color-pill-border` | `#E7E7E7` | `kitGray91v2` | pill border |
| `pillSelectedBorder` | `--nk-color-pill-selected-border` | `#D6E9FF` | `paleBlue` | selected nav pill border |
| `starLow` / `starMid` / `starGood` / `starGreat` | `--nk-color-star-*` | `#F36302` / `#F8B200` / `#05AF25` / `#006300` | `pumpkinOrange` / `kitAmber49` / `greenOff` / `darkGreen` | rating star by score |
| `inCart` | `--nk-color-in-cart` | `rgba(45, 175, 50, 0.9)` | `greenColorAlpha90` | in-cart state |
| `noonOneSurface` | `--nk-color-noon-one-surface` | `#FFF3C0` | `paleYellowLegacy` | noon One surfaces |
| `noonOneInk` | `--nk-color-noon-one-ink` | `#794000` | `cocoaBrown` | noon One text |
| `scrim` | `--nk-color-scrim` | `rgba(14, 14, 14, 0.5)` | `primaryAlpha50` | sheet/modal backdrop |
| `scrimBold` | `--nk-color-scrim-bold` | `rgba(0, 0, 0, 0.8)` | `blackAlpha80` | Origin surface/overlay-bold — default bottom sheet scrim |
| `imageOverlay` | `--nk-color-image-overlay` | `rgba(0, 0, 0, 0.02)` | `blackAlpha2` | tint over product images |

Same value, different meaning: `#0E0E0E` = `brandInk` / `bgInverse` / `textInk`; `#3866DF` = `cta` / `badge`; `#F2F3F7` = `bgPage` / `borderSubtle`; `#FFFFFF` = `textInverse` / `bgSurface`; `#0F8857` = `success` / `discount` / `rating`; `#F9F9FB` = `bgSubtle` / `bgPdp`; `#404553` = `textLegacy` / `tabInactive`. Pick by meaning.

### Palette (`palette` → `--nk-palette-*`), summary

| Group | Key values |
|---|---|
| Brand yellow | `yellowColor #FEEE00`, `brandAdsYellowHeader #FEEF00`, `paleYellow #FFFBBC`, `paleYellowLegacy #FFF3C0`, `yellow200 #FDF69B`, `kitYellow*` |
| Blues | `primaryBlue #0F61FF`, `azureBlue #0F7EFF`, `newAccentColor #0076FF`, `accentBlue #0057FF` (= `newAccentDarkColor`), `accentColor #3866DF`, `newBlue #3466EA`, `sapphire #1155CB`, `blue900 #0937A5`, `buyNowNavy #162D68`, `rocketBlueSapphire #2122B8`, `persianBlue #2F33C0`, light: `borderGray #EBF4FF`, `aliceBlue #EFF7FF`, `lightBabyBlue #F1F7FD`, `paleBlue #D6E9FF`, `paleAzure #BDDBFF`, `lightBlueInfoBg #E8F1FF`, `filterSelectedBackground #F0F7FF` |
| Blue-greys / ink | `neutralBlack #0E0E0E` (= `newTextPrimary`), `charcoalNavy #101628` (= `blueGray1000`), `blueGray900 #1D2539`, `gray800 #343D54`, `blueGray700 #475067` (= `slateBlueGray`), `slateGray #666D85`, `noonGrey1 #7E859B`, `bluishGrey #989FB3`, `noonGrey2 #9ba0b1`, `noonGrey3 #DADCE3`, `lightGrey #D0D4DD`, `kitSlate87 #D7DAE3`, `lightGreyColor #EAECF0`, `antiFlashWhite #F2F3F7` (= `blueGray200`), `ghostWhiteColor #F3F4F8`, `secondaryBackgroundColor #F9F9FB`, `blueGray50 #FCFCFD` |
| Neutral greys | `black #000000`, `inkBlack #212121`, `darkGray #3C3C3C`, `charcoalGreyColor #404553` (= `paleBlack`, `noonBlack`), `secondaryTextColor #5D5D5D`, `ashGray #757575`, `gray400 #DFDFDF`, `brightGreyColor #EBEBEB`, `whiteSmoke #F2F2F2`, `lightGrayColor #F5F5F5` (= `borderPrimary`), `white #FFFFFF`, `kitGray*` |
| Greens | `deepGreen #0F8857`, `grass700 #108757`, `greenOff #05AF25`, `noonSystemGreen #38AE04`, `greenColor #2DAF32`, `darkGreen #006300`, `baseGreen800 #0B623F`, `emeraldGreen #13645F`, `emeraldGreen700 #1F7A74`, `darkGreenTeal #0A4F4A`, `noonSuccessSubtle #E3FCF2`, `mintWhite #E9FBF9`, `softTeal #BBE0DE`, `green100 #CEF3DA`, `green200 #BEEFCC`, `emerald100 #D1FAE5` |
| Reds / pinks | `errorRed #DE1C1C`, `dangerRed #D92626`, `red #FF0000`, `redColor #FA0000`, `deepRedColor #F43333`, `red600 #F04242`, `red800 #B81414`, `darkRed #B22424`, `watermelonPink #FF4869`, `pink600 #F7306F`, `noonErrorSubtle #FFF0F0`, `red100 #FEEBEB`, `red200 #FED2D2` |
| Oranges / ambers | `absoluteApricot #FF9741`, `pumpkinOrange #F36302`, `sunsetOrange #E5641A`, `tangerine #F8913E`, `orangeColor #F5AF39`, `noonOfferATCSystemOrange #F3AC30`, `warningAmber #CC8500`, `copperColor #B45309`, `cocoaBrown #794000`, `warningSurface #FFF1E0`, `warningBorder #FEDBB4`, `paleOrange #FED7AA` |
| Purples (AI / chatbot) | `purpleGradient #6E51FF`, `deepPurple #741B92`, `chatbotTitleIndigo #4447CF`, `chatbotTitleViolet #BD3DEA`, `gradientPurpleStart #9047E9`, `gradientPurpleEnd #E33FB9`, `purple100 #F9E9FE`, `purple200 #EFC9FB` |
| Disabled | `disabledBackgroundColor #0E0E0E0A`, `disabledTextColor #0E0E0E3D`, `disabledSurface #D2D2D6` |
| Alpha series | `blackAlpha{0..90}` (`blackAlpha8` = `rgba(0, 0, 0, 0.08)`, `blackAlpha9p8` = 0.098), `whiteAlpha{0..95}`, `primaryAlpha{4,6,24,25,45,50}` (`rgba(14, 14, 14, a)`), `charcoalNavyAlpha{8,12,16}`, `darkNavyAlpha{10,20,60,92}`, `slateGrayAlpha{0,10,12}`; 8-digit hex variants are `<base>Hex<byte>` (`blackHex19`, `whiteHex99`) |
| `kit*` | colours with no bappzaar name: `kit<Hue><HSL lightness %>` with `v2`, `v3` for same bucket (`kitBlue43 #3454A8`, `kitGray91v2 #E7E7E7`, `kitSlate87 #D7DAE3`) |
| Gradients stops | `bestPriceGradientStart/End`, `catalogTagGradientStart/End`, `titleGradientIndigo/Violet`, `chatbotSuggestedGradientStart/End` |

Name traps: `palette.textSecondary` is `#101628` and `palette.textTertiary` is `#8D8F92`, not the same as `colors.textSecondary` (`#666D85`) / `colors.textTertiary` (`#989FB3`). `palette.borderGray` is a blue (`#EBF4FF`), `palette.lavenderPink` is `#FCFCFD`. Always resolve by value through `scripts/token-map.json`.

### Spacing (`spacing` → `--nk-space-*`, px)

`s0 0` · `s2 2` · `s4 4` · `s6 6` · `s8 8` · `s10 10` · `s12 12` · `s14 14` · `s15 15` (bappzaar `edgeSpacing`) · `s16 16` · `s18 18` · `s20 20` · `s24 24` · `s32 32` · `s36 36` · `s40 40` · `s48 48` · `s56 56` · `s64 64` · `s72 72` · `s80 80` · `s88 88` (centred Header side slots)

Missing on purpose: 1, 3, 5, 7, 9, 11, 13, 22, 28, 30. Flows add them when the source uses them (e.g. pdp `pdpS1`, `pdpS3`, `pdpS5`).

### Radius (`radius` → `--nk-radius-*`, px)

`r0 0` · `r2 2` · `r4 4` · `r6 6` · `r8 8` · `r10 10` · `r12 12` · `r14 14` · `r16 16` · `r20 20` · `r24 24` · `r30 30` · `r32 32` · `r48 48` · `full 9999`

### Type scale (`type` → `--nk-type-*`, font shorthand; `<Text variant>`)

Named variants:

| Variant | Size / line | Weight | Note |
|---|---|---|---|
| `hero` | 28 / 34 | 700 | |
| `titleLarge` | 24 / 30 | 700 | |
| `title` | 20 / 26 | 700 | |
| `titleSmall` | 18 / 24 | 700 | |
| `heading` | 17 / 22 | 700 | profile name, toggle title |
| `section` | 16 / 22 | 700 | module titles |
| `bodyLarge` | 16 / 22 | 400 | |
| `bodyMedium` | 15 / 20 | 500 | menu rows |
| `body` | 14 / 18 | 400 | default `<Text>` |
| `bodyBold` | 14 / 18 | 700 | |
| `bodySemibold` | 14 / 18 | 600 | |
| `productTitle` | 14 / 18 | 500 | |
| `caption` | 12 / 16 | 400 | |
| `captionBold` | 12 / 16 | 600 | |
| `micro` | 11 / 14 | 500 | |
| `tab` | 14 / 17 | 600 | tab bar label |

Combo variants, named `text<size><Weight>Lh<line>` (`Lh1` = unitless 1, `Lh1p35` = 1.35):

| Size | Variants |
|---|---|
| 10 | `text10MediumLh12`, `text10SemiboldLh12`, `text10RegularLh11` (SKU "Ad" tag) |
| 11 | `text11RegularLh14`, `text11SemiboldLh14`, `text11BoldLh18` |
| 12 | `text12RegularLh1`, `text12RegularLh14`, `text12RegularLh18`, `text12MediumLh1`, `text12MediumLh14`, `text12MediumLh15`, `text12MediumLh16`, `text12MediumLh18`, `text12SemiboldLh1`, `text12SemiboldLh14`, `text12BoldLh1`, `text12BoldLh16`, `text12BoldLh18` |
| 13 | `text13RegularLh1p35`, `text13RegularLh16`, `text13RegularLh17`, `text13RegularLh18`, `text13RegularLh20`, `text13MediumLh16`, `text13MediumLh17`, `text13MediumLh18`, `text13SemiboldLh1`, `text13SemiboldLh16`, `text13SemiboldLh18` |
| 14 | `text14RegularLh1`, `text14RegularLh20`, `text14RegularLh22`, `text14MediumLh1`, `text14SemiboldLh1`, `text14SemiboldLh16`, `text14SemiboldLh20`, `text14BoldLh1`, `text14BoldLh20` |
| 15 | `text15MediumLh18`, `text15SemiboldLh19`, `text15SemiboldLh20` |
| 16 | `text16RegularLh20`, `text16RegularLh21`, `text16SemiboldLh18`, `text16SemiboldLh20`, `text16SemiboldLh22`, `text16BoldLh1`, `text16BoldLh20` |
| 17 | `text17MediumLh30`, `text17SemiboldLh20`, `text17SemiboldLh22` |
| 18–22 | `text18SemiboldLh22`, `text18BoldLh20`, `text18BoldLh22`, `text19BoldLh24`, `text20BoldLh24`, `text22BoldLh28` |

**Field Design System text styles** (`field<Style>` → `--nk-type-field-<style>`, @field-ds/tokens `text-styles.ts`): H (headings) `fieldH40Bold`, `fieldH40Extrabold`, `fieldH32Bold`, `fieldH32Extrabold`, `fieldH28Bold`, `fieldH24Bold`, `fieldH20Bold`, `fieldH18Bold`, `fieldH16Bold`; B (body) `fieldB16Regular`, `fieldB16Medium`, `fieldB16Semibold`, `fieldB16Bold`, `fieldB14Regular`, `fieldB14Medium`, `fieldB14Semibold`, `fieldB14Bold`, `fieldB13Regular`, `fieldB13Medium`, `fieldB13Semibold`, `fieldB13Bold`, `fieldB12Regular`, `fieldB12Medium`, `fieldB12Semibold`, `fieldB12Bold`, `fieldB11Regular`, `fieldB11Medium`, `fieldB11Semibold`, `fieldB11Bold`; A (actions / buttons) `fieldA17Semibold`, `fieldA16Semibold`, `fieldA16Bold`, `fieldA14Semibold`, `fieldA14Bold`, `fieldA12Semibold`, `fieldA12Bold`. Sizes / line heights: H40 40/48, H32 40, H28 36, H24 32, H20 28, H18 24, H16 20; B16 16/22, B14 and B13 /20, B12 /18, B11 /14; A17 17/24, A16 24, A14 20, A12 16. A font shorthand can't carry letter-spacing: add `letter-spacing: var(--nk-field-tracking-h | -h16 | -b16 | -b | -a17)` (−0.25 / −0.15 / −0.15 / −0.1 / −0.25).

**`field`** (`--nk-field-*`, TS `field.<key>`): the Field semantic colours by their Field name (`colour.<group>.<name>` → `<group><Name>`: `textPrimary` … `textPurple`, `surfacePrimary` … `surfaceOverlayBold`, `borderWhite` … `borderSuccessBold`), plus `tracking*` and `shadowSm`. Field greys are one step from the kit's: Field `textSecondary` #475067 = kit `textMuted`, `textTertiary` #666D85 = kit `textSecondary`, `textMuted` #989FB3 = kit `textTertiary`; map by hex, never by name ([`field-ds.md`](field-ds.md)).

Weights: Regular 400, Medium 500, Semibold 600, Bold 700. Lookup from a raw shorthand: `scripts/token-map.json` → `type["600 14px/18px"].token` = `bodySemibold`.

`fontSize` (`--nk-font-size-*`, px): `microSm 8`, `micro 9`, `label 10`, `caption 11`, `bodySmall 12`, `bodyCompact 13`, `body 14`, `bodyMedium 15`, `bodyLarge 16`, `bodyLead 17`, `titleSmall 18`, `titlePromo 19`, `title 20`, `titleMedium 22`, `titleLarge 24`, `headline 28`, `display 32`, `hero 40`. Note these names do not match the `type` names by size (`fontSize.caption` is 11, `type.caption` is 12; `fontSize.hero` is 40, `type.hero` is 28). Prefer `type`; use `fontSize` only to change size alone.

### Fonts

| Token | CSS var | Value |
|---|---|---|
| `fontFamily.primary` | `--nk-font-primary` | `'Noontree', 'Figtree', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif` |
| `fontFamily.rtl` | `--nk-font-rtl` | `'Cairo', 'Noontree', 'Figtree', sans-serif` |
| active family | `--nk-font-family` | primary, or rtl when `rtl` is set; every `--nk-type-*` uses it |
| `fontWeight` | `--nk-font-weight-*` | `regular 400`, `medium 500`, `semibold 600`, `bold 700`, `extrabold 800` |

- Noontree OTFs in `src/assets/fonts`: Regular (400), Medium (500), SemiBold (600), Bold (`font-weight: 700 900`, so 800 renders Bold). `@font-face` in `global.css`.
- Figtree and Cairo are not bundled; the dev app loads them from Google Fonts in `index.html` (Figtree 400–800, Cairo 400/600/700). A package consumer must load Cairo for RTL.
- Dirham sign: `currency` from `src/data` = `''` (private-use glyph drawn by Noontree; SAR is U+E000). Render prices as `{currency} {amount}` in a Noontree-styled element; never the text "AED".
- `.nk-root` base: `font-family: var(--nk-font-family)`, `color: var(--nk-color-text-primary)`, 14px, line-height 1.3, antialiased.

### Shadows (`shadow` → `--nk-shadow-*`)

| Token | Value | Use |
|---|---|---|
| `none` | `none` | |
| `card` | `0 1px 2px rgba(0, 0, 0, 0.04)` | NoonStyles.shadow(), cards |
| `raised` | `0 3px 6px rgba(128, 128, 128, 0.1)` | shadow2 |
| `lg` | `0 7px 16px rgba(0, 0, 0, 0.18)` | shadow3 (softened) |
| `tabBar` | `0 -1px 4px rgba(0, 0, 0, 0.08)` | tab bar |
| `thumb` | `0 1px 4px rgba(0, 0, 0, 0.06)` | quick-add, thumbs |
| `bottomBar` | `0 -2px 6px rgba(0, 0, 0, 0.08)` | sticky footer |
| `floating` | `0 -4px 32px` `palette.charcoalAlpha12` (`rgba(34, 34, 34, 0.12)`) | floating action pill (`NeedHelpButton`) |
| `sheet` | `0 -2px 16px rgba(0, 0, 0, 0.12)` | Origin M-BottomSheet |
| `snackbar` | `0 12px 14px rgba(11, 12, 14, 0.1)` (`palette.shadowOverlay`) | Origin M-Toast (`Snackbar`, as `filter: drop-shadow`) |

### Layout (`layout` → `--nk-layout-*`, px)

| Token | Value | Note |
|---|---|---|
| `deviceWidth` × `deviceHeight` | 390 × 844 | PhoneFrame viewport |
| `screenRadius` | 52 | squircle screen corner |
| `screenSmoothing` | 1 | corner smoothing (0–1); emitted as `1px` by the number rule, used from TS only |
| `statusBar` | 54 | also `--nk-inset-top` |
| `homeIndicator` | 34 | also `--nk-inset-bottom` |
| `tabBar` | 63 | bottom nav 2025 row (4 indicator + 8 gap + 51 item); `<Screen>` adds it to bottom padding on tab screens, sticky bars sit above it |
| `header` | 56 | `<Header>` height |

### Component tokens

Pattern: `--nk-<group-kebab>-<key-kebab>`.

**`button`** (`--nk-button-*`): `gap 6`, `borderWidth 1`, `pressScale 0.96` (from `motion/presets`).
Sizes: `sm` height 32 / paddingX 10 / `r8` / `captionBold` / icon 14; `md` 40 / 14 / `r10` / `bodyBold` / 16; `lg` 52 (min) / 24 / `r12` / `text16SemiboldLh20` / 18. `spinnerSize 18`, `spinnerDuration 700ms`.
Kit variants, each with `<v>Bg`, `<v>Fg`, `<v>Border` (+ `…Disabled` = `border` fill, `textDisabled` text, transparent border):

| Variant | Bg | Fg | Border | Used for |
|---|---|---|---|---|
| `primary` | `cta` | `textInverse` | transparent | Add to cart, View cart |
| `checkout` | `brandBlue` | `textInverse` | transparent | cart Checkout |
| `bright` | `primaryBright` | `textInverse` | transparent | Create pill, floating View cart |
| `dark` | `bgInverse` | `textInverse` | transparent | Login, Continue shopping |
| `outline` | `bgSurface` | `cta` | `cta` | Buy now |
| `secondary` | `bgSurface` | `textPrimary` | `border` | Cancel, Clear all |
| `soft` | `bgInfo` | `primary` | transparent | wishlist ATC, View options |
| `danger` | `danger` | `textInverse` | transparent | Yes, sign out |
| `ghost` | transparent | `primary` | transparent | text only |

NoonButton (`noon*`): `noonRadius r12`, `noonPaddingY 14`, `noonPaddingX s24`, `noonFont text16SemiboldLh20`, `noonBorderWidth 0`, `noonPressScale 0.98`, `noonPressOpacity 0.95`, `noonPressDuration 200ms`, `noonLoaderSize 24`; `noonBg link` / `noonFg textInverse` / disabled `bgDisabled` + `textDisabled`; `noonSecondary*` white + `link` text and 1px `link` border; `noonGhostFg link`, `noonGhostSecondaryFg textInk`; `noonDottedFg` / `noonDottedLine textInk`, `noonDottedLineGap 2`, `noonDottedDash '0.5, 3'`.

**`iconButton`** (`--nk-icon-button-*`): `size 40`, `iconSize 20`, `radius 50%`, `borderWidth 1`, `fg textInk`, `outlineBg bgSurface` + `outlineBorder border`, `glassBg palette.whiteAlpha90` + `glassBorder borderSubtle` + `glassBlur 8`, `subtleBg bgSubtle` + `subtleBorder border`, `plainBg transparent`, `badgeOffset -2`.

**`badge`** (`--nk-badge-*`): `size 18`, `paddingX 5`, `radius 9`, `bg badge`, `fg textInverse`, `font text11BoldLh18`, `ringWidth 1.5`, `ringColor bgSurface`.

**`pill`** (`--nk-pill-*`): shared `gap 6`, `iconSize 16`, `dropdownIconSize 14`, `removeIconSize 13`, `pressScale 0.94`, `transitionDuration 280ms`, `bg bgSurface`, `border border`, `borderWidth 1`, `fg textMuted`, `selectedWeight semibold`.
nav: `navHeight 30` (`navHeightSm 26`, `navHeightLg 32`), `navPaddingX 11` (`navLgPaddingX 12`), `navRadius r20`, `navFont text13MediumLh16`, `navFontSizeLg body (14)`, `navSelectedBorder pillSelectedBorder`, `navSelectedFg primary`.
tag: `tagPaddingY 8`, `tagPaddingX 12`, `tagRadius r32`, `tagFont body`, `tagFg textPrimary`, `tagSelectedBorder textPrimary`.
filter: `filterPadding 8`, `filterRadius r8`, `filterBorderWidth 2`, `filterFont productTitle`, `filterFg textBody`, `filterSelectedBorder brandBlue`, `filterSelectedBg palette.filterSelectedBackground (#F0F7FF)`.
count: `countSize 20`, `countBg primary`, `countFg textInverse`, `countFont text12BoldLh1`; `rowGap 8`, `rowPadding 15`.

**`stepper`** (`--nk-stepper-*`): `height 36`, `radius r8`, `paddingX 6`, `buttonPadding 4`, `iconSize 16`, `valueHeight 20`, `valueMinWidth 16`, `disabledOpacity 0.4`.

| Variant | Width | Bg | Border | Fg / value | Font |
|---|---|---|---|---|---|
| `cart` | 92 | `bgSurface` | `1px solid borderInput` | `palette.secondaryTextColor` / `textInk` | `text14BoldLh20` |
| `filled` | 76 | `cta` | `0` | `textInverse` / `textInverse` | `text16BoldLh20` |
| `soft` | 120 | `bgInfo` | `1.2px solid borderInfo` | `primary` / `primary` | `text18BoldLh20` |

**`searchBar`** (`--nk-search-bar-*`): `height 52`, `radius r12`, `paddingX 12`, `gap 8`, `pressScale 0.98`, `bg bgSurface`, `border borderInput`, `inputBorder palette.gray400`, `iconSize 20`, `cameraSize 24`, `placeholderFont text17MediumLh30`, `placeholderTracking -0.2`, `placeholderFg textPrimary`, `tickerHeight 30`, `dividerHeight 24`, `dividerGap 4`, `fieldFont bodyLarge`, `fieldFg textBody`, `fieldPlaceholder textSecondary`, `clearIconSize 18`.

**`tabBar`** (`--nk-tab-bar-*`). Liquid Glass (default bar): `glassHeight 62`, `glassInsetX 21`, `glassLift 13` / `glassBottomMin 8` (platter bottom = max(8, inset − 13), computed in CSS because the inset is set below the root), `glassRadius full`, `glassBg whiteAlpha64`, `glassBgFallback whiteAlpha95`, `glassBlur blur(14px) saturate(180%)`, `glassRim whiteAlpha70`, `glassShadow`, `glassHighlight`, `glassSheen whiteAlpha50`, `glassLens blackAlpha6`, `glassIcon blueGray900`, `glassBadgeBg blueGray900`, `glassBadgeBorder white`, `glassBadgeBorderWidth 1.5`, `glassLensInset 4`, `glassIconScale 0.875`, `glassGap 2`, `glassPressScale 1.08`, `glassLensStiffness 320` / `glassLensDamping 26` / `glassLensStretch 0.14` / `glassLensStretchMax 0.4` / `glassLensSquash 0.1` / `glassLensMorph 0.42` / `glassTintFade 0.2` (tab-switch lens slide), `glassHideShadow 16`, `floatingGap 10`. Shared glass fills and fade: `glassInnerFill whiteAlpha40`, `fadeExtend 48`, `fadeBlur1–4` (1 / 2 / 4 / 8px), `fadeFrom whiteAlpha0`, `fadeMid whiteAlpha60`, `fadeTo whiteAlpha90`. Classic bar: `bg bgSurface`, `shadow shadow.tabBar`, `fg tabInactive`, `fgActive tabActive`, `iconBox 32`, `gap 1`, `font type.tab`, `pressScale 0.9`, `badgeTop -2`, `badgeEnd -8`.

**`quickAdd`** (`--nk-quick-add-*`): `size 36`, `expandedWidth 76`, `radius r8`, `bg bgSurface`, `border borderSubtle`, `shadow thumb`, `icon palette.black`, `iconSize 22`, `filledBg cta`, `countFg textInverse`, `countFont text13SemiboldLh1`, `pressScale 0.9`.

**`needHelp`** (`--nk-need-help-*`): `size 48`, `padding 12`, `gap 8`, `radius full`, `borderWidth 2`, `border palette.lightBlue`, `bg bgSurface`, `shadow floating`, `icon brandBlue`, `iconSize 20`, `fg textPrimary`, `font text16SemiboldLh20`, `tracking -0.16`, `inset 16`, `pressScale 0.96`.

**`eta`** (`--nk-eta-*`, Origin `_ETA` `wFRKiKskxZ4vjIHbDVvngJ · 2673:2414`, used by `EtaBadge`): `height 18`, `pillHeight 24`, `pillPadding s4`, `pillRadius r6`, `gap s4`, `minutesBg palette.dangerRed` (#D92626), `minutesShadow palette.originRed900` (#7B1414), `supermallBg palette.blueSapphire` (#2122B8), `supermallShadow palette.originSupermall1000` (#12136D), `onBold textInverse`, `supermallAccent palette.yellowColor` (#FEEE00), `labelFont text12RegularLh18`, `valueFont text12BoldLh18`, `labelColor palette.slateGray`, `valueColor palette.blueGray900`, `chipHeight 18`, `chipPadding s4`, `chipGap s2`, `marketFrom palette.noonSuccessSubtle`, `marketTo palette.paleYellowGradient` (mixed 40 / 60 to match Figma's render), `globalBg palette.originSupermallSubtle` (#EDEEFD), `globalFont text11SemiboldLh14`, `globalColor palette.slateGray`, `tomorrowOverlap 13`.

**`sheet`** (`--nk-sheet-*`, Origin M-BottomSheet `wFRKiKskxZ4vjIHbDVvngJ · 3207:15`): `scrim scrimBold`, `inset 12`, `radius r16`, `bg bgSurface`, `shadow sheet`, `maxHeight 680`, `bottomGap 12`, `grabberZone 28`, `grabberWidth 36`, `grabberHeight 4`, `grabberRadius r2`, `grabber palette.whiteAlpha64`, `headerHeight 48`, `padding 12`, `titleFont text16SemiboldLh22`, `titleFg textPrimary`, `subtitleFont text12MediumLh18`, `subtitleFg textSecondary`, `closeSize 44`, `closeIconSize 24`, `closeFg textPrimary`, `footerPadding 12`, `footerGap 12`, `secondaryBg bgSurface`, `secondaryFg primary`, `secondaryBorder pillSelectedBorder`. `sheet: 'floating'` (bappzaar OverlayBottomSheet isFloating): `floatingScrim palette.overlaySheetScrim` (rgba(30,30,30,0.7)), `floatingInset 12`, `floatingRadius r16`, `floatingTopGap 60`, `floatingBottomGap 15`, `floatingHandle palette.overlaySheetHandle` (#B7B7B7), `floatingHandleOffset 18`.

**`snackbar`** (`--nk-snackbar-*`, Origin M-Toast `4227:76702` / M-Stacked Toast `4229:76747`): `radius r14`, `minWidth 300`, `maxWidth 440`, `padding 12`, `gap 8`, `assetSize 40`, `textGap 2`, `shadow snackbar`, `titleFont text14SemiboldLh20`, `subtitleFont text12RegularLh18`, `tracking -0.1`, `chevronSize 16`, `darkBg textPrimary`, `lightBg bgSurface`, `errorBg palette.dangerRed`, `successBg success`, `border palette.whiteAlpha8`, `lightBorder borderSubtle`, `fg textInverse`, `subtitleFg palette.whiteAlpha80`, `lightFg textPrimary`, `lightSubtitleFg textSecondary`, `actionInset 10`, `actionPadding 8`, `actionRadius r8`, `actionFont text12SemiboldLh16`, `actionBg palette.whiteAlpha16`, `actionLightBg bgSurface`, `actionLightBorder border`, `actionLightHeight 32`, `stackPeek 12`, `stackInset 12`, `inset 12`.

## 3. Rules

**Where raw values may live**
- `src/foundations/**`: definitions (lint ignores it). Add to `palette.ts` / `tokens.ts` only for genuinely shared, kit-wide values.
- `src/flows/<id>/tokens.ts`: the only other place for raw hex / rgba / font literals. Lint reports them in a separate "in tokens.ts" column and never fails on them.
- Everywhere else (`*.module.css`, `*.tsx`, `src/components/**`, `src/kit/**`): only `var(--nk-…)`, `ref.*`, `<Text>`. `src/components` must have zero findings or `npm run lint:tokens` (and `npm run verify`) fails.
- True geometry that matches the regex (e.g. SVG fill in an icon) may carry a `token-lint-ignore — <reason>` comment on the line. The reason is required: an ignore without one is reported in the "no reason" column. Comments are stripped before scanning, so a hex inside a comment is fine.
- Lint scope (fails `src/components`): hex (`#RGB`, `#RGBA`, `#RRGGBB`, `#RRGGBBAA`), `rgb()/rgba()/hsl()/hsla()`, and `font: <weight>00 <size>px` shorthands.
- Lint scope (reported, never fails yet): the "px" column — raw `font-size: 13px` / `border-radius: 10px` in CSS and `fontSize: 13` / `borderRadius: 10` in TS whose number has a token (`token-map.json` `fontSize` / `radius`), and "no reason" ignores. Spacing, off-scale sizes and gradients' numeric parts are not checked, so snap those by discipline.

**Lint and replace workflow**

```bash
npm run lint:tokens                               # summary per folder
node scripts/token-lint.mjs -v src/flows/cart     # list findings: file:line kind literal (px findings name the token)
node scripts/token-lint.mjs --strict src/flows/cart   # exit 1 if that path has hex / rgba / font findings
```

For each finding, normalise the literal (hex uppercase, 3/4-digit expanded, `FF` alpha dropped; `rgba(r, g, b, a)` with one space after commas; `rgb()` / alpha 1 → hex) and look it up in `scripts/token-map.json`:
- `colors["#3866DF"]` → `{ palette: "accentColor", cssVar: "var(--nk-color-badge)", semantic: ["--nk-color-badge", "--nk-color-cta"], paletteVar: "--nk-palette-accent-color" }`. Choose the `semantic` entry whose meaning fits (here `cta` for a button); `cssVar` is just the first. No `semantic` → use `paletteVar`.
- `type["600 14px/18px"]` → `{ token: "bodySemibold", cssVar: "var(--nk-type-body-semibold)" }`. `token: null` = one-off: add a flow type token (`<flow>Text<size><Weight>Lh<line>`).
- `radius["12px"]` → `var(--nk-radius-r12)` (`9999px` → `var(--nk-radius-full)`); `fontSize["13px"]` → `var(--nk-font-size-body-compact)`. For text, prefer a whole `var(--nk-type-*)` shorthand when weight and line height match too.
- Not in the map: add a flow token (below), or a palette entry if several flows need it.

**Flow tokens** (`src/flows/<id>/tokens.ts`, scaffolded by `npm run new-flow`)

```ts
import type { TokenOverrides } from '../../foundations/tokens';
export const cartTokens = { horizontalPadding: 12, qtyDebounceMs: 1200 } as const;   // plain TS: metrics, timings, gradients
export const cartFlowTokens: TokenOverrides = {
  colors: {
    bgPage: '#F2F3F7',                                   // override a central key for this flow only
    cartEmerald: '#13645F',                              // new flow key -> var(--nk-color-cart-emerald)
    chkInvoiceText: 'var(--nk-palette-slate600)',        // preferred: alias an existing palette var (checkout style)
  },
  type: { cartText10BoldLh12: { size: 10, line: 12, weight: 700 } },  // -> var(--nk-type-cart-text10-bold-lh12)
  shadow: { cartFooter: '0 -4px 10px var(--nk-palette-black-alpha8)' },
};
// index.ts
defineFlow({ id: 'cart', /* … */ tokens: cartFlowTokens });
```

- Prefix new keys with the flow id (existing prefixes: `acct`, `addr`, `cards`, `cart`, `cat`, `chk`, `mb`, `vip`, `pdp`, `returns`, `orders`, `home`, `plp`); vars are not namespaced otherwise and every key is emitted on the flow's screens.
- `TokenOverrides` accepts any group of `tokens` (`colors`, `palette`, `spacing`, `radius`, `type`, `shadow`, `layout`, `fontSize`, `button`, `pill`, …) with extra keys allowed. Values are strings or numbers; nested objects only for `type`.
- When the value already exists in the palette, alias it with `var(--nk-palette-…)` rather than repeating the hex.
- Themed sets live in one flow object. Example: cart shipment-group colours are in `src/flows/cart/tokens.ts` (`cartFigmaColors` + `groupTheme[type]` with `glass`, `border`, `progressEnd`, `track`, `fill`, `eta`), so a new fulfilment is one more `groupTheme` entry. The Cart 2.0 supermall group is not in the kit yet: glass `#E8E8F3`, ETA `#F5F5FC`, track `#E3E3FC` and progress end `#EBEBFE` need new `cartFigmaColors` keys; border `--nk-palette-persian-blue100`, ink/fill `--nk-palette-rocket-blue-sapphire` and the "+ Add" button `--nk-palette-persian-blue50` border / `--nk-palette-persian-blue` text already exist.
- The Navigator wraps every screen in `<TokenScope overrides={flow.tokens}>` (a `display: contents` div). When any non-`layout` group is overridden, TokenScope re-declares all component-token groups inside the scope so `--nk-button-*` etc. resolve against the flow's colours. Screens of another flow pushed on top get their own flow's scope.
- Use `<TokenScope overrides={…}>` directly only for a subtree that needs a local override outside the flow mechanism (e.g. a dark section).

**RTL**: `<NoonPrototype rtl>` (or `<NoonThemeProvider rtl>`) sets `dir="rtl"` and `--nk-font-family` to `fontFamily.rtl` (Cairo first). Use logical CSS properties (`margin-inline-start`, `inset-inline-end`, `padding-inline`) and flip directional icons (chevrons, back arrow) with `<Icon flipRtl>` or class `nk-flip-rtl` on an `<img>`. `TokenScope` does not receive `rtl`, so a flow that overrides `fontFamily` resets `--nk-font-family` to its `primary` value even in RTL; do not override `fontFamily` in flow tokens.

**Rebranding / A-B**: pass global overrides to the player; they apply to every flow and, through `ref`, to every component.

```tsx
<NoonPrototype flows={[homeFlow, cartFlow]} tokens={{ colors: { cta: '#0F61FF', brand: '#FFD400' }, radius: { r12: 16 } }} />
```

Flow tokens still win inside their flow's screens (TokenScope is nested inside the root provider).

## 4. Mapping a reference design to tokens

Goal: every value in a screenshot / Figma / bappzaar `styles.ts` ends up as an existing token, or as a deliberate flow token with its source noted.

**Colours**
1. Get the exact value (Figma inspect, bappzaar constant resolved to hex). For screenshots, sample flat areas, not anti-aliased edges or images; JPEG/scaled screenshots drift by a few units per channel.
2. Normalise and look up the exact literal in `scripts/token-map.json` `colors`. Hit → use the semantic var that matches the role, else the palette var.
3. No exact hit and the value comes from a screenshot: snap to the nearest token of the same role if within about 2–3 units per channel (e.g. sampled `#3967DE` → `--nk-color-cta`; `#E9EBEF` → `--nk-color-border`). Check role tables first: text greys (`textPrimary #1D2539` > `textBody #343D54` > `textMuted #475067` > `textSecondary #666D85` > `priceOld #7E859B` > `textTertiary #989FB3`), surfaces (`bgSurface` > `bgPdp/bgSubtle #F9F9FB` > `bgPill #F7F8FA` > `bgMuted #F3F4F8` > `bgPage #F2F3F7`), borders (`borderSubtle #F2F3F7` > `border #EAECF0` > `borderInput #D7DAE3` > `borderStrong #D0D4DD`), blues (`brandBlue #0057FF`, `primary #0F61FF`, `link #0076FF`, `primaryBright #0F7EFF`, `cta #3866DF`, `tabActive #1155CB`).
4. Translucent colours: match base + alpha against the palette alpha series (`blackAlpha*`, `whiteAlpha*`, `primaryAlpha*`, `charcoalNavyAlpha*`) before adding anything.
5. No token within tolerance, or the value is exact from Figma/bappzaar and differs: add a flow colour token (with a comment naming the source constant / Figma variable), aliasing a palette var if the palette has it.
6. `scripts/token-map.json` only lists values the kit already uses, so it misses palette entries such as `#741B92`, `#FBF0FE`, `#E8FCFA`, `#242A34`, `#96C6FF` and `#848391`. Grep `src/foundations/palette.ts` for the hex before adding a flow token.

Known Figma values (from the files in "Figma design sources" below):

| Figma variable / fill | Value | Kit token | Note |
|---|---|---|---|
| `Light/Text/Primary`, `Colour/Text/text-primary` | `#262A33` | `--nk-palette-new-black` | Homepage 2025 titles and labels. No semantic token yet (candidate `colors.textHeading`). Don't snap it to `textPrimary #1D2539` |
| `Light/Support/Divider` | `#EBECEF` | `border` | snap |
| search bar border | `#E2E2E2` | `--nk-palette-gray400` | snap |
| inactive tab label | `#344054` | `textBody` | snap |
| Best Seller fill | `#084541` | `bestSellerTag` | `Emerald/900` is `#0A4F4A` |
| struck price (home SKU) | `#848391` | `--nk-palette-gray` | kit `priceOld` is `#7E859B` |
| `Accent/100` | `#E1EFFF` | `--nk-palette-lavender` | PDP brand strip; not `bgStoreStrip #E8F1FF` |
| `Accent/50`, `Blue/50` | `#EFF7FF` | `--nk-palette-alice-blue` | offers rows, selected payment / option fill |
| `base/colour/purple/800` | `#741B92` | `--nk-palette-deep-purple` | "Newer model available" |
| `purple/100` | `#FBF0FE` | `--nk-palette-lavender-mist` | |
| `Emerald/50` | `#E8FCFA` | `--nk-palette-mint-cyan-light` | |
| `Emerald/800` | `#13645F` | `--nk-palette-emerald-green` | |
| `✅ text/primary` | `#242A34` | `--nk-palette-dark-text-color` | |
| `Blue/300` | `#96C6FF` | `--nk-palette-sky-blue` | |
| `colour/text-n-icon/error` | `#D92626` | `--nk-palette-danger-red` | `danger` is `#DE1C1C` |
| `🚧 text/👀 primary` | `rgba(2,6,12,.92)` | `--nk-palette-dark-navy-alpha92` | |

Not in the kit (Homepage 2025): `#008200` (`Green/800`, SKU % off), `#F2F8F8` (flat rating pill bg), `#AF33D9` (`Purple/800`), `#0E0E0EC8` (`Alpha/GrayA/900`), `rgba(0,0,0,.16)` (hero "Ad" badge), `#121212`, `#E5FF43`, `#E0EFFF`. Add them as `home*` flow tokens until a second flow needs them.

**Spacing and sizes**: snap to the spacing scale (0, 2, 4, 6, 8, 10, 12, 14, 15, 16, 18, 20, 24, 32, 36, 40, 48, 56, 64, 72, 80, 88). From screenshots, divide by the capture scale first (device is 390pt wide; a 1170px screenshot is 3x) and round to the nearest step. Exact odd values from source (1, 3, 5, 22, 28…) become flow `spacing` / `layout` tokens; component sizes (icon boxes, image widths, header heights) go in flow `layout` or the plain flow TS object. Example: the Homepage 2025 module gap is 28 → flow `homeModuleGap: 28`; its hero gap 9 snaps to `s8`.

**Radius**: snap to 0, 2, 4, 6, 8, 10, 12, 14, 16, 20, 24, 30, 32, 48, `full`. Pills/circles use `full` (or `50%` for fixed squares). Common: cards `r12`/`r16`, buttons `r8`/`r10`/`r12`, chips `r20`/`r32`. Exact off-scale source radii (5, 18, 25, 40) become flow `radius` tokens (`pdpR5`).

**Type**: identify size, line-height, weight. Look up `"<weight> <size>px/<line>px"` in `token-map.json` `type`, or match the tables above: named variant first, then `text<size><Weight>Lh<line>`. From screenshots, sizes snap to the nearest integer and weights to 400/500/600/700; line-height can usually snap to the closest existing combo for that size/weight. Exact source combos with no token → flow `type` token `<flow>Text<size><Weight>Lh<line>`; RN text without `lineHeight` → `line: 'normal'`.
- Figma text styles (Storefront PDP, Cart 2.0 and Checkout 2.0 share the library): `Label2/Medium` 16/500/20 = `--nk-type-pdp-title` (pdp flow token); `Label3/Bold`, `Semibold`, `Medium`, `Regular` 14/18 = `bodyBold` / `bodySemibold` / `productTitle` / `body`; `Label4` 12/14 = `text12{Regular,Semibold,Medium}Lh14`; `Body/B12/SemiBold` 12/600/16 = `captionBold`; `B13` 13/18 = `text13{Semibold,Medium}Lh18`; `Tiny/Semibold` 10/600/12 = `text10SemiboldLh12`; `Body3` 12/400/18 = `text12RegularLh18`.
- Homepage 2025 section titles are 17/22 Bold → `heading`, not `section` (16/22).
- Common Figma combos with no token yet: 700 15/20 (SKU price, also the cart `SkuCard`), 600 13/14 (category label), 700 13/16 (active tab), 500 / 700 12/20 (bottom nav). Use flow tokens for now; `text15BoldLh20` and `text13BoldLh16` are candidates for central `type`.
- Letter-spacing has no token group. Cart and checkout keep Figma `letterSpacing/*` as px literals next to `font:`; elsewhere drop it (leave it at 0).
- Figtree *Italic* meta text in the Figma renders upright: Noontree has no italic face.

**Shadows**: match to `card`, `raised`, `lg`, `thumb`, `tabBar`, `bottomBar`, `floating` by offset/blur; a distinct exact source shadow becomes a flow `shadow` token built from palette vars.

**When a flow token is legitimate**
- The value is exact from the source (bappzaar `styles.ts` constant, Figma variable or fill) and no central token or palette entry equals it.
- It is specific to this flow's look (campaign gradient, membership palette, glass fills).
- Overriding a central semantic key for the whole flow (`bgPage: '#FFFFFF'` for white-page flows).

**When it is not**
- The value equals an existing token (use the token, even if the hex is duplicated in another name).
- It is a screenshot sample within tolerance of a token.
- It would be useful in several flows: add to `palette.ts` (bappzaar name, or `kit<Hue><L%>`) and, if it has a clear role, a semantic `colors` key, then regenerate usages via `token-map.json`.

Record the mapping (source value → token or new flow token) in the flow's `MAPPING.md` / `FIGMA-MAPPING.md`, then run `npm run lint:tokens` and `npm run verify`.

### Figma design sources

Analysed noon Figma files. Each analysis has the full variable → token table; read it before mapping that file.

| Figma file | Key · nodes | Analysis |
|---|---|---|
| Homepage Revamp 2025 | `iRE9RwO94eMAyW3j3XKNXW` · `1337:7139` (screen `1337:5102`) | `../../home-page/references/figma-homepage-2025.md` |
| ✅ Cart 2.0 · 🚧 Checkout 2.0 | `BaWAAGW7zmdSTkXNXqPcAJ` · `10575:94058`, `12112:209179`, `14812:276687` · `zURu7GI7sq77fjdXKrouvo` · `14288:183972` | `../../checkout/references/figma-cart-checkout.md`; node-by-node tables in `src/flows/cart/FIGMA-MAPPING.md` and `src/flows/checkout/FIGMA-MAPPING.md` |
| Storefront (PDP, out-of-stock case) | `2ldJbjmQq4RkhnrNFCfXQB` · `930:259766` | `../../pdp/references/figma-storefront-pdp.md` |
