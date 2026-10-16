# home: flow brief

Read with `../screens.md` (routes, sources) and `src/flows/home/FIGMA-MAPPING.md` (the decisions). Skill: `/home-page`. This brief reflects the branch as of 2026-10-13; when it disagrees with the code, the code wins.

## What `home/home` is now

`home/home` renders the **live bappzaar CMS feed 1:1** (master `ba159e20`, payload captured 2026-10-12):

- under a **2025 Figma header** (iRE9RwO94eMAyW3j3XKNXW · 1337:5102),
- with the **Eid hero carousel** at the top (Af34gfmhQ1D0wstXUEHSIF · 89:34398).

Its truth is `mixed`. `home/classic` is the older bappzaar port and is kept as is.

- `HomeScreen` is eager (it stays in the main bundle). `ClassicHomeScreen` is a `lazyScreen`.
- The removed 2025 bits: department-tab skin, `homeTabThemes`, `NeedHelpButton` on home. Don't bring them back unless asked.

## No variants: area files

The `eid` and `feed` files are **per-area token and data files**, not switchable variants. `src/flows/home/tokens.ts` merges them all, one level deep:

`mergeTokens(classic, header, rails, modules, tabs, eid, feed)`

- A new area file must be added to that call, or its CSS vars won't exist.
- **feed**:
  - `data.feed.ts` holds `homeFeed: BzModule[]`, the ordered module list. It is a discriminated union over the 10 CMS types.
  - `tokens.feed.ts` holds the `homeBz*` colours and type, plus the JS geometry object `bz`, with its bappzaar formulas at `W = 390`.
- **eid**:
  - `data.eid.ts` holds `eidSlides` (Nike, Areej, WHOOP) and `eidAdBanner`.
  - `tokens.eid.ts` holds the `homeEid*` values and the `homeEidCarousel` geometry: 263.67×395.67, gap 15, 3 s autoplay.
- Token naming: a camelCase key becomes a kebab CSS var. For example `homeBzMegaBg` becomes `var(--nk-color-home-bz-mega-bg)`. Literals copied from bappzaar carry `// token-lint-ignore — <reason>`.

## Components rendered by `home/home`

All feed modules take `wrap: BzWrap` (pt, pb, mb, bg) and an optional `header: BzHeader`, and render inside `BzModuleWrapper`. That component owns spacing plus the 18 bold title with "View all".

| Component | Renders |
|---|---|
| `HomeHeader` | gradient header: ExperienceSwitcher → address + wishlist → `SearchBarButton variant="2025"` (48 high); collapses at ≥100 px |
| `ExperienceSwitcher` | marketplace tiles; radius 20 → 12 when collapsed |
| `EidBanners` | hero + brand cards carousel (no props, reads `data.eid.ts`); CMS type `noonDynamicCarousel` |
| `SnappedBannerCarousel` / `BannerCarousel` | 341-wide NoonSlider strip, 3 s auto / free 3.5-per-view category carousel |
| `BannerScroller`, `EasyBannerScroller` | multi-row icon scroller / marquee (96 ms per px) |
| `AdBannerModule` | 360-wide r20 banner + `Sponsored` label (bottom 16, right 22) |
| `ProductCarousel` | central `ProductCard carousel` rail, 138 wide, gap 8 |
| `MegaDeals` | countdown to 06:00 UTC + 2×2 slots |
| `AdProductLedDisplay` | stacked sponsored product card → PDP |
| `ItemCarousel` | "Keep shopping for" history cards |

These components are kept but **not rendered** on `home/home`: PromoTicker, CategoryGrid, OfferTickets, ProductRail, KeepShopping, BrandAdModule, LaunchModule, HeroBanners, DepartmentTabs, RecommendedRail, EidAdBanner. Reuse them for a campaign or landing page instead of rebuilding.

## Recipes

- **Add a feed module**:
  1. add a member to the `BzModule` union in `data.feed.ts`;
  2. add a `case` in `FeedModule` (`src/flows/home/HomeScreen.tsx`);
  3. add an entry with a unique `key` to `homeFeed`;
  4. wrap the component in `BzModuleWrapper`.
- **Hiding a module**: set `hidden: true` on its `homeFeed` entry. It keeps its place in the payload order and isn't rendered. `homepage-toggle` (the FIRST15 / Emirates NBD strips) is hidden this way.
- **Spacing rule**: only the wrapper's top/bottom padding plus `marginBottom` apply. `marginBottom` is 24, or 0 with `removeExternalSpacing`. CMS `outerSpacing` is ignored and there is no feed gap.
- **Geometry**: copy the bappzaar formula into `bz` and keep the formula in a comment. Fixed card sizes stay fixed; the extra width shows as rail peek.
- **Assets**: `data.feed.ts` loads `src/assets/home/*.webp` and `src/assets/home/bz/*.webp` with `import.meta.glob`. File names must follow `prefix-NN`.
- **Campaign / landing page**: build a new screen or flow from the kept 2025 components plus feed modules. Don't fork `home/home`.

## Gotchas

- `HomeFeed` is `memo`'d so the header-collapse boolean only re-renders the header. Don't lift feed state into `HomeScreen`.
- Carousels honour `useReducedMotion` and stop on touch.
- `ProductRail` imports `Module` from `../HomeScreen`, a circular import. Don't import `ProductRail` into `HomeScreen`'s module graph from a new place.
- Skipped from the payload: GAM, floating and interstitial slots, and repeated category sections. Flags assumed on: `optimized_banner_carousel`, `mega_deals_new_design`.
