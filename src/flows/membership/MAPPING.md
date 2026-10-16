# noon One membership (management) — bappzaar → kit mapping

Source: bappzaar `origin/master`, `features/vip/**` (read via `git show origin/master:<path>`). Flow id `membership`,
initial screen `manage` (`/manage-membership`). Acquisition (landing, plan select, payment, add card, offers, trial guide,
invite acceptance) is the `noonone` flow and is linked, not rebuilt (see §Links into acquisition).

## Live variants (FeatureFlags)

`src/utils/FeatureFlags.ts` → `checkVariant(name, 1)` against the server AB list (`src/FeatureFlags.config.ts`:
`vip_cancel_v2` 257, `vip_upgrade_v2` 360). `VIPUtil.showManageMembership`:

| flag state | screen |
|---|---|
| cancel_v2 ✓ + upgrade_v2 ✓ | **VIPManageMembershipV3Screen** ← ported |
| cancel_v2 ✓ only | VIPManageMembershipV2Screen |
| neither | VIPManageMembershipScreen (V1) |

Both flags are server-driven; the kit ports the newest combination (V3 → `VIPCancelMembershipV2Screen`,
`VIPUpgradePlanV2Screen` via `/noon-one-upgrade` + `VIPUtil.showUpgradePlan`). V1/V2 manage, V1 cancel
(`VIPCancelMemberShipScreen`) and `VIPUpgradePlanScreen` are not ported. `VIPChangePlanScreen` is only reachable from V1
cancel on master; it is ported anyway (`/change-plan`).

## Theme → tokens (§Theme)

`features/vip/theme/VIPColors.ts` → kit token (no new value) — full list in `tokens.ts` header:

| VIPColors | value | kit |
|---|---|---|
| textPrimary | #1D2539 | `--nk-color-text-primary` |
| textSecondary | #475067 | `--nk-color-text-muted` |
| textTertiary | #666D85 | `--nk-color-text-secondary` |
| textMuted | #989FB3 | `--nk-color-text-tertiary` |
| action | #0F61FF | `--nk-color-primary` |
| surfaceGrey | #F9F9FB | `--nk-color-bg-subtle` |
| surfaceTertiary | #F2F3F7 | `--nk-color-bg-page` |
| surfaceMuted | #EAECF0 | `--nk-color-border` |
| successLight | #0F8857 | `--nk-color-success` |
| successTag | #108757 | `--nk-color-best-price-ink` |
| error | #D92626 | `--nk-palette-danger-red` |
| warning | #E5641A | `--nk-palette-sunset-orange` |
| blueGrey | #343D54 | `--nk-color-text-body` |
| buttonPrimary | #101628 | `--nk-color-text-strong` |
| borderPrimary | #F5F5F5 | `--nk-palette-border-primary` |
| black | #000000 | `--nk-palette-black` |
| white | #FFFFFF | `--nk-color-bg-surface` / `--nk-palette-white` |

Flow-local (`tokens.ts` → `--nk-color-mb-*`): yellowDark #A36200, successSurface #F1F9F6, lightGreen #CBF6E5,
lightYellow #FFF7C2, darkGrey #394152, stepsLineChevron #C8CDD5, elevationShadow #242424, black2 #262626, hexagon
#FED2D2 / #C45C5C, VIPPlanMemberColors (#2F8E88 #3392FF #3FA199 #757ADB #C655EC), OverlayBottomSheet backdrop
rgba(30,30,30,.7) + handle #B7B7B7, plus per-area blocks (cancel / plans / family / perks).

`VIPStyles` type scale (fontSize/lineHeight, letterSpacing 0 in RTL): h40 40/48, h32 32/40, h28 28/36, h24 24/32, h20 20/28
(-0.25) · h18 18/24, h16 16/20, b16 16/22 (-0.15) · b14 14/20, b13 13/18, b12 12/18, b11 11/14 (-0.1). Existing kit
combos are reused (`text16-bold-lh20` = h16 bold, `text14-bold-lh20` = b14 bold, `text13-medium-lh18` = b13 medium,
`text12-regular-lh18` / `text12-medium-lh18` = b12); the rest are `--nk-type-mb-*`. Letter spacing →
`--nk-space-mb-ls25 / ls15 / ls10`. `VIPUtil.responsiveFontSize` (base width 375, factor .5, round) is identity at the
kit's 390pt device, so plain sizes are used. Shadows: shadow2 → `--nk-shadow-mb-shadow2`, shadow3 → `--nk-shadow-mb-shadow3`.

## Shared chrome

| bappzaar | kit | values |
|---|---|---|
| VIPOverlayBottomSheet → src/components/OverlayBottomSheet (+ constants/OverlayBottomSheet.ts) | `components/VipOverlay.tsx` | radius 18 all corners, marginBottom `overlayBottomSpacing()` = 12 + safe-area, handle 36×4 r2 #B7B7B7 at top −18, wrapper paddingTop 60, backdrop rgba(30,30,30,.7) timing 350ms inOut(ease), open spring mass 1 / stiffness 110 / damping 15 from `animationArbitraryHeight` (300), close timing 350ms, drag-close > min(h·0.5, 250) or 2000px/s; `isPopup` → centred, margin 20, r10 |
| navigator.showOverlay | `presentation: 'modal'` + transition `mb-overlay` (`transitions.ts`, transparent static layer) | — |
| showModal fullScreen (manage) | transition `mb-modal` | iOS slide-up 420ms |
| VIPButton | `VipButton` (primitives) | scale 0.97 (100ms in / 200ms out), onPress after 200ms, white Loader when loading |
| VIPDashedBorder (5, 8, 1, surfaceMuted) | `DashedLine` | rounded 5px dashes every 8px, 1px, `--nk-color-border` |
| back button (V3 / cancel V2 headerWrapper) | `VipBackButton` | 40×40, r20, white, 1px surfaceTertiary border, chevron-left-rounded 9×18 stroke textPrimary 1.5, marginStart −4 |
| chevron-left-rounded 7×12 rotated 180° | `RowChevron` | (0° in RTL) |
| ManageFamilyMembersSection avatar | `MemberAvatar` | 40px circle, VIPPlanMemberColors[i % 5], 1.5px borderPrimary ring, 24/30 bold −0.26 white |
| VIPMemberInitialHexagon | `MemberHexagon` | 64×62, path viewBox 0 0 30 35, #FED2D2 / #C45C5C, white 0.8 stroke, font = w / 2.3 |
| VIPTransitionAnim (success) | `SuccessAnim` | vip-landing-success-animation(.ar).lottie full screen, title 24/800 −0.4 #02060CEB, subtitle 15/500 −0.14 #02060C99, mt 8, at top 62%; text fades in + rises 60px at 70% / 72.5% of 4000ms (450ms, Easing.out(sin)); layer fades out 500ms after 200ms; page content parked at translateY 200 / opacity 0 springs back (stiffness 80) |
| VIPEventEmitter.vipMembershipChanged / Cancelled / PaymentChanged | `store.ts` `membershipEvents.membershipChanged / notify` | manage plays SuccessAnim / toasts |

## Manage membership — `membership/manage` (`/manage-membership`)

`features/vip/screens/VIPManageMembershipV3Screen/VIPManageMembershipV3Screen.tsx` + `styles.ts`, `Plan/Plan.tsx` + `Plan/styles.ts`,
`components/ManageFamilyMembersSection`. Kit: `ManageMembershipScreen.tsx`, `manage.module.css`, `components/ManagePlan.*`,
`components/FamilyMembersSection.*`, data `manageData.ts`.

| section | property | master | kit |
|---|---|---|---|
| container | background | LinearGradient surfaceTertiary→surfaceTertiary | `<Screen background="bgPage">` |
| headerWrapper | position / padding | absolute, z 99, padding 12, paddingTop statusBarHeight | Screen `overlayHeader`, `padding: var(--nk-inset-top) s12 s12` |
| headerBg | bg / shadow / opacity | white, shadow2, opacity = scrollY ∈ [0,1] clamp | `--nk-color-bg-surface`, `--nk-shadow-mb-shadow2`, opacity from `onScroll` |
| header | row | h40, gap 12 | `--nk-space-mb-header-row`, `s12` |
| headerTitle | type | h16 bold textPrimary; `vip_manage_family_plan` when familyMembersSection else `vip_manage_membership` | `text16-bold-lh20`, `mb-ls15` |
| back | action | `navigator.dismissModal()` | `nav.back()` (reset to account when opened directly) |
| flatlistContent | padding | top statusBar + 60, bottom 54 | `contentStyle` |
| topSection | margin | 0 16 | `s16` |
| plansContainer | card | white, r16, overflow hidden | `bg-surface`, `r16` |
| Plan.activeTag | tag | h24, padding 4/12, successTag, radius 0 0 12 12, B12 semibold white; surfaceGrey/textPrimary when an upcoming plan exists; text `vip_current_plan` or `vip_upgraded_plan` (plan changed since mount) | `best-price-ink`, `mb-b12-semibold` |
| Plan.headerMessage | strip | h52, padding 0 16, LinearGradient #F0FFF9→white 90°, gap 4, top −4, star.svg 18 (mt 2), HtmlView p 15, highlight successTag (+ base bold) | `--nk-color-mb-plan-header-from`, `HtmlText base` |
| Plan.title | type | padding 12, B16 bold textPrimary | `mb-b16-bold`, `mb-ls15` |
| Plan.benefits | rows | dashed (margin 0 12), container py 8, row padding 8/12 gap 10, check.webp 16 tinted blueGrey, HtmlView p B12 medium textSecondary, `<b>` semibold UPPERCASE, `<highlight>` successTag medium; only when current && no upgradePlan | `MaskIcon` `text-body`, `text12-medium-lh18` `text-muted` |
| Plan.billingInfo | text | dashed (margin 0 12), padding 12, B12 medium textTertiary | `text12-medium-lh18` `text-secondary` |
| Plan CTA | VIPSubscriptionButtonV2 | margin 12, black, r10, h45, html 16 bold white; `/upgrade` `/reactivate` successTag; `/cancelUpgrade` outline (hidden on manage: `hideCancelButton`) | `.cta` `--nk-palette-black` / `best-price-ink` |
| planButton row | button | buttonsContainer padding 0 4 4; button padding 12/16 surfaceGrey, radius 6 6 12 12; B13 medium textPrimary `_.capitalize(text)`; chevron 7×12 rotated | `.button[data-single]`, `text13-medium-lh18` |
| family section | card | margin 16 16 0, padding 0 12, r16, #FEFEFE; header py 16 gap 2 (B16 bold / B12 regular textTertiary); dashed; rows py 12, avatar 40, content ms 12 gap 2 (B14 medium / B12 regular textTertiary); Remove padding 4/6 r4 B12 semibold error; add row: 40 surfaceGrey circle + system-plus 20, `vip_add_another_member`, `vip_more_seats_available` (max − 1 − members, default max 5) | `FamilyMembersSection.module.css` (`--nk-color-mb-family-card`, `--nk-palette-danger-red`) |
| payment card | container | margin 16 16 0, r16, white, overflow hidden | `.paymentButtonsContainer` |
| paymentInfo | row | padding 16/12, gap 12; image 40×40 r8 contain; `vip_payment_method` B12 regular textTertiary; `•••• 4521` B16 bold | `cardImage(brand)` (card-visa/mastercard/amex.webp) |
| payment buttons | stack | `['/update-payment','/pdf-link']` orderBy cta desc; stackedButtonsInner surfaceGrey radius 6 6 12 12; dashed separator margin 0 12 | `.stackedButtonsInner`, `DashedLine` |
| cancel / leave row | row | white r16, margin 16 16 0, padding 12 12 12 20, gap 12; B14 bold textPrimary; subtitle mt 2 B12 regular textTertiary (`vip_cancel_notice_trial` / `vip_cancel_notice_paid`; leave-family: button.subtitle); chevron marginEnd 8 | `.cancelButton` |
| success | VIPTransitionAnim | on vipMembershipChanged(…, showAnimation) | `SuccessAnim` from `membershipUi.celebrate` |

**Actions** (`handleButtonPress`): `/plan-upgrade` → `membership/upgrade`; `/update-payment` → `noonone/payment`
(`VIPUtil.showChangePayment`, isUpdatePayment); `/pdf-link` → `membership/invoice`; `/cancel` → `membership/cancel {mode:'cancel'}`;
`/leave-family` → `membership/cancel {mode:'leave'}` (skipFamilyCancelOverlays); `/cancel-free-upgrade` → `{mode:'cancelUpgrade'}`;
`/cancel-upgrade` → `membershipManageActions.cancelUpgrade()` + toast; Remove → `membership/removeMember {memberId}`;
Add member → `membership/shareInvite`; plan CTA `/reactivate` → `noonone/payment` (falls back to in-place reactivate + success
animation when the acquisition payment screen is absent).

**Server-driven → demo** (`manageData.ts` builds `manageMembershipV2` + `planUpgrade` from the shared store):
buttons per state (owner: change plan / update payment method / view invoice (not in trial) / cancel membership (not when
cancelled); member: Leave Family plan), billing copy per status, benefits HTML, family section title/subtitle/owner savings,
upcoming plan card (`vip_upcoming_plan`, `vip_renewal_date`, "cancel plan change").

**Demo states** (`data.ts` `demoStates`, route param `state`): `active` (Monthly AED 25, renews +30d), `trial`, `cancelled`
(ends +12d, Renew membership), `familyOwner` (Family Monthly AED 45, 5 seats, 2 joined → 2 free), `familyMember`
(member of Rahul Sharma's family), `upcoming` (Monthly → Annual scheduled). Opening `/manage-membership` with an empty
store (status `none`) seeds `active` before first paint (`useEnsureMembership`).

## Store (`src/kit/membership.ts`, append-only)

Added `MembershipManageState` (`upcomingPlan`, `ownerName`, `reminderSet`, `referralCode`, `memberSince`),
`useMembershipManage()`, and `membershipManageActions` (`scheduleUpgrade`, `cancelUpgrade`, `setReminder`,
`updatePaymentCard`, `applyReferral`, `memberJoined`). Existing fields/actions unchanged.

## Links into acquisition (`links.ts`)

`acquisitionRoute('payment' | 'planSelect' | 'addCard' | 'trialGuide' | 'landing')` resolves to the registered `noonone`
screen (`payment`, `plans`, `addCard`, `trialGuide`) or falls back to `noonone/landing`.

## Assets

`src/assets/membership/` — every file under `features/vip/theme/assets/{icons,images}` (@3x where present; lotties as
.lottie) + the `src/theme/assets/icons` files VIPIcons references (check, check-disabled, one-green-check, card-*, apple-pay,
close-modal, close-overlay-popup, calendar, share-black, cancellation-error, clear-input, radio2-*, arrow-left/right,
menu-radio-uncheck, one-trial-alert, chevron-down, check-circle). Import map: `assets.ts`.

## Routes (flow `membership`)

| route | path aliases | master | presentation |
|---|---|---|---|
| `manage` | manage-membership, noon-one-manage-membership | VIPManageMembershipV3Screen | screen (`mb-modal`) |
| `upgrade` | noon-one-upgrade, upgrade-plan | VIPUpgradePlanV2Screen | screen |
| `reviewPlan` | — | VIPGenericOverlay + VIPReviewCancelUpgradeScreen (change-plan) | overlay |
| `switchPlan` `{ planId }` | — | VIPSwitchPlanOverlayScreen | overlay |
| `info` `{ data, isPopup }` | — | VIPInfoOverlayScreen | overlay |
| `changePlan` | change-plan | VIPChangePlanScreen (legacy, V1 cancel only) | screen |
| `invoice` | invoices, invoice | VIPInvoiceScreen | screen |
| `cancel` `{ mode: cancel·leave·cancelUpgrade, index }` | cancel-membership | VIPCancelMembershipV2Screen (Benefits / DiscountOffer / Survey pages) | screen |
| `cancelSheet` | — | V2 overlay pages (Reminder, ReviewCancelUpgrade) | overlay |
| `unusedSeats` `planOptions` `groupSavings` `loseAccess` | — | owner family-cancel overlays | overlay |
| `leaveFamilyOverlay` | — | VIPLeaveFamilyPlanOverlayScreen | overlay |
| `confirmOffer` | — | VIPConfirmOfferPlanScreen (retention offer) | overlay |
| `familyPlans` | family-plan, family-plans | VIPFamilyPlansScreen | screen |
| `familyReview` | — | VIPPlanDetailsPopup (FAMILY_PLAN) | overlay |
| `shareInvite` | share-invite | VIPSharePlanInviteScreen | screen |
| `removeMember` `{ memberId }` | — | VIPRemoveFamilyMemberOverlayScreen | overlay |
| `leaveFamily` | leave-family | VIPLeaveFamilyPlanScreen | screen |
| `referrals` | referrals, noon-one-referrals | VIPReferralsScreen | screen |
| `referralsInput` | referral-code | VIPReferralsInputOverlayScreen | overlay |
| `partner` | — | VIPPartnerOverlayScreen | overlay |
| `yangoCredits` `{ isTrialValid }` | — | VIPYangoCreditsOverlayScreen | overlay |

Every route renders when opened directly (`useEnsureMembership(params.state)`; family-only routes seed `familyOwner` /
`familyMember`). `?state=` works on all of them.

## Cancellation — `cancel/` (VIPCancelMembershipV2Screen)

Files: `screens.ts`, `CancelScreen.tsx` (full-screen pages: gradient #FFFFFF→#F4F3F3 @ 0.4, absolute header with
`VipBackButton` at top statusBar+4 / left 14 and a white shadow2 bar fading 0→1 over 60px, sticky white button container r12
top + shadow3, buttons h52 r12 1px border 16/600), `pages.tsx` (Benefits, DiscountOffer + VIPTimedExclusiveOfferModule look,
Survey, Reminder, ReviewCancelUpgrade), `overlays.tsx` (unused seats, plan options, group savings, lose access, leave family,
confirm offer — all `VipOverlay`; overlay buttons row, padding 16, gap 12, h56), `parts.tsx` (VIPPlanMembers rings 40 /
overlap 10, reminder card = `shared/vipOverlayReminderStyles`), `cancelNav.ts` (handleButtonPress), `cancelData.ts`
(server `cancelMembershipV2.pages` + `getCancellationReasons`). Area tokens: `cancelAreaTokens` (`--nk-*-mb-c-*`: banner /
note gradients #FFD7D7 / #EDFEF0, soft shadow #ECECEC, comment bg #F7F7FA, offer price border #71B2FF, confirm #939393 /
#12945F, header types 30/28/22 bold, etc.).

Page order (`buildCancelPages`): active → benefits, discount-offer, survey · trial → benefits, reminder (overlay), survey ·
family owner → unused-seats (if free seats), plan-options, group-savings, lose-access, benefits, survey · `leave`
(skipFamilyCancelOverlays) → benefits, survey, leave-family overlay · `cancelUpgrade` → review-cancel-upgrade overlay.
Survey: 6 reasons (radio), comment box when `isCommentRequired`, CTA disabled (#A0A0A0 text) until valid.

Actions: `/exit` `/stay` `/dismiss` → pop back to manage · `/continue` → next page (push screen / open overlay) ·
`/reminder` → `membershipManageActions.setReminder(true)` + toast `vip_one_reminder_set` · `/accept-offer` → `confirmOffer` →
quick subscribe → success animation on manage · `/share-invite` → `membership/shareInvite` · plan-options `/change-plan` →
`cancelSheet?review=changePlan` → `scheduleUpgrade` + success animation · `/cancel-membership` → `membershipActions.cancel()`
(leave: `leaveFamily()`, cancelUpgrade: `cancelUpgrade()`) + `membershipEvents.notify` (toast on manage).

## Plan change & billing — `plans/`

`UpgradePlanScreen.tsx` (VIPUpgradePlanV2: current plan card via `shared.tsx` = Plan isUpgradeScreen (1.5px #F5F5F5 border,
r16), "Explore other plans", selectable plan options `PlanOption.tsx` (selected wrapper #EBF4F1 / border #329537, radio
deselected #C5C5C5, inner r14.5), sticky CTA) → `switchPlan` when going from a family to a smaller plan → `reviewPlan`
(terms card, "Pay with ••••4521" label rgba(2,6,12,.45) → acquisition payment, confirm) → `scheduleUpgrade` (or
`changePlan` for immediate free upgrades) + `membershipChanged` → manage success animation + upcoming-plan card.
`ChangePlanScreen.tsx` (availablePlans banners expand 500ms, applied referral #DFF1DA, cancel membership → `cancel`).
`InfoOverlay.tsx` (popup, header icon one-trial-alert, title 25 bold, buttons). `InvoiceScreen.tsx` — master renders the
`invoiceUrl` PDF (react-native-pdf, bg #F4F4F4) with back (border #E3E3E3) / share / Download (toast
`vip_success` · `vip_pdf_saved_successfully`); the kit renders a demo noon One tax invoice (plan, period, AED 23.81 + VAT 5%
= AED 25.00, card) inside the same chrome. Data: `plansData.ts` (planUpgrade.otherPlans, switch copy, invoice).

## Family plans — `family/`

`FamilyPlansScreen.tsx` (header vip-family-plans-header(.ar).lottie, title "Try Family free", Duo / Family cards with
VIPPlanMembers seats (plans container marginTop −56), benefits / steps (step number 9/800) / FAQ (VIPExpandableTextModule,
dividers #EBEBEB) / share sections, skeleton shimmer, sticky CTA) → `familyReview` (VIPPlanDetailsPopup FAMILY_PLAN:
invoice rows, reminder #F43333, "Pay with") → `membershipActions.changePlan(familyMonthly)` + success animation.
`SharePlanInviteScreen.tsx` (skeleton → hero card with MemberHexagon seats, shadow 0 2 18 rgba(0,0,0,.09), press .97, title
h24 600 with 800 highlight, 3 benefits, Share Invite (whatsapp-white) → copies link, `membershipActions.inviteMember` with the
next demo contact → listed on manage as "Invite sent"). `RemoveMemberOverlay.tsx` (MemberHexagon, `vip_remove_member_title`
/ `_description`, Cancel / Remove (loader) → `removeMember` + notice). `LeaveFamilyPlanScreen.tsx` (savings title
`vip_leave_family_savings_*`, Keep membership / Leave Family → `cancel {mode:'leave'}`). Data: `familyData.ts`.

## Referrals & partners — `perks/`

See `perks/MAPPING.md`.

## Click-through verification (isolated dev server, see §Verification)

- manage → Change plan → Annual → Change plan (review) → Change plan → success Lottie "Plan change scheduled" → manage shows
  the upcoming Annual card + "Cancel plan change".
- manage → Cancel membership → benefits → discount offer ("No thanks, continue") → survey (reason) → Cancel membership →
  manage: status cancelled, "Renew membership", toast.
- family owner: Add another member → Share Invite → manage lists "Maya Debnath · Invite sent" (1 more seat) → Remove →
  Remove → member gone.
- family member: Leave Family plan → benefits → survey → leave-family overlay → Leave Family → store `none` → manage
  redirects to `noonone/landing`.
- owner cancel: unused seats → plan options (Cancel anyway) → group savings → lose access → benefits.
- referralsInput: invalid code shows "This code is invalid or has expired"; `SARA26` → applied → info popup → manage.

## Shared follow-ups

- `/noon-one-sharing` and `/noon-one-share-invite` (master: VIPFamilyPlansScreen / VIPSharePlanInviteScreen) are claimed
  as path aliases by the `noonone` flow (its `familyPlans` / `acceptInvite`); membership uses `family-plan(s)` / `share-invite`.
  Decide one owner.
- Duplicate ports: `noonone` also has FamilyPlans, ConfirmOfferPlan, Info/Generic overlays and PlanOption overlay
  (acquisition variants). Management keeps its own copies under `membership/*`; consolidate later if wanted.
- Account noon One card / entry points should open `membership/manage` (owned by the entry-point agent).
- `noonone/landing` after leaving a family / when the store is `none` shows its own loading/intro state first.

## Verification

`npx tsc -p tsconfig.json` / `tsconfig.lib.json`: no errors in membership (remaining errors are in src/flows/cart, another agent).
`npm run lint:tokens -- -v src/flows/membership`: 0 raw literals outside tokens.ts. All 24 membership routes + path aliases
render with no console errors (screenshots under the session scratchpad).
