# Design rules: which component, colour, spacing, radius and type, and why

These are the rules a new screen or flow follows. Each one comes from what the 17 ported flows actually do, counted by
`node scripts/design-usage.mjs` (numbers in [`references/design-usage.generated.md`](references/design-usage.generated.md), refreshed by
`npm run resources:build`). Where the ports disagree with each other, the rule picks the value most flows use and says
when the other one is right. The ports keep their own values (they are 1:1 bappzaar / Figma); **new code follows this file.**

Enforced: `node scripts/design-usage.mjs --check` (part of `npm run skill:check`) fails when a flow has more findings
than `scripts/design-baseline.json` allows. A new flow is not in the baseline, so it must have **zero** findings.
`node scripts/design-usage.mjs --flow <id>` lists them as `file:line kind value → fix`. A genuine exception (a value a
reference really specifies) carries `/* design-ignore — <reason> */` on the line.

Read with: [`references/components.md`](references/components.md) (APIs), [`references/tokens.md`](references/tokens.md) (every token), [`references/screen-recipes.md`](references/screen-recipes.md) (layouts).

---

## 0. Design languages: reuse only, never invent

The kit speaks three design languages. Every piece of new UI comes from one of them; read the host screen's `truth`
(`bappzaar` / `figma` / `mixed`) and use that screen's language.

| Language | Truth for | Its own pieces |
|---|---|---|
| **Origin Design System** (Figma `wFRKiKskxZ4vjIHbDVvngJ`; coded as the **Field Design System**, [`references/field-ds.md`](references/field-ds.md)) | the default for anything new | `OriginIcon`, M-BottomSheet (`SheetHeader` / `SheetBody` / `SheetFooter`), M-Toast (`nav.toast` → `Snackbar` / `SnackbarStack`), `_ETA` (`EtaBadge`), and the Field components: `Radio`, `ActionBar`, `Accordion`, `TextField`, `TextArea` and the `variant="field*"` of `Button`, `IconButton`, `Header`, `Checkbox`, `Switch`, `Segmented`, `Pill` (`fieldChip`), `StatusChip`, `Stars`, `ListRow`, `SearchInput`, `TabBar` (components.md → "Field Design System") |
| **noon Figma revamps** (Homepage 2025, Cart 2.0, Checkout 2.0, Storefront PDP, R&R 2.0, Orders PDS) | screens with `truth: 'figma' \| 'mixed'` | `SkuCard`, `SearchBarButton variant="2025"`, `Button variant="dark"`, `DashedDivider`, `StatusChip`, home `DepartmentTabs` / `RecommendedRail` tabs |
| **bappzaar ports** (master, 1:1) | screens with `truth: 'bappzaar'` | `Button` `noon*` variants, `Pill` `nav` / `filter`, `ProductBoxVertical`, `MaskIcon` glyphs, `DottedDivider`, `sheet: 'classic'`, address `TabSwitcher`, account `LanguageSwitcher` |

**The rule.** When a request needs a pill, chip, tab, toggle, badge, button, card, row or sheet, pick it from the table
below (or §1) and use it through its props and documented variants. Don't draw a new one: no new shape, height, radius,
colour, border, weight or selected state, and no restyling an existing one through `className` until it looks different.
Arranging existing pieces into a new section is fine; new pieces are not.

The only exceptions are when the user **explicitly** asks for a new component or a new look, or when the reference they
gave clearly shows one that nothing here matches. In both cases, name the closest existing component, say what differs,
and ask before building. If the match is flow-local in another flow (e.g. home `DepartmentTabs`), propose promoting it
(components.md → "Duplicates and promotion") instead of drawing a lookalike.

| Need | Use | Language |
|---|---|---|
| Filter / sort / category nav pill row | `Pill` (`nav`, `size`, `count`, `dropdown`, `removable`) in `PillRow` | bappzaar PLP |
| Option inside a filter sheet | `Pill variant="filter"` | bappzaar PLP |
| Tag / suggestion chip (trending searches, home tags) | `Pill variant="tag"` | Figma home |
| Status / highlight chip | `StatusChip tone` | Figma orders |
| Coupon code chip | `CouponTag` | bappzaar cart |
| Marketplace / fulfilment pill · express | `MarketplaceTag` · `ExpressBadge` | bappzaar |
| Delivery promise on a product | `EtaBadge` + `etaFor` | Origin `_ETA` |
| Small label ("Ad", member) · corner tag ("Best Seller") | `Badge` · `CatalogTag` | |
| Rating pill · stars | `RatingPill` · `Stars` | |
| 2–3 option sliding toggle | `Segmented` | shared |
| Content tabs under a header | home `DepartmentTabs` / `RecommendedRail` tabs (flow-local; promote to reuse) | Figma home |
| Two-tab track with sliding white indicator | address `TabSwitcher` (flow-local; promote to reuse) | bappzaar address |
| Bottom navigation | `TabBar` (navigator `tabBar`) | |
| On/off · multi-select | `Switch` · `Checkbox` | |
| Variant choice (size, colour) | pdp `Variants` / cart `VariantOptionChip` (flow-local) | bappzaar |

## 1. Components: pick by job

| Job | Use | Why (evidence) | Not |
|---|---|---|---|
| Root of every screen | `Screen` (+ `Header` on pushed screens) | 17 / 18 flows; owns safe areas, scroll and the page background | a custom scroll div |
| Anything tappable that isn't a CTA (row, card, chip, icon) | `Pressable` (`scale` 0.96; 0.98 for wide rows / cards) | 188 uses in 15 of 18 flows; one press feel everywhere | `<button>` / `motion.button` (198 left in pdp, checkout, noonone, cart, membership ports, counted as `raw-button`) |
| CTA | `Button` with the variant below | the variants carry the colour, radius, disabled and `loading` states | a styled `Pressable` |
| Text from the server or with `<b>/<highlight>/<steel>` | `HtmlText` | 151 uses; the bappzaar HtmlView tags map to tokens | `dangerouslySetInnerHTML` |
| System icon | `OriginIcon name` | Origin Design System; 110 uses in the newer flows (home, pdp, orders, reviews, noonone) | lucide `Icon` (28 uses, older flows only) |
| bappzaar webp / svg glyph that needs a colour | `MaskIcon` | 69 uses in 11 of 18 flows | `<img>` + CSS filter |
| Product picture | `ProductImage` | 40 uses in 10 of 18 flows; contain, placeholder, 2% overlay | `<img>` |
| Product grid card · rail card · Figma SKU rail | `ProductBoxVertical` · `ProductCard` · `SkuCard` | each is the 1:1 port of one bappzaar / Figma card | a new card |
| Delivery promise on a product | `EtaBadge` via `etaFor(product)` | Origin `_ETA`; used inside every product card | `ExpressBadge` (only outside the ETA slot) |
| Fulfilment pill (supermall, market, global) | `MarketplaceTag` | 5 of 18 flows | a coloured span |
| Loading | `Skeleton` blocks; `Button loading` or `Spinner` inside a control | `Skeleton` 98 uses in 9 of 18 flows | a full-screen spinner for content |
| Lottie (ATC check, confirmation) | `Lottie` | 11 of 18 flows | gif / video |
| Divider inside a card | `DashedDivider` (orders, checkout, pdp, home, reviews) or `Divider` hairline; `DottedDivider` for account / address / returns lists | 17 + 9 + 3 uses | a border on the row |
| Toggle · checkbox · segmented | `Switch` · `Checkbox` · `Segmented` | | custom inputs |
| Toast / snackbar | `nav.toast(title, { type, subtitle, icon, action })` | Origin M-Toast | a local toast state |

**Defaults that the ports predate.** These shared components have **no** flow using them yet, because the ports
hand-rolled their own before they existed. A new screen uses them; it never copies a port's hand-rolled version:
`SheetHeader` / `SheetBody` / `SheetFooter` (every new sheet), `SectionCard` (a white titled card), `ListRow` in
`ListGroup` (settings rows), `BottomBar` (sticky footer), `StatusChip`, `CouponTag`, `Money`, `QuantityStepper`,
`Stars`, `Segmented`, `PillRow`.

**Promote, don't copy a third time.** `PaymentCard` (cards, checkout) and `DynamicInvoice` (cart, checkout) exist
twice already. A new flow that needs one moves it to `src/components` (CONTRIBUTING "Duplicates and promotion")
instead of a third copy, and never imports another flow's file.

### Button variant by job

| Job | Variant | Seen in |
|---|---|---|
| Main action on a noon (bappzaar-styled) screen | `noon` (secondary `noonSecondary`, text link `noonGhost`) | checkout, payment failure, EMI |
| Underlined inline link ("T&C", "Learn more") | `noonDotted` | checkout, coupon tray |
| Final step of a purchase (Place order, Pay) | `checkout` (brand blue) | checkout, order cancel |
| Black full-width CTA on Figma-era screens (reviews, launch, sign in) | `dark` (`bg-inverse`) | reviews, account, home |
| Second action next to a primary | `outline` or `secondary` | orders, returns, reviews |

One primary per footer. Two buttons side by side = `outline`/`secondary` + one primary.

---

## 2. Colour by role

Every colour is a token (100% of flow CSS already is). Pick the token **by role**, then by meaning; a token named for one
role is not borrowed for another (`role` finding).

### Text (`color:`)

| Use | Token | Share |
|---|---|---|
| Titles, names, row labels, most UI text | `text-primary` (#1D2539) | 18%, 14 of 18 flows |
| Meta, captions, helper lines | `text-secondary` (#666D85) | 9% |
| Headings, product titles on cards | `text-strong` (#101628) | 6% |
| Long body copy, addresses, input values | `text-body` (#343D54) | 5% |
| Legal, counts, placeholders | `text-tertiary` (#989FB3) | 3% |
| Sale price, Figma "text/primary" | `text-ink` (#0E0E0E) | 4% |
| On a dark or brand fill | `text-inverse` (white) | 7% |
| Links / text buttons | `primary` (#0F61FF); store name, selected filter `brand-blue` | |
| Positive / discount / error | `success`, `discount-bright` ("% OFF"), `danger` | |

`text-legacy` (#404553) and `text-muted` belong to the older ports; don't start new screens with them.

### Surfaces (`background:`)

| Use | Token |
|---|---|
| Cards, sheets, footers, headers | `bg-surface` (35% of all backgrounds, 16 of 17 of 18 flows) |
| Pills, inner blocks, icon buttons, inputs on white | `bg-subtle` (#F9F9FB, 10%) |
| Chips, image placeholders | `bg-muted` |
| Dark fill (black CTA, dark pill, toast) | `bg-inverse`, not `text-primary` / `text-strong` (the ports' 25 + 13 uses are the drift this rule stops) |
| Status fills | `success-surface`, `danger-surface`, `warning-surface`, `bg-info` |
| Filled CTA | `cta` (Add to cart, quick ATC) · `brand-blue` (Checkout, filters) · `primary-bright` (blue floating pills: Create, View cart) |

**Page background (`bgPage`, set once in the flow's `tokens.ts`)** decides the whole look, so choose it by layout:
- **Grey `#F2F3F7` (default `bg-page`)**: a stack of white cards. account, cart, orders, checkout (`#F3F4F8`).
- **White**: an edge-to-edge feed or grid. home, deals, plp, search, wishlist, categories.
- **`bg-subtle` #F9F9FB**: a long detail page with light sections. pdp, returns, reviews.

### Borders (`border*:`)

`border` (#EAECF0) is the default card / input outline (17%). Use `border-subtle` (#F2F3F7) for separators on white,
`border-strong` (#D0D4DD) for an emphasised outline or dashed invoice line, `border-input` for text fields,
`border-info` / `pill-selected-border` for a selected state. Never use a text token as a border.

### Shadows

Only `--nk-shadow-*`: `card` (resting card), `raised`, `lg`, `bottom-bar` (sticky footer), `sheet`, `floating`,
`snackbar`, `tab-bar`. A flow-specific shadow is a flow token built from a `palette-black-alpha*` var, never an rgba.

---

## 3. Spacing

Use only the scale: **2 · 4 · 6 · 8 · 10 · 12 · 14 · 15 · 16 · 20 · 24 · 32** (plus 40+ for empty states). Write
`var(--nk-space-sN)`, never `Npx` (`raw-space`). 5, 7, 9, 11 and 13 appear in ports as exact bappzaar values; in new
code they are `off-scale-space`. Hairlines (0.5, 1, 1.5, 3) are geometry and exempt.

| Where | Value | Why (evidence) |
|---|---|---|
| Page side gutter, cards and content | **12** `s12` | cart, checkout, pdp, orders, returns, home, reviews, cards; `SectionCard` margin `0 12px` |
| Gutter for settings-style lists | 15 `s15` | bappzaar `$edgeSpacing`: account sections, `ListGroup` |
| Gutter for marketing / landing modules and rails | 16 `s16` | noonone, membership, home & deals rails, categories |
| Between cards | 12 | `SectionCard` margin-bottom, account page gap |
| Between feed modules | 20 | home feed |
| Card padding | **12** (16 on large hero cards) | padding is 12 in 29% of all values; card anatomy `bg-surface · r16 · padding 12` is the most common |
| Stack of rows inside a card | gap **8** | gap 8 is the most common gap (26%) |
| Title → subtitle, icon → label | gap **4** | 22% of gaps |
| Block → block inside a card, title → content | gap 12 | 20% of gaps |
| Grid | 2 columns, gap 12 | plp, home, deals, wishlist |
| Rail item gap | 8 products · 10 creatives · 12 collections / hero | home, deals, wishlist |
| Sticky footer | padding `s12` (sides) · `s8`–`s12` (top) · bottom `calc(var(--nk-inset-bottom) + var(--nk-space-s8))` | `BottomBar`, orders, returns |

Choose one gutter per screen and keep every card, title and rail on it. A title row aligns with the card edges below it.

---

## 4. Radius by element

| Element | Radius | Evidence |
|---|---|---|
| Card / section / tile | **r16** (default); r12 for compact or nested cards and product boxes | card kind: r16 ×86, r12 ×57 |
| Button (CTA) | **r12** (NoonButton); r8 for small inline buttons | button kind: r12 ×53, r8 ×22 |
| Bottom sheet, sticky footer top corners | r16 (Origin sheet, `BottomBar`); cart footer r12 is its own spec | sheet r16 ×23, footer r16 ×21 |
| Capsule chip / filter pill / search pill | `full` | pill kind full ×12 |
| Tag, badge, status chip | r4–r6 (small), r8 (medium) | pill kind r4 ×12, r6 ×11, r8 ×10 |
| Image / thumbnail | r8; r12 for a hero image inside a card | image r8 ×35 |
| Input | r12 | input r12 ×10 |

Always `var(--nk-radius-rN)` / `var(--nk-radius-full)`; `50%` for circles. A nested element inside a padded card takes a
smaller radius than the card (r16 card → r12 or r8 inside), never a bigger one.

---

## 5. Type

95% of the flows' `font:` declarations are tokens; new code is 100%. Use the whole shorthand
`font: var(--nk-type-*)` in CSS or `<Text variant color>` in TSX; never `font-size` / `font-weight` alone.

| Use | Token |
|---|---|
| Screen title in `Header` | handled by `Header` |
| Section / module title | `section` (16/22 700), with `color: text-strong` (`<Text variant="section" color="textStrong">`, the most used `Text` pair) |
| Card title, row label, emphasised body | `body-semibold` (14/18 600) or `text14-semibold-lh20` |
| Body text | `body` (14/18 400) or `text14-regular-lh20` |
| Product title on a card | `product-title` (14/18 500) |
| Meta / caption | `caption` (12/16), `text12-regular-lh18`; bold variant `caption-bold` |
| Big numbers, price | `<Price>` / `<Money>`; `text16-bold-lh20` for totals |
| Hero / landing title | `title-small` (18/24), `title` (20/26), `title-large` (24/30) |

A size the scale lacks becomes a flow type token (`<flow>Text<size><Weight>Lh<line>` in the flow's `tokens.ts`), only
when a reference specifies it.

---

## 6. Checklist before handing over a new screen

1. `node scripts/design-usage.mjs --flow <id>` prints 0 findings (or only lines with a `design-ignore — reason`).
2. Every tappable is `Pressable` or `Button`; every icon `OriginIcon` / `MaskIcon`.
3. One gutter (12 unless the job says 15 / 16), cards r16 padding 12, rows gap 8.
4. `bgPage` chosen by layout (card stack grey, feed white, detail subtle).
5. No token used outside its role (text tokens for text, bg tokens for fills, border tokens for lines).
6. `npm run skill:check` green (it runs `--check`).
