# Account — flow specification

The contract an account build must meet. Everything here was read from `src/flows/account/` on 2026-10-13 (verified) unless marked *assumption*. Master measurements and token mappings: `src/flows/account/MAPPING.md` (bappzaar master `ba159e20381`, read 2026-10-12). Motion values: `../noon-ui/references/motion.md` and the flow-by-motion table in `../noon-ui/references/motion-matrix.md`.
<!-- planned: ../noon-ui/references/motion-matrix.md -->

## Screens

| Route | URL | Presentation / transition | What it is | Status |
|---|---|---|---|---|
| `account/account` | `/account` | tab root (`account`) | Signed-in hub | exists |
| `account/signedOut` | `/account/signedOut` | tab root (`account`) | Signed-out hero slides + Login/Sign up, language / country, footer | exists |
| `account/editProfile` | `/edit-profile` | screen (push) | Floating-label fields, gender / tourist / nationality / diet chips, % badge, Save | exists |
| `account/birthday` | `/account/birthday` | sheet | Day / month / year wheels → DONE writes `draft.birthDate` | exists |
| `account/nationality` | `/account/nationality` | sheet | Nationality list (stand-in for `PersonalizedExperienceNationalityListingScreen`) | exists |
| `account/security` | `/account-security` | sheet | 700ms skeleton (3 rows), then Edit Password · Manage devices · Account deletion | exists |
| `account/manageDevices` | `/account/manageDevices` | screen | `SecurityScreenHeader`; current device, other devices with Sign out, "Sign out of all other devices", empty state | exists |
| `account/changePassword` | `/account/changePassword` | screen, `Header back` | Three password inputs, requirement checklist, SUBMIT with `Spinner` | exists |
| `account/deletion` | `/account/deletion` | modal | Reason picker (sheet) + agreement → DELETE YOUR ACCOUNT | exists |
| `account/deletionReason` | `/account/deletionReason` | sheet | Reason list | exists |
| `account/notifications` | `/notifications` | sheet | Loader, push card (Open settings), language tabs, marketing `Switch`es, Save | exists |
| `account/preferences` | `/account/preferences` | sheet | Haptics `Switch`, Clear cache → confirmation → spinner | exists |
| `account/policies` | `/account/policies` | sheet | Legal / Orders & Returns / Support rows → toast (web view); warranty only SA / AE / EG | exists |
| `account/country` | `/account/country` | sheet | Country list → closes → `changeCountry` | exists |
| `account/changeCountry` | `/account/changeCountry` | modal / `fade`, `{ country: 'SA' }` | Full-screen Lottie, closes itself | exists |
| `account/changeLanguage` | `/account/changeLanguage` | modal / `fade`, `{ language: 'ar' }` | Full-screen Lottie, closes itself | exists |
| `account/signOut` | `/account/signOut` | sheet, `{ kind?, deviceId?, title?, description? }` | Icon card + Cancel / Yes, sign out (`SheetBody`, `SheetButtons`) | exists |

No flow `parent` (account is a tab root); `tabBar.screens` = `account`, `signedOut`. Every screen is lazy (`lazyScreen`).

## Anatomy

### `account/account` (`AccountScreen.tsx`)

`<Screen background="bgPage" withTabBar safeTop={false} onScroll overlay={<NeedHelpButton collapsed={scrolled} />}>`; page `.page` (sections 12 apart, gutter 15), each block wrapped in `motion.div {...enter(i)}`.

| # | Block | Kit | Spec |
|---|---|---|---|
| 0 | Status cover | `.statusCover` | covers the status-bar inset over `--nk-color-bg-page` |
| 1 | Profile card | `ProfileCard` → avatar (initials; noon One gradient for members), "Hala {firstName}" (`--nk-type-acct-profile-name`), email (`--nk-type-acct-profile-email`), `EditRing percent={profileCompletion}` | whole row → `account/editProfile`; no press visual (`scale={1}`) |
| 1b | noon One strip | `NoonOneStrip` (inside `ProfileCard`): logo Lottie 48×36, title slides from −20 at 500ms | non-member "Unlimited free delivery" + "Start Trial" (`trialEligible`) / "Join Now"; member "⃀ N saved & still going!" or "Free delivery, yours to enjoy!" |
| 2 | Action cards | `ActionCards` → two `ActionCard`s "My Orders" / "My Wishlist" | 128 high, r12, no subtitle; up to 4 tiles 48×68 overlapping 10, product photos (orders products, `useDemoStore().wishlist`) else master default icons; `?orders=none` / `?wishlist=none` force the icons |
| 3 | noon Credits | `Pressable .creditsRow` → `AccountIconImg credits`, "noon Credits", pill `currency` + `formatPrice(user.credits)` | toast |
| 4 | Account menu | `MenuGroup items={accountSection}` + `LanguageRow` (`LanguageSwitcher`, 126×40 pill, slider 250ms) + `CountryRow` (flag 27×17) | Addresses (modal) · Manage cards · Returns · Warranty claims (toast) · Language · Country |
| 5 | Settings menu | `MenuGroup items={settingsSection}` | Preferences (sheet) · Notifications (sheet) |
| 6 | Security menu | `MenuGroup items={securitySection}` + Sign out `AccountSectionItem` | Account security (sheet) · Sign out (sheet) |
| 7 | Footer | `AccountFooter` (inside an `AccountSection`) | Policies (sheet) · Sell on noon (toast); 4 social buttons (toasts); version + copyright |
| — | Need help | `NeedHelpButton` overlay | folds to its icon once `scrollY > 24`; toast |

`AccountSection` = white r14 card, margin 15, children split by a centred 93% `DottedDivider`. `AccountSectionItem` = row 18/16 padding, before-slot 20 icon, title 15/18 500, optional subtitle / `after` (chevron by default); a row with an inline control is a `div`, not a button.

### Inner pages

- **Edit profile**: custom header (back `Pressable`), floating-label name fields (required error when cleared), phone row (toast: OTP lives in the auth flow), birthday row (→ `account/birthday`, locked when already set), chips for gender / tourist / nationality (4 quick tiles + View all → `account/nationality`) / diet, % badge (`completionFor`), Save (dark once dirty) → `profile`, `profileCompletion` + toast.
- **Manage devices**: `SecurityScreenHeader` (36 round back, 16/bold title) on `bgSubtle`; device rows (`mockDevices`) → `account/signOut { kind, deviceId, title, description }`; "Sign out of all other devices" → `account/signOut { kind: 'all' }`; rows fade out and re-flow.
- **Change password**: `Header back`, "Change Password" 22/bold, three 45px outlined inputs with floating labels, `passwordValidations` checklist, SUBMIT → required / invalid / mismatch errors, or `nav.back` + toast `tone: 'success'`.
- **Deletion** (modal): `Header back={false}` + close `IconButton`; reason button → `account/deletionReason`; agreement checkbox; DELETE → `nav.reset('account/signedOut')` + toast.
- **Sheets** render bare content in `SheetBody` (floating `#F9F9FB` r16 card, master `AddressV2FloatingOverlay`) and end in `SheetButtons` (Cancel + confirm with `Spinner` when `loading`).

### `account/signedOut` (`SignedOutScreen.tsx`)

Hero (`accountTokens.heroHeight` + `--nk-inset-top`, `accountTokens.heroBlue`, two bubbles), `signedOutSlides` auto-advancing and draggable (|offset| > 50), floating emoji, width-animated dots (250ms); `Button variant="dark" size="lg" block` "Login/Sign up" → `nav.reset('account/account')`; `MenuGroup` with only Language + Country; `AccountFooter`.

## Navigation

| From | Action |
|---|---|
| Tab bar | `switchTab('account')` → `account/account` |
| Profile row, edit ring | `nav.push('account/editProfile')` |
| noon One strip | non-member `nav.push('noonone/landing', { source: '/account' })`; member `nav.push('membership/manage')` |
| My Orders / My Wishlist | `nav.push('orders/list')` / `nav.push('wishlist/wishlist')` |
| Menu rows (`useOpenMenuItem`) | `nav.push(route, {}, { presentation })` — `address/select` (modal), `cards/cards`, `returns/history`, `account/preferences` (sheet), `account/notifications` (sheet), `account/security` (sheet); `toast` rows → `nav.toast` |
| Language switcher | after the slider lands: `nav.push('account/changeLanguage', { language }, { presentation: 'modal', transition: 'fade' })` |
| Country row | `nav.sheet('account/country')` → pick: `nav.back()` then `nav.push('account/changeCountry', { country }, { presentation: 'modal', transition: 'fade' })` |
| Lottie screens | on complete: `setAccountState({ language \| country })`, `nav.back()`, toast |
| Security sheet rows | `nav.back()` then `nav.push(route, {}, { presentation })` → `account/changePassword`, `account/manageDevices`, `account/deletion` (modal) |
| Sign out (hub) | `nav.sheet('account/signOut')` → Yes: `nav.back()` then `nav.reset('account/signedOut')` |
| Sign out (device / all) | `nav.back()`, `setAccountState` devices filtered, toast |
| Edit profile pickers | `nav.sheet('account/birthday')`, `nav.sheet('account/nationality')` → write `draft`, `nav.back()` |
| Deletion | `nav.sheet('account/deletionReason')`; DELETE → `nav.reset('account/signedOut')` |
| Footer Policies | `nav.sheet('account/policies')` → row: `nav.back()` + toast |
| Signed out Login/Sign up | `nav.reset('account/account')` |

Entering the hub from other flows: every account-area flow sets `parent: 'account/account'` (orders, returns, address, cards, noonone, membership).

## State

| Where | What |
|---|---|
| `src/flows/account/store.ts` (`createStore<AccountState>`) | `country` (AE), `language` (en), `haptics`, `notificationLanguage`, `marketing` (email / sms / whatsapp), `profile`, `profileCompletion` (72), `devices` (`mockDevices`), `draft` (edit-profile form shared with birthday / nationality sheets; null when closed), `deletionReason` |
| `src/kit/membership.ts` | `useIsNoonOneMember` (strip variant, avatar), `useMembership((s) => s.savings)`, `useMembershipEligibility((s) => s.trialEligible)` |
| `src/kit/DemoStore.tsx` | `useDemoStore().wishlist` → wishlist tiles |
| Local `useState` | hub `scrolled`; signed-out slide index; switcher `selected`; sheet loaders |

"Signed in" is not stored: Login/Sign up and sign out are `nav.reset` between the two tab roots (*the kit has no auth state*).

## States

| State | How it opens | Status |
|---|---|---|
| Signed in / signed out | `account/account` / `account/signedOut` | exists |
| noon One member vs non-member, trial-eligible | `useMembership` state (set it from the noonone / membership flows or `membershipActions.demo`) | exists (no URL param on the account route) |
| Empty action-card tiles | `?orders=none`, `?wishlist=none` | exists |
| Profile complete (ring → plain button) | `profileCompletion >= 100` after Save | exists |
| Security loading | 700ms skeleton in `account/security` | exists |
| Notifications loading | loader in `account/notifications` | exists |
| No other devices | after "Sign out of all other devices" | exists (inline) |
| Form errors | edit profile required names; change password required / invalid / mismatch | exists |
| Hub loading (master hides the noon One strip while loading) | — | **does not exist** |
| Hub error | — | **does not exist** |
| LiveActivity / CMS banners | — | **render nothing** (server-driven, empty for the demo customer) |
| Warranty claims, phone OTP, sell on noon, social links | toasts | **not ported** |

## Data

- `src/flows/account/data.ts`: `MenuItem { id, title, icon, route?, presentation?, toast? }`, `accountSection`, `settingsSection`, `securitySection`, `profileCompletion`, `footerCopy`, `signedOutSlides`, `supportedCountries`, `countryFlags`, `languages`, `copy` (every inner screen's copy), `dietaryPreferences`, `nationalities`, `ProfileValues`, `Device` / `mockDevices`, `marketingPreferences`, `deactivationConfig`, `passwordValidations`, `AccountState` / `initialAccountState`.
- User: `user` from `src/data` (`firstName`, `lastName`, `email`, `phone`, `credits`).
- Icons: `AccountIconImg` (`src/flows/account/icons.tsx`, master SVGs in `src/assets/icons/noon-account-*.svg`); flags and socials in `src/assets/account/`; noon One logo Lottie `src/assets/noonone/entry/noon-account-noon-one-logo.lottie`.
- Prices (credits, savings): `currency` + `formatPrice`; never "AED".

## Design sources

| Area | Source | Recorded |
|---|---|---|
| Hub top: profile card, edit ring, noon One strip, action cards | bappzaar master `ba159e2038182a15f0207ac226e8e9c906a1b042`, `marketplaces/noon/components/NoonAccount/*` | 2026-10-12 (`MAPPING.md`) |
| Credits, menus, footer, sheets, inner screens | bappzaar paths in each `ScreenDef.source` (`NoonAccountInnerScreenContent/*`, `NoonAccountSecuritySettingsManageAllDevicesScreen`, `features/auth/login/screens/PasswordEditScreen`, `NoonAccountDeletionScreen`) | not re-verified this branch |
| Need-help pill fold | Accounts Figma `8924:67388` (comment in `AccountScreen.tsx`) | — |
| Action-card height | Figma `8886:66691` superseded by master (128 high) | `MAPPING.md` §3 |

Truth is `bappzaar` for every screen (inferred from `source`); no `verified` date is set.
<!-- external: marketplaces/noon/components/NoonAccount/*, features/auth/login/screens/PasswordEditScreen -->

## Motion

| Moment | Kit |
|---|---|
| Hub sections | `enter(i)`: spring mass 1 / damping 15 / stiffness 120, opacity + y 12, 50ms × i (kit addition; master has none) |
| Edit ring | `EditRing` timeline: 1100ms pencil out (back-in 2), 1400ms arc 0 → pct over 1200ms (`easing.out`), 3400ms number out + pencil back (`easing.backOut`); arc stays |
| noon One strip | `slide(0.5, −20)`: spring damping 14 / stiffness 160 / mass 0.8, opacity 300ms; CTA −15 at 500ms, chevron at 530ms; logo Lottie plays once |
| Edit-ring press | `whileTap={{ opacity: 0.7 }}`; cards and profile row no feedback; menu rows `Pressable scale={0.98}` |
| Language switcher | slider `insetInlineStart` 250ms `easing.out`, then `fade` modal |
| Need help | `NeedHelpButton collapsed` fold on scroll |
| Sheets / modals | `presentation: 'sheet'` (`spring.sheet`); Lottie screens `modal` + `fade` |
| Signed out | slide cross-fade 0.3s, dots width 0.25s, emoji float 3s loop |
| Preferences clear cache | list fades out; confirmation header from top, buttons from bottom |

## Acceptance

- [ ] Routes registered; `/account`, `/edit-profile`, `/account-security`, `/notifications` open; `check:routes` clean.
- [ ] New menu rows are `MenuItem` data; every row navigates, opens its sheet / modal, or toasts.
- [ ] Hub: 12 between sections, 15 gutter, profile card r16, action cards 128 high with ≤ 4 tiles, dotted dividers in menu cards, tab bar visible, content clears it (`withTabBar`).
- [ ] noon One strip switches on `useIsNoonOneMember()`; non-member → `noonone/landing { source: '/account' }`, member → `membership/manage`.
- [ ] Account state only in `src/flows/account/store.ts`; membership and wishlist read from the kit stores.
- [ ] New account-area flows set `parent: 'account/account'`.
- [ ] Tokens only (`lint:tokens` 0 for `src/flows/account`); new master values are `acct*` / `account*` tokens with a `MAPPING.md` row.
- [ ] Screenshots read for the hub (top + scrolled, member and non-member), signed out, edit profile and every sheet.
