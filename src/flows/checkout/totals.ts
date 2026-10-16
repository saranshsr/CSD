import { useMemo } from 'react';
import { useDemoStore } from '../../kit/DemoStore';
import { walletAmount } from './data';
import { buildShipments, type CheckoutShipment, type ShipmentPromise } from './data.shipment';
import { useCheckout, type CheckoutState } from './store';

export interface CheckoutTotals {
  shipments: CheckoutShipment[];
  /** shipmentId → selected promise */
  selectedPromise: Record<string, ShipmentPromise>;
  itemsCount: number;
  subtotal: number;
  /** Σ qty × was (struck "AED …" next to the Figma Subtotal) */
  mrp: number;
  /** DemoStore cartTotals.totalSavings (+ nothing checkout-specific) */
  savings: number;
  /** warranty / protection add-ons from the cart */
  addOns: number;
  shippingFee: number;
  /** coupon + foupon discounts from the cart */
  discount: number;
  donation: number;
  /** sessionData.total (before points / credits) */
  total: number;
  burnAmount: number;
  walletAmount: number;
  creditsUsed: number;
  /** sessionData.orderPaymentAmount — what the sticky footer shows and the payment method is charged */
  orderPaymentAmount: number;
  isCreditsSufficient: boolean;
}

/** Built on DemoStore `cartTotals` (single source of truth for cart + checkout) + the checkout-only session bits. */
export function computeTotals(store: Pick<ReturnType<typeof useDemoStore>, 'cart' | 'cartTotals'>, s: CheckoutState): CheckoutTotals {
  const { cart, cartTotals: ct } = store;
  const shipments = buildShipments(cart);
  const selectedPromise: Record<string, ShipmentPromise> = {};
  for (const sh of shipments) selectedPromise[sh.id] = sh.promises.find((p) => p.deliveryDate === s.promiseByShipment[sh.id]) ?? sh.promises[0];
  const itemsCount = ct.itemCount;
  const subtotal = ct.subtotal;
  const savings = ct.totalSavings;
  // cart shipping (per group, waived above the threshold) + the fee of a faster lane picked at checkout
  const shippingFee = ct.shipping + Object.values(selectedPromise).reduce((n, p) => n + p.fee, 0);
  const discount = ct.couponDiscount + ct.foupons;
  const total = Math.max(0, ct.total + shippingFee - ct.shipping + s.donation);
  const burnAmount = s.burn ? Math.min(s.burn.amount, total) : 0;
  const afterBurn = total - burnAmount;
  const creditsUsed = s.useCredits ? Math.min(walletAmount, afterBurn) : 0;
  const orderPaymentAmount = Math.round((afterBurn - creditsUsed) * 100) / 100;
  return {
    shipments,
    selectedPromise,
    itemsCount,
    subtotal,
    mrp: subtotal + ct.savings,
    savings,
    addOns: ct.addOns,
    shippingFee,
    discount,
    donation: s.donation,
    total,
    burnAmount,
    walletAmount,
    creditsUsed,
    orderPaymentAmount,
    isCreditsSufficient: walletAmount >= afterBurn,
  };
}

/** Live totals for the current cart + checkout session. */
export function useCheckoutTotals(): CheckoutTotals {
  const { cart, cartTotals } = useDemoStore();
  const s = useCheckout((x) => x);
  return useMemo(() => computeTotals({ cart, cartTotals }, s), [cart, cartTotals, s]);
}
