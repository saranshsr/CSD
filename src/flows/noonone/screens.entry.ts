import type { ScreenDef } from '../../kit/types';
import { lazyScreen } from '../../kit/lazyScreen';

const CartOverlayScreen = lazyScreen(() => import('./screens/CartOverlayScreen'), 'CartOverlayScreen');
const OCOneOverlayScreen = lazyScreen(() => import('./screens/OCOneOverlayScreen'), 'OCOneOverlayScreen');

const V = 'features/vip';

/** entry-point overlays (cart push overlay, order-confirmation upsell) — owned by the entry area (see MAPPING.md). */
export const entryScreens: ScreenDef[] = [
  {
    id: 'cartOverlay',
    title: 'Cart overlay',
    component: CartOverlayScreen,
    presentation: 'modal',
    transition: 'noonone-overlay',
    source: `${V}/screens/VIPCartOverlayScreen (opened by marketplaces/noon/screens/NoonCartScreen showVipPush / showOnePush; chrome src/components/Overlay)`,
    notes:
      'Cart → Checkout (first time per session, non-members) opens this instead of checkout. "Explore benefits" → noon One landing (vip_v2_cart_link off → no plan-select redirect); "Continue to checkout", × or tapping outside → checkout. Copy/prices are server touchpoints (demo values).',
  },
  {
    id: 'ocOne',
    title: 'OC One overlay',
    component: OCOneOverlayScreen,
    presentation: 'modal',
    transition: 'noonone-overlay',
    defaultParams: { status: 'succeeded' },
    source: `${V}/screens/OCOneOverlayScreen (opened by marketplaces/noon/screens/NoonOrderConfirmationScreenV3 openOneSubscriptionOverlay)`,
    notes:
      'Shown over the order confirmation after placing an order with the checkout noon One toggle on (enrollOneRequestStatus). "Explore benefits" → landing, "Okay, got it" closes. `status: failed` shows OCErrorOverlay.',
  },
];
