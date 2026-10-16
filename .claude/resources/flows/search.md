# search: flow brief

Read with `../screens.md`. Skill: `/search`. There is no MAPPING.md: geometry follows bappzaar (NoonSearchScreen), and motion follows the Brand-Widget-PLP ProtoPie handoff. Snapshot from 2026-10-13.

## Screens

- `search/search` (`/search`) and `search/suggestions` (`{ q: 'phone' }`) are the **same `SearchScreen`**. Both push with `slide-left`.
- Truth is `bappzaar`, verified 2026-10-12.

## Pieces

- **`SuggestionRow`** (`src/flows/search/components/SuggestionRow.tsx`)
  - A 44-high r12 row with a 48×48 product thumb or a search icon.
  - The match is bold through `Highlight`, with an optional "in {category}" line.
  - A ↗ fill arrow calls `stopPropagation` and then `onFill`.
- **`RecentSearches`**: emoji tiles, w = 390 / 5.2, h = w × 1.2, radius w / 10.
  - Edit mode drops the tiles by 9, wobbles them ±2° at 3 Hz, and shows delete badges.
- **Data** (`src/flows/search/data.ts`):
  - `recentSearches` (6) and `trending` (9).
  - `suggest(q)` returns up to 8 terms, prefix matches first.
  - There is no store; state is component-local.
- **Tokens**: `searchTokens` holds `maxRows` 8, `rowStagger` .06, `rowOutStagger` .04, `settleMs` 60, `presearchPushDelay` .124 and others.

## Mechanics to preserve

- **Phase machine**: `idle | showing | hiding | leaving`, kept in a ref so timers can read it safely.
- **Rows**: 8 fixed slots plus `lastShown` keep content alive while a row animates out. `BlurSwap` keyed by `epoch` cross-fades changed rows.
- **Picking a suggestion**: `SearchInput` `fill={ from, key }` keeps the typed part and fades in the rest (`src/components/SearchBar/SearchBar.tsx`).
- **No match**: the list shows a single `Search for "q"` row, which searches the raw query.
- **Hand-off to results**:
  1. Wait for the rows to exit.
  2. Call `nav.push('plp/listing', { query }, { transition: 'results-fade' })`.
  3. `preloadRoutes` fetches `plp/listing` and `pdp/detail` on mount, so there is no empty frame.

  `results-fade` doesn't fade the incoming layer; the PLP fades in only what sits under its bar. The search bar is drawn at the same spot on both screens, so it doesn't move.
- **Back from PLP**: when `isTop` turns true again, the phase resets to idle, the input refocuses and the rows re-enter.
- **Entry points**: home `HomeHeader`, classic home, deals, categories, the PDP `SfHeader` and wishlist. All of them call `nav.push('search/search')`.
