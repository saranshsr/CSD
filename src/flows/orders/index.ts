import { defineFlow } from '../../kit/registry';
import { ordersFlowTokens } from './tokens';
import { lazyScreen } from '../../kit/lazyScreen';

const OrderCancelScreen = lazyScreen(() => import('./OrderCancelScreen'), 'OrderCancelScreen');
const OrderTrackingScreen = lazyScreen(() => import('./OrderTrackingScreen'), 'OrderTrackingScreen');
const OrdersListScreen = lazyScreen(() => import('./OrdersListScreen'), 'OrdersListScreen');
const UpdatesSheet = lazyScreen(() => import('./UpdatesSheet'), 'UpdatesSheet');

export const ordersFlow = defineFlow({
  id: 'orders',
  title: 'Orders',
  group: 'Post-order',
  description: 'Order list (active + history) and order details / tracking from the PDS one-flows reference (V1–V4 hero variants), and cancel items.',
  initial: 'list',
  parent: 'account/account', // Back target when opened directly (no history)
  tokens: ordersFlowTokens,
  screens: [
    {
      id: 'list',
      title: 'My orders',
      component: OrdersListScreen,
      notes: 'PDS reference listing. Filter chips (Delivered, Cancelled, Returns, supermall, express) filter the cards — tap again to clear. Tap the active card to track it; Call / Chat rider toast; PIN tiles rise in. Stars pop (haptic tick) and open the review (openReview: o3 → bike, o4 → iPhone 16 Pro, o8 exchanged → iPhone 16). Track my refund → returns/details. Chat FAB bottom-right.',
      source: 'reference: pds-noon-as.vercel.app/one-flows?screen=orderlisting (My Orders); bappzaar features/o2d/screens/O2DOrdersV2Screen',
      truth: 'reference', // PDS was measured (MAPPING.md); bappzaar only for data and behaviour
    },
    {
      id: 'tracking',
      title: 'Order tracking',
      component: OrderTrackingScreen,
      defaultParams: { orderId: 'o1' },
      notes: 'PDS reference details. ?variant=1 (default) calm hero · 2 hot-afternoon wash + glass pill + advice · 3 orange glowing pill · 4 warm glow behind the tracker. V2–V4 rotate the image stack. Stepper fill grows and discs pop; Cancel items → orders/cancel; noon One strip → noonone. Per-state content follows bappzaar O2D (MAPPING.md → States): ?orderId=o3 delivered (return & exchange available) · o9 delivered with "Return" → returns/submit · o4 return window closed · o7 returned (return timeline, refund message, Track refund, Quick actions, no bill) · o8 exchanged (exchange timeline) · o5 cancelled (no timeline, red title, refund message). See all updates → orders/updates.',
      source: 'reference: pds-noon-as.vercel.app/one-flows (My Orders → Arriving today, tabs V1–V4); bappzaar features/o2d/screens/O2DOrderTrackingScreen',
      truth: 'mixed', // PDS look (measured); per-state content and actions from bappzaar O2D — MAPPING.md → States
    },
    {
      id: 'updates',
      title: 'All updates',
      component: UpdatesSheet,
      presentation: 'sheet', sheet: 'classic',
      defaultParams: { orderId: 'o3' },
      notes: 'See all updates: the timeline newest first (return cards: "Return progress"). Try ?orderId=o7 or o1.',
      source: 'features/o2d/components/NoonOrderDeliveryProgressOverlay (see_all_actions / view_shipment_history)',
    },
    {
      id: 'cancel',
      title: 'Cancel items',
      component: OrderCancelScreen,
      defaultParams: { orderId: 'o1' },
      notes: 'Select items to expand the reason picker (spring height). Refund banner slides in with the total. Missing reasons highlight in red.',
      source: 'features/o2d/screens/O2DOrderCancelItemsScreen',
    },
  ],
});
