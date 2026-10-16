# PDP: bappzaar master → kit token mapping

Source: `bappzaar` **origin/master** (fetched 2026-10-11, `d481712d6d9`). Entry: `noon.DynamicLoaderBlankHeaderScreen` → product `detail` → `marketplaces/noon/components/NoonProductDetails/NoonProductDetails.tsx` (`renderContent()` CompoundFlatList + `render()` header / sticky bar).

How to read the tables:

- **Kit token** is what the PDP CSS/TSX uses. `--nk-color-*`, `--nk-space-*`, `--nk-radius-*`, `--nk-type-*` and `--nk-shadow-*` are global tokens (`src/foundations/tokens.ts`). `--nk-palette-*` is the raw bappzaar palette (`src/foundations/palette.ts`, same names as `NoonTokens.colors`). Any key with a `pdp` prefix (`--nk-type-pdp-*`, `--nk-layout-pdp-*`, `--nk-radius-pdp-*`, `--nk-space-pdp-*`, `--nk-color-pdp-*`, `--nk-shadow-pdp-*`) is defined in `src/flows/pdp/tokens.ts` → `pdpFlowTokens`. JS-only numbers (motion, thresholds, ratios) are in `pdpTokens`.
- RN text with no `lineHeight` maps to a `pdp*` type token with `line: 'normal'`.
- Base RN `Text` (`NoonStyles.baseTextStyle`) is 13px `charcoalGreyColor` #404553 → `--nk-type-pdp-text13` + `--nk-palette-charcoal-grey-color`. Anything without its own colour inherits this.
- **SD** = server-driven (PDP API `product` / `offer`). The demo value is in `data.ts`.

FeatureFlags (`src/utils/FeatureFlags.ts`) are A/B buckets from the server. With no bucket every `checkVariant` returns false, so the defaults below are the live ones:

| Flag | Default | Effect used |
|---|---|---|
| `isNavyBuyNowButtonEnabled` / `isBuyNowV2` (`buy_now_variant` 2/6) | off | Buy Now = white, 1px `accentColor` border, `accentColor` text |
| `isBestSellerTagEnabled` | off | No "Best Seller" NoonTag in gallery footer |
| `isHideNudgesEnabled` | off | Nudge ticker shown next to deal tag |
| `getPDPATCPopupRecommendationsVariant` | 0 | Quick-cart sheet shows **no** recommendations (variants 1/2 add "Customers Also Viewed"). The kit `added` screen takes `recsVariant` to show them |
| `showChatbotEntryPoint` (`pdp_chatbot` ≠ 0) | on | Chatbot entry needs SD `chatbotWidgetQuestions` → skipped |
| `isPDPOfferSelectionEnabled` | off | n/a (offer code source) |

## Render order (master `renderContent`, default flags, realistic SD data)

1. Gallery (`NoonGallery`) with parallax: translateY = scrollY and scale [-50,0,h/4,h/2,h] → [1.1,1,.95,.9,.9]
2. `NoonProductInfo` (marginTop −20 over the gallery)
3. ~~Customise / available bundles / installation service~~ (SD, skipped)
4. Delivery Information (`NoonSectionCard` + `NoonEstimatedDeliveryPdp`)
5. ~~Newer model banner / CMS top / combo bundle / freebies / chatbot questions~~ (SD, skipped)
6. `NoonPaymentsForYou` (SD `payment_offers`)
7. Variants card (`NoonSizeVariantSelection` + `NoonOptionsSelection`)
8. ~~`NoonWarrantyOffers`~~ (SD extended-warranty plans, skipped)
9. `NoonPdpReinforcement` (SD `offer_badges` ≥ 2)
10. Product Overview (`NoonProductOverview`: Description / Highlights / Specifications accordions; AI summary is SD and skipped)
11. Additional Information (`NoonShippingInfo`)
12. ~~Refund 2x banner / category best-seller CTA~~ (SD, skipped)
13. Seller + other offers (`NoonSeller` + `NoonDashedBorder` + `NoonOffers`)
14. ~~CMS mid / rich-content "Product Features" / Frequently Bought Together~~ (SD, skipped)
15. Ratings & Reviews (`NoonCustomerReviews`)
16. `NoonRecommendations` "More from {{brandName}}" then "Customers Also Viewed"
17. Sticky bar: `NoonBackToTop` · `NoonInCartLabel` · ~~`NoonLimitedTimeDeal`~~ (SD deal) · `NoonAddToCartQuantity` (+ `NoonQuantitySelector`)

List content padding bottom 64 (`compoundFlatListContentContainerStyle`) → `--nk-layout-pdp-list-bottom`.

## 1. Screen + header

| bappzaar | Property | Master | Kit token |
|---|---|---|---|
| NoonProductDetails/styles.ts `container` | bg | secondaryBackgroundColor #F9F9FB | flow `colors.bgPage` → `--nk-color-bg-page` (= `--nk-palette-secondary-background-color`) |
| `whiteContainer` (header not transparent) | bg | white | `--nk-color-bg-surface` |
| `header` / `headerInner` | height | 55 / 50 (+ status bar) | `--nk-layout-pdp-header-height` / `--nk-layout-pdp-header-inner` |
| NoonScreenWithDrawBehindHeader `headerInner` | padding-x / padding-bottom / align | 8 / 6 / flex-end | `--nk-space-s8` / `--nk-space-s6` |
| `headerLeft` / `headerRight` | height | 34 | `--nk-layout-pdp-header-buttons` |
| `headerChangeAfter` | threshold | 150 − headerHeight(50) = 100px | `pdpTokens.headerChangeAfter`, `pdpTokens.headerInnerHeight` |
| `animateHeaderBackground` | bg | rgba(255,255,255,0→1), 200ms ease-in-out | `--nk-palette-white-alpha0` → `--nk-color-bg-surface`, `pdpTokens.headerFadeMs` |
| `headerBorder` (scrolled) | border-bottom | 1px `$borderColor` #f0f2f7 | `--nk-palette-border-color` |
| `headerBackButton` | margin-start / bg / border | 8 / whiteAlpha(.9) / 1px antiFlashWhite | `--nk-space-s8` / `--nk-palette-white-alpha90` / `--nk-color-border-subtle` |
| NoonPressableIcon `container` | size / radius | 40 / 25 | `--nk-layout-pdp-icon-button` / `--nk-radius-pdp-r25` |
| `backButtonIcon` | size / tint | 20 / neutralBlack | 20 (`--nk-layout-pdp-icon20`) · asset `back.webp` |
| NoonExpandableSearch `container` | flex 1, align end, mx | 8 | `--nk-space-s8` |
| `searchContainer` | height / py / pe / radius / border / bg | 40 / 8 / 12 / 32 / 1px antiFlashWhite / whiteAlpha(.9) | `--nk-layout-pdp-search-height` / `--nk-space-s8` / `--nk-space-s12` / `--nk-radius-r32` / `--nk-color-border-subtle` / `--nk-palette-white-alpha90` |
| `searchText` | font / colour | 14/600 / blueGray900 | `--nk-type-pdp-text14-semibold` / `--nk-color-text-primary` |
| expand spring | damping/stiffness/mass | 30/400/1 | `pdpTokens.searchSpring` |
| NoonPDPHeaderRightContent `container` | gap / margin-end | 8 / 8 | `--nk-space-s8` |
| `icon` + PDP `iconStyle` | bg / border | whiteAlpha(.9) / 1px antiFlashWhite | `--nk-palette-white-alpha90` / `--nk-color-border-subtle` |
| `favouriteIcon` | size | 32 | `--nk-layout-pdp-heart` · assets `favourite.webp`, `favourite-active-v2.webp` (24 inside) |
| share | icon | arrowUpTray 20 | `arrow-up-tray.webp` |
| search icon | icon | searchBar 20 | `search-bar.webp` |

Copy: `noon_search` "Search".

## PDP scroll (bappzaar master `cae2f69afbb`, NoonProductDetails · NoonScreenWithDrawBehindHeader · NoonProductUtil)

| Master | Behaviour | Kit |
|---|---|---|
| `CompoundFlatList onScroll` → `NativeAnimated.event` (native driver) | One scroll position drives everything below; nothing re-renders per frame | `useScroll` MotionValue + `<Screen onScroll>`; state only flips on thresholds |
| `NoonProductUtil.translateYGallery` `[0, 1, h] → [0, 1, h]` clamp | The gallery stays put for one image height while the cards scroll over it, then leaves with the page | `SfGallery` `.pin` / sticky `.section` (compositor, no per-frame JS translate) |
| `NoonProductUtil.scaleGallery` `[−50, 0, h/4, h/2, h] → [1.1, 1, 0.95, 0.9, 0.9]` | Pull-down zooms to 1.1; scrolling shrinks to 0.9 by half the image; section is transparent so the page grey shows round it | `useTransform(scrollY, …)`, `pdpTokens.parallax`, transparent `.section` |
| `NoonScreenWithDrawBehindHeader` `headerChangeAfter = pdpHeaderChangeAfter()` (150) − header height | Past it the header background fades transparent → white (200ms, `Easing.inOut(Easing.ease)`), a 1px `$borderColor` bottom border appears, status bar goes dark; back up restores it | `DetailScreen` `solid` (150 − 50) → `SfHeader` (`headerFadeMs`, `headerEase`, `[data-solid]` hairline) |
| `bottomWrapper` (marginTop −20) + `galleryBottomBackground` (absolute fill, #F9F9FB, translateY = image height) | Everything after the gallery starts 20 above its bottom edge and slides up as one opaque page-grey sheet from that edge down, so the pinned image is only visible above the content, never between cards; the gallery itself ends in a 10px transparent → #F9F9FB fade (`fadeWrapper`) | `DetailScreen` `.rest` (−(20 + the first card's 8)), `.rest::before` grey layer, `SfGallery .fade` |
| `NoonExpandableSearch shouldExpand={!isHeaderTransparent}` | The search button springs open to the full width when the header turns white (damping 30, stiffness 400, mass 1) | `SfHeader` `ExpandableSearch` (`pdpTokens.searchSpring`) |
| `onScroll`: `currentYOffset > screenHeight` → `showBackToTop` | "Back to top" shows after one screen height, hidden while the qty selector is open; it mounts and unmounts with no transition; tap → `scrollToOffset(0, animated)` | `showTop` (`backToTopAfter = deviceHeight`) → `SfAtcBar`, no enter/exit animation; tap reveals the tab bar and smooth-scrolls to 0 |
| `BottomTabScrollVisibilityProvider` (`onScroll`, `onScrollEndDrag`, `onMomentumScrollEnd`) | Same rules as the PLP: shown above 150 / at the top, hides after 64 of continuous scroll down, shows after 24 up, dead zone 4, flick ±2 pt/ms, never within 20 of the end; native hide 0.15s ease-out | `src/kit/tabBarScroll.ts` `useTabBarScrollHide` (shared with the PLP) |
| `NoonNativeStickyBar placement="embedded"`, `ScreenView bottomOffset` | The QTY · Buy now · Add to cart bar floats over the list and follows the tab bar down when it hides | `Screen overlay` `.stickyBar` translateY(`--pdp-tab-hide` × tab height); list padded by the measured bar height |
| `scrollAfterAccordionOpen` (NoonProductOverview `onAccordionOpen`) | Opening an overview accordion scrolls the page +120 over 150ms | `SfProductDetails onAccordionOpen` → `scrollBy` in `DetailScreen` |
| `scrollToNewerModelBanner` (offset − 70), `scrollToInstallationService` | Anchor scrolls for OOS newer-model / installation banners | not ported (no such entry points in the kit PDP) |

Not ported: pull-to-refresh (`refreshControl`), `scrollToTopListener` (tab re-tap), iOS bounce.

## 2. Gallery (`NoonGallery`)

| bappzaar | Property | Master | Kit token |
|---|---|---|---|
| NoonMetrics `productImageHeightNoon` | height | screenWidth × 1.2 | `pdpTokens.galleryRatio` |
| `container` | bg | white | `--nk-color-bg-surface` |
| `imageOverlay` | overlay | blackAlpha(.02) | `--nk-color-image-overlay` |
| `galleryBottomBackground` | bg below | #F9F9FB | `--nk-color-bg-page` |
| `fadeWrapper` | bottom fade | 10px, #F9F9FB00 → #F9F9FB | `--nk-layout-pdp-gallery-fade`, `--nk-palette-secondary-background-color-transparent` → `--nk-color-bg-page` |
| `footerContainer` / `galleryFooter` | bottom / padding-x | 30 / 20 | `--nk-layout-pdp-gallery-footer-bottom` / `--nk-space-s20` |
| `pageControl` | bottom / gap | 30 / 6 | `--nk-layout-pdp-gallery-footer-bottom` / `--nk-space-s6` |
| NoonMediaPageController `itemsContainer` | padding / bg / radius | 2·6 / whiteAlpha(.4) / 20 | `--nk-space-s2` `--nk-space-s6` / `--nk-palette-white-alpha40` / `--nk-radius-r20` |
| `dotContainer` | width | 12 (active 14), square | `pdpTokens.dots.container` / `.containerActive` |
| `AnimatedDot` | size | max(4, 6 − \|i−active\|) | `pdpTokens.dots.max/min/step` |
| dot active | width / colour | 12 / black | `pdpTokens.dots.activeWidth` / `--nk-palette-black` |
| `pageControlIndicator` | colour | primaryAlpha(.25) | `--nk-palette-primary-alpha25` |
| dot anim | timing | 150ms ease-out | `pdpTokens.dots.ms` |
| visible dots | count | 5 | `pdpTokens.dots.visible` |
| NoonTag `container` | border / radius | 1px blackCow / r8 | `--nk-palette-black-cow` / `--nk-radius-r8` |
| NoonTag `tagInner` | padding / gradient | 3·8 / #666666 → #000000 (x) | `--nk-space-pdp-s3` `--nk-space-s8` / `--nk-palette-catalog-tag-gradient-start` → `-end` |
| NoonTag `tagText` | font / colour | 14/500 / white | `--nk-type-pdp-text14-medium` / `--nk-color-text-inverse` |

SD: `catalog_tag` = product.tag ("Top Rated"). Images: the kit has no product photos, so it shows `ProductImage` emoji slides (`data.ts gallerySlides`).

## 3. Product info (`NoonProductInfo`)

| bappzaar | Property | Master | Kit token |
|---|---|---|---|
| PDP `bottomWrapper` | margin-top | −20 | `--nk-layout-pdp-info-overlap` |
| NoonProductInfo `container` | bg / radius / mx / mb | lightBlueInfoBg #E8F1FF / 16 / 12 / 12 | `--nk-color-bg-store-strip` / `--nk-radius-r16` / `--nk-space-s12` |
| `card` + NoonSectionCard | bg / radius / padding / gap | white / 16 / 12 / 12 | `--nk-color-bg-surface` / `--nk-radius-r16` / `--nk-space-s12` |
| NoonStoreHeader `container` | py / mx | 12 / 12 | `--nk-space-s12` |
| `brandText` | font / colour | 16/700 / accentBlue | `--nk-type-pdp-text16-bold` / `--nk-color-brand-blue` |
| `brandStoreIcon` (official) | size | 17 | `tick.webp` 17 (`--nk-layout-pdp-icon17`) |
| `arrowIcon` | tint | accentBlue | `right-chevron.webp` 20, CSS mask → `--nk-color-brand-blue` |
| (master has **no** "Visit store" label) | | | removed |
| `descriptionContainer` | gap | 4 | `--nk-space-s4` |
| `productTitle` (overrides NoonTextToggle 18/20) | font / colour / lines | 16/500/20 / charcoalNavy / 2 + toggle | `--nk-type-pdp-title` / `--nk-color-text-strong` |
| NoonTextToggle `container` / `arrowContainer` | gap / margin-right | 6 / 6 | `--nk-space-s6`; `down-arrow.webp`/`up-arrow.webp` 20 |
| `ratingPrepaidContainer` | gap | 4 | `--nk-space-s4` |
| NoonProductRating `container` | bg / radius / py / px / gap | softGray / 6 / 2 / 6 → PDP `ratingContainer` height 26, px 4 | `--nk-color-bg-pill` / `--nk-radius-r6` / `--nk-space-s2` / `--nk-space-s4` / `--nk-layout-pdp-pill-height` |
| `ratingStarImage` | size / tint | 11 / noonReviewColorV2(rating) | `noon-rating-star-white.webp` 11 (`--nk-layout-pdp-icon11`); tint `--nk-color-star-*` |
| `ratingTextStyle` | font / colour | 14/700 / charcoalNavy | `--nk-type-pdp-text14-bold` / `--nk-color-text-strong` |
| `ratingCountStyle` | font / colour | 14/600 / gray800 | `--nk-type-pdp-text14-semibold` / `--nk-color-text-body` |
| `pricingMetaContainer` | gap | 8 | `--nk-space-s8` |
| PriceDiscounted `container` | layout | row, wrap, baseline | – |
| `noonSellingPrice` / `noonSaleCurrency` | font / colour | 22/700/24 / charcoalNavy | `--nk-type-pdp-price` / `--nk-color-text-strong` |
| PriceDiscounted `salePrice` | margin-right | 4 | `--nk-space-s4` |
| `discountRow` | margin-top / align | 4 / center | `--nk-space-s4` |
| `noonPreReductionPrice` | font / colour | 16/400/22 / slateGray, line-through (no currency) | `--nk-type-body-large` / `--nk-color-text-secondary` |
| `noonDiscountTag` (+ Discount `discount`) | font / colour / bg / padding / ms | 14/600 / greenOff / white / 2·3 / 4 | `--nk-type-pdp-text14-semibold` / `--nk-color-discount-bright` / `--nk-color-bg-surface` / `--nk-space-s2` `--nk-space-pdp-s3` / `--nk-space-s4` |
| `vatMessage` | font / colour / ms | 14 / slateGray / 4 | `--nk-type-pdp-text14` / `--nk-color-text-secondary` / `--nk-space-s4` |
| PriceDiscounted `info` / `infoIcon` | ms / size / tint | 5 / 18 / slateGray (only with SD `was_price_source`) | `--nk-space-pdp-s5` / `--nk-layout-pdp-icon18` / `--nk-color-text-secondary` · `info.webp` |
| NoonKeyHighlights big `unitInfoWrapperBig` | bg / radius / py / px | softGray / 6 / 4 / 6 | `--nk-color-bg-pill` / `--nk-radius-r6` / `--nk-space-s4` / `--nk-space-s6` |
| `bigStylesheet.p` / `.divider` | font / colour | 14 slateBlueGray / 11 lightGrey | `--nk-type-pdp-text14` `--nk-color-text-muted` / `--nk-font-size-caption` `--nk-color-border-strong` |
| `dealNudgeContainer` | gap | 6 | `--nk-space-s6` |
| NoonDealTagPdp `dealTag` | radius / py / px / bg / colour / font | 4 / 2 / 6 / defaultTagColor / defaultTagTextColor / 13/600 | `--nk-radius-r4` / `--nk-space-s2` / `--nk-space-s6` / `--nk-palette-default-tag-color` / `--nk-palette-default-tag-text-color` / `--nk-type-pdp-text13-semibold` |
| `nudgeContainer` | gradient / radius / py / px | softGray → white (diag) / 5 / 2 / 5 | `--nk-color-bg-pill` → `--nk-color-bg-surface` / `--nk-radius-pdp-r5` / `--nk-space-s2` / `--nk-space-pdp-s5` |
| `nudgeTagContainer` | height | 20 | `--nk-layout-pdp-nudge-height` |
| NoonNudgeTag `container` | padding-end | 8 | `--nk-space-s8` |
| `nudgeText` (over NudgeItem 12/20) | font / colour / ml | 14/500/20 / gray800 / 5 | `--nk-type-pdp-nudge` / `--nk-color-text-body` / `--nk-space-pdp-s5` |
| `nudgeIcon` | size | 14 | – (SD icon, demo has none) |
| ticker | enter / hold / exit | 400 / 1000 / 550 ms, offset 20 | `pdpTokens.nudge` |
| `discountFouponContainer` | gap | 8 (only when SD `best_price` empty) | `--nk-space-s8` |
| NoonDiscountTag `couponCodeTag` | border / radius / py / px / bg / gap | 1px dashed oliveGray #1F7A7466 / 8 / 6 / 8 / mintCream / 8 | `--nk-palette-olive-gray` / `--nk-radius-r8` / `--nk-space-s6` / `--nk-space-s8` / `--nk-palette-mint-cream` / `--nk-space-s8` |
| `couponCodeTagTextStyle.p` / `comma` | font / colour | 14/600 / blueGray900 | `--nk-type-pdp-text14-semibold` / `--nk-color-text-primary` |
| icons | | discountTag 24, rightChevron 20 | `discount-icon.webp`, `right-chevron.webp` |
| NoonDiscountTagsList `couponList` | gap | 8 (h-scroll) | `--nk-space-s8` |
| NoonPDPBestPriceTagV2 `container` | gap | 8 | `--nk-space-s8` |
| `price` / `priceCurrency` | font / colour | 24/700/28 / black | `--nk-type-pdp-best-price` / `--nk-palette-black` |
| `gradient` | bg / radius / height / px | 269° bestPriceGradientStart → End (0.88%, 99.12%) / 6 / 26 / 6 | `--nk-palette-best-price-gradient-start/-end` / `--nk-radius-r6` / `--nk-layout-pdp-pill-height` / `--nk-space-s6` |
| `content` | gap | 4 | `--nk-space-s4` |
| `htmlText.p` / `.highlight` | font / colour | 14/500/18 · 14/700/18 / grass700 | `--nk-type-product-title` / `--nk-type-body-bold` / `--nk-color-best-price-ink` |
| `leadingIcon` / `trailingIcon` | size / tint | 16 / grass700 | `discount-tag-filled.webp`, `right-chevron.webp` (`--nk-layout-pdp-icon16`) |
| `priceDiscountedV2` | margin-top | 2 | `--nk-space-s2` |
| `salePriceV2` / `saleCurrencyV2` | font / colour | 18/500/24 / gray800 | `--nk-type-pdp-sale-v2` / `--nk-color-text-body` |
| `priceV2` | font / colour | 16/400/20 / bluishGrey | `--nk-type-text16-regular-lh20` / `--nk-color-text-tertiary` |
| `discountV2` | font / colour / bg / ms | 14/600/18 / irishGreen / white / 4 | `--nk-type-body-semibold` / `--nk-palette-irish-green` / `--nk-color-bg-surface` / `--nk-space-s4` |

SD: `best_price.tag_v2` (p2: "<highlight>Best price</highlight> with coupon", AED 4,084), `key_highlights`, `deal_tag` ("Limited Time Deal" for p2), `nudges`, `discount_tags` (products without best price, e.g. p1 "Extra 10% off on ADCB cards"). Copy `noon_rating` "ratings", `off` "{{value}}% OFF", `vat_message` "(Incl. VAT)".

## 4. Delivery Information

| bappzaar | Property | Master | Kit token |
|---|---|---|---|
| NoonSectionCard | card | white / r16 / p12 / mb12 / mx12 | `.card` in `pdp.module.css` |
| `deliveryInfoContent` | gap | 12 | `--nk-space-s12` |
| `deliveryEstimateHeaderContainer` | height / layout | 22 / row space-between | `--nk-layout-pdp-delivery-header` |
| `deliveryInfoTitle` | font / colour | 16/700 / charcoalNavy | `--nk-type-pdp-text16-bold` / `--nk-color-text-strong` |
| `noonOneIconWrapper` / `memberText` | gap / font / colour | 4 / 12 / slateGray | `--nk-space-s4` / `--nk-type-pdp-text12` / `--nk-color-text-secondary` · `noon-one.webp` 34×20 |
| NoonDeliveryInfoItem `container` | padding / bg / radius / gap | 12 / #F9F9FB / 12 / 6 (row+col), wrap, space-between | `--nk-space-s12` / `--nk-color-bg-subtle` / `--nk-radius-r12` / `--nk-space-s6` |
| `wrapper` | gap | 8 | `--nk-space-s8` |
| ProductFlag expressPdp | image | 70×22 | `express-pdp-en.webp` (`--nk-layout-pdp-express-w/-h`) |
| NoonDeliveryText `p` / `b` | font / colour | 15/600/24 / blueGray900 | `--nk-type-pdp-delivery` / `--nk-color-text-primary` |
| NoonCountDown `container` / `countdownText` | bg / radius / padding / font / colour | lightBrownShade / 4 / 4 / 12/600 / darkOrange | `--nk-palette-light-brown-shade` / `--nk-radius-r4` / `--nk-space-s4` / `--nk-type-pdp-text12-semibold` / `--nk-palette-dark-orange` |

SD: `estimated_delivery` (p2 "Get it <b>Today</b>"), `estimated_delivery_expires` → "Order in 3h 12m". Loyalty member badge shown (demo user is a noon One member). Copy `noon_delivery_info`, `noon_member`, `noon_delivery_text_order_in`, `noon_delivery_text_hours/minutes`.

## 5. Payments for you (`NoonPaymentsForYou`)

| bappzaar | Property | Master | Kit token |
|---|---|---|---|
| `paymentsContainer` | gap | 12 | `--nk-space-s12` |
| list | gap | 8 | `--nk-space-s8` |
| item width | | full = sw − 48; >1 items → full − 8 − 50 (peek) | `pdpTokens.payments` |
| NoonPaymentsForYouItem `container` | border / padding / radius / gap | 1px lightGreyColor / 8 / 12 / 12 | `--nk-color-border` / `--nk-space-s8` / `--nk-radius-r12` / `--nk-space-s12` |
| `image` | size | 90×60 contain | `--nk-layout-pdp-payment-w/-h` · `tabby.webp`, `tamara.webp` |
| `defaultHtmlStyle` p / b / a | font / colour | 14 neutralBlack / bold / 600 accentBlue | `--nk-type-pdp-text14` `--nk-color-text-ink` / 700 / `--nk-color-brand-blue` |

SD: `payment_offers.title` + items (demo "Payments for you", tabby/tamara messages).

## 6. Variants

| bappzaar | Property | Master | Kit token |
|---|---|---|---|
| `variantsContent` (sizes **and** options) | gap | 24 | `--nk-space-s24` |
| NoonSizeVariantSelection `container` | gap | 12 | `--nk-space-s12` |
| `title` | font / colour | 15/700 / charcoalNavy | `--nk-type-pdp-text15-bold` / `--nk-color-text-strong` |
| `sizeGuideText` / `arrow` | font / colour / icon | 13/600 / accentBlue / chevron 16 | `--nk-type-pdp-text13-semibold` / `--nk-color-brand-blue` |
| NoonOptionsSelection `optionsContainer` / `container` | gap | 24 / 12 | `--nk-space-s24` / `--nk-space-s12` |
| `title` / `selectedVariantName` | font / colour | 14/600 blueGray900 / 14/500 blueGray700 | `--nk-type-pdp-text14-semibold` `--nk-color-text-primary` / `--nk-type-pdp-text14-medium` `--nk-color-text-muted` |
| `infoContainer` / `infoText` | gap / font / colour | 2 / 13/600 / accentBlue | `--nk-space-s2` / `--nk-type-pdp-text13-semibold` / `--nk-color-brand-blue` · `info.webp` |
| NoonSelectionItem `wrapper` | margin-end / padding-top | 12 / 4 | `--nk-space-s12` / `--nk-space-s4` |
| `item` | border / radius / padding / min-width | 1px lightGreyColor / 12 / 12 / sw × .15 | `--nk-color-border` / `--nk-radius-r12` / `--nk-space-s12` / `pdpTokens.variantMinWidth` |
| chip width (image or priced) | | sw × .3 | `pdpTokens.variantChipWidth` |
| `itemWithImage` | padding | 8 12 12 | `--nk-space-s8` `--nk-space-s12` |
| `imageContainer` / `image` | radius / mb / size | 12 / 8 / 77×88 | `--nk-radius-r12` / `--nk-space-s8` / `--nk-layout-pdp-variant-image-w/-h` |
| `itemSelected` | border | 1.5px paleAzure | `--nk-color-border-info`, width `--nk-layout-pdp-border-selected` |
| `itemDisabled` + `itemOutOfStock` | border / bg | 1px dashed lightGrey / #F9F9FB | `--nk-color-border-strong` / `--nk-color-bg-subtle` |
| `text` / `textSelected` / `textDisabled` | font / colour | 14/500 blueGray900 centre / 600 / bluishGrey | `--nk-type-pdp-text14-medium` `--nk-color-text-primary` / 600 / `--nk-color-text-tertiary` |
| `dashedBorderContainer` | margin-y / colour | 8 / blueGray200 (disabled lightGreyColor) | `--nk-space-s8` / `--nk-palette-blue-gray200` |
| `salePriceText` | font / colour / mt / mb | 13/600 / blueGray900 / 2 / 4 | `--nk-type-pdp-text13-semibold` / `--nk-color-text-primary` |
| `priceText` / `discountPercentageText` | font / colour | 12 bluishGrey strike / 12/600 deepGreen | `--nk-type-pdp-text12` `--nk-color-text-tertiary` / `--nk-type-pdp-text12-semibold` `--nk-color-success` |
| `priceContainer` | gap / mt | 2 / 2 | `--nk-space-s2` |
| `outOfStockTextNewVariant` | font / colour | 11/600/20 / bluishGrey, uppercase | `--nk-type-pdp-oos` / `--nk-color-text-tertiary` |
| NoonBestValueTag `container` / `body` | start / height / radius / padding | −6 / 14 / 5 (top-start) / 8·4 | `--nk-layout-pdp-best-value-offset` / `--nk-layout-pdp-best-value-height` / `--nk-radius-pdp-r5` / `--nk-space-s8` `--nk-space-s4` |
| `text` | font | 8/800/14 italic uppercase | `--nk-type-pdp-best-value` |
| colours | bg / fold / text | azureBlue / azureBlueDark / white | `--nk-color-primary-bright` / `--nk-palette-azure-blue-dark` / `--nk-color-text-inverse` · fold + tip SVG paths copied verbatim (geometry) |

SD: `groups` (p2 "Colour Name" images + "Internal Memory" with prices; 512 GB tagged "Best value"), `variants` (fashion sizes). Copy `noon_size`, `noon_size_guide`, `noon_learn_more`, `noon_out_of_stock_item`, `off`.

### Variant selection behaviour (bappzaar master `cae2f69afbb`)

| Master | Behaviour | Kit |
|---|---|---|
| `NoonProductUtil.getVariant` / `findInitialVariantAndOffer` | PDP opens with the **first in-stock size** selected; there is no "select a size" step on the PDP | `initialSelection()` in `DetailScreen.tsx` |
| `NoonSizeVariantSelection` → `onSelectVariant(sku)` → `setProductData(content, '', sku)` | Size tap switches the variant locally: no fetch, no loader; offer (price, delivery, stock) follows; qty clamped to stock | `onSelect('size', i)` → `setSelection` |
| `NoonOptionsSelection` → `onSelectOption(sku, offerCode)` → `CatalogService.getProductBySKU` | Option tap (colour / memory / model / version) refetches that SKU; `isSelectOptionLoading` lays `loaderWrapper` (absolute fill, white, opacity .8, `Loader`) over the option groups only; then the **same page updates in place** (no navigation, scroll kept), reviews reload, the previously selected size is kept when the new SKU has it | `optionsLoading` + `SfVariantsCard loading` (`.options` / `.loader`, 600ms mock latency); `setProductId` in place; option prices drive the price block (`shown`) |
| (kit) in-place switch, scroll position | The sections above the picker differ in height between SKUs, so a plain re-render moves the picker on screen | `DetailScreen` records the picker's screen top before `setProductId` and corrects `scrollTop` in a layout effect (no visible jump); the tab bar controller is rebased so the correction doesn't show / hide the bars |
| `NoonSelectionItem` `disabled={isDisabled \|\| isSelected}` | Selected and out-of-stock tiles aren't tappable; an OOS tile that is the current SKU keeps a solid border (`itemSelected` needs `!isDisabled`, `itemDisabled` needs `!isSelected`) | `Tile` `disabled`, `data-state="current-disabled"` |
| `OptionGroup` `availableOptions.length === 0` | A group with no available option is hidden | `Group` returns null |
| `HorizontalScrollView selectedIndex` (no `scrollOnSelectedIndexChange`) | Each row scrolls its selected tile into view once it has laid out, not on later taps | `Group` `useLayoutEffect` on `options` |
| `useCart.handleIncreaseQuantity` (`variant_overlay_url`) → `showVariantsFlyout` | A product box "+" for a sized product opens the variants overlay instead of adding | `QuickAdd` → `nav.sheet('pdp/variants')` for Fashion with sizes |
| `NoonVariantsOverlayScreen` (`useVariantOverlay shouldPreselectVariant: false`) | No size preselected; OOS sizes dashed and untappable; ATC without a size → title "Please select the size" (errorMessageColor, uppercase) + `NoonShakingWrapper` (−10, 10, −8, 8, −5, 5, 0 · 50ms each); picking a size clears it; success closes the overlay and shows the "Added to cart" snackbar (3s) | `VariantsSheet.tsx`: `size = -1`, `data-disabled`, shake keyframes over 0.35s, `nav.back()` + `nav.toast(copy.addedToCart)` |

Not ported: analytics (`sku_variant_click`, `vs`, `atc_sz_miss`), the sizing-guide web view (toast), stock-based qty clamping (mock products have no stock), the URL keeps the first product id after an in-place switch.

## 7. PDP reinforcement (`NoonPdpReinforcement`)

| bappzaar | Property | Master | Kit token |
|---|---|---|---|
| item width | | (sw − 48 − 8 × (n−1)) / n (n ≥ 4 → 3.5) | `pdpTokens.reinforcement` |
| list gap | | 8 | `--nk-space-s8` |
| `item` | border / px / py / radius / gap | 1px antiFlashWhite / 8 / 14 / 12 / 4 | `--nk-color-border-subtle` / `--nk-space-s8` / `--nk-space-s14` / `--nk-radius-r12` / `--nk-space-s4` |
| `icon` | size | 28 | `--nk-layout-pdp-icon28` |
| `text` | font / colour | 12/600 / charcoalNavy, centre, 2 lines | `--nk-type-pdp-text12-semibold` / `--nk-color-text-strong` |

SD: `offer_badges` (demo: "15 days free returns", "1 year warranty", "TDRA approved" using `returnable.webp`, `warranty.webp`, `verified-filled.webp`).

## 8. Product Overview

| bappzaar | Property | Master | Kit token |
|---|---|---|---|
| `overviewContainer` / `overviewContent` | gap | 12 / 8 | `--nk-space-s12` / `--nk-space-s8` |
| NoonSectionCard `headerText` | font / colour | 16/700 / charcoalNavy | `--nk-type-pdp-text16-bold` / `--nk-color-text-strong` |
| NoonAccordion `container` | radius | 12, overflow hidden | `--nk-radius-r12` |
| `header` | padding / bg | 16·12 / #F9F9FB | `--nk-space-s16` `--nk-space-s12` / `--nk-color-bg-subtle` |
| `titleWrap` / `titleText` | pr / font / colour | 12 / 14/600 / black | `--nk-space-s12` / `--nk-type-pdp-text14-semibold` / `--nk-palette-black` |
| `chevron` | size / anim | 16 / rotate 180°, 150ms; height 150ms | `chevron-down.webp` (`--nk-layout-pdp-icon16`) / `pdpTokens.accordionMs` |
| `contentInner` | bg / mt | #F9F9FB / 1 | `--nk-color-bg-subtle` / `--nk-space-pdp-s1` |
| `accordionContent` | padding | 0 12 12 | `--nk-space-s12` |
| initial | | all closed | – |
| NoonOverview `container` / html | pt / font / colour | 8 / 14/18 / charcoalNavy | `--nk-space-s8` / `--nk-type-body` / `--nk-color-text-strong` |
| NoonHighlights `featureContainer` / `icon` / `feature` | pt / margin / font | 8 / 8·4 / 14/18 charcoalNavy | `--nk-space-s8` / `--nk-space-s8` `--nk-space-s4` / `--nk-type-body` · `circle-point.webp` 4 |
| NoonSpecifications `row` | gap / py | 16 / 12 | `--nk-space-s16` / `--nk-space-s12` |
| `itemName` / `itemValue` | width / font / colour | 30% / 13/16 slateBlueGray · 13/16 charcoalNavy | `--nk-type-text13-regular-lh16` / `--nk-color-text-muted` · `--nk-color-text-strong` |

Copy `noon_product_overview`, `noon_description`, `noon_highlights`, `noon_specifications`. SD: `long_description`, `feature_bullets`, `specifications`.

## 9. Additional Information (`NoonShippingInfo`)

| bappzaar | Property | Master | Kit token |
|---|---|---|---|
| `shippingInfoContainer` / `shippingInfoContent` | gap | 12 / 8 | `--nk-space-s12` / `--nk-space-s8` |
| NoonShippingItem `container` | py / px / bg / radius / gap | 12 / 10 / #F9F9FB / 8 / 8 | `--nk-space-s12` / `--nk-space-s10` / `--nk-color-bg-subtle` / `--nk-radius-r8` / `--nk-space-s8` |
| `image` | size | 22 | `--nk-layout-pdp-icon22` · `warranty.webp`, `returnable.webp`, `verified-filled.webp` |
| `text` | font / colour | 14 / darkNavy | `--nk-type-pdp-text14` / `--nk-palette-dark-navy` |
| arrow | | rightChevron 20 | `right-chevron.webp` |

Copy `noon_additional_info`. SD: `warranty`, `return_policy.text`, `tdra_approval.message`.

## 10. Seller + offers

| bappzaar | Property | Master | Kit token |
|---|---|---|---|
| `sellerAndOffersContent` | gap | 16 | `--nk-space-s16` |
| NoonSeller `sellerRow` | gap | 10 | `--nk-space-s10` |
| `logo` | size / radius / border | 54 / 10 / 1px sellerLogoBorder | `--nk-layout-pdp-seller-logo` / `--nk-radius-r10` / `--nk-palette-seller-logo-border` · `seller-logo.webp` |
| `nameContainer` / `sellerNameRow` | gap | 6 / 2 | `--nk-space-s6` / `--nk-space-s2` |
| `textWrapper` / `sellerNameText` | font / colour | 16 charcoalGrey / 16/700 darkNavy | `--nk-type-pdp-text16` `--nk-color-text-legacy` / `--nk-type-pdp-text16-bold` `--nk-palette-dark-navy` |
| `ratingContainer` | gap | 4 | `--nk-space-s4` |
| `ratingWrapper` (+ NoonProductRating) | radius / py / px / gap / bg | 20 / 4 / 8 / 2 / softGray | `--nk-radius-r20` / `--nk-space-s4` / `--nk-space-s8` / `--nk-space-s2` / `--nk-color-bg-pill` |
| `score` | font | 14/600 charcoalNavy | `--nk-type-pdp-text14-semibold` / `--nk-color-text-strong` |
| `wrapper` | gap / py / px / radius / bg | 4 / 4 / 8 / 20 / #F9F9FB | `--nk-space-s4` / `--nk-space-s4` / `--nk-space-s8` / `--nk-radius-r20` / `--nk-color-bg-subtle` |
| `percent` / `text` | font / colour | 14/600 greenOff / 14 inkBlack | `--nk-type-pdp-text14-semibold` `--nk-color-discount-bright` / `--nk-type-pdp-text14` `--nk-color-text-product` |
| `metricsContainer` | pt / gap | 20 / 6 | `--nk-space-s20` / `--nk-space-s6` |
| `metricContainer` | padding / radius / border / gap | 8 / 18 / 1px borderPrimary / 4 | `--nk-space-s8` / `--nk-radius-pdp-r18` / `--nk-palette-border-primary` / `--nk-space-s4` |
| `metricBadgeText` / `progressRatingValue` | font / colour | 14 blueGray700 / 14/600 SD colour | `--nk-type-pdp-text14` `--nk-color-text-muted` / `--nk-type-pdp-text14-semibold` |
| NoonDashedBorder | dash / gap / stroke / colour | 5 / 6 / 1 round / dashedBorderDefault | SVG line (geometry) / `--nk-palette-dashed-border-default` |
| NoonOffers `container` | py / px / bg / radius / gap | 12 / 8 / aliceBlue / 8 / 8 | `--nk-space-s12` / `--nk-space-s8` / `--nk-palette-alice-blue` / `--nk-radius-r8` / `--nk-space-s8` |
| `otherOffersText` | font / colour | 14 / blueGray700 | `--nk-type-pdp-text14` / `--nk-color-text-muted` · `offer.webp` 16 |

Copy `noon_sold_by`, `noon_rating_value_phrase` "{{value}}% Positive", `noon_seller_ratings_label`, `noon_partner_since_years`, `noon_rating_value_percent`, `noon_more_offers_from_sellers`. SD: `store_name`, `partner_ratings_sellerlab` (rating 4.3, 92%, metrics).

## 11. Ratings & Reviews (`NoonCustomerReviews`)

| bappzaar | Property | Master | Kit token |
|---|---|---|---|
| PDP `reviewsSectionWrapper` | card padding | 0 | – |
| `container` | px / py / gap / bg | 12 / 16 / 24 / white | `--nk-space-s12` / `--nk-space-s16` / `--nk-space-s24` |
| `ratingsOverviewWrapper` | gap | 12 | `--nk-space-s12` |
| `title` | font / colour | 16/700 / charcoalNavy | `--nk-type-pdp-text16-bold` / `--nk-color-text-strong` |
| NoonRatingsOverview `overviewContent` / `ratingWrapper` | gap | 4 / 4 | `--nk-space-s4` |
| `ratingText` | font / colour | 24/800 / neutralBlack | `--nk-type-pdp-text24-extrabold` / `--nk-color-text-ink` |
| `ratingStar` | size / mr | 20 / 2; tint noonReviewColorV2, empty lightGreyColor | `--nk-layout-pdp-icon20` / `--nk-space-s2` / `--nk-color-star-*` `--nk-color-border` · `noon-review-star-empty.webp` as mask |
| `overviewText` | font / colour | 12/14 / #404553 (its `tintColor` is a no-op on Text) | `--nk-type-text12-regular-lh14` / `--nk-color-text-legacy` |
| NoonReviewsList `headerContainer` / `listHeader` | gap / pb | 24 / 12 | `--nk-space-s24` / `--nk-space-s12` |
| "All reviews (n)" | font | base 13 #404553 | `--nk-type-pdp-text13` / `--nk-color-text-legacy` |
| `separator` | height / colour / my | 1 / antiFlashWhite / 12 | `--nk-color-border-subtle` / `--nk-space-s12` |
| NoonCustomerReviewItem `container` / `headerSection` | gap | 12 / 8 | `--nk-space-s12` / `--nk-space-s8` |
| `nameText` | font | 14 capitalize #404553 | `--nk-type-pdp-text14` / `--nk-color-text-legacy` |
| `verifiedWrapper` | gradient / radius / padding / gap | antiFlashWhite → white / 20 / 4 / 4 | `--nk-color-border-subtle` → `--nk-color-bg-surface` / `--nk-radius-r20` / `--nk-space-s4` |
| `verifiedIcon` / `verifiedText` | size / font / colour | 12 / 12/600 / darkGray | `reviews-verified-purchase.webp` / `--nk-type-pdp-text12-semibold` / `--nk-palette-dark-gray` |
| `ratingWrapper` / `ratingStar` | gap / size | 4 / 16, mr 2 | `--nk-space-s4` / `--nk-layout-pdp-icon16` |
| `dateText` / `trustedSourceText` | font / colour | 12 / slateGray | `--nk-type-pdp-text12` / `--nk-color-text-secondary` |
| `content` / `commentTitle` | gap / font / colour | 4 / 14/600 / blueGray900 | `--nk-space-s4` / `--nk-type-pdp-text14-semibold` / `--nk-color-text-primary` |
| ReviewCommentBody `commentText` / `moreLessComment` | font / colour | 14 inkBlack / 700 accentBlue | `--nk-type-pdp-text14` `--nk-color-text-product` / `--nk-color-brand-blue` |
| NoonHelpfulReview `helpfulButton` | border / radius / px / py / gap | 1px softGray / 8 / 8 / 4 / 4 | `--nk-color-bg-pill` / `--nk-radius-r8` / `--nk-space-s8` / `--nk-space-s4` |
| `helpfulButtonText` / `helpfulIcon` | font / colour / size | 13/500 / neutralBlack / 12 | `--nk-type-pdp-text13-medium` / `--nk-color-text-ink` · `thumb-up.webp` |
| `viewMore` / `viewMoreText` / `viewMoreIcon` | gap / font / colour / size | 2 / 14/600 / accentBlue / 12 | `--nk-space-s2` / `--nk-type-pdp-text14-semibold` / `--nk-color-brand-blue` · `noon-review-chevron-right-blue.webp` |

Copy `noon_reviews_title`, `noon_avg_rating_based_on_reviews`, `noon_reviews_all`, `noon_verified_purchase`, `noon_helpful`, `noon_all_customer_reviews`, `noon_product_review_show_more_text`. Master has **no** rating-distribution bars (removed from the kit). SD: `customerReviews` (comments, counts).

## 12. Recommendations (`NoonRecommendations`)

| bappzaar | Property | Master | Kit token |
|---|---|---|---|
| PDP `recommendations` | bg / pb | white / 12 | `--nk-color-bg-surface` / `--nk-space-s12` |
| `brandRecommendationsTitle` / `recommendationsTitle` | font / padding | 18/700 / 12 12 8, colour base #404553 | `--nk-type-pdp-text18-bold` / `--nk-space-s12` `--nk-space-s8` / `--nk-color-text-legacy` |
| NoonProductCarousel `flatListStyleV2` | pl / pr | 4 / 12 | `--nk-space-s4` / `--nk-space-s12` |
| `productBoxV2` | width / ml / mb / radius / border | productBoxCarouselWidth(2.5) = round((sw − 15 − 16) / 2.5) = 144 / 8 / 12 / 10 / 0.5 lightGray | `pdpTokens.recoCardWidth()` / `--nk-space-s8` / `--nk-space-s12` (card radius is the shared ProductCard's, see follow-ups) |

Copy `noon_brand_recommendations_title` "More from {{brandName}}", `noon_recommended_products_pdp` "Customers Also Viewed".

## 13. Sticky bar

| bappzaar | Property | Master | Kit token |
|---|---|---|---|
| NoonAddToCartQuantity `wrapper` | bg / radius / shadow | white / 16 / 0 −2 6 black .08 | `--nk-color-bg-surface` / `--nk-radius-r16` / `--nk-shadow-bottom-bar` |
| PDP wrapper padding-bottom | | max(safeArea − 8, 0) | `calc(var(--nk-inset-bottom) - var(--nk-space-s8))` |
| `buttonsWrapper` | gap / px / py | 8 / 16 / 8 | `--nk-space-s8` / `--nk-space-s16` / `--nk-space-s8` |
| `qtyButton` (+ Button min-width 60) | bg / radius / border / py / px | white / 12 / 1px lightGreyColor / 8 / 12 | `--nk-color-bg-surface` / `--nk-radius-r12` / `--nk-color-border` / `--nk-space-s8` / `--nk-space-s12`, `--nk-layout-pdp-qty-min-width` |
| `qtyText` | font / colour / mb | 12/500 / bluishGrey / 2 | `--nk-type-pdp-text12-medium` / `--nk-color-text-tertiary` / `--nk-space-s2` |
| `qtyButtonText` | font / colour | 16/700/20 / gray800 | `--nk-type-text16-bold-lh20` / `--nk-color-text-body` |
| `buyNowButton` | bg / py / radius / border | white / 14 / 10 / 1px accentColor | `--nk-color-bg-surface` / `--nk-space-s14` / `--nk-radius-r10` / `--nk-color-cta` |
| `buyNowButtonText` | font / colour | 14/700/20 / accentColor | `--nk-type-text14-bold-lh20` / `--nk-color-cta` |
| `addToCart` | bg / py / radius / border | accentColor / 14 / 10 / 1px accentColor | `--nk-color-cta` / `--nk-space-s14` / `--nk-radius-r10` |
| `addToCartText` | font / colour | 14/700/20 / white | `--nk-type-text14-bold-lh20` / `--nk-color-text-inverse` |
| `addToCartDisabled` / `atcTextDisabled` | bg / colour | lightGreyColor / slateGray | `--nk-color-border` / `--nk-color-text-secondary` |
| `addToCartAnimation` | size | 32 (atc loader lottie) | `--nk-layout-pdp-atc-loader` · `src/assets/cart/atc-loader-animation.lottie` |
| NoonQuantitySelector `container` | bg / pb / pt / px / gap / top radius | white / 16 / 8 / 12 / 12 / 20 | `--nk-space-s16` / `--nk-space-s8` / `--nk-space-s12` / `--nk-radius-r20` |
| `headerText` | font / colour | 15/700 / gray800 | `--nk-type-pdp-text15-bold` / `--nk-color-text-body` |
| `close` / `closeIcon` | padding / size / tint | 10 / 10 / slateBlueGray | `--nk-space-s10` / `--nk-layout-pdp-icon10` / `--nk-color-text-muted` |
| `quantityItem` | py / px / border / radius / me | 10 / 12 / 1px lightGreyColor / 10 / 12 | `--nk-space-s10` / `--nk-space-s12` / `--nk-color-border` / `--nk-radius-r10` |
| item width | | (sw − 24) / min(n, 4.5) − 12 | `pdpTokens.qtyVisible` |
| `quantitySelected` | border / shadow | 1.5px skyBlue / 1 1 3 skyBlue .3 | `--nk-palette-sky-blue` / `--nk-shadow-pdp-qty-selected` |
| `quantityText` / selected | font / colour | 12/18 gray800 / accentBlue | `--nk-type-text12-regular-lh18` / `--nk-color-text-body` / `--nk-color-brand-blue` |
| NoonInCartLabel `cartLabelView` | bg / padding / gap | yellowColor / 8 / 4 | `--nk-color-brand` / `--nk-space-s8` / `--nk-space-s4` · `in-your-cart.webp` 20 |
| `labelTextStyle` | font / colour | 14/500 / neutralBlack | `--nk-type-pdp-text14-medium` / `--nk-color-text-ink` |
| NoonBackToTop `backToTopButton` | bg / opacity / padding / radius / top | blueGray900 / .95 / 8·10 / 25 / −48 | `--nk-palette-blue-gray900-alpha95` / `--nk-space-s8` `--nk-space-s10` / `--nk-radius-pdp-r25` / `--nk-layout-pdp-back-to-top-offset` |
| `backToTopText` / `arrowIcon` | font / colour / mr | 13/600 / white / 4 | `--nk-type-pdp-text13-semibold` / `--nk-color-text-inverse` / `--nk-space-s4` · `chevron-up-white.webp` 16 |
| show when | | scrollY > screenHeight, hidden while the qty selector is open | `layout.deviceHeight` |

Copy `noon_QTY`, `noon_buy_now`, `noon_add_to_cart_v2`, `noon_quantity`, `noon_added_in_your_cart_message`, `noon_back_top`.

## 14. Quick cart sheet (`screens/NoonQuickCartScreen`) → screen `added`

| bappzaar | Property | Master | Kit token |
|---|---|---|---|
| `infoWrapper` | padding | 20 | `--nk-space-s20` |
| `productContainer` | mb | 12 | `--nk-space-s12` |
| `checkWrapper` | size / radius / mr | 80 / 40 / 16 | `--nk-layout-pdp-check-wrapper` / `--nk-radius-pdp-r40` / `--nk-space-s16` |
| `checkImage` / `checkLottie` | size | 64 / 120 | `--nk-layout-pdp-check-image` / `--nk-layout-pdp-check-lottie` · lottie `atcCheck` |
| `backgroundOverlay` | bg | rgba(240,244,249,.2) | `--nk-color-pdp-quick-cart-overlay` |
| `title` | font / colour / mb | 16/700/20 / #262A33 / 2 | `--nk-type-text16-bold-lh20` / `--nk-palette-new-black` / `--nk-space-s2` |
| `subtitle` | font / colour | 14/20 / #262A33, 2 lines | `--nk-type-text14-regular-lh20` / `--nk-palette-new-black` |
| row slide | | translateX 150 → 0, delay 1500, 500ms bezier(.4,0,.2,1) | `pdpTokens.quickCart` |
| text | | FadeInRight from 500, delay 1000, 700ms | `pdpTokens.quickCart` |
| `buttonsWrapper` | gap / px | 12 / 16 | `--nk-space-s12` / `--nk-space-s16` |
| `closeButton` | py / radius / border / bg | 12 / 8 / 1px accentColor / white | `--nk-space-s12` / `--nk-radius-r8` / `--nk-color-cta` |
| `closeButtonText` | font / colour | 13/700 / accentColor | `--nk-type-pdp-text13-bold` / `--nk-color-cta` |
| `checkoutButton` / `checkoutText` | bg / radius / font | accentColor / 8 / 13/700 white uppercase | `--nk-color-cta` / `--nk-radius-r8` / `--nk-type-pdp-text13-bold` |
| `container` | pb / top radius | safe area / 16 | sheet chrome is the kit Navigator's (r24 + grabber, see follow-ups) |
| `recommendationsTitle` (variant 1/2 only) | font / px / mb | 19/700 / 16 / 8 | `--nk-type-pdp-text19-bold` / `--nk-space-s16` / `--nk-space-s8` |

Copy `noon_added_to_cart`, `noon_quick_cart_continue_shopping` "CONTINUE SHOPPING", `noon_quick_cart_view_cart` "View cart" (uppercased by style).

## 15. Variants sheet (`screens/NoonVariantsOverlayScreen`) → screen `variants`

| bappzaar | Property | Master | Kit token |
|---|---|---|---|
| `productHeaderContainer` | padding / gap | 16 / 10 | `--nk-space-s16` / `--nk-space-s10` |
| `imageContainer` / `imageOverlay` | width / aspect / radius / border | 80 / 3:4 / 10 / 1.2px #F5F5F5 + 2% black | `--nk-layout-pdp-variants-image` / `--nk-radius-r10` / `--nk-palette-border-primary` / `--nk-color-image-overlay` |
| `productInfoContainer` | pt / gap | 6 / 4 | `--nk-space-s6` / `--nk-space-s4` |
| `productName` | font / colour | 14/18 / #666D85, 2 lines | `--nk-type-body` / `--nk-color-text-secondary` |
| `salePrice` / `saleCurrency` | font / colour | 16/700/20 charcoalNavy · currency 16/600 #212121 | `--nk-type-text16-bold-lh20` `--nk-color-text-strong` / `--nk-color-text-product` |
| `priceStyle` | font / colour | 14/18 / noonGrey2, strike | `--nk-type-body` / `--nk-palette-noon-grey2` |
| `discountStyle` | font / colour | 14/600 / noonSystemGreen | `--nk-type-pdp-text14-semibold` / `--nk-color-success-strong` |
| `estimatedDelivery` | height | 32 | `--nk-layout-pdp-variants-delivery` |
| `separator` | width / height / colour | 90% / 1 / #F2F3F7 | `--nk-color-border-subtle` |
| NoonProductSizeVariantSelection `container` / `titleWrapper` | pt / px / min-height | 16 / 16 / 20 | `--nk-space-s16` |
| `title` | font / colour / tracking | 12/500 / #242A3499 / 1, uppercase | `--nk-type-pdp-text12-medium` / `--nk-palette-dark-text-color-alpha60` |
| NoonProductCartSelectionItem `item` | border / radius / ml / my / padding | 1px #EBEBEB / 8 / 8 (first 16, last mr 16) / 8 / 8·12 | `--nk-palette-bright-grey-color` / `--nk-radius-r8` / `--nk-space-s8` `--nk-space-s16` / `--nk-space-s12` |
| `itemSelected` / `text` | border / font / colour | #0E0E0E / 14 #0E0E0E centre (selected 600) | `--nk-color-text-ink` / `--nk-type-pdp-text14` |
| `variantsContainer` / `content` | pb | 12 / 100 | `--nk-space-s12` |
| `addToCartContainer` | padding / pt / shadow | 16 / 8 / 0 −1 8 black .08 | `--nk-space-s16` / `--nk-space-s8` / `--nk-shadow-pdp-variants-footer` |
| `atcQtyBtn` (NoonOfferAddToCartQuantity) | size / radius / me / border | 48 / 8 / 8 / 1px borderColor | `--nk-layout-pdp-qty-square` / `--nk-radius-r8` / `--nk-space-s8` / `--nk-palette-border-color` |
| `qtyText` / `qtyButtonText` | font / colour | 12 steel / 20/700 | `--nk-type-pdp-text12` `--nk-palette-steel-color` / `--nk-type-pdp-text20-bold` |
| `atcBtn` / `addToCartText` | height / radius / bg / font | 48 / 8 / accentColor / 14/700 white, "ADD TO CART" | `--nk-layout-pdp-qty-square` / `--nk-radius-r8` / `--nk-color-cta` / `--nk-type-pdp-text14-bold` |

| `sizeMissingWarningTextInline` | font / colour / tracking | 12 / errorMessageColor #FB0B0B / 1, uppercase | `--nk-type-pdp-text12` / `--nk-color-pdp-error-message` |

Copy `add_to_cart` "ADD TO CART", `QTY`, `noon_size`, `noon_size_missing_add_to_cart`.

## Assets (`src/assets/pdp/`, copied from master @3x)

`marketplaces/noon/theme/assets/icons/`: back, search-bar, arrow-up-tray, favourite, favourite-active-v2, right-chevron, down-arrow, up-arrow, noon-rating-star-white, discount-tag-filled, percent-badge, discount-icon, info, chevron-down, circle-point, warranty, returnable, verified-filled, offer, seller-logo, noon-review-star-empty, reviews-verified-purchase, thumb-up, noon-review-chevron-right-blue, chevron-up-white, in-your-cart, tick, noon-one, previously-bought, tabby, tamara. `src/theme/assets/images/express-pdp-en`. Lotties reused from the kit: `atcCheck` (identical bytes to master `atc-check.lottie`), cart `atc-loader-animation`. Each one renders at its 1x size (`--nk-layout-pdp-icon*`). Tinted icons use a CSS mask so the tint comes from a colour token.

## Literal exceptions (allowed geometry)

- `NoonBestValueTag` fold/tip SVG `d` paths and the 7×20 / 8×14 viewBoxes.
- `NoonDashedBorder` SVG dash array `5,6`.
- Gallery aspect ratio, dots sizes, parallax ranges and motion timings: numbers in `pdpTokens` (JS).
- Percentages that come from layout maths (30% spec-name column, 90% separator, chip widths in `pdpTokens`).
- 1px hairlines (borders, separators, the `+1px` that compensates a removed border) and the 1px tip overlap of the best-value ribbon.
- Mock image stand-ins in `data.ts`: gallery slide tints and colour swatches (`product.colors`) stand in for SD `image_url`s, since the kit has no product photos.
- Gallery swipe spring / drag thresholds: kit interaction (master uses a native pager).

## Shared follow-ups

- **ProductCard**: master PDP carousel `productBoxV2` uses r10 and width `productBoxCarouselWidth(2.5)` (144 at 390). The shared card is r12. A `radius` prop (or a `carousel` variant) would make it match.
- **WishlistHeart `variant="button"`**: master PDP header uses whiteAlpha(.9) + 1px antiFlashWhite and the `favourite.webp` 32px icon. The shared one is whiteAlpha(.6) with a lucide heart. The PDP uses a local `HeaderHeart` for now.
- **IconButton `glass`** already matches NoonPressableIcon + PDP `iconStyle` (40, whiteAlpha90, border antiFlashWhite). The icon should be the real `back.webp` (20, neutralBlack) rather than lucide.
- **CatalogTag**: master PDP gallery uses `NoonTag` (gradient #666→#000, 1px blackCow, r8, 3·8, 14/500 white). The shared CatalogTag is the PLP shape (bestSellerTag fill, end-end r10, 12/600). It needs a `variant="gallery"`. The PDP uses a local `GalleryTag`.
- **Price**: master `PriceDiscounted` on PDP is sale 22/700/24 charcoalNavy + `(Incl. VAT)`, wraps on one baseline row, discount "x% OFF" 14/600 greenOff with 2·3 padding. The shared `Price size="lg"` uses ink #0E0E0E and no VAT. The PDP has a local `PdpPrice`.
- **BottomBar**: master bottom padding is `max(safeArea − 8, 0)` beyond the 8px row padding, so the total is the safe area. The shared BottomBar adds the inset plus 8. The PDP uses its own sticky bar.
- **RatingPill**: master `NoonProductRating` on PDP is h26, px4, 14/700 score + "(3.2K ratings)" 14/600 gray800 with an 11px star tinted by `noonReviewColorV2`. The PDP uses a local one.
- **Sheet chrome (kit Navigator)**: master quick cart / variants overlays use r16 / r20 top corners. The kit sheet is r24 with a 36×4 grabber, while the variants overlay notch is 60×4 #B7B7B7 placed 12px above the sheet.
- **CouponTag**: master PDP discount tag is 1px dashed oliveGray #1F7A7466, mintCream #F6FEFD, r8, 6·8, 14/600 blueGray900 + 24px discount icon. The shared CouponTag is the PLP variant.

## Token follow-ups (candidates for `src/foundations`)

- `radius.r5`, `radius.r18`, `radius.r25`, `radius.r40` (PDP uses `--nk-radius-pdp-r*`).
- `spacing.s1`, `spacing.s3`, `spacing.s5`.
- `type` with `line: 'normal'` for RN text without lineHeight. The PDP defines `pdpText{12,13,14,15,16,18,19,20,24}{,Medium,Semibold,Bold,Extrabold}`. A global "Lnormal" family would remove most of them.
- `type.text16MediumLh20` (PDP title), `type.text22BoldLh24` (PDP price), `type.text24BoldLh28` (best price V2), `type.text18MediumLh24`, `type.text15SemiboldLh24` (delivery estimate).
- `shadow`: `0 1px 3px skyBlue@.3` (qty selected), `0 −1px 8px black@.08` (variants footer).
- `colors.pdpQuickCartOverlay` rgba(240,244,249,.2), `colors.pdpErrorMessage` #FB0B0B (NoonColors.errorMessageColor; not in palette.ts).

## Live data mapping (noon.com iPhone 17 Pro 1TB Silver, N70211593V)

The default `pdp/detail` (and `/pdp`) is now this live product (`IPHONE_17_PRO_ID`). Capture: `page.json` (JSON-LD Product + BreadcrumbList, rendered text, images) and `api.json` (`mp-customer-discovery-api/api/pdp/carousels`, `mp-trust-api/product-reviews/ai-summary/get`, `product-reviews/sku/images-list`). Product-level fields live on the `Product` in `src/mocks/products.ts`. Offer-level SD content lives in `src/flows/pdp/data.live.ts` → `liveContent()`.

| Web field (source) | PDP slot / master component | Kit data field |
|---|---|---|
| `Product.name` (JSON-LD) | NoonTextToggle title | `Product.title` |
| `brand.name` | NoonStoreHeader (no official tick: none on the page) | `Product.brand`, `PdpContent.officialStore = false` |
| `sku`, `offers.url ?o=` | (analytics / routing id) | `Product.sku`, `Product.id`, `Product.offerCode` |
| `image[]` ×4 | NoonGallery slides (660×900 webp, `contain`) | `Product.images` → `gallerySlides()` |
| `aggregateRating 4.5 / 34297` | NoonProductRating "4.5 (34.3K ratings)", NoonRatingsOverview, "All reviews (34.3K)" | `Product.rating`, `Product.ratingCount`, `PdpContent.commentCount` (offer has no own reviews, so the product aggregate is used) |
| `offers.price 6549` (no was) | PriceDiscounted: sale only. Master shows "(Incl. VAT)" only inside the discount row, so it is not shown here | `Product.price` |
| "Free Delivery", "Only 1 left in stock" | NoonNudgeTag ticker next to the deal tag | `Product.nudges` (kinds `freeDelivery` / `lowStock`), `Product.stockLeft`, `Product.freeDelivery` |
| Coupons SALE200 / FAB10 / RAK50 | NoonDiscountTagList "Extra 10% off, CODE: SALE200" (no best price → shown) | `PdpContent.discountTags[{title, code}]` |
| "Get it by 12 Oct · Order in 16h 26m" | NoonDeliveryInfoItem (express logo) + NoonCountDown "Order in 16h 26m" | `PdpContent.delivery`, `orderWithinMin` |
| "or GET IN 1 HR 22 MINS · 6549.00 ↗" | NoonAccordion "Other Delivery Options" + NoonBuyingOptionItem (rocket logo, price, arrowUpRight) | `PdpContent.buyingOptions[{code:'rocket'}]` |
| noon One / Mashreq cashback 327.45, split in 6, installments | NoonPaymentsForYou (title SD "Payment Discount") | `PdpContent.payments` (+ 3 mpcms icons) |
| 6 reinforcement badges | NoonPdpReinforcement (≥4 → 3.5 visible) | `PdpContent.offerBadges` (icons inferred from master assets) |
| Color / Internal Memory / Model Name / Version (+ Learn more) | NoonOptionsSelection: 4 groups, "Name: selected", image tiles for colour, every option priced by the SKU a tap switches to (exact match, else the closest member), Physical Dual SIM = out of stock | `variantFamilies['iphone-17-pro']` + `Product.attributes` → `familyGroups()`; tap → options loader, then the page switches to that product in place (see Variant selection behaviour) |
| Frequently Bought Together (case 24.94, AirPods Max 2 1729, Spigen 109.99) | NoonFrequentlyBoughtTogether (current product first, all selected, "Buy 4 items together"). Master's button text has no total, so the web's "for 8412.93" is not shown | `fbtFor[IPHONE_17_PRO_ID]` → `PdpContent.fbt` |
| Seller KKGSM 4.9 (171), 98% positive, item as shown 100%, partner 2+ yrs, low return | NoonSeller + metrics | `Product.seller`, `Product.sellerRating`, `PdpContent.seller` |
| "Explore other bestsellers in Smartphones" | NoonCategoryBestSeller (bottom CTA, before seller) | `PdpContent.bestSellerCta` from `Product.categoryId` leaf name |
| Highlights bullets | Product Overview → Highlights | `Product.featureBullets` |
| `description` | Overview → Description | `Product.description` |
| `additionalProperty` ×20 | Overview → Specifications | `Product.specs` |
| `hasMerchantReturnPolicy` 15 days free, warranty badge | Additional Information rows | `PdpContent.additional` |
| ai-summary/get `reviewsSummary` ×4 | NoonAiProductReviewsSummary in the reviews card | `PdpContent.aiSummary` |
| images-list reviews (Hamza R., Alcris Buaron P., Jul Ajim J.) | NoonCustomerReviewItem: variant chips (`productGroupVariant`), helpfulCount, 120×128 photos, time-ago from `updatedAt` | `PdpContent.reviews[]` (family-level, shared by every family SKU) |
| carousels `same_brand` (12 + 2 variant SKUs) | "More from Apple" (NoonRecommendations → product box with nudge ticker) | `liveProducts` brand = Apple, live order |
| carousels `other_brands` (8) | "Customers Also Viewed" | live products of other brands in the same level-2 category |
| card `best_seller_rank`, `nudges[]` ("#38 in Smartphones", "Lowest price in a year", "Selling out fast") | product-box NoonNudgeTag ticker (`RecoCard`). On that SKU's own PDP: NoonCategoryBestSellerTag "#38 in Smartphones" | `Product.rank`, `Product.nudges` |
| card `is_bestseller` | "Best Seller" catalog tag | `Product.tag` |
| card `flags` fbn / rocket, `estimated_delivery_date` | express vs rocket logo, delivery text | `Product.express`, `Product.delivery`, `PdpContent.deliveryLogo` |
| card `store_name`, `offer_code`, `price` / `sale_price` | seller, routing, price/was | `Product.seller`, `offerCode`, `price`, `was` |

Images: 46 webp files in `src/assets/products/iphone-17-pro/`, about 520 KB in total:
- gallery ×4 at `?width=800` (660×900)
- colour swatches ×3, FBT ×3, carousel cards ×22 and review photos ×5, all at `?width=320` (320×436)
- 3 payment icons and 6 nudge icons (mpcms, `?width=96`)

All of them render in the gallery, variant tiles, FBT, carousels, payments, card nudges and reviews.

**Not mapped, and why**
- "Inclusive of VAT" without a discount: master renders the VAT text only inside the discount row.
- "Show Variants / View All": web-only, with no master equivalent.
- The cashback / installment links, plus the real reinforcement badge icons: those icons were not captured, so master assets stand in.
- The Mashreq card icon: not captured, so it reuses the noon One card.
- Physical Dual SIM Version: no SKU in the capture, so it renders as out of stock.
- Model "iPhone 17 Pro Max" option: there is no exact 1TB Nano-SIM Pro Max SKU, so it links to the closest member and shows no price.
- Ad slots / sponsored, "Products related to this", "Top Picks For You": web-only or CMS/ads; master has CMS/sponsored slots that this kit does not render.
- Offer-specific reviews ("no reviews yet"): the product aggregate and family reviews are shown, as on master's product-group reviews.
- Supermall delivery price for the rocket offer (assumed equal to the live price, 6549).

## Category model

`src/mocks/categories.ts` holds a parent-linked taxonomy and the helpers `categoryPath`, `isInCategory` and `leafName`. The `inferred` flag marks nodes that are not read from the breadcrumb.

```
Electronics & Mobiles  /electronics-and-mobiles/
└─ Mobiles & Accessories  …/mobiles-and-accessories/
   ├─ Mobile Phones  …/mobiles-20905/            (noonId 20905)
   │  └─ Smartphones  …/mobiles-20905/smartphones/  (noonId 20906 = wishlist cat_id)   ← iPhone 17 Pro, all carousel phones
   └─ Mobile Accessories (inferred)
      ├─ Cases & Covers (inferred; "#34 in Cases & Covers")      ← FBT silicone case, "Customers also viewed" case
      ├─ Screen Protectors (inferred)                             ← FBT Spigen GLAStR
      ├─ Mobile Lens & Lens Protectors (inferred; "#29 in …")
      └─ Wall Chargers (inferred; "#1 in Wall Chargers")
└─ Headphones (inferred) └─ Over-Ear Headphones (inferred)       ← FBT AirPods Max 2
```

Which categories serve the iPhone:
- **Breadcrumb:** Smartphones, inside Mobile Phones › Mobiles & Accessories › Electronics & Mobiles. Stored as `Product.categoryId = 'smartphones'` and `Product.categoryPath`.
- **Rank:** "#N in Smartphones" on carousel SKUs.
- **Cross-sells** sit in the accessory leaves above. FBT pulls from Cases & Covers, Screen Protectors and Over-Ear Headphones.

How the PDP uses the model:
- "Explore other bestsellers in **Smartphones**" (NoonCategoryBestSeller) uses `leafName(categoryId)` and opens `plp/listing` with that query.
- NoonCategoryBestSellerTag "#38 in Smartphones" uses `rank` + leaf name.
- Card nudges use `rank`.
- "More from Apple" filters live products by `brand`.
- "Customers Also Viewed" takes live products of other brands under the same level-2 branch (`categoryPath(categoryId)[1]` = Mobiles & Accessories). This yields the phones and the iPhone case, like noon's `other_brands`.
- Mock products (`p1…p14`) keep their old brand/category matching.

## Shared follow-ups (live data)

- **ProductCard**: should render `product.nudges` (NoonNudgeTag ticker, 13/16 slateBlueGray, 14px icon) and the rank tag, and prefix the brand. The PDP uses a local `RecoCard` until then.
- **RatingPill**: count abbreviation shows "34K", but noonAbbreviateNumber gives "34.3K".
- **DemoStore**: `addToCart` and `byId` look up `products` only. Live products are appended to `products` for that reason. A `productById`-based lookup in DemoStore would allow keeping them in a separate catalogue.
