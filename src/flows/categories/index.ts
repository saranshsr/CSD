import { defineFlow } from '../../kit/registry';
import { type CategoriesParams } from './CategoriesScreen';
import { categoriesFlowTokens } from './tokens';
import { lazyScreen } from '../../kit/lazyScreen';

const CategoriesScreen = lazyScreen(() => import('./CategoriesScreen'), 'CategoriesScreen');

const source =
  'marketplaces/noon/screens/NoonCategoriesScreen → src/screens/DynamicLoaderScreen (unstructured "/categories") → src/components/StaticPage, ' +
  'src/components/Module/AdBannerModuleV2 + BannerModule, src/components/Module/CollapsibleBannerModule (+ MainBanner, SubBanner), ModuleWrapper/ModuleHeader';

export const categoriesFlow = defineFlow({
  id: 'categories',
  title: 'Categories',
  group: 'Discovery',
  description:
    'Categories tab, 1:1 with master + the live UAE CMS: search bar, pre-search banner, then a 3-column grid of 29 category tiles. Tapping a tile opens its sub-category list under that row. Sub-categories open the PLP.',
  initial: 'categories',
  tokens: categoriesFlowTokens,
  tabBar: { tab: 'categories', screens: ['categories', 'expanded', 'loading', 'error'], scrollHide: false }, // no ScrollVisibilityProvider on NoonCategoriesScreen
  screens: [
    {
      id: 'categories',
      title: 'Categories',
      component: CategoriesScreen,
      path: ['all-categories'],
      notes:
        'Tap a category tile: it slides down 15px with a grey (CMS borderColor) border and its title grows (300ms). The sub-category list opens under the row (300ms). Tap the tile again to close it, tap another tile to swap the list. If the opened row would not fit, the page scrolls it to the top. Sub-category or "View all" → PLP. On the first visit the ProgressLoader shows while /categories "loads". The content is a live CMS snapshot: data.live.ts.',
      source,
    },
    {
      id: 'expanded',
      title: 'Category opened',
      component: CategoriesScreen,
      defaultParams: { open: 'mobiles-accessories' } satisfies CategoriesParams,
      notes: 'Same screen with "Mobiles & Accessories" opened (`?open=<id>`, ids are the tile image slugs, e.g. `electronics`, `home-kitchen`).',
      source,
    },
    {
      id: 'loading',
      title: 'Loading',
      component: CategoriesScreen,
      defaultParams: { state: 'loading' } satisfies CategoriesParams,
      notes: 'DynamicLoaderScreen loading: FeedbackView → ProgressLoader. A full pale-blue (kitBlue98) screen with a sweeping 4px accent bar above the tabs. No search bar, because StaticPage has not mounted yet.',
      source: 'src/screens/DynamicLoaderScreen (FeedbackView renderLoader) → src/components/ProgressLoader',
    },
    {
      id: 'error',
      title: 'Error',
      component: CategoriesScreen,
      defaultParams: { state: 'error' } satisfies CategoriesParams,
      notes: 'FeedbackView error → EmptyView default → NoonEmptyView ("Oops! Something went wrong." + Retry). Retry reloads (loader → content).',
      source: 'src/components/FeedbackView → src/components/EmptyView → marketplaces/noon/components/NoonEmptyView',
    },
  ],
});
