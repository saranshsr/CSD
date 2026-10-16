import { user } from '../../data';
import flagAE from '@assets/account/flag-ae.webp';
import flagSA from '@assets/account/flag-sa.webp';
import flagEG from '@assets/account/flag-eg.webp';
import flagKW from '@assets/account/flag-kw.webp';
import flagQA from '@assets/account/flag-qa.webp';
import flagOM from '@assets/account/flag-om.webp';
import flagBH from '@assets/account/flag-bh.webp';
import type { AccountIcon } from './icons';

/**
 * Copy is from bappzaar origin/master translations (noon-en.json, src/locale en.json, auth-en.json).
 * Anything server-driven (devices, marketing prefs, deletion T&C, nationalities, password rules) is mock data.
 */

/** Menu rows in the order of NoonAccountSections/* on master. `route` opens a kit route; `action` is handled in AccountScreen. */
export interface MenuItem {
  id: string;
  title: string;
  icon: AccountIcon;
  route?: string;
  presentation?: 'screen' | 'sheet' | 'modal';
  toast?: string;
}

/** NoonAccountAccountSection (signed-in rows; Language + Country rows are appended in AccountScreen). */
export const accountSection: MenuItem[] = [
  { id: 'addresses', title: 'Addresses', icon: 'addresses', route: 'address/select', presentation: 'modal' },
  { id: 'cards', title: 'Manage cards', icon: 'cards', route: 'cards/cards' },
  { id: 'returns', title: 'Returns', icon: 'returns', route: 'returns/history' }, // master: AFS_RETURNS_LEGACY_SCREENS.HISTORY_LIST_SCREEN
  { id: 'warranty', title: 'Warranty claims', icon: 'warranty', toast: 'Warranty claims (AFS warranty flow) is not part of this kit yet' },
];

/** NoonAccountSettingsSection — both open NoonAccountBottomSheetScreen. */
export const settingsSection: MenuItem[] = [
  { id: 'preferences', title: 'Preferences', icon: 'settings', route: 'account/preferences', presentation: 'sheet' },
  { id: 'notifications', title: 'Notifications', icon: 'notifications', route: 'account/notifications', presentation: 'sheet' },
];

/** NoonAccountSecuritySection (Sign out row appended in AccountScreen). */
export const securitySection: MenuItem[] = [{ id: 'security', title: 'Account security', icon: 'security', route: 'account/security', presentation: 'sheet' }];

export const profileCompletion = 72;

export const footerCopy = {
  policies: 'Policies',
  sellOnNoon: 'Sell on noon',
  version: 'Version 6.42.0 (12034)',
  copyright: `© ${new Date().getFullYear()} noon.com. All rights reserved.`,
};

export const signedOutSlides = [
  { id: 's1', title: 'Shop smarter with noon', subtitle: 'Track orders, save favourites & get exclusive deals', emoji: '🛍️' },
  { id: 's2', title: 'Free delivery with noon One', subtitle: 'Unlimited free delivery and cashback on every order', emoji: '🚚' },
];

// ── Country / language ───────────────────────────────────────────────────────

export type CountryCode = 'SA' | 'AE' | 'EG' | 'KW' | 'QA' | 'OM' | 'BH';

/** I18n.supportedCountries (order as on master) with their translated labels. */
export const supportedCountries: { id: CountryCode; label: string }[] = [
  { id: 'SA', label: 'Saudi Arabia' },
  { id: 'AE', label: 'United Arab Emirates' },
  { id: 'EG', label: 'Egypt' },
  { id: 'KW', label: 'Kuwait' },
  { id: 'QA', label: 'Qatar' },
  { id: 'OM', label: 'Oman' },
  { id: 'BH', label: 'Bahrain' },
];

/** NoonThemeManager.images.country(code) — 27×17 (@1x) flags. */
export const countryFlags: Record<CountryCode, string> = { AE: flagAE, SA: flagSA, EG: flagEG, KW: flagKW, QA: flagQA, OM: flagOM, BH: flagBH };

export const languages = [
  { id: 'en', label: 'English' },
  { id: 'ar', label: 'العربية' },
] as const;
export type LanguageId = (typeof languages)[number]['id'];

// ── Copy ─────────────────────────────────────────────────────────────────────

export const copy = {
  cancel: 'Cancel',
  save: 'Save',
  selectCountry: 'Select your country',
  signOut: {
    title: 'Leaving already?',
    description: 'You will be logged out from this device.',
    confirm: 'Yes, sign out',
  },
  preferences: {
    hapticsTitle: 'Haptics feedback',
    hapticsDescription: 'Gentle vibration for updates',
    clearCacheTitle: 'Clear cache',
    clearCacheDescription: 'Delete temporary files to free up space',
    clearCacheConfirm: 'Clearing your app cache helps you free up storage & improve performance without affecting your personal data and settings.',
    clearCacheYes: 'Yes',
    cleared: 'Cache cleared',
  },
  notifications: {
    pushTitle: 'Push notifications',
    pushSubtitle: 'Manage from settings',
    openSettings: 'Open settings',
    languageTitle: 'Receive communication in',
    languageSubtitle: 'Choose your preferred language for notifications',
    marketingTitle: 'Marketing preferences',
    marketingSubtitle: 'Opting out stops promotions, updates continue',
  },
  policies: {
    legal: 'Legal',
    termsOfUse: 'Terms of use',
    termsOfSale: 'Terms of sale',
    privacyPolicy: 'Privacy policy',
    ordersReturns: 'Orders & Returns',
    warrantyPolicy: 'Warranty policy',
    returnPolicy: 'Return policy',
    support: 'Support',
    customerHappiness: 'Customer happiness center',
  },
  security: {
    editPasswordTitle: 'Edit Password',
    editPasswordSubtitle: 'Change your account password',
    manageDevicesTitle: 'Manage devices',
    manageDevicesSubtitle: 'Review and sign out of individual devices',
    deletionTitle: 'Account deletion',
    deletionSubtitle: 'Delete your noon account',
  },
  devices: {
    title: 'Manage devices',
    thisDevice: 'This device',
    otherDevices: (n: number) => `Other devices (${n})`,
    otherDevicesTitle: 'Other devices',
    noOtherDevices: 'No other devices found',
    signOut: 'Sign out',
    signOutAll: 'Sign out of all other devices',
    signOutDeviceTitle: (name: string) => `Sign out of ${name}?`,
    signOutDeviceDescription: "You'll be signed out of noon and Namshi on this device.",
    signOutAllTitle: 'Sign out of all other devices?',
    signOutAllDescription: "You'll stay signed in here. All other devices will be signed out of noon and Namshi.",
    signedOutDevice: 'Signed out from the device successfully',
    signedOutAll: 'Signed out from all other devices successfully',
  },
  editProfile: {
    title: 'Your profile',
    firstName: 'First name*',
    lastName: 'Last name*',
    required: 'Hold up, this field is required.',
    phoneTitle: 'Phone number',
    phoneSubtitle: 'We only use this for important updates',
    phonePlaceholder: 'Tap to verify',
    genderTitle: 'Gender',
    male: 'Male',
    female: 'Female',
    touristTitle: 'Are you a tourist in UAE?',
    touristYes: 'Yes',
    touristNo: 'No',
    birthdayTitle: 'Birthday',
    birthdaySubtitle: 'Exclusive offers for you on your special day',
    birthdayPlaceholder: 'Add your birthday',
    nationalityTitle: 'Nationality',
    nationalitySubtitle: 'Help us curate your catalogue',
    viewAll: 'View all',
    dietaryTitle: 'Dietary preferences:',
    dietarySubtitle: 'Help us personalise your experience',
    completeProfile: 'Complete your profile',
    saveButton: 'Save',
    saved: 'Profile updated',
  },
  birthdayPicker: {
    title: 'Birthday',
    subtitle: 'Get offers on your special day',
    noteBold: 'Note:',
    note: 'You cannot change this later',
    done: 'DONE',
  },
  deletion: {
    heading: 'Delete your account',
    reasonLabel: 'I want to delete my account because',
    reasonPlaceholder: 'Select a reason',
    termsTitle: 'Please read the terms and conditions carefully:',
    agree: 'I have read the terms and conditions',
    warning: 'These changes may take 3-5 minutes to reflect on all devices',
  },
  password: {
    title: 'Change Password',
    current: 'Current Password',
    next: 'New Password',
    confirm: 'Confirm New Password',
    requirement: 'Your password must have at least:',
    submit: 'SUBMIT',
    required: 'Hold up, this field is required.',
    invalid: 'Invalid password',
    mismatch: "Passwords don't match",
  },
};

// ── Edit profile options ────────────────────────────────────────────────────

/** CustomerOnboardingFields.DIETARY_PREFERENCES */
export const dietaryPreferences = [
  { id: 'Non-Veg', label: 'Non-Vegetarian' },
  { id: 'Veg', label: 'Vegetarian' },
  { id: 'Vegan', label: 'Vegan' },
  { id: 'Eggetarian', label: 'Eggetarian' },
];

/** CustomerService.getCountries() — mock. `frequentlyUsed` feeds the 4 quick-select tiles. */
export const nationalities = {
  frequentlyUsed: [
    { countryCode: 'IN', name: 'India' },
    { countryCode: 'AE', name: 'UAE' },
    { countryCode: 'PK', name: 'Pakistan' },
    { countryCode: 'EG', name: 'Egypt' },
  ],
  countries: [
    { countryCode: 'BH', name: 'Bahrain' },
    { countryCode: 'BD', name: 'Bangladesh' },
    { countryCode: 'EG', name: 'Egypt' },
    { countryCode: 'FR', name: 'France' },
    { countryCode: 'IN', name: 'India' },
    { countryCode: 'JO', name: 'Jordan' },
    { countryCode: 'KW', name: 'Kuwait' },
    { countryCode: 'LB', name: 'Lebanon' },
    { countryCode: 'OM', name: 'Oman' },
    { countryCode: 'PK', name: 'Pakistan' },
    { countryCode: 'PH', name: 'Philippines' },
    { countryCode: 'QA', name: 'Qatar' },
    { countryCode: 'SA', name: 'Saudi Arabia' },
    { countryCode: 'AE', name: 'UAE' },
    { countryCode: 'GB', name: 'United Kingdom' },
    { countryCode: 'US', name: 'United States' },
  ],
};

export interface ProfileValues {
  firstName: string;
  lastName: string;
  gender: 'M' | 'F' | '';
  birthDate: string; // YYYY-MM-DD
  nationalityCountryCode: string;
  dietaryPreference: string;
  residentStatus: 'Tourist' | 'Non-Tourist' | '';
  phoneNumber: string;
}

// ── Devices (CustomerService.getActiveDevices mock) ─────────────────────────

export interface Device {
  id: string;
  deviceName: string;
  kind: 'phone' | 'laptop' | 'tablet';
  city: string;
  country: string;
  activityStatus: string;
  currentDevice?: boolean;
}

export const mockDevices: Device[] = [
  { id: 'd1', deviceName: 'iPhone 15 Pro', kind: 'phone', city: 'Dubai', country: 'United Arab Emirates', activityStatus: 'Active now', currentDevice: true },
  { id: 'd2', deviceName: 'MacBook Pro · Chrome', kind: 'laptop', city: 'Dubai', country: 'United Arab Emirates', activityStatus: 'Last active 2 hours ago' },
  { id: 'd3', deviceName: 'iPad Air', kind: 'tablet', city: 'Abu Dhabi', country: 'United Arab Emirates', activityStatus: 'Last active 3 days ago' },
  { id: 'd4', deviceName: 'Samsung Galaxy S24', kind: 'phone', city: 'Riyadh', country: 'Saudi Arabia', activityStatus: 'Last active 12 Sep 2026' },
];

/** CustomerService.getMarketingPreferences mock */
export const marketingPreferences = [
  { code: 'email', text: 'Email' },
  { code: 'sms', text: 'SMS' },
  { code: 'whatsapp', text: 'WhatsApp' },
];

/** CustomerService.getDeactivationConfig mock */
export const deactivationConfig = {
  reasons: [
    { reasonCode: 'not_using', name: 'I no longer use noon' },
    { reasonCode: 'other_account', name: 'I have another noon account' },
    { reasonCode: 'privacy', name: 'I have privacy concerns' },
    { reasonCode: 'experience', name: 'I had a bad shopping experience' },
    { reasonCode: 'notifications', name: 'I receive too many notifications' },
    { reasonCode: 'other', name: 'Other' },
  ],
  subtext: 'Deleting your account is permanent. Before you continue, please note:',
  terms: [
    'You will lose access to your order history, saved addresses, saved cards and wishlist.',
    'Any noon Credits balance and noon One membership benefits will be forfeited.',
    'Open orders, returns and refunds must be completed before your account can be deleted.',
    'You can read more in our <a href="/privacy-policy">Privacy policy</a>.',
  ],
};

/** noonConfig.loginConfigs.passwordValidation mock */
export const passwordValidations = [
  { description: '8 characters', regex: /.{8,}/ },
  { description: '1 uppercase letter', regex: /[A-Z]/ },
  { description: '1 lowercase letter', regex: /[a-z]/ },
  { description: '1 number', regex: /[0-9]/ },
];

// ── Flow state ──────────────────────────────────────────────────────────────

export interface AccountState {
  country: CountryCode;
  language: LanguageId;
  haptics: boolean;
  notificationLanguage: LanguageId;
  marketing: Record<string, boolean>;
  profile: ProfileValues;
  profileCompletion: number;
  devices: Device[];
  /** edit-profile form draft (shared with the birthday / nationality sheets); null when the screen is closed */
  draft: ProfileValues | null;
  /** reason picked in the deletion reasons sheet */
  deletionReason?: string;
}

export const initialAccountState: AccountState = {
  country: 'AE',
  language: 'en',
  haptics: true,
  notificationLanguage: 'en',
  marketing: { email: true, sms: false, whatsapp: true },
  profile: {
    firstName: user.firstName,
    lastName: user.lastName,
    gender: '',
    birthDate: '',
    nationalityCountryCode: '',
    dietaryPreference: '',
    residentStatus: '',
    phoneNumber: user.phone,
  },
  profileCompletion,
  devices: mockDevices,
  draft: null,
};
