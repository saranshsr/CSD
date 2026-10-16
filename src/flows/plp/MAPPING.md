# PLP mapping

## PLP scroll states (bappzaar master e3eb49a2aae)

The noon PLP is `noon.DynamicLoaderScreen` → `NoonCatalogList`. Two independent scroll controllers run off the same list
scroll: the **bottom tab bar** (DynamicLoaderScreen's `BottomTabScrollVisibilityProvider` → native tab bar) and the
**hidable header** (`HidableView` around the fulfilment tabs + nav-pill row). The search bar sits outside `HidableView`
and never moves. Kit port: `src/flows/plp/scrollStates.ts` (`usePlpScrollStates`), values in `plpTokens.scroll`.

| bappzaar file | Behaviour | Value | Kit implementation |
|---|---|---|---|
| `src/utils/FeatureFlags.ts` `isAnimateBottomTabEnabled` (`animate_bottom_tab`, test 427) | gate 2: scroll-hide on | variant 1 = on (assumed live: it is the behaviour asked for; the flag is an ab-test kill-switch) | always on for `plp/listing` |
| `src/utils/BottomTabs/ScrollVisibilityProvider.ts` `scrollHideEnabledMarketplaces` | gate 1: immersive layout (content under the bar, paddingBottom = bar height) | noon, rocket | `.tabSpace` spacer at the end of the grid (already there) |
| ScrollVisibilityProvider `TOP_THRESHOLD` | y ≤ 10 → show | 10 | `plpTokens.scroll.tab.top` |
| ScrollVisibilityProvider `TAB_HIDE_ACTIVATION_OFFSET` | y < 150 → show (no hiding near the top) | 150 | `tab.activation` |
| ScrollVisibilityProvider `SCROLL_DEAD_ZONE` | \|Δy\| < 4 since the last counted event is ignored (lastY not advanced) | 4 | `tab.deadZone` |
| ScrollVisibilityProvider `TAB_HIDE_DISTANCE` | hide after 64 of continuous downward scroll | 64 | `tab.hideAfter` |
| ScrollVisibilityProvider `TAB_SHOW_DISTANCE` | show after 24 of continuous upward scroll | 24 | `tab.showAfter` |
| ScrollVisibilityProvider `_onScrollEnd` (iOS) | drag end with velocity.y > 2 pt/ms → hide; < −2 → show | ±2 pt/ms | `touchend` on the scroller: velocity from the last 60ms of scroll samples (px/ms) |
| ScrollVisibilityProvider `END_REACH_THRESHOLD` + `isOnReachEnd` | within 20 of the end: never hide; upward deltas (bounce) don't show (`autoShowOnReachEnd` off) | 20 | `tab.endReach` |
| ScrollVisibilityProvider `autoShowOnIdleEnabled` / `TAB_IDLE_SHOW_MS` | show after 1s idle | off (no caller sets it on master) | not ported (off) |
| ScrollVisibilityProvider `release()` via `navigationWrapper` push / tab switch | pushing a screen resets the provider; the bar is restored (unanimated) on the next appear | — | when the PLP stops being the top entry: reset, bar shown instantly |
| NoonCatalogList `onContentResetToTop` → DynamicLoaderScreen `reveal()` | filter / sort apply and back-to-top: bar shows | — | filter / sort change → scroll to top + `reveal()` |
| `node_modules/react-native-navigation/ios/UITabBarController+RNNOptions.mm` `hideTabBar` / `showTabBar` (via `ios/noon/BottomTabBarManager` `setTabBarHidden:animated:YES`) | tab bar frame slides off the bottom by its own height (incl. home-indicator inset) / back | 0.15s, `UIViewAnimationOptionCurveEaseOut` = cubic-bezier(0, 0, 0.58, 1) | `duration.fast` (0.15) + `plpTokens.scroll.tab.ease`; `--plp-tab-hide` 0 → 1 × (tab bar + inset) |
| `src/components/HidableView/HidableView.tsx` `onScroll` | direction from the previous event; hide when scrolling down, more than `height` past where the down run started, and y > height | height = measured header (initial 63 + 56 = 119, `FULFILLMENT_TABS_INITIAL_HEIGHT` + `CATALOG_NAV_PILLS_INITIAL_HEIGHT`) | `HidableHeader` in `scrollStates.ts`, height from a ResizeObserver |
| HidableView `onScroll` | show when scrolling up more than `height` from where the up run started, or y < height | same height | same |
| HidableView `onHide` / `onShow` | `Animated.timing` translateY 0 ↔ −height, native driver | 300ms, default easing `Easing.inOut(Easing.ease)` (ease = bezier(0.42, 0, 1, 1)) | `duration.medium` (0.3) + `plpTokens.scroll.header.ease` (the exact inOut(ease) function) |
| HidableView styles `header` | header layer absolute over the list, `overflow: hidden`, zIndex 2; the list gets `offsetTop` = header height | — | `.hidable` layer hangs under the search bar (`top: 100%`, overflow hidden); a spacer of the measured height opens the list |
| HidableView `componentDidUpdate` `dataChange` | new data (filter / sort apply) → header back in place with no animation | — | filter / sort change → `header.reset()` |
| NoonCatalogList `styles.searchContainer` | search bar block: white, shadow 0 1 4 black 0.1, zIndex 3 (above the header) — static, no scroll change | — | `.barBlock` (replaces the old `data-scrolled` shadow, which bappzaar doesn't have) |
| NoonCatalogList `styles.searchButtonContainer` | paddingHorizontal 16, paddingBottom 12 (white gap under the bar, above the shadow) | — | `.barRow` padding 4 16 12 (pt 4 = the search screen bar's spot for the hand-off) |
| NoonCatalogList `styles.fulfillmentHeaderContainer` | white + `NoonStyles.shadow()` (1,1 black 0.04, RN default radius 3) — static | — | `.hidableInner` |
| NoonFulfillmentTabs, NoonCatalogListHeader | no scroll reaction of their own (no collapse, no subtitle change) | — | none |
| — | haptics | none on scroll | none |

The tab bar controller (`TabBarScrollVisibility`) now lives in `src/kit/tabBarScroll.ts` (`useTabBarScrollHide`, shared with the PDP); the PLP hook keeps using it with `plpTokens.scroll.tab`.

## Filters sheet (bappzaar master NoonFiltersScreenV2 + NoonFiltersV2; live app reference 2026-10-14)

Reference: `visual/refs/plp-filters.png` (iOS, "phone" → Filter), checked by `npm run visual:ref -- plp-filters`. Paths below are under `marketplaces/noon/`; S = `screens/NoonFiltersScreenV2/NoonFiltersScreenV2.tsx`, SS = its `styles.ts`, C = `components/NoonFiltersV2/`.

| bappzaar | Value | Kit |
|---|---|---|
| S 1312-1334 gorhom `detached`, snap 85%, bottomInset 36, marginHorizontal 8, r16, backdrop 0.7, handle 48×4 #B7B7B7 above (tap / drag closes) | — | `sheet: { layout: 'floating', inset: 8, bottomGap: 36 }`; height `0.85 × (screen − 36)` measured on the sheet layer |
| SS 30-53 header pt 8; title `noon_filters` 18 bold #475067, padding 4 12 12; **no close button** | — | `.header` / `.title` (`title-small`, `text-muted`) |
| SS 215-266 search wrapper 4 12 12 + border #F2F3F7; input 44 r12 #F9F9FB, 16/500 #1D2539, icon 15 #989FB3; active: white + border, back arrow 19 #666D85, clear 12 | debounce 150ms (S 53) | `.searchWrap` / `.search` (`plpText16MediumLh20`) |
| S 46 / SS 70-106 sidebar 25% of the content, border-end 1 #F2F3F7; item py 10 px 8, my 4, 13/500 #5D5D5D; active #EFF7FF + 3px #0057FF end bar, #101628 600; >10 chars + 2 words split after the first word | — | `.sidebar` / `.side`, `splitName` |
| S 881-884 `filter-active.webp` ≈6pt blue dot at the end of the row (the label takes the free width; matches production), when the page has a value (sort too) | — | `.sideLabel` + `.dot` |
| S 1404-1441 ONE SectionList of every page; sticky `FilterHeader`; fades 16 top / 24 bottom; footer spacer max(100, viewport − last section) | — | `.list` + `.groupHeaderWrap` sticky, `.content::before/::after`, `spacer` |
| S 673-713 sidebar tap → animated scrollTo the group, sidebar centres (viewPosition 0.5), spy locked 1200ms; flash #F4F6FA → #EBF4FF (150 delay, 200 in, 500 hold, 1200 out) | — | `jump()`, `GroupCard flash` (`bg-info`) |
| S 723-768 scroll-spy: first viewable section is active | — | `onScroll` |
| S 244-258 opens on page index 1 (or `initialPageCode`) without animation | — | initial `scrollTop` = Delivery (or the `facet` param) |
| C/FilterHeader: outer pt 8 px 8 white; inner #F4F6FA, top r16, 14 16, border-bottom #F5F5F5, 16/600 #343D54 | — | `.groupHeader` |
| C/FilterContainer body #F4F6FA, mx 8, mb 8, bottom r16, pb 12; content flush under the header | — | `.groupBody` |
| C/FilterSortSection own card r16, py 16 px 12, m 8; "Sort by" 16/600; collapsed: selected 12/600 #0057FF + chevron; pills | expanded by default | `SortSection` (sort is in the draft; commits with Show) |
| C/FilterFulfillmentCard column gap 10 px 12; card min 42, r12, 1px #EAECF0, p 8, gap 8; logo box 86 × ≥26, r6, py 4 px 8, API `background_color`, logo 70×20; label 14/500 #343D54; selected 2px #0057FF, #F0F7FF, #0E0E0E 600 | — | `.fulfil` / `.fulfilLogo` (`plpFulfil*` colours: supermall `rocket-blue-sapphire`, express `yellow-color`, global #E7DEF0 sampled) |
| C/FilterNavPill p 8, r8, 2px #EAECF0, 14/500 #343D54; selected #0057FF / #F0F7FF / 600 | — | shared `Pill variant="filter"` |
| C/FilterCard (product_rating) flexBasis 45%, py 10 px 8, r10, 1px #EAECF0, gap 10, icon 20, 14/500 | — | `.cards` / `.card` |
| C/FilterRangeSlider px 12 gap 12, slider 42, rail 4 #DADCE3, fill rgba(56,102,223), thumb 24 + 3px #0057FF; Min / Max 12/400, inputs 1px #E0E0E0 r8 p 8 | — | `PriceRange` (`plpRange*`) |
| SS 111-159 footer white, border-top, gap 8, py 10 px 12; Clear All flex 0.4, Apply flex 0.6 (full in search), min 56, r14, 18/600; 0 results → 0.5 + "No results available" | API `nbHitsText` ("Show 4K+ results") | `.footer`, `showText()` (≥ 1000 → "4K+") |
| utils/NoonFiltersV2SearchUtils: group name match → whole group, else matching options; `{{count}} filters match "{{q}}"` 12/500 #989FB3; bold match; empty: "We couldn't find …" 16/700 + 12/500; "Clear selection" pill 36 r18; sidebar slides out (250ms, bezier 0.38 0.7 0.125 1) | — | `matches`, `Highlight`, `.empty` (Origin search icon in place of the 90×90 image), `.clearSelection` |

**Facets**: the live API returns them per query; the kit derives them from the PLP's results (`facetsFor`): Sort By, Delivery (supermall / express / global, always shown), Arrives by (Today = today / minutes delivery), Category (leaf names, `leafCategory`), Brand, Price (range, bounds from the results), Product Rating (cards), Deals. Not in the mock catalogue: Top Picks, Item Condition, Network Type, Refresh Rate, colour pills, alphabetical brand buckets and "View all".
