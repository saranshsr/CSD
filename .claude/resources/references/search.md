# Search

Search is two screens in one field: an **empty state** that does the typing for the user (recents, trending, recently
viewed, suggested queries) and a **typing state** that completes the query faster than they can type it. Great search
opens with the keyboard up and the field focused, makes every row one tap to results, shows the user's own words in
regular weight and the completion in bold, and lets a suggestion be refined (fill the field) without being submitted.
Average search opens to a blank page under a field, or shows suggestions that look identical to recents.

## References

| App · screen | What it does | Why it's world-class |
|---|---|---|
| [Amazon · suggestions as you type](https://mobbin.com/screens/17aa2813-c2b4-4dc3-bb8e-e0146285cbbf) | "jewelry" typed; 7 rows, each with a product thumbnail or a search glyph, "jewelry **box**", "jewelry **organizer**" …, and a ↖ fill arrow on the right; below, an "Ask Rufus" group of 3 question bubbles | Typed text regular, completion bold, so the eye reads only what's new. The ↖ arrow refines (puts the suggestion in the field) while the row submits: two intents, no ambiguity. Thumbnails mark rows that resolve to a product type |
| [Airbnb · typing with matches](https://mobbin.com/screens/e419a24e-88d9-4d59-966a-aa39e3f04d78) | Sheet with a bordered field "Airport" + clear ×; rows with a square pin tile, primary line ("John F. Kennedy International Airport (JFK)") and a grey secondary line (Queens, NY); partial matches bold the unmatched remainder ("Airport **Transfer JFK ISP LGA EWR**") | Two-line rows with a fixed leading tile give each suggestion a type and a disambiguator; clear × appears only once there is text |
| [Airbnb · Where? empty state](https://mobbin.com/screens/90dbb9a6-6cd6-4ae9-9cb5-f829336fdbb7) | Large "Where?" title, field "Search destinations", "Suggested destinations" with "Nearby · Find what's around you" first, each row with a reason ("Popular lake destination", "For sights like Walt Disney World Resort"); collapsed "When / Who" rows; footer "Clear all" + one "Search" button | Every suggestion says *why* it's suggested; the location shortcut is the first row; the rest of the search is collapsed into one-line steps so the screen has one question |
| [Instacart · top searches and trending](https://mobbin.com/screens/4a8ac0fc-eaa8-47be-bd18-80cf48976f55) | Field at top with cart icon; "Top searches" 4-column grid of product-image tiles with a one-word label (milk, eggs, flowers, bananas …); "Trending" grid; "Beyond grocery" | Trending is visual, not a word cloud: an image per query makes 16 queries scannable in one screen; labels are 1–2 lowercase words, exactly what a user would type |
| [Apple Store · search home](https://mobbin.com/screens/d798a4d3-8f8e-4c28-8685-93aadc523a8c) | Large "Search" title; "Recently Viewed" product card with a "Clear" link; "Try Searching" grouped list (Mother's Day Gifts, iPhone 17 Pro …) with magnifier glyphs; the search field floats at the bottom with a mic | Recently *viewed* (products) and *try searching* (queries) are separate groups with different shapes, so nothing is ambiguous; the field sits where the thumb is |
| [IKEA · recently searched](https://mobbin.com/screens/fc1d9403-042c-4a2f-bacd-1b455c19ec4a) | Field + "Cancel"; a tip line with bold example queries; "Recently searched" as wrap chips (fork, spoon, decor, vase …) with "Clear all" on the right; a quiet note on how history is used | Recents as chips fit 7 queries in 3 rows; "Clear all" is a single right-aligned text action, not per-chip clutter; the privacy note is one muted line |

## What great looks like (the bar)

- **Field focused, keyboard up on entry**; clear × only when the field has text; one exit (back arrow or "Cancel"), never both.
- **Empty state is never blank:** recents first (user's words), then trending / top searches, then recently viewed
  products. Each group has a bold title and at most one text action ("Clear all" / "Clear"), right-aligned.
- **Recents as wrap chips (≈ 6–10 visible), trending as images or chips**; the two never share a look (Apple: product
  card vs query list; Instacart: image grid).
- **Suggestions: typed part regular, completion bold** (Amazon, Airbnb). Row height uniform, ≈ 7–8 rows above the keyboard.
- **One leading glyph per row type:** magnifier = query, thumbnail = product/category, pin/clock = place/history. A
  trailing ↖ fill arrow refines without submitting.
- **Suggestions that carry context** get a second grey line or a reason (Airbnb), never a third line.
- **Every row is one tap to results**; the keyboard "search" key submits the raw text.

## Build it with noon

| Element | noon component / token | Note |
|---|---|---|
| Search field (focused) | `SearchInput variant="field" fieldSize="H48" iconRight` | Clear × only with text; back via `Header` or `IconButton variant="fieldGhost"` |
| Recent searches (chips + edit) | flow-local `RecentSearches` (`src/flows/search/components/`) | Wrap chips; "Clear all" / edit as `Button variant="noonGhost"` |
| Trending queries | `Pill` in `PillRow`, or an image grid of `ProductImage` tiles + `Text variant="caption"` | Image tiles when queries map to a category |
| Suggestion rows with bold match | flow-local `SuggestionRow` | Typed part `textSecondary`/regular, completion bold via `HtmlText` `<b>` |
| Recently viewed products | `SkuCard` rail | Separate group, product shape, not a query row |
| Group titles | `<Text variant="section">` | Same title style for every group |
| Results hand-off | `nav.push('plp?query=…')` (`src/kit/routes.ts`) | PLP owns filters; see `listing-filters.md` |
| Loading suggestions | `Skeleton` rows | Never a centred spinner in the list |

## Avoid

- A blank page under the field, or a "Start typing to search" message instead of recents and trending.
- Recents and suggestions in the same row style, so the user can't tell history from completion.
- Bolding the typed text (the part the user already knows) instead of the completion.
- Per-row × on every recent plus a "Clear all" plus an edit mode all at once; pick one.
- Suggestion rows with price, rating and image like a product card; that's a results page.
- Three exits (back, Cancel, close) on one screen.

Last researched: 2026-10-14
