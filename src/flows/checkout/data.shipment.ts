import { cartGroupOf, type CartGroupType, type CartLine } from '../../kit/DemoStore';
import { currency } from '../../data';

/**
 * NoonCheckoutShipmentType mock (server copy). One shipment per cart group (express / marketplace / global),
 * laid out like Figma "🚧 Checkout 2.0" (SHIPMENT n · marketplace pill · "Get it <b>…</b>" + optional
 * expandable lane row). `message` / `price` stay HtmlView strings (<highlight>, <steel>) for the lane list,
 * `label` is the bold part of the Figma footer ("Get it **Today before 8pm**").
 */
export interface ShipmentPromise {
  deliveryDate: string;
  /** bold footer label (Figma "Fulfilment Texts" second label) */
  label: string;
  message: string;
  price: string;
  /** numeric fee for the totals */
  fee: number;
  tag: 'sdd' | 'ndd' | 'nded' | 'express';
  info?: { title: string; description: string };
  /** label used on the confirmation screen */
  confirmationLabel: string;
}

/** Figma "Fulfilments for shipments" pill */
export type ShipmentMarketplace = 'supermall' | 'express' | 'global';

export interface CheckoutShipment {
  id: string;
  group: CartGroupType;
  marketplace: ShipmentMarketplace;
  lines: CartLine[];
  promises: ShipmentPromise[];
  /** Figma "Need Today Container" copy — toggles the lane list (null = single promise, no expander) */
  mainCallout: { message: string } | null;
  isSlotBased: boolean;
}

const day = (offset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d;
};
const iso = (d: Date) => d.toISOString().slice(0, 10);
/** "Sat, 17 September" (Figma footer) */
const longDate = (d: Date) => `${d.toLocaleDateString('en-GB', { weekday: 'short' })}, ${d.getDate()} ${d.toLocaleDateString('en-GB', { month: 'long' })}`;
/** "Sat 17 Sep" (confirmation) */
const shortDate = (d: Date) => d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }).replace(',', '');

/** server: lanes per marketplace (first = default selection). Figma copy for the labels. */
export function buildPromises(group: CartGroupType = 'marketplace'): ShipmentPromise[] {
  const today = day(0);
  const later = day(3);
  const global = day(5);
  if (group === 'express') {
    return [
      {
        deliveryDate: `${iso(today)}-express`,
        label: 'in 1hrs 12mins',
        message: 'Get it <highlight>in 1hrs 12mins</highlight>',
        price: `${currency}7.00`,
        fee: 7,
        tag: 'express',
        info: { title: 'Express delivery', description: 'Your order is picked from the nearest noon hub and delivered within the hour. A delivery fee applies to this shipment only.' },
        confirmationLabel: 'Arriving in 1hr 12mins',
      },
      {
        deliveryDate: iso(today),
        label: 'Today before 8pm',
        message: 'Get it <highlight>Today before 8pm</highlight>',
        price: '<highlight>FREE</highlight>',
        fee: 0,
        tag: 'sdd',
        confirmationLabel: 'Arriving today',
      },
    ];
  }
  if (group === 'xborder') {
    return [
      {
        deliveryDate: iso(global),
        label: longDate(global),
        message: `Get it <highlight>${longDate(global)}</highlight>`,
        price: '<highlight>FREE</highlight>',
        fee: 0,
        tag: 'nded',
        confirmationLabel: `Arriving ${shortDate(global)}`,
      },
    ];
  }
  return [
    {
      deliveryDate: iso(later),
      label: longDate(later),
      message: `Get it <highlight>${longDate(later)}</highlight>`,
      price: '<highlight>FREE</highlight>',
      fee: 0,
      tag: 'nded',
      confirmationLabel: `Arriving ${shortDate(later)}`,
    },
    {
      deliveryDate: iso(today),
      label: 'Today before 8pm',
      message: 'Get it <highlight>Today before 8pm</highlight>',
      price: `${currency}15.00`,
      fee: 15,
      tag: 'sdd',
      info: { title: 'Same day delivery', description: 'Orders placed before 12 PM are delivered the same day. Delivery fee applies to this shipment only.' },
      confirmationLabel: 'Arriving today',
    },
  ];
}

/** Figma order: supermall shipments, then global, then express. */
const GROUP_ORDER: CartGroupType[] = ['marketplace', 'xborder', 'express'];
const MARKETPLACE: Record<CartGroupType, ShipmentMarketplace> = { supermall: 'supermall', marketplace: 'supermall', xborder: 'global', express: 'express' };
/** the cart's supermall group ships with checkout's supermall (marketplace) shipment */
const shipmentGroupOf = (line: CartLine): CartGroupType => (cartGroupOf(line.product) === 'supermall' ? 'marketplace' : cartGroupOf(line.product));
/** server: expander copy (Figma "Need Today Texts") — only for shipments with alternative lanes */
const CALLOUT: Record<CartGroupType, string | null> = {
  supermall: 'Need it today?',
  marketplace: 'Need it today?',
  express: 'Save on fees with later delivery',
  xborder: null,
};

/** One shipment per cart group that has items (express / marketplace / global). */
export function buildShipments(cart: CartLine[]): CheckoutShipment[] {
  return GROUP_ORDER.map((group) => ({ group, lines: cart.filter((l) => shipmentGroupOf(l) === group) }))
    .filter((g) => g.lines.length > 0)
    .map(({ group, lines }) => {
      const promises = buildPromises(group);
      return {
        id: `shp-${group}`,
        group,
        marketplace: MARKETPLACE[group],
        lines,
        promises,
        mainCallout: promises.length > 1 && CALLOUT[group] ? { message: CALLOUT[group]! } : null,
        isSlotBased: false,
      };
    });
}
