# Contributing to @noon/flow-kit

Thanks for helping. The kit is useful only while it stays **faithful to the real noon app** and **consistent inside**, so every change follows the same few rules. AI assistants working in this repo follow the same rules via [CLAUDE.md](./CLAUDE.md).

## Setup

```bash
npm install
npm run dev        # phone preview at http://localhost:5180 — every screen is a URL (/cart, /pdp, /checkout …)
```

Node ≥ 20. The dev preview (`src/app`) is not part of the package — it only renders the phone; never import it from flows or components.

## Layout

```
src/
├── foundations/   tokens.ts (semantic + component tokens) · palette.ts (raw colours, bappzaar names) · ThemeProvider · global.css
├── components/    shared components — one folder each, exported from components/index.ts
├── kit/           runtime: Navigator (stack, sheets, toasts), routes.ts (page URLs), createStore, DemoStore, membership, PhoneFrame
├── motion/        presets (easing/springs), transitions, recipes, custom/ (register screen transitions)
├── data/          data layer: products/<id>/ (product.ts + photos), catalog, categories, variants, users, money (see src/data/README.md)
├── mocks/         old import paths, re-exporting src/data
├── assets/        images · svg · lotties · fonts (optimised; see "Assets")
├── flows/<id>/    one folder per flow (see below) + flows/index.ts registry
└── app/           dev preview only
```

A flow folder:

```
flows/<id>/
├── index.ts         defineFlow({ id, title, group, initial, parent?, tabBar?, screens: [{ id, title, component, path?, source, notes }] })
├── tokens.ts        flow-only tokens (the only place raw values may live)
├── data.ts          copy + mock content (server-driven values marked as such)
├── store.ts         flow state via createStore (only if needed)
├── *Screen.tsx      screens, each wrapped in <Screen header footer>
├── *.module.css     styles — tokens only
├── components/      flow-only components
└── MAPPING.md       source → kit mapping (see below)
```

Create one with `npm run new-flow -- <id> "Title" "Sidebar group"`.

## The porting process (bappzaar / Figma → kit)

Every screen we port is **analysed, mapped, then implemented** — never eyeballed.

1. **Analyse.** Read the source of truth:
   - bappzaar **master** only, read-only, via git objects (`git -C ~/bappzaar show origin/master:<path>`; never check out or modify that repo). Follow the screen's render tree, feature flags (`src/utils/FeatureFlags.ts`) to the live variant, and resolve every `styles.ts` value through NoonTokens / NoonColors / ThemeManager to a concrete number or colour.
   - or a **Figma** node (design context + variables + section screenshots).
   - Copy comes from `marketplaces/noon/locale/translations/noon-en.json` / `src/locale/translations/en.json` / feature locales. Server-driven data has no source in the repo — use realistic UAE demo values and say so.
2. **Map.** Write/extend the flow's `MAPPING.md` (`FIGMA-MAPPING.md` for Figma): per section a table *source component + file · property · source value · kit token · status*. Include copy keys, assets, server-driven fields, variant decisions and documented exceptions.
3. **Implement** from the mapping, with tokens only (below), shared components where they match, real assets, real copy.
4. **Verify** (below) and record the `source` + `notes` on every screen in `index.ts`.

## Tokens (styling rules)

- No raw colours or font shorthands in components or flow CSS/TSX. Use CSS variables: `var(--nk-color-*)` (semantic first), `var(--nk-palette-*)`, `var(--nk-type-*)` (font shorthand), `var(--nk-space-*)`, `var(--nk-radius-*)`, component tokens (`--nk-button-*`, `--nk-pill-*`…). In TS use `ref.color('textPrimary')`, `ref.type(...)` etc. (typed — typos fail `tsc`).
- `scripts/token-map.json` maps any literal you have (hex, rgba, `600 14px/18px`) to the matching token.
- A value with no token: add it to the flow's `tokens.ts`; if it's clearly global (a design-system colour reused across flows) **append** it to `foundations/palette.ts` / `tokens.ts` under its bappzaar / Figma name. Never rename or remove an existing token — other flows depend on it.
- Geometry (SVG paths, Figma layer boxes, aspect ratios, 1px hairlines) may stay literal; mark unavoidable lines `// token-lint-ignore — <reason>`.
- `npm run lint:tokens` (`-- -v <path>` lists findings) must stay at 0 for `src/components` and for the folders you touch.
- Prices use the dirham sign: `currency` from `src/data` (U+E001, drawn by Noontree), never the text "AED".

## Components

Reuse before you create: `Button` (incl. NoonButton presets `noon` / `noonSecondary` / `noonGhost` / `noonDotted`, `loading`, `titleCase`), `Text`, `Screen`, `Header`, `SearchBarButton`, `Switch`, `Checkbox`, `Spinner`, `Toast`, `HtmlText` (server HTML tags), `Divider` / `DashedDivider` / `DottedDivider`, `MaskIcon`, `Skeleton`, `ProductCard`, `Price`, `Tag` / `MarketplaceTag`, `TabBar`… A component used by two flows belongs in `src/components` (one folder, tokens only, doc comment naming its bappzaar/Figma source and variants). Flow-specific compositions stay in the flow.

Navigation: `useNav()` → `push / sheet / back / replace / reset / switchTab / toast / preload`; `useIsTop()` for "is this screen on top". Cross-flow state: `useDemoStore()` (cart, wishlist, coupon), `useMembership()` (noon One). Flow state: `createStore`.

## Assets

- Put files in `src/assets/<flow>/` (or `src/assets/shared/…` when used by several flows). Prefer the bappzaar @3x webp/svg, or download from f.nooncdn.com / a.nooncdn.com; never leave temporary Figma URLs in code.
- Size rasters to ≈3× their rendered size. Run `npm run assets:optimize` after adding assets — it recompresses in place (webp/png/gif/svg/lottie) and `npm run assets:check` fails on duplicates or budget overruns (allowlist with a reason in `scripts/asset-budget.json`).

## Checks every PR must pass

```bash
npm run verify          # typecheck (app + lib) · token lint · library build
npm run assets:check    # no duplicate / oversized assets
npm run dev &           # then, in another shell:
npm run check:routes    # every registered screen renders, no console errors, no placeholders
```

For anything visual, prove no unintended change:

```bash
npm run visual:snap -- /tmp/base     # before your change (on main)
npm run visual:snap -- /tmp/after    # after
npm run visual:diff -- /tmp/base /tmp/after
```

Animated screens (Lotties, timers, carousels) show small run-to-run noise — open the PNGs to confirm. Screenshot a single screen with `node scripts/shot.mjs <route> out.png [--scroll y] [--click ".pg-stage >> <selector>"]`.

## The AI skill

`.claude/skills/` holds the Claude skills that build noon screens and flows with this kit: `noon-ui` (main skill: design system references in `references/`, flow catalogue, workflow, validation scripts) and the screen skills `home-page`, `search`, `cart`, `checkout`, `pdp` (each a `SKILL.md` plus a `spec.md`). When your PR adds or renames a component, token, transition, recipe, asset folder, flow or screen, or changes a flow a screen skill specifies, update the matching skill file and run `npm run skill:check` (CI runs it too). To add a screen skill, follow "Adding a screen skill" in `.claude/skills/noon-ui/SKILL.md`.

## Pull requests

- One topic per PR; title like `feat(checkout): …`, `fix(cart): …`, `chore(assets): …`.
- Fill in the PR template: what changed, the source (bappzaar path at master SHA / Figma node), before/after screenshots, checks run.
- Add a line under **Unreleased** in [CHANGELOG.md](./CHANGELOG.md) for anything a package user would notice.
- Keep exports backward compatible; breaking changes need a major bump and a migration note.
