/**
 * Returns assets (src/assets/returns). AFS icons are CDN-only on master (AFSIcons.BASE_AFS_CDN_URL/returns/*.svg,
 * …/warranty-claims/radio-*.svg, AFSImages, AFSLotties) and were downloaded under the same file names; the noon
 * webp glyphs are the @3x files from marketplaces/noon/theme/assets and src/theme/assets.
 */
import arrowDown from '@assets/shared/icons/arrow-down.webp';
import emptyReturnRequests from '@assets/returns/empty-return-requests@3x.webp';
import feesRefundBlack from '@assets/returns/fees-refund-black@3x.webp';
import returnableItem from '@assets/returns/returnable-item@3x.webp';
import searchBar from '@assets/icons/noon-search-bar.webp';
import slimChevronLeft from '@assets/returns/slim-chevron-left@3x.webp';
import slimChevronRight from '@assets/returns/slim-chevron-right@3x.webp';
import xMark from '@assets/returns/x-mark@3x.webp';
import addressSelected from '@assets/returns/returns-address-selected.svg';
import addressUnselected from '@assets/returns/returns-address-unselected.svg';
import arrowBottomGreen from '@assets/returns/returns-arrow-bottom-green.svg';
import camera from '@assets/returns/returns-camera.svg';
import chevronRightBold from '@assets/returns/returns-chevron-right-bold.svg';
import chevronRightGray from '@assets/returns/returns-chevron-right-gray.svg';
import chevronRightPrimary from '@assets/returns/returns-chevron-right-primary.svg';
import cross from '@assets/returns/returns-cross.svg';
import editPenFilled from '@assets/returns/returns-edit-pen-filled.svg';
import editPen from '@assets/returns/returns-edit-pen.svg';
import editPinSquare from '@assets/returns/returns-edit-pin-square.svg';
import errorIcon from '@assets/returns/returns-error-icon.svg';
import gallery from '@assets/returns/returns-gallery-2.svg';
import infoCircleGray from '@assets/returns/returns-info-circle-gray.svg';
import locationPinFilled from '@assets/returns/returns-location-pin-filled.svg';
import note from '@assets/returns/returns-note-2.svg';
import orderInvoices from '@assets/returns/returns-order-invoices.svg';
import pickupLocation from '@assets/returns/returns-pickup-location.svg';
import pickupTime from '@assets/returns/returns-pickup-time.svg';
import pinIsland from '@assets/returns/returns-pin-island.webp';
import plusBlack from '@assets/returns/returns-plus-black-v2.svg';
import policy from '@assets/returns/returns-policy.svg';
import radioChecked2 from '@assets/returns/returns-radio-checked-2.svg';
import radioCheckedTick from '@assets/returns/returns-radio-checked.svg';
import radioUnchecked2 from '@assets/returns/wc-radio-unchecked.svg';
import refundRequestSummary from '@assets/returns/returns-refund-request-summary.svg';
import refundSummary from '@assets/returns/returns-refund-summary.svg';
import rewindCross from '@assets/returns/returns-rewind-cross.svg';
import supermallTag from '@assets/returns/returns-supermall-tag.svg';
import verifiedGreen from '@assets/returns/returns-verified-green.svg';
import wcRadioChecked from '@assets/returns/wc-radio-checked.svg';
import wcRadioUnchecked from '@assets/returns/wc-radio-unchecked.svg';
import processingLottie from '@assets/returns/returns-processing-en.lottie';
import feedbackSuccessLottie from '@assets/lotties/order-confirmed-checkmark.lottie';
import cardMastercard from '@assets/shared/payment/brand-card-mastercard.webp';
import noonCredit from '@assets/checkout/payment-noon-credit.webp';

export const icons = {
  arrowDown,
  feesRefundBlack,
  returnableItem,
  searchBar,
  slimChevronLeft,
  slimChevronRight,
  xMark,
  addressSelected,
  addressUnselected,
  arrowBottomGreen,
  camera,
  chevronRightBold,
  chevronRightGray,
  chevronRightPrimary,
  cross,
  editPen,
  editPenFilled,
  editPinSquare,
  errorIcon,
  gallery,
  infoCircleGray,
  locationPinFilled,
  note,
  orderInvoices,
  pickupLocation,
  pickupTime,
  plusBlack,
  policy,
  radioChecked2,
  radioCheckedTick,
  radioUnchecked2,
  refundRequestSummary,
  refundSummary,
  rewindCross,
  supermallTag,
  verifiedGreen,
  wcRadioChecked,
  wcRadioUnchecked,
};

export const images = { emptyReturnRequests, pinIsland, cardMastercard, noonCredit };
export const lottieFiles = { processing: processingLottie, feedbackSuccess: feedbackSuccessLottie };
