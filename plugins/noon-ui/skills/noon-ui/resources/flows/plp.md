# plp: flow brief

Read with `resources/screens.md` and `src/flows/plp/MAPPING.md` (bappzaar master `e3eb49a2aae`). Skill: `/search` (results half). Snapshot from 2026-10-13.

## Screens

- `plp/listing`
  - URL `/plp` or `/listing`; default `{ query: 'Best sellers' }`.
  - Truth `bappzaar`, verified 2026-10-12.
- `plp/filters`: floating sheet (bappzaar NoonFiltersScreenV2, MAPPING.md → Filters sheet); one scroll of every group with a scroll-spy sidebar (Sort By first); the `facet` param picks the group it opens on (default Delivery). Sort is part of the draft and commits with Show N results.
- `plp/sort`: sheet.

## Anatomy of `plp/listing`

From top to bottom:

1. **Search bar** (read-only). It never moves.
   - It has a static shadow: 0 1 4 black .1, z 3.
   - A tap runs `editQuery`: `nav.back()` if the previous entry is `search/*`, otherwise `nav.push('search/search', { q })`.
2. **Hidable header** (absolute, under the bar): `MarketplaceStrip` and `CatalogListHeader`.
   - **`MarketplaceStrip`** is NoonFulfillmentTabs 1:1.
     - Tabs: noon, supermall, express, global, minutes; each 110 wide.
     - A 3 px indicator slides over 200 ms with inOut-quad. The first placement has no animation.
     - A tab that is off-screen scrolls into view with 60 to spare.
     - Tabs other than noon and express show a toast.
   - **`CatalogListHeader`** (pill row):
     - Pills in order: Filter · Sort · divider · Deals / Brand / Price facets (CMS PNGs in `src/assets/plp/navpills/`) · quick pills.
     - Quick pills are the top 8 brands, with the top category inserted after the third.
   - **`CatalogNavPill`**
     - Kinds: `filter | sort | facet | plain`; 30 high, r20.
     - The Filter icon is a DotLottie. Sort, chevron and ✕ are mask-tinted.
     - Every press fires `haptic('snap')`.
     - `play()` runs the filter attention animation: a segment travels round the border over 4.5 s, with a 1.04 pulse. It plays once, at 2 rAF + 1100 ms.
3. **Grid** of `ProductBoxVertical` (`src/components/ProductBoxVertical`, the NoonProductBoxVertical port).
   - The image box is 177×241, with a pager when there is more than one image.
   - `NudgeTicker`, coupon tag, express line.
   - The grid stretches the cells so both cards in a row match the taller one.
4. **Tab bar** in the footer. The dock rises 88 at .224 s, and `.tabSpace` reserves its height at the end of the grid.

## Scroll states (`src/flows/plp/scrollStates.ts`)

`usePlpScrollStates(scrollRef, active)` runs **two independent controllers** off one scroll:

- **Tab bar**: `TabBarScrollVisibility` from `src/kit/tabBarScroll.ts`, the ScrollVisibilityProvider constants.
  - It never hides within 20 of the end.
  - It animates over 0.15 s on `cubic-bezier(0,0,.58,1)`.
- **Header**: hides once you have scrolled down further than its measured height (initially 119).
  - It animates over 300 ms on RN `Easing.inOut(ease)`.
  - The height comes from a ResizeObserver, and a spacer of that height opens the list.

Both are MotionValues. They drive `--plp-tab-hide` and `--plp-header-hide`, so **scrolling never re-renders the screen**.

Resets:

- A push over the PLP releases the tab bar without animation.
- A filter or sort change scrolls to the top, calls `reveal()` and snaps the header back.

Not ported (both are off on master): idle auto-show, and haptics on scroll.

## Data and state

- `src/flows/plp/data.ts`:
  - `products`, `sortOptions`, `facets` (category, brand, price, rating, deals, delivery)
  - `applyFilters`, `applySort`, `countFilters`
  - a phone query lists Mobiles only, one brand at a time in turn;
  - `searchProducts(q)` returns the whole catalogue when there are fewer than 2 hits.
- `plpStore` (`createStore<{ sort, filters, query? }>`) is shared with the sheets, because they are separate stack entries.
- **Stale store on mount**: `ListingScreen` renders as reset until the `[query]` effect has called `plpStore.reset()`. Keep that `ready` guard.

## Motion

- **Timeline**: navAt .224 (rise 88) → chipsAt .48 (`RevealChip` drops 20 over its skeleton) → cardsAt .68 (rise 16).
- Only the first 8 cards animate.
- Everything under the bar fades in over 300 ms.
- **Filter change**: the grid dissolves into skeletons and swaps at .82 s, keyed by `epoch`.
- **Sort change**: the grid only reorders, with `layout="position"`.
- **FiltersSheet**: works on a deep-cloned draft and commits on "Show N results". The live count runs against the store query.
- **SortSheet**: commits at once and closes after 180 ms. The radio dot uses `layoutId="sort-radio"`.

## Gotchas

- `BrandWidget` and `brands.ts` are kept but unused; the "Shop phones by brand" widget was removed. Don't bring it back unless asked.
- Categories passes `categoryId`, and `ListingScreen` ignores it.
