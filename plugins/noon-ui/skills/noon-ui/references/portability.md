# Portability: what this kit needs outside the repo

The kit's quality comes from references the repo does not hold: the bappzaar app source, private Figma files, the brand font and assets captured from noon. This file lists each of them, how to tell whether it's available, and what to do when it isn't.

Facts below were checked in the repo on 2026-10-13. Lines marked *(assumption)* were not verified from files here.

## 1. Dependencies on things outside the repo

### bappzaar (the noon React Native app)

- **What**: the source of truth for most screens (`truth` bappzaar, mostly inferred from `source`; counts per truth in `resources/inventory.md`). Ports cite paths like `marketplaces/noon/screens/NoonCartScreen` or `features/vip/screens/…` in `ScreenDef.source`, and each flow's `MAPPING.md` resolves them value by value.
- **Where**: a local clone at `~/bappzaar`, read **only through git objects**: `git -C ~/bappzaar show origin/master:<path>`. Never check it out, switch branches or modify it (CLAUDE.md, CONTRIBUTING.md).
- **Copy**: `marketplaces/noon/locale/translations/noon-en.json` in that repo.
- **Check availability**: `git -C ~/bappzaar rev-parse --short origin/master`. It fails if the clone is missing or has no `origin/master`. Mapping docs pin the SHA they were written against (for example `bappzaar master ba159e20` in `home/home`, `d481712d6d9` in the returns skill), and master moves. Quote the SHA you actually read.
- **Access**: bappzaar is a private noon repo *(assumption: there is no public mirror)*. Without access you cannot re-verify any bappzaar-backed screen.

### Figma (private noon files)

These file keys are cited in `source` fields, mapping docs, tokens and skills. You need a noon Figma account and the Figma MCP (desktop or remote plugin) to read them.

| File key | What it is (as cited) | Used by |
|---|---|---|
| `Af34gfmhQ1D0wstXUEHSIF` | "All flows": New PDP, Cart, Checkout, noon One landing, home hero creatives | `pdp/detail`, `cart/cart`, `checkout/checkout`, `noonone/landing`, `home`; visual ref `cart-sticky-footer` |
| `KzR8dy12uT8CtgBRHHY6Qx` | Ratings & Reviews 2.0 | every `reviews/*` screen |
| `2ldJbjmQq4RkhnrNFCfXQB` | Storefront (earlier PDP) | `pdp` tokens and FIGMA-MAPPING |
| `iRE9RwO94eMAyW3j3XKNXW` | Homepage Revamp 2025 | `/home-page` skill, ProductCard `variant="2025"` |
| `zURu7GI7sq77fjdXKrouvo` | 🚧 Checkout 2.0 | `checkout` tokens, copy, `/checkout` skill |
| `xPr9Ln37JGSBGvNtrsyD0y` | PDP Redesign (delivery information) | `pdp/deliveryVariants` |
| `BaWAAGW7zmdSTkXNXqPcAJ` | Cart 2.0 | cart tokens, the `cart` SKU card |
| `4NvyqO60K7Xn4gRJrkWmzQ` | Accounts | `NeedHelpButton`; visual ref `account-action-cards-empty` |
| `wFRKiKskxZ4vjIHbDVvngJ` | Origin Design System icons (`6170:153`) | `src/assets/icons/origin/`, `npm run icons:import` |

- **Check availability**: call the Figma MCP (`get_metadata` / `get_design_context` on the node). If the tools aren't loaded or the call is refused, the file is unavailable for this session.
- Never put temporary Figma asset URLs in code; they expire. Export the asset into `src/assets/<flow>/figma/`.

### Other user-shared references

- `pds-noon-as.vercel.app/one-flows` (orders list / tracking) and the GitHub repos `vbirla789/R-R-2.0-with-checkbox` (reviews) and `saswata2002/Brand-Widget-PLP` (PLP brand widget, motion). They are third-party deployments. Their availability and licence are not recorded in the repo.

### Live noon services

- `npm run categories:fetch` calls `https://api-app.noon.com/_svc/catalog/api/v3/u<linkUrl>` and writes `src/flows/categories/cms-pages.json`. It needs network access, and the response depends on region and time. Without it, `flows/categories-views.md` marks page types as guesses (`?`).
- Assets are sometimes downloaded from `f.nooncdn.com` / `a.nooncdn.com` (CONTRIBUTING.md → Assets). Those are live production creatives.

## 2. Fonts

| Font | Where | Bundled? | Licence status |
|---|---|---|---|
| Noontree (400/500/600/700) | `src/assets/fonts/Noontree-*.otf`, `@font-face` in `src/foundations/global.css` | **Yes**: in the repo, and the library build copies the files to `dist-lib/assets/` | noon brand typeface. **No licence file in the repo.** Treat it as proprietary. Don't redistribute it outside noon. The dirham sign (U+E001) renders only in Noontree. |
| Cairo (400/600/700), Figtree (400–800) | `index.html` → `fonts.googleapis.com` | No: loaded at runtime by the dev preview only. A package consumer must load them. | Google Fonts *(assumption: SIL OFL, per Google Fonts)* |
| Lobster, Tourney (latin woff2) | `src/assets/fonts/*.woff2`, `@font-face` in `src/flows/home/components/DepartmentTabs.module.css` | Yes, home flow only | Google Fonts *(assumption: SIL OFL)*. No licence text is bundled with them. |

Offline, Cairo and Figtree fall back to the next family in the stack (`fontFamily` in `src/foundations/tokens.ts`). RTL and Figtree text will then not match the reference. Say so when you review screenshots taken offline.

## 3. Assets and their provenance

`src/assets/` (see `references/assets.md` for the folder map) mixes four origins. Keep the source file name so each file stays traceable:

- **bappzaar exports**: the `@3x` webp/svg from `marketplaces/noon/theme/assets/` or `src/theme/assets/{icons,images}/` in bappzaar, plus the Lotties. These are noon-owned.
- **Figma exports**: files under `src/assets/<flow>/figma/`, plus the PNGs in `visual/refs/` (`manifest.json` records file key, node and export date).
- **Live CDN / CMS captures**: home, categories, deals and PLP creatives (`home/`, `categories/`, `deals/`, `plp/navpills/`), plus product photos in `src/data/products/<id>/`. These include third-party brand imagery and product photos.
- **Third-party references**: `plp/brands/` (from `github.com/saswata2002/Brand-Widget-PLP`) and the reviews product art.

**Do not copy or publish restricted source material or assets without authorization.** That covers bappzaar code, copy and assets, Figma exports, the Noontree font, CDN creatives and brand or product imagery. Use them inside this prototype kit for noon work. Don't paste them into public repos, gists, public artifacts, external design tools or chat with third parties. Don't widen distribution (`npm publish` to a public registry, a public skills zip) without sign-off from whoever owns the material. Facts relevant to that decision:

- `package.json` has `"license": "UNLICENSED"` and **no `"private": true`**.
- `files` ships `dist-lib`, which includes the Noontree fonts and the imported assets.
- `npm run skills:package` zips the skills and `.claude/resources/`, including the Figma keys and bappzaar paths listed here.
- The git remote's visibility was not checked.

## 4. Environment

| Need | Detail |
|---|---|
| Node | ≥ 20 (`engines`). Checked here with v24.15.0 on macOS 26.6. |
| OS | Developed on macOS. Scripts use `node:path` and Playwright, so Linux should work *(assumption: not run on Linux or Windows here)*. |
| Playwright + Chromium | `scripts/shot.mjs`, `check-routes.mjs`, `journeys.mjs`, `visual-*.mjs`, `skill:snap`. Run `npx playwright install chromium` once per machine. |
| sharp, svgo | `npm run assets:optimize` / `assets:check` (sharp ships native binaries per platform). |
| Dev server | `npm run dev` on port 5180, or the next free port. Pass `PORT=<port>` to `shot.mjs` / `check-routes.mjs`. `test:journeys` uses 5199 and `visual:ref` uses 5198. |
| Paths | `~/bappzaar` is the only home-relative path the workflow assumes. `scripts/import-origin-icons.mjs` expands `~` from `$HOME`. Other scripts resolve paths from the repo root. |
| Figma MCP | Optional. Needed only to read or verify Figma-backed screens (§1). |
| Network | Google Fonts in the dev preview, `categories:fetch`, CDN downloads. Not needed for typecheck, lint, build or `skill:check`. |

## 5. When an authoritative reference is unavailable

If bappzaar, the Figma file or the shared reference can't be read in this session:

1. **Say so, up front and in the hand-off.** Name the reference and the reason. For example: "`~/bappzaar` is not present", "Figma MCP not loaded", or "the file key returned 403".
2. **Don't fabricate.** Don't invent node ids, bappzaar paths, SHAs, copy keys, token values "from Figma", or `verified` dates. Don't describe a reference you didn't open.
3. **Fall back in this order.** First the existing kit implementation (already a port), then the flow's `MAPPING.md` / `FIGMA-MAPPING.md` and brief, then the closest flow's patterns. Values you can't trace to one of these get snapped to the nearest token and listed as assumptions.
4. **Label the work** with the provenance labels in `resources/inventory.md`:
   - **reference-backed**: you read the reference this session, or the screen is an unchanged existing port.
   - **kit-backed**: composed from kit components and patterns with no external reference. Write `source: 'kit: <what it's composed from>'` (or `stand-in for <bappzaar screen>`).
   - **inferred**: you guessed at structure or values a reference should have decided. Say which parts in the hand-off.
5. **Leave `verified` alone.** Only set `verified: 'YYYY-MM-DD'` after a real side-by-side check against the reference. Don't change `truth` to a reference you couldn't read.
6. **Ask before overriding a reference-backed screen** from memory or from a weaker source.

## 6. Quick availability check

```bash
git -C ~/bappzaar rev-parse --short origin/master   # bappzaar readable?
npx playwright --version                            # browser checks possible?
node -v                                             # ≥ 20
npm run resources:build && node scripts/check-inventory.mjs   # inventory current, doc counts match
```

The Figma MCP is available when its tools (`get_design_context`, `get_metadata`, `get_screenshot`) are listed in the session.
