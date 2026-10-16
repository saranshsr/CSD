/**
 * VIPUtil.vipPushShown — NoonCartScreen.checkout shows noon.VIPCartOverlayScreen instead of going straight to checkout
 * when `cartData.pushes.vip` and `touchpoints.cartOverlay` are set and the push has not been shown this session.
 * The server only sends `pushes.vip` to non-members, so the kit gates it on the membership store.
 */
let vipPushShown = false;

/** returns true (and marks the push as shown) when the cart overlay should open on Checkout */
export function takeCartVipPush(isMember: boolean): boolean {
  if (isMember || vipPushShown) return false;
  vipPushShown = true;
  return true;
}

/** playground helper: show the push again */
export function resetCartVipPush() {
  vipPushShown = false;
}
