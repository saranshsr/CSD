import { defineFlow } from '../../kit/registry';
import { lazyScreen } from '../../kit/lazyScreen';
import { couponsearchFlowTokens } from './tokens';

const EligibleScreen = lazyScreen(() => import('./EligibleScreen'), 'EligibleScreen');
const SearchScreen = lazyScreen(() => import('./SearchScreen'), 'SearchScreen');
const ResultsScreen = lazyScreen(() => import('./ResultsScreen'), 'ResultsScreen');

const source =
  'reference: coupon-scoped search prototype (CSD, csdd-gamma.vercel.app; team file Iteration 1 Flow B + Iteration 2 Context band / Eligible row) on the kit search (src/flows/search) and listing (src/flows/plp)';

/**
 * Coupon-scoped search (BEAUTY10): cart → coupon tray → Shop more → eligible items → search → results, in three
 * versions picked by the switch above the phone (`?v=h2|row|n5`, store.ts): Context band · Eligible row · Auto-suggestion.
 */
export const couponsearchFlow = defineFlow({
  id: 'couponsearch',
  title: 'Coupon search (BEAUTY10)',
  group: 'Shopping',
  description:
    'Search started from a coupon: BEAUTY10 eligible items, then a search that knows its coupon, in three versions (context band, eligible-only toggle row, scoped auto-suggestion row).',
  initial: 'eligible',
  parent: 'cart/cart',
  tokens: couponsearchFlowTokens,
  screens: [
    {
      id: 'eligible',
      title: 'Eligible items',
      component: EligibleScreen,
      path: 'beauty10',
      notes: "The coupon tray's BEAUTY10 Shop more lands here: hero, pills, eligible grid. Tap the search bar for the coupon search.",
      source,
      truth: 'reference',
    },
    {
      id: 'search',
      title: 'Coupon search',
      component: SearchScreen,
      transition: 'slide-left',
      path: 'beauty10-search',
      parent: 'couponsearch/eligible',
      notes:
        'h2: ✕ the band (or flick / drag it; catch it mid-close). row: flip "Search BEAUTY10 items only" (tap or drag). n5: the scoped row leads the typeahead. Type "se", then "serum"; then "seiko watch".',
      source,
      truth: 'reference',
    },
    {
      id: 'results',
      title: 'Coupon results',
      component: ResultsScreen,
      defaultParams: { query: 'serum', scope: 'eligible' },
      path: 'beauty10-results',
      parent: 'couponsearch/eligible',
      notes: 'One context line under the pills says where the results come from (never a count). Tap the bar to edit the query.',
      source,
      truth: 'reference',
    },
  ],
});
