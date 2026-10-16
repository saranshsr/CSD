import { defineFlow } from '../../kit/registry';
import { homeFlowTokens } from './tokens';
import { lazyScreen } from '../../kit/lazyScreen';
// the landing page stays in the main bundle (no extra round trip before first paint); every other screen loads on demand
import { HomeScreen } from './HomeScreen';

const ClassicHomeScreen = lazyScreen(() => import('./ClassicHomeScreen'), 'ClassicHomeScreen');

export const homeFlow = defineFlow({
  id: 'home',
  title: 'Home',
  group: 'Discovery',
  description: 'Home feed 1:1 with the noon app (bappzaar master): experience switcher, address, search, then the live home CMS modules in order — strip carousel, hero carousel, category icons, ad banner, product carousels, offers, mega deals, keep shopping, category sections.',
  initial: 'home',
  tokens: homeFlowTokens,
  tabBar: { tab: 'home', screens: ['home'] },
  screens: [
    {
      id: 'home',
      title: 'Home',
      component: HomeScreen,
      notes: 'Scroll past 100px to collapse the switcher and address row; the search bar stays. The top strip and the strip slider auto-advance every 3s (drag to swipe); the hero carousel auto-advances until you touch it; the offers / spotlight / savings rails drift as a marquee. Mega deals counts down to 10:00 Dubai. Tap "+" on a card to quick-add, a tile, banner or "View all" to open the listing.',
      source: 'bappzaar master ba159e20: NoonHomeScreen → NoonHomeToggleContent → Module/ModuleRenderer (live app home CMS payload order); header Figma iRE9RwO94eMAyW3j3XKNXW · 1337:5102 except the ExperienceSwitcher (useExperienceSwitcher radius 20 → 12), NoonAddressSelector + wishlist button and NoonSearchBarButton artwork, which are bappzaar 1:1; hero creatives Af34gfmhQ1D0wstXUEHSIF · 89:34398',
      truth: 'mixed',
      verified: '2026-10-12',
    },
    {
      id: 'classic',
      title: 'Home (classic)',
      component: ClassicHomeScreen,
      path: 'home-classic',
      notes: 'The previous home (bappzaar port): yellow header, Supermall toggle, CMS creatives. Kept for reference.',
      source: 'marketplaces/noon/screens/NoonHomeScreen, components/NoonHomeToggle*',
    },
  ],
});
