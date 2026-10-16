# Home / discovery feed

The home feed answers three questions in the first screen, in this order: *where am I shopping to* (address), *how do I
find a thing* (search), *where do I go next* (a scannable grid of destinations), and only then sells (hero, offers,
rails). Great feeds keep that top block fixed in shape and let everything below it be personal and live: an order in
flight jumps above the promos, the placeholder in the search pill rotates, rails are ranked and titled for a reason
("Top 10 … Most ordered this week"). Average feeds open with a full-width banner and push the grid below the fold.

## References

| App · screen | What it does | Why it's world-class |
|---|---|---|
| [talabat · home](https://mobbin.com/screens/8925472d-1fb8-4a57-8038-6ec792abfa27) | Coloured header with "Deliver to Doha Port ⌄" and a full-width search pill ("Search for Pizza"); a 4×2 grid of verticals (Food, talabat mart, Groceries, Pharmacies, Stores, Flowers, Electronics, More), then a "pro" deals rail of store cards; a dismissible orange "3 FREE deliveries" strip pinned above a 3-tab bar | The whole job fits above the fold: address, search and 8 destinations before any promo. Grid tiles carry a single tiny tag ("Up to 60%", "Fastest") instead of a banner each, and the 8th cell is "More", so the grid never scrolls sideways |
| [talabat · home with live order](https://mobbin.com/screens/cd49f831-a62c-49c0-9205-04f558b27e68) | Same top block; an "Arrives in 9 mins · On time" card with a 4-step tracker is inserted between the grid and the deals | State beats promotion: an active order takes the first content slot, under the grid, without changing the header. The placeholder in the search pill also changes between visits ("Flowers" / "Pizza") |
| [Instacart · store home](https://mobbin.com/screens/658e10c4-71fb-4618-9928-588c3625d5f1) | "1226 University Drive ⌄" with profile + cart icons, search "Search products, stores, and recipes", a 5-item icon row (Grocery … Retail), a credits card with "7 days left", filter pills (Offers, Pickup, EBT, No markups), a 4-column store-logo grid with an ETA or a yellow tag under each, the 12th cell "Show all 126 stores" | Every grid cell has exactly one line of meta (an ETA *or* a deal tag), so 11 stores read in one glance. The "Show all" cell sits in the grid itself, the same size as a store, not as a link under it |
| [Uber Eats · home feed](https://mobbin.com/screens/520ada74-77d2-45ce-b42a-cbfaf4566bd9) | "Home ⌄" + bell; a vertical switcher (All, Rides, Grocery, Convenience); a category icon row; filter pills; "Featured on Uber Eats" with a round → button over large image cards (name, membership line, rating, minutes, heart); "Stores near you" as round logos; a floating tab bar whose centre is a Search pill | Search moves to the thumb: the tab bar carries the search pill, so the header stays a two-item line. Section titles are large bold with a single round "→" as the only "see all" affordance, the same on every rail |
| [Uber Eats · ranked rail](https://mobbin.com/screens/e00d7b76-1aad-432d-aa66-e7feae2edb00) | "Top 10 Fast Food spots / Most ordered this week" with big outlined rank numerals (1, 2) overlapping portrait cards; next section "Buy 1, get 1 free" with offer flags on landscape cards | Each rail has a reason in its subtitle and its own card shape (portrait ranked vs landscape offer), so consecutive rails don't blur into one; the next rail always peeks |
| [Careem · super app home](https://mobbin.com/screens/d9486a99-0b92-4452-8cb2-57d645cbdf68) | A hero area with search "Discover food" + menu, an "Arrives in 1 minute" tracker over the hero; then a white sheet with two rows of service tiles (Rides, Food, Quik, Pay … with "500 Off" tags) that scroll sideways; a utility row (Balance, Ride to, Salik); offer banners | The service grid sits on a raised r-top sheet over the hero, so brand moment and utility coexist; the utility row (balance, last destination) turns the home into a shortcut surface, one tap to a repeat action |

## What great looks like (the bar)

- **Top block in a fixed order:** address line (one line, place name bold, chevron) → full-width search pill → destination
  grid. All three are visible on first paint without scrolling, on every reference.
- **Destination grid of 8–12 equal cells** (talabat 4×2, Instacart 4×3, Careem 2 rows): one image, one label (≤ 2 words),
  at most one small tag per cell. The last cell is "More" / "Show all N" in the same cell shape.
- **Live state outranks promos:** an active order / ETA card goes directly under the grid (talabat, Careem) and the header
  never changes shape to make room.
- **Rail anatomy is identical every time:** bold section title (≈ 20–22, the largest type on the feed after the address),
  optional one-line reason subtitle, a single "see all" affordance on the right, and the next card peeking at the edge.
- **One card shape per rail, varied between rails** (ranked portrait, landscape offer, round logos), with meta capped at
  two lines: rating + time, or price + one tag.
- **One side margin for everything not edge-to-edge** (≈ 12–16 on these screens); banners and rails share that left edge.
- **At most one global promo strip at a time** (talabat's free-deliveries bar), dismissible, pinned above the tab bar,
  never a second competing bar.
- Search placeholder rotates real queries ("Search for Pizza", "Try 'ingredients for pasta carbonara'"), not a generic
  "Search".

## Build it with noon

| Element | noon component / token | Note |
|---|---|---|
| Header: address + experience switcher | flow-local `HomeHeader` + `ExperienceSwitcher` (`src/flows/home/components/`) | Header pads with `var(--nk-inset-top)`; `Screen safeTop={false} withTabBar` |
| Search pill | `SearchBarButton variant="2025"` | Opens `search/…` via `nav.push`; rotate the placeholder from `data.ts` copy |
| Destination grid | flow-local `CategoryGrid` | Keep 8–12 cells; the last one "All categories"; small tags via `Badge` / `StatusChip variant="field" size="small"` |
| Live order card under the grid | `SectionCard` + `EtaBadge` (`etaFor` / `etaUseCases`) | Only when an order is active; reads `useDemoStore()` |
| Hero | `HeroBanners` / `HeroCarousel` (home components) | One hero, on the shared side margin, r16 (`var(--nk-radius-r16)`) |
| Product rails | `ProductRail` / `RecommendedRail` with `SkuCard` | Rail title `<Text variant="section">` or `title`; never `ProductCard` for the Figma SKU rails |
| Promo ticker / strip | `PromoTicker` | One strip per screen |
| Filter-style quick pills on home | `Pill variant="fieldChip"` in `PillRow` | Only if they filter the feed below |
| Tab bar | `TabBar` (flow `tabBar: { variant: 'field' }`, glass) | Brings its own `GlassFade`; don't add a second fade |
| Spacing | `var(--nk-space-s12)` / `var(--nk-space-s16)` side margin, `var(--nk-space-s24)` between sections | One rhythm for the whole feed |

## Avoid

- Opening with a full-width campaign banner above the address and search; the grid falls below the fold.
- Each grid tile with its own badge, price and subtitle; one tag at most, most tiles none.
- Different "see all" treatments per rail (text link here, arrow there, button elsewhere).
- Two promo strips plus a ticker plus a floating coupon at once.
- An active order hidden on the Orders tab while home shows promotions.
- Rails without a reason ("Products", "Recommended") and identical card shapes for six rails in a row.

Last researched: 2026-10-14
