import type { CSSProperties } from 'react';
import appliedCoupon from '@assets/cart/applied-coupon.svg?raw';
import checkboxChecked from '@assets/cart/checkbox-checked.svg?raw';
import checkboxUnchecked from '@assets/cart/checkbox-unchecked.svg?raw';
import checkmark from '@assets/cart/checkmark.svg?raw';
import chevronThick from '@assets/cart/chevron-thick.svg?raw';
import copySquare from '@assets/cart/copy-square.svg?raw';
import discount from '@assets/cart/discount-icon.svg?raw';
import greenCheck from '@assets/cart/green-check.svg?raw';
import minus from '@assets/cart/minus.svg?raw';
import plus from '@assets/cart/plus.svg?raw';
import trash from '@assets/cart/trash.svg?raw';
import wishlist from '@assets/cart/wishlist.svg?raw';

/** NoonThemeManager.icons SVGs copied from master (they paint with currentColor). */
const svgs = { appliedCoupon, checkboxChecked, checkboxUnchecked, checkmark, chevronThick, copySquare, discount, greenCheck, minus, plus, trash, wishlist };
export type CartIconName = keyof typeof svgs;

export function CartIcon({ name, size = 16, color, style, flipRtl }: { name: CartIconName; size?: number; color?: string; style?: CSSProperties; flipRtl?: boolean }) {
  return (
    <span
      aria-hidden
      className={flipRtl ? 'nk-flip-rtl' : undefined}
      style={{ display: 'inline-flex', width: size, height: size, flexShrink: 0, color, ...style }}
      // the svg files carry their own width/height; force them to fill the box
      dangerouslySetInnerHTML={{ __html: svgs[name].replace('<svg ', `<svg style="width:100%;height:100%" `) }}
    />
  );
}
