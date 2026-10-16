# Listing and filters

The listing turns "I searched" into "I found it": a dense, even grid (or list) the eye can scan in rows, with the
controls to narrow it one tap away and always honest about what's applied. Great listings put applied filters *on the
page* as removable chips with counts, give the filter sheet a live result count on its primary button ("Show 45 homes"),
and keep cards to a fixed number of lines so rows align. Average listings hide state inside a "Filter" button, make the
user apply blind and let every card grow its own badges.

## References

| App · screen | What it does | Why it's world-class |
|---|---|---|
| [Zara · search results grid](https://mobbin.com/screens/919d186a-31b4-4a88-b683-6f4c6f9db97b) | Back arrow, text actions "VIEW 2" and "FILTERS" top right; query row "T SHIRT" with ×; WOMAN / MAN / KIDS tabs and a second row of age tabs; 2-column grid of tall images with a tiny "+" on the image, then a 1-line title, bookmark glyph and price | The product is 85% of the card: two lines of text, one quick-add glyph, one save glyph. Grid density is a user control (VIEW 1 / 2 / 3), and with a filter applied the label becomes "FILTERS [1]" ([screen](https://mobbin.com/screens/2eec92e8-249f-42be-90bd-a759476e1305)) |
| [Amazon · results with applied chips](https://mobbin.com/screens/411716ec-80eb-4b50-a2f6-3f02c11b47de) | Search field; a "Delivering to …" strip; a filter button showing "4"; a Prime toggle; chips "Up to $2,850", "Up to $25", "1 Color ⌄", "1 Gemstone Shape ⌄"; 2-column cards with Sponsored label, price, delivery dates, "See options" | Applied filters stay visible as chips on the results with counts inside the chip ("1 Color"), so the state is readable without opening anything; the filter button carries the total |
| [Amazon · filter sheet with chips](https://mobbin.com/screens/785ffca1-4942-4306-ac61-1875af1d65b6) | Sheet over the results (applied "LANEIGE", "Beauty", "Filters (2)" visible behind); sections Department and Brands as wrap chips, selected chip outlined, "See more" after ~15 brands; footer "Clear Filters" + "Show results" | Chips instead of checkbox lists make 15 brands fit one screen; each section collapses; long lists truncate with "See more" instead of scrolling forever |
| [Amazon · filters with side rail](https://mobbin.com/screens/7ed27f53-d87a-465c-a3a5-401dc84a94ee) | Full-screen Filters: left rail of facets (Brands, Gold Karatage …, Sort by) with an active bar; right pane "Sort by" as chips (Price: High to Low selected); footer "Clear Filters" + "Show 10,000+ results" | For 15+ facets a two-pane layout beats a long accordion; the rail shows a count next to facets in use ("Price & Deals 1", [screen](https://mobbin.com/screens/5192e9e0-b783-442e-bfb7-50d6d473577d)); sort lives with the filters as one more facet |
| [Airbnb · filters sheet](https://mobbin.com/screens/7f04f4bf-bdfd-4dcd-ad10-2b4225a08b7f) | Sheet titled "Filters" with ×; Price range histogram with two handles and Minimum / Maximum fields; Rooms and beds as −/+ steppers; Amenities chips; footer "Clear all" text + "Show 45 homes" dark button | The primary button is the live result count, so every change previews its outcome; the histogram shows where the inventory is before you drag. Sections are separated by hairlines and a bold 20-ish title, no cards. Top of the same sheet: "Recommended for you" tiles + a segmented "Type of place" ([screen](https://mobbin.com/screens/58cf5678-dab9-43fa-a32f-50a5c2c9498d)) |
| [Snoonu · grid with removable chips](https://mobbin.com/screens/1b6d5df5-1d61-40f4-92ed-38b0fad99484) | Field "Search in Electronics"; a filter icon with a red dot; filled chips "↑↓ Price: Low to High ×" and "Apple ×", then an unselected "Promo" chip; 2-column grid with a "89%" corner badge, round "+" add on the image, price + struck price, 2-line title | Regional peer doing the noon pattern well: sort and filters are the same chip vocabulary, applied ones are filled with an inline × to remove in one tap, unapplied ones stay outlined in the same row |

## What great looks like (the bar)

- **Applied state is on the page:** applied filters render as filled chips with × or a count ("1 Color", "Filters (2)",
  "FILTERS [1]"); the filter entry shows the total. Nothing applied is only visible inside the sheet.
- **One chip row** under the header: filter entry first, then sort, then 3–6 quick facets; it scrolls sideways and sticks
  under the header on scroll.
- **Fixed card anatomy, fixed height:** image (square or 3:4, the same for the whole grid), ≤ 2-line title, price line, at
  most one badge on the image and one action ("+" or heart). Rows align across columns.
- **2 columns on a ≈ 12–16 side margin with a ≈ 8–12 gutter**; image tiles share one background tone so packshots and
  lifestyle shots read as one grid.
- **Filter sheet footer is always "Clear all" (text/secondary) + one primary with the live count** ("Show 45 homes",
  "Show 10,000+ results").
- **Facet controls match the data:** chips for brands/departments (truncate after ~12–15 with "See more"), range slider
  + min/max for price, steppers for counts, segmented for 2–3 exclusive types. Over ~10 facets, use a side rail.
- Sort is a single-choice list or chips in its own small sheet or a facet in the filter sheet, never a page.

## Build it with noon

| Element | noon component / token | Note |
|---|---|---|
| Results card | `ProductBoxVertical` (`isPLP`) with `EtaBadge`, `WishlistHeart`, `QuickAdd` | Don't add per-card badges beyond the bappzaar slots |
| Chip row (filter, sort, facets) | `Pill variant="fieldChip"` in `PillRow` (`selected`, `count`, `onClear`) | Filter entry shows `count`; applied facets `selected` + `onClear` |
| PLP nav pills / category strip | flow-local `NavPills`, `CatalogNavPill`, `MarketplaceStrip` (`src/flows/plp/components/`) | Sticky under the `Header` |
| Filter sheet | flow `FiltersSheet` (`src/flows/plp/FiltersSheet.tsx`); new sheets: `SheetHeader` / `SheetBody` / `SheetFooter` (presentation `sheet`, Origin) | Grabber ⇒ no close X |
| Sheet footer with live count | `SheetFooter layout="split"` (or `ActionBar layout="split" tone="neutral"`): secondary "Clear all", primary "Show N results" | Recompute N on every change |
| Facet controls | `Checkbox variant="field"`, `Radio`, `Segmented variant="field"`, `Pill`, `QuantityStepper` | Chips for brands, radio for sort |
| Sort sheet | flow `SortSheet` | Single choice, closes on select |
| Loading / empty | flow `SkeletonCard`, `Skeleton` | Skeleton grid in the card's exact shape |
| Grid rhythm | `var(--nk-space-s12)` margin and gutter | Same for every row |

## Avoid

- A "Filter" button that gives no hint of what's applied; applying blind with a generic "Apply".
- Cards of different heights because one has a badge, a coupon, a rating and a delivery line and its neighbour has none.
- Checkbox lists of 60 brands with no search or "See more".
- Sort and filter as two unrelated UI styles (a dropdown here, a sheet there).
- Three badges stacked on the image corner; one at most.
- Closing the filter sheet resets the scroll position of the results.

Last researched: 2026-10-14
