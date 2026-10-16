// Original account icons, copied from bappzaar marketplaces/noon/theme/assets/icons (+ src/theme/assets/icons for webp).
import type { CSSProperties } from 'react';
import addresses from '@assets/icons/noon-account-addresses.svg';
import cards from '@assets/icons/noon-account-saved-cards.svg';
import returns from '@assets/icons/noon-account-returns.svg';
import warranty from '@assets/icons/noon-account-warranty-claims.svg';
import language from '@assets/icons/noon-account-language.svg';
import country from '@assets/icons/noon-account-country.svg';
import settings from '@assets/icons/noon-account-settings.svg';
import notifications from '@assets/icons/noon-account-notifications.svg';
import security from '@assets/icons/noon-account-account-security.svg';
import signOut from '@assets/icons/noon-account-signout.svg';
import signOutConfirm from '@assets/icons/noon-account-sign-out-confirm.svg';
import credits from '@assets/icons/noon-account-noon-credits.svg';
import editProfile from '@assets/icons/noon-account-edit-profile.svg';
import sellOnNoon from '@assets/icons/noon-account-sell-on-noon.svg';
import chevron from '@assets/icons/noon-account-chevron.svg';
import ordersLeft from '@assets/icons/noon-account-orders-left.svg';
import ordersCenter from '@assets/icons/noon-account-orders-center.svg';
import ordersRight from '@assets/icons/noon-account-orders-right.svg';
import wishlistLeft from '@assets/icons/noon-account-wishlist-left.svg';
import wishlistCenter from '@assets/icons/noon-account-wishlist-center.svg';
import wishlistRight from '@assets/icons/noon-account-wishlist-right.svg';
import radioOn from '@assets/icons/noon-account-country-selected.svg';
import radioOff from '@assets/icons/noon-account-country-not-selected.svg';
import haptics from '@assets/icons/noon-account-haptic-feedback.svg';
import clearCache from '@assets/icons/noon-account-trash-can.svg';
import clearCacheChevron from '@assets/icons/noon-account-clear-cache-chevron.svg';
import notification from '@assets/icons/noon-account-notification.svg';
import notificationLanguage from '@assets/icons/noon-account-notification-language.svg';
import notificationPreferences from '@assets/icons/noon-account-notification-preferences.svg';
import termsOfUse from '@assets/icons/noon-account-terms-of-use.svg';
import termsOfSale from '@assets/icons/noon-account-terms-of-sale.svg';
import privacyPolicy from '@assets/icons/noon-account-privacy-policy.svg';
import warrantyPolicy from '@assets/icons/noon-account-warranty-policy.svg';
import returnPolicy from '@assets/icons/noon-account-return-policy.svg';
import customerHappiness from '@assets/icons/noon-account-customer-happiness.svg';
import editPassword from '@assets/icons/noon-account-edit-password.svg';
import manageDevices from '@assets/icons/noon-account-manage-devices.svg';
import trashCan from '@assets/icons/noon-account-trash-can.svg';
import faceId from '@assets/icons/noon-account-face-id.svg';
import sessionEmpty from '@assets/icons/noon-account-session-control-empty.svg';
import back from '@assets/icons/noon-account-edit-profile-back.svg';
import phone from '@assets/icons/noon-account-edit-profile-phone.svg';
import male from '@assets/icons/noon-account-edit-profile-male.svg';
import female from '@assets/icons/noon-account-edit-profile-female.svg';
import airplane from '@assets/icons/noon-account-edit-profile-airplane.svg';
import home from '@assets/icons/noon-account-edit-profile-home.svg';
import calendar from '@assets/icons/noon-account-edit-profile-calendar.svg';
import checkboxOn from '@assets/shared/icons/checkbox-checked.webp';
import checkboxOff from '@assets/shared/icons/checkbox-unchecked.webp';
import arrowRight from '@assets/membership/arrow-right.webp';
import note from '@assets/account/note.webp';
import facebook from '@assets/account/facebook.webp';
import twitter from '@assets/account/twitter.webp';
import linkedin from '@assets/account/linkedin.webp';
import instagram from '@assets/account/instagram.webp';

export const accountIcons = {
  addresses,
  cards,
  returns,
  warranty,
  language,
  country,
  settings,
  notifications,
  security,
  signOut,
  signOutConfirm,
  credits,
  editProfile,
  sellOnNoon,
  chevron,
  ordersLeft,
  ordersCenter,
  ordersRight,
  wishlistLeft,
  wishlistCenter,
  wishlistRight,
  radioOn,
  radioOff,
  haptics,
  clearCache,
  clearCacheChevron,
  notification,
  notificationLanguage,
  notificationPreferences,
  termsOfUse,
  termsOfSale,
  privacyPolicy,
  warrantyPolicy,
  returnPolicy,
  customerHappiness,
  editPassword,
  manageDevices,
  trashCan,
  faceId,
  sessionEmpty,
  back,
  phone,
  male,
  female,
  airplane,
  home,
  calendar,
};

/** Raster icons (@3x copies) with their @1x render size, as RN <Image> would draw them. */
export const accountImages = {
  checkboxOn: { src: checkboxOn, w: 15, h: 15 },
  checkboxOff: { src: checkboxOff, w: 15, h: 15 },
  arrowRight: { src: arrowRight, w: 7, h: 11 },
  note: { src: note, w: 16, h: 16 },
  facebook: { src: facebook, w: 10, h: 17 },
  twitter: { src: twitter, w: 14, h: 13 },
  linkedin: { src: linkedin, w: 17, h: 16 },
  instagram: { src: instagram, w: 20, h: 20 },
};

export type AccountIcon = keyof typeof accountIcons;
export type AccountImage = keyof typeof accountImages;

/**
 * `size` boxes the SVG (RN `width/height` props, aspect preserved); omit it to render at the SVG's intrinsic size
 * (RN default when no size is passed, e.g. sheets' icons). `flipRtl` mirrors chevrons in RTL.
 */
export function AccountIconImg({ name, size, flipRtl, style }: { name: AccountIcon; size?: number; flipRtl?: boolean; style?: CSSProperties }) {
  return (
    <img
      src={accountIcons[name]}
      alt=""
      width={size}
      height={size}
      className={flipRtl ? 'nk-flip-rtl' : undefined}
      style={{ ...(size ? { width: size, height: size, objectFit: 'contain' } : null), flexShrink: 0, display: 'block', ...style }}
    />
  );
}

export function AccountImageImg({ name, style, flipRtl }: { name: AccountImage; style?: CSSProperties; flipRtl?: boolean }) {
  const i = accountImages[name];
  return <img src={i.src} alt="" width={i.w} height={i.h} className={flipRtl ? 'nk-flip-rtl' : undefined} style={{ width: i.w, height: i.h, flexShrink: 0, display: 'block', ...style }} />;
}
