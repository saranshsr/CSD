---
name: search
description: Build or restyle the noon search experience with the noon flow kit — the search entry screen (search input, recent searches with edit mode, trending pills, live suggestions / autocomplete as you type with the match in bold) and the results listing it hands off to (PLP grid with filter and sort pills, Filters and Sort sheets, skeleton loading, empty states). Builds on noon-ui. Use when someone asks for a search page, search suggestions or autocomplete, recent or trending searches, search results, filters / sort, or "a search like noon's", or to update the search or plp flows to a new design or reference.
---

> **Package note** (noon Flow Kit 0.1.0, built from `.claude/skills/search` by `npm run release:build`). Files under `../noon-ui/` (design-system references, `../noon-ui/resources/` with the brain map, flow briefs and screen index) are part of this package. Paths under `src/`, `scripts/`, `visual/` or `.claude/` and `npm run …` commands refer to the noon Flow Kit repo (https://github.com/arnabdebnath07/noon-app-skill): use them inside a checkout of it; anywhere else treat them as reference, ask for what you need, and never invent their contents. Claude Code-only parts (slash commands, the design-guard hook, Claude-specific tools) are listed in `../noon-ui/resources/DISTRIBUTION.md`.

# Search

Builds the noon search entry and the results listing it hands off to. Load `../noon-ui/SKILL.md` first if it isn't loaded: its workflow, house rules and design-system references apply here unchanged. This skill adds the search specification and the checks specific to it.

For a new screen, a redesign or an open-ended idea, run the research-first design workflow before building: `../noon-ui/references/design-workflow.md` (size the request, research the repo and Mobbin per `../noon-ui/references/research.md`, clarify only blocking gaps, write the design direction, build with `../noon-ui/references/component-checklist.md`, validate). Its rules apply here unchanged; this skill's `spec.md` is the starting point for the design direction, and a port from bappzaar or Figma stays analyse → map → implement.

## Sources

| Source | Where |
|---|---|
| Brain card (read first) | `../noon-ui/resources/brain/flows/search.md` and `../noon-ui/resources/brain/flows/plp.md` — generated: every screen with its module, components, tokens, motion, nav in / out, tests and the spec / brief line ranges that describe it; `npm run brain -- context "<request>"` for the reading list, `npm run brain -- impact <entity>` before changing shared code |
| Branch briefs | `../noon-ui/resources/flows/search.md` and `../noon-ui/resources/flows/plp.md` — phase machine, results hand-off, PLP scroll states, pill row, grid swap |
| Flow specification | `spec.md` (screens, sections, data, navigation, motion, states, acceptance) |
| Figma analysis | None: there is no Figma for search. The code is the spec — `src/flows/search` and `src/flows/plp` are bappzaar 1:1 ports (`NoonSearchScreen`, `NoonSearchSuggestionRow`, `NoonRecentlySearchedModule`, `ListingScreen` → `NoonCatalogList`, `NoonFiltersScreenV2`) with the UI and motion of github.com/saswata2002/Brand-Widget-PLP (marketplace strip, brand widget, ProtoPie handoff timings in `handoff` + their `tokens.ts`) |
| Current implementation | `src/flows/search/` — `SearchScreen.tsx`, `data.ts`, `tokens.ts`, `components/` (`RecentSearches`, `SuggestionRow`); routes `search/search` (page `/search`), `search/suggestions` |
| Results implementation | `src/flows/plp/` — `ListingScreen.tsx`, `FiltersSheet.tsx`, `SortSheet.tsx`, `store.ts`, `data.ts`, `brands.ts`, `tokens.ts`, `components/` (`NavPills` → `RevealChip`, `SkeletonCard`, `MarketplaceStrip`; `BrandWidget` kept but not rendered); routes `plp/listing` (page `/plp`), `plp/filters`, `plp/sort` |
| World-class bar | `../noon-ui/resources/references/search.md` + `../noon-ui/resources/references/listing-filters.md` — the strongest screens from the reference set (Mobbin-linked), what makes them great, how to build it with noon; read before designing, then pass `../noon-ui/references/craft-rubric.md` against them before done |
| Design system | `../noon-ui/references/tokens.md`, `components.md`, `assets.md`, `motion.md`, `screen-recipes.md`, `flows.md` (Search and PLP blueprints) |

## Steps

1. **Pick the target** (say it in one line):
   - *Search variant*: a new screen beside `search/search` (or a new flow for a vertical search, e.g. grocery). Default, because `search/search` is the reference port.
   - *Replace search*: only when the user asks to update the search flow itself. Keep the route `search/search`, the page `/search` and the hand-off to `plp/listing`.
   - *Results variant*: a new screen beside `plp/listing` that reuses `plpStore`, `FiltersSheet` and `SortSheet`.
2. **Read** `spec.md`, then `src/flows/search/SearchScreen.tsx`, `data.ts`, `tokens.ts`, both `components/`, then `src/flows/plp/ListingScreen.tsx`, `store.ts`, `data.ts` and the two sheets.
3. **Plan the states** of the entry screen: empty query (presearch), typing (suggestions), no suggestion match, leaving (a pick on its way to results). They are one screen (presearch + fixed suggestion slots driven by variants), not separate routes.
4. **Build the header** with `SearchInput` (`src/components/SearchBar/SearchBar.tsx`), then presearch (`RecentSearches`, trending `Pill variant="tag"`), then the suggestion list (`SuggestionRow`). Reuse the flow components; add new ones in `src/flows/search/components/`.
5. **Hand off** every query (submit, recent tile, trending pill, suggestion row) through one `go(query)` that trims, fills the field, lets the rows leave and calls `nav.push('plp/listing', { query }, { transition: 'results-fade' })`. Results never live on the search screen; they look "in place" because the PLP draws the same `SearchInput` at the same spot.
6. **Tokens**: search-only values as `search*` keys in `searchTokens` (`src/flows/search/tokens.ts`), PLP-only values in `plpTokens` (`src/flows/plp/tokens.ts`). Section titles `Text variant="section" color="textStrong"`. Don't change central tokens or `SearchInput` defaults for this page.
7. **Motion**: the `handoff` language only (`src/motion/presets.ts`, recipes `BlurSwap` / `SkeletonReveal` / `SpringPager`): presearch ↔ suggestions, rows on `searchTokens`, PLP chips via `RevealChip`, cards via `SkeletonReveal` on `plpTokens.timeline` (`BrandWidget` only on a variant screen that brings the brand panel back; `spec.md` → Motion, `../noon-ui/references/motion.md` → "Search → results handoff").
8. **Register**: `ScreenDef` with `title`, `notes` (what to type, what to tap) and `source` (the bappzaar path, as `src/flows/search/index.ts` does). New screens get a page alias in `src/kit/routes.ts` when they need a friendly URL.
9. **Validate**, below.

## Rules specific to search

- The header is custom, never `<Header>`: a `bgSurface` block with `padding: calc(var(--nk-inset-top) + 4px) 16px 12px` around `SearchInput` (back, autofocus, `onSubmit`). The screen is `<Screen header={header} background="bgSurface">`.
- The search screen is pushed with `slide-left` (the noon search push on `handoff.spring`). Every search bar elsewhere (`SearchBarButton` on home, categories, deals; the PLP search pill) navigates to `search/search`; it never types in place.
- Suggestions come from `suggest(q)` in `data.ts` (8 max); the matched part is bold, `--nk-color-text-strong`; a product match shows its 48×48 `ProductImage`, a category shows "in {category}" in `--nk-color-badge`. The trailing arrow fills the input (`setQ(text + ' ')`) and does not navigate.
- An empty `RecentSearches` renders nothing (no empty title). Edit mode removes in place; it never navigates.
- Results: the PLP owns sort and filters through `plpStore`; sheets are separate stack entries and read/write the store, never component state. Filters edit a draft and commit only on "Show N results".
- Products from `src/data`; prices through `ProductCard` / `Price` (dirham sign). Copy short, sentence case ("Trending searches", "Search for “…”", "No results match your filters").

## Validate

```bash
npm run typecheck && npm run lint:tokens -- -v src/flows/search
npm run lint:tokens -- -v src/flows/plp
npm run check:routes
node .claude/skills/noon-ui/scripts/snap.mjs search          # presearch
node .claude/skills/noon-ui/scripts/snap.mjs plp             # listing + filters + sort sheets
node scripts/shot.mjs search/search /tmp/search-typing.png --click "input" --type "phone"
node scripts/shot.mjs plp/listing?query=phone /tmp/plp-brands.png --wait 2500
node scripts/shot.mjs search/search /tmp/search-edit.png --click "text=Edit"
node scripts/shot.mjs plp/listing /tmp/plp-sorted.png --wait 800 --click "text=Sort" --click "text=Price: Low to High"
```

Read every PNG against `spec.md` → Acceptance and against the code: header padding, recent tiles 75 wide with 1.2 image ratio, trending tag pills wrapping at gap 8, suggestion rows 44 high with the match bold, PLP search bar at the search screen's spot, marketplace strip, pill row (no brand panel) and the 2-column grid at gap 12. Then run `npm run skill:check` if you changed components, tokens or screens.
