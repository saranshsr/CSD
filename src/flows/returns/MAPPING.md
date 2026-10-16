# Returns: bappzaar master → kit mapping

Source: `bappzaar` **origin/master** `d481712d6d9` (2026-10-10). Read only through `git show origin/master:<path>`.
All paths below are relative to `features/afs/returns/` unless they start with `src/`, `marketplaces/` or `features/afs/common/`.

How to read the tables:

- **Kit token** is what the returns CSS/TSX uses. `--nk-color-*`, `--nk-space-*`, `--nk-radius-*`, `--nk-type-*` are global tokens (`src/foundations/tokens.ts`); `--nk-palette-*` is the raw bappzaar palette (`src/foundations/palette.ts`).
  Keys with a `returns` prefix (`--nk-color-returns-*`, `--nk-type-returns-*`) are defined in `src/flows/returns/tokens.ts` → `returnsFlowTokens`. JS-only numbers (motion, thresholds) live in `returnsTokens`.
- AFS styles resolve `$afsSpacingN` = N px, `$afsFontSizeN` = N px, `$afsFontWeightN` = N (`features/afs/common/theme/AFSMetrics.ts`). AFS colour names come from `features/afs/common/theme/AFSColors.ts`, which overrides `NoonColors` inside `AFSThemeManager`.
- Legacy screens use `NoonThemeManager`: `$increasedBaseFont` 14, `$increasedLargeFont` 16, `$increasedMediumPlusFont` 13, `$fontSizeXXLarge` 20, `$appFontTitleExtraSmall` 18, `$appFontFootnote` 13 (`src/theme/Metrics.ts`, `marketplaces/noon/theme/NoonMetrics.ts`).
- RN text with no `lineHeight` maps to a `returns*` type token with `line: 'normal'`.
- **SD** = server-driven (returns API). The demo value used by the kit is in `data.ts`.
- Geometry literals (icon boxes, image frames, 1–3 px nudges, the 92.3 px status icon) are kept as px in CSS. They are sizes, not spacing tokens.

## 1. Live screens, variants and flags

`src/utils/FeatureFlags.ts` on master has **no returns flag**, so there is no A/B switch between screen versions. What is live is decided by the navigation entry points:

| Entry | Master code | Screen pushed | Kit route |
|---|---|---|---|
| Account → "Returns" row | `marketplaces/noon/components/NoonAccount/NoonAccountSections/NoonAccountAccountSection/NoonAccountAccountSection.tsx` `onReturnsPress` | `AFS_RETURNS_LEGACY_SCREENS.HISTORY_LIST_SCREEN` = `noon.AFSReturnsHistoryListScreen` (`constants/afsReturnsScreens.ts`) | `returns/history` (`/returns-history`) |
| History → "New return request" | `legacy/screens/AFSReturnsHistoryListScreen` `showReturnableItems` | `noon.AFSReturnsReturnableListScreen` (push) | `returns/returnable` (`/returnable-items`) |
| Returnable item → "Return" button | `legacy/screens/AFSReturnsReturnableListScreen` `showReturnsSubmitItemScreen` | `noon.AFSReturnsReturnSubmissionScreen` (push, v3 sections) | `returns/submit` |
| Order tracking → Return | `features/o2d/hooks/useO2DOrderTrackingActions/o2dReturnActionHandlers.ts` | `noon.AFSReturnsReturnSubmissionScreen` (push) | `returns/submit` (kit `orders/tracking` already pushes this) |
| History item tap | `showReturnDetailsScreen` | `noon.AFSReturnsDetailsScreen` (push, no success header) | `returns/details` |
| Submission completed | `hooks/useAFSReturnsSubmission.ts` `navigateToSuccessScreen` | `noon.AFSReturnsDetailsScreen` (push, `successHeader`) | `returns/details?success=1` |
| Details → "Return request summary" | `hooks/useAFSReturnsDetails.ts` | `noon.AFSReturnsRequestSummaryScreen` (push) | `returns/summary` |

Screen versions: the history list, the returnable list, the tracking-timeline overlay, the refund-summary overlay and the policy overlay are the **legacy** components (`legacy/**`), and they are the live ones. Everything else is the new AFS v3 code (`screens/**`, `sections/**`). The old `noon.*Returns*` screens in `marketplaces/noon` are no longer registered.

Overlays (`navigator.showOverlay`) are bottom sheets drawn by `src/components/OverlayBottomSheet`. Because the kit's `nav.sheet` draws a full-width, r24, white sheet, the returns flow renders them itself in `components/ReturnsOverlay.tsx`, so the floating AFS card look is 1:1. The overlay layer covers the screen it was opened from. There is no new route for it.

| Overlay (master) | Opened from | Kit component |
|---|---|---|
| `legacy/screens/AFSReturnsReturnTrackingScreenBase` | Details → tap tracking box | `overlays/TrackingTimelineOverlay` |
| `screens/AFSReturnsCancelRequestOverlayScreen` | Details "Cancel return", tracking overlay "Cancel Return" | `overlays/ConfirmOverlay` (`kind="cancelRequest"`) |
| `legacy/screens/AFSReturnsRefundSummaryScreen` | Details "Refund summary" | `overlays/RefundSummaryOverlay` |
| `legacy/screens/AFSReturnsPolicyScreen` | Details "Return Policy" | `overlays/PolicyOverlay` |
| `screens/AFSReturnsFeedbackOverlayScreen` | Details NPS score | `overlays/FeedbackOverlay` |
| `screens/AFSReturnsSubmissionCancelOverlayScreen` | Submission back | `ConfirmOverlay` (`kind="discardReturn"`) |
| `screens/AFSReturnsSectionDiscardOverlayScreen` | Submission summary card tap while the current section is dirty | `ConfirmOverlay` (`kind="discardSection"`) |
| `screens/AFSReturnsRefundDetailsOverlayScreen` | Resolution / refund "Estimated refund" | `overlays/RefundDetailsOverlay` |
| `screens/AFSReturnsUploadImageOverlayScreen` | Evidence grid "+" tile | `overlays/UploadImageOverlay` |
| `screens/AFSReturnsImageGuidelineOverlayScreen` | Evidence "Photo guide" / tips card | `overlays/ImageGuidelineOverlay` (AFSDepthCarousel simplified to a 3-card depth stack with dots; SD instruction icons → kit glyphs) |
| `screens/AFSReturnsEvidenceSkipOverlayScreen` | Evidence "Skip this step" when the note is mandatory | `overlays/EvidenceSkipOverlay` |
| `screens/AFSReturnsPickupAddressOverlayScreen` | Pickup "from" card | `overlays/PickupAddressOverlay` |
| `src/screens/PickerIOSScreen` | History year filter | `overlays/YearPickerOverlay` |

Not ported: seller chat (`AFSReturnsSellerMessages*`, only when SD `isChatEnabled`, which is false in the demo), the Android native picker, `noon.NoonImageGalleryScreen`, `noon.HelpScreen`, `noon.WebViewScreen` and the `AddressV2SelectScreen` modal. These become toasts. The submission has **no quantity picker** on master (section codes are `reason · comment_images · return_mode · refund_method · pickup_details · notice_screen_v2 · stop_screen_v2`), so the kit has none either.

### Overlay chrome — `src/components/OverlayBottomSheet` + `features/afs/common/components/AFSOverlay`

| Property | Master | Kit |
|---|---|---|
| Backdrop | `rgba(30,30,30, 0.7)` (`BACKDROP_BACKGROUND_COLOR_RGB`, `BACKGROUND_MAX_OPACITY_PERCENTAGE`) | `--nk-color-returns-overlay-scrim` |
| Wrapper | `justifyContent:flex-end`, `paddingTop 60` | `.overlayLayer` + `--nk-space-returns-overlay-top` (60) |
| Margin (AFS) | `padding 12`, `paddingBottom SafeArea.stickyBottomInset()` | `--nk-space-s12`, `var(--nk-inset-bottom)` |
| Margin (legacy) | `padding 12`, bottom `getBottom()+4` | `calc(var(--nk-inset-bottom) + var(--nk-space-s4))` |
| Card | `borderRadius 16`, bg `$secondaryBackgroundColor` #F9F9FB, overflow hidden | `--nk-radius-r16`, `--nk-color-bg-subtle` |
| Scroll content | `padding 12`, `paddingTop 16` (overridden per overlay through `style`) | `--nk-space-s12` / `--nk-space-s16` |
| Handle | 36×4, r2, `#B7B7B7`, `top:-18` above the card | `--nk-color-returns-overlay-handle`, geometry literal |
| Open | `withSpring` damping 15 / stiffness 110; backdrop 350 ms | `returnsTokens.overlaySpring`, `overlayFadeDuration` |
| Close | `withTiming` 350 ms `Easing.inOut(ease)`; drag down 250 px or 2000 px/s; tap backdrop | same values (`overlayClose`, drag offset/velocity) |

## 2. Shared AFS components

### `features/afs/common/components/AFSBackHeader` → `components/AFSBackHeader.tsx`

| Property | Master | Kit token |
|---|---|---|
| header | absolute, `paddingTop $statusBarHeightValue + 8`, `paddingBottom 8`, `paddingHorizontal 12`, z 1 | `calc(var(--nk-inset-top) + var(--nk-space-s8))`, `--nk-space-s8`, `--nk-space-s12` |
| blur (`isBlur`) | iOS ProgressiveBlurView: overlay `#F9F9FBCC`, blur 10, blurred top → clear bottom from 0.4 | `--nk-color-returns-header-blur` + `backdrop-filter: blur(10px)` masked `linear-gradient(#000 40%, transparent)` |
| no blur | `backgroundOverlay` = `backgroundColor` prop (Summary passes `$secondaryBackgroundColor`) | `--nk-color-bg-subtle` |
| content | row, `gap 12`, centred | `--nk-space-s12` |
| back button | 40×40, white, r50, 1px `$antiFlashWhite` #F2F3F7, pressed scale 0.96 | `--nk-color-bg-surface`, `--nk-color-border-subtle` |
| back icon | `slimChevronLeft` (assets/icons/slim-chevron-left.webp), max 20×20, tint `$blueGray900` | `assets/returns/slim-chevron-left@3x.webp` via `MaskIcon` + `--nk-color-text-primary` |
| title | flex 1, 18/700, `$blueGray900`, 1 line | `--nk-type-returns-text18-bold`, `--nk-color-text-primary` |

### `features/afs/common/components/AFSButton` → `components/AFSButton.tsx`

The kit `Button` has no preset with AFS metrics (r12, 44/48/52 min-height, 15/16/18 text, #0F7EFF fill), so the flow keeps a local button built on the kit `Pressable` + `Spinner`.

| Property | Master | Kit token |
|---|---|---|
| base | `paddingHorizontal 12`, `borderWidth 1`, `borderRadius 12` | `--nk-space-s12`, `--nk-radius-r12` |
| sm / md / lg | min-height 44 / 48 / 52; text 15 / 16 / 18, weight 600 | geometry; `--nk-type-returns-text15-semibold` / `-text16-semibold` / `-text18-semibold` |
| primary | bg + border `warrantyAccentColor` #0F7EFF, text white | `--nk-color-primary-bright`, `--nk-color-text-inverse` |
| outline | bg white, border `$lightGreyColor` #EAECF0, text `$darkNavy` #02060C | `--nk-color-bg-surface`, `--nk-color-border`, `--nk-palette-dark-navy` |
| danger | `$commonDangerColor` #DE1C1C | `--nk-color-danger` |
| inverted | `afsDarkNavy` #101628 | `--nk-color-text-strong` |
| disabled | bg + border `$disabledBackgroundColor` #0E0E0E0A, text `$disabledTextColor` #0E0E0E3D | `--nk-color-bg-disabled`, `--nk-color-text-disabled` |
| press | spring to 0.98 (stiffness 300, damping 20, mass 0.5, clamped) | `returnsTokens.pressScale`, `pressSpring` |
| loading | `Loader` white (outline: darkNavy) | kit `Spinner` |

`AFSContainerButton` → kit `Pressable` with `scale={0.98}` (`AFS_PRESS_ACTIVE_SCALE`). `AFSDashedSeparator` (svg line, dash 4/4, height 1, default `#F2F3F7`) → kit `DottedDivider dash="4, 4" cap="butt"`. `AFSSvgImage` → `<img>` (CDN svg copied into `src/assets/returns`). `NoonDashedBorder` (dash 5/6, round caps, default `dashedBorderDefault` #EAECE0) → `DottedDivider`.

## 3. Return details — `screens/AFSReturnsDetailsScreen` (`returns/details`)

Render tree: `ScreenView` (bg `$secondaryBackgroundColor`) → `AFSBackHeader isBlur` (title `returns_screen_title_details` when there is no success header, otherwise `''`) → `FeedbackView` → [`AFSReturnsDetailsCancelHeader` | `AFSReturnsDetailsSuccessHeader`] + animated `CompoundFlatList` [`AFSReturnsDetailsTrackingBox`, `AFSReturnsFeedbackBox`, `AFSReturnsDetailsProductCard`] + sticky "Continue Shopping" `AFSButton lg`.

| Section | Property | Master | Kit token |
|---|---|---|---|
| container | bg | `$secondaryBackgroundColor` #F9F9FB | `--nk-color-bg-subtle` (`returnsFlowTokens.colors.bgPage`) |
| content | padding | `paddingHorizontal $afsSpacing12` | `--nk-space-s12` |
| list | paddingTop | `UIManager.contentTopOffset('header', 18)` = statusBar + 44 + 18 | `calc(var(--nk-inset-top) + var(--nk-space-returns-content-top))` (62) |
| list (success) | paddingTop | + `LOTTIE_HEIGHT` 240 (iOS) | `+ var(--nk-space-returns-lottie-height)` |
| list | paddingBottom | 12 | `--nk-space-s12` |
| footer | padding | `paddingTop 12`, `paddingBottom stickyBottomInset` | `--nk-space-s12`, `var(--nk-inset-bottom)` |
| footer button | text | 16/600/24 | `--nk-type-returns-text16-semibold-lh24` |

### Success header — `components/AFSReturnsDetailsSuccessHeader` + `hooks/useAFSReturnsDetailsAnimation.ts`

| Property | Master | Kit |
|---|---|---|
| layout | absolute fill, z 1, bg `$secondaryBackgroundColor` | `.successHeader` |
| pending | `AFSLotties.returnSubmitProcessingLottie()` `returns/lottie/returns-processing-en.lottie`, loop | `assets/returns/returns-processing-en.lottie` (shown for `returnsTokens.detailsFetchDelay` 900 ms) |
| success | `successHeader.lottieUrl` (SD, `contain`, no loop) | **SD.** Not on the CDN under a guessable name, so the demo uses the kit `orderConfirmedCheck` Lottie (120) + SD `successHeading` / `successSubheading` copy, placed at `50% + 104px` of the full-height header so it lands at about y 104 after the move-up (the master Lottie is a full-screen frame whose lower half stays visible). Documented exception |
| move-up delay | `MOVE_UP_DELAY_MS` 1800 after success | `returnsTokens.successMoveUpDelay` |
| reveal | `top` 0 → −screenH/2, 500 ms `Easing.out(cubic)` | `returnsTokens.headerRevealDuration`, `easing.out` |
| content | opacity 0→1 and translateY screenH/3→0 over progress 0.35→1 | same interpolation (`useTransform`) |
| scroll | scale 1 → 0.8 over 160 px | `returnsTokens.headerScrollScaleDistance`, `headerMinScrollScale` |

### Cancel header — `components/AFSReturnsDetailsCancelHeader` (after a successful cancel)

| Property | Master | Kit token |
|---|---|---|
| icon | `returns-error-icon.svg` 92×92 | `assets/returns/returns-error-icon.svg` |
| gap | 24; text gap 4 | `--nk-space-s24`, `--nk-space-s4` |
| title | `returns_cancel_return_header_title` 20/700/28 `$blueGray900`, centred | `--nk-type-returns-text20-bold-lh28` |
| desc | `returns_cancel_return_header_desc` 14/400/20 `$slateGray` | `--nk-type-text14-regular-lh20`, `--nk-color-text-secondary` |

### Tracking box — `components/AFSReturnsDetailsTrackingBox` + `legacy/components/AFSReturnsLegacyReturnDetailsSteps`

| Property | Master | Kit token |
|---|---|---|
| wrapper | bg `$secondaryBackgroundColor`, top radii 14 | `--nk-radius-r14` |
| container | `paddingTop 16`, `paddingBottom 12`, r14, white | `--nk-space-s16`, `--nk-space-s12`, `--nk-radius-r14`, `--nk-color-bg-surface` |
| steps button | `paddingHorizontal 12`, `paddingVertical 4`, `marginBottom 4`, press 0.98 | `--nk-space-s12`, `--nk-space-s4` |
| steps row | `space-between`; first step aligns start, last aligns end | flex |
| step icon | 36×36, r50, 1px `$lightGreyColor`, white; filled → border = step colour | `--nk-color-border`; `TRACKING_TEXT_COLORS` |
| icon glyph | SD `iconUrl` 18×18, else built-in calendar path filled `stepColor` / `bluishGrey` #989FB3 | default path (copied from master); `--nk-color-text-tertiary` |
| track | `NoonDashedBorder` 2 px (dash 5/6, #EAECE0) at `top 17`; progress = white solid + colour solid, width `18 + (current−1)/(n−1)·(W−36) + 18` | `--nk-palette-dashed-border-default`, `TRACKING_COLORS` |
| name | `marginTop 8`, 13/500 `$slateGray`; filled → 600 + step colour (amber keeps slateGray) | `--nk-type-returns-text13-medium` / `-semibold` |
| date | 12, `marginTop 1`, #666D85 | `--nk-type-returns-text12`, `--nk-color-text-secondary` |
| colours | `TRACKING_COLORS` green #0F8857 · red #D0D4DD · gray #EAECF0 · amber #E5641A; text red #D92626 · gray #666D85 | `--nk-color-success`, `--nk-color-border-strong`, `--nk-color-border`, `--nk-palette-sunset-orange`, `--nk-palette-danger-red`, `--nk-color-text-secondary` |
| actions | `marginTop 4`, `paddingHorizontal 12`, gap 8; outline sm buttons: "Chat with seller" (SD `isChatEnabled`), `returns_cancel_return` (SD `allowActions.cancelReturn`), SD `trackingAction` when `actionCode === 'refunded'` | `AFSButton size="sm" variant="outline"` |

### Feedback box — `components/AFSReturnsFeedbackBox` + `AFSReturnsFeedbackWidget`

| Property | Master | Kit token |
|---|---|---|
| wrapper | `paddingTop 12` | `--nk-space-s12` |
| card | white, r16, `padding 12`, `gap 16` | `--nk-radius-r16`, `--nk-space-s12`, `--nk-space-s16` |
| title | `returns_feedback_widget_question` 16/600 `$blueGray900` | `--nk-type-returns-text16-semibold` |
| options | row, gap 4; each flex 1, h 40, r8, bg + border `$antiFlashWhite` | `--nk-space-s4`, `--nk-radius-r8`, `--nk-color-border-subtle` |
| option selected | bg `$softBlueBackground` #EBF4FF, border `$softBlueBorder` #BDDBFF, text `$primaryBlue` | `--nk-color-bg-info`, `--nk-color-border-info`, `--nk-color-primary` |
| option text | 16/600 `$slateBlueGray` #475067; press 0.9 | `--nk-type-returns-text16-semibold`, `--nk-color-text-muted` |
| labels | gap 8 below; `returns_feedback_widget_not_likely` / `_likely` 14/400 `$slateGray` | `--nk-type-returns-text14`, `--nk-color-text-secondary` |
| SD | `feedbackWidget[]` rates 0–10 + options | `data.ts` `feedbackOptions` |

### Product card — `components/AFSReturnsDetailsProductCard` + `AFSReturnsProductDetails` + `AFSReturnsItemDetailsSummaryButton`

| Property | Master | Kit token |
|---|---|---|
| wrapper | `paddingTop 12` | `--nk-space-s12` |
| card | white, `paddingBottom 16`, r16, 2px white border | `--nk-radius-r16`, `--nk-space-s16` |
| header | row, `padding 12`, `paddingBottom 11`, `margin 2`, top radii 16, gradient `#F9F9FB → #FFFFFF` start → end (mirrored RTL) | `--nk-color-bg-subtle` → `--nk-color-bg-surface` |
| header text | `returns_details_id` + ": " 14 `$slateGray`; number 14 `$blueGray900` | `--nk-type-returns-text14` |
| flag | `ProductFlag` (`fbn` → express pill), `marginEnd 2` | kit `MarketplaceTag kind="express"` |
| product | `padding 12`, `paddingBottom 16`, `gap 16` | `--nk-space-s12`, `--nk-space-s16` |
| image box | 60×80, r8, 1px `$lightGreyColor`, white, padding 8/6 | `--nk-color-border`, `--nk-radius-r8` |
| title | `marginStart 12`; 12/400/18 `$blueGray900`, 2 lines | `--nk-type-text12-regular-lh18` |
| price | 14/700/20, `marginTop 2`, currency weight 400; `Price` precision 2 (`1,699.00`) | `--nk-type-text14-bold-lh20` |
| seller | `marginTop 6`; `sold_by` "Sold by " 12/400/18 `$bluishGrey` + name `$blueGray900` | `--nk-color-text-tertiary` |
| summary rows | gap 12; each `paddingHorizontal 12`, gap 12; dashed separator `antiFlashWhite` first | `DottedDivider` |
| row | row gap 16; icon 24 `marginStart 4`; text `paddingTop 2`, gap 4 | `--nk-space-s16`, `--nk-space-s4`, `--nk-space-s2` |
| row title | 14/600/20 `$blueGray900` | `--nk-type-text14-semibold-lh20` |
| row subtitle | 12/400/18 `$slateGray`; refund amount `$green` 700 | `--nk-type-text12-regular-lh18`, `--nk-color-success` |
| chevron | `returns-chevron-right-bold.svg` 14, `padding 9`, r999, bg `$blueGray50` #FCFCFD, 1px `$antiFlashWhite`, RTL flipped | `--nk-palette-blue-gray50` |
| rows | Refund summary (`return_refund_summary` / `return_refund_desc_message` + amount, icon `returns-refund-summary.svg`, only with SD `refundDetails`) · Request summary (`return_request_summary` / `return_request_summary_details`, `returns-refund-request-summary.svg`) · Order summary (`returns_order_summary` / `return_order_summary_desc`, `returns-order-invoices.svg`) · Policy (`returns_policy`, `returns-policy.svg`, only with SD `returnPolicyCode`) | `data.ts` `copy` |

Actions: back → `popTo(rootComponentId)` (history, or the screen that opened the submission) · Continue Shopping → `switchToTab(HOME)` + `popToRoot` · Order summary → `openOrderItemDetails` → kit `orders/tracking`.

## 4. Tracking timeline overlay — `legacy/screens/AFSReturnsReturnTrackingScreenBase` (legacy overlay chrome)

| Property | Master | Kit token |
|---|---|---|
| card | bg white (`contentContainerStyle`) | `--nk-color-bg-surface` |
| title | `noon_return_track_my_return` `marginTop 4`, 20/bold `$blueGray900` | `--nk-type-returns-text20-bold` |
| list | `marginTop 12`, `paddingBottom 4`, `paddingHorizontal 2` | `--nk-space-s12`, `--nk-space-s4`, `--nk-space-s2` |
| step | row, `paddingHorizontal 2`, `paddingBottom 24` (last 0) | `--nk-space-s24` |
| icon | 36, r50, 1px `$lightGreyColor`, filled → step colour | as tracking box |
| base line | 2 px svg dash `1.5 3` round `$lightGreyColor`, centre x = 2 + 18 + 1 | `--nk-color-border` |
| progress line | 2 px, tracking colour, opacity 0.25 | `TRACKING_COLORS` |
| content | `paddingStart 16`, `paddingTop 2` | `--nk-space-s16`, `--nk-space-s2` |
| step title | 16/600 `$slateGray`; filled → step colour (not amber) | `--nk-type-returns-text16-semibold` |
| date | `marginTop 3`, `marginBottom 1`, 13 #666D85 | `--nk-type-returns-text13` |
| desc | `marginTop 4`, 14/18 `$blueGray700` #475067 | `--nk-type-body`, `--nk-color-text-muted` |
| cancel | `noon_return_cancel_return` outline md, `marginTop 24` | `AFSButton` |

## 5. Refund summary overlay — `legacy/screens/AFSReturnsRefundSummaryScreen`

| Property | Master | Kit token |
|---|---|---|
| title | `noon_return_refund_summary` 20/bold | `--nk-type-returns-text20-bold` |
| subtitle | SD `desc` `marginTop 4`, 14/18 `$slateGray` | `--nk-type-body` |
| card | `marginTop 16`, white, r12, `padding 12` | `--nk-radius-r12` |
| row | space-between, gap 12; title 14 `$slateGray`; amount 14 `$blueGray900` | `--nk-type-returns-text14` |
| separator | `NoonDashedBorder` 4/4 1px `antiFlashWhite`, `marginVertical 16` | `DottedDivider` |
| total | `paddingVertical 2`; `noon_return_refund_total` 16/600; amount 14/bold `$grass700` #108757 | `--nk-type-returns-text16-semibold`, `--nk-color-best-price-ink` |
| amounts | `formatRefundAmount` → `AED 1,699` (precision 2, insignificant zeros stripped) | `formatRefund()` |

## 6. Cancel / discard confirm overlays — `AFSReturnsCancelRequestOverlayScreen`, `AFSReturnsSubmissionCancelOverlayScreen`, `AFSReturnsSectionDiscardOverlayScreen`

| Property | Cancel request | Submission cancel / section discard | Kit token |
|---|---|---|---|
| scroll padding | 12 / top 12 / bottom 16 | same | `--nk-space-s12`, `--nk-space-s16` |
| container gap | 12 | 12, `paddingBottom 4` | `--nk-space-s12` |
| header card | white r16, `paddingHorizontal 8`, `paddingVertical 24`, gap 12 | `paddingVertical 20` | `--nk-space-s24` / `--nk-space-s20` |
| icon | `returns-rewind-cross.svg` 52 | + `padding 6`, `paddingVertical 4` | asset |
| title | `returns_cancel_return_overlay_title` 20/700/28 | `returns_discard_return_question` / `returns_discard_section_question` 18/700/24 | `--nk-type-returns-text20-bold-lh28` / `--nk-type-title-small` |
| desc | 14/500/20 `$slateGray`, `paddingHorizontal 32` | 14/500/20 (section: `maxWidth 80%`) | `--nk-type-returns-text14-medium-lh20` |
| note pill | — | SD `cancelText`: r9999, 1px `$lightGreyColor`, padding 10/12/14, icon `returns-info-circle-gray.svg` 18, 13/500/20 | `--nk-type-returns-text13-medium-lh20` |
| buttons | row gap 12: `returns_go_back_button` outline md + `returns_discard_return_button` danger md | section: `returns_keep_editing_button` + Discard | `AFSButton` |

## 7. Feedback overlay — `screens/AFSReturnsFeedbackOverlayScreen`

| Property | Master | Kit token |
|---|---|---|
| container | `padding 12`, bg #F9F9FB, gap 12 | `--nk-space-s12` |
| title / subtitle | `returns_feedback_widget_title` 20/600 · `returns_feedback_widget_question` 16/400 `$slateGray`, gap 4 | `--nk-type-returns-text20-semibold`, `--nk-type-returns-text16` |
| content card | white r16, `padding 12`, gap 16 | `--nk-radius-r16` |
| question | 0–6 `returns_feedback_widget_dislike_q` · 7–8 `_suggestion_q` · 9–10 `_like_q`, 16/600 | `copy.feedback*` |
| tags | wrap gap 8; 1px `$lightGreyColor`, r8, `padding 10`; 16/400; selected border `$blueGray900`, 600 | `--nk-color-border`, `--nk-color-text-primary` |
| input | h 90, 1px `$lightGreyColor`, r8, padding 14/16, 16; focus border `$blueGray900`; placeholder `returns_feedback_widget_comment` `$slateGray` | `--nk-type-returns-text16` |
| submit | inverted md `returns_feedback_widget_submit_feedback` (`_submitting` while loading), disabled until a tag is picked | `AFSButton variant="inverted"` |
| success | white cover, Lottie `returns-feedback-submission-success.lottie` 42×42 at 0.85×, then `returns_feedback_widget_success_msg` 16/600 `marginTop 8`; closes on finish | `assets/returns/returns-feedback-submission-success.lottie` |

## 8. Policy overlay — `legacy/screens/AFSReturnsPolicyScreen`

`card paddingTop 2`; header gap 12, icon (SD, 100 h); title 20/bold; body `marginTop 16`, white r12 `padding 12`, gap 8; `firstDesc` 14/18 `$slateGray`; `secondDesc` 14/600/18 `$blueGray900`; lines row gap 8, icon 16 (SD), 14/18 `$slateGray`; CTA outline `marginTop 16` (SD `button`). Demo copy is in `data.ts` `returnPolicy` (SD, no icons).

## 9. Returns history — `legacy/screens/AFSReturnsHistoryListScreen` (`returns/history`, new)

| Section | Property | Master | Kit token |
|---|---|---|---|
| container | bg | #F9F9FB | `--nk-color-bg-subtle` |
| header | layout | `paddingTop $statusBarHeightValue + 10`, white, row, `paddingHorizontal 12`, `paddingVertical 8`, gap 6 | `calc(var(--nk-inset-top) + var(--nk-space-s10))`, `--nk-space-s8`, `--nk-space-s6` |
| back / search buttons | | 40×40 white r9999 1px `$antiFlashWhite`; chevron max 20, search max 16, tint `$blueGray900` | `slim-chevron-left@3x.webp`, `search-bar@3x.webp` via `MaskIcon` |
| title | | `noon_return_list_screen_header` "Returns" 18/600 #1D2539, centred | `--nk-type-returns-text18-semibold` |
| search | | 40 h, 1px #EAECF0 r9999, `paddingHorizontal 12`, gap 8, icon 16 #1D2539, input 14 #1D2539, placeholder `noon_return_list_screen_search_placeholder` #7E859B, clear `x-mark` 20 #7E859B | `--nk-color-border`, `--nk-color-price-old` |
| search anim | | 250 ms out-cubic: title opacity 1→0 (0–0.5), scale 1→0.9; input opacity (0.5–1), scaleX 0.7→1; search button width 40→0, marginStart 0→−6 | `returnsTokens.searchDuration` |
| filters | | `paddingTop 16`, `paddingBottom 12`, `paddingHorizontal 12`, gap 6 | `--nk-space-s16`, `--nk-space-s12`, `--nk-space-s6` |
| year picker | | white, `padding 10/12`, r9999, gap 8, 1px #EAECF0; 14/600 #1D2539 + `arrow-down` (9×6) | `arrow-down@3x.webp` |
| status chip | | white, `padding 10/12`, r9999, 1px #EAECF0; selected bg #F9F9FB, border #666D85 + `x-mark` 16 `marginLeft 4` | `--nk-color-text-secondary` |
| list | | gap 12, item `paddingHorizontal 12` | `--nk-space-s12` |
| card | | white, 2px white border, r16, gap 12, overflow hidden | `--nk-radius-r16` |
| status strip | | gradient `ITEM_STATUS_GRADIENT_MAP[colorCode] → #FFFFFF` start→end, `padding 10/12`, gap 8; SD icon 18; label 14/600 `ITEM_STATUS_TEXT_MAP` | `--nk-color-returns-status-*` |
| info | | `paddingHorizontal 12`, `paddingBottom 12`, gap 10; row gap 12 | `--nk-space-s10` |
| image | | 57×76, `padding 8`, r8, bg #F9F9FB; image 49×68 contain | geometry, `--nk-color-bg-subtle` |
| texts | | `#returnItemNr` 14/400 #666D85; title 14/500 #1D2539 `marginTop 4`, 2 lines | `--nk-type-returns-text14`, `--nk-type-returns-text14-medium` |
| arrow | | 38×38, r28, 1px `$lightBlueColor` #F1F4FD, `slim-chevron-right` 20 | `--nk-color-returns-arrow-border` |
| tracking action | | SD; row centred, `padding 10/16`, gap 8, 1px #EAECF0, r10; `fees-refund-black` w 18; 14/600 | `fees-refund-black@3x.webp` |
| footer | | `padding 16`, `paddingBottom stickyBottomInset`, white; `noon_return_new_return_request` primary md | `AFSButton` |
| empty | | `NoonEmptyView` + `empty-return-requests` image; title 16/bold `steelColor` `marginTop 35`; message 14 `marginTop 10`; footer `noon_return_create_new` | `empty-return-requests@3x.webp` (280×155) |

SD demo values: `store.ts` (seeded returns), `yearFilters`, `statusFilters` in `data.ts`. The status `iconV2` SVGs are SD. The kit draws a kit `Icon` in the status colour instead (exception). `?empty=1` shows the empty state.

## 10. Returnable items — `legacy/screens/AFSReturnsReturnableListScreen` (`returns/returnable`, new)

| Property | Master | Kit token |
|---|---|---|
| header | `AFSBackHeader isBlur`, `returns_returnable_items_screen_header` "Your recent purchases" | `AFSBackHeader` |
| list | `paddingTop $statusBarHeightValue + 64`, gap 12, `paddingBottom stickyBottomInset` | `calc(var(--nk-inset-top) + var(--nk-space-s64))` |
| card | as history (2px white border, r16) | |
| status strip | gradient `ITEM_STATUS_GRADIENT_MAP[colorCode] ‖ #EBF4FF → #FFFFFF`, SD icon 18, SD desc 14/600 colour map ‖ #1D2539 | `--nk-color-bg-info` |
| info | `padding 10`, `paddingBottom 12`, gap 10; row gap 12 | `--nk-space-s10` |
| texts | title 14/500 #1D2539 `marginTop 2`; price 16/700 `marginTop 2`; `noon_return_sold_by` + store 14/400 #989FB3 / #1D2539 `marginTop 8` | `--nk-type-returns-text16-bold` |
| strip icon | SD `returnItemButtonV2.iconUrl` 18 | kit `Icon` clock in the strip colour (exception) |
| return button | `returnItemButtonV2.status === 'returnable'`: row centred, `padding 10/16`, gap 8, 1px #EAECF0, r10; `returnable-item` 20; SD title 14/600 | `returnable-item@3x.webp` |
| separator | svg line dash 4/4 #F2F3F7 | `DottedDivider dash="4, 4"` |
| item row | `noon_return_item` (capitalised) 14/400 #989FB3 + nr 600 #1D2539 uppercase · `ProductFlag` | `MarketplaceTag` |

## 11. Return submission — `screens/AFSReturnsReturnSubmissionScreen` (`returns/submit`)

Render tree: `AFSBackHeader isBlur` (title `''` on the reason section, `returns_screen_title_submit_return` after; 16/700 `$blueGray900`) → `CompoundFlatList` [`AFSReturnsSectionsManager` (completed-section cards), current section] → `AFSReturnsSubmitActionButton` (footer). Sections arrive from the API one at a time (`nextSection` / `prevSections`). The demo order is **reason → comment_images → return_mode → refund_method → pickup_details** (SD, `data.ts` `submissionSections`). The last one turns the footer into `returns_submit_return_button`.

| Section | Property | Master | Kit token |
|---|---|---|---|
| screen | bg / padding | #F9F9FB; inner `paddingBottom stickyBottomInset(16)`; content gap 16 | `--nk-space-s16` |
| list | paddingTop | `$statusBarHeightValue + 52`, with completed sections `+ 66` | `calc(var(--nk-inset-top) + var(--nk-space-returns-submit-top))` (52 / 66) |
| list | gap | 16 | `--nk-space-s16` |
| section wrapper | | `paddingHorizontal 12` | `--nk-space-s12` |
| footer | | `paddingHorizontal 12`, primary lg full width, text 16/600/24; disabled → opacity 0.72 + scale 0.99 (250 ms out-cubic) | `returnsTokens.footerDisabledOpacity` |
| footer (skip) | | `AFSDashedLineButton` `returns_evidence_skip_button`: 16/500 `$slateGray` over a 1px `2 3` round dash #666D85, gap 2 | `--nk-type-returns-text16-medium` |
| section enter | | height + translateY −16→0 spring (damping 14, stiffness 180, mass 0.8) + opacity 250 ms out-cubic | `returnsTokens.sectionSpring`, `fadeIn` |
| summary card enter | | opacity 0→1, translateY 10→0, 250 ms out-cubic, `LinearTransition` 250 | `returnsTokens.summaryOffset` |

### Completed sections — `sections/AFSReturnsSectionsManager`

`paddingHorizontal 12`, gap 12. Card: `padding 12`, r16, white, row gap 12. SD icon 40×40 (kit: reason art tile, exception). Text 14/600/20 `$slateBlueGray`, 2 lines. `returns-edit-pen.svg` 36. The evidence card adds a 2-photo stack (24×24, r4, 1px #F9F9FB, offsets 5/11, back photo opacity 0.5), the "Add photos" pill (`returns_comment_images_action_button_text` 12/600/16, `padding 10/12`, r9999, 1px #F2F3F7, `returns-plus-black-v2.svg` 16) and the note row (14/500 `$slateGray`, `returns-edit-pin-square.svg` 20, dashed separator). Tapping a card while the current section is dirty opens the discard overlay.

### Reason — `sections/AFSReturnsReasonSection/**`

| Property | Master | Kit token |
|---|---|---|
| card | `padding 16/12`, r16, white | `--nk-space-s16`, `--nk-space-s12` |
| title | `returns_reason_question` 18/700, `paddingHorizontal 4`, gap 16 | `--nk-type-returns-text18-bold` |
| grid | rows of 2, gap 12; card width 48% | |
| card | min-h 126, r12, 1px `$antiFlashWhite`, white; selected border `$warrantyAccentColor` #0F7EFF | `--nk-color-primary-bright` |
| art | SD `iconUrl` h 80, `margin 4`, r8, slice | **SD.** Demo tile (`--nk-color-bg-subtle` + emoji), exception |
| text | `padding 10/12`; 14/600 | `--nk-type-returns-text14-semibold` |
| tick | `returns-radio-checked.svg` 18 at top/end 8 | asset |
| dimmed | opacity 0.2 over 250 ms + blur 2 (iOS) | `returnsTokens.reasonDimmedOpacity`, `reasonBlur` |
| dropdown | collapsible under the row: `paddingTop 12`, gap 16; `returns_sub_reason_question` 16/700 `paddingHorizontal 4`; list `padding 12/8`, r16, #F9F9FB; dashed `$lightGreyColor` separators `marginVertical 8` | `--nk-type-returns-text16-bold` |
| sub item | `padding 4`, gap 8; 14/500/20 (selected 700); radio `returns-radio-(un)checked-2.svg` 20; press 0.99 | `--nk-type-returns-text14-medium-lh20` / `--nk-type-text14-bold-lh20` |
| submit | a reason without sub-reasons submits right away; otherwise Continue enables once a sub-reason is picked | |

### Evidence — `sections/AFSReturnsEvidenceSection/**` (`comment_images`)

| Property | Master | Kit token |
|---|---|---|
| card | `paddingTop 16`, `paddingBottom 12` (0 + overflow hidden with the tips card), r16, white | |
| header | `paddingHorizontal 16`, gap 2, `marginBottom 32`; SD `images.title` 20/700/28; count line 14/400/20 `$slateGray` (`returns_evidence_n_uploaded_images_*`), remaining → `$sunsetOrange` | `--nk-type-returns-text20-bold-lh28`, `--nk-palette-sunset-orange` |
| buttons | `paddingHorizontal 12`, `marginBottom 16`, gap 12; each flex 1, h 88, `paddingVertical 20`, gap 4, white r12 1px `$lightGreyColor`; `returns-camera.svg` / `returns-gallery-2.svg` 24; `returns_evidence_camera_button` / `_gallery_button` 16/600/24 | `--nk-type-returns-text16-semibold-lh24` |
| grid | 3 columns, gap 16, square tiles: white r12, shadow `0 2 4 rgba(0,0,0,.06)`, remove `returns-cross.svg` 14 in a 3px white r32 button at 4/4; add tile r12 1.5px dashed `$brandBlue400` #85BDFF, gradient 153° `rgba(15,97,255,0)` 29% → `rgba(15,97,255,.04)` 83%, blue plus 28 | `--nk-color-returns-brand-blue400`, `--nk-color-returns-add-tile-end` |
| photo guide pill | `paddingHorizontal 12`, `marginBottom 16`; `padding 10`, start 10 / end 12, white r32 1px `$lightGreyColor`; camera 16 + `returns_evidence_photo_guide_button` 12/600 | `--nk-type-returns-text12-semibold` |
| note | `AFSReturnsCommentInput`: `padding 12/14`, 14/500, r12, 1px `$borderMedium` #D0D4DD, min 72 / max 180, placeholder SD `comment.title` `$bluishGrey`; counter 12/400 `$slateGray` end (`0/500`, min-chars copy), invalid 12/500 `$sunsetOrange` | `--nk-color-border-strong` |
| tips card | `AFSReturnsPhotoGuideCarousel`: `padding 16/16/20`, gap 16, 4px white side/bottom borders, r16, #F9F9FB; stack frame 81×69 (front 69 at 12/0, next 57 at 14/6 · 0.2, prev 57 at 0/8 · 0.2), auto-advance 3000 ms / 450 ms out-cubic; `returns_evidence_photo_guide_tips_label` 12/700/14 `$bluishGrey`; caption 14/600/20; chevron 36 circle + `returns-chevron-right-primary.svg` 20. Shown while there are no photos and no note, then replaced by the pill | `--nk-type-returns-text12-bold-lh14` |
| guideline photos | SD `uploadGuideline.images` (CDN photos) | **SD.** Demo = three product-image tiles, captions = SD `sectionsV2` copy (exception) |
| footer | skip when `minCount 0` and nothing entered; submit once a photo or note exists | |

Photos: Camera adds the product photo (demo camera). Gallery opens the browser file picker (`<input type=file accept=image/* multiple>`).

### Resolution — `sections/AFSReturnsResolutionSection/**` (`return_mode`)

Card `padding 16/12` r16. Title SD `titleV2` 18/700/24 `paddingHorizontal 4`. Modes gap 12. Mode: `paddingVertical 14`, gap 14, r16, 1px `$antiFlashWhite`, bg #F9F9FB; selected border #0F7EFF + bg `$brandBlue50` #F5FAFF. Row `paddingHorizontal 12`, gap 10; SD icon 24 (kit `Icon`, exception); title 16/600/22; subtitle 12/400/18 `$slateGray`; radio 20 `marginTop 12`. Separator h1 `$softBlueBackground` `marginHorizontal 12`. Amount row `paddingHorizontal 16`, gap 4: amount 14/700/20 `$green` · "•" 14/500/20 `$slateGray` · SD `descV2` 14/500/20. The estimated-refund button (below) appears for the selected mode.

### Refund method — `sections/AFSReturnsRefundSection/**`

Title SD 18/700/24, options gap 12. Option: `paddingVertical 12`, r16, gap 12, 1px `$antiFlashWhite`, #F9F9FB; selected (multi-option only) border `$primaryBlue` #0F61FF + `$brandBlue50`. Content `paddingHorizontal 12`, gap 10; payment source gap 10: icon 32×28 contain, title 16/600/22, desc 12/400/18; sources joined by `returns-plus-black-v2` 20. Radio `radio-(un)checked.svg` (warranty-claims CDN). Separator h1 `$antiFlashWhite` `marginHorizontal 16`. Footer `paddingHorizontal 16`, gap 2: SD tag 14/600/20 in SD colour + SD icon 12 (or desc 12/400/18 `$slateGray`). Estimated refund button: `padding 12`, r10, bg `$lightGreen` #E3FCF2; title 14/600/20 `$green`; amount 14/700/20 + `returns-arrow-bottom-green.svg` 11×6, gap 6 → refund details overlay.

### Refund details overlay — `screens/AFSReturnsRefundDetailsOverlayScreen`

Scroll padding 0, card white. Title box `padding 14/16/16` (top 14), SD `detailsTitle` 16/700/20. Content `paddingHorizontal 12`, `paddingBottom 12`; rows box `paddingVertical 16`, 1px `$antiFlashWhite`, r12, gap 12; row `paddingHorizontal 12`, gap 8: title 14/500/20 `$slateBlueGray`, amount 14/600/20; dashed `$borderMedium` separator; total 14/600/20 · 18/700/24 `$green`.

### Pickup — `sections/AFSReturnsPickupSection/**`

| Property | Master | Kit token |
|---|---|---|
| card | `paddingHorizontal 12`, `paddingTop 16`, `paddingBottom 14`, r16; gap 24 | `--nk-space-s24` |
| titles | SD `addressHeader` / `pickupHeader` 18/700/24, `paddingHorizontal 4`, gap 12 / 16 | `--nk-type-title-small` |
| from card | `padding 12`, r16, 1px `$antiFlashWhite`; `returns-pin-island.webp` cover at 0.5 opacity; gradient white 0 → white 55% from (0.97, 0.32) to (0.03, 0.68) | `assets/returns/returns-pin-island.webp` |
| from row | gap 10; `returns-location-pin-filled.svg` 24; title 14/600/20, subtitle 12/400/18 `$slateGray` (gap 6, 1 line); edit 32 circle white 1px #F2F3F7 `padding 9` + `returns-edit-pen-filled.svg` 18 | |
| dates | horizontal list gap 8; chip min-w 66, `padding 2`, #F9F9FB, r14; selected bg `afsDarkNavy` #101628 + `marginBottom 16` + triangle 16×8 (#F2F3F7, or `supermallLightBlue` #EDEEFD with rocket slots); disabled 0.5 | `--nk-color-text-strong`, `--nk-color-returns-supermall-light-blue` |
| day name | `padding 4/4/6`; 11/500/14 `$slateGray` (selected white) | `--nk-type-returns-text11-medium-lh14` |
| day number | white, `padding 8/8/12`, radii 6 top / 12 bottom; 20/700/28; month 11/500/14 (selected `$blueGray900`) | `--nk-type-returns-text20-bold-lh28` |
| slots | r10, `padding 4`, gap 4; bg gradient to bottom #F2F3F7 (or #EDEEFD → #F9F9FB 50% with rocket) | |
| slot | `padding 8`, gap 8; desc 14/500/20 `$slateBlueGray`; rocket 14/700/20 `$rocketBlueSapphire` #2122B8 + `returns-supermall-tag.svg` 59×18; radio 20 (hidden for a single slot) | `--nk-palette-rocket-blue-sapphire` |
| address overlay | container `padding 12` gap 12; items gap 12: white, 1px `$lightGreyColor` (selected `$blue100` #E1EFFF), r12; header `padding 8 / 8 / 12`, #F9F9FB (selected `$blue50` #EFF7FF), icon box `padding 4.5` white r8; label 14/600/18; distance pill 10/700/12; details `padding 12` gap 8: area 13/400/17, name/phone 12/400/17 + `returns-verified-green.svg` 14; confirm inverted lg `returns_pickup_address_overlay_button_title` | `--nk-palette-lavender`, `--nk-palette-alice-blue` |

Kit `AddressV2SearchInput` above the list is not reproduced (exception: two demo addresses, no search).

### Error / unsupported — `components/AFSReturnsSubmitErrorView`

`paddingTop 120`; centred gap 24; `returns-error-icon.svg` 92.3; text `paddingHorizontal 36`, `paddingBottom 24`, gap 8; `returns_submit_error_default_title` 20/700/28, `_description` 14/400/20; buttons `padding 12 / 12 / 4`, gap 12: `returns_submit_error_retry_button` primary lg, `returns_submit_error_contact_support_button` outline lg with border `$softBlueBorder` + text `$primaryBlue`. The kit shows it for `returns/submit?error=1`.

## 12. Request summary — `screens/AFSReturnsRequestSummaryScreen` (`returns/summary`)

| Section | Property | Master | Kit token |
|---|---|---|---|
| header | | `AFSBackHeader` bg `$secondaryBackgroundColor`, `returns_screen_title_return_request_summary` | |
| list | | `paddingHorizontal 12`, `paddingTop contentTopOffset+18`, `paddingBottom 12`, gap 12 | `--nk-space-returns-content-top` |
| details card | | white `padding 12` r16 gap 12; `returns_return_item_details_screen_header_small` 14/700/20 | `--nk-type-text14-bold-lh20` |
| info tiles | | row gap 8; flex 1, `padding 8/10`, #F9F9FB, r8; title 12/400/18 `$slateGray`; value 12/600/18 | `--nk-type-returns-text12-semibold-lh18` |
| reason | | gap 10 / 4; SD reason 16/700/20; sub 12/400/18 `$slateGray`; comment box `padding 8` #F9F9FB r8, 12/400/18 | `--nk-type-text16-bold-lh20` |
| pickup card | | `padding 12/12/14`, r16, gap 12; rows gap 6, icon box `padding 1`, `returns-pickup-location.svg` / `returns-pickup-time.svg` 22; text `paddingTop 2` gap 4; title 14/600/20; values 12/400/18 `$slateGray` | |
| images | | card `padding 12/12/14`, gap 16; `returns_return_images_title` 14/700/20; horizontal gap 12, 100×140 r8 tiles | |
| footer | | `padding 12`, `paddingBottom stickyBottomInset`; "Continue Shopping" primary lg | |

## 13. Copy keys used (en)

`features/afs/returns/locale/translations/returns-en.json`: `returns_continue_button`, `returns_submit_return_button`, `returns_reason_question`, `returns_sub_reason_question`, `returns_discard_return_question`, `returns_discard_return_desc`, `returns_discard_return_button`, `returns_go_back_button`, `returns_discard_section_question`, `returns_discard_section_desc`, `returns_keep_editing_button`, `returns_evidence_n_uploaded_images_*`, `returns_evidence_photo_guide_button`, `returns_evidence_photo_guide_overlay_cta_button`, `returns_evidence_skip_button`, `returns_evidence_skip_overlay_*`, `returns_evidence_camera_button`, `returns_evidence_gallery_button`, `returns_evidence_open_camera_button`, `returns_evidence_upload_from_gallery_button`, `returns_comment_images_action_button_text`, `returns_pickup_address_overlay_*`, `returns_submit_error_*`, `returns_cancel_return`, `returns_details_id`, `returns_order_summary`, `returns_policy`, `returns_continue_shopping`, `returns_return_item_details_screen_header_small`, `returns_return_summary_request_date`, `returns_daily_return_id_label`, `returns_return_images_title`, `returns_return_pickup_date_time`, `returns_return_pickup_address`, `returns_cancel_return_header_*`, `returns_cancel_return_overlay_*`, `returns_screen_title_*`, `returns_returnable_items_screen_header`, `returns_feedback_widget_*`, `returns_input_*`.
`src/locale/translations/en.json`: `return_refund_summary`, `return_refund_desc_message`, `return_request_summary`, `return_request_summary_details`, `return_order_summary_desc`, `sold_by`, `done`.
`marketplaces/noon/locale/translations/noon-en.json`: `noon_return_list_screen_header`, `noon_return_list_screen_search_placeholder`, `noon_return_new_return_request`, `noon_return_create_new`, `noon_empty_view_return_requests_*`, `noon_return_sold_by`, `noon_return_item`, `noon_with_extended_warranty`, `noon_return_track_my_return`, `noon_return_cancel_return`, `noon_return_refund_summary`, `noon_return_refund_total`, `noon_retry`.

## 14. Assets (`src/assets/returns/`)

From git (`marketplaces/noon/theme/assets`, `src/theme/assets`, @3x): `slim-chevron-left`, `slim-chevron-right`, `search-bar`, `x-mark`, `fees-refund-black`, `returnable-item`, `arrow-down`, `empty-return-requests` (`.webp`). The AFS icons are CDN-only (`AFSIcons.BASE_AFS_CDN_URL/returns/*.svg`, `…/warranty-claims/radio-*.svg`, `AFSImages.returnsPinIsland`, `AFSLotties`), so they were downloaded from `f.nooncdn.com` under the same names (`wc-` prefix for the warranty-claims radios).

## 15. Server-driven demo data (`data.ts`)

| Field | Demo |
|---|---|
| `returnItemNr` | `R` + order number digits (e.g. `R40021571220`) |
| `tracking` | 4 stages *Requested · Pickup · Inspection · Refund*, `currentStage` 2 (1 straight after submit; seeded p7 3, p3 4), `colorCode` green, no `iconUrl` (built-in glyph); each reached stage (and the scheduled pickup) is dated request date + 0 / 1 / 3 / 4 days |
| `allowActions.cancelReturn` | `ReturnRecord.allowCancel`: true until picked up (false for the seeded inspection / refunded returns and after a cancel); `isChatEnabled` false |
| `trackingAction` | refunded p3: `{ title: 'Track refund', actionCode: 'refunded', deepLink }` → outline sm button under the steps (toast for the deep link); otherwise none |
| `refundDetails` | `AED` + product price, one "Item price" row |
| `feedbackWidget` | rates 0–10 with 4–5 options each |
| `returnSummary` | requested date, reason / sub-reason / comment from the submission (or defaults), pickup address = `user` + `user.address`, pickup slot, images = product photo |
| `successHeader` | `successHeading` "Return request submitted", `successSubheading` "We'll pick up your item on the selected date." |
| sections | reasons (6 with sub-reasons), evidence (`minCount 0`, `maxCount 5`, note optional 10–500), modes (refund / replacement), refund options (original card + noon credits with "Instant" tag), pickup (address present, 5 dates, rocket slot on the first) |

## 16. Shared follow-ups (not edited, outside `src/flows/returns`)

- `src/flows/account/data.ts`: the "Returns" row should open `returns/history` (master pushes the history list), not `returns/details`.
- `src/kit/routes.ts`: alias `returns` → `returns/details` stays as asked. `/returns-history` and `/returnable-items` are added through `ScreenDef.path`.
- `src/mocks/products.ts`: `productById` only searches `products`. The returns flow resolves live ids (`liveProducts`, sku/offer ids) itself (`product.ts`). A shared `anyProductById` helper would serve other flows too.
- Kit `nav` has no `popTo(key)`. The flow pops by counting entries (`popTo` in `nav.ts`). A native `popTo` would avoid the stacked exit animations.
- Kit `nav.sheet` cannot render the floating AFS overlay card (12 px inset, r16 all corners, #F9F9FB, handle above the card). A `variant: 'floating'` sheet would let the returns overlays become routes.
