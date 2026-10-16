# Account — source → kit mapping

## Account top (bappzaar master ba159e20381)

Source: `~/bappzaar` `origin/master` @ `ba159e2038182a15f0207ac226e8e9c906a1b042` (2026-10-12), read with `git show`.
Render tree: `NoonAccountScreen` → `NoonAccountSignedInState` (`container { marginTop 12, gap ACCOUNT_SECTION_SPACING = NoonTokens.spacing.s12 }`) →
`NoonAccountProfileHeader` (→ `NoonAccountCircularProgressEdit`, `NoonAccountNoonOne`) · `NoonAccountLiveActivity` · `NoonAccountCmsBanners` (/account-birthday) ·
`Animated.View animatedSections` → `actionCardContainer` (`NoonAccountMyOrdersActionCard`, `NoonAccountMyWishlistActionCard`) → credits, menus, footer (unchanged).

`NA` = `marketplaces/noon/components/NoonAccount`. Colours resolved through `marketplaces/noon/theme/NoonColors.ts`.

### 1 · Profile card — `NA/NoonAccountProfileHeader/{NoonAccountProfileHeader.tsx,styles.ts}` → `components/ProfileCard.tsx`

| property | master value | kit token | status |
|---|---|---|---|
| container | whiteColor() bg, radius 16 (continuous), marginH `$edgeSpacing` 15, overflow hidden; whole card is an RN `Pressable` → `openEditProfile` | `--nk-color-bg-surface`, `.profileCard` 16 / 15 | ✓ |
| press feedback (card) | RN `Pressable` without style fn → none | `Pressable scale={1}` | changed (was 0.99) |
| headerRow | row, centre, paddingH 12, paddingV 18 | `.profileRow` | ✓ |
| avatar (non-member) | 51×51, radius 40, whiteSmoke `#F2F2F2`, border 1 white | `--nk-palette-white-smoke`, `--nk-palette-white` | ✓ |
| initials (non-member) | 24 / 700, blackColor() `#000`, `getNameInitials(fullName).toUpperCase()` | `--nk-type-acct-text24-bold-lh1`, `--nk-palette-black` | ✓ |
| avatar (noon One) | `LinearGradient` [paleYellow `#FFF3C0`, noonOneBannerAmber(0.3)] start {0,1} → end {1,2}, radius 26, no border | `linear-gradient(135deg, paleYellowLegacy 50%, noonOneBannerAmberAlpha30 150%)` (the visible box spans t −0.5…0.5 of that line) | fixed (was 0 % → 100 %) |
| initials (noon One) | 24 / 700 cocoaBrown `#794000` | `accountTokens.avatar.noonOneInk` | ✓ |
| textContainer | flex 1, gap 2, marginH 8 | `.profileText` | ✓ |
| name | 17 / 700, line normal, blueGray900 `#1D2539`, 1 line | `--nk-type-acct-profile-name` (new), `--nk-color-text-primary`, ellipsis | fixed (was `heading` 17/22) |
| email | 12 / 400, line normal, slateGray `#666D85`, 1 line | `--nk-type-acct-profile-email` (new), `--nk-color-text-secondary`, ellipsis | fixed (was `caption` 12/16, wrapped) |
| copy | `noon_account_noon_hala_header_profile` "Hala {{firstName}}" (noon-en.json); email from `state.customer.email` | `Hala ${profile.firstName}`, `user.email` | ✓ |

#### Edit button — `NA/NoonAccountCircularProgressEdit/{…tsx,styles.ts}` → `components/EditRing.tsx`

| property | master value | kit token | status |
|---|---|---|---|
| shown | only once `NoonAccountLiveActivity` reports (`skipProgressAnimation !== undefined`); kit has no live activity → always, never skipped | — | documented |
| circle | 36×36, radius 1000, border 1; idle bg secondaryBackgroundColor `#F9F9FB`, border lightGreyColor `#EAECF0`; active bg warningSubtle `#FFF1E0`, border warningBorder `#FEDBB4` | `--nk-color-bg-subtle`, `--nk-color-border`, `accountTokens.ring.bg/.border` | ✓ |
| arc | r = (36−2)/2 = 17, stroke 2, round cap, from 12 o'clock; colour slateGray `#666D85` → absoluteApricot `#FF9741` with stateProgress | `ring.idle` / `ring.fill` | ✓ |
| icon | `NoonIcons.noonAccountEditProfile` 18×18 (`noon-account-edit-profile.svg`, `#343D54`) | `AccountIconImg name="editProfile" size={18}` | fixed (was 16) |
| counter | 11 / 700 sunsetOrange `#E5641A`, "NN%", ltr | `--nk-type-acct-text11-bold-lh1`, `ring.counter` | ✓ |
| ≥ 100 % / unknown | plain `editButton` (same circle, no arc) | `percent >= 100` branch | added |
| press | `TouchableOpacity activeOpacity 0.7`, hitSlop 30 | `whileTap={{ opacity: 0.7 }}`, `duration.fast` (RN 150 ms) | fixed (was scale 0.96) |
| timeline (animationDelay 1100) | 1100: pencil scale+opacity 1→0, 300 ms `Easing.in(Easing.back(2))`; colours 0→1 300 ms · 1400: arc 0→pct 1200 ms out-cubic, counter 0→pct, number opacity 0→1 150 ms (scale 0.8→1) · 3400: number →0 200 ms, colours →0 400 ms, pencil →1 400 ms `Easing.out(Easing.back(1.5))` · arc **stays** at pct (in slateGray) | `EditRing` keyframes from the same constants; `easing.out`, `easing.backOut`, back-in(2) as a bezier | fixed (was all at 1100, revert at 3100, arc reset to 0) |

### 2 · noon One strip — `NA/NoonAccountNoonOne/*` → `ProfileCard.tsx` `NoonOneStrip`

| property | master value | kit token | status |
|---|---|---|---|
| variant | `loyalty.isNoonOneSubscribed` → `NoonAccountNoonOneSubscribed` : `NoonAccountNoonOneNotSubscribed`; hidden while loading / no `touchpoints.account_v2` | `useIsNoonOneMember()` | ✓ (kit has no loading state) |
| bannerContainer | paleYellow `#FFF3C0` bg, margin 2, paddingV 5, paddingH 12, bottom radii 16, overflow hidden | `--nk-color-noon-one-surface`, `--nk-radius-acct-noon-one` | ✓ |
| gradient | [noonOneBannerPeach `#FEDEA9`, noonOneBannerCream `#FEF8EC`] locations [0,1], start {0,2} → end {0,0} | `linear-gradient(0deg, peach −100%, cream 100%)` | ✓ |
| logo | `noon-account-noon-one-logo.lottie` 48×36, autoPlay, loop false | `src/assets/noonone/entry/noon-account-noon-one-logo.lottie`, `--nk-layout-acct-noon-one-logo-*` | ✓ |
| textContainer | flex 1, gap 2, paddingH 5; slides from ∓20 + fades, delay 500, spring {damping 14, stiffness 160, mass 0.8}, opacity 300 ms | `slide(0.5, ∓20)` | ✓ |
| title (non-member) | `noon_account_noon_one_free_delivery` "Unlimited free delivery", 15 / 700 normal blueGray900 | `--nk-type-acct-noon-one-title` | ✓ |
| after (non-member) | row gap 8; `account_noon_one_start_trial` "Start Trial" if `membership.isEligibleForTrialAcrossPlans` else `account_noon_one_join_now` "Join Now" (src/locale/translations/en.json), 14 / 700; text ∓15 at 500 ms, chevron ∓15 at 530 ms | `--nk-type-acct-noon-one-cta`, `useMembershipEligibility().trialEligible` | ✓ |
| chevron | `noon-account-chevron.svg` 6×11 `#101628`, scaleX −1 in RTL | `src/assets/icons/noon-account-chevron.svg` | ✓ |
| member title | savingsState 'high' → `<Price isCompact>` + `account_noon_one_savings_title` "saved & still going!" (row gap 2); else `account_noon_one_no_savings_title` "Free delivery, yours to enjoy!", 14 / 700 | `.noonOneSavedTitle` | ✓ |
| press | RN `Pressable` (no feedback) → `noon.VIPLandingScreen { source: '/account' }` for both variants | `scale={1}`; non-member → `noonone/landing { source: '/account' }`, member → `membership/manage` | kit exception (members go to the management flow) |

### 3 · Action cards — `NA/NoonAccountActionCard/{NoonAccountActionCard.tsx,styles.ts}`, `NoonAccountMyOrdersActionCard/*`, `NoonAccountMyWishlistActionCard/*` → `components/ActionCards.tsx`

| property | master value | kit token | status |
|---|---|---|---|
| row | `actionCardContainer` row, paddingH 15, gap 12 | `.actionRow` | ✓ |
| card | flex 1, whiteColor bg, border 1 white, radius 12 (continuous), paddingTop 10, paddingH 10, no paddingBottom, overflow hidden; height from content = 1+10+22+16+68+10+1 = **128** | `.actionCard`, `--nk-radius-r12`, `--nk-space-s10` | fixed (was Figma 136h, p12, centred) |
| title | `noon_account_my_orders_title` "My Orders" / `noon_account_my_wishlist_title` "My Wishlist", 16 / 700 / 22 blueGray900 | `--nk-type-acct-action-title` (new) | fixed (was 16/20 −0.16 ls) |
| subtitle | **none on master** | removed | fixed (kit had Figma "1 active" / "3 items saved") |
| imagesContainer | row, centred, paddingTop 16, paddingBottom 10 | `.fan` | fixed |
| tiles | max 4; outer marginH −5 (10 px overlap); wrapper 48×68 (border-box), radius 9, antiFlashWhite `#F2F3F7` bg, border **white** 3 (images) / 2 (default icons); zIndex 4 − index → first tile on top; `IMAGES_ROTATIONS [-4,0,0,0]` only feeds zIndex (no rotation) | `--nk-layout-acct-tile-w/h`, `--nk-radius-acct-tile`, `--nk-palette-anti-flash-white`, `--nk-palette-white` | fixed (was 5-tile 40/50/60 fan) |
| image | `Image` cover 48×68, marginEnd 2, radius 9, + overlay black 0.04 | `ProductImage fit="cover"` + `--nk-palette-black-alpha4` overlay | fixed |
| orders images | `NoonOrderService.getRecentPlacedImages().express`, items with imageUrl/imageKey, first 4; missing slots → defaults | kit `orders` products (active first), first 4 | ✓ (server-driven → mock) |
| orders defaults | [ordersCenter, ordersLeft, ordersRight, wishlistRight] native size, centred | `src/assets/icons/noon-account-{orders-center,orders-left,orders-right,wishlist-right}.svg` | fixed (was Figma line art) |
| wishlist images | WishlistV2 on: `wishlistHomeItems(1, 4)`; else paginated (1, 10); `image_url`s, first 4 | `useDemoStore().wishlist` → products, first 4 | ✓ |
| wishlist defaults | [wishlistLeft, wishlistCenter, wishlistRight, wishlistLeft] | `noon-account-wishlist-{left,center,right}.svg` | fixed |
| press | RN `Pressable` (no visual feedback) + `HapticsFeedback impactLight`; orders → `getOrdersListingScreenId()`, wishlist → `noon.NoonWishlistScreenV2` (flag on) / `noon.NoonWishlistScreen` | `Pressable scale={1}`; `orders/list`, `wishlist/wishlist` | fixed (was scale 0.97) |
| preview params | — | `account/account?orders=none` / `?wishlist=none` show the default icons | kit-only |

### Feature flags / variants

- `FeatureFlags.isWishlistV2Enabled()` — only changes the wishlist fetch + target screen; the kit has one wishlist flow (`wishlist/wishlist`).
- No flag gates the profile header, noon One strip or action cards on master.
- `NoonAccountLiveActivity` / `NoonAccountCmsBanners (/account-birthday)` sit between the profile card and the action cards; both are server-driven and empty for the demo customer, so the kit renders nothing there.
- Page entrance: master has no entrance on these blocks (only `LinearTransition` layout springs on `animatedSections`); the kit keeps its page-wide 50 ms stagger (same spring mass 1 / damping 15 / stiffness 120) for every section — documented kit addition.

### Assets

All already in the kit (no new files): `src/assets/icons/noon-account-{edit-profile,chevron,orders-center,orders-left,orders-right,wishlist-left,wishlist-center,wishlist-right}.svg` (optimised copies of `marketplaces/noon/theme/assets/icons/…`), `src/assets/noonone/entry/noon-account-noon-one-logo.lottie`. Removed the now-unused (uncommitted) Figma line art `src/assets/account/action-cards/*.svg` and the `acctTileFill`, `acctTileFillFront`, `acctWishBadge` flow tokens that only the Figma fan used.
