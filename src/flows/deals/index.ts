import { defineFlow } from '../../kit/registry';
import { dealsFlowTokens } from './tokens';
import { lazyScreen } from '../../kit/lazyScreen';

const DealsScreen = lazyScreen(() => import('./DealsScreen'), 'DealsScreen');

export const dealsFlow = defineFlow({
  id: 'deals',
  title: 'Deals',
  group: 'Discovery',
  description: 'The dynamic bottom tab (CMS-driven title, icon and page). Live config: "Deals" → /noon-deals-ae with cashback strips, banners, deal rails and the offers listing.',
  initial: 'deals',
  tokens: dealsFlowTokens,
  tabBar: { tab: 'deals', screens: ['deals'] },
  screens: [
    {
      id: 'deals',
      title: 'Deals',
      component: DealsScreen,
      notes: 'Swipe the strips and banners; tap a tile, banner or "View All" to open the PLP. In the app this tab is configured in whoami tabConfig.dynamicTab (title, icon, linkUrl) and falls back to "Deals" + discount-badge → /daily-deals.',
      source: 'marketplaces/noon/NoonApp.ts (getTabScreens, getDynamicTabInfo), screens/NoonDynamicTabScreen',
    },
  ],
});
