---
name: home-page
description: Build or restyle the noon home page and home-style landing pages (campaign, seasonal, category or brand landing feeds) with the noon flow kit, following the Homepage Revamp 2025 Figma — header with experience switcher, address and search, promo ticker, hero banners, category grid, tabbed recommendation rail, offers, product rails, sponsored and launch modules. Use when someone asks for a home page, homepage variant, campaign / Ramadan / White Friday landing page, "a feed like home", or to update the home flow to a new design or reference.
---

# Home page

Builds the noon home feed and any page that speaks its module language. Load `../noon-ui/SKILL.md` first if it isn't loaded: its workflow, house rules and design-system references apply here unchanged. This skill adds the home specification and the checks specific to it.

For a new screen, a redesign or an open-ended idea, run the research-first design workflow before building: `../noon-ui/references/design-workflow.md` (size the request, research the repo and Mobbin per `../noon-ui/references/research.md`, clarify only blocking gaps, write the design direction, build with `../noon-ui/references/component-checklist.md`, validate). Its rules apply here unchanged; this skill's `spec.md` is the starting point for the design direction, and a port from bappzaar or Figma stays analyse → map → implement.

## Sources

| Source | Where |
|---|---|
| Brain card (read first) | `.claude/resources/brain/flows/home.md` — generated: every screen with its module, components, tokens, motion, nav in / out, tests and the spec / brief line ranges that describe it; `npm run brain -- context "<request>"` for the reading list, `npm run brain -- impact <entity>` before changing shared code |
| Branch brief | `.claude/resources/flows/home.md` — what `home/home` renders now (bappzaar CMS feed + 2025 header + Eid hero), area token files, how to add a feed module, gotchas |
| Flow specification | `spec.md` (screens, module catalogue, ordering rules, data, acceptance) |
| Figma analysis | `references/figma-homepage-2025.md` — Homepage Revamp 2025, file `iRE9RwO94eMAyW3j3XKNXW`, screen `1337:5102` (wrapper `1337:7139`): every section with measurements, variables → tokens, components → kit, delta vs code |
| Current implementation | `src/flows/home/` — `HomeScreen.tsx`, `data.ts`, `tokens.ts`, `components/` (bappzaar 1:1 port, route `home/home`, page `/homepage`) |
| World-class bar | `.claude/resources/references/home-feed.md` + `.claude/resources/references/navigation-tabbar.md` — the strongest screens from the reference set (Mobbin-linked), what makes them great, how to build it with noon; read before designing, then pass `../noon-ui/references/craft-rubric.md` against them before done |
| Design system | `../noon-ui/references/tokens.md`, `components.md`, `assets.md`, `motion.md`, `screen-recipes.md` |

## Steps

1. **Pick the target** (say it in one line):
   - *Home 2025 variant*: a new screen `home/revamp` beside `home/home`. Default, because `home/home` is the reference port.
   - *Replace the home*: only when the user asks to update the home flow itself. Keep the route `home/home` and the tab bar.
   - *Campaign / landing page*: a pushed screen in a new flow (or `deals`) using the landing variant in `spec.md`.
2. **Read** `spec.md`, then `references/figma-homepage-2025.md` §2 (anatomy) and §6 (delta), then `src/flows/home/HomeScreen.tsx`, `data.feed.ts` (`homeFeed`), `tokens.ts` and the components you will reuse (`HomeHeader`, `ExperienceSwitcher`, `EidBanners`, `ProductCarousel`, `BzModuleWrapper`, `DealTimer`).
3. **Plan the modules** as an ordered array (as `homeFeed: BzModule[]` in `data.feed.ts`, `{ key, type, wrap, header?, … }`) and render them through one `switch`, so order changes stay data-only. Follow the ordering rules in `spec.md`.
4. **Build the header**, then each module, from the module catalogue: reuse the home components and the central `SkuCard` / `ProductCard carousel`. The 2025 modules already exist in `src/flows/home/components/` but are not rendered on `home/home` (`PromoTicker`, `CategoryGrid`, `RecommendedRail`, `OfferTickets`, `ProductRail`, `KeepShopping`, `BrandAdModule`, `LaunchModule`, `HeroBanners`, `DepartmentTabs`); render them on the new screen instead of rebuilding them.
5. **Tokens**: section titles `Text variant="heading"` coloured `var(--nk-palette-new-black)`; feed gap and the other 2025-only values as `home*` keys in `src/flows/home/tokens.ts`; snap every Figma value with the table in the Figma analysis §3. Don't change central tokens or `TabBar` defaults for this page.
6. **Motion**: hero auto-advance and snap as `HeroCarousel` does; tab underline with `layoutId`; rail swap with `AnimatePresence` + `Stagger`; header collapse past 100px (`spec.md` → Motion).
7. **Register**: `ScreenDef` with `title`, `path`, `notes`, and `source: 'Figma iRE9RwO94eMAyW3j3XKNXW · 1337:5102'`. For a full port, write `src/flows/home/FIGMA-MAPPING.md` from the analysis §3–4.
8. **Validate**, below.

## Rules specific to home

- The header is custom, never `<Header>`; the screen is `<Screen header background="bgSurface" withTabBar safeTop={false} onScroll>` for a tab root, or `<Screen header={<Header … />}>` for a pushed landing page.
- Every tile, banner and "see all" navigates: categories and banners to `plp/listing` with a `query`, SKUs to the PDP, search to `search/search`, wishlist to `wishlist/wishlist`.
- Fixed card sizes stay fixed on the 390pt device; the extra width shows as more rail peek. Don't scale them.
- Ads always carry an "Ad" badge, and two dark or two sponsored modules are never adjacent.
- Creatives come from `src/assets/home/` (see `../noon-ui/references/assets.md`). Text that the design shows live (category labels, offer copy) is live `Text`, not baked into images.

## Validate

```bash
npm run typecheck && npm run lint:tokens -- -v src/flows/home
npm run check:routes
node .claude/skills/noon-ui/scripts/snap.mjs home          # top of every home screen
node scripts/shot.mjs home/home /tmp/home-mid.png --scroll 1200
```

Read every PNG against `spec.md` → Acceptance and against the Figma (§2 of the analysis): module order, 28 gap, 12 gutters, 134 SKU cards, 17/22 titles, header gradient and collapse, Ad badges, tab bar. Then run `npm run skill:check` if you changed components, tokens or screens.
