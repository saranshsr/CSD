import type { CSSProperties } from 'react';
import addedToCart from '@assets/pdp/added-to-cart.webp';
import aiSummarySparkle from '@assets/pdp/ai-summary-sparkle.webp';
import arrowUpRight from '@assets/pdp/arrow-up-right.webp';
import checkboxBlueChecked from '@assets/pdp/checkbox-blue-checked.webp';
import checkboxGrey from '@assets/pdp/checkbox-grey.webp';
import frequentlyBoughtPlus from '@assets/pdp/frequently-bought-plus.webp';
import rocketPdp from '@assets/pdp/rocket-pdp-en.webp';
import arrowUpTray from '@assets/pdp/arrow-up-tray.webp';
import back from '@assets/shared/search-bar/back.webp';
import chevronDown from '@assets/icons/noon-chevron-down.webp';
import chevronUpWhite from '@assets/pdp/chevron-up-white.webp';
import circlePoint from '@assets/pdp/circle-point.webp';
import closeQuantity from '@assets/cart/close-quantity.webp';
import discountIcon from '@assets/pdp/discount-icon.webp';
import discountTagFilled from '@assets/pdp/discount-tag-filled.webp';
import downArrow from '@assets/pdp/down-arrow.webp';
import expressPdp from '@assets/pdp/express-pdp-en.webp';
import favourite from '@assets/pdp/favourite.webp';
import favouriteActive from '@assets/pdp/favourite-active-v2.webp';
import inYourCart from '@assets/pdp/in-your-cart.webp';
import info from '@assets/pdp/info.webp';
import noonOne from '@assets/noonone/entry/noon-one.webp';
import ratingStar from '@assets/pdp/noon-rating-star-white.webp';
import reviewChevron from '@assets/checkout/delivery-chevron-right-blue@3x.webp';
import reviewStar from '@assets/pdp/noon-review-star-empty.webp';
import offer from '@assets/pdp/offer.webp';
import returnable from '@assets/pdp/returnable.webp';
import verifiedPurchase from '@assets/pdp/reviews-verified-purchase.webp';
import rightChevron from '@assets/noonone/entry/right-chevron.webp';
import searchBar from '@assets/icons/noon-search-bar.webp';
import sellerLogo from '@assets/pdp/seller-logo.webp';
import tabby from '@assets/checkout/payment-tabby.webp';
import tamara from '@assets/checkout/payment-tamara.webp';
import thumbUp from '@assets/pdp/thumb-up.webp';
import tick from '@assets/pdp/tick.webp';
import upArrow from '@assets/pdp/up-arrow.webp';
import verified from '@assets/pdp/verified-filled.webp';
import warranty from '@assets/pdp/warranty.webp';

/** bappzaar master icons (NoonIcons / Images), @3x copies in src/assets/pdp. */
export const assets = {
  addedToCart,
  aiSummarySparkle,
  arrowUpRight,
  checkboxBlueChecked,
  checkboxGrey,
  frequentlyBoughtPlus,
  rocketPdp,
  arrowUpTray,
  back,
  chevronDown,
  chevronUpWhite,
  circlePoint,
  closeQuantity,
  discountIcon,
  discountTagFilled,
  downArrow,
  expressPdp,
  favourite,
  favouriteActive,
  inYourCart,
  info,
  noonOne,
  ratingStar,
  reviewChevron,
  reviewStar,
  offer,
  returnable,
  verifiedPurchase,
  rightChevron,
  searchBar,
  sellerLogo,
  tabby,
  tamara,
  thumbUp,
  tick,
  upArrow,
  verified,
  warranty,
} as const;
export type AssetName = keyof typeof assets;

/** Icon sizes = the @1x pixel size of the master asset (RN renders images at 1x points). */
export type IconSize = 10 | 11 | 12 | 16 | 17 | 18 | 20 | 22 | 24 | 28;
const sizeVar = (s: IconSize) => `var(--nk-layout-pdp-icon${s})`;

/**
 * Master image icon. `tint` (a CSS colour token) mimics RN `tintColor` with a CSS mask.
 * `flip` mirrors in RTL like the `scaleX: I18nManager.isRTL ? -1 : 1` transforms.
 */
export function Asset({ name, size, width, height, tint, flip, style, className }: { name: AssetName; size?: IconSize; width?: string; height?: string; tint?: string; flip?: boolean; style?: CSSProperties; className?: string }) {
  const w = width ?? (size ? sizeVar(size) : undefined);
  const h = height ?? (size ? sizeVar(size) : undefined);
  const base: CSSProperties = { width: w, height: h, flexShrink: 0, display: 'block', ...style };
  const cls = [flip ? 'pdp-flip' : '', className ?? ''].join(' ').trim() || undefined;
  if (tint) {
    const url = `url(${assets[name]})`;
    return <span aria-hidden className={cls} style={{ ...base, background: tint, WebkitMask: `${url} center / contain no-repeat`, mask: `${url} center / contain no-repeat` }} />;
  }
  return <img alt="" aria-hidden src={assets[name]} className={cls} style={{ ...base, objectFit: 'contain' }} draggable={false} />;
}

/** NoonDashedBorder: 1px round-capped dashes (5 on / 6 off). */
export function DashedLine({ color, style }: { color: string; style?: CSSProperties }) {
  return (
    <svg width="100%" height="1" style={{ display: 'block', flexShrink: 0, ...style }} aria-hidden>
      <line x1="0" y1="0.5" x2="100%" y2="0.5" stroke={color} strokeWidth="1" strokeLinecap="round" strokeDasharray="5,6" />
    </svg>
  );
}
