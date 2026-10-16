---
name: orders
description: Build or restyle noon post-order screens with the noon flow kit — the My orders list (search pill, filter chips, active order card with rider actions and delivery PIN, order history cards with refund / warranty chips and star rating), order details and tracking (image stack, status line and ETA, delivery-window pill with the V1–V4 heat variants, stepper tracker, rider row, Delivering to, order summary, bill summary with the noon One strip), the All updates timeline sheet and cancel items. Use when someone asks for an orders page, order history, order tracking or order status, a delivery tracker or stepper, delivery PIN, a cancelled / delivered / returned / exchanged order state, cancel items, or to "update orders to match this screenshot". Builds on noon-ui.
---

# Orders

Builds the noon orders list, order tracking and cancel screens, and any change to them. Load `../noon-ui/SKILL.md` first if it isn't loaded: its workflow, house rules and design-system references apply here unchanged. This skill adds the orders specification and the checks specific to it.

For a new screen, a redesign or an open-ended idea, run the research-first design workflow before building: `../noon-ui/references/design-workflow.md` (size the request, research the repo and Mobbin per `../noon-ui/references/research.md`, clarify only blocking gaps, write the design direction, build with `../noon-ui/references/component-checklist.md`, validate). Its rules apply here unchanged; this skill's `spec.md` is the starting point for the design direction, and a port from bappzaar or Figma stays analyse → map → implement.

## Sources

| Source | Where |
|---|---|
| Brain card (read first) | `.claude/resources/brain/flows/orders.md` — generated: every screen with its module, components, tokens, motion, nav in / out, tests and the spec / brief line ranges that describe it; `npm run brain -- context "<request>"` for the reading list, `npm run brain -- impact <entity>` before changing shared code |
| Branch brief | `.claude/resources/flows/orders.md` — stable order ids, `trackingFor`, components, motion, haptics |
| Flow specification | `spec.md` (screens, anatomy, per-state content, navigation, data, motion, states, acceptance) |
| Visual reference | PDS one-flows `pds-noon-as.vercel.app/one-flows?screen=orderlisting` (list + details V1–V4), measured with Playwright on 2026-10-12; every value in `src/flows/orders/MAPPING.md` → "PDS reference" |
| Behaviour reference | bappzaar master `features/o2d/screens/O2DOrdersV2Screen` (pinned list header, filter chips), `O2DOrderTrackingScreen` (per-state content, action codes), `O2DOrderCancelItemsScreen` (cancel), `features/o2d/components/NoonOrderDeliveryProgressOverlay` (updates sheet) — tables in `MAPPING.md` → "States", "List header and filter pills" |
| Current implementation | `src/flows/orders/` — `index.ts`, `OrdersListScreen.tsx`, `OrderTrackingScreen.tsx` (`useOrderAction`, `RiderBlock`, `DeliveringTo`), `UpdatesSheet.tsx`, `OrderCancelScreen.tsx`, `components/`, `data.ts`, `tokens.ts`, `motion.ts`, `assets.ts` |
| World-class bar | `.claude/resources/references/order-tracking.md` + `.claude/resources/references/empty-error-loading.md` — the strongest screens from the reference set (Mobbin-linked), what makes them great, how to build it with noon; read before designing, then pass `../noon-ui/references/craft-rubric.md` against them before done |
| Design system | `../noon-ui/references/tokens.md`, `components.md`, `motion.md`, `screen-recipes.md`, `flows.md` (orders catalogue entry and the "Orders & tracking" blueprint) |

## Steps

1. **Pick the target** (say it in one line):
   - *New order state*: a new `status` + a `case` in `trackingFor` (`src/flows/orders/data.ts`) and a demo order with a new id. Default, because list and tracking are measured ports.
   - *Variant of the tracking hero*: a new `variant` value through `heroVariant` and `WindowPill`, opened by `?variant=`.
   - *Restyle from a reference*: only when the user asks to change the orders pages; follow `../noon-ui/references/from-reference.md`, write the mapping rows in `src/flows/orders/MAPPING.md` first.
   - *New post-order screen* (invoice, refund details, reschedule): a new `ScreenDef` in `src/flows/orders/index.ts` replacing the toast that stands in for it today (`spec.md` → States).
2. **Read** `spec.md`, the brief, `MAPPING.md` (PDS tables + States), then `OrdersListScreen.tsx`, `OrderTrackingScreen.tsx` and the components you will reuse (`OrderCards`, `StatusHeader`, `Stepper`, `ImageStack`, `WindowPill`, `BillSummary`).
3. **Plan** with the noon-ui workflow (step 3): per screen the sections top to bottom, which `Order` fields each reads and the `nav.*` call for every press.
4. **Build** from the section tables in `spec.md`. Reuse the flow-local components; central pieces are `Screen`, `Header`, `Pressable`, `Button`, `OriginIcon`, `DashedDivider`, `Divider`, `Checkbox`, `NeedHelpButton`, `MarketplaceWordmark`, `MaskIcon`, `ProductImage`.
5. **Tokens**: measured values with no central token go in `src/flows/orders/tokens.ts` (`ordersTokens` for JS values, `ordersFlowTokens` for `--nk-type-orders-*` / colours) with the reference element in a comment, and a row in `MAPPING.md`.
6. **Motion**: only `reveal` / `pressDip` from `src/flows/orders/motion.ts` and the presets they wrap (`spec.md` → Motion). No new springs.
7. **Register**: `title`, `notes` (which `orderId` / `variant` to try), `source` (`reference: pds-noon-as.vercel.app/…` and / or the bappzaar path) and `truth` (`reference` for the list, `mixed` for tracking).
8. **Validate**, below.

## Rules specific to orders

- **Order ids are a contract.** o1 active, o3 delivered (returnable, reviews → bike), o4 delivered (window closed, reviews → iPhone 16 Pro), o9 delivered with Return → `returns/submit`, o7 returned, o8 exchanged (`reviewProduct: 'iphone16'`), o5 cancelled. `returns` and `reviews` depend on them; add orders, never renumber.
- **Per-state content comes from `trackingFor`**: status line, headline tone, timeline kind, message, CTA row, Quick actions, `returnCard` (no bill) and the address title. Never branch on `order.status` inside a section to show a different CTA.
- **Every CTA goes through `useOrderAction`** by its bappzaar action code (`see_all_actions`, `return_initiate`, `view_refund_tracking`, `view_return_details`, `view_return_policy`, `reschedule`, `contact_customer_support`). Unported destinations are toasts; replacing one means a new route, not a new code.
- **No flow store.** Orders are static mock data; filter state is local to the list. Cross-flow calls are `openReview` (reviews store) and `nav.*` to `returns/*` and `noonone/landing`.
- **Haptics only on user gestures** (`tap`, `tick`); mount animations (stepper, heat pill) have none.
- Keep `truth` honest: the list is `reference` (PDS measured), tracking `mixed` (PDS look, bappzaar per-state content), cancel and updates `bappzaar`. When a request contradicts the reference that wins, say so and ask (noon-ui house rules → "Source of truth per screen").

## Validate

```bash
npm run typecheck && npm run lint:tokens -- -v src/flows/orders
npm run check:routes
node .claude/skills/noon-ui/scripts/snap.mjs orders              # every orders screen, sheet included
node scripts/shot.mjs orders/tracking /tmp/track-o7.png          # then ?orderId=o7, o5, o9 and ?variant=2..4 by URL
node scripts/shot.mjs orders/list /tmp/orders-mid.png --scroll 800
```

Read every PNG against `spec.md` → Acceptance and the PDS measurements in `MAPPING.md`: pinned list header turning white with radius on scroll, chip row, card shells and status strips, the tracking hero per variant, stepper, info blocks and bill summary. Then run `npm run skill:check` if you changed components, tokens or screens.
