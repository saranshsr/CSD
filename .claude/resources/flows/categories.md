# categories: flow brief

<!-- planned: categories/landing, cms-pages.json, src/flows/categories/cms-pages.json -->

Read with `categories-views.md` (generated: every tile, sub banner, link and destination), `../screens.md` and `src/flows/categories/MAPPING.md`. The source is bappzaar master (NoonCategoriesScreen → DynamicLoaderScreen `/categories` → StaticPage), and the content is the live UAE CMS snapshot in `src/flows/categories/data.live.ts`. Snapshot from 2026-10-13.

## What the kit has

- **Tab root** `categories/categories` (`/categories`). It shows:
  - the search bar;
  - the pre-search ad banner;
  - a `collapsibleBannerModule` grid of 29 category tiles, 3 per row.
  - Tapping a tile opens its sub-banner list under that row.
- **State variants**: `categories/expanded` (`?open=<tile slug>`), `categories/loading` and `categories/error`.
- **Taps** (kit simplification): every sub banner pushes `plp/listing` with `plpQuery`, which is the sub title, or the category title for "View all" / "Shop All". The ad banner shows a toast.

## What the app does on a tap (bappzaar master)

- **Main tile**: no navigation. It only expands or collapses the sub list (`CollapsibleBannerModule.onMainBannerPressed`) and may scroll the row up. Analytics: `bt: 'main_category'`.
- **Sub banner**: `ModuleHelper.handlePress` with `bt: 'sub_category'`. The tap routing is ported in `src/flows/categories/linkRouting.ts` (`destinationOf`).

| linkUrl | Opens | Notes |
|---|---|---|
| `/gift-cards` | `GiftCardsLandingScreen` | `features/giftcards` |
| `/gift-cards/<CODE>?plx=NAV` | `GiftCardsCategoryScreen` (`categoryCode` = last path segment) | 5 of them in Gift Cards |
| `/emirates-nbd-noon-one-credit-card/`, `/cobrand*` | `CobrandLandingScreen` (deep link, tabs hidden) | the pre-search banner |
| a product URL (`…/<SKU>/p`) | `DynamicLoaderBlankHeaderScreen` → PDP | none on the live page |
| **anything else** | `DynamicLoaderScreen` | `GET /_svc/catalog/api/v3/u<linkUrl>`, rendered by response `type` |

The full `linkUrl` goes to the server unchanged, query included (`sort[by]`, `sort[dir]`, `f[is_fbn]`, `limit`). The client never parses it.

## DynamicLoaderScreen response types

- **`static`** → `StaticPage` (CMS landing page: hubs, stores, CLPs)
  - Top: `NoonSearchBarButton` with a **back button**. Pushed pages get `parentContext={}`, so they are not tab roots. `?hideSearch=true` hides the bar. Store pages (`storeInfo`) use the store top bar and `NoonStoreNav` tabs instead.
  - Body: `StaticPageUtil.getFlatModules(content.data)`. Widgets are flattened to modules, and a `sectionLayout: 'tabs'` widget becomes one `tabs` module. Each module goes through `NoonModuleRenderer` by `type`.
  - Module types most likely on category landing pages:
    - banners: `bannerModule*`, `adBannerModule*`, `bannerSlider`, `easyBannerScroller`
    - category navigation: `categoryScroller`, `clpCollapsibleScroller`, `collapsibleBannerModule`, `categoriesModule`, `staticNavigation`, `tabs`
    - products: `productCarousel`, `recommendedProducts`, `noonProductCarouselModule`, `adProductCarouselModule`
    - deals: `hpMegaDealModule`
  - Unknown types render nothing.
- **`catalog`** → `NoonCatalogList`, which is what the kit's `plp/listing` ports.
  - It reads `navPills`, `quickFilters`, `facetsV2`, `cms` (modules above the grid), `inlineCms`, `bottomCms` and `isBestSellerPage` from the response.
  - Filter and sort changes `POST /_svc/catalog/api/v3/search`.
  - Breadcrumbs are stored but never rendered. Category navigation on a PLP only comes from server nav pills, quick filters or CMS modules.
- **`detail`** → PDP.
- **anything else** renders a blank screen.

## Kit components that already match these modules

- `collapsibleBannerModule`: `src/flows/categories/components/CollapsibleBannerModule.tsx`.
- `adBannerModule`: `src/flows/categories/components/AdBannerModule.tsx` and `src/flows/home/components/AdBannerModule.tsx`.
- Home feed renderers (bappzaar 1:1) in `src/flows/home/components/`:
  - `SnappedBannerCarousel` / `BannerCarousel` (`bannerSlider`, carousels)
  - `BannerScroller`, `EasyBannerScroller`, `ProductCarousel`, `MegaDeals`, `ItemCarousel`, `AdProductLedDisplay`
  - all wrapped by `BzModuleWrapper` (ModuleWrapper spacing + ModuleHeader).
- **Catalog pages**: `plp/listing` (search bar, `MarketplaceStrip`, `CatalogListHeader` nav pills, `ProductBoxVertical` grid, Filters and Sort sheets).

## Building the category destinations (recipe)

1. **Fetch the real pages**: `npm run categories:fetch`, then `npm run resources:build`.
   - `categories-views.md` then shows each link's real type and its module list.
   - Raw responses land in `.cache/categories-cms/` (git-ignored).
   - Until then, the Page column is a guess from the URL, marked `?`.
2. **Static landing pages**: add one `categories/landing` screen rendered from a module array. Copy the home pattern: a typed `BzModule`-style union + an ordered array + one `switch` (`../patterns.md` → Data-driven screens).
   - Reuse the home renderers listed above.
   - Port any missing module type from bappzaar `src/components/Module/<Name>/`. Resolve its `styles.ts` and record it in the categories MAPPING.md.
   - Give it a back button (pushed, not a tab root).
   - Pick the page by a `url` param, with one data file per captured page.
3. **Catalog pages**: keep pushing `plp/listing`. When the fetch shows server `navPills` / `quickFilters` / `cms` for a page, pass them as params or data instead of re-deriving them.
4. **Gift cards and cobrand**: separate screens in the app with no kit port yet. Route them through `destinationOf` and show a toast until they are built.
5. **Tap routing**: replace the blanket `plp/listing` push in `CollapsibleBannerModule` with `destinationOf(linkUrl)`, so taps behave like the app.

## Gotchas

- `data.live.ts` is generated; don't hand-edit it. It and `cms-pages.json` are separate snapshots, so re-fetch both together when the CMS changes.
- Two `label: null` tiles (Mahali, Gift Cards) need `?open=` by image slug, not by label.
- Duplicate links exist, e.g. Mobiles and its "View all" both go to `/mobiles`. 175 sub banners resolve to 173 unique links.
- A link's page type can change on the CMS side without notice. The fetched `type` wins over `guessPageType`.
