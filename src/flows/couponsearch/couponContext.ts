import { createContext, useContext } from 'react';
import { currency } from '../../data';
import { coupon as beauty10 } from './data';

/**
 * The coupon the search started from. The demo runs on BEAUTY10; the team file's stress frames ("Another coupon",
 * "Bigger offer", "Long code · cashback", "Longest offer · wraps") open the search with `?coupon=` to show that the
 * code and the offer come from the coupon. Item counts are never part of a coupon's copy.
 */
export interface CsCoupon {
  code: string;
  /** eligible row line 2 / band subline */
  value: string;
  /** the band's subline when it differs from the row's */
  bandValue?: string;
  /** scoped row subline: "CODE · short" */
  short: string;
  /** eligible row line 1 when it differs (the frames' longest-offer stress case: "Search within ALINMA25") */
  rowLead?: string;
  rowTail?: string;
}

export const csCoupons: Record<string, CsCoupon> = {
  beauty10: { code: beauty10.code, value: beauty10.value, short: beauty10.short },
  extra250: { code: 'EXTRA250', value: `Extra ${currency}250 off on orders above ${currency}1,500`, short: `extra ${currency}250 off` },
  summerglow25: { code: 'SUMMERGLOW25', value: `15% cashback up to ${currency}100 in noon credits`, bandValue: 'Extra 15% cashback at checkout', short: '15% cashback' },
  alinma25: { code: 'ALINMA25', value: `25% off with Alinma Bank cards, up to ${currency}200 on beauty and fragrance`, short: '25% off with Alinma', rowLead: 'Search within', rowTail: '' },
};

export const CouponContext = createContext<CsCoupon>(csCoupons.beauty10);
export const useCoupon = () => useContext(CouponContext);
