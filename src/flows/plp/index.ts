import { defineFlow } from '../../kit/registry';
import { plpFlowTokens } from './tokens';
import { lazyScreen } from '../../kit/lazyScreen';

const FiltersSheet = lazyScreen(() => import('./FiltersSheet'), 'FiltersSheet');
const ListingScreen = lazyScreen(() => import('./ListingScreen'), 'ListingScreen');
const SortSheet = lazyScreen(() => import('./SortSheet'), 'SortSheet');

export const plpFlow = defineFlow({
  id: 'plp',
  title: 'Product listing (PLP)',
  group: 'Shopping',
  description: 'Search / category results: filter & sort pills with chip-reveal motion, skeleton → staggered card rise, filters + sort sheets that drive the grid.',
  initial: 'listing',
  tokens: plpFlowTokens,
  screens: [
    {
      id: 'listing',
      title: 'Listing',
      component: ListingScreen,
      defaultParams: { query: 'Best sellers' },
      notes: 'Pills drop in one by one (200ms + 50ms each). Cards load from skeletons with a 35ms stagger. Tap Sort → pick "Price: Low to High" to watch the grid reorder. Filter / facet pills open the Filters sheet; tap "express" to toggle inline. Scroll down past 150: the tab bar slides away (64 down / 24 up) and the marketplace strip + pills slide up under the search bar (bappzaar ScrollVisibilityProvider + HidableView, MAPPING.md).',
      source: 'src/screens/ListingScreen, marketplaces/noon/components/NoonCatalogList (renderHeader, renderFulfillmentTabs), NoonFulfillmentTabs, NoonCatalogListHeader, NoonCatalogListNavPill (+ NoonFilterPillAnimation), NoonProductBoxVertical (isPLP), constants/NoonPLPLoadingMotion.ts; hand-off motion github.com/saswata2002/Brand-Widget-PLP',
      truth: 'bappzaar',
      verified: '2026-10-12',
    },
    {
      id: 'filters',
      title: 'Filters',
      component: FiltersSheet,
      // gorhom `detached` sheet: marginHorizontal 8, bottomInset 36 (NoonFiltersScreenV2 styles.ts / S 1312-1334)
      presentation: 'sheet', sheet: { layout: 'floating', inset: 8, bottomGap: 36 },
      notes: 'One list of every group (Sort By, Delivery, Arrives by, Category, Brand, Price, Product Rating, Deals). Tap a sidebar item to scroll to its group (it flashes); scroll and the sidebar follows. Type in "Search across filters" to narrow the groups. Draft-then-commit: "Show N results" applies sort + filters; Clear All resets.',
      source: 'marketplaces/noon/screens/NoonFiltersScreenV2, components/NoonFiltersV2 (FilterHeader, FilterContainer, FilterFulfillmentCard, FilterNavPill, FilterCard, FilterSortSection, FilterRangeSlider); live app reference 2026-10-14 (visual/refs/plp-filters.png)',
      truth: 'bappzaar',
    },
    {
      id: 'sort',
      title: 'Sort',
      component: SortSheet,
      presentation: 'sheet', sheet: 'classic',
      notes: 'Radio dot slides between rows (shared layout); selecting closes the sheet and reorders the PLP.',
      source: 'marketplaces/noon/components/NoonFiltersV2/FilterSortSection',
    },
  ],
});
