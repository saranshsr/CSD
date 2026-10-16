import type { IconName } from '../../components';
import iconCall from '@assets/checkout/delivery-call.svg';
import iconContacts from '@assets/checkout/delivery-contacts@3x.webp';
import iconRadioOn from '@assets/checkout/delivery-radio-checked@3x.webp';
import iconRadioOff from '@assets/checkout/delivery-radio-unchecked@3x.webp';
import iconCheckboxOn from '@assets/shared/icons/checkbox-checked.webp';
import iconCheckboxOff from '@assets/shared/icons/checkbox-unchecked.webp';
import iconArrowDownBlue from '@assets/checkout/delivery-arrow-down-blue@3x.webp';
import iconChevronRightBlue from '@assets/checkout/delivery-chevron-right-blue@3x.webp';
import iconTogether from '@assets/checkout/figma/di-together.svg';
import iconDoor from '@assets/checkout/figma/di-door.svg';
import type { DeliveryInstructionsState } from './store';
import { checkoutServerColors as sc } from './tokens';

/** NoonIcons / Icons assets (@3x shown at 1x). */
export const deliveryIcons = {
  call: iconCall, // NoonIcons.callSVG 20×20
  contacts: iconContacts, // checkoutAlternatePhoneContacts 24×24
  radioOn: iconRadioOn, // checkoutAlternatePhoneRadio(true) 24×24
  radioOff: iconRadioOff,
  checkboxOn: iconCheckboxOn, // checkboxChecked 15×15 (drawn at 18)
  checkboxOff: iconCheckboxOff,
  arrowDownBlue: iconArrowDownBlue, // Icons.arrowDownBlue 16×16
  chevronRightBlue: iconChevronRightBlue, // Icons.chevronRightBlue 14×14
};

/** Translations (origin/master noon-en.json / en.json). */
export const td = {
  noon_checkout_delivery_instructions: 'Delivery instructions',
  noon_checkout_receiver_details: 'Receiver details',
  noon_checkout_change_receiver: 'Change receiver',
  noon_checkout_alternate_receiver_add: 'Add receiver contact',
  noon_name: 'Name',
  noon_or: 'OR',
  noon_checkout_alternate_receiver_previous_contact: 'Use previously saved contact',
  noon_checkout_alternate_receiver_done: 'SAVE',
  noon_checkout_alternate_receiver_primary_tag: 'Primary',
  noon_got_it: 'GOT IT',
  primary_phone_number: 'Phone number',
  checkout_alternate_receiver_dial_code_note: 'Please select a country code',
  /** features/vat vat-en.json — saveReceiverPhone error stand-in */
  vat_validation_phone_number: 'Please enter a valid phone number',
  /** NoonCheckoutAlternatePhoneContactsScreen (hard-coded in the source) */
  selectPhoneFor: (name: string) => `Select a phone number for ${name}`,
};

export type DeliveryOptionKey = 'gt' | 'dd' | 'silent_delivery' | 'sc' | 'receiver_phone_code';

/** NoonCheckoutDeliveryOptionType — server-driven (session.deliveryOptions); copy mirrors the live API. */
export interface DeliveryOption {
  key: DeliveryOptionKey;
  /** session field it toggles */
  field?: keyof DeliveryInstructionsState;
  status: 'available' | 'disabled' | 'active';
  message: string;
  sheetTitle?: string;
  description?: string;
  /** web stand-in for the CDN buttonIcon / icon / infoIcon */
  icon: IconName;
  info?: string;
  type: 'checkbox' | 'cross' | null;
  action: 'info' | 'receiver_phone' | null;
  note?: { content: string; backgroundHexa: string };
  /** Figma "🚧 Checkout 2.0" icon asset (20×20 svg, tinted by state) — falls back to the kit `icon` */
  figmaIcon?: string;
  /** not shown on the Figma checkout screen (kept for the learn-more sheet / re-enable by removing the flag) */
  hidden?: boolean;
  showSelectionSaveCheckbox?: boolean;
  shouldSaveSelectionMessage?: string;
  shouldSaveSelection?: boolean;
  version?: number;
}

export const deliveryOptions: DeliveryOption[] = [
  {
    key: 'gt',
    field: 'getTogether',
    status: 'available',
    message: 'Get items together', // Figma
    description: 'All the shipments of this order are delivered together in one trip, on the date of the latest shipment.', // server:
    info: 'Your shipments arrive together in one delivery.', // server:
    icon: 'box',
    figmaIcon: iconTogether,
    type: 'checkbox',
    action: 'info',
  },
  {
    key: 'dd',
    field: 'leaveAtDoor',
    status: 'available',
    message: 'Leave at the door', // Figma
    description: 'Your order will be left at your door and a photo will be shared with you as proof of delivery.',
    info: 'The courier leaves your order at the door and shares a photo once delivered.',
    icon: 'home',
    figmaIcon: iconDoor,
    type: 'checkbox',
    action: 'info',
    note: { content: 'Cash on delivery and high value orders are handed over in person.', backgroundHexa: sc.noteWarm },
  },
  {
    key: 'silent_delivery',
    field: 'silentDelivery',
    status: 'available',
    message: "Don't ring the doorbell",
    info: 'The courier will knock or call instead of ringing the doorbell.',
    description: 'The courier will knock or call you on arrival instead of ringing the doorbell.',
    icon: 'bell',
    hidden: true,
    type: 'checkbox',
    action: 'info',
  },
  {
    key: 'sc',
    field: 'securityCheck',
    status: 'available',
    message: 'Hand it to security',
    info: 'Your order will be handed over to the security or reception of your building.',
    description: 'Your order will be handed over to the security guard or reception of your building.',
    icon: 'shield',
    hidden: true,
    type: 'checkbox',
    action: 'info',
  },
  {
    key: 'receiver_phone_code',
    status: 'available',
    version: 2,
    message: 'Someone else receiving?',
    sheetTitle: 'Who is receiving the order?',
    icon: 'phone',
    type: null,
    action: 'receiver_phone',
    note: { content: 'The courier will contact this person for the delivery of this order.', backgroundHexa: sc.noteBlue },
    showSelectionSaveCheckbox: true,
    shouldSaveSelectionMessage: 'Save for future orders',
    shouldSaveSelection: false,
  },
];

/** CustomerService.getReceiverPhoneList mock */
export interface ReceiverContact {
  contactName: string;
  phone: string;
  receiverPhoneCode: string;
}

export const savedReceiverContacts: ReceiverContact[] = [
  { contactName: 'Priya Sharma', phone: '+971 55 234 9876', receiverPhoneCode: 'rpc-201' },
  { contactName: 'Omar Haddad', phone: '+971 52 778 1203', receiverPhoneCode: 'rpc-202' },
];

/** react-native-select-contact mock: a device contact with several numbers (Android → contacts overlay). */
export const deviceContact = { name: 'Sara Khan', phoneNumbers: ['+971 50 998 2211', '+971 4 345 6789'] };

export const DIAL_CODES = ['+971', '+966', '+20'];
