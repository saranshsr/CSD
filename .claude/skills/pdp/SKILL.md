---
name: pdp
description: Build or restyle the noon product detail page (PDP) with the noon flow kit — gallery, brand strip and product info, variants, delivery and payments, Product Details accordions, bestseller, seller info, A+ features, FBT, reviews, recommendations, the add-to-cart bar and its sheets (variants, added to cart), and the Storefront out-of-stock / not-available / newer-model states. Use when someone asks for a product page, PDP, product detail screen, variant picker, add to cart sheet, out of stock or "newer model available" state, seller info or reviews on a product, or to "update the PDP to the new storefront design". Builds on noon-ui.
---

# Product detail page

Builds the noon PDP and every screen that speaks its card language. Load `../noon-ui/SKILL.md` first if it isn't loaded: its workflow, house rules and design-system references apply here unchanged. This skill adds the PDP specification and the checks specific to it.

For a new screen, a redesign or an open-ended idea, run the research-first design workflow before building: `../noon-ui/references/design-workflow.md` (size the request, research the repo and Mobbin per `../noon-ui/references/research.md`, clarify only blocking gaps, write the design direction, build with `../noon-ui/references/component-checklist.md`, validate). Its rules apply here unchanged; this skill's `spec.md` is the starting point for the design direction, and a port from bappzaar or Figma stays analyse → map → implement.

## Sources

| Source | Where |
|---|---|
| Brain card (read first) | `.claude/resources/brain/flows/pdp.md` — generated: every screen with its module, components, tokens, motion, nav in / out, tests and the spec / brief line ranges that describe it; `npm run brain -- context "<request>"` for the reading list, `npm run brain -- impact <entity>` before changing shared code |
| Branch brief | `.claude/resources/flows/pdp.md` — section groups sfA–E / npA–E, render order, delivery variants, in-place SKU switch, gotchas |
| Flow specification | `spec.md` (screens, section order, footer per state, data, navigation, motion, acceptance) |
| Figma analysis | `references/figma-storefront-pdp.md` — Storefront, file `2ldJbjmQq4RkhnrNFCfXQB`, main node `930:259766` (Case 3 · out of stock), plus Case 1 in stock `2316:17084`, Case 2 not available at location `908:251666`, alt OOS `1644:39023`: every section with measurements, variables → tokens, components → kit, delta vs code |
| Screenshot shared by the user | The whole Case 3 frame: gallery with "noon's exclusive" + 360, brand strip with Visit Store, title and rating, sponsored row, newer model card, Product Details accordions, bestseller, seller card, A+ features, OOS banner + newer-model footer, tab bar (described in the Figma analysis §1–2) |
| Current implementation | `src/flows/pdp/` — `DetailScreen.tsx` renders the **New PDP design** (All flows `Af34gfmhQ1D0wstXUEHSIF · 64:5571`, built on the Storefront in-stock frame `3499:75115`; `FIGMA-MAPPING.md`) from `components/storefront/Sf*.tsx` (+ `tokens.sfA` … `tokens.sfE` and `tokens.npA` … `tokens.npE`, merged into `pdpFlowTokens`) over the bappzaar behaviour (`MAPPING.md`, `data.ts` + `data.live.ts`, `VariantsSheet.tsx`, `AddedSheet.tsx`); the port's original section components stay in `components/` (route `pdp/detail`, page `/pdp`) |
| World-class bar | `.claude/resources/references/product-detail.md` + `.claude/resources/references/reviews-ratings.md` — the strongest screens from the reference set (Mobbin-linked), what makes them great, how to build it with noon; read before designing, then pass `../noon-ui/references/craft-rubric.md` against them before done |
| Design system | `../noon-ui/references/tokens.md`, `../noon-ui/references/components.md`, `../noon-ui/references/motion.md`, `../noon-ui/references/screen-recipes.md`, `../noon-ui/references/flows.md` (pdp catalogue entry + PDP blueprint) |

## Steps

1. **Pick the target** (say it in one line):
   - *Storefront 2025 PDP*: a new screen `pdp/oos` beside `pdp/detail` (out of stock by default, the other cases by param). Default, because `pdp/detail` is the reference port.
   - *Restyle the port*: only when the user explicitly asks to change `pdp/detail` itself. Ask first; keep the route `pdp/detail`, its params and its sheets.
   - *A PDP sheet or state*: a new `ScreenDef` in `src/flows/pdp/index.ts` (`presentation: 'sheet'` for sheets), opened from `DetailScreen`.
2. **Read** `spec.md`, then `references/figma-storefront-pdp.md` §2 (anatomy), §6 (delta) and §7 (build guidance), then `src/flows/pdp/DetailScreen.tsx`, `data.ts`, `tokens.ts`, `MAPPING.md` and the components you will reuse (`Card` in `components/Sections.tsx`; `SfGallery`, `SfMainInfo`, `SfNewerModelCard`, `SfProductDetails`, `SfSellerCard`, `SfReviewsCard`, `SfRecommendations`, `SfAtcBar` in `components/storefront/`).
3. **Plan the sections** in the order of `spec.md` → Sections, one card per section, and decide the footer from `spec.md` → Footer per state. Reuse `DetailScreen`'s shell (`Screen ref overlayHeader safeTop={false}`, `useScroll({ container })`).
4. **Build** each section from the kit column: reuse the pdp components, pass new props instead of forking them, and add the missing pieces in `src/flows/pdp/components/storefront/`: `SfNewerModelCard`, `SfSponsoredRow`, `SfProductFeatures` and `SfSponsoredBrandCard` exist; `OosBanner` and `SuccessorChin` are still to build. `SkuCard` is central (`src/components/SkuCard`) if a rail needs it.
5. **Tokens**: card titles `var(--nk-color-text-strong)`; snap every Figma value with the table in the Figma analysis §3; values with no token become `pdp*` keys in the flow's token files (`src/flows/pdp/tokens.ts` or the area files `tokens.sfA`–`sfE` / `tokens.npA`–`npE`; card titles already exist as `pdpSf{b,c,d}SectionTitle`). Never change central tokens, and don't change `pdpTokens.galleryRatio` or the `bgPage` override without asking: both change every PDP.
6. **Motion**: keep the port's header fade, gallery pager and accordions; add the successor chin slide-in and the A+ expand (`spec.md` → Motion). No `Stagger` on PDP sections.
7. **Register**: `ScreenDef` with `title`, `defaultParams`, `notes`, and `source: 'Figma 2ldJbjmQq4RkhnrNFCfXQB · 930:259766'` (Case 3). For a Storefront port, write a `FIGMA-MAPPING.md` next to `src/flows/pdp/MAPPING.md` from the analysis §3–4 before changing code.
8. **Validate**, below.

## Rules specific to pdp

- Every section is a white r16 card inset 12 (`Card` in `src/flows/pdp/components/Sections.tsx`: `--nk-color-bg-surface`, `--nk-radius-r16`, padding and margin `--nk-space-s12`), stacked 12 apart in the master order of `spec.md`. No full-bleed sections except the gallery.
- Variant selection follows bappzaar master (`src/flows/pdp/MAPPING.md` → Variant selection behaviour): first in-stock size preselected; a size tap switches locally; an option tap shows the options loader and switches the product in place (no navigation, scroll kept), never `push`.
- Add to cart goes through `SfAtcBar`: `addToCart` from `useDemoStore()` → `nav.sheet('pdp/added', { productId, qty })`. `pdp/variants` is the size flyout a product card + opens for a sized product (no preselect, warning + shake on ATC without a size). Don't hand-roll a second ATC button.
- Out of stock and not available at location have **no `SfAtcBar`** and no price block: the footer is the OOS banner + successor chin.
- The newer-model card and the chin open the successor with `nav.push('pdp/detail', { productId })` (`push`, not `replace`), so the user can go back to the old model.
- Ask before restyling the bappzaar port `pdp/detail`. New designs go to new screens in the same flow (e.g. `pdp/oos`); route ids and params of existing screens stay stable.
- Every sponsored element carries a `Badge` "Ad" (`bg="var(--nk-palette-border-color)"`, colour `var(--nk-color-price-old)`). Prices go through `Price` / `Money` or `money()` in `data.ts` (dirham sign, never "AED").
- "Visit Store" keeps today's behaviour (`nav.push('plp/listing', { query: content.brand })`): there is no storefront design yet, so don't invent a storefront flow.

## Validate

```bash
npm run typecheck && npm run lint:tokens -- -v src/flows/pdp
npm run check:routes
node .claude/skills/noon-ui/scripts/snap.mjs pdp            # top of every pdp screen
node scripts/shot.mjs pdp/detail /tmp/x.png --scroll 1500
```

Shoot the new screen the same way (`pdp/oos` at the top, `--scroll 1500` and further). Read every PNG against `spec.md` → Acceptance and against the Figma (§2 of the analysis): section order, white r16 cards inset 12 with 12 between, 15/700 card titles, brand strip with Visit Store, newer-model card, footer for the state (ATC bar, or OOS banner + chin with no ATC), Ad badges. Then run `npm run skill:check` if you changed components, tokens or screens.
