# noon One subscribe journey — bappzaar master → kit mapping

Source: bappzaar `origin/master` (d481712, 2026-10-10). Feature root `features/vip` (theme `features/vip/theme`, copy `features/vip/locale/translations/vip-en.json`, account/cart/checkout copy from `src/locale/translations/en.json` + `marketplaces/noon/locale/translations/noon-en.json`).
Kit flow: `src/flows/noonone` (id `noonone`, initial `landing`, URL `/noon-one`). Management (manage / change / cancel / invoices / family / referrals / partners / Yango credits) is the `membership` flow — the journey links to `membership/manage`.

## Live variants (FeatureFlags)

`FeatureFlags.checkVariant(name, v)` is true only when the A/B id is in `FeatureFlags.data`; with no flags (the default) every flagged branch is **off**.

| Decision point | Master code | Default (live) | Kit |
|---|---|---|---|
| Plan select screen | `VIPUtil.showPlanSelectV2` → always `noon.VIPQuickPlanSelectV3Screen` | V3 | `noonone/plans` = V3. `VIPQuickPlanSelectScreen` (V1) only registered for legacy screen names — not ported |
| Bundle screen | `VIPUtil.showBundleScreen` → `VIPBundleV2Screen`; deeplink `/noon-one-bundle` → V2 only for `code=yango`, else `VIPBundleScreen` | V2 (yango) | `noonone/bundle` = V2 |
| Upgrade | `isVIPUpgradeV2Enabled()` (`vip_upgrade_v2`) | V1 | management flow |
| Cancel | `isVIPCancelV2Enabled()` (`vip_cancel_v2`) | V1 | management flow |
| Savings widget on member landing | `isVIPSavingsWidgetV2Enabled()` (`vip_savings_widget_v2`) → `VIPSavingsOverviewModuleV2` else V1 | V1 | see landing section |
| Cart overlay CTA | `isVIPV2CartPlansLinkEnabled()` (`vip_v2_cart_link`) → landing + redirect to plan select, else landing only | landing only | see entry section |
| Landing partner popup | `isVIPEnbdV2Enabled()` (`vip_enbd_v2`) → `VIPPartnerOverlayScreen` on load | off | not shown |

## Routes and URL aliases

| Route | bappzaar screen | URL aliases (`ScreenDef.path`) |
|---|---|---|
| `noonone/landing` | `noon.VIPLandingScreen` | `/noon-one`, `/noonvip` |
| `noonone/success` | VIPLandingScreen + `VIPTransitionAnim success` (after `VIPEventEmitter.vipMembershipChanged`) | — |
| `noonone/plans` | `noon.VIPQuickPlanSelectV3Screen` | `/noon-one-all-plans`, `/vip-plans` |
| `noonone/familyPlans` | `noon.VIPFamilyPlansScreen` | `/noon-one-sharing` |
| `noonone/payment` | `noon.VIPPaymentV2Screen` | — |
| `noonone/offers` | `noon.VIPOffersOverlayScreen` | `/noon-one-vouchers`, `/noon-one-bank-offers` (+ see offers) |
| `noonone/partnerOffer` | `noon.VIPOffersV2Screen` | `/noon-one-partner-offer` |
| `noonone/bundle` | `noon.VIPBundleV2Screen` | `/noon-one-bundle` |
| `noonone/acceptInvite` | `noon.VIPAcceptPlanInviteOverlayScreen` | `/noon-one-share-invite` |
| overlays (`planOption`, `planDetails`, `trialGuide`, `addCard`, `addCvv`, `mobilePay`, `info`, `generic`, `acceptInviteError`, `cartOverlay`, `ocOne`) | `navigator.showOverlay(...)` | — |

Deep links (`features/vip/navigation/vipDeepLinkHandler.ts`, `src/utils/ModuleHelper.ts`): `/noonvip` & `/noon-one` push the landing; every other `/noon-one-*` path runs `VIPUtil.showLandingWithRedirect` (landing pushed, redirect screen pushed on top in its `useLayoutEffect`). Kit: `showLandingWithRedirect(nav, redirect)` in `store.ts`.

## Shared chrome

### VIPOverlayBottomSheet → `components/VIPOverlay.tsx`
`features/vip/components/VIPOverlayBottomSheet` over `src/components/OverlayBottomSheet` (+ `src/constants/OverlayBottomSheet.ts`).

| Property | Master value | Kit |
|---|---|---|
| backdrop | `rgba(30,30,30, 0.7)` (BACKDROP_BACKGROUND_COLOR_RGB × BACKGROUND_MAX_OPACITY_PERCENTAGE) | `--nk-color-vip-scrim` |
| backdrop fade | `withTiming` 350ms `Easing.inOut(Easing.ease)` | `baseTokens.overlay.ms/ease` |
| sheet enter | `translateY` 300 (ARBITRARY_ANIMATION_HEIGHT) → bounceMargin 0, `withSpring({ mass 1, stiffness 110, damping 15 })` | `baseTokens.overlay.enterFrom/spring` |
| sheet close | `withTiming` → contentHeight (popup: ½ screen + ½ content), 350ms inOut | VIPOverlay `close()` |
| drag close | `translationY > min(height×0.5, 250)` or `velocityY > 2000` | `closeRatio/closeMax/closeVelocity` |
| wrapper | `paddingTop 60`, `justifyContent flex-end` | `--nk-layout-vip-sheet-top` |
| sheet radius | OVERLAY_SHEET_RADIUS 18 on all four corners | `--nk-radius-vip-sheet` |
| sheet float | `marginBottom = overlayBottomSpacing()` = 12 + safe-area bottom | `calc(var(--nk-inset-bottom) + var(--nk-layout-vip-sheet-float))` |
| bg | `white` | `--nk-color-bg-surface` |
| handle | 36×4, r2, `#B7B7B7`, `top -18` (above the card), tap = close | `--nk-layout-vip-handle-*`, `--nk-color-vip-handle`, `--nk-radius-r2` |
| popup | `justifyContent center`, card `marginHorizontal 20`, r10 | `.popup` (`--nk-layout-vip-popup-inset`, `--nk-radius-r10`) |
| floating | wrapper `paddingHorizontal 12`, card r16 | `.floating` (`--nk-layout-vip-floating-inset`, `--nk-radius-r16`) |

Stack integration: overlays are `presentation: 'modal'` + `transition: 'noonone-overlay'` (`transitions.ts`) — the stack entry is transparent so the screen below stays visible exactly like an RNN overlay; the component runs the sheet motion itself; `nav.back()` from anywhere fades the layer (200ms).

### VIPButton → `components/VIPButton.tsx`
`features/vip/components/VIPButton`: unstyled; `scale` 1 → 0.97 (`withTiming` 100ms in / 200ms out), `onPress` via `setTimeout(onPress, 200)`, `isLoading` → white `Loader`, `htmlTitle` → `HtmlView`. Kit: `baseTokens.button`, `HtmlText`, `Spinner`.

### Theme (features/vip/theme)
`VIPColors` → existing kit tokens where equal (`textPrimary #1D2539 → --nk-color-text-primary`, `textSecondary #475067 → --nk-color-text-muted`, `textTertiary #666D85 → --nk-color-text-secondary`, `textMuted #989FB3 → --nk-color-text-tertiary`, `action #0F61FF → --nk-color-primary`, `noonYellow → --nk-color-brand`, `successLight #0F8857 → --nk-color-success`, `successDark #0B623F → --nk-palette-base-green800`, `lightBlue #D6E9FF → --nk-palette-pale-blue`, `lightGrey #D0D4DD → --nk-color-border-strong`, `surfaceGrey #F9F9FB → --nk-color-bg-subtle`, `surfaceTertiary #F2F3F7 → --nk-color-bg-page`, `surfaceMuted #EAECF0 → --nk-color-border`, `blueGrey #343D54 → --nk-color-text-body`, `buttonPrimary #101628 → --nk-color-text-strong`, `successTag #108757 → --nk-color-best-price-ink`, `borderPrimary #F5F5F5 → --nk-palette-border-primary`, `noonGrey1 → --nk-color-price-old`, `noonGrey2 → --nk-palette-noon-grey2`, `charcoalGreyColor → --nk-color-text-legacy`, `error #D92626 → --nk-palette-danger-red`, `warning #E5641A → --nk-palette-sunset-orange`, `supermallBlue #2122B8 → --nk-palette-rocket-blue-sapphire`); the rest are flow tokens in `tokens/base.ts` (`--nk-color-vip-yellow-dark #A36200`, `-success-surface #F1F9F6`, `-light-green #CBF6E5`, `-light-yellow #FFF7C2`, `-dark-grey #394152`, `-steps-line #C8CDD5`, `-elevation #242424`, `-black2 #262626`, `-hexagon-bg #FED2D2`, `-hexagon-text #C45C5C`, `-black #000000`).
`VIPStyles` type scale h40…h16 → `--nk-type-vip-h*` (`b16/b14/b13/b12/b11` map to area type tokens). `VIPStyles.primaryFont()` = `ThemeManager.styles.primaryFont()` → kit `--nk-font-family`. `VIPUtil.responsiveFontSize(n)` on a 375-wide base scales ~1.02 at the kit's 390pt device; the kit uses the base sizes (difference < 0.3px).
`VIPMetrics.edgeSpacing()` 15 → `--nk-space-s15`.

## State

- `src/kit/membership.ts` (shared, append-only additions): `membershipEligibilityStore` / `useMembershipEligibility` (`loyalty.membership.isEligibleForTrialAcrossPlans`), `isNoonOneMember` / `useIsNoonOneMember` (`loyalty.isNoonOneSubscribed`), `noonOneJourneyActions.subscribe` (wraps `membershipActions.subscribe` + consumes the trial) and `.resetToNonMember`. Existing fields/actions untouched.
- `src/flows/noonone/store.ts` (flow-local `createStore`): `selectedPlan`, `paymentMethod`, `addedCards`, `trialGuideShown`, `voucherCode`, `pendingSuccess` — mirrors `vipPaymentDataReducer` + the `VIPEventEmitter.vipMembershipChanged` hand-off. `completeSubscription(nav, plan)` = createSubscription success: writes the membership store (every entry point flips to its member state), queues the landing success animation, `Navigation.popTo(landing)`.

## Server-driven data (demo values, `data.ts`)

Master has no VIP fixtures/mocks (`__tests__`/`__mocks__` contain none for `features/vip`). Plans, prices, benefits, terms and CMS modules come from `VIPService.getVIPTouchpoints('landingV2' | 'planSelectV2' | …)`. Demo UAE catalogue: Individual AED 25/month · AED 250/year (save 17%), Duo AED 35/month · AED 350/year, Family (up to 5) AED 45/month · AED 450/year, One + Yango Play AED 39/month; 30-day free trial while `trialEligible`; saved cards Visa ••4242, Mastercard ••0019. `withEligibility()` re-prices plans once the trial is used.

---

## Landing — `noonone/landing` (`/noon-one`, `/noonvip`) · `noonone/success`

Source: `features/vip/screens/VIPLandingScreen/{VIPLandingScreen.tsx,styles.ts}` (master d481712). Kit: `screens/LandingScreen.tsx`, `components/landing/*`, `data.landing.ts`, `tokens/landing.ts`.
Live variant: VIPLandingScreen is the only landing (registered `noon.VIPLandingScreen`, HeaderTypes.BACK but `topBar.visible: false` → custom header). `VIPUtil.scale/verticalScale` (×390/375, ×844/812 ≈ 1.04) and `responsiveFontSize` (rounds back to the base size at 390pt) are mapped to the unscaled base value.

### Screen chrome
| Section | bappzaar | Property | Master value | Kit token |
|---|---|---|---|---|
| container | `styles.container` | background | VIPColors.surfaceTertiary #F2F3F7 | `--nk-color-bg-page` |
| spacer (no image bg) | `styles.spacer` | height | statusBar + 20 | `calc(--nk-inset-top + --nk-space-s20)` |
| header wrapper | `headerWrapper` | padding | top statusBar, h scale(12), bottom verticalScale(12) | `--nk-inset-top`, `--nk-space-s12` |
| header bg | `headerBg` + VIPStyles.shadow2 | bg / shadow / opacity | white; grey 0 3.2 r3.2 op .1; scrollY [0,20]→[0,1] | `--nk-palette-white`, `--nk-color-vip-header-shadow`, `landingTokens.headerFadeEnd` |
| header row | `header` | height / gap | 40 / 8 | `--nk-layout-vip-header-row`, `--nk-space-s8` |
| back button | `backButton` | size / radius / border | 39 / 20 / 1 #E3E3E3 white | `--nk-layout-vip-back-size`, `--nk-radius-r20`, `--nk-color-vip-back-border` |
| back icon | `chevron-left-rounded.svg` | size / margin | 9×18, marginStart scale(−2) | `--nk-layout-vip-chevron-w/h`, `--nk-space-s2` |
| title | `headerTitle` + Text base | font / colour | 16 bold / #404553 (baseTextStyle) | `--nk-type-vip-header-title`, `--nk-color-text-legacy` |
| bg image (member) | `bgImage` | height / parallax | 320, translateY scrollY [0,300]→[0,−300] | `--nk-layout-vip-bg-height` (scrolls with content) |
| list padding | CompoundFlatList contentContainerStyle | paddingBottom | stickyContainerHeight (default 200) + 26 | measured `ResizeObserver` + 26 |
| payment terms | `paymentTermsContainer` / `paymentTermsTextStyle` | margin / radius / padding / border / text | mx16, r12, p15, 1 #EDEDED white; 13/23 #666D85 | `--nk-space-s16`, `--nk-radius-r12`, `--nk-space-s15`, `--nk-color-vip-terms-border`, `--nk-type-vip-terms`, `--nk-color-text-secondary` |
| skeleton | `VIPSkeletonLoader` | lottie | `vip-loading-shimmer.lottie` cover, loop (FeedbackView LOADING) | `LottieBox fit=cover`, `landingTokens.loadingMs` 600 (demo) |
| reminder toast | `reminderToast*` | bg / r / border / padding / text / icon | white, r12, 1 #EEEEEE, 12; 14 #5D5D5D ms8; one-green-check 16 | `--nk-color-vip-toast-border`, `--nk-type-vip-toast`, `--nk-palette-secondary-text-color` (param `reminder`) |

### Sticky footer (`renderStickyFooter`, `VIPSubscriptionButtonV2`, `Flyout`)
| Element | Property | Master | Kit |
|---|---|---|---|
| stickyFooter | bg / radius / shadow / paddingBottom | white, top r12; black 0 7 r8 op .4; stickyBottomPadding (inset or 15) | `--nk-radius-r12`, `--nk-palette-black-alpha40`, `max(--nk-inset-bottom, --nk-space-s15)` |
| slide in | stickyButtonAnim | translateY h+12 → 0, 300ms Easing.ease | `landingTokens.sticky` |
| noBorderRadius | when flyout | r0 | `.noRadius` |
| stickyButtonContainer | padding | top/h 15 (`$edgeSpacing`) | `--nk-space-s15` |
| stickyButton | size / radius / mb / bg | 100% × 60 (48 with payment), r12, mb verticalScale(8), black (V2 `button`) | `--nk-layout-vip-sticky-button(-pay)`, `--nk-color-vip-black` |
| button text | buttonTextStyle + stickyButtonText | white bold 18; `<s>` 400 line-through 16 | `--nk-type-vip-sticky`, `--nk-font-size-body-large` |
| V2 container | gap | row, gap 20 | `--nk-space-s20` |
| payment row | card / label / value | cardType 44×40; "Pay with" 13/500 #02060C73 + chevron-up ×180°; "••••4242" 15/500 #02060CEB | `--nk-layout-vip-card-w/h`, `--nk-type-vip-pay-label`, `--nk-color-vip-ink45`, `--nk-type-vip-pay-text`, `--nk-palette-night-fall` |
| view plans | wrapper / button / text / dashed | mt8 mb2 white; 14/600 #0E0E0E; VIPDashedBorder 4/5/1 #343D54 under it | `--nk-type-vip-view-plans`, `--nk-color-text-ink`, `--nk-color-text-body` |
| flyout | container / text / trailing | row minH 40 px15 top r12 bg (server, default #1C1C1B); 14/500 textColor; trailing underline bold | `--nk-layout-vip-flyout-min`, `--nk-color-vip-flyout-bg`, `--nk-type-vip-flyout` |
| VIPButton | press | scale .97 (in 100 / out 200ms), onPress +200ms | `baseTokens.button` (shared `VIPButton`) |

### Modules (ModuleWrapper newUI: padding 0, marginBottom 24; ModuleHeader custom node: padding 0 15, mb 12, title row mb −8, 12/500 #475067 centred)
| Module | Property | Master | Kit |
|---|---|---|---|
| VIPBannerModule | width / height / title | screen−32; × ratio/100; lottie if lottieUrl; title b16/600 #171717 px16 mb12 | `.banners`, `--nk-type-vip-b16-semibold`, `--nk-color-vip-ink171717` |
| VIPMarketplaceBenefitsCarouselModule | card | white r12 pt20 pb8 mx16 | `.mpCarousel` |
|  | icon / label | 80×80; label h76 px16 pt8; title b16 bold #171717; subtitle 12/18 #3D3D3D mt4 | `--nk-layout-vip-mp-icon/-label`, `--nk-type-vip-b16-bold`, `--nk-type-vip-mp-subtitle`, `--nk-palette-kit-gray24` |
| VIPSlider | motion | slideWidth 80, scale .5, neighbours shifted (w−ws)/2, 400ms inOut(ease), autoplay 3500ms, swipe ≥20; labels cross-fade ±h/3, labelContainer mt4 | `landingTokens.slider` |
| VIPBenefitsModule | card / row | mx16 r12 white; row py16 px12 | `.benefits/.benefit` |
|  | text | title 16 bold #02060CEB mb4; desc 13 #02060CBF max 230 | `--nk-type-vip-benefit-title/-desc`, `--nk-palette-night-fall`, `--nk-color-vip-ink75`, `--nk-layout-vip-benefit-desc-max` |
|  | icons | icon 44; mpIcons 34 overlap −15 (highlighted mp last) | `--nk-layout-vip-benefit-icon/-mp/-mp-overlap` |
|  | divider | VIPDashedBorder 2/5/1 #02060C26 abs bottom, left 12 | `--nk-color-vip-ink15` |
|  | button | mt16 py8 px16 black r8 min127; 14 bold white | `--nk-layout-vip-benefit-button-min`, `--nk-type-vip-benefit-button` |
| VIPFamilyPlanModule | card | #F5F5F5 mx16 p12 r16 1 white, gap12 | `--nk-palette-border-primary` |
|  | text | title b16 bold lh22 #343D54 max 55%; subtitle b11 #475067 | `--nk-type-vip-family-title`, `--nk-type-vip-b11`, `--nk-color-text-body/-muted` |
|  | members | VIPPlanMembers 32/overlap 10 in #F9F9FB r40 | `PlanMembers`, `--nk-radius-vip-r40` |
|  | tags | r6 px8 py4 gap4, b12/500, gradient 90° | `.familyTag` |
|  | button | h44 r12 #101628 px24 gap6; b14/600 white | `--nk-layout-vip-family-button`, `--nk-color-text-strong` |
| VIPPlanMembers | ring / fill / initial / empty | stroke 1.6 white; VIPPlanMemberColors; size/2 bold lh24 −0.28; empty #EAECF0 + 10×1.5 #989FB3 plus; container #F2F3F7 r40 | `--nk-color-vip-member1..5`, `--nk-type-vip-member-initial14/16`, `--nk-color-border`, `--nk-color-text-tertiary` |
| VIPGuideStepsModule | card | p16 white mx16 r12 gap24 | `.steps` |
|  | step | 43 circle 1 #E5E5E5; unit 8 bold #3866DF; value h18/500 black | `--nk-layout-vip-step`, `--nk-color-vip-step-border`, `--nk-type-vip-step-unit/-value`, `--nk-color-cta` |
|  | text | title b14/600 #262A33 mb6; subtitle b12 #0E0E0EA7 | `--nk-type-vip-b14-semibold`, `--nk-palette-new-black`, `--nk-palette-dim-text-primary` |
| VIPExpandableTextModule (grouped) | card | mx16 p4 r16 4 white gap4 | `.faq` |
|  | title | row gap12 p12; h16 bold #343D54 | `--nk-type-vip-h16-bold` |
|  | rows | #F9F9FB r14; row px12 py16 gap8; header b14/600 #1D2539; body b14 #1D2539 after 1px white line; divider 3/6/1 #EBEBEB | `--nk-color-bg-subtle`, `--nk-radius-r14`, `--nk-palette-bright-grey-color` |
|  | motion | rows start collapsed; 300ms LayoutAnimation easeInEaseOut; chevron-down-m 16 rotates 0 → −180 (out-cubic); pressed scale .99 | `landingTokens.expand` |
| VIPMembershipOverviewModule | header anim / title / subtitle | lottie mt −70, h 260; name h28/800 mt −162 mb4 #1D2539; message b14 lh20 #666D85 mb28 | `--nk-layout-vip-overview-anim-top/-title-top`, `--nk-type-vip-h28-heavy`, `--nk-space-vip-s28` |
|  | plans card | p4 r12 1 white white | `.plans` |
|  | plan | ps16; inner pt4 pb12 pe8 minH70; status 13/18 medium + VIPStatusIndicator 18 (ms −5); title h20 bold; members 28/8 in h70 pt8 pb2 pe8 | `--nk-type-vip-b13-medium`, `--nk-type-vip-h20-bold`, `--nk-layout-vip-overview-plan-min` |
|  | billing | dashed 4/8/1 #EAECF0 px16; row py12; 12/18 medium #666D85 | `--nk-type-vip-b12-medium` |
|  | footer | #F9F9FB, r 4 4 8 8, 1 #FFFFFF14; row p12 gap10; text 13/18 #1D2539; switches 36 r20 white 1 #F2F3F7 | `--nk-color-vip-white8`, `--nk-layout-vip-overview-switches` |
| VIPStatusIndicator | ring / dot | ring 36×k radial (.37 colour → .685 mix 55% white → white) fill .3 stroke .4; scale 0→1.25 by f60 (bezier 0,0,.667,1), opacity 1→0 f30–60, 91f loop; dot 12×k | `landingTokens.status`, `--nk-color-vip-status-mid` |
| VIPSavingsOverviewModule (V1, `new`) | card / dots / text | mx16 r12 white; dots.webp both corners; centred pt22 pb18; title b11 bold ls3 #787878; amount h32 bold black (h32); subtitle 13 #787878 mt4 | `--nk-color-vip-savings-grey`, `--nk-type-vip-h32-bold`, `--nk-layout-vip-track-wide` |

### VIPTransitionAnim (success)
| Property | Master | Kit |
|---|---|---|
| lottie | `vip-landing-success-animation(.ar).lottie`, cover, full screen, z 9999 | `TransitionAnim` + `LottieBox fit=cover` |
| texts | top 62%; title 24/800 −0.4 #02060CEB; subtitle mt8 15/500 −0.14 #02060C99 | `--nk-layout-vip-success-text-top`, `--nk-type-vip-success-title/-subtitle`, `--nk-color-vip-ink60` |
| text motion | delay 4000×.7 / ×.725, 450ms out(sin), translateY 0→−60, opacity 0→1 | `landingTokens.transition` |
| end | on lottie finish (fallback 4000+200+500): fade 500ms (delay 200, ease) → contentAnim spring 0 (stiffness 80) — content translateY 200→0, opacity 0→1 | `landingTokens.transition.contentSpring` |

### Copy keys
`vip_noon_one` (header), `vip_coupon_code_copied`, `vip_one_reminder_set`, `vip_gc_pay_with`, `vip_apple_pay`, `vip_frequently_asked_questions` (FAQ title), `vip_one_landing_title` / `vip_one_landing_subtitle` (overview default), `vip_manage_your_membership` (member footer). Everything else is server copy (landingV2) — demo values in `data.landing.ts`.

### Assets
`src/assets/noonone/images/{vip-loading-shimmer, vip-landing-success-animation, vip-family-plans-header}.lottie`, `images/dots.webp`, `icons/{chevron-left-rounded, chevron-up-rounded, chevron-down-m, switches}.svg`, `icons/{card-visa, card-mastercard, card-amex, apple-pay, one-green-check}.webp` (from features/vip/theme/assets + src/theme/assets); `src/assets/noonone/landing/{noon-one-logo.lottie, noon-one-text.webp, noon-one.webp}` (marketplaces/noon/theme/assets). Marketplace icons reuse `src/assets/switcher/*`.

### Server-driven (demo values)
- `landingV2.cms.data` module list — non-member: VIP_BANNER_MODULE (hero, lottie = `vip-family-plans-header.lottie` stand-in), VIP_MARKETPLACE_BENEFITS_CAROUSEL_MODULE (noon / Minutes / Food / Instant / NowNow), VIP_BENEFITS_MODULE (free delivery, 5% cashback, members-only deals, Yango Play), VIP_FAMILY_PLAN_MODULE (`/view-sharing-plans` → `noonone/familyPlans`), VIP_GUIDE_STEPS_MODULE (trial steps), VIP_EXPANDABLE_TEXT_MODULE (4 FAQs). Member: VIP_MEMBERSHIP_OVERVIEW_MODULE (lottieUrl → noon One logo lottie stand-in; name from mocks user; plan/status/billing from `useMembership()`; footer `manage` → `membership/manage`), VIP_SAVINGS_BREAKDOWN_MODULE (`new`: "Save up to 5x"), benefits, FAQ.
- `landingV2.bgImg` (member) → CSS gradient stand-in (noon One banner peach → cream → page).
- `landingV2.plan` = `withEligibility(defaultPlan)`; button title = plan.buttonText; `paymentTerms` html; `flyout` coupon "ONE2026"; `viewPlansButton` "View all plans" (`/plan-select`).
- Not ported (need server media / other states): VIPVideoCarouselModule (video), VIPBannerCarouselModule, VIPOfferPlanModule, VIPTimedExclusiveOfferModule, VIPPartnerOfferPlanModule, VIPSavingsBannerModule, cobrand plan block in the overview (needs `isVIPEnbdV2Enabled`), CancelledAnimation (management flow), partner popup (`isVIPEnbdV2Enabled`), referral popup, app-update dialog, pull-to-refresh.

### Flags / variants
`FeatureFlags.checkVariant` is false when the AB id is absent, so default-live paths are the non-flag ones: VIPSavingsOverviewModule **V1** (V2 behind `vip_savings_widget_v2`), no partner popup / cobrand plan (`vip_enbd_v2`). Plan select from the landing = `VIPUtil.showPlanSelectV2` → `noon.VIPQuickPlanSelectV3Screen` (→ `noonone/plans`).

### Behaviour
- Sticky "/create": first tap (trial guide not shown) → `noonone/planDetails` (VIPPopupUtil.showPlanDetailDialog); afterwards `handlePayment()` → Loader 1.2s → `completeSubscription` → success animation. "Pay with" row → `noonone/payment`.
- Success: `noononeStore.pendingSuccess` consumed when the landing is top of stack → VIPTransitionAnim → member landing (sticky footer hidden: member landingV2 has no `/create` button).
- Deviations: header back button is the shared `Pressable` with activeOpacity-style feedback; bg image scrolls with the list instead of the clamped parallax (identical for the first 300px); VIPAnimatedDigits digit roll → count-up 0→5 over 1.2s.

### Non-member landing (prod, Figma Af34gfmhQ1D0wstXUEHSIF · 24:2604)

`noonone/landing` for a non-member renders the prod frame "113" (375 wide; column "Frame 2147238709" 24:2625, 1740 tall). **Look = Figma, behaviour = bappzaar master.** Master `b7bcbb084ce` only changed the landing back button (40 × 40, `surfaceTertiary` border) and added the `/plan-select` loading state. The page is an ordered `landingV2.cms.data` list (`npLanding.modules` in `data.landing.ts`), rendered by `NpModuleRenderer` (a port of `VIPModuleRenderer`) in `components/landing/npModules.tsx`. Styles are in `np.module.css`, tokens in `landingNpTokens` / `landingNpFlowTokens` (`--nk-*-vip-np-*`) in `tokens.ts`, and assets in `src/assets/noonone/landing-np/`. The member view, `noonone/success` and the old landing modules (`modules.tsx`) are unchanged.

| Figma section | bappzaar module (master) | kit component · tokens | notes |
|---|---|---|---|
| Header 24:2637 (One logo, "Free Delivery" 40/800, illustration, "on everything, anytime" 14/500) | `VIPMembershipOverviewModule` `showDefault` (`vip_one_landing_title`, `vip_one_landing_subtitle`) | `NpOverviewModule` · `--nk-type-vip-np-title`, `--nk-type-vip-np-label3-medium`; top = inset + 34; the block is 189.2 tall and the value props start 204 below its top | logo and illustration exported from 24:2641 / 24:2659 (PNG 3×, page-colour background); items stagger in (`Stagger` recipe). The annotated marketplace-morph animation has no asset |
| Back button 24:2607 (40 circle, 1.25 #E3E3E3) | `VIPLandingScreen.renderHeader` backButton (40, `surfaceTertiary`) | `NpBackButton` (`LandingHeader variant="np"`), `OriginIcon chevron-left` 24 in `--nk-color-vip-np-text404040`; the white header and "noon One" still fade in over 20px | x 15.5, 14.2 below the status bar |
| Offer plan card (prod screenshot, not in frame 24:2604): gradient border, "Get One at 20% Off", "15 days free trial" tag, dashed separator, gift + price line | `VIPOfferPlanModule` (`offerData`: border LinearGradient 200° / RTL 155°, stops [0, .25], padding 1, r12, mx16; title row px16 py14, html p 18 regular / b 18 bold; tag 28 tall, maxWidth 170, left radius 24, marginRight −16, its own 90° gradient border (padding 1, no end padding), bg `tag.backgroundColor`, px8, icon 14 tinted `textColor` + me4, text 13/600; `VIPDashedBorder` 2 / 5 / 1 #02060C26; subtitle row py12 px16, icon 18 me10, html 14 #02060CBF, b semibold) | `NpOfferPlanModule` · `--nk-type-vip-np-offer-title / -offer-tag / -offer-sub`, `--nk-layout-vip-np-offer-*`; demo CMS colours `--nk-color-vip-np-offer-border`, `-offer-tag-border(-to)`, `-offer-tag-bg`, text `--nk-color-best-price-ink` | **placed right after the header** (master has no fixed order and there is no CMS fixture, so this follows the prod screenshot order: offer, then savings, before the value props). Icons are the kit's `vip/star.svg` (sparkle) and `vip/gift.svg` tinted through `MaskIcon`, standing in for `tag.iconUrl` / `subtitleIconUrl`. Sizes follow styles.ts (title 18, subtitle 14), not the screenshot estimates (~20 / ~15) |
| Savings overview card (prod screenshot): "ON AVERAGE, USERS LIKE YOU", "Save 6x", mint strip "of the membership price, worth <dirham> 928/year" | `VIP_SAVINGS_BREAKDOWN_MODULE` → `VIPSavingsOverviewModule` V1 (`isVIPSavingsWidgetV2Enabled` off on live), non-`new` `customerState`: overviewContainer p12 / pb8 / mb4; title b14 regular black mb12; amount row (no `totalSavings`) prints `savingsText` as-is in h28 / 800; subtitle in a LinearGradient #DFFEF3 → white (90°, RTL 270°), py8 px12, marginStart −12, b14 #108757 | `SavingsOverviewModule` in `modules.tsx`, extended with `customerState` / `totalSavings` / `bare`; the member view still passes nothing (→ `new`, the centred card, unchanged). Styles `.savingsOverview*` in `landing.module.css` | that branch does not split `{multiplier}`, so the data carries the final "Save 6x". Sizes follow styles.ts (h28 = 28/36, b14 14/20), not the screenshot estimates (~36 / 14/500) |
| Value props 24:2627 (white r12, 4 rows, sparkle 16, 44 icon circles, 35px mp circles, dashed separators, support strip) | `VIPBenefitsModule` (`leadingIconUrl`, `iconUrl` / overlapping `mpIcons`, `VIPDashedBorder` #02060C26) | `NpBenefitsModule` · title `--nk-type-vip-np-label2-bold` in `--nk-color-vip-np-ink92`, sub `--nk-type-vip-np-label4` in `--nk-color-vip-ink75`; circles `--nk-color-vip-np-mp-*`, overlap −14.93; strip gradient `--nk-color-vip-np-support-from` → white, 14/600 `--nk-palette-emerald-green` | the priority-support footer has no master field (new in prod) |
| Savings widget 24:2628 (40 r6 tiles around an 80 r12 tile, "Free Same-Day Delivery" 16/700, 12/400 #3D3D3D) | `VIPMarketplaceBenefitsCarouselModule` → `VIPSlider` (slideWidth 80, scaleFactor .5, autoplay 3.5s, swipe ≥ 20, highlighted mp first) | `NpSavingsModule` → `Slider` (`modules.tsx`, new `offset` prop for the Figma 26px edge gaps); tiles `--nk-color-vip-np-tile-*`, radial bg `--nk-color-vip-np-savings-from` | amounts use the dirham sign; labels cross-fade per marketplace as in VIPSlider |
| Streaming carousel 24:2629 (325 × 480 r12, gap 16, px 12, gradients, OSN+ logo, 293 × 50 CTA) | `VIPVideoCarouselModule` (Slider `isSlideSizeScrolling`, muted looping `Video` only on the selected slide, PageControl, `VIPButton` cta) | `NpVideoCarouselModule` / `VideoCard` · scroll-snap; dots 6.5 / 3.96 white 43%; type `--nk-type-vip-np-stream-*` | the frame's video area is an empty "Replace this" layer. Without a CMS `videoUrl` / `placeholderUrl` the card shows a **demo stand-in poster** (black → `--nk-color-vip-np-poster-to` gradient with the downloaded OSN+ mark, `.poster`). The bottom overlay's drop shadow is dropped because it drew a hard line over the poster. The CTA (`/create`) runs the landing quick-subscribe (`onCreate`) |
| Partnerships 24:2632 ("Partnerships and Benefits" 16/600, FAB Z / STC cards 167.5 × 252.8, duration pill, black "View now") | `VIPBannerCarouselModule` (title + horizontal banner list, tap → `linkUrl`) | `NpPartnersModule` / `PartnerCard`: top-part and bottom-part SVGs, textures clipped by the mask shape (`partnerTex` geometry), pill gradient `--nk-color-vip-np-pill-grey` | FAB → `noonone/offers` (bank tab); STC → `noonone/partnerOffer` with `campaignCode: stc` (the `VIPPartnerOfferPlanModule` page) |
| Coupon row 24:2635 (#F7FFFC, 1px dashed #75DAB1, r12, "Have a coupon code?" / "Apply") | no landing module on master; copy `vip_have_coupon_code`; the entry is the `VIPOffersOverlayScreen` voucher input | `NpCouponModule` · `--nk-color-vip-mint-bg`, `--nk-color-vip-np-coupon-border`, Apply in `--nk-color-best-price-ink` | opens `noonone/offers` (vouchers tab) |
| FAQ 24:2636 (white r12, title + chevron, rows 14/500 #404040, 1px #F5F5F5) | `VIPExpandableTextModule` `variant="grouped"`, `collapsible` title, rows start collapsed, 300ms, chevron −180° | `NpFaqModule` · `OriginIcon chevron-down` 20 in `--nk-color-vip-np-chevron`; `landingTokens.expand` | answers are demo copy (master has no fixture) |
| Bottom section 24:2745 (white, top r12, shadow 0 −4 17.6 10%, 56 #0E0E0E r12 "Start Free Trial" 18/600) | `VIPLandingScreen.renderStickyFooter` + `VIPSubscriptionButtonV2` | `NpStickyFooter` (reuses `SubscriptionButton`), `--nk-shadow-vip-np-footer`, `--nk-type-vip-np-cta` | same behaviour: the first tap opens `noonone/planDetails`, later taps quick-subscribe with the saved card ("Pay with ••••" row → payment). Prod has no flyout and no "View all plans"; the title is `plan.buttonText` when the user is not trial-eligible |
| Page bg #F5F5F5, sections 20 apart | `VIPLandingScreen` container | `Screen background="vipNpPage"`, `.column` gap `--nk-space-s20` | payment terms are not on the prod page |

Not 1:1:
- Figtree (Figma) renders as the kit face, Noontree; ExtraBold 800 falls back to Bold.
- All value-prop rows are 40 tall. Figma's third row is 44, so the card is 376 instead of 380.
- Two-line FAQ rows are 60 tall; Figma fixes them at 64.
- The kit device is 390 wide, so full-width sections are 15px wider. Fixed cards (streaming 325, partners 167.5) keep their Figma sizes.

---

## Plans (plan select V3, plan details / trial guide / plan option sheets, family plans)

Files: `screens/{PlanSelectScreen,PlanDetailsOverlayScreen,TrialGuideOverlayScreen,PlanOptionOverlayScreen,FamilyPlansScreen}.tsx`, `components/plans/*`, `data.plans.ts`, `tokens.ts` (plans section).

### Screens
- **`noonone/plans`** — `features/vip/screens/VIPQuickPlanSelectV3Screen (+ Plan/Plan.tsx, Plan/BundlePlan.tsx), components/VIPSubscriptionButtonV2, src/components/SegmentedControlTabSwitcher`. Live plan select (VIPUtil.showPlanSelectV2 always pushes V3; V1 VIPQuickPlanSelectScreen is legacy). Switch tiers (One Bundle ↔ One Standard, Standard selected by default as in prod; pill slides 500ms ease-out-cubic), pick Monthly / Annual or a streaming partner. First CTA tap opens the "Review your plan" sheet; after that the sticky button shows "Pay with ••••4242" and quick-subscribes (loader → success on the landing). "Pay with" → payment. Params: preSelectedTierCode (individual | yango), preSelectedPlanCode.
- **`noonone/planDetails`** — `features/vip/utils/VIPPopupUtil.showPlanDetailDialog → screens/VIPGenericOverlayScreen + components/VIPPopups/VIPPlanDetailsPopup (REGULAR · FAMILY_PLAN); variant planSelect = screens/VIPInfoOverlayScreen via VIPUtil.showInfoOverlay`. variant landing (default): the sheet the landing "Start free trial" opens once — title, plan card with trial tag, body, reminder, CTA with Pay-with row. variant planSelect: plan-select review (VIPInfoOverlayScreen). variant family: family review with members + invoice. CTA quick-subscribes (1.2s loader) → membership active → pops to the landing success animation.
- **`noonone/trialGuide`** — `features/vip/screens/VIPTrialGuideOverlayScreen (opened by VIPPaymentV2Screen/VIPTrialGuideButton)`. How the free trial works: day 1 / 28 / 30 timeline. GOT IT closes. Rows from data.plans.ts trialGuideData (server: trial guide touchpoint).
- **`noonone/planOption`** — `features/vip/screens/VIPPlanOptionOverlayScreen (VIPUtil.showPlanOptionOverlay)`. Only caller on master is VIPCancelMembershipV2Screen (switch-instead-of-cancel step, management). Select a plan (m-checkbox), Continue: for members it changes the plan + toast.
- **`noonone/familyPlans`** — `features/vip/screens/VIPFamilyPlansScreen (+ components/VIPPlanMembers, VIPBenefitsModule hideModuleWrapper, VIPExpandableTextModule grouped, VIPScrollEnterView)`. Tap Duo / Family: the header lottie plays the family→duo (0→81) / duo→family (81→161) segment and the tile border/price box spring to green. Sections fade-slide in on scroll (480ms). Sticky CTA opens the family review sheet → quick subscribe. Share invite → membership/manage when already a member.

### Style values (plans-specific tokens; every other value uses the equal global token — see shared Theme table)
| bappzaar style (component · property) | master value | kit token |
|---|---|---|
| VIPQuickPlanSelectV3Screen container / pageTitleContainer / plansContainer, VIPTrialGuideOverlayScreen | `'#F2F2F4'` | `--nk-color-vip-plans-bg` |
| tabsContainer backgroundColor | `'#EBE9E9'` | `--nk-color-vip-tabs-bg` |
| activeTab borderColor | `'#D5D5D5'` | `--nk-color-vip-tab-active-border` |
| paymentTermsContainer borderColor (also VIPLanding) | `'#EDEDED'` | `--nk-color-vip-terms-border` |
| header backButton borderColor | `'#E3E3E3'` | `--nk-color-vip-back-border` |
| offersButtonText | `'#171717'` | `--nk-color-vip-offers-text` |
| Plan trial-message gradient (selected: #29AE78 → successTag; unselected: #E0E4E7 → #EBECEE) | `'#29AE78'` | `--nk-color-vip-trial-green` |
|  | `'#E0E4E7'` | `--nk-color-vip-trial-grey` |
|  | `'#EBECEE'` | `--nk-color-vip-trial-grey-end` |
| planContainerSelected borderColor | `'#329537'` | `--nk-color-vip-plan-selected-border` |
| savingsText | `'#12945F'` | `--nk-color-vip-savings-text` |
| trialMessageTextStyle (unselected) | `'#0E0E0EC8'` | `--nk-color-vip-trial-text` |
| bundle texts (#0e0e0ec9) | `'#0E0E0EC9'` | `--nk-color-vip-bundle-text` |
| loadingTextStyle small | `'#4E4E4E'` | `--nk-color-vip-loading-small` |
| VIPSubscriptionButtonV2 paymentRowHeaderText | `'#02060C73'` | `--nk-color-vip-pay-with-label` |
| VIPPlanDetailsPopup trialMessage gradient end + border, monthlyPrice, dashed | `'#F7FFFC'` | `--nk-color-vip-mint` |
|  | `'#E7F6F0'` | `--nk-color-vip-mint-border` |
|  | `'#0E0E0EEB'` | `--nk-color-vip-ink92` |
|  | `'#02060C26'` | `--nk-color-vip-dash15` |
| VIPPlanOptionOverlay legacy tag gradient | `'#E8F8EF'` | `--nk-color-vip-tag-green` |
| VIPTrialGuideOverlayScreen | `'#E5E5E5'` | `--nk-color-vip-guide-border` |
|  | `'#DCDEE2'` | `--nk-color-vip-guide-line` |
| VIPStyles.shadowSuccessGlow (#26B57C, 0 2 4, .4) | `'rgba(38, 181, 124, 0.4)'` | `--nk-color-vip-success-glow` |
| VIPPlanMemberColors | `'#2F8E88'` | `--nk-color-vip-member1` |
|  | `'#3392FF'` | `--nk-color-vip-member2` |
|  | `'#3FA199'` | `--nk-color-vip-member3` |
|  | `'#757ADB'` | `--nk-color-vip-member4` |
|  | `'#C655EC'` | `--nk-color-vip-member5` |
| VIPUpgradePlanDetailsPopup upcoming tag (#F0FFF9) — family/upgrade review | `'#F0FFF9'` | `--nk-color-vip-mint-soft` |
| RN shadow black .4 r8 y7 (sticky button containers) | `'rgba(0, 0, 0, 0.4)'` | `--nk-color-vip-sticky-shadow` |
| VIPStyles.shadow2 grey .1 r3.2 y3.2 (scroll header) | `'rgba(128, 128, 128, 0.1)'` | `--nk-color-vip-header-shadow` |
|  | `14.5` | `--nk-radius-vip-plan-inner` |
| VIPQuickPlanSelectV3Screen tab width (LTR 140 / RTL 152) | `140` | `--nk-layout-vip-tab-width` |
|  | `44` | `--nk-layout-vip-tab-min-height` |
|  | `39` | `--nk-layout-vip-back-button` |
|  | `56` | `--nk-layout-vip-sticky-button` |
|  | `48` | `--nk-layout-vip-sticky-button-pay` |
|  | `60` | `--nk-layout-vip-details-button` |
|  | `44` | `--nk-layout-vip-card-icon-w` |
|  | `40` | `--nk-layout-vip-card-icon-h` |
|  | `21` | `--nk-layout-vip-radio` |
|  | `26` | `--nk-layout-vip-bundle-tile` |
|  | `43` | `--nk-layout-vip-guide-time` |
|  | `25` | `--nk-layout-vip-guide-line-h` |
|  | `-56` | `--nk-layout-vip-family-lottie-overlap` |
|  | `-0.4` | `--nk-layout-vip-tracking-title` |
|  | `-1` | `--nk-layout-vip-tracking-details` |
|  | `-0.3` | `--nk-layout-vip-tracking-sub` |
|  | `-0.15` | `--nk-layout-vip-tracking-b16` |
|  | `-0.1` | `--nk-layout-vip-tracking-b14` |
|  | `-0.25` | `--nk-layout-vip-tracking-h` |
|  | `1200` | `--nk-layout-vip-saving-shimmer-duration` |
| pageTitle 32/800, tracking −0.4 | `t(32, 800)` | `--nk-type-vip-page-title` |
| headerTitle 16 bold | `t(16, 700)` | `--nk-type-vip-header-title` |
| tierTabText 15 bold | `t(15, 700)` | `--nk-type-vip-tier-tab` |
| tierDiscountText 12 bold | `t(12, 700)` | `--nk-type-vip-tier-discount` |
| planTitle b16 bold | `t(16, 700, 22)` | `--nk-type-vip-b16-bold` |
| monthlyPrice b16 semibold | `t(16, 600, 22)` | `--nk-type-vip-b16-semibold` |
| description b14 regular / benefit b14 medium / b14 bold | `t(14, 400, 20)` | `--nk-type-vip-b14-regular` |
|  | `t(14, 500, 20)` | `--nk-type-vip-b14-medium` |
|  | `t(14, 600, 20)` | `--nk-type-vip-b14-semibold` |
|  | `t(14, 700, 20)` | `--nk-type-vip-b14-bold` |
|  | `t(13, 400, 18)` | `--nk-type-vip-b13-regular` |
|  | `t(13, 600, 18)` | `--nk-type-vip-b13-semibold` |
|  | `t(12, 400, 18)` | `--nk-type-vip-b12-regular` |
|  | `t(12, 500, 18)` | `--nk-type-vip-b12-medium` |
|  | `t(12, 600, 18)` | `--nk-type-vip-b12-semibold` |
|  | `t(12, 700, 18)` | `--nk-type-vip-b12-bold` |
| savingsText / trial msg 14/600, trial msg unselected 14/400 | `t(14, 600)` | `--nk-type-vip14-semibold` |
|  | `t(14, 400)` | `--nk-type-vip14-regular` |
|  | `t(14, 500)` | `--nk-type-vip14-medium` |
|  | `t(14, 700)` | `--nk-type-vip14-bold` |
|  | `t(13, 500)` | `--nk-type-vip13-medium` |
|  | `t(13, 400)` | `--nk-type-vip13-regular` |
|  | `t(12, 400)` | `--nk-type-vip12-regular` |
|  | `t(12, 600)` | `--nk-type-vip12-semibold` |
|  | `t(15, 700)` | `--nk-type-vip15-bold` |
|  | `t(15, 500)` | `--nk-type-vip15-medium` |
| VIPSubscriptionButtonV2 stickyButtonText 18 bold | `t(18, 700)` | `--nk-type-vip18-bold` |
| paymentTermsTextStyle 13/23 | `t(13, 400, 23)` | `--nk-type-vip-terms` |
| reviewBodyTextStyle / bodyTextStyle 14/20 | `t(14, 400, 20)` | `--nk-type-vip-body14` |
| reviewTitleStyle 18 (bold from VIPInfoOverlay title) | `t(18, 700)` | `--nk-type-vip18-title` |
| VIPPlanDetailsPopup planPopupTitle 28/800 −1 | `t(28, 800)` | `--nk-type-vip-popup-title` |
| VIPPlanDetailsPopup planTitle h18 bold | `t(18, 700, 24)` | `--nk-type-vip-h18-bold` |
|  | `t(16, 700, 20)` | `--nk-type-vip-h16-bold` |
|  | `t(16, 600, 20)` | `--nk-type-vip-h16-semibold` |
|  | `t(20, 700, 28)` | `--nk-type-vip-h20-bold` |
| reminderTitle 15/700, reminderDescription 13/20 | `t(15, 700)` | `--nk-type-vip-reminder-title` |
|  | `t(13, 400, 20)` | `--nk-type-vip-reminder-body` |
| trial guide: time title 8 bold, value 18/500 | `t(8, 700)` | `--nk-type-vip-guide-time-title` |
|  | `t(18, 500)` | `--nk-type-vip-guide-time-value` |
| family: step number 9/800 lh 13.91 | `t(9, 800, '13.91px')` | `--nk-type-vip-step-number` |
| share text 13/18 semibold, footer 12/16 medium | `t(13, 600, 18)` | `--nk-type-vip-share-text` |
|  | `t(12, 500, 16)` | `--nk-type-vip-footer-note` |
| VIPPlanMembers initial: size/2 bold lh 24 | `t(14, 700, 24)` | `--nk-type-vip-member-initial` |

### Copy / data
Copy keys from `features/vip/locale/translations/vip-en.json` (`vip_choose_your_plan`, `vip_plan_selection`, `vip_gc_pay_with`, `vip_got_it`, `vip_terms_and_conditions`, `vip_plan_members`, `vip_plan_for_members`, `vip_try_family_for_free`, `vip_share`, `vip_continue`) — the rest (tier names, plan titles, prices, trial messages, benefits, terms, review/trial-guide rows) is server-driven `planSelectV2` / trial-guide touchpoint data, demo values in `data.ts` + `data.plans.ts`. Lotties: `vip-family-plans-header.lottie` (segments 0→81 family→duo, 81→161 duo→family).

---

## Payment (VIPPaymentV2Screen and its overlays)

Routes: `noonone/payment` · `noonone/addCard` · `noonone/addCvv` · `noonone/mobilePay` · `noonone/info` · `noonone/generic`.
Files: `screens/{PaymentScreen,AddCardOverlayScreen,AddCvvOverlayScreen,MobilePayOverlayScreen,InfoOverlayScreen,GenericOverlayScreen}.tsx` (+ `.module.css`), `components/payment/{LegacyOverlay,Reloader}.tsx`, `data.payment.ts`, `tokens/payment.ts`.

### Live variant
- `VIPPaymentV2Screen` is the only payment screen registered on master. Every entry reaches it: `VIPUtil.showPaymentScreen`, `VIPSubscriptionButtonV2.showPaymentScreen` (pay-with row, non-quick subscribe) and `VIPUtil.showChangePayment` (update-payment belongs to the membership flow). The kit has no update-payment mode: `isUpdatePayment` / `currentSubscribedCard` are management features.
- Overlay chrome comes in two kinds on master:
  - **VIPOverlayBottomSheet** (shared `components/VIPOverlay`) wraps `VIPInfoOverlayScreen` and `VIPGenericOverlayScreen`.
  - The **legacy `src/components/Overlay`** still wraps `VIPAddCardOverlayScreen`, `VIPAddCvvOverlayScreen` and `VIPMobilePayOverlayScreen`. It has a different motion and a close button instead of a handle, so it is ported separately as `components/payment/LegacyOverlay`.

### Motion
| What | Master | Kit |
|---|---|---|
| Header background | `interpolateColor(scrollY, [0,30], #FFFFFF00 → #FFFFFFFF)` | `useTransform(scrollY, [0, headerFadePx 30], white-alpha0 → white)` |
| Method change / subscribe | `changeScreenState(RELOADING)` → FeedbackView `overlayLoader` rgba(255,255,255,.6) + spinkit Pulse 37 `#3866DF` | `components/payment/Reloader` (`--nk-palette-white-alpha60`, `--nk-color-badge`). 400ms on select, `subscribeMs` 1500 on pay |
| Initial load | FeedbackView LOADING (Loader); header hidden while loading | 500ms Pulse over `--nk-color-vip-pay-page`; header + footer hidden |
| Legacy Overlay | scrim rgba(30,30,30,0→.7) 250ms `Easing.inOut(ease)`; sheet `Animated.spring` from 300 (tension 40, friction 7); close 250ms to contentHeight | `paymentTokens.legacyOverlay`: origami conversion stiffness 230.2 / damping 22, 250ms `[.42,0,.58,1]` |
| VIPOverlayBottomSheet | shared VIPOverlay (damping 15 / stiffness 110, 350ms) | `components/VIPOverlay` |
| VIPButton | scale .97 (100/200ms), onPress +200ms | shared `components/VIPButton` (sticky CTA, update popup) |

### VIPPaymentV2Screen: `screens/PaymentScreen.tsx`
| Section (file) | Property | Master | Kit token |
|---|---|---|---|
| container (styles.ts) | bg | `#F2F2F4` | `--nk-color-vip-pay-page` (Screen `background="vipPayPage"`) |
| scrollViewContent | paddingTop / H | statusBar + 60 / 16 | `calc(--nk-inset-top + s56 + s4)` / `--nk-space-s16` |
| headerWrapper | padding / top | 12 / statusBar + 12 | `--nk-space-s12`, `calc(--nk-inset-top + s12)` |
| header | height | 32 | `--nk-layout-vip-pay-header-h` |
| headerTitleText | font / ml / colour | 16 bold lh24, ml 15, black, `_.capitalize` | `--nk-type-vip-pay-header-title`, `--nk-space-s15`, `--nk-color-vip-black` |
| backButton | size / r / border | 39, r20, 1px `#E3E3E3`, white | `--nk-layout-vip-back-button`, `--nk-radius-r20`, `--nk-color-vip-back-border` |
| backButtonIcon | icon | chevron-left-rounded.svg 9×18, marginStart −2, RTL rotate | `icons/chevron-left-rounded.svg`, `-s2` |
| methodWrapper | margin / gap | 15 / 12 | `--nk-space-s15` / `--nk-space-s12` |
| cardMethodWrapper / applePayWrapper | bg / border / r | white, 1px `#262A331A`, r12 (apple minHeight 40) | `--nk-color-vip-pay-method-border`, `--nk-radius-r12` |
| methodSelected | border | `#DEE7FE` | `--nk-color-vip-pay-method-selected` |
| cardTextWrapper | padding / border | 8/15, bottom 1px `#3866DF33` | `s8`/`s15`, `--nk-color-vip-pay-card-header-border` |
| cardHeader | font / colour | 600 14 `#262A33` | `--nk-type-vip-pay14-semibold`, `--nk-palette-new-black` |
| methodButton (Apple Pay) | padding | 15 / 15 | `--nk-space-s15` |
| radioIcon | 18×18 | radio-checked/unchecked-black.svg | `icons/radio-*-black.svg` |
| methodButtonText | font / ml | 14 `#262A33`, ml 8 | `--nk-type-vip-pay14`, `--nk-space-s8` |
| Apple Pay logo | image | `apple-pay.webp` (33×22) | `icons/apple-pay.webp` |
| **VIPPaymentCardSelect** cardListContainer | maxHeight / paddingTop | 300 / 8 | `--nk-layout-vip-pay-list-max`, `s8` |
| button (row) | padding / minHeight | 0 12 8 / 45 | `s12`/`s8`, `--nk-layout-vip-pay-row-min` |
| cardType | width / marginEnd | 30 / 4 (noon card icons) | `--nk-layout-vip-pay-brand-w`, `s4`; `assets/noonone/payment/card-*.webp` |
| dots | font / tracking / colour | 24 bold lh26, −3, `#262A33CC` | `--nk-type-vip-pay-dots`, `--nk-layout-vip-dots-tracking`, `--nk-color-vip-pay-ink80` |
| cardNumberText | font / mh | 600 14 / 2 | `--nk-type-vip-pay14-semibold`, `s2` |
| cvvInput | size / border / r / font | 48×26, 1px `$grayColor #ced1da`, r7, bold 12 | `--nk-layout-vip-pay-cvv-w/h`, `--nk-palette-gray-color`, `--nk-radius-vip-r7`, `--nk-type-vip-pay12-bold` |
| disabledText / message | colour / font | `#CBCFD7` / 12 noonGrey1 | `--nk-palette-medium-gray` / `--nk-type-vip-pay12` `--nk-color-price-old` |
| VIPDashedBorder | dash | 4 on, 3 off (spacing 7), h1, `#262A331A`, row padding 12 | `repeating-linear-gradient` with `--nk-color-vip-pay-method-border`, `s12` |
| newCardButton | height / ph | 52 / 15 | `--nk-layout-vip-pay-row`, `s15` |
| newCardButtonIcon / Text | size / font | 18, mE 8 / 14 `#262A33` | `icons/blue-plus-rounded.webp`; `--nk-type-vip-pay14` |
| brand icons on add row | images | `VIPIcons.cardVisa/Mastercard/Amex` (src theme) w30 | `icons/card-{visa,mastercard,amex}.webp` |
| **VIPPaymentMobileSelect** rows | height / ph | 52 / 15 | `--nk-layout-vip-pay-row`, `s15` |
| phoneType | size | 32×22, mE 4 (`stc.webp`) | `--nk-layout-vip-pay-carrier-w/h` |
| newPhoneButtonBorder | border | 1px dashed `$borderColor #f0f2f7` | `--nk-palette-border-color` |
| add/change icon | image | blue-plus-rounded / arrow-loop | `icons/*.webp` |
| **VIPTrialGuideButton** | bg / r / padding / margin | `#EFF7FF`, r8, 12, 0 12 8, mt −4 (last child mb 4) | `--nk-palette-alice-blue`, `--nk-radius-r8`, `s12`, `s4` |
| text / icon | font / colour | 12 `#0E0E0EEB`; chevron 5×10 rotateY 180 | `--nk-type-vip-pay12`, `--nk-color-vip-pay-ink92` |
| **stickyFooter** subscriptionButtonContainer | bg / r / padding / shadow | white, r16 top, 15, paddingBottom `stickyBottomPadding()`, `shadow2` (grey .1, 0 3.2 r3.2) | `--nk-radius-r16`, `s15`, `--nk-inset-bottom`, `0 3.2px 3.2px --nk-palette-dark-gray-color-alpha10` |
| VIPSubscriptionButtonV2 + stickyButton | size / r / bg | h56, r12, `black`, mb 8; disabled `$noonGrey2` | `--nk-layout-vip-pay-cta`, `--nk-radius-r12`, `--nk-palette-black`, `--nk-palette-noon-grey2` |
| button text (html) | p / s | white bold 18; `<s>` 16 regular line-through | `--nk-type-vip-pay18-bold`; `--nk-font-size-body-large` |
| buttonFooterNote | font / colour | 13 (base) noonGrey1, pt 8, centred | `--nk-type-vip-pay-base`, `--nk-color-price-old` |
| appliedReferralCodeContainer | h / bg / r / mt | 30, `#DFF1DA`, r8, 8; code 14 noonGrey2 mE8 + check-circle | `--nk-color-vip-pay-referral-bg`, `--nk-type-vip-pay14`, `icons/check-circle.webp` |

Behaviour (handlePayment / useVIPPaymentData):
- **Default selection:** the default saved card. Master picks Apple Pay only when there is no card on iOS.
- **Picking a method:** writes `noononeStore.paymentMethod` and flashes the reloader.
- **`verificationRequired`** (VIPService.checkPayment false): demo cards `cvvRequiredCards` = Mastercard ••0019, plus any newly added card.
  - It shows the inline CVV field on the selected row.
  - Paying with an invalid CVV opens `noonone/addCvv`.
  - Verify increments `paymentLocalStore.cvvVerified`, and the payment screen resumes (getPaymentIntent → createSubscription).
- **Pay:** the reloader shows for 1.5s, then `completeSubscription(nav, plan)`. That writes the membership store, queues the landing success message and pops to the landing.
- **Disabled CTA:** `checkPaymentIneligible` (nothing selected).
- **Plan:** `withEligibility(findPlan(planCode), trialEligible)`; the CTA html is `plan.buttonText`.
- **Not ported:** the cobrand warning popup (cobrand cards are not in the demo set); the cobrand `validation` filters (incompatible card/number rows exist as styles only).

### VIPAddCardOverlayScreen: `screens/AddCardOverlayScreen.tsx` (legacy Overlay)
| Section | Property | Master | Kit token |
|---|---|---|---|
| overlay / container / feedbackView | bg / r / height | `#F2F2F4`, r16 top, h420 | `--nk-color-vip-pay-page`, `--nk-radius-r16`, `--nk-layout-vip-add-card-h` |
| Overlay closeButton | size / pos | 37 white circle, top −18, right 30, `close-overlay.webp` | `--nk-layout-vip-legacy-close(-top/-end)`, `assets/noonone/payment/close-overlay.webp` |
| header | h / ph / mb / bg | 60 / 16 / 12 / white | `--nk-layout-vip-add-card-header`, `s16`, `s12` |
| headerText | font | 16 bold | `--nk-type-vip-pay16-bold` |
| cardsContainer | gap | 8 (Visa, MC, Amex, Mada, `cardBrandConfigs`) | `s8`; `payment/card-*.webp` |
| formSection | bg / padding / margin / r / gap | white, 20/12, 0 16 12, r12, 12 | `s20`/`s12`/`s16`, `--nk-radius-r12` |
| inputLabel (+ ` *` required) | font / colour | 14/500 `#939393`, mb 2; `*` `$redColor` | `--nk-type-vip-pay14-medium`, `--nk-color-vip-pay-label`, `--nk-palette-red-color` |
| input | font / border / r / padding | 14, 1px `#CCD7E4`, r12, 12; error red | `--nk-type-vip-pay14`, `--nk-color-vip-pay-input-border`, `--nk-radius-r12` |
| FormikCheckbox | icon / label | checkbox-checked/unchecked.webp (15), label ml 8, 14/500 black | `payment/checkbox-*.webp`, `--nk-type-vip-pay14-medium` |
| rememberCardDescription | mt / font | −16 / 14 noonGrey1 | `--nk-type-vip-pay14`, `--nk-color-price-old` |
| buttonWrapper | padding | 8 16, pb `overlayBottomSpacing()` | `s8`/`s16`, `calc(--nk-inset-bottom + --nk-layout-vip-sheet-float)` |
| FormikSubmitButton → PrimaryButton | bg / h / r / text | `$accentColor #3866DF` (disabled `$grayColor`), h48 (wrapper r12), 14 bold white | `--nk-color-badge`, `--nk-palette-gray-color`, `--nk-type-vip-pay14-bold` |

Validation mirrors `validate.ts`: Luhn card number, future `MM/YY` (formatted at position 2), CVV length 3 (4 for Amex). Number formatting follows `normalizeCardNumber(4, ' ')`. Submit shows the reloader (`apiMs` 900), adds a `VipCard` to `noononeStore.addedCards`, selects it, stores its CVV, then closes.

### VIPAddCvvOverlayScreen: `screens/AddCvvOverlayScreen.tsx` (legacy Overlay)
| Property | Master | Kit token |
|---|---|---|
| overlay | r16 white | `--nk-radius-r16` |
| container | mt 24, padding 15 15 overlayBottomSpacing, centred | `s24`, `s15` |
| icon | `add-cvv.webp` 55×55 | `--nk-layout-vip-pay-hero-icon` |
| header | 24 bold | `--nk-type-vip-pay24-bold` |
| subtitle | semibold 14 + card icon h20 + `•••• last4` | `--nk-type-vip-pay14-semibold` |
| input | 100%×48, r4, 1px `$borderColor`, ph 16, mt 24 mb 4; error `$redColor` | `--nk-radius-r4`, `--nk-palette-border-color`, `--nk-palette-red-color` |
| errorText | 12 red, mb 24 | `--nk-type-vip-pay12` |
| button | 48, r8, `$blackColor`, disabled opacity .2, text 16 bold white uppercase | `--nk-color-vip-black`, `--nk-layout-vip-disabled-opacity`, `--nk-type-vip-pay16-bold` |

### VIPMobilePayOverlayScreen: `screens/MobilePayOverlayScreen.tsx` (legacy Overlay, custom close)
| Property | Master | Kit token |
|---|---|---|
| overlay | r16 top, pt 32, ph 15, white | `s32`, `s15` |
| closeButton | absolute top −60, centred, 44, r22, `#262A3399`, `close-overlay-popup.webp` | `--nk-layout-vip-close-button(-top)`, `--nk-color-vip-pay-ink60` |
| icon | add-boku-phone / add-boku-otp 55 | `icons/add-boku-*.webp` |
| header | mt 15, 24 bold | `--nk-type-vip-pay24-bold` |
| subtitle | mt 8, 14 `#262A33CC`, centred | `--nk-color-vip-pay-ink80` |
| PhoneInput (input style) | 48, r4, 1px `$borderColor`, ph 16, mt 24 mb 4; code bold + 1px separator mh 10 | `--nk-palette-border-color`, `s10` |
| verifySubtitle / resendPrompt / coolDown | 14 / 12 / 12 `#262A3399` | `--nk-color-vip-pay-ink60` |
| change / resend | `$blueColor` (rgba(56,102,223,1)) underline | `--nk-color-badge` |
| otpInputContainer | width 49n + 6n, mt 24 mb 4 | `paymentTokens.otpLength` × (49 + 6) |
| SegmentedTextInputBox | 44×44, r8, 1px noonGrey2; focused 2px blue | `--nk-palette-noon-grey2`, `--nk-color-badge` |
| button | 48 r8 black stretch, disabled .2, 16 bold uppercase | as the CVV overlay |

Server-driven Boku data (opt-in / OTP length / cooldown / attempts) is replaced by demo values: OTP length 6, 30s cooldown, 3 attempts. Code `000000` returns the error state. A successful verify registers the number in `paymentLocalStore.numbers` and selects it (`noononeStore.paymentMethod = { type: 'boku' }`). The country code is fixed to +971 (UAE demo; master uses PhoneInput's whoami country).

### VIPInfoOverlayScreen: `screens/InfoOverlayScreen.tsx` (VIPOverlayBottomSheet)
| Property | Master | Kit token |
|---|---|---|
| overlay (contentContainerStyle) | transparent | inline `background: transparent` |
| popupOverlay | r24, mh 8 (centred popup, canBeClosed false) | `--nk-radius-r24`, `--nk-space-s8` |
| container / popupContainer | white r16 / r24, pt 32, ph 15 / 23, pb 12, mh 12, popup mb overlayBottomSpacing | `s32`, `s15`+`s8`, `s12`, `--nk-layout-vip-sheet-float` |
| headerIcon | h139, w100%, mb 15 (`one-trial-alert.webp`) | `--nk-layout-vip-info-icon-h` |
| title / warningTitle | 25 bold pb 8 black / 22 centred | `--nk-type-vip-pay25-bold` / `--nk-type-vip-pay22-bold` |
| body | HtmlView p 16 centred (base `#404553`) | `--nk-type-vip-pay16`, `--nk-color-text-legacy` |
| buttons | pt 16; 48, black, r8, mb 8; index > 0 hollow (1px black); text 14 bold white, `_.toUpper` | `--nk-type-vip-pay14-bold`, `--nk-color-vip-black` |
| reminder | white r12 p16 mb12; title 14/600 `#F43333`; desc 13 `#475067` | `--nk-palette-deep-red-color`, `--nk-color-text-muted` |

CTAs:
- `/ok` closes.
- `/changeNumber` closes and shows a toast (PrimaryPhoneVerificationV2Screen is not in the kit).
- `/noon-one` pushes the landing.
- `/back` closes and pops the parent (`dismissParent`).

The demo default is `trialWarningPopup`: the VIPSubscriptionButtonV2 trial warning, with `reasonText` written as demo copy.

### VIPGenericOverlayScreen: `screens/GenericOverlayScreen.tsx`
- **Default `variant: 'info'`:** `VIPPopupUtil.showTouchpointErrorPopup` → VIPInfoPopup inside `defaultPopup` (mh 12, mb overlayBottomSpacing, r14, pb 12). popupTitle 25 bold black pb 8. popupBody ph 15 (p 16 centred). popupButtonContainer 16/16/8. Button 48, r12, mb 8, 1px border, bg `item.backgroundColor ?? black`, text 14 bold. Tokens are the same as the info overlay, plus `--nk-radius-r14`.
- **`variant: 'update'`:** VIPUpdatePopup, `oneTrialAlert` 80. Title 24/700 black mb 16. Subtitle 16 black mb 24. VIPButton 56 black r8 with 20 bold white text (`--nk-layout-vip-update-icon`, `--nk-type-vip-pay20-bold`).
- `showPlanDetailDialog` (VIPPlanDetailsPopup) lives in `noonone/planDetails` (plans area) and `showCheckoutPlanDetailDialog` in the entry area. VIPGenericOverlayScreen's content is a render prop on master, so the kit splits it into per-content routes.

### Copy keys (vip-en.json unless noted)
`vip_payment_method`, `vip_one_pay_with_card`, `vip_one_add_new_card`, `vip_cvv`, `vip_apple_pay`, `vip_pay_with_mobile`, `vip_add_mobile_number`, `vip_change_mobile_number`, `vip_card_not_compatible`, `vip_phone_not_compatible`, `vip_add_new_card`, `vip_enter_card_number`, `vip_card_placeholder`, `vip_instant_add_new_card_expiry`, `vip_remember_payment_card_title`, `vip_remember_payment_card_description`, `vip_one_add_card`, `vip_additional_verification_title` (master typo "Verifiation" kept), `vip_additional_verification_subtitle`, `vip_spl_verify`, `vip_boku_optin_title`, `vip_boku_optin_subtitle`, `vip_verify_number_field`, `vip_boku_verify_title`, `vip_boku_verify_subtitle`, `vip_change`, `vip_continue`, `vip_missing_login_otp`, `vip_resend_otp`, `vip_seconds_unit`, `vip_one_trial_warning_title`, `vip_change_number_button`, `vip_go_back`, `vip_update_available_title`, `vip_update_available_subtitle`, `vip_update_now`, and `form_validation_cvv_field` (src/locale en.json).

### Assets
- `assets/noonone/payment/`: `close-overlay.webp` (src theme), `checkbox-{checked,unchecked}.webp` (src theme), `card-{visa,mastercard,amex,mada}.webp` (marketplaces/noon theme, used by getPaymentMethodData for noon).
- From `assets/noonone/icons/` (copied by the scaffold): `apple-pay`, `stc`, `add-cvv`, `add-boku-phone`, `add-boku-otp`, `blue-plus-rounded`, `arrow-loop`, `check-circle`, `close-overlay-popup`, `one-trial-alert`, `card-*` (src theme), `chevron-left-rounded.svg`, `radio-*-black.svg`.

### Server-driven fields and demo values
| Field | Source | Demo |
|---|---|---|
| saved cards | PaymentCardService.getPaymentCards | `data.ts savedCards` (Visa ••4242 default, MC ••0019) |
| `verificationRequired` | VIPService.checkPayment | MC ••0019 and new cards (`cvvRequiredCards`) |
| trial guide `entryText` / `buttonText` | VIPService.getTrialGuide | "Free for 30 days. AED 25 will be charged on <date>" (`trialGuideEntry`); CTA = `plan.buttonText` |
| `payment.button.subscribe.text` / `footerNote` | touchpoints `payment` | `plan.buttonText` / `plan.footerNote` |
| `misc.isApplePayEnabled` / `isMobilePayEnabled` / `isReferralEligible` | loyalty touchpoints misc | all true (`payMisc`) |
| registered Boku numbers | VIPBokuService | empty, added via the overlay |
| `reasonText` (trial warning) | plan | demo sentence |
| touchpoint error popup | VIP touchpoints `errorPopup` | "Offer not available" (`touchpointErrorPopup`) |

### Shared follow-ups
- `transitions.ts` / the flow's `sheetBackdrop` is the landing, so opening `addCard` / `addCvv` / `mobilePay` straight from the sidebar shows them over the landing, not over payment. A per-screen backdrop would need a kit change.
- Duplicate token keys: `vipBackBorder` (also in landing + plans) and `vipBackButton` (plans) have identical values, so the merge is harmless. They could move to `tokens/base.ts`.
- `noonone/trialGuide` (plans area) should read `{ planCode }`.

---

## Offers, partner offer, confirm offer/voucher, Yango bundle, invite acceptance

Files: `screens/{OffersOverlayScreen,OffersV2Screen,ConfirmOfferPlanScreen,ConfirmVoucherPlanScreen,BundleScreen,AcceptInviteOverlayScreen,AcceptInviteErrorOverlayScreen}.tsx`, `components/offers/*`, `data.offers.ts`, `tokens.ts` (offers section).

### Screens
- **`noonone/offers`** — `features/vip/screens/VIPOffersOverlayScreen (VIPUtil.showReferralsInputOverlay; components/VIPWave, VIPButton, VIPGenericOverlayScreen success popup)`. Tabs Voucher codes / Bank offers (params tab: vouchers | bank). Tap "Apply offer" on a card or type ONE3FOR1 / SARA25 / ONE30 / ENBD12 / MASHREQ50 and Redeem now → "Offer applied" popup (auto-advances after 2s) → Review and confirm. Any other code → error toast. Focus the field: the list collapses, the floating label shrinks and Redeem slides in. params empty=true → empty state, code=… → prefilled referral link.
- **`noonone/partnerOffer`** — `features/vip/screens/VIPOffersV2Screen (+ components/VIPModules/VIPPartnerOfferPlanModule, VIPSubscriptionButtonV2)`. Partner campaign page (campaignCode enbd | stc). Scroll: the "Exclusive offer" header fades in; the sticky CTA slides up once the module CTA leaves the screen. Activate → quick subscribe with the saved card → pops back to the landing success animation. "Pay with •••• 4242" → payment; Explore other plans → plans.
- **`noonone/confirmOffer`** — `features/vip/screens/VIPConfirmOfferPlanScreen`. Retention / partner offer confirmation sheet (master opens it from VIPCancelMembershipV2 offer step). Confirm Membership → createSubscription with the saved card (no card → payment screen) → landing success.
- **`noonone/confirmVoucher`** — `features/vip/screens/VIPConfirmVoucherPlanScreen`. Review and confirm after applying a code: trial row + price row, "<CODE> applied" strip, terms, Pay with •••• 4242 + Confirm → landing success. Back chevron reopens the offers overlay.
- **`noonone/bundle`** — `features/vip/screens/VIPBundleV2Screen (live: VIPUtil.showBundleScreen always V2; /noon-one-bundle uses V1 VIPBundleScreen for non-yango codes — not ported)`. Full-screen modal themed by the server style (Yango Play). Start free trial → quick subscribe → dismiss + landing success animation.
- **`noonone/acceptInvite`** — `features/vip/screens/VIPAcceptPlanInviteOverlayScreen (+ VIPAcceptInviteOverlaySkeleton, components/VIPMemberInitialHexagon, VIPModules/VIPBenefitsModule hideModuleWrapper)`. Invitee entry (deep link /noon-one-share-invite?share_code=). Skeleton → family header lottie with the owner initial hexagon (params duo=true → Duo lottie). Join Family plan for free → member of the owner plan (role member) → landing success. params error=true → error overlay.
- **`noonone/acceptInviteError`** — `features/vip/screens/VIPAcceptInviteErrorOverlayScreen`. Server errorPopup (expired invite demo). Explore noon One → landing, Got it → dismiss.

### Style values (offers-specific tokens)
| bappzaar style (component · property) | master value | kit token |
|---|---|---|
| VIP chevronLeftRounded stroke #404040 | `'#404040'` | `--nk-color-vip-of-back` |
| Voucher title #161A1F | `'#161A1F'` | `--nk-color-vip-of-ink` |
| Voucher button text #034EFC | `'#034EFC'` | `--nk-color-vip-of-voucher-blue` |
| Voucher wave/button bg #EBF1FF; applied #E5F6E6 | `'#EBF1FF'` | `--nk-color-vip-of-voucher-bg` |
|  | `'#E5F6E6'` | `--nk-color-vip-of-voucher-applied` |
| VIPConfirmVoucherPlanScreen buttonContainer borderColor #02060C26 (also VIPBenefitsModule dashes) | `'#02060C26'` | `--nk-color-vip-of-divider` |
| VIPConfirmOfferPlanScreen description #939393, savings text #12945f | `'#939393'` | `--nk-color-vip-of-desc-grey` |
|  | `'#12945F'` | `--nk-color-vip-of-savings-green` |
| VIPSubscriptionButtonV2 paymentRowHeaderText #02060c73 | `'#02060C73'` | `--nk-color-vip-of-pay-label` |
| VIPOffersV2Screen backButton border #E3E3E3, payment terms border #EDEDED | `'#E3E3E3'` | `--nk-color-vip-of-back-border` |
|  | `'#EDEDED'` | `--nk-color-vip-of-terms-border` |
| VIPPartnerOfferPlanModule disabled text #0E0E0E72 | `'#0E0E0E72'` | `--nk-color-vip-of-disabled-text` |
| VIPBundleV2Screen buttonContainer #222222, statusBar #00000044, defaults | `'#222222'` | `--nk-color-vip-of-bundle-bar` |
|  | `'#00000044'` | `--nk-color-vip-of-bundle-status` |
|  | `'#DADADA'` | `--nk-color-vip-of-bundle-current-header` |
|  | `'#9D9D9D'` | `--nk-color-vip-of-bundle-current` |
|  | `'#27E87E'` | `--nk-color-vip-of-bundle-highlight` |
|  | `'#0B0B0D'` | `--nk-color-vip-of-yango-bg` |
|  | `'#16161A'` | `--nk-color-vip-of-yango-card` |
|  | `'#1C1C21'` | `--nk-color-vip-of-yango-alt-card` |
|  | `'#2A2A31'` | `--nk-color-vip-of-yango-border` |
|  | `'#B4B4BE'` | `--nk-color-vip-of-yango-alt-text` |
|  | `'#FFFFFF'` | `--nk-color-vip-of-yango-grad-from` |
|  | `'#8E8E99'` | `--nk-color-vip-of-yango-grad-to` |
|  | `'#FF3E33'` | `--nk-color-vip-of-yango-brand` |
| VIPAcceptPlanInviteOverlayScreen benefits bg white(0.8); skeleton highlight | `'rgba(255, 255, 255, 0.8)'` | `--nk-color-vip-of-white80` |
| partner hero gradients (stc / ENBD demo) | `'#4F008C'` | `--nk-color-vip-of-stc` |
|  | `'#003F87'` | `--nk-color-vip-of-enbd` |
| VIPStyles letterSpacing: b-scale −0.1, h18/h16 −0.15, h24 −0.25 | `-0.1` | `--nk-layout-vip-of-track-b` |
|  | `-0.15` | `--nk-layout-vip-of-track-h` |
|  | `-0.25` | `--nk-layout-vip-of-track-xl` |
| confirm plan title letterSpacing 0.898; bundle title −0.8; trial pill −0.6 | `0.898` | `--nk-layout-vip-of-track-caps` |
|  | `-0.8` | `--nk-layout-vip-of-track-bundle` |
|  | `-0.6` | `--nk-layout-vip-of-track-pill` |
| VIPOffersV2 backButton 39, VIPBundleV2 40 | `39` | `--nk-layout-vip-of-back39` |
|  | `30` | `--nk-layout-vip-of-back30` |
|  | `41` | `--nk-layout-vip-of-voucher-btn-h` |
|  | `124` | `--nk-layout-vip-of-benefit-min-h` |
|  | `127` | `--nk-layout-vip-of-header-pad-top` |
|  | `97` | `--nk-layout-vip-of-title-line-w` |
|  | `-86` | `--nk-layout-vip-of-invite-overlap` |
|  | `-10` | `--nk-layout-vip-of-applied-overlap` |
|  | `-7` | `--nk-layout-vip-of-module-overlap` |
|  | `-18` | `--nk-layout-vip-of-message-overlap` |
|  | `t(12, 400)` | `--nk-type-vip-of12-regular` |
|  | `t(12, 500)` | `--nk-type-vip-of12-medium` |
|  | `t(12, 700)` | `--nk-type-vip-of12-bold` |
|  | `t(13, 400)` | `--nk-type-vip-of13-regular` |
|  | `t(13, 500)` | `--nk-type-vip-of13-medium` |
|  | `t(13, 600)` | `--nk-type-vip-of13-semibold` |
|  | `t(13, 700)` | `--nk-type-vip-of13-bold` |
|  | `t(14, 400)` | `--nk-type-vip-of14-regular` |
|  | `t(14, 500)` | `--nk-type-vip-of14-medium` |
|  | `t(14, 600)` | `--nk-type-vip-of14-semibold` |
|  | `t(14, 700)` | `--nk-type-vip-of14-bold` |
|  | `t(15, 500)` | `--nk-type-vip-of15-medium` |
|  | `t(15, 600)` | `--nk-type-vip-of15-semibold` |
|  | `t(16, 400)` | `--nk-type-vip-of16-regular` |
|  | `t(16, 600)` | `--nk-type-vip-of16-semibold` |
|  | `t(16, 700)` | `--nk-type-vip-of16-bold` |
|  | `t(17, 700)` | `--nk-type-vip-of17-bold` |
|  | `t(18, 500)` | `--nk-type-vip-of18-medium` |
|  | `t(18, 600)` | `--nk-type-vip-of18-semibold` |
|  | `t(18, 700)` | `--nk-type-vip-of18-bold` |
|  | `t(20, 700)` | `--nk-type-vip-of20-bold` |
|  | `t(40, 700)` | `--nk-type-vip-of40-bold` |
| html sheets with lineHeight | `t(13, 500, 19)` | `--nk-type-vip-of13-medium-lh19` |
|  | `t(13, 400, 23)` | `--nk-type-vip-of13-regular-lh23` |
|  | `t(14, 600, 24)` | `--nk-type-vip-of14-semibold-lh24` |
|  | `t(18, 600, 24)` | `--nk-type-vip-of18-semibold-lh24` |
|  | `t(12, 400, 20)` | `--nk-type-vip-of12-regular-lh20` |
|  | `t(16, 700, 22)` | `--nk-type-vip-of16-bold-lh22` |
|  | `t(14, 500, 20)` | `--nk-type-vip-of14-medium-lh20` |
|  | `t(12, 600, 18)` | `--nk-type-vip-of12-semibold-lh18` |
|  | `t(14, 400, 19)` | `--nk-type-vip-of14-regular-lh19` |

### Copy / data
Copy keys (`vip-en.json`): `vip_voucher_code`, `vip_bank_offers`, `vip_enter_your_coupon_code`, `vip_redeem_now`, `vip_paste`, `vip_offer_applied`, `vip_review_confirm`, `vip_code_applied`, `vip_empty_vouchers_title`, `vip_empty_vouchers_subtitle`, `vip_exclusive_offer`, `vip_explore_other_plans`, `vip_one_confirm_membership`, `vip_join_family`, `vip_one_yango_credits_*`. Vouchers / bank offers / partner campaigns / bundle theme / invite owner are server-driven — demo values in `data.offers.ts` (codes ONE3FOR1, SARA25, ONE30, ENBD12, MASHREQ50; ENBD + stc campaigns; Yango Play AED 100 credits). Variant: `VIPBundleScreen` (V1, non-yango deep-link codes) not ported. Lotties: `vip-accept-invite-header.lottie`, `vip-accept-invite-duo-header.lottie`.

---

## Entry points (entry area)

Found on origin/master by grepping `VIP` / `noonOne` / `noon-one` / `isLoyalCustomer` / `VIPUtil` across `marketplaces/noon`, `src`, `features/o2d`.

| Master entry | Opens | Kit file | Status |
|---|---|---|---|
| `marketplaces/noon/components/NoonAccount/NoonAccountNoonOne/{NoonAccountNoonOne,Layout,NotSubscribed,Subscribed}` | `noon.VIPLandingScreen` (source `/account`) | `src/flows/account/components/ProfileCard.tsx` (`NoonOneStrip`) + `account.module.css` `.noonOne*` + `account/tokens.ts` (type/radius/layout `acctNoonOne*`) | wired. Not subscribed → `noonone/landing`; subscribed → `membership/manage` (**task decision**: master pushes the landing's member view for both) |
| `NoonAccountProfileHeader` avatar (`isNoonOneSubscribed` → gradient avatar) | – | `ProfileCard.tsx` avatar | wired to `useIsNoonOneMember()` (was `user.noonOne` mock) |
| `NoonCartScreen.checkout → showVipPush` (`cartData.pushes.vip`, once per session via `VIPUtil.vipPushShown`) | `noon.VIPCartOverlayScreen` | `src/flows/cart/CartScreen.tsx` `onCheckout` + `noonone/components/entry/cartVipPush.ts` → `noonone/cartOverlay` | wired (non-members only — server only sends `pushes.vip` to them) |
| `NoonCartScreen.showOnePush` (`pushes.oneDay`, on load) | `VIPCartOverlayScreen isOneDay` | `cartOverlay` supports `params.isOneDay` | screen supports it; no kit trigger (kit has no One Day push data) |
| Cart payment callout "Join noon One…" (server callout deeplink) | `/noon-one` | `CartScreen.tsx` callouts + `cart/data.ts` `link: '/noon-one'` | wired → `noonone/landing` (source `/cart`); hidden for members |
| `NoonCartScreen.onJoinNoonOnePress` → coupon tray (`NoonSalesCouponTrayOffer`, "Get noon One to unlock") | `VIPLandingScreen` | – | **not ported** (kit has no coupon tray overlay) |
| `NoonCouponCardV3` (`validCustomerType 'noon_one'` + locked) | `VIPLandingScreen` | – | **not ported** (no coupon centre / tray in kit) |
| `NoonCheckoutScreen` section `integrated_noonone` → `NoonCheckoutNoonOneSection` (+ `NoonOneCtaReveal`, `NoonCheckoutNoonOneUtil`) | toggle = `NoonCheckoutService.setOne`; nudge → `noon-one-all-plans` | `src/flows/checkout/components/NoonOneSection.tsx` (+ `.module.css`), inserted after shipments in `CheckoutScreen.tsx`; state `noonone/components/entry/checkoutEnrollment.ts` | wired; nudge → `noonone/plans`; hidden for members |
| `NoonOrderConfirmationScreenV3.openOneSubscriptionOverlay(enrollOneRequestStatus)` | `noon.OCOneOverlayScreen` | `ConfirmationScreen.tsx` → `noonone/components/entry/useOcOneOverlay.ts` → `noonone/ocOne` | wired: order placed with the toggle on → subscribe (monthly, trial if eligible) + overlay |
| `NoonProductDetails` delivery card `isLoyalCustomer` → "member" badge | – | `src/flows/pdp/components/Sections.tsx` `DeliveryCard` | wired to membership (was `content.isMember` mock) |
| `NoonProductDetails` → `NoonVIPPreference` (`shipping_preferences_vip && !isLoyalCustomer`) | `misc.pdpLinkUrl` (/noon-one) | `src/flows/pdp/components/VipPreference.tsx` (+ css) | wired → `noonone/landing` (source `/pdp`) |
| `NoonCheckoutShipment` enrollment toast (`noon_one_checkout_enrollment_toast_message_prefix/suffix`) | – | – | not ported (shipment-position enrollment not in kit) |
| `NoonDynamicInvoice` noon One rows, `useNoonCheckoutPayment` / `NoonCheckoutPaymentUtil` (pending noon One payment method) | – | – | not ported (server invoice rows; kit invoice untouched) |
| `features/o2d` `O2DOrderNoonOneBanner`, bill summary noon One rows | – | orders flow | not ported (orders flow out of scope) |
| `src/components/UserProfile` noon One pill | `VIPLandingScreen` | – | not ported (only used by `ServicesAccountScreen`, services MP) |
| `src/utils/ModuleHelper.ts` / `noonDeepLinkHandler.ts` / `vipDeepLinkHandler.ts` URLs | various | `ScreenDef.path` aliases in screens.*.ts | handled by the landing/plans/offers areas (`/noon-one`, `/noonvip`, `/noon-one-all-plans`, …) |
| Home | – | – | no noon One entry on master's NoonHomeScreen |

### Account strip — NoonAccountNoonOneLayout / NotSubscribed / Subscribed
| Property | Master | Kit |
|---|---|---|
| bannerContainer bg / margin / padding / radius | paleYellow #FFF3C0 / 2 / 5·12 / bottom 16 | `--nk-color-noon-one-surface` / `--nk-space-s2` / 5px `--nk-space-s12` / `--nk-radius-acct-noon-one` |
| gradient | LinearGradient [noonOneBannerPeach, noonOneBannerCream] start {0,2} → end {0,0} | `linear-gradient(0deg, peach -100%, cream 100%)` with `--nk-palette-noon-one-banner-*` |
| logo | `noon-account-noon-one-logo.lottie` 48×36, autoplay once | `src/assets/noonone/entry/noon-account-noon-one-logo.lottie`, `--nk-layout-acct-noon-one-logo-*` |
| textContainer | flex 1, gap 2, paddingH 5 | `.noonOneText` `--nk-space-s2` |
| title (not subscribed) | 15/700 blueGray900 | `--nk-type-acct-noon-one-title`, `--nk-color-text-primary` |
| CTA text / subscribed title | 14/700 blueGray900 | `--nk-type-acct-noon-one-cta` |
| afterRow gap | 8 | `--nk-space-s8` |
| chevron | `noon-account-chevron.svg` 6×11, RTL flipped | asset copied to `src/assets/noonone/entry/` |
| motion | withDelay(500) spring {damping 14, stiffness 160, mass 0.8} from −20 (title) / −15 (CTA), chevron delay 530; opacity 300ms | `slide(delay, x)` (unchanged helper) |
Copy: `noon_account_noon_one_free_delivery` "Unlimited free delivery", `account_noon_one_start_trial` "Start Trial" (isEligibleForTrialAcrossPlans → `useMembershipEligibility`), `account_noon_one_join_now` "Join Now", `account_noon_one_savings_title` "saved & still going!" (savingsState high → kit: savings > 0, Price compact → `AED n`), `account_noon_one_no_savings_title` "Free delivery, yours to enjoy!".

### Cart overlay — features/vip/screens/VIPCartOverlayScreen (+ src/components/Overlay)
Chrome = legacy `Overlay` (not VIPOverlayBottomSheet) → `components/entry/LegacyOverlay.tsx`: scrim rgba(30,30,30,.7) (`--nk-color-vip-scrim`) 250ms inOut; spring tension 40 from 300px (stiffness 230.2 / damping 22); container r5 (`--nk-radius-vip-legacy-sheet`), top r20 (`--nk-radius-vip-cart-sheet-top`), maxHeight 90%; close button 37 white circle top −18 end 30, `close-overlay.webp` 16 (`--nk-layout-vip-close-*`).
| Part | Master | Kit token |
|---|---|---|
| container rowGap | 8 | `--nk-space-s8` |
| header marginTop / logo | edgeSpacing 15 / width 126 aspect 3.71 (misc.noonColorIcon) | `--nk-space-s15` / `--nk-layout-vip-cart-logo-*`, logo = `noon-one-text.webp` (stand-in for the CDN colour icon) |
| scroll | maxHeight 50% screen, rowGap 8 | `.scroll` 50vh |
| titleWrapper / titleText | padding 15 / 32 bold, paddingH 15, mb 8, centred | `--nk-type-vip-cart-title` |
| subtitle html | 14 centred | `--nk-type-vip-text14` |
| items | columnGap 8; image 90; rowGap 4; icon 52×14 | `--nk-layout-vip-cart-item-*`, icon `noon-one.webp` |
| buttonsContainer | borderTop 1 noonGrey4 #F3F4F8, paddingV 4, margin 15, mb overlayBottomSpacing | `--nk-color-bg-muted`, `--nk-layout-vip-sheet-float` + inset |
| button | 100% × 48, r8, border 2, mt 8; text 14 bold uppercase | `--nk-layout-vip-cart-button-*`, `--nk-radius-r8`, `--nk-type-vip-text14-bold` |
Behaviour: `/viewPlans` → close(false) + `showLandingWithRedirect` (flag `vip_v2_cart_link` = `isVIPV2CartPlansLinkEnabled` default off → no plan-select redirect; master also passes `onClose: showCheckoutScreen`, not replicated — follow-up for the landing); `/checkout`, ×, scrim → close() → onDismiss → `checkout/checkout`.
SD (demo values, `data.entry.ts`): `touchpoints.cartOverlay.{title, subtitle, buttons, oneDaySubtitle}`, `pushes.vip.{message, items[].unitPrice/imageUrl/icon}`.

### Checkout — NoonCheckoutNoonOneSection
| Part | Master | Kit |
|---|---|---|
| oneSection | r15 (18 enrolled), marginTop 12 | `--nk-radius-chk-noon-one(-on)`, `--nk-space-s12` |
| outer padding enrolled | 2 top/horizontal | motion `padding` |
| gradient | radial darkGreenOcean #359761 (.95 → 1 @70%) → #F3F4F8; yellowGold #FFC532 glow .22/.12/0 at (50,58) rx100 ry10; scale 0→6, opacity, 600ms | `--nk-color-chk-noon-one-ocean(95)`, `-gold22/12/0`, `--nk-color-bg-muted` |
| animatedContainer | white r15 | `--nk-color-bg-surface` |
| container | padding 14/2/2 (top 10 enrolled), gap 14 | |
| infoContainer | paddingH 10, gap 4 | `--nk-space-s10/s4` |
| icon | 29×20 | `--nk-layout-chk-noon-one-icon-*` (`noon-one.webp`) |
| Switch | circle 16, track 34, bar 20, grass700 / lightGreyColor | kit `Switch` width 34, `--nk-color-best-price-ink` / `--nk-color-border` |
| html styles | `<green>` grass700, `<medium>` 14, `<bluegray>` blueGray900 | stylesheet → `--nk-color-best-price-ink`, `--nk-color-text-primary` |
| ctaContainer | padding 7/12, ottomanGreen #E5FAEC, bottom r12 | `--nk-color-chk-noon-one-cta-bg`, `--nk-radius-r12` |
| discount nudge | padding 8.5/16, 12/600 white + plan 12/400, chevron-thick 12 white | `--nk-type-chk-noon-one-nudge/plan`, `chevron-thick.svg` |
| motion | FadeInUp/FadeOutUp 300ms, heights 300ms | `fade` (300ms) + `layout` |
NoonOneCtaReveal (lottie `checkout-noon-one-green-container.lottie` + animated digits/word reveal, ~2.25s) is **simplified**: the lottie plays over the CTA strip for 2250ms then fades 300ms. Copy: `noon_checkout_noon_one_plan_amount` "then {{total}}/mo". SD: `integratedNoonone.{title, subtitle, cta, animation, benefitsCta}`, monthly plan `discountNudge/amount/discountPercentage/isTrialValid`.

### OC One overlay — features/vip/screens/OCOneOverlayScreen
| Part | Master | Kit |
|---|---|---|
| container / wrapper | r16; padding 24 / 15 / overlayBottomSpacing, centred | `--nk-radius-r16`, `--nk-space-s24/s15` |
| header | 24 bold centred, maxWidth 292, `{logo}` → colorIcon 40×23 (me 4) | `--nk-type-vip-oc-header`, `--nk-layout-vip-oc-*` |
| title | 19 bold (+ logo h23 ms 4) | `--nk-type-vip-oc-title` |
| subTitle | 14, marginV 15, centred | `--nk-type-vip-text14` |
| footerNote | 12 #7e859b | `--nk-type-vip-text12`, `--nk-color-price-old` |
| buttons | mt 24; 48h, border 1, r8, mb 8; 14 bold | `--nk-layout-vip-oc-button-h`, `--nk-radius-r8` |
Confetti `animation` / `headerImage` / `imageUrl` are server images → not rendered in the demo. SD: `touchpoints.checkout.OCOverlay / OCErrorOverlay`.

### PDP — NoonVIPPreference
container blueGray900 r12 padding 12 (`--nk-color-text-primary`, `--nk-radius-r12`, `--nk-space-s12`); text 14/600 secondaryBackgroundColor #F9F9FB (`--nk-type-body-semibold`, `--nk-color-bg-subtle`); "with" ms 4 (`noon_with`); row gap 8; `noon-one.webp`; `right-chevron.webp` 20 tinted blueGray50 (`--nk-palette-blue-gray50`), RTL flipped. SD: `offer.shipping_preferences_vip[0].description` (demo "Get **FREE** delivery").

### Assets (src/assets/noonone/entry/)
`noon-account-noon-one-logo.lottie`, `noon-account-chevron.svg`, `checkout-noon-one-green-container.lottie`, `chevron-thick.svg`, `noon-one.webp` (@3x), `noon-one-text.webp` (@3x, stand-in for `misc.colorIcon`/`noonColorIcon`), `noon-one-day-tab.webp`, `close-overlay.webp` (@3x), `right-chevron.webp` (@3x).

### Follow-ups
- Landing: master's cart redirect passes `onClose: showCheckoutScreen` (closing the landing continues to checkout) — needs a landing param.
- Checkout invoice: enrolled noon One should add the plan line / zero delivery fee in `NoonDynamicInvoice` (server rows) — not modelled.

---

## Shared follow-ups (outside this flow's boundaries)

- `scripts/token-lint.mjs` only treats `src/flows/<flow>/tokens.ts` as a tokens file — the flow keeps all area tokens in that single file for that reason.
- `src/kit/Navigator`: no `popTo(route)` — `store.ts › popToLanding` pops N entries; a kit `popTo` would be cleaner. Kit sheets are fixed white r24 + grabber, so VIP floating sheets use the transparent `noonone-overlay` modal transition + `VIPOverlay`; a kit "bare sheet" presentation would remove that workaround.
- Account strip: master's subscribed strip pushes `VIPLandingScreen` (member view); the kit routes it to `membership/manage` as instructed.
- `vipBackBorder` / `vipBackButton` / `vipTermsBorder` repeat across landing, plans and payment sections with identical values (harmless merge) — could be hoisted to the base section.
- Several noon One CMS images/lotties (module banners, bgImg, partner logos) are server URLs with no fixture; demo uses bundled assets/emoji-free placeholders described per section.

### Non-member sticky footer (prod, screenshot 2026-10-13)

| Master (`VIPLandingScreen.renderStickyFooter`) | Prod value | Kit |
|---|---|---|
| `offerFlyout` (wins over `flyout`) → `Flyout` (`partnerCalloutContainer` min-height 40, px 15, top radius 12; icon 16 me 8, trailing icon 18 ms 8, tinted `textColor`; text 14/500 HTML) | green strip, sparkle · "Don't miss noon One at the **lowest** price" · sparkle, opens plan select | `npLanding.flyout` (`offerFlyout`), `Flyout` icons, `--nk-color-vip-np-offer-flyout`; footer radius moves to the strip (`noBorderRadius`) |
| `buttons` '/create' → `VIPSubscriptionButtonV2` | "Start your 15 days trial" (plan buttonText) | `npLanding.buttonText` |
| `viewPlansButton` + `VIPDashedBorder` (4 / 5 / 1, #343D54), 14/600 #0E0E0E, centred | "View other plans" → plan select | `NpStickyFooter viewPlansTitle` (`landing.module.css` viewPlans*) |

