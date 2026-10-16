<!-- planned: plp/noResults -->
# Search — flow specification

The contract a search or results build must meet. There is no Figma for search: the code is the spec. `src/flows/search` and `src/flows/plp` are bappzaar 1:1 ports, restyled and choreographed after github.com/saswata2002/Brand-Widget-PLP (marketplace strip, brand widget, the ProtoPie handoff motion: `handoff` in `src/motion/presets.ts`, `../noon-ui/references/motion.md` → "Search → results handoff"). Measurements below are read from the code on the 390pt kit device.

## Screens

| Route | Path | Presentation | What it is | Status |
|---|---|---|---|---|
| `search/search` | `/search` | push (`slide-left`) | Search entry: presearch (recent + trending) ↔ live suggestions, bappzaar `NoonSearchScreen` port on the handoff motion | exists — don't restyle unless asked |
| `plp/listing` | `/plp`, `/listing` | push (`push`; from search `results-fade`) | Results listing (`defaultParams: { query: 'Best sellers' }`), bappzaar `ListingScreen` → `NoonCatalogList` port with the Brand Widget PLP header (marketplace strip + pill row; the brand panel is no longer rendered) | exists |
| `plp/filters` | `/filters` | sheet | Filters sheet (`{ facet? }`), draft → commit | exists |
| `plp/sort` | `/plp/sort` | sheet | Sort sheet, radio list | exists |
| `search/suggestions` | `/search/suggestions` | push (`slide-left`) | `SearchScreen` opened in the typing state (`defaultParams: { q: 'phone' }`; `SearchScreen` reads `q`) so it opens by URL and snaps | exists |
| `plp/noResults` | `/plp/noResults` | push (`push`) | `ListingScreen` for a query with no hits (`searchProducts` must stop falling back to the full catalogue for it) | to build |

## Search entry (top to bottom)

| # | Part | Kit | Spec |
|---|---|---|---|
| 1 | Header | custom block in `SearchScreen.tsx` + `SearchInput` (`src/components/SearchBar/SearchBar.tsx`) | `ref.color('bgSurface')`, padding `calc(var(--nk-inset-top) + 4px) 16px 12px`; back arrow, autofocus, placeholder "What are you looking for?", camera icon swaps to a clear (x) once the value is non-empty; Enter → `onSubmit` |
| 2 | Recent searches | `RecentSearches` (`src/flows/search/components/RecentSearches.tsx`) | title "Recent Searches" `Text variant="section" color="textStrong"` + Edit / Done; `nk-hscroll` gap 12, padding `0 16px`; tiles `searchTokens.recentItemWidth` (390 ÷ 5.2 = 75) wide, image h = w × 1.2, r = w ÷ 10, per-item tint, overlay `--nk-color-image-overlay`, 2-line label in `--nk-palette-new-black` |
| 3 | Trending searches | `Text variant="section"` + `Pill variant="tag" icon="trendingUp"` (`src/components/Pill/Pill.tsx`) | title padding `0 16px`, gap 12 to the pills; pills wrap, gap 8, padding `0 16px` |
| — | Presearch layout | `motion.div` in `SearchScreen.tsx` | column, gap 24 between sections, `paddingTop: 8` |
| 4 | Suggestions (typing) | `SuggestionRow` (`src/flows/search/components/SuggestionRow.tsx`) in 8 fixed slots, each wrapped in `BlurSwap` | overlays presearch (absolute), list padding `4px 12px`, rows 8 apart; row min-height 44 (`searchTokens.suggestionRowHeight`), r12; 48×48 `ProductImage` (r6, `--nk-color-border-subtle` border) or 18px search icon; text `body` in `--nk-color-text-legacy`, match bold 700 `--nk-color-text-strong`; "in {category}" `text12MediumLh16` in `--nk-color-badge`; trailing `arrowUp` rotated −45° in `--nk-color-text-secondary` |
| 5 | No suggestion match | one `SuggestionRow` | text `Search for "{q}"`, padding `24px 4px`, fades in; press → results for `q` |

Rows 2–3 show only while the trimmed query is empty; row 4 replaces them while typing.

## Results listing (top to bottom)

| # | Part | Kit | Spec |
|---|---|---|---|
| 1 | Header | `plp.module.css` `.header` → `.barBlock` (search bar) + `.hidable` (strip + pills) | bappzaar NoonCatalogList: `.barBlock` `padding-top: var(--nk-inset-top)`, white, shadow `0 1px 4px` `--nk-palette-black-alpha10` above the strip (searchContainer, static); `.hidable` = HidableView, an overflow-hidden layer hanging under the bar over the list, `.hidableInner` white + `1px 1px 3px` `--nk-palette-black-alpha4`; the list opens with a spacer of the measured header height. Scroll states: Motion → PLP scroll states |
| 2 | Search bar | `.barRow` + `SearchInput value={query} onBack onFieldPress` | padding `4px 16px 0` under the inset: the same spot as the search screen's bar, so the hand-off never moves it; tap the field → back to editing (pop to search, or push `search/search { q }`) |
| 2b | Fulfilment tabs | `MarketplaceStrip` (`src/flows/plp/components/MarketplaceStrip.tsx`), bappzaar `NoonFulfillmentTabs` 1:1 | white, paddingTop 8; 110-wide tabs, gap 12, padding 0 16, min height 55; 24 logo slot + 12/17 black name, gap 2; 3px r2 black indicator slides 200ms; tap → haptic, scroll into view (60 spare), `onSelect`. noon tab = mpcms logo 105×24 (`src/assets/plp/fulfillment/noon-wide-assortment.png`) + "Wide assortment"; the facet tabs use the kit marketplace pills at 70×20 (the API's `fulfillment` facet logos need the app experiment) |
| 3 | Pill row | `CatalogListHeader` (`src/flows/plp/components/CatalogListHeader.tsx`) → `CatalogNavPill` (bappzaar `NoonCatalogListNavPill` pill redesign, 1:1), each in a `RevealChip` | order (NoonCatalogList.renderHeader with fulfilment tabs): Filter · Sort · divider (1×24 lightGrey, margin 0 8) · facet dropdowns Deals · Brand · Price (CMS icons in `src/assets/plp/navpills/`) · quick pills (brands by result count, top category after the third). No express pill. Row gap 8, padding 12 15. Pills 30h r20 13/500; action pills paleBlue when on + count bubble; facet chevron + count bubble; plain selected = lavender border + thin ✕. Idle Filter pill plays NoonFilterPillAnimation once (stroke round the border, 4% pulse, glass glow, `filter-pill.lottie`) |
| 4 | Meta line | `Text variant="caption" color="textSecondary"` in `.meta` | "Searching…" while loading, then "{n} results for “{query}”", query bold in `--nk-color-text-primary` |
| 4b | Brand widget | Not on `plp/listing` (removed). `BrandWidget` (`src/flows/plp/components/BrandWidget.tsx`) + `brandWidgetFor` (`src/flows/plp/brands.ts`) stay in the flow for a variant screen that wants "Shop phones by brand" | — |
| 5 | Grid | `.grid` + `ProductBoxVertical` (bappzaar `NoonProductBoxVertical` isPLP, 1:1) in `SkeletonReveal` (`src/motion/recipes.tsx`) | 2 columns, gap 12, padding `2px 12px 50px`; each card over a `SkeletonCard` (`src/flows/plp/components/SkeletonCard.tsx`) |
| 7 | Bottom nav | `TabBar active="home"` in the footer (`.navDock`) | rises 88px at +224ms; content ends with a tab-bar spacer |
| 6 | Empty (filtered) | `.empty` | 🔍, `Text variant="section"` "No results match your filters", `Pressable` "Clear all filters" in `--nk-color-brand-blue` |

## Sheets

| Sheet | Kit | Spec |
|---|---|---|
| Filters (`plp/filters`) | `FiltersSheet.tsx` + `filters.module.css` | bappzaar NoonFiltersScreenV2 1:1 (`src/flows/plp/MAPPING.md` → Filters sheet; ref `visual/refs/plp-filters.png`): floating sheet (`inset 8`, `bottomGap 36`, 85% of the screen above it, handle closes, no close button); title "Filters"; "Search across filters" (sidebar slides out, matches bold, empty state, Clear selection); 25% sidebar starting with Sort By, blue dot on groups with a value; ONE scroll of every group (sticky grey headers, sidebar tap scrolls + flashes, scroll-spy): Sort By pills, Delivery fulfilment cards (supermall / express / Global), Arrives by, Category (leaf), Brand, Price range, Product Rating cards, Deals; options scoped to the query's results; footer Clear All (0.4) / Show N results (0.6, "4K+"), 56h r14 |
| Sort (`plp/sort`) | `SortSheet.tsx` | "Sort by" `titleSmall` `textMuted`; six `sortOptions` rows padding `14px 16px`, selected 600 in `--nk-color-brand-blue`; 20px radio ring `--nk-color-border-strong`, dot shared via `layoutId="sort-radio"` |

## Data

- Search (`src/flows/search/data.ts`): `recentSearches` (`{ id, label, emoji, tint }`, 6 items; tints are per-item mock server data with `token-lint-ignore`), `trending` (8 strings), `suggest(q)` → up to 8 `{ text, category?, product? }` from `src/data` plus generic terms.
- Results (`src/flows/plp/data.ts`): `products` (shared catalogue + `phoneProducts` from `src/data/products` (collection `phones`), 48 phones, 4 per brand, `productById` finds them), `isPhoneQuery`, `searchProducts(query)` (phone queries → every `Mobiles` product, one brand in turn; otherwise falls back to all products under 2 hits), `facets` (category, brand, price, rating, delivery), `applyFilters`, `sortOptions` / `SortId`, `applySort`, `countFilters`.
- Shared state (`src/flows/plp/store.ts`): `plpStore.get / set / reset`, `usePlpStore()` → `{ sort, filters, query }`; reset whenever `query` changes.
- Copy: short, sentence case, as in the code ("Recent Searches", "Trending searches", "Search for “…”", "Searching…", "Show N results", "Clear All").

## Navigation

| From | Action |
|---|---|
| Any search bar (`SearchBarButton` on home, categories, deals; PLP search pill) | `nav.push('search/search')` |
| Submit (Enter), recent tile, trending pill, suggestion row, "Search for …" | `go(q)` → field fills, rows leave fast, then `nav.push('plp/listing', { query: q.trim() }, { transition: 'results-fade' })` (ignored when empty) |
| Back from the PLP | the PLP fades out, the search rows fall back in, the field is focused |
| PLP search bar | `nav.back()` when it came from search, else `nav.push('search/search', { q })` |
| Brand card "View {brand}" / Clear | `plpStore.set({ filters: { …, brand: [brand] } })` / `brand: []`; the widget follows `filters.brand` (also from the Filters sheet) |
| Marketplace noon / express | express delivery filter off / on; supermall, Global, Minutes → `nav.toast` |
| Suggestion fill arrow | `setQ(text + ' ')` (stays on search) |
| Recent "Edit" / delete badge | toggle edit mode / remove the tile in place |
| Back arrow, clear (x) | `nav.back()` / `onChange('')` |
| PLP Filter pill / facet pill | `nav.sheet('plp/filters')` / `nav.sheet('plp/filters', { facet })` |
| PLP Sort pill | `nav.sheet('plp/sort')` |
| PLP express pill | `plpStore.set({ filters })` inline |
| PLP bottom nav | `TabBar` → `nav.switchTab` (Cart is there; the header cart button is gone) |
| Product card | PDP (`pdp/detail` with `productId`, the card's default press) |
| Filters "Show N results" / Sort option | `plpStore.set(…)` then `nav.back()` / `setTimeout(nav.back, 180)` |

## Motion

The search → PLP motion is specified end to end in the noon X Supermall spec: follow `../noon-ui/references/motion.md` → "Which motion for which moment" and the **Search push**, **Suggestions**, **PLP load**, **Inline banner** and **Select / unselect filter** choreographies (`supermall.*` + `handoff.*` presets, haptics per beat).

All values: `handoff` (`src/motion/presets.ts`), `searchTokens`, `plpTokens.timeline` / `swap` / `brandWidget` / `ticker`; the full moment-by-moment table is `../noon-ui/references/motion.md` → "Search → results handoff (Brand Widget PLP)".

| Moment | Kit |
|---|---|
| Search push | `transition: 'slide-left'` (`handoff.spring`, under `x: '-52%'`) |
| Presearch | rises 20px at `presearchPushDelay` (0.124) on push; sinks 20px on the first keystroke; back `presearchGap` (0.04) after the last row left |
| Suggestion rows | fixed slots with variants `in` / `out` / `gone` / `fast`: fall from `y: -20` 110ms after typing, 60ms apart (`handoff.spring` + 183ms `handoff.easeOut`); changed rows `BlurSwap` (28ms cascade, `settleMs` 60 debounce); out bottom → top 40ms apart; exit into results 25ms apart, 130ms fade, 12px |
| Field fill | `SearchInput fill={{ from, key }}`: typed part holds, the rest fades in 320ms |
| Search → PLP | `results-fade` (0.3s `handoff.easeInOut`), pushed 10ms after the rows have left |
| PLP chips | `RevealChip`: `chipsAt` 0.48 + `i * 0.06`, drop 20px on `handoff.spring`, S-curve fade, skeleton pill fading with it |
| Skeleton → cards | `SkeletonReveal`: `cardsAt` 0.68 + `i * 0.06`, rise 16, skeleton fades 0.353 later, first 8 |
| Bottom nav | rises `navRise` 88 at `navAt` 0.224 |
| PLP scroll states | bappzaar master 1:1 (`src/flows/plp/MAPPING.md`, `usePlpScrollStates` in `src/flows/plp/scrollStates.ts`, values `plpTokens.scroll`), off `<Screen onScroll>` into motion values (no re-render). **Tab bar** (ScrollVisibilityProvider): shown while y < 150 (and ≤ 10); past that, 64 of continuous scroll down hides it, 24 up shows it; deltas < 4 ignored; a touch release faster than 2 px/ms hides / shows; within 20 of the end it never hides and an up-bounce doesn't show it; slides by its height + inset in 0.15s (`duration.fast`) cubic-bezier(0, 0, 0.58, 1). **Header** (HidableView, strip + pills, search bar fixed): hides when scrolling down more than its height (≈117) past where the down run began and y > height; shows after scrolling up more than its height or y < height; translateY −100% in 0.3s (`duration.medium`) RN `Easing.inOut(Easing.ease)`. Filter / sort change → list to top, bar shown, header snapped in; a pushed screen / sheet releases the bar (shown, no animation). Reduced motion → instant. No haptics |
| Brand widget | reveal once the cards land (grid pushed by a transform), `SpringPager` rail, select / clear morph on `handoff.springs.morph`, coin pop `springs.pop` |
| Filter / brand change | cards dissolve into skeletons (0.18s), new list rises at `swap.revealAt` 0.82 |
| Sort reorder | `motion.div layout="position"`, 0.36s `[0.4, 0, 0.2, 1]` |
| Recent edit mode | tiles shift `y: 9`, wobble ±2° at 3Hz (`repeat: Infinity`, phase `(i % 3) * 0.08`); delete badge scales in 0.2s; removed tile exits `scale: 0.6` |
| Filters | facet swap `AnimatePresence mode="wait"` (x 12 → 0, 0.18s); "Show N" count drops in on change |
| Press | `Pressable` (`scale={0.98}` on rows, 0.97 on brand CTA / Clear), `Pill` press scale |

## States

| State | Spec |
|---|---|
| Empty query | presearch: `RecentSearches` (hidden when no recents) + trending pills |
| Typing | up to 8 `SuggestionRow`s, match bold (`search/suggestions` for snapshots) |
| No suggestion match | single "Search for “{q}”" row that still searches |
| Loading results | "Searching…" meta until `cardsAt`; chip and card skeletons under the content |
| Brand selected | 60h "{brand} selected" bar, grid filtered to the brand; Clear restores the panel |
| No results (filtered) | PLP `.empty` with "Clear all filters" |
| No results (query) | today `searchProducts` falls back to the whole catalogue; a true zero-hit page is `plp/noResults` (to build) on `.empty` with a "Try a different search" action → `nav.push('search/search')` |

## Acceptance

- [ ] Routes registered; `/search` and `/plp` open the screens; `check:routes` clean.
- [ ] Header is `SearchInput` in the custom `bgSurface` block; no `<Header>` on search.
- [ ] Presearch: recents 75 wide, image ratio 1.2, edit mode wobbles and deletes; trending `Pill variant="tag" icon="trendingUp"`, gap 8.
- [ ] Typing swaps to `SuggestionRow`s that stagger in with `searchTokens.rowEnterDelay` / `rowStagger`; match bold; fill arrow doesn't navigate.
- [ ] Every query path goes through `go()` → `plp/listing { query }`; nothing dead.
- [ ] PLP: search bar at the search screen's spot, `MarketplaceStrip`, `RevealChip` pill row, `SkeletonReveal` `ProductBoxVertical` grid (2 cols, gap 12, 177 × 241 image boxes, equal-height rows), sort reorders with layout, filters commit only on Show.
- [ ] Tokens only (`lint:tokens` 0 for `src/flows/search` and `src/flows/plp`); new values are `searchTokens` / `plpTokens` keys.
- [ ] Screenshots read for presearch, typing ("phone"), edit mode, listing ("phone", with a brand quick pill selected), filters and sort.
- [ ] `source` = the bappzaar path (no Figma).
