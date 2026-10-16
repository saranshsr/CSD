import { defineFlow } from '../../kit/registry';
import { cartFlowTokens } from './tokens';
import { lazyScreen } from '../../kit/lazyScreen';

const CartScreen = lazyScreen(() => import('./CartScreen'), 'CartScreen');
const CustomizeSheet = lazyScreen(() => import('./CustomizeSheet'), 'CustomizeSheet');
const DiscountDetailsSheet = lazyScreen(() => import('./DiscountDetailsSheet'), 'DiscountDetailsSheet');
const UpdatesSheet = lazyScreen(() => import('./UpdatesSheet'), 'UpdatesSheet');
const VariantsSheet = lazyScreen(() => import('./VariantsSheet'), 'VariantsSheet');
const VirtualBundlesSheet = lazyScreen(() => import('./VirtualBundlesSheet'), 'VirtualBundlesSheet');
const CouponTraySheet = lazyScreen(() => import('./CouponTraySheet'), 'CouponTraySheet');

export const cartFlow = defineFlow({
  id: 'cart',
  title: 'Cart',
  group: 'Shopping',
  description: 'NoonCartScreen from master: address header, cart-updates banner, supermall / Global / express / market shipment groups with free-delivery progress, item actions, unavailable items, coupon, cobrand cards, payment offers, recommendations, sliding invoice and the sticky checkout footer — plus the cart overlays.',
  initial: 'cart',
  tokens: cartFlowTokens,
  tabBar: { tab: 'cart', screens: ['cart', 'empty', 'loading'] },
  screens: [
    {
      id: 'cart',
      title: 'Cart',
      component: CartScreen,
      notes: 'Loader flashes first (FeedbackView). Qty stepper: +/- update instantly, commit after the 1.2s debounce (loader) → group progress bar, savings tab, footer total and invoice update; trash at qty 1 removes the item (no confirm on master). Heart = move to wishlist + snackbar. Chips: \"Size\" → variants sheet, discount tags → discount sheet, \"Bundle & save\" → bundle sheet, \"Text … Edit\" → customize, \"Tap to review\" → cart updates; \"Protect it… Add\" adds a warranty (× removes). Foupon checkbox, coupon NOON10 / SAVE50 (≥ AED 300) apply, anything else = invalid. Tap the footer total to slide the invoice up (backdrop / swipe down closes). Checkout → checkout/checkout. Global group starts under the 100 free-delivery threshold — bump the cable to 3. Groups run supermall (Apple Watch) → Global → express → market. noon One Credit Card cards auto-advance every 3s until you swipe them; payment-offer tiles scroll sideways (noon One entry hidden for members).',
      source: 'marketplaces/noon/screens/NoonCartScreen; visuals Figma Af34gfmhQ1D0wstXUEHSIF · 127:39687 (All flows "Cart": supermall / Global / express / market groups, carousels, coupon, cobrand cards, payment offers, sticky footer 127:40209 — see FIGMA-MAPPING.md)',
      truth: 'mixed',
      verified: '2026-10-13',
    },
    {
      id: 'empty',
      title: 'Cart (empty)',
      component: CartScreen,
      defaultParams: { state: 'empty' },
      notes: 'Forced empty state (doesn’t touch the store): empty-generic image + copy and the CMS recommendations; no footer. Master has no Shop-now CTA — the tab bar is the way out. Removing every item in cart/cart lands here too.',
      source: 'marketplaces/noon/screens/NoonCartScreen (renderEmptyCart)',
    },
    {
      id: 'loading',
      title: 'Cart (loading)',
      component: CartScreen,
      defaultParams: { state: 'loading' },
      notes: 'ProgressLoader held on screen: pale-blue page with the 4px sweeping gradient bar above the tab bar.',
      source: 'marketplaces/noon/screens/NoonCartScreen (FeedbackView LOADING)',
    },
    {
      id: 'variants',
      title: 'Change variant',
      component: VariantsSheet,
      presentation: 'sheet', sheet: 'classic',
      defaultParams: { productId: 'p6' },
      notes: 'Opened from the "Size: 46mm ▾" callout (variants_switch). Tap 42mm → Add to Cart / Update Item appear; Update Item switches the line’s variant and the cart chip updates. productId p12 shows colour chips with an out-of-stock option.',
      source: 'marketplaces/noon/screens/NoonCartVariantsOverlayScreen (+ NoonProductCartOptionsSelection chips)',
    },
    {
      id: 'customize',
      title: 'Customize item',
      component: CustomizeSheet,
      presentation: 'sheet', sheet: 'classic',
      defaultParams: { productId: 'p1' },
      notes: 'Opened from the item’s "Text … Edit" row. Edit the engraving (counter n/20); Save Message → loader → "Changes have been saved successfully" toast, cart row updates.',
      source: 'marketplaces/noon/screens/NoonCartCustomizeOverlayScreen',
    },
    {
      id: 'couponTray',
      title: 'Coupon tray',
      component: CouponTraySheet,
      presentation: 'sheet',
      // useScrollToClose(…, isFloating true) → OverlayBottomSheet isFloating; contentContainerStyle antiFlashWhite
      sheet: { layout: 'floating', surface: 'var(--nk-palette-anti-flash-white)' },
      notes: 'Opened from "View available coupons & offers". Best price card (NOON10 + bank offer), Coupons (SAVE50 locked under 300 with the amount bar, ONE20 noon One exclusive with the Join One banner for non-members, WEEKEND15 with the Ends in timer and expandable text, BUY3 unit chips, cashback tiers bar) and Payment offers. Apply → loader on the offer, tray locked → coupon applied, tray closes; Remove refreshes in place. T&C / Shop more / Add products / Join One close the tray. Params state: loading | error (Try again) | empty.',
      source: 'marketplaces/noon/screens/NoonSalesCouponTrayOverlayScreen (+ NoonSalesCouponTrayOffer, NoonSalesCouponTrayBestPriceSection, …UnlockCriteria, …TiersProgressBar, …AnimatedItem); see components/couponTray/MAPPING.md',
      truth: 'bappzaar',
    },
    {
      id: 'discount',
      title: 'Discount details',
      component: DiscountDetailsSheet,
      presentation: 'sheet', sheet: 'classic',
      defaultParams: { productId: 'p1', tagId: 'dt-noon10' },
      notes: 'Opened from a dashed discount tag. Apply → loader → Applied + coupon feedback (applies the cart coupon). Terms list; eligible-items carousel skeleton then products; View all → PLP. Pass copyOnly: true for the Copy Code / Copied! variant.',
      source: 'marketplaces/noon/screens/NoonCartDiscountDetailsOverlayScreen',
    },
    {
      id: 'bundles',
      title: 'Bundle details',
      component: VirtualBundlesSheet,
      presentation: 'sheet', sheet: 'classic',
      defaultParams: { productId: 'p8' },
      notes: 'Opened from the espresso machine’s "Bundle & save AED 60 · View" callout (vbundle): gradient header with the bundle Lottie, items with ×qty chips, Total / You are saving / Combo Total.',
      source: 'marketplaces/noon/screens/NoonCartVirtualBundlesOverlayScreen',
    },
    {
      id: 'updates',
      title: 'Cart updates',
      component: UpdatesSheet,
      presentation: 'sheet', sheet: 'classic',
      notes: 'Opened from the "Your cart’s been updated · Tap to review" banner; lists the price-drop and out-of-stock updates.',
      source: 'marketplaces/noon/screens/NoonCartUpdatesOverlayScreen',
    },
  ],
});
