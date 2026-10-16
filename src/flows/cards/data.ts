import { user } from '../../data';

import iconBack from '@assets/cards/payment-back@3x.webp';
import iconPlus from '@assets/cards/payment-plus@3x.webp';
import iconGroup from '@assets/cards/payment-group-icon@3x.webp';
import iconEdit from '@assets/cards/payment-edit@3x.webp';
import iconCheck from '@assets/cards/payment-check@3x.webp';
import iconTrash from '@assets/cards/payment-trash@3x.webp';
import iconLock from '@assets/cards/payment-lock@3x.webp';
import iconChevronRight from '@assets/returns/slim-chevron-right@3x.webp';
import imgDefaultCard from '@assets/cards/payment-default-card@3x.webp';
import imgEmptyCards from '@assets/cards/payment-empty2.png';
import imgCardSkin from '@assets/cards/cardskin.png';
import imgCardSkinShadow from '@assets/cards/cardskin2.png';
import lottieSaveCard from '@assets/cards/save-card-reveal.lottie';

import brandAmex from '@assets/shared/payment/brand-card-amex.webp';
import brandMada from '@assets/cards/payment-card-mada@3x.webp';
import brandMastercard from '@assets/shared/payment/brand-card-mastercard.webp';
import brandVisa from '@assets/shared/payment/brand-card-visa.webp';
import brandMadaVisa from '@assets/cards/payment-mada-visa@3x.webp';
import brandMadaMastercard from '@assets/cards/payment-mada-mastercard@3x.webp';
import brandDiscover from '@assets/cards/payment-discover@3x.webp';
import brandJaywan from '@assets/cards/payment-jaywan@3x.webp';
import brandJcb from '@assets/cards/payment-jcp@3x.webp';
import brandUnionPay from '@assets/cards/payment-union-pay@3x.webp';
import brandDiners from '@assets/cards/payment-diners-club@3x.webp';

/** features/payment/theme/PaymentIcons + PaymentImages. `w`/`h` are the 1x point sizes (asset is @3x). */
export const cardsIcons = {
  back: { src: iconBack, w: 40 / 3, h: 40 / 3 },
  plus: { src: iconPlus, w: 40 / 3, h: 40 / 3 },
  group: { src: iconGroup, w: 146 / 3, h: 30 / 3 },
  edit: { src: iconEdit, w: 24, h: 24 },
  check: { src: iconCheck, w: 24, h: 24 },
  trash: { src: iconTrash, w: 24, h: 24 },
  lock: { src: iconLock, w: 8, h: 8 },
  chevronRight: { src: iconChevronRight, w: 20, h: 20 },
};

export const cardsImages = {
  defaultCard: imgDefaultCard,
  emptyCards: imgEmptyCards, // CDN payment-cards/payment-empty2.png
  cardSkin: imgCardSkin, // CDN payment-cards/cardskin.png
  cardSkinWithShadow: imgCardSkinShadow, // CDN payment-cards/cardskin2.png
  saveCardLottie: lottieSaveCard, // CDN payment-cards/lottie/optimized/lottie/save_card/v4/en/reveal.lottie
};

/** constants/PaymentCardBrand.ts → CardToIcon. `w` = 1x width of the asset. */
export type BrandId = 'visa' | 'mastercard' | 'amex' | 'mada' | 'mada_visa' | 'mada_mastercard' | 'discover' | 'jaywan' | 'jcp' | 'union_pay' | 'diners_club';
export const brandIcons: Record<BrandId, { src: string; w: number; h: number }> = {
  visa: { src: brandVisa, w: 41, h: 26 },
  mastercard: { src: brandMastercard, w: 41, h: 26 },
  amex: { src: brandAmex, w: 35, h: 22 },
  mada: { src: brandMada, w: 41, h: 14 },
  mada_visa: { src: brandMadaVisa, w: 32, h: 32 },
  mada_mastercard: { src: brandMadaMastercard, w: 32, h: 32 },
  discover: { src: brandDiscover, w: 32, h: 6.33 },
  jaywan: { src: brandJaywan, w: 38, h: 24 },
  jcp: { src: brandJcb, w: 40, h: 31 },
  union_pay: { src: brandUnionPay, w: 40, h: 25 },
  diners_club: { src: brandDiners, w: 40.33, h: 25.33 },
};

/**
 * noonConfig.cardBrandConfigs (server driven) — the brands rendered by PaymentCardBrands under the form.
 * Mocked as the UAE set, in the NoonConfigCardBrandsType key order.
 */
export const acceptedBrands: BrandId[] = ['amex', 'mastercard', 'visa', 'mada'];

/**
 * Copy — features/payment/locale/translations/payment-en.json (origin/master) and
 * src/locale/translations/en.json for the shared form validation strings.
 */
export const t = {
  savedCards: 'Saved Cards',
  topCards: 'Top cards',
  allCards: 'All other cards',
  yourSavedCards: 'Your saved cards',
  addedOn: (date: string) => `Added on ${date}`,
  editName: 'Edit name',
  addName: 'Add name',
  updateName: 'Update name',
  default: 'Default',
  setAsDefault: 'Set as default',
  setAsDefaultTitle: (card: string) => `Set ${card} as default?`,
  setAsDefaultDescription: 'We’ll use this card for future payments. \nYou can change it anytime.',
  cardSetAsDefault: (card: string) => `Card ${card} has been set as default`,
  deleteCard: 'Delete card',
  deleteCardTitle: (card: string) => `Delete ${card} permanently?`,
  deleteCardDescription: "You won't be able to use this card for payments after deleting it.",
  yesDelete: 'Yes, delete',
  cardDeleted: (card: string) => `Card ${card} has been deleted`,
  cancel: 'Cancel',
  noCardsTitle: 'Save your card for faster payments',
  noCardsMessage: 'Your card will be saved securely',
  addCard: 'Add card',
  cardNumber: 'Card number',
  expiryDate: 'Expiry (MM/YY)',
  cvv: 'CVV',
  saveCardAs: 'Save card as (optional)',
  setDefault: 'Set as default card',
  saveButton: 'Save card',
  secureAddition: 'We save your card securely. We never store your CVV.',
  scanCardTitle: 'Scan card',
  scanCardSubtitle: 'Point your camera at the card to autofill.',
  addCardDetails: 'Add card details',
  quickEffortless: 'Quick & effortless',
  addAsYouWish: 'Add your card as you wish',
  tapCard: 'Tap card',
  tapCardSubtitle: "Place card on your phone's back to autofill.",
  enterDetailsManually: 'Enter details manually',
  enterCardNumber: 'Enter your card number',
  cardDetailsEncrypted: 'Your card details are encrypted and kept secure.',
  scanOptionScan: 'Scan',
  scanOptionTap: 'Tap',
  // src/locale/translations/en.json
  invalidCard: 'Oops! This card number is invalid.',
  invalidExpiry: 'Oops! This expiry date is invalid.',
  invalidCvv: 'Oops! This CVV is invalid.',
  noSpecialChars: "Special characters aren't allowed",
  // marketplaces/noon/locale/translations/noon-en.json
  manageCards: 'Manage cards',
};

/** features/payment/types/PaymentTypes.ts → PaymentCardType (fields the UI reads). */
export interface SavedCard {
  id: string;
  ccType: 'VISA' | 'MASTERCARD' | 'AMEX' | 'MADA' | string;
  /** first 6 + mask + last 4, as the API returns it, e.g. 411111******1111 */
  ccMasked: string;
  ccExpiry: string; // MM/YY
  nickname: string;
  isDefault: boolean;
  cardIssuerName: string;
  /** null → PaymentImages.defaultCard() is used */
  cardArt: { url?: string; isDefault: boolean } | null;
  lastAddedAt?: string;
}

export const cardHolder = `${user.firstName} ${user.lastName}`;

/** Mock GET /payment/cards response. The default card comes first (the screen moves it to the front of the stack). */
export const mockCards: SavedCard[] = [
  {
    id: '90311',
    ccType: 'VISA',
    ccMasked: '445653******4242',
    ccExpiry: '09/28',
    nickname: '',
    isDefault: true,
    cardIssuerName: 'EMIRATES NBD BANK',
    cardArt: { isDefault: true },
    lastAddedAt: '2025-03-14T09:12:00Z',
  },
  {
    id: '90544',
    ccType: 'MASTERCARD',
    ccMasked: '540733******8817',
    ccExpiry: '02/27',
    nickname: 'Travel card',
    isDefault: false,
    cardIssuerName: 'MASHREQ BANK',
    cardArt: { isDefault: true },
    lastAddedAt: '2025-11-02T18:40:00Z',
  },
  {
    id: '90702',
    ccType: 'VISA',
    ccMasked: '427879******0041',
    ccExpiry: '04/26',
    nickname: '',
    isDefault: false,
    cardIssuerName: 'ABU DHABI COMMERCIAL BANK',
    cardArt: { isDefault: true },
    lastAddedAt: '2026-06-21T07:05:00Z',
  },
];

/** Extra cards for the >5 layout (sections "Top cards" / "All other cards"). */
export const manyCards: SavedCard[] = [
  ...mockCards,
  { id: '90815', ccType: 'MASTERCARD', ccMasked: '520058******3310', ccExpiry: '07/29', nickname: 'Salary', isDefault: false, cardIssuerName: 'FIRST ABU DHABI BANK', cardArt: { isDefault: true }, lastAddedAt: '2026-01-09T10:00:00Z' },
  { id: '90902', ccType: 'AMEX', ccMasked: '371449******8431', ccExpiry: '12/27', nickname: '', isDefault: false, cardIssuerName: 'AMERICAN EXPRESS', cardArt: { isDefault: true }, lastAddedAt: '2026-02-17T10:00:00Z' },
  { id: '91033', ccType: 'VISA', ccMasked: '453201******7790', ccExpiry: '05/30', nickname: '', isDefault: false, cardIssuerName: 'DUBAI ISLAMIC BANK', cardArt: { isDefault: true }, lastAddedAt: '2026-04-30T10:00:00Z' },
  { id: '91150', ccType: 'MASTERCARD', ccMasked: '545454******5454', ccExpiry: '10/28', nickname: 'Online only', isDefault: false, cardIssuerName: 'RAKBANK', cardArt: { isDefault: true }, lastAddedAt: '2026-08-12T10:00:00Z' },
];

/** Values a successful camera scan / NFC tap would hand to the form (simulated on web). */
export const scannedCard = { card: '4111 1111 1111 1111', expiry: '08/29' };
export const tappedCard = { card: '5555 5555 5555 4444', expiry: '11/28' };
