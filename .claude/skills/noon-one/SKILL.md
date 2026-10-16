---
name: noon-one
description: Build or restyle the noon One membership acquisition journey with the noon flow kit — the noon One landing (non-member CMS modules and member overview), the sticky Start free trial footer, plan select (tiers, monthly / annual, bundles), plan details and trial guide sheets, subscription payment (saved card, CVV, new card, Apple Pay, mobile pay), offers and vouchers, partner offers, the Yango bundle, family plans and invite acceptance, the success animation, and the noon One entry points in account, cart, checkout, order confirmation, PDP and orders. Use when someone asks for a noon One or VIP landing, a membership sign-up, subscription plans, a free trial flow, a subscribe or payment screen for a membership, a noon One upsell or nudge, or the member vs non-member state of a page. Managing an existing membership (manage, change plan, cancel, family seats, referrals) is the membership flow via noon-ui. Builds on noon-ui.
---

# noon One

Builds the noon One subscribe journey (flow `noonone`) and the entry points that lead into it. Load `../noon-ui/SKILL.md` first if it isn't loaded: its workflow, house rules and design-system references apply here unchanged. This skill adds the journey specification and the checks specific to it.

For a new screen, a redesign or an open-ended idea, run the research-first design workflow before building: `../noon-ui/references/design-workflow.md` (size the request, research the repo and Mobbin per `../noon-ui/references/research.md`, clarify only blocking gaps, write the design direction, build with `../noon-ui/references/component-checklist.md`, validate). Its rules apply here unchanged; this skill's `spec.md` is the starting point for the design direction, and a port from bappzaar or Figma stays analyse → map → implement.

## Sources

| Source | Where |
|---|---|
| Brain card (read first) | `.claude/resources/brain/flows/noonone.md` and `.claude/resources/brain/flows/membership.md` — generated: every screen with its module, components, tokens, motion, nav in / out, tests and the spec / brief line ranges that describe it; `npm run brain -- context "<request>"` for the reading list, `npm run brain -- impact <entity>` before changing shared code |
| Branch brief | `.claude/resources/flows/other-flows.md` → "noonone (acquisition)" and "membership (management)"; generated route index `.claude/resources/screens.md` → "noonone · noon One" |
| Flow specification | `spec.md` (screens, landing anatomy member / non-member, plans, payment, overlays, navigation, state, states, data, motion, acceptance) |
| Mapping | `src/flows/noonone/MAPPING.md` — bappzaar `origin/master` d481712 (2026-10-10), feature root `features/vip`; FeatureFlags table, routes and deep links, shared overlay chrome, per-area style tables, entry-point table, follow-ups |
| Figma | Non-member landing only: All flows `Af34gfmhQ1D0wstXUEHSIF` · `24:2604` (MAPPING.md → "Non-member landing"; look = Figma, behaviour = bappzaar). Sticky footer from a prod screenshot of 2026-10-13. Everything else is bappzaar-only |
| Current implementation | `src/flows/noonone/` — `index.ts`, `screens.{landing,plans,payment,offers,entry}.ts`, `screens/*.tsx`, `components/{landing,plans,payment,offers,entry}/`, `components/VIPOverlay.tsx`, `components/VIPButton.tsx`, `store.ts`, `data*.ts`, `tokens.ts`, `transitions.ts` |
| Membership state | `src/kit/membership.ts` — `membershipStore`, `useIsNoonOneMember`, `useMembership`, `useMembershipEligibility`, `noonOneJourneyActions` |
| Management (not this skill) | `src/flows/membership/` (`membership/manage` and its plans / cancel / family / perks areas, `MAPPING.md`); catalogue in `../noon-ui/references/flows.md` → "membership" |
| World-class bar | `.claude/resources/references/membership-subscription.md` + `.claude/resources/references/bottom-sheets.md` — the strongest screens from the reference set (Mobbin-linked), what makes them great, how to build it with noon; read before designing, then pass `../noon-ui/references/craft-rubric.md` against them before done |
| Design system | `../noon-ui/references/tokens.md`, `components.md`, `motion.md`, `screen-recipes.md`, `flows.md` (noonone catalogue entry, "Membership / subscription" blueprint) |

## Steps

Follow the noon-ui workflow (`../noon-ui/SKILL.md` → Workflow, steps 1–9); the noon One specifics per step:

1. **Pick the target** (say it in one line):
   - *A new journey screen or overlay* (a new offer type, a new plan sheet): a new `ScreenDef` in the matching `screens.<area>.ts`, component in `screens/`, data in `data.<area>.ts`, tokens in `tokens.ts`. Default.
   - *A landing module*: a new `NpModule` type in `data.landing.ts` + a renderer case in `NpModuleRenderer` (`components/landing/npModules.tsx`), placed in `npLanding.modules`. Order stays data-only.
   - *A new entry point* in another flow (a nudge, a banner, a toggle): build it in that flow, gate it with `useIsNoonOneMember()`, and push `noonone/landing` with `{ source: '/<page>' }` (or `noonone/plans` for plan-led nudges).
   - *Managing a membership*: stop and use the membership flow through `/noon-ui`; don't add management screens here.
2. **Read** `spec.md`, then the matching section of `src/flows/noonone/MAPPING.md`, then the screen and components you will reuse.
3. **Plan** each screen per noon-ui step 3; for an overlay decide sheet (`VIPOverlay`), floating, popup or legacy overlay (`components/entry/LegacyOverlay.tsx`, `components/payment/LegacyOverlay.tsx`) by what bappzaar uses.
4. **Build** from the anatomy tables in `spec.md`. Buttons are `VIPButton` / `SubscriptionButton` (`components/plans/parts.tsx`) inside the journey, kit `Button` elsewhere; rich server copy through `HtmlText`; prices with `CURRENCY` from `src/flows/noonone/data.ts` (the dirham sign).
5. **Tokens**: values with no central token go in `src/flows/noonone/tokens.ts` (`--nk-*-vip-*` flow tokens, one file for all areas, see MAPPING.md "Shared follow-ups"), with the bappzaar style or Figma node in a comment.
6. **Motion**: overlays through `VIPOverlay` and the `noonone-overlay` transition; quick pay and success through `completeSubscription`; see `spec.md` → Motion.
7. **Register** with `title`, `notes`, `source` (`features/vip/...` path, or `Figma Af34gfmhQ1D0wstXUEHSIF · <node>` with `truth: 'mixed'`), and a MAPPING.md row.
8. **Validate**, below.

## Rules specific to noon One

- **One membership store.** Membership status, plan, renewal, family and card live only in `src/kit/membership.ts`. Read with `useIsNoonOneMember()` / `useMembership()`; write only through `noonOneJourneyActions.subscribe` (via `completeSubscription` in `src/flows/noonone/store.ts`). Never copy membership into flow state or a page-local flag. `noononeStore` is journey state only (selected plan, payment method, added cards, trial-guide flag, voucher, pending success).
- **Acquisition here, management there.** Landing, plans, payment, offers, bundle, invite and success are `noonone`; manage, change plan, invoices, cancel and retention, family seats, referrals and partner perks are `membership` (entry `membership/manage`). The member landing's "Manage your membership" and the account strip for members push `membership/manage`.
- **Every subscribe ends the same way**: `completeSubscription(nav, plan)` → membership store written → `pendingSuccess` queued → `popToLanding` → the landing plays `TransitionAnim` and switches to the member view. Don't navigate to a separate success page or skip the pop.
- **Overlays** are `{ presentation: 'modal', transition: 'noonone-overlay' }` and draw their own chrome with `VIPOverlay` (sheet, `floating` or `popup`); close with the overlay's `close(then)` so the sheet animates out before the next push. Never use `presentation: 'sheet'` for a VIP overlay (kit sheets have fixed white r24 chrome).
- **Entry points flip by membership.** Every entry point renders its member state from `useIsNoonOneMember()` (hidden, savings, or a link to manage). A new entry point must work for both states and for `trialEligible` true / false.
- **Preserve the port.** The live variants follow bappzaar's default FeatureFlags (plans V3, bundle V2, savings widget V1, no partner popup; MAPPING.md → "Live variants"). Don't switch a flagged variant unless asked; keep routes, screen ids and `ScreenDef.path` aliases stable (deep links use them).
- **Copy**: `vip-en.json` keys where master has them, demo server copy in `data.*.ts`; prices with `CURRENCY`, never the text "AED" in new UI.

## Validate

```bash
npm run typecheck && npm run lint:tokens -- -v src/flows/noonone
npm run check:routes
node .claude/skills/noon-ui/scripts/snap.mjs noonone                 # every journey screen and overlay
node scripts/shot.mjs noonone/landing /tmp/one-np.png --scroll 900    # non-member landing, scrolled
node scripts/shot.mjs noonone/success /tmp/one-member.png --wait 5000 # after the success animation: member landing
```

Read every PNG against `spec.md` → Acceptance and, for the non-member landing, against Figma `24:2604`. Check an entry point in both states: open it as a non-member, subscribe from the landing, then reopen it. Then run `npm run skill:check` if you changed components, tokens or screens.
