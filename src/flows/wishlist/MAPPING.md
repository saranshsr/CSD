# wishlist · bappzaar → kit mapping

Source: bappzaar **master**, `marketplaces/noon/` (read with `git -C ~/bappzaar show origin/master:<path>`). Wishlist V2 (`FeatureFlags.isWishlistV2Enabled()`), the path every screen below follows. Values are resolved from each `styles.ts` + `NoonTokens` (`theme/tokens/{colors,fontSize,radius,spacing}.ts`) + `NoonMetrics`, at a 390 wide phone. Copy: `locale/translations/noon-en.json`.

## Screens

| Kit route | bappzaar | Presentation |
|---|---|---|
| `wishlist/wishlist` (`/wishlist`) | `screens/NoonWishlistV2Screen` | push |
| `wishlist/empty` | `NoonWishlistV2Screen` `isEmpty` branch → `components/NoonWishlistV2Empty` | push |
| `wishlist/loading` | `components/NoonWishlistV2ScreenSkeleton` (while `useNoonWishlistV2Home` loads) | push |
| `wishlist/no-collections` | `components/NoonWishlistV2NoCollectionWidget` (collections = []) | push |
| `wishlist/options` | `screens/NoonWishlistV2CollectionOptionScreen` (`noon.NoonCollectionOptionScreen`, from the card's ⋮) | sheet `floating` |

## Screen (`NoonWishlistV2Screen/styles.ts`)

| Part | bappzaar | Resolved | Kit |
|---|---|---|---|
| container | `paddingTop: statusBar`, no bg | white | `<Screen background="bgSurface">` |
| list header | `collectionTitleListContainer` mt s16, mb s12 | 16 / 12 | `.listHeader` |
| "All Saved Items" | blueGray900, bodyLarge 700, px s12 | #1D2539 16/700 | `--nk-type-section`, `--nk-color-text-primary` |
| grid row | `productCardRow` gap 12 (`productBoxVerticalInterItemSpacing`), px s12, 2 columns | 12 / 12 | `.grid` |
| cell | `productBoxVerticalWidth` = floor((W − 24 − 12) / 2), product box mb s12 | 177 at 390 | `.cell` |
| list padding bottom | `useNoonWishlistV2FloatingCartListPaddingBottom`: 24 + inset (+ pill height + 24 when the pill shows) | | `.grid` padding + `data-pill` |
| snackbar | `NoonSnackBar` | | `nav.toast` (Origin M-Toast, kit default) |

## Header (`NoonWishlistV2Header`, `useNoonWishlistV2HeaderAnimation`)

| Part | bappzaar | Resolved | Kit |
|---|---|---|---|
| row | gap s12, px s12, py s8, center | 12 / 12 / 8 | `.headerRow` |
| back | 40 × 40 circle, 1px `lightGreyColor`, padding 10, `noon-wishlist-v2-wishlist-back-icon` 20 tinted black, RTL mirrored | #EAECF0 | `.backButton` + `MaskIcon` |
| title | blueGray900 bodyLarge 700, two absolute texts | #1D2539 16/700 | `.title` |
| title swap | opacity interpolated over scrollY ∈ [b − 8, b + 8] (b = "All Saved Items" bottom in the list header, excl. its mt 16); "Wishlist" y 0 → −4, "All Saved Items" y +4 → 0; clamp | continuous (no timing) | `swapProgress` in `WishlistScreen` |
| Create | azureBlue, r full, h 40, px s12, py 7, gap s2; `noon-wishlist-v2-plus-wishlist-collection` 12 + margin 4 tinted white; 14/600 lh 18, −0.1 | #0F7EFF | `.createPill` |
| Create fade | opacity = "Wishlist" opacity (no scale) | | style opacity |
| Create tap | `NoonWishlistCollectionNamingScreen` overlay; collection limit → `NoonWishlistV2FloatingErrorBar` | | toast (naming sheet not in the demo) |

## Collection tile (`NoonWishlistV2CollectionTitle`, `…CollectionImageBackground`, `…CollectionTitleList`)

| Part | bappzaar | Resolved | Kit |
|---|---|---|---|
| list | horizontal scroll, gap s12, px s12, mb s32 | | `.collections` |
| tile | 126 × 152, `secondaryBackgroundColor`, 1px `antiFlashWhite`, r12, padding 12 / top 16, gap 8, centered | #F9F9FB / #F2F3F7 | `.tile` |
| tab | 28 × 6, `lightGrey`, bottom radii 6, top 0 | #D0D4DD | `.tileTab` |
| stack | size 67 → card 50.25 × 67, radius 18 % of width (9), box width 1.45 × card (72.9); container shadow 0 0 12 black 0.1 | | `.stack` |
| cards | 2px white border, `antiFlashWhite` fill, shadow 0 0 10 black 0.06; left / right: left 0 / right 0, rotate ∓8°, scale 0.88, x ∓4, y −1, opacity 0.95, z 1; center z 2 | | `.stackCard` |
| placeholder | `noon-wishlist-v2-empty-collection-placeholder` when the center image is missing | | `CollectionTile` |
| name | blueGray1000 14/700, 1 line | #101628 | `--nk-type-body-bold`, `--nk-color-text-strong` |
| count | bluishGrey 12/400; "{n} item" / "{n} items" | #989FB3 | `--nk-type-caption`, `--nk-color-text-tertiary` |
| motion | none (static tiles) | | none |
| tap | push `noon.NoonWishlistCollection` | | toast (collection screen not in the demo) |

## No-collection widget (`NoonWishlistV2NoCollectionWidget`)

| Part | bappzaar | Resolved | Kit |
|---|---|---|---|
| card | stretch, `secondaryBackgroundColor`, 1px dashed `lightGrey`, r24, h 280, mb s32, mx s12; bg image `noon-wishlist-v2-wishlist-collection-overlay-background` cover | | `.noCollection` |
| close | absolute 12 / 12, `antiFlashWhite` r8, padding 6, `noon-wishlist-v2-close-icon` 8 tinted blueGray900 | | `.noCollectionClose` |
| content | center, gap s20, padding s20; `noon-wishlist-v2-wishlist-empty` image; text box 250 wide | | `.noCollectionContent` |
| text | blueGray900 16/400 center "Save, sort into collections & share with anyone" | | `--nk-type-body-large` |
| CTA | row gap 6, padding 14 / px 24; plus icon tinted primaryBlue; 16/600 primaryBlue "Create a new collection" | #0F61FF | `.noCollectionCta` |

## Product box (`NoonProductBoxVertical` with `isWishlist` → `isWishlistCompactView`)

Shared `ProductBoxVertical` gets a `wishlist` prop (same component, as in bappzaar).

| Part | bappzaar | Kit |
|---|---|---|
| hidden in compact view | top tags, quick ATC, colour variants, deal tag, nudges, key highlights, discount (coupon) tags, best price, delivery html, flyout, order again, frenzy deal | `wishlist` → not rendered |
| top-right | `NoonProductBoxCollectionButton` (no favourite heart): whiteAlpha 0.5 circle, mt 8 mr 8, `vertical-three-dot-menu-collection` 16 (+ margin 4, scale 1.2) | `wishlist.topEnd` → `CollectionButton` |
| name / rating / price | unchanged PLP styles | unchanged |
| flag row | `ProductFlag` (express) | Origin `EtaBadge` (kit-wide ETA rule, `src/data/eta.ts`) |
| bottom row | mt 10, px s8, gap s8, row center: ATC + `NoonProductBoxOptionButton` | `wishlist.footer` → `.bottomRow` |
| variant product (`show_wishlist_atc` false) | "View options": `borderGray` bg + border, r8, py 10 px 8, 14/600 primaryBlue → PDP | `WishlistAtc` (Fashion with sizes) |
| out of stock | "Out of stock" `blueGray50` button | not modelled (demo products are in stock) |

### ATC (`NoonProductBoxWishlistAddToCart`, V2)

| Part | bappzaar | Resolved | Kit |
|---|---|---|---|
| button | `borderGray`, r8, h 38, px s8 py s4, gap s4; `plus.svg` 14 primaryBlue; 14/600 primaryBlue "Add to cart" | #EBF4FF / #0F61FF | `.atc` |
| stepper | `borderGray`, 1.2px `paleAzure`, r8, h 36, px s12 py 6, space-between | #BDDBFF | `.stepper` |
| stepper icons | qty 1 → `trash` 16, else `minus` 16, tinted primaryBlue; `plus.svg` 14; hitSlop 10 | | `MaskIcon` |
| qty | 18/500 primaryBlue; `ZoomIn 120` / `ZoomOut 80` per value | | flow type `wishlistText18MediumLh1` |
| motion | FadeIn 140 / FadeOut 90; `LinearTransition` spring mass 1 damping 16 stiffness 180 | | `motion` layout + AnimatePresence |
| tap | `addToCart()` + floating cart store `addItem` | | `addToCart` |

### Share (`NoonProductBoxOptionButton`, V2)

1px `antiFlashWhite`, r8, padding 10; `addressV2-share-icon` 16 tinted blueGray900 → `NoonWishlistCollectionShareScreenV2` overlay. Kit: `.shareButton` → toast (share sheet not in the demo).

## Floating cart (`NoonWishlistV2FloatingCartButton`, `useNoonWishlistV2FloatingCartButton`)

| Part | bappzaar | Kit |
|---|---|---|
| visibility | cart count > 0 (any cart item, not only wishlist ones) | `cart.length > 0` |
| position | absolute, centered, bottom s24 + safe area | `.viewCartWrap` |
| pill | azureBlue, 1px whiteAlpha 0.24, r16, px s16 py s12, gap s10 | `.viewCart` |
| image | the latest cart line image, 32 × 42 white r6 | `ProductImage` |
| texts | gap 2; "View Cart" 16/700 white; "{n} items" 12/400 white (n = cart count) | `.viewCartText` |
| motion | `SlideInDown` / `SlideOutDown` springify damping 16 stiffness 120 mass 0.7 | `wishlistTokens.viewCart.spring` |
| tap | `switchToTab(CART)` (`popToRoot` when already on it) | `nav.switchTab('cart')` |

## Empty (`NoonWishlistV2Empty`)

| Part | bappzaar | Resolved | Kit |
|---|---|---|---|
| layout | header absolute at top (with Create); content centered in the screen | | `EmptyWishlist` (`<Screen overlayHeader>`) |
| art | `noon-wishlist-v2-wishlist-empty-mobile.lottie`, autoplay loop, W × W / 0.75 | 390 × 520 | `<Lottie name="wishlistEmpty">` |
| text block | absolute at art top + 0.55 × art height, 400 wide, centered | | `.emptyText` |
| title | blueGray1000 24 bold "Nothing saved yet" | | `--nk-type-title-large` |
| subtitle | mt s10, blueGray700 15, center, max 240 | #475067 | flow type `wishlistText15RegularLh21` |
| CTA | mt s40; primaryBlue r12 padding 16 / px 24 gap 8; `noon-wishlist-v2-stw-close` 16 rotated 45° white; 16/600 white "Start adding items" → push Search | | `.emptyCta` |

## Skeleton (`NoonWishlistV2ScreenSkeleton`)

Header: 40 × 40 r6 · flex 104 × 24 r6 · 104 × 40 r6 (gap 12, px 12, py 8). Collections: 3 × 126 × 152 r12, gap 12, px 12, mt 16, mb 32. Title 104 × 24 r6, px 12, mb 12. Cards: 2 rows × 2, width (W − 36) / 2, height image (241) + 146, r12, gap 12, px 12. Kit: `<Skeleton>` (`LoadingSkeleton`).

## Options sheet (`NoonWishlistV2CollectionOptionScreen`)

| Part | bappzaar | Kit |
|---|---|---|
| sheet | `OverlayBottomSheet`, transparent content, px s12, mb safe area (or 12); spring damping 28 stiffness 300 | `sheet: { layout: 'floating', surface: transparent }` |
| container | `antiFlashWhite`, r24, padding s8; sections gap s8 | `.optionsCard` |
| section | white, r16, px s12, py s16, gap s24; title blueGray900 16/600 "Organise" | `.optionsSection` |
| item | row, icon 20 + gap s12 + title 16/400 (tinted), arrow `noon-wishlist-v2-arrow-right-option` 20 bluishGrey (red on the danger item), RTL mirrored | `.optionsItem` |
| Organise | shown when ≥ 1 other collection; All Saved Items context → "Add to collection" (`noon-wishlist-v2-copy-icon`) → `NoonMoveCopyScreen` | toast (move / copy not in the demo) |
| Remove | "Remove item", `noon-wishlist-v2-delete-icon`, dangerRed → `fullDeleteItems` + snackbar "Removed from **Wishlist**" with the product image, close | `toggleWishlist` + `nav.toast` + `nav.back` |

## Not ported

Collection screen, naming / rename / delete sheets, move / copy screen, share sheet, collection manager, floating error bar (collection limit), pull to refresh, load more.
