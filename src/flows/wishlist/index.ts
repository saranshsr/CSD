import { defineFlow } from '../../kit/registry';
import { wishlistFlowTokens } from './tokens';
import { lazyScreen } from '../../kit/lazyScreen';

const EmptyWishlistScreen = lazyScreen(() => import('./EmptyWishlistScreen'), 'EmptyWishlistScreen');
const WishlistLoadingScreen = lazyScreen(() => import('./WishlistLoadingScreen'), 'WishlistLoadingScreen');
const WishlistScreen = lazyScreen(() => import('./WishlistScreen'), 'WishlistScreen');
const OptionsSheet = lazyScreen(() => import('./OptionsSheet'), 'OptionsSheet');

const S = 'marketplaces/noon';

export const wishlistFlow = defineFlow({
  id: 'wishlist',
  title: 'Wishlist',
  group: 'Profile',
  description: 'Pushed from the home header heart (not a tab). Wishlist V2 1:1 with bappzaar: collections, saved items grid of wishlist product boxes (⋮ options, add-to-cart stepper, share), floating View Cart pill, skeleton and empty states.',
  initial: 'wishlist',
  tokens: wishlistFlowTokens,
  screens: [
    {
      id: 'wishlist',
      title: 'Wishlist',
      component: WishlistScreen,
      notes: 'Scroll: the header title cross-fades "Wishlist" → "All Saved Items" with the scroll (±8px around the heading) and the Create pill fades. Tap "Add to cart": it becomes the stepper (trash at 1) and the View Cart pill slides up (→ Cart tab). ⋮ on a card opens the options sheet; Remove item takes it off the wishlist. Remove every item to see the in-list empty state.',
      source: `${S}/screens/NoonWishlistV2Screen, components/NoonWishlistV2{Header,CollectionTitle,CollectionTitleList,CollectionImageBackground,FloatingCartButton}, NoonProductBox/NoonProductBoxVertical (isWishlist), NoonProductBoxWishlistAddToCart, NoonProductBoxCollectionButton, NoonProductBoxOptionButton`,
      truth: 'bappzaar',
    },
    {
      id: 'no-collections',
      title: 'Wishlist (no collections)',
      component: WishlistScreen,
      defaultParams: { collections: 'none' },
      notes: 'No collections yet: the dashed "Save, sort into collections & share with anyone" widget sits above All Saved Items; X dismisses it.',
      source: `${S}/components/NoonWishlistV2NoCollectionWidget`,
      truth: 'bappzaar',
    },
    {
      id: 'empty',
      title: 'Empty wishlist',
      component: EmptyWishlistScreen,
      notes: 'The looping noonWishlistV2EmptyLottie with the header floating over it (Create still shown). "Start adding items" opens Search.',
      source: `${S}/components/NoonWishlistV2Empty, screens/NoonWishlistV2Screen (isEmpty)`,
      truth: 'bappzaar',
    },
    {
      id: 'loading',
      title: 'Wishlist (loading)',
      component: WishlistLoadingScreen,
      notes: 'The skeleton held on screen: header, three collection tiles, the title and two rows of product boxes.',
      source: `${S}/components/NoonWishlistV2ScreenSkeleton`,
      truth: 'bappzaar',
    },
    {
      id: 'options',
      title: 'Item options',
      component: OptionsSheet,
      presentation: 'sheet',
      sheet: { layout: 'floating', surface: 'transparent' },
      parent: 'wishlist/wishlist',
      notes: '⋮ on a wishlist product box. Organise → Add to collection (toast), Remove item → removed from the wishlist with a "Removed from Wishlist" toast.',
      source: `${S}/screens/NoonWishlistV2CollectionOptionScreen`,
      truth: 'bappzaar',
    },
  ],
});
