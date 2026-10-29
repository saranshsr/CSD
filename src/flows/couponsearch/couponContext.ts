import { createContext, useContext } from 'react';
import { coupon, coupons, type CsCoupon } from './data';

export type { CsCoupon };

/**
 * The coupon the search started from: the visit's `&coupon=` (data.ts `getCoupon`, default BEAUTY10). The team file's
 * stress frames ("Another coupon", "Bigger offer", "Long code · cashback", "Longest offer · wraps") use it to show that
 * the code and the offer come from the coupon. A search can still be pushed with its own `coupon` param.
 */
export const csCoupons: Record<string, CsCoupon> = coupons;

export const CouponContext = createContext<CsCoupon>(coupon);
export const useCoupon = () => useContext(CouponContext);
