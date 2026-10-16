# Categories tab: bappzaar master → kit token mapping

Source: `bappzaar` **origin/master** (fetched 2026-10-11, `cc1f8a0d1f0`). Live content: the noon app CMS page `/categories`, fetched the way the app does it: `GET https://api-app.noon.com/_svc/catalog/api/v3/u/categories` with `X-Locale: en-ae`, `X-Platform: ios`, `X-Content: mobile`, `X-Build: 22098`. Response: `type: "static"`, page_code `CPB0U24TMV87`.

How to read the tables:

- **Kit token** is what the flow's CSS/TSX uses. `--nk-color-*`, `--nk-space-*`, `--nk-radius-*`, `--nk-type-*` are global tokens (`src/foundations/tokens.ts`). `--nk-palette-*` is the raw bappzaar palette (`src/foundations/palette.ts`). Keys with a `cat` prefix (`--nk-type-cat-*`, `--nk-layout-cat-*`, `--nk-space-cat-*`, `--nk-radius-cat-*`, `--nk-color-cat-*`) are defined in `tokens.ts` → `categoriesFlowTokens`. JS-only numbers (motion, ratios, module constants) are in `categoriesTokens`.
- RN text with no `lineHeight` maps to a `cat*` type token with `line: 'normal'`.
- **SD** = server-driven (CMS). The demo value is the live snapshot in `data.live.ts`.
- Metrics resolved: `ThemeManager.metrics.staticPagePadding()` = 15, `edgeSpacing()` = 15 (`src/theme/Metrics.ts`). Colours: `charcoalGreyColor` / `paleBlack` #404553, `accentColor` #3866DF, `steelColor` #7e859b (`marketplaces/noon/theme/NoonColors.ts`).

## Render tree (master)

```
NoonApp.ts tab "noon.NoonCategoriesScreen" (tabIndex CATEGORIES, text noon_tab_categories)
└ marketplaces/noon/screens/NoonCategoriesScreen        trackPage('category', { curl: '/categories' })
  └ src/screens/DynamicLoaderScreen  unstructured="/categories" isCategoriesScreen parentContext.isTabScreen
    ├ renderHeader() → null (only the home screen has the address/search header)
    └ FeedbackView
      ├ LOADING → ProgressLoader followBottomTabs            (kit: components/ProgressLoader)
      ├ ERROR   → EmptyView (default) → NoonEmptyView + Retry (kit: components/ErrorView)
      └ data.type "static" → src/components/StaticPage
        ├ renderTopSection(): searchBarContainer → NoonSearchBarButton (no BackButton: isTabScreen)
        └ CompoundFlatList (contentContainer paddingBottom = getBottomTabsHeight())
          ├ NoonModule adBannerModule → AdBannerModule → AdBannerModuleV2 → ModuleWrapper → BannerModule (grid)
          └ NoonModule collapsibleBannerModule → ModuleWrapper (+ ModuleHeader "Categories")
                                               → CollapsibleBannerModule → rows → MainBanner ×3 + SubBanner list
```

The old kit version (left rail + banner + circular tile grid) matched neither the live CMS nor master's
renderers. The rail layout is `src/components/Module/CategoriesModule`. It is still on master, but the live
UAE / KSA / EG `/categories` pages no longer send a `categoriesModule`, so it is not part of the live tab (see "Flags and variants").

## Flags and variants

| Switch | Live value | Effect used |
|---|---|---|
| CMS module set for `/categories` (en-ae, ar-ae) | `adBannerModule` + `collapsibleBannerModule` | Rail `CategoriesModule` is **not** rendered. en-sa adds a `bannerModule` strip and a second collapsible module. en-eg has only the collapsible module. |
| `FeatureFlags.isLegacyModuleFallbackEnabled()` (`noon_module_legacy_fallback` 1) | off (no bucket) | `NoonModule` path (not legacy `Module`); same renderers for these two types |
| `adBannerModule.shouldFetchAds` | `false` (SD) | `AdBannerModuleV2` (static banners, no ad fetch) |
| banner `isAdBanner` | absent (SD) | no `Sponsored` "Ad" tag even though `label.text = "Ad"` |
| `searchConfigs.isImgSearchEnabled` (shared config) | on (UAE) | camera button + divider in the search bar |
| `StaticPage.shouldHideSearch()` | false (url has no `hideSearch=true`) | search bar shown. Offset header `statusbar` |
| `isBottomTabImmersiveEnabledForMarketplace(noon)` | assumed on | ProgressLoader bar sits above the bottom tabs (`followBottomTabs`) |
| `Metrics.responsiveNumPerView(3)` | 3 on phone widths | 3 tiles per row |

## 1. Screen + search bar (StaticPage)

| bappzaar | Property | Master | Kit token |
|---|---|---|---|
| DynamicLoaderScreen `container` / StaticPage `container` | bg | white / `$whiteColor` | flow `colors.bgPage` = `palette.white`, `<Screen background="bgSurface">` |
| StaticPage ScreenView `offsetHeader` | top offset | `statusbar` | `var(--nk-inset-top)` in `.searchBarContainer` padding-top |
| StaticPage `searchBarContainer` | padding-x / padding-bottom / bg | 16 / 12 / white | `--nk-space-s16` / `--nk-space-s12` / `--nk-color-bg-surface` |
| StaticPage `searchBarButton` | flex | 0 | n/a |
| NoonSearchBarButton `container` | h / r / border / padding-x / gap | 52 / 12 / 1px #D7DAE3 / 12 / 8 | shared `SearchBarButton` (`searchBar.*` tokens: 52, r12, `borderInput`, 12, 8) |
| NoonSearchBarButton `text` | font / colour | 17 / 500 / −0.2 / #1D2539 | shared `SearchBarButton` |
| NoonSearchBarButton `icon` / divider | 20×20 search-bar.webp / 1×24 #D7DAE3 mx 4 | shared `SearchBarButton` (`noon-search-bar.webp`, `noon-search-bar-camera.webp`) |
| placeholder | copy | `noon_search_placeholder` "What are you looking for?" (no `animatedSearchConfig` here) | `copy.searchPlaceholder` |
| tap | nav | `NoonSearchController` → search screen (`pn: page_static`) | `nav.push('search/search')` |
| CompoundFlatList | content paddingBottom | `getBottomTabsHeight()` | `calc(var(--nk-layout-tab-bar) + var(--nk-inset-bottom))` |
| CompoundFlatList | pull-to-refresh | `onRefresh` reloads CMS | skipped (static demo) |

## 2. Pre-search banner (adBannerModule "pre-search-banner-ocm")

| bappzaar | Property | Master | Kit token |
|---|---|---|---|
| ModuleWrapper (noon) | padding-top / padding-bottom | `innerPadding.top` 0 / `innerPadding.bottom` 10 (SD) | 0 / `--nk-space-s10` |
| ModuleWrapper | margin-bottom | `removeExternalSpacing: true` → 0 (SD) | 0 |
| ModuleWrapper | bg | `bgColor` #ffffff (SD) | `--nk-color-bg-surface` |
| BannerModule `bannerWrapper` | padding-x | `$staticPagePadding` 15 | `--nk-space-s15` |
| BannerModule.renderBannerRow | width | floor(screen − 2 × 15) = 360 @390 | `width: 100%` inside the 15px gutter |
| StaticImage | height | `ratio` 10.81 % of width (SD) → 38.9 | `aspect-ratio: 100 / ratio` |
| BannerContent `roundedCornerStyles` | radius / overflow | 20 / hidden (noon, `bannerModule` is not a strip) | `--nk-radius-r20` |
| BannerContent wrapper | press feedback | TouchableWithoutFeedback (none) | `<Pressable scale={1}>` |
| tap | nav | `ModuleHelper.handlePress` → `/emirates-nbd-noon-one-credit-card/` (static CMS page) | demo toast `copy.adToast` (page not in the kit) |
| AdBannerModuleV2 `Sponsored` | "Ad" tag | only when a banner has `isAdBanner` → not shown | not rendered |

## 3. Categories module (collapsibleBannerModule "category-nav-all-categories")

### 3a. Wrapper + header

| bappzaar | Property | Master | Kit token |
|---|---|---|---|
| ModuleWrapper (noon) | padding-top / bottom | `innerPadding` absent → 0 / 0 | 0 |
| ModuleWrapper | margin-bottom | `bottomMargin` 24 (SD) | `--nk-space-s24` |
| ModuleWrapper | bg | `bgColor` #FFFFFF (SD) | `--nk-color-bg-surface` |
| ModuleHeader `header` + `headerOuterSpacingNewUi` | padding-x / margin-top / margin-bottom | 15 / 0 / 12 | `--nk-space-s15` / 0 / `--nk-space-s12` |
| ModuleHeader `headerText` | flex / padding-right | 1 / 5 | `flex: 1` / `--nk-space-cat-s5` (inline-end) |
| ModuleHeader title | text | `moduleHeader.titleText` "Categories" (SD) | `categoriesPage.moduleHeader.titleText` |
| ModuleHeader title | font | `titleFontSize` 18, `titleFontWeight` "500" (SD; base `title` 18 bold overridden) | `--nk-type-cat-module-title` (500 18px/normal) |
| ModuleHeader title | colour / align | `titleColor` #000000 / `titleTextAlign` left (SD) | `--nk-palette-black` / `text-align: start` |

### 3b. Rows + main banners (MainBanner)

| bappzaar | Property | Master | Kit token |
|---|---|---|---|
| CollapsibleBannerModule | rows | banners chunked by `numPerRow` 3 (SD) → 10 rows for 29 banners | `rows` in `CollapsibleBannerModule.tsx` |
| styles `container` | padding-x | `$staticPagePadding` 15 | `--nk-space-s15` |
| styles `mainBannersContainer` | direction / margin-bottom | row / `BANNER_ROW_BOTTOM_MARGIN` 10 | grid / `--nk-space-s10` |
| CollapsibleBannerRow | banner width | (screen − 30 − 2 × `MAIN_BANNERS_GAP` 5) / 3 = 116.67 @390 | `grid-template-columns: repeat(3, minmax(0,1fr))` |
| MainBanner `mainBannerContainer` | margin-right | 5 (`MAIN_BANNERS_GAP`) | `column-gap: var(--nk-space-cat-s5)` |
| MainBanner `mainBannerImageContainer` | border / radius / overflow | 2px white (`BANNER_BORDER_WIDTH`) / 20 (noon) / hidden | `--nk-layout-cat-banner-border` `--nk-palette-white` / `--nk-radius-r20` |
| MainBanner StaticImage | size | (width − 4) × `ratio` 131.31 % (SD) = 112.67 × 147.9 | `aspect-ratio: 100 / 131.31` (`categoriesTokens.mainBannerRatio`) |
| MainBanner `borderContainer` | layers | absolute fill, borderWidth 2, same radius | `.mainBorder` |
| `borderContainerUnselected` | colour | module `bgColor` #FFFFFF (SD) | `--nk-color-bg-surface` |
| `borderContainerSelected` | colour | module `borderColor` #DBDBDB (SD; fallback accentColor) | `--nk-color-cat-border-selected` |
| border cross-fade | motion | opacity 0↔1, `withTiming` 200ms | `categoriesTokens.borderFadeMs`, `timingEase` |
| media selected | motion | scaleY 1.02 + translateY 15 (`MAIN_BANNER_BOTTOM_GRACE_SPACE`), `withTiming` 300ms inOut(quad) | `selectedScaleY`, `graceSpace`, `timingMs`, `timingEase` [.455,.03,.515,.955] |
| `textContainer` | margin-top / padding-x / flex | 10 / 5 / 1 | `--nk-space-s10` / `--nk-space-cat-s5` |
| `title` | font | primaryFont, base 15/700 → `titleTextFontSize` 13, `titleTextFontWeight` bold (SD) | `--nk-type-cat-banner-title` (700 13px/normal) |
| `title` | colour / align / lines | `$charcoalGreyColor` #404553 / `textAlign` left (SD) / 2 | `--nk-color-text-legacy` / `start` / line-clamp 2 |
| title selected | motion | scale 1.1 + translateY 15 − 3 = 12, 300ms | `selectedTitleScale`, `selectedTitleShift` |
| press | feedback | RN `Pressable` (none) | `<Pressable scale={1}>` |
| press | behaviour | toggles this banner. Another banner in the row swaps the list. A banner in another row closes the open row (`selectedRowIndex` effect). No navigation | single `{ row, index }` selection state |

### 3c. Sub-banner list (CollapsibleBannerRow + SubBanner)

| bappzaar | Property | Master | Kit token |
|---|---|---|---|
| `subBannersContainer` | height | animated 0 ↔ (`SUB_BANNER_HEIGHT` 55 + `SUB_BANNERS_GAP` 7) × n + 15 × 2, 300ms | `motion.div animate={{ height }}` with `categoriesTokens` |
| `subBannersContainer` | first child | 15px spacer (`MAIN_BANNER_BOTTOM_GRACE_SPACE`) | `.graceSpace` `--nk-layout-cat-grace` |
| SubBanner `subBannerContainer` | h / mb / bg / radius | 55 / 7 / #F0F1F4 / 5 | `--nk-layout-cat-sub-banner-height` / `--nk-space-cat-s7` / `--nk-palette-brand-widget-divider` / `--nk-radius-cat-r5` |
| SubBanner `subBannerContainer` | layout / padding | row, centred / pv 5, pr 10 | flex / `--nk-space-cat-s5` 0, inline-end `--nk-space-s10` |
| `subBannerImage` | size / ml / radius / fit | 50 × 100% (45) / 5 / 5 / cover | `--nk-layout-cat-sub-image-width` / `--nk-space-cat-s5` / `--nk-radius-cat-r5` / `object-fit: cover` |
| `subBannerText` | font | base 16/500 → `titleTextFontSize` 13, `titleTextFontWeight` bold (SD) | `--nk-type-cat-banner-title` |
| `subBannerText` | colour / mx / lines / align | `$paleBlack` #404553 / 10 / 2 / left (SD) | `--nk-palette-pale-black` / `--nk-space-s10` / clamp 2 / `start` |
| entering | motion | opacity 0→1, translateX −25→0 (RTL +25), 300ms | `subEnterX`, `subEnterMs` |
| exiting | motion | `FadeOutRight` (RTL `FadeOutLeft`), 300ms | `exit={{ opacity: 0, x: 25 }}`, `AnimatePresence mode="popLayout"` (old rows fade out in place while the new list enters) |
| after open | auto-scroll | if the row is above the fold, or row + list don't fit in the list viewport → `scrollToOffset(row − 10)` | `afterExpanded()`: `scroller.scrollTo(top − rowBottomMargin)` (smooth) |
| tap | nav | `ModuleHelper.handlePress(linkUrl)` → DynamicLoaderScreen (store CMS page or catalog) | `nav.push('plp/listing', { query, categoryId })`. query = sub title. "View all" / "Shop All" use the main title. categoryId = `taxonomyFor(main)` |
| press | feedback | reanimated `Pressable` (none) | `motion.button` (no scale) |

## 4. Loading (FeedbackView → ProgressLoader)

| bappzaar | Property | Master | Kit token |
|---|---|---|---|
| ProgressLoader `container` | size / bg | 100% / #F5F7FF | `.loader` inset 0 / `--nk-palette-kit-blue98` |
| loader bar | height / width / radius | 4 / 70% / 4 | `--nk-layout-cat-loader-height` / `categoriesTokens.loaderBarWidth` |
| loader bar | fill | LinearGradient #F5F7FF → `accentColor` #3866DF | `linear-gradient(90deg, --nk-palette-kit-blue98, --nk-palette-accent-color)` |
| loader bar | motion | translateX −w → +w, 800ms, `Easing.ease`, loop (reversed in RTL) | `@keyframes catLoaderSweep`, `loaderMs`, `loaderEase` [.42,0,1,1] |
| `followBottomTabs` | position | `NoonNativeStickyBar` above the tabs | `bottom: calc(var(--nk-layout-tab-bar) + var(--nk-inset-bottom))` |
| header | | none (StaticPage not mounted yet) | none |
| demo | trigger | network fetch | first visit of the session (`demoLoadMs` 700), or pinned with `?state=loading` (screen `categories/loading`) |

## 5. Error (FeedbackView → EmptyView → NoonEmptyView)

| bappzaar | Property | Master | Kit token |
|---|---|---|---|
| EmptyView `container` | layout / padding | centred / px 30, py 10 | `.error` / `--nk-space-s10` `--nk-space-cat-s30` |
| image | asset | `ThemeManager.images.emptyError()` | `src/assets/categories/empty-error@3x.webp` (792×552 → 264 wide, `--nk-layout-cat-error-image-width`) |
| `title` | font / colour / mt | 16 bold / `steelColor` #7e859b / 35 | `--nk-type-cat-error-title` / `--nk-palette-steel-color` / `--nk-space-cat-s35` |
| `message` | font / colour / mt | 14 / steel / 10 | `--nk-type-cat-error-message` / `--nk-palette-steel-color` / `--nk-space-s10` |
| PrimaryButton | h / bg / radius / px / min-width / mt | 50 / `accentColor` / 0 / 15 / 100 / 35 | `--nk-layout-cat-retry-height` / `--nk-palette-accent-color` / `--nk-radius-r0` / `--nk-space-s15` / `--nk-layout-cat-retry-min-width` / `--nk-space-cat-s35` |
| PrimaryButton text | font / colour | 14 bold / white | `--nk-type-cat-retry` / `--nk-palette-white` |
| `statusCode` text | | rendered only with a status code (none here) | not rendered |
| Retry | action | `this.load()` | `setView('loading')` → content |

## Copy

| Key | File | Value | Kit |
|---|---|---|---|
| `noon_tab_categories` | noon-en.json | Categories | tab bar (shared `TabBar`) |
| `noon_search_placeholder` | noon-en.json | What are you looking for? | `copy.searchPlaceholder` |
| `empty_view_error_title` | en.json | Oops! Something went wrong. | `copy.errorTitle` |
| `empty_view_error_message` | en.json | This doesn't seem right! Let us try to sort this out. | `copy.errorMessage` |
| `retry` | en.json | Retry | `copy.retry` |
| module title, 29 category names, 175 sub-category names | CMS (SD) | see `data.live.ts` | `categoriesPage` |

## Server-driven fields (demo values = live snapshot)

| Field | Live value | Where |
|---|---|---|
| adBanner `imageUrl` / `ratio` / `linkUrl` | animated GIF 740×80 / 10.81 / `/emirates-nbd-noon-one-credit-card/` | `adBanner` (webp `ad-pre-search-banner.webp`, animation kept). The banner has `labels.bannerLabels` (shown to non-cobrand-card owners). The kit always shows it |
| collapsible `moduleHeader` | Categories, 18, "500", #000000, left | `moduleHeader.titleText` + `--nk-type-cat-module-title` |
| collapsible `numPerRow` / `bgColor` / `borderColor` / `bottomMargin` | 3 / #FFFFFF / #DBDBDB / 24 | `numPerRow`, CSS tokens |
| 29 main banners: `titleText`, `imageUrl` (396×520), `ratio` 131.31, 13 / bold / left | Mobiles & Accessories … Gift Cards | `banners[]`, `cat-*.webp` |
| 175 sub banners: `titleText`, `imageUrl` (80×80), `linkUrl`, `ratio` 100, 13 / bold / left | e.g. Mobiles `/mobiles`, Power banks `/acc-store/` | `banners[].subBanners[]`, `sub-*.webp` |
| per-banner `countdown` | `enabled: false` everywhere | not rendered |
| main banner `lottieUrl`, sub banner `lottieUrl` / `backgroundColor` | absent | not implemented (would swap the image / bg) |

## Assets

All in `src/assets/categories/` (206 files, ~1.7 MB). The CMS images are from `f.nooncdn.com/mpcms/…`, converted to webp at their native CMS resolution: main 396×520 is ~3.4× the 112.67pt display width, sub 80×80 is 1.6× the 50pt slot (largest the CMS serves), ad 740×80 is ~2× and stays animated. `empty-error@3x.webp` comes from master `src/theme/assets/images/`. Data generation: `data.live.ts` (generated from the CMS JSON, one line per banner).

## Taxonomy (src/mocks/categories.ts, append-only)

Appended 28 `nav-*` root nodes (one per main tile except Mobiles & Accessories, which reuses the existing `mobiles-and-accessories` PDP-breadcrumb node). Each url is the tile's "View all" `linkUrl` without its query. `taxonomyFor(main)` passes the id to the PLP as `categoryId`. The PLP ignores it today (see follow-ups).

## Screens / routes

| Route | What | Params |
|---|---|---|
| `categories/categories` (`/categories`, `/all-categories`) | live tab | `open?`, `state?` |
| `categories/expanded` | "Mobiles & Accessories" opened | `open: 'mobiles-accessories'` (any tile slug works, e.g. `/categories/expanded?open=home-kitchen`) |
| `categories/loading` | ProgressLoader pinned | `state: 'loading'` |
| `categories/error` | NoonEmptyView + Retry | `state: 'error'` |

The tab bar shows on all four. Master pushes no category landing / L2 screen from this tab: tiles expand inline, and sub-categories open CMS store pages or catalogs (`DynamicLoaderScreen`). The kit maps those to the PLP.

## Documented exceptions

- **Search bar press feedback**: master `TouchableOpacity activeOpacity={1}` (no feedback). The shared `SearchBarButton` scales to 0.98. Left as is (shared component).
- **Sub-banner container clipping**: master's `subBannersContainer` has no overflow style, so the entering list can draw over the next row for a frame. The kit clips (`overflow: hidden`). Without that, `popLayout` exits would spill outside the container.
- **Auto-scroll measurement**: master uses the row's first (collapsed) layout. The kit measures live after the animation. Both give the same offset, because rows above are collapsed by then.
- **Sub-banner entry direction in RTL**: master flips ±25 under `I18n.isRTL()`. The kit keeps the LTR values (only the loader sweep is RTL-aware).
- **Haptics / analytics** (`trackGapt` impressions and clicks, `AnalyticsNAT.trackPage('category')`): not ported.
- **Pull-to-refresh**: not ported.

## Shared follow-ups (outside this flow)

- `SearchBarButton`: add a `pressScale`/`activeOpacity` prop (or `scale={1}`) so StaticPage search bars can match master's no-feedback `TouchableOpacity`.
- PLP (`plp/listing`): accept `categoryId` (now passed from Categories) to show a category title or breadcrumb instead of a search query.
- `src/kit/routes.ts`: `categories` already aliases `categories/categories`. Optionally add `category-nav` if other flows deep-link into the tab with `?open=`.
- A shared `ProgressLoader` / `NoonEmptyView` component would let other DynamicLoader-based flows (PLP, store pages) reuse the loading and error states built here.
