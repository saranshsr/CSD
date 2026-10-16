# noon One — flow specification

<!-- planned: ../noon-ui/references/motion-matrix.md -->

The contract a noon One acquisition build must meet. Read from the code on 2026-10-13 (`src/flows/noonone`, `src/kit/membership.ts`, the entry points in other flows). Style values per bappzaar component: `src/flows/noonone/MAPPING.md`. Route list with truth / verified columns: `../noon-ui/resources/screens.md` → "noonone · noon One" (and the generated inventory `../noon-ui/resources/inventory.md` once it exists).

Flow: id `noonone`, group Profile, initial `landing`, `parent: 'account/account'` (Back when opened directly), `sheetBackdrop: 'noonone/landing'` (overlays opened by URL render over the landing). 22 screens in five area files.

## Screens

Overlay = `{ presentation: 'modal', transition: 'noonone-overlay' }` with the `VIPOverlay` chrome drawn by the screen.

| Route | Path (URL) | Presentation | What it is | Source / truth |
|---|---|---|---|---|
| `noonone/landing` | `/noon-one`, `/noonvip` | screen, `statusBar: 'dark'` | Landing: non-member CMS modules + sticky trial footer, or member overview | Figma `24:2604` (non-member) + `VIPLandingScreen` (member) · `mixed` |
| `noonone/success` | — | screen, `{ demo: 'success' }` | Same `LandingScreen`: subscribes the demo user, plays the success animation, lands on the member view | `VIPTransitionAnim` · bappzaar |
| `noonone/plans` | `/noon-one-all-plans`, `/vip-plans` | screen, `{ source: '/noon-one-landingV2' }` | Plan select V3: tier tabs, plan cards, offers link, terms, sticky subscribe | `VIPQuickPlanSelectV3Screen` |
| `noonone/planDetails` | — | overlay, `{ planCode: 'ONE_MONTHLY', variant: 'landing' }` | First-tap review sheet; `variant` `landing` · `planSelect` · `family` | `VIPPlanDetailsPopup` / `VIPInfoOverlayScreen` |
| `noonone/trialGuide` | — | overlay | Day 1 / 28 / 30 trial timeline, GOT IT | `VIPTrialGuideOverlayScreen` |
| `noonone/planOption` | — | overlay | Plan options (m-checkbox) → Continue; members: change plan + toast. Only master caller is the cancel flow | `VIPPlanOptionOverlayScreen` |
| `noonone/familyPlans` | `/noon-one-sharing` | screen | Duo / Family tiles, header Lottie segments, members, benefits, FAQ, sticky CTA | `VIPFamilyPlansScreen` |
| `noonone/payment` | — | screen, `{ planCode: 'ONE_MONTHLY' }` | Payment V2: saved cards (+ inline CVV), add card, mobile pay, Apple Pay, trial-guide strip, CTA | `VIPPaymentV2Screen` |
| `noonone/addCard` | — | overlay (legacy `Overlay` chrome) | Card form, Luhn / expiry / CVV validation | `VIPAddCardOverlayScreen` |
| `noonone/addCvv` | — | overlay, `{ cardId: 'card_2' }` | CVV verification for Mastercard ••0019 | `VIPAddCvvOverlayScreen` |
| `noonone/mobilePay` | — | overlay | Boku: number → 6-digit OTP (000000 = error) | `VIPMobilePayOverlayScreen` |
| `noonone/info` | — | overlay | Info / warning popup (default: not eligible for free trial, scrim can't close) | `VIPInfoOverlayScreen` |
| `noonone/generic` | — | overlay | Touchpoint error popup; `{ variant: 'update' }` app-update sheet | `VIPGenericOverlayScreen` |
| `noonone/offers` | `/noon-one-vouchers`, `/noon-one-bank-offers`, `/noon-one-input-referrals`, `/noon-one-referrals-input` | overlay, `{ tab?, code?, empty? }` | Voucher codes / Bank offers tabs + code input | `VIPOffersOverlayScreen` |
| `noonone/partnerOffer` | `/noon-one-partner-offer`, `/noon-one-stc` | screen, `{ campaignCode: 'enbd' }` | Partner campaign page (enbd, stc) | `VIPOffersV2Screen` |
| `noonone/confirmOffer` | — | overlay, `{ offer: 'ONE30' }` | Confirm offer plan | `VIPConfirmOfferPlanScreen` |
| `noonone/confirmVoucher` | — | overlay, `{ offer: 'SARA25', code: 'SARA25' }` | Review and confirm after a code | `VIPConfirmVoucherPlanScreen` |
| `noonone/bundle` | `/noon-one-bundle` | modal, transition `sheet`, `statusBar: 'light'`, `{ bundlePartnerCode: 'yango' }` | Yango Play bundle, server-themed | `VIPBundleV2Screen` |
| `noonone/acceptInvite` | `/noon-one-share-invite` | overlay, `{ duo?, error? }` | Invitee joins the owner's family plan | `VIPAcceptPlanInviteOverlayScreen` |
| `noonone/acceptInviteError` | — | overlay | Expired invite popup | `VIPAcceptInviteErrorOverlayScreen` |
| `noonone/cartOverlay` | — | overlay (legacy chrome), `{ coupon, isOneDay? }` | Cart upsell shown instead of checkout | `VIPCartOverlayScreen` |
| `noonone/ocOne` | — | overlay, `{ status: 'succeeded' \| 'failed' }` | Order-confirmation enrolment result | `OCOneOverlayScreen` |

No screen has a `verified` date yet (`../noon-ui/resources/screens.md`). Not ported (MAPPING.md): plan select V1, bundle V1 (non-yango codes), update-payment mode (management), the enbd partner popup, the referral popup, pull-to-refresh.

## Landing — `noonone/landing`

`<Screen background={isMember ? 'bgPage' : 'vipNpPage'} safeTop={false} overlayHeader header={<LandingHeader scrollY variant={isMember ? undefined : 'np'} />} onScroll>`, content padded by the measured sticky footer height + 26. The header fades in white with "noon One" on scroll.

### Non-member (Figma `24:2604`, `npLanding.modules` in `data.landing.ts`, rendered by `NpModuleRenderer`)

| # | Module type | Kit component (`components/landing/npModules.tsx`) | Spec |
|---|---|---|---|
| 1 | `VIP_MEMBERSHIP_OVERVIEW_MODULE` (`showDefault`) | `NpOverviewModule` | One logo header, "Free Delivery · on everything, anytime" |
| 2 | `VIP_OFFER_PLAN_MODULE` | `NpOfferPlanModule` | gradient border card "Get One at 20% Off", "15 days free trial" tag, dashed separator, gift + price line. Placed here following the prod screenshot (not in frame 24:2604) — assumption recorded in MAPPING.md |
| 3 | `VIP_SAVINGS_BREAKDOWN_MODULE` | renderer case (savings overview, "Save 6x") | |
| 4 | `VIP_BENEFITS_MODULE` | `NpBenefitsModule` | white r12 card, 4 value-prop rows, 44 icon circles / overlapping marketplace circles, dashed separators, priority-support strip |
| 5 | `VIP_MARKETPLACE_BENEFITS_CAROUSEL_MODULE` | `NpSavingsModule` → `Slider` (`components/landing/modules.tsx`) | marketplace tiles autoplay 3.5s, swipe ≥ 20, labels cross-fade |
| 6 | `VIP_VIDEO_MODULE_CAROUSEL` | `NpVideoCarouselModule` | OSN+ cards, scroll-snap, page dots; CTA `/create` starts the trial |
| 7 | `VIP_BANNER_MODULE_CAROUSEL` | `NpPartnersModule` | "Partnerships and Benefits": FAB Z → `noonone/offers`, STC → `noonone/partnerOffer` |
| 8 | `VIP_COUPON_ENTRY` | `NpCouponModule` | "Have a coupon code? Apply" → `noonone/offers { tab: 'vouchers' }` |
| 9 | `VIP_EXPANDABLE_TEXT_MODULE` | `NpFaqModule` | collapsible title, rows expand 300ms, chevron −180° |
| — | Sticky footer | `NpStickyFooter` | green offer flyout strip ("Don't miss noon One at the **lowest** price") → plans; `SubscriptionButton`-style CTA "Start your 15 days trial" (plan `buttonText` once the trial is used); after the first tap a "Pay with ••••4242" row → payment; dashed "View other plans" → plans. Slides up after loading, slides away during the success animation |

### Member (bappzaar `VIPLandingScreen` modules, `components/landing/modules.tsx`)

| # | Part | Kit | Spec |
|---|---|---|---|
| 1 | Background | `.bgImage` (`landing.module.css`) | CSS gradient stand-in for `landingV2.bgImg` (server image) |
| 2 | Overview | `MembershipOverviewModule` | logo Lottie, name, plan title, status ("trial" / "active"), billing ("Free until … then" / "Renews on …" from `useMembership().renewsOn`), joined family members, footer "Manage your membership" → `membership/manage` |
| 3 | Savings | `SavingsOverviewModule` | V1 (flag `vip_savings_widget_v2` off); count-up 0 → 5 over 1.2s instead of master's digit roll |
| 4 | Benefits | `BenefitsModule` | |
| 5 | FAQ | `FaqModule` | |
| — | Footer | none | the member landing has no `/create` button |

Unused but kept: `BannerModule`, `MpBenefitsCarousel`, `FamilyPlanModule`, `GuideStepsModule` (the old non-member module set in `modules.tsx`).

## Plans — `noonone/plans`

`<Screen background="var(--nk-color-vip-plans-bg)" overlayHeader header={<ScrollHeader title="Choose Your Plan" opacity />} footer>` (header fades in over 0–20px).

1. Page title "Choose Your Plan".
2. Tier tabs (only when more than one tier): pill slides `x` 500ms `easing.out` (`src/motion/presets.ts`); tabs One Bundle ↔ One Standard, Standard selected by default; else a separator.
3. Plan cards: `PlanCard` (savings tag with shimmer, badge, benefits) and `BundlePlanCard` (streaming partner, bundle tag → toast) from `components/plans/PlanCard.tsx`.
4. "Explore all the offers" → `noonone/offers { preselectedIndex: 'bank', source: '/plan-select' }`.
5. Payment terms (`HtmlText`).
6. Footer `SubscriptionButton` (`components/plans/parts.tsx`): first tap → `noonone/planDetails { variant: 'planSelect' }`; then "Pay with ••••4242" + quick pay (`useQuickPay`, 1200ms loader). Params `preSelectedTierCode`, `preSelectedPlanCode`.

`noonone/familyPlans`: header Lottie plays family → duo (frames 0→81) / duo → family (81→161); selected tile border and price box spring to green; sections fade-slide in on scroll (480ms); sticky CTA → `noonone/planDetails { variant: 'family' }`; Share invite → `membership/manage` for members, else toast.

## Payment — `noonone/payment`

Custom fading header ("Payment method", back chevron); method groups top to bottom:

1. Cards (`renderCardPay`): saved Visa ••4242 (preselected) and Mastercard ••0019 (needs verification → inline CVV input); the selected row shows the blue trial-guide strip → `noonone/trialGuide`; dashed line; "Add New Card" row with Visa / Mastercard / Amex logos → `noonone/addCard`.
2. Mobile pay (`renderMobilePay`): STC row / "Add Mobile Number" → `noonone/mobilePay`.
3. Apple Pay (radio + logo; trial-guide strip when selected).
4. Footer: `VIPButton` CTA, footer note, applied voucher code chip.

Changing method flashes the `Reloader` (`components/payment/Reloader.tsx`); the CTA shows it ~1.5s, then `completeSubscription`. Paying with ••0019 and no valid CVV opens `noonone/addCvv`; Verify resumes the payment. CTA disabled when nothing is selected or mobile pay has no number.

## Entry points (other flows)

| Where | Code | Non-member | Member |
|---|---|---|---|
| Account `ProfileCard` noon One strip | `src/flows/account/components/ProfileCard.tsx` | "Start Trial" (`trialEligible`) / "Join Now" → `noonone/landing { source: '/account' }` | savings line → `membership/manage` (kit decision; master opens the member landing) |
| Cart Checkout button | `src/flows/cart/CartScreen.tsx` `onCheckout` + `takeCartVipPush` (`components/entry/cartVipPush.ts`) | once per session → `noonone/cartOverlay { coupon }` | straight to `checkout/checkout` |
| Cart nudge / payment offer | `src/flows/cart/components/NoonOneNudge.tsx`, `PaymentOffers.tsx` | → `noonone/landing { source: '/cart' }` | hidden |
| Checkout section `integrated_noonone` | `src/flows/checkout/components/NoonOneSection.tsx` (+ `NoonOneCtaReveal.tsx`) | `Switch` writes `checkoutEnrollmentStore.enrolled`; nudge → `noonone/plans { source: '/checkout' }` | hidden |
| Order confirmation | `src/flows/checkout/ConfirmationScreen.tsx` → `useOcOneOverlay` | enrolled at checkout → subscribes (monthly, trial if eligible), after 900ms pushes `noonone/ocOne { status: 'succeeded' }` | — |
| PDP | `src/flows/pdp/components/storefront/SfDeliveryCard.tsx` banner, `src/flows/pdp/components/VipPreference.tsx` | → `noonone/landing { source: '/pdp' }` | "member" mark in the delivery card |
| Orders bill | `src/flows/orders/components/BillSummary.tsx` noon One strip | → `noonone/landing` (no `source`) | same |

Not ported (MAPPING.md → Entry points): coupon tray "Get noon One to unlock", coupon card V3, checkout shipment enrolment toast, invoice noon One rows, O2D noon One banner, One Day push trigger (screen supports `isOneDay`, nothing triggers it).

## Navigation

| From | Action |
|---|---|
| Landing CTA, first tap | `noononeStore.patch({ trialGuideShown: true, selectedPlan })` → `nav.push('noonone/planDetails', { planCode })` |
| Landing CTA, later taps; planDetails / plans quick pay; partner Activate; bundle; confirm offer / voucher | loader (`landingTokens.quickPayMs` 1200 / `QUICK_PAY_MS` / `apiMs`) → `completeSubscription(nav, plan)` |
| Landing "Pay with" row | `nav.push('noonone/payment', { planCode, source: '/noonone' })` |
| Landing flyout, "View other plans" | `nav.push('noonone/plans', { source: '/noon-one-landingV2' })` |
| Landing module actions | `nav.push(action.route, action.params)` (`NpModuleRenderer`); `/create` CTAs → the landing CTA handler |
| Member "Manage your membership" | `nav.push('membership/manage')` |
| Plans "Pay with" | `nav.push('noonone/payment', { planCode })` |
| planDetails "Pay with" (incl. family) | `nav.push('noonone/payment', { planCode })` |
| Payment rows | `nav.push('noonone/addCard')`, `nav.push('noonone/mobilePay')`, `nav.push('noonone/trialGuide', { planCode })`, `nav.push('noonone/addCvv', { cardId })` |
| Offers "Apply offer" / valid code | "Offer applied" popup (2s) → `close(() => nav.push('noonone/confirmVoucher', { offer, code }))`; invalid → `nav.toast(message, { tone: 'error' })` |
| confirmVoucher back | `close(() => nav.push('noonone/offers'))`; Pay with → `noonone/payment { planCode, voucherCode }` |
| confirmOffer, no saved card | `close(() => nav.push('noonone/payment', { planCode, buttonTitle: 'Confirm Membership' }))` |
| partnerOffer | Explore other plans → `noonone/plans { source: '/offers' }`; Pay with → `noonone/payment { planCode, voucherCode }`; back `nav.back` |
| acceptInvite | Join → member of the owner's plan (`role: 'member'`) → `popToLanding(nav)`; error → `close(() => nav.push('noonone/acceptInviteError'))` |
| acceptInviteError, info | Explore noon One → `nav.push('noonone/landing')`; Got it → close |
| planOption Continue (member) | change plan + `nav.toast('Your plan has been updated', { tone: 'success' })` |
| cartOverlay | "Explore benefits" → `close(false, () => showLandingWithRedirect(nav, undefined, { source: '/cart' }))`; "Continue to checkout", ×, scrim → `nav.push('checkout/checkout', { coupon })` |
| ocOne | "Explore benefits" → `nav.push('noonone/landing', { source: '/order-confirmation' })`; "Okay, got it" closes |
| Deep links `/noon-one-*` | `showLandingWithRedirect(nav, redirect)` pushes the landing, then the redirect on top (`noonone-instant` when `animatePush: false`) |

## State

| State | Where | Written by |
|---|---|---|
| Membership (`status: 'none' \| 'trial' \| 'active' \| 'cancelled'`, `plan`, `renewsOn`, `savings`, `role`, `family`, `paymentCard`) | `membershipStore` in `src/kit/membership.ts` (shared, append-only) | `noonOneJourneyActions.subscribe(plan, { trial, card })` (also sets `trialEligible: false` when `trial`); `resetToNonMember()` for demos; management writes through `membershipActions` / `membershipManageActions` from the membership flow |
| Trial eligibility | `membershipEligibilityStore` (`useMembershipEligibility`) | `subscribe` with `trial` |
| Member? | `useIsNoonOneMember()` = active or trial (cancelled counts as non-member) | derived |
| Journey (`selectedPlan`, `paymentMethod`, `addedCards`, `trialGuideShown`, `voucherCode`, `pendingSuccess`) | `noononeStore` / `useNoonone` in `src/flows/noonone/store.ts` | screens; `completeSubscription` sets `pendingSuccess` |
| Checkout enrolment | `checkoutEnrollmentStore` (`components/entry/checkoutEnrollment.ts`) | checkout `NoonOneSection` toggle; consumed by `useOcOneOverlay` |
| Cart push shown | module flag in `cartVipPush.ts` (per page load) | `takeCartVipPush`; `resetCartVipPush` for the playground |

Transition: non-member → subscribe → `membershipStore.status = 'trial' | 'active'` → landing consumes `pendingSuccess` when it is top of stack → `TransitionAnim` → member view; every entry point re-renders its member state. Membership management (`membership/manage`, `useEnsureMembership(state)` in `src/flows/membership/store.ts`) seeds an active member when opened with none, and its `?state=` presets (active, trial, cancelled, familyOwner, familyMember, upcoming) write the same kit store.

## States

| State | Exists? | How |
|---|---|---|
| Loading (landing) | yes | shimmer Lottie `vip-loading-shimmer.lottie` for `landingTokens.loadingMs` (600ms); blank when `redirecting` |
| Loading (payment, CTAs) | yes | `Reloader` overlay; `VIPButton` / `SubscriptionButton` `isLoading` spinner |
| Success | yes | `noonone/success`; `TransitionAnim` after any subscribe; reminder toast with `{ reminder: true }` on the landing |
| Member vs non-member | yes | same route, driven by the membership store; demo with `noonone/success` or `noonOneJourneyActions.resetToNonMember()` |
| Trial used | yes | `withEligibility()` re-prices plans and swaps button copy |
| Empty offers | yes | `noonone/offers` with `{ empty: true }` |
| Errors | partial | `noonone/info` (not eligible for trial), `noonone/generic` (touchpoint error), `noonone/acceptInviteError`, `noonone/ocOne { status: 'failed' }`, invalid offer code toast, mobile-pay OTP 000000, invalid CVV message in `noonone/addCvv` |
| Payment failure (declined card) | **does not exist** | no route or param; would need a new state |
| Landing load error / offline | **does not exist** | the landing always resolves after 600ms |
| Cancelled member landing | **does not exist** | a cancelled member sees the non-member landing; master's CancelledAnimation belongs to management and is not ported |

## Data

- `data.ts` re-exports the area files and holds `CURRENCY`, `defaultPlan`, `findPlan`, `withEligibility`, `toMembershipPlan`, `successMessage`, `savedCards`.
- `data.landing.ts` (`npLanding` modules, flyout, button text; member `membershipOverview`, `savingsModule`, `benefitsModule`, `faqModule`, `landingCopy`, `fmtDate`), `data.plans.ts` (tiers, plans, bundles, `trialGuideData`), `data.payment.ts` (`payCopy`, card data, `trialGuideEntry`), `data.offers.ts` (vouchers, bank offers, partner campaigns), `data.entry.ts` (`integratedNoonone`, cart overlay, OC overlays).
- Demo catalogue (MAPPING.md → Server-driven data; master has no VIP fixtures): Individual 25 / month · 250 / year, Duo 35 / 350, Family (up to 5) 45 / 450, One + Yango Play 39 / month; 30-day trial while eligible; codes ONE3FOR1, SARA25, ONE30, ENBD12, MASHREQ50; cards Visa ••4242, Mastercard ••0019; test card 4111 1111 1111 1111 · 12/29 · 123.
- Copy: `vip-en.json` keys listed per area in MAPPING.md; the rest is demo server copy. Known drift: the plans bundle-tag toast in `src/flows/noonone/screens/PlanSelectScreen.tsx` says "AED" as text.
- Assets: `src/assets/noonone/` (`images/`, `icons/`, `landing/`, `landing-np/`, `payment/`, `entry/`) and `src/assets/vip/`.

## Design sources

- bappzaar `origin/master` d481712 (2026-10-10), `features/vip/**`; the landing back button and `/plan-select` loading state re-checked at master `b7bcbb084ce` (MAPPING.md → Non-member landing).
- Figma All flows `Af34gfmhQ1D0wstXUEHSIF` · `24:2604` (non-member landing, column `24:2625`): sections `24:2627` value props, `24:2628` savings widget, `24:2629` streaming, `24:2632` partnerships, `24:2635` coupon, `24:2636` FAQ.
- Prod screenshot 2026-10-13: non-member sticky footer (flyout, button text, "View other plans").
- Management counterpart: `src/flows/membership/MAPPING.md` (`VIPManageMembershipV3Screen`).

## Motion

General reference: `../noon-ui/references/motion.md` (and the per-screen matrix `../noon-ui/references/motion-matrix.md`). noon One values live in `src/flows/noonone/tokens.ts` (`baseTokens`, `landingTokens`, area tokens), copied from bappzaar:

| Moment | Kit |
|---|---|
| Overlay open / close | `noonone-overlay` (`transitions.ts`: transparent stack entry, exit fade 0.2s); `VIPOverlay` runs the sheet: scrim 350ms inOut, `translateY` 300 → 0 spring (mass 1, stiffness 110, damping 15), drag close > min(50%, 250) or velocity > 2000 |
| Legacy overlays (cart, add card, CVV, mobile pay) | `LegacyOverlay`: scrim 250ms, spring from 300px (stiffness 230.2, damping 22) |
| Deep-link redirect | `noonone-instant` (no push animation) |
| Bundle | modal with the kit `sheet` transition |
| Landing header | opacity from `scrollY` (`LandingHeader`) |
| Sticky footer | `y` from below, `landingTokens.sticky` (300ms, cubic-bezier 0.25, 0.1, 0.25, 1) |
| Success | `TransitionAnim`: Lottie full screen, title / subtitle rise at 70% / 72.5% of 4s, 450ms; content springs back `landingTokens.transition.contentSpring` (stiffness 80, damping 10) |
| Tier pill | `easing.out` 500ms (`src/motion/presets.ts`) |
| Buttons | `VIPButton` scale 0.97 (100ms in / 200ms out), `onPress` after 200ms |
| Family plans | Lottie segments, tile spring, sections fade-slide 480ms |
| Savings slider | autoplay 3.5s, label cross-fade |

## Acceptance

- [ ] Routes registered in the right `screens.<area>.ts`; URL aliases unchanged; `/noon-one` opens the landing; `check:routes` clean.
- [ ] Non-member landing matches Figma `24:2604` module order (or `npLanding.modules` order), with the sticky footer measured and the content padded to it.
- [ ] Member view after any subscribe path: success animation, overview with plan / status / billing from `useMembership()`, no footer, Manage → `membership/manage`.
- [ ] Every subscribe goes through `completeSubscription`; no screen writes `membershipStore` directly or keeps its own membership flag.
- [ ] First-tap trial sheet then quick pay with "Pay with ••••4242" works on landing and plans; payment covers saved card, CVV verification, new card, mobile pay and Apple Pay.
- [ ] Overlays use `noonone-overlay` + `VIPOverlay` (or the legacy overlay where master does), and close before the next push.
- [ ] Each entry point checked as non-member and as member (and `trialEligible` false where copy depends on it).
- [ ] Tokens only (`lint:tokens` 0 for `src/flows/noonone`); new values are `vip*` flow tokens with a MAPPING.md row; prices with `CURRENCY`.
- [ ] New states (payment failure, landing error) registered as their own ScreenDef or param if built.
- [ ] `source` on every new ScreenDef (`features/vip/...` or `Figma Af34gfmhQ1D0wstXUEHSIF · <node>`).
