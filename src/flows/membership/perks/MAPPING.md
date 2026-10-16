# Perks — referrals + partner overlays (bappzaar origin/master → kit)

Routes (flow `membership`): `referrals` (path `/referrals`, `/noon-one-referrals`), overlays (`presentation: 'modal'`, transition `mb-overlay`): `referralsInput` (path `/referral-code`, params `{ preselectedIndex?: 0|1, prefilledReferralCode?, showSwitcher? }`, default `preselectedIndex: 1`), `partner`, `yangoCredits` (params `{ isTrialValid?: boolean }`, default `true`). All accept `state` (demo seeding via `useEnsureMembership`).

Theme refs: ThemeManager `$edgeSpacing` 15 → `--nk-space-s15`; `$increasedBaseFont` 14 / `$increasedLargeFont` 16; base Text 13px `#404553` → `--nk-color-text-legacy`; `$blueColor` rgba(56,102,223) = `#3866DF` → `--nk-color-badge`; `$greenColor` `#2DAF32` → `--nk-palette-green-color`; `$redColor` `#FA0000` → `--nk-palette-red-color`; `$borderColor` `#f0f2f7` → `--nk-palette-border-color`; `$noonGrey2` → `--nk-palette-noon-grey2`; VIPStyles.shadow2 → `--nk-shadow-mb-shadow2`; shadow3 → `--nk-shadow-mb-shadow3`. Flow tokens added in `perksAreaTokens` (tokens.ts). RN default line heights (no lineHeight set) → `line: '1.2'`.

## Sheet chromes (perks/PerkSheet.tsx)
| master | property | value | kit |
|---|---|---|---|
| src/components/Overlay | backdrop | rgba(30,30,30,0→0.7), 250ms inOut(ease) | `--nk-color-mb-backdrop`, motion 0.25s |
| | open | Animated.spring tension 40 / friction 7 from 300px | spring stiffness 230 / damping 22 (RN origami conversion) |
| | close | timing 250ms inOut to content height | same |
| | wrapper | paddingTop 60, flush bottom (bounceMargin 0 on both screens) | `--nk-space-mb-sheet-top` |
| | closeButton | 37×37 white r20, top -18, right 30, close-overlay.webp | `.overlayClose`, asset `close-overlay.webp` |
| src/components/BottomSheet (@gorhom) | backdrop | black @ 0.5 | `--nk-palette-black-alpha50` |
| | handle | h18 container at top -18, 36×4 r2 #B7B7B7 | `--nk-color-mb-handle` |
| | open | gorhom iOS spring (damping 500, stiffness 1000, mass 3, clamped) | 300ms ease-out (equivalent overdamped settle) |
| | pan down to close | enablePanDownToClose | motion drag y, > 30% h or 800px/s |

## VIPReferralsScreen (`features/vip/screens/VIPReferralsScreen/{VIPReferralsScreen.tsx,styles.ts}`)
| section | property | master | kit |
|---|---|---|---|
| headerWrapper | padding / bg / shadow | 15, white, shadow2, centred | `.refHeader` s15, bg-surface, mb-shadow2 |
| headerTitleText | font | 16 bold lh24 | `--nk-type-mb-ref-header` |
| backButton | pos / icon | absolute top 15 left 15, back.webp h22 | `.refBack`, asset `back.webp` |
| pageTitle | font / margin | 19 bold centre, mt 15, mb 20 | `--nk-type-mb-ref-page-title` |
| headerImage | size | (width−32) × headerImageRatio% | aspect-ratio 100/50 placeholder (server CMS image) |
| referralsStatsContainer | row | paddingH 15, mt 15, gap via marginEnd 8 | `.refStatsRow` |
| referralsStats | card | flex 1, r16, 2px border (server), padding 15, bg (server) | `.refStat`, server colours → `--nk-color-badge`/`--nk-palette-faded-blue`, `--nk-color-success-strong`/`--nk-color-mb-ref-stat-green-bg` |
| statIconPill | pill | 40×24 r12 at top -12 centred, bg = borderColor, icon 18 | `.refStatPill`; server iconUrl → local user-group.svg / gift.svg (white) |
| statTitle / statValue | font | 14 mt4 / 32 bold mt8 | `--nk-type-mb-ref-stat-title` / `-stat-value` |
| CMS modules | Module list | server CMS | "How it works" demo block (kit type tokens) + entry to `referralsInput` |
| stickyFooter | container | pt16 ph16 pb stickyBottomPadding, white, top r16, shadow3 | `.refFooter`, pb `--nk-inset-bottom` |
| referralCodeContainer | box | h40 r8 1px dashed #38AE04, ph15, mb8 → copied: #DFF1DA no border | `--nk-color-success-strong`, `--nk-color-mb-ref-copied-bg` |
| referralCodeText / copy / copied | font | 13 bold / 14 semibold $blueColor / $greenColor | `--nk-type-mb-ref-code`, `--nk-type-mb-ref-link14` |
| stickyButton | button | flex 1, h48, r8, 1px border, mb8, gap 8; icon 20 (whatsapp-white / share-black) | `.refStickyButton`; text 14 bold uppercase `--nk-type-mb-ref-button` |
Actions: `/whatsapp` → wa.me share (Share.shareSingle), `/share` → Web Share API (fallback: copy link + toast); copy → clipboard + copied state. Copy: `vip_refer_earn`.
Server demo (`perksData.referrals`): title "Give 1 month free, get 1 month free", referredCount 3, totalDaysEarned 90, code `ANKIT25`, copy texts "Copy code"/"Code copied", buttons Invite (green #2DAF32) / More options (white, #D0D4DD border, #404553 text).

## VIPReferralsInputOverlayScreen (`.../VIPReferralsInputOverlayScreen/*`)
| section | property | master | kit |
|---|---|---|---|
| overlay / container | bg / radius | #F1F1F2, r16, pb overlayBottomSpacing | `--nk-color-mb-ref-overlay-bg`, pb float+inset |
| container height | animation | minHeight (400 with switcher / 330) ↔ 500, timing 250 delay 100 Easing.ease | motion value, same timings |
| closeButton | | 30×30 white r15, top -15, right 15, close-modal.webp 12 | `.refOverlayClose`, asset `close-modal.webp` |
| title | font | 30 bold uppercase, mt15, maxWidth 80%, black | `--nk-type-mb-ref-overlay-title` |
| tabs (SegmentedControlTabSwitcher) | track / tab | #0000003D r32 p4 minH32, mt4; tabWidth 115 (130 RTL); text 14 semibold white → black on white pill | `--nk-color-mb-ref-dim`, `--nk-type-mb-ref-tab`, motion layoutId pill |
| bank offers (Slider) | card | 325 wide, r16, shadow2, mt8 mb16; image 325×166; desc h153 p15 space-evenly | `.refOffer*`; server imgUrl → token-gradient placeholder |
| offerDescriptionStyle | p / a | 16 semibold / 14 regular blue underline | `--nk-type-mb-ref-offer-desc`, `--nk-color-mb-ref-link` |
| offerButton | | w100% h36 r8 #1C1C1B, text 14 bold white | `--nk-color-mb-ref-offer-button` |
| referralInputContainer | card | white p15 r16 mt-8 shadow2 | `.refInCard` |
| subtitle / benefitsMessage | font | 16 centre mb16 / 24 bold green centre mb16 | `--nk-type-mb-ref-subtitle` / `-benefits` |
| inputContainer | | h45 r8 1px $borderColor ph15; success bg #DFF1DA; error border $redColor | `.refInput[data-status]` |
| codeInput / Apply / codeText | font | 14 / 14 $blueColor / 14 noonGrey2 + 16px status icon (check-circle.webp / cancellation-error.webp) + clear-input | `--nk-type-mb-ref-input` |
| inputMessage | | 12, mt4, green / red | `--nk-type-mb-ref-message` |
| codeInfo | | #FFFDEB r8 p15 mv8, otp-info 16 | `--nk-palette-kit-yellow96`, asset `otp-info.webp` |
| button | | mh16 h48 r8 2px border, 14 bold uppercase; disabled #0000003D | `.refInButton`, `--nk-color-mb-ref-dim` |
Behaviour: tap code (validated state) → edit; ✕ → clear; Continue enabled only when valid → `membershipManageActions.applyReferral(code)` + close (master: `vipActions.setReferralCode` + close — no info overlay on success); "Learn more" link → `membership/info` with `{ infoList: { list }, title: { text: vip_terms_and_conditions }, buttons: [{ cta: '/ok', text: vip_got_it }] }`; offer button → close → `acquisitionRoute('payment')` with `{ planCode, buttonTitle, source }`.
Copy keys: `vip_bank_offers`, `vip_voucher_code`, `vip_referral_placeholder`, `vip_apply`, `vip_terms_and_conditions`, `vip_got_it`.
Server demo: header "Have a referral code?", subTitle, benefits "1 month free", button Continue (black); verifyReferralCode: `[A-Z]{3,}\d{2}` valid (e.g. SARA10) with info, own code ANKIT25 / others invalid; bank offers Emirates NBD (1 year free), FAB (3 months).

## VIPPartnerOverlayScreen (`.../VIPPartnerOverlayScreen/*`)
| section | property | master | kit |
|---|---|---|---|
| overlay / container | | white r16, overflow hidden, centred | `.partnerSheet`, `.partnerContainer` |
| banner | | specialPlanBanner, width = screen, contain | token-gradient placeholder (`--nk-color-mb-partner-banner-from/to`) with banner copy |
| buttonContainer | | pt12 ph16 pb overlayBottomSpacing, mt12, 1px #F0F1F4 top border | `--nk-palette-brand-widget-divider` |
| button | | w100% h56 r16 1px border, text 18 bold white; with payment h48 | `.partnerButton`, `--nk-type-mb-perk-button18` |
| VIPSubscriptionButtonV2 | row / payment | row gap 20; card 44×40, "Pay with" 13/500 #02060C73 + chevron-up 180°, "••••4521" 15/500 #02060CEB | `.subPay*`, `--nk-color-mb-sub-pay-header`, `--nk-palette-night-fall` |
Actions: `/create` → close → acquisition `payment` (saved card) else `landing` (master: quick payment / deep link /noon-one); `/plan-select` → close(no dismiss) → acquisition `planSelect` `{ preSelectedPlanCode }`.
Server demo: Emirates NBD co-brand, plan ONE_ENBD_ANNUAL, "Join for <s>AED 250</s> AED 0" + "View all plans".

## VIPYangoCreditsOverlayScreen (`.../VIPYangoCreditsOverlayScreen/*`)
| section | property | master | kit |
|---|---|---|---|
| container | | p12 pb overlayCtaBottomPadding (12), white, top r16 | pb float + inset |
| headerText | | 16 bold #0E0E0E, mt18 mb20 ms8 | `--nk-type-section`, `--nk-color-text-ink` |
| bodyContainer | | r12 #F9F9FB 1px #F0F0F0, ph12 pv16 | `--nk-color-bg-subtle`, `--nk-color-mb-yango-body-border` |
| rows | | gap 36; row gap 12 centred | `--nk-space-s36` |
| checkIconContainer | | 44 circle #108757, 1px #E5E5E5; pending white, icon fill #989FB3 | `--nk-color-best-price-ink`, `--nk-color-mb-yango-icon-border`, inline check-circle path |
| titleText / descriptionText | | 16/600 #262A33 / 13 #0e0e0ea6 (last #02060cbf) | `--nk-type-mb-yango-title/desc`, `--nk-palette-new-black`, `--nk-color-mb-yango-desc(-bottom)` |
| gradient rail | | absolute w44 left12, padding row1/2 … row3/2, 17 wide r9 #108757→white | `.yangoRail`, measured paddings |
| button | | h56 r12 #0E0E0E, 18 bold white, "Okay, got it" | VipButton, `--nk-type-mb-perk-button18` |
Copy: `vip_one_yango_credits_title`, `_step_1_title`, `_step_1_description_trial|paid`, `_step_2_title/description`, `_step_3_title/description`, `vip_food_okay_got_it` (currency AED).

## Assets added (src/assets/membership)
`close-overlay.webp`, `otp-info.webp`, `back.webp` (src/theme/assets/icons @3x). Reused: close-modal, share-black, whatsapp-white, check-circle(.svg/.webp), cancellation-error, clear-input, card-visa, chevron-up-rounded, gift, user-group.

## Decisions / skipped
- All images that are server URLs (referrals header image, stat icons, bank-offer banners, partner specialPlanBanner) are token-coloured placeholders; no CDN URLs exist in master source.
- Referrals CMS modules → static "How it works" block (+ entry link to the input overlay, not on master).
- Keyboard-driven height changes, haptics and analytics are not ported. Required-info (address / phone) checks skipped.
- Directive asked for an info overlay after a successful code; master does not do that (it closes) — followed master. `membership/info` is used for bank-offer "Learn more" only.
