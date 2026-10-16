---
name: checkout
description: Build or restyle the noon checkout (Checkout 2.0) and its steps with the noon flow kit, following the "🚧 Checkout 2.0" Figma — address header, shipment cards with delivery lanes, delivery instructions, receiver details, Points & Vouchers, Pay With (noon credits toggle, Tabby, Tamara, Apple Pay, saved card + CVV + installments, noon One credit card, cash on delivery), payment summary and the sticky slide-to-pay dock. Use when someone asks for a checkout page or variant, payment methods, delivery options or slots, address / receiver changes, vouchers or loyalty points at checkout, slide to pay, order placing or order confirmation, payment failure, or "a new checkout step". Builds on noon-ui.
---

> **Package note** (noon Flow Kit 0.1.0, built from `.claude/skills/checkout` by `npm run release:build`). Files under `../noon-ui/` (design-system references, `../noon-ui/resources/` with the brain map, flow briefs and screen index) are part of this package. Paths under `src/`, `scripts/`, `visual/` or `.claude/` and `npm run …` commands refer to the noon Flow Kit repo (https://github.com/arnabdebnath07/noon-app-skill): use them inside a checkout of it; anywhere else treat them as reference, ask for what you need, and never invent their contents. Claude Code-only parts (slash commands, the design-guard hook, Claude-specific tools) are listed in `../noon-ui/resources/DISTRIBUTION.md`.

# Checkout

Builds the noon checkout and any step that lives inside it. Load `../noon-ui/SKILL.md` first if it isn't loaded: its workflow, house rules and design-system references apply here unchanged. This skill adds the checkout specification and the checks specific to it.

For a new screen, a redesign or an open-ended idea, run the research-first design workflow before building: `../noon-ui/references/design-workflow.md` (size the request, research the repo and Mobbin per `../noon-ui/references/research.md`, clarify only blocking gaps, write the design direction, build with `../noon-ui/references/component-checklist.md`, validate). Its rules apply here unchanged; this skill's `spec.md` is the starting point for the design direction, and a port from bappzaar or Figma stays analyse → map → implement.

## Sources

| Source | Where |
|---|---|
| Brain card (read first) | `../noon-ui/resources/brain/flows/checkout.md` — generated: every screen with its module, components, tokens, motion, nav in / out, tests and the spec / brief line ranges that describe it; `npm run brain -- context "<request>"` for the reading list, `npm run brain -- impact <entity>` before changing shared code |
| Branch brief | `../noon-ui/resources/flows/checkout.md` — sections, the three stores and `update()`, order placement and failure, gotchas |
| Flow specification | `spec.md` (screens, section order, payment methods, dock, data, navigation, states, acceptance) |
| Figma analysis | `references/figma-cart-checkout.md` — Checkout 2.0, file `zURu7GI7sq77fjdXKrouvo`, frame `14288:183972`: §2.3 anatomy, §5 motion cues, §6 delta, §7 build guidance (shared with Cart 2.0) |
| Node-by-node mapping | `src/flows/checkout/FIGMA-MAPPING.md` (Figma variables → tokens, every section and the dock); bappzaar master port in `src/flows/checkout/MAPPING.md` |
| Current implementation | `src/flows/checkout/` — `CheckoutScreen.tsx` (`ALL_FLOWS_SECTIONS` default, `FIGMA_SECTIONS`, `MASTER_SECTIONS`), 21 step / post-order screens, `components/`, `store.ts`, `store.delivery.ts`, `store.rewards.ts`, `totals.ts`, `data*.ts`, `tokens.ts` (route `checkout/checkout`, page `/checkout`) |
| World-class bar | `../noon-ui/resources/references/checkout-payment.md` + `../noon-ui/resources/references/bottom-sheets.md` — the strongest screens from the reference set (Mobbin-linked), what makes them great, how to build it with noon; read before designing, then pass `../noon-ui/references/craft-rubric.md` against them before done |
| Design system | `../noon-ui/references/tokens.md`, `../noon-ui/references/components.md`, `../noon-ui/references/assets.md`, `../noon-ui/references/motion.md`, `../noon-ui/references/screen-recipes.md`, `../noon-ui/references/flows.md` (checkout catalogue + Checkout blueprint) |

## Steps

1. **Pick the target** (say it in one line):
   - *New checkout step*: a new `CheckoutSectionId` in `src/flows/checkout/CheckoutScreen.tsx` plus a flow-local component, and a `presentation: 'sheet'` screen for its detail. Default, because `checkout/checkout` is the reference port.
   - *Change a step*: a payment method, delivery option or receiver tweak inside the existing component (`PaymentMethods`, `DeliveryInstruction`, `ReceiverDetails`) and its `data*.ts` entry.
   - *Checkout variant*: a different section list through the `sections` param (e.g. `MASTER_SECTIONS`), or a new screen beside `checkout/checkout`. Restyle `checkout/checkout` itself only when the user asks.
2. **Read** `spec.md`, then `references/figma-cart-checkout.md` §2.3 and §7, then `src/flows/checkout/CheckoutScreen.tsx`, `src/flows/checkout/FIGMA-MAPPING.md` and the components you will reuse (`CheckoutShipment`, `PaymentMethods`, `BurnSection` / `NewBadge`, `SlideButton`, `PaymentSummary`).
3. **Plan the sections** as an ordered `CheckoutSectionId[]` and render them through the one `renderSection` switch, so order changes stay data-only. Follow the section order in `spec.md`.
4. **Build each section** as a white r16 p12 card on `--nk-color-chk-fig-page`, 12 apart, inside the screen's 12px gutter. Reuse the checkout components; copy, options and methods go in `data.ts`, `data.payment.ts`, `data.delivery.ts`, `data.rewards.ts`; shared state in `checkoutStore` (`store.ts`) so sheets and the screen read the same values.
5. **Tokens**: section titles `--nk-type-chk-fig-text16-bold-lh24` or the Figma style named in `src/flows/checkout/FIGMA-MAPPING.md`; checkout-only values as `chk*` / `chkFig*` keys in `src/flows/checkout/tokens.ts` with the Figma node in a comment, plus a row in `src/flows/checkout/FIGMA-MAPPING.md`. Don't change central tokens for this page.
6. **Motion**: header colour on scroll, lane expander, credits reveal and the slide-to-pay as the existing components do; detail steps are sheets; placing and confirmation use the registered transitions (`spec.md` → Motion).
7. **Register**: `ScreenDef` with `title`, `notes` (what to try) and `source: 'Figma Af34gfmhQ1D0wstXUEHSIF · 127:44077'` for the default All flows layout (`zURu7GI7sq77fjdXKrouvo · 14288:183972` for a Checkout 2.0 `FIGMA_SECTIONS` step, or the node of the new step). Sheets set `presentation: 'sheet'`; a URL-openable state sets `defaultParams`.
8. **Validate**, below.

## Rules specific to checkout

- Section order comes from `ALL_FLOWS_SECTIONS` (`address_card, integrated_noonone, delivery_instructions, receiver_details, shipments, burn, pay_with, donation, payment_summary`, Figma All flows 127:44077); `FIGMA_SECTIONS` is the Checkout 2.0 order. A new step is a new section id in that list (or behind the `sections` param) plus a sheet screen for its detail; never a second scrolling page.
- Selection is a fill and border swap, never layout motion: selected = `--nk-palette-alice-blue` fill + 1px border (`--nk-color-link` for payment rows, `--nk-palette-light-blue` for delivery instructions); unselected rows keep a 1px transparent border so nothing shifts.
- The `SlideButton` is the only primary on the page. It (bappzaar NoonCheckoutSlideButton 1:1: production wins over the Figma dock) stays disabled ("Enter CVV", or "Select payment method" without a card) until the selected card has a valid CVV (3 digits, 4 for Amex, `isCvvValid`); a disabled press scrolls to the CVV input (`guideToPayment`). Selecting another method or card clears the CVV. Apple Pay swaps the slider for the Apple Pay button; an unverified address phone swaps it for "Verify Phone".
- Slide complete → `nav.push('checkout/placing', { fail }, { transition: 'none' })` → `nav.replace('checkout/confirmation', {}, { transition: 'checkout-alpha' })`, or `nav.replace('checkout/payment-failure', …, { presentation: 'modal' })` when the payment fails. Back on top after a failure resets the slider.
- Exits leave the checkout stack: Continue shopping → `nav.reset('home/home')`, View order → `nav.reset('orders/list')`. Back from checkout returns to `cart/cart` (the flow's `parent`).
- Prices through `currency` / `formatAmount` (dirham glyph), never "AED" text. NEW badges are `NewBadge` from `src/flows/checkout/components/BurnSection.tsx`, top-right, overlapping the row edge.
- `checkout/checkout` is a 1:1 port of the Figma frame and bappzaar master: don't restyle it unless asked. Hidden kit sections (`detached_address`, `payment`, `coupon_status`, `earn`, `dynamic_invoice`; `integrated_noonone` is in the default list) come back through `sections`, not by editing their components.

## Validate

```bash
npm run typecheck && npm run lint:tokens -- -v src/flows/checkout
npm run check:routes
node .claude/skills/noon-ui/scripts/snap.mjs checkout          # top of every checkout screen
node scripts/shot.mjs checkout/checkout /tmp/x.png --scroll 1500
```

Read every PNG against `spec.md` → Acceptance and against the Figma (§2.3 of the analysis): section order, 12 gutter and gap, r16 cards, selected payment row and delivery option, NEW badges, CVV field, installment strip overlap, payment summary, disabled "Enter CVV" slider (60×38 thumb, r14 track, label centred) with "N Items" + total below, as in production. Take a mid shot too (`--scroll 750`) for Points & Vouchers and Pay With. Then run `npm run skill:check` if you changed components, tokens or screens.
