import { cartAddOns, computeCartTotals, type CartLine, type CartTotals } from '../../kit/DemoStore';
import { currency, formatPrice } from '../../data';
import { t } from './data';

/** legacy row shape (kept for checkout/CheckoutScreen, which imports buildInvoice) */
export interface InvoiceRow {
  label: string;
  value: number;
  highlight?: boolean;
  free?: boolean;
}

/**
 * Backward-compatible helper used by checkout. Prefer `useCartTotals()` / `computeCartTotals()` from
 * src/kit/DemoStore.tsx — this just maps those totals to the old `{ subtotal, savings, shipping, discount, total, rows, freeDelivery }`.
 */
export function buildInvoice(cart: CartLine[], coupon?: string | null) {
  const tt = computeCartTotals(cart, coupon);
  const rows: InvoiceRow[] = [
    { label: `${t.subtotal} (${tt.itemCount} items)`, value: tt.subtotal },
    { label: t.shippingFee, value: tt.shipping, free: tt.freeDelivery },
    ...(tt.addOns ? [{ label: 'Extended warranty', value: tt.addOns }] : []),
    ...(tt.foupons ? [{ label: 'Free coupon', value: -tt.foupons, highlight: true }] : []),
    ...(tt.couponDiscount ? [{ label: `Coupon (${tt.coupon?.code})`, value: -tt.couponDiscount, highlight: true }] : []),
  ];
  return { subtotal: tt.subtotal, savings: tt.savings, shipping: tt.shipping, discount: tt.couponDiscount + tt.foupons, total: tt.total, rows, freeDelivery: tt.freeDelivery, totals: tt };
}

/** NoonDynamicInvoiceType (server shape) */
export interface DynamicInvoiceEntry {
  title: string;
  amount: string;
  subtitle?: string;
}
export interface DynamicInvoiceSection {
  title?: string;
  isSpecial?: boolean;
  entries: DynamicInvoiceEntry[];
}

const money = (n: number) => `${currency} ${formatPrice(n)}`;

/** Builds the invoice sections the cart API would return for the current totals. */
export function buildDynamicInvoice(tt: CartTotals, cart: CartLine[]): DynamicInvoiceSection[] {
  const entries: DynamicInvoiceEntry[] = [
    { title: `${t.subtotal} (${tt.itemCount} ${tt.itemCount === 1 ? 'item' : 'items'})`, amount: money(tt.subtotal) },
    { title: t.shippingFee, amount: tt.freeDelivery ? `<highlight>${t.free}</highlight>` : money(tt.shipping) },
  ];
  for (const l of cart) {
    if (l.warranty && cartAddOns[l.warranty]) entries.push({ title: cartAddOns[l.warranty].label, amount: money(cartAddOns[l.warranty].price * l.qty) });
  }
  if (tt.foupons) entries.push({ title: 'Free coupon savings', amount: `<highlight>- ${money(tt.foupons)}</highlight>` });
  if (tt.couponDiscount) entries.push({ title: `Coupon <steel>(${tt.coupon?.code})</steel>`, amount: `<highlight>- ${money(tt.couponDiscount)}</highlight>` });
  const sections: DynamicInvoiceSection[] = [
    { title: `<h5><b>${t.orderSummary}</b></h5>`, entries },
    { entries: [{ title: `<h4><b>${t.total}</b></h4> <steel><small>${t.inclVat}</small></steel>`, amount: `<h4><b>${money(tt.total)}</b></h4>` }] },
  ];
  if (tt.totalSavings > 0) sections.push({ isSpecial: true, entries: [{ title: `<highlight>You’re saving ${money(tt.totalSavings)}</highlight> on this order`, amount: '' }] });
  return sections;
}
