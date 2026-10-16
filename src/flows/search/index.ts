import { defineFlow } from '../../kit/registry';
import { searchFlowTokens } from './tokens';
import { lazyScreen } from '../../kit/lazyScreen';

const SearchScreen = lazyScreen(() => import('./SearchScreen'), 'SearchScreen');

const source = 'marketplaces/noon/screens/NoonSearchScreen, components/NoonSearchSuggestionRow, NoonRecentlySearchedModule; motion: github.com/saswata2002/Brand-Widget-PLP (app.js "Search suggestions — ProtoPie handoff motion")';

export const searchFlow = defineFlow({
  id: 'search',
  title: 'Search',
  group: 'Discovery',
  description: 'Search with presearch (recent searches, trending), live suggestions on the ProtoPie handoff motion (staggered fall-in, in-place crossfades, bottom-up exits), and an in-place hand-off to the PLP.',
  initial: 'search',
  tokens: searchFlowTokens,
  screens: [
    {
      id: 'search',
      title: 'Search',
      component: SearchScreen,
      transition: 'slide-left',
      notes: 'Type "phone": the presearch sinks and suggestion rows fall in top → bottom; keep typing to watch changed rows crossfade. Clear the field: rows leave bottom → top, then presearch rises back. Tap a row: the field fills, rows leave fast and the PLP fades in under the same search bar. Tap Edit on Recent Searches for the wobble/delete mode.',
      source,
      truth: 'bappzaar',
      verified: '2026-10-12',
    },
    {
      id: 'suggestions',
      title: 'Suggestions',
      component: SearchScreen,
      transition: 'slide-left',
      defaultParams: { q: 'phone' },
      notes: 'The search screen opened in the typing state ("phone"), for snapshots and deep links.',
      source,
    },
  ],
});
