# account: flow brief

Read with `resources/screens.md` and `src/flows/account/MAPPING.md`. The source is bappzaar master `ba159e20381` (NoonAccountScreen + `NA/*`), so truth is `bappzaar` for every screen. This brief reflects the branch as of 2026-10-13. The top section was re-matched to master 1:1 on this branch.

## Screens

- **Tab roots**: `account/account` (`/account`) and `account/signedOut`.
- **Screens**: `account/editProfile` (`/edit-profile`), `account/manageDevices`, `account/changePassword`.
- **Sheets**:
  - `account/birthday`, `account/nationality` (stand-ins for the master screens)
  - `account/security` (`/account-security`), `account/notifications` (`/notifications`)
  - `account/preferences`, `account/policies`, `account/country`
  - `account/deletionReason`, `account/signOut`
- **Modals**: `account/deletion`, and the Lottie screens `account/changeCountry` and `account/changeLanguage` (modal + fade).

## State

- **Flow-local** `createStore` in `src/flows/account/store.ts` (`useAccountState`, `setAccountState`). It holds:
  - country, language, haptics, notificationLanguage, marketing
  - profile, profileCompletion, devices
  - `draft`: the edit-profile form, shared with the birthday and nationality sheets
  - deletionReason
- **Cross-flow**:
  - `useDemoStore().wishlist` feeds the wishlist tiles in `ActionCards`.
  - `ProfileCard` reads `useIsNoonOneMember`, `useMembership` (savings) and `useMembershipEligibility` (trial) from `src/kit/membership.ts`.

## Components (`src/flows/account/components/`)

- `ProfileCard({ noonOne? })` + `NoonOneStrip`. The strip sends members to `membership/manage` and non-members to `noonone/landing` with `{ source: '/account' }`. Sending members to manage is a kit exception: master sends both to the VIP landing.
- `EditRing({ percent, delay = 1100 })`. Its timeline:
  - 1100 ms: the pencil goes out (back-in);
  - 1400 ms: the arc draws from 0 to pct over 1200 ms, out-cubic;
  - 3400 ms: the number goes out and the pencil comes back.

  The arc stays at pct. At ≥100 % the ring renders as a plain button.
- `ActionCards`: My Orders and My Wishlist cards.
  - Figma 8886:66691, 128 high, no subtitle.
  - At most 4 tiles of 48×68, with master's SVG icons.
  - They push `orders/list` / `wishlist/wishlist`.
  - Preview params: `?orders=none` and `?wishlist=none`. The visual reference `account-action-cards-empty` uses these; see `resources/tooling.md`.
- `MenuGroup` + `useOpenMenuItem`, `LanguageSwitcher`, `CountryRow`, `AccountSection`, `SheetButtons`, `AccountFooter`.

## Master beats Figma here (already corrected)

- Press feedback is opacity 0.7, not scale. The cards have no press feedback.
- The pencil icon is 18, not 16.
- The 5-tile fan, the Figma line art and the tokens `acctTileFill*` / `acctWishBadge` were removed. Don't reintroduce them.
- LiveActivity and CMS banners render nothing (they are server-driven).
- The page-wide 50 ms stagger is a kit addition.
