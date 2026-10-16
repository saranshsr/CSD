---
name: account
description: Build or restyle the noon account hub and its inner screens with the noon flow kit — the profile card with the completion ring and noon One strip, My Orders / My Wishlist action cards, noon Credits row, menu groups (addresses, cards, returns, language switcher, country, preferences, notifications, account security, sign out), footer, and the screens and sheets behind them (edit profile, birthday and nationality pickers, account security, manage devices, change password, account deletion, notifications, preferences, policies, country / language change, sign out, signed-out state). Use when someone asks for an account, profile or settings page, a new menu row or settings sheet, edit profile, security or device management, sign in / sign out states, a language or country switch, or a new account-area page such as refer a friend or loyalty entry. Builds on noon-ui.
---

# Account

Builds the noon account hub and anything reached from its menu. Load `../noon-ui/SKILL.md` first if it isn't loaded: its workflow, house rules and design-system references apply here unchanged. This skill adds the account specification and the checks specific to it.

For a new screen, a redesign or an open-ended idea, run the research-first design workflow before building: `../noon-ui/references/design-workflow.md` (size the request, research the repo and Mobbin per `../noon-ui/references/research.md`, clarify only blocking gaps, write the design direction, build with `../noon-ui/references/component-checklist.md`, validate). Its rules apply here unchanged; this skill's `spec.md` is the starting point for the design direction, and a port from bappzaar or Figma stays analyse → map → implement.

## Sources

| Source | Where |
|---|---|
| Brain card (read first) | `.claude/resources/brain/flows/account.md` — generated: every screen with its module, components, tokens, motion, nav in / out, tests and the spec / brief line ranges that describe it; `npm run brain -- context "<request>"` for the reading list, `npm run brain -- impact <entity>` before changing shared code |
| Branch brief | `.claude/resources/flows/account.md` — screens, state, components, "master beats Figma" corrections |
| Flow specification | `spec.md` (screens, anatomy, menu data, navigation, state, motion, states, acceptance) |
| Behaviour + look | bappzaar master `ba159e20381` (2026-10-12): `marketplaces/noon/screens/NoonAccountScreen` and `marketplaces/noon/components/NoonAccount/*`, mapped property by property in `src/flows/account/MAPPING.md` (profile card, edit ring, noon One strip, action cards) |
| Current implementation | `src/flows/account/` — `index.ts`, `AccountScreen.tsx`, the inner `*Screen.tsx` / `*Sheet.tsx`, `components/`, `data.ts` (`accountSection`, `settingsSection`, `securitySection`, `copy`), `store.ts`, `icons.tsx`, `tokens.ts` |
| Cross-flow state | `src/kit/membership.ts` (`useIsNoonOneMember`, `useMembership`, `useMembershipEligibility`), `src/kit/DemoStore.tsx` (`wishlist`) |
| World-class bar | `.claude/resources/references/account-settings.md` + `.claude/resources/references/onboarding-signin.md` — the strongest screens from the reference set (Mobbin-linked), what makes them great, how to build it with noon; read before designing, then pass `../noon-ui/references/craft-rubric.md` against them before done |
| Design system | `../noon-ui/references/tokens.md`, `components.md`, `motion.md`, `screen-recipes.md`, `flows.md` (account catalogue entry and the "Account / profile" blueprint) |

## Steps

1. **Pick the target** (say it in one line):
   - *New menu row*: one `MenuItem` in `accountSection` / `settingsSection` / `securitySection` (`src/flows/account/data.ts`) with `route` + `presentation` or `toast`. The row is rendered by `MenuGroup`; no screen code changes.
   - *New inner page or sheet* (refer a friend, loyalty, warranty claims): a new `ScreenDef` in `src/flows/account/index.ts`, or a new flow with `parent: 'account/account'` when it has 2+ screens of its own (noon-ui workflow step 4).
   - *Restyle a hub block*: only when asked; the hub top is a 1:1 master port (`MAPPING.md`).
2. **Read** `spec.md`, the brief and `MAPPING.md`, then `AccountScreen.tsx`, `components/AccountSection.tsx` (`AccountSection`, `AccountSectionItem`, `SheetButtons`, `SheetBody`), `components/MenuGroup.tsx` and the closest inner screen or sheet.
3. **Plan** with the noon-ui workflow (step 3). Inner pages are `<Screen header={<Header … />}>` pushed screens; settings live in sheets built on `SheetBody` + `SheetButtons`.
4. **Build** from the anatomy in `spec.md`; copy goes in `copy` (`data.ts`), icons through `AccountIconImg` (`icons.tsx`) or `OriginIcon`.
5. **Tokens**: master values with no central token go in `src/flows/account/tokens.ts` (`accountTokens`, `accountFlowTokens` → `--nk-type-acct-*`, `--nk-layout-acct-*`, `--nk-radius-acct-*`), with a `MAPPING.md` row.
6. **Motion**: the page stagger `enter(i)` and the existing sheet / modal transitions (`spec.md` → Motion). No new springs.
7. **Register**: `title`, `notes`, `source` (bappzaar path at master, or `reference: …`); add a page URL in `src/kit/routes.ts` only for pages users would deep-link.
8. **Validate**, below.

## Rules specific to account

- **The hub is a master port.** Press feedback is opacity 0.7 or none (not scale) where master has it so; the action cards have no subtitle and at most 4 tiles; LiveActivity and CMS banners render nothing. Don't reintroduce the removed Figma fan or its tokens (brief → "Master beats Figma").
- **Menu rows are data.** Add rows to the section arrays; `useOpenMenuItem` opens `route` with its `presentation` or shows `toast`. Never hand-place a row in `AccountScreen.tsx` unless it has inline controls (`LanguageRow`, `CountryRow`, Sign out).
- **Account state stays in `src/flows/account/store.ts`** (`useAccountState`, `setAccountState`); the edit-profile form shares `draft` with the birthday and nationality sheets. noon One status is read from `src/kit/membership.ts`, wishlist from `useDemoStore()`; never copy them into the account store.
- **noon One strip routing**: non-members → `noonone/landing { source: '/account' }`, members → `membership/manage` (a documented kit exception; master sends both to the landing). Use `/noon-one` for anything inside those flows.
- **Account-area flows** (orders, returns, address, cards, noonone, membership, and new ones like loyalty) set `parent: 'account/account'` so Back works when opened directly.
- Tab roots are only `account` and `signedOut` (`tabBar.screens`); a new inner screen is pushed, never a tab root.

## Validate

```bash
npm run typecheck && npm run lint:tokens -- -v src/flows/account
npm run check:routes
node .claude/skills/noon-ui/scripts/snap.mjs account                       # every account screen and sheet
node scripts/shot.mjs account/account /tmp/account-mid.png --scroll 700
node scripts/shot.mjs account/account /tmp/account-noorders.png            # then /account?orders=none&wishlist=none by URL
```

Read every PNG against `spec.md` → Acceptance and the master values in `MAPPING.md`: 12 between sections, 15 gutter, profile card + ring + noon One strip, 128-high action cards with 48×68 tiles, menu rows with dotted dividers, floating sheets. Then run `npm run skill:check` if you changed components, tokens or screens.
