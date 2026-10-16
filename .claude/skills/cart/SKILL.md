---
name: cart
description: Build or restyle the noon cart (basket) with the noon flow kit, following the Cart 2.0 Figma — address header, shipment groups (express, Global, market, supermall) with free-delivery progress, cart items with stepper and chips, upsell carousels (offers, wishlist), free gifts, coupons and the best-price coupon strip, payment offers, sticky savings tab + total + Checkout, and the cart empty / loading / error states and item sheets. Use when someone asks for a cart page, basket, shipment groups, a free-delivery progress bar, coupon entry, cart upsell carousels, a cart empty, loading or error state, or to "update the cart to Cart 2.0". Builds on noon-ui.
---

# Cart

Builds the noon cart and any change to it. Load `../noon-ui/SKILL.md` first if it isn't loaded: its workflow, house rules and design-system references apply here unchanged. This skill adds the cart specification and the checks specific to it.

For a new screen, a redesign or an open-ended idea, run the research-first design workflow before building: `../noon-ui/references/design-workflow.md` (size the request, research the repo and Mobbin per `../noon-ui/references/research.md`, clarify only blocking gaps, write the design direction, build with `../noon-ui/references/component-checklist.md`, validate). Its rules apply here unchanged; this skill's `spec.md` is the starting point for the design direction, and a port from bappzaar or Figma stays analyse → map → implement.

## Sources

| Source | Where |
|---|---|
| Brain card (read first) | `.claude/resources/brain/flows/cart.md` — generated: every screen with its module, components, tokens, motion, nav in / out, tests and the spec / brief line ranges that describe it; `npm run brain -- context "<request>"` for the reading list, `npm run brain -- impact <entity>` before changing shared code |
| Branch brief | `.claude/resources/flows/cart.md` — DemoStore state, section anatomy, footer, hand-off to checkout |
| Flow specification | `spec.md` (screens, section order, group theming, footer, data, navigation, motion, states, acceptance) |
| Current Figma | All flows `Af34gfmhQ1D0wstXUEHSIF` · `127:39687` (frame "Cart"), mapped in `src/flows/cart/FIGMA-MAPPING.md` → "All flows · 127:39687" |
| Figma analysis | `../checkout/references/figma-cart-checkout.md` — Cart 2.0, file `BaWAAGW7zmdSTkXNXqPcAJ`: `10575:94058` Phase I default, `14812:276687` Best price, `12112:209179` Error. §2.1–2.2 anatomy with measurements, §3 variables → tokens, §4 components → kit, §5 motion, §6 delta vs code, §7 build guidance |
| Current implementation | `src/flows/cart/` — `index.ts`, `CartScreen.tsx` (`SECTIONS`, `GROUP_ORDER`, `EmptyCart`, `CartLoading`), `tokens.ts` (`cartTokens`, `cartFigmaColors`, `cartFlowTokens`, `groupTheme`), `data.ts`, `components/`, `FIGMA-MAPPING.md` (bappzaar 1:1 port restyled to Cart 2.0, route `cart/cart`, page `/cart`) |
| Cart state | `src/kit/DemoStore.tsx` — `useDemoStore()` (`cart`, `cartTotals`, `coupon`, `inactiveCart`), `CartGroupType`, `cartGroupOf`, `computeCartTotals`, `FREE_DELIVERY_THRESHOLD` |
| World-class bar | `.claude/resources/references/cart.md` + `.claude/resources/references/feedback-toasts.md` — the strongest screens from the reference set (Mobbin-linked), what makes them great, how to build it with noon; read before designing, then pass `../noon-ui/references/craft-rubric.md` against them before done |
| Design system | `../noon-ui/references/tokens.md`, `components.md`, `motion.md`, `screen-recipes.md`, `flows.md` (cart catalogue entry and Cart blueprint) |

## Steps

1. **Pick the target** (say it in one line):
   - *Cart state or variant*: a new ScreenDef in `src/flows/cart/index.ts` that reuses `CartScreen` with `defaultParams` (the planned error and best-price screens in `spec.md`). Default, because `cart/cart` is the reference port.
   - *Update the cart to Cart 2.0*: only when the user asks to change the cart itself. Keep the route `cart/cart`, the `cart` tab and the existing state screens; work through the delta list in the Figma analysis §6.
   - *New section or group*: a new id in `SECTIONS` (or a new `CartGroupType`) plus a flow-local component in `src/flows/cart/components/`.
2. **Read** `spec.md`, then the Figma analysis §2.1 (anatomy) and §6 (delta), then `src/flows/cart/CartScreen.tsx`, `tokens.ts`, `data.ts`, `FIGMA-MAPPING.md` and the components you will reuse (`CartGroup`, `CartItem`, `GroupProgressBar`, `CouponInput`, `CartFooter`).
3. **Plan the sections** as ids in `SECTIONS` and render them through `renderSection`'s one `switch`, so order changes stay data-only. A variant with another order (Best price) gets its own ScreenDef and its own order list; the default `SECTIONS` stays as it is.
4. **Build** from the section table in `spec.md`: reuse the cart components, take plain new cards from `SectionCard`, prices from `Price` / `Money`, and add the missing parts in `src/flows/cart/` (`PaymentOffers`, `CobrandCards` and the supermall `groupTheme` exist; still to build: an error view modelled on `src/flows/categories/components/ErrorView.tsx` and a best-price variant of `CouponInput`).
5. **Tokens**: Figma values with no central token go in `src/flows/cart/tokens.ts` (`cartFigmaColors` or `cartFlowTokens`) with the Figma node in a comment; snap every value with the Figma analysis §3. Group colours only through `groupTheme`. Don't change central tokens or `TabBar` defaults for this page.
6. **Motion**: header colour and radius on scroll as `CartHeader` does; progress spring and shimmer as `GroupProgressBar` does; item height collapse in `CartGroup`; sliding invoice in `CartFooter` (`spec.md` → Motion).
7. **Register**: `ScreenDef` with `title`, `notes`, `defaultParams` for states, and `source: 'Figma BaWAAGW7zmdSTkXNXqPcAJ · <node>'`. Add a row to `src/flows/cart/FIGMA-MAPPING.md` for every new Figma value.
8. **Validate**, below.

## Rules specific to cart

- Cart numbers come only from `useDemoStore()`: `cartTotals` (group subtotals, shipping, savings, coupon discount, total) and `cart`. Never sum prices in a component or keep a second cart in flow state; a new number is a new field in `computeCartTotals` (`src/kit/DemoStore.tsx`).
- Groups are themed only through `groupTheme[type]` (`src/flows/cart/tokens.ts`). A new fulfilment is one `CartGroupType` entry, one `groupTheme` entry and its `cartFigmaColors` keys, never inline hex or a per-group CSS class with colours.
- Keep the documented overlaps: glass container `-24px` over the progress footer (pt 36), stepper `-16px` over the image box, savings wave `-16px` over the footer, coupon block `-12px` over the best-price strip. Use z-index, never separate flat cards.
- Every state is a ScreenDef (`cart/empty`, `cart/loading`, and the planned error and best-price screens) with `defaultParams: { state }`, so it opens by URL and can be screenshotted. Forced states don't touch the store.
- Don't restyle the 1:1 port unless asked: `cart/cart` and its components are the reference implementation. Add variants next to it and keep routes, screen ids and the `SECTIONS` default order stable.
- The screen is `<Screen header={<CartHeader … />} footer={<CartFooter … />} background="bgPage" onScroll>`; the footer reports its height (`onHeightChange`) and the content pads to it. One primary action per page: the footer Checkout.

## Validate

```bash
npm run typecheck && npm run lint:tokens -- -v src/flows/cart
npm run check:routes
node .claude/skills/noon-ui/scripts/snap.mjs cart          # top of every cart screen, sheets included
node scripts/shot.mjs cart/cart /tmp/cart-mid.png --scroll 1200
node scripts/shot.mjs cart/cart /tmp/cart-end.png --scroll 2600
```

Read every PNG against `spec.md` → Acceptance and against the Figma (§2.1 of the analysis): section order, 12 gutter and 12 between cards, r16 cards, group glass + border + progress colours, the four overlaps, 134 SKU tiles, footer total + Checkout, tab bar on the tab root. Then run `npm run skill:check` if you changed components, tokens or screens.
