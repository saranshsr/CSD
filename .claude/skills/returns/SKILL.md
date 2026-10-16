---
name: returns
description: Build or restyle the noon returns experience with the noon flow kit, following bappzaar AFS returns — the returns history (search, year picker, status chips, return cards), recent purchases to return, the step-by-step return submission (reason, photos, resolution, refund method, pickup) with its in-screen overlays, the return details page (success header, tracker, cancel return, NPS feedback, refund summary, policy) and the request summary. Use when someone asks for a returns page, a return request or return reason picker, photo upload for a return, pickup slot selection, refund method, return tracking or return details, a returns empty or error state, or to change how a return starts from an order. Builds on noon-ui.
---

# Returns

Builds the noon returns flow and any change to it. Load `../noon-ui/SKILL.md` first if it isn't loaded: its workflow, house rules and design-system references apply here unchanged. This skill adds the returns specification and the checks specific to it.

For a new screen, a redesign or an open-ended idea, run the research-first design workflow before building: `../noon-ui/references/design-workflow.md` (size the request, research the repo and Mobbin per `../noon-ui/references/research.md`, clarify only blocking gaps, write the design direction, build with `../noon-ui/references/component-checklist.md`, validate). Its rules apply here unchanged; this skill's `spec.md` is the starting point for the design direction, and a port from bappzaar or Figma stays analyse → map → implement.

## Sources

| Source | Where |
|---|---|
| Brain card (read first) | `.claude/resources/brain/flows/returns.md` — generated: every screen with its module, components, tokens, motion, nav in / out, tests and the spec / brief line ranges that describe it; `npm run brain -- context "<request>"` for the reading list, `npm run brain -- impact <entity>` before changing shared code |
| Branch brief | `.claude/resources/flows/other-flows.md` → "returns" (screens, `returnsStore`, in-screen overlays) |
| Flow specification | `spec.md` (screens, anatomy, overlays, navigation, state, states, data, motion, acceptance) |
| Design source | bappzaar **origin/master** `d481712d6d9` (2026-10-10), `features/afs/returns/` (read only, `git -C ~/bappzaar show origin/master:<path>`), mapped value by value in `src/flows/returns/MAPPING.md` (§1 live entry points, §2–§12 per screen, §13 copy keys, §15 server-driven demo data, §16 follow-ups) |
| Current implementation | `src/flows/returns/` — `index.ts`, the five `*Screen.tsx`, `components/` (`AFSBackHeader`, `AFSButton` + `Tap` + `Svg`, `ReturnsOverlay`, `TrackingSteps`, `FeedbackWidget`, `CommentInput`, `SummaryButton`, `ProductDetails`, `Dashed`), `components/sections/Sections.tsx`, `components/overlays/{SubmitOverlays,DetailsOverlays}.tsx`, `store.ts`, `nav.ts`, `data.ts`, `tokens.ts`, `assets.ts` |
| Entry points elsewhere | `src/flows/account/data.ts` (Returns row → `returns/history`), `src/flows/orders/OrderTrackingScreen.tsx` (`useOrderAction`: Return → `returns/submit`, refund / return details → `returns/details`), `src/flows/orders/components/OrderCards.tsx` (Track my refund → `returns/details`) |
| World-class bar | `.claude/resources/references/order-tracking.md` + `.claude/resources/references/bottom-sheets.md` — the strongest screens from the reference set (Mobbin-linked), what makes them great, how to build it with noon; read before designing, then pass `../noon-ui/references/craft-rubric.md` against them before done |
| Design system | `../noon-ui/references/tokens.md`, `components.md`, `motion.md`, `screen-recipes.md`, `flows.md` (returns catalogue entry and Returns blueprint) |

## Steps

1. **Pick the target** (say it in one line):
   - *New returns state or variant*: a new ScreenDef in `src/flows/returns/index.ts` that reuses an existing screen with `defaultParams` (as `?empty=1` / `?error=1` / `success=1` do). Default, because the flow is a 1:1 bappzaar port.
   - *New submission section*: a new code in `sectionOrder` (`data.ts`), a section component in `components/sections/Sections.tsx`, a `footer` case and a `summaryRow` case in `ReturnSubmitScreen.tsx`.
   - *Restyle from a reference*: only when asked; follow `../noon-ui/references/from-reference.md` and keep routes and screen ids.
2. **Read** `spec.md`, then `src/flows/returns/MAPPING.md` for the screen you touch, then the screen file and the components it uses.
3. **Plan** with the noon-ui workflow (`../noon-ui/SKILL.md` → Workflow, step 3): screens, sections, overlays, footer, states and every `nav.*` call.
4. **Build** from the kit pieces in `spec.md`; take overlays from `ReturnsOverlay`, buttons from `AFSButton` / `Tap`, rows from `SummaryButton`, separators from `Dashed`. A new overlay is a component in `components/overlays/` rendered next to `<Screen>` and opened by the screen's local `overlay` state.
5. **Tokens**: values with no kit token go in `src/flows/returns/tokens.ts` (`returnsFlowTokens` → `--nk-color-returns-*`, `--nk-type-returns-*`; motion numbers in `returnsTokens`) with the bappzaar style key in a comment, and a row in `MAPPING.md`.
6. **Motion**: reuse `returnsTokens` (`fadeIn`, `sectionSpring`, `overlaySpring`, `overlayClose`, `pressSpring`, `searchDuration`) and `easing` from `src/motion/presets.ts` (`spec.md` → Motion).
7. **Register**: `ScreenDef` with `title`, `notes` and `source: 'features/afs/returns/<path>'` (house rules in `../noon-ui/SKILL.md`).
8. **Validate**, below.

## Rules specific to returns

- **Order and product ids are shared with orders.** `orderIdFor` (`data.ts`) maps `pds-fridge` → `o9` and everything else → `o3`; `orders/tracking?orderId=o9` pushes `returns/submit { orderId: 'o9', productId: 'pds-fridge' }`. Never renumber o3, o4, o5, o7, o8 or o9 (see `.claude/resources/flows/orders.md`), and resolve products only through `resolveProduct` (whole catalogue, falls back to p5).
- **Returns state lives in `returnsStore`** (`store.ts`): `create`, `cancel`, `rate`, `get`, `reset`, `recordFor`. Submission drafts stay local to `ReturnSubmitScreen`; nothing is written until the last section commits.
- **Overlays are in-screen, not routes.** Every returns sheet is a `ReturnsOverlay` (floating r16 card inset 12 with the handle above it). Don't convert one to `nav.sheet`: the kit sheet can't draw that chrome (`MAPPING.md` §16).
- **Back goes through `popTo`** (`nav.ts`): screens pass `rootKey` (`ownKey(nav)`) forward so details and summary return to the screen that started the return. Keep passing it on every new push inside the flow.
- **Forced states don't touch the store**: `?empty=1` empties only the rendered history list; `?error=1` only swaps in the error view.
- Prices through `currency` / `formatRefund` / `price2` (dirham sign), never "AED".

## Validate

```bash
npm run typecheck && npm run lint:tokens -- -v src/flows/returns
npm run check:routes
node .claude/skills/noon-ui/scripts/snap.mjs returns
node scripts/shot.mjs 'returns/history?empty=1' /tmp/returns-empty.png
node scripts/shot.mjs 'returns/submit?error=1' /tmp/returns-error.png
node scripts/shot.mjs 'returns/details?success=1' /tmp/returns-success.png
```

Read every PNG against `spec.md` → Acceptance and `src/flows/returns/MAPPING.md`: `bgSubtle` page, status gradient strips, `AFSBackHeader` blur, one section at a time in the submission, collapsed edit cards, footer button states. Open the overlays by tapping (they aren't routes). Then run `npm run skill:check` if you changed components, tokens or screens.
